import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * POST /api/gestion/owners/quick
 * Crear contacto rápido con datos mínimos (desde factura)
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
      type = 'PERSONA_FISICA',
      firstName,
      lastName,
      companyName,
      nif,
      cif,
      email
    } = body

    // Validación mínima
    if (type === 'PERSONA_FISICA' && !firstName) {
      return NextResponse.json(
        { error: 'El nombre es obligatorio' },
        { status: 400 }
      )
    }

    if (type === 'EMPRESA' && !companyName) {
      return NextResponse.json(
        { error: 'La razón social es obligatoria' },
        { status: 400 }
      )
    }

    const owner = await prisma.propertyOwner.create({
      data: {
        userId,
        type,
        firstName: type === 'PERSONA_FISICA' ? firstName : null,
        lastName: type === 'PERSONA_FISICA' ? (lastName || null) : null,
        companyName: type === 'EMPRESA' ? companyName : null,
        nif: type === 'PERSONA_FISICA' ? (nif || null) : null,
        cif: type === 'EMPRESA' ? (cif || null) : null,
        email: email || '',
        address: '',
        city: '',
        postalCode: '',
        country: 'España',
        isActive: true
      }
    })

    return NextResponse.json({
      owner: {
        id: owner.id,
        type: owner.type,
        firstName: owner.firstName,
        lastName: owner.lastName,
        companyName: owner.companyName,
        nif: owner.nif,
        cif: owner.cif,
        email: owner.email
      }
    })
  } catch (error) {
    console.error('Error creating quick owner:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
