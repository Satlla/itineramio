import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminAuth } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  // Verify admin authentication
  const authResult = await verifyAdminAuth(request)
  if (!authResult.isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const theme = searchParams.get('theme') || ''

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (theme) {
      where.funnelTheme = theme
    }

    // Try to get leads with funnel fields, fallback to basic fields
    let leads
    try {
      leads = await prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: {
          id: true,
          email: true,
          name: true,
          source: true,
          funnelTheme: true,
          funnelStartedAt: true,
          funnelCurrentDay: true,
          createdAt: true
        }
      })
    } catch {
      // Fallback if funnel fields don't exist yet
      const basicLeads = await prisma.lead.findMany({
        where: search ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { name: { contains: search, mode: 'insensitive' } }
          ]
        } : {},
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: {
          id: true,
          email: true,
          name: true,
          source: true,
          createdAt: true
        }
      })
      leads = basicLeads.map(lead => ({
        ...lead,
        funnelTheme: null,
        funnelStartedAt: null,
        funnelCurrentDay: null
      }))
    }

    return NextResponse.json({
      success: true,
      leads
    })
  } catch (error) {
    console.error('Error fetching funnel leads:', error)
    return NextResponse.json(
      { error: 'Error fetching leads', details: String(error) },
      { status: 500 }
    )
  }
}
