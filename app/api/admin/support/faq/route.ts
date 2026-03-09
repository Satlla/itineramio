import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { requireAdminAuth } from '../../../../../src/lib/admin-auth'

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAdminAuth(req)
    if (authResult instanceof Response) return authResult

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const includeInWelcome = searchParams.get('includeInWelcome')
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)
    const skip = (page - 1) * limit

    // Build where clause
    const where: Record<string, unknown> = {}

    if (status) {
      where.status = status
    }

    if (includeInWelcome === 'true') {
      where.includeInWelcomeEmail = true
    } else if (includeInWelcome === 'false') {
      where.includeInWelcomeEmail = false
    }

    if (category) {
      where.category = category
    }

    const [faqs, total] = await Promise.all([
      prisma.frequentQuestion.findMany({
        where,
        orderBy: { frequency: 'desc' },
        skip,
        take: limit,
      }),
      prisma.frequentQuestion.count({ where }),
    ])

    return NextResponse.json({
      faqs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error('Error fetching FAQs:', error)
    return NextResponse.json(
      { error: 'Error al obtener FAQs' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAdminAuth(req)
    if (authResult instanceof Response) return authResult

    const body = await req.json()
    const { question, answer, category, includeInWelcomeEmail } = body

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json(
        { error: 'La pregunta es obligatoria' },
        { status: 400 }
      )
    }

    if (!category || typeof category !== 'string') {
      return NextResponse.json(
        { error: 'La categoria es obligatoria' },
        { status: 400 }
      )
    }

    const faq = await prisma.frequentQuestion.create({
      data: {
        question: question.trim(),
        category,
        answer: answer || null,
        isAutoDetected: false,
        includeInWelcomeEmail: includeInWelcomeEmail || false,
        frequency: 0,
      },
    })

    return NextResponse.json({ faq }, { status: 201 })
  } catch (error) {
    console.error('Error creating FAQ:', error)
    return NextResponse.json(
      { error: 'Error al crear FAQ' },
      { status: 500 }
    )
  }
}
