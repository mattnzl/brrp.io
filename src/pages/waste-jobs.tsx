import Head from 'next/head';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { WasteStreamType, Customer, User, UserRole } from '../types';
import { WasteJobsService } from '../services/wasteJobs';
import { AuthService } from '../services/auth';

// API response types
type WasteJobAPI = {
  id: string;
  jobNumber: string;
  customerId: string;
  customerName: string;
  customerType: string;
  wasteStream: string;
  truckRegistration: string;
  weighbridgeWeight: number;
  status: string;
  totalPrice: number;
  notes?: string;
  companyId?: string;
  companyName?: string;
  createdAt: string;
};

export default function WasteJobs() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'All' | 'Pending Approval' | 'Approved' | 'Rejected'>('All');
  const [wasteJobs, setWasteJobs] = useState<WasteJobAPI[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentCompanyName, setCurrentCompanyName] = useState('');
  const [currentCompanyId, setCurrentCompanyId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Form state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedWasteStream, setSelectedWasteStream] = useState<WasteStreamType | ''>('');
  const [truckRegistration, setTruckRegistration] = useState('');
  const [weighbridgeWeight, setWeighbridgeWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState('');
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());

  const customers = WasteJobsService.getAvailableCustomers();
  const wasteStreamProperties = WasteJobsService.getWasteStreamProperties();

  const fetchWasteJobs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const status = activeTab === 'All' ? '' : activeTab;
      const response = await fetch(`/api/waste-jobs?status=${status}&page=1&perPage=100`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch waste jobs');
      }
      
      const data = await response.json();
      setWasteJobs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load waste jobs');
      console.error('Error fetching waste jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    const session = AuthService.getCurrentSession();
    if (!session) {
      router.push('/login');
      return;
    }

    setCurrentUser(session.user);
    
    // Set company info if user is associated with a company
    if (session.company) {
      setCurrentCompanyName(session.company.name);
      setCurrentCompanyId(session.company.id);
      // Note: Customer selection is independent of user's company
      // The "Customer" here refers to waste collection companies (Waste Management NZ, enviroNZ)
      // which are separate entities from the user's organization
      // Users must manually select the appropriate waste collection customer for each job
    }

    // Fetch waste jobs from API
    fetchWasteJobs();
  }, [router, customers, fetchWasteJobs]);

  // Refetch when tab changes
  useEffect(() => {
    if (currentUser) {
      fetchWasteJobs();
    }
  }, [activeTab, currentUser, fetchWasteJobs]);

  const handleLogout = () => {
    AuthService.logout();
    localStorage.removeItem('authSession');
    router.push('/login');
  };

  const goToHome = () => {
    router.push('/');
  };

  const goToAdminDashboard = () => {
    if (currentUser?.role === UserRole.ADMIN) {
      router.push('/admin');
    } else if (currentUser?.role === UserRole.CUSTOMER) {
      router.push('/company-admin');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setValidationError('');
    
    // Validate form
    if (!selectedCustomer || !selectedWasteStream || !weighbridgeWeight || !truckRegistration) {
      setValidationError('Please fill in all required fields');
      return;
    }

    const weight = parseFloat(weighbridgeWeight);
    if (isNaN(weight) || weight <= 0) {
      setValidationError('Please enter a valid weight greater than 0');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/waste-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer: selectedCustomer,
          wasteStream: selectedWasteStream,
          truckRegistration,
          weighbridgeWeight: weight,
          notes: notes || undefined,
          companyId: currentCompanyId || undefined,
          companyName: currentCompanyName || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create waste job');
      }

      // Reset form
      if (currentUser?.role === UserRole.ADMIN) {
        setSelectedCustomer(null);
      }
      setSelectedWasteStream('');
      setTruckRegistration('');
      setWeighbridgeWeight('');
      setNotes('');
      setValidationError('');
      setShowCreateForm(false);
      
      // Refresh the list
      await fetchWasteJobs();
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : 'Failed to create waste job');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/waste-jobs/${jobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }

      // Refresh the list
      await fetchWasteJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedJobs(new Set(filteredJobs.map(job => job.id)));
    } else {
      setSelectedJobs(new Set());
    }
  };

  const handleSelectJob = (jobId: string) => {
    const newSelected = new Set(selectedJobs);
    if (newSelected.has(jobId)) {
      newSelected.delete(jobId);
    } else {
      newSelected.add(jobId);
    }
    setSelectedJobs(newSelected);
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  const estimatedPrice = selectedWasteStream && weighbridgeWeight
    ? WasteJobsService.calculatePrice(selectedWasteStream as WasteStreamType, parseFloat(weighbridgeWeight) || 0)
    : 0;

  // Filter jobs based on active tab
  const filteredJobs = wasteJobs;

  // Calculate summary stats
  const totalJobs = wasteJobs.length;
  const pendingCount = wasteJobs.filter(j => j.status === 'Pending Approval').length;
  const approvedCount = wasteJobs.filter(j => j.status === 'Approved').length;
  const rejectedCount = wasteJobs.filter(j => j.status === 'Rejected').length;

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

  return (
    <>
      <Head>
        <title>Waste Jobs - BRRP.IO</title>
        <meta name="description" content="Waste Jobs Management" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container">
        <header className="header">
          <div className="logo">
            <h1>BRRP.IO</h1>
            <p className="tagline">
              Waste Jobs Management
              {currentCompanyName && ` - ${currentCompanyName}`}
            </p>
          </div>
          <div className="user-info">
            <span className="user-name">{currentUser.firstName} {currentUser.lastName}</span>
            <span className="user-role">
              {/* Display friendly role names - CUSTOMER role represents Company Admins */}
              {currentUser.role === UserRole.ADMIN && 'System Admin'}
              {currentUser.role === UserRole.CUSTOMER && 'Company Admin'}
              {currentUser.role === UserRole.DRIVER && 'Driver'}
            </span>
            <div className="button-group">
              <button onClick={goToHome} className="nav-btn">Home</button>
              {(currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.CUSTOMER) && (
                <button onClick={goToAdminDashboard} className="admin-btn">
                  {currentUser.role === UserRole.ADMIN ? 'Admin Dashboard' : 'Manage Company'}
                </button>
              )}
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          </div>
        </header>

        <main className="main">
          {/* Breadcrumb and header */}
          <div className="page-header">
            <div className="breadcrumb">
              <span className="breadcrumb-item" onClick={goToHome}>Home</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-item active">Waste Jobs</span>
            </div>
            <div className="header-actions">
              <button className="create-btn" onClick={() => setShowCreateForm(!showCreateForm)}>
                {showCreateForm ? 'Cancel' : '+ New Waste Job'}
              </button>
              <button className="export-btn">Export Report</button>
            </div>
          </div>

          {/* Create form modal/section */}
          {showCreateForm && (
            <div className="create-form-section">
              <div className="form-card">
                <h3>Create New Waste Job</h3>
                {validationError && (
                  <div className="validation-error">
                    {validationError}
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Customer *</label>
                      <select 
                        value={selectedCustomer?.id || ''} 
                        onChange={(e) => {
                          const customer = customers.find(c => c.id === e.target.value);
                          setSelectedCustomer(customer || null);
                        }}
                        required
                        disabled={currentUser.role !== UserRole.ADMIN}
                      >
                        <option value="">Select customer...</option>
                        {customers.map(customer => (
                          <option key={customer.id} value={customer.id}>
                            {customer.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Waste Stream *</label>
                      <select 
                        value={selectedWasteStream} 
                        onChange={(e) => setSelectedWasteStream(e.target.value as WasteStreamType)}
                        required
                      >
                        <option value="">Select waste stream...</option>
                        {Object.values(WasteStreamType).map(type => {
                          const props = wasteStreamProperties[type];
                          return (
                            <option key={type} value={type}>
                              {WasteJobsService.getWasteStreamName(type)} - ${props.standardPrice}/tonne
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Truck Registration *</label>
                      <input 
                        type="text" 
                        value={truckRegistration}
                        onChange={(e) => setTruckRegistration(e.target.value)}
                        placeholder="e.g., ABC123" 
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Weighbridge Weight (tonnes) *</label>
                      <input 
                        type="number" 
                        value={weighbridgeWeight}
                        onChange={(e) => setWeighbridgeWeight(e.target.value)}
                        placeholder="0.00" 
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  {estimatedPrice > 0 && (
                    <div className="price-preview">
                      Estimated Price: ${estimatedPrice.toFixed(2)} (excl GST)
                    </div>
                  )}

                  <div className="form-group">
                    <label>Notes (optional)</label>
                    <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Additional notes..."
                      rows={2}
                    />
                  </div>

                  <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={() => setShowCreateForm(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="submit-btn" disabled={loading}>
                      {loading ? 'Creating...' : 'Create Waste Job'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Summary cards */}
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-label">Total Jobs</div>
              <div className="summary-value">{totalJobs}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Pending Approval</div>
              <div className="summary-value pending">{pendingCount}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Approved</div>
              <div className="summary-value approved">{approvedCount}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Rejected</div>
              <div className="summary-value rejected">{rejectedCount}</div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="error-banner">
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="tabs">
            <button 
              className={activeTab === 'All' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('All')}
            >
              All ({totalJobs})
            </button>
            <button 
              className={activeTab === 'Pending Approval' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('Pending Approval')}
            >
              Pending Approval ({pendingCount})
            </button>
            <button 
              className={activeTab === 'Approved' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('Approved')}
            >
              Approved ({approvedCount})
            </button>
            <button 
              className={activeTab === 'Rejected' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('Rejected')}
            >
              Rejected ({rejectedCount})
            </button>
          </div>

          {/* Data table */}
          <div className="table-container">
            {loading ? (
              <div className="loading-state">Loading waste jobs...</div>
            ) : paginatedJobs.length === 0 ? (
              <div className="empty-state">
                <p>No waste jobs found for this filter.</p>
                <button className="create-btn" onClick={() => setShowCreateForm(true)}>
                  + Create First Waste Job
                </button>
              </div>
            ) : (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>
                        <input 
                          type="checkbox" 
                          checked={selectedJobs.size === filteredJobs.length && filteredJobs.length > 0}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th>Job ID</th>
                      <th>Customer</th>
                      <th>Waste Stream</th>
                      <th>Truck Reg</th>
                      <th>Weight (t)</th>
                      <th>Total Price</th>
                      <th>Status</th>
                      <th>Marketplace</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedJobs.map(job => (
                      <tr key={job.id}>
                        <td>
                          <input 
                            type="checkbox" 
                            checked={selectedJobs.has(job.id)}
                            onChange={() => handleSelectJob(job.id)}
                          />
                        </td>
                        <td className="job-number">{job.jobNumber}</td>
                        <td>{job.customerName}</td>
                        <td>{WasteJobsService.getWasteStreamName(job.wasteStream as WasteStreamType)}</td>
                        <td>{job.truckRegistration}</td>
                        <td>{job.weighbridgeWeight.toFixed(2)}</td>
                        <td>${job.totalPrice.toFixed(2)}</td>
                        <td>
                          <span className={`status-chip status-${job.status.toLowerCase().replace(' ', '-')}`}>
                            {job.status}
                          </span>
                        </td>
                        <td>
                          <span className="marketplace-chip marketplace-not-listed">
                            Not Listed
                          </span>
                        </td>
                        <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="action-menu">
                            <select 
                              className="action-select"
                              value=""
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleStatusChange(job.id, e.target.value);
                                }
                              }}
                            >
                              <option value="">Actions...</option>
                              {job.status !== 'Pending Approval' && (
                                <option value="Pending Approval">Set Pending</option>
                              )}
                              {job.status !== 'Approved' && (
                                <option value="Approved">Approve</option>
                              )}
                              {job.status !== 'Rejected' && (
                                <option value="Rejected">Reject</option>
                              )}
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="pagination">
                  <div className="pagination-info">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredJobs.length)} of {filteredJobs.length} entries
                  </div>
                  <div className="pagination-controls">
                    <label>
                      Rows per page:
                      <select 
                        value={rowsPerPage} 
                        onChange={(e) => {
                          setRowsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </label>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    <span className="page-indicator">
                      Page {currentPage} of {totalPages || 1}
                    </span>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages || totalPages === 0}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>

        <footer className="footer">
          <p>&copy; 2024 BRRP.IO - Waste Jobs Management</p>
        </footer>
      </div>

      <style jsx>{`
        .container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
          color: white;
        }

        .header {
          padding: 1.5rem 2rem;
          background: rgba(0, 0, 0, 0.3);
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo h1 {
          margin: 0;
          font-size: 2rem;
          font-weight: bold;
          background: linear-gradient(45deg, #fbbf24, #f59e0b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .tagline {
          margin: 0.25rem 0 0 0;
          font-size: 0.95rem;
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
          font-size: 1rem;
        }

        .user-role {
          font-size: 0.85rem;
          opacity: 0.8;
        }

        .button-group {
          display: flex;
          gap: 0.5rem;
        }

        .nav-btn, .admin-btn {
          padding: 0.5rem 1rem;
          background: linear-gradient(45deg, #8b5cf6, #7c3aed);
          border: none;
          color: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.3s;
        }

        .nav-btn:hover, .admin-btn:hover {
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
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.95rem;
        }

        .breadcrumb-item {
          cursor: pointer;
          opacity: 0.7;
          transition: opacity 0.2s;
        }

        .breadcrumb-item:hover {
          opacity: 1;
        }

        .breadcrumb-item.active {
          opacity: 1;
          font-weight: 600;
          color: #fbbf24;
        }

        .breadcrumb-separator {
          opacity: 0.5;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .create-btn {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(45deg, #10b981, #059669);
          border: none;
          color: white;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
        }

        .create-btn:hover {
          transform: translateY(-2px);
        }

        .export-btn {
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
        }

        .export-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .create-form-section {
          margin-bottom: 2rem;
        }

        .form-card {
          background: rgba(255, 255, 255, 0.1);
          padding: 2rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
        }

        .form-card h3 {
          margin: 0 0 1.5rem 0;
          color: #fbbf24;
        }

        .validation-error {
          padding: 0.75rem;
          margin-bottom: 1rem;
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid #ef4444;
          border-radius: 6px;
          color: #fca5a5;
          font-size: 0.9rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 500;
          font-size: 0.9rem;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          background: rgba(0, 0, 0, 0.2);
          color: white;
          font-size: 0.95rem;
          font-family: inherit;
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .price-preview {
          padding: 1rem;
          background: rgba(251, 191, 36, 0.1);
          border-left: 4px solid #fbbf24;
          border-radius: 4px;
          margin: 1rem 0;
          color: #fbbf24;
          font-weight: 600;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1.5rem;
        }

        .cancel-btn {
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
        }

        .submit-btn {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(45deg, #fbbf24, #f59e0b);
          border: none;
          color: #1e3a8a;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .summary-card {
          background: rgba(255, 255, 255, 0.1);
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          text-align: center;
        }

        .summary-label {
          font-size: 0.9rem;
          opacity: 0.8;
          margin-bottom: 0.5rem;
        }

        .summary-value {
          font-size: 2.5rem;
          font-weight: bold;
          color: #fbbf24;
        }

        .summary-value.pending {
          color: #60a5fa;
        }

        .summary-value.approved {
          color: #10b981;
        }

        .summary-value.rejected {
          color: #ef4444;
        }

        .error-banner {
          padding: 1rem;
          margin-bottom: 1rem;
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid #ef4444;
          border-radius: 6px;
          color: #fca5a5;
        }

        .tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
        }

        .tab {
          padding: 0.75rem 1.5rem;
          background: transparent;
          border: none;
          border-bottom: 3px solid transparent;
          color: white;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 500;
          transition: all 0.3s;
          opacity: 0.7;
        }

        .tab:hover {
          opacity: 1;
          background: rgba(255, 255, 255, 0.05);
        }

        .tab.active {
          opacity: 1;
          border-bottom-color: #fbbf24;
          color: #fbbf24;
          font-weight: 600;
        }

        .table-container {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          overflow: hidden;
        }

        .loading-state,
        .empty-state {
          padding: 4rem 2rem;
          text-align: center;
          opacity: 0.8;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th {
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
          opacity: 0.8;
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.2);
        }

        .data-table td {
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 0.9rem;
        }

        .data-table tr:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .job-number {
          font-weight: 600;
          color: #fbbf24;
        }

        .status-chip {
          display: inline-block;
          padding: 0.35rem 0.75rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-pending-approval {
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
          border: 1px solid #60a5fa;
        }

        .status-approved {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
          border: 1px solid #10b981;
        }

        .status-rejected {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          border: 1px solid #ef4444;
        }

        .marketplace-chip {
          display: inline-block;
          padding: 0.35rem 0.75rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .marketplace-not-listed {
          background: rgba(107, 114, 128, 0.2);
          color: #9ca3af;
          border: 1px solid #9ca3af;
        }

        .marketplace-listed {
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
          border: 1px solid #60a5fa;
        }

        .marketplace-sold {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
          border: 1px solid #10b981;
        }

        .action-select {
          padding: 0.5rem;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          background: rgba(0, 0, 0, 0.3);
          color: white;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .pagination {
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.2);
        }

        .pagination-info {
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .pagination-controls label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }

        .pagination-controls select {
          padding: 0.5rem;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          background: rgba(0, 0, 0, 0.3);
          color: white;
          cursor: pointer;
        }

        .pagination-controls button {
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .pagination-controls button:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.2);
        }

        .pagination-controls button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .page-indicator {
          font-size: 0.9rem;
          font-weight: 600;
        }

        .footer {
          padding: 1.5rem;
          text-align: center;
          background: rgba(0, 0, 0, 0.3);
          border-top: 2px solid rgba(255, 255, 255, 0.1);
        }

        .footer p {
          margin: 0;
          opacity: 0.8;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .user-info {
            align-items: flex-start;
          }

          .page-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .summary-cards {
            grid-template-columns: 1fr;
          }

          .data-table {
            font-size: 0.8rem;
          }

          .data-table th,
          .data-table td {
            padding: 0.5rem;
          }

          .pagination {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>
    </>
  );
}
