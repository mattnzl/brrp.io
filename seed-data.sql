-- BRRP.IO Seed Data Script
-- This script populates the database with demo data to showcase all relationships

-- Clear existing demo data (optional - comment out if you want to preserve existing data)
-- TRUNCATE TABLE audit_log, emissions_data, energy_production, weighbridge_jobs, drivers, trucks, users, companies, invoices CASCADE;

-- =============================================
-- COMPANIES (Waste Management Companies)
-- =============================================

INSERT INTO companies (id, name, business_number, contact_email, contact_phone, address, is_active) VALUES
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Waste Management NZ', 'NZBN-1234567890', 'contact@wmnz.co.nz', '+64 3 123 4567', '123 Industrial Rd, Nelson', true),
('b2c3d4e5-f6a7-8901-2345-678901bcdef0', 'EnviroNZ', 'NZBN-2345678901', 'info@environz.co.nz', '+64 3 234 5678', '456 Green Lane, Richmond', true),
('c3d4e5f6-a7b8-9012-3456-789012cdef01', 'GreenCycle Nelson', 'NZBN-3456789012', 'hello@greencycle.nz', '+64 3 345 6789', '789 Eco Drive, Stoke', true)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- USERS (Admin, Company Admins, Drivers)
-- =============================================

-- System Admin (God privileges)
INSERT INTO users (id, username, email, password_hash, role, first_name, last_name, company_id, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'admin', 'admin@brrp.io', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJ', 'admin', 'System', 'Administrator', NULL, true)
ON CONFLICT (id) DO NOTHING;

-- Company Users (Customers)
INSERT INTO users (id, username, email, password_hash, role, first_name, last_name, company_id, is_active) VALUES
('22222222-2222-2222-2222-222222222222', 'wmnz_admin', 'admin@wmnz.co.nz', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJ', 'customer', 'John', 'Smith', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', true),
('33333333-3333-3333-3333-333333333333', 'environz_admin', 'admin@environz.co.nz', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJ', 'customer', 'Sarah', 'Johnson', 'b2c3d4e5-f6a7-8901-2345-678901bcdef0', true),
('44444444-4444-4444-4444-444444444444', 'greencycle_admin', 'admin@greencycle.nz', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJ', 'customer', 'Mike', 'Williams', 'c3d4e5f6-a7b8-9012-3456-789012cdef01', true)
ON CONFLICT (id) DO NOTHING;

-- Driver Users
INSERT INTO users (id, username, email, password_hash, role, first_name, last_name, company_id, is_active) VALUES
('55555555-5555-5555-5555-555555555555', 'driver1', 'driver1@wmnz.co.nz', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJ', 'driver', 'Bob', 'Taylor', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', true),
('66666666-6666-6666-6666-666666666666', 'driver2', 'driver2@environz.co.nz', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJ', 'driver', 'Emma', 'Davis', 'b2c3d4e5-f6a7-8901-2345-678901bcdef0', true)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- DRIVERS (With and without user accounts)
-- =============================================

INSERT INTO drivers (id, user_id, company_id, first_name, last_name, driver_license_number, phone, is_active) VALUES
-- Drivers with user accounts
('a1111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Bob', 'Taylor', 'DL123456', '+64 21 111 2222', true),
('a2222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 'b2c3d4e5-f6a7-8901-2345-678901bcdef0', 'Emma', 'Davis', 'DL234567', '+64 21 222 3333', true),
-- Drivers without user accounts (manual only)
('a3333333-3333-3333-3333-333333333333', NULL, 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'James', 'Wilson', 'DL345678', '+64 21 333 4444', true),
('a4444444-4444-4444-4444-444444444444', NULL, 'c3d4e5f6-a7b8-9012-3456-789012cdef01', 'Lisa', 'Brown', 'DL456789', '+64 21 444 5555', true)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- TRUCKS (License plates)
-- =============================================

INSERT INTO trucks (id, license_plate, company_id, make, model, year, capacity_tonnes, is_active) VALUES
-- Waste Management NZ trucks
('11111111-1111-1111-1111-111111111111', 'ABC123', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Isuzu', 'FVZ1400', 2020, 15.0, true),
('22222222-2222-2222-2222-222222222222', 'DEF456', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Hino', '500 Series', 2021, 18.0, true),
('33333333-3333-3333-3333-333333333333', 'GHI789', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Isuzu', 'FVZ1400', 2019, 15.0, true),
-- EnviroNZ trucks
('44444444-4444-4444-4444-444444444444', 'JKL012', 'b2c3d4e5-f6a7-8901-2345-678901bcdef0', 'Scania', 'P-Series', 2022, 20.0, true),
('55555555-5555-5555-5555-555555555555', 'MNO345', 'b2c3d4e5-f6a7-8901-2345-678901bcdef0', 'Volvo', 'FE', 2021, 18.0, true),
-- GreenCycle Nelson trucks
('66666666-6666-6666-6666-666666666666', 'PQR678', 'c3d4e5f6-a7b8-9012-3456-789012cdef01', 'Mitsubishi', 'Fuso Fighter', 2020, 12.0, true),
('77777777-7777-7777-7777-777777777777', 'STU901', 'c3d4e5f6-a7b8-9012-3456-789012cdef01', 'Isuzu', 'NQR', 2022, 10.0, true)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- WEIGHBRIDGE JOBS (Demo waste deliveries)
-- =============================================

-- Get waste stream type IDs for reference
DO $$
DECLARE
    cow_shed_id UUID;
    food_waste_id UUID;
    green_waste_id UUID;
    spent_grain_id UUID;
    apple_pomace_id UUID;
    grape_marc_id UUID;
BEGIN
    SELECT id INTO cow_shed_id FROM waste_stream_types WHERE name = 'COW_SHED_WASTE';
    SELECT id INTO food_waste_id FROM waste_stream_types WHERE name = 'FOOD_WASTE';
    SELECT id INTO green_waste_id FROM waste_stream_types WHERE name = 'GREEN_WASTE';
    SELECT id INTO spent_grain_id FROM waste_stream_types WHERE name = 'SPENT_GRAIN';
    SELECT id INTO apple_pomace_id FROM waste_stream_types WHERE name = 'APPLE_POMACE';
    SELECT id INTO grape_marc_id FROM waste_stream_types WHERE name = 'GRAPE_MARC';

    -- Recent jobs (last 7 days) - APPROVED
    INSERT INTO weighbridge_jobs (id, job_number, company_id, truck_id, driver_id, waste_stream_type_id, tare_weight, gross_weight, net_weight, status, is_contaminated, unit_price, total_price, notes, weighed_at, approved_at, approved_by) VALUES
    ('e1111111-1111-1111-1111-111111111111', 'WB-' || to_char(NOW() - INTERVAL '1 day', 'YYYYMMDD') || '-A001', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', '11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', cow_shed_id, 8.5, 28.3, 19.8, 'APPROVED', false, 85.00, 1683.00, 'Clean load from Tasman dairy farm', NOW() - INTERVAL '1 day', NOW() - INTERVAL '23 hours', '11111111-1111-1111-1111-111111111111'),
    ('e2222222-2222-2222-2222-222222222222', 'WB-' || to_char(NOW() - INTERVAL '1 day', 'YYYYMMDD') || '-B002', 'b2c3d4e5-f6a7-8901-2345-678901bcdef0', '44444444-4444-4444-4444-444444444444', 'a2222222-2222-2222-2222-222222222222', food_waste_id, 9.2, 31.5, 22.3, 'APPROVED', false, 150.00, 3345.00, 'Restaurant food waste collection', NOW() - INTERVAL '1 day', NOW() - INTERVAL '22 hours', '11111111-1111-1111-1111-111111111111'),
    ('e3333333-3333-3333-3333-333333333333', 'WB-' || to_char(NOW() - INTERVAL '2 days', 'YYYYMMDD') || '-C003', 'c3d4e5f6-a7b8-9012-3456-789012cdef01', '66666666-6666-6666-6666-666666666666', 'a4444444-4444-4444-4444-444444444444', green_waste_id, 5.8, 18.9, 13.1, 'APPROVED', false, 75.00, 982.50, 'Garden waste from residential areas', NOW() - INTERVAL '2 days', NOW() - INTERVAL '47 hours', '11111111-1111-1111-1111-111111111111'),
    ('e4444444-4444-4444-4444-444444444444', 'WB-' || to_char(NOW() - INTERVAL '3 days', 'YYYYMMDD') || '-D004', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', '22222222-2222-2222-2222-222222222222', 'a3333333-3333-3333-3333-333333333333', spent_grain_id, 8.0, 24.8, 16.8, 'APPROVED', false, 65.00, 1092.00, 'Spent grain from McCashin''s Brewery', NOW() - INTERVAL '3 days', NOW() - INTERVAL '71 hours', '11111111-1111-1111-1111-111111111111');

    -- Jobs awaiting approval - WEIGHED
    INSERT INTO weighbridge_jobs (id, job_number, company_id, truck_id, driver_id, waste_stream_type_id, tare_weight, gross_weight, net_weight, status, is_contaminated, unit_price, total_price, notes, weighed_at) VALUES
    ('e5555555-5555-5555-5555-555555555555', 'WB-' || to_char(NOW(), 'YYYYMMDD') || '-E005', 'b2c3d4e5-f6a7-8901-2345-678901bcdef0', '55555555-5555-5555-5555-555555555555', 'a2222222-2222-2222-2222-222222222222', apple_pomace_id, 9.5, 26.2, 16.7, 'WEIGHED', false, 70.00, 1169.00, 'Apple pomace from Tasman Orchards', NOW() - INTERVAL '2 hours'),
    ('e6666666-6666-6666-6666-666666666666', 'WB-' || to_char(NOW(), 'YYYYMMDD') || '-F006', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', '33333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', cow_shed_id, 8.8, 30.5, 21.7, 'WEIGHED', false, 85.00, 1844.50, 'Dairy effluent - large farm delivery', NOW() - INTERVAL '1 hour');

    -- Rejected job due to contamination
    INSERT INTO weighbridge_jobs (id, job_number, company_id, truck_id, driver_id, waste_stream_type_id, tare_weight, gross_weight, net_weight, status, is_contaminated, rejection_reason, unit_price, total_price, notes, weighed_at, approved_at, approved_by) VALUES
    ('e7777777-7777-7777-7777-777777777777', 'WB-' || to_char(NOW() - INTERVAL '4 days', 'YYYYMMDD') || '-G007', 'c3d4e5f6-a7b8-9012-3456-789012cdef01', '77777777-7777-7777-7777-777777777777', NULL, green_waste_id, 6.2, 14.8, 8.6, 'REJECTED', true, 'Plastic contamination detected - 15% of load', 75.00, 645.00, 'Returned to sender for re-sorting', NOW() - INTERVAL '4 days', NOW() - INTERVAL '95 hours', '11111111-1111-1111-1111-111111111111');

    -- Older approved jobs for historical data
    INSERT INTO weighbridge_jobs (id, job_number, company_id, truck_id, driver_id, waste_stream_type_id, tare_weight, gross_weight, net_weight, status, is_contaminated, unit_price, total_price, notes, weighed_at, approved_at, approved_by) VALUES
    ('e8888888-8888-8888-8888-888888888888', 'WB-' || to_char(NOW() - INTERVAL '10 days', 'YYYYMMDD') || '-H008', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', '11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', food_waste_id, 8.3, 27.8, 19.5, 'APPROVED', false, 150.00, 2925.00, 'Hotel food waste', NOW() - INTERVAL '10 days', NOW() - INTERVAL '239 hours', '11111111-1111-1111-1111-111111111111'),
    ('e9999999-9999-9999-9999-999999999999', 'WB-' || to_char(NOW() - INTERVAL '15 days', 'YYYYMMDD') || '-I009', 'b2c3d4e5-f6a7-8901-2345-678901bcdef0', '44444444-4444-4444-4444-444444444444', 'a2222222-2222-2222-2222-222222222222', grape_marc_id, 9.0, 23.4, 14.4, 'APPROVED', false, 70.00, 1008.00, 'Grape marc from Neudorf Vineyard', NOW() - INTERVAL '15 days', NOW() - INTERVAL '359 hours', '11111111-1111-1111-1111-111111111111');

END $$;

-- =============================================
-- EMISSIONS DATA (Linked to weighbridge jobs)
-- =============================================

-- Add emissions data for approved jobs
DO $$
DECLARE
    job RECORD;
    emission_factor NUMERIC(10,4);
    methane_m3 NUMERIC(12,4);
    co2_eq NUMERIC(12,4);
    ger NUMERIC(12,4);
BEGIN
    FOR job IN 
        SELECT wj.id, wj.net_weight, wst.name as waste_type, wst.emission_factor
        FROM weighbridge_jobs wj
        INNER JOIN waste_stream_types wst ON wj.waste_stream_type_id = wst.id
        WHERE wj.status = 'APPROVED'
    LOOP
        emission_factor := job.emission_factor;
        -- Estimate methane generation (simplified: ~60-100 m³ per tonne depending on waste type)
        methane_m3 := job.net_weight * (CASE 
            WHEN job.waste_type LIKE '%FOOD%' THEN 95.0
            WHEN job.waste_type LIKE '%COW%' THEN 75.0
            WHEN job.waste_type LIKE '%GREEN%' THEN 45.0
            ELSE 65.0
        END);
        
        -- Calculate CO2 equivalent (using GWP of 28 for methane)
        -- Methane density: ~0.657 kg/m³, so convert to tonnes and multiply by GWP
        co2_eq := (methane_m3 * 0.000657) * 28.0;
        
        -- GER (Gross Emissions Reduction) = waste diverted from landfill emissions
        ger := job.net_weight * emission_factor;
        
        INSERT INTO emissions_data (
            weighbridge_job_id,
            waste_volume_tonnes,
            waste_type,
            methane_generated_m3,
            methane_destroyed_m3,
            co2_equivalent_tonnes,
            emission_factor,
            gross_emissions_reduction,
            scada_reading_timestamp,
            scada_source
        ) VALUES (
            job.id,
            job.net_weight,
            job.waste_type,
            methane_m3,
            methane_m3 * 0.95, -- 95% destruction efficiency
            co2_eq,
            emission_factor,
            ger,
            NOW() - INTERVAL '12 hours', -- SCADA reading happens after processing
            'BRRP-SCADA-REST-API-v1'
        );
    END LOOP;
END $$;

-- =============================================
-- ENERGY PRODUCTION (BRRP plant output)
-- =============================================

-- Add energy production data for last 30 days
DO $$
DECLARE
    day_offset INTEGER;
    daily_electricity NUMERIC(12,2);
    daily_heat NUMERIC(12,2);
BEGIN
    FOR day_offset IN 0..29 LOOP
        -- Electricity varies between 1000-1400 kWh per day
        daily_electricity := 1000 + (RANDOM() * 400);
        
        -- Process heat varies between 2500-3500 MJ per day
        daily_heat := 2500 + (RANDOM() * 1000);
        
        INSERT INTO energy_production (
            electricity_kwh,
            process_heat_mj,
            reading_timestamp,
            period_start,
            period_end,
            plant_source,
            data_source
        ) VALUES (
            daily_electricity,
            daily_heat,
            (NOW() - (day_offset || ' days')::INTERVAL)::DATE + TIME '23:59:59',
            (NOW() - (day_offset || ' days')::INTERVAL)::DATE,
            (NOW() - (day_offset || ' days')::INTERVAL)::DATE + TIME '23:59:59',
            'BRRP-Nelson-Plant-01',
            'BRRP-Energy-Monitor-REST-API'
        );
    END LOOP;
END $$;

-- =============================================
-- AUDIT LOG (Track significant actions)
-- =============================================

INSERT INTO audit_log (user_id, action, entity_type, entity_id, details) VALUES
('11111111-1111-1111-1111-111111111111', 'APPROVED_JOB', 'weighbridge_job', 'e1111111-1111-1111-1111-111111111111', '{"status": "APPROVED", "reason": "Clean load, no contamination"}'),
('11111111-1111-1111-1111-111111111111', 'APPROVED_JOB', 'weighbridge_job', 'e2222222-2222-2222-2222-222222222222', '{"status": "APPROVED", "reason": "Quality food waste"}'),
('11111111-1111-1111-1111-111111111111', 'REJECTED_JOB', 'weighbridge_job', 'e7777777-7777-7777-7777-777777777777', '{"status": "REJECTED", "reason": "Plastic contamination detected"}');

-- =============================================
-- Summary queries to verify data
-- =============================================

-- Show company summary
SELECT 
    c.name,
    COUNT(DISTINCT t.id) as trucks,
    COUNT(DISTINCT d.id) as drivers,
    COUNT(wj.id) as total_jobs,
    COUNT(CASE WHEN wj.status = 'WEIGHED' THEN 1 END) as pending_jobs,
    COUNT(CASE WHEN wj.status = 'APPROVED' THEN 1 END) as approved_jobs,
    COUNT(CASE WHEN wj.status = 'REJECTED' THEN 1 END) as rejected_jobs,
    COALESCE(SUM(wj.net_weight), 0) as total_waste_tonnes,
    COALESCE(SUM(wj.total_price), 0) as total_revenue
FROM companies c
LEFT JOIN trucks t ON c.id = t.company_id
LEFT JOIN drivers d ON c.id = d.company_id
LEFT JOIN weighbridge_jobs wj ON c.id = wj.company_id
GROUP BY c.id, c.name
ORDER BY c.name;

-- Show waste stream summary
SELECT 
    wst.name,
    wst.unit_of_measure,
    wst.price_per_unit,
    wst.emission_factor,
    COUNT(wj.id) as total_jobs,
    COALESCE(SUM(wj.net_weight), 0) as total_volume,
    COALESCE(SUM(wj.total_price), 0) as total_value,
    COALESCE(SUM(ed.gross_emissions_reduction), 0) as total_ger_tonnes
FROM waste_stream_types wst
LEFT JOIN weighbridge_jobs wj ON wst.id = wj.waste_stream_type_id
LEFT JOIN emissions_data ed ON wj.id = ed.weighbridge_job_id
GROUP BY wst.id, wst.name, wst.unit_of_measure, wst.price_per_unit, wst.emission_factor
ORDER BY total_jobs DESC;

COMMIT;
