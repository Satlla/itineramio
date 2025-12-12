import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '../../../../../../src/lib/prisma'
import { requireAuth } from '../../../../../../src/lib/auth'

// Validation schema for zone order update
const updateOrderSchema = z.object({
  zones: z.array(z.object({
    id: z.string(),
    order: z.number()
  }))
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params

    console.log('🔄 [ZONE ORDER UPDATE] Starting request for propertyId:', propertyId)

    // Get authenticated user
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      console.log('❌ [ZONE ORDER UPDATE] Auth failed')
      return authResult
    }
    const userId = authResult.userId
    console.log('✅ [ZONE ORDER UPDATE] User authenticated:', userId)

    // Set JWT claims for PostgreSQL RLS policies
    // REMOVED: set_config doesn't work with PgBouncer in transaction mode
    // RLS is handled at application level instead

    const body = await request.json()
    console.log('📥 [ZONE ORDER UPDATE] Received data:', JSON.stringify(body, null, 2))

    // Validate request data
    const validatedData = updateOrderSchema.parse(body)
    console.log('✅ [ZONE ORDER UPDATE] Data validated successfully, zones count:', validatedData.zones.length)

    // Verify user owns the property
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        hostId: userId
      }
    })

    if (!property) {
      console.log('❌ [ZONE ORDER UPDATE] Property not found or not authorized')
      return NextResponse.json(
        { error: 'Propiedad no encontrada o no autorizada' },
        { status: 404 }
      )
    }
    console.log('✅ [ZONE ORDER UPDATE] Property ownership verified:', property.name)

    // Query zones BEFORE update to see current state
    console.log('🔍 [ZONE ORDER UPDATE] Querying zones BEFORE update...')
    const zonesBefore = await prisma.zone.findMany({
      where: {
        propertyId,
        id: { in: validatedData.zones.map(z => z.id) }
      },
      select: {
        id: true,
        order: true,
        name: true
      },
      orderBy: { order: 'asc' }
    })
    console.log('📊 [ZONE ORDER UPDATE] Zones BEFORE update:',
      zonesBefore.map(z => {
        let zoneName = 'Unknown'
        if (typeof z.name === 'object' && z.name !== null) {
          zoneName = (z.name as any).es || (z.name as any).en || JSON.stringify(z.name)
        }
        return `${zoneName} (order: ${z.order})`
      })
    )

    // Update zone order in database
    console.log('🔄 [ZONE ORDER UPDATE] Starting database transaction...')
    const updatePromises = validatedData.zones.map(({ id, order }) => {
      console.log(`  → Updating zone ${id} to order ${order}`)
      return prisma.zone.update({
        where: {
          id,
          propertyId // Ensure zone belongs to this property
        },
        data: { order }
      })
    })

    const results = await prisma.$transaction(updatePromises)
    console.log('✅ [ZONE ORDER UPDATE] Transaction completed successfully, updated zones:', results.length)

    // Query zones AFTER update to verify changes persisted
    console.log('🔍 [ZONE ORDER UPDATE] Querying zones AFTER update to verify...')
    const zonesAfter = await prisma.zone.findMany({
      where: {
        propertyId,
        id: { in: validatedData.zones.map(z => z.id) }
      },
      select: {
        id: true,
        order: true,
        name: true
      },
      orderBy: { order: 'asc' }
    })
    console.log('📊 [ZONE ORDER UPDATE] Zones AFTER update:',
      zonesAfter.map(z => {
        let zoneName = 'Unknown'
        if (typeof z.name === 'object' && z.name !== null) {
          zoneName = (z.name as any).es || (z.name as any).en || JSON.stringify(z.name)
        }
        return `${zoneName} (order: ${z.order})`
      })
    )

    // Compare before and after
    const changesDetected = zonesBefore.some((before, index) => {
      const after = zonesAfter.find(a => a.id === before.id)
      return after && after.order !== before.order
    })
    console.log(changesDetected ? '✅ [ZONE ORDER UPDATE] Changes detected in database!' : '⚠️ [ZONE ORDER UPDATE] No changes detected in database - PROBLEM!')

    return NextResponse.json({
      success: true,
      message: 'Orden de zonas actualizado correctamente',
      debug: {
        updatedCount: results.length,
        changesDetected,
        before: zonesBefore.map(z => ({ id: z.id, order: z.order })),
        after: zonesAfter.map(z => ({ id: z.id, order: z.order }))
      }
    })

  } catch (error) {
    console.error('❌ [ZONE ORDER UPDATE] Error updating zone order:', error)
    console.error('❌ [ZONE ORDER UPDATE] Error stack:', error instanceof Error ? error.stack : 'No stack trace')

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Datos de entrada inválidos',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}