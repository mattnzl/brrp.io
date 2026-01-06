import Head from 'next/head';
import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <>
      <Head>
        <title>BRRP.IO - Carbon Credit Platform</title>
        <meta name="description" content="Blockchain-based Carbon Credit Platform for Waste-to-Methane Conversion" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container">
        <header className="header">
          <div className="logo">
            <h1>BRRP.IO</h1>
            <p className="tagline">Unconventional Gold</p>
          </div>
          <nav className="nav">
            <button 
              className={activeTab === 'overview' ? 'active' : ''} 
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <Link href="/waste-jobs" passHref legacyBehavior>
              <a className="nav-link">
                <button className="nav-button">Waste Jobs 🚛</button>
              </a>
            </Link>
            <button 
              className={activeTab === 'waste' ? 'active' : ''} 
              onClick={() => setActiveTab('waste')}
            >
              Waste Input
            </button>
            <button 
              className={activeTab === 'scada' ? 'active' : ''} 
              onClick={() => setActiveTab('scada')}
            >
              SCADA Monitoring
            </button>
            <button 
              className={activeTab === 'emissions' ? 'active' : ''} 
              onClick={() => setActiveTab('emissions')}
            >
              Emissions
            </button>
            <button 
              className={activeTab === 'verification' ? 'active' : ''} 
              onClick={() => setActiveTab('verification')}
            >
              Verification
            </button>
            <button 
              className={activeTab === 'credits' ? 'active' : ''} 
              onClick={() => setActiveTab('credits')}
            >
              Carbon Credits
            </button>
          </nav>
        </header>

        <main className="main">
          {activeTab === 'overview' && <OverviewSection />}
          {activeTab === 'waste' && <WasteInputSection />}
          {activeTab === 'scada' && <SCADASection />}
          {activeTab === 'emissions' && <EmissionsSection />}
          {activeTab === 'verification' && <VerificationSection />}
          {activeTab === 'credits' && <CarbonCreditsSection />}
        </main>

        <footer className="footer">
          <p>&copy; 2024 BRRP.IO - Waste-to-Methane Carbon Credit Platform</p>
          <p>IPCC Standards Compliant | Blockchain Verified</p>
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

        .nav-link {
          text-decoration: none;
        }

        .nav-button {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(45deg, #10b981, #059669);
          border: 1px solid #10b981;
          color: white;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          transition: all 0.3s;
        }

        .nav-button:hover {
          background: linear-gradient(45deg, #059669, #047857);
          transform: translateY(-2px);
        }

        .main {
          flex: 1;
          padding: 2rem;
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
      `}</style>
    </>
  );
}

function OverviewSection() {
  return (
    <div className="section">
      <h2>Platform Overview</h2>
      <div className="grid">
        <div className="card">
          <h3>🗑️ Waste-to-Methane Conversion</h3>
          <p>Convert sewerage sludge and landfill organic waste into methane for electricity or process heat.</p>
          <ul>
            <li>Manual input from councils and industries</li>
            <li>Predefined BRRP processing</li>
            <li>Real-time SCADA measurement</li>
          </ul>
        </div>
        
        <div className="card">
          <h3>📊 Emissions Tracking</h3>
          <p>IPCC-compliant emissions calculation and tracking.</p>
          <ul>
            <li>CO₂ equivalence (CO2eq) calculation</li>
            <li>ACM0022, AM0053, AMS-I.D standards</li>
            <li>Geolocated, time-based data</li>
            <li>Immutable record keeping</li>
          </ul>
        </div>

        <div className="card">
          <h3>✅ Independent Verification</h3>
          <p>Third-party verification before carbon credit issuance.</p>
          <ul>
            <li>Verra verification</li>
            <li>Gold Standard certification</li>
            <li>Toitū/Ekos compliance</li>
            <li>Bi-annual verification cycle</li>
          </ul>
        </div>

        <div className="card">
          <h3>🔗 Blockchain Integration</h3>
          <p>NFT-based carbon credits with full transparency.</p>
          <ul>
            <li>Immutable blockchain ledger</li>
            <li>Open Earth register sync</li>
            <li>National carbon budget validation</li>
            <li>Credit destruction after offset</li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        .section {
          max-width: 1200px;
          margin: 0 auto;
        }

        h2 {
          font-size: 2.5rem;
          margin-bottom: 2rem;
          text-align: center;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
        }

        .card {
          background: rgba(255, 255, 255, 0.1);
          padding: 2rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
        }

        .card h3 {
          margin-top: 0;
          color: #fbbf24;
          font-size: 1.5rem;
        }

        .card p {
          line-height: 1.6;
          opacity: 0.9;
        }

        .card ul {
          margin-top: 1rem;
          padding-left: 1.5rem;
        }

        .card li {
          margin: 0.5rem 0;
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
}

function WasteInputSection() {
  return (
    <div className="section">
      <h2>Waste Input Management</h2>
      <div className="form-card">
        <h3>Record Waste Input</h3>
        <form>
          <div className="form-group">
            <label>Waste Source Type</label>
            <select>
              <option value="">Select type...</option>
              <option value="SEWERAGE_SLUDGE">Sewerage Sludge</option>
              <option value="LANDFILL_ORGANIC">Landfill Organic Waste</option>
            </select>
          </div>

          <div className="form-group">
            <label>Source (Council/Industry)</label>
            <input type="text" placeholder="e.g., Auckland Council" />
          </div>

          <div className="form-group">
            <label>Quantity (tonnes)</label>
            <input type="number" placeholder="0.00" step="0.01" />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input type="text" placeholder="Latitude, Longitude or Address" />
          </div>

          <div className="form-group">
            <label>Date</label>
            <input type="date" />
          </div>

          <button type="submit" className="submit-btn">Record Waste Input</button>
        </form>

        <div className="info-box">
          <h4>Estimated Methane Generation</h4>
          <p>Based on waste type:</p>
          <ul>
            <li>Sewerage Sludge: ~20 m³/tonne</li>
            <li>Landfill Organic: ~100 m³/tonne</li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        .section {
          max-width: 800px;
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
        }

        h3 {
          margin-top: 0;
          color: #fbbf24;
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

        input::placeholder {
          color: rgba(255, 255, 255, 0.5);
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

        .info-box {
          margin-top: 2rem;
          padding: 1rem;
          background: rgba(251, 191, 36, 0.1);
          border-left: 4px solid #fbbf24;
          border-radius: 6px;
        }

        .info-box h4 {
          margin-top: 0;
          color: #fbbf24;
        }

        .info-box ul {
          margin: 0.5rem 0 0 1.5rem;
        }
      `}</style>
    </div>
  );
}

function SCADASection() {
  return (
    <div className="section">
      <h2>SCADA Real-Time Monitoring</h2>
      <div className="dashboard">
        <div className="metric-card">
          <h3>Waste Processed</h3>
          <div className="metric-value">125.4</div>
          <div className="metric-unit">tonnes today</div>
        </div>

        <div className="metric-card">
          <h3>Methane Generated</h3>
          <div className="metric-value">2,508</div>
          <div className="metric-unit">m³ today</div>
        </div>

        <div className="metric-card">
          <h3>Methane Destroyed</h3>
          <div className="metric-value">2,485</div>
          <div className="metric-unit">m³ today</div>
        </div>

        <div className="metric-card">
          <h3>Electricity Produced</h3>
          <div className="metric-value">18,640</div>
          <div className="metric-unit">kWh today</div>
        </div>
      </div>

      <div className="status-panel">
        <h3>Live SCADA Data Feed</h3>
        <div className="status-item">
          <span className="status-dot active"></span>
          <span>System Online</span>
          <span className="timestamp">Updated: 2 minutes ago</span>
        </div>
        <div className="status-item">
          <span className="status-dot active"></span>
          <span>Data Recording Active</span>
          <span className="timestamp">Geolocated & Immutable</span>
        </div>
        <div className="status-item">
          <span className="status-dot active"></span>
          <span>Process Heat: 67.2 MJ</span>
          <span className="timestamp">Current output</span>
        </div>
      </div>

      <style jsx>{`
        .section {
          max-width: 1200px;
          margin: 0 auto;
        }

        h2 {
          font-size: 2.5rem;
          margin-bottom: 2rem;
          text-align: center;
        }

        .dashboard {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .metric-card {
          background: rgba(255, 255, 255, 0.1);
          padding: 2rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          text-align: center;
        }

        .metric-card h3 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          opacity: 0.8;
        }

        .metric-value {
          font-size: 3rem;
          font-weight: bold;
          color: #fbbf24;
          margin-bottom: 0.5rem;
        }

        .metric-unit {
          opacity: 0.7;
          font-size: 0.9rem;
        }

        .status-panel {
          background: rgba(255, 255, 255, 0.1);
          padding: 2rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .status-panel h3 {
          margin-top: 0;
          color: #fbbf24;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 6px;
          margin-bottom: 0.5rem;
        }

        .status-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #9ca3af;
        }

        .status-dot.active {
          background: #10b981;
          box-shadow: 0 0 10px #10b981;
        }

        .timestamp {
          margin-left: auto;
          opacity: 0.6;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}

function EmissionsSection() {
  return (
    <div className="section">
      <h2>Emissions Tracking & Calculation</h2>
      
      <div className="standards-info">
        <h3>IPCC Standards Compliance</h3>
        <div className="standards-grid">
          <div className="standard-card">
            <h4>ACM0022</h4>
            <p>Alternative waste treatment processes</p>
          </div>
          <div className="standard-card">
            <h4>AM0053</h4>
            <p>Biogenic methane injection to natural gas grid</p>
          </div>
          <div className="standard-card">
            <h4>AMS-I.D</h4>
            <p>Grid connected renewable electricity generation</p>
          </div>
        </div>
      </div>

      <div className="calculation-panel">
        <h3>Emissions Calculation Results</h3>
        <div className="calc-grid">
          <div className="calc-item">
            <label>Methane Destroyed</label>
            <div className="value">2,485 m³</div>
          </div>
          <div className="calc-item">
            <label>Global Warming Potential (GWP)</label>
            <div className="value">28 (IPCC AR5)</div>
          </div>
          <div className="calc-item">
            <label>CO₂ Equivalent (CO2eq)</label>
            <div className="value">45.8 tonnes</div>
          </div>
          <div className="calc-item">
            <label>Default Emission Factor (DEF)</label>
            <div className="value">0.002456</div>
          </div>
          <div className="calc-item highlight">
            <label>Gross Emissions Reduction (GER)</label>
            <div className="value">45.8 tonnes CO2eq</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .section {
          max-width: 1200px;
          margin: 0 auto;
        }

        h2 {
          font-size: 2.5rem;
          margin-bottom: 2rem;
          text-align: center;
        }

        .standards-info {
          background: rgba(255, 255, 255, 0.1);
          padding: 2rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          margin-bottom: 2rem;
        }

        .standards-info h3 {
          margin-top: 0;
          color: #fbbf24;
        }

        .standards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .standard-card {
          background: rgba(0, 0, 0, 0.2);
          padding: 1rem;
          border-radius: 8px;
          border-left: 4px solid #fbbf24;
        }

        .standard-card h4 {
          margin: 0 0 0.5rem 0;
          color: #fbbf24;
        }

        .standard-card p {
          margin: 0;
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .calculation-panel {
          background: rgba(255, 255, 255, 0.1);
          padding: 2rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .calculation-panel h3 {
          margin-top: 0;
          color: #fbbf24;
        }

        .calc-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .calc-item {
          background: rgba(0, 0, 0, 0.2);
          padding: 1.5rem;
          border-radius: 8px;
        }

        .calc-item.highlight {
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2));
          border: 2px solid #fbbf24;
        }

        .calc-item label {
          display: block;
          font-size: 0.9rem;
          opacity: 0.8;
          margin-bottom: 0.5rem;
        }

        .calc-item .value {
          font-size: 1.5rem;
          font-weight: bold;
          color: #fbbf24;
        }
      `}</style>
    </div>
  );
}

function VerificationSection() {
  return (
    <div className="section">
      <h2>Independent Verification</h2>
      
      <div className="verification-standards">
        <div className="standard-card">
          <h3>Verra (VCS)</h3>
          <div className="status verified">✓ Verified</div>
          <p>Verified Carbon Standard compliance</p>
          <p className="date">Last Verified: Jan 2024</p>
          <p className="date">Next Due: Jul 2024</p>
        </div>

        <div className="standard-card">
          <h3>Gold Standard</h3>
          <div className="status verified">✓ Verified</div>
          <p>SDG Impact Assessment completed</p>
          <p className="date">Last Verified: Jan 2024</p>
          <p className="date">Next Due: Jul 2024</p>
        </div>

        <div className="standard-card">
          <h3>Toitū/Ekos</h3>
          <div className="status verified">✓ Verified</div>
          <p>ISO 14064-3 compliance</p>
          <p className="date">Last Verified: Dec 2023</p>
          <p className="date">Next Due: Jun 2024</p>
        </div>
      </div>

      <div className="verification-process">
        <h3>Verification Process</h3>
        <div className="process-steps">
          <div className="step completed">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Data Collection</h4>
              <p>SCADA measurements and emissions data collected</p>
            </div>
          </div>
          <div className="step completed">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>IPCC Standards Check</h4>
              <p>Validation against ACM0022, AM0053, AMS-I.D</p>
            </div>
          </div>
          <div className="step completed">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Third-Party Verification</h4>
              <p>Independent verification by accredited bodies</p>
            </div>
          </div>
          <div className="step active">
            <div className="step-number">4</div>
            <div className="step-content">
              <h4>Carbon Credit Minting</h4>
              <p>Ready for blockchain NFT issuance</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .section {
          max-width: 1200px;
          margin: 0 auto;
        }

        h2 {
          font-size: 2.5rem;
          margin-bottom: 2rem;
          text-align: center;
        }

        .verification-standards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .standard-card {
          background: rgba(255, 255, 255, 0.1);
          padding: 2rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .standard-card h3 {
          margin: 0 0 1rem 0;
          color: #fbbf24;
        }

        .status {
          display: inline-block;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: bold;
          margin-bottom: 1rem;
        }

        .status.verified {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
          border: 1px solid #10b981;
        }

        .standard-card p {
          margin: 0.5rem 0;
          opacity: 0.9;
        }

        .date {
          font-size: 0.9rem;
          opacity: 0.7;
        }

        .verification-process {
          background: rgba(255, 255, 255, 0.1);
          padding: 2rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .verification-process h3 {
          margin-top: 0;
          color: #fbbf24;
        }

        .process-steps {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .step {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          border-left: 4px solid rgba(255, 255, 255, 0.3);
        }

        .step.completed {
          border-left-color: #10b981;
        }

        .step.active {
          border-left-color: #fbbf24;
          background: rgba(251, 191, 36, 0.1);
        }

        .step-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          flex-shrink: 0;
        }

        .step.completed .step-number {
          background: #10b981;
        }

        .step.active .step-number {
          background: #fbbf24;
          color: #1e3a8a;
        }

        .step-content h4 {
          margin: 0 0 0.5rem 0;
        }

        .step-content p {
          margin: 0;
          opacity: 0.8;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}

function CarbonCreditsSection() {
  return (
    <div className="section">
      <h2>Carbon Credit Marketplace</h2>
      
      <div className="credits-overview">
        <div className="overview-card">
          <h3>Total Credits Minted</h3>
          <div className="big-number">1,247</div>
          <p>tonnes CO2eq</p>
        </div>
        <div className="overview-card">
          <h3>Available for Sale</h3>
          <div className="big-number">856</div>
          <p>tonnes CO2eq</p>
        </div>
        <div className="overview-card">
          <h3>Credits Offset</h3>
          <div className="big-number">391</div>
          <p>tonnes CO2eq</p>
        </div>
      </div>

      <div className="credit-listing">
        <h3>Available Carbon Credits (NFTs)</h3>
        <div className="credit-item">
          <div className="credit-info">
            <h4>Carbon Credit #BRRP-NFT-1704537600-ABC123</h4>
            <p>Units: 45.8 tonnes CO2eq | Verified: Verra, Gold Standard</p>
            <p>Location: Auckland WWTP | Date: Jan 2024</p>
            <p className="blockchain">Blockchain: 0x7a8f...4b2c | Registry: OPENEARTH-1704537600-XYZ</p>
          </div>
          <div className="credit-action">
            <div className="price">$1,375 NZD</div>
            <button className="buy-btn">Purchase & Offset</button>
          </div>
        </div>

        <div className="credit-item">
          <div className="credit-info">
            <h4>Carbon Credit #BRRP-NFT-1704451200-DEF456</h4>
            <p>Units: 38.2 tonnes CO2eq | Verified: Toitū/Ekos</p>
            <p>Location: Wellington Facility | Date: Jan 2024</p>
            <p className="blockchain">Blockchain: 0x9c1d...3a8e | Registry: OPENEARTH-1704451200-QRS</p>
          </div>
          <div className="credit-action">
            <div className="price">$1,146 NZD</div>
            <button className="buy-btn">Purchase & Offset</button>
          </div>
        </div>
      </div>

      <div className="lifecycle-info">
        <h3>Carbon Credit Lifecycle</h3>
        <div className="lifecycle-steps">
          <div className="lifecycle-step">
            <div className="step-icon">🏭</div>
            <h4>1. Mint</h4>
            <p>NFT created after verification</p>
          </div>
          <div className="lifecycle-step">
            <div className="step-icon">🌍</div>
            <h4>2. Validate</h4>
            <p>National carbon budget check</p>
          </div>
          <div className="lifecycle-step">
            <div className="step-icon">💰</div>
            <h4>3. Sale</h4>
            <p>Listed on compliance market</p>
          </div>
          <div className="lifecycle-step">
            <div className="step-icon">♻️</div>
            <h4>4. Offset</h4>
            <p>Purchased for emissions offset</p>
          </div>
          <div className="lifecycle-step">
            <div className="step-icon">🔥</div>
            <h4>5. Destroy</h4>
            <p>Credit destroyed to prevent reuse</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .section {
          max-width: 1200px;
          margin: 0 auto;
        }

        h2 {
          font-size: 2.5rem;
          margin-bottom: 2rem;
          text-align: center;
        }

        .credits-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .overview-card {
          background: rgba(255, 255, 255, 0.1);
          padding: 2rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          text-align: center;
        }

        .overview-card h3 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          opacity: 0.8;
        }

        .big-number {
          font-size: 3rem;
          font-weight: bold;
          color: #fbbf24;
          margin-bottom: 0.5rem;
        }

        .credit-listing {
          background: rgba(255, 255, 255, 0.1);
          padding: 2rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          margin-bottom: 2rem;
        }

        .credit-listing h3 {
          margin-top: 0;
          color: #fbbf24;
        }

        .credit-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          padding: 1.5rem;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          margin-bottom: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .credit-info h4 {
          margin: 0 0 0.5rem 0;
          color: #fbbf24;
          font-size: 1.1rem;
        }

        .credit-info p {
          margin: 0.25rem 0;
          opacity: 0.8;
          font-size: 0.9rem;
        }

        .blockchain {
          font-family: monospace;
          font-size: 0.8rem;
          opacity: 0.6;
        }

        .credit-action {
          text-align: right;
          flex-shrink: 0;
        }

        .price {
          font-size: 1.5rem;
          font-weight: bold;
          color: #fbbf24;
          margin-bottom: 1rem;
        }

        .buy-btn {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(45deg, #fbbf24, #f59e0b);
          border: none;
          border-radius: 6px;
          color: #1e3a8a;
          font-weight: bold;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .buy-btn:hover {
          transform: translateY(-2px);
        }

        .lifecycle-info {
          background: rgba(255, 255, 255, 0.1);
          padding: 2rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .lifecycle-info h3 {
          margin-top: 0;
          color: #fbbf24;
        }

        .lifecycle-steps {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .lifecycle-step {
          flex: 1;
          min-width: 150px;
          text-align: center;
          padding: 1rem;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
        }

        .step-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .lifecycle-step h4 {
          margin: 0.5rem 0;
          color: #fbbf24;
        }

        .lifecycle-step p {
          margin: 0;
          font-size: 0.9rem;
          opacity: 0.8;
        }

        @media (max-width: 768px) {
          .credit-item {
            flex-direction: column;
            align-items: flex-start;
          }

          .credit-action {
            text-align: left;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
