import type { NextApiRequest, NextApiResponse } from 'next';
import { getPool } from '../../../lib/db';

/**
 * Trucks API
 * GET: List trucks (filtered by company)
 * POST: Create new truck
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
        t.id,
        t.license_plate,
        t.company_id,
        c.name as company_name,
        t.make,
        t.model,
        t.year,
        t.capacity_tonnes,
        t.is_active,
        t.created_at
      FROM trucks t
      INNER JOIN companies c ON t.company_id = c.id
      WHERE t.is_active = true
    `;

    const params: any[] = [];

    if (company_id) {
      query += ` AND t.company_id = $1`;
      params.push(company_id);
    }

    query += ` ORDER BY t.license_plate ASC`;

    const result = await pool.query(query, params);

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching trucks:', error);
    return res.status(500).json({ error: 'Failed to fetch trucks' });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      license_plate,
      company_id,
      make,
      model,
      year,
      capacity_tonnes,
    } = req.body;

    // Validation
    if (!license_plate || !company_id) {
      return res.status(400).json({ 
        error: 'Missing required fields: license_plate, company_id' 
      });
    }

    const pool = getPool();

    // Check if license plate already exists
    const existing = await pool.query(
      'SELECT id FROM trucks WHERE license_plate = $1',
      [license_plate.toUpperCase()]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'License plate already registered' });
    }

    const result = await pool.query(
      `INSERT INTO trucks (
        license_plate,
        company_id,
        make,
        model,
        year,
        capacity_tonnes
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        license_plate.toUpperCase(),
        company_id,
        make || null,
        model || null,
        year || null,
        capacity_tonnes || null,
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating truck:', error);
    return res.status(500).json({ error: 'Failed to create truck' });
  }
}
