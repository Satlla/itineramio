import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { generateSlug } from '@/lib/slug-utils'

/**
 * POST /api/gestion/properties/quick
 * Crear propiedad rápida con datos mínimos (desde integraciones)
 * Auto-crea el billingConfig para poder asignar reservas
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
      city = '',
      ownerId = null,
      // Airbnb name from email (to save as alias)
      airbnbName = null,
      // Full billing config
      incomeReceiver = null, // Will be calculated based on ownerId if not provided
      commissionType = 'PERCENTAGE',
      commissionValue = 15,
      commissionVat = 21,
      cleaningType = 'FIXED_PER_RESERVATION',
      cleaningValue = 0,
      cleaningFeeRecipient = 'MANAGER',
      cleaningFeeSplitPct = null,
      monthlyFee = 0,
      defaultVatRate = 21,
      defaultRetentionRate = 0,
      invoiceDetailLevel = 'DETAILED'
    } = body

    // Validación mínima
    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'El nombre de la propiedad es obligatorio' },
        { status: 400 }
      )
    }

    // Verify owner if provided
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

    // Generate unique slug
    const baseSlug = generateSlug(name)
    let uniqueSlug = baseSlug
    let slugSuffix = 0

    while (true) {
      const testSlug = slugSuffix === 0 ? baseSlug : `${baseSlug}-${slugSuffix}`
      const existing = await prisma.property.findUnique({
        where: { slug: testSlug },
        select: { id: true }
      })

      if (!existing) {
        uniqueSlug = testSlug
        break
      }

      slugSuffix++
      if (slugSuffix > 100) {
        throw new Error('Unable to generate unique slug')
      }
    }

    // Create property with minimal data
    const property = await prisma.property.create({
      data: {
        name: name.trim(),
        slug: uniqueSlug,
        description: 'Propiedad creada desde importación de emails',
        type: 'APARTMENT',
        city: city || 'Sin especificar',
        state: '',
        country: 'España',
        street: '',
        postalCode: '',
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 4,
        status: 'DRAFT',
        isPublished: false,
        hostId: userId,
        hostContactName: '',
        hostContactPhone: '',
        hostContactEmail: '',
        hostContactLanguage: 'es'
      }
    })

    // Auto-create billing config with all provided fields
    const billingConfig = await prisma.propertyBillingConfig.create({
      data: {
        propertyId: property.id,
        ownerId: ownerId || null,
        // Use provided incomeReceiver or default based on ownerId
        incomeReceiver: incomeReceiver || (ownerId ? 'OWNER' : 'MANAGER'),
        commissionType,
        commissionValue,
        commissionVat,
        cleaningType,
        cleaningValue,
        cleaningVatIncluded: true,
        cleaningFeeRecipient,
        cleaningFeeSplitPct: cleaningFeeSplitPct || null,
        monthlyFee,
        monthlyFeeVat: 21,
        defaultVatRate,
        defaultRetentionRate,
        invoiceDetailLevel,
        // Save airbnb name as alias if provided
        airbnbNames: airbnbName ? [airbnbName] : [],
        bookingNames: [],
        vrboNames: []
      }
    })

    return NextResponse.json({
      success: true,
      property: {
        id: property.id,
        name: property.name,
        city: property.city
      },
      billingConfig: {
        id: billingConfig.id,
        ownerId: billingConfig.ownerId
      }
    })
  } catch (error) {
    console.error('Error creating quick property:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
