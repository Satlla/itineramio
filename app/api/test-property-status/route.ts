import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const property = await prisma.property.findFirst({
      where: { id: 'cmcax421e0001jx04lg9szpxg' },
      select: {
        id: true,
        name: true,
        status: true,
        isPublished: true,
        publishedAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: property
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}