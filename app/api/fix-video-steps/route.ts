import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'
import { requireAuth } from '../../../src/lib/auth'

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

    // Get all Check In zones for this user
    const checkInZones = await prisma.zone.findMany({
      where: {
        property: {
          hostId: userId
        }
      },
      include: {
        steps: {
          where: {
            type: 'VIDEO'
          }
        }
      }
    })

    let fixedCount = 0
    
    for (const zone of checkInZones) {
      // Check if this is a Check In zone
      const zoneName = typeof zone.name === 'string' ? zone.name : (zone.name as any).es || ''
      if (zoneName.toLowerCase() !== 'check in') continue
      
      for (const step of zone.steps) {
        const stepTitle = typeof step.title === 'string' ? step.title : (step.title as any).es || ''
        
        // Check if this is the door opening video step
        if (stepTitle.toLowerCase().includes('abrir') || stepTitle.toLowerCase().includes('puerta')) {
          let content = step.content as any
          let needsUpdate = false
          
          // Check if mediaUrl is missing
          if (!content.mediaUrl) {
            content = {
              ...content,
              mediaUrl: '/templates/videos/check-in.mp4'
            }
            needsUpdate = true
          }
          
          if (needsUpdate) {
            await prisma.step.update({
              where: { id: step.id },
              data: { content }
            })
            fixedCount++
            console.log(`Fixed video step: ${step.id} - ${stepTitle}`)
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Fixed ${fixedCount} video steps` 
    })
  } catch (error) {
    console.error('Error fixing video steps:', error)
    return NextResponse.json({ 
      error: 'Error fixing video steps', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
}