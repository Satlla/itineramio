/**
 * Pure zone builder functions extracted from generator.ts.
 * These build trilingual zone configs from property data + templates.
 * No DB, no AI, no side effects — just data transformation.
 */

import { getZoneContentTemplate, type ZoneContentTemplate } from '../../data/zone-content-templates'
import {
  APPLIANCE_REGISTRY,
  generateBasicApplianceContent,
  getEmergencyNumbers,
  resolveCountryCode,
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
  intelligence?: Record<string, any>
  disabledZones?: string[]
  reviewedContent?: Record<string, string>
  customTitles?: Record<string, string>
  customIcons?: Record<string, string>
}

export interface TrilingualZoneConfig {
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

export function replaceVariables(text: string, vars: Record<string, string>): string {
  let result = text
  for (const [key, value] of Object.entries(vars)) {
    result = result.split(key).join(value)
  }
  return result
}

export function applyPlaceholderDefaults(text: string, defaults: Record<string, string>): string {
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
export function cleanUnfilledPlaceholders(text: string): string {
  // Remove entire lines containing link/video/map/taxi/Instagram placeholders
  let result = text.replace(/^.*👉\s*\[.*?\].*$/gm, '')
  result = result.replace(/^.*🔗.*\[.*?\].*$/gm, '')
  result = result.replace(/^.*🚖.*\[.*?\].*$/gm, '')
  result = result.replace(/^.*@\[.*?\].*$/gm, '')

  // Remove entire lines that are just visual references or identifying info with placeholders
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
export function templateToZoneConfig(
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

// ============================================
// ESSENTIAL ZONE BUILDERS (template-based)
// ============================================

export function buildCheckInZone(input: PropertyInput): TrilingualZoneConfig {
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
    const customInstructions = (input.checkInInstructions || '').trim()
    if (customInstructions) {
      result.steps[0].content.es = `🕒 **Entrada desde:** ${timeEs} h\n\n${customInstructions}\n\n${accessEs}`
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

export function buildFallbackCheckIn(input: PropertyInput): TrilingualZoneConfig {
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

export function buildCheckOutZone(input: PropertyInput): TrilingualZoneConfig {
  const timeEs = input.checkOutTime || '11:00'
  const timeEn = input.checkOutTime || '11:00 AM'
  const timeFr = input.checkOutTime || '11h00'
  const d = input.details || {}

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

  const customCheckout = (d.checkoutInstructions || '').trim()
  let needsTranslation = false

  let steps: TrilingualZoneConfig['steps']

  if (customCheckout) {
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

export function buildWifiZone(input: PropertyInput): TrilingualZoneConfig | null {
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

export function buildHouseRulesZone(input: PropertyInput): TrilingualZoneConfig {
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

export function buildRecyclingZone(input: PropertyInput): TrilingualZoneConfig {
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

export interface NearbyHospital {
  name: string
  address: string
  distance: string
}

export function buildEmergencyZone(
  input: PropertyInput,
  hospitals: NearbyHospital[],
): TrilingualZoneConfig {
  const template = getZoneContentTemplate('emergency-contacts')
  const countryCode = resolveCountryCode(input.country)
  const numbers = getEmergencyNumbers(countryCode)

  const emergencyEs = buildEmergencyContent(numbers, 'es')
  const emergencyEn = buildEmergencyContent(numbers, 'en')
  const emergencyFr = buildEmergencyContent(numbers, 'fr')

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

  if (result.steps.length > 1) {
    result.steps[1] = {
      type: 'text',
      title: { es: 'Emergencias', en: 'Emergencies', fr: 'Urgences' },
      content: { es: emergencyEs.content, en: emergencyEn.content, fr: emergencyFr.content },
    }
  }

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

export function buildEmergencyContent(
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
// APPLIANCE ZONE BUILDERS
// ============================================

export function buildSingleApplianceZone(
  type: CanonicalApplianceType,
  registry: typeof APPLIANCE_REGISTRY[CanonicalApplianceType],
): TrilingualZoneConfig | null {
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
