import { UserRole, User } from '../types';

/**
 * Permissions Service
 * Handles role-based access control for the BRRP.io platform
 * 
 * Role Hierarchy:
 * - SYSTEM_ADMIN: Full access to all data (God Mode)
 * - COMPANY_ADMIN: Manage company data, license plates, view fees/invoices
 * - OPERATOR: View company data, create waste jobs
 */

export class PermissionsService {
  /**
   * Check if user has permission for a specific action
   */
  static hasPermission(user: User, action: string, resourceOwnerId?: string): boolean {
    // System Admin has full access to everything
    if (user.role === UserRole.SYSTEM_ADMIN) {
      return true;
    }

    // Company Admin permissions
    if (user.role === UserRole.COMPANY_ADMIN) {
      switch (action) {
        case 'view:energy':
        case 'view:emissions':
          // Company Admins CANNOT see energy/emissions data
          return false;
        
        case 'view:waste_jobs':
        case 'create:waste_jobs':
        case 'update:waste_jobs':
        case 'view:invoices':
        case 'view:fees':
        case 'manage:license_plates':
        case 'view:users':
        case 'create:operators':
          // Company Admins can manage their own company data
          if (resourceOwnerId && resourceOwnerId !== user.companyId) {
            return false;
          }
          return true;
        
        case 'view:all_companies':
        case 'create:companies':
        case 'create:company_admins':
        case 'view:scada':
          return false;
        
        default:
          return false;
      }
    }

    // Operator permissions
    if (user.role === UserRole.OPERATOR) {
      switch (action) {
        case 'view:energy':
        case 'view:emissions':
          // Operators CANNOT see energy/emissions data
          return false;
        
        case 'view:waste_jobs':
        case 'create:waste_jobs':
          // Operators can view and create waste jobs for their company
          if (resourceOwnerId && resourceOwnerId !== user.companyId) {
            return false;
          }
          return true;
        
        case 'update:waste_jobs':
        case 'view:invoices':
        case 'view:fees':
        case 'manage:license_plates':
        case 'view:users':
        case 'create:operators':
        case 'view:all_companies':
        case 'create:companies':
        case 'create:company_admins':
        case 'view:scada':
          return false;
        
        default:
          return false;
      }
    }

    return false;
  }

  /**
   * Check if user can view energy/emissions data
   * Only System Admins can see this data
   */
  static canViewEnergyData(user: User): boolean {
    return user.role === UserRole.SYSTEM_ADMIN;
  }

  /**
   * Check if user can view all companies
   * Only System Admins can see all companies
   */
  static canViewAllCompanies(user: User): boolean {
    return user.role === UserRole.SYSTEM_ADMIN;
  }

  /**
   * Check if user can manage license plates for a company
   */
  static canManageLicensePlates(user: User, companyId: string): boolean {
    if (user.role === UserRole.SYSTEM_ADMIN) {
      return true;
    }
    
    if (user.role === UserRole.COMPANY_ADMIN && user.companyId === companyId) {
      return true;
    }
    
    return false;
  }

  /**
   * Check if user can create other users
   */
  static canCreateUser(user: User, targetRole: UserRole): boolean {
    if (user.role === UserRole.SYSTEM_ADMIN) {
      return true;
    }
    
    // Company Admins can only create Operators
    if (user.role === UserRole.COMPANY_ADMIN && targetRole === UserRole.OPERATOR) {
      return true;
    }
    
    return false;
  }

  /**
   * Get the company ID filter for data queries
   * Returns null for System Admins (no filter)
   * Returns company ID for Company Admins and Operators
   */
  static getCompanyFilter(user: User): string | null {
    if (user.role === UserRole.SYSTEM_ADMIN) {
      return null; // No filter - can see all
    }
    
    return user.companyId || null;
  }

  /**
   * Filter data based on user permissions
   * Removes energy/emissions data for non-admin users
   */
  static filterSensitiveData<T extends Record<string, any>>(
    user: User,
    data: T
  ): Partial<T> {
    if (user.role === UserRole.SYSTEM_ADMIN) {
      return data; // System Admin sees everything
    }

    // Remove energy and emissions data for Company Admins and Operators
    const filteredData = { ...data };
    
    // List of sensitive fields to remove
    const sensitiveFields = [
      'energyProduced',
      'electricityProduced',
      'processHeatProduced',
      'methaneGenerated',
      'methaneDestroyed',
      'co2Equivalent',
      'grossEmissionsReduction',
      'defValue',
      'globalWarmingPotential',
      'scadaMeasurementId',
      'emissionsDataId',
    ];

    sensitiveFields.forEach((field) => {
      if (field in filteredData) {
        delete filteredData[field];
      }
    });

    return filteredData;
  }

  /**
   * Validate if user can access a specific company's data
   */
  static canAccessCompanyData(user: User, companyId: string): boolean {
    if (user.role === UserRole.SYSTEM_ADMIN) {
      return true;
    }
    
    return user.companyId === companyId;
  }

  /**
   * Get user's accessible company IDs
   */
  static getAccessibleCompanyIds(user: User): string[] | null {
    if (user.role === UserRole.SYSTEM_ADMIN) {
      return null; // Can access all
    }
    
    if (user.companyId) {
      return [user.companyId];
    }
    
    return [];
  }
}
