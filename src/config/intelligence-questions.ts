import type { PropertyIntelligence } from '../types/intelligence'

// ============================================
// TYPES
// ============================================

export interface QuestionDef {
  id: string
  label: string
  type: 'yesno' | 'text' | 'textarea' | 'select' | 'time-range' | 'editable-list' | 'number'
  placeholder?: string
  options?: { value: string; label: string }[]
  path: string
  showIf?: { path: string; value: any; operator?: 'eq' | 'neq' | 'truthy' }
  followUp?: QuestionDef[]
  priority: 'essential' | 'important' | 'useful'
  chatbotTip?: string
  airbnbMapped?: boolean
}

export interface SectionDef {
  id: string
  title: string
  subtitle: string
  icon: string
  questions: QuestionDef[]
}

// ============================================
// HELPER — get/set nested values via dot notation
// ============================================

export function getValue(obj: any, path: string): any {
  if (!obj) return undefined
  const parts = path.split('.')
  let current = obj
  for (const part of parts) {
    if (current == null) return undefined
    current = current[part]
  }
  return current
}

export function buildPatch(path: string, value: any): Record<string, any> {
  const parts = path.split('.')
  if (parts.length === 1) return { [parts[0]]: value }
  const result: Record<string, any> = {}
  let current = result
  for (let i = 0; i < parts.length - 1; i++) {
    current[parts[i]] = {}
    current = current[parts[i]]
  }
  current[parts[parts.length - 1]] = value
  return result
}

export function evaluateShowIf(intel: PropertyIntelligence, showIf?: QuestionDef['showIf']): boolean {
  if (!showIf) return true
  const val = getValue(intel, showIf.path)
  const op = showIf.operator || 'eq'
  if (op === 'truthy') return !!val
  if (op === 'neq') return val !== showIf.value
  return val === showIf.value
}

export function isQuestionComplete(intel: PropertyIntelligence, q: QuestionDef): boolean {
  const val = getValue(intel, q.path)
  if (q.type === 'yesno') return val !== undefined && val !== null
  if (q.type === 'editable-list') return Array.isArray(val) && val.length > 0
  if (q.type === 'number') return val !== undefined && val !== null && val !== ''
  return !!val
}

export function getSectionCompletion(intel: PropertyIntelligence, section: SectionDef): { count: number; total: number } {
  let count = 0
  let total = 0

  function countQuestion(q: QuestionDef) {
    if (!evaluateShowIf(intel, q.showIf)) return
    total++
    if (isQuestionComplete(intel, q)) {
      count++
      // Count followUp questions too
      if (q.followUp) {
        for (const fu of q.followUp) {
          if (evaluateShowIf(intel, fu.showIf)) {
            countQuestion(fu)
          }
        }
      }
    }
  }

  for (const q of section.questions) {
    countQuestion(q)
  }

  return { count, total }
}

// ============================================
// SECTIONS
// ============================================

export const INTELLIGENCE_SECTIONS: SectionDef[] = [
  // ========== 1. WIFI ==========
  {
    id: 'wifi',
    title: 'WiFi e Internet',
    subtitle: 'La pregunta #1 de todos los huéspedes',
    icon: 'Wifi',
    questions: [
      {
        id: 'wifi.networkName',
        label: 'Nombre de la red WiFi',
        type: 'text',
        placeholder: 'Ej: MiCasa_5G',
        path: 'wifi.networkName',
        priority: 'essential',
        chatbotTip: 'Podrá decir: "La red WiFi es XXXX"',
        airbnbMapped: true,
      },
      {
        id: 'wifi.password',
        label: 'Contraseña WiFi',
        type: 'text',
        placeholder: 'Ej: clave1234',
        path: 'wifi.password',
        priority: 'essential',
        chatbotTip: 'Podrá dar la contraseña directamente',
        airbnbMapped: true,
      },
      {
        id: 'wifi.routerLocation',
        label: '¿Dónde está el router?',
        type: 'text',
        placeholder: 'Ej: salón, mueble de la TV',
        path: 'wifi.routerLocation',
        priority: 'useful',
      },
      {
        id: 'wifi.speedMbps',
        label: 'Velocidad (Mbps)',
        type: 'number',
        placeholder: 'Ej: 300',
        path: 'wifi.speedMbps',
        priority: 'useful',
      },
      {
        id: 'wifi.troubleshooting',
        label: 'Si no funciona el WiFi...',
        type: 'textarea',
        placeholder: 'Ej: Apagar router 30 segundos, volver a encender. Botón reset en la parte trasera.',
        path: 'wifi.troubleshooting',
        priority: 'important',
        chatbotTip: 'Podrá resolver problemas de WiFi sin molestar al anfitrión',
      },
      {
        id: 'wifi.hasEthernet',
        label: '¿Hay conexión por cable (Ethernet)?',
        type: 'yesno',
        path: 'wifi.hasEthernet',
        priority: 'useful',
        followUp: [
          {
            id: 'wifi.ethernetLocation',
            label: '¿Dónde está la toma ethernet?',
            type: 'text',
            placeholder: 'Ej: detrás del escritorio',
            path: 'wifi.ethernetLocation',
            showIf: { path: 'wifi.hasEthernet', value: true },
            priority: 'useful',
          },
        ],
      },
    ],
  },

  // ========== 2. EQUIPAMIENTO (existente migrado) ==========
  {
    id: 'items',
    title: 'Equipamiento',
    subtitle: 'Lo que tus huéspedes siempre preguntan',
    icon: 'Home',
    questions: [
      { id: 'items.iron', label: '¿Hay plancha?', type: 'yesno', path: 'items.iron.has', priority: 'important', airbnbMapped: true,
        followUp: [{ id: 'items.iron.location', label: '¿Dónde está?', type: 'text', placeholder: 'Ej: armario del dormitorio principal', path: 'items.iron.location', showIf: { path: 'items.iron.has', value: true }, priority: 'important' }] },
      { id: 'items.ironingBoard', label: '¿Hay tabla de planchar?', type: 'yesno', path: 'items.ironingBoard.has', priority: 'useful', airbnbMapped: true,
        followUp: [{ id: 'items.ironingBoard.location', label: '¿Dónde está?', type: 'text', placeholder: 'Ej: detrás de la puerta del baño', path: 'items.ironingBoard.location', showIf: { path: 'items.ironingBoard.has', value: true }, priority: 'useful' }] },
      { id: 'items.hairdryer', label: '¿Hay secador de pelo?', type: 'yesno', path: 'items.hairdryer.has', priority: 'important', airbnbMapped: true,
        followUp: [{ id: 'items.hairdryer.location', label: '¿Dónde está?', type: 'text', placeholder: 'Ej: cajón del baño', path: 'items.hairdryer.location', showIf: { path: 'items.hairdryer.has', value: true }, priority: 'important' }] },
      { id: 'items.firstAid', label: '¿Hay botiquín?', type: 'yesno', path: 'items.firstAid.has', priority: 'important', airbnbMapped: true,
        followUp: [{ id: 'items.firstAid.location', label: '¿Dónde está?', type: 'text', placeholder: 'Ej: armario de la cocina, estante superior', path: 'items.firstAid.location', showIf: { path: 'items.firstAid.has', value: true }, priority: 'important' }] },
      { id: 'items.extraBlankets', label: '¿Hay mantas extra?', type: 'yesno', path: 'items.extraBlankets.has', priority: 'useful', airbnbMapped: true,
        followUp: [{ id: 'items.extraBlankets.location', label: '¿Dónde están?', type: 'text', placeholder: 'Ej: armario del pasillo, balda de arriba', path: 'items.extraBlankets.location', showIf: { path: 'items.extraBlankets.has', value: true }, priority: 'useful' }] },
      { id: 'items.broom', label: '¿Hay escoba / recogedor?', type: 'yesno', path: 'items.broom.has', priority: 'useful', airbnbMapped: true,
        followUp: [{ id: 'items.broom.location', label: '¿Dónde está?', type: 'text', placeholder: 'Ej: galería, junto a la lavadora', path: 'items.broom.location', showIf: { path: 'items.broom.has', value: true }, priority: 'useful' }] },
    ],
  },

  // ========== 3. NORMAS (existente migrado) ==========
  {
    id: 'houseRules',
    title: 'Normas de la casa',
    subtitle: 'Airbnb las importa automáticamente',
    icon: 'ShieldCheck',
    questions: [
      { id: 'houseRules.noPets', label: '¿Se permiten mascotas?', type: 'yesno', path: 'houseRules.noPets', priority: 'essential', airbnbMapped: true },
      { id: 'houseRules.noSmoking', label: '¿Se permite fumar?', type: 'yesno', path: 'houseRules.noSmoking', priority: 'essential', airbnbMapped: true },
      { id: 'houseRules.noParties', label: '¿Se permiten fiestas?', type: 'yesno', path: 'houseRules.noParties', priority: 'essential', airbnbMapped: true },
      { id: 'houseRules.quietHours', label: 'Horario de silencio', type: 'time-range', path: 'houseRules.quietHoursStart', priority: 'essential', airbnbMapped: true },
      { id: 'houseRules.additionalRules', label: 'Reglas adicionales', type: 'textarea', placeholder: 'Ej: No tender ropa en el balcón, no usar altavoces...', path: 'houseRules.additionalRules', priority: 'important' },
    ],
  },

  // ========== 4. CHECK-IN (existente migrado) ==========
  {
    id: 'checkin',
    title: 'Check-in y acceso',
    subtitle: 'Solo tú sabes los códigos',
    icon: 'LogIn',
    questions: [
      { id: 'details.lockboxCode', label: 'Código lockbox', type: 'text', placeholder: 'Código lockbox: 1234', path: 'details.lockboxCode', priority: 'essential' },
      { id: 'details.doorCode', label: 'Código puerta (si es diferente)', type: 'text', placeholder: 'Código puerta: 5678#', path: 'details.doorCode', priority: 'essential' },
      { id: 'details.lockboxLocation', label: '¿Dónde está la lockbox?', type: 'text', placeholder: 'Ej: a la derecha de la puerta, caja negra', path: 'details.lockboxLocation', priority: 'essential' },
      { id: 'details.codeChangesPerReservation', label: '¿El código cambia cada reserva?', type: 'yesno', path: 'details.codeChangesPerReservation', priority: 'important' },
      {
        id: 'details.latePlan', label: 'Si llegan tarde, ¿qué hacen?', type: 'select', path: 'details.latePlan', priority: 'important',
        options: [
          { value: 'lockbox', label: 'La lockbox está 24h disponible' },
          { value: 'call', label: 'Que me llamen al llegar' },
          { value: 'neighbor', label: 'Un vecino tiene copia' },
          { value: 'other', label: 'Otro' },
        ],
        followUp: [{
          id: 'details.latePlanDetails', label: 'Detalles', type: 'text', placeholder: 'Explicar...', path: 'details.latePlanDetails',
          showIf: { path: 'details.latePlan', value: 'other' }, priority: 'important',
        }],
      },
      { id: 'details.meetingPoint', label: 'Punto de encuentro (si es en persona)', type: 'text', placeholder: 'Ej: en el portal del edificio', path: 'details.meetingPoint', priority: 'important' },
    ],
  },

  // ========== 5. CHECK-OUT (existente migrado) ==========
  {
    id: 'checkout',
    title: 'Check-out',
    subtitle: 'Tareas de salida importadas de Airbnb',
    icon: 'LogOut',
    questions: [
      { id: 'checkoutTasks', label: 'Tareas antes de salir', type: 'editable-list', placeholder: 'Ej: Tirar basura, apagar luces, cerrar ventanas...', path: 'checkoutTasks', priority: 'essential', airbnbMapped: true },
      { id: 'details.checkoutInstructions', label: 'Instrucciones de checkout', type: 'textarea', placeholder: 'Ej: Dejar toallas en la bañera, apagar el AC...', path: 'details.checkoutInstructions', priority: 'essential' },
      {
        id: 'details.keyReturn', label: '¿Cómo devuelven la llave?', type: 'select', path: 'details.keyReturn', priority: 'essential',
        options: [
          { value: 'lockbox', label: 'Meter en la lockbox' },
          { value: 'table', label: 'Dejar en la mesa' },
          { value: 'auto', label: 'Se cierra sola (no hay llave)' },
          { value: 'hand', label: 'Dar en mano' },
        ],
        followUp: [{
          id: 'details.keyReturnDetails', label: '¿A quién y dónde?', type: 'text', placeholder: '¿A quién y dónde?', path: 'details.keyReturnDetails',
          showIf: { path: 'details.keyReturn', value: 'hand' }, priority: 'essential',
        }],
      },
      {
        id: 'details.lateCheckout', label: '¿Ofrecen late checkout?', type: 'select', path: 'details.lateCheckout', priority: 'important',
        options: [
          { value: 'paid', label: 'Sí, de pago' },
          { value: 'free', label: 'Sí, gratis' },
          { value: 'no', label: 'No' },
        ],
        followUp: [
          { id: 'details.lateCheckoutPrice', label: 'Precio', type: 'text', placeholder: 'Precio: 20€', path: 'details.lateCheckoutPrice', showIf: { path: 'details.lateCheckout', value: 'paid' }, priority: 'important' },
          { id: 'details.lateCheckoutUntil', label: 'Hasta las', type: 'text', placeholder: 'Hasta las: 14:00', path: 'details.lateCheckoutUntil', showIf: { path: 'details.lateCheckout', value: 'paid' }, priority: 'important' },
          { id: 'details.lateCheckoutUntilFree', label: 'Hasta las', type: 'text', placeholder: 'Hasta las: 14:00', path: 'details.lateCheckoutUntil', showIf: { path: 'details.lateCheckout', value: 'free' }, priority: 'important' },
        ],
      },
      {
        id: 'details.luggageAfterCheckout', label: '¿Pueden dejar maletas después?', type: 'select', path: 'details.luggageAfterCheckout', priority: 'important',
        options: [
          { value: 'apartment', label: 'Sí, en el apartamento' },
          { value: 'consigna', label: 'Hay consigna cercana' },
          { value: 'no', label: 'No' },
        ],
        followUp: [
          { id: 'details.luggageUntil', label: 'Hasta las', type: 'text', placeholder: 'Hasta las: 18:00', path: 'details.luggageUntil', showIf: { path: 'details.luggageAfterCheckout', value: 'apartment' }, priority: 'important' },
          { id: 'details.luggageConsignaInfo', label: 'Info consigna', type: 'text', placeholder: 'Nombre y dirección de la consigna', path: 'details.luggageConsignaInfo', showIf: { path: 'details.luggageAfterCheckout', value: 'consigna' }, priority: 'important' },
        ],
      },
    ],
  },

  // ========== 6. ELECTRODOMÉSTICOS ==========
  {
    id: 'appliances',
    title: 'Electrodomésticos',
    subtitle: 'Lavadora, horno, cafetera...',
    icon: 'Refrigerator',
    questions: [
      {
        id: 'appliances.washingMachine.has', label: '¿Hay lavadora?', type: 'yesno', path: 'appliances.washingMachine.has', priority: 'important', airbnbMapped: true,
        followUp: [
          { id: 'appliances.washingMachine.location', label: '¿Dónde está?', type: 'text', placeholder: 'Ej: galería', path: 'appliances.washingMachine.location', showIf: { path: 'appliances.washingMachine.has', value: true }, priority: 'important' },
          { id: 'appliances.washingMachine.instructions', label: 'Instrucciones', type: 'textarea', placeholder: 'Ej: Programa 30° para ropa normal. No mezclar colores.', path: 'appliances.washingMachine.instructions', showIf: { path: 'appliances.washingMachine.has', value: true }, priority: 'useful' },
        ],
      },
      {
        id: 'appliances.dryer.has', label: '¿Hay secadora?', type: 'yesno', path: 'appliances.dryer.has', priority: 'useful', airbnbMapped: true,
        followUp: [
          { id: 'appliances.dryer.location', label: '¿Dónde está?', type: 'text', placeholder: 'Ej: al lado de la lavadora', path: 'appliances.dryer.location', showIf: { path: 'appliances.dryer.has', value: true }, priority: 'useful' },
          { id: 'appliances.dryer.instructions', label: 'Instrucciones', type: 'textarea', placeholder: 'Ej: Vaciar filtro de pelusas después de cada uso', path: 'appliances.dryer.instructions', showIf: { path: 'appliances.dryer.has', value: true }, priority: 'useful' },
        ],
      },
      {
        id: 'appliances.dishwasher.has', label: '¿Hay lavavajillas?', type: 'yesno', path: 'appliances.dishwasher.has', priority: 'useful', airbnbMapped: true,
        followUp: [
          { id: 'appliances.dishwasher.location', label: '¿Dónde está?', type: 'text', placeholder: 'Ej: debajo de la encimera, a la izquierda del fregadero', path: 'appliances.dishwasher.location', showIf: { path: 'appliances.dishwasher.has', value: true }, priority: 'useful' },
          { id: 'appliances.dishwasher.detergentLocation', label: '¿Dónde están las pastillas?', type: 'text', placeholder: 'Ej: debajo del fregadero', path: 'appliances.dishwasher.detergentLocation', showIf: { path: 'appliances.dishwasher.has', value: true }, priority: 'useful' },
        ],
      },
      {
        id: 'appliances.oven.has', label: '¿Hay horno?', type: 'yesno', path: 'appliances.oven.has', priority: 'useful', airbnbMapped: true,
        followUp: [{
          id: 'appliances.oven.type', label: 'Tipo de horno', type: 'select', path: 'appliances.oven.type',
          showIf: { path: 'appliances.oven.has', value: true }, priority: 'useful',
          options: [{ value: 'electric', label: 'Eléctrico' }, { value: 'gas', label: 'Gas' }],
        }],
      },
      {
        id: 'appliances.microwave.has', label: '¿Hay microondas?', type: 'yesno', path: 'appliances.microwave.has', priority: 'useful', airbnbMapped: true,
        followUp: [{ id: 'appliances.microwave.location', label: '¿Dónde está?', type: 'text', placeholder: 'Ej: encima del horno', path: 'appliances.microwave.location', showIf: { path: 'appliances.microwave.has', value: true }, priority: 'useful' }],
      },
      {
        id: 'appliances.coffeeMachine.has', label: '¿Hay cafetera?', type: 'yesno', path: 'appliances.coffeeMachine.has', priority: 'useful', airbnbMapped: true,
        chatbotTip: 'Podrá decir qué tipo de cafetera hay y dónde están las cápsulas',
        followUp: [
          { id: 'appliances.coffeeMachine.type', label: 'Tipo de cafetera', type: 'text', placeholder: 'Ej: Nespresso Vertuo, Italiana Bialetti', path: 'appliances.coffeeMachine.type', showIf: { path: 'appliances.coffeeMachine.has', value: true }, priority: 'useful' },
          { id: 'appliances.coffeeMachine.capsuleLocation', label: '¿Dónde están las cápsulas/café?', type: 'text', placeholder: 'Ej: cajón de la derecha', path: 'appliances.coffeeMachine.capsuleLocation', showIf: { path: 'appliances.coffeeMachine.has', value: true }, priority: 'useful' },
        ],
      },
      {
        id: 'appliances.toaster.has', label: '¿Hay tostadora?', type: 'yesno', path: 'appliances.toaster.has', priority: 'useful',
        followUp: [{ id: 'appliances.toaster.location', label: '¿Dónde está?', type: 'text', placeholder: 'Ej: encimera de la cocina', path: 'appliances.toaster.location', showIf: { path: 'appliances.toaster.has', value: true }, priority: 'useful' }],
      },
      {
        id: 'appliances.kettle.has', label: '¿Hay hervidor?', type: 'yesno', path: 'appliances.kettle.has', priority: 'useful',
        followUp: [{ id: 'appliances.kettle.location', label: '¿Dónde está?', type: 'text', placeholder: 'Ej: encimera junto al fregadero', path: 'appliances.kettle.location', showIf: { path: 'appliances.kettle.has', value: true }, priority: 'useful' }],
      },
      {
        id: 'appliances.vacuumCleaner.has', label: '¿Hay aspiradora?', type: 'yesno', path: 'appliances.vacuumCleaner.has', priority: 'useful',
        followUp: [{ id: 'appliances.vacuumCleaner.location', label: '¿Dónde está?', type: 'text', placeholder: 'Ej: armario del pasillo', path: 'appliances.vacuumCleaner.location', showIf: { path: 'appliances.vacuumCleaner.has', value: true }, priority: 'useful' }],
      },
      {
        id: 'appliances.mop.has', label: '¿Hay fregona?', type: 'yesno', path: 'appliances.mop.has', priority: 'useful',
        followUp: [{ id: 'appliances.mop.location', label: '¿Dónde está?', type: 'text', placeholder: 'Ej: galería', path: 'appliances.mop.location', showIf: { path: 'appliances.mop.has', value: true }, priority: 'useful' }],
      },
    ],
  },

  // ========== 7. CLIMA ==========
  {
    id: 'climate',
    title: 'Clima',
    subtitle: 'AC, calefacción, ventilador',
    icon: 'Thermometer',
    questions: [
      {
        id: 'climate.ac.has', label: '¿Hay aire acondicionado?', type: 'yesno', path: 'climate.ac.has', priority: 'important', airbnbMapped: true,
        followUp: [
          {
            id: 'climate.ac.type', label: 'Tipo de AC', type: 'select', path: 'climate.ac.type', priority: 'important',
            showIf: { path: 'climate.ac.has', value: true },
            options: [{ value: 'split', label: 'Split (pared)' }, { value: 'central', label: 'Central' }, { value: 'portable', label: 'Portátil' }],
          },
          { id: 'climate.ac.remoteLocation', label: '¿Dónde está el mando?', type: 'text', placeholder: 'Ej: cajón de la mesita de noche', path: 'climate.ac.remoteLocation', showIf: { path: 'climate.ac.has', value: true }, priority: 'important' },
          { id: 'climate.ac.instructions', label: 'Instrucciones de uso', type: 'textarea', placeholder: 'Ej: Botón MODE para cambiar frío/calor. No bajar de 20° en invierno.', path: 'climate.ac.instructions', showIf: { path: 'climate.ac.has', value: true }, priority: 'important' },
        ],
      },
      {
        id: 'climate.heating.has', label: '¿Hay calefacción?', type: 'yesno', path: 'climate.heating.has', priority: 'important', airbnbMapped: true,
        followUp: [
          {
            id: 'climate.heating.type', label: 'Tipo de calefacción', type: 'select', path: 'climate.heating.type', priority: 'important',
            showIf: { path: 'climate.heating.has', value: true },
            options: [
              { value: 'central', label: 'Central' },
              { value: 'radiator', label: 'Radiadores eléctricos' },
              { value: 'underfloor', label: 'Suelo radiante' },
              { value: 'portable', label: 'Portátil' },
              { value: 'ac', label: 'AC con modo calor' },
            ],
          },
          { id: 'climate.heating.thermostatLocation', label: '¿Dónde está el termostato?', type: 'text', placeholder: 'Ej: pasillo, junto a la puerta principal', path: 'climate.heating.thermostatLocation', showIf: { path: 'climate.heating.has', value: true }, priority: 'important' },
          { id: 'climate.heating.instructions', label: 'Instrucciones', type: 'textarea', placeholder: 'Ej: Subir rueda para más calor. Max recomendado: 22°', path: 'climate.heating.instructions', showIf: { path: 'climate.heating.has', value: true }, priority: 'useful' },
        ],
      },
      {
        id: 'climate.fan.has', label: '¿Hay ventilador?', type: 'yesno', path: 'climate.fan.has', priority: 'useful',
        followUp: [{ id: 'climate.fan.location', label: '¿Dónde está?', type: 'text', placeholder: 'Ej: armario del dormitorio', path: 'climate.fan.location', showIf: { path: 'climate.fan.has', value: true }, priority: 'useful' }],
      },
      {
        id: 'climate.fireplace.has', label: '¿Hay chimenea?', type: 'yesno', path: 'climate.fireplace.has', priority: 'useful', airbnbMapped: true,
        followUp: [
          {
            id: 'climate.fireplace.type', label: 'Tipo de chimenea', type: 'select', path: 'climate.fireplace.type', priority: 'useful',
            showIf: { path: 'climate.fireplace.has', value: true },
            options: [{ value: 'gas', label: 'Gas' }, { value: 'wood', label: 'Leña' }, { value: 'electric', label: 'Eléctrica' }],
          },
          { id: 'climate.fireplace.instructions', label: 'Instrucciones', type: 'textarea', placeholder: 'Ej: Abrir tiro antes de encender. Leña en el garaje.', path: 'climate.fireplace.instructions', showIf: { path: 'climate.fireplace.has', value: true }, priority: 'useful' },
        ],
      },
    ],
  },

  // ========== 8. AGUA Y BAÑO ==========
  {
    id: 'waterBathroom',
    title: 'Agua y baño',
    subtitle: 'Agua caliente, toallas, ducha',
    icon: 'Droplets',
    questions: [
      {
        id: 'waterBathroom.hotWaterType', label: 'Tipo de agua caliente', type: 'select', path: 'waterBathroom.hotWaterType', priority: 'important',
        chatbotTip: 'Podrá avisar si el agua caliente es limitada',
        options: [
          { value: 'instant-gas', label: 'Instantáneo (gas) — ilimitada' },
          { value: 'instant-electric', label: 'Instantáneo (eléctrico) — ilimitada' },
          { value: 'tank-small', label: 'Termo pequeño (50-80L) — 2 duchas seguidas' },
          { value: 'tank-large', label: 'Termo grande (100L+) — 4+ duchas' },
          { value: 'central', label: 'Centralizado — sin límite' },
        ],
        followUp: [
          { id: 'waterBathroom.tankCapacityLiters', label: 'Capacidad del termo (litros)', type: 'number', placeholder: 'Ej: 80', path: 'waterBathroom.tankCapacityLiters', showIf: { path: 'waterBathroom.hotWaterType', value: 'tank-small' }, priority: 'useful' },
          { id: 'waterBathroom.hotWaterWarning', label: 'Aviso para huéspedes', type: 'textarea', placeholder: 'Ej: Si se agota el agua caliente, esperar 30 minutos. Máx 2 duchas seguidas.', path: 'waterBathroom.hotWaterWarning', showIf: { path: 'waterBathroom.hotWaterType', value: 'tank-small' }, priority: 'important',
            chatbotTip: 'El chatbot avisará a los huéspedes antes de que se queden sin agua caliente' },
          { id: 'waterBathroom.hotWaterWarningLarge', label: 'Aviso para huéspedes (opcional)', type: 'textarea', placeholder: 'Ej: Esperar 20 min si se usan 4+ duchas seguidas', path: 'waterBathroom.hotWaterWarning', showIf: { path: 'waterBathroom.hotWaterType', value: 'tank-large' }, priority: 'useful' },
          { id: 'waterBathroom.gasBottle.applies', label: '¿Usa bombona de gas?', type: 'yesno', path: 'waterBathroom.gasBottle.applies', showIf: { path: 'waterBathroom.hotWaterType', value: 'instant-gas' }, priority: 'important' },
          { id: 'waterBathroom.gasBottle.location', label: '¿Dónde está la bombona?', type: 'text', placeholder: 'Ej: galería, armario de la izquierda', path: 'waterBathroom.gasBottle.location', showIf: { path: 'waterBathroom.gasBottle.applies', value: true }, priority: 'important' },
          { id: 'waterBathroom.gasBottle.howToChange', label: '¿Cómo se cambia?', type: 'textarea', placeholder: 'Ej: Cerrar llave, desenroscar regulador, poner bombona nueva, abrir llave', path: 'waterBathroom.gasBottle.howToChange', showIf: { path: 'waterBathroom.gasBottle.applies', value: true }, priority: 'important' },
          { id: 'waterBathroom.gasBottle.emergencyNumber', label: 'Teléfono emergencia gas', type: 'text', placeholder: 'Ej: 900 750 750 (Repsol Butano)', path: 'waterBathroom.gasBottle.emergencyNumber', showIf: { path: 'waterBathroom.gasBottle.applies', value: true }, priority: 'important' },
        ],
      },
      { id: 'waterBathroom.waterPressureNote', label: 'Nota sobre presión del agua', type: 'text', placeholder: 'Ej: La presión baja un poco de 20h a 22h', path: 'waterBathroom.waterPressureNote', priority: 'useful' },
      { id: 'waterBathroom.showerType', label: 'Tipo de ducha', type: 'text', placeholder: 'Ej: Mampara, Cortina, Bañera con ducha', path: 'waterBathroom.showerType', priority: 'useful' },
      { id: 'waterBathroom.towelsLocation', label: '¿Dónde están las toallas?', type: 'text', placeholder: 'Ej: armario del baño', path: 'waterBathroom.towelsLocation', priority: 'important' },
      { id: 'waterBathroom.extraTowelsLocation', label: '¿Dónde hay toallas extra?', type: 'text', placeholder: 'Ej: estante superior del armario del dormitorio', path: 'waterBathroom.extraTowelsLocation', priority: 'useful' },
      { id: 'waterBathroom.toiletPaperLocation', label: '¿Dónde hay papel higiénico extra?', type: 'text', placeholder: 'Ej: debajo del lavabo', path: 'waterBathroom.toiletPaperLocation', priority: 'useful' },
    ],
  },

  // ========== 9. DORMITORIO ==========
  {
    id: 'bedroom',
    title: 'Dormitorio',
    subtitle: 'Colchón, almohadas, caja fuerte',
    icon: 'Bed',
    questions: [
      { id: 'bedroom.mattressType', label: 'Tipo de colchón', type: 'text', placeholder: 'Ej: Viscoelástico 150x200', path: 'bedroom.mattressType', priority: 'useful' },
      { id: 'bedroom.pillowTypes', label: 'Tipo de almohadas', type: 'text', placeholder: 'Ej: 2 firmes + 2 blandas', path: 'bedroom.pillowTypes', priority: 'useful' },
      { id: 'bedroom.extraPillowsLocation', label: '¿Dónde hay almohadas extra?', type: 'text', placeholder: 'Ej: altillo del armario', path: 'bedroom.extraPillowsLocation', priority: 'useful' },
      { id: 'bedroom.bedLinenLocation', label: '¿Dónde está la ropa de cama?', type: 'text', placeholder: 'Ej: armario del dormitorio, segundo cajón', path: 'bedroom.bedLinenLocation', priority: 'useful' },
      { id: 'bedroom.blackoutCurtains', label: '¿Hay cortinas opacas?', type: 'yesno', path: 'bedroom.blackoutCurtains', priority: 'useful' },
      {
        id: 'bedroom.safebox.has', label: '¿Hay caja fuerte?', type: 'yesno', path: 'bedroom.safebox.has', priority: 'useful',
        followUp: [
          { id: 'bedroom.safebox.location', label: '¿Dónde está?', type: 'text', placeholder: 'Ej: dentro del armario, balda superior', path: 'bedroom.safebox.location', showIf: { path: 'bedroom.safebox.has', value: true }, priority: 'useful' },
          { id: 'bedroom.safebox.code', label: 'Código por defecto', type: 'text', placeholder: 'Ej: 0000 (el huésped lo cambia)', path: 'bedroom.safebox.code', showIf: { path: 'bedroom.safebox.has', value: true }, priority: 'useful' },
          { id: 'bedroom.safebox.instructions', label: 'Instrucciones', type: 'textarea', placeholder: 'Ej: Pulsar * + nuevo código + # para cambiar. Para abrir: código + #', path: 'bedroom.safebox.instructions', showIf: { path: 'bedroom.safebox.has', value: true }, priority: 'useful' },
        ],
      },
    ],
  },

  // ========== 10. COCINA ==========
  {
    id: 'kitchen',
    title: 'Cocina',
    subtitle: 'Básicos, utensilios, supermercado',
    icon: 'UtensilsCrossed',
    questions: [
      { id: 'kitchen.essentialsProvided', label: 'Básicos incluidos', type: 'editable-list', placeholder: 'Ej: sal, aceite, azúcar, café...', path: 'kitchen.essentialsProvided', priority: 'important',
        chatbotTip: 'Podrá decir qué básicos hay disponibles' },
      { id: 'kitchen.utensilsNote', label: 'Nota sobre utensilios', type: 'textarea', placeholder: 'Ej: Hay sartenes, ollas, tabla de cortar, cuchillos...', path: 'kitchen.utensilsNote', priority: 'useful' },
      { id: 'kitchen.potsPansLocation', label: '¿Dónde están ollas y sartenes?', type: 'text', placeholder: 'Ej: armario debajo de la vitrocerámica', path: 'kitchen.potsPansLocation', priority: 'useful' },
      { id: 'kitchen.trashBagsLocation', label: '¿Dónde están las bolsas de basura?', type: 'text', placeholder: 'Ej: cajón debajo del fregadero', path: 'kitchen.trashBagsLocation', priority: 'useful' },
      { id: 'kitchen.dishSoapLocation', label: '¿Dónde está el jabón de fregar?', type: 'text', placeholder: 'Ej: debajo del fregadero', path: 'kitchen.dishSoapLocation', priority: 'useful' },
      { id: 'kitchen.waterDrinkable', label: '¿El agua del grifo es potable?', type: 'yesno', path: 'kitchen.waterDrinkable', priority: 'important',
        chatbotTip: 'Podrá decir si el agua es segura para beber',
        followUp: [{
          id: 'kitchen.waterFilter.has', label: '¿Hay filtro de agua?', type: 'yesno', path: 'kitchen.waterFilter.has', showIf: { path: 'kitchen.waterDrinkable', value: false }, priority: 'useful',
          followUp: [{ id: 'kitchen.waterFilter.location', label: '¿Dónde está?', type: 'text', placeholder: 'Ej: jarra Brita en la nevera', path: 'kitchen.waterFilter.location', showIf: { path: 'kitchen.waterFilter.has', value: true }, priority: 'useful' }],
        }],
      },
      { id: 'kitchen.nearestSupermarket', label: 'Supermercado más cercano', type: 'text', placeholder: 'Ej: Mercadona a 200m, calle Mayor 15', path: 'kitchen.nearestSupermarket', priority: 'useful',
        chatbotTip: 'Podrá recomendar dónde comprar' },
      { id: 'kitchen.supermarketHours', label: 'Horario del supermercado', type: 'text', placeholder: 'Ej: L-S 9:00-21:30, Dom cerrado', path: 'kitchen.supermarketHours', priority: 'useful' },
    ],
  },

  // ========== 11. ENTRETENIMIENTO ==========
  {
    id: 'entertainment',
    title: 'Entretenimiento',
    subtitle: 'TV, streaming, juegos',
    icon: 'Tv',
    questions: [
      {
        id: 'entertainment.tv.has', label: '¿Hay TV?', type: 'yesno', path: 'entertainment.tv.has', priority: 'important', airbnbMapped: true,
        followUp: [
          { id: 'entertainment.tv.type', label: 'Tipo de TV', type: 'text', placeholder: 'Ej: Samsung Smart TV 55"', path: 'entertainment.tv.type', showIf: { path: 'entertainment.tv.has', value: true }, priority: 'useful' },
          { id: 'entertainment.tv.streamingApps', label: 'Apps de streaming disponibles', type: 'editable-list', placeholder: 'Ej: Netflix, HBO, Disney+...', path: 'entertainment.tv.streamingApps', showIf: { path: 'entertainment.tv.has', value: true }, priority: 'important',
            chatbotTip: 'Podrá decir qué plataformas hay disponibles' },
          { id: 'entertainment.tv.remoteLocation', label: '¿Dónde está el mando?', type: 'text', placeholder: 'Ej: mesa del salón', path: 'entertainment.tv.remoteLocation', showIf: { path: 'entertainment.tv.has', value: true }, priority: 'useful' },
          { id: 'entertainment.tv.instructions', label: 'Instrucciones', type: 'textarea', placeholder: 'Ej: Para Netflix: botón rojo del mando. HDMI1 = cable, HDMI2 = Chromecast', path: 'entertainment.tv.instructions', showIf: { path: 'entertainment.tv.has', value: true }, priority: 'useful' },
        ],
      },
      {
        id: 'entertainment.bluetooth.has', label: '¿Hay altavoz Bluetooth?', type: 'yesno', path: 'entertainment.bluetooth.has', priority: 'useful', airbnbMapped: true,
        followUp: [{ id: 'entertainment.bluetooth.deviceName', label: 'Nombre del dispositivo', type: 'text', placeholder: 'Ej: JBL_Speaker', path: 'entertainment.bluetooth.deviceName', showIf: { path: 'entertainment.bluetooth.has', value: true }, priority: 'useful' }],
      },
      {
        id: 'entertainment.boardGames.has', label: '¿Hay juegos de mesa?', type: 'yesno', path: 'entertainment.boardGames.has', priority: 'useful', airbnbMapped: true,
        followUp: [{ id: 'entertainment.boardGames.location', label: '¿Dónde están?', type: 'text', placeholder: 'Ej: estantería del salón', path: 'entertainment.boardGames.location', showIf: { path: 'entertainment.boardGames.has', value: true }, priority: 'useful' }],
      },
      {
        id: 'entertainment.books.has', label: '¿Hay libros?', type: 'yesno', path: 'entertainment.books.has', priority: 'useful', airbnbMapped: true,
        followUp: [{ id: 'entertainment.books.location', label: '¿Dónde están?', type: 'text', placeholder: 'Ej: estantería del dormitorio', path: 'entertainment.books.location', showIf: { path: 'entertainment.books.has', value: true }, priority: 'useful' }],
      },
    ],
  },

  // ========== 12. LAVANDERÍA ==========
  {
    id: 'laundry',
    title: 'Lavandería',
    subtitle: 'Detergente, tendedero, productos',
    icon: 'Shirt',
    questions: [
      { id: 'laundry.detergentLocation', label: '¿Dónde está el detergente?', type: 'text', placeholder: 'Ej: estante encima de la lavadora', path: 'laundry.detergentLocation', priority: 'important' },
      {
        id: 'laundry.dryingRack.has', label: '¿Hay tendedero?', type: 'yesno', path: 'laundry.dryingRack.has', priority: 'useful',
        followUp: [{ id: 'laundry.dryingRack.location', label: '¿Dónde está?', type: 'text', placeholder: 'Ej: balcón', path: 'laundry.dryingRack.location', showIf: { path: 'laundry.dryingRack.has', value: true }, priority: 'useful' }],
      },
      { id: 'laundry.dryingInstructions', label: 'Instrucciones de secado', type: 'textarea', placeholder: 'Ej: No tender en balcón (norma comunidad). Usar tendedero interior.', path: 'laundry.dryingInstructions', priority: 'useful' },
      { id: 'laundry.cleaningProducts', label: '¿Dónde están los productos de limpieza?', type: 'text', placeholder: 'Ej: debajo del fregadero de la cocina', path: 'laundry.cleaningProducts', priority: 'useful' },
    ],
  },

  // ========== 13. SERVICIOS (existente migrado parcial) ==========
  {
    id: 'services',
    title: 'Servicios e instalaciones',
    subtitle: 'Para emergencias y dudas técnicas',
    icon: 'Wrench',
    questions: [
      { id: 'details.electricalPanelLocation', label: '¿Dónde está el cuadro eléctrico?', type: 'text', placeholder: 'Ej: entrada, detrás de la puerta, a la izquierda', path: 'details.electricalPanelLocation', priority: 'important' },
      { id: 'details.recyclingContainerLocation', label: '¿Dónde están los contenedores de reciclaje?', type: 'text', placeholder: 'Ej: saliendo del portal, 50m a la derecha', path: 'details.recyclingContainerLocation', priority: 'important' },
      {
        id: 'details.supportHours', label: 'Horario de soporte al huésped', type: 'time-range', path: 'details.supportHoursFrom', priority: 'essential',
      },
      { id: 'details.emergencyPhone', label: 'Teléfono de emergencia', type: 'text', placeholder: '+34 600 000 000', path: 'details.emergencyPhone', priority: 'essential' },
    ],
  },

  // ========== 14. PARKING (existente migrado) ==========
  {
    id: 'parking',
    title: 'Parking',
    subtitle: 'Solo si tu propiedad tiene parking',
    icon: 'Car',
    questions: [
      { id: 'details.parkingSpotNumber', label: 'Número de plaza', type: 'text', placeholder: 'Ej: P-23', path: 'details.parkingSpotNumber', priority: 'important' },
      { id: 'details.parkingFloor', label: 'Planta', type: 'text', placeholder: 'Ej: -1', path: 'details.parkingFloor', priority: 'important' },
      {
        id: 'details.parkingAccess', label: 'Acceso al parking', type: 'select', path: 'details.parkingAccess', priority: 'important',
        options: [
          { value: 'remote', label: 'Mando a distancia (en el apartamento)' },
          { value: 'code', label: 'Código' },
          { value: 'key', label: 'Llave' },
          { value: 'automatic', label: 'Automático por matrícula' },
          { value: 'open', label: 'Abierto, sin barrera' },
        ],
        followUp: [{
          id: 'details.parkingAccessCode', label: 'Código del parking', type: 'text', placeholder: 'Código: 1234', path: 'details.parkingAccessCode',
          showIf: { path: 'details.parkingAccess', value: 'code' }, priority: 'important',
        }],
      },
    ],
  },

  // ========== 15. SEGURIDAD ==========
  {
    id: 'security',
    title: 'Seguridad',
    subtitle: 'Detectores, emergencias, cerradura',
    icon: 'Shield',
    questions: [
      { id: 'security.smokeDetector.has', label: '¿Hay detector de humo?', type: 'yesno', path: 'security.smokeDetector.has', priority: 'useful', airbnbMapped: true,
        followUp: [{ id: 'security.smokeDetector.location', label: '¿Dónde está?', type: 'text', placeholder: 'Ej: pasillo, techo', path: 'security.smokeDetector.location', showIf: { path: 'security.smokeDetector.has', value: true }, priority: 'useful' }] },
      { id: 'security.coDetector.has', label: '¿Hay detector de CO?', type: 'yesno', path: 'security.coDetector.has', priority: 'useful', airbnbMapped: true,
        followUp: [{ id: 'security.coDetector.location', label: '¿Dónde está?', type: 'text', placeholder: 'Ej: cocina, pared', path: 'security.coDetector.location', showIf: { path: 'security.coDetector.has', value: true }, priority: 'useful' }] },
      { id: 'security.fireExtinguisher.has', label: '¿Hay extintor?', type: 'yesno', path: 'security.fireExtinguisher.has', priority: 'useful', airbnbMapped: true,
        followUp: [{ id: 'security.fireExtinguisher.location', label: '¿Dónde está?', type: 'text', placeholder: 'Ej: cocina, junto a la puerta', path: 'security.fireExtinguisher.location', showIf: { path: 'security.fireExtinguisher.has', value: true }, priority: 'useful' }] },
      { id: 'security.emergencyExits', label: 'Salidas de emergencia', type: 'textarea', placeholder: 'Ej: Puerta principal + puerta trasera al patio', path: 'security.emergencyExits', priority: 'useful' },
      { id: 'security.nearestHospital', label: 'Hospital más cercano', type: 'text', placeholder: 'Ej: Hospital del Mar, 1.2km, Passeig Marítim 25', path: 'security.nearestHospital', priority: 'useful' },
      { id: 'security.nearestPharmacy', label: 'Farmacia más cercana', type: 'text', placeholder: 'Ej: Farmacia García, 200m, esquina calle Mayor', path: 'security.nearestPharmacy', priority: 'useful' },
      { id: 'security.lockInstructions', label: 'Instrucciones de la cerradura', type: 'textarea', placeholder: 'Ej: Girar llave 2 veces a la izquierda. Empujar puerta hacia dentro.', path: 'security.lockInstructions', priority: 'useful',
        chatbotTip: 'Evitará llamadas de "no puedo abrir la puerta"' },
      {
        id: 'security.alarmSystem.has', label: '¿Hay alarma?', type: 'yesno', path: 'security.alarmSystem.has', priority: 'useful',
        followUp: [
          { id: 'security.alarmSystem.code', label: 'Código de la alarma', type: 'text', placeholder: 'Ej: 1234', path: 'security.alarmSystem.code', showIf: { path: 'security.alarmSystem.has', value: true }, priority: 'useful' },
          { id: 'security.alarmSystem.instructions', label: 'Instrucciones', type: 'textarea', placeholder: 'Ej: Al entrar, código + OK en 30 seg. Al salir, código + Activar.', path: 'security.alarmSystem.instructions', showIf: { path: 'security.alarmSystem.has', value: true }, priority: 'useful' },
        ],
      },
      { id: 'security.neighborContact.name', label: 'Vecino de contacto (nombre)', type: 'text', placeholder: 'Ej: María García', path: 'security.neighborContact.name', priority: 'useful' },
      { id: 'security.neighborContact.phone', label: 'Teléfono del vecino', type: 'text', placeholder: 'Ej: +34 600 123 456', path: 'security.neighborContact.phone', priority: 'useful' },
      { id: 'security.neighborContact.apartment', label: 'Apartamento del vecino', type: 'text', placeholder: 'Ej: 2ºB, misma planta', path: 'security.neighborContact.apartment', priority: 'useful' },
    ],
  },

  // ========== 16. EXTERIOR ==========
  {
    id: 'outdoor',
    title: 'Exterior',
    subtitle: 'Piscina, terraza, BBQ, jardín',
    icon: 'Palmtree',
    questions: [
      {
        id: 'outdoor.pool.has', label: '¿Hay piscina?', type: 'yesno', path: 'outdoor.pool.has', priority: 'important', airbnbMapped: true,
        followUp: [
          { id: 'outdoor.pool.type', label: 'Tipo', type: 'select', path: 'outdoor.pool.type', showIf: { path: 'outdoor.pool.has', value: true }, priority: 'important',
            options: [{ value: 'private', label: 'Privada' }, { value: 'shared', label: 'Comunitaria' }] },
          { id: 'outdoor.pool.hours', label: 'Horario', type: 'text', placeholder: 'Ej: 10:00-21:00', path: 'outdoor.pool.hours', showIf: { path: 'outdoor.pool.has', value: true }, priority: 'important' },
          { id: 'outdoor.pool.rules', label: 'Normas', type: 'textarea', placeholder: 'Ej: Ducha obligatoria antes de entrar. No comida en zona piscina.', path: 'outdoor.pool.rules', showIf: { path: 'outdoor.pool.has', value: true }, priority: 'important' },
          { id: 'outdoor.pool.heatedMonths', label: 'Meses climatizada', type: 'text', placeholder: 'Ej: Mayo-Octubre, o "No climatizada"', path: 'outdoor.pool.heatedMonths', showIf: { path: 'outdoor.pool.has', value: true }, priority: 'useful' },
        ],
      },
      {
        id: 'outdoor.jacuzzi.has', label: '¿Hay jacuzzi?', type: 'yesno', path: 'outdoor.jacuzzi.has', priority: 'useful', airbnbMapped: true,
        followUp: [{ id: 'outdoor.jacuzzi.instructions', label: 'Instrucciones', type: 'textarea', placeholder: 'Ej: Botón ON/OFF en el lateral. Máx 40°. Apagar al salir.', path: 'outdoor.jacuzzi.instructions', showIf: { path: 'outdoor.jacuzzi.has', value: true }, priority: 'useful' }],
      },
      {
        id: 'outdoor.bbq.has', label: '¿Hay BBQ/barbacoa?', type: 'yesno', path: 'outdoor.bbq.has', priority: 'useful', airbnbMapped: true,
        followUp: [
          { id: 'outdoor.bbq.type', label: 'Tipo', type: 'select', path: 'outdoor.bbq.type', showIf: { path: 'outdoor.bbq.has', value: true }, priority: 'useful',
            options: [{ value: 'gas', label: 'Gas' }, { value: 'charcoal', label: 'Carbón' }, { value: 'electric', label: 'Eléctrica' }] },
          { id: 'outdoor.bbq.location', label: '¿Dónde está?', type: 'text', placeholder: 'Ej: terraza trasera', path: 'outdoor.bbq.location', showIf: { path: 'outdoor.bbq.has', value: true }, priority: 'useful' },
          { id: 'outdoor.bbq.rules', label: 'Normas', type: 'textarea', placeholder: 'Ej: Limpiar después de usar. Carbón en el cobertizo.', path: 'outdoor.bbq.rules', showIf: { path: 'outdoor.bbq.has', value: true }, priority: 'useful' },
        ],
      },
      {
        id: 'outdoor.terrace.has', label: '¿Hay terraza?', type: 'yesno', path: 'outdoor.terrace.has', priority: 'useful',
        followUp: [{ id: 'outdoor.terrace.furniture', label: 'Muebles de terraza', type: 'text', placeholder: 'Ej: mesa + 4 sillas + sombrilla', path: 'outdoor.terrace.furniture', showIf: { path: 'outdoor.terrace.has', value: true }, priority: 'useful' }],
      },
      {
        id: 'outdoor.garden.has', label: '¿Hay jardín?', type: 'yesno', path: 'outdoor.garden.has', priority: 'useful', airbnbMapped: true,
        followUp: [{ id: 'outdoor.garden.note', label: 'Nota sobre el jardín', type: 'text', placeholder: 'Ej: Uso compartido con vecinos', path: 'outdoor.garden.note', showIf: { path: 'outdoor.garden.has', value: true }, priority: 'useful' }],
      },
      {
        id: 'outdoor.balcony.has', label: '¿Hay balcón?', type: 'yesno', path: 'outdoor.balcony.has', priority: 'useful', airbnbMapped: true,
        followUp: [{ id: 'outdoor.balcony.note', label: 'Nota sobre el balcón', type: 'text', placeholder: 'Ej: Vistas al mar, no tender ropa', path: 'outdoor.balcony.note', showIf: { path: 'outdoor.balcony.has', value: true }, priority: 'useful' }],
      },
    ],
  },

  // ========== 17. BARRIO ==========
  {
    id: 'neighborhood',
    title: 'Barrio',
    subtitle: 'Transporte y tips específicos del alojamiento',
    icon: 'MapPin',
    questions: [
      { id: 'neighborhood.publicTransport', label: 'Transporte público', type: 'textarea', placeholder: 'Ej: Parada bus L5 a 200m, metro L3 a 500m', path: 'neighborhood.publicTransport', priority: 'useful',
        chatbotTip: 'Podrá dar indicaciones de transporte' },
      { id: 'neighborhood.taxiApp', label: 'App de taxi recomendada', type: 'text', placeholder: 'Ej: Cabify o FreeNow funcionan bien aquí', path: 'neighborhood.taxiApp', priority: 'useful' },
      { id: 'neighborhood.walkingTips', label: 'Tips de zona (seguridad, consejos)', type: 'textarea', placeholder: 'Ej: La zona es muy tranquila. Evitar aparcar en Calle X por las noches.', path: 'neighborhood.walkingTips', priority: 'useful' },
    ],
  },

  // ========== 18. NIÑOS ==========
  {
    id: 'children',
    title: 'Niños',
    subtitle: 'Cuna, trona, parque cercano',
    icon: 'Baby',
    questions: [
      {
        id: 'children.crib.has', label: '¿Hay cuna?', type: 'yesno', path: 'children.crib.has', priority: 'useful', airbnbMapped: true,
        followUp: [{ id: 'children.crib.location', label: '¿Dónde está?', type: 'text', placeholder: 'Ej: armario del pasillo', path: 'children.crib.location', showIf: { path: 'children.crib.has', value: true }, priority: 'useful' }],
      },
      {
        id: 'children.highChair.has', label: '¿Hay trona?', type: 'yesno', path: 'children.highChair.has', priority: 'useful', airbnbMapped: true,
        followUp: [{ id: 'children.highChair.location', label: '¿Dónde está?', type: 'text', placeholder: 'Ej: detrás de la puerta de la cocina', path: 'children.highChair.location', showIf: { path: 'children.highChair.has', value: true }, priority: 'useful' }],
      },
      { id: 'children.babyGate.has', label: '¿Hay barrera de seguridad?', type: 'yesno', path: 'children.babyGate.has', priority: 'useful' },
      { id: 'children.childProofing', label: 'Protecciones infantiles', type: 'textarea', placeholder: 'Ej: Protectores en enchufes, esquineras en mesa del salón', path: 'children.childProofing', priority: 'useful' },
      { id: 'children.nearestPlayground', label: 'Parque infantil más cercano', type: 'text', placeholder: 'Ej: Parque de la Ciutadella, 5 min andando', path: 'children.nearestPlayground', priority: 'useful' },
      { id: 'children.childFriendlyNote', label: 'Nota sobre niños', type: 'textarea', placeholder: 'Ej: Hay juguetes en el armario del salón. La zona es tranquila y segura para niños.', path: 'children.childFriendlyNote', priority: 'useful' },
    ],
  },

  // ========== 19. ACCESIBILIDAD ==========
  {
    id: 'accessibility',
    title: 'Accesibilidad',
    subtitle: 'Ascensor, planta, escalones',
    icon: 'Accessibility',
    questions: [
      { id: 'accessibility.elevator', label: '¿Hay ascensor?', type: 'yesno', path: 'accessibility.elevator', priority: 'useful', airbnbMapped: true },
      { id: 'accessibility.floorNumber', label: 'Planta del apartamento', type: 'number', placeholder: 'Ej: 3', path: 'accessibility.floorNumber', priority: 'useful' },
      { id: 'accessibility.stepsToEntrance', label: 'Escalones hasta la entrada', type: 'number', placeholder: 'Ej: 5', path: 'accessibility.stepsToEntrance', priority: 'useful' },
      { id: 'accessibility.wheelchairAccessible', label: '¿Accesible en silla de ruedas?', type: 'yesno', path: 'accessibility.wheelchairAccessible', priority: 'useful' },
      { id: 'accessibility.accessibilityNote', label: 'Nota de accesibilidad', type: 'textarea', placeholder: 'Ej: Ascensor pequeño, cabe silla de ruedas estrecha. Baño sin escalón.', path: 'accessibility.accessibilityNote', priority: 'useful' },
    ],
  },

  // ========== 20. MASCOTAS Y CLIMA ==========
  {
    id: 'petsWeather',
    title: 'Mascotas y clima',
    subtitle: 'Veterinario, zonas perros, consejos',
    icon: 'Dog',
    questions: [
      { id: 'petsWeather.nearestVet', label: 'Veterinario más cercano', type: 'text', placeholder: 'Ej: Clínica Veterinaria ABC, c/Mayor 10, 900 123 456', path: 'petsWeather.nearestVet', priority: 'useful' },
      { id: 'petsWeather.dogFriendlyAreas', label: 'Zonas para pasear perros', type: 'textarea', placeholder: 'Ej: Parque del Retiro permite perros con correa. Zona canina en plaza X.', path: 'petsWeather.dogFriendlyAreas', priority: 'useful' },
      { id: 'petsWeather.petRules', label: 'Normas para mascotas', type: 'textarea', placeholder: 'Ej: Recoger excrementos. No dejar mascota sola si ladra. Manta para el sofá.', path: 'petsWeather.petRules', priority: 'useful' },
      { id: 'petsWeather.heatAdvice', label: 'Consejo para calor', type: 'textarea', placeholder: 'Ej: En verano: persianas bajadas, AC a 24°, no abrir ventanas de noche', path: 'petsWeather.heatAdvice', priority: 'useful' },
      { id: 'petsWeather.coldAdvice', label: 'Consejo para frío', type: 'textarea', placeholder: 'Ej: En invierno: calefacción a 21°, mantas extra en armario pasillo', path: 'petsWeather.coldAdvice', priority: 'useful' },
      { id: 'petsWeather.rainAdvice', label: 'Consejo para lluvia', type: 'textarea', placeholder: 'Ej: Si llueve fuerte: no usar terraza, cerrar ventana del baño', path: 'petsWeather.rainAdvice', priority: 'useful' },
    ],
  },

  // ========== 21. ANFITRIÓN (existente migrado) ==========
  {
    id: 'host',
    title: 'Anfitrión',
    subtitle: 'Info importada de tu perfil Airbnb',
    icon: 'User',
    questions: [
      { id: 'hostName', label: 'Nombre del anfitrión', type: 'text', placeholder: 'Tu nombre', path: 'hostName', priority: 'essential', airbnbMapped: true },
      { id: 'isSuperhost', label: '¿Eres Superhost?', type: 'yesno', path: 'isSuperhost', priority: 'useful', airbnbMapped: true },
    ],
  },

  // ========== 22. PECULIARIDADES ==========
  {
    id: 'quirks',
    title: 'Peculiaridades',
    subtitle: 'Trucos, ruidos, cosas raras de tu casa',
    icon: 'Lightbulb',
    questions: [
      { id: 'quirks.noiseWarnings', label: 'Avisos de ruido', type: 'textarea', placeholder: 'Ej: El vecino de arriba tiene perro, a veces ladra de noche', path: 'quirks.noiseWarnings', priority: 'useful',
        chatbotTip: 'El chatbot avisará proactivamente si preguntan por ruidos' },
      { id: 'quirks.doorTrick', label: 'Truco de la puerta', type: 'textarea', placeholder: 'Ej: La puerta del baño hay que empujar fuerte para cerrar', path: 'quirks.doorTrick', priority: 'useful' },
      { id: 'quirks.lightSwitch', label: 'Interruptor difícil de encontrar', type: 'textarea', placeholder: 'Ej: El interruptor del pasillo está detrás de la puerta', path: 'quirks.lightSwitch', priority: 'useful' },
      { id: 'quirks.waterTrick', label: 'Truco del agua/grifos', type: 'textarea', placeholder: 'Ej: Grifo de la cocina: girar a la izquierda para caliente (al revés)', path: 'quirks.waterTrick', priority: 'useful' },
      { id: 'quirks.otherQuirks', label: 'Otras peculiaridades', type: 'editable-list', placeholder: 'Ej: La persiana del salón se atasca a veces...', path: 'quirks.otherQuirks', priority: 'useful',
        chatbotTip: 'El chatbot podrá responder preguntas sobre cosas raras de la casa' },
    ],
  },
]
