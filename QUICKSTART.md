# BRRP.io Developer Quick Start

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- npm or yarn

### Setup Steps

1. **Clone and Install**
```bash
git clone https://github.com/mattnzl/brrp.io.git
cd brrp.io
npm install
```

2. **Database Setup**
```bash
# Create database
psql -U postgres -c "CREATE DATABASE brrpio;"

# Apply schema
psql -U postgres -d brrpio -f schema.sql

# Load sample data (optional)
psql -U postgres -d brrpio -f seed.sql
```

3. **Configure Environment**
Create `.env.local`:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/brrpio
```

4. **Run Development Server**
```bash
npm run dev
# Open http://localhost:3000
```

## Quick Reference

### Waste Job Workflow

```typescript
// 1. Validate license plate
POST /api/companies/license-plates
{
  "action": "validate",
  "licensePlate": "ABC123"
}

// 2. Create waste job
POST /api/waste-jobs
{
  "customer": { "id": "cust-wmnz", "name": "WM NZ", "type": "WASTE_MANAGEMENT_NZ" },
  "wasteStream": "FOOD_WASTE",
  "truckRegistration": "ABC123",
  "weighbridgeWeight": 5.5,
  "validateLicensePlate": true
}

// 3. Assign driver
PATCH /api/waste-jobs/{id}
{
  "driverId": "uuid-of-driver"
}

// 4. Approve or reject
PATCH /api/waste-jobs/{id}
{
  "status": "Approved"
}
// OR
{
  "reject": true,
  "rejectionReason": "Contaminated"
}
```

### SCADA Data Ingestion

```typescript
POST /api/scada/ingest
{
  "facilityId": "nelson-brrp-01",
  "timestamp": "2026-01-06T23:00:00Z",
  "wasteProcessed": 10.0,
  "methaneGenerated": 200.0,
  "methaneDestroyed": 180.0,
  "electricityProduced": 1200.0,
  "location": {
    "latitude": -41.2706,
    "longitude": 173.2840
  }
}
```

### Permissions Check

```typescript
import { PermissionsService } from './services/permissions';

// Check if user can view energy data
const canView = PermissionsService.canViewEnergyData(user);

// Filter sensitive data from response
const filtered = PermissionsService.filterSensitiveData(user, data);

// Check specific permission
const allowed = PermissionsService.hasPermission(user, 'view:waste_jobs', companyId);
```

## Service Layer

### WasteJobsService (Client-Safe)
```typescript
import { WasteJobsService } from './services/wasteJobs';

// Get pricing info
const properties = WasteJobsService.getWasteStreamProperties();

// Calculate price
const price = WasteJobsService.calculatePrice('FOOD_WASTE', 5.5); // $1,155

// Get waste stream name
const name = WasteJobsService.getWasteStreamName('FOOD_WASTE'); // "Food Waste"
```

### WasteJobsServerService (Server-Only)
```typescript
import { WasteJobsServerService } from './services/wasteJobsServer';

// Assign driver (API route only)
await WasteJobsServerService.assignDriver(jobId, driverId);

// Reject job (API route only)
await WasteJobsServerService.rejectWasteJob(jobId, "Contaminated");

// Get monthly totals (API route only)
const totals = await WasteJobsServerService.getMonthlyJobTotals(
  companyId,
  2026,
  1 // January
);
```

### CompaniesService
```typescript
import { CompaniesService } from './services/companies';

// Validate license plate
const result = await CompaniesService.validateLicensePlate("ABC123");
// { valid: true, companyId: "...", companyName: "..." }

// Register license plate
await CompaniesService.registerLicensePlate(companyId, "ABC123", userId);

// Get company license plates
const plates = await CompaniesService.getCompanyLicensePlates(companyId);
```

### SCADADataService
```typescript
import { SCADADataService } from './services/scadaData';

// Ingest measurement
const measurement = await SCADADataService.ingestMeasurement(
  facilityId,
  timestamp,
  wasteProcessed,
  methaneGenerated,
  methaneDestroyed,
  electricityProduced
);

// Get aggregated emissions
const emissions = await SCADADataService.getAggregatedEmissions(
  facilityId,
  startDate,
  endDate
);
```

## Database Queries

### Get waste jobs for a company
```sql
SELECT 
  wj.id, wj.job_number, wj.waste_stream, wj.weighbridge_weight,
  wj.total_price, wj.status, wj.is_rejected,
  u.first_name || ' ' || u.last_name as driver_name
FROM waste_jobs wj
LEFT JOIN users u ON u.id = wj.driver_id
WHERE wj.company_id = $1
ORDER BY wj.created_at DESC;
```

### Monthly invoice totals
```sql
SELECT 
  waste_stream,
  COUNT(*) as job_count,
  SUM(weighbridge_weight) as total_weight,
  SUM(total_price) as total_revenue
FROM waste_jobs
WHERE company_id = $1
  AND created_at >= '2026-01-01'
  AND created_at < '2026-02-01'
  AND status = 'Approved'
  AND is_rejected = false
GROUP BY waste_stream;
```

### Validate license plate
```sql
SELECT 
  clp.company_id,
  c.name as company_name
FROM company_license_plates clp
JOIN companies c ON c.id = clp.company_id
WHERE clp.license_plate = $1
  AND clp.is_active = true
  AND c.is_active = true;
```

## User Roles

| Role | Permissions | Restrictions |
|------|-------------|--------------|
| **SYSTEM_ADMIN** | • Full access<br>• View all data<br>• Create companies/users<br>• View energy/emissions | None |
| **COMPANY_ADMIN** | • Manage license plates<br>• View company jobs<br>• View invoices<br>• Create operators | • Cannot view energy/emissions<br>• Cannot view other companies |
| **OPERATOR** | • View company jobs<br>• Create jobs | • Cannot update jobs<br>• Cannot view energy/emissions<br>• Cannot manage license plates |

## Waste Stream Pricing

| Waste Stream | Price (excl. GST) |
|--------------|------------------|
| Cow Shed Waste | $210/tonne |
| Food Waste | $210/tonne |
| Green Waste | $210/tonne |
| Spent Grain | $210/tonne |
| Apple Pomace | $210/tonne |
| Grape Marc | $210/tonne |
| Hops Residue | $210/tonne |
| Fish Waste | $260/tonne |

## Common Tasks

### Add a new company
```typescript
const company = await CompaniesService.createCompany(
  "New Company Ltd",
  CustomerType.WASTE_MANAGEMENT_NZ,
  "contact@newco.com",
  "+64 9 123 4567",
  "123 Main St, Auckland"
);
```

### Register a truck
```typescript
await CompaniesService.registerLicensePlate(
  companyId,
  "XYZ789",
  currentUserId
);
```

### Get monthly invoice
```typescript
const invoice = await WasteJobsServerService.getMonthlyJobTotals(
  companyId,
  2026,
  1 // January
);

console.log(`Total: $${invoice.totalRevenue}`);
console.log(`Jobs: ${invoice.totalJobs}`);
console.log(`Weight: ${invoice.totalWeight} tonnes`);
```

## Troubleshooting

### Build fails with "Module not found: Can't resolve 'pg'"
- Ensure you're only importing database services in API routes
- Use `WasteJobsService` (not `WasteJobsServerService`) in client code

### "gen_random_uuid() does not exist"
```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- OR upgrade to PostgreSQL 13+
```

### Database connection fails
- Check `DATABASE_URL` in `.env.local`
- Verify PostgreSQL is running
- Test connection: `psql $DATABASE_URL`

## Documentation

- **API Reference**: See `API_ENHANCED.md`
- **Database Setup**: See `DATABASE_SETUP.md`
- **Implementation Details**: See `IMPLEMENTATION_COMPLETE.md`

## Testing

### Run tests
```bash
npm test
```

### Manual testing with curl
```bash
# Create waste job
curl -X POST http://localhost:3000/api/waste-jobs \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {"id": "cust-wmnz", "name": "WM NZ", "type": "WASTE_MANAGEMENT_NZ"},
    "wasteStream": "FOOD_WASTE",
    "truckRegistration": "ABC123",
    "weighbridgeWeight": 5.5
  }'

# Get waste jobs
curl http://localhost:3000/api/waste-jobs?status=Pending%20Approval

# Validate license plate
curl -X POST http://localhost:3000/api/companies/license-plates \
  -H "Content-Type: application/json" \
  -d '{"action": "validate", "licensePlate": "ABC123"}'
```

## Next Steps

1. Review `API_ENHANCED.md` for complete API documentation
2. Load `seed.sql` to get sample data for testing
3. Explore the services in `src/services/`
4. Test API endpoints with Postman or curl
5. Implement authentication (use User and AuthSession types)

## Support

For issues or questions:
1. Check the documentation files
2. Review the code comments
3. Test with seed data
4. Consult the implementation summary

---

**Quick Links:**
- [API Documentation](API_ENHANCED.md)
- [Database Setup](DATABASE_SETUP.md)
- [Implementation Summary](IMPLEMENTATION_COMPLETE.md)
