import { NextRequest, NextResponse } from 'next/server'
import { put, del } from '@vercel/blob'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export const maxDuration = 30
export const dynamic = 'force-dynamic'

/**
 * POST /api/manager-profile/logo
 * Subir logo de la empresa gestora
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó archivo' },
        { status: 400 }
      )
    }

    // Validate file size (2MB max for logos)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'El logo no puede superar 2MB' },
        { status: 413 }
      )
    }

    // Validate file type (images only)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Solo se permiten imágenes (JPG, PNG, GIF, WebP, SVG)' },
        { status: 400 }
      )
    }

    // Get current config to delete old logo if exists
    const currentConfig = await prisma.userInvoiceConfig.findUnique({
      where: { userId },
      select: { logoUrl: true }
    })

    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop() || 'png'
    const uniqueFilename = `logos/manager-${userId}-${timestamp}.${extension}`

    let fileUrl: string

    // For local development, use filesystem
    if (process.env.NODE_ENV === 'development') {
      const { writeFile, mkdir } = await import('fs/promises')
      const { join } = await import('path')

      const uploadDir = join(process.cwd(), 'public', 'uploads', 'logos')
      await mkdir(uploadDir, { recursive: true })

      const localFilename = `manager-${userId}-${timestamp}.${extension}`
      const path = join(uploadDir, localFilename)

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(path, buffer)

      fileUrl = `/uploads/logos/${localFilename}`
    } else {
      // For production, use Vercel Blob
      const blobToken = process.env.BLOB_READ_WRITE_TOKEN
      if (!blobToken) {
        return NextResponse.json(
          { error: 'Almacenamiento no configurado' },
          { status: 500 }
        )
      }

      // Delete old logo from blob if exists
      if (currentConfig?.logoUrl && currentConfig.logoUrl.includes('blob.vercel-storage.com')) {
        try {
          await del(currentConfig.logoUrl, { token: blobToken })
        } catch (e) {
          console.error('Error deleting old logo:', e)
        }
      }

      const blob = await put(uniqueFilename, file, {
        access: 'public',
        token: blobToken,
      })

      fileUrl = blob.url
    }

    // Update profile with new logo URL
    const config = await prisma.userInvoiceConfig.upsert({
      where: { userId },
      update: { logoUrl: fileUrl },
      create: {
        userId,
        businessName: '',
        nif: '',
        address: '',
        city: '',
        postalCode: '',
        logoUrl: fileUrl
      }
    })

    return NextResponse.json({
      success: true,
      logoUrl: fileUrl,
      profile: config
    })
  } catch (error) {
    console.error('Error uploading logo:', error)
    return NextResponse.json(
      { error: 'Error al subir el logo' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/manager-profile/logo
 * Eliminar logo de la empresa gestora
 */
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const config = await prisma.userInvoiceConfig.findUnique({
      where: { userId },
      select: { logoUrl: true }
    })

    if (config?.logoUrl) {
      // Delete from Vercel Blob if it's a blob URL
      if (config.logoUrl.includes('blob.vercel-storage.com')) {
        const blobToken = process.env.BLOB_READ_WRITE_TOKEN
        if (blobToken) {
          try {
            await del(config.logoUrl, { token: blobToken })
          } catch (e) {
            console.error('Error deleting logo from blob:', e)
          }
        }
      }

      // Update profile to remove logo URL
      await prisma.userInvoiceConfig.update({
        where: { userId },
        data: { logoUrl: null }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Logo eliminado'
    })
  } catch (error) {
    console.error('Error deleting logo:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el logo' },
      { status: 500 }
    )
  }
}
