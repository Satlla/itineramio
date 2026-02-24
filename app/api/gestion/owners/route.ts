import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/gestion/owners
 * Get all property owners for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const owners = await prisma.propertyOwner.findMany({
      where: {
        userId,
        isActive: true
      },
      select: {
        id: true,
        type: true,
        retentionRate: true,
        firstName: true,
        lastName: true,
        companyName: true,
        nif: true,
        cif: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        postalCode: true,
        country: true,
        iban: true,
        _count: {
          select: { billingConfigs: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const formattedOwners = owners.map(o => ({
      id: o.id,
      type: o.type,
      retentionRate: o.retentionRate ? Number(o.retentionRate) : null,
      firstName: o.firstName,
      lastName: o.lastName,
      companyName: o.companyName,
      nif: o.nif,
      cif: o.cif,
      email: o.email,
      phone: o.phone,
      address: o.address,
      city: o.city,
      postalCode: o.postalCode,
      country: o.country,
      iban: o.iban,
      propertiesCount: o._count.billingConfigs
    }))

    return NextResponse.json({ owners: formattedOwners })
  } catch (error) {
    console.error('Error fetching owners:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/gestion/owners
 * Create a new property owner
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
      type,
      retentionRate,
      firstName,
      lastName,
      companyName,
      nif,
      cif,
      email,
      phone,
      address,
      city,
      postalCode,
      country = 'España',
      iban
    } = body

    // Validate required fields
    if (!type || !address || !city || !postalCode) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    if (type === 'PERSONA_FISICA' && (!firstName || !lastName)) {
      return NextResponse.json(
        { error: 'Nombre y apellidos son obligatorios para persona física' },
        { status: 400 }
      )
    }

    if (type === 'EMPRESA' && !companyName) {
      return NextResponse.json(
        { error: 'Razón social es obligatoria para empresa' },
        { status: 400 }
      )
    }

    const owner = await prisma.propertyOwner.create({
      data: {
        userId,
        type,
        retentionRate: retentionRate !== undefined && retentionRate !== null ? retentionRate : null,
        firstName: type === 'PERSONA_FISICA' ? firstName : null,
        lastName: type === 'PERSONA_FISICA' ? lastName : null,
        companyName: type === 'EMPRESA' ? companyName : null,
        nif: type === 'PERSONA_FISICA' ? nif : null,
        cif: type === 'EMPRESA' ? cif : null,
        email,
        phone,
        address,
        city,
        postalCode,
        country,
        iban
      }
    })

    return NextResponse.json({ owner })
  } catch (error) {
    console.error('Error creating owner:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
