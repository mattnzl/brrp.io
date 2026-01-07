import { User, UserRole, Company, AuthSession } from '../types';

/**
 * Authentication Service - Rewritten for BRRP.IO Waste Tracking
 * Three roles: admin (god privileges), customer (company user), driver (operational)
 */

export class AuthService {
  // Mock storage for demo purposes
  private static users: User[] = [];
  private static companies: Company[] = [];
  private static currentSession: AuthSession | null = null;

  /**
   * Initialize with default admin and demo companies
   */
  static initialize(): void {
    // Create demo companies (waste companies)
    this.companies = [
      {
        id: 'company-wmnz-001',
        name: 'Waste Management NZ Ltd',
        businessNumber: 'NZ123456789',
        contactEmail: 'accounts@wmnz.co.nz',
        contactPhone: '+64 4 123 4567',
        address: '123 Waste Lane, Wellington, New Zealand',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'company-env-001',
        name: 'EnviroNZ Limited',
        businessNumber: 'NZ987654321',
        contactEmail: 'info@environz.co.nz',
        contactPhone: '+64 9 765 4321',
        address: '456 Green Street, Auckland, New Zealand',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Create default users
    this.users = [
      {
        id: 'user-admin-001',
        username: 'admin',
        email: 'admin@brrp.io',
        role: UserRole.ADMIN,
        firstName: 'System',
        lastName: 'Administrator',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'user-customer-wmnz-001',
        username: 'wmnz_customer',
        email: 'customer@wmnz.co.nz',
        role: UserRole.CUSTOMER,
        companyId: 'company-wmnz-001',
        firstName: 'John',
        lastName: 'Smith',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'user-driver-001',
        username: 'driver1',
        email: 'driver1@wmnz.co.nz',
        role: UserRole.DRIVER,
        companyId: 'company-wmnz-001',
        firstName: 'Mike',
        lastName: 'Johnson',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  /**
   * Login user
   */
  static login(username: string, password: string): AuthSession | null {
    const user = this.users.find(
      (u) => u.username === username && u.isActive
    );

    if (!user) {
      return null;
    }

    // For demo, accept any password
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
   * Admin has god privileges (can do everything)
   * Customer can manage their company data
   * Driver has limited access
   */
  static hasPermission(role: UserRole, requiredRole: UserRole): boolean {
    const roleHierarchy = {
      [UserRole.ADMIN]: 3,
      [UserRole.CUSTOMER]: 2,
      [UserRole.DRIVER]: 1,
    };

    return roleHierarchy[role] >= roleHierarchy[requiredRole];
  }

  /**
   * Create a new company (Admin only)
   */
  static createCompany(
    name: string,
    contactEmail: string,
    contactPhone: string,
    businessNumber?: string,
    address?: string
  ): Company | null {
    const session = this.getCurrentSession();
    if (!session || session.user.role !== UserRole.ADMIN) {
      throw new Error('Only Admins can create companies');
    }

    const company: Company = {
      id: `company-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      name,
      businessNumber,
      contactEmail,
      contactPhone,
      address,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.companies.push(company);
    return company;
  }

  /**
   * Create a new user
   * Admin can create any user
   * Customer can create drivers for their company
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
    if (session.user.role === UserRole.CUSTOMER) {
      // Customer can only create drivers for their own company
      if (role !== UserRole.DRIVER) {
        throw new Error('Customers can only create drivers');
      }
      if (companyId !== session.user.companyId) {
        throw new Error('Customers can only create users for their own company');
      }
    } else if (session.user.role === UserRole.DRIVER) {
      throw new Error('Drivers cannot create users');
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
      updatedAt: new Date(),
    };

    this.users.push(user);
    return user;
  }

  /**
   * Get all companies (Admin only)
   */
  static getAllCompanies(): Company[] {
    const session = this.getCurrentSession();
    if (!session || session.user.role !== UserRole.ADMIN) {
      throw new Error('Only Admins can view all companies');
    }
    return this.companies;
  }

  /**
   * Get users based on current user's role
   * Admin: all users
   * Customer: users in their company
   * Driver: none
   */
  static getUsers(): User[] {
    const session = this.getCurrentSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    if (session.user.role === UserRole.ADMIN) {
      return this.users;
    } else if (session.user.role === UserRole.CUSTOMER) {
      return this.users.filter((u) => u.companyId === session.user.companyId);
    } else {
      return []; // Drivers can't view other users
    }
  }

  /**
   * Get company by ID
   */
  static getCompanyById(companyId: string): Company | undefined {
    return this.companies.find((c) => c.id === companyId);
  }

  /**
   * Update user status (Admin only, or Customer for their company)
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

    // Admin can update any user
    // Customer can only update users in their company
    if (session.user.role === UserRole.CUSTOMER) {
      if (user.companyId !== session.user.companyId) {
        throw new Error('Cannot update users from other companies');
      }
    } else if (session.user.role === UserRole.DRIVER) {
      throw new Error('Drivers cannot update users');
    }

    user.isActive = isActive;
    user.updatedAt = new Date();
    return true;
  }
}

// Initialize on module load
AuthService.initialize();
