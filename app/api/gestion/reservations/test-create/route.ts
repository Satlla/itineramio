import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * POST /api/gestion/reservations/test-create
 * Diagnostic endpoint: creates a test reservation and verifies it exists
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult
    const userId = authResult.userId

    const code = 'TEST-DIAG-' + Date.now()

    // Step 1: Create
    const created = await prisma.reservation.create({
      data: {
        userId,
        billingUnitId: 'cmmb7epz4008k7cwpk3ffe9wd',
        platform: 'OTHER',
        confirmationCode: code,
        guestName: 'TEST DIAGNOSTIC',
        checkIn: new Date('2026-03-01'),
        checkOut: new Date('2026-03-05'),
        nights: 4,
        roomTotal: 100,
        hostEarnings: 90,
        currency: 'EUR',
        status: 'CONFIRMED',
        type: 'BOOKING',
        importSource: 'CSV_UNIVERSAL'
      }
    })

    // Step 2: Verify with findUnique
    const verify = await prisma.reservation.findUnique({
      where: { id: created.id }
    })

    // Step 3: Count
    const count = await prisma.reservation.count({
      where: { userId, importSource: 'CSV_UNIVERSAL' }
    })

    // Step 4: Delete test row
    await prisma.reservation.delete({ where: { id: created.id } })

    return NextResponse.json({
      step1_created: { id: created.id, guestName: created.guestName },
      step2_verified: verify ? true : false,
      step3_csvUniversalCount: count,
      step4_cleaned: true,
      userId,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown'
    }, { status: 500 })
  }
}
