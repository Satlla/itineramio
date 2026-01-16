import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth, createActivityLog, getRequestInfo } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }

    // Get blocked slots from today onwards
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const blockedSlots = await prisma.blockedSlot.findMany({
      where: {
        date: { gte: today }
      },
      orderBy: { date: 'asc' }
    })

    return NextResponse.json({ blockedSlots })
  } catch (error) {
    console.error('Error fetching blocked slots:', error)
    return NextResponse.json({ error: 'Error fetching blocked slots' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }

    const body = await request.json()

    const { date, time, reason } = body

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 })
    }

    // Create the blocked slot
    const blockedSlot = await prisma.blockedSlot.create({
      data: {
        date: new Date(date),
        time: time || null,
        reason: reason || null
      }
    })

    // Log the activity
    const { ipAddress, userAgent } = getRequestInfo(request)
    await createActivityLog({
      adminId: authResult.adminId,
      action: 'blocked_slot_created',
      targetType: 'blocked_slot',
      targetId: blockedSlot.id,
      description: `Slot bloqueado: ${date}${time ? ` a las ${time}` : ' (día completo)'}`,
      metadata: { date, time, reason },
      ipAddress,
      userAgent
    })

    return NextResponse.json({ blockedSlot })
  } catch (error) {
    console.error('Error creating blocked slot:', error)
    // Handle unique constraint violation
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'This slot is already blocked' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Error creating blocked slot' }, { status: 500 })
  }
}
