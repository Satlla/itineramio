/**
 * Intelligent Alerts System
 *
 * Automatically detects issues and opportunities
 * Sends notifications when:
 * - Rating drops below threshold
 * - Views increase significantly (milestone)
 * - Content becomes stale
 * - Opportunities for improvement detected
 */

import { prisma } from '../prisma'
import { sendEmail } from '../email-improved'
import { calculateHealthScore, calculateNPS } from './advanced-metrics'

// ============================================================================
// TYPES
// ============================================================================

export type AlertType =
  | 'LOW_RATING'
  | 'HIGH_GROWTH'
  | 'STALE_CONTENT'
  | 'MILESTONE'
  | 'NO_RATINGS'
  | 'OPPORTUNITY'

export interface Alert {
  type: AlertType
  severity: 'high' | 'medium' | 'low'
  title: string
  message: string
  actionText: string
  actionUrl: string
  propertyId: string
  propertyName: string
  zoneId?: string
  zoneName?: string
  metadata?: Record<string, any>
}

// ============================================================================
// ALERT DETECTION
// ============================================================================

/**
 * Check for low rating alerts
 */
async function detectLowRatingAlerts(userId: string): Promise<Alert[]> {
  const alerts: Alert[] = []

  const properties = await prisma.property.findMany({
    where: {
      hostId: userId,
      isPublished: true
    },
    include: {
      zones: {
        include: {
          ratings: {
            where: {
              createdAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
              }
            }
          }
        }
      }
    }
  })

  for (const property of properties) {
    for (const zone of property.zones) {
      if (zone.ratings.length >= 3) { // At least 3 ratings
        const avgRating = zone.ratings.reduce((sum, r) => sum + r.overallRating, 0) / zone.ratings.length

        if (avgRating < 3.0) {
          // Get common feedback
          const feedbacks = zone.ratings
            .filter(r => r.feedback)
            .map(r => r.feedback)
            .slice(0, 3)

          const zoneName = typeof zone.name === 'string'
            ? zone.name
            : (zone.name as any)?.es || 'Zona'

          alerts.push({
            type: 'LOW_RATING',
            severity: 'high',
            title: `Rating Bajo: ${zoneName}`,
            message: `Tu zona "${zoneName}" ha recibido un rating promedio de ${avgRating.toFixed(1)}/5 esta semana. ${feedbacks.length > 0 ? `Comentarios comunes: "${feedbacks[0]}"` : ''}`,
            actionText: 'Mejorar Zona',
            actionUrl: `/properties/${property.id}/zones/${zone.id}/edit`,
            propertyId: property.id,
            propertyName: typeof property.name === 'string' ? property.name : (property.name as any)?.es || 'Propiedad',
            zoneId: zone.id,
            zoneName,
            metadata: {
              rating: avgRating,
              totalRatings: zone.ratings.length,
              feedbacks
            }
          })
        }
      }
    }
  }

  return alerts
}

/**
 * Check for high growth alerts (milestones)
 */
async function detectHighGrowthAlerts(userId: string): Promise<Alert[]> {
  const alerts: Alert[] = []
  const MILESTONES = [100, 500, 1000, 5000, 10000]

  const properties = await prisma.property.findMany({
    where: {
      hostId: userId,
      isPublished: true
    },
    include: {
      analytics: true
    }
  })

  for (const property of properties) {
    const totalViews = property.analytics?.totalViews || 0

    // Check if recently crossed a milestone
    const lastWeekViews = await prisma.zoneView.count({
      where: {
        propertyId: property.id,
        viewedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    })

    const previousTotal = totalViews - lastWeekViews

    for (const milestone of MILESTONES) {
      if (previousTotal < milestone && totalViews >= milestone) {
        alerts.push({
          type: 'MILESTONE',
          severity: 'low',
          title: `🎉 ¡${milestone} vistas alcanzadas!`,
          message: `Tu propiedad "${typeof property.name === 'string' ? property.name : (property.name as any)?.es}" ha alcanzado ${milestone} vistas totales. ¡Felicitaciones!`,
          actionText: 'Compartir logro',
          actionUrl: `/properties/${property.id}/analytics`,
          propertyId: property.id,
          propertyName: typeof property.name === 'string' ? property.name : (property.name as any)?.es || 'Propiedad',
          metadata: {
            milestone,
            totalViews,
            lastWeekViews
          }
        })
      }
    }

    // Check for significant week-over-week growth
    if (previousTotal > 0 && lastWeekViews > previousTotal * 0.5) { // 50% growth
      const growthPercent = Math.round((lastWeekViews / previousTotal) * 100)
      alerts.push({
        type: 'HIGH_GROWTH',
        severity: 'low',
        title: `📈 Crecimiento de ${growthPercent}%`,
        message: `Las vistas de tu propiedad "${typeof property.name === 'string' ? property.name : (property.name as any)?.es}" aumentaron un ${growthPercent}% esta semana. ¡Sigue así!`,
        actionText: 'Ver Analytics',
        actionUrl: `/properties/${property.id}/analytics`,
        propertyId: property.id,
        propertyName: typeof property.name === 'string' ? property.name : (property.name as any)?.es || 'Propiedad',
        metadata: {
          growthPercent,
          previousViews: previousTotal,
          currentViews: totalViews
        }
      })
    }
  }

  return alerts
}

/**
 * Check for stale content alerts
 */
async function detectStaleContentAlerts(userId: string): Promise<Alert[]> {
  const alerts: Alert[] = []
  const STALE_THRESHOLD_DAYS = 90

  const properties = await prisma.property.findMany({
    where: {
      hostId: userId,
      isPublished: true
    }
  })

  for (const property of properties) {
    const daysSinceUpdate = Math.floor(
      (Date.now() - property.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysSinceUpdate >= STALE_THRESHOLD_DAYS) {
      alerts.push({
        type: 'STALE_CONTENT',
        severity: 'medium',
        title: 'Contenido sin actualizar',
        message: `Tu propiedad "${typeof property.name === 'string' ? property.name : (property.name as any)?.es}" no se ha actualizado en ${daysSinceUpdate} días. Considera revisar la información para mantenerla actualizada.`,
        actionText: 'Actualizar Manual',
        actionUrl: `/properties/${property.id}/zones`,
        propertyId: property.id,
        propertyName: typeof property.name === 'string' ? property.name : (property.name as any)?.es || 'Propiedad',
        metadata: {
          daysSinceUpdate,
          lastUpdate: property.updatedAt.toISOString()
        }
      })
    }
  }

  return alerts
}

/**
 * Check for opportunity alerts
 */
async function detectOpportunityAlerts(userId: string): Promise<Alert[]> {
  const alerts: Alert[] = []

  const properties = await prisma.property.findMany({
    where: {
      hostId: userId,
      isPublished: true
    },
    include: {
      zones: true
    }
  })

  for (const property of properties) {
    // Check for missing translations
    const totalZones = property.zones.length
    const translatedZones = property.zones.filter(zone => {
      const name = zone.name as any
      return name?.es && name?.en
    }).length

    if (translatedZones < totalZones && translatedZones / totalZones < 0.5) {
      const untranslated = totalZones - translatedZones
      alerts.push({
        type: 'OPPORTUNITY',
        severity: 'low',
        title: 'Mejora con traducción',
        message: `${untranslated} zonas de "${typeof property.name === 'string' ? property.name : (property.name as any)?.es}" no están traducidas al inglés. Traducirlas podría mejorar tu rating.`,
        actionText: 'Traducir Zonas',
        actionUrl: `/properties/${property.id}/zones`,
        propertyId: property.id,
        propertyName: typeof property.name === 'string' ? property.name : (property.name as any)?.es || 'Propiedad',
        metadata: {
          totalZones,
          translatedZones,
          untranslated
        }
      })
    }
  }

  return alerts
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Detect all alerts for a user
 */
export async function detectAllAlerts(userId: string): Promise<Alert[]> {
  const [
    lowRatingAlerts,
    highGrowthAlerts,
    staleContentAlerts,
    opportunityAlerts
  ] = await Promise.all([
    detectLowRatingAlerts(userId),
    detectHighGrowthAlerts(userId),
    detectStaleContentAlerts(userId),
    detectOpportunityAlerts(userId)
  ])

  const allAlerts = [
    ...lowRatingAlerts,
    ...highGrowthAlerts,
    ...staleContentAlerts,
    ...opportunityAlerts
  ]

  // Sort by severity
  const severityOrder = { high: 0, medium: 1, low: 2 }
  allAlerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  return allAlerts
}

/**
 * Send alert email
 */
async function sendAlertEmail(
  userEmail: string,
  userName: string,
  alert: Alert
): Promise<boolean> {
  const severityEmoji = {
    high: '🚨',
    medium: '⚠️',
    low: '💡'
  }

  const severityColor = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#3b82f6'
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: ${severityColor[alert.severity]}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 24px;">
      ${severityEmoji[alert.severity]} ${alert.title}
    </h1>
  </div>

  <div style="background: white; border: 2px solid ${severityColor[alert.severity]}; border-top: none; border-radius: 0 0 8px 8px; padding: 24px;">
    <p style="margin: 0 0 16px; font-size: 16px;">
      Hola ${userName},
    </p>

    <p style="margin: 0 0 24px; font-size: 16px;">
      ${alert.message}
    </p>

    <a href="${process.env.NEXT_PUBLIC_APP_URL}${alert.actionUrl}"
       style="display: inline-block; background: ${severityColor[alert.severity]}; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600;">
      ${alert.actionText}
    </a>

    <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;">

    <p style="margin: 0; font-size: 14px; color: #6b7280;">
      Propiedad: <strong>${alert.propertyName}</strong>
      ${alert.zoneName ? `<br>Zona: <strong>${alert.zoneName}</strong>` : ''}
    </p>
  </div>

  <div style="margin-top: 24px; padding: 16px; background: #f9fafb; border-radius: 8px; text-align: center;">
    <p style="margin: 0; font-size: 12px; color: #6b7280;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/settings" style="color: #7c3aed; text-decoration: none;">
        Configurar notificaciones
      </a>
    </p>
  </div>
</body>
</html>
  `

  try {
    const result = await sendEmail({
      to: userEmail,
      subject: `${severityEmoji[alert.severity]} ${alert.title}`,
      html,
      from: 'Itineramio Alerts <hola@itineramio.com>',
      replyTo: 'hola@itineramio.com'
    })

    return result.success
  } catch (error) {
    console.error('Error sending alert email:', error)
    return false
  }
}

/**
 * Process alerts for a user
 * Sends emails for high severity alerts
 */
export async function processUserAlerts(userId: string): Promise<{
  totalAlerts: number
  emailsSent: number
  errors: string[]
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true }
  })

  if (!user) {
    return { totalAlerts: 0, emailsSent: 0, errors: ['User not found'] }
  }

  const alerts = await detectAllAlerts(userId)
  const errors: string[] = []
  let emailsSent = 0

  // Only send emails for high severity alerts
  const highSeverityAlerts = alerts.filter(a => a.severity === 'high')

  for (const alert of highSeverityAlerts) {
    try {
      const sent = await sendAlertEmail(user.email, user.name, alert)
      if (sent) {
        emailsSent++
      } else {
        errors.push(`Failed to send alert: ${alert.title}`)
      }

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error) {
      errors.push(`Error processing alert ${alert.title}: ${error instanceof Error ? error.message : 'Unknown'}`)
    }
  }

  return {
    totalAlerts: alerts.length,
    emailsSent,
    errors
  }
}

/**
 * Run alerts check for all active users
 * Called by cron job daily
 */
export async function runDailyAlertsCheck(): Promise<{
  usersProcessed: number
  totalAlerts: number
  emailsSent: number
  errors: string[]
}> {
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

  const results = {
    usersProcessed: 0,
    totalAlerts: 0,
    emailsSent: 0,
    errors: [] as string[]
  }

  for (const user of users) {
    try {
      const userResults = await processUserAlerts(user.id)
      results.usersProcessed++
      results.totalAlerts += userResults.totalAlerts
      results.emailsSent += userResults.emailsSent
      results.errors.push(...userResults.errors)

      // Small delay between users
      await new Promise(resolve => setTimeout(resolve, 200))
    } catch (error) {
      results.errors.push(`Error processing user ${user.email}: ${error instanceof Error ? error.message : 'Unknown'}`)
    }
  }

  console.log('📬 Daily alerts check complete:', results)
  return results
}
