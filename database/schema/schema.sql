-- PostgreSQL Database Schema for Grey Fabric Costing System
-- Strictly Phase 1: Manufacturing Grey Costing (No Selling/Profit Modules)

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS yarns (
    id SERIAL PRIMARY KEY,
    yarn_count VARCHAR(40) NOT NULL, -- e.g. "30s", "40s Combed"
    count_value DECIMAL(8, 2) NOT NULL, -- English count Ne value, e.g. 30.00
    yarn_type VARCHAR(60) NOT NULL, -- e.g. "100% Cotton Combed", "Carded", "Polyester Cotton"
    yarn_rate DECIMAL(10, 2) NOT NULL, -- Rate per kg
    supplier_name VARCHAR(120),
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fabrics (
    id SERIAL PRIMARY KEY,
    article_name VARCHAR(120) NOT NULL,
    fabric_code VARCHAR(60) NOT NULL UNIQUE,
    width DECIMAL(6, 2) NOT NULL, -- Width in inches
    epi INTEGER NOT NULL, -- Ends Per Inch
    ppi INTEGER NOT NULL, -- Picks Per Inch
    warp_yarn_id INTEGER REFERENCES yarns(id) ON DELETE SET NULL,
    weft_yarn_id INTEGER REFERENCES yarns(id) ON DELETE SET NULL,
    standard_wastage DECIMAL(5, 2) DEFAULT 4.00, -- Overall %
    sizing_charges DECIMAL(8, 2) DEFAULT 0.00,
    weaving_charges DECIMAL(8, 2) DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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
    warp_rate DECIMAL(10, 2) NOT NULL,
    warp_wastage DECIMAL(5, 2) NOT NULL DEFAULT 3.50,
    weft_count DECIMAL(8, 2) NOT NULL,
    weft_rate DECIMAL(10, 2) NOT NULL,
    weft_wastage DECIMAL(5, 2) NOT NULL DEFAULT 4.00,
    sizing_charges DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
    weaving_charges DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
    other_charges DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
    
    -- Calculated outputs from backend calculation engine
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
    
    notes TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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

CREATE INDEX IF NOT EXISTS idx_costings_code ON costings(fabric_code);
CREATE INDEX IF NOT EXISTS idx_costings_date ON costings(created_at);
CREATE INDEX IF NOT EXISTS idx_yarns_status ON yarns(status);
CREATE INDEX IF NOT EXISTS idx_fabrics_status ON fabrics(status);
