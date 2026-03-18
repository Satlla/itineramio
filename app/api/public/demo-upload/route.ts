import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { v4 as uuidv4 } from 'uuid'
import { checkRateLimit, getRateLimitKey } from '../../../../src/lib/rate-limit'

export const maxDuration = 60
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 30 uploads per IP per 24h (generous for testing)
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

    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type — fall back to extension when browser sends empty/generic MIME type
    const validTypesPrefixes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v', 'video/mpeg',
      'video/3gpp', 'video/x-msvideo', 'video/ogg', 'application/octet-stream',
    ]
    const fileTypeBase = file.type.split(';')[0]
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'webm', 'avi', 'm4v', '3gp']
    const isValidType = validTypesPrefixes.some(t => fileTypeBase === t || file.type.startsWith(t)) || allowedExts.includes(ext)
    if (!isValidType) {
      return NextResponse.json({
        error: `Tipo de archivo no permitido: ${file.type}. Usa JPG, PNG, GIF, WebP, MP4, MOV o WebM.`,
      }, { status: 400 })
    }

    // Infer content type from extension if MIME type is missing/generic
    const extToMime: Record<string, string> = {
      mp4: 'video/mp4', mov: 'video/quicktime', webm: 'video/webm',
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
      gif: 'image/gif', webp: 'image/webp',
    }
    const effectiveContentType = (file.type && file.type !== 'application/octet-stream')
      ? file.type
      : (extToMime[ext] ?? 'application/octet-stream')

    // Validate file size (100MB max — iPhone videos can be large without FFmpeg compression on iOS)
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json({
        error: 'Archivo demasiado grande. Máximo 100MB. Intenta con un video más corto.',
      }, { status: 413 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const uniqueFilename = `demo/${uuidv4()}-${file.name}`

    let fileUrl: string

    if (process.env.NODE_ENV === 'development') {
      const { writeFile, mkdir } = await import('fs/promises')
      const { join } = await import('path')
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'demo')
      await mkdir(uploadDir, { recursive: true }).catch(() => {})
      const localFilename = `${uuidv4()}-${file.name}`
      const path = join(uploadDir, localFilename)
      await writeFile(path, buffer)
      fileUrl = `/uploads/demo/${localFilename}`
    } else {
      const blobToken = process.env.BLOB_READ_WRITE_TOKEN
      if (!blobToken) {
        return NextResponse.json({ error: 'Blob storage not configured' }, { status: 500 })
      }
      const blob = await put(uniqueFilename, buffer, {
        access: 'public',
        token: blobToken,
        contentType: effectiveContentType,
      })
      fileUrl = blob.url
    }

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: uniqueFilename,
    })
  } catch (error) {
    console.error('[demo-upload] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error uploading file' },
      { status: 500 }
    )
  }
}
