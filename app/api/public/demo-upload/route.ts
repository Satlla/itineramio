import { NextRequest, NextResponse } from 'next/server'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { checkRateLimit, getRateLimitKey } from '../../../../src/lib/rate-limit'

export const maxDuration = 60
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  // Rate limit: 30 uploads per IP per 24h
  const isDev = process.env.NODE_ENV === 'development'
  const rateLimitKey = getRateLimitKey(request, null, 'demo-upload')
  const rateCheck = checkRateLimit(rateLimitKey, {
    maxRequests: isDev ? 200 : 30,
    windowMs: 24 * 60 * 60 * 1000,
  })
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: 'Has alcanzado el límite de uploads de demo. Vuelve mañana.' },
      { status: 429 }
    )
  }

  const contentType = request.headers.get('content-type') || ''

  // Client-side upload flow: browser uploads directly to Vercel Blob
  // This handles both token generation and upload-completed callbacks
  if (contentType.includes('application/json')) {
    try {
      const body = (await request.json()) as HandleUploadBody

      const jsonResponse = await handleUpload({
        body,
        request,
        onBeforeGenerateToken: async (pathname) => {
          const ext = pathname.split('.').pop()?.toLowerCase() ?? ''
          const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'webm', 'm4v', '3gp', 'avi']
          if (!allowedExts.includes(ext)) {
            throw new Error(`Tipo de archivo no permitido: .${ext}`)
          }
          return {
            allowedContentTypes: [
              'image/jpeg', 'image/png', 'image/gif', 'image/webp',
              'video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v',
              'video/3gpp', 'video/x-msvideo', 'application/octet-stream',
            ],
            maximumSizeInBytes: 500 * 1024 * 1024, // 500MB — raw iPhone MOV files
            addRandomSuffix: true,
          }
        },
        onUploadCompleted: async () => {
          // No-op — we don't need to save anything server-side for demo uploads
        },
      })

      return NextResponse.json(jsonResponse)
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Upload token error' },
        { status: 400 }
      )
    }
  }

  // Fallback: should not be reached with clientUpload=true, but kept for safety
  return NextResponse.json({ error: 'Use client-side upload' }, { status: 400 })
}
