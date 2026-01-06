-- BRRP.IO Database Schema
-- PostgreSQL Table Definition
-- Requires PostgreSQL 13+ for gen_random_uuid() function
-- For PostgreSQL < 13, enable pgcrypto extension: CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- and use gen_random_uuid() or uuid_generate_v4()

-- ============================================
-- COMPANIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- WASTE_MANAGEMENT_NZ, ENVIRONZ, etc.
    contact_email TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    address TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on company name
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);

-- Create index on active companies
CREATE INDEX IF NOT EXISTS idx_companies_active ON companies(is_active) WHERE is_active = true;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL, -- Store bcrypt hashed passwords
    role TEXT NOT NULL, -- SYSTEM_ADMIN, COMPANY_ADMIN, OPERATOR
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create index on username for login
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Create index on email for lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index on company_id for company-scoped queries
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);

-- Create index on role for permission checks
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================
-- WASTE JOBS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS waste_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_number TEXT NOT NULL UNIQUE,
    customer_id TEXT NOT NULL, -- Legacy field, will migrate to company_id
    customer_name TEXT NOT NULL, -- Legacy field
    customer_type TEXT NOT NULL, -- Legacy field
    waste_stream TEXT NOT NULL,
    truck_registration TEXT NOT NULL,
    weighbridge_weight NUMERIC(12,2) NOT NULL CHECK (weighbridge_weight > 0),
    status TEXT NOT NULL DEFAULT 'Pending Approval', -- Pending Approval, Approved, Rejected
    total_price NUMERIC(14,2) NOT NULL,
    notes TEXT,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    company_name TEXT,
    driver_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Driver assigned to this job
    is_rejected BOOLEAN DEFAULT false, -- Mark as contaminated/rejected
    rejection_reason TEXT, -- Reason for rejection
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on created_at for efficient sorting
CREATE INDEX IF NOT EXISTS idx_waste_jobs_created_at ON waste_jobs(created_at DESC);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_waste_jobs_status ON waste_jobs(status);

-- Create index on company_id for company-scoped queries
CREATE INDEX IF NOT EXISTS idx_waste_jobs_company_id ON waste_jobs(company_id);

-- Create index on truck registration for validation
CREATE INDEX IF NOT EXISTS idx_waste_jobs_truck_reg ON waste_jobs(truck_registration);

-- Create index on driver_id for driver queries
CREATE INDEX IF NOT EXISTS idx_waste_jobs_driver_id ON waste_jobs(driver_id);

-- ============================================
-- SCADA MEASUREMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS scada_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    waste_processed NUMERIC(12,2) NOT NULL, -- tonnes
    methane_generated NUMERIC(12,2) NOT NULL, -- cubic meters
    methane_destroyed NUMERIC(12,2) NOT NULL, -- cubic meters
    electricity_produced NUMERIC(12,2), -- kWh
    process_heat_produced NUMERIC(12,2), -- MJ
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    location_address TEXT,
    immutable BOOLEAN NOT NULL DEFAULT true, -- Once recorded, cannot be altered
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on facility_id for facility queries
CREATE INDEX IF NOT EXISTS idx_scada_facility_id ON scada_measurements(facility_id);

-- Create index on timestamp for time-series queries
CREATE INDEX IF NOT EXISTS idx_scada_timestamp ON scada_measurements(timestamp DESC);

-- Create composite index for facility + timestamp
CREATE INDEX IF NOT EXISTS idx_scada_facility_timestamp ON scada_measurements(facility_id, timestamp DESC);

-- ============================================
-- EMISSIONS DATA TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS emissions_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scada_measurement_id UUID NOT NULL REFERENCES scada_measurements(id) ON DELETE CASCADE,
    methane_destroyed NUMERIC(12,2) NOT NULL, -- m³
    co2_equivalent NUMERIC(12,3) NOT NULL, -- tonnes CO2eq
    global_warming_potential NUMERIC(6,2) NOT NULL, -- GWP factor (typically 28-36 for methane)
    energy_produced NUMERIC(12,2) NOT NULL, -- kWh or MJ
    def_value NUMERIC(12,6) NOT NULL, -- Default Emission Factor value
    gross_emissions_reduction NUMERIC(12,3) NOT NULL, -- GER in tonnes CO2eq
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    standard_used TEXT NOT NULL, -- ACM0022, AM0053, AMS-I.D
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on scada_measurement_id
CREATE INDEX IF NOT EXISTS idx_emissions_scada_id ON emissions_data(scada_measurement_id);

-- Create index on calculated_at for time-series queries
CREATE INDEX IF NOT EXISTS idx_emissions_calculated_at ON emissions_data(calculated_at DESC);

-- Create index on standard_used for filtering by IPCC standard
CREATE INDEX IF NOT EXISTS idx_emissions_standard ON emissions_data(standard_used);

-- ============================================
-- COMPANY LICENSE PLATES TABLE
-- For tracking registered trucks per company
-- ============================================
CREATE TABLE IF NOT EXISTS company_license_plates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    license_plate TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(company_id, license_plate)
);

-- Create index on company_id
CREATE INDEX IF NOT EXISTS idx_license_plates_company_id ON company_license_plates(company_id);

-- Create index on license_plate for validation
CREATE INDEX IF NOT EXISTS idx_license_plates_plate ON company_license_plates(license_plate);

-- Sample queries to verify table creation
-- SELECT * FROM companies ORDER BY created_at DESC LIMIT 10;
-- SELECT * FROM users ORDER BY created_at DESC LIMIT 10;
-- SELECT * FROM waste_jobs ORDER BY created_at DESC LIMIT 10;
-- SELECT * FROM scada_measurements ORDER BY timestamp DESC LIMIT 10;
-- SELECT * FROM emissions_data ORDER BY calculated_at DESC LIMIT 10;
