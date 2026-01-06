# BRRP.io Database Setup Guide

This guide explains how to set up the PostgreSQL database for BRRP.io with the enhanced schema supporting users, companies, SCADA measurements, and emissions tracking.

## Prerequisites

- PostgreSQL 13+ (required for `gen_random_uuid()` function)
- Database access credentials
- `DATABASE_URL` environment variable configured

## Database Schema Overview

The enhanced schema includes the following tables:

### Core Tables

1. **companies** - Customer/company records with contact information
2. **users** - User accounts with role-based access (System Admin, Company Admin, Operator)
3. **waste_jobs** - Weighbridge waste jobs with driver assignment and rejection tracking
4. **scada_measurements** - Immutable real-time SCADA data from processing facilities
5. **emissions_data** - Calculated emissions data linked to SCADA measurements
6. **company_license_plates** - Registered truck license plates per company

### Key Features

- **Role-based Access Control**: Three user roles with different permissions
- **License Plate Validation**: Pre-register trucks before accepting waste
- **Driver Assignment**: Track which driver handled each waste job
- **Rejection Tracking**: Mark contaminated waste with rejection reason
- **Immutable SCADA Data**: Once recorded, cannot be altered for audit compliance
- **Automatic Emissions Calculation**: Emissions data generated automatically from SCADA measurements

## Quick Start

### 1. Create Database

```bash
# Create a new database (if needed)
psql -U postgres -c "CREATE DATABASE brrpio;"
```

### 2. Set Environment Variable

Create a `.env.local` file in the project root:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/brrpio
```

### 3. Apply Schema

```bash
# Apply the schema
psql -U postgres -d brrpio -f schema.sql
```

This will create all tables, indexes, and constraints.

### 4. Seed Sample Data (Optional)

For development and testing, load sample data:

```bash
# Load seed data
psql -U postgres -d brrpio -f seed.sql
```

This creates:
- 2 sample companies (Waste Management NZ, enviroNZ)
- 5 sample users (1 admin, 2 company admins, 2 operators)
- 6 license plates
- 6 sample waste jobs (approved, pending, rejected)
- 3 SCADA measurements with emissions data

## Database Schema Details

### companies

Stores customer/company information.

**Columns:**
- `id` (UUID, PK): Unique identifier
- `name` (TEXT): Company name
- `type` (TEXT): Customer type (WASTE_MANAGEMENT_NZ, ENVIRONZ)
- `contact_email` (TEXT): Primary contact email
- `contact_phone` (TEXT): Primary contact phone
- `address` (TEXT, nullable): Physical address
- `is_active` (BOOLEAN): Active status
- `created_at` (TIMESTAMPTZ): Creation timestamp

**Indexes:**
- `idx_companies_name` on `name`
- `idx_companies_active` on `is_active` (partial, where `is_active = true`)

### users

User accounts with role-based permissions.

**Columns:**
- `id` (UUID, PK): Unique identifier
- `username` (TEXT, UNIQUE): Login username
- `email` (TEXT, UNIQUE): Email address
- `password_hash` (TEXT): Bcrypt hashed password
- `role` (TEXT): User role (SYSTEM_ADMIN, COMPANY_ADMIN, OPERATOR)
- `company_id` (UUID, FK): Associated company (for Company Admin/Operator)
- `first_name` (TEXT): First name
- `last_name` (TEXT): Last name
- `is_active` (BOOLEAN): Active status
- `created_at` (TIMESTAMPTZ): Creation timestamp
- `created_by` (UUID, FK, nullable): User who created this account

**Indexes:**
- `idx_users_username` on `username`
- `idx_users_email` on `email`
- `idx_users_company_id` on `company_id`
- `idx_users_role` on `role`

**Roles:**
- **SYSTEM_ADMIN**: Full access to all data and features
- **COMPANY_ADMIN**: Manage their company's data, cannot see energy/emissions
- **OPERATOR**: Create waste jobs for their company, limited read access

### waste_jobs

Waste jobs from weighbridge measurements.

**Columns:**
- `id` (UUID, PK): Unique identifier
- `job_number` (TEXT, UNIQUE): Human-readable job number (e.g., WJ-20260106-001)
- `customer_id` (TEXT): Legacy customer ID
- `customer_name` (TEXT): Customer name
- `customer_type` (TEXT): Customer type
- `waste_stream` (TEXT): Type of waste (FOOD_WASTE, GREEN_WASTE, etc.)
- `truck_registration` (TEXT): License plate
- `weighbridge_weight` (NUMERIC): Weight in tonnes (must be > 0)
- `status` (TEXT): Job status (Pending Approval, Approved, Rejected)
- `total_price` (NUMERIC): Calculated price (excl. GST)
- `notes` (TEXT, nullable): Optional notes
- `company_id` (UUID, FK, nullable): Associated company
- `company_name` (TEXT, nullable): Company name
- `driver_id` (UUID, FK, nullable): Assigned driver
- `is_rejected` (BOOLEAN): Contamination flag
- `rejection_reason` (TEXT, nullable): Reason if rejected
- `created_at` (TIMESTAMPTZ): Creation timestamp
- `updated_at` (TIMESTAMPTZ): Last update timestamp

**Indexes:**
- `idx_waste_jobs_created_at` on `created_at DESC`
- `idx_waste_jobs_status` on `status`
- `idx_waste_jobs_company_id` on `company_id`
- `idx_waste_jobs_truck_reg` on `truck_registration`
- `idx_waste_jobs_driver_id` on `driver_id`

**Waste Stream Pricing:**
- Most waste types: $210/tonne
- Fish waste: $260/tonne

### scada_measurements

Real-time SCADA measurements from BRRP facilities.

**Columns:**
- `id` (UUID, PK): Unique identifier
- `facility_id` (TEXT): Facility identifier
- `timestamp` (TIMESTAMPTZ): Measurement timestamp
- `waste_processed` (NUMERIC): Waste processed in tonnes
- `methane_generated` (NUMERIC): Methane generated in m³
- `methane_destroyed` (NUMERIC): Methane destroyed in m³
- `electricity_produced` (NUMERIC, nullable): Electricity in kWh
- `process_heat_produced` (NUMERIC, nullable): Process heat in MJ
- `latitude` (NUMERIC, nullable): Facility latitude
- `longitude` (NUMERIC, nullable): Facility longitude
- `location_address` (TEXT, nullable): Physical address
- `immutable` (BOOLEAN): Data immutability flag (default: true)
- `created_at` (TIMESTAMPTZ): Creation timestamp

**Indexes:**
- `idx_scada_facility_id` on `facility_id`
- `idx_scada_timestamp` on `timestamp DESC`
- `idx_scada_facility_timestamp` on `(facility_id, timestamp DESC)`

**Important:** SCADA measurements are immutable once recorded for audit compliance.

### emissions_data

Calculated emissions data from SCADA measurements.

**Columns:**
- `id` (UUID, PK): Unique identifier
- `scada_measurement_id` (UUID, FK): Linked SCADA measurement
- `methane_destroyed` (NUMERIC): Methane destroyed in m³
- `co2_equivalent` (NUMERIC): CO₂ equivalent in tonnes
- `global_warming_potential` (NUMERIC): GWP factor (typically 28)
- `energy_produced` (NUMERIC): Energy in kWh or MJ
- `def_value` (NUMERIC): Default Emission Factor
- `gross_emissions_reduction` (NUMERIC): GER in tonnes CO₂eq
- `calculated_at` (TIMESTAMPTZ): Calculation timestamp
- `standard_used` (TEXT): IPCC standard (ACM0022, AM0053, AMS-I.D)
- `created_at` (TIMESTAMPTZ): Creation timestamp

**Indexes:**
- `idx_emissions_scada_id` on `scada_measurement_id`
- `idx_emissions_calculated_at` on `calculated_at DESC`
- `idx_emissions_standard` on `standard_used`

**Calculation Method:**
- CO₂ Equivalent = (Methane Destroyed × 0.657 kg/m³ / 1000) × GWP
- DEF = (Methane in tonnes × GWP) / Energy Produced
- GER = CO₂ Equivalent

### company_license_plates

Registered truck license plates per company.

**Columns:**
- `id` (UUID, PK): Unique identifier
- `company_id` (UUID, FK): Associated company
- `license_plate` (TEXT): License plate number (uppercase)
- `is_active` (BOOLEAN): Active status
- `created_at` (TIMESTAMPTZ): Registration timestamp
- `created_by` (UUID, FK, nullable): User who registered the plate

**Unique Constraint:** `(company_id, license_plate)`

**Indexes:**
- `idx_license_plates_company_id` on `company_id`
- `idx_license_plates_plate` on `license_plate`

## Relationships

```
companies (1) ─────< (N) users (company_id)
companies (1) ─────< (N) waste_jobs (company_id)
companies (1) ─────< (N) company_license_plates (company_id)

users (1) ─────< (N) waste_jobs (driver_id)
users (1) ─────< (N) users (created_by)

scada_measurements (1) ─────< (1) emissions_data (scada_measurement_id)
```

## Sample Queries

### Get all waste jobs for a company with driver names

```sql
SELECT 
  wj.id, wj.job_number, wj.waste_stream, wj.weighbridge_weight,
  wj.total_price, wj.status, wj.is_rejected,
  u.first_name || ' ' || u.last_name as driver_name,
  wj.created_at
FROM waste_jobs wj
LEFT JOIN users u ON u.id = wj.driver_id
WHERE wj.company_id = '550e8400-e29b-41d4-a716-446655440001'
ORDER BY wj.created_at DESC;
```

### Get monthly invoice totals for a company

```sql
SELECT 
  COUNT(*) as total_jobs,
  SUM(weighbridge_weight) as total_weight,
  SUM(total_price) as total_revenue,
  waste_stream
FROM waste_jobs
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001'
  AND created_at >= '2026-01-01'
  AND created_at < '2026-02-01'
  AND status = 'Approved'
  AND is_rejected = false
GROUP BY waste_stream;
```

### Get aggregated emissions data for a facility

```sql
SELECT 
  COUNT(*) as measurement_count,
  SUM(ed.co2_equivalent) as total_co2_equivalent,
  SUM(ed.gross_emissions_reduction) as total_ger,
  SUM(ed.energy_produced) as total_energy
FROM scada_measurements sm
JOIN emissions_data ed ON ed.scada_measurement_id = sm.id
WHERE sm.facility_id = 'nelson-brrp-01'
  AND sm.timestamp >= '2026-01-01'
  AND sm.timestamp < '2026-02-01';
```

### Validate license plate

```sql
SELECT 
  clp.company_id,
  c.name as company_name
FROM company_license_plates clp
JOIN companies c ON c.id = clp.company_id
WHERE clp.license_plate = 'ABC123'
  AND clp.is_active = true
  AND c.is_active = true
LIMIT 1;
```

## Maintenance

### Backup Database

```bash
pg_dump -U postgres -d brrpio -F c -f brrpio_backup.dump
```

### Restore Database

```bash
pg_restore -U postgres -d brrpio -c brrpio_backup.dump
```

### Reset Database (Development Only)

```bash
# Drop and recreate
psql -U postgres -c "DROP DATABASE IF EXISTS brrpio;"
psql -U postgres -c "CREATE DATABASE brrpio;"

# Reapply schema and seed
psql -U postgres -d brrpio -f schema.sql
psql -U postgres -d brrpio -f seed.sql
```

## Security Considerations

1. **Password Hashing**: All passwords must be hashed using bcrypt (cost factor 10+)
2. **SQL Injection**: Use parameterized queries in all API endpoints
3. **Role-Based Access**: Enforce permissions at both API and database levels
4. **Data Immutability**: SCADA measurements cannot be modified after creation
5. **Connection Pooling**: Limit max connections to prevent resource exhaustion

## Environment Variables

Required environment variables:

```env
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=development|production
```

## Troubleshooting

### Error: "gen_random_uuid() does not exist"

**Solution:** Enable the pgcrypto extension or use PostgreSQL 13+

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

Then change UUID defaults in schema.sql:
```sql
DEFAULT gen_random_uuid()  -- becomes
DEFAULT uuid_generate_v4()  -- for older PostgreSQL versions
```

### Error: "relation already exists"

**Solution:** The schema uses `CREATE TABLE IF NOT EXISTS` so this shouldn't happen. If it does, you may need to drop and recreate:

```sql
DROP TABLE IF EXISTS waste_jobs CASCADE;
-- Then rerun schema.sql
```

### Performance Issues

**Solutions:**
1. Ensure indexes are created (check with `\di` in psql)
2. Analyze tables: `ANALYZE waste_jobs;`
3. Consider partitioning waste_jobs by created_at for large datasets
4. Adjust connection pool settings in `src/lib/db.ts`

## Next Steps

After setting up the database:

1. Configure `DATABASE_URL` in `.env.local`
2. Test database connection: `npm run dev` and check server logs
3. Test API endpoints using the examples in `API_ENHANCED.md`
4. Review permissions in `src/services/permissions.ts`
5. Customize waste stream pricing in `src/services/wasteJobs.ts`

For API documentation, see `API_ENHANCED.md`.
