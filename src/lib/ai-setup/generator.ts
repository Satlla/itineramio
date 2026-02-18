/**
 * Manual generation orchestrator for AI Setup wizard.
 *
 * Template-first approach:
 * 1. Essential zones (check-in, check-out, wifi, house-rules, emergency, recycling)
 *    → use professional pre-built templates from zone-content-templates.ts (already trilingual)
 * 2. Appliance zones (one per detected appliance)
 *    → template if available, otherwise generateBasicApplianceContent (already trilingual)
 * 3. Location zones (directions, supermarkets, restaurants, etc.)
 *    → dynamic from Google Places (ES only, translated via Claude Haiku)
 *
 * Result: drastically less AI usage, more professional content, faster generation.
 */

import { prisma } from '../prisma'
import { generateSlug } from '../slug-utils'
import { generatePropertyNumber, extractNumberFromReference } from '../property-number-generator'
import { translateFields } from '../translate'
import { generateZoneQRCode } from '../qr'
import { fetchAllLocationData } from './places'
import { type MediaAnalysisResult, type DetectedAppliance } from './vision'
import { getZoneContentTemplate, type ZoneContentTemplate } from '../../data/zone-content-templates'
import {
  APPLIANCE_REGISTRY,
  generateBasicApplianceContent,
  getEmergencyNumbers,
  resolveCountryCode,
  normalizeAppliance,
  type CanonicalApplianceType,
} from './zone-registry'

// ============================================
// TYPES
// ============================================

export interface PropertyDetails {
  lockboxCode?: string
  lockboxLocation?: string
  doorCode?: string
  codeChangesPerReservation?: boolean
  meetingPoint?: string
  latePlan?: string
  latePlanDetails?: string
  hotWaterType?: string
  electricalPanelLocation?: string
  supportHoursFrom?: string
  supportHoursTo?: string
  emergencyPhone?: string
  recyclingContainerLocation?: string
  parkingSpotNumber?: string
  parkingFloor?: string
  parkingAccess?: string
  parkingAccessCode?: string
  keyReturn?: string
  keyReturnDetails?: string
  lateCheckout?: string
  lateCheckoutPrice?: string
  lateCheckoutUntil?: string
  luggageAfterCheckout?: string
  luggageUntil?: string
  luggageConsignaInfo?: string
  checkoutInstructions?: string
  items?: Record<string, { has: boolean; location: string }>
  recommendations?: string
}

export interface PropertyInput {
  name: string
  description: string
  profileImage?: string
  type: 'APARTMENT' | 'HOUSE' | 'ROOM' | 'VILLA'
  street: string
  city: string
  state: string
  country: string
  postalCode: string
  lat: number
  lng: number
  bedrooms: number
  bathrooms: number
  maxGuests: number
  squareMeters?: number
  wifiName?: string
  wifiPassword?: string
  checkInTime?: string
  checkInMethod?: string
  checkInInstructions?: string
  checkOutTime?: string
  hasParking?: string
  hasPool?: boolean
  hasAC?: boolean
  hostContactName: string
  hostContactPhone: string
  hostContactEmail: string
  hostContactLanguage?: string
  hostContactPhoto?: string
  details?: PropertyDetails
  disabledZones?: string[]
  reviewedContent?: Record<string, string>
}

export interface GenerationEvent {
  type: 'status' | 'zone' | 'translation' | 'complete' | 'error'
  message?: string
  zone?: { name: string; icon: string; description: string; stepsCount: number }
  language?: string
  progress?: number
  stats?: { zones: number; steps: number; languages: number; time: number }
  error?: string
}

type SendEvent = (event: GenerationEvent) => void

// ============================================
// TRILINGUAL ZONE CONFIG
// ============================================

interface TrilingualZoneConfig {
  name: { es: string; en: string; fr: string }
  icon: string
  description: { es: string; en: string; fr: string }
  steps: Array<{
    type: string
    title: { es: string; en: string; fr: string }
    content: { es: string; en: string; fr: string }
  }>
  needsTranslation: boolean
}

// ============================================
// HELPERS
// ============================================

function replaceVariables(text: string, vars: Record<string, string>): string {
  let result = text
  for (const [key, value] of Object.entries(vars)) {
    result = result.split(key).join(value)
  }
  return result
}

function applyPlaceholderDefaults(text: string, defaults: Record<string, string>): string {
  let result = text
  for (const [placeholder, defaultValue] of Object.entries(defaults)) {
    result = result.split(placeholder).join(defaultValue)
  }
  return result
}

/**
 * Remove any remaining unfilled [PLACEHOLDER] tokens from final content.
 * Lines with link/video/maps/taxi placeholders → remove entire line.
 * Other placeholders → remove the bracket token in-place.
 */
function cleanUnfilledPlaceholders(text: string): string {
  // Remove entire lines containing link/video/map/taxi/Instagram placeholders
  let result = text.replace(/^.*👉\s*\[.*?\].*$/gm, '')
  result = result.replace(/^.*🔗.*\[.*?\].*$/gm, '')
  result = result.replace(/^.*🚖.*\[.*?\].*$/gm, '')
  result = result.replace(/^.*@\[.*?\].*$/gm, '')

  // Remove entire lines that are just visual references or identifying info with placeholders
  // e.g. "• Fachada color [COLOR]" or "• [Referencia visual: ej. junto a farmacia]"
  result = result.replace(/^[•\s]*\[.*?\]$/gm, '')
  result = result.replace(/^[•\s]*Fachada color \[.*?\]$/gm, '')
  result = result.replace(/^[•\s]*Façade couleur \[.*?\]$/gm, '')
  result = result.replace(/^[•\s]*\[COLOR\].*$/gm, '')

  // Replace UBICACIÓN-type placeholders with generic text
  result = result.replace(/\[UBICACIÓN[^\]]*\]/g, 'consulta al anfitrión')
  result = result.replace(/\[LOCATION[^\]]*\]/g, 'ask the host')
  result = result.replace(/\[EMPLACEMENT[^\]]*\]/g, "demandez à l'hôte")

  // Replace common measurement/dimension placeholders
  result = result.replace(/\[X\]\s*€/g, '--€')
  result = result.replace(/\[X\]\s*m\b/g, '--')
  result = result.replace(/\[X\]\s*min/g, '--')
  result = result.replace(/\[X\]\s*Mbps/g, '--')

  // Remove remaining [PLACEHOLDER] tokens entirely (keep surrounding text)
  // This catches: [NOMBRE], [DIRECCIÓN], [NÚMERO], [HORA], [COLOR], [ENLACE_...], etc.
  result = result.replace(/\[([A-ZÁÉÍÓÚÑÜ_\s\/]+)\]/g, '')

  // Clean up artifacts: double spaces, blank bullet points, double blank lines
  result = result.replace(/  +/g, ' ')
  result = result.replace(/^[•\s]*$/gm, '')
  result = result.replace(/\n{3,}/g, '\n\n')
  return result.trim()
}

/**
 * Convert a pre-built template into a trilingual zone config with variable replacement.
 */
function templateToZoneConfig(
  template: ZoneContentTemplate,
  name: { es: string; en: string; fr: string },
  icon: string,
  description: { es: string; en: string; fr: string },
  vars: Record<string, string>,
  placeholderDefaults?: Record<string, string>,
): TrilingualZoneConfig {
  return {
    name,
    icon,
    description,
    steps: template.steps.map(step => {
      let contentEs = replaceVariables(step.content.es, vars)
      let contentEn = replaceVariables(step.content.en, vars)
      let contentFr = replaceVariables(step.content.fr, vars)

      if (placeholderDefaults) {
        contentEs = applyPlaceholderDefaults(contentEs, placeholderDefaults)
        contentEn = applyPlaceholderDefaults(contentEn, placeholderDefaults)
        contentFr = applyPlaceholderDefaults(contentFr, placeholderDefaults)
      }

      return {
        type: step.type,
        title: {
          es: replaceVariables(step.title.es, vars),
          en: replaceVariables(step.title.en, vars),
          fr: replaceVariables(step.title.fr, vars),
        },
        content: {
          es: cleanUnfilledPlaceholders(contentEs),
          en: cleanUnfilledPlaceholders(contentEn),
          fr: cleanUnfilledPlaceholders(contentFr),
        },
      }
    }),
    needsTranslation: false,
  }
}

/**
 * Assign uploaded media (images/videos) to the matching zone steps.
 * Matches by room_type or appliance canonical_type → zone name.
 */
async function assignMediaToSteps(
  propertyId: string,
  mediaItems: any[],
  zoneConfigs: TrilingualZoneConfig[],
): Promise<void> {
  // Build a map: zone name (ES lowercase) → appliance types that belong to it
  const zoneNameToAppliances = new Map<string, Set<string>>()
  for (const [type, entry] of Object.entries(APPLIANCE_REGISTRY)) {
    const nameEs = entry.nameEs.toLowerCase()
    const existing = zoneNameToAppliances.get(nameEs) || new Set()
    existing.add(type)
    zoneNameToAppliances.set(nameEs, existing)
  }

  // Room type → zone name mapping
  const roomTypeToZoneName: Record<string, string> = {
    kitchen: 'cocina',
    bathroom: 'baño',
    bedroom: 'dormitorio',
    living_room: 'salón',
    laundry: 'lavadora',
    entrance: 'check in',
    terrace: 'terraza',
    garden: 'jardín',
    pool: 'piscina',
    garage: 'parking',
    parking: 'parking',
  }

  // Get all zones with their first step from DB
  const dbZones = await prisma.zone.findMany({
    where: { propertyId },
    include: { steps: { orderBy: { order: 'asc' }, take: 1 } },
    orderBy: { order: 'asc' },
  })

  // User-assigned category → zone name (ES) mapping
  const categoryToZoneNameEs: Record<string, string> = {
    entrance: 'check in',
    check_out: 'check out',
    wifi: 'wifi',
    kitchen: 'cocina',
    bathroom: 'baño',
    bedroom: 'dormitorio',
    living_room: 'salón',
    parking: 'parking',
    ac: 'aire acondicionado',
    terrace: 'terraza',
    pool: 'piscina',
    tv: 'televisión',
    washing_machine: 'lavadora',
    dishwasher: 'lavavajillas',
    microwave: 'microondas',
    coffee: 'cafetera',
  }

  // Track which zones already got a media item (max 1 per zone)
  const assignedZoneIds = new Set<string>()

  for (const mediaItem of mediaItems) {
    if (!mediaItem.url) continue
    const analysis = mediaItem.analysis || mediaItem
    const category = mediaItem.category as string | undefined

    // Skip if no useful data at all
    if (!category && !analysis.room_type && !analysis.appliances?.length) continue

    const mediaType = mediaItem.type === 'video' ? 'VIDEO' : 'IMAGE'
    const mediaUrl = mediaItem.url
    const caption = (mediaItem.caption || '').trim()

    // Helper to update a step with media + optional caption
    const assignToStep = async (step: any, dbZone: any) => {
      const existingContent = (step.content as any) || {}
      const updatedContent: any = { ...existingContent, mediaUrl }
      // If the user wrote a caption, append it to the ES content
      if (caption) {
        const existingEs = existingContent.es || ''
        updatedContent.es = existingEs ? `${existingEs}\n\n${caption}` : caption
      }
      await prisma.step.update({
        where: { id: step.id },
        data: { type: mediaType, content: updatedContent },
      })
      assignedZoneIds.add(dbZone.id)
    }

    // Priority 1: user-assigned category
    let matched = false
    if (category) {
      const targetName = categoryToZoneNameEs[category]
      if (targetName) {
        const dbZone = dbZones.find(z => {
          if (assignedZoneIds.has(z.id)) return false
          const name = typeof z.name === 'object' ? (z.name as any).es : z.name
          return name?.toLowerCase().includes(targetName)
        })
        if (dbZone && dbZone.steps.length > 0) {
          await assignToStep(dbZone.steps[0], dbZone)
          matched = true
          console.log(`[generator] Assigned ${mediaType} to zone "${(dbZone.name as any)?.es}" via category "${category}"`)
        }
      }
    }

    if (matched) continue

    // Priority 2: match by appliance (more specific than room_type)
    if (analysis.appliances?.length) {
      for (const appliance of analysis.appliances) {
        const canonicalType = appliance.canonical_type
        // Find which zone name this appliance belongs to
        for (const [zoneNameLower, types] of zoneNameToAppliances.entries()) {
          if (types.has(canonicalType)) {
            // Find the DB zone with this name
            const dbZone = dbZones.find(z => {
              if (assignedZoneIds.has(z.id)) return false
              const name = typeof z.name === 'object' ? (z.name as any).es : z.name
              return name?.toLowerCase().includes(zoneNameLower)
            })
            if (dbZone && dbZone.steps.length > 0) {
              await assignToStep(dbZone.steps[0], dbZone)
              matched = true
              console.log(`[generator] Assigned ${mediaType} to zone "${(dbZone.name as any)?.es}" step "${(dbZone.steps[0].title as any)?.es}"`)
              break
            }
          }
        }
        if (matched) break
      }
    }

    // Priority 3: match by room_type
    if (!matched && analysis.room_type) {
      const targetName = roomTypeToZoneName[analysis.room_type]
      if (targetName) {
        const dbZone = dbZones.find(z => {
          if (assignedZoneIds.has(z.id)) return false
          const name = typeof z.name === 'object' ? (z.name as any).es : z.name
          return name?.toLowerCase().includes(targetName)
        })
        if (dbZone && dbZone.steps.length > 0) {
          await assignToStep(dbZone.steps[0], dbZone)
          console.log(`[generator] Assigned ${mediaType} to zone "${(dbZone.name as any)?.es}" via room_type "${analysis.room_type}"`)
        }
      }
    }
  }
}

/**
 * Categories that map to built-in zones (check-in, check-out, wifi, etc.)
 * Media assigned to these should NOT also create appliance zones.
 */
const BUILTIN_USER_CATEGORIES = new Set(['entrance', 'check_out', 'wifi', 'parking', 'ac'])

/**
 * Normalize media analysis to new format (handles old {zone, items[]} format).
 * Preserves user-assigned category so buildApplianceZones can skip built-in media.
 */
function normalizeMediaInput(raw: any): MediaAnalysisResult {
  // MediaItem objects from the wizard have analysis nested inside
  const data = raw.analysis || raw
  const userCategory = raw.category as string | undefined

  if (data.zone && !data.room_type) {
    return {
      room_type: data.zone,
      appliances: (data.items || []).map((item: string) => ({
        detected_label: item,
        canonical_type: normalizeAppliance(item) || item,
        confidence: data.confidence || 0.8,
      })),
      description: data.description || '',
      confidence: data.confidence || 0.8,
      userCategory,
    }
  }
  return { ...data, userCategory } as MediaAnalysisResult
}

// ============================================
// ESSENTIAL ZONE BUILDERS (template-based)
// ============================================

function buildCheckInZone(input: PropertyInput): TrilingualZoneConfig {
  const template = getZoneContentTemplate('check-in')
  if (!template) return buildFallbackCheckIn(input)

  const timeEs = input.checkInTime || '15:00'
  const timeEn = input.checkInTime || '3:00 PM'
  const timeFr = input.checkInTime || '15h00'
  const d = input.details || {}

  // Build access instructions based on checkInMethod
  let accessEs = '', accessEn = '', accessFr = ''
  if (input.checkInMethod === 'lockbox') {
    accessEs = `🔐 **Acceso autónomo con cajetín:**\n1. Localiza el cajetín: **${d.lockboxLocation || 'consulta al anfitrión'}**\n2. Introduce el código: **se enviará antes de tu llegada**\n3. Recoge las llaves y abre la puerta`
    accessEn = `🔐 **Self check-in with lockbox:**\n1. Find the lockbox: **${d.lockboxLocation || 'ask the host'}**\n2. Enter the code: **will be sent before arrival**\n3. Pick up the keys and open the door`
    accessFr = `🔐 **Arrivée autonome avec boîte à clés:**\n1. Trouvez la boîte: **${d.lockboxLocation || "demandez à l'hôte"}**\n2. Entrez le code: **sera envoyé avant l'arrivée**\n3. Récupérez les clés et ouvrez la porte`
  } else if (input.checkInMethod === 'code') {
    const codeNote = d.codeChangesPerReservation
      ? '\n📲 El código se envía con cada reserva.'
      : ''
    accessEs = `🔢 **Cerradura con código:**\nEl código de acceso **se enviará antes de tu llegada**. Introdúcelo en el teclado de la puerta.${codeNote}`
    accessEn = `🔢 **Code lock:**\nThe access code **will be sent before arrival**. Enter it on the door keypad.${d.codeChangesPerReservation ? '\n📲 Code is sent with each reservation.' : ''}`
    accessFr = `🔢 **Serrure à code:**\nLe code d'accès **sera envoyé avant l'arrivée**. Entrez-le sur le clavier de la porte.${d.codeChangesPerReservation ? '\n📲 Le code est envoyé avec chaque réservation.' : ''}`
  } else {
    accessEs = `🤝 **Recepción en persona:**\nNos vemos en: **${d.meetingPoint || 'el portal del edificio'}**\n📲 Confirma tu hora de llegada por WhatsApp.`
    accessEn = `🤝 **In-person greeting:**\nWe'll meet at: **${d.meetingPoint || 'the building entrance'}**\n📲 Confirm your arrival time via WhatsApp.`
    accessFr = `🤝 **Accueil en personne:**\nRendez-vous à: **${d.meetingPoint || "l'entrée de l'immeuble"}**\n📲 Confirmez votre heure d'arrivée par WhatsApp.`
  }

  const vars: Record<string, string> = {
    '[15:00 h]': `${timeEs} h`,
    '[3:00 PM]': timeEn,
    '[15h00]': timeFr,
    '[CALLE Y NÚMERO]': input.street,
    '[STREET AND NUMBER]': input.street,
    '[RUE ET NUMÉRO]': input.street,
    '[CÓDIGO POSTAL, CIUDAD]': `${input.postalCode}, ${input.city}`,
    '[POSTAL CODE, CITY]': `${input.postalCode}, ${input.city}`,
    '[CODE POSTAL, VILLE]': `${input.postalCode}, ${input.city}`,
  }

  const result = templateToZoneConfig(
    template,
    { es: 'Check In', en: 'Check In', fr: 'Check In' },
    'key',
    { es: 'Proceso de entrada al apartamento', en: 'Apartment check-in process', fr: "Processus d'arrivée" },
    vars,
  )

  // Replace the generic access section in step[0] with specific instructions
  if (result.steps.length > 0) {
    // If the owner wrote custom instructions, use them as the main content
    const customInstructions = (input.checkInInstructions || '').trim()
    if (customInstructions) {
      result.steps[0].content.es = `🕒 **Entrada desde:** ${timeEs} h\n\n${customInstructions}\n\n${accessEs}`
      // EN/FR will be translated automatically since we mark needsTranslation
      result.steps[0].content.en = ''
      result.steps[0].content.fr = ''
      result.needsTranslation = true
    } else {
      result.steps[0].content.es = `🕒 **Entrada desde:** ${timeEs} h\n⏰ **Early check-in:** Escríbenos y te diremos si es posible.\n🌙 **Llegadas tarde:** Sin problema, el acceso es autónomo 24h.\n📲 **Importante:** Indícanos tu hora estimada por WhatsApp.\n\n${accessEs}`
      result.steps[0].content.en = `🕒 **Check-in from:** ${timeEn}\n⏰ **Early check-in:** Contact us and we'll let you know.\n🌙 **Late arrivals:** No problem, access is autonomous 24h.\n📲 **Important:** Let us know your estimated arrival time via WhatsApp.\n\n${accessEn}`
      result.steps[0].content.fr = `🕒 **Arrivée à partir de:** ${timeFr}\n⏰ **Early check-in:** Contactez-nous.\n🌙 **Arrivées tardives:** Pas de problème, accès autonome 24h.\n📲 **Important:** Indiquez-nous votre heure d'arrivée par WhatsApp.\n\n${accessFr}`
    }
  }

  return result
}

function buildFallbackCheckIn(input: PropertyInput): TrilingualZoneConfig {
  const steps: TrilingualZoneConfig['steps'] = []
  if (input.checkInTime) {
    steps.push({
      type: 'text',
      title: { es: 'Hora de check-in', en: 'Check-in time', fr: "Heure d'arrivée" },
      content: {
        es: `La hora de entrada es a partir de las **${input.checkInTime}**.`,
        en: `Check-in time is from **${input.checkInTime}**.`,
        fr: `L'heure d'arrivée est à partir de **${input.checkInTime}**.`,
      },
    })
  }
  if (input.checkInMethod) {
    const methods: Record<string, { es: string; en: string; fr: string }> = {
      key: {
        es: 'Se entregará una llave en persona.',
        en: 'A key will be handed to you in person.',
        fr: 'Une clé vous sera remise en personne.',
      },
      lockbox: {
        es: 'Las llaves están en una caja de seguridad (lockbox). El anfitrión te enviará el código.',
        en: 'Keys are in a lockbox. The host will send you the code.',
        fr: "Les clés sont dans une boîte à clés. L'hôte vous enverra le code.",
      },
      code: {
        es: 'La puerta tiene cerradura con código. El anfitrión te enviará el código de acceso.',
        en: 'The door has a code lock. The host will send you the access code.',
        fr: "La porte a une serrure à code. L'hôte vous enverra le code.",
      },
      'in-person': {
        es: 'El anfitrión te recibirá en persona para entregarte las llaves.',
        en: 'The host will greet you in person to hand over the keys.',
        fr: "L'hôte vous accueillera en personne pour vous remettre les clés.",
      },
    }
    const m = methods[input.checkInMethod] || methods['in-person']
    steps.push({
      type: 'text',
      title: { es: 'Método de entrada', en: 'Entry method', fr: "Méthode d'accès" },
      content: m,
    })
  }
  return {
    name: { es: 'Check In', en: 'Check In', fr: 'Check In' },
    icon: 'key',
    description: { es: 'Proceso de entrada', en: 'Check-in process', fr: "Processus d'arrivée" },
    steps,
    needsTranslation: false,
  }
}

function buildCheckOutZone(input: PropertyInput): TrilingualZoneConfig {
  const timeEs = input.checkOutTime || '11:00'
  const timeEn = input.checkOutTime || '11:00 AM'
  const timeFr = input.checkOutTime || '11h00'
  const d = input.details || {}

  // Build key return instructions
  const keyReturnMap: Record<string, { es: string; en: string; fr: string }> = {
    lockbox: {
      es: '🔑 Devuelve las llaves al cajetín y asegúrate de que queda cerrado.',
      en: '🔑 Return the keys to the lockbox and make sure it\'s locked.',
      fr: '🔑 Remettez les clés dans la boîte et vérifiez qu\'elle est fermée.',
    },
    inside_table: {
      es: '🔑 Deja las llaves encima de la mesa del salón/entrada.',
      en: '🔑 Leave the keys on the living room/entrance table.',
      fr: '🔑 Laissez les clés sur la table du salon/entrée.',
    },
    code_auto: {
      es: '🔑 Simplemente cierra la puerta al salir. El código se desactivará automáticamente.',
      en: '🔑 Simply close the door when leaving. The code will deactivate automatically.',
      fr: '🔑 Fermez simplement la porte en partant. Le code se désactivera automatiquement.',
    },
    hand: {
      es: `🔑 Entrega las llaves en mano. ${d.keyReturnDetails || 'Coordina con el anfitrión.'}`,
      en: `🔑 Hand over the keys in person. ${d.keyReturnDetails || 'Coordinate with the host.'}`,
      fr: `🔑 Remettez les clés en main. ${d.keyReturnDetails || "Coordonnez avec l'hôte."}`,
    },
  }
  const keyReturn = keyReturnMap[d.keyReturn || 'lockbox'] || keyReturnMap.lockbox

  // Late checkout info
  let lateCheckoutEs = '', lateCheckoutEn = '', lateCheckoutFr = ''
  if (d.lateCheckout === 'yes_paid' && d.lateCheckoutPrice) {
    lateCheckoutEs = `\n\n⏰ **Late checkout disponible:** Hasta las ${d.lateCheckoutUntil || '14:00'} por ${d.lateCheckoutPrice}. Consúltanos con 24h de antelación.`
    lateCheckoutEn = `\n\n⏰ **Late checkout available:** Until ${d.lateCheckoutUntil || '2:00 PM'} for ${d.lateCheckoutPrice}. Ask us 24h in advance.`
    lateCheckoutFr = `\n\n⏰ **Late checkout disponible:** Jusqu'à ${d.lateCheckoutUntil || '14h00'} pour ${d.lateCheckoutPrice}. Demandez 24h à l'avance.`
  } else if (d.lateCheckout === 'yes_free') {
    lateCheckoutEs = '\n\n⏰ **Late checkout:** Según disponibilidad. Consúltanos con 24h de antelación.'
    lateCheckoutEn = '\n\n⏰ **Late checkout:** Subject to availability. Ask us 24h in advance.'
    lateCheckoutFr = "\n\n⏰ **Late checkout:** Selon disponibilité. Demandez 24h à l'avance."
  }

  // Luggage info
  let luggageEs = '', luggageEn = '', luggageFr = ''
  if (d.luggageAfterCheckout === 'yes_in_apartment') {
    luggageEs = `\n\n📦 **Equipaje:** Puedes dejar tus maletas en el apartamento hasta las ${d.luggageUntil || '15:00'}.`
    luggageEn = `\n\n📦 **Luggage:** You can leave your bags in the apartment until ${d.luggageUntil || '3:00 PM'}.`
    luggageFr = `\n\n📦 **Bagages:** Vous pouvez laisser vos valises dans l'appartement jusqu'à ${d.luggageUntil || '15h00'}.`
  } else if (d.luggageAfterCheckout === 'yes_consigna') {
    luggageEs = `\n\n📦 **Equipaje:** Hay una consigna cercana: ${d.luggageConsignaInfo || 'consulta al anfitrión'}.`
    luggageEn = `\n\n📦 **Luggage:** There's a nearby luggage storage: ${d.luggageConsignaInfo || 'ask the host'}.`
    luggageFr = `\n\n📦 **Bagages:** Il y a une consigne à proximité: ${d.luggageConsignaInfo || "demandez à l'hôte"}.`
  }

  // Check if the owner wrote custom checkout instructions
  const customCheckout = (d.checkoutInstructions || '').trim()
  let needsTranslation = false

  let steps: TrilingualZoneConfig['steps']

  if (customCheckout) {
    // Use the owner's custom instructions as the main content
    steps = [
      {
        type: 'text',
        title: { es: 'Hora y llaves', en: 'Time and keys', fr: 'Heure et clés' },
        content: {
          es: `**Hora de salida:** Antes de las **${timeEs}**\n\n${keyReturn.es}${lateCheckoutEs}${luggageEs}`,
          en: `**Check-out time:** Before **${timeEn}**\n\n${keyReturn.en}${lateCheckoutEn}${luggageEn}`,
          fr: `**Heure de départ:** Avant **${timeFr}**\n\n${keyReturn.fr}${lateCheckoutFr}${luggageFr}`,
        },
      },
      {
        type: 'text',
        title: { es: 'Instrucciones de salida', en: '', fr: '' },
        content: {
          es: customCheckout,
          en: '',
          fr: '',
        },
      },
    ]
    needsTranslation = true
  } else {
    steps = [
      {
        type: 'text',
        title: { es: 'Hora y llaves', en: 'Time and keys', fr: 'Heure et clés' },
        content: {
          es: `**Hora de salida:** Antes de las **${timeEs}**\n\n${keyReturn.es}${lateCheckoutEs}${luggageEs}`,
          en: `**Check-out time:** Before **${timeEn}**\n\n${keyReturn.en}${lateCheckoutEn}${luggageEn}`,
          fr: `**Heure de départ:** Avant **${timeFr}**\n\n${keyReturn.fr}${lateCheckoutFr}${luggageFr}`,
        },
      },
      {
        type: 'text',
        title: { es: 'Antes de salir', en: 'Before leaving', fr: 'Avant de partir' },
        content: {
          es: `✅ **Por favor, antes de irte:**\n\n**Imprescindible:**\n☐ Cierra todas las ventanas\n☐ Apaga luces, TV y aire acondicionado/calefacción\n☐ Cierra los grifos\n☐ ${keyReturn.es}\n\n**Ayúdanos (no obligatorio):**\n☐ Deja la basura en los contenedores de la calle\n☐ Deja los platos sucios en el fregadero\n☐ Deja las toallas usadas en la bañera/ducha\n\n❌ **NO hace falta:** Hacer las camas, limpiar el apartamento ni pasar la aspiradora.`,
          en: `✅ **Please, before leaving:**\n\n**Essential:**\n☐ Close all windows\n☐ Turn off lights, TV and AC/heating\n☐ Close taps\n☐ ${keyReturn.en}\n\n**Help us (not mandatory):**\n☐ Take trash to street containers\n☐ Leave dirty dishes in sink\n☐ Leave used towels in bathtub/shower\n\n❌ **NO need to:** Make beds, clean the apartment or vacuum.`,
          fr: `✅ **S'il vous plaît, avant de partir:**\n\n**Essentiel:**\n☐ Fermez toutes les fenêtres\n☐ Éteignez lumières, TV et climatisation/chauffage\n☐ Fermez les robinets\n☐ ${keyReturn.fr}\n\n**Aidez-nous (pas obligatoire):**\n☐ Mettez les poubelles dans les conteneurs\n☐ Laissez la vaisselle sale dans l'évier\n☐ Laissez les serviettes dans la baignoire/douche\n\n❌ **PAS besoin de:** Faire les lits, nettoyer l'appartement ni passer l'aspirateur.`,
        },
      },
    ]
  }

  return {
    name: { es: 'Check Out', en: 'Check Out', fr: 'Check Out' },
    icon: 'log-out',
    description: { es: 'Instrucciones para la salida', en: 'Check-out instructions', fr: 'Instructions de départ' },
    steps,
    needsTranslation,
  }
}

function buildWifiZone(input: PropertyInput): TrilingualZoneConfig | null {
  if (!input.wifiName) return null

  const template = getZoneContentTemplate('wifi')
  const pwd = input.wifiPassword || '(consultar al anfitrión / ask host / demander à l\'hôte)'

  if (!template) {
    return {
      name: { es: 'WiFi', en: 'WiFi', fr: 'WiFi' },
      icon: 'wifi',
      description: { es: 'Conexión a internet', en: 'Internet connection', fr: 'Connexion internet' },
      steps: [{
        type: 'text',
        title: { es: 'Datos de conexión', en: 'Connection details', fr: 'Détails de connexion' },
        content: {
          es: `📶 **Red:** ${input.wifiName}\n🔑 **Contraseña:** ${pwd}`,
          en: `📶 **Network:** ${input.wifiName}\n🔑 **Password:** ${pwd}`,
          fr: `📶 **Réseau:** ${input.wifiName}\n🔑 **Mot de passe:** ${pwd}`,
        },
      }],
      needsTranslation: false,
    }
  }

  return templateToZoneConfig(
    template,
    { es: 'WiFi', en: 'WiFi', fr: 'WiFi' },
    'wifi',
    { es: 'Conexión a internet', en: 'Internet connection', fr: 'Connexion internet' },
    {
      '[NOMBRE_RED]': input.wifiName,
      '[NETWORK_NAME]': input.wifiName,
      '[NOM_RÉSEAU]': input.wifiName,
      '[CONTRASEÑA]': pwd,
      '[PASSWORD]': pwd,
      '[MOT_DE_PASSE]': pwd,
    },
  )
}

function buildHouseRulesZone(input: PropertyInput): TrilingualZoneConfig {
  const template = getZoneContentTemplate('house-rules')
  if (!template) {
    return {
      name: { es: 'Normas de la Casa', en: 'House Rules', fr: 'Règles de la Maison' },
      icon: 'scroll-text',
      description: { es: 'Reglas del alojamiento', en: 'Accommodation rules', fr: 'Règles du logement' },
      steps: [{
        type: 'text',
        title: { es: 'Normas principales', en: 'Main rules', fr: 'Règles principales' },
        content: {
          es: `🚭 No fumar\n🎉 No fiestas\n🔇 Silencio: 22:00-08:00\n👥 Máximo: ${input.maxGuests} personas`,
          en: `🚭 No smoking\n🎉 No parties\n🔇 Quiet hours: 10 PM - 8 AM\n👥 Maximum: ${input.maxGuests} people`,
          fr: `🚭 Non fumeur\n🎉 Pas de fêtes\n🔇 Silence: 22h-8h\n👥 Maximum: ${input.maxGuests} personnes`,
        },
      }],
      needsTranslation: false,
    }
  }

  return templateToZoneConfig(
    template,
    { es: 'Normas de la Casa', en: 'House Rules', fr: 'Règles de la Maison' },
    'scroll-text',
    { es: 'Reglas y políticas del alojamiento', en: 'Rules and policies', fr: 'Règles et politiques' },
    { '[X]': input.maxGuests.toString() },
  )
}

function buildRecyclingZone(input: PropertyInput): TrilingualZoneConfig {
  const d = input.details || {}
  const containerLocation = d.recyclingContainerLocation || ''

  const template = getZoneContentTemplate('recycling')
  if (!template) {
    return {
      name: { es: 'Reciclaje', en: 'Recycling', fr: 'Recyclage' },
      icon: 'recycle',
      description: { es: 'Separación de residuos', en: 'Waste separation', fr: 'Tri des déchets' },
      steps: [{
        type: 'text',
        title: { es: 'Separación de residuos', en: 'Waste separation', fr: 'Tri des déchets' },
        content: {
          es: `♻️ Separa la basura: 🟡 Plásticos | 🟢 Vidrio | 🔵 Papel | ⚫ Resto${containerLocation ? `\n\n📍 **Contenedores más cercanos:** ${containerLocation}` : ''}`,
          en: `♻️ Separate waste: 🟡 Plastics | 🟢 Glass | 🔵 Paper | ⚫ General${containerLocation ? `\n\n📍 **Nearest containers:** ${containerLocation}` : ''}`,
          fr: `♻️ Triez vos déchets: 🟡 Plastiques | 🟢 Verre | 🔵 Papier | ⚫ Reste${containerLocation ? `\n\n📍 **Conteneurs les plus proches:** ${containerLocation}` : ''}`,
        },
      }],
      needsTranslation: false,
    }
  }

  const vars: Record<string, string> = {}
  if (containerLocation) {
    vars['[UBICACIÓN - ej: Esquina de calle X con calle Y]'] = containerLocation
    vars['[LOCATION - e.g.: Corner of X street and Y street]'] = containerLocation
    vars['[EMPLACEMENT - ex: Coin de la rue X et rue Y]'] = containerLocation
  }

  return templateToZoneConfig(
    template,
    { es: 'Reciclaje', en: 'Recycling', fr: 'Recyclage' },
    'recycle',
    { es: 'Separación y recogida de residuos', en: 'Waste separation and collection', fr: 'Tri et collecte des déchets' },
    vars,
  )
}

// ============================================
// EMERGENCY ZONE (template + country-specific numbers)
// ============================================

interface NearbyHospital {
  name: string
  address: string
  distance: string
}

function buildEmergencyZone(
  input: PropertyInput,
  hospitals: NearbyHospital[],
): TrilingualZoneConfig {
  const template = getZoneContentTemplate('emergency-contacts')
  const countryCode = resolveCountryCode(input.country)
  const numbers = getEmergencyNumbers(countryCode)

  // Country-specific emergency content
  const emergencyEs = buildEmergencyContent(numbers, 'es')
  const emergencyEn = buildEmergencyContent(numbers, 'en')
  const emergencyFr = buildEmergencyContent(numbers, 'fr')

  // Append hospital info
  if (hospitals.length > 0) {
    const hEs = hospitals.map(h => `🏥 **${h.name}**\n${h.address}\n📍 A ${h.distance}`).join('\n\n')
    const hEn = hospitals.map(h => `🏥 **${h.name}**\n${h.address}\n📍 ${h.distance} away`).join('\n\n')
    const hFr = hospitals.map(h => `🏥 **${h.name}**\n${h.address}\n📍 À ${h.distance}`).join('\n\n')
    emergencyEs.content += `\n\n${hEs}`
    emergencyEn.content += `\n\n${hEn}`
    emergencyFr.content += `\n\n${hFr}`
  }

  const d = input.details || {}
  const hoursFrom = d.supportHoursFrom || '09:00'
  const hoursTo = d.supportHoursTo || '22:00'
  const urgencyPhone = d.emergencyPhone || input.hostContactPhone

  if (!template) {
    return {
      name: { es: 'Emergencias', en: 'Emergencies', fr: 'Urgences' },
      icon: 'phone',
      description: { es: 'Contactos y teléfonos de emergencia', en: 'Emergency contacts', fr: "Contacts d'urgence" },
      steps: [
        {
          type: 'text',
          title: { es: 'Tu anfitrión', en: 'Your host', fr: 'Votre hôte' },
          content: {
            es: `👤 **Anfitrión:** ${input.hostContactName}\n📱 **WhatsApp/Tel:** ${input.hostContactPhone}\n📧 **Email:** ${input.hostContactEmail}\n\n⏰ **Horario de atención:** ${hoursFrom} - ${hoursTo}\n🆘 **Urgencias 24h:** ${urgencyPhone}`,
            en: `👤 **Host:** ${input.hostContactName}\n📱 **WhatsApp/Phone:** ${input.hostContactPhone}\n📧 **Email:** ${input.hostContactEmail}\n\n⏰ **Support hours:** ${hoursFrom} - ${hoursTo}\n🆘 **24h Emergencies:** ${urgencyPhone}`,
            fr: `👤 **Hôte:** ${input.hostContactName}\n📱 **WhatsApp/Tél:** ${input.hostContactPhone}\n📧 **Email:** ${input.hostContactEmail}\n\n⏰ **Heures de support:** ${hoursFrom} - ${hoursTo}\n🆘 **Urgences 24h:** ${urgencyPhone}`,
          },
        },
        {
          type: 'text',
          title: emergencyEs.title,
          content: { es: emergencyEs.content, en: emergencyEn.content, fr: emergencyFr.content },
        },
      ],
      needsTranslation: false,
    }
  }

  // Use template with variable replacement
  const vars: Record<string, string> = {
    '[NOMBRE]': input.hostContactName,
    '[NAME]': input.hostContactName,
    '[NOM]': input.hostContactName,
    '[NÚMERO]': input.hostContactPhone,
    '[NUMBER]': input.hostContactPhone,
    '[NUMÉRO]': input.hostContactPhone,
    '[EMAIL]': input.hostContactEmail,
    '[TELÉFONO]': urgencyPhone,
    '[PHONE]': urgencyPhone,
    '[TÉLÉPHONE]': urgencyPhone,
    '9:00-22:00': `${hoursFrom} - ${hoursTo}`,
    '9 AM - 10 PM': `${hoursFrom} - ${hoursTo}`,
    '9h-22h': `${hoursFrom} - ${hoursTo}`,
  }

  const result = templateToZoneConfig(
    template,
    { es: 'Emergencias', en: 'Emergencies', fr: 'Urgences' },
    'phone',
    { es: 'Contactos y teléfonos de emergencia', en: 'Emergency contacts', fr: "Contacts d'urgence" },
    vars,
  )

  // Override step[1] (emergency numbers) with country-specific content
  if (result.steps.length > 1) {
    result.steps[1] = {
      type: 'text',
      title: { es: 'Emergencias', en: 'Emergencies', fr: 'Urgences' },
      content: { es: emergencyEs.content, en: emergencyEn.content, fr: emergencyFr.content },
    }
  }

  // Override step[2] (troubleshooting) with data from Step2 details
  if (result.steps.length > 2) {
    const panelLocation = d.electricalPanelLocation || 'la entrada'
    result.steps[2] = {
      type: 'text',
      title: { es: 'Problemas en el apartamento', en: 'Apartment problems', fr: "Problèmes dans l'appartement" },
      content: {
        es: `🔧 **Problemas comunes y soluciones:**\n**💡 Se va la luz:** Cuadro eléctrico en ${panelLocation}. Sube los interruptores que estén bajados.\n\n**🚿 No hay agua caliente:** Espera 2 min con el grifo abierto. Si persiste, contáctanos.\n\n**🚽 WC atascado:** Usa el desatascador (bajo el lavabo). Si no se resuelve, contáctanos.\n\n**🔑 No puedo abrir la puerta:** Llámame inmediatamente: ${urgencyPhone}\n\n⚠️ **Nunca intentes reparar algo por tu cuenta. Contáctanos primero.**`,
        en: `🔧 **Common problems and solutions:**\n**💡 Power goes out:** Electrical panel at ${panelLocation}. Flip up any tripped switches.\n\n**🚿 No hot water:** Wait 2 min with tap running. If it persists, contact us.\n\n**🚽 Toilet clogged:** Use the plunger (under the sink). If unresolved, contact us.\n\n**🔑 Can't open the door:** Call me immediately: ${urgencyPhone}\n\n⚠️ **Never try to fix something yourself. Contact us first.**`,
        fr: `🔧 **Problèmes courants et solutions:**\n**💡 Coupure de courant:** Tableau électrique à ${panelLocation}. Remontez les interrupteurs.\n\n**🚿 Pas d'eau chaude:** Attendez 2 min avec le robinet ouvert. Si ça persiste, contactez-nous.\n\n**🚽 WC bouché:** Utilisez la ventouse (sous le lavabo). Si non résolu, contactez-nous.\n\n**🔑 Je ne peux pas ouvrir la porte:** Appelez-moi immédiatement: ${urgencyPhone}\n\n⚠️ **N'essayez jamais de réparer quelque chose vous-même. Contactez-nous d'abord.**`,
      },
    }
  }

  return result
}

function buildEmergencyContent(
  numbers: { general: string; police?: string; medical?: string; fire?: string },
  lang: 'es' | 'en' | 'fr',
): { title: { es: string; en: string; fr: string }; content: string } {
  const labels = {
    es: { general: 'EMERGENCIAS GENERALES', police: 'Policía', medical: 'Urgencias médicas', fire: 'Bomberos', specific: 'Servicios específicos' },
    en: { general: 'GENERAL EMERGENCIES', police: 'Police', medical: 'Medical emergencies', fire: 'Fire department', specific: 'Specific services' },
    fr: { general: 'URGENCES GÉNÉRALES', police: 'Police', medical: 'Urgences médicales', fire: 'Pompiers', specific: 'Services spécifiques' },
  }

  const l = labels[lang]
  let content = `🚨 **${l.general}:** ${numbers.general}`

  const specific: string[] = []
  if (numbers.police) specific.push(`• ${l.police}: ${numbers.police}`)
  if (numbers.medical) specific.push(`• ${l.medical}: ${numbers.medical}`)
  if (numbers.fire) specific.push(`• ${l.fire}: ${numbers.fire}`)

  if (specific.length > 0) {
    content += `\n\n📞 **${l.specific}:**\n${specific.join('\n')}`
  }

  return {
    title: { es: 'Emergencias', en: 'Emergencies', fr: 'Urgences' },
    content,
  }
}

// ============================================
// APPLIANCE ZONE BUILDERS (one zone per appliance)
// ============================================

function buildApplianceZones(mediaAnalysis: MediaAnalysisResult[]): TrilingualZoneConfig[] {
  const zones: TrilingualZoneConfig[] = []
  const processedTypes = new Set<string>()

  for (const analysis of mediaAnalysis) {
    // Skip media assigned to built-in zones (check-in, wifi, etc.)
    // Their primary_item/appliances should NOT create separate appliance zones
    if (analysis.userCategory && BUILTIN_USER_CATEGORIES.has(analysis.userCategory)) {
      continue
    }

    // Priority: check primary_item first (specific appliance the media focuses on)
    if (analysis.primary_item) {
      const type = analysis.primary_item as CanonicalApplianceType
      if (!processedTypes.has(type)) {
        processedTypes.add(type)
        const registry = APPLIANCE_REGISTRY[type]
        if (registry) {
          const zone = buildSingleApplianceZone(type, registry)
          if (zone) zones.push(zone)
        }
      }
    }

    // Then iterate all detected appliances
    if (!analysis.appliances) continue
    for (const appliance of analysis.appliances) {
      const type = appliance.canonical_type as CanonicalApplianceType
      if (processedTypes.has(type)) continue
      processedTypes.add(type)

      const registry = APPLIANCE_REGISTRY[type]
      if (!registry) continue

      const zone = buildSingleApplianceZone(type, registry)
      if (zone) zones.push(zone)
    }
  }

  return zones
}

function buildSingleApplianceZone(
  type: CanonicalApplianceType,
  registry: typeof APPLIANCE_REGISTRY[CanonicalApplianceType],
): TrilingualZoneConfig | null {
  // If there's a content template, use it
  if (registry.templateId) {
    const template = getZoneContentTemplate(registry.templateId)
    if (template) {
      return templateToZoneConfig(
        template,
        { es: registry.nameEs, en: registry.nameEn, fr: registry.nameFr },
        registry.icon,
        { es: registry.descriptionEs, en: registry.descriptionEn, fr: registry.descriptionFr },
        {},
        registry.placeholderDefaults,
      )
    }
  }

  // No template — use generateBasicApplianceContent
  const basicContent = generateBasicApplianceContent(type)
  if (!basicContent.steps || basicContent.steps.length === 0) return null

  return {
    name: { es: registry.nameEs, en: registry.nameEn, fr: registry.nameFr },
    icon: registry.icon,
    description: { es: registry.descriptionEs, en: registry.descriptionEn, fr: registry.descriptionFr },
    steps: basicContent.steps.map(step => ({
      type: 'text',
      title: { es: step.titleEs, en: step.titleEn, fr: step.titleFr },
      content: { es: step.es, en: step.en, fr: step.fr },
    })),
    needsTranslation: false,
  }
}

// ============================================
// RECOMMENDATION ZONE BUILDER (host-provided places → Claude categorization)
// ============================================

const RECOMMENDATION_MODEL = 'claude-haiku-4-5-20251001'

async function buildRecommendationZones(
  recommendations: string,
  city: string,
  sendEvent: SendEvent,
): Promise<TrilingualZoneConfig[]> {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''
  if (!ANTHROPIC_API_KEY) {
    console.error('[generator] No ANTHROPIC_API_KEY — skipping recommendation zones')
    return []
  }

  sendEvent({ type: 'status', message: 'Categorizando tus recomendaciones...' })

  const prompt = `You are helping generate a vacation rental guest manual for a property in ${city}.

The host recommends these places: "${recommendations}"

Categorize each place and generate a short description (1 sentence) in Spanish, English, and French.

IMPORTANT: Respond with ONLY valid JSON (no markdown fences, no explanation).

Response format:
{
  "categories": [
    {
      "name": {"es": "Restaurantes", "en": "Restaurants", "fr": "Restaurants"},
      "icon": "utensils-crossed",
      "places": [
        {
          "name": "Nou Manolín",
          "description": {
            "es": "Tapas tradicionales alicantinas con productos del mar frescos.",
            "en": "Traditional Alicante tapas with fresh seafood.",
            "fr": "Tapas traditionnelles d'Alicante avec fruits de mer frais."
          }
        }
      ]
    }
  ]
}

Category suggestions (use the most appropriate):
- Restaurantes / Restaurants / Restaurants (icon: utensils-crossed)
- Cafeterías / Cafes / Cafés (icon: coffee)
- Bares / Bars / Bars (icon: wine)
- Actividades / Activities / Activités (icon: star)
- Tiendas / Shops / Boutiques (icon: shopping-bag)
- Cultura / Culture / Culture (icon: landmark)

Rules:
- Group all places into appropriate categories
- Each place gets a 1-sentence trilingual description based on its likely type
- If you don't know the place, write a generic but plausible description for its category
- Keep descriptions short and useful for tourists`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: RECOMMENDATION_MODEL,
        max_tokens: 2048,
        temperature: 0.3,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      console.error('[generator] Recommendation categorization failed:', response.status)
      return buildFallbackRecommendationZone(recommendations)
    }

    const data = await response.json()
    const text = data.content?.[0]?.text
    if (!text) return buildFallbackRecommendationZone(recommendations)

    const jsonStr = text.replace(/```json\s*\n?/g, '').replace(/```\s*$/g, '').trim()
    const parsed = JSON.parse(jsonStr)

    if (!parsed.categories || !Array.isArray(parsed.categories)) {
      return buildFallbackRecommendationZone(recommendations)
    }

    const zones: TrilingualZoneConfig[] = []

    for (const cat of parsed.categories) {
      if (!cat.places || cat.places.length === 0) continue

      const steps: TrilingualZoneConfig['steps'] = cat.places.map((place: any) => ({
        type: 'text',
        title: {
          es: place.name,
          en: place.name,
          fr: place.name,
        },
        content: {
          es: place.description?.es || place.name,
          en: place.description?.en || place.name,
          fr: place.description?.fr || place.name,
        },
      }))

      zones.push({
        name: {
          es: cat.name?.es || 'Recomendaciones',
          en: cat.name?.en || 'Recommendations',
          fr: cat.name?.fr || 'Recommandations',
        },
        icon: cat.icon || 'star',
        description: {
          es: `Recomendaciones del anfitrión en ${city}`,
          en: `Host recommendations in ${city}`,
          fr: `Recommandations de l'hôte à ${city}`,
        },
        steps,
        needsTranslation: false, // Already trilingual from Claude
      })
    }

    return zones
  } catch (err) {
    console.error('[generator] Recommendation categorization error:', err)
    return buildFallbackRecommendationZone(recommendations)
  }
}

function buildFallbackRecommendationZone(recommendations: string): TrilingualZoneConfig[] {
  const places = recommendations.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean)
  if (places.length === 0) return []

  return [{
    name: {
      es: 'Recomendaciones del Anfitrión',
      en: 'Host Recommendations',
      fr: "Recommandations de l'Hôte",
    },
    icon: 'star',
    description: {
      es: 'Sitios recomendados por tu anfitrión',
      en: 'Places recommended by your host',
      fr: 'Lieux recommandés par votre hôte',
    },
    steps: places.map(place => ({
      type: 'text',
      title: { es: place, en: place, fr: place },
      content: { es: place, en: place, fr: place },
    })),
    needsTranslation: false,
  }]
}

// ============================================
// LOCATION ZONE BUILDERS (Google Places, ES-only → needs translation)
// ============================================

function buildLocationZones(
  locationData: Awaited<ReturnType<typeof fetchAllLocationData>>,
  propertyInput: PropertyInput,
  hasRecommendations: boolean = false,
): TrilingualZoneConfig[] {
  const zones: TrilingualZoneConfig[] = []

  // How to get there — professional format matching zone-content-templates
  const dirSteps: TrilingualZoneConfig['steps'] = []
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${propertyInput.lat},${propertyInput.lng}`
  const address = `${propertyInput.street}, ${propertyInput.postalCode} ${propertyInput.city}`

  // Airport
  const airportT = locationData.directions.fromAirport
  const airportD = locationData.directions.drivingFromAirport
  if (airportT || airportD) {
    const parts: string[] = [`✈️ **Aeropuerto de ${propertyInput.city}**`]
    if (airportD) {
      parts.push(`🚕 **Taxi:**\n• Duración: ~${airportD.duration}\n• Distancia: ${airportD.distance}\n• Dile al taxista: "${address}"`)
    }
    if (airportT) {
      const steps = airportT.steps.slice(0, 5).map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')
      parts.push(`🚌 **Transporte público:** (${airportT.duration}, ${airportT.distance})\n${steps}`)
    }
    parts.push(`📱 **Apps recomendadas:** Uber, Cabify, FreeNow`)
    dirSteps.push({ type: 'text', title: { es: 'Desde el aeropuerto', en: '', fr: '' }, content: { es: parts.join('\n\n'), en: '', fr: '' } })
  }

  // Train station
  const trainT = locationData.directions.fromTrainStation
  const trainD = locationData.directions.drivingFromTrainStation
  if (trainT || trainD) {
    const parts: string[] = [`🚂 **Estación de tren de ${propertyInput.city}**`]
    if (trainD) parts.push(`🚕 **Taxi:** ~${trainD.duration}, ${trainD.distance}`)
    if (trainT) {
      const steps = trainT.steps.slice(0, 5).map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')
      parts.push(`🚌 **Transporte público:** (${trainT.duration}, ${trainT.distance})\n${steps}`)
    }
    dirSteps.push({ type: 'text', title: { es: 'Desde la estación de tren', en: '', fr: '' }, content: { es: parts.join('\n\n'), en: '', fr: '' } })
  }

  // Bus station
  const busT = locationData.directions.fromBusStation
  const busD = locationData.directions.drivingFromBusStation
  if (busT || busD) {
    const parts: string[] = [`🚌 **Estación de autobuses de ${propertyInput.city}**`]
    if (busD) parts.push(`🚕 **Taxi:** ~${busD.duration}, ${busD.distance}`)
    if (busT) {
      const steps = busT.steps.slice(0, 5).map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')
      parts.push(`🚌 **Transporte público:** (${busT.duration}, ${busT.distance})\n${steps}`)
    }
    dirSteps.push({ type: 'text', title: { es: 'Desde la estación de autobuses', en: '', fr: '' }, content: { es: parts.join('\n\n'), en: '', fr: '' } })
  }

  // By car (always)
  const parkingNote = propertyInput.hasParking === 'yes'
    ? 'Dispone de parking privado (ver sección Parking)'
    : 'No incluido — consulta la sección Parking público cercano'
  dirSteps.push({
    type: 'text',
    title: { es: 'En coche', en: '', fr: '' },
    content: { es: `🚗 **Dirección GPS:** ${address}\n\n**Coordenadas:** ${propertyInput.lat}, ${propertyInput.lng}\n\n📍 **Google Maps:** ${mapsLink}\n📍 **Waze:** https://waze.com/ul?ll=${propertyInput.lat},${propertyInput.lng}&navigate=yes\n\n🅿️ **Parking:** ${parkingNote}`, en: '', fr: '' },
  })

  zones.push({
    name: { es: 'Cómo Llegar', en: '', fr: '' },
    icon: 'map-pin',
    description: { es: 'Direcciones desde aeropuerto, tren, autobús y ubicación exacta', en: '', fr: '' },
    steps: dirSteps,
    needsTranslation: true,
  })

  // Parking (nearby places)
  if (propertyInput.hasParking && propertyInput.hasParking !== 'no') {
    const parkingSteps: TrilingualZoneConfig['steps'] = []
    if (propertyInput.hasParking === 'yes') {
      parkingSteps.push({
        type: 'text',
        title: { es: 'Parking privado', en: '', fr: '' },
        content: { es: 'El alojamiento dispone de plaza de parking privada. (💡 Añade instrucciones de acceso)', en: '', fr: '' },
      })
    } else {
      parkingSteps.push({
        type: 'text',
        title: { es: 'Parking cercano', en: '', fr: '' },
        content: { es: 'No hay parking privado, pero hay opciones cercanas:', en: '', fr: '' },
      })
    }
    locationData.parking.forEach(p => {
      parkingSteps.push({
        type: 'text',
        title: { es: p.name, en: '', fr: '' },
        content: { es: `${p.address}\n📍 A ${p.distance}${p.rating ? ` | ⭐ ${p.rating}` : ''}`, en: '', fr: '' },
      })
    })
    zones.push({
      name: { es: 'Parking', en: '', fr: '' },
      icon: 'car',
      description: { es: 'Información sobre aparcamiento', en: '', fr: '' },
      steps: parkingSteps,
      needsTranslation: true,
    })
  }

  // Supermarkets
  if (locationData.supermarkets.length > 0) {
    zones.push({
      name: { es: 'Supermercados', en: '', fr: '' },
      icon: 'shopping-bag',
      description: { es: 'Supermercados cercanos', en: '', fr: '' },
      steps: locationData.supermarkets.map(s => ({
        type: 'text' as const,
        title: { es: s.name, en: '', fr: '' },
        content: {
          es: `${s.address}\n📍 A ${s.distance}${s.rating ? ` | ⭐ ${s.rating}` : ''}${s.openNow !== undefined ? ` | ${s.openNow ? '🟢 Abierto' : '🔴 Cerrado'}` : ''}`,
          en: '', fr: '',
        },
      })),
      needsTranslation: true,
    })
  }

  // Restaurants (skip if host provided own recommendations)
  if (locationData.restaurants.length > 0 && !hasRecommendations) {
    zones.push({
      name: { es: 'Restaurantes', en: '', fr: '' },
      icon: 'utensils-crossed',
      description: { es: 'Restaurantes recomendados', en: '', fr: '' },
      steps: locationData.restaurants.map(r => ({
        type: 'text' as const,
        title: { es: `${r.name}${r.rating ? ` ⭐ ${r.rating}` : ''}`, en: '', fr: '' },
        content: { es: `${r.address}\n📍 A ${r.distance}${r.priceLevel ? ` | ${'€'.repeat(r.priceLevel)}` : ''}`, en: '', fr: '' },
      })),
      needsTranslation: true,
    })
  }

  // Pharmacies
  if (locationData.pharmacies.length > 0) {
    zones.push({
      name: { es: 'Farmacias', en: '', fr: '' },
      icon: 'heart',
      description: { es: 'Farmacias cercanas', en: '', fr: '' },
      steps: locationData.pharmacies.map(p => ({
        type: 'text' as const,
        title: { es: p.name, en: '', fr: '' },
        content: { es: `${p.address}\n📍 A ${p.distance}`, en: '', fr: '' },
      })),
      needsTranslation: true,
    })
  }

  // Tourist attractions (skip if host provided own recommendations)
  if (locationData.attractions.length > 0 && !hasRecommendations) {
    zones.push({
      name: { es: 'Qué Hacer', en: '', fr: '' },
      icon: 'star',
      description: { es: 'Actividades y lugares de interés', en: '', fr: '' },
      steps: locationData.attractions.map(a => ({
        type: 'text' as const,
        title: { es: `${a.name}${a.rating ? ` ⭐ ${a.rating}` : ''}`, en: '', fr: '' },
        content: { es: `${a.address}\n📍 A ${a.distance}`, en: '', fr: '' },
      })),
      needsTranslation: true,
    })
  }

  // Public transport
  if (locationData.transitStations.length > 0) {
    zones.push({
      name: { es: 'Transporte Público', en: '', fr: '' },
      icon: 'bus',
      description: { es: 'Metro, autobús y opciones de movilidad', en: '', fr: '' },
      steps: locationData.transitStations.map(t => ({
        type: 'text' as const,
        title: { es: t.name, en: '', fr: '' },
        content: { es: `${t.address}\n📍 A ${t.distance}`, en: '', fr: '' },
      })),
      needsTranslation: true,
    })
  }

  return zones
}

// ============================================
// MAIN GENERATION ORCHESTRATOR
// ============================================

export async function generateManual(
  userId: string,
  propertyInput: PropertyInput,
  mediaAnalysis: MediaAnalysisResult[],
  sendEvent: SendEvent,
): Promise<string> {
  const startTime = Date.now()
  let totalSteps = 0
  let totalZones = 0

  try {
    // ── 1. Create property in DB ──
    sendEvent({ type: 'status', message: 'Creando tu propiedad...' })

    const baseSlug = generateSlug(propertyInput.name)
    let uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`

    let property
    let attempts = 0
    while (!property && attempts < 10) {
      const allProperties = await prisma.property.findMany({
        where: { propertyCode: { not: null, startsWith: 'ITN-' } },
        select: { propertyCode: true },
        orderBy: { propertyCode: 'desc' },
        take: 1,
      })
      let highestNumber = 0
      if (allProperties.length > 0 && allProperties[0].propertyCode) {
        highestNumber = extractNumberFromReference(allProperties[0].propertyCode) || 0
      }
      const propertyCode = generatePropertyNumber(highestNumber + attempts)

      try {
        property = await prisma.property.create({
          data: {
            name: propertyInput.name,
            slug: uniqueSlug,
            propertyCode,
            description: propertyInput.description,
            type: propertyInput.type,
            street: propertyInput.street,
            city: propertyInput.city,
            state: propertyInput.state,
            country: propertyInput.country,
            postalCode: propertyInput.postalCode,
            bedrooms: propertyInput.bedrooms,
            bathrooms: propertyInput.bathrooms,
            maxGuests: propertyInput.maxGuests || propertyInput.bedrooms * 2 + 1,
            hostContactName: propertyInput.hostContactName,
            hostContactPhone: propertyInput.hostContactPhone,
            hostContactEmail: propertyInput.hostContactEmail,
            hostContactLanguage: propertyInput.hostContactLanguage || 'es',
            hostContactPhoto: propertyInput.hostContactPhoto || null,
            profileImage: propertyInput.profileImage || null,
            squareMeters: propertyInput.squareMeters || null,
            status: 'DRAFT',
            isPublished: false,
            hostId: userId,
            analytics: { create: {} },
          },
        })
      } catch (err: any) {
        if (err?.code === 'P2002') {
          const target = err?.meta?.target
          if (Array.isArray(target) && target.includes('slug')) {
            uniqueSlug = `${baseSlug}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
          }
          attempts++
          continue
        }
        throw err
      }
    }
    if (!property) throw new Error('Unable to create property after multiple attempts')

    // ── 2. Fetch location data ──
    sendEvent({ type: 'status', message: 'Analizando ubicación y alrededores...' })

    const isMock = process.env.MOCK_AI === 'true'
    const locationData = isMock
      ? { directions: {}, nearbyPlaces: {}, city: propertyInput.city, hospitals: [], supermarkets: [], restaurants: [], pharmacies: [], attractions: [], transitStations: [], parking: [] } as any
      : await fetchAllLocationData(
          propertyInput.lat,
          propertyInput.lng,
          propertyInput.city,
        )

    // ── 3. Build ALL zones (template-first) ──
    sendEvent({ type: 'status', message: 'Generando manual profesional...' })

    // Normalize media analysis (handle old format)
    const normalizedMedia = mediaAnalysis.map(normalizeMediaInput)

    const allZones: TrilingualZoneConfig[] = []
    const zoneIdsNeedingTranslation = new Set<string>()

    // Essential zones (template-based, already trilingual)
    allZones.push(buildCheckInZone(propertyInput))

    if (propertyInput.checkOutTime) {
      allZones.push(buildCheckOutZone(propertyInput))
    }

    const wifiZone = buildWifiZone(propertyInput)
    if (wifiZone) allZones.push(wifiZone)

    allZones.push(buildHouseRulesZone(propertyInput))

    // Appliance zones (one per detected appliance, already trilingual)
    const applianceZones = buildApplianceZones(normalizedMedia)
    allZones.push(...applianceZones)

    // AC zone: add if user said hasAC and not already detected in media
    if (propertyInput.hasAC) {
      const hasACFromMedia = applianceZones.some(z => z.name.es === 'Aire Acondicionado')
      if (!hasACFromMedia) {
        const acZone = buildSingleApplianceZone('air_conditioning', APPLIANCE_REGISTRY.air_conditioning)
        if (acZone) allZones.push(acZone)
      }
    }

    // Recycling zone (always, already trilingual)
    allZones.push(buildRecyclingZone(propertyInput))

    // Emergency zone (template + country-specific numbers, already trilingual)
    allZones.push(buildEmergencyZone(propertyInput, locationData.hospitals))

    // Recommendation zones (host-provided places, already trilingual)
    const recommendations = (propertyInput.details?.recommendations || '').trim()
    const hasRecommendations = recommendations.length > 0
    if (hasRecommendations && !isMock) {
      const recZones = await buildRecommendationZones(recommendations, propertyInput.city, sendEvent)
      allZones.push(...recZones)
    }

    // Location zones (ES only, need translation)
    const locationZones = buildLocationZones(locationData, propertyInput, hasRecommendations)
    allZones.push(...locationZones)

    // ── 3.5 Apply reviewed content overrides from Step 4 ──
    const reviewed = propertyInput.reviewedContent || {}
    const reviewIdMap: Record<string, string> = {
      'Check In': 'check-in',
      'Check Out': 'check-out',
      'WiFi': 'wifi',
      'Normas de la Casa': 'house-rules',
      'Emergencias': 'emergency-contacts',
      'Reciclaje': 'recycling',
      'Aire Acondicionado': 'air-conditioning',
      'Parking': 'parking',
      'Cómo Llegar': 'directions',
      'Cómo llegar': 'directions',
      'Transporte Público': 'public-transport',
      'Transporte público': 'public-transport',
      'Restaurantes': 'restaurants',
      'Supermercados': 'supermarkets',
      'Farmacias': 'pharmacies',
      'Qué Hacer': 'things-to-do',
      'Qué ver': 'things-to-do',
    }

    for (const zoneConfig of allZones) {
      const reviewId = reviewIdMap[zoneConfig.name.es] || generateSlug(zoneConfig.name.es)
      if (reviewed[reviewId] && zoneConfig.steps.length > 0) {
        // User edited this zone's content — override the ES version of the first step
        // (the review step shows all content as a single block, so merge into step[0])
        zoneConfig.steps[0].content.es = reviewed[reviewId]
        // Mark for re-translation since user edited the Spanish content
        zoneConfig.needsTranslation = true
      }
    }

    // ── 3.6 Filter disabled zones from review step ──
    const disabledSet = new Set(propertyInput.disabledZones || [])
    const zoneIdMap: Record<string, string> = {
      'Check In': 'check-in',
      'Check Out': 'check-out',
      'WiFi': 'wifi',
      'Normas de la Casa': 'house-rules',
      'Emergencias': 'emergency-contacts',
      'Reciclaje': 'recycling',
      'Aire Acondicionado': 'air-conditioning',
      'Parking': 'parking',
      // Location zones — match exact capitalization from buildLocationZones()
      'Cómo Llegar': 'directions',
      'Cómo llegar': 'directions',
      'Transporte Público': 'public-transport',
      'Transporte público': 'public-transport',
      'Restaurantes': 'restaurants',
      'Supermercados': 'supermarkets',
      'Farmacias': 'pharmacies',
      'Qué Hacer': 'things-to-do',
      'Qué ver': 'things-to-do',
      'Agua caliente': 'hot-water',
    }

    const filteredZones = allZones.filter(z => {
      const reviewId = zoneIdMap[z.name.es] || generateSlug(z.name.es)
      return !disabledSet.has(reviewId)
    })

    // ── 4. Create zones and steps in DB ──
    let order = 0
    for (const zoneConfig of filteredZones) {
      if (zoneConfig.steps.length === 0) continue

      const timestamp = Date.now() + order
      const random1 = Math.random().toString(36).substr(2, 12)
      const random2 = Math.random().toString(36).substr(2, 12)
      const zoneSlug = `${generateSlug(zoneConfig.name.es)}-${timestamp}`

      const zone = await prisma.zone.create({
        data: {
          propertyId: property.id,
          name: {
            es: zoneConfig.name.es,
            en: zoneConfig.name.en || zoneConfig.name.es,
            fr: zoneConfig.name.fr || zoneConfig.name.es,
          },
          slug: zoneSlug,
          description: {
            es: zoneConfig.description.es,
            en: zoneConfig.description.en || zoneConfig.description.es,
            fr: zoneConfig.description.fr || zoneConfig.description.es,
          },
          icon: zoneConfig.icon,
          color: 'bg-gray-100',
          status: 'ACTIVE',
          order: order++,
          qrCode: `qr_${timestamp}_${random1}`,
          accessCode: `ac_${timestamp}_${random2}`,
        },
      })

      // Track zones needing translation
      if (zoneConfig.needsTranslation) {
        zoneIdsNeedingTranslation.add(zone.id)
      }

      let stepOrder = 0
      for (const stepConfig of zoneConfig.steps) {
        await prisma.step.create({
          data: {
            zoneId: zone.id,
            type: stepConfig.type || 'text',
            title: {
              es: stepConfig.title.es,
              en: stepConfig.title.en || stepConfig.title.es,
              fr: stepConfig.title.fr || stepConfig.title.es,
            },
            content: {
              es: stepConfig.content.es,
              en: stepConfig.content.en || stepConfig.content.es,
              fr: stepConfig.content.fr || stepConfig.content.es,
            },
            order: stepOrder++,
          },
        })
        totalSteps++
      }

      totalZones++

      sendEvent({
        type: 'zone',
        zone: {
          name: zoneConfig.name.es,
          icon: zoneConfig.icon,
          description: zoneConfig.description.es,
          stepsCount: zoneConfig.steps.length,
        },
      })
    }

    // ── 4.5 Assign uploaded media (images/videos) to matching zone steps ──
    await assignMediaToSteps(property.id, mediaAnalysis, filteredZones)

    // ── 5. Translate ONLY location zones (template zones already have 3 languages) ──
    sendEvent({ type: 'translation', language: 'en', progress: 0 })

    if (isMock) {
      // Skip translations in mock mode — just mark as done
      console.log('[generator] MOCK MODE — skipping translations')
      sendEvent({ type: 'translation', language: 'en', progress: 100 })
      sendEvent({ type: 'translation', language: 'fr', progress: 100 })
    } else if (zoneIdsNeedingTranslation.size > 0) {
      const zonesWithSteps = await prisma.zone.findMany({
        where: { propertyId: property.id },
        include: { steps: true },
        orderBy: { order: 'asc' },
      })

      const zonesToTranslate = zonesWithSteps.filter(z => zoneIdsNeedingTranslation.has(z.id))

      // Translate zone names and descriptions
      const zoneNameFields = zonesToTranslate.map(z => ({
        es: (z.name as any)?.es || '',
        en: '',
        fr: '',
      }))
      const zoneDescFields = zonesToTranslate.map(z => ({
        es: (z.description as any)?.es || '',
        en: '',
        fr: '',
      }))

      const [translatedNames, translatedDescs] = await Promise.all([
        translateFields(zoneNameFields),
        translateFields(zoneDescFields),
      ])

      sendEvent({ type: 'translation', language: 'en', progress: 50 })

      for (let i = 0; i < zonesToTranslate.length; i++) {
        await prisma.zone.update({
          where: { id: zonesToTranslate[i].id },
          data: {
            name: {
              es: (zonesToTranslate[i].name as any)?.es || '',
              en: translatedNames[i].en || '',
              fr: translatedNames[i].fr || '',
            },
            description: {
              es: (zonesToTranslate[i].description as any)?.es || '',
              en: translatedDescs[i].en || '',
              fr: translatedDescs[i].fr || '',
            },
          },
        })
      }

      sendEvent({ type: 'translation', language: 'en', progress: 100 })

      // Translate steps of location zones
      sendEvent({ type: 'translation', language: 'fr', progress: 0 })

      for (const zone of zonesToTranslate) {
        if (zone.steps.length === 0) continue

        const stepTitleFields = zone.steps.map(s => ({
          es: (s.title as any)?.es || '',
          en: '',
          fr: '',
        }))
        const stepContentFields = zone.steps.map(s => ({
          es: (s.content as any)?.es || '',
          en: '',
          fr: '',
        }))

        const [translatedTitles, translatedContents] = await Promise.all([
          translateFields(stepTitleFields),
          translateFields(stepContentFields),
        ])

        for (let j = 0; j < zone.steps.length; j++) {
          await prisma.step.update({
            where: { id: zone.steps[j].id },
            data: {
              title: {
                es: (zone.steps[j].title as any)?.es || '',
                en: translatedTitles[j].en || '',
                fr: translatedTitles[j].fr || '',
              },
              content: {
                es: (zone.steps[j].content as any)?.es || '',
                en: translatedContents[j].en || '',
                fr: translatedContents[j].fr || '',
              },
            },
          })
        }
      }

      sendEvent({ type: 'translation', language: 'fr', progress: 100 })
    } else {
      // No translation needed — all zones are template-based
      sendEvent({ type: 'translation', language: 'en', progress: 100 })
      sendEvent({ type: 'translation', language: 'fr', progress: 100 })
    }

    // ── 6. Generate QR codes ──
    const allDBZones = await prisma.zone.findMany({
      where: { propertyId: property.id },
      select: { id: true },
    })

    for (const zone of allDBZones) {
      try {
        const qrDataUrl = await generateZoneQRCode(property.id, zone.id)
        await prisma.zone.update({
          where: { id: zone.id },
          data: { qrCode: qrDataUrl },
        })
      } catch (err) {
        console.error(`[generator] QR generation failed for zone ${zone.id}:`, err)
      }
    }

    // ── 7. Complete ──
    const elapsedTime = Math.round((Date.now() - startTime) / 1000)

    sendEvent({
      type: 'complete',
      stats: {
        zones: totalZones,
        steps: totalSteps,
        languages: 3,
        time: elapsedTime,
      },
    })

    return property.id
  } catch (error) {
    console.error('[generator] Manual generation failed:', error)
    sendEvent({
      type: 'error',
      error: error instanceof Error ? error.message : 'Error desconocido',
    })
    throw error
  }
}
