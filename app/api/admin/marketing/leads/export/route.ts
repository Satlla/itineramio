import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../src/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    // TODO: Add admin authentication check

    const searchParams = req.nextUrl.searchParams
    const source = searchParams.get('source') || ''

    // Build where clause
    const where: any = {
      isActive: true
    }

    if (source) {
      where.source = source
    }

    // Get all leads
    const leads = await prisma.newsletterSubscriber.findMany({
      where,
      include: {
        downloads: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Generate CSV
    const headers = [
      'Email',
      'Nombre',
      'Ciudad',
      'Fuente',
      'Propiedades',
      'Tags',
      'Fecha Registro',
      'Descargas',
      'Última Descarga'
    ]

    const rows = leads.map(lead => {
      const lastDownload = lead.downloads[0]
      return [
        lead.email,
        lead.name || '',
        lead.city || '',
        lead.source || '',
        lead.propertyCount?.toString() || '0',
        lead.tags?.join(', ') || '',
        new Date(lead.createdAt).toLocaleDateString('es-ES'),
        lead.downloads.length.toString(),
        lastDownload ? new Date(lastDownload.createdAt).toLocaleDateString('es-ES') : ''
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
