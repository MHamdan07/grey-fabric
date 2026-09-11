-- Migration 003: Export System and Granular RBAC Permissions Architecture

-- 1. Create Export Logs Audit Table
CREATE TABLE IF NOT EXISTS export_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    export_type TEXT NOT NULL,
    file_format TEXT NOT NULL DEFAULT 'xlsx',
    filters TEXT,
    record_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_export_logs_user ON export_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_export_logs_date ON export_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_export_logs_type ON export_logs(export_type);
