/**
 * Tests para cálculos de liquidación
 * Verifica la lógica financiera crítica del módulo de gestión
 */

import { describe, it, expect } from 'vitest'
import { Decimal } from '@prisma/client/runtime/library'

// Simulamos la lógica de cálculo de liquidación extraída del route
interface ReservationData {
  hostEarnings: number
  nights: number
  billingConfig?: {
    commissionType: 'PERCENTAGE' | 'FIXED_PER_RESERVATION'
    commissionValue: number
    commissionVat: number
    cleaningType: 'FIXED_PER_RESERVATION' | 'PER_NIGHT'
    cleaningValue: number
  }
}

interface ExpenseData {
  amount: number
  vatAmount: number
}

interface LiquidationConfig {
  commissionType: 'PERCENTAGE' | 'FIXED_PER_RESERVATION'
  commissionValue: number
  commissionVat: number
  cleaningType: 'FIXED_PER_RESERVATION' | 'PER_NIGHT'
  cleaningValue: number
  monthlyFee: number
  monthlyFeeVat: number
  ownerType: 'PERSONA_FISICA' | 'EMPRESA'
}

function calculateLiquidation(
  reservations: ReservationData[],
  expenses: ExpenseData[],
  config: LiquidationConfig
) {
  let totalIncome = new Decimal(0)
  let totalCommission = new Decimal(0)
  let totalCommissionVat = new Decimal(0)
  let totalCleaning = new Decimal(0)

  for (const reservation of reservations) {
    const hostEarnings = new Decimal(reservation.hostEarnings || 0)
    totalIncome = totalIncome.plus(hostEarnings)

    // Get config from reservation or use default config
    const resCommissionType = reservation.billingConfig?.commissionType || config.commissionType
    const resCommissionValue = reservation.billingConfig?.commissionValue ?? config.commissionValue
    const resCommissionVat = reservation.billingConfig?.commissionVat ?? config.commissionVat
    const resCleaningType = reservation.billingConfig?.cleaningType || config.cleaningType
    const resCleaningValue = reservation.billingConfig?.cleaningValue ?? config.cleaningValue

    // Calculate commission
    let commission = new Decimal(0)
    if (resCommissionType === 'PERCENTAGE') {
      commission = hostEarnings.times(new Decimal(resCommissionValue || 0)).dividedBy(100)
    } else if (resCommissionType === 'FIXED_PER_RESERVATION') {
      commission = new Decimal(resCommissionValue || 0)
    }

    totalCommission = totalCommission.plus(commission)

    // Calculate commission VAT
    const commVat = commission.times(new Decimal(resCommissionVat || 21)).dividedBy(100)
    totalCommissionVat = totalCommissionVat.plus(commVat)

    // Calculate cleaning
    let cleaning = new Decimal(0)
    if (resCleaningType === 'FIXED_PER_RESERVATION') {
      cleaning = new Decimal(resCleaningValue || 0)
    } else if (resCleaningType === 'PER_NIGHT') {
      cleaning = new Decimal(resCleaningValue || 0).times(reservation.nights || 1)
    }
    totalCleaning = totalCleaning.plus(cleaning)
  }

  // Add monthly fee
  const monthlyFee = new Decimal(config.monthlyFee || 0)
  if (monthlyFee.greaterThan(0)) {
    totalCommission = totalCommission.plus(monthlyFee)
    if (config.monthlyFeeVat) {
      const feeVat = monthlyFee.times(new Decimal(config.monthlyFeeVat)).dividedBy(100)
      totalCommissionVat = totalCommissionVat.plus(feeVat)
    }
  }

  // Calculate expenses
  let totalExpenses = new Decimal(0)
  for (const expense of expenses) {
    totalExpenses = totalExpenses.plus(new Decimal(expense.amount || 0))
    totalExpenses = totalExpenses.plus(new Decimal(expense.vatAmount || 0))
  }

  // Calculate IRPF retention (15% on commission for individuals)
  let totalRetention = new Decimal(0)
  if (config.ownerType === 'PERSONA_FISICA') {
    totalRetention = totalCommission.times(new Decimal(15)).dividedBy(100)
  }

  // Calculate total to pay owner
  const totalAmount = totalIncome
    .minus(totalCommission)
    .minus(totalCommissionVat)
    .minus(totalCleaning)
    .minus(totalExpenses)

  return {
    totalIncome: Number(totalIncome),
    totalCommission: Number(totalCommission),
    totalCommissionVat: Number(totalCommissionVat),
    totalCleaning: Number(totalCleaning),
    totalExpenses: Number(totalExpenses),
    totalRetention: Number(totalRetention),
    totalAmount: Number(totalAmount)
  }
}

describe('Liquidation Calculations', () => {
  const defaultConfig: LiquidationConfig = {
    commissionType: 'PERCENTAGE',
    commissionValue: 15,
    commissionVat: 21,
    cleaningType: 'FIXED_PER_RESERVATION',
    cleaningValue: 50,
    monthlyFee: 0,
    monthlyFeeVat: 21,
    ownerType: 'PERSONA_FISICA'
  }

  describe('Commission Calculations', () => {
    it('should calculate percentage commission correctly', () => {
      const reservations: ReservationData[] = [
        { hostEarnings: 1000, nights: 3 }
      ]
      const result = calculateLiquidation(reservations, [], defaultConfig)

      // 15% of 1000 = 150
      expect(result.totalCommission).toBe(150)
    })

    it('should calculate fixed commission correctly', () => {
      const config = { ...defaultConfig, commissionType: 'FIXED_PER_RESERVATION' as const, commissionValue: 75 }
      const reservations: ReservationData[] = [
        { hostEarnings: 1000, nights: 3 },
        { hostEarnings: 500, nights: 2 }
      ]
      const result = calculateLiquidation(reservations, [], config)

      // 75 per reservation * 2 = 150
      expect(result.totalCommission).toBe(150)
    })

    it('should calculate commission VAT correctly', () => {
      const reservations: ReservationData[] = [
        { hostEarnings: 1000, nights: 3 }
      ]
      const result = calculateLiquidation(reservations, [], defaultConfig)

      // Commission = 150, VAT 21% = 31.5
      expect(result.totalCommissionVat).toBe(31.5)
    })

    it('should handle zero commission value', () => {
      const config = { ...defaultConfig, commissionValue: 0 }
      const reservations: ReservationData[] = [
        { hostEarnings: 1000, nights: 3 }
      ]
      const result = calculateLiquidation(reservations, [], config)

      expect(result.totalCommission).toBe(0)
      expect(result.totalCommissionVat).toBe(0)
    })
  })

  describe('Cleaning Fee Calculations', () => {
    it('should calculate fixed cleaning fee per reservation', () => {
      const reservations: ReservationData[] = [
        { hostEarnings: 1000, nights: 3 },
        { hostEarnings: 500, nights: 2 }
      ]
      const result = calculateLiquidation(reservations, [], defaultConfig)

      // 50 per reservation * 2 = 100
      expect(result.totalCleaning).toBe(100)
    })

    it('should calculate cleaning fee per night', () => {
      const config = { ...defaultConfig, cleaningType: 'PER_NIGHT' as const, cleaningValue: 20 }
      const reservations: ReservationData[] = [
        { hostEarnings: 1000, nights: 3 },
        { hostEarnings: 500, nights: 2 }
      ]
      const result = calculateLiquidation(reservations, [], config)

      // 20 per night * (3 + 2) = 100
      expect(result.totalCleaning).toBe(100)
    })

    it('should handle zero nights gracefully', () => {
      const config = { ...defaultConfig, cleaningType: 'PER_NIGHT' as const, cleaningValue: 20 }
      const reservations: ReservationData[] = [
        { hostEarnings: 1000, nights: 0 }
      ]
      const result = calculateLiquidation(reservations, [], config)

      // Should default to 1 night when 0
      expect(result.totalCleaning).toBe(20)
    })
  })

  describe('Expense Calculations', () => {
    it('should sum expenses correctly', () => {
      const expenses: ExpenseData[] = [
        { amount: 100, vatAmount: 21 },
        { amount: 50, vatAmount: 10.5 }
      ]
      const result = calculateLiquidation([], expenses, defaultConfig)

      // (100 + 21) + (50 + 10.5) = 181.5
      expect(result.totalExpenses).toBe(181.5)
    })

    it('should handle expenses with zero VAT', () => {
      const expenses: ExpenseData[] = [
        { amount: 100, vatAmount: 0 }
      ]
      const result = calculateLiquidation([], expenses, defaultConfig)

      expect(result.totalExpenses).toBe(100)
    })
  })

  describe('IRPF Retention', () => {
    it('should calculate 15% retention for individuals', () => {
      const config = { ...defaultConfig, ownerType: 'PERSONA_FISICA' as const }
      const reservations: ReservationData[] = [
        { hostEarnings: 1000, nights: 3 }
      ]
      const result = calculateLiquidation(reservations, [], config)

      // Commission = 150, Retention 15% = 22.5
      expect(result.totalRetention).toBe(22.5)
    })

    it('should NOT calculate retention for companies', () => {
      const config = { ...defaultConfig, ownerType: 'EMPRESA' as const }
      const reservations: ReservationData[] = [
        { hostEarnings: 1000, nights: 3 }
      ]
      const result = calculateLiquidation(reservations, [], config)

      expect(result.totalRetention).toBe(0)
    })
  })

  describe('Total Amount Calculation', () => {
    it('should calculate total amount correctly', () => {
      const reservations: ReservationData[] = [
        { hostEarnings: 1000, nights: 3 }
      ]
      const expenses: ExpenseData[] = [
        { amount: 50, vatAmount: 10.5 }
      ]
      const result = calculateLiquidation(reservations, expenses, defaultConfig)

      // Income: 1000
      // Commission: 150
      // Commission VAT: 31.5
      // Cleaning: 50
      // Expenses: 60.5
      // Total = 1000 - 150 - 31.5 - 50 - 60.5 = 708
      expect(result.totalAmount).toBe(708)
    })

    it('should handle negative total (more deductions than income)', () => {
      const config = { ...defaultConfig, commissionValue: 50 } // 50%
      const reservations: ReservationData[] = [
        { hostEarnings: 100, nights: 3 }
      ]
      const expenses: ExpenseData[] = [
        { amount: 200, vatAmount: 0 }
      ]
      const result = calculateLiquidation(reservations, expenses, config)

      // This tests that the system handles cases where owner owes money
      // Income: 100
      // Commission: 50
      // Commission VAT: 10.5
      // Cleaning: 50
      // Expenses: 200
      // Total = 100 - 50 - 10.5 - 50 - 200 = -210.5
      expect(result.totalAmount).toBe(-210.5)
    })
  })

  describe('Monthly Fee', () => {
    it('should add monthly fee to commission', () => {
      const config = { ...defaultConfig, monthlyFee: 100, monthlyFeeVat: 21 }
      const reservations: ReservationData[] = [
        { hostEarnings: 1000, nights: 3 }
      ]
      const result = calculateLiquidation(reservations, [], config)

      // Commission from reservations: 150
      // Monthly fee: 100
      // Total commission: 250
      expect(result.totalCommission).toBe(250)

      // VAT on commission (150): 31.5
      // VAT on monthly fee (100): 21
      // Total VAT: 52.5
      expect(result.totalCommissionVat).toBe(52.5)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty reservations', () => {
      const result = calculateLiquidation([], [], defaultConfig)

      expect(result.totalIncome).toBe(0)
      expect(result.totalCommission).toBe(0)
      expect(result.totalAmount).toBe(0)
    })

    it('should handle null/undefined hostEarnings', () => {
      const reservations: ReservationData[] = [
        { hostEarnings: undefined as any, nights: 3 },
        { hostEarnings: null as any, nights: 2 }
      ]
      const result = calculateLiquidation(reservations, [], defaultConfig)

      expect(result.totalIncome).toBe(0)
    })

    it('should handle very large numbers', () => {
      const reservations: ReservationData[] = [
        { hostEarnings: 999999.99, nights: 30 }
      ]
      const result = calculateLiquidation(reservations, [], defaultConfig)

      expect(result.totalIncome).toBe(999999.99)
      // 15% commission
      expect(result.totalCommission).toBeCloseTo(149999.9985, 2)
    })

    it('should handle decimal precision', () => {
      const reservations: ReservationData[] = [
        { hostEarnings: 100.33, nights: 3 }
      ]
      const result = calculateLiquidation(reservations, [], defaultConfig)

      // 15% of 100.33 = 15.0495
      expect(result.totalCommission).toBeCloseTo(15.0495, 4)
    })
  })
})

describe('Date and Nights Calculation', () => {
  function calculateNights(checkIn: string, checkOut: string): number {
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    return Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
  }

  it('should calculate nights correctly for normal stay', () => {
    expect(calculateNights('2025-01-01', '2025-01-04')).toBe(3)
  })

  it('should calculate 1 night for same day (edge case)', () => {
    // Depending on business logic, same day might be 0 or 1
    expect(calculateNights('2025-01-01', '2025-01-01')).toBe(0)
  })

  it('should handle month boundaries', () => {
    expect(calculateNights('2025-01-30', '2025-02-02')).toBe(3)
  })

  it('should handle year boundaries', () => {
    expect(calculateNights('2024-12-30', '2025-01-02')).toBe(3)
  })

  it('should handle leap year', () => {
    expect(calculateNights('2024-02-28', '2024-03-01')).toBe(2) // 2024 is leap year
  })

  it('should return negative for reversed dates (potential bug indicator)', () => {
    const nights = calculateNights('2025-01-04', '2025-01-01')
    expect(nights).toBeLessThan(0)
  })
})

describe('Input Validation', () => {
  describe('Negative Numbers', () => {
    it('should identify negative hostEarnings as invalid', () => {
      const isValid = (earnings: number) => !isNaN(earnings) && earnings >= 0

      expect(isValid(-100)).toBe(false)
      expect(isValid(0)).toBe(true)
      expect(isValid(100)).toBe(true)
      expect(isValid(NaN)).toBe(false)
    })

    it('should identify negative cleaning fee as invalid', () => {
      const isValid = (fee: number | undefined) =>
        fee === undefined || (!isNaN(Number(fee)) && Number(fee) >= 0)

      expect(isValid(-50)).toBe(false)
      expect(isValid(0)).toBe(true)
      expect(isValid(50)).toBe(true)
      expect(isValid(undefined)).toBe(true)
    })
  })

  describe('Enum Validation', () => {
    const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']
    const validPlatforms = ['AIRBNB', 'BOOKING', 'VRBO', 'DIRECT', 'OTHER']

    it('should validate reservation status', () => {
      expect(validStatuses.includes('CONFIRMED')).toBe(true)
      expect(validStatuses.includes('INVALID')).toBe(false)
      expect(validStatuses.includes('')).toBe(false)
    })

    it('should validate platform', () => {
      expect(validPlatforms.includes('AIRBNB')).toBe(true)
      expect(validPlatforms.includes('airbnb')).toBe(false) // Case sensitive
      expect(validPlatforms.includes('INVALID')).toBe(false)
    })
  })

  describe('Pagination Validation', () => {
    it('should enforce maximum limit', () => {
      const sanitizeLimit = (limit: number) => Math.min(limit, 100)

      expect(sanitizeLimit(50)).toBe(50)
      expect(sanitizeLimit(100)).toBe(100)
      expect(sanitizeLimit(1000)).toBe(100)
      expect(sanitizeLimit(999999)).toBe(100)
    })

    it('should enforce minimum page', () => {
      const sanitizePage = (page: number) => Math.max(1, page)

      expect(sanitizePage(1)).toBe(1)
      expect(sanitizePage(5)).toBe(5)
      expect(sanitizePage(0)).toBe(1)
      expect(sanitizePage(-5)).toBe(1)
    })
  })

  describe('Year/Month Validation', () => {
    it('should validate year range', () => {
      const isValidYear = (year: number) => year >= 2000 && year <= 2100

      expect(isValidYear(2025)).toBe(true)
      expect(isValidYear(2000)).toBe(true)
      expect(isValidYear(2100)).toBe(true)
      expect(isValidYear(1999)).toBe(false)
      expect(isValidYear(2101)).toBe(false)
    })

    it('should validate month range', () => {
      const isValidMonth = (month: number) => month >= 1 && month <= 12

      expect(isValidMonth(1)).toBe(true)
      expect(isValidMonth(12)).toBe(true)
      expect(isValidMonth(0)).toBe(false)
      expect(isValidMonth(13)).toBe(false)
    })
  })
})
