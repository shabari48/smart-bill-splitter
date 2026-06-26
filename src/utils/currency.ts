/**
 * Format a number as INR currency string.
 */
export function formatINR(amount: number): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  return amount < 0 ? `-${formatted}` : formatted;
}

/**
 * Format a number as a short INR string (e.g., ₹83.33)
 */
export function formatINRShort(amount: number): string {
  return `₹${Math.abs(amount).toFixed(2)}${amount < 0 ? ' (cr)' : ''}`;
}

/**
 * Parse a string to a valid number, returning 0 if invalid.
 */
export function parseNumber(value: string): number {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}
