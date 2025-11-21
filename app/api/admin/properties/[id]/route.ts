import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { getAdminUser } from '../../../../../src/lib/admin-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar que el usuario sea admin
    const adminPayload = await getAdminUser(request)

    if (!adminPayload) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { id: propertyId } = await params

    // Obtener la propiedad con los datos del host
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        name: true,
        description: true,
        street: true,
        city: true,
        state: true,
        country: true,
        postalCode: true,
        type: true,
        bedrooms: true,
        bathrooms: true,
        maxGuests: true,
        squareMeters: true,
        status: true,
        isPublished: true,
        hostId: true,
        hostContactName: true,
        hostContactEmail: true,
        hostContactPhone: true,
        hostContactLanguage: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
        host: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true
          }
        }
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(property)
  } catch (error) {
    console.error('Error fetching property for admin:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
