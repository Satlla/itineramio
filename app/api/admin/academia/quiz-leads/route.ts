import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { verifyAdminToken } from '../../../../../src/lib/admin-auth'
import { cookies } from 'next/headers'
import { quizQuestions } from '../../../../../src/data/quiz-questions'

/**
 * GET /api/admin/academia/quiz-leads
 * Obtiene todos los quiz leads para el admin
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const cookieStore = await cookies()
    const token = cookieStore.get('admin-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const admin = await verifyAdminToken(token)
    if (!admin) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Get all quiz leads
    const rawLeads = await prisma.quizLead.findMany({
      orderBy: {
        completedAt: 'desc'
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        score: true,
        level: true,
        timeElapsed: true,
        converted: true,
        completedAt: true,
        source: true,
        academyUserId: true,
        emailVerified: true,
        verifiedAt: true,
        answers: true
      }
    })

    // Format answers with question details
    const leads = rawLeads.map(lead => {
      const answers = (lead.answers as any[])?.map((answer: any) => {
        const question = quizQuestions.find(q => q.id === answer.questionId)
        if (!question) return null

        // Get selected option IDs (handle both old and new field names)
        const selectedOptionIds = answer.selectedOptions || answer.userAnswers || []

        // Get selected option texts
        const selectedOptions = selectedOptionIds.map((optId: string) => {
          const option = question.options.find(o => o.id === optId)
          return option?.text || optId
        })

        // Get correct option texts
        const correctOptions = question.options
          .filter(o => o.isCorrect)
          .map(o => o.text)

        // Get earned points (handle both old and new field names)
        const earnedPoints = answer.earnedPoints ?? answer.score ?? (answer.isCorrect ? question.points : 0)

        return {
          questionId: answer.questionId,
          question: question.question,
          category: question.category,
          selectedOptions,
          correctOptions,
          isCorrect: answer.isCorrect || false,
          points: question.points,
          earnedPoints
        }
      }).filter(Boolean) || []

      return {
        ...lead,
        answers
      }
    })

    // Calculate stats for the funnel page
    const converted = rawLeads.filter(l => l.converted).length
    const pending = rawLeads.filter(l => !l.converted).length
    const avgScore = rawLeads.length > 0
      ? Math.round(rawLeads.reduce((sum, l) => sum + l.score, 0) / rawLeads.length)
      : 0

    return NextResponse.json({
      success: true,
      leads,
      total: leads.length,
      stats: {
        total: leads.length,
        converted,
        pending,
        avgScore
      }
    })

  } catch (error) {
    console.error('Error fetching quiz leads:', error)
    return NextResponse.json(
      { error: 'Error al obtener los leads' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/academia/quiz-leads?id=xxx
 * Elimina un quiz lead
 */
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const admin = await verifyAdminToken(token)
    if (!admin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    await prisma.quizLead.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting quiz lead:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el lead' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/academia/quiz-leads
 * Actualiza un quiz lead
 */
export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const admin = await verifyAdminToken(token)
    if (!admin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { id, email, fullName, level, converted, emailVerified } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    const updated = await prisma.quizLead.update({
      where: { id },
      data: {
        ...(email && { email }),
        ...(fullName !== undefined && { fullName }),
        ...(level && { level }),
        ...(converted !== undefined && { converted }),
        ...(emailVerified !== undefined && {
          emailVerified,
          verifiedAt: emailVerified ? new Date() : null
        })
      }
    })

    return NextResponse.json({ success: true, lead: updated })
  } catch (error) {
    console.error('Error updating quiz lead:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el lead' },
      { status: 500 }
    )
  }
}
