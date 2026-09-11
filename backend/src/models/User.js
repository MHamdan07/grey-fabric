const db = require('../config/database');

const ALL_PERMISSIONS = [
    'COSTING_VIEW', 'COSTING_CREATE', 'COSTING_EDIT', 'COSTING_DELETE', 'COSTING_EXPORT',
    'PRODUCTION_VIEW', 'PRODUCTION_CREATE', 'PRODUCTION_EDIT', 'PRODUCTION_EXPORT',
    'YARN_VIEW', 'YARN_CREATE', 'YARN_EDIT', 'YARN_DELETE', 'YARN_EXPORT',
    'FABRIC_VIEW', 'FABRIC_CREATE', 'FABRIC_EDIT', 'FABRIC_DELETE', 'FABRIC_EXPORT',
    'CHARGES_VIEW', 'CHARGES_MANAGE', 'CHARGES_EXPORT',
    'REPORT_VIEW', 'REPORT_EXPORT',
    'USER_MANAGE', 'USER_EXPORT',
    'ACTIVITY_LOG_VIEW', 'ACTIVITY_LOG_EXPORT'
];

const DEFAULT_STAFF_PERMISSIONS = [
    'COSTING_VIEW', 'COSTING_CREATE', 'COSTING_EDIT', 'COSTING_EXPORT',
    'PRODUCTION_VIEW', 'PRODUCTION_CREATE', 'PRODUCTION_EDIT', 'PRODUCTION_EXPORT',
    'REPORT_VIEW', 'REPORT_EXPORT'
];

function formatUser(row) {
    if (!row) return null;
    let permissions = [];
    if (row.role === 'admin') {
        permissions = [...ALL_PERMISSIONS];
    } else if (row.permissions) {
        try {
            permissions = typeof row.permissions === 'string' ? JSON.parse(row.permissions) : row.permissions;
        } catch (e) {
            permissions = [...DEFAULT_STAFF_PERMISSIONS];
        }
    } else {
        permissions = [...DEFAULT_STAFF_PERMISSIONS];
    }
    return {
        ...row,
        permissions
    };
}

const User = {
    ALL_PERMISSIONS,
    DEFAULT_STAFF_PERMISSIONS,

    findByEmail: (email) => {
        const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        return formatUser(row);
    },

    findById: (id) => {
        const row = db.prepare('SELECT id, name, email, role, status, permissions, created_at, updated_at FROM users WHERE id = ?').get(id);
        return formatUser(row);
    },

    getAll: () => {
        const rows = db.prepare('SELECT id, name, email, role, status, permissions, created_at, updated_at FROM users ORDER BY id ASC').all();
        return rows.map(formatUser);
    },

    create: ({ name, email, password_hash, role = 'staff', status = 'active', permissions = null }) => {
        const permsJson = permissions 
            ? JSON.stringify(permissions) 
            : JSON.stringify(role === 'admin' ? ALL_PERMISSIONS : DEFAULT_STAFF_PERMISSIONS);

        const stmt = db.prepare(`
            INSERT INTO users (name, email, password_hash, role, status, permissions, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `);
        const result = stmt.run(name, email, password_hash, role, status, permsJson);
        return User.findById(result.lastInsertRowid);
    },

    update: (id, { name, role, status, permissions }) => {
        const currentUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
        if (!currentUser) return null;

        let permsJson = currentUser.permissions;
        if (permissions !== undefined) {
            permsJson = Array.isArray(permissions) ? JSON.stringify(permissions) : permissions;
        }

        const stmt = db.prepare(`
            UPDATE users 
            SET name = COALESCE(?, name),
                role = COALESCE(?, role),
                status = COALESCE(?, status),
                permissions = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        stmt.run(name, role, status, permsJson, id);
        return User.findById(id);
    },

    delete: (id) => {
        return db.prepare('DELETE FROM users WHERE id = ?').run(id);
    }
};

module.exports = User;
