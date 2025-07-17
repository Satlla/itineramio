import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = 'itineramio-secret-key-2024'

interface RouteParams {
  params: Promise<{
    zoneId: string
  }>
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { zoneId } = await params
    const { targetPropertyId } = await request.json()

    if (!targetPropertyId) {
      return NextResponse.json(
        { success: false, error: 'Target property ID is required' },
        { status: 400 }
      )
    }

    // Check authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    let userId: string
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
      userId = decoded.userId
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Set JWT claims for RLS policies
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`

    // 1. Get the source zone with all its data
    const sourceZone = await prisma.zone.findFirst({
      where: {
        id: zoneId,
        property: {
          hostId: userId
        }
      },
      include: {
        steps: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    if (!sourceZone) {
      return NextResponse.json(
        { success: false, error: 'Zone not found or access denied' },
        { status: 404 }
      )
    }

    // 2. Verify user owns the target property
    const targetProperty = await prisma.property.findFirst({
      where: {
        id: targetPropertyId,
        hostId: userId
      }
    })

    if (!targetProperty) {
      return NextResponse.json(
        { success: false, error: 'Target property not found or access denied' },
        { status: 404 }
      )
    }

    // 3. Get the highest order for zones in target property
    const lastZone = await prisma.zone.findFirst({
      where: {
        propertyId: targetPropertyId
      },
      orderBy: {
        order: 'desc'
      }
    })

    const nextOrder = lastZone ? lastZone.order + 1 : 0

    // 4. Create the new zone (without steps first)
    const newZone = await prisma.zone.create({
      data: {
        propertyId: targetPropertyId,
        name: sourceZone.name as any, // JSON field
        description: sourceZone.description as any, // JSON field
        icon: sourceZone.icon,
        color: sourceZone.color,
        order: nextOrder,
        qrCode: `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate unique QR code
        accessCode: `ac_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` // Generate unique access code
      }
    })

    // 5. Copy all steps from source zone to new zone
    if (sourceZone.steps && sourceZone.steps.length > 0) {
      const stepsData = sourceZone.steps.map((step) => ({
        zoneId: newZone.id,
        type: step.type,
        title: step.title as any, // JSON field
        content: step.content as any, // JSON field
        order: step.order,
        isPublished: step.isPublished
      }))

      try {
        await prisma.step.createMany({
          data: stepsData
        })
      } catch (stepsError) {
        console.error('Error copying steps:', stepsError)
        // If steps fail, we should clean up the zone
        await prisma.zone.delete({
          where: { id: newZone.id }
        })
        
        return NextResponse.json(
          { success: false, error: 'Failed to copy zone steps' },
          { status: 500 }
        )
      }
    }

    // 6. Generate slug for the new zone if needed
    try {
      const { generateSlug } = require('../../../../../src/lib/slug-utils')
      // Convert JSON name to string if needed
      const nameText = typeof sourceZone.name === 'string' 
        ? sourceZone.name 
        : (sourceZone.name as any)?.es || (sourceZone.name as any)?.en || 'Zona copiada'
      const slug = generateSlug(nameText)
      
      // Update zone with slug
      await prisma.zone.update({
        where: { id: newZone.id },
        data: { slug }
      })
    } catch (slugError) {
      console.warn('Could not generate slug for copied zone:', slugError)
    }

    return NextResponse.json({
      success: true,
      data: {
        zoneId: newZone.id,
        zoneName: newZone.name,
        stepsCount: sourceZone.steps?.length || 0
      }
    })

  } catch (error) {
    console.error('Error copying zone:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}