export interface PropertyIntelligence {
  // Source
  source?: 'airbnb' | 'manual' | 'mixed'
  airbnbUrl?: string
  airbnbListingId?: string
  importedAt?: string

  // Host
  hostName?: string
  isSuperhost?: boolean

  // House rules
  houseRules?: {
    noPets?: boolean
    noSmoking?: boolean
    noParties?: boolean
    quietHoursStart?: string
    quietHoursEnd?: string
    noParking?: boolean
    additionalRules?: string
    allowsBabies?: boolean
    hasCrib?: boolean
    hasHighChair?: boolean
    hasBabyBath?: boolean
  }

  // Checkout tasks
  checkoutTasks?: string[]

  // Full amenities list (for chatbot)
  allAmenities?: string[]

  // Items with location
  items?: {
    iron?: { has: boolean; location: string }
    ironingBoard?: { has: boolean; location: string }
    hairdryer?: { has: boolean; location: string }
    firstAid?: { has: boolean; location: string }
    extraBlankets?: { has: boolean; location: string }
    broom?: { has: boolean; location: string }
  }

  // Step2 details
  details?: {
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
    parkingSpotNumber?: string
    parkingFloor?: string
    parkingAccess?: string
    parkingAccessCode?: string
    checkoutInstructions?: string
    keyReturn?: string
    keyReturnDetails?: string
    lateCheckout?: string
    lateCheckoutPrice?: string
    lateCheckoutUntil?: string
    luggageAfterCheckout?: string
    luggageUntil?: string
    luggageConsignaInfo?: string
    recyclingContainerLocation?: string
    recommendations?: string
  }

  // === NUEVAS CATEGORÍAS v2 ===

  appliances?: {
    washingMachine?: { has: boolean; location: string; instructions: string }
    dryer?: { has: boolean; location: string; instructions: string }
    dishwasher?: { has: boolean; location: string; detergentLocation: string }
    oven?: { has: boolean; type: 'electric' | 'gas' | '' }
    microwave?: { has: boolean; location: string }
    coffeeMachine?: { has: boolean; type: string; capsuleLocation: string }
    toaster?: { has: boolean; location: string }
    kettle?: { has: boolean; location: string }
    vacuumCleaner?: { has: boolean; location: string }
    mop?: { has: boolean; location: string }
  }

  climate?: {
    ac?: { has: boolean; type: 'split' | 'central' | 'portable' | ''; remoteLocation: string; instructions: string }
    heating?: { has: boolean; type: 'central' | 'radiator' | 'underfloor' | 'portable' | 'ac' | ''; thermostatLocation: string; instructions: string }
    fan?: { has: boolean; location: string }
    fireplace?: { has: boolean; type: 'gas' | 'wood' | 'electric' | ''; instructions: string }
  }

  waterBathroom?: {
    hotWaterType?: 'instant-gas' | 'instant-electric' | 'tank-small' | 'tank-large' | 'central' | ''
    tankCapacityLiters?: number
    hotWaterWarning?: string
    gasBottle?: { applies: boolean; location: string; howToChange: string; emergencyNumber: string }
    waterPressureNote?: string
    showerType?: string
    towelsLocation?: string
    extraTowelsLocation?: string
    toiletPaperLocation?: string
  }

  bedroom?: {
    mattressType?: string
    pillowTypes?: string
    extraPillowsLocation?: string
    bedLinenLocation?: string
    blackoutCurtains?: boolean
    safebox?: { has: boolean; location: string; code: string; instructions: string }
  }

  wifi?: {
    networkName?: string
    password?: string
    routerLocation?: string
    speedMbps?: number
    troubleshooting?: string
    hasEthernet?: boolean
    ethernetLocation?: string
  }

  entertainment?: {
    tv?: { has: boolean; type: string; streamingApps: string[]; remoteLocation: string; instructions: string }
    bluetooth?: { has: boolean; deviceName: string }
    boardGames?: { has: boolean; location: string }
    books?: { has: boolean; location: string }
  }

  kitchen?: {
    essentialsProvided?: string[]
    utensilsNote?: string
    potsPansLocation?: string
    cuttingBoardLocation?: string
    trashBagsLocation?: string
    dishSoapLocation?: string
    ovenTraysLocation?: string
    spicesLocation?: string
    waterDrinkable?: boolean
    waterFilter?: { has: boolean; location: string }
    nearestSupermarket?: string
    supermarketHours?: string
  }

  laundry?: {
    detergentLocation?: string
    dryingRack?: { has: boolean; location: string }
    dryingInstructions?: string
    ironInstructions?: string
    cleaningProducts?: string
  }

  security?: {
    smokeDetector?: { has: boolean; location: string }
    coDetector?: { has: boolean; location: string }
    fireExtinguisher?: { has: boolean; location: string }
    emergencyExits?: string
    nearestHospital?: string
    nearestPharmacy?: string
    policePhone?: string
    ambulancePhone?: string
    lockInstructions?: string
    alarmSystem?: { has: boolean; code: string; instructions: string }
    neighborContact?: { name: string; phone: string; apartment: string }
  }

  outdoor?: {
    pool?: { has: boolean; type: 'private' | 'shared' | ''; hours: string; rules: string; heatedMonths: string }
    jacuzzi?: { has: boolean; instructions: string }
    bbq?: { has: boolean; type: 'gas' | 'charcoal' | 'electric' | ''; location: string; rules: string }
    terrace?: { has: boolean; furniture: string }
    garden?: { has: boolean; note: string }
    balcony?: { has: boolean; note: string }
  }

  neighborhood?: {
    publicTransport?: string
    taxiApp?: string
    walkingTips?: string
  }

  children?: {
    crib?: { has: boolean; location: string }
    highChair?: { has: boolean; location: string }
    childProofing?: string
    nearestPlayground?: string
    babyGate?: { has: boolean }
    childFriendlyNote?: string
  }

  accessibility?: {
    elevator?: boolean
    floorNumber?: string | number
    wheelchairAccessible?: boolean
    stepsToEntrance?: number
    accessibilityNote?: string
  }

  petsWeather?: {
    nearestVet?: string
    dogFriendlyAreas?: string
    petRules?: string
    rainAdvice?: string
    stormAdvice?: string
    heatAdvice?: string
    coldAdvice?: string
  }

  quirks?: {
    noiseWarnings?: string
    doorTrick?: string
    lightSwitch?: string
    waterTrick?: string
    otherQuirks?: string[]
  }

  // Registro obligatorio de viajeros (Partee / SES.hospedajes)
  guestRegistration?: {
    required: boolean
    url: string
    message?: string
  }

  // Preguntas sin respuesta del chatbot
  unansweredQuestions?: {
    question: string
    askedAt: string
    askedBy: string
    answered?: boolean
    answeredAt?: string
  }[]
}

// Airbnb amenity mapping
const AIRBNB_AMENITY_MAP: Record<string, (i: PropertyIntelligence) => void> = {
  'Washing machine': (i) => { i.appliances = { ...i.appliances, washingMachine: { has: true, location: '', instructions: '', ...(i.appliances?.washingMachine || {}) } } },
  'Dryer': (i) => { i.appliances = { ...i.appliances, dryer: { has: true, location: '', instructions: '', ...(i.appliances?.dryer || {}) } } },
  'Dishwasher': (i) => { i.appliances = { ...i.appliances, dishwasher: { has: true, location: '', detergentLocation: '', ...(i.appliances?.dishwasher || {}) } } },
  'Air conditioning': (i) => { i.climate = { ...i.climate, ac: { has: true, type: 'split', remoteLocation: '', instructions: '', ...(i.climate?.ac || {}) } } },
  'Heating': (i) => { i.climate = { ...i.climate, heating: { has: true, type: 'central', thermostatLocation: '', instructions: '', ...(i.climate?.heating || {}) } } },
  'Wifi': (i) => { i.wifi = { ...i.wifi } },
  'TV': (i) => { i.entertainment = { ...i.entertainment, tv: { has: true, type: '', streamingApps: [], remoteLocation: '', instructions: '', ...(i.entertainment?.tv || {}) } } },
  'Pool': (i) => { i.outdoor = { ...i.outdoor, pool: { has: true, type: 'shared', hours: '', rules: '', heatedMonths: '', ...(i.outdoor?.pool || {}) } } },
  'Private pool': (i) => { i.outdoor = { ...i.outdoor, pool: { has: true, type: 'private', hours: '', rules: '', heatedMonths: '', ...(i.outdoor?.pool || {}) } } },
  'Hot tub': (i) => { i.outdoor = { ...i.outdoor, jacuzzi: { has: true, instructions: '', ...(i.outdoor?.jacuzzi || {}) } } },
  'BBQ grill': (i) => { i.outdoor = { ...i.outdoor, bbq: { has: true, type: 'charcoal', location: '', rules: '', ...(i.outdoor?.bbq || {}) } } },
  'Crib': (i) => { i.children = { ...i.children, crib: { has: true, location: '', ...(i.children?.crib || {}) } } },
  'High chair': (i) => { i.children = { ...i.children, highChair: { has: true, location: '', ...(i.children?.highChair || {}) } } },
  'Elevator': (i) => { i.accessibility = { ...i.accessibility, elevator: true } },
  'Fire extinguisher': (i) => { i.security = { ...i.security, fireExtinguisher: { has: true, location: '', ...(i.security?.fireExtinguisher || {}) } } },
  'Smoke alarm': (i) => { i.security = { ...i.security, smokeDetector: { has: true, location: '', ...(i.security?.smokeDetector || {}) } } },
  'Carbon monoxide alarm': (i) => { i.security = { ...i.security, coDetector: { has: true, location: '', ...(i.security?.coDetector || {}) } } },
  'Coffee maker': (i) => { i.appliances = { ...i.appliances, coffeeMachine: { has: true, type: '', capsuleLocation: '', ...(i.appliances?.coffeeMachine || {}) } } },
  'Microwave': (i) => { i.appliances = { ...i.appliances, microwave: { has: true, location: '', ...(i.appliances?.microwave || {}) } } },
  'Oven': (i) => { i.appliances = { ...i.appliances, oven: { has: true, type: '', ...(i.appliances?.oven || {}) } } },
  'Refrigerator': (i) => { /* already basic, no separate tracking */ },
  'Patio or balcony': (i) => { i.outdoor = { ...i.outdoor, balcony: { has: true, note: '', ...(i.outdoor?.balcony || {}) } } },
  'Balcony': (i) => { i.outdoor = { ...i.outdoor, balcony: { has: true, note: '', ...(i.outdoor?.balcony || {}) } } },
  'Garden': (i) => { i.outdoor = { ...i.outdoor, garden: { has: true, note: '', ...(i.outdoor?.garden || {}) } } },
  'Backyard': (i) => { i.outdoor = { ...i.outdoor, garden: { has: true, note: '', ...(i.outdoor?.garden || {}) } } },
  'Indoor fireplace': (i) => { i.climate = { ...i.climate, fireplace: { has: true, type: 'wood', instructions: '', ...(i.climate?.fireplace || {}) } } },
  'Outdoor dining area': (i) => { i.outdoor = { ...i.outdoor, terrace: { has: true, furniture: '', ...(i.outdoor?.terrace || {}) } } },
  'Board games': (i) => { i.entertainment = { ...i.entertainment, boardGames: { has: true, location: '', ...(i.entertainment?.boardGames || {}) } } },
  'Books and reading material': (i) => { i.entertainment = { ...i.entertainment, books: { has: true, location: '', ...(i.entertainment?.books || {}) } } },
  'Bluetooth sound system': (i) => { i.entertainment = { ...i.entertainment, bluetooth: { has: true, deviceName: '', ...(i.entertainment?.bluetooth || {}) } } },
  'Baby bath': (i) => { i.children = { ...i.children, childFriendlyNote: i.children?.childFriendlyNote || 'Baby bath available' } },
  'Children\'s books and toys': (i) => { i.children = { ...i.children, childFriendlyNote: (i.children?.childFriendlyNote ? i.children.childFriendlyNote + ', ' : '') + 'Books and toys available' } },
}

// Helper to build intelligence from airbnb data + step2 data
export function buildIntelligenceFromImport(
  airbnbData: Record<string, any> | null,
  step2Data: Record<string, any> | null,
  airbnbUrl?: string,
  step1Data?: Record<string, any> | null,
): PropertyIntelligence {
  const intelligence: PropertyIntelligence = {}

  // From Airbnb import
  if (airbnbData) {
    intelligence.source = 'airbnb'
    if (airbnbUrl) intelligence.airbnbUrl = airbnbUrl
    if (airbnbData.listingId) intelligence.airbnbListingId = airbnbData.listingId
    intelligence.importedAt = new Date().toISOString()

    if (airbnbData.hostName) intelligence.hostName = airbnbData.hostName
    if (airbnbData.isSuperhost !== undefined) intelligence.isSuperhost = airbnbData.isSuperhost

    if (airbnbData.houseRules) {
      intelligence.houseRules = {
        noPets: airbnbData.houseRules.noPets || false,
        noSmoking: airbnbData.houseRules.noSmoking || false,
        noParties: airbnbData.houseRules.noParties || false,
        quietHoursStart: airbnbData.houseRules.quietHoursStart || '',
        quietHoursEnd: airbnbData.houseRules.quietHoursEnd || '',
        noParking: airbnbData.houseRules.noParking || false,
        additionalRules: airbnbData.houseRules.additionalRules || '',
      }
    }

    if (airbnbData.checkoutTasks?.length > 0) {
      intelligence.checkoutTasks = airbnbData.checkoutTasks
    }

    if (airbnbData.allAmenities?.length > 0) {
      intelligence.allAmenities = airbnbData.allAmenities

      // Map amenities to new v2 categories
      for (const amenity of airbnbData.allAmenities) {
        const mapper = AIRBNB_AMENITY_MAP[amenity]
        if (mapper) mapper(intelligence)
      }
    }

    if (airbnbData.items) {
      intelligence.items = {}
      const itemKeys = ['iron', 'ironingBoard', 'hairdryer', 'firstAid', 'extraBlankets', 'broom'] as const
      for (const key of itemKeys) {
        if (airbnbData.items[key] !== undefined) {
          intelligence.items[key] = { has: !!airbnbData.items[key], location: '' }
        }
      }
    }

    // WiFi from Airbnb if available
    if (airbnbData.wifiName || airbnbData.wifiPassword) {
      intelligence.wifi = {
        ...intelligence.wifi,
        networkName: airbnbData.wifiName || '',
        password: airbnbData.wifiPassword || '',
      }
    }
  }

  // From Step2 data
  if (step2Data) {
    if (!intelligence.source) intelligence.source = 'manual'
    else if (intelligence.source === 'airbnb') intelligence.source = 'mixed'

    // Merge items with locations from step2
    if (step2Data.items) {
      if (!intelligence.items) intelligence.items = {}
      const itemKeys = ['iron', 'ironingBoard', 'hairdryer', 'firstAid', 'extraBlankets', 'broom'] as const
      for (const key of itemKeys) {
        const item = step2Data.items[key]
        if (item) {
          intelligence.items[key] = {
            has: item.has ?? intelligence.items[key]?.has ?? false,
            location: item.location || intelligence.items[key]?.location || '',
          }
        }
      }
    }

    // Details
    intelligence.details = {
      lockboxCode: step2Data.lockboxCode || undefined,
      lockboxLocation: step2Data.lockboxLocation || undefined,
      doorCode: step2Data.doorCode || undefined,
      codeChangesPerReservation: step2Data.codeChangesPerReservation || undefined,
      meetingPoint: step2Data.meetingPoint || undefined,
      latePlan: step2Data.latePlan || undefined,
      latePlanDetails: step2Data.latePlanDetails || undefined,
      hotWaterType: step2Data.hotWaterType || undefined,
      electricalPanelLocation: step2Data.electricalPanelLocation || undefined,
      supportHoursFrom: step2Data.supportHoursFrom || undefined,
      supportHoursTo: step2Data.supportHoursTo || undefined,
      emergencyPhone: step2Data.emergencyPhone || undefined,
      parkingSpotNumber: step2Data.parkingSpotNumber || undefined,
      parkingFloor: step2Data.parkingFloor || undefined,
      parkingAccess: step2Data.parkingAccess || undefined,
      parkingAccessCode: step2Data.parkingAccessCode || undefined,
      nearbyParkingName: step2Data.nearbyParkingName || undefined,
      nearbyParkingAddress: step2Data.nearbyParkingAddress || undefined,
      checkoutInstructions: step2Data.checkoutInstructions || undefined,
      keyReturn: step2Data.keyReturn || undefined,
      keyReturnDetails: step2Data.keyReturnDetails || undefined,
      lateCheckout: step2Data.lateCheckout || undefined,
      lateCheckoutPrice: step2Data.lateCheckoutPrice || undefined,
      lateCheckoutUntil: step2Data.lateCheckoutUntil || undefined,
      luggageAfterCheckout: step2Data.luggageAfterCheckout || undefined,
      luggageUntil: step2Data.luggageUntil || undefined,
      luggageConsignaInfo: step2Data.luggageConsignaInfo || undefined,
      recyclingContainerLocation: step2Data.recyclingContainerLocation || undefined,
      recommendations: step2Data.recommendations || undefined,
    }
  }

  // From Step1 data (property basics: wifi, check-in, parking, AC, host contact)
  if (step1Data) {
    // WiFi
    if (step1Data.wifiName || step1Data.wifiPassword) {
      intelligence.wifi = {
        ...intelligence.wifi,
        networkName: step1Data.wifiName || intelligence.wifi?.networkName || '',
        password: step1Data.wifiPassword || intelligence.wifi?.password || '',
      }
    }

    // Check-in
    if (step1Data.checkInTime || step1Data.checkInMethod) {
      intelligence.checkIn = {
        ...intelligence.checkIn,
        time: step1Data.checkInTime || intelligence.checkIn?.time || '',
        method: step1Data.checkInMethod || intelligence.checkIn?.method || '',
        instructions: step1Data.checkInInstructions || intelligence.checkIn?.instructions || '',
      }
    }

    // Check-out
    if (step1Data.checkOutTime) {
      intelligence.checkOut = {
        ...intelligence.checkOut,
        time: step1Data.checkOutTime || '',
      }
    }

    // Parking — map wizard values to intelligence parkingType
    if (step1Data.hasParking) {
      const parkingTypeMap: Record<string, string> = { yes: 'private', nearby: 'nearby', no: 'none' }
      const mappedType = parkingTypeMap[step1Data.hasParking] || step1Data.hasParking
      if (!intelligence.details) intelligence.details = {}
      intelligence.details.parkingType = mappedType
      if (step1Data.hasParking !== 'no') {
        intelligence.parking = {
          ...intelligence.parking,
          available: true,
          type: step1Data.hasParking,
        }
      }
    }

    // AC
    if (step1Data.hasAC) {
      intelligence.hasAC = true
    }

    // Pool
    if (step1Data.hasPool) {
      intelligence.hasPool = true
    }

    // Host contact
    if (step1Data.hostContactName || step1Data.hostContactPhone || step1Data.hostContactEmail) {
      intelligence.hostContact = {
        name: step1Data.hostContactName || '',
        phone: step1Data.hostContactPhone || '',
        email: step1Data.hostContactEmail || '',
        language: step1Data.hostContactLanguage || 'es',
      }
    }

    // Property basics
    if (step1Data.maxGuests) intelligence.maxGuests = step1Data.maxGuests
    if (step1Data.bedrooms) intelligence.bedrooms = step1Data.bedrooms
    if (step1Data.bathrooms) intelligence.bathrooms = step1Data.bathrooms
    if (step1Data.propertyType) intelligence.propertyType = step1Data.propertyType
  }

  return intelligence
}

// Calculate completion percentage with weighted priorities
export function getIntelligenceCompletion(intel: PropertyIntelligence | null): {
  percentage: number
  total: number
  answered: number
  pending: string[]
  essential: { answered: number; total: number }
  important: { answered: number; total: number }
  useful: { answered: number; total: number }
} {
  if (!intel) return { percentage: 0, total: 20, answered: 0, pending: [], essential: { answered: 0, total: 15 }, important: { answered: 0, total: 20 }, useful: { answered: 0, total: 10 } }

  type Check = { key: string; label: string; value: boolean; priority: 'essential' | 'important' | 'useful' }

  const checks: Check[] = [
    // Essential (chatbot NEEDS these)
    { key: 'hostName', label: 'Nombre del anfitrión', value: !!intel.hostName, priority: 'essential' },
    { key: 'houseRules', label: 'Normas de la casa', value: !!intel.houseRules, priority: 'essential' },
    { key: 'checkoutTasks', label: 'Tareas de checkout', value: (intel.checkoutTasks?.length ?? 0) > 0, priority: 'essential' },
    { key: 'lockbox', label: 'Acceso / Lockbox', value: !!(intel.details?.lockboxCode || intel.details?.meetingPoint || intel.details?.doorCode), priority: 'essential' },
    { key: 'checkoutInstructions', label: 'Instrucciones checkout', value: !!intel.details?.checkoutInstructions, priority: 'essential' },
    { key: 'keyReturn', label: 'Devolución llave', value: !!intel.details?.keyReturn, priority: 'essential' },
    { key: 'wifiName', label: 'WiFi nombre', value: !!intel.wifi?.networkName, priority: 'essential' },
    { key: 'wifiPassword', label: 'WiFi contraseña', value: !!intel.wifi?.password, priority: 'essential' },
    { key: 'emergencyPhone', label: 'Teléfono emergencia', value: !!intel.details?.emergencyPhone, priority: 'essential' },
    { key: 'supportHours', label: 'Horario soporte', value: !!(intel.details?.supportHoursFrom && intel.details?.supportHoursTo), priority: 'essential' },

    // Items
    { key: 'iron', label: 'Plancha', value: intel.items?.iron?.has !== undefined, priority: 'important' },
    { key: 'ironingBoard', label: 'Tabla de planchar', value: intel.items?.ironingBoard?.has !== undefined, priority: 'useful' },
    { key: 'hairdryer', label: 'Secador', value: intel.items?.hairdryer?.has !== undefined, priority: 'important' },
    { key: 'firstAid', label: 'Botiquín', value: intel.items?.firstAid?.has !== undefined, priority: 'important' },
    { key: 'extraBlankets', label: 'Mantas extra', value: intel.items?.extraBlankets?.has !== undefined, priority: 'useful' },
    { key: 'broom', label: 'Escoba', value: intel.items?.broom?.has !== undefined, priority: 'useful' },

    // Important (frequent questions)
    { key: 'hotWater', label: 'Agua caliente', value: !!intel.waterBathroom?.hotWaterType || !!intel.details?.hotWaterType, priority: 'important' },
    { key: 'electricalPanel', label: 'Panel eléctrico', value: !!intel.details?.electricalPanelLocation, priority: 'important' },
    { key: 'recycling', label: 'Contenedores reciclaje', value: !!intel.details?.recyclingContainerLocation, priority: 'important' },
    { key: 'lateCheckout', label: 'Late checkout', value: !!intel.details?.lateCheckout, priority: 'important' },
    { key: 'luggage', label: 'Equipaje post-checkout', value: !!intel.details?.luggageAfterCheckout, priority: 'important' },
    { key: 'ac', label: 'Aire acondicionado', value: intel.climate?.ac?.has !== undefined, priority: 'important' },
    { key: 'heating', label: 'Calefacción', value: intel.climate?.heating?.has !== undefined, priority: 'important' },
    { key: 'washingMachine', label: 'Lavadora', value: intel.appliances?.washingMachine?.has !== undefined, priority: 'important' },
    { key: 'tv', label: 'TV', value: intel.entertainment?.tv?.has !== undefined, priority: 'important' },
    { key: 'waterDrinkable', label: 'Agua potable', value: intel.kitchen?.waterDrinkable !== undefined, priority: 'important' },
    { key: 'towels', label: 'Toallas', value: !!intel.waterBathroom?.towelsLocation, priority: 'important' },

    // Useful (enhances experience)
    { key: 'nearestSupermarket', label: 'Supermercado cercano', value: !!intel.kitchen?.nearestSupermarket, priority: 'useful' },
    { key: 'publicTransport', label: 'Transporte público', value: !!intel.neighborhood?.publicTransport, priority: 'useful' },
    { key: 'coffeeMachine', label: 'Cafetera', value: intel.appliances?.coffeeMachine?.has !== undefined, priority: 'useful' },
    { key: 'dishwasher', label: 'Lavavajillas', value: intel.appliances?.dishwasher?.has !== undefined, priority: 'useful' },
    { key: 'nearestHospital', label: 'Hospital cercano', value: !!intel.security?.nearestHospital, priority: 'useful' },
    { key: 'lockInstructions', label: 'Instrucciones cerradura', value: !!intel.security?.lockInstructions, priority: 'useful' },
    { key: 'quirks', label: 'Peculiaridades', value: !!(intel.quirks?.doorTrick || intel.quirks?.noiseWarnings || intel.quirks?.lightSwitch || intel.quirks?.waterTrick || (intel.quirks?.otherQuirks?.length ?? 0) > 0), priority: 'useful' },
    { key: 'allAmenities', label: 'Lista de amenities', value: (intel.allAmenities?.length ?? 0) > 0, priority: 'useful' },
  ]

  const essential = checks.filter(c => c.priority === 'essential')
  const important = checks.filter(c => c.priority === 'important')
  const useful = checks.filter(c => c.priority === 'useful')

  const essentialAnswered = essential.filter(c => c.value).length
  const importantAnswered = important.filter(c => c.value).length
  const usefulAnswered = useful.filter(c => c.value).length

  const answered = essentialAnswered + importantAnswered + usefulAnswered
  const pending = checks.filter(c => !c.value).map(c => c.label)

  // Weighted percentage: essential ×3, important ×2, useful ×1
  const weightedScore = (essentialAnswered * 3) + (importantAnswered * 2) + (usefulAnswered * 1)
  const weightedTotal = (essential.length * 3) + (important.length * 2) + (useful.length * 1)
  const percentage = weightedTotal > 0 ? Math.round((weightedScore / weightedTotal) * 100) : 0

  return {
    percentage,
    total: checks.length,
    answered,
    pending,
    essential: { answered: essentialAnswered, total: essential.length },
    important: { answered: importantAnswered, total: important.length },
    useful: { answered: usefulAnswered, total: useful.length },
  }
}
