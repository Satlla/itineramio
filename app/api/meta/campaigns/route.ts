import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCampaigns } from '@/lib/meta/client'
import { decryptToken } from '@/lib/gmail/encryption'

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const integration = await prisma.metaIntegration.findUnique({
    where: { userId: user.userId },
  })

  if (!integration || !integration.isActive) {
    return NextResponse.json({ error: 'Meta not connected' }, { status: 404 })
  }

  const { searchParams } = new URL(req.url)
  const datePreset = searchParams.get('datePreset') || 'last_30d'

  try {
    const accessToken = decryptToken(integration.accessToken)
    const campaigns = await getCampaigns(accessToken, integration.adAccountId, datePreset)

    await prisma.metaIntegration.update({
      where: { userId: user.userId },
      data: { lastSyncAt: new Date() },
    })

    return NextResponse.json({ data: campaigns })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch campaigns'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
