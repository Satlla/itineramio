import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { createHash } from 'crypto'
import { prisma } from '../../../src/lib/prisma'

const JWT_SECRET = 'itineramio-secret-key-2024'

// Schema for creating media library entry
const createMediaSchema = z.object({
  url: z.string().url(),
  type: z.enum(['image', 'video']),
  metadata: z.object({
    filename: z.string().optional(),
    originalName: z.string().optional(),
    mimeType: z.string().optional(),
    size: z.number().optional(),
    duration: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    thumbnail: z.string().optional()
  }).optional()
})

// GET: Fetch user's media library
export async function GET(request: NextRequest) {
  try {
    // Get user from JWT token
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const userId = decoded.userId

    // Set JWT claims for PostgreSQL RLS policies
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build where clause
    const where: any = { userId }
    
    if (type && ['image', 'video'].includes(type)) {
      where.type = type
    }
    
    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ]
    }

    // Get media items with pagination
    const mediaItems = await prisma.mediaLibrary.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    })

    const total = await prisma.mediaLibrary.count({ where })

    // For each media item, find where it's being used
    const itemsWithUsage = await Promise.all(
      mediaItems.map(async (item) => {
        // Find steps that use this media URL
        const usageSteps = await prisma.step.findMany({
          where: {
            OR: [
              {
                content: {
                  path: ['mediaUrl'],
                  equals: item.url
                }
              },
              {
                content: {
                  path: ['thumbnail'],
                  equals: item.url
                }
              }
            ]
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

        // Transform usage data
        const usage = usageSteps
          .filter(step => step.zones && step.zones.property) // Filter out steps without zone or property
          .map(step => ({
            propertyId: step.zones.property!.id,
            propertyName: typeof step.zones.property!.name === 'string' 
              ? step.zones.property!.name 
              : (step.zones.property!.name as any)?.es || 'Propiedad',
            zoneId: step.zones.id,
            zoneName: typeof step.zones.name === 'string'
              ? step.zones.name
              : (step.zones.name as any)?.es || 'Zona',
            stepId: step.id
          }))

        return {
          id: item.id,
          type: item.type,
          url: item.url,
          thumbnailUrl: item.thumbnailUrl,
          filename: item.filename,
          originalName: item.originalName,
          size: item.size,
          duration: item.duration,
          width: item.width,
          height: item.height,
          usageCount: usage.length, // Update with actual usage count
          tags: item.tags,
          createdAt: item.createdAt.toISOString(),
          lastUsedAt: item.lastUsedAt?.toISOString(),
          usage: usage
        }
      })
    )

    return NextResponse.json({
      success: true,
      items: itemsWithUsage,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching media library:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}

// POST: Add item to media library
export async function POST(request: NextRequest) {
  try {
    // Get user from JWT token
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const userId = decoded.userId

    // Set JWT claims for PostgreSQL RLS policies
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`

    const body = await request.json()
    const validatedData = createMediaSchema.parse(body)

    // Extract filename from URL for hash calculation
    const filename = validatedData.metadata?.filename || 
      validatedData.url.split('/').pop() || 
      `media_${Date.now()}`

    // Generate content hash (simplified - in production, you'd hash the actual file content)
    const hash = createHash('md5').update(validatedData.url + filename).digest('hex')

    // Check if media with same hash already exists for this user
    const existingMedia = await prisma.mediaLibrary.findUnique({
      where: {
        userId_hash: {
          userId,
          hash
        }
      }
    })

    if (existingMedia) {
      // Update usage count and last used date
      const updatedMedia = await prisma.mediaLibrary.update({
        where: { id: existingMedia.id },
        data: {
          usageCount: { increment: 1 },
          lastUsedAt: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Archivo ya existe en la biblioteca - contador de uso actualizado',
        item: {
          id: updatedMedia.id,
          url: updatedMedia.url,
          type: updatedMedia.type,
          usageCount: updatedMedia.usageCount
        },
        duplicate: true
      })
    }

    // Create new media entry
    const mediaItem = await prisma.mediaLibrary.create({
      data: {
        userId,
        type: validatedData.type,
        url: validatedData.url,
        thumbnailUrl: validatedData.metadata?.thumbnail,
        filename,
        originalName: validatedData.metadata?.originalName || filename,
        mimeType: validatedData.metadata?.mimeType || 
          (validatedData.type === 'image' ? 'image/jpeg' : 'video/mp4'),
        size: validatedData.metadata?.size || 0,
        duration: validatedData.metadata?.duration,
        width: validatedData.metadata?.width,
        height: validatedData.metadata?.height,
        hash,
        usageCount: 1,
        lastUsedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Archivo añadido a la biblioteca',
      item: {
        id: mediaItem.id,
        type: mediaItem.type,
        url: mediaItem.url,
        thumbnailUrl: mediaItem.thumbnailUrl,
        filename: mediaItem.filename,
        originalName: mediaItem.originalName,
        size: mediaItem.size,
        duration: mediaItem.duration,
        width: mediaItem.width,
        height: mediaItem.height,
        usageCount: mediaItem.usageCount,
        tags: mediaItem.tags,
        createdAt: mediaItem.createdAt.toISOString()
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error adding to media library:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Datos inválidos',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}

// DELETE: Remove items from media library
export async function DELETE(request: NextRequest) {
  try {
    // Get user from JWT token
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const userId = decoded.userId

    // Set JWT claims for PostgreSQL RLS policies
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`

    const { ids } = await request.json()
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'IDs inválidos'
      }, { status: 400 })
    }

    // Delete media items (only if they belong to the user)
    const result = await prisma.mediaLibrary.deleteMany({
      where: {
        id: { in: ids },
        userId // Ensure user can only delete their own media
      }
    })

    return NextResponse.json({
      success: true,
      message: `${result.count} archivo(s) eliminado(s)`,
      deletedCount: result.count
    })

  } catch (error) {
    console.error('Error deleting media:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}

// PATCH: Update media item (tags, etc.)
export async function PATCH(request: NextRequest) {
  try {
    // Get user from JWT token
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const userId = decoded.userId

    // Set JWT claims for PostgreSQL RLS policies
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`

    const { id, tags, originalName } = await request.json()

    const updateData: any = {}
    if (tags !== undefined) updateData.tags = tags
    if (originalName !== undefined) updateData.originalName = originalName

    const updatedItem = await prisma.mediaLibrary.update({
      where: {
        id,
        userId // Ensure user can only update their own media
      },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      item: {
        id: updatedItem.id,
        tags: updatedItem.tags,
        originalName: updatedItem.originalName
      }
    })

  } catch (error) {
    console.error('Error updating media:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}