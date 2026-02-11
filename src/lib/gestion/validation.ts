/**
 * Zod validation schemas for Gestion module
 * Centralized input validation for API endpoints
 */

import { z } from 'zod'

// ============================================
// Common schemas
// ============================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

// ============================================
// Expense schemas
// ============================================

export const createExpenseSchema = z.object({
  propertyId: z.string().cuid().optional(),
  billingUnitId: z.string().cuid().optional(),
  date: z.string().datetime(),
  concept: z.string().min(1, 'El concepto es obligatorio').max(500),
  category: z.enum([
    'MAINTENANCE',
    'SUPPLIES',
    'CLEANING',
    'UTILITIES',
    'TAXES',
    'INSURANCE',
    'MARKETING',
    'COMMISSION',
    'OTHER'
  ]),
  amount: z.number().positive('El importe debe ser mayor que 0'),
  vatAmount: z.number().min(0).default(0),
  chargeToOwner: z.boolean().default(true),
  supplierName: z.string().max(200).optional(),
  invoiceNumber: z.string().max(100).optional(),
}).refine(
  (data) => data.propertyId || data.billingUnitId,
  { message: 'Debes seleccionar un apartamento' }
)

export const updateExpenseSchema = createExpenseSchema.partial()

// ============================================
// Invoice schemas
// ============================================

export const invoiceItemSchema = z.object({
  description: z.string().min(1).max(500),
  quantity: z.number().positive(),
  unitPrice: z.number(),
  vatRate: z.number().min(0).max(100).default(21),
})

export const createInvoiceSchema = z.object({
  ownerId: z.string().cuid('Cliente requerido'),
  seriesId: z.string().cuid().optional(),
  issueDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  notes: z.string().max(2000).optional(),
  items: z.array(invoiceItemSchema).min(1, 'Debe incluir al menos una línea'),
  paymentMethodUsed: z.string().optional(),
  applyRetention: z.boolean().default(false),
  retentionRate: z.number().min(0).max(100).optional(),
})

// ============================================
// Reservation schemas
// ============================================

export const createReservationSchema = z.object({
  billingUnitId: z.string().cuid('Apartamento requerido'),
  platform: z.enum(['AIRBNB', 'BOOKING', 'VRBO', 'DIRECT', 'OTHER']),
  confirmationCode: z.string().min(1).max(100),
  guestName: z.string().min(1).max(200),
  guestEmail: z.string().email().optional(),
  guestPhone: z.string().max(50).optional(),
  checkIn: z.string().datetime(),
  checkOut: z.string().datetime(),
  nights: z.number().int().positive(),
  roomTotal: z.number().min(0),
  cleaningFee: z.number().min(0).default(0),
  hostEarnings: z.number().min(0),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']).default('CONFIRMED'),
})

// ============================================
// Owner schemas
// ============================================

export const createOwnerSchema = z.object({
  type: z.enum(['PERSONA_FISICA', 'EMPRESA']),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().max(100).optional(),
  companyName: z.string().max(200).optional(),
  nif: z.string().min(1).max(20),
  email: z.string().email().optional(),
  phone: z.string().max(30).optional(),
  address: z.string().max(300).optional(),
  city: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().max(50).default('ES'),
  iban: z.string().max(34).optional(),
  documentType: z.enum(['FACTURA', 'NOTA_SERVICIO']).default('FACTURA'),
  retentionRate: z.number().min(0).max(100).default(15),
}).refine(
  (data) => {
    if (data.type === 'PERSONA_FISICA') {
      return data.firstName && data.firstName.length > 0
    }
    return data.companyName && data.companyName.length > 0
  },
  { message: 'Nombre requerido para persona física, razón social para empresa' }
)

// ============================================
// BillingUnit schemas
// ============================================

export const createBillingUnitSchema = z.object({
  name: z.string().min(1).max(200),
  city: z.string().max(100).optional(),
  address: z.string().max(300).optional(),
  postalCode: z.string().max(20).optional(),
  ownerId: z.string().cuid().optional(),
  groupId: z.string().cuid().optional(),
  commissionType: z.enum(['PERCENTAGE', 'FIXED_PER_RESERVATION', 'FIXED_PER_NIGHT']).default('PERCENTAGE'),
  commissionValue: z.number().min(0).default(15),
  commissionVat: z.number().min(0).max(100).default(21),
  cleaningType: z.enum(['FIXED_PER_RESERVATION', 'PER_NIGHT']).default('FIXED_PER_RESERVATION'),
  cleaningValue: z.number().min(0).default(0),
  cleaningFeeRecipient: z.enum(['MANAGER', 'OWNER', 'SPLIT']).default('MANAGER'),
  cleaningVatIncluded: z.boolean().default(true),
  airbnbNames: z.array(z.string()).default([]),
  bookingNames: z.array(z.string()).default([]),
})

// ============================================
// Liquidation schemas
// ============================================

export const createLiquidationSchema = z.object({
  ownerId: z.string().cuid('Propietario requerido'),
  propertyId: z.string().cuid().optional(),
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
  invoiceFormat: z.enum(['detailed', 'grouped']).default('detailed'),
  reservationIds: z.array(z.string().cuid()).optional(),
  mode: z.enum(['GROUP', 'INDIVIDUAL', 'LEGACY']).default('LEGACY'),
  billingUnitGroupId: z.string().cuid().optional(),
  billingUnitIds: z.array(z.string().cuid()).optional(),
})

// ============================================
// Helper function to validate request body
// ============================================

export async function validateBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const body = await request.json()
    const result = schema.safeParse(body)

    if (!result.success) {
      const firstError = result.error.errors[0]
      return {
        success: false,
        error: firstError.message || 'Datos de entrada inválidos'
      }
    }

    return { success: true, data: result.data }
  } catch (error) {
    return { success: false, error: 'Error al procesar la solicitud' }
  }
}
