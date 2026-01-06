import { User, UserRole, Company, AuthSession, CustomerType } from '../types';

/**
 * Authentication Service
 * Handles user authentication, authorization, and session management
 */

export class AuthService {
  // Mock storage for demo purposes
  private static users: User[] = [];
  private static companies: Company[] = [];
  private static currentSession: AuthSession | null = null;

  /**
   * Initialize with default system admin and companies
   */
  static initialize(): void {
    // Create default companies
    this.companies = [
      {
        id: 'company-wmnz',
        name: 'Waste Management NZ',
        type: CustomerType.WASTE_MANAGEMENT_NZ,
        contactEmail: 'contact@wastemanagement.co.nz',
        contactPhone: '+64 9 123 4567',
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: 'company-environz',
        name: 'enviroNZ',
        type: CustomerType.ENVIRONZ,
        contactEmail: 'info@environz.co.nz',
        contactPhone: '+64 9 765 4321',
        isActive: true,
        createdAt: new Date(),
      },
    ];

    // Create default system admin
    this.users = [
      {
        id: 'user-sysadmin',
        username: 'admin',
        email: 'admin@brrp.io',
        role: UserRole.SYSTEM_ADMIN,
        firstName: 'System',
        lastName: 'Administrator',
        isActive: true,
        createdAt: new Date(),
      },
    ];
  }

  /**
   * Login user
   */
  static login(username: string, password: string): AuthSession | null {
    // Simple password check for demo (in production, use proper hashing)
    const user = this.users.find(
      (u) => u.username === username && u.isActive
    );

    if (!user) {
      return null;
    }

    // For demo, accept any password for simplicity
    // In production, verify password hash
    
    const company = user.companyId
      ? this.companies.find((c) => c.id === user.companyId)
      : undefined;

    const session: AuthSession = {
      user,
      company,
      token: `token-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
    };

    this.currentSession = session;
    return session;
  }

  /**
   * Logout current user
   */
  static logout(): void {
    this.currentSession = null;
  }

  /**
   * Get current session
   */
  static getCurrentSession(): AuthSession | null {
    if (this.currentSession && this.currentSession.expiresAt > new Date()) {
      return this.currentSession;
    }
    this.currentSession = null;
    return null;
  }

  /**
   * Check if user has permission
   */
  static hasPermission(role: UserRole, requiredRole: UserRole): boolean {
    const roleHierarchy = {
      [UserRole.SYSTEM_ADMIN]: 3,
      [UserRole.COMPANY_ADMIN]: 2,
      [UserRole.OPERATOR]: 1,
    };

    return roleHierarchy[role] >= roleHierarchy[requiredRole];
  }

  /**
   * Create a new company (System Admin only)
   */
  static createCompany(
    name: string,
    type: CustomerType,
    contactEmail: string,
    contactPhone: string,
    address?: string
  ): Company | null {
    const session = this.getCurrentSession();
    if (!session || session.user.role !== UserRole.SYSTEM_ADMIN) {
      throw new Error('Only System Admins can create companies');
    }

    const company: Company = {
      id: `company-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      name,
      type,
      contactEmail,
      contactPhone,
      address,
      isActive: true,
      createdAt: new Date(),
    };

    this.companies.push(company);
    return company;
  }

  /**
   * Create a new user
   * System Admin can create any user
   * Company Admin can only create Operators for their company
   */
  static createUser(
    username: string,
    email: string,
    role: UserRole,
    firstName: string,
    lastName: string,
    companyId?: string
  ): User | null {
    const session = this.getCurrentSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    // Validation based on creator role
    if (session.user.role === UserRole.COMPANY_ADMIN) {
      // Company Admin can only create Operators for their own company
      if (role !== UserRole.OPERATOR) {
        throw new Error('Company Admins can only create Operators');
      }
      if (companyId !== session.user.companyId) {
        throw new Error('Company Admins can only create users for their own company');
      }
    } else if (session.user.role === UserRole.OPERATOR) {
      throw new Error('Operators cannot create users');
    }

    // Check if username already exists
    if (this.users.find((u) => u.username === username)) {
      throw new Error('Username already exists');
    }

    // Check if email already exists
    if (this.users.find((u) => u.email === email)) {
      throw new Error('Email already exists');
    }

    const user: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      username,
      email,
      role,
      companyId,
      firstName,
      lastName,
      isActive: true,
      createdAt: new Date(),
      createdBy: session.user.id,
    };

    this.users.push(user);
    return user;
  }

  /**
   * Get all companies (System Admin only)
   */
  static getAllCompanies(): Company[] {
    const session = this.getCurrentSession();
    if (!session || session.user.role !== UserRole.SYSTEM_ADMIN) {
      throw new Error('Only System Admins can view all companies');
    }
    return this.companies;
  }

  /**
   * Get users based on current user's role
   * System Admin: all users
   * Company Admin: users in their company
   * Operator: none
   */
  static getUsers(): User[] {
    const session = this.getCurrentSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    if (session.user.role === UserRole.SYSTEM_ADMIN) {
      return this.users;
    } else if (session.user.role === UserRole.COMPANY_ADMIN) {
      return this.users.filter((u) => u.companyId === session.user.companyId);
    } else {
      return []; // Operators can't view other users
    }
  }

  /**
   * Get company by ID
   */
  static getCompanyById(companyId: string): Company | undefined {
    return this.companies.find((c) => c.id === companyId);
  }

  /**
   * Update user status
   */
  static updateUserStatus(userId: string, isActive: boolean): boolean {
    const session = this.getCurrentSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    const user = this.users.find((u) => u.id === userId);
    if (!user) {
      return false;
    }

    // System Admin can update any user
    // Company Admin can only update users in their company
    if (session.user.role === UserRole.COMPANY_ADMIN) {
      if (user.companyId !== session.user.companyId) {
        throw new Error('Cannot update users from other companies');
      }
    } else if (session.user.role === UserRole.OPERATOR) {
      throw new Error('Operators cannot update users');
    }

    user.isActive = isActive;
    return true;
  }
}

// Initialize on module load
AuthService.initialize();
