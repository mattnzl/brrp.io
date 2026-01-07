import type { NextApiRequest, NextApiResponse } from 'next';
import { CompaniesService } from '../../../services/companies';
import { CustomerType } from '../../../types';

type ErrorResponse = {
  error: string;
  details?: string;
};

/**
 * Companies Management API
 * GET /api/companies - List all companies
 * POST /api/companies - Create a new company
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

/**
 * GET - List all companies
 */
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const companies = await CompaniesService.getAllCompanies();
    return res.status(200).json(companies);
  } catch (error) {
    console.error('Error getting companies:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * POST - Create a new company
 */
async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { name, type, contactEmail, contactPhone, address, logoUrl } = req.body;

    if (!name || !type || !contactEmail || !contactPhone) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'name, type, contactEmail, and contactPhone are required',
      });
    }

    // Validate customer type
    if (!Object.values(CustomerType).includes(type as CustomerType)) {
      return res.status(400).json({
        error: 'Invalid customer type',
        details: `type must be one of: ${Object.values(CustomerType).join(', ')}`,
      });
    }

    const company = await CompaniesService.createCompany(
      name,
      type as CustomerType,
      contactEmail,
      contactPhone,
      address,
      logoUrl
    );

    return res.status(201).json(company);
  } catch (error) {
    console.error('Error creating company:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
