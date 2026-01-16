import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }

    // Get leads from funnel forms (source starts with 'funnel-')
    const leads = await prisma.lead.findMany({
      where: {
        source: {
          startsWith: 'funnel-'
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 200
    })

    return NextResponse.json({ leads })
  } catch (error) {
    console.error('Error fetching qualified leads:', error)
    return NextResponse.json({ error: 'Error fetching leads' }, { status: 500 })
  }
}
