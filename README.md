# BRRP.IO - Carbon Credit Platform

**Unconventional Gold** - Blockchain-based Carbon Credit Platform for Waste-to-Methane Conversion

## Overview

BRRP.IO is a comprehensive platform for tracking, verifying, and trading carbon credits generated from waste-to-methane conversion processes. The system integrates real-time SCADA monitoring, IPCC-compliant emissions calculations, third-party verification, and blockchain-based NFT issuance.

### Emissions Calculation Methodology

The platform implements **Alimentary's methodology** for carbon reporting, adhering to:
- International Greenhouse Gas Protocol (Corporate Accounting and Reporting Standard)
- IPCC standards (collaboration with SeeGreen Solutions LLP)
- New Zealand Government MFE guidance (Measuring Emissions Guidance - August 2022)

**Core Formula**: `E = Q × F` (Emissions = Quantity × Factor)

For detailed methodology, see [METHODOLOGY.md](METHODOLOGY.md).

## Key Features

### 🗑️ Waste-to-Methane Conversion
- **Input Sources**: Sewage sludge, food waste, garden waste, landfill organic waste, and grape marc (seasonal)
- **BRRP Processing**: Predefined waste processing pipeline based on Nelson Tech Demonstrator configuration
- **SCADA Monitoring**: Real-time measurement of waste processing and methane destruction
- **Energy Production**: Track electricity (1,200 kWh/day surplus) and process heat generation

### 📊 Emissions Tracking & Calculation
- **IPCC Standards**: Compliance with ACM0022, AM0053, and AMS-I.D standards
- **MFE Emission Factors**: Uses official NZ Government emission factors (August 2022, Table 34)
  - Food Waste: 0.64 tonnes CO2eq/tonne
  - Garden Waste: 0.18 tonnes CO2eq/tonne
  - Sewage Sludge: 0.12 tonnes CO2eq/tonne
  - Grape Marc: 0.18 tonnes CO2eq/tonne (working assumption)
- **CO₂ Equivalence**: Precise calculation using E = Q × F formula
- **GWP Factor**: Uses IPCC AR5 Global Warming Potential (CH₄ = 28, 100-year horizon)
- **GER Tracking**: Gross Emissions Reduction from waste diversion
- **Immutable Records**: Geolocated, time-based data that cannot be altered

### ✅ Independent Verification
- **Verra (VCS)**: Verified Carbon Standard compliance
- **Gold Standard**: SDG impact assessment and certification
- **Toitū/Ekos**: New Zealand emissions verification (ISO 14064-3)
- **Bi-annual Cycle**: Regular verification every 6 months

### 🔗 Blockchain Integration
- **NFT Carbon Credits**: Each credit is a unique, non-fungible token
- **Transparent Ledger**: All transactions recorded on blockchain
- **Open Earth Registry**: Sync with global carbon credit registry
- **National Carbon Budget**: Validation against Nationally Determined Contributions (NDC)

### ♻️ Carbon Credit Lifecycle
1. **Mint**: NFT created after verification
2. **Validate**: Check against national carbon budget
3. **Sale**: Listed on compliance market
4. **Offset**: Purchased for emissions offsetting
5. **Destroy**: Credit destroyed to prevent reuse and double-counting

## Technical Architecture

### Data Flow
```
Waste Input → BRRP Processing → SCADA Measurement → Emissions Calculation
    ↓
IPCC Validation → Third-Party Verification → NFT Minting
    ↓
National Budget Validation → Marketplace Listing → Purchase & Offset → Destruction
```

### Technology Stack
- **Frontend**: Next.js 14, React 18, TypeScript
- **Standards**: IPCC ACM0022, AM0053, AMS-I.D
- **Verification**: Verra, Gold Standard, Toitū/Ekos
- **Blockchain**: NFT-based carbon credits
- **External Data**: MFE (Ministry for the Environment), WWTP standards database

## Project Structure

```
brrp.io/
├── src/
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts     # All data models (Waste, SCADA, Emissions, etc.)
│   ├── services/        # Business logic services
│   │   ├── emissionsCalculation.ts  # IPCC-compliant calculations
│   │   ├── carbonCredit.ts          # Carbon credit lifecycle
│   │   ├── verification.ts          # Verification process
│   │   ├── wasteProcessing.ts       # BRRP waste processing
│   │   └── externalData.ts          # MFE, WWTP, Open Earth integration
│   ├── pages/           # Next.js pages
│   │   ├── index.tsx    # Main application UI
│   │   ├── _app.tsx     # App wrapper
│   │   └── _document.tsx
│   └── components/      # Reusable React components
├── public/              # Static assets
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript configuration
└── next.config.js       # Next.js configuration
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Data Models

### Waste Input
- Source type (sewerage sludge, landfill organic)
- Quantity in tonnes
- Geolocated source information
- Processing facility

### SCADA Measurement
- Real-time waste processing data
- Methane generated and destroyed (m³)
- Electricity/heat production
- Immutable, geolocated records

### Emissions Data
- Methane destroyed
- CO₂ equivalent (tonnes CO2eq)
- Global Warming Potential factor
- Default Emission Factor (DEF)
- Gross Emissions Reduction (GER)
- IPCC standard used

### Verification Record
- Verification standard (Verra, Gold Standard, Toitū/Ekos)
- Verification status and date
- Certificate URL
- Next verification due date

### Carbon Credit (NFT)
- Unique token ID
- Units (tonnes CO2eq)
- Blockchain address
- Open Earth registry ID
- National carbon budget validation status
- Current status (minted, available, sold, offset, destroyed)

## IPCC Standards Compliance

### ACM0022
Alternative waste treatment processes - applicable to waste diversion from landfills to bioenergy facilities.

### AM0053
Biogenic methane injection to natural gas distribution grid - for methane utilization in energy systems.

### AMS-I.D
Grid connected renewable electricity generation - for electricity production from waste-to-methane conversion.

## Verification Process

1. **Data Collection**: SCADA measurements and emissions calculations
2. **IPCC Validation**: Ensure compliance with IPCC engineering standards
3. **Third-Party Verification**: Independent verification by accredited bodies
4. **Certificate Issuance**: Digital certificate upon successful verification
5. **Bi-annual Review**: Ongoing verification every 6 months

## Carbon Credit Issuance

1. **Verification Complete**: All third-party verifications passed
2. **NFT Minting**: Create unique blockchain token
3. **Registry Sync**: Upload to Open Earth global registry
4. **Budget Validation**: Check against national carbon budget/NDC
5. **Marketplace Listing**: Make available for purchase

## Carbon Credit Lifecycle

- **Minted**: NFT created on blockchain
- **Available**: Listed for sale on compliance market
- **Sold**: Purchased by buyer
- **Offset**: Used to offset emissions
- **Destroyed**: Permanently removed to prevent reuse

## External Integrations

### MFE (Ministry for the Environment)
- Default emissions factors
- National standards compliance
- Emissions data validation

### WWTP Standards Database
- Wastewater treatment plant performance data
- Compliance tracking
- Inspection records

### Open Earth Register
- Global carbon credit registry
- Transparent record keeping
- International verification

### National Carbon Budget
- NDC (Nationally Determined Contribution) validation
- Government compliance
- Climate target alignment

## Environmental Impact

This platform helps:
- Divert waste from landfills
- Capture and destroy methane (28x more potent than CO₂)
- Generate renewable energy
- Create verified carbon credits
- Support national and international climate goals
- Provide transparent, traceable emissions reductions

## Security & Integrity

- **Immutable Records**: Blockchain ensures data cannot be altered
- **Geolocated Data**: All measurements tied to specific locations
- **Time-stamped**: Precise temporal tracking
- **Third-Party Verification**: Independent validation
- **Credit Destruction**: Prevents double-counting and fraud
- **Transparent Transactions**: Full audit trail

## License

ISC

## Contact

For questions about BRRP.IO, please contact the development team.

---

**BRRP.IO** - Transforming waste into verified, blockchain-based carbon credits.
