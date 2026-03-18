import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { v4 as uuidv4 } from 'uuid'
import { checkRateLimit, getRateLimitKey } from '../../../../src/lib/rate-limit'

export const maxDuration = 60
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const isDev = process.env.NODE_ENV === 'development'
  const contentType = request.headers.get('content-type') || ''

  // Rate limit — skip for Vercel's own blob.upload-completed callbacks (they carry x-vercel-signature).
  // If the callback is rate-limited Vercel never ACKs the upload and the browser hangs indefinitely.
  const isVercelCallback = !!request.headers.get('x-vercel-signature')
  if (!isVercelCallback) {
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
  }

  // ── Client-side upload (videos): browser → Vercel Blob directly ──
  // Handles token generation (browser → us) + upload-completed callback (Vercel → us)
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
            maximumSizeInBytes: 500 * 1024 * 1024,
            addRandomSuffix: true,
          }
        },
        onUploadCompleted: async () => {},
      })

      return NextResponse.json(jsonResponse)
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Upload token error' },
        { status: 400 }
      )
    }
  }

  // ── Direct upload (images via ImageUpload component): multipart/form-data ──
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp']
    if (!allowedExts.includes(ext)) {
      return NextResponse.json({ error: 'Solo imágenes permitidas en carga directa.' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Imagen demasiado grande. Máximo 10MB.' }, { status: 413 })
    }

    const extToMime: Record<string, string> = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
      gif: 'image/gif', webp: 'image/webp',
    }
    const contentTypeMime = extToMime[ext] ?? 'image/jpeg'
    const uniqueFilename = `demo/${uuidv4()}-${file.name}`

    if (isDev) {
      const { writeFile, mkdir } = await import('fs/promises')
      const { join } = await import('path')
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'demo')
      await mkdir(uploadDir, { recursive: true }).catch(() => {})
      const localFilename = `${uuidv4()}-${file.name}`
      const path = join(uploadDir, localFilename)
      await writeFile(path, Buffer.from(await file.arrayBuffer()))
      return NextResponse.json({ success: true, url: `/uploads/demo/${localFilename}` })
    }

    const blobToken = process.env.BLOB_READ_WRITE_TOKEN
    if (!blobToken) {
      return NextResponse.json({ error: 'Blob storage not configured' }, { status: 500 })
    }

    const blob = await put(uniqueFilename, file, {
      access: 'public',
      token: blobToken,
      contentType: contentTypeMime,
    })

    return NextResponse.json({ success: true, url: blob.url })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error uploading file' },
      { status: 500 }
    )
  }
}
