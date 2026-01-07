import type { NextApiRequest, NextApiResponse } from 'next';
import { UsersServerService } from '../../../services/usersServer';
import { UserRole } from '../../../types';

type ErrorResponse = {
  error: string;
  details?: string;
};

/**
 * Users Management API
 * GET /api/users - List all users
 * POST /api/users - Create a new user
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
 * GET - List all users (optionally filtered by company)
 */
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { companyId } = req.query;
    
    const users = await UsersServerService.getAllUsers(
      companyId && typeof companyId === 'string' ? companyId : undefined
    );
    
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * POST - Create a new user
 */
async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { 
      username, 
      email, 
      password,
      role, 
      firstName, 
      lastName,
      companyId,
      photoUrl,
      createdBy
    } = req.body;

    if (!username || !email || !password || !role || !firstName || !lastName) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'username, email, password, role, firstName, and lastName are required',
      });
    }

    // Validate role
    if (!Object.values(UserRole).includes(role as UserRole)) {
      return res.status(400).json({
        error: 'Invalid role',
        details: `role must be one of: ${Object.values(UserRole).join(', ')}`,
      });
    }

    // For non-SYSTEM_ADMIN roles, companyId is required
    if (role !== UserRole.SYSTEM_ADMIN && !companyId) {
      return res.status(400).json({
        error: 'Missing company ID',
        details: 'companyId is required for COMPANY_ADMIN and OPERATOR roles',
      });
    }

    // Hash password (in production, use bcrypt)
    // For now, we'll use a simple placeholder hash
    const passwordHash = `$2b$10$${password}hash`; // TODO: Use actual bcrypt

    const user = await UsersServerService.createUser(
      username,
      email,
      passwordHash,
      role as UserRole,
      firstName,
      lastName,
      companyId,
      photoUrl,
      createdBy
    );

    // Remove password hash from response
    const { ...userWithoutPassword } = user;
    return res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('unique')) {
      return res.status(409).json({
        error: 'User already exists',
        details: 'Username or email already exists',
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
