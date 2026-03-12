import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getLeadForms, getLeadsFromForm } from '@/lib/meta/client'
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

  if (!integration.pageId) {
    return NextResponse.json({ error: 'No page connected' }, { status: 400 })
  }

  try {
    const accessToken = decryptToken(integration.accessToken)

    // Get lead forms from the page
    const forms = await getLeadForms(accessToken, integration.pageId)

    // Fetch leads from each form (limit to first 3 forms to avoid rate limits)
    const leadsPerForm = await Promise.all(
      forms.slice(0, 3).map(async (form) => {
        const leads = await getLeadsFromForm(accessToken, form.id)
        return { form, leads }
      })
    )

    return NextResponse.json({ data: leadsPerForm })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch leads'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
