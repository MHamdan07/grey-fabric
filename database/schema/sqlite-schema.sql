-- SQLite Database Schema for Grey Fabric Costing System

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS yarns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    yarn_count TEXT NOT NULL,
    count_value REAL NOT NULL,
    yarn_type TEXT NOT NULL,
    yarn_rate REAL NOT NULL,
    supplier_name TEXT,
    effective_date DATE DEFAULT (DATE('now')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fabrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_name TEXT NOT NULL,
    fabric_code TEXT NOT NULL UNIQUE,
    width REAL NOT NULL,
    epi INTEGER NOT NULL,
    ppi INTEGER NOT NULL,
    warp_yarn_id INTEGER,
    weft_yarn_id INTEGER,
    standard_wastage REAL DEFAULT 4.00,
    sizing_charges REAL DEFAULT 0.00,
    weaving_charges REAL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (warp_yarn_id) REFERENCES yarns(id) ON DELETE SET NULL,
    FOREIGN KEY (weft_yarn_id) REFERENCES yarns(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS charges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    charge_type TEXT NOT NULL,
    name TEXT NOT NULL,
    value REAL NOT NULL,
    unit TEXT NOT NULL DEFAULT 'per_meter',
    effective_date DATE DEFAULT (DATE('now')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS costings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    costing_id TEXT NOT NULL UNIQUE,
    fabric_id INTEGER,
    article_name TEXT NOT NULL,
    fabric_code TEXT,
    width REAL NOT NULL,
    epi INTEGER NOT NULL,
    ppi INTEGER NOT NULL,
    warp_count REAL NOT NULL,
    warp_rate REAL NOT NULL,
    warp_wastage REAL NOT NULL DEFAULT 3.50,
    weft_count REAL NOT NULL,
    weft_rate REAL NOT NULL,
    weft_wastage REAL NOT NULL DEFAULT 4.00,
    sizing_charges REAL NOT NULL DEFAULT 0.00,
    weaving_charges REAL NOT NULL DEFAULT 0.00,
    other_charges REAL NOT NULL DEFAULT 0.00,
    
    warp_weight_kg REAL NOT NULL,
    weft_weight_kg REAL NOT NULL,
    total_weight_kg REAL NOT NULL,
    gsm REAL NOT NULL,
    glm REAL NOT NULL,
    warp_cost REAL NOT NULL,
    weft_cost REAL NOT NULL,
    warp_wastage_cost REAL NOT NULL,
    weft_wastage_cost REAL NOT NULL,
    total_wastage_cost REAL NOT NULL,
    grey_cost_per_meter REAL NOT NULL,
    
    notes TEXT,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fabric_id) REFERENCES fabrics(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    user_name TEXT,
    action TEXT NOT NULL,
    module TEXT NOT NULL,
    record_id TEXT,
    details TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_costings_code ON costings(fabric_code);
CREATE INDEX IF NOT EXISTS idx_costings_date ON costings(created_at);
CREATE INDEX IF NOT EXISTS idx_yarns_status ON yarns(status);
CREATE INDEX IF NOT EXISTS idx_fabrics_status ON fabrics(status);
