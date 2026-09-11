const db = require('../config/database');

const ActivityLog = {
    log: ({ userId = null, userName = 'System', action, module, recordId = null, details = '', ipAddress = '' }) => {
        try {
            const stmt = db.prepare(`
                INSERT INTO activity_logs (user_id, user_name, action, module, record_id, details, ip_address, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `);
            stmt.run(userId, userName, action, module, String(recordId || ''), typeof details === 'object' ? JSON.stringify(details) : String(details), ipAddress);
        } catch (e) {
            console.error('Failed to write activity log:', e.message);
        }
    },
    getRecent: (limit = 50) => {
        return db.prepare(`
            SELECT * FROM activity_logs ORDER BY id DESC LIMIT ?
        `).all(limit);
    }
};

module.exports = ActivityLog;
