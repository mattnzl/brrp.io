import { SCADAMeasurement, EmissionsData, IPCCStandard, GeoLocation } from '../types';
import { getPool } from '../lib/db';
import { EmissionsCalculationService } from './emissionsCalculation';

/**
 * SCADA Data Service
 * Handles real-time SCADA data ingestion and processing
 * Integrates with emissions calculation for carbon credit generation
 */

export class SCADADataService {
  /**
   * Ingest SCADA measurement data from REST endpoint
   */
  static async ingestMeasurement(
    facilityId: string,
    timestamp: Date,
    wasteProcessed: number,
    methaneGenerated: number,
    methaneDestroyed: number,
    electricityProduced?: number,
    processHeatProduced?: number,
    location?: GeoLocation
  ): Promise<SCADAMeasurement> {
    const pool = getPool();

    // Insert SCADA measurement (immutable)
    const result = await pool.query(
      `
      INSERT INTO scada_measurements (
        facility_id, timestamp, waste_processed, methane_generated,
        methane_destroyed, electricity_produced, process_heat_produced,
        latitude, longitude, location_address, immutable
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
      RETURNING 
        id, facility_id as "facilityId", timestamp,
        waste_processed as "wasteProcessed",
        methane_generated as "methaneGenerated",
        methane_destroyed as "methaneDestroyed",
        electricity_produced as "electricityProduced",
        process_heat_produced as "processHeatProduced",
        latitude, longitude, location_address as "locationAddress",
        immutable, created_at as "createdAt"
    `,
      [
        facilityId,
        timestamp,
        wasteProcessed,
        methaneGenerated,
        methaneDestroyed,
        electricityProduced || null,
        processHeatProduced || null,
        location?.latitude || null,
        location?.longitude || null,
        location?.address || null,
      ]
    );

    const measurement: SCADAMeasurement = {
      ...result.rows[0],
      location: {
        latitude: result.rows[0].latitude,
        longitude: result.rows[0].longitude,
        address: result.rows[0].locationAddress,
      },
    };

    // Automatically calculate emissions data
    await this.calculateEmissions(measurement);

    return measurement;
  }

  /**
   * Calculate and store emissions data for a SCADA measurement
   */
  static async calculateEmissions(
    scadaData: SCADAMeasurement,
    standard: IPCCStandard = IPCCStandard.ACM0022
  ): Promise<EmissionsData> {
    // Use the emissions calculation service
    const emissionsData = EmissionsCalculationService.calculateGER(scadaData, standard);

    // Store in database
    const pool = getPool();
    const result = await pool.query(
      `
      INSERT INTO emissions_data (
        scada_measurement_id, methane_destroyed, co2_equivalent,
        global_warming_potential, energy_produced, def_value,
        gross_emissions_reduction, standard_used
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING 
        id, scada_measurement_id as "scadaMeasurementId",
        methane_destroyed as "methaneDestroyed",
        co2_equivalent as "co2Equivalent",
        global_warming_potential as "globalWarmingPotential",
        energy_produced as "energyProduced",
        def_value as "defValue",
        gross_emissions_reduction as "grossEmissionsReduction",
        calculated_at as "calculatedAt",
        standard_used as "standardUsed",
        created_at as "createdAt"
    `,
      [
        scadaData.id,
        emissionsData.methaneDestroyed,
        emissionsData.co2Equivalent,
        emissionsData.globalWarmingPotential,
        emissionsData.energyProduced,
        emissionsData.defValue,
        emissionsData.grossEmissionsReduction,
        emissionsData.standardUsed,
      ]
    );

    return result.rows[0];
  }

  /**
   * Get SCADA measurements for a facility within a date range
   */
  static async getMeasurements(
    facilityId: string,
    startDate: Date,
    endDate: Date
  ): Promise<SCADAMeasurement[]> {
    const pool = getPool();
    const result = await pool.query(
      `
      SELECT 
        id, facility_id as "facilityId", timestamp,
        waste_processed as "wasteProcessed",
        methane_generated as "methaneGenerated",
        methane_destroyed as "methaneDestroyed",
        electricity_produced as "electricityProduced",
        process_heat_produced as "processHeatProduced",
        latitude, longitude, location_address as "locationAddress",
        immutable, created_at as "createdAt"
      FROM scada_measurements
      WHERE facility_id = $1
        AND timestamp >= $2
        AND timestamp <= $3
      ORDER BY timestamp DESC
    `,
      [facilityId, startDate, endDate]
    );

    return result.rows.map((row) => ({
      ...row,
      location: {
        latitude: row.latitude,
        longitude: row.longitude,
        address: row.locationAddress,
      },
    }));
  }

  /**
   * Get emissions data for a SCADA measurement
   */
  static async getEmissionsData(scadaMeasurementId: string): Promise<EmissionsData | null> {
    const pool = getPool();
    const result = await pool.query(
      `
      SELECT 
        id, scada_measurement_id as "scadaMeasurementId",
        methane_destroyed as "methaneDestroyed",
        co2_equivalent as "co2Equivalent",
        global_warming_potential as "globalWarmingPotential",
        energy_produced as "energyProduced",
        def_value as "defValue",
        gross_emissions_reduction as "grossEmissionsReduction",
        calculated_at as "calculatedAt",
        standard_used as "standardUsed",
        created_at as "createdAt"
      FROM emissions_data
      WHERE scada_measurement_id = $1
      LIMIT 1
    `,
      [scadaMeasurementId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  /**
   * Get aggregated emissions data for a facility within a date range
   */
  static async getAggregatedEmissions(
    facilityId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalMethaneDestroyed: number;
    totalCO2Equivalent: number;
    totalEnergyProduced: number;
    totalGrossEmissionsReduction: number;
    measurementCount: number;
  }> {
    const pool = getPool();
    const result = await pool.query(
      `
      SELECT 
        COUNT(*) as "measurementCount",
        COALESCE(SUM(ed.methane_destroyed), 0) as "totalMethaneDestroyed",
        COALESCE(SUM(ed.co2_equivalent), 0) as "totalCO2Equivalent",
        COALESCE(SUM(ed.energy_produced), 0) as "totalEnergyProduced",
        COALESCE(SUM(ed.gross_emissions_reduction), 0) as "totalGrossEmissionsReduction"
      FROM scada_measurements sm
      LEFT JOIN emissions_data ed ON ed.scada_measurement_id = sm.id
      WHERE sm.facility_id = $1
        AND sm.timestamp >= $2
        AND sm.timestamp <= $3
    `,
      [facilityId, startDate, endDate]
    );

    return {
      measurementCount: parseInt(result.rows[0].measurementCount),
      totalMethaneDestroyed: parseFloat(result.rows[0].totalMethaneDestroyed),
      totalCO2Equivalent: parseFloat(result.rows[0].totalCO2Equivalent),
      totalEnergyProduced: parseFloat(result.rows[0].totalEnergyProduced),
      totalGrossEmissionsReduction: parseFloat(result.rows[0].totalGrossEmissionsReduction),
    };
  }

  /**
   * Validate SCADA data before ingestion
   */
  static validateMeasurement(data: {
    wasteProcessed: number;
    methaneGenerated: number;
    methaneDestroyed: number;
    electricityProduced?: number;
    processHeatProduced?: number;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (data.wasteProcessed <= 0) {
      errors.push('Waste processed must be greater than 0');
    }

    if (data.methaneGenerated < 0) {
      errors.push('Methane generated cannot be negative');
    }

    if (data.methaneDestroyed < 0) {
      errors.push('Methane destroyed cannot be negative');
    }

    if (data.methaneDestroyed > data.methaneGenerated) {
      errors.push('Methane destroyed cannot exceed methane generated');
    }

    if (data.electricityProduced !== undefined && data.electricityProduced < 0) {
      errors.push('Electricity produced cannot be negative');
    }

    if (data.processHeatProduced !== undefined && data.processHeatProduced < 0) {
      errors.push('Process heat produced cannot be negative');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
