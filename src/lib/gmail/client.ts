/**
 * Gmail API Client
 * Handles OAuth2 authentication and email fetching
 */

import { google } from 'googleapis'
import crypto from 'crypto'

// Gmail API scopes needed
export const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
]

/**
 * Generate a secure state token for CSRF protection
 */
export function generateStateToken(userId: string): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required')
  }
  const timestamp = Date.now()
  const randomBytes = crypto.randomBytes(16).toString('hex')
  const data = `${userId}:${timestamp}:${randomBytes}`
  const signature = crypto
    .createHmac('sha256', process.env.JWT_SECRET)
    .update(data)
    .digest('hex')
  return Buffer.from(`${data}:${signature}`).toString('base64url')
}

/**
 * Verify state token (CSRF protection)
 * Returns userId if valid, null if invalid
 */
export function verifyStateToken(state: string): string | null {
  try {
    const decoded = Buffer.from(state, 'base64url').toString()
    const parts = decoded.split(':')
    if (parts.length !== 4) return null

    const [userId, timestampStr, randomBytes, signature] = parts
    const data = `${userId}:${timestampStr}:${randomBytes}`

    // Verify signature
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is required')
    }
    const expectedSignature = crypto
      .createHmac('sha256', process.env.JWT_SECRET)
      .update(data)
      .digest('hex')

    if (signature !== expectedSignature) return null

    // Check timestamp (valid for 10 minutes)
    const timestamp = parseInt(timestampStr)
    if (Date.now() - timestamp > 10 * 60 * 1000) return null

    return userId
  } catch {
    return null
  }
}

/**
 * Get OAuth2 client
 */
export function getOAuth2Client(requestUrl?: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  // Detect if we're in localhost from the request URL
  let baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  if (requestUrl && requestUrl.includes('localhost')) {
    baseUrl = 'http://localhost:3000'
  }

  const redirectUri = `${baseUrl}/api/integrations/gmail/callback`

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials not configured')
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri)
}

/**
 * Generate OAuth authorization URL with CSRF protection
 */
export function getAuthUrl(userId: string, requestUrl?: string): string {
  const oauth2Client = getOAuth2Client(requestUrl)
  const state = generateStateToken(userId)

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: GMAIL_SCOPES,
    prompt: 'consent', // Force consent to get refresh token
    state, // CSRF protection
  })
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code: string, requestUrl?: string) {
  const oauth2Client = getOAuth2Client(requestUrl)
  const { tokens } = await oauth2Client.getToken(code)
  return tokens
}

/**
 * Get authenticated Gmail client
 */
export function getGmailClient(accessToken: string, refreshToken: string) {
  const oauth2Client = getOAuth2Client()
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  })

  return google.gmail({ version: 'v1', auth: oauth2Client })
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken: string) {
  const oauth2Client = getOAuth2Client()
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  })

  const { credentials } = await oauth2Client.refreshAccessToken()
  return credentials
}

/**
 * Get user email from Gmail profile
 */
export async function getGmailUserEmail(accessToken: string, refreshToken: string): Promise<string> {
  const gmail = getGmailClient(accessToken, refreshToken)
  const profile = await gmail.users.getProfile({ userId: 'me' })
  return profile.data.emailAddress || ''
}

/**
 * Search for Airbnb emails
 */
export async function searchAirbnbEmails(
  accessToken: string,
  refreshToken: string,
  afterDate?: Date,
  maxResults = 50
) {
  const gmail = getGmailClient(accessToken, refreshToken)

  // Build search query for Airbnb emails
  let query = 'from:(airbnb.com OR automated@airbnb.com OR express@airbnb.com OR noreply@airbnb.com)'

  // Filter by date if provided
  if (afterDate) {
    const dateStr = afterDate.toISOString().split('T')[0].replace(/-/g, '/')
    query += ` after:${dateStr}`
  }

  // Search for reservation, payout and financial emails
  // Expanded to capture payout emails which have different subjects
  query += ' (subject:("reserva" OR "reservation" OR "pago" OR "payout" OR "confirmada" OR "confirmed" OR "enviado" OR "paid" OR "earnings" OR "ganancias" OR "transferencia" OR "recibido" OR "received"))'

  const response = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults,
  })

  return response.data.messages || []
}

/**
 * Get full email message
 */
export async function getEmailMessage(
  accessToken: string,
  refreshToken: string,
  messageId: string
) {
  const gmail = getGmailClient(accessToken, refreshToken)

  const response = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'full',
  })

  return response.data
}

/**
 * Parse email headers
 */
export function parseEmailHeaders(headers: Array<{ name?: string; value?: string }>) {
  const result: Record<string, string> = {}

  for (const header of headers) {
    if (header.name && header.value) {
      result[header.name.toLowerCase()] = header.value
    }
  }

  return result
}

/**
 * Decode base64 email body
 */
export function decodeEmailBody(body: string): string {
  // Gmail uses URL-safe base64
  const base64 = body.replace(/-/g, '+').replace(/_/g, '/')
  return Buffer.from(base64, 'base64').toString('utf-8')
}

/**
 * Strip HTML tags and clean up text
 */
function stripHtml(html: string): string {
  return html
    // Replace common block elements with newlines
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<\/td>/gi, ' ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    // Remove all other HTML tags
    .replace(/<[^>]+>/g, '')
    // Decode HTML entities
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&euro;/gi, '€')
    // Clean up whitespace
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim()
}

/**
 * Get email body text (handles multipart)
 */
export function getEmailBodyText(payload: any): string {
  let text = ''
  let html = ''

  // Simple text body
  if (payload.body?.data) {
    const decoded = decodeEmailBody(payload.body.data)
    if (payload.mimeType === 'text/html') {
      html = decoded
    } else {
      text = decoded
    }
  }

  // Multipart - look for text/plain and text/html
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        text = decodeEmailBody(part.body.data)
      }
      if (part.mimeType === 'text/html' && part.body?.data) {
        html = decodeEmailBody(part.body.data)
      }
      // Check nested parts (multipart/alternative, etc.)
      if (part.parts) {
        const nested = getEmailBodyText(part)
        if (nested) {
          if (!text) text = nested
        }
      }
    }
  }

  // Prefer plain text, but use HTML if no plain text available
  if (text) {
    return text
  }

  if (html) {
    return stripHtml(html)
  }

  return ''
}
