/**
 * Email Reports Service
 *
 * Sends automated weekly/monthly analytics reports to users
 * Uses React Email templates + Resend API
 */

import { render } from '@react-email/render'
import { prisma } from '../prisma'
import { sendEmail } from '../email-improved'
import { WeeklyReportEmail, type WeeklyReportEmailProps } from '../../emails/templates/weekly-report'
import {
  getAdvancedAnalytics,
  calculatePreventedCalls,
  calculateROI,
  calculateHealthScore,
  calculateNPS
} from './advanced-metrics'

// ============================================================================
// TYPES
// ============================================================================

interface EmailReportOptions {
  userId: string
  period: 'weekly' | 'monthly'
  forceNotion?: boolean // Para testing, enviar aunque no haya cambios
}

interface PropertyReportData {
  name: string
  id: string
  views: number
  viewsChange: number
  avgTimeSpent: number
  rating: number
  totalRatings: number
  preventedCalls: number
  moneySaved: number
  topZones: {
    name: string
    views: number
    rating: number
    status: 'good' | 'warning' | 'critical'
  }[]
}

// ============================================================================
// HELPERS
// ============================================================================

function getDateRange(period: 'weekly' | 'monthly'): { startDate: Date; endDate: Date; previousStart: Date } {
  const now = new Date()
  const endDate = now

  if (period === 'weekly') {
    // Last 7 days
    const startDate = new Date(now)
    startDate.setDate(now.getDate() - 7)

    const previousStart = new Date(startDate)
    previousStart.setDate(startDate.getDate() - 7)

    return { startDate, endDate, previousStart }
  } else {
    // Last 30 days
    const startDate = new Date(now)
    startDate.setDate(now.getDate() - 30)

    const previousStart = new Date(startDate)
    previousStart.setDate(startDate.getDate() - 30)

    return { startDate, endDate, previousStart }
  }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

function getZoneStatus(rating: number): 'good' | 'warning' | 'critical' {
  if (rating >= 4.0) return 'good'
  if (rating >= 3.0) return 'warning'
  return 'critical'
}

function getText(jsonField: any, language: string = 'es'): string {
  if (typeof jsonField === 'string') return jsonField
  if (jsonField?.[language]) return jsonField[language]
  if (jsonField?.es) return jsonField.es
  if (jsonField?.en) return jsonField.en
  return 'N/A'
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Generate weekly report data for a user
 */
export async function generateWeeklyReportData(
  userId: string
): Promise<WeeklyReportEmailProps | null> {
  const { startDate, endDate, previousStart } = getDateRange('weekly')

  // Get user info
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      properties: {
        where: { isPublished: true },
        include: {
          analytics: true,
          zones: {
            include: {
              analytics: true,
              ratings: {
                where: {
                  createdAt: { gte: startDate }
                }
              },
              zoneViews: {
                where: {
                  viewedAt: { gte: startDate }
                }
              }
            }
          },
          zoneViews: {
            where: {
              viewedAt: { gte: startDate }
            }
          }
        }
      }
    }
  })

  if (!user || user.properties.length === 0) {
    return null
  }

  // Process each property
  const propertiesData: PropertyReportData[] = []
  let totalViews = 0
  let totalPreventedCalls = 0
  let totalMoneySaved = 0
  let totalTimeSaved = 0
  let totalRatings = 0
  let ratingSum = 0

  for (const property of user.properties) {
    // Get current period data
    const preventedCalls = await calculatePreventedCalls(property.id, startDate, endDate)
    const roi = await calculateROI(userId, property.id, startDate, endDate)

    // Get previous period views for comparison
    const previousViews = await prisma.zoneView.count({
      where: {
        propertyId: property.id,
        viewedAt: {
          gte: previousStart,
          lt: startDate
        }
      }
    })

    const currentViews = property.zoneViews.length
    const viewsChange = previousViews > 0
      ? Math.round(((currentViews - previousViews) / previousViews) * 100)
      : 0

    // Calculate average time spent
    const totalTimeSpent = property.zoneViews.reduce((sum, view) => sum + view.timeSpent, 0)
    const avgTimeSpent = currentViews > 0 ? totalTimeSpent / currentViews / 60 : 0

    // Calculate rating
    const allRatings = property.zones.flatMap(z => z.ratings)
    const propertyRating = allRatings.length > 0
      ? allRatings.reduce((sum, r) => sum + r.overallRating, 0) / allRatings.length
      : 0

    // Get top zones
    const zonesWithViews = property.zones
      .map(zone => ({
        name: getText(zone.name),
        views: zone.zoneViews.length,
        rating: zone.avgRating,
        status: getZoneStatus(zone.avgRating)
      }))
      .filter(z => z.views > 0)
      .sort((a, b) => b.views - a.views)
      .slice(0, 3)

    propertiesData.push({
      name: getText(property.name),
      id: property.id,
      views: currentViews,
      viewsChange,
      avgTimeSpent,
      rating: propertyRating,
      totalRatings: allRatings.length,
      preventedCalls: preventedCalls.preventedCalls,
      moneySaved: preventedCalls.preventedCallsValue,
      topZones: zonesWithViews
    })

    // Update totals
    totalViews += currentViews
    totalPreventedCalls += preventedCalls.preventedCalls
    totalMoneySaved += preventedCalls.preventedCallsValue
    totalTimeSaved += preventedCalls.timeSavedMinutes / 60
    totalRatings += allRatings.length
    ratingSum += allRatings.reduce((sum, r) => sum + r.overallRating, 0)
  }

  const avgRating = totalRatings > 0 ? ratingSum / totalRatings : 0

  // Get alerts
  const alerts: WeeklyReportEmailProps['alerts'] = []
  for (const property of user.properties) {
    const healthScore = await calculateHealthScore(property.id)

    healthScore.issues.forEach(issue => {
      if (issue.severity === 'high') {
        alerts.push({
          severity: issue.severity,
          message: issue.message,
          actionText: 'Mejorar ahora',
          actionUrl: issue.actionUrl || `${process.env.NEXT_PUBLIC_APP_URL}/properties/${property.id}`
        })
      }
    })
  }

  // Get opportunities
  const opportunities: WeeklyReportEmailProps['opportunities'] = []
  for (const property of user.properties) {
    const healthScore = await calculateHealthScore(property.id)

    healthScore.opportunities.forEach(opp => {
      opportunities.push({
        message: opp.message,
        impact: opp.potentialImpact,
        actionText: 'Ver cómo hacerlo',
        actionUrl: opp.actionUrl || `${process.env.NEXT_PUBLIC_APP_URL}/properties/${property.id}`
      })
    })
  }

  // Calculate monthly ROI (approximate from weekly data)
  const weeklyMoneySaved = totalMoneySaved
  const monthlyCost = 29 // Default BASIC plan
  const monthlyMoneySaved = weeklyMoneySaved * 4.3 // ~4.3 weeks per month
  const monthlyROI = monthlyCost > 0
    ? Math.round(((monthlyMoneySaved - monthlyCost) / monthlyCost) * 100)
    : 0

  return {
    userName: user.name,
    weekStart: formatDate(startDate),
    weekEnd: formatDate(endDate),
    properties: propertiesData,
    totalStats: {
      totalViews,
      totalPreventedCalls,
      totalMoneySaved: Math.round(totalMoneySaved),
      totalTimeSaved: Math.round(totalTimeSaved * 10) / 10,
      avgRating: Math.round(avgRating * 10) / 10,
      monthlyROI
    },
    alerts: alerts.slice(0, 3), // Max 3 alerts
    opportunities: opportunities.slice(0, 2) // Max 2 opportunities
  }
}

/**
 * Send weekly report email to a user
 */
export async function sendWeeklyReport(
  userId: string,
  options: { forceNotion?: boolean } = {}
): Promise<{ success: boolean; message: string }> {
  try {
    // Generate report data
    const reportData = await generateWeeklyReportData(userId)

    if (!reportData) {
      return {
        success: false,
        message: 'No data available for report (no published properties or no activity)'
      }
    }

    // Check if there's enough activity to send report
    if (!options.forceNotion && reportData.totalStats.totalViews < 5) {
      return {
        success: false,
        message: 'Not enough activity this week (< 5 views), skipping report'
      }
    }

    // Get user email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true }
    })

    if (!user?.email) {
      return {
        success: false,
        message: 'User email not found'
      }
    }

    // Render email HTML
    const emailHtml = render(WeeklyReportEmail(reportData))

    // Send email
    const result = await sendEmail({
      to: user.email,
      subject: `📊 Tu semana en Itineramio: ${reportData.totalStats.totalPreventedCalls} llamadas evitadas`,
      html: emailHtml,
      from: 'Itineramio Analytics <hola@itineramio.com>',
      replyTo: 'hola@itineramio.com'
    })

    if (result.success) {
      // Log successful send
      console.log(`✅ Weekly report sent to ${user.email}`, {
        userId,
        views: reportData.totalStats.totalViews,
        preventedCalls: reportData.totalStats.totalPreventedCalls
      })

      return {
        success: true,
        message: 'Weekly report sent successfully'
      }
    } else {
      console.error(`❌ Failed to send weekly report to ${user.email}:`, result.error)
      return {
        success: false,
        message: result.error || 'Failed to send email'
      }
    }
  } catch (error) {
    console.error('Error sending weekly report:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Send weekly reports to all active users
 */
export async function sendWeeklyReportsToAll(): Promise<{
  sent: number
  skipped: number
  failed: number
  errors: string[]
}> {
  const results = {
    sent: 0,
    skipped: 0,
    failed: 0,
    errors: [] as string[]
  }

  try {
    // Get all users with published properties
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        properties: {
          some: {
            isPublished: true
          }
        }
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    })

    console.log(`📧 Starting weekly reports for ${users.length} users...`)

    // Send reports sequentially to avoid rate limits
    for (const user of users) {
      try {
        const result = await sendWeeklyReport(user.id)

        if (result.success) {
          results.sent++
        } else {
          if (result.message.includes('Not enough activity')) {
            results.skipped++
          } else {
            results.failed++
            results.errors.push(`${user.email}: ${result.message}`)
          }
        }

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        results.failed++
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        results.errors.push(`${user.email}: ${errorMsg}`)
      }
    }

    console.log(`✅ Weekly reports complete:`, results)
    return results
  } catch (error) {
    console.error('Error in sendWeeklyReportsToAll:', error)
    results.errors.push(error instanceof Error ? error.message : 'Unknown error')
    return results
  }
}
