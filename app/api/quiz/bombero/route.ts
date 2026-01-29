import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/quiz/bombero
 * Save quiz lead from "Modo Bombero" blog quiz
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, score, level, answers, propertyCount } = body

    // Validate required fields
    if (!email || typeof score !== 'number' || !level) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email no válido' },
        { status: 400 }
      )
    }

    // Get IP and user agent for analytics
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown'
    const userAgent = request.headers.get('user-agent') || undefined

    // Check if email already exists for this quiz
    const existingLead = await prisma.quizLead.findFirst({
      where: {
        email,
        source: 'BLOG_BOMBERO_QUIZ'
      }
    })

    if (existingLead) {
      // Update existing lead with new score
      await prisma.quizLead.update({
        where: { id: existingLead.id },
        data: {
          score,
          level,
          answers,
          updatedAt: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Resultado actualizado',
        isReturning: true
      })
    }

    // Create new quiz lead (store propertyCount in answers)
    const quizLead = await prisma.quizLead.create({
      data: {
        email,
        score,
        level,
        answers: {
          ...answers,
          propertyCount: propertyCount || null
        },
        source: 'BLOG_BOMBERO_QUIZ',
        timeElapsed: 0,
        ipAddress,
        userAgent
      }
    })

    // Also create/update in general Lead table for marketing
    const existingGeneralLead = await prisma.lead.findFirst({
      where: { email }
    })

    if (!existingGeneralLead) {
      await prisma.lead.create({
        data: {
          email,
          name: '',
          source: 'BLOG_BOMBERO_QUIZ',
          ipAddress,
          userAgent,
          metadata: {
            quizScore: score,
            quizLevel: level,
            propertyCount: propertyCount || null
          }
        }
      })
    } else {
      // Update metadata with quiz info
      const currentMetadata = (existingGeneralLead.metadata as Record<string, unknown>) || {}
      await prisma.lead.update({
        where: { id: existingGeneralLead.id },
        data: {
          metadata: {
            ...currentMetadata,
            quizScore: score,
            quizLevel: level,
            propertyCount: propertyCount || null,
            quizCompletedAt: new Date().toISOString()
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Resultado guardado',
      leadId: quizLead.id
    })
  } catch (error) {
    console.error('Error saving quiz lead:', error)
    return NextResponse.json(
      { error: 'Error al guardar el resultado' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/quiz/bombero
 * Get quiz leads (admin only - no auth for now, add later)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const [leads, total] = await Promise.all([
      prisma.quizLead.findMany({
        where: { source: 'BLOG_BOMBERO_QUIZ' },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          email: true,
          score: true,
          level: true,
          answers: true,
          converted: true,
          createdAt: true
        }
      }),
      prisma.quizLead.count({
        where: { source: 'BLOG_BOMBERO_QUIZ' }
      })
    ])

    // Get stats
    const stats = await prisma.quizLead.groupBy({
      by: ['level'],
      where: { source: 'BLOG_BOMBERO_QUIZ' },
      _count: { id: true }
    })

    return NextResponse.json({
      leads,
      total,
      stats: stats.reduce((acc, s) => {
        acc[s.level] = s._count.id
        return acc
      }, {} as Record<string, number>)
    })
  } catch (error) {
    console.error('Error fetching quiz leads:', error)
    return NextResponse.json(
      { error: 'Error al obtener leads' },
      { status: 500 }
    )
  }
}
