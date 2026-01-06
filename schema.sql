-- BRRP.IO Waste Jobs Database Schema
-- PostgreSQL Table Definition

-- Create waste_jobs table
CREATE TABLE IF NOT EXISTS waste_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_number TEXT NOT NULL UNIQUE,
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_type TEXT NOT NULL,
    waste_stream TEXT NOT NULL,
    truck_registration TEXT NOT NULL,
    weighbridge_weight NUMERIC(12,2) NOT NULL CHECK (weighbridge_weight > 0),
    status TEXT NOT NULL DEFAULT 'Pending Approval',
    total_price NUMERIC(14,2) NOT NULL,
    notes TEXT,
    company_id TEXT,
    company_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on created_at for efficient sorting
CREATE INDEX IF NOT EXISTS idx_waste_jobs_created_at ON waste_jobs(created_at DESC);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_waste_jobs_status ON waste_jobs(status);

-- Create index on company_id for company-scoped queries
CREATE INDEX IF NOT EXISTS idx_waste_jobs_company_id ON waste_jobs(company_id);

-- Sample query to verify table creation
-- SELECT * FROM waste_jobs ORDER BY created_at DESC LIMIT 10;
