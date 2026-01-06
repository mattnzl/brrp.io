# BRRP.IO Waste Tracking System - Deployment Guide

## Quick Start

### 1. Database Setup

```bash
# Install PostgreSQL (if not already installed)
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql
brew services start postgresql

# Create database
createdb brrp_io

# Run schema
psql brrp_io < schema.sql

# Verify tables created
psql brrp_io -c "\dt"
```

### 2. Environment Configuration

```bash
# Create .env.local file
cat > .env.local << EOF
DATABASE_URL=postgresql://localhost:5432/brrp_io
NODE_ENV=development
EOF
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Test Credentials

### Admin (God Privileges)
- Username: `admin`
- Password: (any password)
- Access: Full system including energy and emissions data

### Customer (Waste Management NZ)
- Username: `wmnz_customer`
- Password: (any password)
- Access: Manage trucks/drivers, view fees (NO energy/emissions)

### Driver
- Username: `driver1`
- Password: (any password)
- Access: View assigned jobs

---

## Testing the APIs

### 1. Create a Truck

```bash
curl -X POST http://localhost:3000/api/trucks \
  -H "Content-Type: application/json" \
  -d '{
    "license_plate": "ABC123",
    "company_id": "company-wmnz-001",
    "make": "Volvo",
    "model": "FH16",
    "year": 2020,
    "capacity_tonnes": 30
  }'
```

### 2. Create a Driver

```bash
curl -X POST http://localhost:3000/api/drivers \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": "company-wmnz-001",
    "first_name": "John",
    "last_name": "Doe",
    "driver_license_number": "DL123456",
    "phone": "+64 21 555 0123"
  }'
```

### 3. Get Waste Stream Types

```bash
psql brrp_io -c "SELECT id, name, price_per_unit, emission_factor FROM waste_stream_types;"
```

### 4. Create a Weighbridge Job

```bash
# Get truck_id and waste_stream_type_id from previous queries
curl -X POST http://localhost:3000/api/weighbridge-jobs \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": "company-wmnz-001",
    "truck_id": "TRUCK_ID_HERE",
    "waste_stream_type_id": "WASTE_TYPE_ID_HERE",
    "tare_weight": 12.5,
    "gross_weight": 37.8,
    "unit_price": 150,
    "notes": "First test load"
  }'
```

### 5. Submit SCADA Emissions Data

```bash
curl -X POST http://localhost:3000/api/scada/emissions \
  -H "Content-Type: application/json" \
  -d '{
    "waste_volume_tonnes": 25.3,
    "waste_type": "FOOD_WASTE",
    "methane_generated_m3": 450.2,
    "methane_destroyed_m3": 448.1,
    "emission_factor": 0.64,
    "scada_source": "SCADA-TEST"
  }'
```

### 6. Submit Energy Production Data

```bash
curl -X POST http://localhost:3000/api/energy/production \
  -H "Content-Type: application/json" \
  -d '{
    "electricity_kwh": 1250.5,
    "process_heat_mj": 850.2,
    "plant_source": "BRRP-NELSON"
  }'
```

### 7. List Weighbridge Jobs

```bash
# All jobs
curl http://localhost:3000/api/weighbridge-jobs

# Filter by status
curl "http://localhost:3000/api/weighbridge-jobs?status=WEIGHED"

# Filter by company
curl "http://localhost:3000/api/weighbridge-jobs?company_id=company-wmnz-001"
```

### 8. Update Job Status

```bash
# Approve a job
curl -X PATCH http://localhost:3000/api/weighbridge-jobs/JOB_ID_HERE \
  -H "Content-Type: application/json" \
  -d '{
    "status": "APPROVED"
  }'

# Reject contaminated load
curl -X PATCH http://localhost:3000/api/weighbridge-jobs/JOB_ID_HERE \
  -H "Content-Type: application/json" \
  -d '{
    "is_contaminated": true,
    "rejection_reason": "Contamination detected: plastic materials found in organic waste"
  }'
```

---

## Database Queries

### View All Data

```bash
# Companies
psql brrp_io -c "SELECT * FROM companies;"

# Trucks
psql brrp_io -c "SELECT * FROM trucks;"

# Drivers
psql brrp_io -c "SELECT * FROM drivers;"

# Waste Stream Types
psql brrp_io -c "SELECT * FROM waste_stream_types;"

# Weighbridge Jobs
psql brrp_io -c "SELECT * FROM weighbridge_jobs ORDER BY created_at DESC LIMIT 10;"

# Emissions Data (Admin only)
psql brrp_io -c "SELECT * FROM emissions_data ORDER BY created_at DESC LIMIT 10;"

# Energy Production (Admin only)
psql brrp_io -c "SELECT * FROM energy_production ORDER BY reading_timestamp DESC LIMIT 10;"
```

### Useful Analytics Queries

```bash
# Company waste summary
psql brrp_io -c "SELECT * FROM v_company_waste_summary;"

# Waste stream analytics
psql brrp_io -c "SELECT * FROM v_waste_stream_analytics;"

# Total CO2 reduced
psql brrp_io -c "SELECT SUM(co2_equivalent_tonnes) as total_co2_reduced FROM emissions_data;"

# Total energy produced
psql brrp_io -c "SELECT SUM(electricity_kwh) as total_kwh, SUM(process_heat_mj) as total_mj FROM energy_production;"
```

---

## Common Issues & Solutions

### Database Connection Error

**Error:** `DATABASE_URL environment variable is not set`

**Solution:**
```bash
# Create .env.local file
echo "DATABASE_URL=postgresql://localhost:5432/brrp_io" > .env.local
```

### PostgreSQL Not Running

**Ubuntu/Debian:**
```bash
sudo service postgresql start
```

**macOS:**
```bash
brew services start postgresql
```

### Port Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**
```bash
# Use different port
PORT=3001 npm run dev
```

### Schema Not Applied

**Issue:** Tables don't exist

**Solution:**
```bash
# Re-run schema
psql brrp_io < schema.sql
```

---

## Production Deployment Checklist

- [ ] Set up production PostgreSQL database
- [ ] Configure DATABASE_URL for production
- [ ] Update authentication to use real password hashing
- [ ] Add authentication middleware to API routes
- [ ] Set up SSL/TLS certificates
- [ ] Configure CORS for API endpoints
- [ ] Set up monitoring and logging
- [ ] Configure backups for database
- [ ] Add rate limiting to API endpoints
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure environment-specific settings
- [ ] Test SCADA integration endpoint
- [ ] Test BRRP plant energy endpoint
- [ ] Create API documentation for external systems
- [ ] Set up CI/CD pipeline
- [ ] Perform security audit
- [ ] Load testing with realistic data volumes

---

## API Documentation for External Systems

### SCADA Integration

**Endpoint:** `POST /api/scada/emissions`

**Required Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "weighbridge_job_id": "uuid-optional",
  "waste_volume_tonnes": 25.3,
  "waste_type": "FOOD_WASTE",
  "methane_generated_m3": 450.2,
  "methane_destroyed_m3": 448.1,
  "emission_factor": 0.64,
  "scada_source": "SCADA-MAIN"
}
```

**Response:**
```json
{
  "message": "Emissions data recorded successfully",
  "data": {
    "id": "uuid",
    "co2_equivalent_tonnes": 8.95,
    "gross_emissions_reduction": 25.19,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### BRRP Plant Integration

**Endpoint:** `POST /api/energy/production`

**Required Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "electricity_kwh": 1250.5,
  "process_heat_mj": 850.2,
  "period_start": "2024-01-15T00:00:00Z",
  "period_end": "2024-01-15T23:59:59Z",
  "plant_source": "BRRP-NELSON",
  "data_source": "PLANT-SCADA"
}
```

**Response:**
```json
{
  "message": "Energy production data recorded successfully",
  "data": {
    "id": "uuid",
    "reading_timestamp": "2024-01-15T10:35:00Z",
    "created_at": "2024-01-15T10:35:00Z"
  }
}
```

---

## Support

For technical support or questions:
- Check the README_NEW.md for comprehensive documentation
- Review the schema.sql for database structure
- Inspect API files in src/pages/api/ for endpoint details

---

**BRRP.IO** - Your complete waste tracking solution.
