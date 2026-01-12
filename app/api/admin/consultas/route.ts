import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const bookings = await prisma.consultationBooking.findMany({
      orderBy: { scheduledDate: 'desc' },
      take: 100
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Error fetching bookings' }, { status: 500 })
  }
}
