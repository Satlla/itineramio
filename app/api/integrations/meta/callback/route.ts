import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  verifyStateToken,
  exchangeCodeForToken,
  getLongLivedToken,
  getAdAccounts,
  getPages,
} from '@/lib/meta/client'
import { encryptToken } from '@/lib/gmail/encryption'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${APP_URL}/gestion/integraciones?meta_error=${encodeURIComponent(error)}`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${APP_URL}/gestion/integraciones?meta_error=missing_params`)
  }

  // Verify CSRF state
  const userId = verifyStateToken(state)
  if (!userId) {
    return NextResponse.redirect(`${APP_URL}/gestion/integraciones?meta_error=invalid_state`)
  }

  try {
    // Exchange code for short-lived token
    const { access_token: shortToken } = await exchangeCodeForToken(code)

    // Exchange for long-lived token (60 days)
    const { access_token: longToken, expires_in } = await getLongLivedToken(shortToken)

    // Get ad accounts
    const adAccounts = await getAdAccounts(longToken)
    if (!adAccounts.length) {
      return NextResponse.redirect(`${APP_URL}/gestion/integraciones?meta_error=no_ad_accounts`)
    }

    // Use first active ad account
    const adAccount = adAccounts.find(a => a.account_status === 1) || adAccounts[0]

    // Get pages (optional)
    let pageId: string | undefined
    let pageName: string | undefined
    try {
      const pages = await getPages(longToken)
      if (pages.length > 0) {
        pageId = pages[0].id
        pageName = pages[0].name
      }
    } catch {
      // Pages are optional
    }

    const tokenExpiresAt = new Date(Date.now() + expires_in * 1000)
    const encryptedToken = encryptToken(longToken)

    await prisma.metaIntegration.upsert({
      where: { userId },
      create: {
        userId,
        accessToken: encryptedToken,
        adAccountId: adAccount.id,
        adAccountName: adAccount.name,
        pageId,
        pageName,
        tokenExpiresAt,
        isActive: true,
      },
      update: {
        accessToken: encryptedToken,
        adAccountId: adAccount.id,
        adAccountName: adAccount.name,
        pageId,
        pageName,
        tokenExpiresAt,
        isActive: true,
      },
    })

    return NextResponse.redirect(`${APP_URL}/meta?connected=1`)
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.redirect(`${APP_URL}/gestion/integraciones?meta_error=${encodeURIComponent(msg)}`)
  }
}
