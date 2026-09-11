-- Migration 002: Production Planning & Textile Assumptions Architecture

-- 1. Production Plans Table
CREATE TABLE IF NOT EXISTS production_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id TEXT NOT NULL UNIQUE,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('yarn_to_fabric', 'fabric_to_yarn')),
    article_name TEXT NOT NULL,
    fabric_code TEXT,
    width REAL NOT NULL,
    epi INTEGER NOT NULL,
    ppi INTEGER NOT NULL,
    warp_count REAL NOT NULL,
    warp_count_system TEXT DEFAULT 'Ne',
    warp_rate REAL NOT NULL,
    warp_crimp REAL DEFAULT 5.0,
    warp_wastage REAL DEFAULT 2.0,
    weft_count REAL NOT NULL,
    weft_count_system TEXT DEFAULT 'Ne',
    weft_rate REAL NOT NULL,
    weft_crimp REAL DEFAULT 5.0,
    weft_wastage REAL DEFAULT 2.0,
    
    budget_pkr REAL DEFAULT 0,
    available_yarn_kg REAL DEFAULT 0,
    available_warp_kg REAL DEFAULT 0,
    available_weft_kg REAL DEFAULT 0,
    
    target_fabric_meters REAL DEFAULT 0,
    theoretical_fabric_meters REAL DEFAULT 0,
    expected_fabric_meters REAL DEFAULT 0,
    expected_usable_meters REAL DEFAULT 0,
    
    consumed_warp_kg REAL DEFAULT 0,
    consumed_weft_kg REAL DEFAULT 0,
    remaining_warp_kg REAL DEFAULT 0,
    remaining_weft_kg REAL DEFAULT 0,
    total_remaining_kg REAL DEFAULT 0,
    
    yarn_utilization_pct REAL DEFAULT 100,
    production_efficiency_pct REAL DEFAULT 100,
    limiting_yarn_type TEXT DEFAULT 'balanced',
    
    notes TEXT,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_prod_plans_date ON production_plans(created_at);
CREATE INDEX IF NOT EXISTS idx_prod_plans_type ON production_plans(plan_type);
