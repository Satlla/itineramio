import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../../src/lib/prisma'
import { requireAuth } from '../../../../../../../src/lib/auth'

// GET /api/properties/[id]/zones/[zoneId]/steps - Get all steps for a zone
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; zoneId: string }> }
) {
  try {
    const { id: propertyId, zoneId } = await params

    // Check authentication
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    // Set JWT claims for RLS policies
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`

    // Verify user owns the property
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        hostId: userId
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada o no autorizada' },
        { status: 404 }
      )
    }

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

    // Process steps to extract mediaUrl from content JSON
    const processedSteps = steps.map(step => {
      let mediaUrl = null
      let linkUrl = null
      
      try {
        if (step.content && typeof step.content === 'object') {
          const content = step.content as any
          // Extract mediaUrl from content JSON
          if (content.mediaUrl) {
            mediaUrl = content.mediaUrl
          }
          if (content.linkUrl) {
            linkUrl = content.linkUrl
          }
        }
      } catch (error) {
        console.error('Error parsing step content:', error)
      }

      return {
        ...step,
        mediaUrl,
        linkUrl,
        // Also provide the original content for backward compatibility
        content: step.content
      }
    })

    return NextResponse.json({
      success: true,
      data: processedSteps
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

    // Check authentication
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    // Set JWT claims for RLS policies
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`

    // Verify user owns the property
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        hostId: userId
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada o no autorizada' },
        { status: 404 }
      )
    }

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

    // Prepare content with media URLs
    let stepContent
    
    if (typeof content === 'string' && content.trim() !== '') {
      // Si content es un string no vacío, úsalo
      stepContent = { es: content }
    } else if (content && typeof content === 'object') {
      // Si content es un objeto, úsalo tal cual
      stepContent = content
    } else if (description && typeof description === 'string') {
      // Si no hay content pero hay description, usa description
      stepContent = { es: description }
    } else {
      // Por defecto, string vacío
      stepContent = { es: '' }
    }
    
    // Add mediaUrl and linkUrl to content if provided
    if (mediaUrl) {
      stepContent = { ...stepContent, mediaUrl }
    }
    if (linkUrl) {
      stepContent = { ...stepContent, linkUrl }
    }

    console.log('📹 Creating step with content:', { type, mediaUrl, linkUrl, stepContent })

    // For TEXT steps, ensure title is different from content
    let stepTitle = title
    if (!title) {
      // Use type-specific default titles
      const typeLabels = {
        IMAGE: { es: 'Imagen', en: 'Image', fr: 'Image' },
        VIDEO: { es: 'Video', en: 'Video', fr: 'Vidéo' },
        LINK: { es: 'Enlace', en: 'Link', fr: 'Lien' },
        TEXT: { es: `Paso ${stepOrder + 1}`, en: `Step ${stepOrder + 1}`, fr: `Étape ${stepOrder + 1}` }
      }
      stepTitle = typeLabels[type as keyof typeof typeLabels] || { es: `Paso ${stepOrder + 1}`, en: `Step ${stepOrder + 1}`, fr: `Étape ${stepOrder + 1}` }
    }
    
    // Create the step directly linked to the zone
    const step = await prisma.step.create({
      data: {
        title: typeof stepTitle === 'string' ? { es: stepTitle } : stepTitle,
        content: stepContent,
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

    // Check authentication
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    // Set JWT claims for RLS policies
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`

    // Verify user owns the property
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        hostId: userId
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada o no autorizada' },
        { status: 404 }
      )
    }
    
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
      console.log(`🔍 API Processing step ${i + 1}:`, JSON.stringify(step, null, 2))
      
      // Use provided title or default to generic titles
      let titleContent = step.title || { es: '', en: '', fr: '' }
      let bodyContent = step.content || { es: '', en: '', fr: '' }
      
      // If no title provided, use generic titles
      if (!step.title || (!step.title.es && !step.title.en && !step.title.fr)) {
        const typeLabels = {
          IMAGE: { es: 'Imagen', en: 'Image', fr: 'Image' },
          VIDEO: { es: 'Video', en: 'Video', fr: 'Vidéo' },
          LINK: { es: 'Enlace', en: 'Link', fr: 'Lien' },
          YOUTUBE: { es: 'Video YouTube', en: 'YouTube Video', fr: 'Vidéo YouTube' },
          TEXT: { es: `Paso ${i + 1}`, en: `Step ${i + 1}`, fr: `Étape ${i + 1}` }
        }
        const labels = typeLabels[step.type?.toUpperCase() as keyof typeof typeLabels] || { es: `Paso ${i + 1}`, en: `Step ${i + 1}`, fr: `Étape ${i + 1}` }
        titleContent = labels
      }
      
      console.log(`📝 Step ${i + 1} title:`, titleContent)
      console.log(`📋 Step ${i + 1} content:`, bodyContent)
      console.log(`🎬 Step ${i + 1} media URL:`, step.mediaUrl || 'none')
      
      const stepData = {
        title: titleContent,
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