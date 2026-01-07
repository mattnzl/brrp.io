import { User, UserRole } from '../types';
import { getPool } from '../lib/db';

/**
 * Users Server Service
 * Server-side only functions for user management that require database access
 */

export class UsersServerService {
  /**
   * Get all users or users for a specific company
   */
  static async getAllUsers(companyId?: string): Promise<User[]> {
    const pool = getPool();
    let query = `
      SELECT 
        id, username, email, role, company_id as "companyId",
        first_name as "firstName", last_name as "lastName",
        photo_url as "photoUrl", is_active as "isActive",
        created_at as "createdAt", updated_at as "updatedAt",
        created_by as "createdBy"
      FROM users
      WHERE 1=1
    `;

    const params: any[] = [];
    if (companyId) {
      query += ` AND company_id = $1`;
      params.push(companyId);
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Get a specific user by ID
   */
  static async getUserById(id: string): Promise<User | null> {
    const pool = getPool();
    const result = await pool.query(
      `
      SELECT 
        id, username, email, role, company_id as "companyId",
        first_name as "firstName", last_name as "lastName",
        photo_url as "photoUrl", is_active as "isActive",
        created_at as "createdAt", updated_at as "updatedAt",
        created_by as "createdBy"
      FROM users
      WHERE id = $1
    `,
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  /**
   * Create a new user
   */
  static async createUser(
    username: string,
    email: string,
    passwordHash: string,
    role: UserRole,
    firstName: string,
    lastName: string,
    companyId?: string,
    photoUrl?: string,
    createdBy?: string
  ): Promise<User> {
    const pool = getPool();
    const result = await pool.query(
      `
      INSERT INTO users (
        username, email, password_hash, role, first_name, last_name,
        company_id, photo_url, is_active, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, $9)
      RETURNING 
        id, username, email, role, company_id as "companyId",
        first_name as "firstName", last_name as "lastName",
        photo_url as "photoUrl", is_active as "isActive",
        created_at as "createdAt", updated_at as "updatedAt",
        created_by as "createdBy"
    `,
      [username, email, passwordHash, role, firstName, lastName, companyId || null, photoUrl || null, createdBy || null]
    );

    return result.rows[0];
  }

  /**
   * Update a user
   */
  static async updateUser(
    id: string,
    updates: {
      email?: string;
      firstName?: string;
      lastName?: string;
      role?: UserRole;
      companyId?: string;
      photoUrl?: string;
      isActive?: boolean;
    }
  ): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.email !== undefined) {
      fields.push(`email = $${paramIndex}`);
      values.push(updates.email);
      paramIndex++;
    }
    if (updates.firstName !== undefined) {
      fields.push(`first_name = $${paramIndex}`);
      values.push(updates.firstName);
      paramIndex++;
    }
    if (updates.lastName !== undefined) {
      fields.push(`last_name = $${paramIndex}`);
      values.push(updates.lastName);
      paramIndex++;
    }
    if (updates.role !== undefined) {
      fields.push(`role = $${paramIndex}`);
      values.push(updates.role);
      paramIndex++;
    }
    if (updates.companyId !== undefined) {
      fields.push(`company_id = $${paramIndex}`);
      values.push(updates.companyId);
      paramIndex++;
    }
    if (updates.photoUrl !== undefined) {
      fields.push(`photo_url = $${paramIndex}`);
      values.push(updates.photoUrl);
      paramIndex++;
    }
    if (updates.isActive !== undefined) {
      fields.push(`is_active = $${paramIndex}`);
      values.push(updates.isActive);
      paramIndex++;
    }

    if (fields.length === 0) {
      return this.getUserById(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const pool = getPool();
    const result = await pool.query(
      `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING 
        id, username, email, role, company_id as "companyId",
        first_name as "firstName", last_name as "lastName",
        photo_url as "photoUrl", is_active as "isActive",
        created_at as "createdAt", updated_at as "updatedAt",
        created_by as "createdBy"
    `,
      values
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  /**
   * Delete a user (soft delete by deactivating)
   */
  static async deleteUser(id: string): Promise<boolean> {
    const pool = getPool();
    const result = await pool.query(
      `
      UPDATE users
      SET is_active = false, updated_at = NOW()
      WHERE id = $1
      RETURNING id
    `,
      [id]
    );

    return result.rows.length > 0;
  }

  /**
   * Update user password
   */
  static async updatePassword(id: string, passwordHash: string): Promise<boolean> {
    const pool = getPool();
    const result = await pool.query(
      `
      UPDATE users
      SET password_hash = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id
    `,
      [passwordHash, id]
    );

    return result.rows.length > 0;
  }
}
