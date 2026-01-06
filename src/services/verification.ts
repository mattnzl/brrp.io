import { VerificationRecord, VerificationStandard, VerificationStatus, EmissionsData } from '../types';

/**
 * Verification Service
 * Handles verification process with third-party standards (Verra, Gold Standard, Toitū/Ekos)
 */

export class VerificationService {
  /**
   * Initiate verification process
   * @param emissionsData Emissions data to verify
   * @param standard Verification standard to use
   * @param verifier Name of verification body
   * @returns Verification record
   */
  static initiateVerification(
    emissionsData: EmissionsData,
    standard: VerificationStandard,
    verifier: string
  ): VerificationRecord {
    // Calculate next verification due date (bi-annual)
    const nextVerificationDue = new Date();
    nextVerificationDue.setMonth(nextVerificationDue.getMonth() + 6);

    const verificationRecord: VerificationRecord = {
      id: `VR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      emissionsDataId: emissionsData.id,
      standard,
      verifiedBy: verifier,
      verificationDate: new Date(),
      status: VerificationStatus.PENDING,
      nextVerificationDue,
    };

    return verificationRecord;
  }

  /**
   * Update verification status
   * @param verificationRecord Verification record to update
   * @param status New status
   * @param certificateUrl Optional certificate URL
   * @param notes Optional notes
   * @returns Updated verification record
   */
  static updateVerificationStatus(
    verificationRecord: VerificationRecord,
    status: VerificationStatus,
    certificateUrl?: string,
    notes?: string
  ): VerificationRecord {
    return {
      ...verificationRecord,
      status,
      certificateUrl,
      notes,
      verificationDate: new Date(),
    };
  }

  /**
   * Check if verification is due
   * @param verificationRecord Verification record to check
   * @returns True if verification is due
   */
  static isVerificationDue(verificationRecord: VerificationRecord): boolean {
    const now = new Date();
    return now >= verificationRecord.nextVerificationDue;
  }

  /**
   * Get verification requirements for a standard
   * @param standard Verification standard
   * @returns List of requirements
   */
  static getVerificationRequirements(standard: VerificationStandard): string[] {
    const requirements: Record<VerificationStandard, string[]> = {
      [VerificationStandard.VERRA]: [
        'VCS (Verified Carbon Standard) compliance',
        'Project documentation including monitoring plan',
        'Baseline and monitoring methodology',
        'Evidence of emissions reductions',
        'Third-party validation report',
        'Stakeholder consultation documentation',
      ],
      [VerificationStandard.GOLD_STANDARD]: [
        'Gold Standard certification requirements',
        'Sustainable Development Goals (SDG) impact assessment',
        'Additionality demonstration',
        'Monitoring and verification plan',
        'Environmental and social safeguards',
        'Local stakeholder engagement evidence',
      ],
      [VerificationStandard.TOITU_EKOS]: [
        'Toitū carbonreduce or carbonzero certification',
        'New Zealand emissions factors compliance',
        'Greenhouse gas inventory',
        'Verification to ISO 14064-3',
        'Evidence of emissions reduction activities',
        'Third-party assurance statement',
      ],
    };

    return requirements[standard];
  }

  /**
   * Validate verification record completeness
   * @param verificationRecord Verification record to validate
   * @returns Validation result
   */
  static validateVerificationRecord(
    verificationRecord: VerificationRecord
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!verificationRecord.emissionsDataId) {
      errors.push('Missing emissions data ID');
    }

    if (!verificationRecord.verifiedBy || verificationRecord.verifiedBy.trim() === '') {
      errors.push('Verifier name is required');
    }

    if (verificationRecord.status === VerificationStatus.VERIFIED && !verificationRecord.certificateUrl) {
      errors.push('Certificate URL required for verified status');
    }

    const verificationAge = Date.now() - verificationRecord.verificationDate.getTime();
    const sixMonthsInMs = 6 * 30 * 24 * 60 * 60 * 1000;
    
    if (verificationAge > sixMonthsInMs && verificationRecord.status === VerificationStatus.VERIFIED) {
      errors.push('Verification is older than 6 months and may need renewal');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate verification report
   * @param verificationRecord Verification record
   * @param emissionsData Emissions data
   * @returns Verification report object
   */
  static generateVerificationReport(
    verificationRecord: VerificationRecord,
    emissionsData: EmissionsData
  ): any {
    return {
      reportId: `VRPT-${Date.now()}`,
      verificationId: verificationRecord.id,
      emissionsDataId: emissionsData.id,
      standard: verificationRecord.standard,
      verifiedBy: verificationRecord.verifiedBy,
      verificationDate: verificationRecord.verificationDate,
      status: verificationRecord.status,
      emissionsSummary: {
        methaneDestroyed: emissionsData.methaneDestroyed,
        co2Equivalent: emissionsData.co2Equivalent,
        grossEmissionsReduction: emissionsData.grossEmissionsReduction,
        standardUsed: emissionsData.standardUsed,
      },
      nextVerification: verificationRecord.nextVerificationDue,
      certificateUrl: verificationRecord.certificateUrl,
      notes: verificationRecord.notes,
      generatedAt: new Date(),
    };
  }
}
