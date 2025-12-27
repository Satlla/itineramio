import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../src/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  try {
    // Verify admin authentication
    const adminOrResponse = await requireAdminAuth(req)
    if (adminOrResponse instanceof Response) {
      return adminOrResponse
    }

    const searchParams = req.nextUrl.searchParams
    const source = searchParams.get('source') || ''

    // Build where clause
    const where: any = {
      status: 'active' // EmailSubscriber usa 'status' no 'isActive'
    }

    if (source) {
      where.source = source
    }

    // Get all leads
    const leads = await prisma.emailSubscriber.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Generate CSV
    const headers = [
      'Email',
      'Nombre',
      'Fuente',
      'Arquetipo',
      'Journey Stage',
      'Engagement Score',
      'Tags',
      'Fecha Registro',
      'Emails Enviados',
      'Emails Abiertos'
    ]

    const rows = leads.map(lead => {
      return [
        lead.email,
        lead.name || '',
        lead.source || '',
        lead.archetype || '',
        lead.currentJourneyStage || 'subscribed',
        lead.engagementScore || 'warm',
        lead.tags?.join(', ') || '',
        new Date(lead.createdAt).toLocaleDateString('es-ES'),
        lead.emailsSent?.toString() || '0',
        lead.emailsOpened?.toString() || '0'
      ]
    })

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Return CSV file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="leads-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error) {
    console.error('Error exporting leads:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al exportar leads'
    }, { status: 500 })
  }
}
