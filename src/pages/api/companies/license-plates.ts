import type { NextApiRequest, NextApiResponse } from 'next';
import { CompaniesService } from '../../../services/companies';

type ErrorResponse = {
  error: string;
  details?: string;
};

/**
 * License Plates API
 * POST /api/companies/license-plates - Validate or register a license plate
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

/**
 * POST - Validate or register a license plate
 */
async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { action, licensePlate, companyId, createdBy } = req.body;

    if (!action) {
      return res.status(400).json({
        error: 'Missing required field: action',
        details: 'action must be "validate" or "register"',
      });
    }

    if (!licensePlate) {
      return res.status(400).json({
        error: 'Missing required field: licensePlate',
      });
    }

    if (action === 'validate') {
      // Validate license plate
      const result = await CompaniesService.validateLicensePlate(licensePlate);
      return res.status(200).json(result);
    } else if (action === 'register') {
      // Register license plate
      if (!companyId) {
        return res.status(400).json({
          error: 'Missing required field: companyId',
          details: 'companyId is required for registering a license plate',
        });
      }

      const result = await CompaniesService.registerLicensePlate(
        companyId,
        licensePlate,
        createdBy
      );
      return res.status(201).json(result);
    } else {
      return res.status(400).json({
        error: 'Invalid action',
        details: 'action must be "validate" or "register"',
      });
    }
  } catch (error) {
    console.error('Error handling license plate request:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET - Get license plates for a company
 */
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { companyId } = req.query;

    if (!companyId || typeof companyId !== 'string') {
      return res.status(400).json({
        error: 'Missing required query parameter: companyId',
      });
    }

    const licensePlates = await CompaniesService.getCompanyLicensePlates(companyId);
    return res.status(200).json(licensePlates);
  } catch (error) {
    console.error('Error getting license plates:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
