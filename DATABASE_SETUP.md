# Database Setup Guide

## Prerequisites

1. PostgreSQL 13+ installed and running
2. Node.js 18+ installed
3. npm installed

## Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set your database connection:

```
DATABASE_URL=postgresql://username:password@localhost:5432/brrp_io
```

**Example for local development:**
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/brrp_io
```

### 3. Create Database

If the database doesn't exist, create it:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE brrp_io;

# Exit
\q
```

### 4. Run Setup Script

The setup script will:
- Create all database tables (companies, users, drivers, trucks, waste streams, weighbridge jobs, etc.)
- Populate with realistic demo data
- Show a summary of loaded data

```bash
./setup-db.sh
```

Or manually:

```bash
# Create schema
psql "$DATABASE_URL" -f schema.sql

# Load seed data
psql "$DATABASE_URL" -f seed-data.sql
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Data Overview

The seed data includes:

### Companies (3)
- Waste Management NZ
- EnviroNZ
- GreenCycle Nelson

### Users (6)
- 1 System Admin (username: `admin`)
- 3 Company Admins (one per company)
- 2 Drivers

**Note:** All demo passwords are hashed with bcrypt. For testing, you'll need to implement proper authentication or temporarily use the auth service.

### Trucks (7)
Distributed across the three companies with various makes and models (Isuzu, Hino, Scania, Volvo, Mitsubishi).

### Drivers (4)
- 2 drivers with user accounts
- 2 drivers without user accounts (manual entry only)

### Waste Stream Types (7)
- Cow Shed Waste ($85/tonne)
- Food Waste ($150/tonne)
- Green Waste ($75/tonne)
- Spent Grain ($65/tonne)
- Apple Pomace ($70/tonne)
- Grape Marc ($70/tonne)
- Fish Waste ($120/tonne)

### Weighbridge Jobs (9)
- 7 approved jobs from recent days
- 2 jobs awaiting approval (WEIGHED status)
- 1 rejected job (contamination)

### Emissions Data
Automatically calculated for all approved jobs, including:
- Methane generation estimates
- CO2 equivalent calculations
- Gross Emissions Reduction (GER)

### Energy Production (30 days)
Daily energy production data for the last 30 days:
- Electricity: 1000-1400 kWh/day
- Process Heat: 2500-3500 MJ/day

## Pages and Features

### 1. Weighbridge Screen (`/weighbridge`)
**"Sell Screen" - Waste Arrival Point**

Where trucks arrive and waste is weighed:
- Select company and truck
- Optional driver assignment
- Choose waste stream type
- Enter tare and gross weight
- Auto-calculate net weight and estimated fee
- View recent deliveries
- Admin/Operator only access

### 2. Waste Jobs Management (`/waste-jobs`)
Legacy interface for waste job tracking (to be migrated to weighbridge interface).

### 3. Admin Dashboard (`/admin`)
System administration functions.

### 4. Login (`/login`)
Authentication entry point.

## API Endpoints

### Weighbridge Jobs
- `GET /api/weighbridge-jobs` - List weighbridge jobs (with filters)
- `POST /api/weighbridge-jobs` - Create new weighbridge job
- `GET /api/weighbridge-jobs/[id]` - Get specific job
- `PATCH /api/weighbridge-jobs/[id]` - Update job status

### Trucks
- `GET /api/trucks` - List trucks (filter by company_id)
- `POST /api/trucks` - Create new truck

### Drivers
- `GET /api/drivers` - List drivers (filter by company_id)
- `POST /api/drivers` - Create new driver

### Emissions Data
- `GET /api/scada/emissions` - Get emissions data (Admin only)
- `POST /api/scada/emissions` - Record emissions data (SCADA REST endpoint)

### Energy Production
- `GET /api/energy/production` - Get energy production data (Admin only)
- `POST /api/energy/production` - Record energy production (BRRP plant REST endpoint)

## Testing the System

### 1. Test Weighbridge Job Creation

```bash
curl -X POST http://localhost:3000/api/weighbridge-jobs \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "truck_id": "t1111111-1111-1111-1111-111111111111",
    "driver_id": "d1111111-1111-1111-1111-111111111111",
    "waste_stream_type_id": "SEE_DATABASE_FOR_ID",
    "tare_weight": 8.5,
    "gross_weight": 28.3,
    "unit_price": 85.00,
    "notes": "Test delivery"
  }'
```

### 2. Test Emissions Recording

```bash
curl -X POST http://localhost:3000/api/scada/emissions \
  -H "Content-Type: application/json" \
  -d '{
    "weighbridge_job_id": "JOB_ID_FROM_ABOVE",
    "waste_volume_tonnes": 19.8,
    "waste_type": "COW_SHED_WASTE",
    "methane_generated_m3": 1485.0,
    "methane_destroyed_m3": 1410.75,
    "emission_factor": 0.12,
    "scada_source": "BRRP-SCADA-REST-API-v1"
  }'
```

### 3. Verify Data Relationships

```sql
-- Connect to database
psql "$DATABASE_URL"

-- Check company summary with relationships
SELECT 
    c.name,
    COUNT(DISTINCT t.id) as trucks,
    COUNT(DISTINCT d.id) as drivers,
    COUNT(wj.id) as total_jobs,
    COALESCE(SUM(wj.net_weight), 0) as total_waste_tonnes,
    COALESCE(SUM(wj.total_price), 0) as total_revenue
FROM companies c
LEFT JOIN trucks t ON c.id = t.company_id
LEFT JOIN drivers d ON c.id = d.company_id
LEFT JOIN weighbridge_jobs wj ON c.id = wj.company_id
GROUP BY c.id, c.name
ORDER BY c.name;

-- Check emissions data linked to jobs
SELECT 
    wj.job_number,
    c.name as company,
    wj.net_weight,
    ed.methane_generated_m3,
    ed.co2_equivalent_tonnes,
    ed.gross_emissions_reduction
FROM weighbridge_jobs wj
INNER JOIN companies c ON wj.company_id = c.id
LEFT JOIN emissions_data ed ON wj.id = ed.weighbridge_job_id
WHERE wj.status = 'APPROVED'
ORDER BY wj.weighed_at DESC
LIMIT 10;
```

## Troubleshooting

### Database Connection Issues

If you get connection errors:

1. Check PostgreSQL is running:
   ```bash
   sudo systemctl status postgresql
   # or on macOS
   brew services list
   ```

2. Verify connection string:
   ```bash
   psql "$DATABASE_URL" -c "SELECT version();"
   ```

3. Check PostgreSQL logs for errors

### Schema Already Exists

If you need to reset the database:

```bash
# Drop all tables (WARNING: This deletes all data!)
psql "$DATABASE_URL" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Re-run setup
./setup-db.sh
```

### Missing UUID Extension

If you get errors about `gen_random_uuid()`:

```sql
-- Connect to database
psql "$DATABASE_URL"

-- For PostgreSQL < 13
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- For PostgreSQL >= 13 (built-in, no extension needed)
SELECT gen_random_uuid();
```

## Production Deployment

For production deployment, see:
- [DEPLOYMENT.md](DEPLOYMENT.md) - Full deployment guide
- [DEPLOYMENT_QUICK_START.md](DEPLOYMENT_QUICK_START.md) - Quick start guide

## Next Steps

1. Implement authentication flow
2. Add authorization middleware to API endpoints
3. Connect frontend pages to backend APIs
4. Implement invoice generation
5. Add SCADA integration for real-time data
6. Implement blockchain NFT minting for carbon credits
