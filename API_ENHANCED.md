# BRRP.io API Documentation

## Overview

This document describes the API endpoints for the BRRP.io platform, including waste job management, license plate validation, SCADA data ingestion, and company management.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently, the API does not implement authentication. This should be added before production deployment using the User and AuthSession types defined in `src/types/index.ts`.

---

## Waste Jobs API

### Create Waste Job

**Endpoint:** `POST /api/waste-jobs`

**Description:** Create a new waste job from weighbridge input. Optionally validates license plate against registered companies.

**Request Body:**
```json
{
  "customer": {
    "id": "cust-wmnz",
    "name": "Waste Management NZ",
    "type": "WASTE_MANAGEMENT_NZ"
  },
  "wasteStream": "FOOD_WASTE",
  "truckRegistration": "ABC123",
  "weighbridgeWeight": 5.5,
  "notes": "Optional notes",
  "companyId": "uuid-of-company",
  "companyName": "Company Name",
  "driverId": "uuid-of-driver",
  "validateLicensePlate": true
}
```

**Response:**
```json
{
  "id": "uuid",
  "jobNumber": "WJ-20260106-001",
  "customerId": "cust-wmnz",
  "customerName": "Waste Management NZ",
  "customerType": "WASTE_MANAGEMENT_NZ",
  "wasteStream": "FOOD_WASTE",
  "truckRegistration": "ABC123",
  "weighbridgeWeight": 5.5,
  "status": "Pending Approval",
  "totalPrice": 1155.00,
  "notes": "Optional notes",
  "companyId": "uuid-of-company",
  "companyName": "Company Name",
  "driverId": "uuid-of-driver",
  "isRejected": false,
  "createdAt": "2026-01-06T23:00:00Z",
  "updatedAt": "2026-01-06T23:00:00Z"
}
```

**Waste Stream Types:**
- `COW_SHED_WASTE` - $210/tonne
- `FOOD_WASTE` - $210/tonne
- `GREEN_WASTE` - $210/tonne
- `SPENT_GRAIN` - $210/tonne
- `APPLE_POMACE` - $210/tonne
- `GRAPE_MARC` - $210/tonne
- `HOPS_RESIDUE` - $210/tonne
- `FISH_WASTE` - $260/tonne

### Get Waste Jobs

**Endpoint:** `GET /api/waste-jobs`

**Description:** Retrieve waste jobs with optional filtering by status and company.

**Query Parameters:**
- `status` (optional): Filter by status (`Pending Approval`, `Approved`, `Rejected`, or `All`)
- `companyId` (optional): Filter by company UUID
- `page` (optional, default: 1): Page number for pagination
- `perPage` (optional, default: 50, max: 100): Results per page

**Example:**
```
GET /api/waste-jobs?status=Pending%20Approval&companyId=uuid&page=1&perPage=20
```

**Response:**
```json
[
  {
    "id": "uuid",
    "jobNumber": "WJ-20260106-001",
    "customerId": "cust-wmnz",
    "customerName": "Waste Management NZ",
    "customerType": "WASTE_MANAGEMENT_NZ",
    "wasteStream": "FOOD_WASTE",
    "truckRegistration": "ABC123",
    "weighbridgeWeight": 5.5,
    "status": "Pending Approval",
    "totalPrice": 1155.00,
    "notes": "Optional notes",
    "companyId": "uuid-of-company",
    "companyName": "Company Name",
    "driverId": "uuid-of-driver",
    "driverName": "John Smith",
    "isRejected": false,
    "rejectionReason": null,
    "createdAt": "2026-01-06T23:00:00Z",
    "updatedAt": "2026-01-06T23:00:00Z"
  }
]
```

### Update Waste Job

**Endpoint:** `PATCH /api/waste-jobs/:id`

**Description:** Update a waste job's status, assign a driver, or mark as rejected.

**Request Body:**
```json
{
  "status": "Approved",
  "driverId": "uuid-of-driver"
}
```

**OR for rejection:**
```json
{
  "reject": true,
  "rejectionReason": "Contaminated with plastic"
}
```

**Response:**
```json
{
  "id": "uuid",
  "jobNumber": "WJ-20260106-001",
  "status": "Approved",
  "driverId": "uuid-of-driver",
  "driverName": "John Smith",
  "isRejected": false,
  "updatedAt": "2026-01-06T23:30:00Z",
  ...
}
```

**Valid Statuses:**
- `Pending Approval`
- `Approved`
- `Rejected`

---

## License Plates API

### Validate or Register License Plate

**Endpoint:** `POST /api/companies/license-plates`

**Description:** Validate if a license plate is registered to a company, or register a new license plate.

**Request Body (Validate):**
```json
{
  "action": "validate",
  "licensePlate": "ABC123"
}
```

**Response (Validate):**
```json
{
  "valid": true,
  "companyId": "uuid-of-company",
  "companyName": "Waste Management NZ"
}
```

**Request Body (Register):**
```json
{
  "action": "register",
  "licensePlate": "ABC123",
  "companyId": "uuid-of-company",
  "createdBy": "uuid-of-user"
}
```

**Response (Register):**
```json
{
  "id": "uuid",
  "companyId": "uuid-of-company",
  "licensePlate": "ABC123",
  "isActive": true
}
```

### Get Company License Plates

**Endpoint:** `GET /api/companies/license-plates?companyId={uuid}`

**Description:** Retrieve all license plates registered to a company.

**Query Parameters:**
- `companyId` (required): Company UUID

**Response:**
```json
[
  {
    "id": "uuid",
    "licensePlate": "ABC123",
    "isActive": true,
    "createdAt": "2026-01-06T23:00:00Z"
  }
]
```

---

## SCADA Data API

### Ingest SCADA Measurement

**Endpoint:** `POST /api/scada/ingest`

**Description:** Ingest real-time SCADA measurement data. Automatically calculates emissions data using IPCC standards.

**Request Body:**
```json
{
  "facilityId": "nelson-brrp-01",
  "timestamp": "2026-01-06T23:00:00Z",
  "wasteProcessed": 10.0,
  "methaneGenerated": 200.0,
  "methaneDestroyed": 180.0,
  "electricityProduced": 1200.0,
  "processHeatProduced": 4320.0,
  "location": {
    "latitude": -41.2706,
    "longitude": 173.2840,
    "address": "Nelson BRRP Facility, NZ"
  }
}
```

**Field Descriptions:**
- `facilityId`: Unique identifier for the BRRP facility
- `timestamp`: ISO 8601 timestamp of the measurement
- `wasteProcessed`: Amount of waste processed in tonnes
- `methaneGenerated`: Volume of methane generated in cubic meters (m³)
- `methaneDestroyed`: Volume of methane destroyed in cubic meters (m³)
- `electricityProduced`: Electricity generated in kilowatt-hours (kWh)
- `processHeatProduced`: Process heat generated in megajoules (MJ)
- `location`: Geographic location of the measurement

**Response:**
```json
{
  "id": "uuid",
  "facilityId": "nelson-brrp-01",
  "timestamp": "2026-01-06T23:00:00Z",
  "wasteProcessed": 10.0,
  "methaneGenerated": 200.0,
  "methaneDestroyed": 180.0,
  "electricityProduced": 1200.0,
  "processHeatProduced": 4320.0,
  "location": {
    "latitude": -41.2706,
    "longitude": 173.2840,
    "address": "Nelson BRRP Facility, NZ"
  },
  "emissionsDataId": "uuid-of-emissions-record"
}
```

**Validation Rules:**
- `wasteProcessed` must be > 0
- `methaneGenerated` must be >= 0
- `methaneDestroyed` must be >= 0
- `methaneDestroyed` cannot exceed `methaneGenerated`
- `electricityProduced` must be >= 0 (if provided)
- `processHeatProduced` must be >= 0 (if provided)

**Emissions Calculation:**

The API automatically calculates emissions data using the following methodology:

1. **CO₂ Equivalent** = (Methane Destroyed × Methane Density × GWP) / 1000
   - Methane Density: 0.657 kg/m³
   - GWP (Global Warming Potential): 28 (IPCC AR5, 100-year horizon)

2. **Default Emission Factor (DEF)** = (Methane in tonnes × GWP) / Energy Produced

3. **Gross Emissions Reduction (GER)** = CO₂ Equivalent

The emissions data is stored in the `emissions_data` table and linked to the SCADA measurement.

---

## Service Classes

### WasteJobsService

**Methods:**

- `getWasteStreamProperties()`: Get pricing and properties for all waste streams
- `calculatePrice(wasteStream, weight)`: Calculate total price for a waste job
- `assignDriver(jobId, driverId)`: Assign a driver to a waste job
- `rejectWasteJob(jobId, rejectionReason)`: Mark a waste job as rejected/contaminated
- `getJobsByCompany(companyId, options)`: Get waste jobs for a specific company with filtering
- `getMonthlyJobTotals(companyId, year, month)`: Get aggregated totals for monthly invoicing

### CompaniesService

**Methods:**

- `getAllCompanies()`: Get all active companies
- `getCompanyById(id)`: Get a specific company
- `createCompany(...)`: Create a new company
- `updateCompany(id, updates)`: Update company details
- `registerLicensePlate(companyId, licensePlate, createdBy)`: Register a license plate
- `validateLicensePlate(licensePlate)`: Check if a license plate is registered
- `getCompanyLicensePlates(companyId)`: Get all license plates for a company
- `deactivateLicensePlate(id)`: Deactivate a license plate

### SCADADataService

**Methods:**

- `ingestMeasurement(...)`: Ingest a SCADA measurement
- `calculateEmissions(scadaData, standard)`: Calculate emissions from SCADA data
- `getMeasurements(facilityId, startDate, endDate)`: Get measurements for a facility
- `getEmissionsData(scadaMeasurementId)`: Get emissions data for a measurement
- `getAggregatedEmissions(facilityId, startDate, endDate)`: Get aggregated emissions
- `validateMeasurement(data)`: Validate SCADA measurement data

### PermissionsService

**Methods:**

- `hasPermission(user, action, resourceOwnerId)`: Check if user has permission for an action
- `canViewEnergyData(user)`: Check if user can view energy/emissions data
- `canViewAllCompanies(user)`: Check if user can view all companies
- `canManageLicensePlates(user, companyId)`: Check if user can manage license plates
- `canCreateUser(user, targetRole)`: Check if user can create other users
- `getCompanyFilter(user)`: Get company ID filter for queries
- `filterSensitiveData(user, data)`: Remove sensitive data based on user role
- `canAccessCompanyData(user, companyId)`: Check if user can access company data
- `getAccessibleCompanyIds(user)`: Get list of accessible company IDs

---

## Permissions & Roles

### System Admin (SYSTEM_ADMIN)

**Full access to all data (God Mode):**
- View and manage all companies
- View and manage all users
- View all waste jobs across all companies
- View energy and emissions data
- View SCADA measurements
- Create companies and users
- Full system configuration

### Company Admin (COMPANY_ADMIN)

**Company-scoped access:**
- View and manage license plates for their company
- View waste jobs for their company
- View fees and invoices for their company
- Create operator users for their company
- **CANNOT** view energy/emissions data
- **CANNOT** view other companies' data

### Operator (OPERATOR)

**Limited company-scoped access:**
- View waste jobs for their company
- Create waste jobs for their company
- **CANNOT** update waste jobs
- **CANNOT** view energy/emissions data
- **CANNOT** manage license plates
- **CANNOT** create users

---

## Database Schema

### Tables Created

1. **companies** - Company/customer records
2. **users** - User accounts with roles
3. **waste_jobs** - Weighbridge waste jobs (enhanced with driver_id, is_rejected, rejection_reason)
4. **scada_measurements** - Real-time SCADA data (immutable)
5. **emissions_data** - Calculated emissions from SCADA measurements
6. **company_license_plates** - Registered trucks per company

### Key Relationships

- `waste_jobs.company_id` → `companies.id`
- `waste_jobs.driver_id` → `users.id`
- `users.company_id` → `companies.id`
- `emissions_data.scada_measurement_id` → `scada_measurements.id`
- `company_license_plates.company_id` → `companies.id`

---

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Detailed error description"
}
```

**Common HTTP Status Codes:**
- `200 OK` - Successful GET request
- `201 Created` - Successful POST request
- `400 Bad Request` - Invalid request data
- `404 Not Found` - Resource not found
- `405 Method Not Allowed` - HTTP method not supported
- `500 Internal Server Error` - Server error

---

## Examples

### Complete Weighbridge Workflow

**1. Validate License Plate**
```bash
curl -X POST http://localhost:3000/api/companies/license-plates \
  -H "Content-Type: application/json" \
  -d '{
    "action": "validate",
    "licensePlate": "ABC123"
  }'
```

**2. Create Waste Job with Validated Company**
```bash
curl -X POST http://localhost:3000/api/waste-jobs \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {
      "id": "cust-wmnz",
      "name": "Waste Management NZ",
      "type": "WASTE_MANAGEMENT_NZ"
    },
    "wasteStream": "FOOD_WASTE",
    "truckRegistration": "ABC123",
    "weighbridgeWeight": 5.5,
    "validateLicensePlate": true
  }'
```

**3. Assign Driver to Job**
```bash
curl -X PATCH http://localhost:3000/api/waste-jobs/{job-id} \
  -H "Content-Type: application/json" \
  -d '{
    "driverId": "uuid-of-driver"
  }'
```

**4. Approve Job**
```bash
curl -X PATCH http://localhost:3000/api/waste-jobs/{job-id} \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Approved"
  }'
```

**5. Or Reject Contaminated Waste**
```bash
curl -X PATCH http://localhost:3000/api/waste-jobs/{job-id} \
  -H "Content-Type: application/json" \
  -d '{
    "reject": true,
    "rejectionReason": "Contaminated with plastic materials"
  }'
```

### Monthly Invoice Data

```bash
# Get monthly totals for a company
# Implement via WasteJobsService.getMonthlyJobTotals(companyId, year, month)
```

---

## Future Enhancements

The following features are referenced but not yet fully implemented:

1. **Authentication & Session Management** - Use AuthSession type
2. **User Management API** - Create, read, update users
3. **Company Management API** - Full CRUD operations
4. **Invoicing API** - Generate and manage invoices
5. **Reporting API** - Advanced aggregations and exports
6. **Verification Records** - Track third-party verifications
7. **Carbon Credits** - NFT minting and lifecycle management
