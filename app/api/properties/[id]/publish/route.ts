import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../../../src/lib/prisma'

const JWT_SECRET = 'itineramio-secret-key-2024'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get user from JWT token
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const userId = decoded.userId
    
    // Set JWT claims for PostgreSQL RLS policies
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`
    
    // Find the property
    const property = await prisma.property.findFirst({
      where: {
        id,
        hostId: userId
      },
      include: {
        zones: {
          include: {
            steps: true
          }
        }
      }
    })
    
    if (!property) {
      return NextResponse.json({
        success: false,
        error: 'Propiedad no encontrada'
      }, { status: 404 })
    }
    
    // Update property to published
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        isPublished: true,
        publishedAt: property.publishedAt || new Date(),
        status: 'ACTIVE'
      }
    })
    
    // Also publish all zones and steps
    await prisma.zone.updateMany({
      where: {
        propertyId: id
      },
      data: {
        isPublished: true
      }
    })
    
    // Get all zone IDs for this property
    const zoneIds = property.zones.map(z => z.id)
    
    // Publish all steps in these zones
    await prisma.step.updateMany({
      where: {
        zoneId: { in: zoneIds }
      },
      data: {
        isPublished: true
      }
    })
    
    return NextResponse.json({
      success: true,
      data: updatedProperty,
      message: 'Propiedad publicada exitosamente'
    })
    
  } catch (error) {
    console.error('Error publishing property:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error al publicar la propiedad'
    }, { status: 500 })
  }
}