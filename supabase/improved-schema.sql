-- AskToddy Construction Data Schema v2
-- Based on real-world UK construction industry data analysis
-- Optimized for actual pricing patterns and market structures

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TOOL HIRE SYSTEM
-- =====================================================

-- Tool categories with hierarchical structure
CREATE TABLE tool_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- 'Power Tools', 'Access Equipment'
    parent_id UUID REFERENCES tool_categories(id), -- For subcategories
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tool hire inventory with realistic UK market structure
CREATE TABLE tool_hire (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_id UUID REFERENCES tool_categories(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    product_code VARCHAR(50), -- Supplier internal code
    
    -- Core pricing (base rates before location/seasonal adjustments)
    daily_rate DECIMAL(8,2) NOT NULL,
    weekly_rate DECIMAL(8,2),
    weekend_rate DECIMAL(8,2), -- Important for DIY customers
    monthly_rate DECIMAL(8,2), -- Some items have long-term rates
    
    -- Additional costs
    deposit DECIMAL(8,2),
    delivery_cost_base DECIMAL(6,2), -- Base delivery cost (varies by location)
    
    -- Business rules
    min_hire_period_hours INTEGER DEFAULT 24,
    requires_license BOOLEAN DEFAULT FALSE,
    requires_training BOOLEAN DEFAULT FALSE,
    
    -- Specifications stored as JSON for flexibility
    specifications JSONB, -- {power: '18V', weight: '2.5kg', fuel: 'petrol'}
    
    -- Supplier and availability
    supplier VARCHAR(100) NOT NULL,
    supplier_url TEXT,
    availability_status VARCHAR(20) DEFAULT 'available', -- available, limited, unavailable
    
    -- Metadata
    last_updated TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Location-based pricing multipliers for tools
CREATE TABLE tool_location_pricing (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tool_id UUID REFERENCES tool_hire(id),
    location_type VARCHAR(50) NOT NULL, -- 'london', 'south_east', 'central', etc.
    rate_multiplier DECIMAL(4,2) DEFAULT 1.0, -- 1.2 = 20% premium
    delivery_cost_adjustment DECIMAL(6,2) DEFAULT 0, -- Additional delivery cost
    created_at TIMESTAMP DEFAULT NOW()
);

-- Seasonal pricing adjustments (e.g., landscaping tools cost more in spring)
CREATE TABLE tool_seasonal_pricing (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tool_id UUID REFERENCES tool_hire(id),
    season VARCHAR(20) NOT NULL, -- 'spring', 'summer', 'winter'
    rate_multiplier DECIMAL(4,2) DEFAULT 1.0,
    active_from DATE,
    active_to DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- LABOR COSTS SYSTEM
-- =====================================================

-- Trade categories (more granular than before)
CREATE TABLE trade_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- 'Electrician', 'Tiler'
    parent_id UUID REFERENCES trade_categories(id), -- For specializations
    description TEXT,
    typical_day_rate DECIMAL(8,2), -- Reference rate for the trade
    created_at TIMESTAMP DEFAULT NOW()
);

-- Specific job types with market-based pricing
CREATE TABLE labor_costs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trade_category_id UUID REFERENCES trade_categories(id),
    
    -- Job specification
    job_type VARCHAR(300) NOT NULL, -- Very specific: 'Install consumer unit in 3-bed house'
    job_description TEXT, -- Additional details
    
    -- Rate structure
    rate_structure VARCHAR(20) NOT NULL, -- 'per_sqm', 'per_item', 'per_day', 'fixed_price'
    base_rate DECIMAL(8,2) NOT NULL,
    unit VARCHAR(50), -- 'sqm', 'linear_m', 'per_socket', 'per_room'
    
    -- Business rules
    min_charge DECIMAL(8,2),
    typical_time_hours INTEGER, -- How long this job typically takes
    materials_included BOOLEAN DEFAULT FALSE,
    
    -- Complexity multipliers (JSON for flexibility)
    complexity_factors JSONB, -- {basic: 1.0, standard: 1.3, complex: 1.8, access_difficult: 1.2}
    
    -- Market data
    data_source VARCHAR(100) NOT NULL, -- 'Checkatrade Oct 2024'
    source_url TEXT,
    confidence_level VARCHAR(20) DEFAULT 'medium', -- high, medium, low
    sample_size INTEGER, -- How many quotes this is based on
    
    -- Metadata
    last_updated TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Regional labor cost variations (more detailed than before)
CREATE TABLE labor_regional_pricing (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    labor_cost_id UUID REFERENCES labor_costs(id),
    region VARCHAR(100) NOT NULL, -- 'Greater London', 'West Midlands'
    postcode_prefix VARCHAR(10), -- 'M1', 'SW1' for more granular pricing
    rate_multiplier DECIMAL(4,2) NOT NULL,
    urban_rural_type VARCHAR(20), -- 'urban', 'suburban', 'rural'
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Market demand adjustments (busy tradespeople charge more)
CREATE TABLE labor_market_adjustments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    labor_cost_id UUID REFERENCES labor_costs(id),
    demand_level VARCHAR(20) NOT NULL, -- 'low', 'normal', 'high', 'critical'
    rate_multiplier DECIMAL(4,2) NOT NULL,
    effective_from DATE,
    effective_to DATE,
    reason TEXT, -- 'Pre-Christmas rush', 'Post-lockdown demand'
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- MATERIALS SYSTEM
-- =====================================================

-- Material categories with supplier focus
CREATE TABLE material_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    parent_id UUID REFERENCES material_categories(id),
    description TEXT,
    typical_waste_factor DECIMAL(4,2) DEFAULT 0.1, -- 10% waste typical
    created_at TIMESTAMP DEFAULT NOW()
);

-- Materials with brand/quality tiers
CREATE TABLE material_costs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_id UUID REFERENCES material_categories(id),
    
    -- Product details
    name VARCHAR(200) NOT NULL,
    description TEXT,
    brand VARCHAR(100),
    model_code VARCHAR(100),
    
    -- Pricing by quality tier
    budget_price DECIMAL(8,2),
    mid_range_price DECIMAL(8,2),
    premium_price DECIMAL(8,2),
    trade_price DECIMAL(8,2), -- Often different from retail
    
    -- Unit and packaging
    unit VARCHAR(50) NOT NULL, -- 'per_sqm', 'per_litre', 'per_piece', 'per_bag'
    pack_size VARCHAR(50), -- '5 litres', '25kg bag', 'per tile'
    
    -- Supplier and availability
    supplier VARCHAR(100) NOT NULL,
    supplier_sku VARCHAR(100),
    supplier_url TEXT,
    
    -- Usage factors
    coverage_per_unit DECIMAL(8,2), -- How much area does one unit cover
    waste_factor DECIMAL(4,2), -- Specific waste factor for this material
    
    -- Bulk pricing
    bulk_breaks JSONB, -- [{quantity: 10, discount: 0.05}, {quantity: 50, discount: 0.12}]
    
    -- Metadata
    last_updated TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- PROJECT ESTIMATION HELPERS
-- =====================================================

-- Common project types with typical specifications
CREATE TABLE project_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_type VARCHAR(200) NOT NULL, -- 'Small bathroom renovation'
    description TEXT,
    
    -- Typical size and scope
    typical_area_min DECIMAL(6,2), -- 4 sqm
    typical_area_max DECIMAL(6,2), -- 8 sqm
    
    -- Time estimates
    diy_time_hours INTEGER,
    professional_time_hours INTEGER,
    
    -- Complexity factors that commonly apply
    common_complexity_factors TEXT[], -- ['tight_access', 'old_property', 'plumbing_relocation']
    
    -- Regulatory requirements
    requires_building_control BOOLEAN DEFAULT FALSE,
    requires_planning BOOLEAN DEFAULT FALSE,
    typical_permit_cost_min DECIMAL(8,2),
    typical_permit_cost_max DECIMAL(8,2),
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Link project templates to typical materials needed
CREATE TABLE project_material_requirements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_template_id UUID REFERENCES project_templates(id),
    material_id UUID REFERENCES material_costs(id),
    
    -- Quantity calculation
    quantity_per_sqm DECIMAL(8,4), -- How much of this material per square metre
    is_optional BOOLEAN DEFAULT FALSE,
    quality_tier VARCHAR(20) DEFAULT 'mid_range', -- budget, mid_range, premium
    
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Link project templates to typical labor requirements
CREATE TABLE project_labor_requirements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_template_id UUID REFERENCES project_templates(id),
    labor_cost_id UUID REFERENCES labor_costs(id),
    
    -- When this labor is needed
    is_essential BOOLEAN DEFAULT TRUE,
    complexity_threshold VARCHAR(20) DEFAULT 'basic', -- Only needed for complex projects
    
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- INDEXES AND CONSTRAINTS
-- =====================================================

-- Performance indexes
CREATE INDEX idx_tool_hire_category ON tool_hire(category_id);
CREATE INDEX idx_tool_hire_supplier ON tool_hire(supplier);
CREATE INDEX idx_tool_hire_daily_rate ON tool_hire(daily_rate);
CREATE INDEX idx_labor_costs_trade ON labor_costs(trade_category_id);
CREATE INDEX idx_labor_costs_rate ON labor_costs(base_rate);
CREATE INDEX idx_material_costs_category ON material_costs(category_id);
CREATE INDEX idx_material_costs_supplier ON material_costs(supplier);

-- Search indexes for text fields
CREATE INDEX idx_tool_hire_name_search ON tool_hire USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_labor_costs_job_search ON labor_costs USING GIN(to_tsvector('english', job_type || ' ' || COALESCE(job_description, '')));
CREATE INDEX idx_material_costs_name_search ON material_costs USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- =====================================================
-- ROW LEVEL SECURITY (PUBLIC READ ACCESS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE tool_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_hire ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_location_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_seasonal_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE labor_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE labor_regional_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE labor_market_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_material_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_labor_requirements ENABLE ROW LEVEL SECURITY;

-- Public read policies (construction cost data is public information)
CREATE POLICY "Public read access" ON tool_categories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON tool_hire FOR SELECT USING (true);
CREATE POLICY "Public read access" ON tool_location_pricing FOR SELECT USING (true);
CREATE POLICY "Public read access" ON tool_seasonal_pricing FOR SELECT USING (true);
CREATE POLICY "Public read access" ON trade_categories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON labor_costs FOR SELECT USING (true);
CREATE POLICY "Public read access" ON labor_regional_pricing FOR SELECT USING (true);
CREATE POLICY "Public read access" ON labor_market_adjustments FOR SELECT USING (true);
CREATE POLICY "Public read access" ON material_categories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON material_costs FOR SELECT USING (true);
CREATE POLICY "Public read access" ON project_templates FOR SELECT USING (true);
CREATE POLICY "Public read access" ON project_material_requirements FOR SELECT USING (true);
CREATE POLICY "Public read access" ON project_labor_requirements FOR SELECT USING (true);

-- =====================================================
-- INITIAL DATA SEEDING
-- =====================================================

-- Tool categories
INSERT INTO tool_categories (name, description) VALUES 
('Power Tools', 'Electric and battery-powered tools'),
('Hand Tools', 'Manual tools and equipment'),
('Access Equipment', 'Ladders, scaffolding, and access platforms'),
('Plant & Machinery', 'Heavy equipment and machinery'),
('Landscaping Tools', 'Garden and groundwork equipment'),
('Cleaning Equipment', 'Pressure washers, vacuums, and cleaning tools'),
('Safety Equipment', 'PPE and safety gear'),
('Measuring & Testing', 'Survey equipment and measuring tools'),
('Lifting & Moving', 'Hoists, trolleys, and material handling'),
('Concrete & Masonry', 'Concrete mixers, breakers, cutting tools');

-- Power Tools subcategories
INSERT INTO tool_categories (name, parent_id, description) 
SELECT 'Drills & Drivers', id, 'Drilling and driving tools'
FROM tool_categories WHERE name = 'Power Tools';

INSERT INTO tool_categories (name, parent_id, description) 
SELECT 'Saws & Cutting', id, 'Cutting and sawing equipment'
FROM tool_categories WHERE name = 'Power Tools';

INSERT INTO tool_categories (name, parent_id, description) 
SELECT 'Sanders & Grinders', id, 'Surface preparation tools'
FROM tool_categories WHERE name = 'Power Tools';

-- Trade categories
INSERT INTO trade_categories (name, description, typical_day_rate) VALUES 
('Electrician', 'Electrical installation and repair', 280.00),
('Plumber', 'Plumbing and heating systems', 320.00),
('Tiler', 'Wall and floor tiling specialist', 250.00),
('Painter & Decorator', 'Interior and exterior painting', 200.00),
('Carpenter', 'Wood working and carpentry', 260.00),
('General Builder', 'General construction work', 300.00),
('Plasterer', 'Wall and ceiling plastering', 220.00),
('Roofer', 'Roofing and guttering work', 280.00),
('Landscaper', 'Garden and outdoor space design', 240.00),
('Kitchen Fitter', 'Kitchen installation specialist', 320.00);

-- Material categories
INSERT INTO material_categories (name, description, typical_waste_factor) VALUES 
('Tiles', 'Wall and floor tiles', 0.10),
('Paint & Decorating', 'Paints, primers, and decorating supplies', 0.05),
('Electrical Components', 'Cables, sockets, switches, and fittings', 0.15),
('Plumbing Supplies', 'Pipes, fittings, and plumbing fixtures', 0.12),
('Timber & Board', 'Wood products and sheet materials', 0.10),
('Building Materials', 'Cement, sand, aggregates, and blocks', 0.08),
('Insulation', 'Thermal and acoustic insulation materials', 0.05),
('Roofing Materials', 'Tiles, felt, guttering, and fixings', 0.10),
('Flooring', 'Laminate, vinyl, carpet, and underlay', 0.08),
('Hardware & Fixings', 'Screws, bolts, brackets, and ironmongery', 0.20);

-- Sample project templates
INSERT INTO project_templates (
    project_type, description, 
    typical_area_min, typical_area_max,
    diy_time_hours, professional_time_hours,
    common_complexity_factors,
    requires_building_control
) VALUES 
(
    'Small bathroom renovation',
    'Complete renovation of a small bathroom including new suite, tiling, and decoration',
    4.0, 8.0,
    120, 40,
    ARRAY['tight_access', 'old_plumbing', 'structural_changes'],
    true
),
(
    'Kitchen renovation',
    'Full kitchen refit including units, appliances, and work surfaces',
    8.0, 20.0,
    200, 80,
    ARRAY['electrical_upgrade', 'plumbing_relocation', 'structural_work'],
    false
),
(
    'Living room decoration',
    'Full room decoration including preparation, painting, and finishing',
    12.0, 25.0,
    40, 16,
    ARRAY['high_ceilings', 'period_features', 'extensive_prep'],
    false
);

COMMENT ON TABLE tool_hire IS 'Tool hire inventory with UK market pricing structure';
COMMENT ON TABLE labor_costs IS 'Labor costs based on real UK trade quotes and market data';
COMMENT ON TABLE material_costs IS 'Material costs from major UK suppliers with quality tiers';
COMMENT ON TABLE project_templates IS 'Common project types with typical requirements and specifications';