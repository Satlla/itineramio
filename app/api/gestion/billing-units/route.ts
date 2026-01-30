import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/gestion/billing-units
 * Lista todas las unidades de facturación del usuario
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const billingUnits = await prisma.billingUnit.findMany({
      where: { userId },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
            type: true
          }
        },
        _count: {
          select: {
            reservations: true,
            expenses: true,
            invoices: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      success: true,
      billingUnits: billingUnits.map(unit => ({
        id: unit.id,
        name: unit.name,
        city: unit.city,
        address: unit.address,
        postalCode: unit.postalCode,
        imageUrl: unit.imageUrl,
        ownerId: unit.ownerId,
        owner: unit.owner ? {
          id: unit.owner.id,
          name: unit.owner.type === 'EMPRESA'
            ? unit.owner.companyName
            : `${unit.owner.firstName} ${unit.owner.lastName}`.trim()
        } : null,
        // Configuración básica
        commissionType: unit.commissionType,
        commissionValue: unit.commissionValue,
        cleaningValue: unit.cleaningValue,
        // Matching
        airbnbNames: unit.airbnbNames,
        bookingNames: unit.bookingNames,
        vrboNames: unit.vrboNames,
        // Stats
        reservationsCount: unit._count.reservations,
        expensesCount: unit._count.expenses,
        invoicesCount: unit._count.invoices,
        // Status
        isActive: unit.isActive,
        createdAt: unit.createdAt
      }))
    })
  } catch (error) {
    console.error('Error fetching billing units:', error)
    return NextResponse.json(
      { error: 'Error al obtener las unidades de facturación' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/gestion/billing-units
 * Crea una nueva unidad de facturación
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const body = await request.json()
    const {
      name,
      city,
      address,
      postalCode,
      imageUrl,
      ownerId,
      airbnbNames,
      bookingNames,
      vrboNames,
      incomeReceiver,
      commissionType,
      commissionValue,
      commissionVat,
      cleaningType,
      cleaningValue,
      cleaningVatIncluded,
      cleaningFeeRecipient,
      cleaningFeeSplitPct,
      monthlyFee,
      monthlyFeeVat,
      monthlyFeeConcept,
      defaultVatRate,
      defaultRetentionRate,
      invoiceDetailLevel,
      singleConceptText,
      icalUrl
    } = body

    // Validar campos requeridos
    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      )
    }

    // Si se especifica un propietario, verificar que pertenece al usuario
    if (ownerId) {
      const owner = await prisma.propertyOwner.findFirst({
        where: { id: ownerId, userId }
      })
      if (!owner) {
        return NextResponse.json(
          { error: 'Propietario no encontrado' },
          { status: 404 }
        )
      }
    }

    const billingUnit = await prisma.billingUnit.create({
      data: {
        userId,
        name: name.trim(),
        city: city?.trim() || null,
        address: address?.trim() || null,
        postalCode: postalCode?.trim() || null,
        imageUrl: imageUrl || null,
        ownerId: ownerId || null,
        airbnbNames: airbnbNames || [],
        bookingNames: bookingNames || [],
        vrboNames: vrboNames || [],
        incomeReceiver: incomeReceiver || 'OWNER',
        commissionType: commissionType || 'PERCENTAGE',
        commissionValue: commissionValue ?? 0,
        commissionVat: commissionVat ?? 21,
        cleaningType: cleaningType || 'FIXED_PER_RESERVATION',
        cleaningValue: cleaningValue ?? 0,
        cleaningVatIncluded: cleaningVatIncluded ?? true,
        cleaningFeeRecipient: cleaningFeeRecipient || 'MANAGER',
        cleaningFeeSplitPct: cleaningFeeSplitPct || null,
        monthlyFee: monthlyFee ?? 0,
        monthlyFeeVat: monthlyFeeVat ?? 21,
        monthlyFeeConcept: monthlyFeeConcept || null,
        defaultVatRate: defaultVatRate ?? 21,
        defaultRetentionRate: defaultRetentionRate ?? 0,
        invoiceDetailLevel: invoiceDetailLevel || 'DETAILED',
        singleConceptText: singleConceptText || null,
        icalUrl: icalUrl || null
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
            type: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      billingUnit: {
        id: billingUnit.id,
        name: billingUnit.name,
        city: billingUnit.city,
        address: billingUnit.address,
        postalCode: billingUnit.postalCode,
        imageUrl: billingUnit.imageUrl,
        ownerId: billingUnit.ownerId,
        owner: billingUnit.owner ? {
          id: billingUnit.owner.id,
          name: billingUnit.owner.type === 'EMPRESA'
            ? billingUnit.owner.companyName
            : `${billingUnit.owner.firstName} ${billingUnit.owner.lastName}`.trim()
        } : null
      }
    })
  } catch (error) {
    console.error('Error creating billing unit:', error)
    return NextResponse.json(
      { error: 'Error al crear la unidad de facturación' },
      { status: 500 }
    )
  }
}
