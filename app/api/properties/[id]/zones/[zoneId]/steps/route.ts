import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/properties/[id]/zones/[zoneId]/steps - Get all steps for a zone
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; zoneId: string }> }
) {
  try {
    const { id: propertyId, zoneId } = await params

    // Find zone using startsWith due to Next.js truncating long IDs
    const zones = await prisma.zone.findMany({
      where: {
        id: {
          startsWith: zoneId
        },
        propertyId: propertyId
      }
    })
    
    const zone = zones[0]
    const actualZoneId = zone?.id || zoneId

    if (!zone) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Zona no encontrada' 
        },
        { status: 404 }
      )
    }

    const steps = await prisma.step.findMany({
      where: {
        zoneId: actualZoneId
      },
      orderBy: {
        order: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: steps
    })
  } catch (error) {
    console.error('Error fetching steps:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener los pasos' 
      },
      { status: 500 }
    )
  }
}

// POST /api/properties/[id]/zones/[zoneId]/steps - Create a new step
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; zoneId: string }> }
) {
  try {
    const { id: propertyId, zoneId } = await params
    const body = await request.json()

    // Validate required fields
    const { title, description, type, content, mediaUrl, linkUrl, estimatedTime, order, status } = body

    if (!title || !type) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Título y tipo son requeridos' 
        },
        { status: 400 }
      )
    }

    // Check if zone exists and belongs to property
    const zone = await prisma.zone.findFirst({
      where: {
        id: zoneId,
        propertyId: propertyId
      }
    })

    if (!zone) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Zona no encontrada' 
        },
        { status: 404 }
      )
    }

    // Validate type-specific requirements
    if (type === 'IMAGE' && !mediaUrl) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'La URL de la imagen es requerida para pasos de imagen' 
        },
        { status: 400 }
      )
    }

    if (type === 'VIDEO' && !mediaUrl) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'La URL del video es requerida para pasos de video' 
        },
        { status: 400 }
      )
    }

    if (type === 'LINK' && !linkUrl) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'La URL del enlace es requerida para pasos de enlace' 
        },
        { status: 400 }
      )
    }

    // Get the next order number if not provided
    let stepOrder = order
    if (stepOrder === undefined || stepOrder === null) {
      const lastStep = await prisma.step.findFirst({
        where: { zoneId: zoneId },
        orderBy: { order: 'desc' }
      })
      stepOrder = lastStep ? lastStep.order + 1 : 0
    }

    // Create the step directly linked to the zone
    const step = await prisma.step.create({
      data: {
        title: typeof title === 'string' ? { es: title } : title,
        content: typeof content === 'string' ? { es: content } : (content || { es: description || '' }),
        type,
        order: stepOrder,
        isPublished: true,
        zoneId: zoneId
      }
    })

    return NextResponse.json({
      success: true,
      data: step
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating step:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al crear el paso',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PUT /api/properties/[id]/zones/[zoneId]/steps - Update multiple steps at once
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; zoneId: string }> }
) {
  console.log('🚨 PUT /steps endpoint called')
  
  try {
    const { id: propertyId, zoneId } = await params
    console.log('🚨 Params:', { propertyId, zoneId })
    
    const body = await request.json()
    console.log('🚨 Body received:', JSON.stringify(body, null, 2))
    
    const { steps } = body
    console.log('🚨 Steps extracted:', steps)
    console.log('🚨 Steps is array:', Array.isArray(steps))
    console.log('🚨 Steps length:', steps?.length)
    
    // Simplified: Just save whatever we receive
    console.log('📥 Saving steps for zone:', zoneId)

    // Find the zone - try exact match first, then startsWith
    let zone = await prisma.zone.findFirst({
      where: {
        id: zoneId,
        propertyId: propertyId
      }
    })
    
    // If not found, try startsWith (for Next.js truncation)
    if (!zone) {
      const zones = await prisma.zone.findMany({
        where: {
          id: { startsWith: zoneId },
          propertyId: propertyId
        }
      })
      zone = zones[0]
    }
    
    const actualZoneId = zone?.id || zoneId
    
    if (!zone) {
      return NextResponse.json({
        success: false,
        error: 'Zone not found'
      }, { status: 404 })
    }

    // Delete all existing steps
    await prisma.step.deleteMany({
      where: { zoneId: actualZoneId }
    })

    // Create new steps - simplified version
    const createdSteps = []
    
    // If we have steps, save them. If not, create one empty step
    const stepsToSave = steps?.length > 0 ? steps : [{ type: 'text', content: { es: '' } }]
    
    for (let i = 0; i < stepsToSave.length; i++) {
      const step = stepsToSave[i]
      
      // Handle both title and content fields, prioritizing title for the title field
      const titleContent = step.title || step.content || { es: `Paso ${i + 1}`, en: '', fr: '' }
      const bodyContent = step.content || { es: '', en: '', fr: '' }
      
      const stepData = {
        title: typeof titleContent === 'string' 
          ? { es: titleContent.substring(0, 100), en: '', fr: '' }
          : {
              es: (titleContent.es || '').substring(0, 100) || `Paso ${i + 1}`,
              en: (titleContent.en || '').substring(0, 100) || '',
              fr: (titleContent.fr || '').substring(0, 100) || ''
            },
        content: typeof bodyContent === 'string'
          ? { 
              es: bodyContent, 
              en: '', 
              fr: '',
              // Include media data in content JSON
              ...(step.mediaUrl && { mediaUrl: step.mediaUrl }),
              ...(step.linkUrl && { linkUrl: step.linkUrl })
            }
          : {
              es: bodyContent.es || '',
              en: bodyContent.en || '',
              fr: bodyContent.fr || '',
              // Include media data in content JSON
              ...(step.mediaUrl && { mediaUrl: step.mediaUrl }),
              ...(step.linkUrl && { linkUrl: step.linkUrl })
            },
        type: (step.type || 'TEXT').toUpperCase(),
        order: step.order !== undefined ? step.order : i,
        isPublished: true,
        zoneId: actualZoneId
      }
      
      console.log(`🚨 Creating step ${i + 1} with data:`, JSON.stringify(stepData, null, 2))
      
      const createdStep = await prisma.step.create({
        data: stepData
      })
      
      console.log(`🚨 Step ${i + 1} created:`, createdStep.id)
      createdSteps.push(createdStep)
    }

    return NextResponse.json({
      success: true,
      data: createdSteps,
      message: `Saved ${createdSteps.length} steps`
    })

  } catch (error) {
    console.error('Error saving steps:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al guardar los pasos',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}