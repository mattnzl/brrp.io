import Head from 'next/head';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { AuthService } from '../services/auth';
import { User, UserRole } from '../types';

/**
 * Weighbridge Screen - "Sell Screen" (Waste Arrives)
 * This is where waste deliveries are weighed and recorded
 * Admin/Operator only access
 */

type Company = {
  id: string;
  name: string;
};

type Truck = {
  id: string;
  license_plate: string;
  company_id: string;
  make?: string;
  model?: string;
};

type Driver = {
  id: string;
  first_name: string;
  last_name: string;
  company_id: string;
};

type WasteStreamType = {
  id: string;
  name: string;
  description?: string;
  unit_of_measure: string;
  price_per_unit: number;
  energy_value: string;
  nutrient_value: string;
};

type WeighbridgeJob = {
  id: string;
  job_number: string;
  company_name: string;
  truck_license_plate: string;
  driver_name?: string;
  waste_stream_type_name: string;
  tare_weight?: number;
  gross_weight: number;
  net_weight: number;
  status: string;
  is_contaminated: boolean;
  unit_price: number;
  total_price: number;
  weighed_at: string;
};

export default function WeighbridgePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form data
  const [companies, setCompanies] = useState<Company[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [wasteStreamTypes, setWasteStreamTypes] = useState<WasteStreamType[]>([]);
  
  // Selected values
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedTruckId, setSelectedTruckId] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [selectedWasteStreamTypeId, setSelectedWasteStreamTypeId] = useState('');
  
  // Weight measurements
  const [tareWeight, setTareWeight] = useState('');
  const [grossWeight, setGrossWeight] = useState('');
  const [notes, setNotes] = useState('');
  
  // Recent jobs
  const [recentJobs, setRecentJobs] = useState<WeighbridgeJob[]>([]);

  useEffect(() => {
    const session = AuthService.getCurrentSession();
    if (!session || session.user.role === UserRole.CUSTOMER) {
      router.push('/login');
      return;
    }
    setCurrentUser(session.user);
    
    // Fetch initial data
    fetchCompanies();
    fetchWasteStreamTypes();
    fetchRecentJobs();
  }, [router]);

  const fetchCompanies = async () => {
    try {
      // For now, use hardcoded data - in production this would be an API call
      setCompanies([
        { id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', name: 'Waste Management NZ' },
        { id: 'b2c3d4e5-f6a7-8901-2345-678901bcdef0', name: 'EnviroNZ' },
        { id: 'c3d4e5f6-a7b8-9012-3456-789012cdef01', name: 'GreenCycle Nelson' },
      ]);
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };

  const fetchWasteStreamTypes = async () => {
    try {
      // For now, use hardcoded data - in production this would be an API call
      setWasteStreamTypes([
        { id: '1', name: 'COW_SHED_WASTE', description: 'Dairy farm effluent and manure', unit_of_measure: 'tonnes', price_per_unit: 85.00, energy_value: 'MEDIUM', nutrient_value: 'HIGH' },
        { id: '2', name: 'FOOD_WASTE', description: 'Commercial and residential food waste', unit_of_measure: 'tonnes', price_per_unit: 150.00, energy_value: 'HIGH', nutrient_value: 'MEDIUM' },
        { id: '3', name: 'GREEN_WASTE', description: 'Garden and yard waste', unit_of_measure: 'tonnes', price_per_unit: 75.00, energy_value: 'LOW', nutrient_value: 'MEDIUM' },
        { id: '4', name: 'SPENT_GRAIN', description: 'Brewery spent grain', unit_of_measure: 'tonnes', price_per_unit: 65.00, energy_value: 'MEDIUM', nutrient_value: 'HIGH' },
        { id: '5', name: 'APPLE_POMACE', description: 'Apple processing residue', unit_of_measure: 'tonnes', price_per_unit: 70.00, energy_value: 'MEDIUM', nutrient_value: 'MEDIUM' },
        { id: '6', name: 'GRAPE_MARC', description: 'Wine grape processing residue', unit_of_measure: 'tonnes', price_per_unit: 70.00, energy_value: 'MEDIUM', nutrient_value: 'MEDIUM' },
        { id: '7', name: 'FISH_WASTE', description: 'Seafood processing waste', unit_of_measure: 'tonnes', price_per_unit: 120.00, energy_value: 'HIGH', nutrient_value: 'HIGH' },
      ]);
    } catch (err) {
      console.error('Error fetching waste stream types:', err);
    }
  };

  const fetchTrucksForCompany = useCallback(async (companyId: string) => {
    if (!companyId) {
      setTrucks([]);
      return;
    }
    
    try {
      const response = await fetch(`/api/trucks?company_id=${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setTrucks(data);
      }
    } catch (err) {
      console.error('Error fetching trucks:', err);
    }
  }, []);

  const fetchDriversForCompany = useCallback(async (companyId: string) => {
    if (!companyId) {
      setDrivers([]);
      return;
    }
    
    try {
      const response = await fetch(`/api/drivers?company_id=${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setDrivers(data);
      }
    } catch (err) {
      console.error('Error fetching drivers:', err);
    }
  }, []);

  const fetchRecentJobs = async () => {
    try {
      const response = await fetch('/api/weighbridge-jobs?page=1&per_page=10');
      if (response.ok) {
        const data = await response.json();
        setRecentJobs(data);
      }
    } catch (err) {
      console.error('Error fetching recent jobs:', err);
    }
  };

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setSelectedTruckId('');
    setSelectedDriverId('');
    fetchTrucksForCompany(companyId);
    fetchDriversForCompany(companyId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!selectedCompanyId || !selectedTruckId || !selectedWasteStreamTypeId || !grossWeight) {
      setError('Please fill in all required fields');
      return;
    }

    const gross = parseFloat(grossWeight);
    if (isNaN(gross) || gross <= 0) {
      setError('Gross weight must be greater than 0');
      return;
    }

    const tare = tareWeight ? parseFloat(tareWeight) : 0;
    if (tareWeight && (isNaN(tare) || tare < 0)) {
      setError('Tare weight must be 0 or greater');
      return;
    }

    if (tare >= gross) {
      setError('Tare weight must be less than gross weight');
      return;
    }

    const wasteStream = wasteStreamTypes.find(w => w.id === selectedWasteStreamTypeId);
    if (!wasteStream) {
      setError('Invalid waste stream selected');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/weighbridge-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_id: selectedCompanyId,
          truck_id: selectedTruckId,
          driver_id: selectedDriverId || null,
          waste_stream_type_id: selectedWasteStreamTypeId,
          tare_weight: tare || null,
          gross_weight: gross,
          unit_price: wasteStream.price_per_unit,
          notes: notes || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create weighbridge job');
      }

      const result = await response.json();
      setSuccess(`Job created successfully! Job Number: ${result.job_number}`);
      
      // Reset form
      setSelectedCompanyId('');
      setSelectedTruckId('');
      setSelectedDriverId('');
      setSelectedWasteStreamTypeId('');
      setTareWeight('');
      setGrossWeight('');
      setNotes('');
      setTrucks([]);
      setDrivers([]);
      
      // Refresh recent jobs
      fetchRecentJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    router.push('/login');
  };

  const goToHome = () => {
    router.push('/');
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  const selectedWasteStream = wasteStreamTypes.find(w => w.id === selectedWasteStreamTypeId);
  const calculatedNetWeight = grossWeight && !isNaN(parseFloat(grossWeight))
    ? parseFloat(grossWeight) - (tareWeight && !isNaN(parseFloat(tareWeight)) ? parseFloat(tareWeight) : 0)
    : 0;
  const estimatedPrice = selectedWasteStream && calculatedNetWeight > 0
    ? calculatedNetWeight * selectedWasteStream.price_per_unit
    : 0;

  return (
    <>
      <Head>
        <title>Weighbridge - BRRP.IO</title>
        <meta name="description" content="Weighbridge waste arrival screen" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container">
        <header className="header">
          <div className="logo">
            <h1>BRRP.IO</h1>
            <p className="tagline">Weighbridge - Waste Arrival</p>
          </div>
          <div className="user-info">
            <span className="user-name">{currentUser.firstName} {currentUser.lastName}</span>
            <span className="user-role">
              {currentUser.role === UserRole.ADMIN && 'System Admin'}
            </span>
            <div className="button-group">
              <button onClick={goToHome} className="nav-btn">Home</button>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          </div>
        </header>

        <main className="main">
          <div className="weighbridge-container">
            {/* Weighbridge Form */}
            <div className="weighbridge-form-section">
              <h2>Record Waste Delivery</h2>
              
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <form onSubmit={handleSubmit} className="weighbridge-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="company">Company *</label>
                    <select
                      id="company"
                      value={selectedCompanyId}
                      onChange={(e) => handleCompanyChange(e.target.value)}
                      required
                    >
                      <option value="">Select Company</option>
                      {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="truck">Truck Registration *</label>
                    <select
                      id="truck"
                      value={selectedTruckId}
                      onChange={(e) => setSelectedTruckId(e.target.value)}
                      disabled={!selectedCompanyId}
                      required
                    >
                      <option value="">Select Truck</option>
                      {trucks.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.license_plate} {t.make && `- ${t.make} ${t.model || ''}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="driver">Driver (Optional)</label>
                    <select
                      id="driver"
                      value={selectedDriverId}
                      onChange={(e) => setSelectedDriverId(e.target.value)}
                      disabled={!selectedCompanyId}
                    >
                      <option value="">No Driver Assigned</option>
                      {drivers.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.first_name} {d.last_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="wasteStream">Waste Stream Type *</label>
                    <select
                      id="wasteStream"
                      value={selectedWasteStreamTypeId}
                      onChange={(e) => setSelectedWasteStreamTypeId(e.target.value)}
                      required
                    >
                      <option value="">Select Waste Stream</option>
                      {wasteStreamTypes.map(w => (
                        <option key={w.id} value={w.id}>
                          {w.name.replace(/_/g, ' ')} - ${w.price_per_unit}/tonne
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="tareWeight">Tare Weight (tonnes)</label>
                    <input
                      type="number"
                      id="tareWeight"
                      value={tareWeight}
                      onChange={(e) => setTareWeight(e.target.value)}
                      step="0.01"
                      min="0"
                      placeholder="Empty truck weight"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="grossWeight">Gross Weight (tonnes) *</label>
                    <input
                      type="number"
                      id="grossWeight"
                      value={grossWeight}
                      onChange={(e) => setGrossWeight(e.target.value)}
                      step="0.01"
                      min="0.01"
                      placeholder="Loaded truck weight"
                      required
                    />
                  </div>
                </div>

                {calculatedNetWeight > 0 && (
                  <div className="calculation-display">
                    <div className="calc-item">
                      <span className="calc-label">Net Weight:</span>
                      <span className="calc-value">{calculatedNetWeight.toFixed(2)} tonnes</span>
                    </div>
                    {estimatedPrice > 0 && (
                      <div className="calc-item">
                        <span className="calc-label">Estimated Fee:</span>
                        <span className="calc-value">${estimatedPrice.toFixed(2)} (excl GST)</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="form-group full-width">
                  <label htmlFor="notes">Notes</label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Optional notes about the delivery"
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCompanyId('');
                      setSelectedTruckId('');
                      setSelectedDriverId('');
                      setSelectedWasteStreamTypeId('');
                      setTareWeight('');
                      setGrossWeight('');
                      setNotes('');
                      setError('');
                      setSuccess('');
                    }}
                    className="btn-secondary"
                  >
                    Clear
                  </button>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Recording...' : 'Record Delivery'}
                  </button>
                </div>
              </form>
            </div>

            {/* Recent Jobs */}
            <div className="recent-jobs-section">
              <h2>Recent Deliveries</h2>
              <div className="jobs-list">
                {recentJobs.length === 0 ? (
                  <p className="no-data">No recent deliveries</p>
                ) : (
                  <table className="jobs-table">
                    <thead>
                      <tr>
                        <th>Job #</th>
                        <th>Company</th>
                        <th>Truck</th>
                        <th>Waste Type</th>
                        <th>Net Weight</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentJobs.map(job => (
                        <tr key={job.id}>
                          <td className="job-number">{job.job_number}</td>
                          <td>{job.company_name}</td>
                          <td>{job.truck_license_plate}</td>
                          <td>{job.waste_stream_type_name.replace(/_/g, ' ')}</td>
                          <td>{job.net_weight.toFixed(2)}t</td>
                          <td>
                            <span className={`status-badge status-${job.status.toLowerCase()}`}>
                              {job.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        .container {
          min-height: 100vh;
          background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
        }

        .header {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 1.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .logo h1 {
          color: #fbbf24;
          margin: 0;
          font-size: 2rem;
        }

        .tagline {
          color: rgba(255, 255, 255, 0.9);
          margin: 0.25rem 0 0 0;
          font-size: 1.1rem;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.5rem;
        }

        .user-name {
          color: white;
          font-weight: 600;
        }

        .user-role {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
        }

        .button-group {
          display: flex;
          gap: 0.5rem;
        }

        .nav-btn, .logout-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .nav-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .nav-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .logout-btn {
          background: #ef4444;
          color: white;
        }

        .logout-btn:hover {
          background: #dc2626;
        }

        .main {
          padding: 2rem;
        }

        .weighbridge-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .weighbridge-form-section, .recent-jobs-section {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 0.75rem;
          padding: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        h2 {
          margin: 0 0 1.5rem 0;
          color: #1e3a8a;
          font-size: 1.5rem;
        }

        .error-message {
          background: #fef2f2;
          border: 1px solid #ef4444;
          color: #991b1b;
          padding: 0.75rem;
          border-radius: 0.375rem;
          margin-bottom: 1rem;
        }

        .success-message {
          background: #f0fdf4;
          border: 1px solid #10b981;
          color: #065f46;
          padding: 0.75rem;
          border-radius: 0.375rem;
          margin-bottom: 1rem;
        }

        .weighbridge-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        label {
          font-weight: 500;
          color: #374151;
          font-size: 0.9rem;
        }

        input, select, textarea {
          padding: 0.625rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.95rem;
          transition: border-color 0.2s;
        }

        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        input:disabled, select:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
        }

        .calculation-display {
          background: #eff6ff;
          border: 1px solid #3b82f6;
          border-radius: 0.375rem;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .calc-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .calc-label {
          color: #1e40af;
          font-weight: 500;
        }

        .calc-value {
          color: #1e3a8a;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1rem;
        }

        .btn-primary, .btn-secondary {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #2563eb;
        }

        .btn-primary:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #e5e7eb;
          color: #374151;
        }

        .btn-secondary:hover {
          background: #d1d5db;
        }

        .jobs-list {
          max-height: 600px;
          overflow-y: auto;
        }

        .no-data {
          text-align: center;
          color: #6b7280;
          padding: 2rem;
        }

        .jobs-table {
          width: 100%;
          border-collapse: collapse;
        }

        .jobs-table th {
          background: #f3f4f6;
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
          color: #374151;
          font-size: 0.85rem;
          text-transform: uppercase;
          border-bottom: 2px solid #e5e7eb;
        }

        .jobs-table td {
          padding: 0.75rem;
          border-bottom: 1px solid #e5e7eb;
          color: #374151;
        }

        .jobs-table tbody tr:hover {
          background: #f9fafb;
        }

        .job-number {
          font-family: monospace;
          font-weight: 600;
          color: #f59e0b;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-weighed {
          background: #dbeafe;
          color: #1e40af;
        }

        .status-approved {
          background: #d1fae5;
          color: #065f46;
        }

        .status-rejected {
          background: #fee2e2;
          color: #991b1b;
        }

        @media (max-width: 1024px) {
          .weighbridge-container {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
