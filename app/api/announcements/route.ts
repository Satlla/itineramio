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


    const announcements = await prisma.announcement.findMany({
      where: whereClause,
      orderBy: [
        { createdAt: 'desc' }
      ]
    })


    return NextResponse.json({
      success: true,
      data: announcements
    })

  } catch (error) {
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

    // Normaliza multilang: si en/fr están vacíos, copia desde es
    const normalizeMultiLang = (field: { es: string; en?: string; fr?: string }) => ({
      es: field.es || '',
      en: field.en?.trim() ? field.en : (field.es || ''),
      fr: field.fr?.trim() ? field.fr : (field.es || ''),
    })

    // Create announcement with proper date handling
    const createData: any = {
      propertyId,
      title: normalizeMultiLang(title),
      message: normalizeMultiLang(message),
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

    
    const announcement = await prisma.announcement.create({
      data: createData
    })

    return NextResponse.json({
      success: true,
      data: announcement,
      message: 'Aviso creado correctamente'
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear aviso' },
      { status: 500 }
    )
  }
}

// OPTIONS for CORS - same-origin only (endpoint used from dashboard)
export async function OPTIONS() {
  return new Response(null, { status: 204 })
}