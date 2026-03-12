/**
 * Meta Marketing API Client
 * Handles OAuth2 and campaign/leads data fetching
 * Docs: https://developers.facebook.com/docs/marketing-api
 */

import crypto from 'crypto'

const META_API_VERSION = 'v21.0'
const META_GRAPH_URL = `https://graph.facebook.com/${META_API_VERSION}`
const META_OAUTH_URL = 'https://www.facebook.com/dialog/oauth'

// Scopes needed for Marketing API + Lead Ads
export const META_SCOPES = [
  'ads_read',
  'leads_retrieval',
  'pages_read_engagement',
  'pages_show_list',
].join(',')

// ─── CSRF state token ───────────────────────────────────────────────────────

export function generateStateToken(userId: string): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is required')
  const timestamp = Date.now()
  const random = crypto.randomBytes(16).toString('hex')
  const data = `${userId}:${timestamp}:${random}`
  const sig = crypto.createHmac('sha256', secret).update(data).digest('hex')
  return Buffer.from(`${data}:${sig}`).toString('base64url')
}

export function verifyStateToken(state: string): string | null {
  try {
    const secret = process.env.JWT_SECRET
    if (!secret) throw new Error('JWT_SECRET is required')
    const decoded = Buffer.from(state, 'base64url').toString()
    const parts = decoded.split(':')
    if (parts.length !== 4) return null
    const [userId, timestampStr, random, sig] = parts
    const data = `${userId}:${timestampStr}:${random}`
    const expected = crypto.createHmac('sha256', secret).update(data).digest('hex')
    if (sig !== expected) return null
    // Valid for 10 minutes
    if (Date.now() - parseInt(timestampStr) > 10 * 60 * 1000) return null
    return userId
  } catch {
    return null
  }
}

// ─── OAuth helpers ───────────────────────────────────────────────────────────

function getCallbackUrl(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${base}/api/integrations/meta/callback`
}

export function getMetaAuthUrl(userId: string): string {
  const appId = process.env.META_APP_ID
  if (!appId) throw new Error('META_APP_ID is not configured')
  const state = generateStateToken(userId)
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: getCallbackUrl(),
    scope: META_SCOPES,
    response_type: 'code',
    state,
  })
  return `${META_OAUTH_URL}?${params.toString()}`
}

export async function exchangeCodeForToken(code: string): Promise<{
  access_token: string
  token_type: string
  expires_in?: number
}> {
  const appId = process.env.META_APP_ID
  const appSecret = process.env.META_APP_SECRET
  if (!appId || !appSecret) throw new Error('META_APP_ID and META_APP_SECRET are required')

  const params = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    redirect_uri: getCallbackUrl(),
    code,
  })

  const res = await fetch(`${META_GRAPH_URL}/oauth/access_token?${params.toString()}`)
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message || 'Failed to exchange Meta code for token')
  }
  return res.json()
}

export async function getLongLivedToken(shortLivedToken: string): Promise<{
  access_token: string
  token_type: string
  expires_in: number
}> {
  const appId = process.env.META_APP_ID
  const appSecret = process.env.META_APP_SECRET
  if (!appId || !appSecret) throw new Error('META_APP_ID and META_APP_SECRET are required')

  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: shortLivedToken,
  })

  const res = await fetch(`${META_GRAPH_URL}/oauth/access_token?${params.toString()}`)
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message || 'Failed to get long-lived token')
  }
  return res.json()
}

// ─── Meta API fetchers ───────────────────────────────────────────────────────

export async function getAdAccounts(accessToken: string): Promise<Array<{
  id: string
  name: string
  account_status: number
  currency: string
}>> {
  const fields = 'id,name,account_status,currency'
  const res = await fetch(
    `${META_GRAPH_URL}/me/adaccounts?fields=${fields}&access_token=${accessToken}`
  )
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message || 'Failed to fetch ad accounts')
  }
  const data = await res.json()
  return data.data || []
}

export interface MetaCampaign {
  id: string
  name: string
  status: string
  objective: string
  created_time: string
  insights?: {
    data: Array<{
      spend: string
      clicks: string
      impressions: string
      ctr: string
      cpc: string
      reach: string
      leads: string
      date_start: string
      date_stop: string
    }>
  }
}

export async function getCampaigns(
  accessToken: string,
  adAccountId: string,
  datePreset = 'last_30d'
): Promise<MetaCampaign[]> {
  const insightFields = 'spend,clicks,impressions,ctr,cpc,reach,leads'
  const fields = `id,name,status,objective,created_time,insights.date_preset(${datePreset}){${insightFields}}`

  const res = await fetch(
    `${META_GRAPH_URL}/${adAccountId}/campaigns?fields=${encodeURIComponent(fields)}&access_token=${accessToken}`
  )
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message || 'Failed to fetch campaigns')
  }
  const data = await res.json()
  return data.data || []
}

export interface MetaLead {
  id: string
  created_time: string
  field_data: Array<{ name: string; values: string[] }>
  ad_id: string
  ad_name: string
  campaign_id: string
  campaign_name: string
}

export async function getLeadsFromForm(
  accessToken: string,
  formId: string,
  limit = 50
): Promise<MetaLead[]> {
  const fields = 'id,created_time,field_data,ad_id,ad_name,campaign_id,campaign_name'
  const res = await fetch(
    `${META_GRAPH_URL}/${formId}/leads?fields=${fields}&limit=${limit}&access_token=${accessToken}`
  )
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message || 'Failed to fetch leads')
  }
  const data = await res.json()
  return data.data || []
}

export async function getLeadForms(
  accessToken: string,
  pageId: string
): Promise<Array<{ id: string; name: string; status: string; leads_count: number }>> {
  const fields = 'id,name,status,leads_count'
  const res = await fetch(
    `${META_GRAPH_URL}/${pageId}/leadgen_forms?fields=${fields}&access_token=${accessToken}`
  )
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message || 'Failed to fetch lead forms')
  }
  const data = await res.json()
  return data.data || []
}

export async function getAccountInsights(
  accessToken: string,
  adAccountId: string,
  datePreset = 'last_30d'
): Promise<{
  spend: string
  clicks: string
  impressions: string
  ctr: string
  cpc: string
  reach: string
  leads: string
}> {
  const fields = 'spend,clicks,impressions,ctr,cpc,reach,leads'
  const res = await fetch(
    `${META_GRAPH_URL}/${adAccountId}/insights?fields=${encodeURIComponent(fields)}&date_preset=${datePreset}&access_token=${accessToken}`
  )
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message || 'Failed to fetch account insights')
  }
  const data = await res.json()
  return data.data?.[0] || {}
}

export async function getPages(
  accessToken: string
): Promise<Array<{ id: string; name: string; category: string }>> {
  const fields = 'id,name,category'
  const res = await fetch(
    `${META_GRAPH_URL}/me/accounts?fields=${fields}&access_token=${accessToken}`
  )
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message || 'Failed to fetch pages')
  }
  const data = await res.json()
  return data.data || []
}
