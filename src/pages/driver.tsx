import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AuthService } from '../services/auth';
import { User, Company, UserRole } from '../types';

/**
 * Driver View
 * - View assigned jobs
 * - Minimal interface for operational use
 */
export default function DriverView() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);

  useEffect(() => {
    const session = AuthService.getCurrentSession();
    if (!session || session.user.role !== UserRole.DRIVER) {
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
        <title>Driver View - BRRP.IO</title>
        <meta name="description" content="View your assigned jobs" />
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
              <span className="user-name">👤 {currentUser.firstName} {currentUser.lastName}</span>
              <span className="user-role">{currentUser.role}</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="content">
          <div className="panel">
            <h2>My Assigned Jobs</h2>
            <p>View your current and past waste delivery jobs.</p>
            
            <div className="placeholder">
              <div className="icon">🚛</div>
              <p className="message">No jobs assigned yet</p>
              <p className="sub-message">Check back later for your assigned deliveries</p>
            </div>
          </div>

          <div className="info-panel">
            <h3>Driver Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Name:</span>
                <span className="value">{currentUser.firstName} {currentUser.lastName}</span>
              </div>
              <div className="info-item">
                <span className="label">Company:</span>
                <span className="value">{currentCompany.name}</span>
              </div>
              <div className="info-item">
                <span className="label">Email:</span>
                <span className="value">{currentUser.email}</span>
              </div>
            </div>
          </div>
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
            max-width: 1200px;
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

          .content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
          }

          .panel {
            background: white;
            border-radius: 8px;
            padding: 2rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            margin-bottom: 1.5rem;
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
            padding: 4rem 2rem;
            background: #f9fafb;
            border: 2px dashed #d1d5db;
            border-radius: 8px;
            text-align: center;
          }

          .icon {
            font-size: 4rem;
            margin-bottom: 1rem;
          }

          .message {
            margin: 0 0 0.5rem 0 !important;
            font-size: 1.25rem !important;
            font-weight: 600;
            color: #374151 !important;
          }

          .sub-message {
            margin: 0 !important;
            color: #6b7280 !important;
            font-size: 1rem !important;
          }

          .info-panel {
            background: white;
            border-radius: 8px;
            padding: 2rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }

          .info-panel h3 {
            margin: 0 0 1.5rem 0;
            color: #1e3a8a;
          }

          .info-grid {
            display: grid;
            gap: 1rem;
          }

          .info-item {
            display: flex;
            justify-content: space-between;
            padding: 0.75rem;
            background: #f9fafb;
            border-radius: 6px;
          }

          .label {
            font-weight: 600;
            color: #6b7280;
          }

          .value {
            color: #1e3a8a;
          }

          @media (max-width: 768px) {
            .header-content {
              flex-direction: column;
              align-items: flex-start;
              gap: 1rem;
            }

            .content {
              padding: 1rem;
            }
          }
        `}</style>
      </div>
    </>
  );
}
