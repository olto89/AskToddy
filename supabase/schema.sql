-- AskToddy Construction Data Schema
-- This creates the database structure for storing UK construction pricing data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tool Hire Categories (power tools, access, landscaping, etc.)
CREATE TABLE tool_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tool Hire Items with Pricing
CREATE TABLE tool_hire (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_id UUID REFERENCES tool_categories(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    daily_rate DECIMAL(8,2) NOT NULL,
    weekly_rate DECIMAL(8,2),
    weekend_rate DECIMAL(8,2),
    deposit DECIMAL(8,2),
    delivery_cost DECIMAL(6,2),
    supplier VARCHAR(100) NOT NULL,
    supplier_url TEXT,
    last_updated TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Trade Categories (electrician, plumber, tiler, etc.)
CREATE TABLE trade_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Labor Costs by Trade
CREATE TABLE labor_costs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trade_category_id UUID REFERENCES trade_categories(id),
    job_type VARCHAR(200) NOT NULL, -- "tiling bathroom floor", "rewiring room"
    rate_type VARCHAR(20) NOT NULL, -- 'per_sqm', 'per_day', 'per_hour', 'fixed'
    base_rate DECIMAL(8,2) NOT NULL,
    complexity_basic DECIMAL(8,2) NOT NULL DEFAULT 1.0, -- multiplier
    complexity_moderate DECIMAL(8,2) NOT NULL DEFAULT 1.3,
    complexity_complex DECIMAL(8,2) NOT NULL DEFAULT 1.8,
    unit VARCHAR(50), -- 'sqm', 'linear_m', 'per_item'
    min_charge DECIMAL(8,2),
    source VARCHAR(100) NOT NULL, -- 'Checkatrade', 'MyBuilder'
    source_url TEXT,
    last_updated TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Regional Variations for Labor Costs
CREATE TABLE regional_multipliers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    region VARCHAR(100) NOT NULL,
    labor_cost_id UUID REFERENCES labor_costs(id),
    multiplier DECIMAL(4,2) NOT NULL DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Material Categories
CREATE TABLE material_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Material Costs
CREATE TABLE material_costs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_id UUID REFERENCES material_categories(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    unit VARCHAR(50) NOT NULL, -- 'per_sqm', 'per_litre', 'per_piece'
    budget_price DECIMAL(8,2),
    mid_range_price DECIMAL(8,2),
    premium_price DECIMAL(8,2),
    supplier VARCHAR(100) NOT NULL,
    supplier_url TEXT,
    waste_factor DECIMAL(4,2) DEFAULT 0.1, -- 10% waste factor
    last_updated TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Project Complexity Factors
CREATE TABLE complexity_factors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    factor_name VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'access', 'existing_condition', 'structural'
    time_multiplier DECIMAL(4,2) DEFAULT 1.0,
    cost_multiplier DECIMAL(4,2) DEFAULT 1.0,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Building Regulations & Permits
CREATE TABLE building_regulations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_type VARCHAR(200) NOT NULL,
    requires_building_control BOOLEAN DEFAULT FALSE,
    requires_planning BOOLEAN DEFAULT FALSE,
    typical_cost_min DECIMAL(8,2),
    typical_cost_max DECIMAL(8,2),
    processing_time_weeks INTEGER,
    description TEXT,
    last_updated TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_tool_hire_category ON tool_hire(category_id);
CREATE INDEX idx_tool_hire_supplier ON tool_hire(supplier);
CREATE INDEX idx_labor_costs_trade ON labor_costs(trade_category_id);
CREATE INDEX idx_material_costs_category ON material_costs(category_id);
CREATE INDEX idx_regional_multipliers_region ON regional_multipliers(region);

-- Row Level Security Policies
ALTER TABLE tool_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_hire ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE labor_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE regional_multipliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE complexity_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE building_regulations ENABLE ROW LEVEL SECURITY;

-- Public read access (data is public pricing information)
CREATE POLICY "Public read access" ON tool_categories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON tool_hire FOR SELECT USING (true);
CREATE POLICY "Public read access" ON trade_categories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON labor_costs FOR SELECT USING (true);
CREATE POLICY "Public read access" ON regional_multipliers FOR SELECT USING (true);
CREATE POLICY "Public read access" ON material_categories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON material_costs FOR SELECT USING (true);
CREATE POLICY "Public read access" ON complexity_factors FOR SELECT USING (true);
CREATE POLICY "Public read access" ON building_regulations FOR SELECT USING (true);

-- Insert some initial categories
INSERT INTO tool_categories (name, description) VALUES 
('Power Tools', 'Drills, saws, sanders, etc.'),
('Access Equipment', 'Ladders, scaffolding, platforms'),
('Landscaping', 'Garden and groundwork tools'),
('Cleaning', 'Pressure washers, vacuum cleaners'),
('Concrete & Masonry', 'Concrete mixers, breakers, cutting tools'),
('Lifting & Moving', 'Hoists, trolleys, lifting equipment');

INSERT INTO trade_categories (name, description) VALUES 
('Electrician', 'Electrical installation and repair work'),
('Plumber', 'Plumbing and heating installation'),
('Tiler', 'Wall and floor tiling work'),
('Painter', 'Interior and exterior painting'),
('Carpenter', 'Wood work and fitting'),
('General Builder', 'General construction and renovation');

INSERT INTO material_categories (name, description) VALUES 
('Tiles', 'Wall and floor tiles'),
('Paint', 'Interior and exterior paint'),
('Flooring', 'Laminate, hardwood, vinyl flooring'),
('Electrical', 'Cables, sockets, switches, fixtures'),
('Plumbing', 'Pipes, fittings, fixtures'),
('Building Materials', 'Cement, sand, bricks, timber');