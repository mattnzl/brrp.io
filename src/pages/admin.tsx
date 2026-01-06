import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AuthService } from '../services/auth';
import { User, Company, UserRole, CustomerType } from '../types';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'companies' | 'users'>('companies');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Company form state
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState<CustomerType>(CustomerType.WASTE_MANAGEMENT_NZ);
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');

  // User form state
  const [showUserForm, setShowUserForm] = useState(false);
  const [userUsername, setUserUsername] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<UserRole>(UserRole.COMPANY_ADMIN);
  const [userFirstName, setUserFirstName] = useState('');
  const [userLastName, setUserLastName] = useState('');
  const [userCompanyId, setUserCompanyId] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const session = AuthService.getCurrentSession();
    if (!session || session.user.role !== UserRole.SYSTEM_ADMIN) {
      router.push('/login');
      return;
    }

    setCurrentUser(session.user);
    loadData();
  }, [router]);

  const loadData = () => {
    try {
      setCompanies(AuthService.getAllCompanies());
      setUsers(AuthService.getUsers());
    } catch (err) {
      setError('Failed to load data');
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    localStorage.removeItem('authSession');
    router.push('/login');
  };

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      AuthService.createCompany(
        companyName,
        companyType,
        companyEmail,
        companyPhone,
        companyAddress
      );
      setSuccess('Company created successfully!');
      setShowCompanyForm(false);
      // Reset form
      setCompanyName('');
      setCompanyEmail('');
      setCompanyPhone('');
      setCompanyAddress('');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create company');
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      AuthService.createUser(
        userUsername,
        userEmail,
        userRole,
        userFirstName,
        userLastName,
        userCompanyId || undefined
      );
      setSuccess('User created successfully!');
      setShowUserForm(false);
      // Reset form
      setUserUsername('');
      setUserEmail('');
      setUserFirstName('');
      setUserLastName('');
      setUserCompanyId('');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    }
  };

  const handleToggleUserStatus = (userId: string, currentStatus: boolean) => {
    try {
      AuthService.updateUserStatus(userId, !currentStatus);
      setSuccess('User status updated');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to update user status');
    }
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>System Admin - BRRP.IO</title>
        <meta name="description" content="System Administration Dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container">
        <header className="header">
          <div className="logo">
            <h1>BRRP.IO</h1>
            <p className="tagline">System Administration</p>
          </div>
          <div className="user-info">
            <span className="user-name">{currentUser.firstName} {currentUser.lastName}</span>
            <span className="user-role">System Admin</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </header>

        <nav className="nav">
          <button 
            className={activeTab === 'companies' ? 'active' : ''} 
            onClick={() => setActiveTab('companies')}
          >
            Companies
          </button>
          <button 
            className={activeTab === 'users' ? 'active' : ''} 
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
        </nav>

        <main className="main">
          {error && (
            <div className="alert alert-error">
              {error}
              <button onClick={() => setError('')} className="close-btn">×</button>
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              {success}
              <button onClick={() => setSuccess('')} className="close-btn">×</button>
            </div>
          )}

          {activeTab === 'companies' && (
            <div className="section">
              <div className="section-header">
                <h2>Companies</h2>
                <button onClick={() => setShowCompanyForm(!showCompanyForm)} className="add-btn">
                  {showCompanyForm ? 'Cancel' : '+ Add Company'}
                </button>
              </div>

              {showCompanyForm && (
                <div className="form-card">
                  <h3>Create New Company</h3>
                  <form onSubmit={handleCreateCompany}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Company Name *</label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Type *</label>
                        <select
                          value={companyType}
                          onChange={(e) => setCompanyType(e.target.value as CustomerType)}
                          required
                        >
                          <option value={CustomerType.WASTE_MANAGEMENT_NZ}>Waste Management NZ</option>
                          <option value={CustomerType.ENVIRONZ}>enviroNZ</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Contact Email *</label>
                        <input
                          type="email"
                          value={companyEmail}
                          onChange={(e) => setCompanyEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Contact Phone *</label>
                        <input
                          type="tel"
                          value={companyPhone}
                          onChange={(e) => setCompanyPhone(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Address</label>
                      <input
                        type="text"
                        value={companyAddress}
                        onChange={(e) => setCompanyAddress(e.target.value)}
                      />
                    </div>

                    <button type="submit" className="submit-btn">Create Company</button>
                  </form>
                </div>
              )}

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Company Name</th>
                      <th>Type</th>
                      <th>Contact Email</th>
                      <th>Contact Phone</th>
                      <th>Status</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map((company) => (
                      <tr key={company.id}>
                        <td>{company.name}</td>
                        <td>{company.type === CustomerType.WASTE_MANAGEMENT_NZ ? 'WM NZ' : 'enviroNZ'}</td>
                        <td>{company.contactEmail}</td>
                        <td>{company.contactPhone}</td>
                        <td>
                          <span className={`status-badge ${company.isActive ? 'active' : 'inactive'}`}>
                            {company.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>{new Date(company.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="section">
              <div className="section-header">
                <h2>Users</h2>
                <button onClick={() => setShowUserForm(!showUserForm)} className="add-btn">
                  {showUserForm ? 'Cancel' : '+ Add User'}
                </button>
              </div>

              {showUserForm && (
                <div className="form-card">
                  <h3>Create New User</h3>
                  <form onSubmit={handleCreateUser}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Username *</label>
                        <input
                          type="text"
                          value={userUsername}
                          onChange={(e) => setUserUsername(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Email *</label>
                        <input
                          type="email"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>First Name *</label>
                        <input
                          type="text"
                          value={userFirstName}
                          onChange={(e) => setUserFirstName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Last Name *</label>
                        <input
                          type="text"
                          value={userLastName}
                          onChange={(e) => setUserLastName(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Role *</label>
                        <select
                          value={userRole}
                          onChange={(e) => setUserRole(e.target.value as UserRole)}
                          required
                        >
                          <option value={UserRole.SYSTEM_ADMIN}>System Admin</option>
                          <option value={UserRole.COMPANY_ADMIN}>Company Admin</option>
                          <option value={UserRole.OPERATOR}>Operator</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Company {(userRole === UserRole.COMPANY_ADMIN || userRole === UserRole.OPERATOR) && '*'}</label>
                        <select
                          value={userCompanyId}
                          onChange={(e) => setUserCompanyId(e.target.value)}
                          required={userRole === UserRole.COMPANY_ADMIN || userRole === UserRole.OPERATOR}
                          disabled={userRole === UserRole.SYSTEM_ADMIN}
                        >
                          <option value="">Select company...</option>
                          {companies.map((company) => (
                            <option key={company.id} value={company.id}>
                              {company.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button type="submit" className="submit-btn">Create User</button>
                  </form>
                </div>
              )}

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Company</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => {
                      const company = user.companyId ? companies.find(c => c.id === user.companyId) : null;
                      return (
                        <tr key={user.id}>
                          <td>{user.username}</td>
                          <td>{user.firstName} {user.lastName}</td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`role-badge role-${user.role.toLowerCase()}`}>
                              {user.role.replace('_', ' ')}
                            </span>
                          </td>
                          <td>{company?.name || '-'}</td>
                          <td>
                            <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                              className="action-btn"
                            >
                              {user.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>

        <style jsx>{`
          .container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
            color: white;
          }

          .header {
            padding: 2rem;
            background: rgba(0, 0, 0, 0.3);
            border-bottom: 2px solid rgba(255, 255, 255, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .logo h1 {
            margin: 0;
            font-size: 2.5rem;
            font-weight: bold;
            background: linear-gradient(45deg, #fbbf24, #f59e0b);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .tagline {
            margin: 0.5rem 0 0 0;
            font-size: 1rem;
            color: #fbbf24;
          }

          .user-info {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 0.5rem;
          }

          .user-name {
            font-weight: 600;
            font-size: 1.1rem;
          }

          .user-role {
            font-size: 0.9rem;
            opacity: 0.8;
          }

          .logout-btn {
            padding: 0.5rem 1rem;
            background: rgba(239, 68, 68, 0.2);
            border: 1px solid #ef4444;
            color: #fca5a5;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.3s;
          }

          .logout-btn:hover {
            background: rgba(239, 68, 68, 0.3);
          }

          .nav {
            padding: 1rem 2rem;
            display: flex;
            gap: 1rem;
            background: rgba(0, 0, 0, 0.2);
          }

          .nav button {
            padding: 0.75rem 1.5rem;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.3s;
          }

          .nav button:hover {
            background: rgba(255, 255, 255, 0.2);
          }

          .nav button.active {
            background: linear-gradient(45deg, #fbbf24, #f59e0b);
            border-color: #fbbf24;
            font-weight: bold;
            color: #1e3a8a;
          }

          .main {
            flex: 1;
            padding: 2rem;
          }

          .alert {
            padding: 1rem;
            margin-bottom: 1.5rem;
            border-radius: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .alert-error {
            background: rgba(239, 68, 68, 0.2);
            border: 1px solid #ef4444;
            color: #fca5a5;
          }

          .alert-success {
            background: rgba(16, 185, 129, 0.2);
            border: 1px solid #10b981;
            color: #6ee7b7;
          }

          .close-btn {
            background: none;
            border: none;
            color: inherit;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
          }

          .section {
            max-width: 1400px;
            margin: 0 auto;
          }

          .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
          }

          h2 {
            font-size: 2.5rem;
            margin: 0;
          }

          .add-btn {
            padding: 0.75rem 1.5rem;
            background: linear-gradient(45deg, #10b981, #059669);
            border: none;
            color: white;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s;
          }

          .add-btn:hover {
            transform: translateY(-2px);
          }

          .form-card {
            background: rgba(255, 255, 255, 0.1);
            padding: 2rem;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            margin-bottom: 2rem;
          }

          .form-card h3 {
            margin: 0 0 1.5rem 0;
            color: #fbbf24;
          }

          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }

          .form-group {
            margin-bottom: 1.5rem;
          }

          label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
          }

          input, select {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 6px;
            background: rgba(0, 0, 0, 0.2);
            color: white;
            font-size: 1rem;
          }

          input:focus, select:focus {
            outline: none;
            border-color: #fbbf24;
          }

          .submit-btn {
            width: 100%;
            padding: 1rem;
            background: linear-gradient(45deg, #fbbf24, #f59e0b);
            border: none;
            border-radius: 6px;
            color: #1e3a8a;
            font-weight: bold;
            font-size: 1.1rem;
            cursor: pointer;
            transition: transform 0.2s;
          }

          .submit-btn:hover {
            transform: translateY(-2px);
          }

          .table-container {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            overflow-x: auto;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          thead {
            background: rgba(0, 0, 0, 0.3);
          }

          th {
            padding: 1rem;
            text-align: left;
            font-weight: 600;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }

          td {
            padding: 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          }

          tbody tr:hover {
            background: rgba(255, 255, 255, 0.05);
          }

          .status-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.85rem;
            font-weight: 600;
          }

          .status-badge.active {
            background: rgba(16, 185, 129, 0.2);
            color: #10b981;
            border: 1px solid #10b981;
          }

          .status-badge.inactive {
            background: rgba(156, 163, 175, 0.2);
            color: #9ca3af;
            border: 1px solid #9ca3af;
          }

          .role-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.85rem;
            font-weight: 600;
            text-transform: capitalize;
          }

          .role-badge.role-system_admin {
            background: rgba(139, 92, 246, 0.2);
            color: #a78bfa;
            border: 1px solid #a78bfa;
          }

          .role-badge.role-company_admin {
            background: rgba(59, 130, 246, 0.2);
            color: #60a5fa;
            border: 1px solid #60a5fa;
          }

          .role-badge.role-operator {
            background: rgba(251, 191, 36, 0.2);
            color: #fbbf24;
            border: 1px solid #fbbf24;
          }

          .action-btn {
            padding: 0.5rem 1rem;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.3s;
          }

          .action-btn:hover {
            background: rgba(255, 255, 255, 0.2);
          }

          @media (max-width: 768px) {
            .form-row {
              grid-template-columns: 1fr;
            }

            .header {
              flex-direction: column;
              gap: 1rem;
              align-items: flex-start;
            }

            .table-container {
              overflow-x: scroll;
            }
          }
        `}</style>
      </div>
    </>
  );
}
