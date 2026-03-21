import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { v4 as uuidv4 } from 'uuid'
import { verifyToken } from '../../../src/lib/auth'

// Route configuration
export const maxDuration = 30
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Check authentication using the same method as billing-info
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    let userId: string
    try {
      const authUser = verifyToken(token)
      userId = authUser.userId
    } catch (error) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Reject oversized requests early (before parsing the body)
    const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum 50MB.' }, { status: 413 })
    }

    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 })
    }

    // Validate file size (10MB max for payment proofs)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({
        error: 'Archivo demasiado grande. Máximo 10MB.',
        maxSize: '10MB',
        currentSize: `${(file.size / (1024 * 1024)).toFixed(1)}MB`
      }, { status: 413 })
    }

    // Validate file type (images and PDFs only)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        error: 'Tipo de archivo no permitido. Solo se permiten imágenes (JPG, PNG, GIF, WebP) y PDF.'
      }, { status: 400 })
    }

    // Generate unique filename with timestamp and user ID for organization
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const uniqueFilename = `payment-proof-${userId}-${timestamp}.${extension}`

    let fileUrl: string

    // For local development, use filesystem
    if (process.env.NODE_ENV === 'development') {
      const { writeFile, mkdir } = await import('fs/promises')
      const { join } = await import('path')

      try {
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'payment-proofs')

        // Create directory if it doesn't exist
        await mkdir(uploadDir, { recursive: true })

        const path = join(uploadDir, uniqueFilename)

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(path, buffer)

        fileUrl = `/uploads/payment-proofs/${uniqueFilename}`
      } catch (devError) {
        return NextResponse.json(
          {
            error: `Error al guardar el archivo: ${devError instanceof Error ? devError.message : 'Error desconocido'}`
          },
          { status: 500 }
        )
      }
    } else {
      // For production, use Vercel Blob
      const blobToken = process.env.BLOB_READ_WRITE_TOKEN
      if (!blobToken) {
        return NextResponse.json(
          { error: 'Almacenamiento no configurado' },
          { status: 500 }
        )
      }

      const blob = await put(uniqueFilename, file, {
        access: 'public',
        token: blobToken,
      })

      fileUrl = blob.url
    }

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: uniqueFilename
    })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Error al subir el archivo: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Error al subir el archivo' },
      { status: 500 }
    )
  }
}
