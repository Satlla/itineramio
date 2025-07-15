import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../src/lib/prisma'
import { generateSlug, generateUniqueSlug } from '../../../../../../src/lib/slug-utils'
import { requireAuth } from '../../../../../../src/lib/auth'

// POST /api/properties/[id]/zones/debug - Debug zone creation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const errors: any[] = []
  const debug: any = {}
  
  try {
    debug.step = 'Getting property ID'
    const propertyId = (await params).id
    debug.propertyId = propertyId
    
    debug.step = 'Parsing request body'
    const body = await request.json()
    debug.body = body

    // Check authentication
    debug.step = 'Checking authentication'
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      errors.push({ step: 'auth', error: 'Authentication failed' })
      return NextResponse.json({ debug, errors }, { status: 401 })
    }
    const userId = authResult.userId
    debug.userId = userId

    // Set JWT claims for RLS policies
    debug.step = 'Setting JWT claims'
    try {
      await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`
      debug.jwtClaimsSet = true
    } catch (rslError) {
      errors.push({ step: 'jwt_claims', error: rslError })
      debug.jwtClaimsError = String(rslError)
    }

    // Validate required fields
    debug.step = 'Validating fields'
    const { name, description, icon, color, order, status } = body

    if (!name || !icon) {
      errors.push({ step: 'validation', error: 'Missing name or icon' })
      return NextResponse.json({ debug, errors }, { status: 400 })
    }

    // Normalize name
    let zoneName: string
    if (typeof name === 'string') {
      zoneName = name.trim()
    } else if (name && typeof name === 'object' && (name.es || name.en || name.fr)) {
      zoneName = name.es || name.en || name.fr || ''
    } else {
      errors.push({ step: 'name_normalization', error: 'Invalid name format' })
      return NextResponse.json({ debug, errors }, { status: 400 })
    }
    debug.zoneName = zoneName

    // Check property ownership
    debug.step = 'Checking property ownership'
    const property = await prisma.property.findFirst({
      where: { 
        id: propertyId,
        hostId: userId
      },
      include: {
        zones: true
      }
    })
    debug.propertyFound = !!property
    debug.existingZonesCount = property?.zones.length || 0

    if (!property) {
      errors.push({ step: 'property_check', error: 'Property not found or not authorized' })
      return NextResponse.json({ debug, errors }, { status: 404 })
    }

    // Get order
    debug.step = 'Calculating order'
    let zoneOrder = order
    if (zoneOrder === undefined || zoneOrder === null) {
      const maxOrder = await prisma.zone.findFirst({
        where: { propertyId },
        orderBy: { order: 'desc' },
        select: { order: true }
      })
      zoneOrder = (maxOrder?.order || 0) + 1
    }
    debug.zoneOrder = zoneOrder

    // Generate codes
    debug.step = 'Generating codes'
    const timestamp = Date.now()
    const randomPart1 = Math.random().toString(36).substr(2, 12)
    const randomPart2 = Math.random().toString(36).substr(2, 12)
    const qrCode = `qr_${timestamp}_${randomPart1}`
    const accessCode = `ac_${timestamp}_${randomPart2}`
    debug.codes = { qrCode, accessCode }

    // Generate slug
    debug.step = 'Generating slug'
    try {
      const baseSlug = generateSlug(zoneName)
      debug.baseSlug = baseSlug
      
      const existingSlugs = await prisma.zone.findMany({
        where: { 
          propertyId,
          slug: { not: null }
        },
        select: { slug: true }
      }).then(results => results.map(r => r.slug).filter(Boolean) as string[])
      
      debug.existingSlugs = existingSlugs
      const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs)
      debug.uniqueSlug = uniqueSlug
    } catch (slugError) {
      errors.push({ step: 'slug_generation', error: String(slugError) })
      debug.slugError = String(slugError)
    }

    // Try to create zone (dry run - just build the data)
    debug.step = 'Building zone data'
    const zoneData = {
      propertyId,
      name: { es: zoneName },
      slug: debug.uniqueSlug || null,
      description: { es: description?.trim() || 'Descripción de la zona' },
      icon: icon.trim(),
      color: color || 'bg-gray-100',
      order: zoneOrder,
      status: status || 'ACTIVE',
      qrCode,
      accessCode
    }
    debug.zoneData = zoneData

    // Test transaction
    debug.step = 'Testing transaction'
    try {
      await prisma.$transaction(async (tx) => {
        // Just test the transaction
        const count = await tx.zone.count({
          where: { propertyId }
        })
        debug.transactionTest = { success: true, count }
      })
    } catch (txError) {
      errors.push({ step: 'transaction_test', error: String(txError) })
      debug.transactionError = String(txError)
    }

    return NextResponse.json({
      success: errors.length === 0,
      debug,
      errors,
      message: 'Debug endpoint - no zone was actually created'
    }, { status: 200 })

  } catch (error) {
    errors.push({ 
      step: debug.step || 'unknown', 
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    
    return NextResponse.json({
      success: false,
      debug,
      errors,
      message: 'Debug endpoint - error occurred'
    }, { status: 200 })
  }
}