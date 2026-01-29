import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminAuth } from '@/lib/admin-auth'

// DELETE - Remove a lead
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request)
    if (!authResult.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get('id')

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID required' }, { status: 400 })
    }

    // Delete the lead
    await prisma.lead.delete({
      where: { id: leadId }
    })

    return NextResponse.json({ success: true, message: 'Lead eliminado' })
  } catch (error) {
    console.error('Error deleting lead:', error)
    return NextResponse.json(
      { error: 'Error al eliminar lead', details: String(error) },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request)
    if (!authResult.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
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

    // Get leads with all fields
    const leads = await prisma.lead.findMany({
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
        propertyCount: true,
        createdAt: true
      }
    })

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
