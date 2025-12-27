/**
 * API Endpoint: Weekly Analytics Report
 *
 * GET /api/analytics/reports/weekly
 * - Generates weekly report data for current user
 *
 * POST /api/analytics/reports/weekly
 * - Sends weekly report email to current user
 * - Can be triggered manually by user or by cron job
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '../../../../../src/lib/auth'
import {
  generateWeeklyReportData,
  sendWeeklyReport,
  sendWeeklyReportsToAll
} from '../../../../../src/lib/analytics/email-reports'

// ============================================================================
// GET: Generate weekly report data (preview)
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const reportData = await generateWeeklyReportData(userId)

    if (!reportData) {
      return NextResponse.json({
        success: false,
        message: 'No data available for weekly report'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: reportData
    })
  } catch (error) {
    console.error('Error generating weekly report:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// ============================================================================
// POST: Send weekly report email
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    // Check if this is a cron job request (admin only)
    const { searchParams } = new URL(request.url)
    const sendToAll = searchParams.get('all') === 'true'
    const cronSecret = searchParams.get('secret')

    // If sending to all users, verify cron secret
    if (sendToAll) {
      const expectedSecret = process.env.CRON_SECRET
      if (!expectedSecret || cronSecret !== expectedSecret) {
        return NextResponse.json({
          success: false,
          error: 'Unauthorized: Invalid cron secret'
        }, { status: 401 })
      }

      // Send reports to all users
      const results = await sendWeeklyReportsToAll()

      return NextResponse.json({
        success: true,
        message: 'Weekly reports sent to all users',
        results
      })
    }

    // Send report to current user only
    const result = await sendWeeklyReport(userId, { forceNotion: true })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message
      })
    } else {
      return NextResponse.json({
        success: false,
        message: result.message
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Error sending weekly report:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
