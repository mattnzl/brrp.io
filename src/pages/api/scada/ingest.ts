import type { NextApiRequest, NextApiResponse } from 'next';
import { SCADADataService } from '../../../services/scadaData';

type ErrorResponse = {
  error: string;
  details?: string;
};

type SCADAMeasurementResponse = {
  id: string;
  facilityId: string;
  timestamp: string;
  wasteProcessed: number;
  methaneGenerated: number;
  methaneDestroyed: number;
  electricityProduced?: number;
  processHeatProduced?: number;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  emissionsDataId?: string;
};

type IngestSCADARequest = {
  facilityId: string;
  timestamp: string;
  wasteProcessed: number;
  methaneGenerated: number;
  methaneDestroyed: number;
  electricityProduced?: number;
  processHeatProduced?: number;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
};

/**
 * SCADA Data Ingestion API
 * POST /api/scada/ingest - Ingest real-time SCADA measurement data
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SCADAMeasurementResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body as IngestSCADARequest;

    // Validate required fields
    if (!body.facilityId || !body.timestamp) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'facilityId and timestamp are required',
      });
    }

    // Validate numeric fields
    if (
      body.wasteProcessed === undefined ||
      body.methaneGenerated === undefined ||
      body.methaneDestroyed === undefined
    ) {
      return res.status(400).json({
        error: 'Missing required measurement fields',
        details: 'wasteProcessed, methaneGenerated, and methaneDestroyed are required',
      });
    }

    // Validate measurement data
    const validation = SCADADataService.validateMeasurement({
      wasteProcessed: body.wasteProcessed,
      methaneGenerated: body.methaneGenerated,
      methaneDestroyed: body.methaneDestroyed,
      electricityProduced: body.electricityProduced,
      processHeatProduced: body.processHeatProduced,
    });

    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid measurement data',
        details: validation.errors.join('; '),
      });
    }

    // Parse timestamp
    const timestamp = new Date(body.timestamp);
    if (isNaN(timestamp.getTime())) {
      return res.status(400).json({
        error: 'Invalid timestamp',
        details: 'timestamp must be a valid ISO 8601 date string',
      });
    }

    // Ingest measurement
    const measurement = await SCADADataService.ingestMeasurement(
      body.facilityId,
      timestamp,
      body.wasteProcessed,
      body.methaneGenerated,
      body.methaneDestroyed,
      body.electricityProduced,
      body.processHeatProduced,
      body.location
    );

    // Get associated emissions data
    const emissionsData = await SCADADataService.getEmissionsData(measurement.id);

    return res.status(201).json({
      id: measurement.id,
      facilityId: measurement.facilityId,
      timestamp: measurement.timestamp.toISOString(),
      wasteProcessed: measurement.wasteProcessed,
      methaneGenerated: measurement.methaneGenerated,
      methaneDestroyed: measurement.methaneDestroyed,
      electricityProduced: measurement.electricityProduced,
      processHeatProduced: measurement.processHeatProduced,
      location: measurement.location,
      emissionsDataId: emissionsData?.id,
    });
  } catch (error) {
    console.error('Error ingesting SCADA data:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
