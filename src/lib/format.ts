/**
 * Format a number as currency (EUR) with 2 decimal places
 */
export function formatCurrency(amount: number | string | null | undefined): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : (amount ?? 0)
  if (isNaN(num)) return '0,00€'
  return num.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + '€'
}

/**
 * Format a number with 2 decimal places (no currency symbol)
 */
export function formatNumber(amount: number | string | null | undefined): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : (amount ?? 0)
  if (isNaN(num)) return '0,00'
  return num.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

/**
 * Round a number to 2 decimal places
 */
export function round2(num: number): number {
  return Math.round(num * 100) / 100
}

/**
 * Format a percentage with 0 decimal places
 */
export function formatPercent(amount: number | string | null | undefined): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : (amount ?? 0)
  if (isNaN(num)) return '0%'
  return num.toFixed(0) + '%'
}
