const path = require('path');
const fs = require('fs');
require('dotenv').config();

const dbPath = process.env.DATABASE_FILE 
    ? path.resolve(process.cwd(), process.env.DATABASE_FILE)
    : path.resolve(__dirname, '../database/grey_fabric_costing.db');

// Ensure directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
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
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

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
                console.warn(`Migration ${file} notice:`, err.message);
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
}

initializeDatabase();

module.exports = db;
