/**
 * Advanced Analytics Service
 *
 * Calculates high-value metrics that show real ROI to users:
 * - Prevented Calls (THE GOLD METRIC)
 * - ROI Calculator
 * - Health Score
 * - NPS (Net Promoter Score)
 * - Time Saved
 * - User Journey Analytics
 */

import { prisma } from '../prisma'

// ============================================================================
// CONSTANTS & CONFIG
// ============================================================================

const ANALYTICS_CONFIG = {
  // Assumptions for prevented calls calculation
  CALL_PREVENTION_RATE: 0.75, // 75% of zone views prevented a call
  AVG_CALL_DURATION_MINUTES: 3, // Average duration of support call
  HOURLY_RATE_EUR: 20, // Value of host's time per hour

  // Health score weights
  HEALTH_WEIGHTS: {
    RATING: 0.40, // 40% - Guest satisfaction
    ENGAGEMENT: 0.30, // 30% - Completion rate
    FRESHNESS: 0.15, // 15% - Update recency
    TRANSLATION: 0.15 // 15% - Multi-language coverage
  },

  // NPS thresholds
  NPS_PROMOTER_THRESHOLD: 4, // Rating >= 4 is promoter
  NPS_DETRACTOR_THRESHOLD: 2, // Rating <= 2 is detractor

  // Alert thresholds
  LOW_RATING_THRESHOLD: 3.0,
  HIGH_GROWTH_THRESHOLD: 1.5, // 50% increase
  UPDATE_STALE_DAYS: 30
}

// ============================================================================
// TYPES
// ============================================================================

export interface PreventedCallsMetrics {
  preventedCalls: number
  preventedCallsValue: number // EUR
  timeSavedMinutes: number
  breakdown: {
    zoneName: string
    preventedCalls: number
    timeSavedMinutes: number
    value: number
  }[]
}

export interface ROIMetrics {
  monthlyCost: number
  monthlyValue: number
  monthlyTimeSaved: number // minutes
  roi: number // percentage
  breakeven: boolean
  paybackDays: number
}

export interface HealthScore {
  score: number // 0-10
  rating: 'excellent' | 'good' | 'fair' | 'poor'
  breakdown: {
    ratingScore: number
    engagementScore: number
    freshnessScore: number
    translationScore: number
  }
  issues: {
    severity: 'high' | 'medium' | 'low'
    message: string
    actionUrl?: string
  }[]
  opportunities: {
    message: string
    potentialImpact: string
    actionUrl?: string
  }[]
}

export interface NPSMetrics {
  nps: number // -100 to 100
  promoters: number // percentage
  passives: number // percentage
  detractors: number // percentage
  totalResponses: number
  rating: 'excellent' | 'good' | 'fair' | 'poor'
}

export interface UserJourneyMetrics {
  topPaths: {
    path: string
    percentage: number
    count: number
  }[]
  avgZonesPerSession: number
  completionRate: number // % viewing 3+ zones
  deepEngagement: number // % viewing 5+ zones and >5min
  peakHours: {
    hour: number
    count: number
    percentage: number
  }[]
}

export interface EngagementMetrics {
  totalViews: number
  uniqueVisitors: number
  returningVisitors: number
  returningRate: number // percentage
  avgTimeSpent: number // minutes
  zonesPerSession: number
  completionRate: number
  deepEngagement: number
  bounceRate: number // % viewing only 1 zone
}

export interface AdvancedAnalytics {
  preventedCalls: PreventedCallsMetrics
  roi: ROIMetrics
  healthScore: HealthScore
  nps: NPSMetrics
  userJourney: UserJourneyMetrics
  engagement: EngagementMetrics
  periodComparison: {
    views: { current: number; previous: number; change: number }
    rating: { current: number; previous: number; change: number }
    engagement: { current: number; previous: number; change: number }
  }
}

// ============================================================================
// PREVENTED CALLS - THE GOLD METRIC
// ============================================================================

export async function calculatePreventedCalls(
  propertyId: string,
  startDate: Date,
  endDate: Date
): Promise<PreventedCallsMetrics> {
  // Get zone views for the period
  const zones = await prisma.zone.findMany({
    where: {
      propertyId,
      zoneViews: {
        some: {
          viewedAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }
    },
    include: {
      zoneViews: {
        where: {
          viewedAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }
    }
  })

  let totalPreventedCalls = 0
  let totalTimeSaved = 0
  const breakdown: PreventedCallsMetrics['breakdown'] = []

  zones.forEach(zone => {
    const views = zone.zoneViews.length
    const preventedCalls = Math.round(views * ANALYTICS_CONFIG.CALL_PREVENTION_RATE)
    const timeSaved = preventedCalls * ANALYTICS_CONFIG.AVG_CALL_DURATION_MINUTES
    const value = (timeSaved / 60) * ANALYTICS_CONFIG.HOURLY_RATE_EUR

    totalPreventedCalls += preventedCalls
    totalTimeSaved += timeSaved

    const zoneName = typeof zone.name === 'string'
      ? zone.name
      : (zone.name as any)?.es || (zone.name as any)?.en || 'Zone'

    breakdown.push({
      zoneName,
      preventedCalls,
      timeSavedMinutes: timeSaved,
      value
    })
  })

  // Sort breakdown by prevented calls
  breakdown.sort((a, b) => b.preventedCalls - a.preventedCalls)

  const totalValue = (totalTimeSaved / 60) * ANALYTICS_CONFIG.HOURLY_RATE_EUR

  return {
    preventedCalls: totalPreventedCalls,
    preventedCallsValue: Math.round(totalValue * 100) / 100,
    timeSavedMinutes: totalTimeSaved,
    breakdown: breakdown.slice(0, 5) // Top 5 zones
  }
}

// ============================================================================
// ROI CALCULATOR
// ============================================================================

export async function calculateROI(
  userId: string,
  propertyId: string,
  startDate: Date,
  endDate: Date
): Promise<ROIMetrics> {
  // Get user's subscription cost
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscriptions: {
        where: {
          status: 'active'
        },
        take: 1,
        orderBy: {
          startDate: 'desc'
        }
      }
    }
  })

  // Get prevented calls value
  const preventedCalls = await calculatePreventedCalls(propertyId, startDate, endDate)

  // Calculate monthly cost (prorated if period is not a full month)
  const daysInPeriod = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const subscription = user?.subscriptions[0]

  // Default to BASIC plan if no subscription found
  const monthlyPlanCost = subscription?.customPrice
    ? Number(subscription.customPrice)
    : 9 // BASIC plan default

  const proratedCost = (monthlyPlanCost / 30) * daysInPeriod

  const monthlyValue = preventedCalls.preventedCallsValue
  const monthlySavings = monthlyValue - proratedCost
  const roi = proratedCost > 0
    ? Math.round((monthlySavings / proratedCost) * 100)
    : 0

  // Calculate payback days
  const dailyValue = monthlyValue / daysInPeriod
  const paybackDays = dailyValue > 0
    ? Math.round(proratedCost / dailyValue)
    : 999

  return {
    monthlyCost: Math.round(proratedCost * 100) / 100,
    monthlyValue: Math.round(monthlyValue * 100) / 100,
    monthlyTimeSaved: preventedCalls.timeSavedMinutes,
    roi,
    breakeven: monthlyValue >= proratedCost,
    paybackDays: Math.min(paybackDays, 999)
  }
}

// ============================================================================
// HEALTH SCORE
// ============================================================================

export async function calculateHealthScore(
  propertyId: string
): Promise<HealthScore> {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      zones: {
        include: {
          ratings: true,
          steps: true
        }
      },
      analytics: true
    }
  })

  if (!property) {
    throw new Error('Property not found')
  }

  // 1. RATING SCORE (0-10)
  const avgRating = property.analytics?.overallRating || 0
  const ratingScore = (avgRating / 5) * 10

  // 2. ENGAGEMENT SCORE (0-10)
  const completionRate = (property.analytics?.uniqueVisitors && property.analytics.uniqueVisitors > 0)
    ? (property.analytics.totalViews / property.analytics.uniqueVisitors)
    : 0
  const engagementScore = Math.min(completionRate * 3, 10) // 3+ zones viewed = 10/10

  // 3. FRESHNESS SCORE (0-10)
  const daysSinceUpdate = property.updatedAt
    ? Math.floor((Date.now() - property.updatedAt.getTime()) / (1000 * 60 * 60 * 24))
    : 999
  const freshnessScore = Math.max(10 - (daysSinceUpdate / 3), 0)

  // 4. TRANSLATION SCORE (0-10)
  const totalZones = property.zones.length
  const translatedZones = property.zones.filter(zone => {
    const name = zone.name as any
    return name?.es && name?.en
  }).length
  const translationScore = totalZones > 0
    ? (translatedZones / totalZones) * 10
    : 0

  // CALCULATE WEIGHTED HEALTH SCORE
  const score =
    ratingScore * ANALYTICS_CONFIG.HEALTH_WEIGHTS.RATING +
    engagementScore * ANALYTICS_CONFIG.HEALTH_WEIGHTS.ENGAGEMENT +
    freshnessScore * ANALYTICS_CONFIG.HEALTH_WEIGHTS.FRESHNESS +
    translationScore * ANALYTICS_CONFIG.HEALTH_WEIGHTS.TRANSLATION

  // DETERMINE RATING
  let rating: HealthScore['rating']
  if (score >= 8) rating = 'excellent'
  else if (score >= 6) rating = 'good'
  else if (score >= 4) rating = 'fair'
  else rating = 'poor'

  // IDENTIFY ISSUES
  const issues: HealthScore['issues'] = []

  // Low rating zones
  property.zones.forEach(zone => {
    if (zone.avgRating > 0 && zone.avgRating < ANALYTICS_CONFIG.LOW_RATING_THRESHOLD) {
      const zoneName = typeof zone.name === 'string'
        ? zone.name
        : (zone.name as any)?.es || 'Zona'
      issues.push({
        severity: 'high',
        message: `Zona "${zoneName}" tiene rating bajo (${zone.avgRating.toFixed(1)}/5)`,
        actionUrl: `/properties/${propertyId}/zones/${zone.id}/edit`
      })
    }
  })

  // Stale content
  if (daysSinceUpdate > ANALYTICS_CONFIG.UPDATE_STALE_DAYS) {
    issues.push({
      severity: 'medium',
      message: `Manual sin actualizar en ${daysSinceUpdate} días`,
      actionUrl: `/properties/${propertyId}/zones`
    })
  }

  // No ratings yet
  if ((property.analytics?.totalRatings || 0) === 0) {
    issues.push({
      severity: 'low',
      message: 'Aún no hay evaluaciones de huéspedes',
      actionUrl: `/properties/${propertyId}/settings`
    })
  }

  // IDENTIFY OPPORTUNITIES
  const opportunities: HealthScore['opportunities'] = []

  // Missing translations
  const untranslatedZones = totalZones - translatedZones
  if (untranslatedZones > 0) {
    opportunities.push({
      message: `${untranslatedZones} ${untranslatedZones === 1 ? 'zona' : 'zonas'} sin traducir al inglés`,
      potentialImpact: `Podría aumentar tu rating a ${Math.min(avgRating + 0.3, 5).toFixed(1)}/5`,
      actionUrl: `/properties/${propertyId}/zones`
    })
  }

  // Low engagement zones
  const lowEngagementZones = property.zones.filter(z =>
    z.viewCount > 0 && z.viewCount < (property.analytics?.totalViews || 0) * 0.2
  )
  if (lowEngagementZones.length > 0) {
    opportunities.push({
      message: `${lowEngagementZones.length} zonas con pocas vistas`,
      potentialImpact: 'Podrías reorganizar tu manual para más visibilidad'
    })
  }

  return {
    score: Math.round(score * 10) / 10,
    rating,
    breakdown: {
      ratingScore: Math.round(ratingScore * 10) / 10,
      engagementScore: Math.round(engagementScore * 10) / 10,
      freshnessScore: Math.round(freshnessScore * 10) / 10,
      translationScore: Math.round(translationScore * 10) / 10
    },
    issues: issues.slice(0, 3), // Top 3 issues
    opportunities: opportunities.slice(0, 2) // Top 2 opportunities
  }
}

// ============================================================================
// NPS (NET PROMOTER SCORE)
// ============================================================================

export async function calculateNPS(
  propertyId: string,
  startDate: Date,
  endDate: Date
): Promise<NPSMetrics> {
  // Get all ratings for the period
  const ratings = await prisma.zoneRating.findMany({
    where: {
      zone: {
        propertyId
      },
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    select: {
      overallRating: true
    }
  })

  if (ratings.length === 0) {
    return {
      nps: 0,
      promoters: 0,
      passives: 0,
      detractors: 0,
      totalResponses: 0,
      rating: 'poor'
    }
  }

  const totalResponses = ratings.length
  const promoters = ratings.filter(r => r.overallRating >= ANALYTICS_CONFIG.NPS_PROMOTER_THRESHOLD).length
  const detractors = ratings.filter(r => r.overallRating <= ANALYTICS_CONFIG.NPS_DETRACTOR_THRESHOLD).length
  const passives = totalResponses - promoters - detractors

  const promotersPercent = (promoters / totalResponses) * 100
  const detractorsPercent = (detractors / totalResponses) * 100
  const passivesPercent = (passives / totalResponses) * 100

  const nps = Math.round(promotersPercent - detractorsPercent)

  // Determine rating
  let rating: NPSMetrics['rating']
  if (nps >= 50) rating = 'excellent'
  else if (nps >= 0) rating = 'good'
  else if (nps >= -25) rating = 'fair'
  else rating = 'poor'

  return {
    nps,
    promoters: Math.round(promotersPercent),
    passives: Math.round(passivesPercent),
    detractors: Math.round(detractorsPercent),
    totalResponses,
    rating
  }
}

// ============================================================================
// COMPREHENSIVE ANALYTICS
// ============================================================================

export async function getAdvancedAnalytics(
  userId: string,
  propertyId: string,
  startDate: Date,
  endDate: Date
): Promise<AdvancedAnalytics> {
  // Calculate all metrics in parallel
  const [
    preventedCalls,
    roi,
    healthScore,
    nps
  ] = await Promise.all([
    calculatePreventedCalls(propertyId, startDate, endDate),
    calculateROI(userId, propertyId, startDate, endDate),
    calculateHealthScore(propertyId),
    calculateNPS(propertyId, startDate, endDate)
  ])

  // Get engagement metrics
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      analytics: true,
      zoneViews: {
        where: {
          viewedAt: {
            gte: startDate,
            lte: endDate
          }
        },
        select: {
          visitorIp: true,
          timeSpent: true,
          viewedAt: true
        }
      }
    }
  })

  // Calculate engagement
  const uniqueIps = new Set(property?.zoneViews.map(v => v.visitorIp))
  const totalViews = property?.zoneViews.length || 0
  const uniqueVisitors = uniqueIps.size

  // Calculate returning visitors (IPs that viewed multiple times)
  const ipCounts = new Map<string, number>()
  property?.zoneViews.forEach(v => {
    ipCounts.set(v.visitorIp, (ipCounts.get(v.visitorIp) || 0) + 1)
  })
  const returningVisitors = Array.from(ipCounts.values()).filter(count => count > 1).length

  const avgTimeSpent = totalViews > 0
    ? property!.zoneViews.reduce((sum, v) => sum + v.timeSpent, 0) / totalViews / 60
    : 0

  const zonesPerSession = uniqueVisitors > 0
    ? totalViews / uniqueVisitors
    : 0

  const deepEngagement = property?.zoneViews.filter(v => v.timeSpent > 300).length || 0 // >5 min

  const engagement: EngagementMetrics = {
    totalViews,
    uniqueVisitors,
    returningVisitors,
    returningRate: uniqueVisitors > 0 ? (returningVisitors / uniqueVisitors) * 100 : 0,
    avgTimeSpent,
    zonesPerSession,
    completionRate: uniqueVisitors > 0 ? (zonesPerSession / 3) * 100 : 0, // 3+ zones = 100%
    deepEngagement: totalViews > 0 ? (deepEngagement / totalViews) * 100 : 0,
    bounceRate: uniqueVisitors > 0
      ? (Array.from(ipCounts.values()).filter(c => c === 1).length / uniqueVisitors) * 100
      : 0
  }

  // TODO: Implement user journey and period comparison
  const userJourney: UserJourneyMetrics = {
    topPaths: [],
    avgZonesPerSession: zonesPerSession,
    completionRate: engagement.completionRate,
    deepEngagement: engagement.deepEngagement,
    peakHours: []
  }

  const periodComparison = {
    views: { current: totalViews, previous: 0, change: 0 },
    rating: { current: property?.analytics?.overallRating || 0, previous: 0, change: 0 },
    engagement: { current: engagement.completionRate, previous: 0, change: 0 }
  }

  return {
    preventedCalls,
    roi,
    healthScore,
    nps,
    userJourney,
    engagement,
    periodComparison
  }
}
