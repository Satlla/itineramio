import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/knowledge/articles/[id]/vote - Votar si un artículo es útil o no
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { isHelpful } = body

    if (typeof isHelpful !== 'boolean') {
      return NextResponse.json({
        success: false,
        error: 'isHelpful debe ser booleano'
      }, { status: 400 })
    }

    // Verificar que el artículo existe
    const article = await prisma.knowledgeArticle.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        helpfulVotes: true,
        notHelpfulVotes: true
      }
    })

    if (!article) {
      return NextResponse.json({
        success: false,
        error: 'Artículo no encontrado'
      }, { status: 404 })
    }

    // Actualizar contador correspondiente
    const updateData = isHelpful
      ? { helpfulVotes: { increment: 1 } }
      : { notHelpfulVotes: { increment: 1 } }

    const updatedArticle = await prisma.knowledgeArticle.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        helpfulVotes: true,
        notHelpfulVotes: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        helpfulVotes: updatedArticle.helpfulVotes,
        notHelpfulVotes: updatedArticle.notHelpfulVotes
      }
    })

  } catch (error) {
    console.error('Error registrando voto:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al registrar voto'
    }, { status: 500 })
  }
}
