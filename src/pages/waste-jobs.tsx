import Head from 'next/head';
import { useState } from 'react';
import { WasteJob, WasteStreamType, Customer } from '../types';
import { WasteJobsService } from '../services/wasteJobs';

export default function WasteJobs() {
  const [activeTab, setActiveTab] = useState<'input' | 'overview'>('input');
  const [wasteJobs, setWasteJobs] = useState<WasteJob[]>([]);
  
  // Form state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedWasteStream, setSelectedWasteStream] = useState<WasteStreamType | ''>('');
  const [truckRegistration, setTruckRegistration] = useState('');
  const [weighbridgeWeight, setWeighbridgeWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState('');

  const customers = WasteJobsService.getAvailableCustomers();
  const wasteStreamProperties = WasteJobsService.getWasteStreamProperties();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous validation error
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

    const newJob = WasteJobsService.createWasteJob(
      selectedCustomer,
      selectedWasteStream as WasteStreamType,
      truckRegistration,
      weight,
      notes
    );

    setWasteJobs([newJob, ...wasteJobs]);
    
    // Reset form
    setSelectedCustomer(null);
    setSelectedWasteStream('');
    setTruckRegistration('');
    setWeighbridgeWeight('');
    setNotes('');
    setValidationError('');
    
    // Switch to overview tab
    setActiveTab('overview');
  };

  const estimatedPrice = selectedWasteStream && weighbridgeWeight
    ? WasteJobsService.calculatePrice(selectedWasteStream as WasteStreamType, parseFloat(weighbridgeWeight) || 0)
    : 0;

  return (
    <>
      <Head>
        <title>Waste Jobs - BRRP.IO</title>
        <meta name="description" content="Waste Jobs Management - Weighbridge Input" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container">
        <header className="header">
          <div className="logo">
            <h1>BRRP.IO</h1>
            <p className="tagline">Waste Jobs Management</p>
          </div>
          <nav className="nav">
            <button 
              className={activeTab === 'input' ? 'active' : ''} 
              onClick={() => setActiveTab('input')}
            >
              Weighbridge Input
            </button>
            <button 
              className={activeTab === 'overview' ? 'active' : ''} 
              onClick={() => setActiveTab('overview')}
            >
              Jobs Overview ({wasteJobs.length})
            </button>
          </nav>
        </header>

        <main className="main">
          {activeTab === 'input' && (
            <div className="section">
              <h2>Weighbridge Input</h2>
              <div className="form-card">
                <h3>Record New Waste Job</h3>
                {validationError && (
                  <div className="validation-error">
                    {validationError}
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Customer *</label>
                    <select 
                      value={selectedCustomer?.id || ''} 
                      onChange={(e) => {
                        const customer = customers.find(c => c.id === e.target.value);
                        setSelectedCustomer(customer || null);
                      }}
                      required
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

                  {selectedWasteStream && (
                    <div className="info-box">
                      <h4>Waste Stream Properties</h4>
                      <div className="properties-grid">
                        <div className="property">
                          <span className="property-label">Standard Price:</span>
                          <span className="property-value">${wasteStreamProperties[selectedWasteStream as WasteStreamType].standardPrice}/tonne (excl GST)</span>
                        </div>
                        <div className="property">
                          <span className="property-label">Energy Value:</span>
                          <span className="property-value">{wasteStreamProperties[selectedWasteStream as WasteStreamType].energyValue}</span>
                        </div>
                        <div className="property">
                          <span className="property-label">Nutrient Value:</span>
                          <span className="property-value">{wasteStreamProperties[selectedWasteStream as WasteStreamType].nutrientValue}</span>
                        </div>
                      </div>
                    </div>
                  )}

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

                  {estimatedPrice > 0 && (
                    <div className="price-estimate">
                      <h4>Estimated Price</h4>
                      <div className="price">${estimatedPrice.toFixed(2)} (excl GST)</div>
                      <div className="price-gst">${(estimatedPrice * 1.15).toFixed(2)} (incl GST)</div>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Notes (optional)</label>
                    <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Additional notes or observations..."
                      rows={3}
                    />
                  </div>

                  <button type="submit" className="submit-btn">Create Waste Job</button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="section">
              <h2>Waste Jobs Overview</h2>
              
              {wasteJobs.length === 0 ? (
                <div className="empty-state">
                  <p>No waste jobs recorded yet.</p>
                  <p>Use the &quot;Weighbridge Input&quot; tab to create a new waste job.</p>
                </div>
              ) : (
                <div className="jobs-container">
                  <div className="summary-cards">
                    <div className="summary-card">
                      <h3>Total Jobs</h3>
                      <div className="summary-value">{wasteJobs.length}</div>
                    </div>
                    <div className="summary-card">
                      <h3>Total Weight</h3>
                      <div className="summary-value">
                        {wasteJobs.reduce((sum, job) => sum + job.weighbridgeWeight, 0).toFixed(2)} tonnes
                      </div>
                    </div>
                    <div className="summary-card">
                      <h3>Total Value</h3>
                      <div className="summary-value">
                        ${wasteJobs.reduce((sum, job) => sum + (job.totalPrice || 0), 0).toFixed(2)}
                      </div>
                      <div className="summary-subtitle">excl GST</div>
                    </div>
                  </div>

                  <div className="jobs-list">
                    {wasteJobs.map(job => (
                      <div key={job.id} className="job-card">
                        <div className="job-header">
                          <div className="job-number">{job.jobNumber}</div>
                          <div className={`job-status status-${job.status.toLowerCase()}`}>
                            {job.status}
                          </div>
                        </div>
                        <div className="job-details">
                          <div className="detail-row">
                            <span className="detail-label">Customer:</span>
                            <span className="detail-value">{job.customer.name}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Waste Stream:</span>
                            <span className="detail-value">{WasteJobsService.getWasteStreamName(job.wasteStream)}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Truck:</span>
                            <span className="detail-value">{job.truckRegistration}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Weight:</span>
                            <span className="detail-value">{job.weighbridgeWeight.toFixed(2)} tonnes</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Time:</span>
                            <span className="detail-value">{new Date(job.timestamp).toLocaleString()}</span>
                          </div>
                          {job.notes && (
                            <div className="detail-row">
                              <span className="detail-label">Notes:</span>
                              <span className="detail-value">{job.notes}</span>
                            </div>
                          )}
                        </div>
                        <div className="job-footer">
                          <div className="job-price">
                            <span className="price-label">Total:</span>
                            <span className="price-value">${job.totalPrice?.toFixed(2)} (excl GST)</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
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
          padding: 2rem;
          background: rgba(0, 0, 0, 0.3);
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
        }

        .logo h1 {
          margin: 0;
          font-size: 3rem;
          font-weight: bold;
          background: linear-gradient(45deg, #fbbf24, #f59e0b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .tagline {
          margin: 0.5rem 0 0 0;
          font-size: 1.2rem;
          color: #fbbf24;
        }

        .nav {
          margin-top: 2rem;
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
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
          transform: translateY(-2px);
        }

        .nav button.active {
          background: linear-gradient(45deg, #fbbf24, #f59e0b);
          border-color: #fbbf24;
          font-weight: bold;
        }

        .main {
          flex: 1;
          padding: 2rem;
        }

        .section {
          max-width: 1200px;
          margin: 0 auto;
        }

        h2 {
          font-size: 2.5rem;
          margin-bottom: 2rem;
          text-align: center;
        }

        .form-card {
          background: rgba(255, 255, 255, 0.1);
          padding: 2rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
        }

        h3 {
          margin-top: 0;
          color: #fbbf24;
        }

        .validation-error {
          padding: 1rem;
          margin-bottom: 1.5rem;
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid #ef4444;
          border-radius: 6px;
          color: #fca5a5;
          font-weight: 500;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        input, select, textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          background: rgba(0, 0, 0, 0.2);
          color: white;
          font-size: 1rem;
          font-family: inherit;
        }

        input::placeholder, textarea::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .info-box {
          margin: 1.5rem 0;
          padding: 1rem;
          background: rgba(251, 191, 36, 0.1);
          border-left: 4px solid #fbbf24;
          border-radius: 6px;
        }

        .info-box h4 {
          margin-top: 0;
          color: #fbbf24;
        }

        .properties-grid {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .property {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
        }

        .property-label {
          font-weight: 500;
          opacity: 0.8;
        }

        .property-value {
          color: #fbbf24;
          font-weight: 600;
        }

        .price-estimate {
          margin: 1.5rem 0;
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2));
          border: 2px solid #fbbf24;
          border-radius: 8px;
          text-align: center;
        }

        .price-estimate h4 {
          margin: 0 0 0.5rem 0;
          color: #fbbf24;
        }

        .price {
          font-size: 2rem;
          font-weight: bold;
          color: #fbbf24;
          margin: 0.5rem 0;
        }

        .price-gst {
          font-size: 1.2rem;
          opacity: 0.8;
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

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .empty-state p {
          margin: 0.5rem 0;
          font-size: 1.1rem;
          opacity: 0.8;
        }

        .jobs-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
        }

        .summary-card {
          background: rgba(255, 255, 255, 0.1);
          padding: 2rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          text-align: center;
        }

        .summary-card h3 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          opacity: 0.8;
        }

        .summary-value {
          font-size: 2.5rem;
          font-weight: bold;
          color: #fbbf24;
          margin-bottom: 0.5rem;
        }

        .summary-subtitle {
          font-size: 0.9rem;
          opacity: 0.7;
        }

        .jobs-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .job-card {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
        }

        .job-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .job-number {
          font-size: 1.2rem;
          font-weight: bold;
          color: #fbbf24;
        }

        .job-status {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-weighed {
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
          border: 1px solid #60a5fa;
        }

        .status-processing {
          background: rgba(251, 191, 36, 0.2);
          color: #fbbf24;
          border: 1px solid #fbbf24;
        }

        .status-completed {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
          border: 1px solid #10b981;
        }

        .status-invoiced {
          background: rgba(139, 92, 246, 0.2);
          color: #a78bfa;
          border: 1px solid #a78bfa;
        }

        .job-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .detail-label {
          font-weight: 500;
          opacity: 0.8;
        }

        .detail-value {
          color: #fbbf24;
          font-weight: 600;
        }

        .job-footer {
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .job-price {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .price-label {
          font-size: 1.1rem;
          font-weight: 600;
        }

        .price-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: #fbbf24;
        }

        .footer {
          padding: 2rem;
          text-align: center;
          background: rgba(0, 0, 0, 0.3);
          border-top: 2px solid rgba(255, 255, 255, 0.1);
        }

        .footer p {
          margin: 0.5rem 0;
          opacity: 0.8;
        }

        @media (max-width: 768px) {
          .detail-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }

          .job-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
        }
      `}</style>
    </>
  );
}
