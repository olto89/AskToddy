-- Tool Hire Pricing Database Schema
-- Based on actual scraped data structure from 33 UK suppliers

-- =====================================================
-- SUPPLIERS TABLE
-- =====================================================
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    website_url VARCHAR(500) NOT NULL,
    region VARCHAR(100),
    county VARCHAR(100),
    postcode_area VARCHAR(10),
    phone VARCHAR(50),
    email VARCHAR(255),
    
    -- Scraping Configuration
    main_categories_url VARCHAR(500),
    url_pattern VARCHAR(255),
    pricing_structure ENUM(
        'daily_weekly_rates',
        'per_product_page', 
        'contact_for_price',
        'unknown'
    ),
    site_structure_notes TEXT,
    has_online_pricing BOOLEAN DEFAULT FALSE,
    
    -- Priority & Status
    regional_priority INT DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    is_toddy_owned BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    last_scraped TIMESTAMP,
    scrape_success_rate DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_region (region),
    INDEX idx_priority (regional_priority),
    UNIQUE KEY unique_company (company_name, region)
);

-- =====================================================
-- TOOL CATEGORIES TABLE
-- =====================================================
CREATE TABLE tool_categories (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100),
    description TEXT,
    parent_category_id INT,
    priority INT DEFAULT 5,
    icon_name VARCHAR(50),
    
    -- Keywords for matching
    search_keywords TEXT, -- Comma separated
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_category_id) REFERENCES tool_categories(id)
);

-- =====================================================
-- TOOLS TABLE (Master tool list)
-- =====================================================
CREATE TABLE tools (
    id SERIAL PRIMARY KEY,
    category_id INT NOT NULL,
    
    -- Basic Info
    tool_name VARCHAR(255) NOT NULL,
    tool_description TEXT,
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    
    -- Specifications (JSON for flexibility)
    specifications JSON,
    /* Example:
    {
        "weight": "1500kg",
        "width": "990mm",
        "power": "13HP",
        "capacity": "110L",
        "features": ["Zero tail swing", "Quick hitch"]
    }
    */
    
    -- Use Cases & Safety
    suitable_for JSON, -- Array of use cases
    safety_requirements JSON, -- Array of safety notes
    alternatives JSON, -- Array of alternative tool IDs or names
    
    -- Media
    image_url VARCHAR(500),
    youtube_search_terms VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (category_id) REFERENCES tool_categories(id),
    INDEX idx_category (category_id),
    FULLTEXT KEY ft_search (tool_name, tool_description)
);

-- =====================================================
-- SUPPLIER TOOLS TABLE (Pricing per supplier)
-- =====================================================
CREATE TABLE supplier_tools (
    id SERIAL PRIMARY KEY,
    supplier_id INT NOT NULL,
    tool_id INT,
    
    -- Supplier's naming
    supplier_tool_name VARCHAR(255),
    supplier_description TEXT,
    supplier_category VARCHAR(100),
    
    -- Pricing
    daily_rate DECIMAL(10,2),
    weekly_rate DECIMAL(10,2),
    weekend_rate DECIMAL(10,2),
    monthly_rate DECIMAL(10,2),
    
    -- Pricing metadata
    pricing_notes TEXT,
    minimum_hire_period VARCHAR(50),
    delivery_available BOOLEAN,
    delivery_cost DECIMAL(10,2),
    
    -- Availability
    availability_status ENUM('in_stock', 'limited', 'out_of_stock', 'unknown'),
    
    -- Source
    source_url VARCHAR(500),
    last_price_update TIMESTAMP,
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY (tool_id) REFERENCES tools(id),
    INDEX idx_supplier (supplier_id),
    INDEX idx_tool (tool_id),
    INDEX idx_daily_rate (daily_rate),
    UNIQUE KEY unique_supplier_tool (supplier_id, supplier_tool_name)
);

-- =====================================================
-- PRICE HISTORY TABLE (Track changes)
-- =====================================================
CREATE TABLE price_history (
    id SERIAL PRIMARY KEY,
    supplier_tool_id INT NOT NULL,
    
    daily_rate DECIMAL(10,2),
    weekly_rate DECIMAL(10,2),
    weekend_rate DECIMAL(10,2),
    
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (supplier_tool_id) REFERENCES supplier_tools(id),
    INDEX idx_supplier_tool (supplier_tool_id),
    INDEX idx_recorded (recorded_at)
);

-- =====================================================
-- SCRAPE LOGS TABLE
-- =====================================================
CREATE TABLE scrape_logs (
    id SERIAL PRIMARY KEY,
    supplier_id INT NOT NULL,
    
    scrape_type ENUM('full', 'partial', 'test'),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    tools_found INT DEFAULT 0,
    tools_updated INT DEFAULT 0,
    price_changes INT DEFAULT 0,
    
    status ENUM('success', 'partial', 'failed'),
    error_message TEXT,
    
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    INDEX idx_supplier (supplier_id),
    INDEX idx_completed (completed_at)
);

-- =====================================================
-- USER SEARCHES TABLE (For analytics)
-- =====================================================
CREATE TABLE user_searches (
    id SERIAL PRIMARY KEY,
    
    search_query TEXT,
    tool_category VARCHAR(100),
    location VARCHAR(255),
    postcode VARCHAR(10),
    
    results_count INT,
    top_result_id INT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (top_result_id) REFERENCES supplier_tools(id),
    INDEX idx_created (created_at)
);

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert regions
INSERT INTO suppliers (company_name, website_url, region, regional_priority, is_toddy_owned) VALUES
('Toddy Tool Hire', 'https://toddytoolhire.co.uk', 'East England', 1, TRUE);

-- Insert tool categories
INSERT INTO tool_categories (category_name, display_name, search_keywords) VALUES
('excavator', 'Excavators & Diggers', 'excavator,digger,mini digger,jcb'),
('mixer', 'Concrete Mixers', 'mixer,concrete,cement'),
('generator', 'Generators', 'generator,genset,power'),
('drill', 'Drills & Breakers', 'drill,hammer,breaker,kango'),
('saw', 'Saws & Cutters', 'saw,cutter,stihl,chainsaw'),
('compressor', 'Compressors', 'compressor,air'),
('scaffold', 'Scaffolding & Access', 'scaffold,tower,platform,ladder'),
('pump', 'Pumps', 'pump,submersible,water'),
('compactor', 'Compactors', 'compactor,wacker,plate,roller'),
('grinder', 'Grinders', 'grinder,angle grinder');

-- =====================================================
-- VIEWS FOR EASY QUERYING
-- =====================================================

-- Price comparison view
CREATE VIEW vw_price_comparison AS
SELECT 
    t.tool_name,
    tc.display_name as category,
    s.company_name,
    s.region,
    st.daily_rate,
    st.weekly_rate,
    st.availability_status,
    s.regional_priority
FROM supplier_tools st
JOIN suppliers s ON st.supplier_id = s.id
LEFT JOIN tools t ON st.tool_id = t.id
JOIN tool_categories tc ON t.category_id = tc.id
WHERE s.is_active = TRUE
ORDER BY s.regional_priority;

-- Regional pricing analytics
CREATE VIEW vw_regional_pricing AS
SELECT 
    tc.display_name as category,
    s.region,
    COUNT(DISTINCT st.id) as tool_count,
    AVG(st.daily_rate) as avg_daily_rate,
    MIN(st.daily_rate) as min_daily_rate,
    MAX(st.daily_rate) as max_daily_rate
FROM supplier_tools st
JOIN suppliers s ON st.supplier_id = s.id
LEFT JOIN tools t ON st.tool_id = t.id
JOIN tool_categories tc ON t.category_id = tc.id
WHERE st.daily_rate IS NOT NULL
GROUP BY tc.id, s.region;