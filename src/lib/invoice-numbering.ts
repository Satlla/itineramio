import { prisma } from './prisma'
import { SeriesType } from '@prisma/client'

/**
 * Invoice Numbering System
 *
 * Handles:
 * - Sequential numbering within series
 * - Yearly reset of numbering
 * - Correlation validation
 * - Full number formatting (e.g., F2025001)
 */

interface NextNumberResult {
  number: number
  fullNumber: string
  seriesId: string
}

/**
 * Formats an invoice number with prefix, short year and padded number
 * Example: F250001, R260001 (estilo Holded)
 */
export function formatInvoiceNumber(
  prefix: string,
  year: number,
  number: number,
  padLength: number = 4
): string {
  const shortYear = String(year).slice(-2) // 2025 -> 25
  const paddedNumber = String(number).padStart(padLength, '0')
  return `${prefix}${shortYear}${paddedNumber}`
}

/**
 * Check if series needs yearly reset and perform it if necessary
 */
async function checkAndResetYearly(seriesId: string): Promise<void> {
  const currentYear = new Date().getFullYear()

  const series = await prisma.invoiceSeries.findUnique({
    where: { id: seriesId }
  })

  if (!series) {
    throw new Error('Serie no encontrada')
  }

  // Only reset if resetYearly is enabled and we're in a new year
  if (series.resetYearly && series.lastResetYear !== currentYear) {
    await prisma.invoiceSeries.update({
      where: { id: seriesId },
      data: {
        currentNumber: 0,
        lastResetYear: currentYear,
        year: currentYear
      }
    })
  }
}

/**
 * Get the next invoice number for a series
 * This is atomic to prevent race conditions
 */
export async function getNextInvoiceNumber(seriesId: string): Promise<NextNumberResult> {
  // First check for yearly reset
  await checkAndResetYearly(seriesId)

  // Use a transaction to atomically increment and return
  const result = await prisma.$transaction(async (tx) => {
    // Lock and increment the series
    const series = await tx.invoiceSeries.update({
      where: { id: seriesId },
      data: {
        currentNumber: { increment: 1 }
      },
      include: {
        invoiceConfig: true
      }
    })

    const nextNumber = series.currentNumber
    const fullNumber = formatInvoiceNumber(series.prefix, series.year, nextNumber)

    return {
      number: nextNumber,
      fullNumber,
      seriesId: series.id
    }
  })

  return result
}

/**
 * Validate that a number maintains correlation within a series
 * (no gaps in sequence)
 */
export async function validateCorrelation(
  seriesId: string,
  number: number
): Promise<{ valid: boolean; message?: string }> {
  const series = await prisma.invoiceSeries.findUnique({
    where: { id: seriesId }
  })

  if (!series) {
    return { valid: false, message: 'Serie no encontrada' }
  }

  // The number should be currentNumber + 1 or less
  if (number > series.currentNumber + 1) {
    return {
      valid: false,
      message: `Número ${number} rompe la correlatividad. El siguiente número debería ser ${series.currentNumber + 1}`
    }
  }

  // Check if this number already exists
  const existing = await prisma.clientInvoice.findFirst({
    where: {
      seriesId,
      number
    }
  })

  if (existing) {
    return {
      valid: false,
      message: `El número ${number} ya existe en esta serie`
    }
  }

  return { valid: true }
}

/**
 * Get or create default series for a user
 */
export async function getOrCreateDefaultSeries(
  userId: string,
  type: SeriesType = 'STANDARD'
): Promise<string> {
  // First get the user's invoice config
  let config = await prisma.userInvoiceConfig.findUnique({
    where: { userId },
    include: {
      invoiceSeries: {
        where: {
          isActive: true,
          isDefault: true,
          type
        }
      }
    }
  })

  // If user has no config, they need to set it up first
  if (!config) {
    throw new Error('Configuración de facturación no encontrada. Configure su perfil de gestor primero.')
  }

  // If default series exists, return it
  if (config.invoiceSeries.length > 0) {
    return config.invoiceSeries[0].id
  }

  // Create default series based on type
  const currentYear = new Date().getFullYear()
  const prefix = type === 'STANDARD' ? 'F' : 'R'
  const name = type === 'STANDARD'
    ? `Facturas ${currentYear}`
    : `Rectificativas ${currentYear}`

  const newSeries = await prisma.invoiceSeries.create({
    data: {
      invoiceConfigId: config.id,
      name,
      prefix,
      year: currentYear,
      type,
      currentNumber: 0,
      resetYearly: true,
      lastResetYear: currentYear,
      isDefault: true,
      isActive: true
    }
  })

  return newSeries.id
}

/**
 * Get all series for a user
 */
export async function getUserSeries(userId: string): Promise<any[]> {
  const config = await prisma.userInvoiceConfig.findUnique({
    where: { userId },
    include: {
      invoiceSeries: {
        where: { isActive: true },
        orderBy: [
          { type: 'asc' },
          { isDefault: 'desc' },
          { name: 'asc' }
        ]
      }
    }
  })

  return config?.invoiceSeries || []
}

/**
 * Preview what the next invoice number would be (without incrementing)
 */
export async function previewNextNumber(seriesId: string): Promise<string> {
  const series = await prisma.invoiceSeries.findUnique({
    where: { id: seriesId }
  })

  if (!series) {
    throw new Error('Serie no encontrada')
  }

  const currentYear = new Date().getFullYear()
  let nextNumber = series.currentNumber + 1

  // If yearly reset is due, the next number would be 1
  if (series.resetYearly && series.lastResetYear !== currentYear) {
    nextNumber = 1
  }

  const year = series.resetYearly && series.lastResetYear !== currentYear
    ? currentYear
    : series.year

  return formatInvoiceNumber(series.prefix, year, nextNumber)
}

/**
 * Check if a series can be deleted (no invoices issued)
 */
export async function canDeleteSeries(seriesId: string): Promise<boolean> {
  const count = await prisma.clientInvoice.count({
    where: {
      seriesId,
      status: { not: 'DRAFT' }
    }
  })

  return count === 0
}

/**
 * Check if a series can be edited (no invoices issued)
 */
export async function canEditSeries(seriesId: string): Promise<boolean> {
  return canDeleteSeries(seriesId)
}
