# BRRP.IO API Documentation

## Services Overview

BRRP.IO provides a comprehensive set of services for managing the waste-to-methane carbon credit lifecycle.

## Core Services

### 1. Emissions Calculation Service

**Purpose**: Calculate CO2 equivalents from methane destruction following IPCC standards.

#### Methods

##### `calculateCO2Equivalent(methaneDestroyed: number): number`
Calculate CO2 equivalent from methane destruction volume.

**Parameters**:
- `methaneDestroyed` (number): Volume of methane destroyed in cubic meters (m³)

**Returns**: CO2 equivalent in tonnes

**Example**:
```typescript
import { EmissionsCalculationService } from './services/emissionsCalculation';

const co2eq = EmissionsCalculationService.calculateCO2Equivalent(2485);
// Returns: 45.8 tonnes CO2eq
```

##### `calculateDEF(energyProduced: number, methaneDestroyed: number, gwp?: number): number`
Calculate Default Emission Factor value.

**Parameters**:
- `energyProduced` (number): Energy produced in kWh
- `methaneDestroyed` (number): Methane destroyed in m³
- `gwp` (number, optional): Global Warming Potential factor (default: 28)

**Returns**: DEF value

##### `calculateGER(scadaData: SCADAMeasurement, standard?: IPCCStandard): EmissionsData`
Calculate Gross Emissions Reduction from SCADA data.

**Parameters**:
- `scadaData` (SCADAMeasurement): SCADA measurement data
- `standard` (IPCCStandard, optional): IPCC standard to apply (default: ACM0022)

**Returns**: Complete emissions data with GER calculation

##### `validateAgainstStandard(emissionsData: EmissionsData, standard: IPCCStandard): ValidationResult`
Validate emissions data against IPCC standards.

##### `estimateMethaneGeneration(wasteQuantity: number, wasteType: string): number`
Estimate methane generation from waste input.

---

### 2. Carbon Credit Service

**Purpose**: Manage carbon credit lifecycle from minting to destruction.

#### Methods

##### `mintCarbonCredit(emissionsData: EmissionsData, verificationRecord: VerificationRecord): Promise<CarbonCredit>`
Mint a new carbon credit NFT.

**Parameters**:
- `emissionsData` (EmissionsData): Verified emissions data
- `verificationRecord` (VerificationRecord): Verification record (must have VERIFIED status)

**Returns**: Newly minted carbon credit

**Example**:
```typescript
import { CarbonCreditService } from './services/carbonCredit';

const carbonCredit = await CarbonCreditService.mintCarbonCredit(
  emissionsData,
  verificationRecord
);
// Returns: CarbonCredit with status MINTED
```

##### `makeAvailable(carbonCredit: CarbonCredit, marketValue: number, currency?: string): CarbonCredit`
Make carbon credit available for sale.

**Requirements**: 
- Credit must have status MINTED
- National carbon budget validation must be complete

##### `sellCarbonCredit(carbonCredit: CarbonCredit, buyerId: string, amount: number): Promise<CarbonCreditTransaction>`
Process carbon credit sale.

##### `offsetAndDestroy(carbonCredit: CarbonCredit, buyerId: string): Promise<CarbonCreditTransaction>`
Offset and permanently destroy carbon credit.

**Note**: This prevents double-counting and reuse of credits.

##### `validateAgainstNationalBudget(carbonCredit: CarbonCredit, nationalBudget: any): ValidationResult`
Validate credit against national carbon budget/NDC.

##### `syncToGlobalRegistry(carbonCredit: CarbonCredit): Promise<SyncResult>`
Sync carbon credit to Open Earth global registry.

---

### 3. Verification Service

**Purpose**: Handle third-party verification process.

#### Methods

##### `initiateVerification(emissionsData: EmissionsData, standard: VerificationStandard, verifier: string): VerificationRecord`
Start verification process.

**Parameters**:
- `emissionsData` (EmissionsData): Emissions data to verify
- `standard` (VerificationStandard): VERRA, GOLD_STANDARD, or TOITU_EKOS
- `verifier` (string): Name of verification body

**Returns**: Verification record with PENDING status

**Example**:
```typescript
import { VerificationService, VerificationStandard } from './services/verification';

const verification = VerificationService.initiateVerification(
  emissionsData,
  VerificationStandard.VERRA,
  'Verra International'
);
```

##### `updateVerificationStatus(verificationRecord: VerificationRecord, status: VerificationStatus, certificateUrl?: string, notes?: string): VerificationRecord`
Update verification status.

##### `isVerificationDue(verificationRecord: VerificationRecord): boolean`
Check if bi-annual verification is due.

##### `getVerificationRequirements(standard: VerificationStandard): string[]`
Get list of requirements for a verification standard.

##### `validateVerificationRecord(verificationRecord: VerificationRecord): ValidationResult`
Validate verification record completeness.

##### `generateVerificationReport(verificationRecord: VerificationRecord, emissionsData: EmissionsData): Report`
Generate comprehensive verification report.

---

### 4. Waste Processing Service

**Purpose**: Manage BRRP waste processing pipeline.

#### Methods

##### `startProcessing(wasteInput: WasteInput): BRRPProcess`
Start processing waste input.

**Parameters**:
- `wasteInput` (WasteInput): Waste input data

**Returns**: BRRP process record with status QUEUED

**Example**:
```typescript
import { WasteProcessingService } from './services/wasteProcessing';

const process = WasteProcessingService.startProcessing(wasteInput);
// Returns: BRRPProcess with estimated methane yield and energy output
```

##### `updateProcessStatus(process: BRRPProcess, status: ProcessStatus, actualMethaneYield?: number): BRRPProcess`
Update process status.

##### `getEfficiencyMetrics(process: BRRPProcess): EfficiencyMetrics`
Get process efficiency metrics.

---

### 5. External Data Service

**Purpose**: Integrate with external databases (MFE, WWTP, Open Earth).

#### Methods

##### `fetchMFEData(category: string): Promise<MFEEmissionsData | null>`
Fetch Ministry for the Environment default emissions data.

**Parameters**:
- `category` (string): Emissions category (e.g., 'waste-to-energy', 'landfill-methane')

**Returns**: MFE emissions data or null

**Example**:
```typescript
import { ExternalDataService } from './services/externalData';

const mfeData = await ExternalDataService.fetchMFEData('waste-to-energy');
// Returns: { defaultEmissionFactor: 0.45, unit: 'kg CO2eq/kWh', ... }
```

##### `fetchWWTPData(plantName: string): Promise<WWTPStandardData | null>`
Fetch wastewater treatment plant standards data.

##### `validateAgainstMFE(actualEmissions: number, category: string): Promise<ValidationResult>`
Validate emissions against MFE standards.

##### `getWWTPCompliance(plantName: string): Promise<ComplianceStatus>`
Get WWTP compliance status.

##### `syncToOpenEarth(data: any): Promise<SyncResult>`
Sync data to Open Earth register.

##### `validateNationalCarbonBudget(co2Equivalent: number, country?: string): Promise<ValidationResult>`
Validate against national carbon budget/NDC.

---

### 6. Waste Jobs Service

**Purpose**: Manage waste job creation from weighbridge input.

#### Methods

##### `getWasteStreamProperties(): Record<WasteStreamType, WasteStreamProperties>`
Get waste stream properties including pricing.

**Returns**: Map of waste stream types to their properties

**Example**:
```typescript
import { WasteJobsService } from './services/wasteJobs';

const properties = WasteJobsService.getWasteStreamProperties();
// Returns: { COW_SHED_WASTE: { standardPrice: 210, ... }, ... }
```

##### `getWasteStreamName(type: WasteStreamType): string`
Get friendly name for waste stream type.

##### `createWasteJob(customer: Customer, wasteStream: WasteStreamType, truckRegistration: string, weighbridgeWeight: number, notes?: string): WasteJob`
Create a new waste job from weighbridge input.

**Parameters**:
- `customer` (Customer): Customer information
- `wasteStream` (WasteStreamType): Type of waste stream
- `truckRegistration` (string): Truck registration number
- `weighbridgeWeight` (number): Weight in tonnes
- `notes` (string, optional): Additional notes

**Returns**: Newly created waste job with auto-generated job number and calculated price

##### `calculatePrice(wasteStream: WasteStreamType, weight: number): number`
Calculate total price for a waste job.

##### `updateJobStatus(job: WasteJob, status: WasteJobStatus): WasteJob`
Update waste job status.

##### `getAvailableCustomers(): Customer[]`
Get all available customers.

---

## REST API Endpoints

### Waste Jobs API

#### POST /api/waste-jobs
Create a new waste job.

**Request Body**:
```json
{
  "customer": {
    "id": "cust-wmnz",
    "name": "Waste Management NZ",
    "type": "WASTE_MANAGEMENT_NZ"
  },
  "wasteStream": "COW_SHED_WASTE",
  "truckRegistration": "ABC123",
  "weighbridgeWeight": 25.5,
  "notes": "Optional notes",
  "companyId": "comp-001",
  "companyName": "Aliminary"
}
```

**Response** (201 Created):
```json
{
  "id": "uuid-here",
  "jobNumber": "WJ-1704537600-ABC12",
  "customerId": "cust-wmnz",
  "customerName": "Waste Management NZ",
  "customerType": "WASTE_MANAGEMENT_NZ",
  "wasteStream": "COW_SHED_WASTE",
  "truckRegistration": "ABC123",
  "weighbridgeWeight": 25.5,
  "status": "Pending Approval",
  "totalPrice": 5355.00,
  "notes": "Optional notes",
  "companyId": "comp-001",
  "companyName": "Aliminary",
  "createdAt": "2024-01-06T12:00:00.000Z"
}
```

**Error Responses**:
- `400 Bad Request`: Missing required fields or invalid data
- `500 Internal Server Error`: Database or server error

#### GET /api/waste-jobs
List waste jobs with optional filtering and pagination.

**Query Parameters**:
- `status` (string, optional): Filter by status (e.g., "Pending Approval", "Approved", "Rejected")
- `companyId` (string, optional): Filter by company ID
- `page` (number, optional): Page number (default: 1)
- `perPage` (number, optional): Results per page (default: 50, max: 100)

**Response** (200 OK):
```json
[
  {
    "id": "uuid-here",
    "jobNumber": "WJ-1704537600-ABC12",
    "customerId": "cust-wmnz",
    "customerName": "Waste Management NZ",
    "customerType": "WASTE_MANAGEMENT_NZ",
    "wasteStream": "COW_SHED_WASTE",
    "truckRegistration": "ABC123",
    "weighbridgeWeight": 25.5,
    "status": "Pending Approval",
    "totalPrice": 5355.00,
    "notes": "Optional notes",
    "companyId": "comp-001",
    "companyName": "Aliminary",
    "createdAt": "2024-01-06T12:00:00.000Z"
  }
]
```

**Example Requests**:
```bash
# Get all waste jobs
GET /api/waste-jobs

# Get pending jobs
GET /api/waste-jobs?status=Pending%20Approval

# Get jobs for a specific company
GET /api/waste-jobs?companyId=comp-001

# Get paginated results
GET /api/waste-jobs?page=2&perPage=25
```

#### PATCH /api/waste-jobs/[id]
Update a waste job's status.

**URL Parameters**:
- `id` (string): Waste job UUID

**Request Body**:
```json
{
  "status": "Approved"
}
```

**Response** (200 OK):
```json
{
  "id": "uuid-here",
  "jobNumber": "WJ-1704537600-ABC12",
  "customerId": "cust-wmnz",
  "customerName": "Waste Management NZ",
  "customerType": "WASTE_MANAGEMENT_NZ",
  "wasteStream": "COW_SHED_WASTE",
  "truckRegistration": "ABC123",
  "weighbridgeWeight": 25.5,
  "status": "Approved",
  "totalPrice": 5355.00,
  "notes": "Optional notes",
  "companyId": "comp-001",
  "companyName": "Aliminary",
  "createdAt": "2024-01-06T12:00:00.000Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid status or missing fields
- `404 Not Found`: Waste job not found
- `500 Internal Server Error`: Database or server error

**Valid Status Values**:
- "Pending Approval"
- "Approved"
- "Rejected"

---

## Data Types

### Waste Jobs Types

#### `WasteStreamType`
```typescript
enum WasteStreamType {
  COW_SHED_WASTE = 'COW_SHED_WASTE',
  FOOD_WASTE = 'FOOD_WASTE',
  GREEN_WASTE = 'GREEN_WASTE',
  SPENT_GRAIN = 'SPENT_GRAIN',
  APPLE_POMACE = 'APPLE_POMACE',
  GRAPE_MARC = 'GRAPE_MARC',
  HOPS_RESIDUE = 'HOPS_RESIDUE',
  FISH_WASTE = 'FISH_WASTE',
}
```

#### `WasteJobStatus`
```typescript
enum WasteJobStatus {
  PENDING_APPROVAL = 'Pending Approval',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}
```

#### `CustomerType`
```typescript
enum CustomerType {
  WASTE_MANAGEMENT_NZ = 'WASTE_MANAGEMENT_NZ',
  ENVIRONZ = 'ENVIRONZ',
}
```

#### `WasteJob`
```typescript
interface WasteJob {
  id: string;
  jobNumber: string;
  customer: Customer;
  wasteStream: WasteStreamType;
  truckRegistration: string;
  weighbridgeWeight: number; // in tonnes
  timestamp: Date;
  status: WasteJobStatus;
  totalPrice?: number;
  notes?: string;
  companyId?: string;
  companyName?: string;
}
```

---

## Data Types

### Core Types

#### `WasteSourceType`
```typescript
enum WasteSourceType {
  SEWERAGE_SLUDGE = 'SEWERAGE_SLUDGE',
  LANDFILL_ORGANIC = 'LANDFILL_ORGANIC',
}
```

#### `IPCCStandard`
```typescript
enum IPCCStandard {
  ACM0022 = 'ACM0022',  // Alternative waste treatment processes
  AM0053 = 'AM0053',    // Biogenic methane injection
  AMS_I_D = 'AMS-I.D',  // Grid connected renewable electricity
}
```

#### `VerificationStandard`
```typescript
enum VerificationStandard {
  VERRA = 'VERRA',
  GOLD_STANDARD = 'GOLD_STANDARD',
  TOITU_EKOS = 'TOITU_EKOS',
}
```

#### `CarbonCreditStatus`
```typescript
enum CarbonCreditStatus {
  MINTED = 'MINTED',
  AVAILABLE = 'AVAILABLE',
  SOLD = 'SOLD',
  OFFSET = 'OFFSET',
  DESTROYED = 'DESTROYED',
}
```

### Data Structures

See `src/types/index.ts` for complete type definitions including:
- `WasteInput`
- `SCADAMeasurement`
- `EmissionsData`
- `VerificationRecord`
- `CarbonCredit`
- `CarbonCreditTransaction`
- `MFEEmissionsData`
- `WWTPStandardData`
- `BRRPProcess`

---

## Constants

### Emissions Calculation
- **Methane GWP**: 28 (IPCC AR5, 100-year time horizon)
- **Methane Density**: 0.657 kg/m³
- **CO2 Density**: 1.98 kg/m³

### Methane Yields
- **Sewerage Sludge**: ~20 m³/tonne
- **Landfill Organic**: ~100 m³/tonne

### Energy Conversion
- **Methane Energy Content**: ~10 kWh/m³
- **Conversion Efficiency**: ~35%

### Verification Cycle
- **Bi-annual Verification**: Every 6 months
- **MFE Tolerance**: ±15% variance acceptable

---

## Usage Examples

### Complete Workflow

```typescript
import {
  EmissionsCalculationService,
  CarbonCreditService,
  VerificationService,
  WasteProcessingService,
} from './services';

// 1. Process waste
const wasteInput = {
  id: 'WI-001',
  wasteSource: { type: 'SEWERAGE_SLUDGE', /* ... */ },
  quantity: 125.4,
  // ...
};

const process = WasteProcessingService.startProcessing(wasteInput);

// 2. Calculate emissions from SCADA data
const scadaData = {
  id: 'SCADA-001',
  methaneDestroyed: 2485,
  electricityProduced: 18640,
  // ...
};

const emissionsData = EmissionsCalculationService.calculateGER(scadaData);

// 3. Initiate verification
const verification = VerificationService.initiateVerification(
  emissionsData,
  VerificationStandard.VERRA,
  'Verra International'
);

// 4. Update verification status (when complete)
const verifiedRecord = VerificationService.updateVerificationStatus(
  verification,
  VerificationStatus.VERIFIED,
  'https://example.com/certificate.pdf'
);

// 5. Mint carbon credit
const carbonCredit = await CarbonCreditService.mintCarbonCredit(
  emissionsData,
  verifiedRecord
);

// 6. Make available for sale
const availableCredit = CarbonCreditService.makeAvailable(
  carbonCredit,
  1375,
  'NZD'
);

// 7. Purchase and offset
const transaction = await CarbonCreditService.offsetAndDestroy(
  availableCredit,
  'buyer-123'
);
```

---

## Error Handling

All service methods that can fail will throw descriptive errors:

```typescript
try {
  const carbonCredit = await CarbonCreditService.mintCarbonCredit(
    emissionsData,
    verificationRecord
  );
} catch (error) {
  if (error.message === 'Cannot mint carbon credit: Emissions data not verified') {
    // Handle unverified data
  }
}
```

---

## Best Practices

1. **Always validate** emissions data before verification
2. **Store SCADA data** as immutable, geolocated records
3. **Complete verification** before minting carbon credits
4. **Destroy credits** after offset to prevent double-counting
5. **Sync to registries** for transparency and compliance
6. **Regular verification** every 6 months as required

---

For more information, see the main README.md file.
