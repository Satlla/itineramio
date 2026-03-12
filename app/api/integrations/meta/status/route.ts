import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const integration = await prisma.metaIntegration.findUnique({
    where: { userId: user.userId },
    select: {
      id: true,
      adAccountId: true,
      adAccountName: true,
      pageId: true,
      pageName: true,
      tokenExpiresAt: true,
      isActive: true,
      lastSyncAt: true,
      createdAt: true,
    },
  })

  if (!integration) {
    return NextResponse.json({ connected: false })
  }

  const tokenExpired = integration.tokenExpiresAt
    ? integration.tokenExpiresAt < new Date()
    : false

  return NextResponse.json({
    connected: true,
    tokenExpired,
    ...integration,
  })
}
