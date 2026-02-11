/**
 * Gestion module utilities
 *
 * Usage:
 * import { calculateCommission, createExpenseSchema } from '@/lib/gestion'
 */

// Calculation utilities
export {
  calculateCommission,
  calculateCleaning,
  calculateReservationAmounts,
  calculateLiquidationSummary,
  splitCleaningFee,
  round2,
  toNumber,
  formatCurrency,
  type BillingConfig,
  type ReservationAmounts,
  type CalculatedAmounts,
  type LiquidationSummary,
} from './calculations'

// Validation schemas
export {
  paginationSchema,
  dateRangeSchema,
  createExpenseSchema,
  updateExpenseSchema,
  createInvoiceSchema,
  invoiceItemSchema,
  createReservationSchema,
  createOwnerSchema,
  createBillingUnitSchema,
  createLiquidationSchema,
  validateBody,
} from './validation'
