import type { NextApiRequest, NextApiResponse } from 'next';
import { getPool } from '../../../lib/db';

/**
 * Companies API
 * GET: List all active companies
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
        business_number,
        contact_email,
        contact_phone,
        address,
        created_at
      FROM companies
      WHERE is_active = true
      ORDER BY name ASC`
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching companies:', error);
    return res.status(500).json({ error: 'Failed to fetch companies' });
  }
}
