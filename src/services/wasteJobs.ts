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
import { getPool } from '../lib/db';

/**
 * Waste Jobs Service
 * Handles waste job creation and management from weighbridge input
 * Implements the weighbridge workflow with license plate validation,
 * driver assignment, and rejection tracking
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

  /**
   * Assign a driver to a waste job
   */
  static async assignDriver(jobId: string, driverId: string): Promise<boolean> {
    const pool = getPool();
    const result = await pool.query(
      `
      UPDATE waste_jobs
      SET driver_id = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id
    `,
      [driverId, jobId]
    );

    return result.rows.length > 0;
  }

  /**
   * Mark a waste job as rejected (contaminated)
   */
  static async rejectWasteJob(
    jobId: string,
    rejectionReason: string
  ): Promise<boolean> {
    const pool = getPool();
    const result = await pool.query(
      `
      UPDATE waste_jobs
      SET 
        is_rejected = true,
        rejection_reason = $1,
        status = 'Rejected',
        updated_at = NOW()
      WHERE id = $2
      RETURNING id
    `,
      [rejectionReason, jobId]
    );

    return result.rows.length > 0;
  }

  /**
   * Get waste jobs for a specific company
   */
  static async getJobsByCompany(
    companyId: string,
    options?: {
      status?: string;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      perPage?: number;
    }
  ): Promise<any[]> {
    const pool = getPool();
    let query = `
      SELECT 
        wj.id, wj.job_number as "jobNumber", wj.customer_id as "customerId",
        wj.customer_name as "customerName", wj.customer_type as "customerType",
        wj.waste_stream as "wasteStream", wj.truck_registration as "truckRegistration",
        wj.weighbridge_weight as "weighbridgeWeight", wj.status, wj.total_price as "totalPrice",
        wj.notes, wj.company_id as "companyId", wj.company_name as "companyName",
        wj.driver_id as "driverId", wj.is_rejected as "isRejected",
        wj.rejection_reason as "rejectionReason",
        wj.created_at as "createdAt", wj.updated_at as "updatedAt",
        u.first_name || ' ' || u.last_name as "driverName"
      FROM waste_jobs wj
      LEFT JOIN users u ON u.id = wj.driver_id
      WHERE wj.company_id = $1
    `;

    const params: any[] = [companyId];
    let paramIndex = 2;

    if (options?.status && options.status !== 'All') {
      query += ` AND wj.status = $${paramIndex}`;
      params.push(options.status);
      paramIndex++;
    }

    if (options?.startDate) {
      query += ` AND wj.created_at >= $${paramIndex}`;
      params.push(options.startDate);
      paramIndex++;
    }

    if (options?.endDate) {
      query += ` AND wj.created_at <= $${paramIndex}`;
      params.push(options.endDate);
      paramIndex++;
    }

    query += ` ORDER BY wj.created_at DESC`;

    if (options?.perPage) {
      const limit = Math.min(options.perPage, 100);
      const offset = ((options.page || 1) - 1) * limit;
      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);
    }

    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Get aggregated job totals for invoicing
   */
  static async getMonthlyJobTotals(
    companyId: string,
    year: number,
    month: number
  ): Promise<{
    totalJobs: number;
    totalWeight: number;
    totalRevenue: number;
    byWasteStream: Array<{
      wasteStream: string;
      jobCount: number;
      totalWeight: number;
      totalRevenue: number;
    }>;
  }> {
    const pool = getPool();

    // Get start and end dates for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Get overall totals
    const totalsResult = await pool.query(
      `
      SELECT 
        COUNT(*) as "totalJobs",
        COALESCE(SUM(weighbridge_weight), 0) as "totalWeight",
        COALESCE(SUM(total_price), 0) as "totalRevenue"
      FROM waste_jobs
      WHERE company_id = $1
        AND created_at >= $2
        AND created_at <= $3
        AND status = 'Approved'
        AND is_rejected = false
    `,
      [companyId, startDate, endDate]
    );

    // Get breakdown by waste stream
    const byStreamResult = await pool.query(
      `
      SELECT 
        waste_stream as "wasteStream",
        COUNT(*) as "jobCount",
        COALESCE(SUM(weighbridge_weight), 0) as "totalWeight",
        COALESCE(SUM(total_price), 0) as "totalRevenue"
      FROM waste_jobs
      WHERE company_id = $1
        AND created_at >= $2
        AND created_at <= $3
        AND status = 'Approved'
        AND is_rejected = false
      GROUP BY waste_stream
      ORDER BY "totalRevenue" DESC
    `,
      [companyId, startDate, endDate]
    );

    return {
      totalJobs: parseInt(totalsResult.rows[0].totalJobs),
      totalWeight: parseFloat(totalsResult.rows[0].totalWeight),
      totalRevenue: parseFloat(totalsResult.rows[0].totalRevenue),
      byWasteStream: byStreamResult.rows,
    };
  }
}
