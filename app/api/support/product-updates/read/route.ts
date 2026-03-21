import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { requireAuth } from '../../../../../src/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult

    const body = await request.json()
    const { productUpdateId } = body

    if (!productUpdateId || typeof productUpdateId !== 'string') {
      return NextResponse.json(
        { error: 'productUpdateId is required' },
        { status: 400 }
      )
    }

    // Verify the product update exists
    const update = await prisma.productUpdate.findUnique({
      where: { id: productUpdateId },
      select: { id: true },
    })

    if (!update) {
      return NextResponse.json(
        { error: 'Product update not found' },
        { status: 404 }
      )
    }

    // Upsert read record
    await prisma.productUpdateRead.upsert({
      where: {
        productUpdateId_userId: {
          productUpdateId,
          userId: authResult.userId,
        },
      },
      create: {
        productUpdateId,
        userId: authResult.userId,
      },
      update: {
        readAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al marcar como leído' },
      { status: 500 }
    )
  }
}
