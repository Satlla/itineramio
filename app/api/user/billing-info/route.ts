import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { verifyToken } from '../../../../src/lib/auth'

function getUserIdFromToken(request: NextRequest): string | null {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return null

    const authUser = verifyToken(token)
    return authUser.userId
  } catch (error) {
    return null
  }
}

// GET - Retrieve billing info
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Try to get from BillingInfo table first
    let billingInfo = null
    try {
      billingInfo = await prisma.billingInfo.findUnique({
        where: { userId }
      })
    } catch (error) {
    }

    // If not found or table doesn't exist, try legacy User fields
    if (!billingInfo) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          email: true,
          phone: true,
          billingAddress: true,
          billingCity: true,
          billingCountry: true,
          billingPostalCode: true,
          vatNumber: true,
          companyName: true
        }
      })

      if (user) {
        // Map legacy fields to format expected by BillingDataModal
        billingInfo = {
          name: user.name || '',
          email: user.email,
          entityType: user.companyName ? 'empresa' : 'particular',
          companyName: user.companyName,
          billingAddress: user.billingAddress,
          billingCity: user.billingCity,
          billingCountry: user.billingCountry || 'España',
          billingPostalCode: user.billingPostalCode,
          vatNumber: user.vatNumber
        }
      }
    } else {
      // Transform BillingInfo table format to modal format
      billingInfo = {
        name: billingInfo.firstName && billingInfo.lastName
          ? `${billingInfo.firstName} ${billingInfo.lastName}`
          : billingInfo.companyName || billingInfo.tradeName || '',
        email: billingInfo.email,
        entityType: billingInfo.entityType === 'company' ? 'empresa'
                  : billingInfo.entityType === 'self-employed' ? 'autonomo'
                  : 'particular',
        companyName: billingInfo.companyName || billingInfo.tradeName,
        billingAddress: billingInfo.address,
        billingCity: billingInfo.city,
        billingCountry: billingInfo.country,
        billingPostalCode: billingInfo.postalCode,
        vatNumber: billingInfo.companyTaxId || billingInfo.taxId || billingInfo.nationalId
      }
    }

    // Check if billing info is complete - all required fields must be present
    const hasName = billingInfo?.companyName || billingInfo?.name

    const isBillingComplete = !!(
      billingInfo &&
      hasName &&
      billingInfo.email &&
      billingInfo.billingAddress &&
      billingInfo.billingCity &&
      billingInfo.billingPostalCode &&
      billingInfo.billingCountry &&
      billingInfo.vatNumber
    )

    return NextResponse.json({
      billingInfo,
      isBillingComplete
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener datos de facturación' },
      { status: 500 }
    )
  }
}

// PUT - Update billing info (alias for POST)
export async function PUT(request: NextRequest) {
  return POST(request)
}

// POST - Create or update billing info
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request)


    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Support both naming conventions: billingAddress and address
    const {
      entityType,
      email,
      name,
      phone,
      address: addressFromBody,
      billingAddress,
      city: cityFromBody,
      billingCity,
      postalCode: postalCodeFromBody,
      billingPostalCode,
      country: countryFromBody,
      billingCountry,
      // Company fields
      companyName,
      companyTaxId,
      vatNumber,
      // Self-employed fields
      tradeName,
      taxId,
      businessActivity,
      // Individual fields
      firstName,
      lastName,
      nationalId
    } = body

    // Use billing-prefixed fields if available, otherwise fall back to non-prefixed
    const address = billingAddress || addressFromBody
    const city = billingCity || cityFromBody
    const postalCode = billingPostalCode || postalCodeFromBody
    const country = billingCountry || countryFromBody

    // Determine actual tax ID from various possible fields
    const actualTaxId = companyTaxId || vatNumber || taxId || nationalId

    // Validate required fields (phone is optional)
    if (!entityType || !email || !address || !city || !postalCode || !country) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios: ' + [
          !entityType && 'tipo de entidad',
          !email && 'email',
          !address && 'dirección',
          !city && 'ciudad',
          !postalCode && 'código postal',
          !country && 'país'
        ].filter(Boolean).join(', ') },
        { status: 400 }
      )
    }

    // Validate entity-specific fields
    if (entityType === 'empresa' && (!companyName || !actualTaxId)) {
      return NextResponse.json(
        { error: 'Faltan datos de empresa: ' + [
          !companyName && 'razón social',
          !actualTaxId && 'CIF'
        ].filter(Boolean).join(', ') },
        { status: 400 }
      )
    }

    if (entityType === 'autonomo' && !actualTaxId) {
      return NextResponse.json(
        { error: 'Faltan datos de autónomo: NIF es obligatorio' },
        { status: 400 }
      )
    }

    if (entityType === 'particular' && !actualTaxId) {
      return NextResponse.json(
        { error: 'Faltan datos personales: DNI/NIE es obligatorio' },
        { status: 400 }
      )
    }

    // Try to upsert in BillingInfo table (if it exists)
    let billingInfo = null
    try {
      billingInfo = await prisma.billingInfo.upsert({
        where: { userId },
        create: {
          userId,
          entityType,
          email,
          phone,
          address,
          city,
          postalCode,
          country,
          companyName,
          companyTaxId,
          tradeName,
          taxId,
          businessActivity,
          firstName,
          lastName,
          nationalId
        },
        update: {
          entityType,
          email,
          phone,
          address,
          city,
          postalCode,
          country,
          companyName,
          companyTaxId,
          tradeName,
          taxId,
          businessActivity,
          firstName,
          lastName,
          nationalId
        }
      })
    } catch (error) {
      // Table doesn't exist yet, will use User model below
    }

    // Always update legacy billing fields in User model for backward compatibility
    await prisma.user.update({
      where: { id: userId },
      data: {
        billingAddress: address,
        billingCity: city,
        billingCountry: country,
        billingPostalCode: postalCode,
        vatNumber: actualTaxId,
        companyName: companyName || tradeName || name || `${firstName || ''} ${lastName || ''}`.trim(),
        ...(phone ? { phone } : {}) // Only update phone if provided
      }
    })

    // If billingInfo is null (table doesn't exist), create a response object
    if (!billingInfo) {
      billingInfo = {
        userId,
        entityType,
        email,
        phone,
        address,
        city,
        postalCode,
        country,
        companyName,
        companyTaxId,
        tradeName,
        taxId,
        businessActivity,
        firstName,
        lastName,
        nationalId
      }
    }

    return NextResponse.json({
      success: true,
      billingInfo
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al guardar datos de facturación: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}
