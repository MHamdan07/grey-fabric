const path = require('path');
const fs = require('fs');
require('dotenv').config();

const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
let dbPath;

if (isVercel) {
    dbPath = path.join('/tmp', 'grey_fabric_costing.db');
    const sourceDb = path.resolve(__dirname, '../database/grey_fabric_costing.db');
    if (!fs.existsSync(dbPath) && fs.existsSync(sourceDb)) {
        try {
            fs.copyFileSync(sourceDb, dbPath);
        } catch (e) {
            console.warn('Could not copy seed database to /tmp, will initialize from migrations:', e.message);
        }
    }
} else {
    dbPath = process.env.DATABASE_FILE 
        ? path.resolve(process.cwd(), process.env.DATABASE_FILE)
        : path.resolve(__dirname, '../database/grey_fabric_costing.db');

    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }
}

let db;
try {
    const { DatabaseSync } = require('node:sqlite');
    db = new DatabaseSync(dbPath);
    db.pragma = (cmd) => {
        try {
            return db.exec('PRAGMA ' + cmd);
        } catch (err) {
            return null;
        }
    };
} catch (e) {
    const Database = require('better-sqlite3');
    db = new Database(dbPath);
}

// Enable foreign keys and WAL mode for high performance
try {
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
} catch (e) {
    // pragma fallback
}

// Initialize schema and migrations
function initializeDatabase() {
    const migrationsDir = path.resolve(__dirname, '../database/migrations');
    if (fs.existsSync(migrationsDir)) {
        const files = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort();

        for (const file of files) {
            const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
            try {
                db.exec(sql);
            } catch (err) {
                // table already exists or column exists
            }
        }
    }

    // Ensure columns exist on costings table for modular engine
    const newColumns = [
        { name: 'warp_count_system', type: "TEXT DEFAULT 'Ne'" },
        { name: 'warp_crimp', type: "REAL DEFAULT 5.0" },
        { name: 'weft_count_system', type: "TEXT DEFAULT 'Ne'" },
        { name: 'weft_crimp', type: "REAL DEFAULT 5.0" },
        { name: 'sizing_charge_type', type: "TEXT DEFAULT 'per_meter'" },
        { name: 'weaving_charge_type', type: "TEXT DEFAULT 'per_meter'" },
        { name: 'formula_version', type: "TEXT DEFAULT 'Standard Cotton v1.0'" },
        { name: 'assumptions_used', type: "TEXT" }
    ];

    try {
        const tableInfo = db.prepare("PRAGMA table_info(costings)").all();
        const existingColumns = new Set(tableInfo.map(col => col.name));

        for (const col of newColumns) {
            if (!existingColumns.has(col.name)) {
                db.prepare(`ALTER TABLE costings ADD COLUMN ${col.name} ${col.type}`).run();
            }
        }

        // Ensure permissions column exists on users table
        const userTableInfo = db.prepare("PRAGMA table_info(users)").all();
        const existingUserCols = new Set(userTableInfo.map(col => col.name));
        if (!existingUserCols.has('permissions')) {
            const defaultStaffPerms = JSON.stringify([
                'COSTING_VIEW', 'COSTING_CREATE', 'COSTING_EDIT', 'COSTING_EXPORT',
                'PRODUCTION_VIEW', 'PRODUCTION_CREATE', 'PRODUCTION_EDIT', 'PRODUCTION_EXPORT',
                'REPORT_VIEW', 'REPORT_EXPORT'
            ]);
            db.prepare(`ALTER TABLE users ADD COLUMN permissions TEXT DEFAULT '${defaultStaffPerms}'`).run();
        }
    } catch (e) {
        // Table may not exist yet if fresh init
    }

    // Auto-seed default admin & staff users if empty
    try {
        const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get()?.count || 0;
        if (userCount === 0) {
            const bcrypt = require('bcryptjs');
            const adminHash = bcrypt.hashSync('admin123', 10);
            const staffHash = bcrypt.hashSync('staff123', 10);
            const allPerms = JSON.stringify([
                'COSTING_VIEW', 'COSTING_CREATE', 'COSTING_EDIT', 'COSTING_DELETE', 'COSTING_EXPORT',
                'PRODUCTION_VIEW', 'PRODUCTION_CREATE', 'PRODUCTION_EDIT', 'PRODUCTION_EXPORT',
                'YARN_VIEW', 'YARN_CREATE', 'YARN_EDIT', 'YARN_DELETE', 'YARN_EXPORT',
                'FABRIC_VIEW', 'FABRIC_CREATE', 'FABRIC_EDIT', 'FABRIC_DELETE', 'FABRIC_EXPORT',
                'CHARGES_VIEW', 'CHARGES_MANAGE', 'CHARGES_EXPORT',
                'REPORT_VIEW', 'REPORT_EXPORT',
                'USER_MANAGE', 'USER_EXPORT',
                'ACTIVITY_LOG_VIEW', 'ACTIVITY_LOG_EXPORT'
            ]);
            db.prepare(`
                INSERT INTO users (id, name, email, password_hash, role, permissions, status)
                VALUES (1, 'Taylor Morgan', 'admin@greycost.com', ?, 'admin', ?, 'active')
            `).run(adminHash, allPerms);
            db.prepare(`
                INSERT INTO users (id, name, email, password_hash, role, permissions, status)
                VALUES (2, 'Alex Rivera', 'staff@greycost.com', ?, 'staff', ?, 'active')
            `).run(staffHash, allPerms);
        }
    } catch (e) {
        // user table check
    }

    // Auto-seed default yarns if empty
    try {
        const yarnCount = db.prepare('SELECT COUNT(*) as count FROM yarns').get()?.count || 0;
        if (yarnCount === 0) {
            const stmt = db.prepare(`
                INSERT INTO yarns (yarn_count, count_value, yarn_type, yarn_rate, supplier_name, effective_date, status)
                VALUES (?, ?, ?, ?, ?, DATE('now'), 'active')
            `);
            stmt.run('40s Ne', 40.0, '100% Combed Compact Cotton', 1120.00, 'Indus Valley Spinning Mills');
            stmt.run('30s Ne', 30.0, '100% Carded Ring Spun', 980.00, 'Crescent Textile Spinners');
            stmt.run('20s Ne', 20.0, '100% Carded Cotton', 840.00, 'Al-Karam Spinning Co.');
            stmt.run('16s Ne', 16.0, 'Open End Rotor Cotton', 720.00, 'Nishat Open End Division');
            stmt.run('50s Ne', 50.0, 'Pima Long Staple Cotton', 1480.00, 'Sapphire Premium Fiber');
        }
    } catch (e) {
        // yarn table check
    }

    // Auto-seed default charges if empty
    try {
        const chargeCount = db.prepare('SELECT COUNT(*) as count FROM charges').get()?.count || 0;
        if (chargeCount === 0) {
            const stmt = db.prepare(`
                INSERT INTO charges (charge_type, name, value, unit, status)
                VALUES (?, ?, ?, ?, 'active')
            `);
            stmt.run('sizing', 'Standard Warping & Sizing', 14.50, 'per_meter');
            stmt.run('weaving', 'Airjet High-Speed Weaving', 32.00, 'per_meter');
            stmt.run('weaving', 'Rapier Weaving (Heavy Twill)', 36.50, 'per_meter');
            stmt.run('inspection', 'Grey Inspection & 4-Point Grading', 4.50, 'per_meter');
            stmt.run('freight', 'Grey Folding, Baling & Local Transport', 3.00, 'per_meter');
        }
    } catch (e) {
        // charge table check
    }

    // Auto-seed default fabrics if empty
    try {
        const fabricCount = db.prepare('SELECT COUNT(*) as count FROM fabrics').get()?.count || 0;
        if (fabricCount === 0) {
            const yarns = db.prepare('SELECT * FROM yarns').all();
            const y40 = yarns.find(y => y.count_value === 40) || yarns[0];
            const y30 = yarns.find(y => y.count_value === 30) || yarns[1];
            if (y40) {
                const stmt = db.prepare(`
                    INSERT INTO fabrics (article_name, fabric_code, width, epi, ppi, warp_yarn_id, weft_yarn_id, standard_wastage, sizing_charges, weaving_charges, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
                `);
                stmt.run('Cotton Poplin 40x40 133x72 63"', 'ART-POP-4040', 63.0, 133, 72, y40.id, y40.id, 4.0, 14.50, 32.00);
                if (y30) {
                    stmt.run('Heavy Sheeting 30x30 68x68 63"', 'ART-SHT-3030', 63.0, 68, 68, y30.id, y30.id, 4.5, 12.00, 26.00);
                }
            }
        }
    } catch (e) {
        // fabric table check
    }
}

initializeDatabase();

module.exports = db;
