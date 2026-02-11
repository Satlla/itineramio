/**
 * Shared calculation utilities for Gestion module
 * Centralizes commission, cleaning, and liquidation calculations
 */

import { Decimal } from '@prisma/client/runtime/library'

// ============================================
// Types
// ============================================

export interface BillingConfig {
  commissionType: 'PERCENTAGE' | 'FIXED_PER_RESERVATION' | 'FIXED_PER_NIGHT'
  commissionValue: number | Decimal
  commissionVat: number | Decimal
  cleaningType: 'FIXED_PER_RESERVATION' | 'PER_NIGHT'
  cleaningValue: number | Decimal
  cleaningFeeRecipient: 'MANAGER' | 'OWNER' | 'SPLIT'
  cleaningVatIncluded: boolean
}

export interface ReservationAmounts {
  hostEarnings: number
  cleaningFee: number
  nights: number
}

export interface CalculatedAmounts {
  commissionBase: number
  commissionAmount: number
  commissionVatAmount: number
  cleaningAmount: number
  ownerAmount: number
  managerAmount: number
}

// ============================================
// Commission Calculations
// ============================================

/**
 * Calculate manager commission based on billing config
 */
export function calculateCommission(
  reservation: ReservationAmounts,
  config: BillingConfig
): { base: number; amount: number; vatAmount: number } {
  const commissionValue = Number(config.commissionValue) || 0
  const commissionVat = Number(config.commissionVat) || 0
  const earnings = reservation.hostEarnings
  const cleaningFee = reservation.cleaningFee

  let commissionBase = 0
  let commissionAmount = 0

  switch (config.commissionType) {
    case 'PERCENTAGE':
      // Commission on earnings minus cleaning (cleaning is separate)
      commissionBase = earnings - cleaningFee
      commissionAmount = commissionBase * (commissionValue / 100)
      break

    case 'FIXED_PER_RESERVATION':
      commissionBase = earnings - cleaningFee
      commissionAmount = commissionValue
      break

    case 'FIXED_PER_NIGHT':
      commissionBase = earnings - cleaningFee
      commissionAmount = commissionValue * reservation.nights
      break

    default:
      commissionBase = earnings - cleaningFee
      commissionAmount = 0
  }

  // Calculate VAT on commission
  const commissionVatAmount = commissionAmount * (commissionVat / 100)

  return {
    base: round2(commissionBase),
    amount: round2(commissionAmount),
    vatAmount: round2(commissionVatAmount)
  }
}

// ============================================
// Cleaning Calculations
// ============================================

/**
 * Calculate cleaning fee based on billing config
 */
export function calculateCleaning(
  nights: number,
  config: BillingConfig
): number {
  const cleaningValue = Number(config.cleaningValue) || 0

  switch (config.cleaningType) {
    case 'PER_NIGHT':
      return round2(cleaningValue * nights)

    case 'FIXED_PER_RESERVATION':
    default:
      return round2(cleaningValue)
  }
}

/**
 * Determine how cleaning fee is split between owner and manager
 */
export function splitCleaningFee(
  cleaningAmount: number,
  recipient: 'MANAGER' | 'OWNER' | 'SPLIT'
): { toManager: number; toOwner: number } {
  switch (recipient) {
    case 'MANAGER':
      return { toManager: cleaningAmount, toOwner: 0 }

    case 'OWNER':
      return { toManager: 0, toOwner: cleaningAmount }

    case 'SPLIT':
      const half = round2(cleaningAmount / 2)
      return { toManager: half, toOwner: cleaningAmount - half }

    default:
      return { toManager: cleaningAmount, toOwner: 0 }
  }
}

// ============================================
// Full Reservation Calculation
// ============================================

/**
 * Calculate all amounts for a reservation
 */
export function calculateReservationAmounts(
  reservation: ReservationAmounts,
  config: BillingConfig
): CalculatedAmounts {
  // Calculate commission
  const commission = calculateCommission(reservation, config)

  // Calculate cleaning
  const cleaningAmount = calculateCleaning(reservation.nights, config)

  // Split cleaning
  const cleaningSplit = splitCleaningFee(cleaningAmount, config.cleaningFeeRecipient)

  // Manager gets: commission + their share of cleaning
  const managerAmount = commission.amount + cleaningSplit.toManager

  // Owner gets: earnings - commission - cleaning (+ their share of cleaning)
  const ownerAmount = reservation.hostEarnings - commission.amount - cleaningAmount + cleaningSplit.toOwner

  return {
    commissionBase: commission.base,
    commissionAmount: commission.amount,
    commissionVatAmount: commission.vatAmount,
    cleaningAmount,
    ownerAmount: round2(ownerAmount),
    managerAmount: round2(managerAmount)
  }
}

// ============================================
// Liquidation Summary
// ============================================

export interface LiquidationSummary {
  totalEarnings: number
  totalCommission: number
  totalCommissionVat: number
  totalCleaning: number
  totalCleaningToManager: number
  totalCleaningToOwner: number
  totalExpenses: number
  totalOwnerAmount: number
  totalManagerAmount: number
}

/**
 * Calculate liquidation totals from reservations and expenses
 */
export function calculateLiquidationSummary(
  reservations: Array<ReservationAmounts & { config: BillingConfig }>,
  expenses: Array<{ amount: number; chargeToOwner: boolean }>
): LiquidationSummary {
  let totalEarnings = 0
  let totalCommission = 0
  let totalCommissionVat = 0
  let totalCleaning = 0
  let totalCleaningToManager = 0
  let totalCleaningToOwner = 0
  let totalOwnerAmount = 0
  let totalManagerAmount = 0

  // Process each reservation
  for (const res of reservations) {
    const amounts = calculateReservationAmounts(res, res.config)
    const cleaningSplit = splitCleaningFee(amounts.cleaningAmount, res.config.cleaningFeeRecipient)

    totalEarnings += res.hostEarnings
    totalCommission += amounts.commissionAmount
    totalCommissionVat += amounts.commissionVatAmount
    totalCleaning += amounts.cleaningAmount
    totalCleaningToManager += cleaningSplit.toManager
    totalCleaningToOwner += cleaningSplit.toOwner
    totalOwnerAmount += amounts.ownerAmount
    totalManagerAmount += amounts.managerAmount
  }

  // Process expenses
  let totalExpenses = 0
  for (const expense of expenses) {
    if (expense.chargeToOwner) {
      totalExpenses += expense.amount
      totalOwnerAmount -= expense.amount
    }
  }

  return {
    totalEarnings: round2(totalEarnings),
    totalCommission: round2(totalCommission),
    totalCommissionVat: round2(totalCommissionVat),
    totalCleaning: round2(totalCleaning),
    totalCleaningToManager: round2(totalCleaningToManager),
    totalCleaningToOwner: round2(totalCleaningToOwner),
    totalExpenses: round2(totalExpenses),
    totalOwnerAmount: round2(totalOwnerAmount),
    totalManagerAmount: round2(totalManagerAmount)
  }
}

// ============================================
// Utility Functions
// ============================================

/**
 * Round to 2 decimal places
 */
export function round2(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * Convert Decimal to number safely
 */
export function toNumber(value: number | Decimal | null | undefined): number {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  return Number(value) || 0
}

/**
 * Format currency for display
 */
export function formatCurrency(
  amount: number,
  currency: string = 'EUR',
  locale: string = 'es-ES'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(amount)
}
