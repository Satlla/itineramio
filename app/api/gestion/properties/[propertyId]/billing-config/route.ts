import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/gestion/properties/[propertyId]/billing-config
 * Get billing config for a property
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId
    const { propertyId } = await params

    // Verify property ownership
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        hostId: true,
        name: true,
        street: true,
        city: true
      }
    })

    if (!property || property.hostId !== userId) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada' },
        { status: 404 }
      )
    }

    const billingConfig = await prisma.propertyBillingConfig.findUnique({
      where: { propertyId },
      include: {
        owner: {
          select: {
            id: true,
            type: true,
            firstName: true,
            lastName: true,
            companyName: true,
            nif: true,
            cif: true
          }
        }
      }
    })

    return NextResponse.json({
      property: {
        id: property.id,
        name: property.name,
        address: property.street ? `${property.street}, ${property.city}` : property.city
      },
      billingConfig
    })
  } catch (error) {
    console.error('Error fetching billing config:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/gestion/properties/[propertyId]/billing-config
 * Create or update billing config for a property
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId
    const { propertyId } = await params

    // Verify property ownership
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { hostId: true }
    })

    if (!property || property.hostId !== userId) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const {
      ownerId,
      // Platform names for auto-matching (arrays)
      airbnbNames = [],
      bookingNames = [],
      vrboNames = [],
      // Legacy single names (converted to arrays)
      airbnbName,
      bookingName,
      // Income receiver
      incomeReceiver = 'OWNER',
      // Commission
      commissionType = 'PERCENTAGE',
      commissionValue = 15,
      commissionVat = 21,
      // Cleaning
      cleaningType = 'FIXED_PER_RESERVATION',
      cleaningValue = 0,
      cleaningVatIncluded = true,
      cleaningFeeRecipient = 'MANAGER',
      cleaningFeeSplitPct,
      // Monthly fee
      monthlyFee = 0,
      monthlyFeeVat = 21,
      monthlyFeeConcept,
      // Default tax rates
      defaultVatRate = 21,
      defaultRetentionRate = 0,
      // Invoice preferences
      invoiceDetailLevel = 'DETAILED',
      // iCal sync
      icalUrl
    } = body

    // Verify owner belongs to user (if provided)
    if (ownerId) {
      const owner = await prisma.propertyOwner.findUnique({
        where: { id: ownerId },
        select: { userId: true }
      })

      if (!owner || owner.userId !== userId) {
        return NextResponse.json(
          { error: 'Propietario no encontrado' },
          { status: 404 }
        )
      }
    }

    // Handle legacy single names - convert to arrays
    // Also handle null/undefined values properly
    const finalAirbnbNames = (Array.isArray(airbnbNames) && airbnbNames.length > 0)
      ? airbnbNames
      : (airbnbName && typeof airbnbName === 'string' ? [airbnbName] : [])
    const finalBookingNames = (Array.isArray(bookingNames) && bookingNames.length > 0)
      ? bookingNames
      : (bookingName && typeof bookingName === 'string' ? [bookingName] : [])
    const finalVrboNames = Array.isArray(vrboNames) ? vrboNames : []

    // Upsert billing config
    const billingConfig = await prisma.propertyBillingConfig.upsert({
      where: { propertyId },
      create: {
        propertyId,
        ownerId: ownerId || null,
        airbnbNames: finalAirbnbNames,
        bookingNames: finalBookingNames,
        vrboNames: finalVrboNames,
        incomeReceiver,
        commissionType,
        commissionValue,
        commissionVat,
        cleaningType,
        cleaningValue,
        cleaningVatIncluded,
        cleaningFeeRecipient,
        cleaningFeeSplitPct: cleaningFeeSplitPct || null,
        monthlyFee,
        monthlyFeeVat,
        monthlyFeeConcept: monthlyFeeConcept || null,
        defaultVatRate,
        defaultRetentionRate,
        invoiceDetailLevel,
        icalUrl: icalUrl || null
      },
      update: {
        ownerId: ownerId || null,
        airbnbNames: finalAirbnbNames,
        bookingNames: finalBookingNames,
        vrboNames: finalVrboNames,
        incomeReceiver,
        commissionType,
        commissionValue,
        commissionVat,
        cleaningType,
        cleaningValue,
        cleaningVatIncluded,
        cleaningFeeRecipient,
        cleaningFeeSplitPct: cleaningFeeSplitPct || null,
        monthlyFee,
        monthlyFeeVat,
        monthlyFeeConcept: monthlyFeeConcept || null,
        defaultVatRate,
        defaultRetentionRate,
        invoiceDetailLevel,
        icalUrl: icalUrl || null
      },
      include: {
        owner: {
          select: {
            id: true,
            type: true,
            firstName: true,
            lastName: true,
            companyName: true,
            nif: true,
            cif: true
          }
        }
      }
    })

    return NextResponse.json({ billingConfig })
  } catch (error) {
    console.error('Error updating billing config:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
