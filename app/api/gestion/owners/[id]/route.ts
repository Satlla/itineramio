import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/gestion/owners/[id]
 * Get a single owner
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId
    const { id } = await params

    const owner = await prisma.propertyOwner.findFirst({
      where: { id, userId },
      include: {
        billingConfigs: {
          include: {
            property: {
              select: { id: true, name: true }
            }
          }
        }
      }
    })

    if (!owner) {
      return NextResponse.json(
        { error: 'Propietario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ owner })
  } catch (error) {
    console.error('Error fetching owner:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/gestion/owners/[id]
 * Update an owner
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId
    const { id } = await params

    const existing = await prisma.propertyOwner.findFirst({ where: { id, userId } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Propietario no encontrado' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const {
      type,
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
      country,
      iban
    } = body

    const owner = await prisma.propertyOwner.update({
      where: { id },
      data: {
        type,
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
    console.error('Error updating owner:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/gestion/owners/[id]
 * Soft delete an owner
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId
    const { id } = await params

    const existing = await prisma.propertyOwner.findFirst({
      where: { id, userId },
      include: { billingConfigs: true }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Propietario no encontrado' },
        { status: 404 }
      )
    }

    if (existing.billingConfigs.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un propietario con propiedades asignadas' },
        { status: 400 }
      )
    }

    await prisma.propertyOwner.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting owner:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
