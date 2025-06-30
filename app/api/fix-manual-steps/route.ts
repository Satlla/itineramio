import { NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'
import { requireAuth } from '../../../src/lib/auth'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    // Set JWT claims for RLS policies
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`

    // Get all zones named "Check In" or "WiFi" for this user
    const zones = await prisma.zone.findMany({
      where: {
        OR: [
          { name: 'Check In' },
          { name: 'WiFi' }
        ],
        property: {
          hostId: userId
        }
      },
      include: {
        steps: true
      }
    })

    let fixedCount = 0
    
    for (const zone of zones) {
      for (const step of zone.steps) {
        // Check if content is empty or malformed
        let needsFix = false
        let newContent = step.content
        
        if (!step.content) {
          needsFix = true
          newContent = { es: 'Contenido por defecto' }
        } else if (typeof step.content === 'object') {
          const content = step.content as any
          
          // Check if it has es key but it's empty
          if (content.es === '' || !content.es) {
            needsFix = true
            
            // Try to get content from other sources
            if (content.mediaUrl) {
              // For video/image steps, put a description
              newContent = { 
                es: 'Ver contenido multimedia',
                mediaUrl: content.mediaUrl 
              }
            } else {
              // Use title as content if nothing else
              const titleText = typeof step.title === 'string' ? step.title : (step.title as any).es || 'Sin contenido'
              newContent = { es: titleText }
            }
          }
        }
        
        if (needsFix) {
          await prisma.step.update({
            where: { id: step.id },
            data: { content: newContent }
          })
          fixedCount++
          console.log(`Fixed step: ${step.id} - ${(step.title as any).es || step.title}`)
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Fixed ${fixedCount} steps in ${zones.length} zones` 
    })
  } catch (error) {
    console.error('Error fixing steps:', error)
    return NextResponse.json({ 
      error: 'Error fixing steps', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
}