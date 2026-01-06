import type { NextApiRequest, NextApiResponse } from 'next';
import { getPool } from '../../../lib/db';

/**
 * SCADA Emissions Data API
 * POST: Receive emissions data from SCADA system (REST endpoint)
 * GET: Retrieve emissions data (Admin only)
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
      weighbridge_job_id,
      waste_volume_tonnes,
      waste_type,
      methane_generated_m3,
      methane_destroyed_m3,
      emission_factor,
      scada_source,
    } = req.body;

    // Validation
    if (!waste_volume_tonnes || !waste_type) {
      return res.status(400).json({ 
        error: 'Missing required fields: waste_volume_tonnes, waste_type' 
      });
    }

    // Calculate CO2 equivalent if methane destroyed is provided
    let co2_equivalent_tonnes = null;
    let gross_emissions_reduction = null;

    if (methane_destroyed_m3) {
      // Convert m³ of methane to tonnes CO2eq
      // Methane density: ~0.717 kg/m³ at STP
      // GWP of methane: 28 (IPCC AR5, 100-year)
      const methane_tonnes = (methane_destroyed_m3 * 0.717) / 1000;
      co2_equivalent_tonnes = methane_tonnes * 28;
      
      // GER is the CO2 equivalent reduced
      gross_emissions_reduction = co2_equivalent_tonnes;
      
      // If emission factor provided, add avoided landfill emissions
      if (emission_factor) {
        gross_emissions_reduction += waste_volume_tonnes * emission_factor;
      }
    }

    const pool = getPool();
    const result = await pool.query(
      `INSERT INTO emissions_data (
        weighbridge_job_id,
        waste_volume_tonnes,
        waste_type,
        methane_generated_m3,
        methane_destroyed_m3,
        co2_equivalent_tonnes,
        emission_factor,
        gross_emissions_reduction,
        scada_reading_timestamp,
        scada_source
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9)
      RETURNING *`,
      [
        weighbridge_job_id || null,
        waste_volume_tonnes,
        waste_type,
        methane_generated_m3 || null,
        methane_destroyed_m3 || null,
        co2_equivalent_tonnes,
        emission_factor || null,
        gross_emissions_reduction,
        scada_source || 'SCADA-REST',
      ]
    );

    return res.status(201).json({
      message: 'Emissions data recorded successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error recording emissions data:', error);
    return res.status(500).json({ error: 'Failed to record emissions data' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { weighbridge_job_id, limit = '100' } = req.query;

    const pool = getPool();
    let query = `
      SELECT 
        ed.*,
        wj.job_number,
        wj.company_id,
        c.name as company_name
      FROM emissions_data ed
      LEFT JOIN weighbridge_jobs wj ON ed.weighbridge_job_id = wj.id
      LEFT JOIN companies c ON wj.company_id = c.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (weighbridge_job_id) {
      query += ` AND ed.weighbridge_job_id = $1`;
      params.push(weighbridge_job_id);
    }

    query += ` ORDER BY ed.created_at DESC LIMIT $${params.length + 1}`;
    params.push(Math.min(parseInt(limit as string, 10), 1000));

    const result = await pool.query(query, params);

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching emissions data:', error);
    return res.status(500).json({ error: 'Failed to fetch emissions data' });
  }
}
