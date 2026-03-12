import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { getCampaigns, getAccountInsights } from '@/lib/meta/client'
import { decryptToken } from '@/lib/gmail/encryption'

// GET /api/admin/meta?datePreset=last_30d
// Returns campaigns + insights for the admin's own Meta account
export async function GET(req: NextRequest) {
  const adminUser = await getAdminUser(req)
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Find the regular user account for this admin (by email)
  const user = await prisma.user.findUnique({
    where: { email: adminUser.email },
    select: { id: true },
  })

  if (!user) {
    return NextResponse.json({ error: 'User account not found for this admin' }, { status: 404 })
  }

  const integration = await prisma.metaIntegration.findUnique({
    where: { userId: user.id },
  })

  if (!integration || !integration.isActive) {
    return NextResponse.json({ connected: false }, { status: 200 })
  }

  const { searchParams } = new URL(req.url)
  const datePreset = searchParams.get('datePreset') || 'last_30d'

  try {
    const accessToken = decryptToken(integration.accessToken)

    const [campaigns, insights] = await Promise.all([
      getCampaigns(accessToken, integration.adAccountId, datePreset),
      getAccountInsights(accessToken, integration.adAccountId, datePreset),
    ])

    return NextResponse.json({
      connected: true,
      adAccountName: integration.adAccountName,
      lastSyncAt: integration.lastSyncAt,
      campaigns,
      insights: insights ?? null,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch Meta data'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
