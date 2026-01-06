-- BRRP.IO Waste Tracking Database Schema
-- PostgreSQL 13+ required for gen_random_uuid()
-- For PostgreSQL < 13: CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================
-- USERS & AUTHENTICATION
-- =============================================

-- User roles: admin (god privileges), customer (company user), driver (operational)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'customer', 'driver')),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    company_id UUID, -- NULL for admin, required for customer/driver
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_company_id ON users(company_id);

-- =============================================
-- COMPANIES (Pre-registered waste companies)
-- =============================================

CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    business_number TEXT, -- Tax/business registration number
    contact_email TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    address TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_companies_is_active ON companies(is_active);

-- =============================================
-- DRIVERS (Manually assigned to companies)
-- =============================================

CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Link to user if they have login
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    driver_license_number TEXT,
    phone TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_drivers_company_id ON drivers(company_id);
CREATE INDEX idx_drivers_user_id ON drivers(user_id);

-- =============================================
-- TRUCKS (License plates managed by customers)
-- =============================================

CREATE TABLE IF NOT EXISTS trucks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_plate TEXT NOT NULL UNIQUE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    make TEXT,
    model TEXT,
    year INTEGER,
    capacity_tonnes NUMERIC(10,2),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trucks_company_id ON trucks(company_id);
CREATE INDEX idx_trucks_license_plate ON trucks(license_plate);

-- =============================================
-- WASTE STREAMS (Types with volume/value)
-- =============================================

CREATE TABLE IF NOT EXISTS waste_stream_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    unit_of_measure TEXT NOT NULL DEFAULT 'tonnes',
    price_per_unit NUMERIC(12,2) NOT NULL, -- Base price excl GST
    energy_value TEXT CHECK (energy_value IN ('LOW', 'MEDIUM', 'HIGH')),
    nutrient_value TEXT CHECK (nutrient_value IN ('LOW', 'MEDIUM', 'HIGH')),
    emission_factor NUMERIC(10,4), -- Tonnes CO2eq per tonne of waste
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Default waste stream types
INSERT INTO waste_stream_types (name, description, unit_of_measure, price_per_unit, energy_value, nutrient_value, emission_factor) VALUES
('COW_SHED_WASTE', 'Dairy farm effluent and manure', 'tonnes', 85.00, 'MEDIUM', 'HIGH', 0.12),
('FOOD_WASTE', 'Commercial and residential food waste', 'tonnes', 150.00, 'HIGH', 'MEDIUM', 0.64),
('GREEN_WASTE', 'Garden and yard waste', 'tonnes', 75.00, 'LOW', 'MEDIUM', 0.18),
('SPENT_GRAIN', 'Brewery spent grain', 'tonnes', 65.00, 'MEDIUM', 'HIGH', 0.18),
('APPLE_POMACE', 'Apple processing residue', 'tonnes', 70.00, 'MEDIUM', 'MEDIUM', 0.18),
('GRAPE_MARC', 'Wine grape processing residue', 'tonnes', 70.00, 'MEDIUM', 'MEDIUM', 0.18),
('FISH_WASTE', 'Seafood processing waste', 'tonnes', 120.00, 'HIGH', 'HIGH', 0.25)
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- WEIGHBRIDGE JOBS
-- =============================================

CREATE TABLE IF NOT EXISTS weighbridge_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_number TEXT NOT NULL UNIQUE,
    company_id UUID NOT NULL REFERENCES companies(id),
    truck_id UUID NOT NULL REFERENCES trucks(id),
    driver_id UUID REFERENCES drivers(id), -- Manually assigned
    waste_stream_type_id UUID NOT NULL REFERENCES waste_stream_types(id),
    
    -- Weight measurements
    tare_weight NUMERIC(12,2), -- Empty truck weight
    gross_weight NUMERIC(12,2) NOT NULL, -- Loaded truck weight
    net_weight NUMERIC(12,2) NOT NULL CHECK (net_weight > 0), -- Waste weight
    
    -- Status and validation
    status TEXT NOT NULL DEFAULT 'WEIGHED' CHECK (status IN ('WEIGHED', 'APPROVED', 'REJECTED', 'INVOICED')),
    is_contaminated BOOLEAN NOT NULL DEFAULT false,
    rejection_reason TEXT, -- Required if is_contaminated = true
    
    -- Financial
    unit_price NUMERIC(12,2) NOT NULL, -- Price at time of job
    total_price NUMERIC(14,2) NOT NULL,
    invoice_id UUID, -- Link to monthly invoice
    
    -- Metadata
    notes TEXT,
    weighed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_weighbridge_jobs_company_id ON weighbridge_jobs(company_id);
CREATE INDEX idx_weighbridge_jobs_truck_id ON weighbridge_jobs(truck_id);
CREATE INDEX idx_weighbridge_jobs_status ON weighbridge_jobs(status);
CREATE INDEX idx_weighbridge_jobs_weighed_at ON weighbridge_jobs(weighed_at DESC);
CREATE INDEX idx_weighbridge_jobs_invoice_id ON weighbridge_jobs(invoice_id);

-- =============================================
-- EMISSIONS DATA (From SCADA via REST)
-- =============================================

CREATE TABLE IF NOT EXISTS emissions_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    weighbridge_job_id UUID REFERENCES weighbridge_jobs(id),
    
    -- Waste input
    waste_volume_tonnes NUMERIC(12,2) NOT NULL,
    waste_type TEXT NOT NULL,
    
    -- Methane data (from SCADA)
    methane_generated_m3 NUMERIC(12,4),
    methane_destroyed_m3 NUMERIC(12,4),
    
    -- Emissions calculations
    co2_equivalent_tonnes NUMERIC(12,4), -- Calculated from methane destroyed
    emission_factor NUMERIC(10,4), -- From waste stream type
    gross_emissions_reduction NUMERIC(12,4), -- GER in tonnes CO2eq
    
    -- SCADA metadata
    scada_reading_timestamp TIMESTAMPTZ,
    scada_source TEXT, -- REST endpoint or system identifier
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_emissions_weighbridge_job_id ON emissions_data(weighbridge_job_id);
CREATE INDEX idx_emissions_created_at ON emissions_data(created_at DESC);

-- =============================================
-- ENERGY PRODUCTION (From BRRP plant)
-- =============================================

CREATE TABLE IF NOT EXISTS energy_production (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Energy output
    electricity_kwh NUMERIC(12,2), -- Electricity generated
    process_heat_mj NUMERIC(12,2), -- Heat generated
    
    -- Time period
    reading_timestamp TIMESTAMPTZ NOT NULL,
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,
    
    -- Source
    plant_source TEXT, -- BRRP plant identifier
    data_source TEXT, -- REST endpoint or system identifier
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_energy_reading_timestamp ON energy_production(reading_timestamp DESC);

-- =============================================
-- INVOICES (Monthly aggregation for customers)
-- =============================================

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL UNIQUE,
    company_id UUID NOT NULL REFERENCES companies(id),
    
    -- Invoice period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Financial summary
    subtotal NUMERIC(14,2) NOT NULL,
    gst NUMERIC(14,2) NOT NULL,
    total NUMERIC(14,2) NOT NULL,
    
    -- Waste summary
    total_jobs INTEGER NOT NULL DEFAULT 0,
    total_waste_tonnes NUMERIC(12,2) NOT NULL DEFAULT 0,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ISSUED', 'PAID', 'OVERDUE', 'CANCELLED')),
    issued_at TIMESTAMPTZ,
    due_date DATE,
    paid_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoices_company_id ON invoices(company_id);
CREATE INDEX idx_invoices_period ON invoices(period_start, period_end);
CREATE INDEX idx_invoices_status ON invoices(status);

-- =============================================
-- AUDIT LOG (Track all significant actions)
-- =============================================

CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);

-- =============================================
-- VIEWS FOR REPORTING
-- =============================================

-- Company waste summary view
CREATE OR REPLACE VIEW v_company_waste_summary AS
SELECT 
    c.id AS company_id,
    c.name AS company_name,
    COUNT(wj.id) AS total_jobs,
    SUM(wj.net_weight) AS total_waste_tonnes,
    SUM(wj.total_price) AS total_fees,
    COUNT(CASE WHEN wj.is_contaminated THEN 1 END) AS rejected_jobs,
    MAX(wj.weighed_at) AS last_job_date
FROM companies c
LEFT JOIN weighbridge_jobs wj ON c.id = wj.company_id
WHERE c.is_active = true
GROUP BY c.id, c.name;

-- Waste stream analytics view
CREATE OR REPLACE VIEW v_waste_stream_analytics AS
SELECT 
    wst.name AS waste_type,
    COUNT(wj.id) AS total_jobs,
    SUM(wj.net_weight) AS total_volume_tonnes,
    AVG(wj.net_weight) AS avg_volume_tonnes,
    SUM(wj.total_price) AS total_value,
    SUM(ed.co2_equivalent_tonnes) AS total_emissions_reduced
FROM waste_stream_types wst
LEFT JOIN weighbridge_jobs wj ON wst.id = wj.waste_stream_type_id
LEFT JOIN emissions_data ed ON wj.id = ed.weighbridge_job_id
WHERE wst.is_active = true
GROUP BY wst.id, wst.name;
