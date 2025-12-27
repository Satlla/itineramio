'use client'

import { useState } from 'react'
import Link from 'next/link'
import { trackCalculatorUsed, trackGenerateLead } from '@/lib/analytics'
import { fbEvents } from '@/components/analytics/FacebookPixel'
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  Building2,
  Users,
  Wrench,
  Euro,
  MapPin,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Send,
  Home,
  Calendar,
  Percent,
  DollarSign
} from 'lucide-react'

// Datos de mercado por zona (simplificado - en producción vendría de API/DB)
// Precios en USD para Latinoamérica, EUR para España
const MARKET_DATA: Record<string, {
  adrHigh: number,
  adrMid: number,
  adrLow: number,
  occHigh: number,
  occMid: number,
  occLow: number,
  demand: 'alta' | 'media' | 'baja',
  seasonality: string,
  currency?: string
}> = {
  // ========== ESPAÑA ==========
  'barcelona-centro': { adrHigh: 150, adrMid: 110, adrLow: 75, occHigh: 90, occMid: 75, occLow: 55, demand: 'alta', seasonality: 'Todo el año con picos en verano y eventos' },
  'barcelona-periferia': { adrHigh: 95, adrMid: 70, adrLow: 50, occHigh: 80, occMid: 65, occLow: 45, demand: 'media', seasonality: 'Verano principalmente' },
  'madrid-centro': { adrHigh: 140, adrMid: 100, adrLow: 70, occHigh: 88, occMid: 72, occLow: 50, demand: 'alta', seasonality: 'Todo el año, picos en primavera/otoño' },
  'madrid-periferia': { adrHigh: 85, adrMid: 65, adrLow: 45, occHigh: 75, occMid: 60, occLow: 40, demand: 'media', seasonality: 'Variable según eventos' },
  'valencia-centro': { adrHigh: 120, adrMid: 85, adrLow: 55, occHigh: 85, occMid: 70, occLow: 45, demand: 'alta', seasonality: 'Fallas + verano muy fuerte' },
  'valencia-playa': { adrHigh: 130, adrMid: 90, adrLow: 50, occHigh: 92, occMid: 65, occLow: 35, demand: 'media', seasonality: 'Muy estacional (verano)' },
  'sevilla-centro': { adrHigh: 130, adrMid: 90, adrLow: 60, occHigh: 88, occMid: 70, occLow: 45, demand: 'alta', seasonality: 'Primavera muy fuerte (Feria, Semana Santa)' },
  'malaga-centro': { adrHigh: 125, adrMid: 90, adrLow: 60, occHigh: 87, occMid: 72, occLow: 50, demand: 'alta', seasonality: 'Todo el año, pico verano' },
  'malaga-costa': { adrHigh: 140, adrMid: 95, adrLow: 55, occHigh: 90, occMid: 65, occLow: 35, demand: 'media', seasonality: 'Estacional (verano + Semana Santa)' },
  'bilbao': { adrHigh: 110, adrMid: 80, adrLow: 55, occHigh: 82, occMid: 68, occLow: 45, demand: 'media', seasonality: 'Eventos + verano' },
  'san-sebastian': { adrHigh: 180, adrMid: 130, adrLow: 80, occHigh: 92, occMid: 75, occLow: 50, demand: 'alta', seasonality: 'Verano muy fuerte, festivales' },
  'canarias': { adrHigh: 120, adrMid: 85, adrLow: 60, occHigh: 88, occMid: 75, occLow: 60, demand: 'alta', seasonality: 'Todo el año, europeos en invierno' },
  'baleares': { adrHigh: 200, adrMid: 120, adrLow: 60, occHigh: 95, occMid: 60, occLow: 25, demand: 'alta', seasonality: 'Mayo-octubre muy fuerte' },

  // ========== MÉXICO ==========
  'cdmx-centro': { adrHigh: 120, adrMid: 80, adrLow: 50, occHigh: 85, occMid: 70, occLow: 55, demand: 'alta', seasonality: 'Todo el año, picos en festividades', currency: 'USD' },
  'cdmx-condesa-roma': { adrHigh: 150, adrMid: 100, adrLow: 65, occHigh: 88, occMid: 75, occLow: 60, demand: 'alta', seasonality: 'Nómadas digitales todo el año', currency: 'USD' },
  'cancun-zona-hotelera': { adrHigh: 250, adrMid: 150, adrLow: 80, occHigh: 95, occMid: 70, occLow: 45, demand: 'alta', seasonality: 'Dic-abril muy fuerte, verano familia', currency: 'USD' },
  'playa-del-carmen': { adrHigh: 180, adrMid: 110, adrLow: 60, occHigh: 90, occMid: 72, occLow: 50, demand: 'alta', seasonality: 'Temporada alta dic-abril', currency: 'USD' },
  'tulum': { adrHigh: 220, adrMid: 140, adrLow: 70, occHigh: 88, occMid: 68, occLow: 40, demand: 'alta', seasonality: 'Dic-abril, nómadas todo el año', currency: 'USD' },
  'puerto-vallarta': { adrHigh: 160, adrMid: 100, adrLow: 55, occHigh: 88, occMid: 65, occLow: 40, demand: 'media', seasonality: 'Invierno norteamericanos', currency: 'USD' },
  'guadalajara': { adrHigh: 90, adrMid: 60, adrLow: 40, occHigh: 80, occMid: 65, occLow: 50, demand: 'media', seasonality: 'Negocios + eventos', currency: 'USD' },
  'oaxaca': { adrHigh: 100, adrMid: 70, adrLow: 45, occHigh: 85, occMid: 65, occLow: 45, demand: 'media', seasonality: 'Día de muertos, Guelaguetza', currency: 'USD' },
  'san-miguel-allende': { adrHigh: 180, adrMid: 120, adrLow: 70, occHigh: 90, occMid: 70, occLow: 50, demand: 'alta', seasonality: 'Jubilados USA todo el año', currency: 'USD' },

  // ========== COLOMBIA ==========
  'bogota-centro': { adrHigh: 80, adrMid: 55, adrLow: 35, occHigh: 82, occMid: 68, occLow: 50, demand: 'media', seasonality: 'Negocios todo el año', currency: 'USD' },
  'bogota-norte': { adrHigh: 100, adrMid: 70, adrLow: 45, occHigh: 85, occMid: 70, occLow: 55, demand: 'alta', seasonality: 'Negocios + turismo', currency: 'USD' },
  'medellin-poblado': { adrHigh: 120, adrMid: 80, adrLow: 50, occHigh: 88, occMid: 75, occLow: 60, demand: 'alta', seasonality: 'Nómadas digitales todo el año', currency: 'USD' },
  'medellin-laureles': { adrHigh: 90, adrMid: 60, adrLow: 40, occHigh: 85, occMid: 72, occLow: 55, demand: 'alta', seasonality: 'Nómadas + turistas', currency: 'USD' },
  'cartagena-centro': { adrHigh: 180, adrMid: 110, adrLow: 60, occHigh: 90, occMid: 70, occLow: 45, demand: 'alta', seasonality: 'Dic-enero, Semana Santa muy fuerte', currency: 'USD' },
  'santa-marta': { adrHigh: 100, adrMid: 65, adrLow: 40, occHigh: 85, occMid: 60, occLow: 35, demand: 'media', seasonality: 'Vacaciones colombianas', currency: 'USD' },

  // ========== ARGENTINA ==========
  'buenos-aires-palermo': { adrHigh: 100, adrMid: 65, adrLow: 40, occHigh: 85, occMid: 70, occLow: 55, demand: 'alta', seasonality: 'Todo el año, pico verano', currency: 'USD' },
  'buenos-aires-centro': { adrHigh: 70, adrMid: 45, adrLow: 30, occHigh: 80, occMid: 65, occLow: 50, demand: 'media', seasonality: 'Negocios principalmente', currency: 'USD' },
  'mendoza': { adrHigh: 90, adrMid: 60, adrLow: 35, occHigh: 85, occMid: 65, occLow: 40, demand: 'media', seasonality: 'Vendimia + ski invierno', currency: 'USD' },
  'bariloche': { adrHigh: 150, adrMid: 90, adrLow: 50, occHigh: 95, occMid: 60, occLow: 35, demand: 'alta', seasonality: 'Ski julio-sept, verano dic-feb', currency: 'USD' },

  // ========== CHILE ==========
  'santiago-providencia': { adrHigh: 100, adrMid: 70, adrLow: 45, occHigh: 82, occMid: 68, occLow: 50, demand: 'media', seasonality: 'Negocios todo el año', currency: 'USD' },
  'santiago-las-condes': { adrHigh: 120, adrMid: 85, adrLow: 55, occHigh: 85, occMid: 70, occLow: 55, demand: 'alta', seasonality: 'Negocios + turismo', currency: 'USD' },
  'valparaiso': { adrHigh: 80, adrMid: 55, adrLow: 35, occHigh: 85, occMid: 60, occLow: 35, demand: 'media', seasonality: 'Verano muy fuerte', currency: 'USD' },
  'vina-del-mar': { adrHigh: 120, adrMid: 70, adrLow: 40, occHigh: 92, occMid: 55, occLow: 30, demand: 'media', seasonality: 'Verano chileno dic-feb', currency: 'USD' },

  // ========== PERÚ ==========
  'lima-miraflores': { adrHigh: 100, adrMid: 70, adrLow: 45, occHigh: 85, occMid: 70, occLow: 55, demand: 'alta', seasonality: 'Todo el año, verano dic-mar', currency: 'USD' },
  'lima-barranco': { adrHigh: 90, adrMid: 60, adrLow: 40, occHigh: 82, occMid: 68, occLow: 50, demand: 'media', seasonality: 'Turistas y nómadas', currency: 'USD' },
  'cusco': { adrHigh: 120, adrMid: 75, adrLow: 45, occHigh: 90, occMid: 70, occLow: 45, demand: 'alta', seasonality: 'Mayo-sept temporada seca', currency: 'USD' },

  // ========== COSTA RICA ==========
  'san-jose': { adrHigh: 80, adrMid: 55, adrLow: 35, occHigh: 75, occMid: 60, occLow: 45, demand: 'media', seasonality: 'Escala hacia playas', currency: 'USD' },
  'guanacaste': { adrHigh: 180, adrMid: 110, adrLow: 60, occHigh: 90, occMid: 65, occLow: 40, demand: 'alta', seasonality: 'Dic-abril temporada seca', currency: 'USD' },
  'manuel-antonio': { adrHigh: 160, adrMid: 100, adrLow: 55, occHigh: 88, occMid: 65, occLow: 40, demand: 'alta', seasonality: 'Todo el año, pico dic-abril', currency: 'USD' },

  // ========== REPÚBLICA DOMINICANA ==========
  'punta-cana': { adrHigh: 200, adrMid: 120, adrLow: 70, occHigh: 92, occMid: 70, occLow: 50, demand: 'alta', seasonality: 'Dic-abril norteamericanos', currency: 'USD' },
  'santo-domingo': { adrHigh: 90, adrMid: 60, adrLow: 40, occHigh: 80, occMid: 65, occLow: 50, demand: 'media', seasonality: 'Negocios todo el año', currency: 'USD' },

  // ========== GENÉRICOS ==========
  'otras-capital-espana': { adrHigh: 90, adrMid: 65, adrLow: 45, occHigh: 75, occMid: 60, occLow: 40, demand: 'media', seasonality: 'Variable' },
  'otras-costa-espana': { adrHigh: 100, adrMid: 70, adrLow: 40, occHigh: 85, occMid: 55, occLow: 25, demand: 'baja', seasonality: 'Muy estacional' },
  'otras-interior-espana': { adrHigh: 70, adrMid: 50, adrLow: 35, occHigh: 65, occMid: 50, occLow: 30, demand: 'baja', seasonality: 'Puentes y vacaciones' },
  'otras-latam-capital': { adrHigh: 80, adrMid: 55, adrLow: 35, occHigh: 75, occMid: 60, occLow: 45, demand: 'media', seasonality: 'Variable', currency: 'USD' },
  'otras-latam-playa': { adrHigh: 120, adrMid: 75, adrLow: 40, occHigh: 85, occMid: 60, occLow: 35, demand: 'media', seasonality: 'Estacional', currency: 'USD' },
  'otras-latam-interior': { adrHigh: 60, adrMid: 40, adrLow: 25, occHigh: 70, occMid: 50, occLow: 30, demand: 'baja', seasonality: 'Fines de semana', currency: 'USD' },
}

interface FormData {
  // Datos del propietario
  numProperties: string
  operationModel: 'self' | 'staff' | 'hybrid' | ''

  // Si gestiona él mismo
  hoursPerCleaning: string
  hourlyRate: string
  selfLaundry: boolean

  // Si tiene personal
  staffMonthlyCost: string
  cleaningCostPerCheckout: string
  laundryCostPerBed: string

  // Herramientas y software
  usesTools: boolean
  toolsMonthlyCost: string
  usesPricingTool: boolean
  pricingToolCost: string

  // Datos operativos
  avgNightlyRate: string
  avgOccupancy: string
  avgStayLength: string
  cleaningFeeCharged: string
  platformCommission: string

  // Costes fijos mensuales
  utilitiesCost: string
  insuranceCost: string
  communityFees: string
  otherFixedCosts: string

  // Zona
  zone: string
  currentSeason: 'high' | 'mid' | 'low' | ''

  // Lead capture
  email: string
  name: string
  phone: string
}

interface CalculationResult {
  // Ingresos
  grossMonthlyRevenue: number
  cleaningFeesRevenue: number
  totalRevenue: number

  // Costes
  platformFees: number
  cleaningCosts: number
  laundryCosts: number
  staffCosts: number
  toolsCosts: number
  utilitiesCosts: number
  timeCost: number // Coste del tiempo propio
  totalCosts: number

  // Métricas clave
  netMonthlyProfit: number
  profitMargin: number
  costPerAvailableNight: number
  costPerOccupiedNight: number
  minimumViablePrice: number
  realHourlyEarning: number

  // Análisis
  isProfitable: boolean
  profitabilityLevel: 'excellent' | 'good' | 'marginal' | 'losing'
  isChangingMoney: boolean // "Cambiando dinero de mano"

  // Comparativa mercado
  marketComparison: {
    adrVsMarket: number // % diferencia
    occVsMarket: number
    demandLevel: 'alta' | 'media' | 'baja'
    zoneAnalysis: string
  }

  // Recomendaciones
  recommendations: Array<{
    type: 'critical' | 'important' | 'suggestion'
    title: string
    description: string
  }>
}

export default function CalculadoraRentabilidad() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    numProperties: '1',
    operationModel: '',
    hoursPerCleaning: '3',
    hourlyRate: '15',
    selfLaundry: true,
    staffMonthlyCost: '',
    cleaningCostPerCheckout: '45',
    laundryCostPerBed: '8',
    usesTools: false,
    toolsMonthlyCost: '0',
    usesPricingTool: false,
    pricingToolCost: '0',
    avgNightlyRate: '',
    avgOccupancy: '',
    avgStayLength: '3',
    cleaningFeeCharged: '50',
    platformCommission: '15',
    utilitiesCost: '150',
    insuranceCost: '50',
    communityFees: '80',
    otherFixedCosts: '0',
    zone: '',
    currentSeason: '',
    email: '',
    name: '',
    phone: ''
  })

  const [result, setResult] = useState<CalculationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [leadSaved, setLeadSaved] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const calculateProfitability = (): CalculationResult => {
    const numProps = parseInt(formData.numProperties) || 1
    const avgRate = parseFloat(formData.avgNightlyRate) || 0
    const occupancy = parseFloat(formData.avgOccupancy) || 0
    const stayLength = parseFloat(formData.avgStayLength) || 3
    const cleaningFee = parseFloat(formData.cleaningFeeCharged) || 0
    const commission = parseFloat(formData.platformCommission) || 15

    const daysPerMonth = 30
    const occupiedNights = daysPerMonth * (occupancy / 100)
    const numCheckouts = occupiedNights / stayLength

    // INGRESOS
    const grossNightlyRevenue = avgRate * occupiedNights * numProps
    const cleaningFeesRevenue = cleaningFee * numCheckouts * numProps
    const totalRevenue = grossNightlyRevenue + cleaningFeesRevenue

    // COSTES
    // Comisiones plataforma
    const platformFees = totalRevenue * (commission / 100)

    // Limpieza
    let cleaningCosts = 0
    let timeCost = 0

    if (formData.operationModel === 'self' || formData.operationModel === 'hybrid') {
      const hoursPerClean = parseFloat(formData.hoursPerCleaning) || 3
      const hourlyRate = parseFloat(formData.hourlyRate) || 15
      const mgmtHoursPerCheckout = 0.5 // Gestión: mensajes, coordinación, etc.
      const totalHoursPerCheckout = hoursPerClean + mgmtHoursPerCheckout
      cleaningCosts = 0 // No paga en caja
      timeCost = totalHoursPerCheckout * hourlyRate * numCheckouts * numProps
    }

    if (formData.operationModel === 'staff' || formData.operationModel === 'hybrid') {
      const cleanCost = parseFloat(formData.cleaningCostPerCheckout) || 45
      cleaningCosts += cleanCost * numCheckouts * numProps
    }

    // Lavandería
    let laundryCosts = 0
    const bedsPerProperty = 2 // Estimación
    if (!formData.selfLaundry || formData.operationModel === 'staff') {
      const laundryCost = parseFloat(formData.laundryCostPerBed) || 8
      laundryCosts = laundryCost * bedsPerProperty * numCheckouts * numProps
    } else {
      // Coste estimado de lavar en casa (luz, agua, detergente, desgaste)
      laundryCosts = 5 * numCheckouts * numProps
    }

    // Personal fijo
    const staffCosts = formData.operationModel === 'staff' || formData.operationModel === 'hybrid'
      ? parseFloat(formData.staffMonthlyCost) || 0
      : 0

    // Herramientas
    let toolsCosts = 0
    if (formData.usesTools) {
      toolsCosts += parseFloat(formData.toolsMonthlyCost) || 0
    }
    if (formData.usesPricingTool) {
      toolsCosts += parseFloat(formData.pricingToolCost) || 0
    }

    // Costes fijos
    const utilities = parseFloat(formData.utilitiesCost) || 0
    const insurance = parseFloat(formData.insuranceCost) || 0
    const community = parseFloat(formData.communityFees) || 0
    const otherFixed = parseFloat(formData.otherFixedCosts) || 0
    const utilitiesCosts = (utilities + insurance + community + otherFixed) * numProps

    // TOTAL COSTES
    const totalCosts = platformFees + cleaningCosts + laundryCosts + staffCosts + toolsCosts + utilitiesCosts + timeCost

    // MÉTRICAS
    const netProfit = totalRevenue - totalCosts
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

    const costPerAvailableNight = totalCosts / (daysPerMonth * numProps)
    const costPerOccupiedNight = occupiedNights > 0 ? totalCosts / (occupiedNights * numProps) : 0

    // Precio mínimo viable (para no perder dinero)
    const fixedCostsPerNight = utilitiesCosts / (daysPerMonth * numProps)
    const variableCostsPerCheckout = (cleaningCosts + laundryCosts + timeCost) / (numCheckouts * numProps || 1)
    const variableCostsPerNight = variableCostsPerCheckout / stayLength
    const commissionMultiplier = 1 / (1 - commission / 100)
    const minimumViablePrice = (fixedCostsPerNight + variableCostsPerNight) * commissionMultiplier

    // Ganancia real por hora (si gestiona él - self o hybrid)
    const totalHoursWorked = (formData.operationModel === 'self' || formData.operationModel === 'hybrid')
      ? ((parseFloat(formData.hoursPerCleaning) || 3) + 0.5) * numCheckouts * numProps // Limpiezas + gestión
      : 0
    const realHourlyEarning = totalHoursWorked > 0 ? netProfit / totalHoursWorked : 0

    // ANÁLISIS
    const isProfitable = netProfit > 0
    let profitabilityLevel: 'excellent' | 'good' | 'marginal' | 'losing'
    if (profitMargin >= 40) profitabilityLevel = 'excellent'
    else if (profitMargin >= 25) profitabilityLevel = 'good'
    else if (profitMargin >= 10) profitabilityLevel = 'marginal'
    else profitabilityLevel = 'losing'

    // "Cambiando dinero de mano" = margen < 15% o ganancia/hora < 80% del valor declarado de su hora
    const hourlyFloor = (parseFloat(formData.hourlyRate) || 15) * 0.8
    const isChangingMoney = profitMargin < 15 || (totalHoursWorked > 0 && realHourlyEarning < hourlyFloor)

    // COMPARATIVA MERCADO
    const marketData = MARKET_DATA[formData.zone] || MARKET_DATA['otras-capital']
    const seasonKey = formData.currentSeason || 'mid'
    const marketADR = seasonKey === 'high' ? marketData.adrHigh : seasonKey === 'low' ? marketData.adrLow : marketData.adrMid
    const marketOcc = seasonKey === 'high' ? marketData.occHigh : seasonKey === 'low' ? marketData.occLow : marketData.occMid

    const adrVsMarket = marketADR > 0 ? ((avgRate - marketADR) / marketADR) * 100 : 0
    const occVsMarket = marketOcc > 0 ? ((occupancy - marketOcc) / marketOcc) * 100 : 0

    let zoneAnalysis = ''
    if (marketData.demand === 'alta') {
      zoneAnalysis = `Zona de alta demanda. ${marketData.seasonality}. Hay potencial de optimización.`
    } else if (marketData.demand === 'media') {
      zoneAnalysis = `Zona de demanda media. ${marketData.seasonality}. Importante diferenciarse.`
    } else {
      zoneAnalysis = `Zona de baja demanda. ${marketData.seasonality}. Considera estrategias de nicho o mensual.`
    }

    // RECOMENDACIONES
    const recommendations: CalculationResult['recommendations'] = []

    if (profitMargin < 15) {
      recommendations.push({
        type: 'critical',
        title: 'Margen insuficiente',
        description: `Tu margen del ${profitMargin.toFixed(1)}% es muy bajo. Estás trabajando casi gratis. Revisa precios o reduce costes.`
      })
    }

    if (totalHoursWorked > 0 && realHourlyEarning < hourlyFloor) {
      recommendations.push({
        type: 'critical',
        title: 'Tu hora vale más',
        description: `Estás ganando ${realHourlyEarning.toFixed(2)}€/hora, menos del 80% de lo que valoras tu tiempo (${hourlyFloor.toFixed(0)}€/h). Considera subir precios o externalizar.`
      })
    }

    if (avgRate < minimumViablePrice) {
      recommendations.push({
        type: 'critical',
        title: 'Precio bajo coste',
        description: `Tu precio medio (${avgRate}€) está por debajo de tu precio mínimo viable (${minimumViablePrice.toFixed(0)}€). Estás perdiendo dinero.`
      })
    }

    if (adrVsMarket < -20) {
      recommendations.push({
        type: 'important',
        title: 'Precio muy bajo vs mercado',
        description: `Tu ADR está un ${Math.abs(adrVsMarket).toFixed(0)}% por debajo del mercado. Podrías estar infravalorando tu propiedad.`
      })
    }

    if (occVsMarket < -15 && marketData.demand !== 'baja') {
      recommendations.push({
        type: 'important',
        title: 'Ocupación baja para tu zona',
        description: `Tu ocupación está un ${Math.abs(occVsMarket).toFixed(0)}% por debajo del mercado. Revisa tu anuncio, fotos y posicionamiento.`
      })
    }

    if (!formData.usesTools && numProps >= 2) {
      recommendations.push({
        type: 'suggestion',
        title: 'Considera herramientas de gestión',
        description: 'Con 2+ propiedades, herramientas como manuales digitales reducen consultas y mejoran reviews.'
      })
    }

    if (formData.operationModel === 'self' && timeCost > cleaningFee * numCheckouts * numProps) {
      recommendations.push({
        type: 'important',
        title: 'Limpieza no rentable',
        description: `El valor de tu tiempo en limpieza (${timeCost.toFixed(0)}€) supera lo que cobras (${(cleaningFee * numCheckouts * numProps).toFixed(0)}€). Considera externalizar.`
      })
    }

    if (marketData.demand === 'baja' && occupancy < 50) {
      recommendations.push({
        type: 'suggestion',
        title: 'Explora alquiler mensual',
        description: 'En zonas de baja demanda con ocupación < 50%, el mensual puede ser más rentable y menos trabajo.'
      })
    }

    return {
      grossMonthlyRevenue: grossNightlyRevenue,
      cleaningFeesRevenue,
      totalRevenue,
      platformFees,
      cleaningCosts,
      laundryCosts,
      staffCosts,
      toolsCosts,
      utilitiesCosts,
      timeCost,
      totalCosts,
      netMonthlyProfit: netProfit,
      profitMargin,
      costPerAvailableNight,
      costPerOccupiedNight,
      minimumViablePrice,
      realHourlyEarning,
      isProfitable,
      profitabilityLevel,
      isChangingMoney,
      marketComparison: {
        adrVsMarket,
        occVsMarket,
        demandLevel: marketData.demand,
        zoneAnalysis
      },
      recommendations
    }
  }

  const handleCalculate = async () => {
    setLoading(true)

    // Simular pequeño delay para UX
    await new Promise(resolve => setTimeout(resolve, 500))

    const calculationResult = calculateProfitability()
    setResult(calculationResult)

    // Track calculator usage in GTM
    trackCalculatorUsed({
      zone: formData.zone,
      model: formData.operationModel,
      properties: parseInt(formData.numProperties) || 1,
      result: calculationResult.profitabilityLevel,
      margin: calculationResult.profitMargin,
      isChangingMoney: calculationResult.isChangingMoney,
    })

    setLoading(false)
    setStep(5) // Ir a resultados
  }

  const handleSaveLead = async () => {
    if (!formData.email) return

    setLoading(true)

    try {
      const response = await fetch('/api/hub/profitability-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          result,
          source: 'calculadora-rentabilidad',
          createdAt: new Date().toISOString()
        })
      })

      if (response.ok) {
        setLeadSaved(true)

        // Track lead captured in GTM
        trackGenerateLead({
          source: 'recursos',
          leadMagnet: 'calculadora-rentabilidad',
          value: 15, // Higher value for calculator leads
        })

        // Facebook Pixel event
        fbEvents.lead({
          content_name: 'Calculadora Rentabilidad',
          content_category: 'calculator',
          value: 15,
          currency: 'EUR'
        })
      }
    } catch (error) {
      console.error('Error saving lead:', error)
    }

    setLoading(false)
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu situación actual</h2>
        <p className="text-gray-600">Cuéntanos sobre tu operación</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Building2 className="inline w-4 h-4 mr-1" />
          ¿Cuántas propiedades gestionas?
        </label>
        <select
          name="numProperties"
          value={formData.numProperties}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        >
          <option value="1">1 propiedad</option>
          <option value="2">2 propiedades</option>
          <option value="3">3-4 propiedades</option>
          <option value="5">5-9 propiedades</option>
          <option value="10">10+ propiedades</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Users className="inline w-4 h-4 mr-1" />
          ¿Cómo gestionas la operación?
        </label>
        <div className="grid grid-cols-1 gap-3">
          {[
            { value: 'self', label: 'Lo hago yo mismo/a', desc: 'Limpio, gestiono y atiendo yo' },
            { value: 'staff', label: 'Tengo personal', desc: 'Equipo de limpieza y/o gestión' },
            { value: 'hybrid', label: 'Híbrido', desc: 'Yo + ayuda externa puntual' }
          ].map(option => (
            <label
              key={option.value}
              className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.operationModel === option.value
                  ? 'border-violet-500 bg-violet-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="operationModel"
                value={option.value}
                checked={formData.operationModel === option.value}
                onChange={handleChange}
                className="mt-1 mr-3"
              />
              <div>
                <div className="font-medium text-gray-900">{option.label}</div>
                <div className="text-sm text-gray-500">{option.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <MapPin className="inline w-4 h-4 mr-1" />
          ¿Dónde están tus propiedades?
        </label>
        <select
          name="zone"
          value={formData.zone}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        >
          <option value="">Selecciona zona...</option>

          <optgroup label="🇪🇸 ESPAÑA - Barcelona">
            <option value="barcelona-centro">Barcelona Centro / Eixample / Gràcia</option>
            <option value="barcelona-periferia">Barcelona Periferia / Área metropolitana</option>
          </optgroup>
          <optgroup label="🇪🇸 ESPAÑA - Madrid">
            <option value="madrid-centro">Madrid Centro / Salamanca / Chamberí</option>
            <option value="madrid-periferia">Madrid Periferia / Área metropolitana</option>
          </optgroup>
          <optgroup label="🇪🇸 ESPAÑA - Valencia">
            <option value="valencia-centro">Valencia Centro / Ruzafa / Ciutat Vella</option>
            <option value="valencia-playa">Valencia Playa / Malvarrosa / Alboraya</option>
          </optgroup>
          <optgroup label="🇪🇸 ESPAÑA - Andalucía">
            <option value="sevilla-centro">Sevilla Centro</option>
            <option value="malaga-centro">Málaga Centro</option>
            <option value="malaga-costa">Costa del Sol</option>
          </optgroup>
          <optgroup label="🇪🇸 ESPAÑA - País Vasco">
            <option value="bilbao">Bilbao</option>
            <option value="san-sebastian">San Sebastián / Donostia</option>
          </optgroup>
          <optgroup label="🇪🇸 ESPAÑA - Islas">
            <option value="canarias">Canarias (Tenerife, Gran Canaria...)</option>
            <option value="baleares">Baleares (Mallorca, Ibiza...)</option>
          </optgroup>
          <optgroup label="🇪🇸 ESPAÑA - Otras">
            <option value="otras-capital-espana">Otra capital de provincia</option>
            <option value="otras-costa-espana">Otra zona costera</option>
            <option value="otras-interior-espana">Zona interior / rural</option>
          </optgroup>

          <optgroup label="🇲🇽 MÉXICO - CDMX">
            <option value="cdmx-centro">Ciudad de México Centro Histórico</option>
            <option value="cdmx-condesa-roma">CDMX Condesa / Roma / Polanco</option>
          </optgroup>
          <optgroup label="🇲🇽 MÉXICO - Caribe">
            <option value="cancun-zona-hotelera">Cancún Zona Hotelera</option>
            <option value="playa-del-carmen">Playa del Carmen</option>
            <option value="tulum">Tulum</option>
          </optgroup>
          <optgroup label="🇲🇽 MÉXICO - Pacífico">
            <option value="puerto-vallarta">Puerto Vallarta</option>
          </optgroup>
          <optgroup label="🇲🇽 MÉXICO - Interior">
            <option value="guadalajara">Guadalajara</option>
            <option value="oaxaca">Oaxaca</option>
            <option value="san-miguel-allende">San Miguel de Allende</option>
          </optgroup>

          <optgroup label="🇨🇴 COLOMBIA - Bogotá">
            <option value="bogota-centro">Bogotá Centro / La Candelaria</option>
            <option value="bogota-norte">Bogotá Norte / Chapinero / Usaquén</option>
          </optgroup>
          <optgroup label="🇨🇴 COLOMBIA - Medellín">
            <option value="medellin-poblado">Medellín El Poblado</option>
            <option value="medellin-laureles">Medellín Laureles / Envigado</option>
          </optgroup>
          <optgroup label="🇨🇴 COLOMBIA - Costa">
            <option value="cartagena-centro">Cartagena Centro Histórico</option>
            <option value="santa-marta">Santa Marta / Taganga</option>
          </optgroup>

          <optgroup label="🇦🇷 ARGENTINA">
            <option value="buenos-aires-palermo">Buenos Aires Palermo / Recoleta</option>
            <option value="buenos-aires-centro">Buenos Aires Centro / San Telmo</option>
            <option value="mendoza">Mendoza</option>
            <option value="bariloche">Bariloche</option>
          </optgroup>

          <optgroup label="🇨🇱 CHILE">
            <option value="santiago-providencia">Santiago Providencia / Ñuñoa</option>
            <option value="santiago-las-condes">Santiago Las Condes / Vitacura</option>
            <option value="valparaiso">Valparaíso</option>
            <option value="vina-del-mar">Viña del Mar</option>
          </optgroup>

          <optgroup label="🇵🇪 PERÚ">
            <option value="lima-miraflores">Lima Miraflores / San Isidro</option>
            <option value="lima-barranco">Lima Barranco</option>
            <option value="cusco">Cusco</option>
          </optgroup>

          <optgroup label="🇨🇷 COSTA RICA">
            <option value="san-jose">San José</option>
            <option value="guanacaste">Guanacaste / Tamarindo</option>
            <option value="manuel-antonio">Manuel Antonio / Quepos</option>
          </optgroup>

          <optgroup label="🇩🇴 REP. DOMINICANA">
            <option value="punta-cana">Punta Cana / Bávaro</option>
            <option value="santo-domingo">Santo Domingo</option>
          </optgroup>

          <optgroup label="🌎 LATAM - Otras">
            <option value="otras-latam-capital">Otra capital latinoamericana</option>
            <option value="otras-latam-playa">Otra zona de playa LATAM</option>
            <option value="otras-latam-interior">Otra zona interior LATAM</option>
          </optgroup>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Calendar className="inline w-4 h-4 mr-1" />
          ¿En qué temporada estamos?
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'high', label: 'Alta', desc: 'Verano / Eventos' },
            { value: 'mid', label: 'Media', desc: 'Primavera / Otoño' },
            { value: 'low', label: 'Baja', desc: 'Invierno' }
          ].map(option => (
            <label
              key={option.value}
              className={`flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
                formData.currentSeason === option.value
                  ? 'border-violet-500 bg-violet-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="currentSeason"
                value={option.value}
                checked={formData.currentSeason === option.value}
                onChange={handleChange}
                className="sr-only"
              />
              <div className="font-medium text-gray-900">{option.label}</div>
              <div className="text-xs text-gray-500">{option.desc}</div>
            </label>
          ))}
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Costes de operación</h2>
        <p className="text-gray-600">
          {formData.operationModel === 'self'
            ? 'Tu tiempo tiene valor. Vamos a calcularlo.'
            : 'Detalla tus costes de personal y servicios'}
        </p>
      </div>

      {(formData.operationModel === 'self' || formData.operationModel === 'hybrid') && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-amber-600 mr-2 mt-0.5" />
            <div>
              <p className="text-sm text-amber-800 font-medium">Tu tiempo es dinero</p>
              <p className="text-sm text-amber-700">Aunque no "pagues" por limpiar, tu tiempo tiene un coste de oportunidad. Lo incluimos para que veas la rentabilidad real.</p>
            </div>
          </div>
        </div>
      )}

      {(formData.operationModel === 'self' || formData.operationModel === 'hybrid') && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline w-4 h-4 mr-1" />
              Horas por limpieza completa
            </label>
            <input
              type="number"
              name="hoursPerCleaning"
              value={formData.hoursPerCleaning}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="ej: 3"
            />
            <p className="text-xs text-gray-500 mt-1">Incluye limpieza + cambio de ropa + preparación</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Euro className="inline w-4 h-4 mr-1" />
              ¿Cuánto vale tu hora? (€/hora)
            </label>
            <input
              type="number"
              name="hourlyRate"
              value={formData.hourlyRate}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="ej: 15"
            />
            <p className="text-xs text-gray-500 mt-1">Referencia: una empresa de limpieza cobra 15-25€/hora</p>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="selfLaundry"
                checked={formData.selfLaundry}
                onChange={handleChange}
                className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500 mr-2"
              />
              <span className="text-sm text-gray-700">Lavo la ropa yo mismo/a (en casa)</span>
            </label>
          </div>
        </>
      )}

      {(formData.operationModel === 'staff' || formData.operationModel === 'hybrid') && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Euro className="inline w-4 h-4 mr-1" />
              Coste personal fijo mensual (€/mes)
            </label>
            <input
              type="number"
              name="staffMonthlyCost"
              value={formData.staffMonthlyCost}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="ej: 1200"
            />
            <p className="text-xs text-gray-500 mt-1">Nóminas, SS, etc. (si aplica)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coste limpieza por check-out (€)
            </label>
            <input
              type="number"
              name="cleaningCostPerCheckout"
              value={formData.cleaningCostPerCheckout}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="ej: 45"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coste lavandería por cama (€)
            </label>
            <input
              type="number"
              name="laundryCostPerBed"
              value={formData.laundryCostPerBed}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="ej: 8"
            />
          </div>
        </>
      )}
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Herramientas y software</h2>
        <p className="text-gray-600">¿Usas herramientas para gestionar?</p>
      </div>

      <div>
        <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="checkbox"
            name="usesTools"
            checked={formData.usesTools}
            onChange={handleChange}
            className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500 mr-3"
          />
          <div>
            <span className="text-sm font-medium text-gray-900">Uso herramientas de gestión</span>
            <p className="text-xs text-gray-500">Channel manager, PMS, software de check-in, etc.</p>
          </div>
        </label>

        {formData.usesTools && (
          <div className="mt-3 ml-7">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coste mensual herramientas (€/mes)
            </label>
            <input
              type="number"
              name="toolsMonthlyCost"
              value={formData.toolsMonthlyCost}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="ej: 50"
            />
          </div>
        )}
      </div>

      <div>
        <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="checkbox"
            name="usesPricingTool"
            checked={formData.usesPricingTool}
            onChange={handleChange}
            className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500 mr-3"
          />
          <div>
            <span className="text-sm font-medium text-gray-900">Uso herramienta de pricing dinámico</span>
            <p className="text-xs text-gray-500">PriceLabs, Wheelhouse, Beyond, etc.</p>
          </div>
        </label>

        {formData.usesPricingTool && (
          <div className="mt-3 ml-7">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coste mensual pricing (€/mes)
            </label>
            <input
              type="number"
              name="pricingToolCost"
              value={formData.pricingToolCost}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="ej: 20"
            />
          </div>
        )}
      </div>

      <div className="border-t pt-6">
        <h3 className="font-medium text-gray-900 mb-4">Costes fijos mensuales (por propiedad)</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Suministros (€/mes)
            </label>
            <input
              type="number"
              name="utilitiesCost"
              value={formData.utilitiesCost}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="ej: 150"
            />
            <p className="text-xs text-gray-500 mt-1">Luz, agua, gas, internet</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seguro (€/mes)
            </label>
            <input
              type="number"
              name="insuranceCost"
              value={formData.insuranceCost}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="ej: 50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comunidad (€/mes)
            </label>
            <input
              type="number"
              name="communityFees"
              value={formData.communityFees}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="ej: 80"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Otros fijos (€/mes)
            </label>
            <input
              type="number"
              name="otherFixedCosts"
              value={formData.otherFixedCosts}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="ej: 0"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tus métricas actuales</h2>
        <p className="text-gray-600">Datos de tu rendimiento actual</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Euro className="inline w-4 h-4 mr-1" />
          Precio medio por noche (€)
        </label>
        <input
          type="number"
          name="avgNightlyRate"
          value={formData.avgNightlyRate}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          placeholder="ej: 85"
        />
        <p className="text-xs text-gray-500 mt-1">Sin incluir tasa de limpieza</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Percent className="inline w-4 h-4 mr-1" />
          Ocupación media (%)
        </label>
        <input
          type="number"
          name="avgOccupancy"
          value={formData.avgOccupancy}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          placeholder="ej: 70"
          max="100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Calendar className="inline w-4 h-4 mr-1" />
          Estancia media (noches)
        </label>
        <input
          type="number"
          name="avgStayLength"
          value={formData.avgStayLength}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          placeholder="ej: 3"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tasa de limpieza que cobras (€)
        </label>
        <input
          type="number"
          name="cleaningFeeCharged"
          value={formData.cleaningFeeCharged}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          placeholder="ej: 50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Comisión plataforma (%)
        </label>
        <input
          type="number"
          name="platformCommission"
          value={formData.platformCommission}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          placeholder="ej: 15"
        />
        <p className="text-xs text-gray-500 mt-1">Airbnb suele ser ~15%, Booking ~15-18%</p>
      </div>
    </div>
  )

  const renderResults = () => {
    if (!result) return null

    return (
      <div className="space-y-8">
        {/* Header con estado general */}
        <div className={`text-center p-6 rounded-xl ${
          result.profitabilityLevel === 'excellent' ? 'bg-green-50' :
          result.profitabilityLevel === 'good' ? 'bg-blue-50' :
          result.profitabilityLevel === 'marginal' ? 'bg-amber-50' :
          'bg-red-50'
        }`}>
          <div className="flex justify-center mb-4">
            {result.profitabilityLevel === 'excellent' && <CheckCircle className="w-16 h-16 text-green-500" />}
            {result.profitabilityLevel === 'good' && <CheckCircle className="w-16 h-16 text-blue-500" />}
            {result.profitabilityLevel === 'marginal' && <AlertTriangle className="w-16 h-16 text-amber-500" />}
            {result.profitabilityLevel === 'losing' && <XCircle className="w-16 h-16 text-red-500" />}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {result.profitabilityLevel === 'excellent' && '¡Excelente rentabilidad!'}
            {result.profitabilityLevel === 'good' && 'Buena rentabilidad'}
            {result.profitabilityLevel === 'marginal' && 'Rentabilidad ajustada'}
            {result.profitabilityLevel === 'losing' && 'Estás perdiendo dinero'}
          </h2>

          {result.isChangingMoney && (
            <p className="text-gray-600 max-w-md mx-auto">
              <span className="font-semibold text-amber-700">Atención:</span> Estás "cambiando dinero de mano" -
              trabajando mucho para ganar poco. Hay margen de mejora.
            </p>
          )}
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">Ingresos/mes</p>
            <p className="text-2xl font-bold text-gray-900">{result.totalRevenue.toFixed(0)}€</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">Costes/mes</p>
            <p className="text-2xl font-bold text-gray-900">{result.totalCosts.toFixed(0)}€</p>
          </div>
          <div className={`border rounded-lg p-4 text-center ${
            result.netMonthlyProfit >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <p className="text-sm text-gray-500 mb-1">Beneficio neto/mes</p>
            <p className={`text-2xl font-bold ${
              result.netMonthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {result.netMonthlyProfit.toFixed(0)}€
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">Margen</p>
            <p className={`text-2xl font-bold ${
              result.profitMargin >= 25 ? 'text-green-600' :
              result.profitMargin >= 10 ? 'text-amber-600' : 'text-red-600'
            }`}>
              {result.profitMargin.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Precio mínimo viable */}
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-2 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-violet-600" />
            Tu precio mínimo viable
          </h3>
          <p className="text-4xl font-bold text-violet-600 mb-2">
            {result.minimumViablePrice.toFixed(0)}€/noche
          </p>
          <p className="text-sm text-gray-600">
            Por debajo de este precio, estás perdiendo dinero. Tu precio actual medio es {formData.avgNightlyRate}€.
            {parseFloat(formData.avgNightlyRate) < result.minimumViablePrice && (
              <span className="text-red-600 font-semibold"> ¡Estás vendiendo por debajo del coste!</span>
            )}
          </p>
        </div>

        {/* Si gestiona él mismo - ganancia por hora */}
        {(formData.operationModel === 'self' || formData.operationModel === 'hybrid') && (
          <div className={`border rounded-xl p-6 ${
            result.realHourlyEarning >= 15 ? 'bg-green-50 border-green-200' :
            result.realHourlyEarning >= 10 ? 'bg-amber-50 border-amber-200' :
            'bg-red-50 border-red-200'
          }`}>
            <h3 className="font-bold text-gray-900 mb-2 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Tu ganancia real por hora
            </h3>
            <p className={`text-4xl font-bold mb-2 ${
              result.realHourlyEarning >= 15 ? 'text-green-600' :
              result.realHourlyEarning >= 10 ? 'text-amber-600' :
              'text-red-600'
            }`}>
              {result.realHourlyEarning.toFixed(2)}€/hora
            </p>
            <p className="text-sm text-gray-600">
              Incluyendo tiempo de limpieza y gestión.
              {result.realHourlyEarning < 12 && ' Esto es menos que el salario mínimo interprofesional.'}
            </p>
          </div>
        )}

        {/* Análisis de zona */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-gray-600" />
            Análisis de tu zona
          </h3>

          <div className="flex items-center gap-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              result.marketComparison.demandLevel === 'alta' ? 'bg-green-100 text-green-800' :
              result.marketComparison.demandLevel === 'media' ? 'bg-amber-100 text-amber-800' :
              'bg-red-100 text-red-800'
            }`}>
              Demanda {result.marketComparison.demandLevel}
            </span>
          </div>

          <p className="text-gray-600 mb-4">{result.marketComparison.zoneAnalysis}</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Tu ADR vs mercado</p>
              <div className="flex items-center">
                {result.marketComparison.adrVsMarket >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-500 mr-2" />
                )}
                <span className={`font-bold ${
                  result.marketComparison.adrVsMarket >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {result.marketComparison.adrVsMarket >= 0 ? '+' : ''}{result.marketComparison.adrVsMarket.toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Tu ocupación vs mercado</p>
              <div className="flex items-center">
                {result.marketComparison.occVsMarket >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-500 mr-2" />
                )}
                <span className={`font-bold ${
                  result.marketComparison.occVsMarket >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {result.marketComparison.occVsMarket >= 0 ? '+' : ''}{result.marketComparison.occVsMarket.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recomendaciones */}
        {result.recommendations.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-violet-600" />
              Recomendaciones personalizadas
            </h3>

            {result.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className={`border-l-4 rounded-r-lg p-4 ${
                  rec.type === 'critical' ? 'bg-red-50 border-red-500' :
                  rec.type === 'important' ? 'bg-amber-50 border-amber-500' :
                  'bg-blue-50 border-blue-500'
                }`}
              >
                <h4 className={`font-semibold mb-1 ${
                  rec.type === 'critical' ? 'text-red-800' :
                  rec.type === 'important' ? 'text-amber-800' :
                  'text-blue-800'
                }`}>
                  {rec.title}
                </h4>
                <p className={`text-sm ${
                  rec.type === 'critical' ? 'text-red-700' :
                  rec.type === 'important' ? 'text-amber-700' :
                  'text-blue-700'
                }`}>
                  {rec.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Lead capture */}
        {!leadSaved ? (
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl p-6 text-white">
            <h3 className="font-bold text-xl mb-2">
              ¿Quieres un análisis más detallado?
            </h3>
            <p className="text-violet-100 mb-4">
              Déjanos tu email y te enviaremos un informe personalizado con estrategias específicas para tu caso.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Tu nombre"
                className="px-4 py-3 rounded-lg text-gray-900 placeholder-gray-400"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                className="px-4 py-3 rounded-lg text-gray-900 placeholder-gray-400"
              />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Teléfono (opcional)"
                className="px-4 py-3 rounded-lg text-gray-900 placeholder-gray-400"
              />
            </div>

            <button
              onClick={handleSaveLead}
              disabled={!formData.email || loading}
              className="w-full md:w-auto px-6 py-3 bg-white text-violet-600 font-semibold rounded-lg hover:bg-violet-50 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? 'Enviando...' : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Recibir análisis completo
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="font-bold text-green-800 mb-2">¡Gracias!</h3>
            <p className="text-green-700">
              Te enviaremos el análisis completo a {formData.email}
            </p>
          </div>
        )}

        {/* CTA Itineramio */}
        <div className="bg-gray-900 rounded-xl p-6 text-white text-center">
          <h3 className="font-bold text-xl mb-2">
            Optimiza tu operación con Itineramio
          </h3>
          <p className="text-gray-300 mb-4 max-w-lg mx-auto">
            Reduce consultas repetitivas en un 80%, mejora tus reviews y justifica precios más altos con manuales digitales profesionales.
          </p>
          <Link
            href="/register"
            className="inline-block px-6 py-3 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 transition-colors"
          >
            Prueba 15 días gratis →
          </Link>
        </div>
      </div>
    )
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.operationModel && formData.zone && formData.currentSeason
      case 2:
        if (formData.operationModel === 'self' || formData.operationModel === 'hybrid') {
          return formData.hoursPerCleaning && formData.hourlyRate
        }
        if (formData.operationModel === 'staff') {
          return formData.cleaningCostPerCheckout
        }
        return true
      case 3:
        return true
      case 4:
        return formData.avgNightlyRate && formData.avgOccupancy
      default:
        return true
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link href="/hub" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Hub
          </Link>

          <div className="flex items-center">
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mr-4">
              <Calculator className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Calculadora de Rentabilidad</h1>
              <p className="text-gray-600">Descubre si estás ganando dinero o "cambiando dinero de mano"</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {step < 5 && (
        <div className="bg-white border-b">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Paso {step} de 4</span>
              <span className="text-sm text-gray-600">{Math.round((step / 4) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-600 transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          {step === 5 && renderResults()}

          {/* Navigation */}
          {step < 5 && (
            <div className="flex justify-between mt-8 pt-6 border-t">
              <button
                onClick={() => setStep(s => s - 1)}
                disabled={step === 1}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Anterior
              </button>

              {step < 4 ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  disabled={!canProceed()}
                  className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  Siguiente
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleCalculate}
                  disabled={!canProceed() || loading}
                  className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? 'Calculando...' : (
                    <>
                      <Calculator className="w-4 h-4 mr-2" />
                      Calcular rentabilidad
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
