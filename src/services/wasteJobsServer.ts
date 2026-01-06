import { getPool } from '../lib/db';

/**
 * Waste Jobs Server Service
 * Server-side only functions for waste jobs that require database access
 * These should only be called from API routes, never from client-side code
 */

export class WasteJobsServerService {
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
