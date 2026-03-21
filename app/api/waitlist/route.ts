import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkRateLimitAsync, getRateLimitKey } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const rl = await checkRateLimitAsync(
      getRateLimitKey(request, null, 'waitlist'),
      { maxRequests: 3, windowMs: 60 * 1000 }
    )
    if (!rl.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const { email, source, toolName } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      )
    }

    // Check if already subscribed
    const existing = await prisma.emailSubscriber.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existing) {
      // Update source if new
      const currentSources = existing.source?.split(',') || []
      if (!currentSources.includes(source)) {
        await prisma.emailSubscriber.update({
          where: { email: email.toLowerCase() },
          data: {
            source: [...currentSources, source].filter(Boolean).join(','),
            updatedAt: new Date()
          }
        })
      }
      return NextResponse.json({ success: true, message: 'Ya estás en la lista' })
    }

    // Create new subscriber
    await prisma.emailSubscriber.create({
      data: {
        email: email.toLowerCase(),
        source: source || 'waitlist',
        status: 'active',
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno' },
      { status: 500 }
    )
  }
}
