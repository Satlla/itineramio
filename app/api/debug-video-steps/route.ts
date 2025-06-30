import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'
import { requireAuth } from '../../../src/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    // Set JWT claims for RLS policies
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`

    // Get all VIDEO steps for this user's properties
    const videoSteps = await prisma.step.findMany({
      where: {
        type: 'VIDEO',
        zones: {
          property: {
            hostId: userId
          }
        }
      },
      include: {
        zones: {
          select: {
            name: true,
            property: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    const debugInfo = videoSteps.map(step => ({
      id: step.id,
      title: step.title,
      type: step.type,
      content: step.content,
      contentType: typeof step.content,
      hasMediaUrl: step.content && typeof step.content === 'object' ? 'mediaUrl' in (step.content as any) : false,
      mediaUrl: step.content && typeof step.content === 'object' ? (step.content as any).mediaUrl : null,
      zone: step.zones.name,
      property: step.zones.property.name
    }))

    return NextResponse.json({
      success: true,
      count: debugInfo.length,
      steps: debugInfo
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({ 
      error: 'Error in debug', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
}