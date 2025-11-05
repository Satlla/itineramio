import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Check admin auth
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
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

    // CSV Export
    if (export_format === 'csv') {
      const csvHeader = 'ID,Fecha,Email,Nombre,Género,Arquetipo,Fortaleza,Gap Crítico,Hospitalidad,Comunicación,Operativa,Crisis,Data,Límites,Mkt,Balance,Consent Email,Consent Compartir\n'

      const csvRows = profiles.map(p =>
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
          p.shareConsent ? 'Sí' : 'No'
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
      total: profiles.length,
      withEmail: profiles.filter(p => p.email).length,
      withoutEmail: profiles.filter(p => !p.email).length,
      byArchetype: profiles.reduce((acc, p) => {
        acc[p.archetype] = (acc[p.archetype] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }

    return NextResponse.json({
      profiles,
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
