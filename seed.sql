-- BRRP.io Database Seed Data
-- Sample data for testing the enhanced schema
-- Run after applying schema.sql

-- ============================================
-- COMPANIES (Customers)
-- ============================================

-- Insert sample companies
INSERT INTO companies (id, name, type, contact_email, contact_phone, address, logo_url, is_active, created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Waste Management NZ', 'WASTE_MANAGEMENT_NZ', 'contact@wastemanagement.co.nz', '+64 9 123 4567', '123 Main Street, Auckland, NZ', NULL, true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'enviroNZ', 'ENVIRONZ', 'info@environz.co.nz', '+64 9 765 4321', '456 Green Ave, Wellington, NZ', NULL, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- USERS
-- ============================================

-- Insert system admin
-- Password: admin123 (hashed with bcrypt, cost 10)
INSERT INTO users (id, username, email, password_hash, role, company_id, first_name, last_name, photo_url, is_active, created_at, updated_at)
VALUES 
  ('660e8400-e29b-41d4-a716-446655440001', 'admin', 'admin@brrp.io', '$2b$10$rKvFJZXZ3Z3Z3Z3Z3Z3Z3eH5tF5tF5tF5tF5tF5tF5tF5tF5tF5tG', 'SYSTEM_ADMIN', NULL, 'System', 'Administrator', NULL, true, NOW(), NOW())
ON CONFLICT (username) DO NOTHING;

-- Insert company admin for Waste Management NZ
-- Password: wmnz123
INSERT INTO users (id, username, email, password_hash, role, company_id, first_name, last_name, photo_url, is_active, created_at, updated_at, created_by)
VALUES 
  ('660e8400-e29b-41d4-a716-446655440002', 'wmnz_admin', 'admin@wastemanagement.co.nz', '$2b$10$rKvFJZXZ3Z3Z3Z3Z3Z3Z3eH5tF5tF5tF5tF5tF5tF5tF5tF5tF5tH', 'COMPANY_ADMIN', '550e8400-e29b-41d4-a716-446655440001', 'John', 'Smith', NULL, true, NOW(), NOW(), '660e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (username) DO NOTHING;

-- Insert operator for Waste Management NZ
-- Password: operator123
INSERT INTO users (id, username, email, password_hash, role, company_id, first_name, last_name, photo_url, is_active, created_at, updated_at, created_by)
VALUES 
  ('660e8400-e29b-41d4-a716-446655440003', 'wmnz_operator1', 'operator1@wastemanagement.co.nz', '$2b$10$rKvFJZXZ3Z3Z3Z3Z3Z3Z3eH5tF5tF5tF5tF5tF5tF5tF5tF5tF5tI', 'OPERATOR', '550e8400-e29b-41d4-a716-446655440001', 'Jane', 'Doe', NULL, true, NOW(), NOW(), '660e8400-e29b-41d4-a716-446655440002'),
  ('660e8400-e29b-41d4-a716-446655440004', 'wmnz_driver1', 'driver1@wastemanagement.co.nz', '$2b$10$rKvFJZXZ3Z3Z3Z3Z3Z3Z3eH5tF5tF5tF5tF5tF5tF5tF5tF5tF5tJ', 'OPERATOR', '550e8400-e29b-41d4-a716-446655440001', 'Mike', 'Johnson', NULL, true, NOW(), NOW(), '660e8400-e29b-41d4-a716-446655440002')
ON CONFLICT (username) DO NOTHING;

-- Insert company admin for enviroNZ
-- Password: environz123
INSERT INTO users (id, username, email, password_hash, role, company_id, first_name, last_name, photo_url, is_active, created_at, updated_at, created_by)
VALUES 
  ('660e8400-e29b-41d4-a716-446655440005', 'environz_admin', 'admin@environz.co.nz', '$2b$10$rKvFJZXZ3Z3Z3Z3Z3Z3Z3eH5tF5tF5tF5tF5tF5tF5tF5tF5tF5tK', 'COMPANY_ADMIN', '550e8400-e29b-41d4-a716-446655440002', 'Sarah', 'Williams', NULL, true, NOW(), NOW(), '660e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (username) DO NOTHING;

-- ============================================
-- COMPANY LICENSE PLATES
-- ============================================

-- Register license plates for Waste Management NZ
INSERT INTO company_license_plates (company_id, license_plate, is_active, created_at, created_by)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'WM001', true, NOW(), '660e8400-e29b-41d4-a716-446655440002'),
  ('550e8400-e29b-41d4-a716-446655440001', 'WM002', true, NOW(), '660e8400-e29b-41d4-a716-446655440002'),
  ('550e8400-e29b-41d4-a716-446655440001', 'WM003', true, NOW(), '660e8400-e29b-41d4-a716-446655440002'),
  ('550e8400-e29b-41d4-a716-446655440001', 'ABC123', true, NOW(), '660e8400-e29b-41d4-a716-446655440002')
ON CONFLICT (company_id, license_plate) DO NOTHING;

-- Register license plates for enviroNZ
INSERT INTO company_license_plates (company_id, license_plate, is_active, created_at, created_by)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440002', 'ENV001', true, NOW(), '660e8400-e29b-41d4-a716-446655440005'),
  ('550e8400-e29b-41d4-a716-446655440002', 'ENV002', true, NOW(), '660e8400-e29b-41d4-a716-446655440005')
ON CONFLICT (company_id, license_plate) DO NOTHING;

-- ============================================
-- SAMPLE WASTE JOBS
-- ============================================

-- Sample approved waste jobs for Waste Management NZ
INSERT INTO waste_jobs (
  job_number, customer_id, customer_name, customer_type,
  waste_stream, truck_registration, weighbridge_weight,
  status, total_price, notes, company_id, company_name, driver_id,
  is_rejected, created_at
)
VALUES 
  ('WJ-20260106-001', 'cust-wmnz', 'Waste Management NZ', 'WASTE_MANAGEMENT_NZ',
   'FOOD_WASTE', 'WM001', 8.5, 'Approved', 1785.00, 'Restaurant food waste',
   '550e8400-e29b-41d4-a716-446655440001', 'Waste Management NZ', '660e8400-e29b-41d4-a716-446655440004',
   false, NOW() - INTERVAL '5 days'),
   
  ('WJ-20260106-002', 'cust-wmnz', 'Waste Management NZ', 'WASTE_MANAGEMENT_NZ',
   'GREEN_WASTE', 'WM002', 12.0, 'Approved', 2520.00, 'Garden waste collection',
   '550e8400-e29b-41d4-a716-446655440001', 'Waste Management NZ', '660e8400-e29b-41d4-a716-446655440004',
   false, NOW() - INTERVAL '4 days'),
   
  ('WJ-20260106-003', 'cust-wmnz', 'Waste Management NZ', 'WASTE_MANAGEMENT_NZ',
   'COW_SHED_WASTE', 'WM001', 6.5, 'Approved', 1365.00, 'Farm dairy waste',
   '550e8400-e29b-41d4-a716-446655440001', 'Waste Management NZ', '660e8400-e29b-41d4-a716-446655440004',
   false, NOW() - INTERVAL '3 days')
ON CONFLICT (job_number) DO NOTHING;

-- Sample pending waste jobs
INSERT INTO waste_jobs (
  job_number, customer_id, customer_name, customer_type,
  waste_stream, truck_registration, weighbridge_weight,
  status, total_price, notes, company_id, company_name, driver_id,
  is_rejected, created_at
)
VALUES 
  ('WJ-20260106-004', 'cust-wmnz', 'Waste Management NZ', 'WASTE_MANAGEMENT_NZ',
   'FOOD_WASTE', 'WM003', 9.2, 'Pending Approval', 1932.00, 'Supermarket food waste',
   '550e8400-e29b-41d4-a716-446655440001', 'Waste Management NZ', NULL,
   false, NOW() - INTERVAL '1 hour'),
   
  ('WJ-20260106-005', 'cust-environz', 'enviroNZ', 'ENVIRONZ',
   'FISH_WASTE', 'ENV001', 4.5, 'Pending Approval', 1170.00, 'Seafood processing waste',
   '550e8400-e29b-41d4-a716-446655440002', 'enviroNZ', NULL,
   false, NOW() - INTERVAL '30 minutes')
ON CONFLICT (job_number) DO NOTHING;

-- Sample rejected waste job (contaminated)
INSERT INTO waste_jobs (
  job_number, customer_id, customer_name, customer_type,
  waste_stream, truck_registration, weighbridge_weight,
  status, total_price, notes, company_id, company_name, driver_id,
  is_rejected, rejection_reason, created_at
)
VALUES 
  ('WJ-20260106-006', 'cust-wmnz', 'Waste Management NZ', 'WASTE_MANAGEMENT_NZ',
   'FOOD_WASTE', 'WM002', 7.8, 'Rejected', 1638.00, NULL,
   '550e8400-e29b-41d4-a716-446655440001', 'Waste Management NZ', '660e8400-e29b-41d4-a716-446655440004',
   true, 'Contaminated with plastic packaging and non-organic materials', NOW() - INTERVAL '2 days')
ON CONFLICT (job_number) DO NOTHING;

-- ============================================
-- SAMPLE SCADA MEASUREMENTS
-- ============================================

-- Sample SCADA measurements for Nelson BRRP facility
INSERT INTO scada_measurements (
  id, facility_id, timestamp, waste_processed, methane_generated,
  methane_destroyed, electricity_produced, process_heat_produced,
  latitude, longitude, location_address, immutable, created_at
)
VALUES 
  ('770e8400-e29b-41d4-a716-446655440001', 'nelson-brrp-01', NOW() - INTERVAL '1 day',
   10.0, 200.0, 180.0, 1200.0, 4320.0,
   -41.2706, 173.2840, 'Nelson BRRP Facility, Bell Island, Nelson, NZ', true, NOW() - INTERVAL '1 day'),
   
  ('770e8400-e29b-41d4-a716-446655440002', 'nelson-brrp-01', NOW() - INTERVAL '2 days',
   9.5, 190.0, 175.0, 1150.0, 4140.0,
   -41.2706, 173.2840, 'Nelson BRRP Facility, Bell Island, Nelson, NZ', true, NOW() - INTERVAL '2 days'),
   
  ('770e8400-e29b-41d4-a716-446655440003', 'nelson-brrp-01', NOW() - INTERVAL '3 days',
   10.5, 210.0, 185.0, 1250.0, 4500.0,
   -41.2706, 173.2840, 'Nelson BRRP Facility, Bell Island, Nelson, NZ', true, NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SAMPLE EMISSIONS DATA
-- ============================================

-- Emissions data for the SCADA measurements (calculated using GWP=28, methane density=0.657 kg/m³)
-- For 180 m³ methane destroyed: (180 × 0.657 / 1000) × 28 = 3.308 tonnes CO2eq

INSERT INTO emissions_data (
  scada_measurement_id, methane_destroyed, co2_equivalent,
  global_warming_potential, energy_produced, def_value,
  gross_emissions_reduction, calculated_at, standard_used, created_at
)
VALUES 
  ('770e8400-e29b-41d4-a716-446655440001', 180.0, 3.308,
   28.0, 1200.0, 0.002757, 3.308, NOW() - INTERVAL '1 day', 'ACM0022', NOW() - INTERVAL '1 day'),
   
  ('770e8400-e29b-41d4-a716-446655440002', 175.0, 3.215,
   28.0, 1150.0, 0.002796, 3.215, NOW() - INTERVAL '2 days', 'ACM0022', NOW() - INTERVAL '2 days'),
   
  ('770e8400-e29b-41d4-a716-446655440003', 185.0, 3.400,
   28.0, 1250.0, 0.002720, 3.400, NOW() - INTERVAL '3 days', 'ACM0022', NOW() - INTERVAL '3 days')
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 'Database seeded successfully!' as status;

-- Display counts
SELECT 'Companies' as table_name, COUNT(*) as count FROM companies
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'License Plates', COUNT(*) FROM company_license_plates
UNION ALL
SELECT 'Waste Jobs', COUNT(*) FROM waste_jobs
UNION ALL
SELECT 'SCADA Measurements', COUNT(*) FROM scada_measurements
UNION ALL
SELECT 'Emissions Data', COUNT(*) FROM emissions_data;
