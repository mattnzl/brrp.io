/**
 * Waste Input Data Types
 */

export enum WasteSourceType {
  SEWERAGE_SLUDGE = 'SEWERAGE_SLUDGE',
  LANDFILL_ORGANIC = 'LANDFILL_ORGANIC',
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
