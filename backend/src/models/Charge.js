const db = require('../config/database');

const Charge = {
    getAll: () => {
        return db.prepare('SELECT * FROM charges ORDER BY id ASC').all();
    },
    findById: (id) => {
        return db.prepare('SELECT * FROM charges WHERE id = ?').get(id);
    },
    create: (data) => {
        const stmt = db.prepare(`
            INSERT INTO charges (charge_type, name, value, unit, effective_date, status, created_at, updated_at)
            VALUES (?, ?, ?, COALESCE(?, 'per_meter'), COALESCE(?, DATE('now')), COALESCE(?, 'active'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `);
        const result = stmt.run(
            data.charge_type,
            data.name,
            data.value,
            data.unit,
            data.effective_date,
            data.status
        );
        return Charge.findById(result.lastInsertRowid);
    },
    update: (id, data) => {
        const stmt = db.prepare(`
            UPDATE charges
            SET charge_type = COALESCE(?, charge_type),
                name = COALESCE(?, name),
                value = COALESCE(?, value),
                unit = COALESCE(?, unit),
                effective_date = COALESCE(?, effective_date),
                status = COALESCE(?, status),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        stmt.run(
            data.charge_type,
            data.name,
            data.value,
            data.unit,
            data.effective_date,
            data.status,
            id
        );
        return Charge.findById(id);
    },
    delete: (id) => {
        return db.prepare('DELETE FROM charges WHERE id = ?').run(id);
    }
};

module.exports = Charge;
