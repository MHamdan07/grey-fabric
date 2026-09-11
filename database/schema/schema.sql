-- PostgreSQL Database Schema for Grey Fabric Costing System (Supabase Compatible)
-- Includes: Costing Engine, Production Planning, Granular RBAC, and Enterprise Audit Trails

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
    permissions TEXT, -- JSON array of granular permissions
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Yarns Master Catalog
CREATE TABLE IF NOT EXISTS yarns (
    id SERIAL PRIMARY KEY,
    yarn_count VARCHAR(40) NOT NULL, -- e.g. "40s Ne", "30s Carded"
    count_value DECIMAL(8, 2) NOT NULL, -- English count Ne value
    yarn_type VARCHAR(60) NOT NULL, -- e.g. "100% Combed Compact Cotton"
    yarn_rate DECIMAL(10, 2) NOT NULL, -- Rate per kg
    supplier_name VARCHAR(120),
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Fabrics Master Library
CREATE TABLE IF NOT EXISTS fabrics (
    id SERIAL PRIMARY KEY,
    article_name VARCHAR(120) NOT NULL,
    fabric_code VARCHAR(60) NOT NULL UNIQUE,
    width DECIMAL(6, 2) NOT NULL, -- Width in inches
    epi INTEGER NOT NULL, -- Ends Per Inch
    ppi INTEGER NOT NULL, -- Picks Per Inch
    warp_yarn_id INTEGER REFERENCES yarns(id) ON DELETE SET NULL,
    weft_yarn_id INTEGER REFERENCES yarns(id) ON DELETE SET NULL,
    standard_wastage DECIMAL(5, 2) DEFAULT 4.00,
    sizing_charges DECIMAL(8, 2) DEFAULT 0.00,
    weaving_charges DECIMAL(8, 2) DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Process Charges Tariffs
CREATE TABLE IF NOT EXISTS charges (
    id SERIAL PRIMARY KEY,
    charge_type VARCHAR(50) NOT NULL, -- 'sizing', 'weaving', 'inspection', 'freight', 'overhead'
    name VARCHAR(120) NOT NULL,
    value DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(40) NOT NULL DEFAULT 'per_meter', -- 'per_meter', 'per_pick', 'flat', 'per_kg'
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Costings Ledger
CREATE TABLE IF NOT EXISTS costings (
    id SERIAL PRIMARY KEY,
    costing_id VARCHAR(50) NOT NULL UNIQUE, -- CST-YYYYMMDD-XXXX
    fabric_id INTEGER REFERENCES fabrics(id) ON DELETE SET NULL,
    article_name VARCHAR(120) NOT NULL,
    fabric_code VARCHAR(60),
    width DECIMAL(6, 2) NOT NULL,
    epi INTEGER NOT NULL,
    ppi INTEGER NOT NULL,
    warp_count DECIMAL(8, 2) NOT NULL,
    warp_count_system VARCHAR(20) DEFAULT 'Ne',
    warp_rate DECIMAL(10, 2) NOT NULL,
    warp_crimp DECIMAL(5, 2) DEFAULT 5.00,
    warp_wastage DECIMAL(5, 2) NOT NULL DEFAULT 3.50,
    weft_count DECIMAL(8, 2) NOT NULL,
    weft_count_system VARCHAR(20) DEFAULT 'Ne',
    weft_rate DECIMAL(10, 2) NOT NULL,
    weft_crimp DECIMAL(5, 2) DEFAULT 5.00,
    weft_wastage DECIMAL(5, 2) NOT NULL DEFAULT 4.00,
    sizing_charges DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
    sizing_charge_type VARCHAR(20) DEFAULT 'per_meter',
    weaving_charges DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
    weaving_charge_type VARCHAR(20) DEFAULT 'per_meter',
    other_charges DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
    
    -- Calculated outputs from deterministic textile calculation engine
    warp_weight_kg DECIMAL(8, 4) NOT NULL,
    weft_weight_kg DECIMAL(8, 4) NOT NULL,
    total_weight_kg DECIMAL(8, 4) NOT NULL,
    gsm DECIMAL(8, 2) NOT NULL,
    glm DECIMAL(8, 2) NOT NULL,
    warp_cost DECIMAL(10, 2) NOT NULL,
    weft_cost DECIMAL(10, 2) NOT NULL,
    warp_wastage_cost DECIMAL(10, 2) NOT NULL,
    weft_wastage_cost DECIMAL(10, 2) NOT NULL,
    total_wastage_cost DECIMAL(10, 2) NOT NULL,
    grey_cost_per_meter DECIMAL(10, 2) NOT NULL,
    formula_version VARCHAR(50) DEFAULT 'Standard Cotton v1.0',
    
    notes TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Production Plans Ledger
CREATE TABLE IF NOT EXISTS production_plans (
    id SERIAL PRIMARY KEY,
    plan_id VARCHAR(50) NOT NULL UNIQUE,
    plan_type VARCHAR(20) NOT NULL, -- 'budget', 'weight', 'split', 'reverse_fabric'
    costing_id INTEGER REFERENCES costings(id) ON DELETE SET NULL,
    article_name VARCHAR(120) NOT NULL,
    fabric_code VARCHAR(60),
    
    -- Inputs
    budget_amount DECIMAL(14, 2),
    total_yarn_weight_kg DECIMAL(10, 2),
    warp_yarn_weight_kg DECIMAL(10, 2),
    weft_yarn_weight_kg DECIMAL(10, 2),
    target_fabric_meters DECIMAL(10, 2),
    
    -- Results
    expected_fabric_meters DECIMAL(10, 2) NOT NULL,
    limiting_factor VARCHAR(20), -- 'warp', 'weft', 'balanced', 'budget'
    warp_yarn_used_kg DECIMAL(10, 2),
    weft_yarn_used_kg DECIMAL(10, 2),
    warp_yarn_leftover_kg DECIMAL(10, 2),
    weft_yarn_leftover_kg DECIMAL(10, 2),
    total_yarn_required_kg DECIMAL(10, 2),
    yarn_utilization_percent DECIMAL(5, 2),
    production_efficiency_percent DECIMAL(5, 2),
    estimated_total_cost DECIMAL(14, 2),
    cost_per_meter DECIMAL(10, 2),
    
    notes TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(120),
    action VARCHAR(60) NOT NULL,
    module VARCHAR(60) NOT NULL,
    record_id VARCHAR(60),
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Export Audit Logs
CREATE TABLE IF NOT EXISTS export_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    export_type VARCHAR(50) NOT NULL,
    file_format VARCHAR(10) NOT NULL,
    filters_applied TEXT,
    record_count INTEGER DEFAULT 0,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_costings_code ON costings(fabric_code);
CREATE INDEX IF NOT EXISTS idx_costings_date ON costings(created_at);
CREATE INDEX IF NOT EXISTS idx_yarns_status ON yarns(status);
CREATE INDEX IF NOT EXISTS idx_fabrics_status ON fabrics(status);
CREATE INDEX IF NOT EXISTS idx_plans_created ON production_plans(created_at);
CREATE INDEX IF NOT EXISTS idx_export_logs_user ON export_logs(user_id);

-- 9. Initial Seed Data (Safe to run multiple times)
INSERT INTO users (id, name, email, password_hash, role, status, permissions)
VALUES 
(1, 'Taylor Morgan', 'admin@greycost.com', '$2a$10$7vN3f5/e8V2tJ31Vp10z8.6sK2kFpC59oE7/f2wJ.zFvN9zVv8x8K', 'admin', 'active', '["COSTING_VIEW","COSTING_CREATE","COSTING_EDIT","COSTING_DELETE","COSTING_EXPORT","PRODUCTION_VIEW","PRODUCTION_CREATE","PRODUCTION_EDIT","PRODUCTION_EXPORT","YARN_VIEW","YARN_CREATE","YARN_EDIT","YARN_DELETE","YARN_EXPORT","FABRIC_VIEW","FABRIC_CREATE","FABRIC_EDIT","FABRIC_DELETE","FABRIC_EXPORT","CHARGES_VIEW","CHARGES_MANAGE","CHARGES_EXPORT","REPORT_VIEW","REPORT_EXPORT","USER_MANAGE","USER_EXPORT","ACTIVITY_LOG_VIEW","ACTIVITY_LOG_EXPORT"]')
ON CONFLICT (email) DO NOTHING;

INSERT INTO yarns (yarn_count, count_value, yarn_type, yarn_rate, supplier_name, effective_date, status)
VALUES 
('40s Ne', 40.0, '100% Combed Compact Cotton', 1120.00, 'Indus Valley Spinning Mills', CURRENT_DATE, 'active'),
('30s Ne', 30.0, '100% Carded Ring Spun', 980.00, 'Crescent Textile Spinners', CURRENT_DATE, 'active'),
('20s Ne', 20.0, '100% Carded Cotton', 840.00, 'Al-Karam Spinning Co.', CURRENT_DATE, 'active'),
('16s Ne', 16.0, 'Open End Rotor Cotton', 720.00, 'Nishat Open End Division', CURRENT_DATE, 'active'),
('50s Ne', 50.0, 'Pima Long Staple Cotton', 1480.00, 'Sapphire Premium Fiber', CURRENT_DATE, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO charges (charge_type, name, value, unit, status)
VALUES 
('sizing', 'Standard Warping & Sizing', 14.50, 'per_meter', 'active'),
('weaving', 'Airjet High-Speed Weaving', 32.00, 'per_meter', 'active'),
('weaving', 'Rapier Weaving (Heavy Twill)', 36.50, 'per_meter', 'active'),
('inspection', 'Grey Inspection & 4-Point Grading', 4.50, 'per_meter', 'active'),
('freight', 'Grey Folding, Baling & Local Transport', 3.00, 'per_meter', 'active')
ON CONFLICT DO NOTHING;
