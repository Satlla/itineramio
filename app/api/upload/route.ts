import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { v4 as uuidv4 } from 'uuid'
import { createHash } from 'crypto'
import { prisma } from '../../../src/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = 'itineramio-secret-key-2024'

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
      propertyName: step.zones.property?.name || 'Propiedad',
      zoneId: step.zones.id,
      zoneName: step.zones.name,
      stepId: step.id
    }))
  } catch (error) {
    console.error('Error getting media usage:', error)
    return []
  }
}

// Route configuration for large file uploads
export const maxDuration = 30 // 30 seconds timeout
export const dynamic = 'force-dynamic' // Ensure dynamic rendering
export const runtime = 'nodejs' // Use Node.js runtime

export async function POST(request: NextRequest) {
  try {
    console.log('🔥 Upload endpoint called')
    
    // Check authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    let userId: string
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
      userId = decoded.userId
    } catch (error) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }
    
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File
    const skipDuplicateCheck = data.get('skipDuplicateCheck') === 'true'

    if (!file) {
      console.log('❌ No file provided')
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log(`📁 File details: ${file.name}, size: ${file.size}, type: ${file.type}`)

    // Validate file size (50MB max - increased for video uploads)
    if (file.size > 50 * 1024 * 1024) {
      console.log('❌ File too large:', file.size)
      return NextResponse.json({ 
        error: "Archivo demasiado grande. Máximo 50MB. Intenta comprimir el video o usar menor calidad.", 
        maxSize: "50MB",
        currentSize: `${(file.size / (1024 * 1024)).toFixed(1)}MB`
      }, { status: 413 })
    }

    // Generate file hash for duplicate detection
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileHash = createHash('sha256').update(buffer).digest('hex')
    
    console.log(`🔍 Generated file hash: ${fileHash}`)

    // Check for duplicates unless explicitly skipped
    if (!skipDuplicateCheck) {
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
        console.log('🔄 Duplicate file detected:', existingMedia.originalName)
        
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
    console.log('📝 Generated filename:', uniqueFilename)

    let fileUrl: string
    
    // For local development, use filesystem with better error handling
    if (process.env.NODE_ENV === 'development') {
      console.log('💻 Development mode: saving to filesystem')
      const { writeFile, mkdir } = await import('fs/promises')
      const { join } = await import('path')
      
      try {
        const uploadDir = join(process.cwd(), 'public', 'uploads')
        
        console.log('📂 Upload directory:', uploadDir)
        
        try {
          await mkdir(uploadDir, { recursive: true })
          console.log('✅ Directory created/verified')
        } catch (error) {
          console.log('⚠️ Directory creation error (might already exist):', error)
        }

        const path = join(uploadDir, uniqueFilename)
        console.log('💾 Writing file to:', path)
        
        await writeFile(path, buffer)
        console.log('✅ File written successfully')
        
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
      console.log('🔧 Checking Vercel Blob configuration...')
      const blobToken = process.env.BLOB_READ_WRITE_TOKEN
      if (!blobToken) {
        console.error('❌ BLOB_READ_WRITE_TOKEN environment variable is not set')
        return NextResponse.json(
          { error: "Blob storage not configured" },
          { status: 500 }
        )
      }
      console.log('✅ Blob token found, proceeding with upload')

      const blob = await put(uniqueFilename, file, {
        access: 'public',
        token: blobToken,
      })
      
      fileUrl = blob.url
    }

    // Save to media library with hash
    try {
      const mediaType = file.type.startsWith('image/') ? 'image' : 'video'
      
      const mediaLibraryItem = await prisma.mediaLibrary.create({
        data: {
          userId: userId,
          type: mediaType,
          url: fileUrl,
          filename: uniqueFilename,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          hash: fileHash,
          usageCount: 1,
          isPublic: false,
          lastUsedAt: new Date()
        }
      })

      console.log('✅ File saved to media library:', mediaLibraryItem.id)
    } catch (mediaError) {
      console.error('⚠️ Error saving to media library:', mediaError)
      // Continue anyway, the file was uploaded successfully
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