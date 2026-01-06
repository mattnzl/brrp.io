import type { NextApiRequest, NextApiResponse } from 'next';
import { getPool } from '../../../lib/db';
import { WasteJobsService } from '../../../services/wasteJobs';

type ErrorResponse = {
  error: string;
  details?: string;
};

type WasteJobData = {
  id: string;
  jobNumber: string;
  customerId: string;
  customerName: string;
  customerType: string;
  wasteStream: string;
  truckRegistration: string;
  weighbridgeWeight: number;
  status: string;
  totalPrice: number;
  notes?: string;
  companyId?: string;
  companyName?: string;
  driverId?: string;
  driverName?: string;
  isRejected?: boolean;
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
  marketplaceStatus?: string;
};

type UpdateWasteJobRequest = {
  status?: string;
  driverId?: string;
  reject?: boolean;
  rejectionReason?: string;
  marketplaceStatus?: string;
};

const VALID_STATUSES = ['Pending Approval', 'Approved', 'Rejected'];
const VALID_MARKETPLACE_STATUSES = ['Not Listed', 'Listed', 'Sold'];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WasteJobData | ErrorResponse>
) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: 'Invalid job ID',
        details: 'Job ID must be provided in the URL',
      });
    }

    const body = req.body as UpdateWasteJobRequest;

    // Handle rejection
    if (body.reject) {
      if (!body.rejectionReason) {
        return res.status(400).json({
          error: 'Missing rejection reason',
          details: 'rejectionReason is required when rejecting a waste job',
        });
      }

      const success = await WasteJobsService.rejectWasteJob(id, body.rejectionReason);
      if (!success) {
        return res.status(404).json({
          error: 'Job not found',
          details: `No waste job found with ID: ${id}`,
        });
      }

      // Fetch and return updated job
      const pool = getPool();
      const result = await pool.query(
        `
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
        WHERE wj.id = $1
      `,
        [id]
      );

      return res.status(200).json(result.rows[0]);
    }

    // Handle driver assignment
    if (body.driverId) {
      const success = await WasteJobsService.assignDriver(id, body.driverId);
      if (!success) {
        return res.status(404).json({
          error: 'Job not found',
          details: `No waste job found with ID: ${id}`,
        });
      }
    }

    // Validate at least one field is being updated
    if (!body.status && !body.driverId && !body.marketplaceStatus) {
      return res.status(400).json({
        error: 'No fields to update',
        details: 'At least one field must be provided',
      });
    }

    // Validate status if provided
    if (body.status && !VALID_STATUSES.includes(body.status)) {
      return res.status(400).json({
        error: 'Invalid status',
        details: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    // Validate marketplace status if provided
    if (body.marketplaceStatus && !VALID_MARKETPLACE_STATUSES.includes(body.marketplaceStatus)) {
      return res.status(400).json({
        error: 'Invalid marketplace status',
        details: `Marketplace status must be one of: ${VALID_MARKETPLACE_STATUSES.join(', ')}`,
      });
    }

    // Build update query dynamically
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (body.status) {
      updates.push(`status = $${paramIndex}`);
      params.push(body.status);
      paramIndex++;
    }

    if (body.driverId) {
      updates.push(`driver_id = $${paramIndex}`);
      params.push(body.driverId);
      paramIndex++;
    }

    // Note: marketplace_status column would need to be added to the schema if implemented
    if (body.marketplaceStatus) {
      return res.status(400).json({
        error: 'Marketplace status updates not yet supported',
        details: 'This feature will be added in a future update',
      });
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: 'No valid fields to update',
      });
    }

    // Always update the updated_at timestamp
    updates.push(`updated_at = NOW()`);

    // Add the ID as the last parameter
    params.push(id);

    const query = `
      UPDATE waste_jobs
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING 
        id, job_number as "jobNumber", customer_id as "customerId",
        customer_name as "customerName", customer_type as "customerType",
        waste_stream as "wasteStream", truck_registration as "truckRegistration",
        weighbridge_weight as "weighbridgeWeight", status, total_price as "totalPrice",
        notes, company_id as "companyId", company_name as "companyName",
        driver_id as "driverId", is_rejected as "isRejected",
        rejection_reason as "rejectionReason",
        created_at as "createdAt", updated_at as "updatedAt"
    `;

    const pool = getPool();
    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Job not found',
        details: `No waste job found with ID: ${id}`,
      });
    }

    // Get driver name if driver assigned
    if (result.rows[0].driverId) {
      const driverResult = await pool.query(
        `SELECT first_name || ' ' || last_name as "driverName" FROM users WHERE id = $1`,
        [result.rows[0].driverId]
      );
      if (driverResult.rows.length > 0) {
        result.rows[0].driverName = driverResult.rows[0].driverName;
      }
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating waste job:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
