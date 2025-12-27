import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'
import { requireAuth } from '../../../src/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const debug: any = {
      userId,
      steps: []
    }

    // Step 1: Test basic property query
    debug.steps.push('1. Testing basic property query...')
    try {
      const simpleProps = await prisma.property.findMany({
        where: { hostId: userId },
        select: {
          id: true,
          name: true
        }
      })
      debug.simplePropsCount = simpleProps.length
      debug.steps.push(`✅ Found ${simpleProps.length} properties`)
    } catch (e) {
      debug.steps.push(`❌ Basic query failed: ${e instanceof Error ? e.message : 'Unknown'}`)
      debug.basicQueryError = e instanceof Error ? e.message : 'Unknown'
    }

    // Step 2: Test with analytics include
    debug.steps.push('2. Testing with analytics include...')
    try {
      const propsWithAnalytics = await prisma.property.findMany({
        where: { hostId: userId },
        include: {
          analytics: true
        }
      })
      debug.analyticsIncludeOk = true
      debug.steps.push('✅ Analytics include works')
    } catch (e) {
      debug.steps.push(`❌ Analytics include failed: ${e instanceof Error ? e.message : 'Unknown'}`)
      debug.analyticsError = e instanceof Error ? e.message : 'Unknown'
    }

    // Step 3: Test zones include
    debug.steps.push('3. Testing zones include...')
    try {
      const propsWithZones = await prisma.property.findMany({
        where: { hostId: userId },
        include: {
          zones: true
        }
      })
      debug.zonesIncludeOk = true
      debug.steps.push('✅ Zones include works')
    } catch (e) {
      debug.steps.push(`❌ Zones include failed: ${e instanceof Error ? e.message : 'Unknown'}`)
      debug.zonesError = e instanceof Error ? e.message : 'Unknown'
    }

    // Step 4: Test full query from analytics dashboard
    debug.steps.push('4. Testing full analytics dashboard query...')
    try {
      const properties = await prisma.property.findMany({
        where: { hostId: userId },
        include: {
          analytics: true,
          zones: {
            include: {
              _count: {
                select: {
                  ratings: true,
                  steps: true
                }
              }
            }
          }
        }
      })
      debug.fullQueryOk = true
      debug.steps.push(`✅ Full query works, found ${properties.length} properties`)
    } catch (e) {
      debug.steps.push(`❌ Full query failed: ${e instanceof Error ? e.message : 'Unknown'}`)
      debug.fullQueryError = e instanceof Error ? e.message : 'Unknown'
      
      // Log the full error details
      if (e instanceof Error) {
        console.error('Full error details:', {
          name: e.name,
          message: e.message,
          stack: e.stack
        })
      }
    }

    return NextResponse.json({
      success: true,
      debug
    })

  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}