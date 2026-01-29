import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const AVAILABLE_TIMES = ['10:00', '11:00', '12:00', '16:00', '17:00', '18:00']

export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get next 14 days
    const endDate = new Date(today)
    endDate.setDate(endDate.getDate() + 14)

    // Get blocked slots
    const blockedSlots = await prisma.blockedSlot.findMany({
      where: {
        date: {
          gte: today,
          lte: endDate
        }
      }
    })

    // Get existing bookings
    const existingBookings = await prisma.consultationBooking.findMany({
      where: {
        scheduledDate: {
          gte: today,
          lte: endDate
        },
        status: { in: ['scheduled'] }
      },
      select: {
        scheduledDate: true
      }
    })

    // Build map of blocked times
    const blockedMap = new Map<string, Set<string>>() // date -> set of times

    // Add blocked slots to map
    for (const slot of blockedSlots) {
      const dateStr = slot.date.toISOString().split('T')[0]
      if (!blockedMap.has(dateStr)) {
        blockedMap.set(dateStr, new Set())
      }
      if (slot.time) {
        blockedMap.get(dateStr)!.add(slot.time)
      } else {
        // Whole day blocked - add all times
        AVAILABLE_TIMES.forEach(t => blockedMap.get(dateStr)!.add(t))
      }
    }

    // Add existing bookings to map
    for (const booking of existingBookings) {
      const dateStr = booking.scheduledDate.toISOString().split('T')[0]
      const timeStr = booking.scheduledDate.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Madrid'
      })
      if (!blockedMap.has(dateStr)) {
        blockedMap.set(dateStr, new Set())
      }
      blockedMap.get(dateStr)!.add(timeStr)
    }

    // Generate available slots
    const slots: { date: string; label: string; times: string[] }[] = []

    for (let i = 1; i <= 14; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue

      const dateStr = date.toISOString().split('T')[0]
      const blockedTimes = blockedMap.get(dateStr) || new Set()

      // Filter available times
      const availableTimes = AVAILABLE_TIMES.filter(t => !blockedTimes.has(t))

      // Only include days with available times
      if (availableTimes.length > 0) {
        slots.push({
          date: dateStr,
          label: date.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          }),
          times: availableTimes
        })
      }
    }

    return NextResponse.json({ slots })
  } catch (error) {
    console.error('Error fetching available slots:', error)
    return NextResponse.json({ error: 'Error fetching slots' }, { status: 500 })
  }
}
