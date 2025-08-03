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

    // Set JWT claims for RLS policies - with error handling
    try {
      await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`
    } catch (rslError) {
      console.error('RLS config failed:', rslError)
    }

    // Use raw SQL to get steps directly, bypassing potential Prisma/RLS issues
    const steps = await prisma.$queryRaw`
      SELECT 
        s.id, 
        s."zoneId", 
        s.type, 
        s.title, 
        s.content,
        COALESCE(s."order", 0) as "order",
        s."isPublished", 
        s."createdAt", 
        s."updatedAt"
      FROM steps s
      JOIN zones z ON s."zoneId" = z.id
      JOIN properties p ON z."propertyId" = p.id
      WHERE s."zoneId" = ${zoneId}
        AND p.id = ${propertyId}
        AND p."hostId" = ${userId}
      ORDER BY COALESCE(s."order", 0) ASC, s.id ASC
    ` as any[]

    // Process steps to extract mediaUrl from content JSON
    const processedSteps = steps.map(step => {
      let mediaUrl = null
      let linkUrl = null
      
      try {
        if (step.content && typeof step.content === 'object') {
          const content = step.content as any
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
        error: 'Error al obtener los pasos',
        details: error instanceof Error ? error.message : String(error)
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
        orderBy: { id: 'desc' }
      })
      stepOrder = lastStep ? 1 : 0
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
      console.log('🚨 Auth failed')
      return authResult
    }
    const userId = authResult.userId
    console.log('🚨 Auth success, userId:', userId)

    // Set JWT claims for RLS policies - with better error handling
    try {
      await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`
      console.log('🚨 RLS config set successfully')
    } catch (rslError) {
      console.error('🚨 RLS config failed:', rslError)
      // Continue anyway, some environments might not need RLS
    }

    // Verify user owns the property
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        hostId: userId
      }
    })

    if (!property) {
      console.log('🚨 Property not found or unauthorized')
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
    
    if (!Array.isArray(steps)) {
      console.log('🚨 Steps is not an array')
      return NextResponse.json({
        success: false,
        error: 'Steps debe ser un array'
      }, { status: 400 })
    }

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
    console.log('🚨 Zone found:', !!zone, 'actualZoneId:', actualZoneId)
    
    if (!zone) {
      return NextResponse.json({
        success: false,
        error: 'Zone not found'
      }, { status: 404 })
    }

    // Delete all existing steps with better error handling
    try {
      const deleteResult = await prisma.step.deleteMany({
        where: { zoneId: actualZoneId }
      })
      console.log('🚨 Deleted steps:', deleteResult.count)
    } catch (deleteError) {
      console.error('🚨 Error deleting steps:', deleteError)
      // Continue anyway, maybe there were no steps to delete
    }

    // Create new steps - with better validation and error handling
    const createdSteps = []
    
    // If we have steps, save them. If not, create one empty step
    const stepsToSave = steps.length > 0 ? steps : [{ type: 'TEXT', content: { es: '' } }]
    
    for (let i = 0; i < stepsToSave.length; i++) {
      const step = stepsToSave[i]
      console.log(`🔍 API Processing step ${i + 1}:`, JSON.stringify(step, null, 2))
      
      try {
        // Validate and prepare step data
        const stepType = (step.type || 'TEXT').toUpperCase()
        
        // Handle title - ensure it's always a proper multilingual object
        let titleContent = { es: '', en: '', fr: '' }
        if (step.title) {
          if (typeof step.title === 'string') {
            titleContent.es = step.title
          } else if (typeof step.title === 'object') {
            titleContent = {
              es: step.title.es || '',
              en: step.title.en || '',
              fr: step.title.fr || ''
            }
          }
        }
        
        // Handle content - ensure it's always a proper multilingual object with media support
        let contentData: any = { es: '', en: '', fr: '' }
        if (step.content) {
          if (typeof step.content === 'string') {
            contentData.es = step.content
          } else if (typeof step.content === 'object') {
            contentData = {
              es: step.content.es || '',
              en: step.content.en || '',
              fr: step.content.fr || '',
              ...(step.content as any).mediaUrl && { mediaUrl: (step.content as any).mediaUrl },
              ...(step.content as any).linkUrl && { linkUrl: (step.content as any).linkUrl }
            }
          }
        }
        
        // Add media URLs to content if they exist
        if (step.media?.url) {
          contentData.mediaUrl = step.media.url
        }
        if (step.mediaUrl) {
          contentData.mediaUrl = step.mediaUrl
        }
        if (step.linkUrl) {
          contentData.linkUrl = step.linkUrl
        }
        
        const stepData = {
          title: titleContent,
          content: contentData,
          type: stepType,
          order: i, // Explicit order field
          isPublished: step.isPublished !== false, // Default to true
          zoneId: actualZoneId
        }
        
        console.log(`🚨 Creating step ${i + 1} with data:`, JSON.stringify(stepData, null, 2))
        
        const createdStep = await prisma.step.create({
          data: stepData
        })
        
        console.log(`🚨 Step ${i + 1} created successfully:`, createdStep.id)
        createdSteps.push(createdStep)
        
      } catch (stepError) {
        console.error(`🚨 Error creating step ${i + 1}:`, stepError)
        // Don't fail the entire operation for one step
        // Instead, create a minimal fallback step
        try {
          const fallbackStep = await prisma.step.create({
            data: {
              title: { es: `Paso ${i + 1}`, en: `Step ${i + 1}`, fr: `Étape ${i + 1}` },
              content: { es: 'Error al procesar este paso', en: 'Error processing this step', fr: 'Erreur lors du traitement de cette étape' },
              type: 'TEXT',
              order: i,
              isPublished: true,
              zoneId: actualZoneId
            }
          })
          console.log(`🚨 Fallback step ${i + 1} created:`, fallbackStep.id)
          createdSteps.push(fallbackStep)
        } catch (fallbackError) {
          console.error(`🚨 Error creating fallback step ${i + 1}:`, fallbackError)
          // If we can't even create a fallback, something is seriously wrong
          throw new Error(`Failed to create step ${i + 1}: ${stepError instanceof Error ? stepError.message : String(stepError)}`)
        }
      }
    }

    console.log('🚨 All steps processed, returning success')
    return NextResponse.json({
      success: true,
      data: createdSteps,
      message: `Saved ${createdSteps.length} steps`
    })

  } catch (error) {
    console.error('🚨 Error saving steps:', error)
    console.error('🚨 Error stack:', error instanceof Error ? error.stack : 'No stack available')
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al guardar los pasos',
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}