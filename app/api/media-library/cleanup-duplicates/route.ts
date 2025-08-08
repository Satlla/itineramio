import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { createHash } from 'crypto'
import { prisma } from '../../../../src/lib/prisma'

const JWT_SECRET = 'itineramio-secret-key-2024'

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

    console.log(`🧹 Starting duplicate cleanup for user ${userId}`)

    // Get all media items for this user
    const allMedia = await prisma.mediaLibrary.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' } // Keep the oldest ones
    })

    console.log(`📚 Found ${allMedia.length} media items`)

    // Group by hash (real file content hash)
    const groupedByHash: { [hash: string]: typeof allMedia } = {}
    const groupedByUrl: { [url: string]: typeof allMedia } = {} 

    for (const item of allMedia) {
      // Group by hash if available
      if (item.hash) {
        if (!groupedByHash[item.hash]) {
          groupedByHash[item.hash] = []
        }
        groupedByHash[item.hash].push(item)
      }
      
      // Also group by URL for items with same file
      if (!groupedByUrl[item.url]) {
        groupedByUrl[item.url] = []
      }
      groupedByUrl[item.url].push(item)
    }

    const duplicatesToDelete: string[] = []
    let duplicateCount = 0

    // Find hash-based duplicates (same file content)
    for (const [hash, items] of Object.entries(groupedByHash)) {
      if (items.length > 1) {
        console.log(`🔄 Found ${items.length} items with hash ${hash}`)
        // Keep the first (oldest) item, mark others for deletion
        const [keepItem, ...deleteItems] = items
        
        // Update the kept item's usage count to be the sum of all duplicates
        const totalUsage = items.reduce((sum, item) => sum + (item.usageCount || 0), 0)
        
        await prisma.mediaLibrary.update({
          where: { id: keepItem.id },
          data: { usageCount: totalUsage }
        })

        duplicatesToDelete.push(...deleteItems.map(item => item.id))
        duplicateCount += deleteItems.length
      }
    }

    // Find URL-based duplicates (exact same URL - shouldn't happen but let's clean them)
    for (const [url, items] of Object.entries(groupedByUrl)) {
      if (items.length > 1) {
        console.log(`🔗 Found ${items.length} items with same URL ${url}`)
        // Keep the first (oldest) item, mark others for deletion
        const [keepItem, ...deleteItems] = items
        
        // Update usage count
        const totalUsage = items.reduce((sum, item) => sum + (item.usageCount || 0), 0)
        
        await prisma.mediaLibrary.update({
          where: { id: keepItem.id },
          data: { usageCount: totalUsage }
        })

        // Only add if not already marked for deletion by hash
        const newDeletes = deleteItems
          .map(item => item.id)
          .filter(id => !duplicatesToDelete.includes(id))
        
        duplicatesToDelete.push(...newDeletes)
        duplicateCount += newDeletes.length
      }
    }

    // Delete duplicates
    if (duplicatesToDelete.length > 0) {
      console.log(`🗑️ Deleting ${duplicatesToDelete.length} duplicate items`)
      
      const deleteResult = await prisma.mediaLibrary.deleteMany({
        where: {
          id: { in: duplicatesToDelete },
          userId // Security: only delete user's own media
        }
      })

      console.log(`✅ Successfully deleted ${deleteResult.count} duplicates`)
    }

    return NextResponse.json({
      success: true,
      message: `Limpieza completada. ${duplicateCount} duplicados eliminados.`,
      details: {
        totalItems: allMedia.length,
        duplicatesFound: duplicateCount,
        duplicatesDeleted: duplicatesToDelete.length,
        itemsRemaining: allMedia.length - duplicateCount
      }
    })

  } catch (error) {
    console.error('Error cleaning up duplicates:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}