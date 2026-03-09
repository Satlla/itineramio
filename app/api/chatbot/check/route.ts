import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { propertyId } = await request.json()

    if (!propertyId) {
      return NextResponse.json({ enabled: false }, { status: 400 })
    }

    const property = await prisma.property.findFirst({
      where: { id: propertyId, deletedAt: null },
      select: { id: true }
    })

    if (!property) {
      return NextResponse.json({ enabled: false }, { status: 403 })
    }

    return NextResponse.json({ enabled: true })
  } catch {
    return NextResponse.json({ enabled: false }, { status: 500 })
  }
}
