import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const property = await prisma.property.update({
      where: { id: 'cmcax421e0001jx04lg9szpxg' },
      data: {
        isPublished: true,
        publishedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Property publication fixed',
      data: {
        id: property.id,
        status: property.status,
        isPublished: property.isPublished,
        publishedAt: property.publishedAt
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}