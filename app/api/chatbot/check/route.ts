import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'

// TEMP: Restrict chatbot to specific host emails during beta
const ALLOWED_HOST_EMAILS = ['alejandrosatlla@gmail.com', 'system-demo@itineramio.com', 'colaboracionesbnb@gmail.com']

export async function POST(request: NextRequest) {
  try {
    const { propertyId } = await request.json()

    if (!propertyId) {
      return NextResponse.json({ enabled: false }, { status: 400 })
    }

    const property = await prisma.property.findFirst({
      where: { id: propertyId, deletedAt: null },
      select: {
        isDemoPreview: true,
        host: {
          select: { email: true }
        }
      }
    })

    // Allow chatbot for demo properties or whitelisted hosts
    if (!property) {
      return NextResponse.json({ enabled: false }, { status: 403 })
    }

    if (property.isDemoPreview || ALLOWED_HOST_EMAILS.includes(property.host?.email?.toLowerCase())) {
      return NextResponse.json({ enabled: true })
    }

    return NextResponse.json({ enabled: false }, { status: 403 })
  } catch {
    return NextResponse.json({ enabled: false }, { status: 500 })
  }
}
