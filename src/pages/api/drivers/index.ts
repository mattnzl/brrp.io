import type { NextApiRequest, NextApiResponse } from 'next';
import { getPool } from '../../../lib/db';

/**
 * Drivers API
 * GET: List drivers (filtered by company)
 * POST: Create new driver
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
    const { company_id } = req.query;

    const pool = getPool();
    let query = `
      SELECT 
        d.id,
        d.user_id,
        d.company_id,
        c.name as company_name,
        d.first_name,
        d.last_name,
        d.driver_license_number,
        d.phone,
        d.is_active,
        d.created_at
      FROM drivers d
      INNER JOIN companies c ON d.company_id = c.id
      WHERE d.is_active = true
    `;

    const params: any[] = [];

    if (company_id) {
      query += ` AND d.company_id = $1`;
      params.push(company_id);
    }

    query += ` ORDER BY d.first_name, d.last_name ASC`;

    const result = await pool.query(query, params);

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return res.status(500).json({ error: 'Failed to fetch drivers' });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      company_id,
      first_name,
      last_name,
      driver_license_number,
      phone,
      user_id,
    } = req.body;

    // Validation
    if (!company_id || !first_name || !last_name) {
      return res.status(400).json({ 
        error: 'Missing required fields: company_id, first_name, last_name' 
      });
    }

    const pool = getPool();
    const result = await pool.query(
      `INSERT INTO drivers (
        company_id,
        first_name,
        last_name,
        driver_license_number,
        phone,
        user_id
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        company_id,
        first_name,
        last_name,
        driver_license_number || null,
        phone || null,
        user_id || null,
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating driver:', error);
    return res.status(500).json({ error: 'Failed to create driver' });
  }
}
