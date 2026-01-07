import { EmissionsData, IPCCStandard, SCADAMeasurement } from '../types';

/**
 * Emissions Calculation Service
 * Implements IPCC standards and Alimentary's methodology for carbon reporting
 * 
 * Framework Adherence:
 * - International Greenhouse Gas Protocol (Corporate Accounting and Reporting Standard)
 * - IPCC standards (via SeeGreen Solutions LLP collaboration)
 * - NZ Government MFE guidance (Measuring Emissions Guidance - August 2022)
 * 
 * Formula: E = Q × F
 * Where: E = Emissions reduction, Q = Quantity of waste, F = Emissions factor
 */

export class EmissionsCalculationService {
  // Global Warming Potential (100-year time horizon)
  private static readonly CO2_GWP = 1; // CO2 baseline
  private static readonly CH4_GWP = 28; // Methane (IPCC AR5)
  
  // Methane density (kg/m³) at standard conditions
  private static readonly METHANE_DENSITY = 0.657;
  
  // CO2 density (kg/m³) at standard conditions
  private static readonly CO2_DENSITY = 1.98;
  
  /**
   * MFE Emission Factors for Organic Waste (August 2022, Table 34, Page 25)
   * Units: tonnes CO2eq per tonne of waste
   */
  private static readonly EMISSION_FACTORS = {
    FOOD_WASTE: 0.64, // tonnes CO2eq/tonne
    GARDEN_WASTE: 0.18, // tonnes CO2eq/tonne
    SEWAGE_SLUDGE: 0.12, // tonnes CO2eq/tonne
    GRAPE_MARC: 0.18, // Assumed equal to garden waste (requires lab testing for specific factor)
    ANAEROBIC_DIGESTION: 0.05, // Process emission factor
  };
  
  /**
   * BRRP Configuration - Nelson Tech Demonstrator
   */
  private static readonly BRRP_CONFIG = {
    DAILY_FEEDSTOCK: 10, // tonnes/day total
    SEWAGE_SLUDGE_DAILY: 3, // tonnes/day from Nelson WWTP (Bell Island)
    GREEN_WASTE_DAILY: 7, // tonnes/day municipal green waste
    ELECTRICITY_SURPLUS: 1200, // kWh/day estimated surplus
  };

  /**
   * Calculate emissions reduction from waste processing using MFE methodology
   * Formula: E = Q × F
   * @param quantity Quantity of waste processed (tonnes)
   * @param wasteType Type of waste
   * @returns Emissions reduction in tonnes CO2eq
   */
  static calculateEmissionsReduction(
    quantity: number,
    wasteType: 'FOOD_WASTE' | 'GARDEN_WASTE' | 'SEWAGE_SLUDGE' | 'GRAPE_MARC'
  ): number {
    const emissionFactor = this.EMISSION_FACTORS[wasteType];
    
    // E = Q × F
    // Emissions reduction = waste prevented from landfill × emission factor
    const emissionsReduction = quantity * emissionFactor;
    
    return Number(emissionsReduction.toFixed(3));
  }

  /**
   * Calculate CO2 equivalent from methane destruction
   * @param methaneDestroyed Volume of methane destroyed in cubic meters
   * @returns CO2 equivalent in tonnes
   */
  static calculateCO2Equivalent(methaneDestroyed: number): number {
    // Convert m³ to kg
    const methaneKg = methaneDestroyed * this.METHANE_DENSITY;
    
    // Convert to tonnes
    const methaneTonnes = methaneKg / 1000;
    
    // Apply GWP to get CO2eq
    const co2Equivalent = methaneTonnes * this.CH4_GWP;
    
    return Number(co2Equivalent.toFixed(3));
  }

  /**
   * Calculate Default Emission Factor (DEF) value
   * DEF = f(energy, methane, GWP)
   * @param energyProduced Energy produced in kWh
   * @param methaneDestroyed Methane destroyed in m³
   * @param gwp Global Warming Potential factor
   * @returns DEF value
   */
  static calculateDEF(
    energyProduced: number,
    methaneDestroyed: number,
    gwp: number = this.CH4_GWP
  ): number {
    if (energyProduced === 0) return 0;
    
    const methaneKg = methaneDestroyed * this.METHANE_DENSITY;
    const methaneTonnes = methaneKg / 1000;
    
    // DEF represents emission factor per unit of energy
    const def = (methaneTonnes * gwp) / energyProduced;
    
    return Number(def.toFixed(6));
  }

  /**
   * Calculate Gross Emissions Reduction (GER) using Alimentary methodology
   * GER represents emissions reduction achieved through waste diversion and processing
   * @param scadaData SCADA measurement data
   * @param standard IPCC standard to apply
   * @param wasteData Optional waste input data for complete emissions record
   * @returns Emissions data with GER calculation
   */
  static calculateGER(
    scadaData: SCADAMeasurement,
    standard: IPCCStandard = IPCCStandard.ACM0022,
    wasteData?: { volumeTonnes: number; type: string }
  ): EmissionsData {
    const co2Equivalent = this.calculateCO2Equivalent(scadaData.methaneDestroyed);
    
    const energyProduced = scadaData.electricityProduced || 
                          (scadaData.processHeatProduced ? scadaData.processHeatProduced / 3.6 : 0);
    
    const defValue = this.calculateDEF(
      energyProduced,
      scadaData.methaneDestroyed,
      this.CH4_GWP
    );
    
    // GER is the CO2 equivalent reduced through methane destruction
    // This represents emissions prevented by diverting waste from landfill
    const grossEmissionsReduction = co2Equivalent;
    
    const emissionsData: EmissionsData = {
      id: `EM-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      scadaMeasurementId: scadaData.id,
      
      // Waste input fields - use provided data or defaults for SCADA-only calculations
      wasteVolumeTonnes: wasteData?.volumeTonnes ?? 0,
      wasteType: wasteData?.type ?? 'UNKNOWN',
      
      // Methane data
      methaneDestroyed: scadaData.methaneDestroyed,
      methaneDestroyedM3: scadaData.methaneDestroyed,
      
      // Calculated emissions
      co2Equivalent,
      co2EquivalentTonnes: co2Equivalent,
      globalWarmingPotential: this.CH4_GWP,
      energyProduced,
      defValue,
      grossEmissionsReduction,
      
      // Metadata
      calculatedAt: new Date(),
      standardUsed: standard,
      createdAt: new Date(),
    };
    
    return emissionsData;
  }
  
  /**
   * Calculate total emissions reduction for BRRP daily operations
   * Based on Nelson Tech Demonstrator configuration
   * @param sewageSludgeQty Sewage sludge quantity (tonnes/day)
   * @param greenWasteQty Green waste quantity (tonnes/day)
   * @param grapeMarc Optional grape marc quantity during harvest season (tonnes/day)
   * @returns Total daily emissions reduction in tonnes CO2eq
   */
  static calculateBRRPDailyReduction(
    sewageSludgeQty: number = this.BRRP_CONFIG.SEWAGE_SLUDGE_DAILY,
    greenWasteQty: number = this.BRRP_CONFIG.GREEN_WASTE_DAILY,
    grapeMarc: number = 0
  ): {
    sewageSludgeReduction: number;
    greenWasteReduction: number;
    grapeMarcReduction: number;
    totalReduction: number;
    electricityProduced: number;
  } {
    // E = Q × F for each waste stream
    const sewageSludgeReduction = this.calculateEmissionsReduction(
      sewageSludgeQty,
      'SEWAGE_SLUDGE'
    );
    
    const greenWasteReduction = this.calculateEmissionsReduction(
      greenWasteQty,
      'GARDEN_WASTE'
    );
    
    const grapeMarcReduction = grapeMarc > 0
      ? this.calculateEmissionsReduction(grapeMarc, 'GRAPE_MARC')
      : 0;
    
    const totalReduction = sewageSludgeReduction + greenWasteReduction + grapeMarcReduction;
    
    return {
      sewageSludgeReduction,
      greenWasteReduction,
      grapeMarcReduction,
      totalReduction,
      electricityProduced: this.BRRP_CONFIG.ELECTRICITY_SURPLUS,
    };
  }

  /**
   * Validate emissions data against IPCC standards
   * @param emissionsData Emissions data to validate
   * @param standard IPCC standard to validate against
   * @returns Validation result
   */
  static validateAgainstStandard(
    emissionsData: EmissionsData,
    standard: IPCCStandard
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate GWP is within acceptable range (IPCC AR5: 28-36)
    if (emissionsData.globalWarmingPotential !== undefined && 
        (emissionsData.globalWarmingPotential < 28 || 
         emissionsData.globalWarmingPotential > 36)) {
      errors.push('GWP value outside IPCC AR5 range (28-36)');
    }
    
    // Validate CO2 equivalent is positive
    if (emissionsData.co2Equivalent !== undefined && 
        emissionsData.co2Equivalent <= 0) {
      errors.push('CO2 equivalent must be positive');
    }
    
    // Validate GER equals CO2 equivalent for methane destruction
    if (emissionsData.grossEmissionsReduction !== undefined && 
        emissionsData.co2Equivalent !== undefined &&
        Math.abs(emissionsData.grossEmissionsReduction - emissionsData.co2Equivalent) > 0.001) {
      errors.push('GER calculation mismatch');
    }
    
    // Standard-specific validations
    switch (standard) {
      case IPCCStandard.ACM0022:
        // Alternative waste treatment processes
        if (emissionsData.methaneDestroyed !== undefined && 
            emissionsData.methaneDestroyed <= 0) {
          errors.push('ACM0022 requires positive methane destruction');
        }
        break;
        
      case IPCCStandard.AM0053:
        // Biogenic methane injection
        if (emissionsData.energyProduced !== undefined && 
            emissionsData.energyProduced <= 0) {
          errors.push('AM0053 requires positive energy production');
        }
        break;
        
      case IPCCStandard.AMS_I_D:
        // Grid connected renewable electricity
        if (emissionsData.energyProduced !== undefined && 
            emissionsData.energyProduced <= 0) {
          errors.push('AMS-I.D requires electricity generation');
        }
        break;
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate methane generation potential from waste input
   * @param wasteQuantity Quantity of waste in tonnes
   * @param wasteType Type of waste (affects methane yield)
   * @returns Estimated methane generation in m³
   */
  static estimateMethaneGeneration(
    wasteQuantity: number,
    wasteType: 'SEWERAGE_SLUDGE' | 'LANDFILL_ORGANIC'
  ): number {
    // Typical methane yields (m³/tonne of waste)
    const yields = {
      SEWERAGE_SLUDGE: 20, // ~20 m³/tonne
      LANDFILL_ORGANIC: 100, // ~100 m³/tonne
    };
    
    return wasteQuantity * yields[wasteType];
  }
  
  /**
   * Get MFE emission factor for a specific waste type
   * Reference: MFE Measuring Emissions Guidance - August 2022, Table 34, Page 25
   * @param wasteType Type of waste
   * @returns Emission factor in tonnes CO2eq per tonne of waste
   */
  static getMFEEmissionFactor(
    wasteType: 'FOOD_WASTE' | 'GARDEN_WASTE' | 'SEWAGE_SLUDGE' | 'GRAPE_MARC' | 'ANAEROBIC_DIGESTION'
  ): number {
    return this.EMISSION_FACTORS[wasteType];
  }
  
  /**
   * Get BRRP configuration parameters
   * @returns BRRP configuration object
   */
  static getBRRPConfig() {
    return { ...this.BRRP_CONFIG };
  }
}
