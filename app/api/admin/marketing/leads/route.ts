import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    // TODO: Add admin authentication check

    const searchParams = req.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const source = searchParams.get('source') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      isActive: true
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (source) {
      where.source = source
    }

    // Get leads with their downloads
    const [leads, total] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
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
        },
        skip,
        take: limit
      }),
      prisma.newsletterSubscriber.count({ where })
    ])

    // Get unique sources for filter
    const sources = await prisma.newsletterSubscriber.findMany({
      where: {
        isActive: true,
        source: {
          not: null
        }
      },
      select: {
        source: true
      },
      distinct: ['source']
    })

    // Get stats by source
    const allLeads = await prisma.newsletterSubscriber.findMany({
      where: {
        isActive: true
      },
      select: {
        source: true
      }
    })

    const bySource: Record<string, number> = {}
    allLeads.forEach(lead => {
      const src = lead.source || 'unknown'
      bySource[src] = (bySource[src] || 0) + 1
    })

    return NextResponse.json({
      success: true,
      leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      sources: sources.map(s => s.source).filter(Boolean),
      stats: {
        bySource,
        total: allLeads.length
      }
    })

  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al obtener leads'
    }, { status: 500 })
  }
}
