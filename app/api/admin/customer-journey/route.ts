import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'

/**
 * Endpoint para ver el journey completo de un cliente desde que hace el test
 *
 * Uso: GET /api/admin/customer-journey?email=tu@email.com
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }

    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // 1. Test de perfil
    const tests = await prisma.hostProfileTest.findMany({
      where: { email: normalizedEmail },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        archetype: true,
        scoreHospitalidad: true,
        scoreComunicacion: true,
        scoreOperativa: true,
        scoreCrisis: true,
        scoreData: true,
        scoreLimites: true,
        scoreMkt: true,
        scoreBalance: true,
        topStrength: true,
        criticalGap: true,
      }
    })

    // 2. Subscriber del embudo
    const subscriber = await prisma.emailSubscriber.findUnique({
      where: { email: normalizedEmail },
    })

    // 3. Usuario registrado (si existe)
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        subscription: true,
        trialStartedAt: true,
        trialEndsAt: true,
      }
    })

    // Calcular progreso del embudo
    const funnelProgress: {
      stage: string
      percentage: number
      emailsSent: number
      emailsOpened: number
      emailsClicked: number
      conversionStage: string
    } = {
      stage: 'unknown',
      percentage: 0,
      emailsSent: 0,
      emailsOpened: 0,
      emailsClicked: 0,
      conversionStage: 'lead', // lead | engaged | trial | customer
    }

    if (subscriber) {
      const emailsSent = subscriber.emailsSent || 0
      const emailsOpened = subscriber.emailsOpened || 0
      const emailsClicked = subscriber.emailsClicked || 0

      // Determinar stage del embudo
      if (subscriber.sequenceStatus === 'completed') {
        funnelProgress.stage = 'sequence_completed'
        funnelProgress.percentage = 100
      } else if (subscriber.day14SentAt) {
        funnelProgress.stage = 'day_14_sent'
        funnelProgress.percentage = 90
      } else if (subscriber.day10SentAt) {
        funnelProgress.stage = 'day_10_sent'
        funnelProgress.percentage = 70
      } else if (subscriber.day7SentAt) {
        funnelProgress.stage = 'day_7_sent'
        funnelProgress.percentage = 50
      } else if (subscriber.day3SentAt) {
        funnelProgress.stage = 'day_3_sent'
        funnelProgress.percentage = 30
      } else if (subscriber.sequenceStartedAt) {
        funnelProgress.stage = 'welcome_sent'
        funnelProgress.percentage = 10
      }

      funnelProgress.emailsSent = emailsSent
      funnelProgress.emailsOpened = emailsOpened
      funnelProgress.emailsClicked = emailsClicked

      // Determinar nivel de conversión
      if (user && user.subscription) {
        funnelProgress.conversionStage = 'customer'
      } else if (user && user.trialStartedAt) {
        funnelProgress.conversionStage = 'trial'
      } else if (emailsClicked > 0) {
        funnelProgress.conversionStage = 'engaged'
      } else {
        funnelProgress.conversionStage = 'lead'
      }
    }

    // Timeline de eventos
    const timeline: Array<{
      type: string
      date: Date
      data: Record<string, unknown>
    }> = []

    // Eventos de tests
    tests.forEach(test => {
      timeline.push({
        type: 'test_completed',
        date: test.createdAt,
        data: {
          testId: test.id,
          archetype: test.archetype,
          topStrength: test.topStrength,
          criticalGap: test.criticalGap,
        }
      })
    })

    // Eventos de emails
    if (subscriber) {
      if (subscriber.sequenceStartedAt) {
        timeline.push({
          type: 'sequence_started',
          date: subscriber.sequenceStartedAt,
          data: { archetype: subscriber.archetype }
        })
      }
      if (subscriber.day3SentAt) {
        timeline.push({
          type: 'email_day3_sent',
          date: subscriber.day3SentAt,
          data: { subject: 'Errores comunes' }
        })
      }
      if (subscriber.day7SentAt) {
        timeline.push({
          type: 'email_day7_sent',
          date: subscriber.day7SentAt,
          data: { subject: 'Caso de estudio' }
        })
      }
      if (subscriber.day10SentAt) {
        timeline.push({
          type: 'email_day10_sent',
          date: subscriber.day10SentAt,
          data: { subject: 'Trial invitation' }
        })
      }
      if (subscriber.day14SentAt) {
        timeline.push({
          type: 'email_day14_sent',
          date: subscriber.day14SentAt,
          data: { subject: 'Última oportunidad' }
        })
      }
      if (subscriber.lastEmailOpenedAt) {
        timeline.push({
          type: 'email_opened',
          date: subscriber.lastEmailOpenedAt,
          data: { count: subscriber.emailsOpened }
        })
      }
      if (subscriber.lastEmailClickedAt) {
        timeline.push({
          type: 'email_clicked',
          date: subscriber.lastEmailClickedAt,
          data: { count: subscriber.emailsClicked }
        })
      }
    }

    // Eventos de usuario
    if (user) {
      timeline.push({
        type: 'user_registered',
        date: user.createdAt,
        data: {
          subscription: user.subscription,
          trial: user.trialStartedAt ? 'active' : 'none'
        }
      })
    }

    // Ordenar timeline por fecha
    timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json({
      email: normalizedEmail,
      summary: {
        hasCompletedTest: tests.length > 0,
        testsCount: tests.length,
        isSubscriber: !!subscriber,
        isUser: !!user,
        isPaidCustomer: (user as { subscriptionStatus?: string })?.subscriptionStatus === 'active',
      },
      latestTest: tests[0] || null,
      subscriber: subscriber ? {
        id: subscriber.id,
        archetype: subscriber.archetype,
        status: subscriber.status,
        sequenceStatus: subscriber.sequenceStatus,
        sequenceStartedAt: subscriber.sequenceStartedAt,
        emailsSent: subscriber.emailsSent,
        emailsOpened: subscriber.emailsOpened,
        emailsClicked: subscriber.emailsClicked,
        engagementScore: subscriber.engagementScore,
        currentJourneyStage: subscriber.currentJourneyStage,
        tags: subscriber.tags,
        openRate: subscriber.emailsSent > 0 ? ((subscriber.emailsOpened || 0) / subscriber.emailsSent) * 100 : 0,
        clickRate: subscriber.emailsSent > 0 ? ((subscriber.emailsClicked || 0) / subscriber.emailsSent) * 100 : 0,
      } : null,
      user: user || null,
      funnelProgress,
      timeline,
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener el journey', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
