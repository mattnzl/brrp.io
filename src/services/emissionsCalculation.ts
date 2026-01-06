import { EmissionsData, IPCCStandard, SCADAMeasurement } from '../types';

/**
 * Emissions Calculation Service
 * Implements IPCC standards for calculating CO2 equivalents from methane destruction
 */

export class EmissionsCalculationService {
  // Global Warming Potential for methane (IPCC AR5 value)
  private static readonly METHANE_GWP = 28; // 100-year time horizon
  
  // Methane density (kg/m³) at standard conditions
  private static readonly METHANE_DENSITY = 0.657;
  
  // CO2 density (kg/m³) at standard conditions
  private static readonly CO2_DENSITY = 1.98;

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
    const co2Equivalent = methaneTonnes * this.METHANE_GWP;
    
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
    gwp: number = this.METHANE_GWP
  ): number {
    if (energyProduced === 0) return 0;
    
    const methaneKg = methaneDestroyed * this.METHANE_DENSITY;
    const methaneTonnes = methaneKg / 1000;
    
    // DEF represents emission factor per unit of energy
    const def = (methaneTonnes * gwp) / energyProduced;
    
    return Number(def.toFixed(6));
  }

  /**
   * Calculate Gross Emissions Reduction (GER)
   * GER is the total CO2eq reduced through methane destruction
   * @param scadaData SCADA measurement data
   * @param standard IPCC standard to apply
   * @returns Emissions data with GER calculation
   */
  static calculateGER(
    scadaData: SCADAMeasurement,
    standard: IPCCStandard = IPCCStandard.ACM0022
  ): EmissionsData {
    const co2Equivalent = this.calculateCO2Equivalent(scadaData.methaneDestroyed);
    
    const energyProduced = scadaData.electricityProduced || 
                          (scadaData.processHeatProduced ? scadaData.processHeatProduced / 3.6 : 0);
    
    const defValue = this.calculateDEF(
      energyProduced,
      scadaData.methaneDestroyed,
      this.METHANE_GWP
    );
    
    // GER is the CO2 equivalent reduced
    const grossEmissionsReduction = co2Equivalent;
    
    const emissionsData: EmissionsData = {
      id: `EM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      scadaMeasurementId: scadaData.id,
      methaneDestroyed: scadaData.methaneDestroyed,
      co2Equivalent,
      globalWarmingPotential: this.METHANE_GWP,
      energyProduced,
      defValue,
      grossEmissionsReduction,
      calculatedAt: new Date(),
      standardUsed: standard,
    };
    
    return emissionsData;
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
    if (emissionsData.globalWarmingPotential < 28 || 
        emissionsData.globalWarmingPotential > 36) {
      errors.push('GWP value outside IPCC AR5 range (28-36)');
    }
    
    // Validate CO2 equivalent is positive
    if (emissionsData.co2Equivalent <= 0) {
      errors.push('CO2 equivalent must be positive');
    }
    
    // Validate GER equals CO2 equivalent for methane destruction
    if (Math.abs(emissionsData.grossEmissionsReduction - emissionsData.co2Equivalent) > 0.001) {
      errors.push('GER calculation mismatch');
    }
    
    // Standard-specific validations
    switch (standard) {
      case IPCCStandard.ACM0022:
        // Alternative waste treatment processes
        if (emissionsData.methaneDestroyed <= 0) {
          errors.push('ACM0022 requires positive methane destruction');
        }
        break;
        
      case IPCCStandard.AM0053:
        // Biogenic methane injection
        if (emissionsData.energyProduced <= 0) {
          errors.push('AM0053 requires positive energy production');
        }
        break;
        
      case IPCCStandard.AMS_I_D:
        // Grid connected renewable electricity
        if (emissionsData.energyProduced <= 0) {
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
}
