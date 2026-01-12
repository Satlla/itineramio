import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
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
        guideDownloaded: toolName ? `waitlist_${toolName}` : null
      }
    })

    console.log(`[Waitlist] New signup: ${email} for ${toolName || 'general'}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Waitlist] Error:', error)
    return NextResponse.json(
      { error: 'Error interno' },
      { status: 500 }
    )
  }
}
