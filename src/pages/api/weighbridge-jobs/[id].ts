import type { NextApiRequest, NextApiResponse } from 'next';
import { getPool } from '../../../lib/db';

/**
 * Weighbridge Job Detail API
 * PATCH: Update weighbridge job (status, driver assignment, contamination)
 * GET: Get single weighbridge job details
 */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid job ID' });
  }

  if (req.method === 'GET') {
    return handleGet(id, req, res);
  } else if (req.method === 'PATCH') {
    return handlePatch(id, req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGet(
  id: string,
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const pool = getPool();
    const result = await pool.query(
      `SELECT 
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
        wj.approved_at,
        wj.approved_by,
        wj.created_at
      FROM weighbridge_jobs wj
      INNER JOIN companies c ON wj.company_id = c.id
      INNER JOIN trucks t ON wj.truck_id = t.id
      INNER JOIN waste_stream_types wst ON wj.waste_stream_type_id = wst.id
      LEFT JOIN drivers d ON wj.driver_id = d.id
      WHERE wj.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching weighbridge job:', error);
    return res.status(500).json({ error: 'Failed to fetch weighbridge job' });
  }
}

async function handlePatch(
  id: string,
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const {
      status,
      driver_id,
      is_contaminated,
      rejection_reason,
      approved_by,
    } = req.body;

    const pool = getPool();
    
    // Build dynamic update query
    const updates: string[] = [];
    const params: any[] = [];
    let paramCount = 0;

    if (status !== undefined) {
      // Validate status
      const validStatuses = ['WEIGHED', 'APPROVED', 'REJECTED', 'INVOICED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
      }
      paramCount++;
      updates.push(`status = $${paramCount}`);
      params.push(status);

      // If approving, set approved_at timestamp
      if (status === 'APPROVED') {
        paramCount++;
        updates.push(`approved_at = NOW()`);
        
        if (approved_by) {
          paramCount++;
          updates.push(`approved_by = $${paramCount}`);
          params.push(approved_by);
        }
      }
    }

    if (driver_id !== undefined) {
      paramCount++;
      updates.push(`driver_id = $${paramCount}`);
      params.push(driver_id || null);
    }

    if (is_contaminated !== undefined) {
      paramCount++;
      updates.push(`is_contaminated = $${paramCount}`);
      params.push(is_contaminated);

      // If contaminated, also reject the job
      if (is_contaminated) {
        paramCount++;
        updates.push(`status = 'REJECTED'`);
        
        if (rejection_reason) {
          paramCount++;
          updates.push(`rejection_reason = $${paramCount}`);
          params.push(rejection_reason);
        }
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Add ID parameter
    paramCount++;
    params.push(id);

    const query = `
      UPDATE weighbridge_jobs 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating weighbridge job:', error);
    return res.status(500).json({ error: 'Failed to update weighbridge job' });
  }
}
