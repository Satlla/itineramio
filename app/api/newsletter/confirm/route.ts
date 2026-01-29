import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(new URL('/newsletter/error?reason=missing-token', request.url))
    }

    // Find subscriber with this token
    const subscriber = await prisma.emailSubscriber.findFirst({
      where: {
        sourceMetadata: {
          path: ['confirmationToken'],
          equals: token
        }
      }
    })

    if (!subscriber) {
      return NextResponse.redirect(new URL('/newsletter/error?reason=invalid-token', request.url))
    }

    // Check if already confirmed
    if (subscriber.status === 'active') {
      return NextResponse.redirect(new URL('/newsletter/already-confirmed', request.url))
    }

    // Activate subscription
    await prisma.emailSubscriber.update({
      where: { id: subscriber.id },
      data: {
        status: 'active',
        sourceMetadata: {
          ...(subscriber.sourceMetadata as object || {}),
          confirmedAt: new Date().toISOString(),
          confirmationToken: null // Clear token
        }
      }
    })

    // Also create/update Lead
    const existingLead = await prisma.lead.findFirst({
      where: { email: subscriber.email }
    })

    if (!existingLead) {
      await prisma.lead.create({
        data: {
          email: subscriber.email,
          name: 'Suscriptor Newsletter',
          source: subscriber.source || 'newsletter',
          metadata: {
            newsletterSubscribed: true,
            confirmedAt: new Date().toISOString(),
            tags: subscriber.tags
          }
        }
      })
    }

    console.log(`✅ Newsletter subscription confirmed: ${subscriber.email}`)

    return NextResponse.redirect(new URL('/newsletter/confirmed', request.url))
  } catch (error) {
    console.error('Newsletter confirmation error:', error)
    return NextResponse.redirect(new URL('/newsletter/error?reason=server-error', request.url))
  }
}
