import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params
    const body = await request.json()
    
    // Get visitor info
    const userAgent = request.headers.get('user-agent') || ''
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1'
    
    // Extract referrer and other metadata
    const { 
      referrer = null, 
      language = 'es',
      timezone = 'UTC',
      screenWidth = null,
      screenHeight = null 
    } = body

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, hostId: true }
    })

    if (!property) {
      return NextResponse.json({
        success: false,
        error: 'Propiedad no encontrada'
      }, { status: 404 })
    }

    // Create view record
    await prisma.propertyView.create({
      data: {
        propertyId,
        hostId: property.hostId,
        visitorIp: ip,
        userAgent,
        referrer,
        language,
        timezone,
        screenWidth,
        screenHeight,
        viewedAt: new Date()
      }
    })

    // Update property analytics
    await prisma.propertyAnalytics.upsert({
      where: { propertyId },
      update: {
        totalViews: {
          increment: 1
        },
        lastViewedAt: new Date()
      },
      create: {
        propertyId,
        totalViews: 1,
        lastViewedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Vista registrada correctamente'
    })

  } catch (error) {
    console.error('Error registrando vista de propiedad:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}