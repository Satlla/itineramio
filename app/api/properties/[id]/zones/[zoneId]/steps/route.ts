import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/properties/[id]/zones/[zoneId]/steps - Get all steps for a zone
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; zoneId: string }> }
) {
  try {
    const { id: propertyId, zoneId } = await params

    // Verify zone belongs to property
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

    const steps = await prisma.step.findMany({
      where: {
        zoneId: zoneId
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
  try {
    const { id: propertyId, zoneId } = await params
    const body = await request.json()
    const { steps } = body
    
    console.log('PUT /api/properties/[id]/zones/[zoneId]/steps')
    console.log('PropertyId:', propertyId)
    console.log('ZoneId:', zoneId)
    console.log('Steps received:', JSON.stringify(steps, null, 2))

    if (!Array.isArray(steps)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Se esperaba un array de pasos' 
        },
        { status: 400 }
      )
    }

    // Verify zone belongs to property
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

    // Delete existing steps
    await prisma.step.deleteMany({
      where: { zoneId: zoneId }
    })

    // Create new steps
    const createdSteps = []
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      console.log(`Processing step ${i + 1}:`, JSON.stringify(step, null, 2))
      
      // Check if step has any content
      const hasContent = step.content?.es?.trim() || step.content?.en?.trim() || step.content?.fr?.trim()
      
      if (hasContent || step.type !== 'text') { // Allow non-text steps even without content
        try {
          const stepData = {
            title: { 
              es: step.content?.es?.substring(0, 50) || `Paso ${i + 1}`,
              en: step.content?.en?.substring(0, 50) || `Step ${i + 1}`,
              fr: step.content?.fr?.substring(0, 50) || `Étape ${i + 1}`
            },
            content: {
              es: step.content?.es || '',
              en: step.content?.en || '',
              fr: step.content?.fr || ''
            },
            type: step.type.toUpperCase(),
            order: i,
            isPublished: true,
            zoneId: zoneId
          }
          
          console.log(`Creating step with data:`, JSON.stringify(stepData, null, 2))
          
          const createdStep = await prisma.step.create({
            data: stepData
          })
          
          console.log(`Created step:`, createdStep.id)
          createdSteps.push(createdStep)
        } catch (stepError) {
          console.error(`Error creating step ${i + 1}:`, stepError)
          throw stepError
        }
      } else {
        console.log(`Skipping step ${i + 1} - no content`)
      }
    }

    return NextResponse.json({
      success: true,
      data: createdSteps
    })

  } catch (error) {
    console.error('Error updating steps:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al actualizar los pasos',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}