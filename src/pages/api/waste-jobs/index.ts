import type { NextApiRequest, NextApiResponse } from 'next';
import { getPool } from '../../../lib/db';
import { WasteJobsService } from '../../../services/wasteJobs';
import { WasteStreamType } from '../../../types';

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
  createdAt: string;
};

type CreateWasteJobRequest = {
  customer: {
    id: string;
    name: string;
    type: string;
  };
  wasteStream: string;
  truckRegistration: string;
  weighbridgeWeight: number;
  notes?: string;
  companyId?: string;
  companyName?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WasteJobData | WasteJobData[] | ErrorResponse>
) {
  if (req.method === 'POST') {
    return handlePost(req, res);
  } else if (req.method === 'GET') {
    return handleGet(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse<WasteJobData | ErrorResponse>
) {
  try {
    const body = req.body as CreateWasteJobRequest;

    // Validate required fields
    if (!body.customer || !body.wasteStream || !body.truckRegistration) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'customer, wasteStream, and truckRegistration are required',
      });
    }

    // Validate weighbridge weight
    const weight = Number(body.weighbridgeWeight);
    if (isNaN(weight) || weight <= 0) {
      return res.status(400).json({
        error: 'Invalid weighbridge weight',
        details: 'weighbridgeWeight must be a number greater than 0',
      });
    }

    // Validate waste stream type
    if (!Object.values(WasteStreamType).includes(body.wasteStream as WasteStreamType)) {
      return res.status(400).json({
        error: 'Invalid waste stream type',
        details: `wasteStream must be one of: ${Object.values(WasteStreamType).join(', ')}`,
      });
    }

    // Calculate total price
    const totalPrice = WasteJobsService.calculatePrice(
      body.wasteStream as WasteStreamType,
      weight
    );

    // Generate job number
    const jobNumber = `WJ-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Insert into database
    const pool = getPool();
    const result = await pool.query(
      `INSERT INTO waste_jobs (
        job_number, customer_id, customer_name, customer_type,
        waste_stream, truck_registration, weighbridge_weight,
        status, total_price, notes, company_id, company_name
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING 
        id, job_number as "jobNumber", customer_id as "customerId", 
        customer_name as "customerName", customer_type as "customerType",
        waste_stream as "wasteStream", truck_registration as "truckRegistration",
        weighbridge_weight as "weighbridgeWeight", status, total_price as "totalPrice",
        notes, company_id as "companyId", company_name as "companyName", 
        created_at as "createdAt"`,
      [
        jobNumber,
        body.customer.id,
        body.customer.name,
        body.customer.type,
        body.wasteStream,
        body.truckRegistration,
        weight,
        'Pending Approval', // Default status
        totalPrice,
        body.notes || null,
        body.companyId || null,
        body.companyName || null,
      ]
    );

    const createdJob = result.rows[0];
    return res.status(201).json(createdJob);
  } catch (error) {
    console.error('Error creating waste job:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<WasteJobData[] | ErrorResponse>
) {
  try {
    const { status, companyId, page = '1', perPage = '50' } = req.query;

    // Build query with optional filters
    let query = `
      SELECT 
        id, job_number as "jobNumber", customer_id as "customerId",
        customer_name as "customerName", customer_type as "customerType",
        waste_stream as "wasteStream", truck_registration as "truckRegistration",
        weighbridge_weight as "weighbridgeWeight", status, total_price as "totalPrice",
        notes, company_id as "companyId", company_name as "companyName",
        created_at as "createdAt"
      FROM waste_jobs
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Add status filter
    if (status && typeof status === 'string' && status !== 'All') {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    // Add company filter
    if (companyId && typeof companyId === 'string') {
      query += ` AND company_id = $${paramIndex}`;
      params.push(companyId);
      paramIndex++;
    }

    // Add ordering
    query += ` ORDER BY created_at DESC`;

    // Add pagination
    const limit = Math.min(parseInt(perPage as string) || 50, 100);
    const offset = (parseInt(page as string) - 1) * limit;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const pool = getPool();
    const result = await pool.query(query, params);

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching waste jobs:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
