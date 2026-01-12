import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { verifyToken } from '../../../../src/lib/auth'
import { getAdminUser } from '../../../../src/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    const { question, email, category } = await request.json()

    if (!question || question.trim().length < 10) {
      return NextResponse.json(
        { error: 'La pregunta debe tener al menos 10 caracteres' },
        { status: 400 }
      )
    }

    // Try to get user ID from token (optional)
    let userId: string | null = null
    const token = request.cookies.get('auth-token')?.value
    if (token) {
      try {
        const decoded = verifyToken(token)
        userId = decoded.userId
      } catch {
        // Invalid token, continue without user
      }
    }

    // Create the FAQ submission
    const submission = await prisma.faqSubmission.create({
      data: {
        question: question.trim(),
        email: email?.trim() || null,
        userId,
        category: category || null,
        status: 'PENDING'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Pregunta enviada correctamente. Te responderemos pronto.',
      id: submission.id
    })

  } catch (error) {
    console.error('Error submitting FAQ:', error)
    return NextResponse.json(
      { error: 'Error al enviar la pregunta' },
      { status: 500 }
    )
  }
}

// Get recent FAQ submissions (for admin)
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication using admin-token
    const adminPayload = await getAdminUser(request)

    if (!adminPayload) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const limit = parseInt(searchParams.get('limit') || '50')

    const submissions = await prisma.faqSubmission.findMany({
      where: status ? { status: status as any } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: submissions,
      total: submissions.length
    })

  } catch (error) {
    console.error('Error fetching FAQ submissions:', error)
    return NextResponse.json(
      { error: 'Error al obtener preguntas' },
      { status: 500 }
    )
  }
}
