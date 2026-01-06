import {
  WasteJob,
  WasteJobStatus,
  WasteStreamType,
  WasteStreamProperties,
  EnergyValue,
  NutrientValue,
  Customer,
  CustomerType,
} from '../types';
import { generateJobNumber } from '../utils/formatters';

/**
 * Waste Jobs Service
 * Handles waste job creation and management from weighbridge input
 */

export class WasteJobsService {
  /**
   * Get waste stream properties including pricing
   */
  static getWasteStreamProperties(): Record<WasteStreamType, WasteStreamProperties> {
    return {
      [WasteStreamType.COW_SHED_WASTE]: {
        type: WasteStreamType.COW_SHED_WASTE,
        unitOfMeasure: 'Tonne',
        standardPrice: 210,
        energyValue: EnergyValue.LOW,
        nutrientValue: NutrientValue.HIGH,
      },
      [WasteStreamType.FOOD_WASTE]: {
        type: WasteStreamType.FOOD_WASTE,
        unitOfMeasure: 'Tonne',
        standardPrice: 210,
        energyValue: EnergyValue.MEDIUM,
        nutrientValue: NutrientValue.LOW,
      },
      [WasteStreamType.GREEN_WASTE]: {
        type: WasteStreamType.GREEN_WASTE,
        unitOfMeasure: 'Tonne',
        standardPrice: 210,
        energyValue: EnergyValue.LOW,
        nutrientValue: NutrientValue.MEDIUM,
      },
      [WasteStreamType.SPENT_GRAIN]: {
        type: WasteStreamType.SPENT_GRAIN,
        unitOfMeasure: 'Tonne',
        standardPrice: 210,
        energyValue: EnergyValue.LOW,
        nutrientValue: NutrientValue.MEDIUM,
      },
      [WasteStreamType.APPLE_POMACE]: {
        type: WasteStreamType.APPLE_POMACE,
        unitOfMeasure: 'Tonne',
        standardPrice: 210,
        energyValue: EnergyValue.MEDIUM,
        nutrientValue: NutrientValue.MEDIUM,
      },
      [WasteStreamType.GRAPE_MARC]: {
        type: WasteStreamType.GRAPE_MARC,
        unitOfMeasure: 'Tonne',
        standardPrice: 210,
        energyValue: EnergyValue.MEDIUM,
        nutrientValue: NutrientValue.MEDIUM,
      },
      [WasteStreamType.HOPS_RESIDUE]: {
        type: WasteStreamType.HOPS_RESIDUE,
        unitOfMeasure: 'Tonne',
        standardPrice: 210,
        energyValue: EnergyValue.MEDIUM,
        nutrientValue: NutrientValue.MEDIUM,
      },
      [WasteStreamType.FISH_WASTE]: {
        type: WasteStreamType.FISH_WASTE,
        unitOfMeasure: 'Tonne',
        standardPrice: 260,
        energyValue: EnergyValue.MEDIUM,
        nutrientValue: NutrientValue.HIGH,
      },
    };
  }

  /**
   * Get friendly name for waste stream type
   */
  static getWasteStreamName(type: WasteStreamType): string {
    const names: Record<WasteStreamType, string> = {
      [WasteStreamType.COW_SHED_WASTE]: 'Cow Shed Waste',
      [WasteStreamType.FOOD_WASTE]: 'Food Waste',
      [WasteStreamType.GREEN_WASTE]: 'Green Waste',
      [WasteStreamType.SPENT_GRAIN]: 'Spent Grain',
      [WasteStreamType.APPLE_POMACE]: 'Apple Pomace',
      [WasteStreamType.GRAPE_MARC]: 'Grape Marc',
      [WasteStreamType.HOPS_RESIDUE]: 'Hops Residue',
      [WasteStreamType.FISH_WASTE]: 'Fish Waste',
    };
    return names[type];
  }

  /**
   * Create a new waste job from weighbridge input
   */
  static createWasteJob(
    customer: Customer,
    wasteStream: WasteStreamType,
    truckRegistration: string,
    weighbridgeWeight: number,
    notes?: string
  ): WasteJob {
    const jobNumber = generateJobNumber();
    const properties = this.getWasteStreamProperties()[wasteStream];
    const totalPrice = weighbridgeWeight * properties.standardPrice;

    return {
      id: `waste-job-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      jobNumber,
      customer,
      wasteStream,
      truckRegistration,
      weighbridgeWeight,
      timestamp: new Date(),
      status: WasteJobStatus.WEIGHED,
      totalPrice,
      notes,
    };
  }

  /**
   * Calculate total price for a waste job
   */
  static calculatePrice(wasteStream: WasteStreamType, weight: number): number {
    const properties = this.getWasteStreamProperties()[wasteStream];
    return weight * properties.standardPrice;
  }

  /**
   * Update waste job status
   */
  static updateJobStatus(job: WasteJob, status: WasteJobStatus): WasteJob {
    return {
      ...job,
      status,
    };
  }

  /**
   * Get all available customers
   */
  static getAvailableCustomers(): Customer[] {
    return [
      {
        id: 'cust-wmnz',
        name: 'Waste Management NZ',
        type: CustomerType.WASTE_MANAGEMENT_NZ,
        contactEmail: 'contact@wastemanagement.co.nz',
        contactPhone: '+64 9 123 4567',
      },
      {
        id: 'cust-environz',
        name: 'enviroNZ',
        type: CustomerType.ENVIRONZ,
        contactEmail: 'info@environz.co.nz',
        contactPhone: '+64 9 765 4321',
      },
    ];
  }
}
