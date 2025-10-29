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
    console.log('📤 Upload-simple endpoint called')

    // Check authentication using the same method as billing-info
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      console.error('❌ No auth token found')
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    let userId: string
    try {
      const authUser = verifyToken(token)
      userId = authUser.userId
      console.log('✅ User authenticated:', userId)
    } catch (error) {
      console.error('❌ Token verification failed:', error)
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      console.error('❌ No file in request')
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 })
    }

    console.log(`📁 File: ${file.name}, size: ${file.size}, type: ${file.type}`)

    // Validate file size (10MB max for payment proofs)
    if (file.size > 10 * 1024 * 1024) {
      console.error('❌ File too large:', file.size)
      return NextResponse.json({
        error: 'Archivo demasiado grande. Máximo 10MB.',
        maxSize: '10MB',
        currentSize: `${(file.size / (1024 * 1024)).toFixed(1)}MB`
      }, { status: 413 })
    }

    // Validate file type (images and PDFs only)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      console.error('❌ Invalid file type:', file.type)
      return NextResponse.json({
        error: 'Tipo de archivo no permitido. Solo se permiten imágenes (JPG, PNG, GIF, WebP) y PDF.'
      }, { status: 400 })
    }

    // Generate unique filename with timestamp and user ID for organization
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const uniqueFilename = `payment-proof-${userId}-${timestamp}.${extension}`
    console.log('📝 Generated filename:', uniqueFilename)

    let fileUrl: string

    // For local development, use filesystem
    if (process.env.NODE_ENV === 'development') {
      console.log('💻 Development mode: saving to filesystem')
      const { writeFile, mkdir } = await import('fs/promises')
      const { join } = await import('path')

      try {
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'payment-proofs')

        console.log('📂 Upload directory:', uploadDir)

        // Create directory if it doesn't exist
        await mkdir(uploadDir, { recursive: true })
        console.log('✅ Directory created/verified')

        const path = join(uploadDir, uniqueFilename)
        console.log('💾 Writing file to:', path)

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(path, buffer)

        console.log('✅ File written successfully')

        fileUrl = `/uploads/payment-proofs/${uniqueFilename}`
      } catch (devError) {
        console.error('❌ Development upload error:', devError)
        return NextResponse.json(
          {
            error: `Error al guardar el archivo: ${devError instanceof Error ? devError.message : 'Error desconocido'}`
          },
          { status: 500 }
        )
      }
    } else {
      // For production, use Vercel Blob
      console.log('☁️ Production mode: uploading to Vercel Blob')

      const blobToken = process.env.BLOB_READ_WRITE_TOKEN
      if (!blobToken) {
        console.error('❌ BLOB_READ_WRITE_TOKEN not configured')
        return NextResponse.json(
          { error: 'Almacenamiento no configurado' },
          { status: 500 }
        )
      }

      console.log('✅ Blob token found, uploading...')

      const blob = await put(uniqueFilename, file, {
        access: 'public',
        token: blobToken,
      })

      fileUrl = blob.url
      console.log('✅ File uploaded to Blob:', fileUrl)
    }

    console.log('✅ Upload successful:', fileUrl)

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: uniqueFilename
    })
  } catch (error) {
    console.error('❌ Error uploading file:', error)

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
