import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AuthService } from '../services/auth';
import { User, UserRole } from '../types';

export default function CompanyAdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [companyName, setCompanyName] = useState('');

  // User form state
  const [showUserForm, setShowUserForm] = useState(false);
  const [userUsername, setUserUsername] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userFirstName, setUserFirstName] = useState('');
  const [userLastName, setUserLastName] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const session = AuthService.getCurrentSession();
    if (!session || session.user.role !== UserRole.COMPANY_ADMIN) {
      router.push('/login');
      return;
    }

    setCurrentUser(session.user);
    if (session.company) {
      setCompanyName(session.company.name);
    }
    loadData();
  }, [router]);

  const loadData = () => {
    try {
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

  const handleCreateOperator = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      AuthService.createUser(
        userUsername,
        userEmail,
        UserRole.OPERATOR,
        userFirstName,
        userLastName,
        currentUser?.companyId
      );
      setSuccess('Operator created successfully!');
      setShowUserForm(false);
      // Reset form
      setUserUsername('');
      setUserEmail('');
      setUserFirstName('');
      setUserLastName('');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create operator');
    }
  };

  const handleToggleUserStatus = (userId: string, currentStatus: boolean) => {
    try {
      AuthService.updateUserStatus(userId, !currentStatus);
      setSuccess('Operator status updated');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to update operator status');
    }
  };

  const goToWasteJobs = () => {
    router.push('/waste-jobs');
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Company Admin - BRRP.IO</title>
        <meta name="description" content="Company Administration Dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container">
        <header className="header">
          <div className="logo">
            <h1>BRRP.IO</h1>
            <p className="tagline">Company Administration - {companyName}</p>
          </div>
          <div className="user-info">
            <span className="user-name">{currentUser.firstName} {currentUser.lastName}</span>
            <span className="user-role">Company Admin</span>
            <div className="button-group">
              <button onClick={goToWasteJobs} className="nav-btn">Waste Jobs 🚛</button>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          </div>
        </header>

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

          <div className="section">
            <div className="section-header">
              <h2>Operators (Truck Drivers)</h2>
              <button onClick={() => setShowUserForm(!showUserForm)} className="add-btn">
                {showUserForm ? 'Cancel' : '+ Add Operator'}
              </button>
            </div>

            {showUserForm && (
              <div className="form-card">
                <h3>Create New Operator</h3>
                <form onSubmit={handleCreateOperator}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Username *</label>
                      <input
                        type="text"
                        value={userUsername}
                        onChange={(e) => setUserUsername(e.target.value)}
                        placeholder="e.g., driver123"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email *</label>
                      <input
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="e.g., driver@company.com"
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

                  <button type="submit" className="submit-btn">Create Operator</button>
                </form>
              </div>
            )}

            <div className="table-container">
              {users.length === 0 ? (
                <div className="empty-state">
                  <p>No operators created yet.</p>
                  <p>Click &quot;Add Operator&quot; to create a truck driver account.</p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.username}</td>
                        <td>{user.firstName} {user.lastName}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button
                            onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                            className="action-btn"
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
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

          .button-group {
            display: flex;
            gap: 0.5rem;
          }

          .nav-btn {
            padding: 0.5rem 1rem;
            background: linear-gradient(45deg, #10b981, #059669);
            border: none;
            color: white;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 600;
            transition: all 0.3s;
          }

          .nav-btn:hover {
            transform: translateY(-2px);
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
            max-width: 1400px;
            margin-left: auto;
            margin-right: auto;
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

          input {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 6px;
            background: rgba(0, 0, 0, 0.2);
            color: white;
            font-size: 1rem;
          }

          input::placeholder {
            color: rgba(255, 255, 255, 0.5);
          }

          input:focus {
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
            min-height: 200px;
          }

          .empty-state {
            text-align: center;
            padding: 4rem 2rem;
          }

          .empty-state p {
            margin: 0.5rem 0;
            font-size: 1.1rem;
            opacity: 0.8;
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

            .user-info {
              align-items: flex-start;
            }
          }
        `}</style>
      </div>
    </>
  );
}
