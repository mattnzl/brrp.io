import type { NextApiRequest, NextApiResponse } from 'next';
import { UsersServerService } from '../../../services/usersServer';
import { UserRole } from '../../../types';

type ErrorResponse = {
  error: string;
  details?: string;
};

/**
 * User Management API
 * GET /api/users/[id] - Get a specific user
 * PATCH /api/users/[id] - Update a user
 * DELETE /api/users/[id] - Deactivate a user
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      error: 'Invalid user ID',
      details: 'User ID must be provided in the URL',
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
 * GET - Get a specific user
 */
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string
) {
  try {
    const user = await UsersServerService.getUserById(id);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        details: `No user found with ID: ${id}`,
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * PATCH - Update a user
 */
async function handlePatch(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string
) {
  try {
    const { 
      email, 
      firstName, 
      lastName,
      role,
      companyId,
      photoUrl,
      isActive,
      password
    } = req.body;

    // Handle password update separately
    if (password) {
      // Hash password (in production, use bcrypt)
      const passwordHash = `$2b$10$${password}hash`; // TODO: Use actual bcrypt
      await UsersServerService.updatePassword(id, passwordHash);
    }

    const updates: any = {};
    if (email !== undefined) updates.email = email;
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (role !== undefined) {
      // Validate role
      if (!Object.values(UserRole).includes(role as UserRole)) {
        return res.status(400).json({
          error: 'Invalid role',
          details: `role must be one of: ${Object.values(UserRole).join(', ')}`,
        });
      }
      updates.role = role;
    }
    if (companyId !== undefined) updates.companyId = companyId;
    if (photoUrl !== undefined) updates.photoUrl = photoUrl;
    if (isActive !== undefined) updates.isActive = isActive;

    if (Object.keys(updates).length === 0 && !password) {
      return res.status(400).json({
        error: 'No fields to update',
        details: 'At least one field must be provided',
      });
    }

    const user = await UsersServerService.updateUser(id, updates);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        details: `No user found with ID: ${id}`,
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    
    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('unique')) {
      return res.status(409).json({
        error: 'Conflict',
        details: 'Username or email already exists',
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * DELETE - Deactivate a user (soft delete)
 */
async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string
) {
  try {
    const success = await UsersServerService.deleteUser(id);

    if (!success) {
      return res.status(404).json({
        error: 'User not found',
        details: `No user found with ID: ${id}`,
      });
    }

    return res.status(200).json({ 
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Error deactivating user:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
