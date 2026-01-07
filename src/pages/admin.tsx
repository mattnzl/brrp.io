import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AuthService } from '../services/auth';
import { User, Company, UserRole } from '../types';

/**
 * Admin Dashboard
 * - God privileges - full system access
 * - Manage companies, users, waste streams
 * - View energy and emissions data
 * - Full reporting and analytics
 */
export default function AdminDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'companies' | 'users' | 'waste' | 'energy' | 'emissions'>('overview');

  useEffect(() => {
    const session = AuthService.getCurrentSession();
    if (!session || session.user.role !== UserRole.ADMIN) {
      router.push('/login');
      return;
    }

    setCurrentUser(session.user);
  }, [router]);

  const handleLogout = () => {
    AuthService.logout();
    router.push('/login');
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard - BRRP.IO</title>
        <meta name="description" content="BRRP.IO System Administration" />
      </Head>

      <div className="dashboard">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <div className="logo-section">
              <h1>BRRP.IO</h1>
              <span className="subtitle">System Administration</span>
            </div>
            <div className="user-section">
              <span className="user-name">👑 {currentUser.firstName} {currentUser.lastName}</span>
              <span className="user-role">ADMIN</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={`tab ${activeTab === 'companies' ? 'active' : ''}`}
            onClick={() => setActiveTab('companies')}
          >
            🏢 Companies
          </button>
          <button 
            className={`tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Users
          </button>
          <button 
            className={`tab ${activeTab === 'waste' ? 'active' : ''}`}
            onClick={() => setActiveTab('waste')}
          >
            🗑️ Waste Tracking
          </button>
          <button 
            className={`tab ${activeTab === 'energy' ? 'active' : ''}`}
            onClick={() => setActiveTab('energy')}
          >
            ⚡ Energy Production
          </button>
          <button 
            className={`tab ${activeTab === 'emissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('emissions')}
          >
            🌱 Emissions Data
          </button>
        </nav>

        {/* Content Area */}
        <main className="content">
          {activeTab === 'overview' && (
            <div className="panel">
              <h2>System Overview</h2>
              <p>Welcome to the BRRP.IO administration dashboard.</p>
              
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">🏢</div>
                  <div className="stat-value">2</div>
                  <div className="stat-label">Active Companies</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🚛</div>
                  <div className="stat-value">0</div>
                  <div className="stat-label">Weighbridge Jobs</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⚡</div>
                  <div className="stat-value">-</div>
                  <div className="stat-label">Energy Production</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🌱</div>
                  <div className="stat-value">-</div>
                  <div className="stat-label">CO₂ Reduced</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'companies' && (
            <div className="panel">
              <h2>Company Management</h2>
              <p>Manage pre-registered waste companies.</p>
              <div className="placeholder">
                <p>Coming soon: Create, edit, and manage companies</p>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="panel">
              <h2>User Management</h2>
              <p>Manage system users (Admin, Customer, Driver roles).</p>
              <div className="placeholder">
                <p>Coming soon: Create and manage users</p>
              </div>
            </div>
          )}

          {activeTab === 'waste' && (
            <div className="panel">
              <h2>Waste Stream Tracking</h2>
              <p>Quantify waste by type, volume, and value.</p>
              <div className="placeholder">
                <p>Coming soon: View waste stream analytics and reports</p>
              </div>
            </div>
          )}

          {activeTab === 'energy' && (
            <div className="panel">
              <h2>Energy Production Data</h2>
              <p>BRRP plant energy generation over time (Admin only - not visible to customers).</p>
              <div className="placeholder">
                <p>Coming soon: Energy production charts and reports</p>
                <p className="note">This data is received from the BRRP plant via REST API</p>
              </div>
            </div>
          )}

          {activeTab === 'emissions' && (
            <div className="panel">
              <h2>Emissions Data</h2>
              <p>Real-time emissions calculations from SCADA system.</p>
              <div className="placeholder">
                <p>Coming soon: Emissions tracking and CO₂ reduction reports</p>
                <p className="note">This data is received from the SCADA system via REST API</p>
              </div>
            </div>
          )}
        </main>

        <style jsx>{`
          .dashboard {
            min-height: 100vh;
            background: #f5f5f5;
          }

          .header {
            background: linear-gradient(135deg, #7c2d12 0%, #991b1b 100%);
            color: white;
            padding: 1.5rem 2rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }

          .header-content {
            max-width: 1600px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .logo-section h1 {
            margin: 0;
            font-size: 2rem;
            background: linear-gradient(45deg, #fbbf24, #f59e0b);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .subtitle {
            display: block;
            margin-top: 0.25rem;
            font-size: 0.9rem;
            color: #fbbf24;
          }

          .user-section {
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .user-name {
            font-weight: 500;
          }

          .user-role {
            padding: 0.25rem 0.75rem;
            background: rgba(251, 191, 36, 0.2);
            border-radius: 12px;
            font-size: 0.85rem;
            color: #fbbf24;
            font-weight: 700;
          }

          .logout-btn {
            padding: 0.5rem 1rem;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 6px;
            color: white;
            cursor: pointer;
            transition: all 0.3s;
          }

          .logout-btn:hover {
            background: rgba(255, 255, 255, 0.2);
          }

          .tabs {
            background: white;
            padding: 0 2rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            display: flex;
            gap: 0.5rem;
            max-width: 1600px;
            margin: 0 auto;
            overflow-x: auto;
          }

          .tab {
            padding: 1rem 1.5rem;
            background: none;
            border: none;
            border-bottom: 3px solid transparent;
            cursor: pointer;
            font-size: 1rem;
            color: #666;
            transition: all 0.3s;
            white-space: nowrap;
          }

          .tab:hover {
            color: #991b1b;
            background: #f9fafb;
          }

          .tab.active {
            color: #991b1b;
            border-bottom-color: #fbbf24;
            font-weight: 600;
          }

          .content {
            max-width: 1600px;
            margin: 0 auto;
            padding: 2rem;
          }

          .panel {
            background: white;
            border-radius: 8px;
            padding: 2rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }

          .panel h2 {
            margin: 0 0 0.5rem 0;
            color: #7c2d12;
          }

          .panel p {
            margin: 0 0 1.5rem 0;
            color: #666;
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-top: 2rem;
          }

          .stat-card {
            background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 2rem;
            text-align: center;
          }

          .stat-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
          }

          .stat-value {
            font-size: 2.5rem;
            font-weight: 700;
            color: #991b1b;
            margin-bottom: 0.5rem;
          }

          .stat-label {
            font-size: 1rem;
            color: #6b7280;
            font-weight: 500;
          }

          .placeholder {
            padding: 3rem;
            background: #f9fafb;
            border: 2px dashed #d1d5db;
            border-radius: 8px;
            text-align: center;
          }

          .placeholder p {
            margin: 0.5rem 0;
            color: #6b7280;
            font-size: 1.1rem;
          }

          .note {
            margin-top: 1rem !important;
            font-size: 0.9rem !important;
            color: #f59e0b !important;
            font-style: italic;
          }

          @media (max-width: 768px) {
            .header-content {
              flex-direction: column;
              align-items: flex-start;
              gap: 1rem;
            }

            .stats-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </>
  );
}
