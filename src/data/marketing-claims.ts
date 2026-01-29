/**
 * ESTADÍSTICAS Y CLAIMS DE MARKETING CENTRALIZADAS
 *
 * Este archivo centraliza todas las estadísticas y claims que usamos en marketing
 * para mantener consistencia en todo el contenido (landing, blog, emails, etc.)
 *
 * IMPORTANTE: Cualquier cambio aquí debe reflejarse en el contenido existente
 */

export const MARKETING_CLAIMS = {
  // ==========================================
  // AHORRO DE TIEMPO
  // ==========================================
  timeSavings: {
    // Claim principal - USAR ESTE
    weekly: '8 horas/semana',
    weeklyNumber: 8,

    // Equivalencias
    monthly: '32 horas/mes',
    monthlyNumber: 32,

    // Rango para ser más conservadores
    range: '6-10 horas/semana',

    // Para casos específicos de alto volumen
    highVolume: '15+ horas/semana',

    // NO USAR (inconsistente con claim principal):
    // - "2.5 horas/mes" (demasiado bajo)
    // - "25-30 horas/mes" (inconsistente con 8h/semana = 32h/mes)
  },

  // ==========================================
  // REDUCCIÓN DE CONSULTAS
  // ==========================================
  queryReduction: {
    // Claim principal - USAR ESTE
    percentage: '80%',
    percentageNumber: 80,

    // Rango para disclaimer
    range: '60-86%',
    rangeNote: 'según nivel de implementación',

    // Valor máximo documentado
    maxPercentage: '86%',
    maxNote: 'con implementación completa',

    // Valor mínimo esperado
    minPercentage: '60%',

    // NO USAR valores sueltos como 67%, 75%, 83%
    // que no tienen consistencia
  },

  // ==========================================
  // ESTADÍSTICAS DE REVIEWS
  // ==========================================
  reviews: {
    // Porcentaje que deja review naturalmente
    naturalReviewRate: '40%',
    naturalReviewRateNumber: 40,

    // Porcentaje que NO deja review sin pedirlo
    noReviewWithoutAsking: '60%',
    noReviewWithoutAskingNumber: 60,

    // Nota: Matemáticamente consistente:
    // 40% deja naturalmente = 60% no deja sin pedirlo

    // NO USAR:
    // - "70% no deja review" (inconsistente con 40% natural)
  },

  // ==========================================
  // ESTADÍSTICAS DE ANFITRIONES
  // ==========================================
  hosts: {
    // Anfitriones que reciben llamadas repetitivas
    withRepetitiveCalls: '73%',
    withRepetitiveCallsNumber: 73,
    callsPerReservation: '3+',

    // Anfitriones que cometen errores comunes
    commonMistakes: '80%',

    // NO USAR "90% cometen error X" - muy alto
  },

  // ==========================================
  // ESTADÍSTICAS DE HUÉSPEDES
  // ==========================================
  guests: {
    // Uso del manual digital
    scanQR: '87%',
    consultMultipleTimes: '62%',

    // Preferencias de check-in
    preferSelfCheckin: '78%',

    // Lectura de emails
    dontReadFullEmail: '87%',
  },

  // ==========================================
  // ROI Y PRECIOS
  // ==========================================
  roi: {
    // Valor de la hora del anfitrión
    hourlyValue: '30€',
    hourlyValueNumber: 30,

    // ROI mensual estimado
    monthlyROI: '240€', // 8h × 30€
    monthlyROINumber: 240,
  },

  // ==========================================
  // TIEMPO DE CONFIGURACIÓN
  // ==========================================
  setupTime: {
    // Manual básico
    basicManual: '30 minutos',
    basicManualNumber: 30,

    // Configuración completa
    fullSetup: '2-3 horas',

    // Sistema completo con automatizaciones
    fullSystem: '1-2 días',
  },

  // ==========================================
  // COMPARACIONES CON COMPETIDORES
  // ==========================================
  competitors: {
    // NOTA: Revisar matemáticas antes de usar claims de precio
    // No usar "25% más económico" sin verificar

    // Claims seguros basados en funcionalidades:
    duplicatioLimit: '50 propiedades',
    competitorDuplicationLimit: '5 propiedades',
  }
}

// Helper para obtener el claim formateado
export function getTimeSavingsClaim(format: 'weekly' | 'monthly' | 'range' = 'weekly'): string {
  switch (format) {
    case 'weekly':
      return MARKETING_CLAIMS.timeSavings.weekly
    case 'monthly':
      return MARKETING_CLAIMS.timeSavings.monthly
    case 'range':
      return MARKETING_CLAIMS.timeSavings.range
  }
}

export function getQueryReductionClaim(format: 'main' | 'range' | 'max' = 'main'): string {
  switch (format) {
    case 'main':
      return MARKETING_CLAIMS.queryReduction.percentage
    case 'range':
      return `${MARKETING_CLAIMS.queryReduction.range} ${MARKETING_CLAIMS.queryReduction.rangeNote}`
    case 'max':
      return `hasta ${MARKETING_CLAIMS.queryReduction.maxPercentage}`
  }
}
