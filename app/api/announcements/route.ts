import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'
import { requireAuth } from '../../../src/lib/auth'

// GET /api/announcements - Get announcements for a property
export async function GET(request: NextRequest) {
  console.log('🚀 GET /api/announcements - Starting...')
  
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      console.log('❌ Auth failed')
      return authResult
    }
    const userId = authResult.userId
    console.log('✅ Auth success, userId:', userId)

    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')
    const isPublic = searchParams.get('public') === 'true'
    console.log('📋 Request params:', { propertyId, isPublic })

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID es requerido' },
        { status: 400 }
      )
    }

    let whereClause: any

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
    } else {
      // For public requests, show only active announcements (simplified)
      whereClause = {
        propertyId,
        isActive: true
      }
    }

    console.log('🔍 Query where clause:', JSON.stringify(whereClause, null, 2))

    const announcements = await prisma.announcement.findMany({
      where: whereClause,
      orderBy: [
        { createdAt: 'desc' }
      ]
    })

    console.log('📢 Found announcements:', announcements.length)

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
  console.log('🚀 POST /api/announcements - Starting...')
  
  try {
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

    // Create announcement with proper date handling
    const createData: any = {
      propertyId,
      title,
      message,
      category,
      priority,
      isActive
    }

    // Only add dates if they exist and are valid
    if (startDate && typeof startDate === 'string' && startDate.trim()) {
      createData.startDate = new Date(startDate)
    }
    if (endDate && typeof endDate === 'string' && endDate.trim()) {
      createData.endDate = new Date(endDate)
    }

    console.log('📝 Creating announcement with data:', createData)
    
    const announcement = await prisma.announcement.create({
      data: createData
    })
    console.log('✅ Announcement created:', announcement)

    return NextResponse.json({
      success: true,
      data: announcement,
      message: 'Aviso creado correctamente'
    })

  } catch (error) {
    console.error('💥 Error creating announcement:', error)
    if (error instanceof Error) {
      console.error('💥 Error stack:', error.stack)
    }
    return NextResponse.json(
      { error: 'Error al crear aviso' },
      { status: 500 }
    )
  }
}

// OPTIONS for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}