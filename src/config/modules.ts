/**
 * MÓDULOS DE LA PLATAFORMA - CONFIGURACIÓN
 *
 * Itineramio tiene dos módulos independientes:
 * - MANUALES: Guías digitales para huéspedes (usa planes existentes)
 * - GESTION: Facturación y gestión de alquileres (tarifa plana)
 *
 * Cada usuario puede tener uno, ambos o ningún módulo activo.
 * Los módulos se gestionan vía UserModule en la base de datos.
 *
 * Última actualización: 28/01/2026
 */

export type ModuleCode = 'MANUALES' | 'GESTION'

export type ModuleStatus = 'ACTIVE' | 'CANCELED' | 'TRIAL' | 'EXPIRED'

export interface Module {
  code: ModuleCode
  name: string
  description: string
  shortDescription: string
  basePriceMonthly: number | null  // null = usa PLANS existentes
  priceSemestral: number | null    // -10% si aplica
  priceYearly: number | null       // -20% si aplica
  icon: string
  color: string
  trialDays?: number              // días de prueba gratis
  features: string[]
  ctaText: string
  activationUrl: string
}

/**
 * MÓDULOS DISPONIBLES
 */
export const MODULES: Record<ModuleCode, Module> = {
  MANUALES: {
    code: 'MANUALES',
    name: 'Manuales Digitales',
    description: 'Crea guías interactivas para tus huéspedes con instrucciones paso a paso, códigos QR por zona y análisis de uso.',
    shortDescription: 'Guías para huéspedes',
    basePriceMonthly: null, // Usa PLANS existentes (BASIC, HOST, etc.)
    priceSemestral: null,
    priceYearly: null,
    icon: 'BookOpen',
    color: '#8B5CF6', // violet-500
    features: [
      'Guías digitales personalizadas',
      'Códigos QR por zona',
      'Multiidioma automático',
      'Estadísticas de uso',
      'Notificaciones push'
    ],
    ctaText: 'Activar Manuales',
    activationUrl: '/account/plans'
  },
  GESTION: {
    code: 'GESTION',
    name: 'Gestión',
    description: 'Gestiona tus propiedades de forma profesional. Importa reservas, genera facturas y liquidaciones para tus propietarios automáticamente.',
    shortDescription: 'Gestión económica',
    basePriceMonthly: 8,      // €8/mes tarifa plana accesible
    priceSemestral: 43.2,     // 8 * 6 * 0.9 = 43.2
    priceYearly: 76.8,        // 8 * 12 * 0.8 = 76.8
    icon: 'Receipt',
    color: '#10B981', // emerald-500
    trialDays: 14,            // 14 días de prueba gratis
    features: [
      'Gestión de propietarios',
      'Importación de reservas',
      'Facturas automáticas',
      'Liquidaciones mensuales',
      'Control de gastos',
      'Informes de rentabilidad'
    ],
    ctaText: 'Probar 14 días gratis',
    activationUrl: '/account/modules/gestion'
  }
}

/**
 * Array de módulos para iterar
 */
export const MODULES_ARRAY: Module[] = Object.values(MODULES)

/**
 * Obtener módulo por código
 */
export function getModule(code: ModuleCode): Module {
  return MODULES[code]
}

/**
 * Interface para el estado de acceso a un módulo
 */
export interface ModuleAccess {
  moduleCode: ModuleCode
  hasAccess: boolean
  status: ModuleStatus | null
  isTrialActive: boolean
  trialEndsAt: Date | null
  expiresAt: Date | null
  activationRequired: boolean
  activationUrl: string
  activationCTA: string
}

/**
 * Interface para el acceso al módulo MANUALES (incluye límites de plan)
 */
export interface ManualesAccess extends ModuleAccess {
  planCode: string | null
  planName: string | null
  maxProperties: number
  currentProperties: number
  canAddProperty: boolean
}

/**
 * Interface para el acceso al módulo GESTION (sin límites de propiedades)
 */
export interface GestionAccess extends ModuleAccess {
  // GESTION usa BillingUnits, sin límite de unidades
  unlimitedProperties: true
}

/**
 * Crear respuesta de acceso denegado para un módulo
 */
export function createDeniedAccess(code: ModuleCode): ModuleAccess {
  const module = MODULES[code]
  return {
    moduleCode: code,
    hasAccess: false,
    status: null,
    isTrialActive: false,
    trialEndsAt: null,
    expiresAt: null,
    activationRequired: true,
    activationUrl: module.activationUrl,
    activationCTA: module.ctaText
  }
}

/**
 * Crear respuesta de acceso permitido para un módulo
 */
export function createGrantedAccess(
  code: ModuleCode,
  status: ModuleStatus,
  options?: {
    trialEndsAt?: Date | null
    expiresAt?: Date | null
  }
): ModuleAccess {
  const module = MODULES[code]
  const isTrialActive = status === 'TRIAL' && options?.trialEndsAt && new Date(options.trialEndsAt) > new Date()

  return {
    moduleCode: code,
    hasAccess: true,
    status,
    isTrialActive: isTrialActive || false,
    trialEndsAt: options?.trialEndsAt || null,
    expiresAt: options?.expiresAt || null,
    activationRequired: false,
    activationUrl: module.activationUrl,
    activationCTA: module.ctaText
  }
}

/**
 * Formatear precio del módulo para mostrar
 */
export function formatModulePrice(code: ModuleCode, period: 'MONTHLY' | 'SEMESTRAL' | 'YEARLY' = 'MONTHLY'): string {
  const module = MODULES[code]

  if (module.basePriceMonthly === null) {
    return 'Ver planes'
  }

  let price: number
  switch (period) {
    case 'SEMESTRAL':
      price = module.priceSemestral || module.basePriceMonthly * 6 * 0.9
      break
    case 'YEARLY':
      price = module.priceYearly || module.basePriceMonthly * 12 * 0.8
      break
    default:
      price = module.basePriceMonthly
  }

  return `${price.toFixed(2).replace('.', ',')}€`
}

/**
 * Obtener precio mensual efectivo (para comparar)
 */
export function getModulePricePerMonth(code: ModuleCode, period: 'MONTHLY' | 'SEMESTRAL' | 'YEARLY' = 'MONTHLY'): number | null {
  const module = MODULES[code]

  if (module.basePriceMonthly === null) {
    return null
  }

  switch (period) {
    case 'SEMESTRAL':
      return (module.priceSemestral || module.basePriceMonthly * 6 * 0.9) / 6
    case 'YEARLY':
      return (module.priceYearly || module.basePriceMonthly * 12 * 0.8) / 12
    default:
      return module.basePriceMonthly
  }
}
