import type { NextApiRequest, NextApiResponse } from 'next';
import { getPool } from '../../../lib/db';

/**
 * Weighbridge Jobs API
 * GET: List weighbridge jobs (with filtering)
 * POST: Create new weighbridge job
 */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'POST') {
    return handlePost(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { status, company_id, page = '1', per_page = '50' } = req.query;

    const pool = getPool();
    let query = `
      SELECT 
        wj.id,
        wj.job_number,
        wj.company_id,
        c.name as company_name,
        wj.truck_id,
        t.license_plate as truck_license_plate,
        wj.driver_id,
        CONCAT(d.first_name, ' ', d.last_name) as driver_name,
        wj.waste_stream_type_id,
        wst.name as waste_stream_type_name,
        wj.tare_weight,
        wj.gross_weight,
        wj.net_weight,
        wj.status,
        wj.is_contaminated,
        wj.rejection_reason,
        wj.unit_price,
        wj.total_price,
        wj.notes,
        wj.weighed_at,
        wj.created_at
      FROM weighbridge_jobs wj
      INNER JOIN companies c ON wj.company_id = c.id
      INNER JOIN trucks t ON wj.truck_id = t.id
      INNER JOIN waste_stream_types wst ON wj.waste_stream_type_id = wst.id
      LEFT JOIN drivers d ON wj.driver_id = d.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND wj.status = $${paramCount}`;
      params.push(status);
    }

    if (company_id) {
      paramCount++;
      query += ` AND wj.company_id = $${paramCount}`;
      params.push(company_id);
    }

    query += ` ORDER BY wj.weighed_at DESC`;

    // Pagination
    const limit = Math.min(parseInt(per_page as string, 10), 100);
    const offset = (parseInt(page as string, 10) - 1) * limit;
    
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limit);
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await pool.query(query, params);

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching weighbridge jobs:', error);
    return res.status(500).json({ error: 'Failed to fetch weighbridge jobs' });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      company_id,
      truck_id,
      driver_id,
      waste_stream_type_id,
      tare_weight,
      gross_weight,
      unit_price,
      notes,
    } = req.body;

    // Validation
    if (!company_id || !truck_id || !waste_stream_type_id || !gross_weight || !unit_price) {
      return res.status(400).json({ 
        error: 'Missing required fields: company_id, truck_id, waste_stream_type_id, gross_weight, unit_price' 
      });
    }

    // Calculate net weight
    const net_weight = tare_weight ? gross_weight - tare_weight : gross_weight;

    if (net_weight <= 0) {
      return res.status(400).json({ error: 'Net weight must be greater than 0' });
    }

    // Calculate total price
    const total_price = net_weight * unit_price;

    // Generate job number
    const job_number = `WB-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const pool = getPool();
    const result = await pool.query(
      `INSERT INTO weighbridge_jobs (
        job_number,
        company_id,
        truck_id,
        driver_id,
        waste_stream_type_id,
        tare_weight,
        gross_weight,
        net_weight,
        unit_price,
        total_price,
        notes,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'WEIGHED')
      RETURNING *`,
      [
        job_number,
        company_id,
        truck_id,
        driver_id || null,
        waste_stream_type_id,
        tare_weight || null,
        gross_weight,
        net_weight,
        unit_price,
        total_price,
        notes || null,
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating weighbridge job:', error);
    return res.status(500).json({ error: 'Failed to create weighbridge job' });
  }
}
