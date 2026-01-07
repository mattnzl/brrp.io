import type { NextApiRequest, NextApiResponse } from 'next';
import { getPool } from '../../../lib/db';

/**
 * Waste Stream Types API
 * GET: List all active waste stream types
 */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const pool = getPool();
    const result = await pool.query(
      `SELECT 
        id,
        name,
        description,
        unit_of_measure,
        price_per_unit,
        energy_value,
        nutrient_value,
        emission_factor,
        created_at
      FROM waste_stream_types
      WHERE is_active = true
      ORDER BY name ASC`
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching waste stream types:', error);
    return res.status(500).json({ error: 'Failed to fetch waste stream types' });
  }
}
