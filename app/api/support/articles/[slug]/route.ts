import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const article = await prisma.helpArticle.findUnique({
      where: { slug },
    })

    if (!article || article.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    // Increment views
    await prisma.helpArticle.update({
      where: { id: article.id },
      data: { views: { increment: 1 } },
    })

    return NextResponse.json({ article })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener artículo' },
      { status: 500 }
    )
  }
}
