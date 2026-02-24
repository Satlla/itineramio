'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  ChevronDown,
  ArrowLeft,
  Sparkles,
  Pencil,
  X,
  Save,
  Play,
  Image as ImageIcon,
  Key,
  LogOut,
  Wifi,
  ScrollText,
  Phone,
  Droplets,
  Package,
  Car,
  MapPin,
  Bus,
  Utensils,
  ShoppingBag,
  Heart,
  Star,
  Zap,
  Thermometer,
  Loader2,
  Coffee,
  Banknote,
  Fuel,
  Dumbbell,
  Shirt,
  ShoppingCart,
  TreePine,
  Waves,
  Building2,
} from 'lucide-react'
import type { Step1Data } from './Step1Address'
import type { Step2Data } from './Step2Details'
import type { MediaItem } from './Step2Media'

// ============================================
// TYPES
// ============================================

export interface LocationDataPlace {
  name: string
  address: string
  rating?: number
  priceLevel?: number
  distance?: string
  openNow?: boolean
}

export interface LocationDataDirections {
  summary: string
  duration: string
  distance: string
  steps: string[]
}

export interface NearbyPlaceResult {
  name: string
  address: string
  rating?: number
  priceLevel?: number
  photoUrl?: string
  distanceMeters: number
  walkMinutes: number
}

export interface NearbyCategory {
  categoryId: string
  label: string
  icon: string
  places: NearbyPlaceResult[]
}

export interface LocationData {
  directions: {
    drivingFromAirport?: LocationDataDirections | null
    drivingFromTrainStation?: LocationDataDirections | null
    drivingFromBusStation?: LocationDataDirections | null
    // Legacy fields (backward compat with cached drafts)
    fromAirport?: LocationDataDirections | null
    fromTrainStation?: LocationDataDirections | null
    fromBusStation?: LocationDataDirections | null
  }
  nearbyPlaces?: NearbyCategory[]
}

export interface ReviewZone {
  id: string
  title: string
  icon: React.ReactNode
  content: string // Spanish content pre-filled
  mediaItems: MediaItem[]
  approved: boolean
  source: 'user' | 'auto' | 'media'
  enabled: boolean
}

interface Step4ReviewProps {
  step1Data: Step1Data
  step2Data: Step2Data
  media: MediaItem[]
  locationData: LocationData | null
  locationDataLoading: boolean
  disabledZones: Set<string>
  onDisabledZonesChange: (zones: Set<string>) => void
  reviewedContent: Record<string, string>
  onReviewedContentChange: (content: Record<string, string>) => void
  customTitles: Record<string, string>
  onCustomTitlesChange: (titles: Record<string, string>) => void
  customIcons: Record<string, string>
  onCustomIconsChange: (icons: Record<string, string>) => void
  onNext: () => void
  onBack: () => void
}

// ============================================
// CONTENT BUILDER (mirrors generator logic, client-side)
// ============================================

function buildZoneContent(
  step1: Step1Data,
  step2: Step2Data,
  locationData: LocationData | null,
  locationDataLoading: boolean,
): { id: string; title: string; iconName: string; content: string; source: 'user' | 'auto' }[] {
  const zones: { id: string; title: string; iconName: string; content: string; source: 'user' | 'auto' }[] = []

  // ── CHECK-IN ──
  let accessInstructions = ''
  if (step1.checkInMethod === 'lockbox') {
    accessInstructions = `🔐 **Acceso autónomo con cajetín:**
1. Localiza el cajetín: **${step2.lockboxLocation || '(indicar ubicación)'}**
2. Introduce el código: **${step2.lockboxCode || '(se enviará antes de tu llegada)'}**
3. Recoge las llaves y abre la puerta

🌙 **Llegadas tarde:** Sin problema, el acceso es autónomo 24h.`
  } else if (step1.checkInMethod === 'code') {
    accessInstructions = `🔢 **Cerradura con código:**
Introduce el código **${step2.doorCode || '(se enviará antes de tu llegada)'}** en el teclado de la puerta.
${step2.codeChangesPerReservation ? '📲 El código se envía con cada reserva.' : ''}
🌙 **Llegadas tarde:** Sin problema, el acceso es autónomo 24h.`
  } else {
    accessInstructions = `🤝 **Recepción en persona:**
Nos vemos en: **${step2.meetingPoint || '(indicar punto de encuentro)'}**
📲 Confirma tu hora de llegada por WhatsApp.

**Si llegas tarde:** ${
      step2.latePlan === 'call' ? 'Llama al anfitrión.' :
      step2.latePlan === 'lockbox_backup' ? `Cajetín de emergencia: ${step2.latePlanDetails || '(detalles)'}` :
      step2.latePlan === 'neighbor' ? `Vecino/portero: ${step2.latePlanDetails || '(detalles)'}` :
      step2.latePlanDetails || 'Contacta con el anfitrión.'
    }`
  }

  zones.push({
    id: 'check-in',
    title: 'Check-in',
    iconName: 'key',
    content: `🕒 **Entrada desde:** ${step1.checkInTime} h
⏰ **Early check-in:** Escríbenos y te diremos si es posible.
📲 **Importante:** Indícanos tu hora estimada por WhatsApp para tenerlo todo listo.

${accessInstructions}

---

📍 **Dirección:** ${step1.street}
${step1.postalCode}, ${step1.city}

🚖 **Para el taxista:** "${step1.street}, ${step1.city}"`,
    source: 'user',
  })

  // ── CHECK-OUT ──
  const keyReturnMap: Record<string, string> = {
    lockbox: '🔑 Devuelve las llaves al cajetín y asegúrate de que queda cerrado.',
    inside_table: '🔑 Deja las llaves encima de la mesa del salón/entrada.',
    code_auto: '🔑 Simplemente cierra la puerta al salir. El código se desactivará automáticamente.',
    hand: `🔑 Entrega las llaves en mano. ${step2.keyReturnDetails || 'Coordina con el anfitrión.'}`,
  }

  let checkoutExtras = ''
  if (step2.lateCheckout === 'yes_paid') {
    checkoutExtras += `\n\n⏰ **Late checkout disponible:** Hasta las ${step2.lateCheckoutUntil || '14:00'} por ${step2.lateCheckoutPrice || '?€'}. Consúltanos con 24h de antelación.`
  } else if (step2.lateCheckout === 'yes_free') {
    checkoutExtras += '\n\n⏰ **Late checkout:** Según disponibilidad. Consúltanos con 24h de antelación.'
  }
  if (step2.luggageAfterCheckout === 'yes_in_apartment') {
    checkoutExtras += `\n\n📦 **Equipaje:** Puedes dejar tus maletas en el apartamento hasta las ${step2.luggageUntil || '15:00'}.`
  } else if (step2.luggageAfterCheckout === 'yes_consigna') {
    checkoutExtras += `\n\n📦 **Equipaje:** Hay una consigna cercana: ${step2.luggageConsignaInfo || '(consulta al anfitrión)'}.`
  }

  zones.push({
    id: 'check-out',
    title: 'Check-out',
    iconName: 'log-out',
    content: `**Hora de salida:** Antes de las **${step1.checkOutTime}**

${keyReturnMap[step2.keyReturn] || keyReturnMap.lockbox}${checkoutExtras}

---

✅ **Antes de irte:**

**Imprescindible:**
☐ Cierra todas las ventanas
☐ Apaga luces, TV y aire acondicionado/calefacción
☐ Cierra los grifos

**Ayúdanos (no obligatorio):**
☐ Deja la basura en los contenedores de la calle
☐ Deja los platos sucios en el fregadero
☐ Deja las toallas usadas en la bañera/ducha

❌ **NO hace falta:** Hacer las camas, limpiar el apartamento ni pasar la aspiradora.

---

🙏 **¡Gracias por elegirnos!**
Esperamos que hayas disfrutado de tu estancia.
⭐ Si tu experiencia ha sido positiva, te agradeceríamos mucho una reseña.`,
    source: 'user',
  })

  // ── WIFI ──
  if (step1.wifiName) {
    zones.push({
      id: 'wifi',
      title: 'WiFi',
      iconName: 'wifi',
      content: `📶 **Red WiFi:** ${step1.wifiName}
🔑 **Contraseña:** ${step1.wifiPassword || '(consultar al anfitrión)'}

---

**Si no conecta:**
1. ✅ Verifica mayúsculas/minúsculas de la contraseña
2. ✅ Olvida la red y vuelve a conectar
3. ✅ Activa/desactiva el modo avión
4. ✅ Reinicia el router (botón trasero, espera 2 min)

Si persiste el problema, contáctanos.`,
      source: 'user',
    })
  }

  // ── NORMAS ──
  zones.push({
    id: 'house-rules',
    title: 'Normas de la casa',
    iconName: 'scroll-text',
    content: `Para una convivencia agradable:

🚭 **No fumar** — Interior y terraza/balcón
🎉 **No fiestas** — Ni reuniones ruidosas
🔇 **Silencio** — 22:00 a 08:00
👥 **Capacidad máxima:** ${step1.maxGuests} personas

---

🏢 **Respeto a los vecinos:**
• Volumen moderado (especialmente de noche)
• Cierra puertas sin golpear
• Usa el ascensor con cuidado
• Habla bajo en zonas comunes

---

🏠 **Cuida el espacio:**
• No muevas muebles pesados
• Usa posavasos para bebidas
• No dejes ventanas abiertas si llueve
• Reporta cualquier daño inmediatamente
• No tires objetos por el WC (solo papel)`,
    source: 'user',
  })

  // ── EMERGENCIAS ──
  const urgencyPhone = step2.emergencyPhone || step1.hostContactPhone
  zones.push({
    id: 'emergency-contacts',
    title: 'Contacto y emergencias',
    iconName: 'phone',
    content: `👤 **Anfitrión:** ${step1.hostContactName || '(nombre)'}
📱 **WhatsApp/Tel:** ${step1.hostContactPhone || '(teléfono)'}
📧 **Email:** ${step1.hostContactEmail || '(email)'}

⏰ **Horario de atención:** ${step2.supportHoursFrom} - ${step2.supportHoursTo}
🆘 **Urgencias 24h:** ${urgencyPhone || '(teléfono)'}

Respondo normalmente en menos de 30 minutos.

---

🚨 **EMERGENCIAS GENERALES:** 112

📞 **Servicios específicos:**
• Policía Nacional: 091
• Policía Local: 092
• Bomberos: 080
• Urgencias médicas: 061

🔧 **Problemas comunes:**
**💡 Se va la luz:** Cuadro eléctrico en ${step2.electricalPanelLocation || '(indicar ubicación)'}. Sube los interruptores que estén bajados.
**🚿 No hay agua caliente:** ${
      step2.hotWaterType === 'instant' ? 'Espera 2 min con el grifo abierto.' :
      step2.hotWaterType === 'tank_small' ? 'El termo es de 30-50L. Si se acaba, espera 40-50 minutos a que se recaliente.' :
      step2.hotWaterType === 'tank_large' ? 'El termo es grande (80-100L). Si se acaba, espera 20-30 minutos.' :
      'Caldera centralizada del edificio. Si no funciona, contacta al anfitrión.'
    }
**🔑 No puedo abrir la puerta:** Llámame inmediatamente: ${urgencyPhone || '(teléfono)'}

⚠️ **Nunca intentes reparar algo por tu cuenta. Contáctanos primero.**`,
    source: 'user',
  })

  // ── RECICLAJE ──
  zones.push({
    id: 'recycling',
    title: 'Basura y reciclaje',
    iconName: 'package',
    content: `♻️ **Separa la basura:**
🟡 **Amarillo:** Plásticos, latas, envases, bricks
🟢 **Verde:** Vidrio (botellas, tarros)
🔵 **Azul:** Papel y cartón
⚫ **Gris/Marrón:** Orgánico y resto

🛒 **Bolsas de basura:** Debajo del fregadero
${step2.recyclingContainerLocation ? `\n📍 **Contenedores más cercanos:** ${step2.recyclingContainerLocation}` : '\n📍 **Contenedores más cercanos:** (indicar ubicación)'}

⚠️ **Importante:**
• No dejes bolsas en el rellano
• Baja la basura antes del check-out
• El vidrio solo de 8:00 a 22:00 (hace ruido)`,
    source: 'user',
  })

  // ── PARKING ──
  if (step1.hasParking === 'yes') {
    const accessMap: Record<string, string> = {
      remote: 'Mando a distancia (incluido con las llaves)',
      code: `Código: **${step2.parkingAccessCode || '(indicar)'}**`,
      card: 'Tarjeta (incluida con las llaves)',
      key: 'Llave (incluida con las llaves)',
      none: 'Acceso libre',
    }
    zones.push({
      id: 'parking',
      title: 'Parking privado',
      iconName: 'car',
      content: `🚗 **Plaza número:** ${step2.parkingSpotNumber || '(indicar)'}
🏢 **Planta:** ${step2.parkingFloor || '(indicar)'}

**Para entrar:**
1. ${accessMap[step2.parkingAccess] || 'Mando a distancia'}
2. La puerta tarda unos segundos en abrirse
3. Tu plaza está señalizada

**Para salir:** Pulsa el botón de apertura interior

⚠️ Cuidado con la altura si llevas SUV o furgoneta.`,
      source: 'user',
    })
  }

  // ── AC ──
  if (step1.hasAC) {
    zones.push({
      id: 'air-conditioning',
      title: 'Aire acondicionado / Calefacción',
      iconName: 'thermometer',
      content: `🌡️ **Mando:** En el salón o dormitorio principal

**❄️ Para enfriar:**
1. Enciende con botón ON
2. Modo: ❄️ (COOL)
3. Temperatura recomendada: 24-25°C

**☀️ Para calentar:**
1. Enciende con botón ON
2. Modo: ☀️ (HEAT)
3. Temperatura recomendada: 20-22°C

💡 **Consejos:**
• Cierra ventanas y puertas cuando esté encendido
• Usa las persianas en las horas de más calor
• Por la noche, usa el modo SLEEP

⚠️ **Apágalo al salir o abrir ventanas.**`,
      source: 'user',
    })
  }

  // ── ITEM LOCATIONS ──
  const itemLabels: Record<string, string> = {
    iron: 'Plancha', ironingBoard: 'Tabla de planchar', hairdryer: 'Secador de pelo',
    firstAid: 'Botiquín', extraBlankets: 'Sábanas y mantas extra', broom: 'Escoba y fregona',
  }
  const activeItems = (Object.entries(step2.items) as [string, { has: boolean; location: string }][])
    .filter(([, v]) => v.has)
  if (activeItems.length > 0) {
    const itemLines = activeItems.map(([key, v]) =>
      `• **${itemLabels[key] || key}:** ${v.location || '(indicar ubicación)'}`
    ).join('\n')
    zones.push({
      id: 'item-locations',
      title: 'Dónde están las cosas',
      iconName: 'package',
      content: `🔎 **Ubicación de objetos útiles:**\n\n${itemLines}\n\nSi no encuentras algo, pregúntanos por el chatbot o WhatsApp.`,
      source: 'user',
    })
  }

  // ── RECOMMENDATIONS (host-provided) ──
  const hasRecommendations = (step2.recommendations || '').trim().length > 0
  if (hasRecommendations) {
    const places = step2.recommendations.split(/[,;\n]+/).map((s: string) => s.trim()).filter(Boolean)
    zones.push({
      id: 'recommendations',
      title: 'Mis recomendaciones',
      iconName: 'star',
      content: `Tus recomendaciones personales:\n\n${places.map(p => `• ${p}`).join('\n')}\n\nLa IA las agrupará por categorías y generará descripciones en 3 idiomas.`,
      source: 'user',
    })
  }

  // ── LOCATION ZONES (directions only — nearby places handled by Recommendations system) ──
  if (locationData) {
    const dirs = locationData.directions || {} as LocationData['directions']

    // Directions — professional format matching zone-content-templates
    const dirSections: string[] = []
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${step1.lat},${step1.lng}`
    const wazeLink = `https://waze.com/ul?ll=${step1.lat},${step1.lng}&navigate=yes`

    // Airport section
    const airportTransit = dirs.fromAirport || null
    const airportDriving = dirs.drivingFromAirport || null
    if (airportTransit || airportDriving) {
      const parts: string[] = [`✈️ **Aeropuerto de ${step1.city}**`]
      if (airportDriving) {
        parts.push(`🚕 **Taxi:**\n• Duración: ~${airportDriving.duration}\n• Distancia: ${airportDriving.distance}\n• Dile al taxista: "${step1.street}, ${step1.city}"`)
      }
      if (airportTransit) {
        const steps = airportTransit.steps.slice(0, 5).map((s, i) => `${i + 1}. ${s}`).join('\n')
        parts.push(`🚌 **Transporte público:** (${airportTransit.duration}, ${airportTransit.distance})\n${steps}`)
      }
      parts.push(`📱 **Apps recomendadas:** Uber, Cabify, FreeNow`)
      dirSections.push(parts.join('\n\n'))
    }

    // Train station section
    const trainTransit = dirs.fromTrainStation || null
    const trainDriving = dirs.drivingFromTrainStation || null
    if (trainTransit || trainDriving) {
      const parts: string[] = [`🚂 **Estación de tren de ${step1.city}**`]
      if (trainDriving) {
        parts.push(`🚕 **Taxi:** ~${trainDriving.duration}, ${trainDriving.distance}`)
      }
      if (trainTransit) {
        const steps = trainTransit.steps.slice(0, 5).map((s, i) => `${i + 1}. ${s}`).join('\n')
        parts.push(`🚌 **Transporte público:** (${trainTransit.duration}, ${trainTransit.distance})\n${steps}`)
      }
      dirSections.push(parts.join('\n\n'))
    }

    // Bus station section
    const busTransit = dirs.fromBusStation || null
    const busDriving = dirs.drivingFromBusStation || null
    if (busTransit || busDriving) {
      const parts: string[] = [`🚌 **Estación de autobuses de ${step1.city}**`]
      if (busDriving) {
        parts.push(`🚕 **Taxi:** ~${busDriving.duration}, ${busDriving.distance}`)
      }
      if (busTransit) {
        const steps = busTransit.steps.slice(0, 5).map((s, i) => `${i + 1}. ${s}`).join('\n')
        parts.push(`🚌 **Transporte público:** (${busTransit.duration}, ${busTransit.distance})\n${steps}`)
      }
      dirSections.push(parts.join('\n\n'))
    }

    // By car section (always shown)
    dirSections.push(`🚗 **En coche**

**Dirección GPS:** ${step1.street}, ${step1.postalCode} ${step1.city}

**Coordenadas:** ${step1.lat}, ${step1.lng}

📍 **Google Maps:** ${mapsLink}
📍 **Waze:** ${wazeLink}

🅿️ **Parking:** ${step1.hasParking === 'yes' ? 'Dispone de parking privado (ver sección Parking)' : 'No incluido — consulta la sección Parking público cercano'}`)

    zones.push({
      id: 'directions',
      title: 'Cómo llegar',
      iconName: 'map-pin',
      content: dirSections.join('\n\n---\n\n'),
      source: 'user',
    })

    // Nearby places from recommendations system (interactive cards with photos, hours, etc.)
    const nearbyPlaces = locationData.nearbyPlaces || []
    if (nearbyPlaces.length > 0) {
      for (const category of nearbyPlaces) {
        if (category.places.length === 0) continue
        const formatDist = (m: number) => m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`
        const lines = category.places.map(p => {
          const rating = p.rating ? `⭐ ${p.rating} ` : ''
          const price = p.priceLevel ? ` · ${'€'.repeat(p.priceLevel)}` : ''
          return `${rating}**${p.name}** — ${formatDist(p.distanceMeters)}${price}\n📍 ${p.address}`
        })
        zones.push({
          id: `rec-${category.categoryId}`,
          title: category.label,
          iconName: category.icon.toLowerCase().replace(/([A-Z])/g, '-$1').replace(/^-/, ''),
          content: lines.join('\n\n'),
          source: 'user',
        })
      }
    } else if (locationDataLoading) {
      zones.push({
        id: 'recommendations-loading',
        title: 'Lugares cercanos',
        iconName: 'map-pin',
        content: 'Cargando lugares cercanos...',
        source: 'user',
      })
    }
  } else {
    // Loading or no data — show placeholder
    const loadingText = locationDataLoading
      ? '⏳ Cargando lugares cercanos...'
      : 'Se generará automáticamente al cargar datos de ubicación.'
    const source: 'auto' = 'auto'
    const lp = locationDataLoading // shorthand
    zones.push(
      { id: 'directions', title: 'Cómo llegar', iconName: 'map-pin', content: lp ? '⏳ Cargando direcciones...' : loadingText, source },
      { id: 'public-transport', title: 'Transporte público', iconName: 'bus', content: lp ? '⏳ Cargando transporte cercano...' : loadingText, source },
    )
    if (!hasRecommendations) {
      zones.push(
        { id: 'restaurants', title: 'Restaurantes', iconName: 'utensils', content: lp ? '⏳ Cargando restaurantes cercanos...' : loadingText, source },
      )
    }
    zones.push(
      { id: 'supermarkets', title: 'Supermercados y tiendas', iconName: 'shopping-bag', content: lp ? '⏳ Cargando supermercados cercanos...' : loadingText, source },
      { id: 'pharmacies', title: 'Farmacias', iconName: 'heart', content: lp ? '⏳ Cargando farmacias cercanas...' : loadingText, source },
    )
    if (!hasRecommendations) {
      zones.push(
        { id: 'things-to-do', title: 'Qué ver y hacer', iconName: 'star', content: lp ? '⏳ Cargando atracciones cercanas...' : loadingText, source },
      )
    }
    zones.push(
      { id: 'parks', title: 'Parques y jardines', iconName: 'tree-pine', content: lp ? '⏳ Cargando parques...' : loadingText, source },
      { id: 'beaches', title: 'Playas', iconName: 'waves', content: lp ? '⏳ Cargando playas...' : loadingText, source },
      { id: 'cafes', title: 'Cafeterías', iconName: 'coffee', content: lp ? '⏳ Cargando cafeterías...' : loadingText, source },
      { id: 'hospitals', title: 'Centros de salud', iconName: 'building-2', content: lp ? '⏳ Cargando centros de salud...' : loadingText, source },
      { id: 'atms', title: 'Cajeros automáticos', iconName: 'banknote', content: lp ? '⏳ Cargando cajeros...' : loadingText, source },
      { id: 'gas-stations', title: 'Gasolineras', iconName: 'fuel', content: lp ? '⏳ Cargando gasolineras...' : loadingText, source },
      { id: 'gyms', title: 'Gimnasios', iconName: 'dumbbell', content: lp ? '⏳ Cargando gimnasios...' : loadingText, source },
      { id: 'laundry', title: 'Lavanderías', iconName: 'washing-machine', content: lp ? '⏳ Cargando lavanderías...' : loadingText, source },
      { id: 'shopping-malls', title: 'Centros comerciales', iconName: 'shopping-cart', content: lp ? '⏳ Cargando centros comerciales...' : loadingText, source },
      { id: 'public-parking', title: 'Parking público cercano', iconName: 'car', content: lp ? '⏳ Cargando parkings cercanos...' : loadingText, source },
    )
  }

  return zones
}

// Icon resolver
const iconComponents: Record<string, React.ReactNode> = {
  'key': <Key className="w-5 h-5" />,
  'log-out': <LogOut className="w-5 h-5" />,
  'wifi': <Wifi className="w-5 h-5" />,
  'scroll-text': <ScrollText className="w-5 h-5" />,
  'phone': <Phone className="w-5 h-5" />,
  'droplets': <Droplets className="w-5 h-5" />,
  'package': <Package className="w-5 h-5" />,
  'car': <Car className="w-5 h-5" />,
  'map-pin': <MapPin className="w-5 h-5" />,
  'bus': <Bus className="w-5 h-5" />,
  'utensils': <Utensils className="w-5 h-5" />,
  'shopping-bag': <ShoppingBag className="w-5 h-5" />,
  'heart': <Heart className="w-5 h-5" />,
  'star': <Star className="w-5 h-5" />,
  'zap': <Zap className="w-5 h-5" />,
  'thermometer': <Thermometer className="w-5 h-5" />,
  'coffee': <Coffee className="w-5 h-5" />,
  'banknote': <Banknote className="w-5 h-5" />,
  'fuel': <Fuel className="w-5 h-5" />,
  'dumbbell': <Dumbbell className="w-5 h-5" />,
  'washing-machine': <Shirt className="w-5 h-5" />,
  'shopping-cart': <ShoppingCart className="w-5 h-5" />,
  'tree-pine': <TreePine className="w-5 h-5" />,
  'waves': <Waves className="w-5 h-5" />,
  'building-2': <Building2 className="w-5 h-5" />,
}

// Categories that map to built-in zones (not media-detected zones)
const BUILTIN_CATEGORIES = new Set(['entrance', 'check_out', 'wifi', 'parking', 'ac'])

// Display names for appliance-based zones (canonical_type → display info)
const APPLIANCE_DISPLAY_NAMES: Record<string, { nameEs: string; icon: string }> = {
  washing_machine: { nameEs: 'Lavadora', icon: 'zap' },
  dishwasher: { nameEs: 'Lavavajillas', icon: 'zap' },
  coffee_machine: { nameEs: 'Cafetera', icon: 'zap' },
  microwave: { nameEs: 'Microondas', icon: 'zap' },
  oven: { nameEs: 'Horno', icon: 'zap' },
  induction_hob: { nameEs: 'Vitrocerámica', icon: 'zap' },
  air_conditioning: { nameEs: 'Aire Acondicionado', icon: 'thermometer' },
  television: { nameEs: 'Smart TV', icon: 'zap' },
  refrigerator: { nameEs: 'Frigorífico', icon: 'zap' },
  toaster: { nameEs: 'Tostadora', icon: 'zap' },
  kettle: { nameEs: 'Hervidor', icon: 'zap' },
  dryer: { nameEs: 'Secadora', icon: 'zap' },
  iron: { nameEs: 'Plancha', icon: 'zap' },
  safe: { nameEs: 'Caja Fuerte', icon: 'zap' },
  heater: { nameEs: 'Calefacción', icon: 'thermometer' },
}

// Match media to zones by user-assigned category, falling back to room_type
function matchMediaToZone(zoneId: string, media: MediaItem[]): MediaItem[] {
  // Handle appliance-specific zone IDs (e.g. "appliance-microwave")
  if (zoneId.startsWith('appliance-')) {
    const applianceType = zoneId.replace('appliance-', '')
    return media.filter(m =>
      m.analysis &&
      (m.analysis.primary_item === applianceType ||
        (m.analysis.appliances?.length === 1 && m.analysis.appliances[0].canonical_type === applianceType))
    )
  }

  // Map zone IDs to the category values that belong in them
  const zoneToCats: Record<string, string[]> = {
    'check-in': ['entrance'],
    'check-out': ['check_out'],
    'wifi': ['wifi'],
    'parking': ['parking'],
    'air-conditioning': ['ac'],
    'room-kitchen': ['kitchen', 'dishwasher', 'microwave', 'coffee'],
    'room-bathroom': ['bathroom'],
    'room-bedroom': ['bedroom'],
    'room-living_room': ['living_room', 'tv'],
    'room-terrace': ['terrace'],
    'room-pool': ['pool'],
    'room-laundry': ['washing_machine'],
  }

  const cats = zoneToCats[zoneId]
  if (cats) {
    const matched = media.filter(m => m.category && cats.includes(m.category))
    if (matched.length > 0) return matched
  }

  // Fallback: room_type mapping for items without an explicit built-in category
  const roomTypeMapping: Record<string, string[]> = {
    'check-in': ['entrance', 'hallway', 'door', 'exterior'],
    'check-out': ['entrance', 'hallway'],
    'parking': ['parking', 'garage'],
    'air-conditioning': ['living_room', 'bedroom'],
  }
  const roomTypes = roomTypeMapping[zoneId]
  if (!roomTypes) return []
  return media.filter(m =>
    m.analysis &&
    roomTypes.includes(m.analysis.room_type) &&
    (!m.category || !BUILTIN_CATEGORIES.has(m.category))
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

// Available icon names for the icon picker
const ICON_OPTIONS = Object.keys(iconComponents)

export default function Step4Review({
  step1Data,
  step2Data,
  media,
  locationData,
  locationDataLoading,
  disabledZones,
  onDisabledZonesChange,
  reviewedContent,
  onReviewedContentChange,
  customTitles,
  onCustomTitlesChange,
  customIcons,
  onCustomIconsChange,
  onNext,
  onBack,
}: Step4ReviewProps) {
  const { t } = useTranslation('ai-setup')
  const [editingZone, setEditingZone] = useState<string | null>(null)
  const [editBuffer, setEditBuffer] = useState('')
  const [expandedZone, setExpandedZone] = useState<string | null>(null)
  const [justSaved, setJustSaved] = useState<string | null>(null)
  const [iconPickerZone, setIconPickerZone] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState<string | null>(null)

  // Build all zone content
  const zoneData = useMemo(
    () => buildZoneContent(step1Data, step2Data, locationData, locationDataLoading),
    [step1Data, step2Data, locationData, locationDataLoading],
  )

  // Add media-detected zones (exclude media assigned to built-in zones)
  // Groups by primary_item (appliance) when available, falls back to room_type for general photos
  const mediaZones = useMemo(() => {
    // Two maps: one for appliance-specific zones, one for room-level zones
    const applianceMap = new Map<string, { label: string; items: string[]; mediaItems: MediaItem[] }>()
    const roomMap = new Map<string, { items: string[]; mediaItems: MediaItem[] }>()

    for (const m of media) {
      if (!m.analysis) continue
      // Skip media explicitly assigned to built-in zones or custom zones (handled separately)
      if (m.category && BUILTIN_CATEGORIES.has(m.category)) continue
      if (m.category === 'custom') continue

      const primaryItem = m.analysis.primary_item
      const firstAppliance = m.analysis.appliances?.[0]?.canonical_type

      // If media has a primary_item or a single appliance, group by appliance
      const applianceKey = primaryItem || (m.analysis.appliances?.length === 1 ? firstAppliance : null)

      if (applianceKey && APPLIANCE_DISPLAY_NAMES[applianceKey]) {
        if (!applianceMap.has(applianceKey)) {
          applianceMap.set(applianceKey, {
            label: APPLIANCE_DISPLAY_NAMES[applianceKey].nameEs,
            items: [],
            mediaItems: [],
          })
        }
        const entry = applianceMap.get(applianceKey)!
        entry.mediaItems.push(m)
        const appliances = (m.analysis.appliances || []).map((a: any) =>
          typeof a === 'string' ? a : a.detected_label || a.canonical_type
        )
        entry.items.push(...appliances)
      } else {
        // No specific appliance focus — group by room_type (or 'other' as fallback)
        const room = m.analysis.room_type || 'other'
        if (!roomMap.has(room)) roomMap.set(room, { items: [], mediaItems: [] })
        const entry = roomMap.get(room)!
        entry.mediaItems.push(m)
        const appliances = (m.analysis.appliances || []).map((a: any) =>
          typeof a === 'string' ? a : a.detected_label || a.canonical_type
        )
        entry.items.push(...appliances)
      }
    }

    const roomLabels: Record<string, string> = {
      kitchen: t('step4.roomLabels.kitchen'), bathroom: t('step4.roomLabels.bathroom'), bedroom: t('step4.roomLabels.bedroom'),
      living_room: t('step4.roomLabels.livingRoom'), terrace: t('step4.roomLabels.terrace'), laundry: t('step4.roomLabels.laundry'),
      balcony: t('step4.roomLabels.balcony'), dining_room: t('step4.roomLabels.diningRoom'), pool: t('step4.roomLabels.pool'),
      other: t('step4.roomLabels.other'), unknown: t('step4.roomLabels.unknown'),
    }

    const zones: { id: string; title: string; iconName: string; content: string; source: 'media'; mediaItems: MediaItem[] }[] = []

    // Appliance-specific zones first
    for (const [applianceType, data] of applianceMap.entries()) {
      const display = APPLIANCE_DISPLAY_NAMES[applianceType]
      zones.push({
        id: `appliance-${applianceType}`,
        title: display?.nameEs || applianceType,
        iconName: display?.icon || 'zap',
        content: `${t('step4.mediaDetected')}\n• ${data.label}\n\n${t('step4.mediaInstructions')}`,
        source: 'media',
        mediaItems: data.mediaItems,
      })
    }

    // Custom zones (media with category='custom')
    const customMedia = media.filter(m => m.category === 'custom')
    for (const m of customMedia) {
      const title = m.customZoneName || t('step4.customZone').replace(':', '')
      zones.push({
        id: `custom-${m.id}`,
        title,
        iconName: 'zap',
        content: `${t('step4.customZone')} ${title}\n\n${t('step4.customZoneContent')}`,
        source: 'media',
        mediaItems: [m],
      })
    }

    // Room-level zones for general photos without specific appliance focus
    for (const [room, data] of roomMap.entries()) {
      if (['entrance', 'hallway', 'door', 'exterior', 'parking', 'garage'].includes(room)) continue
      const uniqueItems = Array.from(new Set(data.items))
      zones.push({
        id: `room-${room}`,
        title: roomLabels[room] || room,
        iconName: 'zap',
        content: uniqueItems.length > 0
          ? `${t('step4.mediaDetected')}\n${uniqueItems.map(i => `• ${i}`).join('\n')}\n\n${t('step4.mediaInstructionsEach')}`
          : t('step4.zoneDetected'),
        source: 'media',
        mediaItems: data.mediaItems,
      })
    }

    return zones
  }, [media, t])

  // Get content for a zone (edited version or original)
  const getContent = useCallback((zoneId: string, originalContent: string) => {
    return reviewedContent[zoneId] ?? originalContent
  }, [reviewedContent])

  // Start editing
  const startEdit = (zoneId: string, content: string) => {
    setEditBuffer(content)
    setEditingZone(zoneId)
    setExpandedZone(zoneId)
  }

  // Save edit
  const saveEdit = (zoneId: string) => {
    onReviewedContentChange({ ...reviewedContent, [zoneId]: editBuffer })
    setEditingZone(null)
    setJustSaved(zoneId)
    setTimeout(() => setJustSaved(null), 2000)
  }

  // Cancel edit
  const cancelEdit = () => {
    setEditingZone(null)
    setEditBuffer('')
  }

  // Toggle zone
  const toggleZone = (id: string) => {
    const next = new Set(disabledZones)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onDisabledZonesChange(next)
  }

  // Toggle expand
  const toggleExpand = (id: string) => {
    if (editingZone === id) return // Don't collapse while editing
    setExpandedZone(expandedZone === id ? null : id)
  }

  const allZones = [
    ...zoneData.map(z => ({ ...z, mediaItems: matchMediaToZone(z.id, media) })),
    ...mediaZones,
  ]
  const enabledCount = allZones.filter(z => !disabledZones.has(z.id)).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="text-center">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl sm:text-3xl font-bold text-white mb-2"
        >
          {t('step4.title')}
        </motion.h2>
        <p className="text-gray-400 text-xs sm:text-sm">
          {t('step4.subtitle')}
          <br />
          <span className="text-violet-400">{t('step4.autoTranslate')}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-center gap-4 text-sm">
        <span className="text-violet-400 font-medium">{enabledCount} {t('step4.sections')}</span>
        <div className="w-px h-4 bg-gray-700" />
        <span className="text-gray-400">{t('step4.languages')}</span>
      </div>

      {/* Info banner */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-400 leading-relaxed">
          {t('step4.infoBanner')}
        </p>
      </div>

      {/* Zone cards */}
      <div className="space-y-3">
        {allZones.map((zone, index) => {
          const isDisabled = disabledZones.has(zone.id)
          const isExpanded = expandedZone === zone.id
          const isEditing = editingZone === zone.id
          const content = getContent(zone.id, zone.content)
          const isEdited = reviewedContent[zone.id] !== undefined
          const zoneMedia = zone.mediaItems || []

          return (
            <motion.div
              key={zone.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                isDisabled
                  ? 'bg-gray-900/30 border-gray-800/50 opacity-40'
                  : isEditing
                  ? 'bg-gray-900/90 border-violet-600/50'
                  : 'bg-gray-900/80 border-gray-800 hover:border-gray-700'
              }`}
            >
              {/* Card header */}
              <div
                className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 cursor-pointer"
                onClick={() => !isEditing && toggleExpand(zone.id)}
              >
                {/* Checkbox */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); toggleZone(zone.id) }}
                  className={`w-6 h-6 rounded-md border flex-shrink-0 flex items-center justify-center transition-all ${
                    !isDisabled
                      ? 'bg-violet-600/20 border-violet-500 text-violet-400'
                      : 'bg-gray-800 border-gray-700'
                  }`}
                >
                  {!isDisabled && <Check className="w-3.5 h-3.5" />}
                </button>

                {/* Icon — clickable to change icon */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!isDisabled) {
                        setIconPickerZone(iconPickerZone === zone.id ? null : zone.id)
                      }
                    }}
                    className={`${isDisabled ? 'text-gray-600' : 'text-violet-400 hover:text-violet-300 cursor-pointer'}`}
                    title={!isDisabled ? t('step4.changeIcon') : undefined}
                  >
                    {iconComponents[customIcons[zone.id] || zone.iconName] || <Zap className="w-5 h-5" />}
                  </button>
                  {/* Icon picker dropdown */}
                  {iconPickerZone === zone.id && (
                    <div
                      className="absolute top-8 left-0 z-50 bg-gray-900 border border-gray-700 rounded-xl p-2 shadow-xl grid grid-cols-5 gap-1 w-[200px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {ICON_OPTIONS.map((iconName) => (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => {
                            onCustomIconsChange({ ...customIcons, [zone.id]: iconName })
                            setIconPickerZone(null)
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${
                            (customIcons[zone.id] || zone.iconName) === iconName
                              ? 'bg-violet-600/30 text-violet-300'
                              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                          }`}
                          title={iconName}
                        >
                          {iconComponents[iconName]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Title — editable for all zones */}
                {editingTitle === zone.id ? (
                  <input
                    type="text"
                    value={customTitles[zone.id] ?? zone.title}
                    onChange={(e) => onCustomTitlesChange({ ...customTitles, [zone.id]: e.target.value })}
                    onBlur={() => setEditingTitle(null)}
                    onKeyDown={(e) => { if (e.key === 'Enter') setEditingTitle(null) }}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                    className="flex-1 font-medium text-white bg-gray-800 border border-violet-500/50 rounded px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500/30"
                  />
                ) : (
                  <span
                    className={`font-medium flex-1 ${isDisabled ? 'text-gray-600' : 'text-white'} ${!isDisabled ? 'cursor-text hover:text-violet-200' : ''}`}
                    onClick={(e) => {
                      if (!isDisabled) {
                        e.stopPropagation()
                        setEditingTitle(zone.id)
                      }
                    }}
                    title={!isDisabled ? t('step4.editTitle') : undefined}
                  >
                    {customTitles[zone.id] ?? zone.title}
                  </span>
                )}

                {/* Badges */}
                {zone.source === 'auto' && locationDataLoading && (
                  <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                )}
                {zone.source === 'auto' && !locationDataLoading && (
                  <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-medium">{t('step4.badges.auto')}</span>
                )}
                {zone.source === 'media' && (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-medium">{t('step4.badges.ai')}</span>
                )}
                {justSaved === zone.id && (
                  <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-medium animate-pulse">{t('step4.badges.saved')}</span>
                )}
                {isEdited && !isDisabled && justSaved !== zone.id && (
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-medium">{t('step4.badges.edited')}</span>
                )}

                {/* Media indicator */}
                {zoneMedia.length > 0 && !isDisabled && (
                  <div className="flex items-center gap-1 text-gray-500">
                    {zoneMedia.some(m => m.type === 'video')
                      ? <Play className="w-3.5 h-3.5" />
                      : <ImageIcon className="w-3.5 h-3.5" />
                    }
                    <span className="text-[10px]">{zoneMedia.length}</span>
                  </div>
                )}

                {/* Edit button */}
                {!isDisabled && zone.source !== 'auto' && !isEditing && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); startEdit(zone.id, content) }}
                    className="p-1 text-gray-500 hover:text-violet-400 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Chevron */}
                {!isEditing && (
                  <div className={`text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Expanded content */}
              <AnimatePresence>
                {(isExpanded || isEditing) && !isDisabled && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    {/* Media strip */}
                    {zoneMedia.length > 0 && (
                      <div className="px-4 pb-3 flex gap-2 overflow-x-auto">
                        {zoneMedia.map((m) => (
                          <div key={m.id} className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-gray-700">
                            {m.type === 'video' ? (
                              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                <Play className="w-6 h-6 text-violet-400" />
                              </div>
                            ) : (
                              <img src={m.url} alt="" className="w-full h-full object-cover" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Content area */}
                    <div className="border-t border-gray-800/50">
                      {isEditing ? (
                        /* Editing mode */
                        <div className="p-4 space-y-3">
                          <textarea
                            value={editBuffer}
                            onChange={(e) => setEditBuffer(e.target.value)}
                            className="w-full min-h-[200px] sm:min-h-[300px] bg-gray-950 border border-gray-700 rounded-lg p-3 text-sm text-gray-200 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-violet-500 resize-y"
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="px-4 py-2 rounded-lg border border-gray-700 text-gray-400 text-sm hover:bg-gray-800 transition-colors flex items-center gap-1.5"
                            >
                              <X className="w-3.5 h-3.5" />
                              {t('step4.cancel')}
                            </button>
                            <button
                              type="button"
                              onClick={() => saveEdit(zone.id)}
                              className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm hover:bg-violet-500 transition-colors flex items-center gap-1.5"
                            >
                              <Save className="w-3.5 h-3.5" />
                              {t('step4.save')}
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Preview mode */
                        <div className="p-4">
                          <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {content.split('\n').map((line, i) => {
                              // Horizontal rule
                              if (line.trim() === '---') {
                                return <div key={i} className="border-t border-gray-800 my-3" />
                              }
                              // Escape HTML entities first to prevent XSS
                              let rendered = line
                                .replace(/&/g, '&amp;')
                                .replace(/</g, '&lt;')
                                .replace(/>/g, '&gt;')
                                .replace(/"/g, '&quot;')
                              // Bold (safe now — HTML is escaped)
                              rendered = rendered.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
                              // Checkboxes
                              rendered = rendered.replace(/^☐ /, '<span class="text-gray-500">☐</span> ')
                              return (
                                <div key={i} className={line === '' ? 'h-2' : ''}>
                                  <span dangerouslySetInnerHTML={{ __html: rendered }} />
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 sm:gap-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 h-12 sm:h-14 rounded-xl text-base sm:text-lg font-semibold border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">{t('step4.previous')}</span>
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-[2] h-12 sm:h-14 rounded-xl text-base sm:text-lg font-semibold bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/25 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          {t('step4.generateManual')}
        </button>
      </div>
    </motion.div>
  )
}
