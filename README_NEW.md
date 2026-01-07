# BRRP.IO - Waste Tracking & Management System

**Bioresource Recovery Plant Input/Output System** - Comprehensive waste tracking, emissions monitoring, and energy production management.

## Overview

BRRP.IO is a complete waste management platform for tracking waste streams from weighbridge to invoice. The system integrates real-time SCADA emissions data, BRRP plant energy production metrics, and provides role-based access for administrators, waste company customers, and drivers.

### Core Objectives

1. **Quantify Waste Streams** - Track waste by type, volume, and value
2. **Weighbridge Integration** - Measure and record every load
3. **License Plate Management** - Track trucks and assign drivers
4. **Emissions Tracking** - Real-time SCADA data for CO₂ calculations
5. **Energy Production** - Monitor BRRP plant output over time
6. **Monthly Invoicing** - Automated billing for customers (e.g., WM NZ Ltd)
7. **Contamination Control** - Reject contaminated waste streams

## Key Features

### 🚛 Weighbridge Operations
- **Pre-registered Companies**: Waste companies registered in the system
- **License Plate Tracking**: Register and manage truck registrations
- **Driver Assignment**: Manually assign drivers to each job
- **Waste Stream Classification**: Multiple waste types with pricing
- **Gross/Tare/Net Weighing**: Accurate waste measurement
- **Contamination Rejection**: Flag and reject contaminated loads
- **Job Status Workflow**: WEIGHED → APPROVED/REJECTED → INVOICED

### 👥 User Roles & Access

#### Admin (God Privileges)
- Full system access
- View all companies, users, drivers, trucks
- Manage waste stream types and pricing
- **View energy production data** (NOT visible to customers)
- **View emissions data** (NOT visible to customers)
- Generate and manage invoices
- System configuration

#### Customer (Company User)
- Manage company trucks and license plates
- Manage company drivers
- View waste jobs and fees
- View monthly invoices
- **NO access to energy or emissions data**

#### Driver (Operational User)
- View assigned jobs
- Minimal interface for operational use

### 📊 SCADA Integration
- **REST API Endpoint**: Receive real-time emissions data
- **Methane Tracking**: Generated and destroyed volumes (m³)
- **CO₂ Equivalence**: Automatic calculation using GWP factor (28)
- **Emission Factors**: Based on waste stream type
- **GER Calculation**: Gross Emissions Reduction tracking
- **Linked to Jobs**: Connect emissions to specific weighbridge jobs

### ⚡ Energy Production Tracking (Admin Only)
- **REST API Endpoint**: Receive BRRP plant energy data
- **Electricity Generation**: kWh tracking over time
- **Process Heat**: MJ production monitoring
- **Time-Series Data**: Historical energy production
- **Summary Statistics**: Total, average, date ranges
- **Visibility**: Admin only - NOT shown to customers

### 💰 Invoicing System
- **Monthly Aggregation**: Automatic invoice generation
- **Job Linking**: All waste jobs linked to invoices
- **Fee Calculation**: Based on waste type, volume, and pricing
- **Customer-Specific**: Currently configured for WM NZ Ltd
- **Status Tracking**: DRAFT → ISSUED → PAID/OVERDUE
- **Customer View**: Customers can see their fees and invoices

### 🔬 Waste Stream Types

Pre-configured waste types with pricing and emission factors:
- **Cow Shed Waste**: $85/tonne, 0.12 CO₂eq factor
- **Food Waste**: $150/tonne, 0.64 CO₂eq factor
- **Green Waste**: $75/tonne, 0.18 CO₂eq factor
- **Spent Grain**: $65/tonne, 0.18 CO₂eq factor
- **Apple Pomace**: $70/tonne, 0.18 CO₂eq factor
- **Grape Marc**: $70/tonne, 0.18 CO₂eq factor
- **Fish Waste**: $120/tonne, 0.25 CO₂eq factor

## Technical Architecture

### Database Schema (PostgreSQL)

```
users                    → Admin, Customer, Driver roles
companies                → Pre-registered waste companies
drivers                  → Drivers assigned to companies
trucks                   → License plates managed by customers
waste_stream_types       → Types with pricing and emission factors
weighbridge_jobs         → Core tracking entity
emissions_data           → SCADA data (admin only)
energy_production        → BRRP plant data (admin only)
invoices                 → Monthly billing
audit_log                → System activity tracking
```

### REST API Endpoints

#### Weighbridge Jobs
- `POST /api/weighbridge-jobs` - Create new job
- `GET /api/weighbridge-jobs` - List jobs (filter by status, company)
- `GET /api/weighbridge-jobs/[id]` - Get job details
- `PATCH /api/weighbridge-jobs/[id]` - Update status, driver, contamination

#### Trucks (License Plates)
- `POST /api/trucks` - Register truck
- `GET /api/trucks` - List trucks (company-scoped)

#### Drivers
- `POST /api/drivers` - Add driver
- `GET /api/drivers` - List drivers (company-scoped)

#### SCADA Emissions (Admin Only)
- `POST /api/scada/emissions` - Receive emissions data from SCADA
- `GET /api/scada/emissions` - Retrieve emissions data

#### Energy Production (Admin Only)
- `POST /api/energy/production` - Receive energy data from BRRP plant
- `GET /api/energy/production` - Retrieve energy data with stats

### Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Database**: PostgreSQL 13+
- **Authentication**: Role-based (Admin, Customer, Driver)
- **APIs**: RESTful JSON endpoints
- **Emissions**: IPCC AR5 standards (GWP CH₄ = 28)

## Data Flow

```
Truck Arrival → Weighbridge → Job Creation → Driver Assignment
    ↓
Waste Measurement (Gross/Tare/Net) → Pricing Calculation
    ↓
Quality Check → Approval/Rejection (Contamination)
    ↓
SCADA System → Emissions Data → CO₂eq Calculation
    ↓
BRRP Plant → Energy Production Data (Admin View Only)
    ↓
Monthly Aggregation → Invoice Generation → Customer Billing
```

## Access Control Matrix

| Feature | Admin | Customer | Driver |
|---------|-------|----------|--------|
| View all companies | ✅ | ❌ | ❌ |
| Manage trucks | ✅ | ✅ (own company) | ❌ |
| Manage drivers | ✅ | ✅ (own company) | ❌ |
| Create weighbridge jobs | ✅ | ❌ | ❌ |
| View waste jobs & fees | ✅ | ✅ (own company) | ✅ (assigned) |
| View energy data | ✅ | **❌** | **❌** |
| View emissions data | ✅ | **❌** | **❌** |
| Manage invoices | ✅ | ✅ (view own) | ❌ |
| System configuration | ✅ | ❌ | ❌ |

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Set up database
createdb brrp_io
psql brrp_io < schema.sql

# Configure environment
cp .env.example .env
# Edit .env and set DATABASE_URL

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

### Database Setup

```bash
# Create database
createdb brrp_io

# Run schema
psql brrp_io < schema.sql

# Verify tables
psql brrp_io -c "\dt"
```

### Environment Variables

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/brrp_io
```

## Demo Credentials

**Admin (God Privileges)**
- Username: `admin`
- Password: (any)
- Access: Full system

**Customer (Waste Management NZ)**
- Username: `wmnz_customer`
- Password: (any)
- Access: Manage trucks, drivers, view fees (NO energy/emissions)

**Driver**
- Username: `driver1`
- Password: (any)
- Access: View assigned jobs

## API Integration Examples

### SCADA Emissions Data Submission

```bash
curl -X POST https://brrp.io/api/scada/emissions \
  -H "Content-Type: application/json" \
  -d '{
    "weighbridge_job_id": "uuid-here",
    "waste_volume_tonnes": 25.5,
    "waste_type": "FOOD_WASTE",
    "methane_generated_m3": 450.2,
    "methane_destroyed_m3": 448.1,
    "emission_factor": 0.64,
    "scada_source": "SCADA-MAIN"
  }'
```

### Energy Production Data Submission

```bash
curl -X POST https://brrp.io/api/energy/production \
  -H "Content-Type: application/json" \
  -d '{
    "electricity_kwh": 1250.5,
    "process_heat_mj": 850.2,
    "plant_source": "BRRP-NELSON",
    "data_source": "PLANT-SCADA"
  }'
```

## Emissions Calculation

**Methane to CO₂ Equivalent:**
```
Methane mass (tonnes) = Volume (m³) × Density (0.717 kg/m³) ÷ 1000
CO₂eq = Methane mass × GWP factor (28)
```

**Gross Emissions Reduction (GER):**
```
GER = CO₂eq from methane destruction + (Waste volume × Emission factor)
```

## Project Structure

```
brrp.io/
├── schema.sql                    # Database schema
├── src/
│   ├── types/
│   │   └── index.ts              # TypeScript definitions
│   ├── services/
│   │   └── auth.ts               # Authentication service
│   ├── lib/
│   │   └── db.ts                 # Database connection pool
│   ├── pages/
│   │   ├── login.tsx             # Login page
│   │   ├── admin.tsx             # Admin dashboard
│   │   ├── customer.tsx          # Customer portal
│   │   ├── driver.tsx            # Driver view
│   │   └── api/
│   │       ├── weighbridge-jobs/ # Weighbridge API
│   │       ├── trucks/           # Trucks API
│   │       ├── drivers/          # Drivers API
│   │       ├── scada/            # SCADA emissions API
│   │       └── energy/           # Energy production API
│   └── utils/
│       └── formatters.ts         # Utility functions
└── package.json
```

## Security Features

- **SQL Injection Prevention**: Parameterized queries
- **Role-Based Access Control**: Three-tier user system
- **Data Privacy**: Customers cannot see energy/emissions
- **Audit Logging**: Track all system actions
- **License Plate Uniqueness**: Prevent duplicate registrations

## Future Enhancements

- [ ] Real-time dashboard updates
- [ ] Mobile app for drivers
- [ ] Automated invoice email delivery
- [ ] Advanced analytics and reporting
- [ ] Integration with accounting systems
- [ ] Barcode/QR scanning for trucks
- [ ] GPS tracking integration
- [ ] Photo upload for contamination evidence

## License

ISC

## Contact

For questions about BRRP.IO, please contact the development team.

---

**BRRP.IO** - Transforming waste tracking into actionable intelligence.
