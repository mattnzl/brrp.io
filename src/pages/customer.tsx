import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AuthService } from '../services/auth';
import { User, Company, UserRole } from '../types';

/**
 * Customer Portal
 * - Manage license plates (trucks)
 * - View fees and waste jobs
 * - NO access to energy/emissions data
 */
export default function CustomerPortal() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [activeTab, setActiveTab] = useState<'trucks' | 'drivers' | 'jobs' | 'invoices'>('trucks');

  useEffect(() => {
    const session = AuthService.getCurrentSession();
    if (!session || session.user.role !== UserRole.CUSTOMER) {
      router.push('/login');
      return;
    }

    setCurrentUser(session.user);
    setCurrentCompany(session.company || null);
  }, [router]);

  const handleLogout = () => {
    AuthService.logout();
    router.push('/login');
  };

  if (!currentUser || !currentCompany) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Customer Portal - BRRP.IO</title>
        <meta name="description" content="Manage your waste tracking operations" />
      </Head>

      <div className="dashboard">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <div className="logo-section">
              <h1>BRRP.IO</h1>
              <span className="company-name">{currentCompany.name}</span>
            </div>
            <div className="user-section">
              <span className="user-name">{currentUser.firstName} {currentUser.lastName}</span>
              <span className="user-role">{currentUser.role}</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="tabs">
          <button 
            className={`tab ${activeTab === 'trucks' ? 'active' : ''}`}
            onClick={() => setActiveTab('trucks')}
          >
            🚛 Trucks & License Plates
          </button>
          <button 
            className={`tab ${activeTab === 'drivers' ? 'active' : ''}`}
            onClick={() => setActiveTab('drivers')}
          >
            👤 Drivers
          </button>
          <button 
            className={`tab ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('jobs')}
          >
            📊 Waste Jobs & Fees
          </button>
          <button 
            className={`tab ${activeTab === 'invoices' ? 'active' : ''}`}
            onClick={() => setActiveTab('invoices')}
          >
            📄 Invoices
          </button>
        </nav>

        {/* Content Area */}
        <main className="content">
          {activeTab === 'trucks' && (
            <div className="panel">
              <h2>Truck & License Plate Management</h2>
              <p>Manage your company&apos;s trucks and license plates.</p>
              <div className="placeholder">
                <p>Coming soon: Add, edit, and manage truck registrations</p>
              </div>
            </div>
          )}

          {activeTab === 'drivers' && (
            <div className="panel">
              <h2>Driver Management</h2>
              <p>Manage drivers associated with your company.</p>
              <div className="placeholder">
                <p>Coming soon: Add, edit, and assign drivers</p>
              </div>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div className="panel">
              <h2>Waste Jobs & Fees</h2>
              <p>View your waste jobs and associated fees.</p>
              <div className="placeholder">
                <p>Coming soon: View waste jobs, weights, and fees</p>
                <p className="note">Note: Energy and emissions data is not visible to customers</p>
              </div>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="panel">
              <h2>Monthly Invoices</h2>
              <p>View and download your monthly invoices.</p>
              <div className="placeholder">
                <p>Coming soon: View monthly invoices and payment history</p>
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
            background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
            color: white;
            padding: 1.5rem 2rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }

          .header-content {
            max-width: 1400px;
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

          .company-name {
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
            text-transform: uppercase;
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
            max-width: 1400px;
            margin: 0 auto;
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
          }

          .tab:hover {
            color: #1e40af;
            background: #f9fafb;
          }

          .tab.active {
            color: #1e40af;
            border-bottom-color: #fbbf24;
            font-weight: 600;
          }

          .content {
            max-width: 1400px;
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
            color: #1e3a8a;
          }

          .panel p {
            margin: 0 0 1.5rem 0;
            color: #666;
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

            .tabs {
              overflow-x: auto;
            }

            .tab {
              white-space: nowrap;
            }
          }
        `}</style>
      </div>
    </>
  );
}
