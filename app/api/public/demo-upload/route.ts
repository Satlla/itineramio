import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { v4 as uuidv4 } from 'uuid'
import { checkRateLimit, getRateLimitKey } from '../../../../src/lib/rate-limit'

export const maxDuration = 60
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 10 uploads per IP per 24h
    const rateLimitKey = getRateLimitKey(request, null, 'demo-upload')
    const rateCheck = checkRateLimit(rateLimitKey, {
      maxRequests: 10,
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

    // Validate file type
    const validTypesPrefixes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v', 'video/mpeg',
      'video/3gpp', 'video/x-msvideo', 'video/ogg'
    ]
    const fileTypeBase = file.type.split(';')[0]
    const isValidType = validTypesPrefixes.some(validType =>
      fileTypeBase === validType || file.type.startsWith(validType)
    )
    if (!isValidType) {
      return NextResponse.json({
        error: `Tipo de archivo no permitido: ${file.type}. Usa JPG, PNG, GIF, WebP, MP4, MOV o WebM.`,
      }, { status: 400 })
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({
        error: 'Archivo demasiado grande. Máximo 50MB.',
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
        contentType: file.type,
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
