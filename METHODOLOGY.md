# Alimentary Emissions Calculation Methodology

## Framework Adherence

The BRRP.IO platform's approach to reporting GHG emissions aligns with:

1. **International Greenhouse Gas Protocol** - Corporate Accounting and Reporting Standard
2. **IPCC Standards** - In collaboration with SeeGreen Solutions LLP
3. **New Zealand Government MFE Guidance** - Measuring Emissions Guidance (August 2022)

## Core Formula

### Emissions Reduction Calculation

```
E = Q × F
```

Where:
- **E** = Emissions reduction (tonnes CO2eq)
- **Q** = Quantity of waste processed (tonnes)
- **F** = Emissions factor for the waste type (tonnes CO2eq/tonne)

### Principle

The emissions reductions achieved through waste processing are **directly proportional** to the prevention of emissions if the waste were directed to landfills. By diverting waste from landfills and processing it through anaerobic digestion, we prevent methane emissions that would otherwise occur.

## MFE Emission Factors

As documented in **Table 34, Page 25** of the MFE Measuring Emissions Guidance (August 2022):

| Waste Type | Emission Factor | Unit |
|------------|----------------|------|
| Food Waste | 0.64 | tonnes CO2eq/tonne |
| Garden Waste | 0.18 | tonnes CO2eq/tonne |
| Sewage Sludge | 0.12 | tonnes CO2eq/tonne |
| Grape Marc* | 0.18 | tonnes CO2eq/tonne |
| Anaerobic Digestion | 0.05 | tonnes CO2eq/tonne |

*Note: Grape marc emission factor is assumed equal to garden waste as a working assumption. Determining the specific emission factor requires laboratory testing per MFE formula in Section 10.3.3, Page 100.

## BRRP Configuration - Nelson Tech Demonstrator

### Daily Waste Feedstock

The Nelson Tech Demonstrator (Bioenergy Resource Recovery Plant) processes:

- **Total Daily Feedstock**: 10 tonnes/day
  - **Sewage Sludge**: 3 tonnes/day (from Nelson WWTP, Bell Island)
  - **Municipal Green Waste**: 7 tonnes/day

### Seasonal Processing

**Grape Marc Processing** (Late Summer/Harvest Season):
- The integrated Industrial Wastewater Treatment Plant (iIWTP) additionally processes grape marc during the grape harvest season
- Emission factor working assumption: Equal to garden waste (0.18 tonnes CO2eq/tonne)
- Specific factor determination: Requires laboratory testing per MFE Section 10.3.3

### Energy Production

**Electricity Surplus**: 1,200 kWh/day estimated

## Global Warming Potential (GWP)

100-year time horizon values (IPCC AR5):

- **CO₂**: GWP = 1 (baseline)
- **CH₄** (Methane): GWP = 28

## Environmental Inventory

For each project year, a detailed environmental inventory includes:

### Manufacturing Processes
- Materials utilized
- Energy consumption
- Waste generated

### Organic Waste Processing
- Designed to minimize gross emissions
- Track waste reduction
- Monitor energy generation

### Scope 1 Emissions (Direct)
- Organic waste processing
- On-site anaerobic digestion

### Scope 2 Emissions (Indirect)
- Purchased electricity for operations

### Scope 3 Emissions (Supply Chain)
- Manufacturing and construction materials:
  - Steel quantity (tonnes)
  - Concrete quantity (tonnes)
  - Shipping distances and freight emissions
  - Transport from suppliers to site

## Calculation Examples

### Example 1: Daily Sewage Sludge Processing

```
Q = 3 tonnes/day (sewage sludge)
F = 0.12 tonnes CO2eq/tonne
E = 3 × 0.12 = 0.36 tonnes CO2eq/day
```

### Example 2: Daily Green Waste Processing

```
Q = 7 tonnes/day (green waste)
F = 0.18 tonnes CO2eq/tonne
E = 7 × 0.18 = 1.26 tonnes CO2eq/day
```

### Example 3: Total Daily BRRP Emissions Reduction

```
Sewage Sludge: 3 × 0.12 = 0.36 tonnes CO2eq
Green Waste: 7 × 0.18 = 1.26 tonnes CO2eq
Total Daily Reduction: 0.36 + 1.26 = 1.62 tonnes CO2eq/day
Annual Reduction: 1.62 × 365 = 591.3 tonnes CO2eq/year
```

### Example 4: With Seasonal Grape Marc (2 tonnes/day during harvest)

```
Sewage Sludge: 3 × 0.12 = 0.36 tonnes CO2eq
Green Waste: 7 × 0.18 = 1.26 tonnes CO2eq
Grape Marc: 2 × 0.18 = 0.36 tonnes CO2eq
Total Daily (Harvest): 0.36 + 1.26 + 0.36 = 1.98 tonnes CO2eq/day
```

## Reporting Standards

### IPCC Standards Applied

1. **ACM0022**: Alternative waste treatment processes
   - Applicable to waste diversion from landfills to bioenergy facilities

2. **AM0053**: Biogenic methane injection to natural gas distribution grid
   - For methane utilization in energy systems

3. **AMS-I.D**: Grid connected renewable electricity generation
   - For electricity production from waste-to-methane conversion

### Verification Requirements

Third-party verification by:
- **Verra** (Verified Carbon Standard)
- **Gold Standard** (SDG compliance)
- **Toitū/Ekos** (ISO 14064-3)

Verification cycle: **Bi-annual** (every 6 months)

## Implementation in BRRP.IO

### Service: `EmissionsCalculationService`

#### Key Methods

**1. Calculate Emissions Reduction (E = Q × F)**
```typescript
EmissionsCalculationService.calculateEmissionsReduction(
  quantity: number,
  wasteType: 'FOOD_WASTE' | 'GARDEN_WASTE' | 'SEWAGE_SLUDGE' | 'GRAPE_MARC'
): number
```

**2. Calculate BRRP Daily Operations**
```typescript
EmissionsCalculationService.calculateBRRPDailyReduction(
  sewageSludgeQty: number = 3,
  greenWasteQty: number = 7,
  grapeMarc: number = 0
): {
  sewageSludgeReduction: number;
  greenWasteReduction: number;
  grapeMarcReduction: number;
  totalReduction: number;
  electricityProduced: number;
}
```

**3. Get MFE Emission Factors**
```typescript
EmissionsCalculationService.getMFEEmissionFactor(
  wasteType: string
): number
```

**4. Get BRRP Configuration**
```typescript
EmissionsCalculationService.getBRRPConfig()
```

## Data Quality & Transparency

### Immutable Records
All emissions data is:
- **Geolocated**: Tied to specific facility locations
- **Time-stamped**: Recorded with precise timestamps
- **Immutable**: Cannot be altered once recorded
- **Blockchain-verified**: Stored on immutable ledger

### Audit Trail
Complete transparency with:
- Source waste quantities
- Emission factors applied
- Calculations performed
- Energy generated
- Credits issued

## Continuous Improvement

### Laboratory Testing
For specific emission factors (e.g., grape marc):
1. Collect waste samples
2. Perform laboratory analysis
3. Calculate specific emission factor per MFE formula (Section 10.3.3)
4. Update emission factors in system

### Annual Reviews
- Update emission factors from latest MFE guidance
- Review and optimize processing efficiency
- Track year-over-year improvements
- Report to stakeholders and verification bodies

## References

1. International Greenhouse Gas Protocol - Corporate Accounting and Reporting Standard
2. IPCC Assessment Report 5 (AR5) - 100-year GWP values
3. New Zealand Ministry for the Environment (MFE) - Measuring Emissions Guidance, August 2022
   - Table 34, Page 25: Organic waste emission factors
   - Section 10.3.3, Page 100: Emission factor calculation formula
4. SeeGreen Solutions LLP - IPCC standards collaboration
5. Verra VCS Standard
6. Gold Standard for the Global Goals
7. ISO 14064-3:2019 - Greenhouse gas verification

---

**Last Updated**: January 2024  
**Version**: 1.0  
**Platform**: BRRP.IO - Unconventional Gold
