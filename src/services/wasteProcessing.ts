import { BRRPProcess, ProcessStatus, WasteInput, WasteSourceType } from '../types';

/**
 * Waste Processing Service
 * Handles the BRRP (predefined) waste processing pipeline
 */

export class WasteProcessingService {
  /**
   * Start processing waste input
   * @param wasteInput Waste input to process
   * @returns BRRP process record
   */
  static startProcessing(wasteInput: WasteInput): BRRPProcess {
    // Calculate expected methane yield based on waste type
    const methaneYield = this.calculateMethaneYield(
      wasteInput.wasteSource.type,
      wasteInput.quantity
    );

    // Estimate energy output (kWh) - typical conversion efficiency ~35%
    const energyOutput = this.estimateEnergyOutput(methaneYield);

    const process: BRRPProcess = {
      id: `BP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      wasteInputId: wasteInput.id,
      processType: 'ANAEROBIC_DIGESTION',
      startTime: new Date(),
      status: ProcessStatus.QUEUED,
      methaneYield,
      energyOutput,
    };

    return process;
  }

  /**
   * Update process status
   * @param process Process to update
   * @param status New status
   * @param actualMethaneYield Actual methane yield (optional)
   * @returns Updated process
   */
  static updateProcessStatus(
    process: BRRPProcess,
    status: ProcessStatus,
    actualMethaneYield?: number
  ): BRRPProcess {
    const updates: Partial<BRRPProcess> = {
      status,
    };

    if (status === ProcessStatus.COMPLETED) {
      updates.endTime = new Date();
      if (actualMethaneYield !== undefined) {
        updates.methaneYield = actualMethaneYield;
        updates.energyOutput = this.estimateEnergyOutput(actualMethaneYield);
      }
    }

    return {
      ...process,
      ...updates,
    };
  }

  /**
   * Calculate expected methane yield from waste
   * @param wasteType Type of waste
   * @param quantity Quantity in tonnes
   * @returns Methane yield in m³
   */
  private static calculateMethaneYield(
    wasteType: WasteSourceType,
    quantity: number
  ): number {
    const yieldFactors = {
      [WasteSourceType.SEWERAGE_SLUDGE]: 20, // m³ per tonne
      [WasteSourceType.LANDFILL_ORGANIC]: 100, // m³ per tonne
    };

    return quantity * yieldFactors[wasteType];
  }

  /**
   * Estimate energy output from methane
   * @param methaneVolume Methane volume in m³
   * @returns Energy output in kWh
   */
  private static estimateEnergyOutput(methaneVolume: number): number {
    // Methane energy content: ~10 kWh/m³
    // Conversion efficiency: ~35%
    const energyContent = 10; // kWh/m³
    const efficiency = 0.35;
    
    return methaneVolume * energyContent * efficiency;
  }

  /**
   * Get process efficiency metrics
   * @param process Process to analyze
   * @returns Efficiency metrics
   */
  static getEfficiencyMetrics(process: BRRPProcess): {
    methaneYieldPerTonne: number;
    energyOutputPerTonne: number;
    processDuration?: number;
  } {
    // This would need the original waste input to calculate per-tonne metrics
    // For now, returning placeholder values
    return {
      methaneYieldPerTonne: 0,
      energyOutputPerTonne: 0,
      processDuration: process.endTime 
        ? process.endTime.getTime() - process.startTime.getTime()
        : undefined,
    };
  }
}
