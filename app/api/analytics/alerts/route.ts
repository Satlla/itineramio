/**
 * API Endpoint: Intelligent Alerts
 *
 * GET /api/analytics/alerts
 * - Returns all current alerts for the user
 *
 * POST /api/analytics/alerts
 * - Triggers manual alert check and sends emails
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '../../../../src/lib/auth'
import {
  detectAllAlerts,
  processUserAlerts,
  runDailyAlertsCheck
} from '../../../../src/lib/analytics/intelligent-alerts'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const alerts = await detectAllAlerts(userId)

    return NextResponse.json({
      success: true,
      data: alerts,
      meta: {
        total: alerts.length,
        byType: {
          highSeverity: alerts.filter(a => a.severity === 'high').length,
          mediumSeverity: alerts.filter(a => a.severity === 'medium').length,
          lowSeverity: alerts.filter(a => a.severity === 'low').length
        }
      }
    })
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if this is a cron job request
    const { searchParams } = new URL(request.url)
    const runForAll = searchParams.get('all') === 'true'
    const cronSecret = searchParams.get('secret')

    // If running for all users, verify cron secret
    if (runForAll) {
      const expectedSecret = process.env.CRON_SECRET
      if (!expectedSecret || cronSecret !== expectedSecret) {
        return NextResponse.json({
          success: false,
          error: 'Unauthorized: Invalid cron secret'
        }, { status: 401 })
      }

      // Run daily alerts check for all users
      const results = await runDailyAlertsCheck()

      return NextResponse.json({
        success: true,
        message: 'Daily alerts check completed',
        results
      })
    }

    // Process alerts for current user only
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const results = await processUserAlerts(userId)

    return NextResponse.json({
      success: true,
      message: 'User alerts processed',
      results
    })
  } catch (error) {
    console.error('Error processing alerts:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
