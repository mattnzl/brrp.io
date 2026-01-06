/**
 * Utility functions for BRRP.IO
 */

/**
 * Generate a unique job number for waste jobs
 * Format: WJ-{timestamp}-{random}
 * Example: WJ-1704537600-ABC12
 */
export function generateJobNumber(): string {
  return `WJ-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString();
}

/**
 * Format a timestamp for display
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString();
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = 'NZD'): string {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}
