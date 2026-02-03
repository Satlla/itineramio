import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'

// POST /api/zones/[zoneId]/evaluate - Submit zone evaluation (private for host only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ zoneId: string }> }
) {
  try {
    const { zoneId } = await params
    const body = await request.json()

    const { 
      overallRating, 
      clarity, 
      completeness, 
      helpfulness, 
      upToDate, 
      feedback, 
      improvementSuggestions,
      language = 'es',
      guestAgeRange,
      guestCountry,
      guestTravelType,
      ipAddress
    } = body

    // Validate required fields
    if (!overallRating || overallRating < 1 || overallRating > 5) {
      return NextResponse.json(
        { error: 'Evaluación general requerida (1-5 estrellas)' },
        { status: 400 }
      )
    }

    // Check if zone exists
    const zone = await prisma.zone.findUnique({
      where: { id: zoneId },
      include: {
        property: {
          select: {
            id: true,
            hostId: true,
            hostContactName: true,
            name: true
          }
        }
      }
    })

    if (!zone) {
      return NextResponse.json(
        { error: 'Zona no encontrada' },
        { status: 404 }
      )
    }

    // Create zone rating (private by default - only visible to host)
    const zoneRating = await prisma.zoneRating.create({
      data: {
        zoneId,
        overallRating,
        clarity: clarity || overallRating,
        completeness: completeness || overallRating,
        helpfulness: helpfulness || overallRating,
        upToDate: upToDate || overallRating,
        feedback,
        improvementSuggestions,
        language,
        guestAgeRange,
        guestCountry,
        guestTravelType,
        ipAddress,
        visibleToHost: true,
        visibleToGuests: false // Private evaluation for host improvement
      }
    })

    // Create notification for host about new zone evaluation
    await prisma.notification.create({
      data: {
        userId: zone.property!.hostId,
        type: 'ZONE_EVALUATION_RECEIVED',
        title: 'Nueva evaluación de zona',
        message: `Recibiste una nueva evaluación para la zona "${typeof zone.name === 'string' ? zone.name : (zone.name as any)?.es || 'Zona'}" con ${overallRating} estrellas`,
        data: {
          zoneId: zone.id,
          zoneName: zone.name,
          propertyId: zone.property!.id,
          propertyName: zone.property!.name,
          rating: overallRating,
          feedback,
          improvementSuggestions
        }
      }
    })

    // Update zone's average rating using aggregate (efficient - no N+1)
    const stats = await prisma.zoneRating.aggregate({
      where: { zoneId },
      _avg: { overallRating: true }
    })

    await prisma.zone.update({
      where: { id: zoneId },
      data: { avgRating: stats._avg.overallRating || 0 }
    })

    return NextResponse.json({
      success: true,
      message: 'Evaluación enviada correctamente',
      data: {
        id: zoneRating.id,
        rating: overallRating
      }
    })

  } catch (error) {
    console.error('Error submitting zone evaluation:', error)
    return NextResponse.json(
      { error: 'Error al enviar la evaluación' },
      { status: 500 }
    )
  }
}

// GET /api/zones/[zoneId]/evaluate - Get zone ratings (for host dashboard)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ zoneId: string }> }
) {
  try {
    const { zoneId } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Get zone ratings with pagination
    const ratings = await prisma.zoneRating.findMany({
      where: { zoneId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })

    const total = await prisma.zoneRating.count({
      where: { zoneId }
    })

    // Calculate statistics
    const stats = await prisma.zoneRating.aggregate({
      where: { zoneId },
      _avg: {
        overallRating: true,
        clarity: true,
        completeness: true,
        helpfulness: true,
        upToDate: true
      },
      _count: {
        id: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ratings,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        stats: {
          total: stats._count.id,
          avgOverall: stats._avg.overallRating || 0,
          avgClarity: stats._avg.clarity || 0,
          avgCompleteness: stats._avg.completeness || 0,
          avgHelpfulness: stats._avg.helpfulness || 0,
          avgUpToDate: stats._avg.upToDate || 0
        }
      }
    })

  } catch (error) {
    console.error('Error fetching zone ratings:', error)
    return NextResponse.json(
      { error: 'Error al obtener las evaluaciones' },
      { status: 500 }
    )
  }
}