import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
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
