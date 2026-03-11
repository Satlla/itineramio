import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { v4 as uuidv4 } from 'uuid'
import { createHash } from 'crypto'
import { prisma } from '../../../src/lib/prisma'
import { verifyToken } from '../../../src/lib/auth'
import { getAdminUser } from '../../../src/lib/admin-auth'

// Helper function to safely extract text from multilingual objects
function getTextSafely(value: any, fallback: string = '') {
  if (typeof value === 'string') {
    return value
  }
  if (value && typeof value === 'object') {
    return value.es || value.en || value.fr || fallback
  }
  return fallback
}

// Function to get media usage information
async function getMediaUsage(mediaUrl: string) {
  try {
    // Search for steps that use this media URL
    const steps = await prisma.step.findMany({
      where: {
        content: {
          path: ['mediaUrl'],
          equals: mediaUrl
        }
      },
      include: {
        zones: {
          include: {
            property: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    return steps.map(step => ({
      propertyId: step.zones.property?.id || '',
      propertyName: getTextSafely(step.zones.property?.name, 'Propiedad'),
      zoneId: step.zones.id,
      zoneName: getTextSafely(step.zones.name, 'Zona'),
      stepId: step.id
    }))
  } catch (error) {
    console.error('Error getting media usage:', error)
    return []
  }
}

// Route configuration for large file uploads
export const maxDuration = 60 // 60 seconds timeout for mobile uploads
export const dynamic = 'force-dynamic' // Ensure dynamic rendering
export const runtime = 'nodejs' // Use Node.js runtime

export async function POST(request: NextRequest) {
  try {
    // Check authentication — accept either regular user token or admin token
    const token = request.cookies.get('auth-token')?.value
    const adminUser = await getAdminUser(request)

    let userId: string | null = null
    if (token) {
      try {
        const decoded = verifyToken(token)
        userId = decoded.userId
      } catch {
        // invalid token, try admin below
      }
    }

    if (!userId && !adminUser) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File
    const skipDuplicateCheck = data.get('skipDuplicateCheck') === 'true'

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type (check if starts with valid type to handle codec suffixes like video/webm;codecs=vp9)
    const validTypesPrefixes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v', 'video/mpeg',
      'video/3gpp', 'video/x-msvideo', 'video/ogg'
    ]
    const fileTypeBase = file.type.split(';')[0] // Remove codec suffix if present
    const isValidType = validTypesPrefixes.some(validType =>
      fileTypeBase === validType || file.type.startsWith(validType)
    )
    if (!isValidType) {
      return NextResponse.json({
        error: `Tipo de archivo no permitido: ${file.type}. Usa JPG, PNG, GIF, WebP, MP4, MOV o WebM.`,
        receivedType: file.type
      }, { status: 400 })
    }

    // Validate file size (50MB max - increased for video uploads)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({
        error: "Archivo demasiado grande. Máximo 50MB. Intenta comprimir el video o usar menor calidad.",
        maxSize: "50MB",
        currentSize: `${(file.size / (1024 * 1024)).toFixed(1)}MB`
      }, { status: 413 })
    }

    // Generate file hash for duplicate detection with better memory handling
    let bytes: ArrayBuffer
    let buffer: Buffer
    let fileHash: string

    try {
      bytes = await file.arrayBuffer()
      buffer = Buffer.from(bytes)
      fileHash = createHash('sha256').update(buffer).digest('hex')
    } catch (hashError) {
      console.error('❌ Error generating file hash:', hashError)
      return NextResponse.json({
        error: `Error procesando archivo: ${hashError instanceof Error ? hashError.message : 'Error desconocido'}. Intenta con una imagen más pequeña.`,
      }, { status: 500 })
    }

    // Check for duplicates unless explicitly skipped (skip for admin uploads)
    if (!skipDuplicateCheck && userId) {
      const existingMedia = await prisma.mediaLibrary.findFirst({
        where: {
          userId: userId,
          hash: fileHash
        },
        include: {
          user: {
            select: { name: true }
          }
        }
      })

      if (existingMedia) {
        // Get usage information for this media
        const usageInfo = await getMediaUsage(existingMedia.url)
        
        return NextResponse.json({
          duplicate: true,
          existingMedia: {
            id: existingMedia.id,
            url: existingMedia.url,
            thumbnailUrl: existingMedia.thumbnailUrl,
            filename: existingMedia.filename,
            originalName: existingMedia.originalName,
            type: existingMedia.type,
            size: existingMedia.size,
            createdAt: existingMedia.createdAt,
            usageCount: existingMedia.usageCount,
            usageInfo: usageInfo
          },
          message: "Este archivo ya existe en tu biblioteca de medios. ¿Quieres usar el archivo existente o subir una nueva copia?"
        })
      }
    }

    // Generate unique filename
    const uniqueFilename = `${uuidv4()}-${file.name}`

    let fileUrl: string

    // For local development, use filesystem with better error handling
    if (process.env.NODE_ENV === 'development') {
      const { writeFile, mkdir } = await import('fs/promises')
      const { join } = await import('path')
      
      try {
        const uploadDir = join(process.cwd(), 'public', 'uploads')

        try {
          await mkdir(uploadDir, { recursive: true })
        } catch (error) {
          // directory might already exist
        }

        const path = join(uploadDir, uniqueFilename)

        await writeFile(path, buffer)

        fileUrl = `/uploads/${uniqueFilename}`
      } catch (devError) {
        console.error('❌ Development upload error:', devError)
        return NextResponse.json(
          { error: `Development upload failed: ${devError instanceof Error ? devError.message : 'Unknown error'}` },
          { status: 500 }
        )
      }
    } else {
      // For production, use Vercel Blob
      const blobToken = process.env.BLOB_READ_WRITE_TOKEN
      if (!blobToken) {
        return NextResponse.json(
          { error: "Blob storage not configured" },
          { status: 500 }
        )
      }

      try {
        // Use buffer instead of file since file might be consumed after arrayBuffer()
        const blob = await put(uniqueFilename, buffer, {
          access: 'public',
          token: blobToken,
          contentType: file.type,
        })
        fileUrl = blob.url
      } catch (blobError) {
        console.error('❌ Error uploading to Vercel Blob:', blobError)
        return NextResponse.json(
          {
            error: `Error al subir archivo: ${blobError instanceof Error ? blobError.message : 'Error desconocido'}. Intenta nuevamente o usa una imagen más pequeña.`,
            details: blobError instanceof Error ? blobError.message : undefined
          },
          { status: 500 }
        )
      }
    }

    // Save to media library with hash - check for existing first (skip for admin uploads)
    if (userId) {
      try {
        const mediaType = file.type.startsWith('image/') ? 'image' : 'video'

        // Check if an item with this hash already exists
        const existingMediaByHash = await prisma.mediaLibrary.findFirst({
          where: {
            userId: userId,
            hash: fileHash
          }
        })

        if (existingMediaByHash) {
          await prisma.mediaLibrary.update({
            where: { id: existingMediaByHash.id },
            data: {
              usageCount: { increment: 1 },
              lastUsedAt: new Date()
            }
          })
        } else {
          const cleanOriginalName = file.name.replace(/_compressed(\.[^.]+)$/, '$1')
          await prisma.mediaLibrary.create({
            data: {
              userId: userId,
              type: mediaType,
              url: fileUrl,
              filename: uniqueFilename,
              originalName: cleanOriginalName,
              mimeType: file.type,
              size: file.size,
              hash: fileHash,
              usageCount: 1,
              isPublic: false,
              lastUsedAt: new Date()
            }
          })
        }
      } catch (mediaError) {
        console.error('⚠️ Error saving to media library:', mediaError)
        // Continue anyway, the file was uploaded successfully
      }
    }

    return NextResponse.json({ 
      success: true,
      url: fileUrl,
      filename: uniqueFilename,
      hash: fileHash
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Upload failed: ${error.message}` },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: "Error uploading file" },
      { status: 500 }
    )
  }
}