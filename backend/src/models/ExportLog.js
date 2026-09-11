const db = require('../config/database');

const ExportLog = {
    log: ({ userId, exportType, fileFormat = 'xlsx', filters = {}, recordCount = 0, ipAddress = null }) => {
        try {
            const stmt = db.prepare(`
                INSERT INTO export_logs (user_id, export_type, file_format, filters, record_count, ip_address, created_at)
                VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `);
            const filterStr = typeof filters === 'string' ? filters : JSON.stringify(filters);
            const result = stmt.run(userId || null, exportType, fileFormat, filterStr, recordCount, ipAddress);
            return { id: result.lastInsertRowid, success: true };
        } catch (err) {
            console.error('Error writing export log:', err);
            return { success: false, error: err.message };
        }
    },

    getRecent: (limit = 50) => {
        try {
            return db.prepare(`
                SELECT e.*, u.name as user_name, u.email as user_email, u.role as user_role
                FROM export_logs e
                LEFT JOIN users u ON e.user_id = u.id
                ORDER BY e.id DESC
                LIMIT ?
            `).all(limit);
        } catch (err) {
            console.error('Error fetching export logs:', err);
            return [];
        }
    }
};

module.exports = ExportLog;
