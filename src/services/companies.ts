import { Company, CustomerType } from '../types';
import { getPool } from '../lib/db';

/**
 * Companies Service
 * Handles company management and license plate validation
 */

export class CompaniesService {
  /**
   * Get all companies
   */
  static async getAllCompanies(): Promise<Company[]> {
    const pool = getPool();
    const result = await pool.query(`
      SELECT 
        id, name, type, contact_email as "contactEmail",
        contact_phone as "contactPhone", address, is_active as "isActive",
        created_at as "createdAt"
      FROM companies
      WHERE is_active = true
      ORDER BY name ASC
    `);

    return result.rows;
  }

  /**
   * Get company by ID
   */
  static async getCompanyById(id: string): Promise<Company | null> {
    const pool = getPool();
    const result = await pool.query(
      `
      SELECT 
        id, name, type, contact_email as "contactEmail",
        contact_phone as "contactPhone", address, is_active as "isActive",
        created_at as "createdAt"
      FROM companies
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
   * Create a new company
   */
  static async createCompany(
    name: string,
    type: CustomerType,
    contactEmail: string,
    contactPhone: string,
    address?: string
  ): Promise<Company> {
    const pool = getPool();
    const result = await pool.query(
      `
      INSERT INTO companies (name, type, contact_email, contact_phone, address, is_active)
      VALUES ($1, $2, $3, $4, $5, true)
      RETURNING 
        id, name, type, contact_email as "contactEmail",
        contact_phone as "contactPhone", address, is_active as "isActive",
        created_at as "createdAt"
    `,
      [name, type, contactEmail, contactPhone, address || null]
    );

    return result.rows[0];
  }

  /**
   * Update company
   */
  static async updateCompany(
    id: string,
    updates: {
      name?: string;
      contactEmail?: string;
      contactPhone?: string;
      address?: string;
      isActive?: boolean;
    }
  ): Promise<Company | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramIndex}`);
      values.push(updates.name);
      paramIndex++;
    }
    if (updates.contactEmail !== undefined) {
      fields.push(`contact_email = $${paramIndex}`);
      values.push(updates.contactEmail);
      paramIndex++;
    }
    if (updates.contactPhone !== undefined) {
      fields.push(`contact_phone = $${paramIndex}`);
      values.push(updates.contactPhone);
      paramIndex++;
    }
    if (updates.address !== undefined) {
      fields.push(`address = $${paramIndex}`);
      values.push(updates.address);
      paramIndex++;
    }
    if (updates.isActive !== undefined) {
      fields.push(`is_active = $${paramIndex}`);
      values.push(updates.isActive);
      paramIndex++;
    }

    if (fields.length === 0) {
      return this.getCompanyById(id);
    }

    values.push(id);

    const pool = getPool();
    const result = await pool.query(
      `
      UPDATE companies
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING 
        id, name, type, contact_email as "contactEmail",
        contact_phone as "contactPhone", address, is_active as "isActive",
        created_at as "createdAt"
    `,
      values
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  /**
   * Register a license plate for a company
   */
  static async registerLicensePlate(
    companyId: string,
    licensePlate: string,
    createdBy?: string
  ): Promise<{ id: string; companyId: string; licensePlate: string; isActive: boolean }> {
    const pool = getPool();
    const result = await pool.query(
      `
      INSERT INTO company_license_plates (company_id, license_plate, is_active, created_by)
      VALUES ($1, $2, true, $3)
      ON CONFLICT (company_id, license_plate) 
      DO UPDATE SET is_active = true
      RETURNING 
        id, company_id as "companyId", license_plate as "licensePlate", is_active as "isActive"
    `,
      [companyId, licensePlate.toUpperCase(), createdBy || null]
    );

    return result.rows[0];
  }

  /**
   * Validate if a license plate belongs to a company
   */
  static async validateLicensePlate(licensePlate: string): Promise<{
    valid: boolean;
    companyId?: string;
    companyName?: string;
  }> {
    const pool = getPool();
    const result = await pool.query(
      `
      SELECT 
        clp.company_id as "companyId",
        c.name as "companyName"
      FROM company_license_plates clp
      JOIN companies c ON c.id = clp.company_id
      WHERE clp.license_plate = $1
        AND clp.is_active = true
        AND c.is_active = true
      LIMIT 1
    `,
      [licensePlate.toUpperCase()]
    );

    if (result.rows.length === 0) {
      return { valid: false };
    }

    return {
      valid: true,
      companyId: result.rows[0].companyId,
      companyName: result.rows[0].companyName,
    };
  }

  /**
   * Get all license plates for a company
   */
  static async getCompanyLicensePlates(companyId: string): Promise<
    Array<{
      id: string;
      licensePlate: string;
      isActive: boolean;
      createdAt: Date;
    }>
  > {
    const pool = getPool();
    const result = await pool.query(
      `
      SELECT 
        id, license_plate as "licensePlate", is_active as "isActive", created_at as "createdAt"
      FROM company_license_plates
      WHERE company_id = $1
      ORDER BY created_at DESC
    `,
      [companyId]
    );

    return result.rows;
  }

  /**
   * Deactivate a license plate
   */
  static async deactivateLicensePlate(id: string): Promise<boolean> {
    const pool = getPool();
    const result = await pool.query(
      `
      UPDATE company_license_plates
      SET is_active = false
      WHERE id = $1
      RETURNING id
    `,
      [id]
    );

    return result.rows.length > 0;
  }
}
