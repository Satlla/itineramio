import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    // Check admin auth
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }

    const { searchParams } = new URL(request.url)

    // Filters
    const archetype = searchParams.get('archetype')
    const hasEmail = searchParams.get('hasEmail')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const export_format = searchParams.get('export')

    const where: any = {}

    if (archetype && archetype !== 'ALL') {
      where.archetype = archetype
    }

    if (hasEmail === 'true') {
      where.email = { not: null }
    } else if (hasEmail === 'false') {
      where.email = null
    }

    if (dateFrom) {
      where.createdAt = { gte: new Date(dateFrom) }
    }

    if (dateTo) {
      if (where.createdAt) {
        where.createdAt.lte = new Date(dateTo)
      } else {
        where.createdAt = { lte: new Date(dateTo) }
      }
    }

    const profiles = await prisma.hostProfileTest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        email: true,
        name: true,
        gender: true,
        archetype: true,
        topStrength: true,
        criticalGap: true,
        scoreHospitalidad: true,
        scoreComunicacion: true,
        scoreOperativa: true,
        scoreCrisis: true,
        scoreData: true,
        scoreLimites: true,
        scoreMkt: true,
        scoreBalance: true,
        emailConsent: true,
        shareConsent: true
      }
    })

    // Enriquecer con datos de EmailSubscriber (funnel tracking)
    const enrichedProfiles = await Promise.all(
      profiles.map(async (profile) => {
        if (!profile.email) {
          return { ...profile, subscriber: null }
        }

        const subscriber = await prisma.emailSubscriber.findUnique({
          where: { email: profile.email },
          select: {
            engagementScore: true,
            currentJourneyStage: true,
            emailsSent: true,
            emailsOpened: true,
            emailsClicked: true,
            downloadedGuide: true,
            day3SentAt: true,
            day7SentAt: true,
            day10SentAt: true,
            day14SentAt: true,
            sequenceStatus: true,
            lastEngagement: true,
            openRate: true,
            clickRate: true,
          }
        })

        return { ...profile, subscriber }
      })
    )

    // CSV Export
    if (export_format === 'csv') {
      const csvHeader = 'ID,Fecha,Email,Nombre,Género,Arquetipo,Fortaleza,Gap Crítico,Hospitalidad,Comunicación,Operativa,Crisis,Data,Límites,Mkt,Balance,Consent Email,Consent Compartir,Engagement,Journey,Emails Enviados,Emails Abiertos,Descargó Guía\n'

      const csvRows = enrichedProfiles.map(p =>
        [
          p.id,
          p.createdAt.toISOString(),
          p.email || '',
          p.name || '',
          p.gender || '',
          p.archetype,
          p.topStrength,
          p.criticalGap,
          p.scoreHospitalidad.toFixed(2),
          p.scoreComunicacion.toFixed(2),
          p.scoreOperativa.toFixed(2),
          p.scoreCrisis.toFixed(2),
          p.scoreData.toFixed(2),
          p.scoreLimites.toFixed(2),
          p.scoreMkt.toFixed(2),
          p.scoreBalance.toFixed(2),
          p.emailConsent ? 'Sí' : 'No',
          p.shareConsent ? 'Sí' : 'No',
          p.subscriber?.engagementScore || '-',
          p.subscriber?.currentJourneyStage || '-',
          p.subscriber?.emailsSent || 0,
          p.subscriber?.emailsOpened || 0,
          p.subscriber?.downloadedGuide ? 'Sí' : 'No'
        ].join(',')
      ).join('\n')

      const csv = csvHeader + csvRows

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="host-profiles-${new Date().toISOString()}.csv"`
        }
      })
    }

    // Stats
    const stats = {
      total: enrichedProfiles.length,
      withEmail: enrichedProfiles.filter(p => p.email).length,
      withoutEmail: enrichedProfiles.filter(p => !p.email).length,
      byArchetype: enrichedProfiles.reduce((acc, p) => {
        acc[p.archetype] = (acc[p.archetype] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      // Nuevas stats
      withSubscriber: enrichedProfiles.filter(p => p.subscriber).length,
      downloadedGuide: enrichedProfiles.filter(p => p.subscriber?.downloadedGuide).length,
      byEngagement: {
        hot: enrichedProfiles.filter(p => p.subscriber?.engagementScore === 'hot').length,
        warm: enrichedProfiles.filter(p => p.subscriber?.engagementScore === 'warm').length,
        cold: enrichedProfiles.filter(p => p.subscriber?.engagementScore === 'cold').length,
      },
      // Email metrics
      emailMetrics: {
        totalSent: enrichedProfiles.reduce((sum, p) => sum + (p.subscriber?.emailsSent || 0), 0),
        totalOpened: enrichedProfiles.reduce((sum, p) => sum + (p.subscriber?.emailsOpened || 0), 0),
        totalClicked: enrichedProfiles.reduce((sum, p) => sum + (p.subscriber?.emailsClicked || 0), 0),
        avgOpenRate: enrichedProfiles.filter(p => (p.subscriber?.emailsSent ?? 0) > 0).length > 0
          ? enrichedProfiles
              .filter(p => p.subscriber && (p.subscriber.emailsSent ?? 0) > 0)
              .reduce((sum, p) => sum + (p.subscriber?.openRate || 0), 0) /
            enrichedProfiles.filter(p => (p.subscriber?.emailsSent ?? 0) > 0).length
          : 0
      }
    }

    return NextResponse.json({
      profiles: enrichedProfiles,
      stats
    })

  } catch (error) {
    console.error('Error fetching profiles:', error)
    return NextResponse.json(
      { error: 'Error al obtener perfiles' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Eliminar un perfil por email
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check admin auth
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }

    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email requerido' },
        { status: 400 }
      )
    }

    // Eliminar de ambas tablas
    const deletedTest = await prisma.hostProfileTest.deleteMany({
      where: { email }
    })

    const deletedSubscriber = await prisma.emailSubscriber.deleteMany({
      where: { email }
    })

    return NextResponse.json({
      success: true,
      deleted: {
        tests: deletedTest.count,
        subscribers: deletedSubscriber.count
      }
    })

  } catch (error) {
    console.error('Error deleting profile:', error)
    return NextResponse.json(
      { error: 'Error al eliminar perfil' },
      { status: 500 }
    )
  }
}
