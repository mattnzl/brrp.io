/**
 * Utility Functions for BRRP.IO
 */

/**
 * Format date to ISO string
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Format datetime to readable string
 */
export function formatDateTime(date: Date): string {
  return date.toLocaleString('en-NZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format number with decimals
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

/**
 * Format currency
 */
export function formatCurrency(value: number, currency: string = 'NZD'): string {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

/**
 * Generate unique ID
 */
export function generateId(prefix: string = 'ID'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

/**
 * Validate geolocation coordinates
 */
export function isValidGeoLocation(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Calculate distance between two geographic points (Haversine formula)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Truncate blockchain address for display
 */
export function truncateAddress(address: string, chars: number = 6): string {
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Validate blockchain address format
 */
export function isValidBlockchainAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Calculate days between dates
 */
export function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
}

/**
 * Check if date is in the past
 */
export function isPastDate(date: Date): boolean {
  return date < new Date();
}

/**
 * Check if verification is due within days
 */
export function isVerificationDueSoon(dueDate: Date, daysThreshold: number = 30): boolean {
  const now = new Date();
  const daysUntilDue = daysBetween(now, dueDate);
  return daysUntilDue <= daysThreshold && dueDate > now;
}

/**
 * Convert tonnes to kilograms
 */
export function tonnesToKg(tonnes: number): number {
  return tonnes * 1000;
}

/**
 * Convert kilograms to tonnes
 */
export function kgToTonnes(kg: number): number {
  return kg / 1000;
}

/**
 * Convert MJ to kWh
 */
export function mjToKwh(mj: number): number {
  return mj / 3.6;
}

/**
 * Convert kWh to MJ
 */
export function kwhToMj(kwh: number): number {
  return kwh * 3.6;
}

/**
 * Validate emissions data completeness
 */
export function isEmissionsDataComplete(data: any): boolean {
  return !!(
    data.methaneDestroyed &&
    data.co2Equivalent &&
    data.grossEmissionsReduction &&
    data.standardUsed
  );
}

/**
 * Calculate market value of carbon credit
 */
export function calculateCarbonCreditValue(
  co2Tonnes: number,
  pricePerTonne: number = 30 // Default NZD per tonne
): number {
  return co2Tonnes * pricePerTonne;
}

/**
 * Format CO2 equivalent for display
 */
export function formatCO2eq(tonnes: number): string {
  return `${formatNumber(tonnes)} tonnes CO2eq`;
}

/**
 * Get status color for UI
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: '#fbbf24',
    IN_PROGRESS: '#3b82f6',
    COMPLETED: '#10b981',
    VERIFIED: '#10b981',
    FAILED: '#ef4444',
    REJECTED: '#ef4444',
    MINTED: '#8b5cf6',
    AVAILABLE: '#10b981',
    SOLD: '#3b82f6',
    OFFSET: '#059669',
    DESTROYED: '#6b7280',
  };
  return colors[status] || '#9ca3af';
}

/**
 * Parse CSV data
 */
export function parseCSV(csv: string): string[][] {
  const lines = csv.split('\n');
  return lines.map(line => line.split(',').map(cell => cell.trim()));
}

/**
 * Export data to CSV
 */
export function exportToCSV(data: any[], headers: string[]): string {
  const rows = [headers.join(',')];
  data.forEach(item => {
    const values = headers.map(header => item[header] || '');
    rows.push(values.join(','));
  });
  return rows.join('\n');
}

/**
 * Download file
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
