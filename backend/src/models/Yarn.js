const db = require('../config/database');

const Yarn = {
    getAll: (status) => {
        if (status) {
            return db.prepare('SELECT * FROM yarns WHERE status = ? ORDER BY id DESC').all(status);
        }
        return db.prepare('SELECT * FROM yarns ORDER BY id DESC').all();
    },
    findById: (id) => {
        return db.prepare('SELECT * FROM yarns WHERE id = ?').get(id);
    },
    create: (data) => {
        const stmt = db.prepare(`
            INSERT INTO yarns (yarn_count, count_value, yarn_type, yarn_rate, supplier_name, effective_date, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, COALESCE(?, DATE('now')), COALESCE(?, 'active'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `);
        const result = stmt.run(
            data.yarn_count,
            data.count_value,
            data.yarn_type,
            data.yarn_rate,
            data.supplier_name || '',
            data.effective_date,
            data.status
        );
        return Yarn.findById(result.lastInsertRowid);
    },
    update: (id, data) => {
        const stmt = db.prepare(`
            UPDATE yarns
            SET yarn_count = COALESCE(?, yarn_count),
                count_value = COALESCE(?, count_value),
                yarn_type = COALESCE(?, yarn_type),
                yarn_rate = COALESCE(?, yarn_rate),
                supplier_name = COALESCE(?, supplier_name),
                effective_date = COALESCE(?, effective_date),
                status = COALESCE(?, status),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        stmt.run(
            data.yarn_count,
            data.count_value,
            data.yarn_type,
            data.yarn_rate,
            data.supplier_name,
            data.effective_date,
            data.status,
            id
        );
        return Yarn.findById(id);
    },
    delete: (id) => {
        return db.prepare('DELETE FROM yarns WHERE id = ?').run(id);
    }
};

module.exports = Yarn;
