import type { NextApiRequest, NextApiResponse } from 'next';
import { CompaniesService } from '../../../services/companies';

type ErrorResponse = {
  error: string;
  details?: string;
};

/**
 * Company Management API
 * GET /api/companies/[id] - Get a specific company
 * PATCH /api/companies/[id] - Update a company
 * DELETE /api/companies/[id] - Deactivate a company
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      error: 'Invalid company ID',
      details: 'Company ID must be provided in the URL',
    });
  }

  if (req.method === 'GET') {
    return handleGet(req, res, id);
  } else if (req.method === 'PATCH') {
    return handlePatch(req, res, id);
  } else if (req.method === 'DELETE') {
    return handleDelete(req, res, id);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

/**
 * GET - Get a specific company
 */
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string
) {
  try {
    const company = await CompaniesService.getCompanyById(id);
    
    if (!company) {
      return res.status(404).json({
        error: 'Company not found',
        details: `No company found with ID: ${id}`,
      });
    }

    return res.status(200).json(company);
  } catch (error) {
    console.error('Error getting company:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * PATCH - Update a company
 */
async function handlePatch(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string
) {
  try {
    const { name, contactEmail, contactPhone, address, logoUrl, isActive } = req.body;

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (contactEmail !== undefined) updates.contactEmail = contactEmail;
    if (contactPhone !== undefined) updates.contactPhone = contactPhone;
    if (address !== undefined) updates.address = address;
    if (logoUrl !== undefined) updates.logoUrl = logoUrl;
    if (isActive !== undefined) updates.isActive = isActive;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: 'No fields to update',
        details: 'At least one field must be provided',
      });
    }

    const company = await CompaniesService.updateCompany(id, updates);

    if (!company) {
      return res.status(404).json({
        error: 'Company not found',
        details: `No company found with ID: ${id}`,
      });
    }

    return res.status(200).json(company);
  } catch (error) {
    console.error('Error updating company:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * DELETE - Deactivate a company (soft delete)
 */
async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string
) {
  try {
    const company = await CompaniesService.updateCompany(id, { isActive: false });

    if (!company) {
      return res.status(404).json({
        error: 'Company not found',
        details: `No company found with ID: ${id}`,
      });
    }

    return res.status(200).json({ 
      message: 'Company deactivated successfully',
      company 
    });
  } catch (error) {
    console.error('Error deactivating company:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
