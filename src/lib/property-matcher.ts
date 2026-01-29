/**
 * Property Matcher Service
 * Matches property names from emails to existing properties
 */

interface PropertyConfig {
  id: string
  propertyId: string
  propertyName: string
  airbnbNames: string[]
  bookingNames: string[]
  vrboNames: string[]
}

interface MatchResult {
  configId: string
  propertyId: string
  propertyName: string
  confidence: number
  matchType: 'exact' | 'alias' | 'partial' | 'fuzzy' | 'none'
  matchedName?: string
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length
  const n = str2.length
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
      }
    }
  }
  return dp[m][n]
}

/**
 * Calculate similarity percentage between two strings
 */
function similarity(str1: string, str2: string): number {
  const maxLen = Math.max(str1.length, str2.length)
  if (maxLen === 0) return 100
  const distance = levenshteinDistance(str1, str2)
  return Math.round((1 - distance / maxLen) * 100)
}

/**
 * Normalize string for comparison
 */
function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[|·\-–—]/g, ' ') // Replace separators with space
    .replace(/[^\w\s]/g, '') // Remove special chars
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim()
}

/**
 * Extract key words from a property name
 */
function extractKeywords(name: string): string[] {
  const normalized = normalize(name)
  const stopWords = ['el', 'la', 'los', 'las', 'de', 'del', 'en', 'con', 'y', 'a', 'the', 'and', 'in', 'at', 'for']
  return normalized
    .split(' ')
    .filter(word => word.length > 2 && !stopWords.includes(word))
}

/**
 * Check if name contains significant keywords from another name
 */
function keywordMatch(name1: string, name2: string): number {
  const keywords1 = extractKeywords(name1)
  const keywords2 = extractKeywords(name2)

  if (keywords1.length === 0 || keywords2.length === 0) return 0

  let matches = 0
  for (const kw1 of keywords1) {
    for (const kw2 of keywords2) {
      if (kw1 === kw2 || kw1.includes(kw2) || kw2.includes(kw1)) {
        matches++
        break
      }
    }
  }

  const maxKeywords = Math.max(keywords1.length, keywords2.length)
  return Math.round((matches / maxKeywords) * 100)
}

/**
 * Match a property name against all configured properties
 */
export function matchProperty(
  emailPropertyName: string,
  properties: PropertyConfig[],
  platform: 'airbnb' | 'booking' | 'vrbo' = 'airbnb'
): MatchResult[] {
  const normalizedEmail = normalize(emailPropertyName)
  const results: MatchResult[] = []

  for (const prop of properties) {
    // Get platform-specific aliases
    const aliases = platform === 'airbnb'
      ? prop.airbnbNames
      : platform === 'booking'
        ? prop.bookingNames
        : prop.vrboNames

    // 1. Check exact match in aliases
    const exactAlias = aliases.find(a => normalize(a) === normalizedEmail)
    if (exactAlias) {
      results.push({
        configId: prop.id,
        propertyId: prop.propertyId,
        propertyName: prop.propertyName,
        confidence: 100,
        matchType: 'alias',
        matchedName: exactAlias
      })
      continue
    }

    // 2. Check exact match with property name
    if (normalize(prop.propertyName) === normalizedEmail) {
      results.push({
        configId: prop.id,
        propertyId: prop.propertyId,
        propertyName: prop.propertyName,
        confidence: 100,
        matchType: 'exact'
      })
      continue
    }

    // 3. Check partial match (one contains the other)
    const allNames = [prop.propertyName, ...aliases]
    let bestPartialMatch = 0
    let partialMatchedName = ''

    for (const name of allNames) {
      const normalizedName = normalize(name)
      if (normalizedEmail.includes(normalizedName) || normalizedName.includes(normalizedEmail)) {
        const matchScore = Math.round((Math.min(normalizedEmail.length, normalizedName.length) /
          Math.max(normalizedEmail.length, normalizedName.length)) * 100)
        if (matchScore > bestPartialMatch) {
          bestPartialMatch = matchScore
          partialMatchedName = name
        }
      }
    }

    if (bestPartialMatch >= 50) {
      results.push({
        configId: prop.id,
        propertyId: prop.propertyId,
        propertyName: prop.propertyName,
        confidence: Math.min(95, bestPartialMatch + 10), // Cap at 95% for partial
        matchType: 'partial',
        matchedName: partialMatchedName
      })
      continue
    }

    // 4. Check keyword match
    let bestKeywordMatch = 0
    for (const name of allNames) {
      const kwMatch = keywordMatch(emailPropertyName, name)
      if (kwMatch > bestKeywordMatch) {
        bestKeywordMatch = kwMatch
      }
    }

    if (bestKeywordMatch >= 60) {
      results.push({
        configId: prop.id,
        propertyId: prop.propertyId,
        propertyName: prop.propertyName,
        confidence: Math.min(90, bestKeywordMatch),
        matchType: 'partial'
      })
      continue
    }

    // 5. Fuzzy match (similarity)
    let bestFuzzyMatch = 0
    for (const name of allNames) {
      const sim = similarity(normalizedEmail, normalize(name))
      if (sim > bestFuzzyMatch) {
        bestFuzzyMatch = sim
      }
    }

    if (bestFuzzyMatch >= 50) {
      results.push({
        configId: prop.id,
        propertyId: prop.propertyId,
        propertyName: prop.propertyName,
        confidence: bestFuzzyMatch,
        matchType: 'fuzzy'
      })
    }
  }

  // Sort by confidence descending
  return results.sort((a, b) => b.confidence - a.confidence)
}

/**
 * Find best match for a property name
 * Returns null if no confident match found
 */
export function findBestMatch(
  emailPropertyName: string,
  properties: PropertyConfig[],
  platform: 'airbnb' | 'booking' | 'vrbo' = 'airbnb',
  minConfidence: number = 70
): MatchResult | null {
  const matches = matchProperty(emailPropertyName, properties, platform)

  if (matches.length === 0) return null

  const best = matches[0]
  if (best.confidence >= minConfidence) {
    return best
  }

  return null
}

/**
 * Group emails by detected property name
 */
export function groupEmailsByProperty(
  emails: Array<{ id: string; propertyName: string | null }>
): Map<string, string[]> {
  const groups = new Map<string, string[]>()

  for (const email of emails) {
    const name = email.propertyName || 'Unknown'
    if (!groups.has(name)) {
      groups.set(name, [])
    }
    groups.get(name)!.push(email.id)
  }

  return groups
}

/**
 * Detect property names from email subjects
 * Extracts the property name from Airbnb email subjects
 *
 * Common Airbnb email subject formats:
 * - "Reserva confirmada – The Nook Terrace – 15-18 de enero"
 * - "Pago enviado por The Nook Terrace"
 * - "Pendiente: Solicitud de reserva en PROPERTY NAME para el periodo..."
 * - "Nueva reserva de Juan García en Cozy Apartment"
 * - "Tu reserva en Apartamento Centro ha sido confirmada"
 * - "Cancelada: reserva HMXXX (del 25 mar – 5 abr 2026)" - no property name
 */
export function extractPropertyNameFromSubject(subject: string): string | null {
  // Helper to validate property name
  const isValidPropertyName = (name: string): boolean => {
    const trimmed = name.trim()
    if (trimmed.length < 3 || trimmed.length > 80) return false
    // Filter out dates, codes, and common words
    const lowerName = trimmed.toLowerCase()
    const invalidTerms = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
      'january', 'february', 'march', 'april', 'june', 'july',
      'august', 'september', 'october', 'november', 'december',
      'airbnb', 'pago', 'reserva', 'confirmada', 'cancelada', 'pendiente'
    ]
    if (invalidTerms.some(term => lowerName === term)) return false
    if (/^HM[A-Z0-9]+$/i.test(trimmed)) return false // Confirmation codes
    if (/^\d/.test(trimmed)) return false // Starts with number
    return true
  }

  // Pattern 1: "– Property Name –" (Airbnb uses en-dash or em-dash)
  const dashPattern = /[–—-]\s*([^–—\-]+?)\s*[–—-]/
  const dashMatch = subject.match(dashPattern)
  if (dashMatch && isValidPropertyName(dashMatch[1])) {
    return dashMatch[1].trim()
  }

  // Pattern 2: "Pago enviado por Property Name" or "Payout sent for Property Name"
  const payoutPatterns = [
    /(?:pago|payout)\s+(?:enviado|sent)\s+(?:por|for)\s+([^–—\-]+?)(?:\s*[–—-]|\s*$)/i,
  ]
  for (const pattern of payoutPatterns) {
    const match = subject.match(pattern)
    if (match && isValidPropertyName(match[1])) {
      return match[1].trim()
    }
  }

  // Pattern 3: "en PROPERTY para el periodo" or similar
  const enParaMatch = subject.match(/(?:en|in)\s+(.+?)\s+(?:para el periodo|for the period|para|for\s+\d)/i)
  if (enParaMatch && isValidPropertyName(enParaMatch[1])) {
    return enParaMatch[1].trim()
  }

  // Pattern 4: "reserva de Guest en PROPERTY"
  const reservaEnMatch = subject.match(/reserva\s+(?:de\s+.+?\s+)?en\s+(.+?)(?:\s+(?:para|del|ha\s+sido)|\s*$)/i)
  if (reservaEnMatch && isValidPropertyName(reservaEnMatch[1])) {
    return reservaEnMatch[1].trim()
  }

  // Pattern 5: "en tu PROPERTY" at end
  const enTuMatch = subject.match(/en\s+(?:tu\s+)?([A-Z][^–—\-]*?)(?:\s+(?:para|del|ha)|\s*$)/i)
  if (enTuMatch && isValidPropertyName(enTuMatch[1])) {
    return enTuMatch[1].trim()
  }

  // Pattern 6: Simple "en PROPERTY" at end (capitalized word after "en")
  const simpleEnMatch = subject.match(/\s+en\s+([A-Z][A-Za-záéíóúñÁÉÍÓÚÑ\s]+?)(?:\s*$|\s+\d)/i)
  if (simpleEnMatch && isValidPropertyName(simpleEnMatch[1])) {
    return simpleEnMatch[1].trim()
  }

  return null
}

/**
 * Get match suggestions for UI display
 */
export function getMatchSuggestions(
  emailPropertyName: string,
  properties: PropertyConfig[],
  platform: 'airbnb' | 'booking' | 'vrbo' = 'airbnb'
): {
  autoMatch: MatchResult | null
  suggestions: MatchResult[]
} {
  const matches = matchProperty(emailPropertyName, properties, platform)

  // Auto-match only if 100% confidence (exact or alias match)
  const autoMatch = matches.find(m => m.confidence === 100) || null

  // Return top 5 suggestions
  return {
    autoMatch,
    suggestions: matches.slice(0, 5)
  }
}
