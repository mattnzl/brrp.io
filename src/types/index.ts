/**
 * Waste Input Data Types
 */

export enum WasteSourceType {
  SEWERAGE_SLUDGE = 'SEWERAGE_SLUDGE',
  LANDFILL_ORGANIC = 'LANDFILL_ORGANIC',
  FOOD_WASTE = 'FOOD_WASTE',
  GARDEN_WASTE = 'GARDEN_WASTE',
  GRAPE_MARC = 'GRAPE_MARC',
}

/**
 * Waste Job / Weighbridge Data Types
 */

export enum WasteStreamType {
  COW_SHED_WASTE = 'COW_SHED_WASTE',
  FOOD_WASTE = 'FOOD_WASTE',
  GREEN_WASTE = 'GREEN_WASTE',
  SPENT_GRAIN = 'SPENT_GRAIN',
  APPLE_POMACE = 'APPLE_POMACE',
  GRAPE_MARC = 'GRAPE_MARC',
  HOPS_RESIDUE = 'HOPS_RESIDUE',
  FISH_WASTE = 'FISH_WASTE',
}

export enum EnergyValue {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum NutrientValue {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface WasteStreamProperties {
  type: WasteStreamType;
  unitOfMeasure: string;
  standardPrice: number; // excl GST
  energyValue: EnergyValue;
  nutrientValue: NutrientValue;
}

export enum CustomerType {
  WASTE_MANAGEMENT_NZ = 'WASTE_MANAGEMENT_NZ',
  ENVIRONZ = 'ENVIRONZ',
}

export interface Customer {
  id: string;
  name: string;
  type: CustomerType;
  contactEmail?: string;
  contactPhone?: string;
}

export interface WasteJob {
  id: string;
  jobNumber: string;
  customer: Customer;
  wasteStream: WasteStreamType;
  truckRegistration: string;
  weighbridgeWeight: number; // in tonnes
  timestamp: Date;
  status: WasteJobStatus;
  totalPrice?: number; // calculated from weight * standardPrice
  notes?: string;
}

export enum WasteJobStatus {
  WEIGHED = 'WEIGHED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  INVOICED = 'INVOICED',
}

/**
 * Authentication and User Management Types
 */

export enum UserRole {
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
  COMPANY_ADMIN = 'COMPANY_ADMIN',
  OPERATOR = 'OPERATOR',
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  companyId?: string; // Only for Company Admin and Operator
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: Date;
  createdBy?: string; // User ID of creator
}

export interface Company {
  id: string;
  name: string;
  type: CustomerType;
  contactEmail: string;
  contactPhone: string;
  address?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface AuthSession {
  user: User;
  company?: Company; // Only for Company Admin and Operator
  token: string;
  expiresAt: Date;
}

export interface WasteSource {
  id: string;
  type: WasteSourceType;
  source: string; // Council or industry name
  location: GeoLocation;
  timestamp: Date;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface WasteInput {
  id: string;
  wasteSource: WasteSource;
  quantity: number; // in tonnes
  date: Date;
  processedBy: string; // Processing facility
  metadata?: Record<string, any>;
}

/**
 * SCADA Measurement Data Types
 */

export interface SCADAMeasurement {
  id: string;
  facilityId: string;
  timestamp: Date;
  wasteProcessed: number; // tonnes
  methaneGenerated: number; // cubic meters
  methaneDestroyed: number; // cubic meters
  electricityProduced?: number; // kWh
  processHeatProduced?: number; // MJ
  location: GeoLocation;
  immutable: boolean; // Once recorded, cannot be altered
}

/**
 * Emissions Calculation Types
 */

export interface EmissionsData {
  id: string;
  scadaMeasurementId: string;
  methaneDestroyed: number; // m³
  co2Equivalent: number; // tonnes CO2eq
  globalWarmingPotential: number; // GWP factor (typically 28-36 for methane)
  energyProduced: number; // kWh or MJ
  defValue: number; // Default Emission Factor value
  grossEmissionsReduction: number; // GER in tonnes CO2eq
  calculatedAt: Date;
  standardUsed: IPCCStandard;
}

export enum IPCCStandard {
  ACM0022 = 'ACM0022', // Alternative waste treatment processes
  AM0053 = 'AM0053', // Biogenic methane injection to a natural gas distribution grid
  AMS_I_D = 'AMS-I.D', // Grid connected renewable electricity generation
}

/**
 * Verification Standards
 */

export enum VerificationStandard {
  VERRA = 'VERRA',
  GOLD_STANDARD = 'GOLD_STANDARD',
  TOITU_EKOS = 'TOITU_EKOS',
}

export interface VerificationRecord {
  id: string;
  emissionsDataId: string;
  standard: VerificationStandard;
  verifiedBy: string; // Name of verification body
  verificationDate: Date;
  status: VerificationStatus;
  certificateUrl?: string;
  nextVerificationDue: Date; // Bi-annual verification
  notes?: string;
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

/**
 * Carbon Credit / NFT Types
 */

export interface CarbonCredit {
  id: string;
  tokenId: string; // NFT token ID
  emissionsDataId: string;
  verificationRecordId: string;
  units: number; // Number of tonnes CO2eq
  mintedAt: Date;
  blockchainAddress: string;
  registryId: string; // Open Earth register ID
  nationalCarbonBudgetValidated: boolean;
  status: CarbonCreditStatus;
  marketValue?: number; // Value in compliance market
  currency?: string;
}

export enum CarbonCreditStatus {
  MINTED = 'MINTED',
  AVAILABLE = 'AVAILABLE',
  SOLD = 'SOLD',
  OFFSET = 'OFFSET',
  DESTROYED = 'DESTROYED', // Destroyed after purchase to prevent reuse
}

export interface CarbonCreditTransaction {
  id: string;
  carbonCreditId: string;
  transactionType: TransactionType;
  buyerId?: string;
  sellerId?: string;
  amount: number;
  currency: string;
  timestamp: Date;
  blockchainTxHash: string;
}

export enum TransactionType {
  MINT = 'MINT',
  SALE = 'SALE',
  OFFSET = 'OFFSET',
  DESTROY = 'DESTROY',
}

/**
 * External Data Integration Types
 */

export interface MFEEmissionsData {
  id: string;
  category: string;
  defaultEmissionFactor: number;
  unit: string;
  lastUpdated: Date;
}

export interface WWTPStandardData {
  id: string;
  plantName: string;
  location: GeoLocation;
  capacity: number;
  emissionsPerformance: number;
  standardCompliance: string[];
  lastInspection: Date;
}

/**
 * Processing Pipeline Types
 */

export interface BRRPProcess {
  id: string;
  wasteInputId: string;
  processType: string;
  startTime: Date;
  endTime?: Date;
  status: ProcessStatus;
  methaneYield: number; // Expected or actual m³ per tonne
  energyOutput: number; // kWh or MJ
}

export enum ProcessStatus {
  QUEUED = 'QUEUED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}
