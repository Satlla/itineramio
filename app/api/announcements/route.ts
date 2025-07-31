import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'
import { requireAuth } from '../../../src/lib/auth'

// GET /api/announcements - Get announcements for a property
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')
    const isPublic = searchParams.get('public') === 'true'

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID es requerido' },
        { status: 400 }
      )
    }

    // For public requests, don't require ownership
    let whereClause: any = {
      propertyId,
      isActive: true
    }

    // Add date filtering for active announcements
    const now = new Date()
    whereClause.OR = [
      { startDate: null, endDate: null }, // Always active
      { startDate: null, endDate: { gte: now } }, // No start date, not expired
      { startDate: { lte: now }, endDate: null }, // Started, no end date
      { startDate: { lte: now }, endDate: { gte: now } } // Within date range
    ]

    // For dashboard requests, verify ownership
    if (!isPublic) {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { hostId: true }
      })

      if (!property || property.hostId !== userId) {
        return NextResponse.json(
          { error: 'Propiedad no encontrada' },
          { status: 404 }
        )
      }

      // For dashboard, show all announcements (active and inactive)
      whereClause = { propertyId }
    }

    const announcements = await prisma.announcement.findMany({
      where: whereClause,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: announcements
    })

  } catch (error) {
    console.error('Error fetching announcements:', error)
    return NextResponse.json(
      { error: 'Error al obtener anuncios' },
      { status: 500 }
    )
  }
}

// POST /api/announcements - Create new announcement
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const body = await request.json()
    const { 
      propertyId, 
      title, 
      message, 
      category = 'other',
      priority = 'NORMAL',
      isActive = true,
      startDate,
      endDate
    } = body

    // Validate required fields
    if (!propertyId || !title || !message) {
      return NextResponse.json(
        { error: 'PropertyId, título y mensaje son requeridos' },
        { status: 400 }
      )
    }

    // Verify property ownership
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { hostId: true }
    })

    if (!property || property.hostId !== userId) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada' },
        { status: 404 }
      )
    }

    // Create announcement
    const announcement = await prisma.announcement.create({
      data: {
        propertyId,
        title,
        message,
        category,
        priority,
        isActive,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      }
    })

    return NextResponse.json({
      success: true,
      data: announcement,
      message: 'Anuncio creado correctamente'
    })

  } catch (error) {
    console.error('Error creating announcement:', error)
    return NextResponse.json(
      { error: 'Error al crear anuncio' },
      { status: 500 }
    )
  }
}