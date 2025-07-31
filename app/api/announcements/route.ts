import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'
import { requireAuth } from '../../../src/lib/auth'

// GET /api/announcements - Get announcements for a property
export async function GET(request: NextRequest) {
  console.log('🚀 GET /api/announcements - Starting...')
  console.log('Environment:', process.env.NODE_ENV)
  console.log('Database URL exists:', !!process.env.DATABASE_URL)
  console.log('JWT Secret exists:', !!process.env.JWT_SECRET)
  
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
    console.error('💥 Full error in GET announcements:', error)
    if (error instanceof Error) {
      console.error('💥 Error message:', error.message)
      console.error('💥 Error stack:', error.stack)
    }
    return NextResponse.json(
      { error: 'Error al obtener anuncios' },
      { status: 500 }
    )
  }
}

// POST /api/announcements - Create new announcement
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 POST /api/announcements - Starting...')
    
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      console.log('❌ Auth failed')
      return authResult
    }
    const userId = authResult.userId
    console.log('✅ Auth success, userId:', userId)

    const body = await request.json()
    console.log('📦 Request body:', body)
    
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
      console.log('❌ Missing required fields:', { propertyId, title, message })
      return NextResponse.json(
        { error: 'PropertyId, título y mensaje son requeridos' },
        { status: 400 }
      )
    }
    console.log('✅ Required fields validated')

    // Verify property ownership
    console.log('🔍 Checking property ownership for:', propertyId)
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { hostId: true }
    })
    console.log('🏠 Property found:', property)

    if (!property || property.hostId !== userId) {
      console.log('❌ Property not found or ownership failed:', { property, userId })
      return NextResponse.json(
        { error: 'Propiedad no encontrada' },
        { status: 404 }
      )
    }
    console.log('✅ Property ownership verified')

    // Create announcement
    console.log('📝 Creating announcement with data:', {
      propertyId,
      title,
      message,
      category,
      priority,
      isActive,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null
    })
    
    const announcement = await prisma.announcement.create({
      data: {
        propertyId,
        title,
        message,
        category,
        priority,
        isActive,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
      }
    })
    console.log('✅ Announcement created:', announcement)

    return NextResponse.json({
      success: true,
      data: announcement,
      message: 'Anuncio creado correctamente'
    })

  } catch (error) {
    console.error('💥 Error creating announcement:', error)
    if (error instanceof Error) {
      console.error('💥 Error stack:', error.stack)
    }
    return NextResponse.json(
      { error: 'Error al crear anuncio' },
      { status: 500 }
    )
  }
}