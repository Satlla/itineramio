import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  try {
    // Verify admin authentication
    const adminOrResponse = await requireAdminAuth(req)
    if (adminOrResponse instanceof Response) {
      return adminOrResponse
    }

    const searchParams = req.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const source = searchParams.get('source') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      status: 'active' // EmailSubscriber usa 'status' no 'isActive'
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (source) {
      where.source = source
    }

    // Get leads (EmailSubscriber no tiene downloads, esos son del modelo Lead)
    const [leads, total] = await Promise.all([
      prisma.emailSubscriber.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.emailSubscriber.count({ where })
    ])

    // Get unique sources for filter (exclude empty sources)
    const sourcesRaw = await prisma.emailSubscriber.findMany({
      where: {
        status: 'active'
      },
      select: {
        source: true
      },
      distinct: ['source']
    })

    // Filter out null/empty sources
    const sources = sourcesRaw.filter(s => s.source)

    // Get stats by source
    const allLeads = await prisma.emailSubscriber.findMany({
      where: {
        status: 'active'
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
      sources: sources.map(s => s.source!), // sources already filtered to exclude null
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
