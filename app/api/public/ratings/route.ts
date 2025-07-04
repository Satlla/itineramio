import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { propertyId, rating, comment, timestamp } = body

    // Validate input
    if (!propertyId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({
        success: false,
        error: 'Datos de evaluación inválidos'
      }, { status: 400 })
    }

    // Get guest info from IP and user agent for identification
    const guestIp = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    // Create a guest identifier (not for tracking, just for duplicate prevention)
    const guestId = Buffer.from(`${guestIp}-${userAgent}`).toString('base64').substring(0, 16)

    // Check if property exists and get host info
    const property = await prisma.property.findFirst({
      where: { id: propertyId },
      include: {
        host: {
          select: {
            id: true,
            email: true,
            name: true
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

    // Check for duplicate rating from same guest (last 24 hours)
    const existingRating = await prisma.propertyRating.findFirst({
      where: {
        propertyId,
        guestId,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    })

    if (existingRating) {
      return NextResponse.json({
        success: false,
        error: 'Ya has evaluado esta propiedad recientemente'
      }, { status: 429 })
    }

    // Create the rating (pending approval)
    const newRating = await prisma.propertyRating.create({
      data: {
        propertyId,
        rating,
        comment: comment || null,
        guestId,
        guestIp,
        status: 'PENDING', // Requires owner approval
        createdAt: new Date(timestamp)
      }
    })

    // Create notification for property owner
    await prisma.notification.create({
      data: {
        userId: property.host.id,
        type: 'RATING_RECEIVED',
        title: 'Nueva evaluación recibida',
        message: `Has recibido una evaluación de ${rating} estrella${rating !== 1 ? 's' : ''} para ${property.name}`,
        data: JSON.stringify({
          propertyId,
          propertyName: property.name,
          rating,
          comment,
          ratingId: newRating.id
        }),
        read: false
      }
    })

    // Send email notification to property owner
    try {
      await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/emails/rating-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: property.host.email,
          hostName: property.host.name,
          propertyName: property.name,
          rating,
          comment,
          ratingId: newRating.id
        })
      })
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Evaluación enviada correctamente. El propietario la revisará antes de publicarla.',
      data: {
        ratingId: newRating.id,
        status: 'PENDING'
      }
    })

  } catch (error) {
    console.error('Error creating rating:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}