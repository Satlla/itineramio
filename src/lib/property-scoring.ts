/**
 * Property Optimization Scoring System
 *
 * Calcula una puntuación de 0-100 para cada propiedad basada en su nivel
 * de configuración y uso. Sirve para:
 * - Cualificar leads (Turista/Explorador/Constructor/Activo)
 * - Decidir qué emails de onboarding enviar
 * - Priorizar soporte y follow-ups
 * - Alimentar el informe semanal
 */

import { prisma } from './prisma'

// Puntuación por criterio
const SCORING_CRITERIA = {
  HAS_NAME_AND_ADDRESS: 10,
  HAS_ACCESS_ZONE: 15,
  HAS_WIFI_ZONE: 15,
  HAS_RULES_ZONE: 10,
  HAS_5_PLUS_ZONES: 10,
  ASSISTANT_ACTIVE: 15,
  LINK_PUBLISHED: 10,
  HAS_REAL_VISIT: 10,
  ASSISTANT_ANSWERED: 5,
} as const

// Slugs de las zonas esenciales que buscamos
const ESSENTIAL_ZONE_SLUGS = {
  access: ['essential-checkin', 'check-in', 'checkin', 'acceso', 'llegada'],
  wifi: ['essential-wifi', 'wifi', 'wi-fi', 'internet'],
  rules: ['essential-rules', 'normas', 'rules', 'house-rules'],
}

export type QualificationLevel = 'turista' | 'explorador' | 'constructor' | 'activo'

export interface PropertyScore {
  total: number
  level: QualificationLevel
  breakdown: {
    hasNameAndAddress: boolean
    hasAccessZone: boolean
    hasWifiZone: boolean
    hasRulesZone: boolean
    has5PlusZones: boolean
    assistantActive: boolean
    linkPublished: boolean
    hasRealVisit: boolean
    assistantAnswered: boolean
  }
  stats: {
    totalZones: number
    totalViews: number
    uniqueVisitors: number
    chatbotConversations: number
    questionsAnswered: number
  }
}

/**
 * Calcula la puntuación de optimización de una propiedad
 */
export async function calculatePropertyScore(propertyId: string): Promise<PropertyScore | null> {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      zones: {
        where: { deletedAt: null },
        select: {
          id: true,
          slug: true,
          name: true,
          type: true,
          isPublished: true,
          steps: {
            select: { id: true },
          },
        },
      },
      analytics: true,
      chatbotConversations: {
        select: {
          id: true,
          messages: true,
        },
      },
    },
  })

  if (!property) return null

  // 1. Tiene nombre y dirección
  const hasNameAndAddress = Boolean(
    property.name && property.name.trim() !== '' &&
    property.street && property.street.trim() !== ''
  )

  // 2. Zona de Acceso configurada (tiene al menos 1 step)
  const hasAccessZone = property.zones.some(
    (z) => zoneMatchesType(z, ESSENTIAL_ZONE_SLUGS.access) && hasContent(z)
  )

  // 3. Zona de WiFi configurada
  const hasWifiZone = property.zones.some(
    (z) => zoneMatchesType(z, ESSENTIAL_ZONE_SLUGS.wifi) && hasContent(z)
  )

  // 4. Zona de Normas configurada
  const hasRulesZone = property.zones.some(
    (z) => zoneMatchesType(z, ESSENTIAL_ZONE_SLUGS.rules) && hasContent(z)
  )

  // 5. Tiene 5+ zonas
  const totalZones = property.zones.length
  const has5PlusZones = totalZones >= 5

  // 6. Asistente activado (tiene al menos 1 conversación = funciona)
  const chatbotConversations = property.chatbotConversations.length
  const assistantActive = chatbotConversations > 0

  // 7. Enlace publicado
  const linkPublished = property.isPublished === true

  // 8. Ha recibido al menos 1 visita real
  const totalViews = property.analytics?.totalViews ?? 0
  const uniqueVisitors = property.analytics?.uniqueVisitors ?? 0
  const hasRealVisit = uniqueVisitors > 0

  // 9. El asistente ha respondido al menos 1 pregunta
  const questionsAnswered = property.chatbotConversations.reduce((count, conv) => {
    const messages = conv.messages as Array<{ role?: string }> | null
    if (!Array.isArray(messages)) return count
    return count + messages.filter((m) => m.role === 'assistant').length
  }, 0)
  const assistantAnswered = questionsAnswered > 0

  // Calcular total
  let total = 0
  if (hasNameAndAddress) total += SCORING_CRITERIA.HAS_NAME_AND_ADDRESS
  if (hasAccessZone) total += SCORING_CRITERIA.HAS_ACCESS_ZONE
  if (hasWifiZone) total += SCORING_CRITERIA.HAS_WIFI_ZONE
  if (hasRulesZone) total += SCORING_CRITERIA.HAS_RULES_ZONE
  if (has5PlusZones) total += SCORING_CRITERIA.HAS_5_PLUS_ZONES
  if (assistantActive) total += SCORING_CRITERIA.ASSISTANT_ACTIVE
  if (linkPublished) total += SCORING_CRITERIA.LINK_PUBLISHED
  if (hasRealVisit) total += SCORING_CRITERIA.HAS_REAL_VISIT
  if (assistantAnswered) total += SCORING_CRITERIA.ASSISTANT_ANSWERED

  // Determinar nivel de cualificación
  const level = getQualificationLevel(total, {
    hasNameAndAddress,
    linkPublished,
    hasRealVisit,
    totalZones,
  })

  return {
    total,
    level,
    breakdown: {
      hasNameAndAddress,
      hasAccessZone,
      hasWifiZone,
      hasRulesZone,
      has5PlusZones,
      assistantActive,
      linkPublished,
      hasRealVisit,
      assistantAnswered,
    },
    stats: {
      totalZones,
      totalViews,
      uniqueVisitors,
      chatbotConversations,
      questionsAnswered,
    },
  }
}

/**
 * Calcula y persiste la puntuación en PropertyAnalytics.improvementScore
 */
export async function updatePropertyScore(propertyId: string): Promise<PropertyScore | null> {
  const score = await calculatePropertyScore(propertyId)
  if (!score) return null

  await prisma.propertyAnalytics.upsert({
    where: { propertyId },
    update: {
      improvementScore: score.total,
      lastCalculatedAt: new Date(),
    },
    create: {
      propertyId,
      improvementScore: score.total,
      lastCalculatedAt: new Date(),
    },
  })

  return score
}

/**
 * Calcula scores para todas las propiedades de un usuario
 */
export async function calculateUserScores(userId: string): Promise<PropertyScore[]> {
  const properties = await prisma.property.findMany({
    where: { userId, deletedAt: null },
    select: { id: true },
  })

  const scores: PropertyScore[] = []
  for (const prop of properties) {
    const score = await updatePropertyScore(prop.id)
    if (score) scores.push(score)
  }

  return scores
}

/**
 * Determina el nivel de cualificación del usuario basado en la puntuación
 * y las acciones completadas
 */
function getQualificationLevel(
  total: number,
  context: {
    hasNameAndAddress: boolean
    linkPublished: boolean
    hasRealVisit: boolean
    totalZones: number
  }
): QualificationLevel {
  // Activo: ha publicado Y tiene visitas reales
  if (context.linkPublished && context.hasRealVisit) return 'activo'

  // Constructor: tiene propiedad + zonas configuradas, listo para publicar
  if (context.hasNameAndAddress && context.totalZones >= 3) return 'constructor'

  // Explorador: ha creado propiedad pero le falta contenido
  if (context.hasNameAndAddress) return 'explorador'

  // Turista: se registró pero no ha hecho nada significativo
  return 'turista'
}

/**
 * Comprueba si una zona coincide con un tipo esencial por slug o nombre
 */
function zoneMatchesType(
  zone: { slug: string | null; name: unknown },
  slugPatterns: string[]
): boolean {
  // Comprobar por slug
  if (zone.slug) {
    const normalizedSlug = zone.slug.toLowerCase()
    if (slugPatterns.some((p) => normalizedSlug.includes(p))) return true
  }

  // Comprobar por nombre (puede ser JSON multiidioma)
  const name = extractZoneName(zone.name)
  if (name) {
    const normalizedName = name.toLowerCase()
    if (slugPatterns.some((p) => normalizedName.includes(p))) return true
  }

  return false
}

/**
 * Extrae el nombre de una zona (puede ser string o JSON multiidioma)
 */
function extractZoneName(name: unknown): string | null {
  if (typeof name === 'string') return name
  if (name && typeof name === 'object') {
    const obj = name as Record<string, string>
    return obj.es || obj.en || Object.values(obj)[0] || null
  }
  return null
}

/**
 * Comprueba si una zona tiene contenido real (al menos 1 step)
 */
function hasContent(zone: { steps: Array<{ id: string }> }): boolean {
  return zone.steps.length > 0
}
