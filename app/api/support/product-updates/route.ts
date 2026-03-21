import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const updates = await prisma.productUpdate.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
    })

    return NextResponse.json({ updates })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener actualizaciones' },
      { status: 500 }
    )
  }
}
