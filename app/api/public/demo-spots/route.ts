import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// ============================================
// CONFIGURATION
// ============================================

const TOTAL_SPOTS = 500
const START_COUNT = 249
const CAMPAIGN_DURATION_HOURS = 96 // 4 days

// Set DEMO_CAMPAIGN_START env var to an ISO date string to activate
// e.g. "2026-03-01T09:00:00+01:00" (Spain timezone)
// Before campaign starts → static at START_COUNT
// After campaign ends (96h) → static at TOTAL_SPOTS

// ============================================
// REALISTIC PROGRESSION ALGORITHM
// ============================================

// Hourly activity weights indexed by REAL hour of day (Spain timezone)
// Models actual user behavior patterns for vacation rental hosts
const HOURLY_WEIGHTS = [
//  0h    1h    2h    3h    4h    5h    6h    7h
  0.30, 0.20, 0.10, 0.05, 0.05, 0.10, 0.20, 0.50,
//  8h    9h   10h   11h   12h   13h   14h   15h
  1.00, 1.50, 2.00, 2.50, 2.00, 1.50, 1.50, 2.00,
// 16h   17h   18h   19h   20h   21h   22h   23h
  2.00, 2.50, 3.00, 3.50, 3.00, 2.50, 1.50, 0.80,
]
// Sum per day ≈ 34.4
// Peak: 19:00-21:00 (hosts check after their day jobs)
// Dead: 03:00-05:00

// Day multipliers: gradual acceleration over 4 days
// Day 1: slow start, organic word-of-mouth
// Day 2: ads kicking in, momentum building
// Day 3: peak — social proof + urgency
// Day 4: final rush, FOMO at max
const DAY_MULTIPLIERS = [0.70, 1.00, 1.20, 1.10]

// Progression breakdown:
//   Day 1: ~44 spots  (249 → ~293)
//   Day 2: ~63 spots  (293 → ~356)
//   Day 3: ~75 spots  (356 → ~431)
//   Day 4: ~69 spots  (431 → 500)

// Deterministic pseudo-random jitter for organic feel
// Same input always produces same output (no Math.random)
function jitter(hourIndex: number): number {
  const x = Math.sin(hourIndex * 127.1 + 311.7) * 43758.5453
  return (x - Math.floor(x)) * 0.5 - 0.25 // range: -0.25 to +0.25
}

function calculateSpotsUsed(now: Date): number {
  const campaignStart = process.env.DEMO_CAMPAIGN_START
  if (!campaignStart) return START_COUNT

  const startDate = new Date(campaignStart)
  if (isNaN(startDate.getTime())) return START_COUNT

  const elapsed = now.getTime() - startDate.getTime()
  if (elapsed <= 0) return START_COUNT
  if (elapsed >= CAMPAIGN_DURATION_HOURS * 3600 * 1000) return TOTAL_SPOTS

  const elapsedHours = elapsed / (3600 * 1000)

  // Extract the start hour in Spain timezone (UTC+1)
  // Parse from the ISO string to get the local hour the campaign started
  const startHourSpain = getSpainHour(startDate)

  // Pre-compute scale factor
  const dailyWeightSum = HOURLY_WEIGHTS.reduce((a, b) => a + b, 0)
  const totalWeight = DAY_MULTIPLIERS.reduce((sum, mult) => sum + dailyWeightSum * mult, 0)
  const spotsToAdd = TOTAL_SPOTS - START_COUNT
  const scale = spotsToAdd / totalWeight

  const fullHours = Math.floor(elapsedHours)
  const minuteFraction = elapsedHours - fullHours

  let accumulated = 0

  for (let h = 0; h < fullHours; h++) {
    const dayIndex = Math.min(Math.floor(h / 24), 3)
    // Map campaign hour to actual hour of day in Spain
    const actualHour = (startHourSpain + h) % 24
    const weight = HOURLY_WEIGHTS[actualHour] * DAY_MULTIPLIERS[dayIndex]
    const increment = weight * scale * (1 + jitter(h))
    accumulated += Math.max(0, increment)
  }

  // Partial hour: interpolate
  if (fullHours < CAMPAIGN_DURATION_HOURS) {
    const dayIndex = Math.min(Math.floor(fullHours / 24), 3)
    const actualHour = (startHourSpain + fullHours) % 24
    const weight = HOURLY_WEIGHTS[actualHour] * DAY_MULTIPLIERS[dayIndex]
    const increment = weight * scale * (1 + jitter(fullHours))
    accumulated += Math.max(0, increment * minuteFraction)
  }

  return Math.min(TOTAL_SPOTS, Math.round(START_COUNT + accumulated))
}

// Get current hour in Spain timezone (CET/CEST)
function getSpainHour(date: Date): number {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Madrid',
      hour: 'numeric',
      hour12: false,
    })
    return parseInt(formatter.format(date), 10)
  } catch {
    // Fallback: assume UTC+1
    return (date.getUTCHours() + 1) % 24
  }
}

// ============================================
// GET handler
// ============================================

export async function GET() {
  try {
    const used = calculateSpotsUsed(new Date())
    const remaining = Math.max(0, TOTAL_SPOTS - used)

    return NextResponse.json({
      used,
      remaining,
      total: TOTAL_SPOTS,
    })
  } catch (error) {
    console.error('[demo-spots] Error:', error)
    return NextResponse.json({
      used: START_COUNT,
      remaining: TOTAL_SPOTS - START_COUNT,
      total: TOTAL_SPOTS,
    })
  }
}
