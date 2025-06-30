import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'
import { requireAuth } from '../../../src/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { propertyId } = body

    if (!propertyId) {
      return NextResponse.json({ error: 'propertyId is required' }, { status: 400 })
    }

    // Check authentication
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    // Set JWT claims for RLS policies
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`

    // Find or create Check In zone
    let checkInZone = await prisma.zone.findFirst({
      where: {
        propertyId: propertyId,
        OR: [
          { name: { equals: 'Check In' } },
          { name: { path: '$.es', equals: 'Check In' } }
        ]
      }
    })

    if (!checkInZone) {
      // Create Check In zone
      checkInZone = await prisma.zone.create({
        data: {
          name: { es: 'Check In', en: 'Check In' },
          description: { es: 'Entrada al apartamento', en: 'Apartment entry' },
          icon: 'key',
          order: 1,
          status: 'ACTIVE',
          isPublished: true,
          propertyId: propertyId
        }
      })
      console.log('Created Check In zone:', checkInZone.id)
    }

    // Create test video step
    const testStep = await prisma.step.create({
      data: {
        title: { es: 'TEST - Cómo abrir la puerta', en: 'TEST - How to open the door' },
        content: {
          es: 'Este es un paso de prueba con video. Introduce el código en el teclado. Espera el pitido. Gira el pomo con luz verde.',
          en: 'This is a test step with video. Enter the code on the keypad. Wait for the beep. Turn the knob with green light.',
          mediaUrl: '/templates/videos/check-in.mp4'
        },
        type: 'VIDEO',
        order: 99,
        isPublished: true,
        zoneId: checkInZone.id
      }
    })

    console.log('Created test video step:', testStep.id)

    // Verify the step was created correctly
    const createdStep = await prisma.step.findUnique({
      where: { id: testStep.id }
    })

    return NextResponse.json({
      success: true,
      zone: {
        id: checkInZone.id,
        name: checkInZone.name
      },
      step: {
        id: testStep.id,
        title: testStep.title,
        type: testStep.type,
        content: testStep.content,
        hasMediaUrl: !!(createdStep?.content as any)?.mediaUrl
      },
      publicUrl: `/guide/${propertyId}/${checkInZone.id}`
    })
  } catch (error) {
    console.error('Error creating test video step:', error)
    return NextResponse.json({ 
      error: 'Error creating test step', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}