import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/email/stats
 *
 * Obtiene estadísticas globales de la base de subscribers
 *
 * Query params:
 * - period: 'today' | 'week' | 'month' | 'all' (default: 'all')
 * - groupBy: 'archetype' | 'source' | 'engagement' | 'journey' (opcional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'all'
    const groupBy = searchParams.get('groupBy')

    // Calcular fecha límite según el período
    let dateFilter: Date | undefined
    const now = new Date()

    switch (period) {
      case 'today':
        dateFilter = new Date(now.setHours(0, 0, 0, 0))
        break
      case 'week':
        dateFilter = new Date(now.setDate(now.getDate() - 7))
        break
      case 'month':
        dateFilter = new Date(now.setMonth(now.getMonth() - 1))
        break
      default:
        dateFilter = undefined
    }

    // Construir where clause
    const whereClause: any = {}
    if (dateFilter) {
      whereClause.createdAt = { gte: dateFilter }
    }

    // Estadísticas generales
    const [
      totalSubscribers,
      activeSubscribers,
      unsubscribedCount,
      bouncedCount,
      hotLeads,
      warmLeads,
      coldLeads
    ] = await Promise.all([
      // Total de subscribers
      prisma.emailSubscriber.count({ where: whereClause }),

      // Activos
      prisma.emailSubscriber.count({
        where: { ...whereClause, status: 'active' }
      }),

      // Unsubscribed
      prisma.emailSubscriber.count({
        where: { ...whereClause, status: 'unsubscribed' }
      }),

      // Bounced
      prisma.emailSubscriber.count({
        where: { ...whereClause, status: 'bounced' }
      }),

      // Hot leads
      prisma.emailSubscriber.count({
        where: { ...whereClause, engagementScore: 'hot' }
      }),

      // Warm leads
      prisma.emailSubscriber.count({
        where: { ...whereClause, engagementScore: 'warm' }
      }),

      // Cold leads
      prisma.emailSubscriber.count({
        where: { ...whereClause, engagementScore: 'cold' }
      })
    ])

    // Estadísticas base
    const stats: any = {
      period,
      totalSubscribers,
      activeSubscribers,
      unsubscribedCount,
      bouncedCount,
      retentionRate: totalSubscribers > 0
        ? ((activeSubscribers / totalSubscribers) * 100).toFixed(2)
        : '0.00',
      engagement: {
        hot: hotLeads,
        warm: warmLeads,
        cold: coldLeads,
        hotPercentage: activeSubscribers > 0
          ? ((hotLeads / activeSubscribers) * 100).toFixed(2)
          : '0.00'
      }
    }

    // Agrupar por archetype si se solicita
    if (groupBy === 'archetype') {
      const byArchetype = await prisma.emailSubscriber.groupBy({
        by: ['archetype'],
        where: whereClause,
        _count: { archetype: true }
      })

      stats.byArchetype = byArchetype
        .filter(item => item.archetype) // Solo los que tienen archetype
        .map(item => ({
          archetype: item.archetype,
          count: item._count.archetype
        }))
        .sort((a, b) => b.count - a.count) // Ordenar por más populares
    }

    // Agrupar por source si se solicita
    if (groupBy === 'source') {
      const bySource = await prisma.emailSubscriber.groupBy({
        by: ['source'],
        where: whereClause,
        _count: { source: true }
      })

      stats.bySource = bySource
        .map(item => ({
          source: item.source,
          count: item._count.source
        }))
        .sort((a, b) => b.count - a.count)
    }

    // Agrupar por engagement score
    if (groupBy === 'engagement') {
      const byEngagement = await prisma.emailSubscriber.groupBy({
        by: ['engagementScore'],
        where: whereClause,
        _count: { engagementScore: true }
      })

      stats.byEngagement = byEngagement.map(item => ({
        score: item.engagementScore,
        count: item._count.engagementScore
      }))
    }

    // Agrupar por journey stage
    if (groupBy === 'journey') {
      const byJourney = await prisma.emailSubscriber.groupBy({
        by: ['currentJourneyStage'],
        where: whereClause,
        _count: { currentJourneyStage: true }
      })

      stats.byJourneyStage = byJourney.map(item => ({
        stage: item.currentJourneyStage,
        count: item._count.currentJourneyStage
      }))
    }

    // Growth stats (solo si el período NO es 'all')
    if (dateFilter) {
      // Subscribers nuevos en este período
      const newSubscribers = await prisma.emailSubscriber.count({
        where: {
          createdAt: { gte: dateFilter }
        }
      })

      // Unsubscribes en este período
      const newUnsubscribes = await prisma.emailSubscriber.count({
        where: {
          status: 'unsubscribed',
          unsubscribedAt: { gte: dateFilter }
        }
      })

      stats.growth = {
        newSubscribers,
        newUnsubscribes,
        netGrowth: newSubscribers - newUnsubscribes,
        growthRate: totalSubscribers > 0
          ? (((newSubscribers - newUnsubscribes) / totalSubscribers) * 100).toFixed(2)
          : '0.00'
      }
    }

    // Top tags más usados
    const allTags = await prisma.emailSubscriber.findMany({
      where: whereClause,
      select: { tags: true }
    })

    const tagCounts: Record<string, number> = {}
    allTags.forEach(subscriber => {
      subscriber.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })

    stats.topTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10 tags

    // Últimos subscribers (útil para debugging/monitoring)
    if (period === 'today' || period === 'week') {
      const recentSubscribers = await prisma.emailSubscriber.findMany({
        where: dateFilter ? { createdAt: { gte: dateFilter } } : {},
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          email: true,
          name: true,
          archetype: true,
          source: true,
          createdAt: true
        }
      })

      stats.recentSubscribers = recentSubscribers
    }

    return NextResponse.json({
      success: true,
      stats,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error en /api/email/stats:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * Ejemplos de uso:
 *
 * GET /api/email/stats
 * → Estadísticas globales de todos los tiempos
 *
 * GET /api/email/stats?period=month
 * → Estadísticas del último mes con growth stats
 *
 * GET /api/email/stats?period=week&groupBy=archetype
 * → Estadísticas de la semana agrupadas por archetype
 *
 * GET /api/email/stats?groupBy=source
 * → Ver qué fuentes (test, qr, blog, etc.) traen más subscribers
 */
