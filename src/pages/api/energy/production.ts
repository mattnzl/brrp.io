import type { NextApiRequest, NextApiResponse } from 'next';
import { getPool } from '../../../lib/db';

/**
 * Energy Production Data API
 * POST: Receive energy production data from BRRP plant (REST endpoint)
 * GET: Retrieve energy production data (Admin only)
 */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    return handlePost(req, res);
  } else if (req.method === 'GET') {
    return handleGet(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      electricity_kwh,
      process_heat_mj,
      period_start,
      period_end,
      plant_source,
      data_source,
    } = req.body;

    // Validation - at least one energy metric required
    if (!electricity_kwh && !process_heat_mj) {
      return res.status(400).json({ 
        error: 'At least one energy metric required: electricity_kwh or process_heat_mj' 
      });
    }

    const pool = getPool();
    const result = await pool.query(
      `INSERT INTO energy_production (
        electricity_kwh,
        process_heat_mj,
        reading_timestamp,
        period_start,
        period_end,
        plant_source,
        data_source
      ) VALUES ($1, $2, NOW(), $3, $4, $5, $6)
      RETURNING *`,
      [
        electricity_kwh || null,
        process_heat_mj || null,
        period_start || null,
        period_end || null,
        plant_source || 'BRRP-PLANT',
        data_source || 'BRRP-REST',
      ]
    );

    return res.status(201).json({
      message: 'Energy production data recorded successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error recording energy production data:', error);
    return res.status(500).json({ error: 'Failed to record energy production data' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { start_date, end_date, limit = '1000' } = req.query;

    const pool = getPool();
    let query = `
      SELECT *
      FROM energy_production
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramCount = 0;

    if (start_date) {
      paramCount++;
      query += ` AND reading_timestamp >= $${paramCount}`;
      params.push(start_date);
    }

    if (end_date) {
      paramCount++;
      query += ` AND reading_timestamp <= $${paramCount}`;
      params.push(end_date);
    }

    query += ` ORDER BY reading_timestamp DESC`;
    
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(Math.min(parseInt(limit as string, 10), 10000));

    const result = await pool.query(query, params);

    // Also provide summary statistics
    const summary = await pool.query(
      `SELECT 
        COUNT(*) as total_readings,
        SUM(electricity_kwh) as total_electricity_kwh,
        AVG(electricity_kwh) as avg_electricity_kwh,
        SUM(process_heat_mj) as total_process_heat_mj,
        AVG(process_heat_mj) as avg_process_heat_mj,
        MIN(reading_timestamp) as earliest_reading,
        MAX(reading_timestamp) as latest_reading
      FROM energy_production
      WHERE 1=1
      ${start_date ? 'AND reading_timestamp >= $1' : ''}
      ${end_date ? `AND reading_timestamp <= $${start_date ? 2 : 1}` : ''}`,
      [...(start_date ? [start_date] : []), ...(end_date ? [end_date] : [])]
    );

    return res.status(200).json({
      data: result.rows,
      summary: summary.rows[0],
    });
  } catch (error) {
    console.error('Error fetching energy production data:', error);
    return res.status(500).json({ error: 'Failed to fetch energy production data' });
  }
}
