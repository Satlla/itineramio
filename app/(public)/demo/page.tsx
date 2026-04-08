'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, ArrowLeft, Loader2, CheckCircle, ChevronRight,
  User, Mail, Phone, Gift, AlertCircle, X, Zap, Star, Shield,
  MessageCircle, Users, Flame, KeyRound, RotateCcw,
} from 'lucide-react'
import { Turnstile } from '@marsidev/react-turnstile'
import { I18nProvider } from '../../../src/providers/I18nProvider'
import Step1Address, { type Step1Data } from '../../(dashboard)/ai-setup/components/Step1Address'
import Step2Details, { type Step2Data } from '../../(dashboard)/ai-setup/components/Step2Details'
import Step3Media, { type MediaItem } from '../../(dashboard)/ai-setup/components/Step2Media'
import Step4Review, { type LocationData, type DemoPlace } from '../../(dashboard)/ai-setup/components/Step4Review'
import { isDisposableEmail, isValidEmailFormat } from '../../../src/utils/email-validation'
import DemoResultsScreen from '../../../src/components/demo/DemoResultsScreen'
import DemoShareModal from '../../../src/components/demo/DemoShareModal'
import DemoOnboarding from '../../../src/components/demo/DemoOnboarding'
import { buildIntelligenceFromImport } from '../../../src/types/intelligence'

// ============================================
// TYPES
// ============================================

type Phase = 'onboarding' | 'wizard' | 'lead-capture' | 'generating' | 'results' | 'redirect'

type LeadCaptureStep = 'info' | 'verify'

interface LeadData {
  name: string
  email: string
  phone: string
}

interface DemoResult {
  propertyId: string
  couponCode: string
  expiresAt: string
  couponExpiresAt: string
}

// ============================================
// CONFETTI PARTICLE SYSTEM
// ============================================

interface Particle {
  id: number
  x: number
  y: number
  color: string
  size: number
  rotation: number
  velocityX: number
  velocityY: number
}

function ConfettiBurst({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (!active) return
    const colors = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#7c3aed', '#6d28d9', '#ddd6fe', '#ede9fe', '#f59e0b', '#fbbf24']
    const newParticles: Particle[] = []
    for (let i = 0; i < 40; i++) {
      newParticles.push({
        id: i,
        x: 50 + (Math.random() - 0.5) * 20,
        y: 40,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 8,
        rotation: Math.random() * 360,
        velocityX: (Math.random() - 0.5) * 80,
        velocityY: -30 - Math.random() * 60,
      })
    }
    setParticles(newParticles)
    const timer = setTimeout(() => setParticles([]), 2000)
    return () => clearTimeout(timer)
  }, [active])

  if (particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            rotate: 0,
            scale: 1,
            opacity: 1,
          }}
          animate={{
            left: `${p.x + p.velocityX}%`,
            top: `${p.y + p.velocityY + 120}%`,
            rotate: p.rotation + 720,
            scale: 0,
            opacity: 0,
          }}
          transition={{ duration: 1.8, ease: 'easeOut' }}
          className="absolute"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  )
}

// ============================================
// ANIMATED BACKGROUND ORBS
// ============================================

function AnimatedOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Subtle light orbs */}
      <motion.div
        animate={{ x: [0, 60, -30, 0], y: [0, -50, 40, 0], scale: [1, 1.2, 0.9, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-violet-200/30 blur-[120px]"
      />
      <motion.div
        animate={{ x: [0, -80, 50, 0], y: [0, 40, -30, 0], scale: [1, 0.8, 1.2, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full bg-purple-200/20 blur-[120px]"
      />
    </div>
  )
}

// ============================================
// PROGRESS BAR
// ============================================

function ProgressBar({ step, total }: { step: number; total: number }) {
  const progress = ((step - 1) / (total - 1)) * 100

  return (
    <div className="relative w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
      {/* Glow behind the bar */}
      <motion.div
        className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500"
        initial={{ width: '0%' }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ filter: 'blur(6px)', opacity: 0.6 }}
      />
      {/* Actual bar */}
      <motion.div
        className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500"
        initial={{ width: '0%' }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
      {/* Shimmer effect */}
      <motion.div
        className="absolute top-0 left-0 h-full w-20 rounded-full"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
        }}
        animate={{ left: ['-20%', '120%'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
      />
    </div>
  )
}

// ============================================
// LOADING MESSAGES
// ============================================

const LOADING_MESSAGES = [
  { es: 'Analizando tu alojamiento...', en: 'Analyzing your property...', fr: 'Analyse de votre logement...' },
  { es: 'Generando zonas del manual...', en: 'Generating manual sections...', fr: 'Génération des sections du manuel...' },
  { es: 'Buscando direcciones y transporte...', en: 'Finding directions & transport...', fr: 'Recherche des directions et transports...' },
  { es: 'Detectando electrodomésticos...', en: 'Detecting appliances...', fr: 'Détection des appareils...' },
  { es: 'Descubriendo lugares cercanos...', en: 'Discovering nearby places...', fr: 'Découverte des lieux proches...' },
  { es: 'Generando recomendaciones...', en: 'Generating recommendations...', fr: 'Génération de recommandations...' },
  { es: 'Casi listo...', en: 'Almost ready...', fr: 'Presque prêt...' },
]

// ============================================
// DEFAULT VALUES
// ============================================

// Pre-filled test data for dev — skip Step 1 quickly with ?devskip=1
const devStep1: Step1Data = {
  propertyName: 'Test Apartment',
  propertyDescription: 'Apartamento de prueba para dev',
  profileImage: '',
  street: 'Calle Gran Vía 1',
  city: 'Madrid',
  state: 'Madrid',
  country: 'España',
  postalCode: '28013',
  formattedAddress: 'Calle Gran Vía 1, 28013 Madrid, España',
  propertyType: 'APARTMENT',
  bedrooms: 2,
  bathrooms: 1,
  maxGuests: 4,
  squareMeters: 65,
  wifiName: 'TestWifi',
  wifiPassword: 'test1234',
  checkInTime: '15:00',
  checkInMethod: 'lockbox',
  checkInInstructions: '',
  checkOutTime: '11:00',
  hasParking: 'no',
  hasPool: false,
  hasAC: true,
  hostContactName: 'Dev Tester',
  hostContactPhone: '+34600000000',
  hostContactEmail: 'dev@test.com',
  hostContactLanguage: 'es',
  hostContactPhoto: '',
  lat: 40.4200,
  lng: -3.7025,
}

const defaultStep1: Step1Data = {
  propertyName: '',
  propertyDescription: '',
  profileImage: '',
  street: '',
  city: '',
  state: '',
  country: 'España',
  postalCode: '',
  formattedAddress: '',
  propertyType: 'APARTMENT',
  bedrooms: 1,
  bathrooms: 1,
  maxGuests: 3,
  squareMeters: 0,
  wifiName: '',
  wifiPassword: '',
  checkInTime: '15:00',
  checkInMethod: 'lockbox',
  checkInInstructions: '',
  checkOutTime: '11:00',
  hasParking: 'no',
  hasPool: false,
  hasAC: false,
  hostContactName: '',
  hostContactPhone: '',
  hostContactEmail: '',
  hostContactLanguage: 'es',
  hostContactPhoto: '',
}

const defaultStep2: Step2Data = {
  lockboxCode: '',
  lockboxLocation: '',
  doorCode: '',
  codeChangesPerReservation: false,
  meetingPoint: '',
  latePlan: 'call',
  latePlanDetails: '',
  hotWaterType: 'instant',
  electricalPanelLocation: '',
  supportHoursFrom: '09:00',
  supportHoursTo: '22:00',
  emergencyPhone: '',
  recyclingContainerLocation: '',
  recommendations: '',
  parkingSpotNumber: '',
  parkingFloor: '',
  parkingAccess: 'remote',
  parkingAccessCode: '',
  checkoutInstructions: '',
  keyReturn: 'lockbox',
  keyReturnDetails: '',
  lateCheckout: 'no',
  lateCheckoutPrice: '',
  lateCheckoutUntil: '',
  luggageAfterCheckout: 'no',
  luggageUntil: '',
  luggageConsignaInfo: '',
  items: {
    iron: { has: false, location: '' },
    ironingBoard: { has: false, location: '' },
    hairdryer: { has: false, location: '' },
    firstAid: { has: false, location: '' },
    extraBlankets: { has: false, location: '' },
    broom: { has: false, location: '' },
  },
}

// ============================================
// INLINE TRANSLATIONS
// ============================================

function getLang(): string {
  if (typeof window === 'undefined') return 'es'
  const saved = localStorage.getItem('itineramio-language')
  if (saved && ['es', 'en', 'fr'].includes(saved)) return saved
  return 'es'
}

const T: Record<string, Record<string, string>> = {
  es: {
    heroTitle: 'Genera el manual digital de tu alojamiento',
    heroSubtitle: 'Elimina el 80% de llamadas repetitivas de tus huespedes. Manual + chatbot IA en 30 segundos.',
    step: 'Paso',
    of: 'de',
    leadTitle: 'Tu manual esta listo',
    leadSubtitle: 'Introduce tus datos para acceder a tu manual completo con un 20% de descuento exclusivo.',
    leadName: 'Nombre completo',
    leadEmail: 'Email',
    leadPhone: 'Telefono *',
    generateNow: 'Generar mi manual gratis',
    generating: 'Creando tu manual con IA...',
    generatingSubtitle: 'Nuestra IA esta analizando tu alojamiento y generando contenido personalizado.',
    redirecting: 'Redirigiendo a tu manual...',
    errorTitle: 'Error al generar',
    errorRetry: 'Reintentar',
    close: 'Cerrar',
    securityCheck: 'Verificacion de seguridad',
    freeNoCatch: 'Gratis y sin compromiso',
    discount: '20% de descuento exclusivo al registrarte',
    badge1: 'IA avanzada',
    badge2: 'Gratis',
    badge3: 'Chatbot IA incluido',
    trustLine: 'Sin tarjeta de credito · Sin spam · Resultado en 30 seg',
    spotsUsed: 'plazas utilizadas',
    spotsLeft: 'plazas restantes',
    limitedOffer: 'Oferta limitada a 500 anfitriones',
    onlyXLeft: 'Solo quedan',
    spots: 'plazas',
    hurryLimited: 'Plazas limitadas, no te quedes sin la tuya',
    chatbotIncluded: 'Incluye chatbot IA 24/7 para tus huespedes',
  },
  en: {
    heroTitle: 'Generate your property\'s digital manual',
    heroSubtitle: 'Eliminate 80% of repetitive guest calls. Manual + AI chatbot in 30 seconds.',
    step: 'Step',
    of: 'of',
    leadTitle: 'Your manual is ready',
    leadSubtitle: 'Enter your details to access your complete manual with an exclusive 20% discount.',
    leadName: 'Full name',
    leadEmail: 'Email',
    leadPhone: 'Phone *',
    generateNow: 'Generate my free manual',
    generating: 'Creating your manual with AI...',
    generatingSubtitle: 'Our AI is analyzing your property and generating personalized content.',
    redirecting: 'Redirecting to your manual...',
    errorTitle: 'Generation error',
    errorRetry: 'Retry',
    close: 'Close',
    securityCheck: 'Security check',
    freeNoCatch: 'Free, no strings attached',
    discount: 'Exclusive 20% off when you register',
    badge1: 'Advanced AI',
    badge2: 'Free',
    badge3: 'AI Chatbot included',
    trustLine: 'No credit card · No spam · Results in 30 sec',
    spotsUsed: 'spots used',
    spotsLeft: 'spots remaining',
    limitedOffer: 'Limited to 500 hosts',
    onlyXLeft: 'Only',
    spots: 'spots left',
    hurryLimited: 'Limited spots, don\'t miss yours',
    chatbotIncluded: 'Includes 24/7 AI chatbot for your guests',
  },
  fr: {
    heroTitle: 'Generez le manuel digital de votre logement',
    heroSubtitle: 'Eliminez 80% des appels repetitifs de vos voyageurs. Manuel + chatbot IA en 30 secondes.',
    step: 'Etape',
    of: 'de',
    leadTitle: 'Votre manuel est pret',
    leadSubtitle: 'Entrez vos coordonnees pour acceder a votre manuel complet avec 20% de reduction exclusive.',
    leadName: 'Nom complet',
    leadEmail: 'Email',
    leadPhone: 'Telephone *',
    generateNow: 'Generer mon manuel gratuit',
    generating: 'Creation de votre manuel avec IA...',
    generatingSubtitle: 'Notre IA analyse votre logement et genere du contenu personnalise.',
    redirecting: 'Redirection vers votre manuel...',
    errorTitle: 'Erreur de generation',
    errorRetry: 'Reessayer',
    close: 'Fermer',
    securityCheck: 'Verification de securite',
    freeNoCatch: 'Gratuit et sans engagement',
    discount: '-20% exclusif en vous inscrivant',
    badge1: 'IA avancee',
    badge2: 'Gratuit',
    badge3: 'Chatbot IA inclus',
    trustLine: 'Sans carte bancaire · Sans spam · Resultat en 30 sec',
    spotsUsed: 'places utilisees',
    spotsLeft: 'places restantes',
    limitedOffer: 'Offre limitee a 500 hotes',
    onlyXLeft: 'Plus que',
    spots: 'places',
    hurryLimited: 'Places limitees, ne ratez pas la votre',
    chatbotIncluded: 'Inclut un chatbot IA 24/7 pour vos voyageurs',
  },
}

function t(key: string): string {
  const lang = getLang()
  return T[lang]?.[key] || T.es[key] || key
}

// ============================================
// STEP LABELS
// ============================================

const STEP_LABELS = [
  { es: 'Propiedad', en: 'Property', fr: 'Propriete' },
  { es: 'Detalles', en: 'Details', fr: 'Details' },
  { es: 'Fotos & IA', en: 'Photos & AI', fr: 'Photos & IA' },
  { es: 'Revisar', en: 'Review', fr: 'Reviser' },
]

function getStepLabel(index: number): string {
  const lang = getLang()
  const labels = STEP_LABELS[index]
  return (labels as any)?.[lang] || labels?.es || ''
}

// ============================================
// LANGUAGE SWITCHER
// ============================================

const DEMO_LANGS = [
  { code: 'es', label: 'ES', flag: '🇪🇸' },
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'fr', label: 'FR', flag: '🇫🇷' },
]

function DemoLangSwitcher() {
  const { i18n } = useTranslation()
  const current = i18n.language?.slice(0, 2) || 'es'

  const handleChange = (code: string) => {
    i18n.changeLanguage(code)
    try { localStorage.setItem('itineramio-language', code) } catch {}
  }

  return (
    <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
      {DEMO_LANGS.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleChange(lang.code)}
          className={`px-2 py-1 rounded-md text-xs font-semibold transition-all ${
            current === lang.code
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {lang.flag} {lang.label}
        </button>
      ))}
    </div>
  )
}

// ============================================
// DEMO PAGE COMPONENT
// ============================================

function DemoPageInner() {
  const router = useRouter()

  // Phase & step state
  const [phase, setPhase] = useState<Phase>('onboarding')
  const [wizardStep, setWizardStepRaw] = useState(1)
  const [prevStep, setPrevStep] = useState(0)
  const [confettiBurst, setConfettiBurst] = useState(0)

  const setWizardStep = (step: number) => {
    setPrevStep(wizardStep)
    setWizardStepRaw(step)
    // Confetti on step advance
    if (step > wizardStep) {
      setConfettiBurst(prev => prev + 1)
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }

  // Wizard data
  const [step1Data, setStep1Data] = useState<Step1Data>(defaultStep1)
  const [step2Data, setStep2Data] = useState<Step2Data>(defaultStep2)

  // Dev skip: ?devskip=1 pre-fills step1+media and jumps to lead capture
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('devskip') === '1') {
      setStep1Data(devStep1)
      setMedia([
        { id: 'dev-1', url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', type: 'image', zoneId: 'living-room' },
        { id: 'dev-2', url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', type: 'image', zoneId: 'bedroom' },
        { id: 'dev-3', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800', type: 'image', zoneId: 'kitchen' },
      ])
      setPhase('lead-capture')
    }
  }, [])
  const [media, setMedia] = useState<MediaItem[]>([])

  // Airbnb import state
  const [airbnbImport, setAirbnbImport] = useState<{
    importing: boolean
    imported: boolean
    error: string | null
    importedFields: string[]
  }>({ importing: false, imported: false, error: null, importedFields: [] })
  const [airbnbData, setAirbnbData] = useState<Record<string, any> | null>(null)
  const [airbnbUrl, setAirbnbUrl] = useState<string>('')

  const handleAirbnbImport = useCallback(async (url: string) => {
    setAirbnbImport({ importing: true, imported: false, error: null, importedFields: [] })

    try {
      const res = await fetch('/api/public/demo-import-airbnb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const json = await res.json()

      if (!res.ok || !json.success) {
        setAirbnbImport({ importing: false, imported: false, error: json.error || 'Error al importar', importedFields: [] })
        return
      }

      const d = json.data
      setAirbnbData(d)
      setAirbnbUrl(url)
      const importedFields: string[] = []
      const updates: Partial<Step1Data> = {}

      if (d.propertyName) { updates.propertyName = d.propertyName; importedFields.push('propertyName') }
      if (d.propertyDescription) { updates.propertyDescription = d.propertyDescription; importedFields.push('propertyDescription') }
      // No auto-fill address from Airbnb — user must enter exact address manually
      if (d.city) { updates.city = d.city; importedFields.push('city') }
      if (d.country) { updates.country = d.country }
      if (d.propertyType) { updates.propertyType = d.propertyType; importedFields.push('propertyType') }
      if (d.maxGuests > 0) { updates.maxGuests = d.maxGuests; importedFields.push('maxGuests') }
      if (d.bedrooms > 0) { updates.bedrooms = d.bedrooms; importedFields.push('bedrooms') }
      if (d.bathrooms > 0) { updates.bathrooms = d.bathrooms; importedFields.push('bathrooms') }
      if (d.hasAC !== undefined) { updates.hasAC = d.hasAC; importedFields.push('hasAC') }
      if (d.hasPool !== undefined) { updates.hasPool = d.hasPool; importedFields.push('hasPool') }
      if (d.hasParking) { updates.hasParking = d.hasParking; importedFields.push('hasParking') }
      if (d.checkInMethod) { updates.checkInMethod = d.checkInMethod; importedFields.push('checkInMethod') }
      if (d.checkInTime) { updates.checkInTime = d.checkInTime; importedFields.push('checkInTime') }
      if (d.checkOutTime) { updates.checkOutTime = d.checkOutTime; importedFields.push('checkOutTime') }
      if (d.profileImage) { updates.profileImage = d.profileImage; importedFields.push('profileImage') }

      setStep1Data(prev => ({ ...prev, ...updates }))

      // Only import cover photo as profile image (already done above via d.profileImage)
      // Don't import all listing photos — they're not relevant for zones

      // Map items (iron, hairdryer, etc.) to step2Data
      if (d.items) {
        setStep2Data(prev => ({
          ...prev,
          items: {
            iron: { has: d.items.iron || prev.items.iron.has, location: prev.items.iron.location },
            ironingBoard: { has: d.items.ironingBoard || prev.items.ironingBoard.has, location: prev.items.ironingBoard.location },
            hairdryer: { has: d.items.hairdryer || prev.items.hairdryer.has, location: prev.items.hairdryer.location },
            firstAid: { has: d.items.firstAid || prev.items.firstAid.has, location: prev.items.firstAid.location },
            extraBlankets: { has: d.items.extraBlankets || prev.items.extraBlankets.has, location: prev.items.extraBlankets.location },
            broom: { has: d.items.broom || prev.items.broom.has, location: prev.items.broom.location },
          },
          // Map checkout tasks to checkout instructions
          ...(d.checkoutTasks && d.checkoutTasks.length > 0
            ? { checkoutInstructions: d.checkoutTasks.join('\n') }
            : {}),
        }))
        const itemNames = Object.entries(d.items)
          .filter(([, v]) => v)
          .map(([k]) => k)
        if (itemNames.length > 0) importedFields.push('items')
        if (d.checkoutTasks?.length > 0) importedFields.push('checkoutTasks')
      }

      // Map house rules info
      if (d.houseRules) {
        if (d.houseRules.noPets) importedFields.push('noPets')
        if (d.houseRules.noSmoking) importedFields.push('noSmoking')
        if (d.houseRules.noParties) importedFields.push('noParties')
        if (d.houseRules.quietHoursStart) importedFields.push('quietHours')
      }
      if (d.hostName) importedFields.push('hostName')
      if (d.isSuperhost) importedFields.push('isSuperhost')
      if (d.allAmenities?.length > 0) importedFields.push('allAmenities')

      setAirbnbImport({ importing: false, imported: true, error: null, importedFields })
    } catch {
      setAirbnbImport({ importing: false, imported: false, error: 'Error de conexión. Inténtalo de nuevo.', importedFields: [] })
    }
  }, [])

  const [locationData, setLocationData] = useState<LocationData | null>(null)
  const [locationDataLoading, setLocationDataLoading] = useState(false)
  const [disabledZones, setDisabledZones] = useState<Set<string>>(new Set())
  const [reviewedContent, setReviewedContent] = useState<Record<string, string>>({})
  const [customTitles, setCustomTitles] = useState<Record<string, string>>({})
  const [customIcons, setCustomIcons] = useState<Record<string, string>>({})
  const [demoPlaces, setDemoPlaces] = useState<DemoPlace[]>([])

  // Lead data
  const [leadData, setLeadData] = useState<LeadData>({ name: '', email: '', phone: '' })
  const [emailError, setEmailError] = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState('')

  // OTP verification states
  const [leadCaptureStep, setLeadCaptureStep] = useState<LeadCaptureStep>('info')
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [otpSending, setOtpSending] = useState(false)
  const [otpVerifying, setOtpVerifying] = useState(false)
  const [otpError, setOtpError] = useState<string | null>(null)
  const [otpResendCooldown, setOtpResendCooldown] = useState(0)
  const [emailVerificationToken, setEmailVerificationToken] = useState<string | null>(null)
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [otpFocusedIndex, setOtpFocusedIndex] = useState(-1)

  // Spots / scarcity
  const [spotsUsed, setSpotsUsed] = useState(249)
  const [spotsTotal] = useState(500)

  // Generation state
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<DemoResult | null>(null)
  const [showDemoShareModal, setShowDemoShareModal] = useState(false)
  const [generatedZonesCount, setGeneratedZonesCount] = useState(0)

  // Fetch spots counter on mount
  useEffect(() => {
    fetch('/api/public/demo-spots')
      .then(res => res.json())
      .then(data => {
        if (data.used) setSpotsUsed(data.used)
      })
      .catch(() => {})
  }, [])

  // Fetch location data when entering Step 4
  useEffect(() => {
    if (wizardStep !== 4) return
    if (locationData) return
    if (locationDataLoading) return
    if (!step1Data.lat || !step1Data.lng || !step1Data.city) return

    setLocationDataLoading(true)
    fetch('/api/public/demo-location-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lat: step1Data.lat,
        lng: step1Data.lng,
        city: step1Data.city,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setLocationData(data.data)
        }
      })
      .catch(() => { /* location data fetch error silenced */ })
      .finally(() => setLocationDataLoading(false))
  }, [wizardStep, locationData, locationDataLoading, step1Data.lat, step1Data.lng, step1Data.city])

  // Loading message rotation
  useEffect(() => {
    if (phase !== 'generating') return
    const interval = setInterval(() => {
      setLoadingMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [phase])

  // OTP resend cooldown timer
  useEffect(() => {
    if (otpResendCooldown <= 0) return
    const timer = setTimeout(() => setOtpResendCooldown(prev => prev - 1), 1000)
    return () => clearTimeout(timer)
  }, [otpResendCooldown])

  // Validate email on blur
  const validateEmailField = useCallback((email: string) => {
    if (!email) {
      setEmailError(null)
      return true
    }
    if (!isValidEmailFormat(email)) {
      setEmailError('Formato de email inválido')
      return false
    }
    if (isDisposableEmail(email)) {
      setEmailError('No se permiten emails temporales o desechables')
      return false
    }
    setEmailError(null)
    return true
  }, [])

  // Send OTP to email
  const handleSendOtp = useCallback(async () => {
    if (!validateEmailField(leadData.email)) return
    if (!leadData.name) return
    if (!leadData.phone || leadData.phone.replace(/\s/g, '').length < 6) {
      const l = getLang()
      setPhoneError(l === 'en' ? 'Phone is required (min. 6 characters)' : l === 'fr' ? 'Téléphone requis (min. 6 caractères)' : 'Teléfono obligatorio (mín. 6 caracteres)')
      return
    }
    setPhoneError(null)

    setOtpSending(true)
    setOtpError(null)
    setError(null)

    try {
      const res = await fetch('/api/public/demo-send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: leadData.email,
          name: leadData.name,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setOtpError(data.error || 'Error al enviar el código')
        return
      }

      setLeadCaptureStep('verify')
      setOtpDigits(['', '', '', '', '', ''])
      setOtpResendCooldown(60)
      // Focus first OTP input after transition
      setTimeout(() => otpInputRefs.current[0]?.focus(), 300)
    } catch {
      setOtpError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setOtpSending(false)
    }
  }, [leadData.email, leadData.name, leadData.phone, validateEmailField])

  // Generate the demo
  const handleGenerate = useCallback(async (token?: string) => {
    const verificationToken = token || emailVerificationToken
    if (!validateEmailField(leadData.email)) return

    setPhase('generating')
    setError(null)
    setLoadingMessageIndex(0)

    try {
      const res = await fetch('/api/public/generate-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadName: leadData.name,
          leadEmail: leadData.email,
          leadPhone: leadData.phone,
          emailVerificationToken: verificationToken || undefined,
          turnstileToken,
          propertyName: step1Data.propertyName,
          street: step1Data.street,
          city: step1Data.city,
          state: step1Data.state,
          country: step1Data.country,
          postalCode: step1Data.postalCode,
          lat: step1Data.lat,
          lng: step1Data.lng,
          formattedAddress: step1Data.formattedAddress,
          propertyType: step1Data.propertyType,
          bedrooms: step1Data.bedrooms,
          bathrooms: step1Data.bathrooms,
          maxGuests: step1Data.maxGuests,
          wifiName: step1Data.wifiName,
          wifiPassword: step1Data.wifiPassword,
          checkInTime: step1Data.checkInTime,
          checkInMethod: step1Data.checkInMethod,
          checkOutTime: step1Data.checkOutTime,
          hasParking: step1Data.hasParking,
          hasAC: step1Data.hasAC,
          hostContactName: step1Data.hostContactName,
          hostContactPhone: step1Data.hostContactPhone,
          hostContactEmail: step1Data.hostContactEmail,
          mediaAnalysis: media.filter(m => m.zoneId || m.customZoneName),
          disabledZones: [...disabledZones],
          reviewedContent,
          customTitles,
          customIcons,
          intelligence: buildIntelligenceFromImport(airbnbData, step2Data, airbnbUrl || undefined),
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error || 'Error al generar el demo')
        setPhase('lead-capture')
        setLeadCaptureStep('info')
        setEmailVerificationToken(null)
        return
      }

      setResult(data)

      try {
        localStorage.setItem('itineramio-demo-data', JSON.stringify({
          propertyName: step1Data.propertyName,
          street: step1Data.street,
          city: step1Data.city,
          state: step1Data.state,
          country: step1Data.country,
          postalCode: step1Data.postalCode,
          formattedAddress: step1Data.formattedAddress,
          propertyType: step1Data.propertyType,
          bedrooms: step1Data.bedrooms,
          bathrooms: step1Data.bathrooms,
          maxGuests: step1Data.maxGuests,
          wifiName: step1Data.wifiName,
          wifiPassword: step1Data.wifiPassword,
          checkInTime: step1Data.checkInTime,
          checkInMethod: step1Data.checkInMethod,
          checkOutTime: step1Data.checkOutTime,
          hasParking: step1Data.hasParking,
          hasAC: step1Data.hasAC,
          hostContactName: step1Data.hostContactName,
          hostContactPhone: step1Data.hostContactPhone,
          hostContactEmail: step1Data.hostContactEmail,
        }))
      } catch {}

      // Count zones from the wizard data
      const builtinZones = ['check-in', 'check-out', 'wifi', 'normas', 'reciclaje', 'emergencias']
      const mediaZones = media.filter(m => m.zoneId || m.customZoneName).length
      setGeneratedZonesCount(Math.max(builtinZones.length + Math.min(mediaZones, 5), 6))

      setPhase('results')
      setConfettiBurst(prev => prev + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexion')
      setPhase('lead-capture')
      setLeadCaptureStep('info')
      setEmailVerificationToken(null)
    }
  }, [leadData, turnstileToken, emailVerificationToken, step1Data, step2Data, media, disabledZones, reviewedContent, customTitles, customIcons, router, validateEmailField, airbnbData, airbnbUrl])

  // Verify OTP code — defined after handleGenerate to avoid stale reference
  const handleVerifyOtp = useCallback(async () => {
    const code = otpDigits.join('')
    if (code.length !== 6) return

    setOtpVerifying(true)
    setOtpError(null)

    try {
      const res = await fetch('/api/public/demo-verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: leadData.email,
          code,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setOtpError(data.error || 'Código incorrecto')
        if (data.forceResend) {
          setOtpDigits(['', '', '', '', '', ''])
          setLeadCaptureStep('info')
        } else {
          // Shake + clear digits on wrong code
          setOtpDigits(['', '', '', '', '', ''])
          setTimeout(() => otpInputRefs.current[0]?.focus(), 100)
        }
        return
      }

      // Success — store token and trigger generation
      const token = data.verificationToken
      setEmailVerificationToken(token)
      handleGenerate(token)
    } catch {
      setOtpError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setOtpVerifying(false)
    }
  }, [otpDigits, leadData.email, handleGenerate])

  // OTP digit input handlers
  const handleOtpDigitChange = useCallback((index: number, value: string) => {
    // Handle paste of full code
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6).split('')
      const newDigits = [...otpDigits]
      digits.forEach((d, i) => {
        if (index + i < 6) newDigits[index + i] = d
      })
      setOtpDigits(newDigits)
      // Focus last filled or next empty
      const nextIndex = Math.min(index + digits.length, 5)
      otpInputRefs.current[nextIndex]?.focus()
      return
    }

    const digit = value.replace(/\D/g, '')
    const newDigits = [...otpDigits]
    newDigits[index] = digit
    setOtpDigits(newDigits)
    if (otpError) setOtpError(null)

    // Auto-advance to next input
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }, [otpDigits, otpError])

  const handleOtpKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      // Move to previous input on backspace when current is empty
      const newDigits = [...otpDigits]
      newDigits[index - 1] = ''
      setOtpDigits(newDigits)
      otpInputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'Enter') {
      const code = otpDigits.join('')
      if (code.length === 6) handleVerifyOtp()
    }
  }, [otpDigits, handleVerifyOtp])

  // Auto-submit when all 6 digits are filled
  useEffect(() => {
    const code = otpDigits.join('')
    if (code.length === 6 && leadCaptureStep === 'verify' && !otpVerifying) {
      handleVerifyOtp()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpDigits])

  const lang = typeof window !== 'undefined' ? getLang() : 'es'
  const loadingMsg = LOADING_MESSAGES[loadingMessageIndex]

  // ──────────────────────────────────────────────
  // ONBOARDING PHASE — full screen slides before wizard
  // ──────────────────────────────────────────────
  if (phase === 'onboarding') {
    return (
      <I18nProvider>
        <DemoOnboarding onComplete={() => setPhase('wizard')} />
      </I18nProvider>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Animated background */}
      <AnimatedOrbs />

      {/* Confetti */}
      <ConfettiBurst active={confettiBurst > 0} key={confettiBurst} />

      {/* Content */}
      <div className="relative z-10">
        {/* Top bar — glassmorphism */}
        <div className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur-xl shadow-sm">
          <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={() => {
                  if (phase !== 'wizard') return
                  if (wizardStep > 1) setWizardStep(wizardStep - 1)
                  else window.location.href = '/'
                }}
                className="flex items-center gap-2 text-gray-400 hover:text-gray-700 transition-colors group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              </button>

              {/* Logo */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Sparkles className="w-5 h-5 text-violet-500" />
                  <motion.div
                    className="absolute inset-0 rounded-full bg-violet-400/30 blur-md"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.2, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <span className="text-gray-900 font-bold text-sm sm:text-base tracking-tight">itineramio</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-200">DEMO</span>
              </div>

              {/* Right side: step counter + lang switcher */}
              <div className="flex items-center gap-2 sm:gap-3">
              <DemoLangSwitcher />
              {phase === 'wizard' && (
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex items-center gap-1">
                      <motion.div
                        layout
                        className={`relative flex items-center justify-center rounded-full text-[10px] sm:text-xs font-bold transition-all duration-500 ${
                          step === wizardStep
                            ? 'w-7 h-7 sm:w-8 sm:h-8'
                            : 'w-6 h-6 sm:w-7 sm:h-7'
                        }`}
                      >
                        {/* Glow ring for active step */}
                        {step === wizardStep && (
                          <motion.div
                            className="absolute inset-0 rounded-full bg-violet-500/30 blur-md"
                            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.2, 0.6] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}
                        <div className={`relative z-10 w-full h-full rounded-full flex items-center justify-center ${
                          step === wizardStep
                            ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30'
                            : step < wizardStep
                            ? 'bg-violet-100 text-violet-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {step < wizardStep ? (
                            <CheckCircle className="w-3.5 h-3.5" />
                          ) : step}
                        </div>
                      </motion.div>
                      {step < 4 && (
                        <div className={`w-3 sm:w-4 h-px transition-colors duration-500 ${
                          step < wizardStep ? 'bg-violet-400' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Spacer when not in wizard phase */}
              {phase !== 'wizard' && <div />}
              </div>
            </div>

            {/* Animated progress bar */}
            {phase === 'wizard' && (
              <ProgressBar step={wizardStep} total={4} />
            )}
          </div>
        </div>

        {/* Hero section (step 1 only) */}
        {phase === 'wizard' && wizardStep === 1 && (
          <div className="max-w-4xl mx-auto px-3 sm:px-4 pt-6 sm:pt-10 pb-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-4"
            >
              {/* Badges */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center gap-2 flex-wrap"
              >
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-xs font-medium">
                  <Zap className="w-3 h-3" />
                  {t('badge1')}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
                  <Gift className="w-3 h-3" />
                  {t('badge2')}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-medium">
                  <MessageCircle className="w-3 h-3" />
                  {t('badge3')}
                </span>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl sm:text-4xl font-extrabold text-gray-900 leading-tight"
              >
                {t('heroTitle')}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gray-500 text-sm sm:text-base max-w-lg mx-auto"
              >
                {t('heroSubtitle')}
              </motion.p>

              {/* Limited spots counter */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-orange-50 border border-orange-200"
              >
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-bold text-orange-700">{t('limitedOffer')}</span>
                </div>
                <div className="h-4 w-px bg-orange-200" />
                <div className="flex items-center gap-2">
                  {/* Mini progress bar */}
                  <div className="w-20 h-1.5 rounded-full bg-orange-100 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500"
                      initial={{ width: '0%' }}
                      animate={{ width: `${(spotsUsed / spotsTotal) * 100}%` }}
                      transition={{ duration: 1.5, delay: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-orange-600">
                    {spotsUsed}/{spotsTotal}
                  </span>
                </div>
              </motion.div>

              {/* Trust line */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-gray-400 text-xs flex items-center justify-center gap-2"
              >
                <Shield className="w-3 h-3" />
                {t('trustLine')}
              </motion.p>
            </motion.div>
          </div>
        )}

        {/* Step title for steps 2-4 */}
        {phase === 'wizard' && wizardStep > 1 && (
          <div className="max-w-4xl mx-auto px-3 sm:px-4 pt-4 pb-0">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-xs text-gray-400"
            >
              <span className="px-2 py-0.5 rounded-md bg-violet-50 text-violet-600 font-semibold">
                {t('step')} {wizardStep} {t('of')} 4
              </span>
              <span>{getStepLabel(wizardStep - 1)}</span>
            </motion.div>
          </div>
        )}

        {/* Wizard steps — wrapped in glass card */}
        {phase === 'wizard' && (
          <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={wizardStep}
                initial={{ opacity: 0, x: wizardStep > prevStep ? 40 : -40, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: wizardStep > prevStep ? -40 : 40, scale: 0.98 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6"
              >
                {wizardStep === 1 && (
                  <Step1Address
                    data={step1Data}
                    onChange={setStep1Data}
                    onNext={() => setWizardStep(2)}
                    uploadEndpoint="/api/public/demo-upload"
                    onAirbnbImport={handleAirbnbImport}
                    airbnbImport={airbnbImport}
                  />
                )}

                {wizardStep === 2 && (
                  <Step2Details
                    data={step2Data}
                    onChange={setStep2Data}
                    onNext={() => setWizardStep(3)}
                    onBack={() => setWizardStep(1)}
                    hasParking={step1Data.hasParking}
                  />
                )}

                {wizardStep === 3 && (
                  <Step3Media
                    media={media}
                    onMediaChange={setMedia}
                    onNext={() => setWizardStep(4)}
                    onBack={() => setWizardStep(2)}
                    uploadEndpoint="/api/public/demo-upload"
                    clientUpload={true}
                  />
                )}

                {wizardStep === 4 && (
                  <Step4Review
                    step1Data={step1Data}
                    step2Data={step2Data}
                    media={media}
                    locationData={locationData}
                    locationDataLoading={locationDataLoading}
                    disabledZones={disabledZones}
                    onDisabledZonesChange={setDisabledZones}
                    reviewedContent={reviewedContent}
                    onReviewedContentChange={setReviewedContent}
                    customTitles={customTitles}
                    onCustomTitlesChange={setCustomTitles}
                    customIcons={customIcons}
                    onCustomIconsChange={setCustomIcons}
                    onNext={() => setPhase('lead-capture')}
                    onBack={() => setWizardStep(3)}
                    demoMode={true}
                    demoPlaces={demoPlaces}
                    onDemoPlacesChange={setDemoPlaces}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* Lead capture modal — glassmorphism, 2-step: info → verify */}
        <AnimatePresence>
          {phase === 'lead-capture' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.85, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.85, opacity: 0, y: 30 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="relative w-full max-w-md overflow-hidden"
              >
                {/* Card */}
                <div className="relative bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">

                  {/* Close button */}
                  <button
                    type="button"
                    onClick={() => {
                      setPhase('wizard')
                      setLeadCaptureStep('info')
                      setOtpError(null)
                      setOtpDigits(['', '', '', '', '', ''])
                      setEmailVerificationToken(null)
                    }}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <AnimatePresence mode="wait">
                    {/* ========== SUB-STEP: INFO ========== */}
                    {leadCaptureStep === 'info' && (
                      <motion.div
                        key="lead-info"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-6"
                      >
                        <div className="relative text-center space-y-3">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', damping: 12, delay: 0.1 }}
                            className="relative w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto border border-violet-200"
                          >
                            <Gift className="w-8 h-8 text-violet-500" />
                            <motion.div
                              className="absolute inset-0 rounded-2xl bg-violet-500/20 blur-xl"
                              animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          </motion.div>
                          <h2 className="text-xl font-bold text-gray-900">{t('leadTitle')}</h2>
                          <p className="text-sm text-gray-500">{t('leadSubtitle')}</p>
                        </div>

                        {/* Error */}
                        {(error || otpError) && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-200"
                          >
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-600">{error || otpError}</p>
                          </motion.div>
                        )}

                        <form
                          onSubmit={(e) => { e.preventDefault(); handleSendOtp() }}
                          className="relative space-y-4"
                        >
                          <div className="relative group">
                            <User className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500 group-focus-within:text-violet-500 transition-colors" />
                            <input
                              type="text"
                              required
                              value={leadData.name}
                              onChange={(e) => setLeadData(prev => ({ ...prev, name: e.target.value }))}
                              placeholder={t('leadName')}
                              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 focus:bg-white transition-all"
                            />
                          </div>

                          <div className="relative group">
                            <Mail className={`absolute left-3.5 top-3.5 w-4 h-4 transition-colors ${emailError ? 'text-red-400' : 'text-gray-500 group-focus-within:text-violet-500'}`} />
                            <input
                              type="email"
                              required
                              value={leadData.email}
                              onChange={(e) => {
                                setLeadData(prev => ({ ...prev, email: e.target.value }))
                                if (emailError) setEmailError(null)
                              }}
                              onBlur={(e) => validateEmailField(e.target.value)}
                              placeholder={t('leadEmail')}
                              className={`w-full pl-11 pr-4 py-3 bg-gray-50 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:bg-white transition-all ${emailError ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-violet-500 focus:ring-violet-100'}`}
                            />
                            {emailError && (
                              <p className="mt-1.5 text-xs text-red-400 pl-1">{emailError}</p>
                            )}
                          </div>

                          <div className="relative group">
                            <Phone className={`absolute left-3.5 top-3.5 w-4 h-4 transition-colors ${phoneError ? 'text-red-400' : 'text-gray-500 group-focus-within:text-violet-500'}`} />
                            <input
                              type="tel"
                              required
                              value={leadData.phone}
                              onChange={(e) => {
                                setLeadData(prev => ({ ...prev, phone: e.target.value }))
                                if (phoneError) setPhoneError(null)
                              }}
                              placeholder={t('leadPhone')}
                              className={`w-full pl-11 pr-4 py-3 bg-gray-50 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:bg-white transition-all ${phoneError ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-violet-500 focus:ring-violet-100'}`}
                            />
                            {phoneError && (
                              <p className="mt-1.5 text-xs text-red-400 pl-1">{phoneError}</p>
                            )}
                          </div>

                          <div className="flex justify-center">
                            <Turnstile
                              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
                              onSuccess={setTurnstileToken}
                              options={{ theme: 'light', size: 'normal' }}
                            />
                          </div>

                          {/* Scarcity + Discount badges */}
                          <div className="space-y-2">
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 }}
                              className="flex items-center justify-center gap-2 text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-lg py-2"
                            >
                              <Flame className="w-3.5 h-3.5" />
                              <span className="font-semibold">{t('onlyXLeft')} {spotsTotal - spotsUsed} {t('spots')}</span>
                              <span className="text-orange-400">·</span>
                              <span className="font-mono text-orange-600">{spotsUsed}/{spotsTotal}</span>
                            </motion.div>

                            <div className="flex items-center justify-center gap-2 text-xs text-violet-700 bg-violet-50 border border-violet-200 rounded-lg py-2.5">
                              <Gift className="w-3.5 h-3.5" />
                              {t('discount')}
                            </div>
                          </div>

                          {/* Send OTP button */}
                          <button
                            type="submit"
                            disabled={!leadData.name || !leadData.email || !leadData.phone || !!emailError || !!phoneError || otpSending}
                            className="relative w-full h-13 py-3.5 rounded-xl text-base font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white shadow-xl shadow-violet-500/20 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] overflow-hidden group"
                          >
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            {otpSending ? (
                              <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                            ) : (
                              <Mail className="w-5 h-5 relative z-10" />
                            )}
                            <span className="relative z-10">
                              {otpSending ? 'Enviando...' : 'Enviar código de verificación'}
                            </span>
                          </button>
                        </form>
                      </motion.div>
                    )}

                    {/* ========== SUB-STEP: VERIFY OTP — Tesla-grade ========== */}
                    {leadCaptureStep === 'verify' && (
                      <motion.div
                        key="lead-verify"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-8"
                      >
                        {/* Header — minimal, clean */}
                        <div className="relative text-center space-y-4">
                          {/* Animated shield icon */}
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', damping: 14, stiffness: 200, delay: 0.1 }}
                            className="relative w-20 h-20 mx-auto"
                          >
                            {/* Outer ring pulse */}
                            <motion.div
                              className="absolute inset-0 rounded-full border border-violet-500/30"
                              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
                              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                            />
                            {/* Inner glow */}
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 blur-xl" />
                            {/* Icon container */}
                            <div className="relative w-full h-full rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                              <Shield className="w-9 h-9 text-violet-500" />
                            </div>
                          </motion.div>

                          <div className="space-y-2">
                            <motion.h2
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                              className="text-xl font-bold text-gray-900 tracking-tight"
                            >
                              Verificación
                            </motion.h2>
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.3 }}
                              className="text-sm text-gray-500"
                            >
                              Código enviado a
                            </motion.p>
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.35 }}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-50 border border-violet-200"
                            >
                              <Mail className="w-3.5 h-3.5 text-violet-500" />
                              <span className="text-sm font-medium text-violet-700">{leadData.email}</span>
                            </motion.div>
                          </div>
                        </div>

                        {/* OTP Error */}
                        {otpError && (
                          <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-200"
                          >
                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-600">{otpError}</p>
                          </motion.div>
                        )}

                        {/* 6-digit OTP input grid */}
                        <motion.div
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.25 }}
                        >
                          <div className="flex justify-center gap-2.5 sm:gap-3">
                            {otpDigits.map((digit, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + i * 0.05 }}
                                className="relative"
                              >
                                {/* Glow under focused/filled digit */}
                                {(otpFocusedIndex === i || digit) && (
                                  <motion.div
                                    layoutId={otpFocusedIndex === i ? 'otp-glow' : undefined}
                                    className="absolute -inset-1 rounded-2xl bg-violet-500/15 blur-md"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: digit ? 0.6 : 0.4 }}
                                    transition={{ duration: 0.2 }}
                                  />
                                )}
                                <input
                                  ref={(el) => { otpInputRefs.current[i] = el }}
                                  type="text"
                                  inputMode="numeric"
                                  autoComplete={i === 0 ? 'one-time-code' : 'off'}
                                  maxLength={i === 0 ? 6 : 1}
                                  value={digit}
                                  onChange={(e) => handleOtpDigitChange(i, e.target.value)}
                                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                  onFocus={() => setOtpFocusedIndex(i)}
                                  onBlur={() => setOtpFocusedIndex(-1)}
                                  className={`relative z-10 w-11 h-14 sm:w-13 sm:h-16 text-center text-xl sm:text-2xl font-semibold rounded-xl bg-gray-50 border transition-all duration-200 outline-none text-gray-900 caret-violet-500 ${
                                    digit
                                      ? 'border-violet-500 bg-white'
                                      : otpFocusedIndex === i
                                      ? 'border-violet-500 ring-2 ring-violet-100 bg-white'
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                />
                                {/* Bottom accent line for filled digits */}
                                {digit && (
                                  <motion.div
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                                  />
                                )}
                              </motion.div>
                            ))}
                          </div>

                          {/* Subtle timer hint */}
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="text-center text-xs text-gray-400 mt-4"
                          >
                            El código expira en 10 minutos
                          </motion.p>
                        </motion.div>

                        {/* Verifying state overlay */}
                        {otpVerifying && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center justify-center gap-3 py-2"
                          >
                            <motion.div
                              className="w-5 h-5 rounded-full border-2 border-violet-500/30 border-t-violet-500"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                            />
                            <span className="text-sm text-gray-500">Verificando...</span>
                          </motion.div>
                        )}

                        {/* Action links — clean, minimal */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="flex items-center justify-between pt-2"
                        >
                          <button
                            type="button"
                            disabled={otpResendCooldown > 0 || otpSending}
                            onClick={() => {
                              setOtpError(null)
                              setOtpDigits(['', '', '', '', '', ''])
                              handleSendOtp()
                            }}
                            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-violet-400 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed group"
                          >
                            <RotateCcw className={`w-3 h-3 ${otpSending ? 'animate-spin' : 'group-hover:rotate-[-45deg] transition-transform'}`} />
                            {otpResendCooldown > 0 ? (
                              <span className="font-mono tabular-nums">{otpResendCooldown}s</span>
                            ) : (
                              <span>Reenviar</span>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setLeadCaptureStep('info')
                              setOtpDigits(['', '', '', '', '', ''])
                              setOtpError(null)
                              setEmailVerificationToken(null)
                            }}
                            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-violet-400 transition-all duration-200"
                          >
                            <ArrowLeft className="w-3 h-3" />
                            <span>Cambiar email</span>
                          </button>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generating screen — cinematic */}
        {phase === 'generating' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white">
            <AnimatedOrbs />
            <div className="relative z-10 text-center space-y-10 max-w-md">
              {/* Animated concentric rings */}
              <div className="relative mx-auto w-32 h-32">
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-violet-400/50"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-2 rounded-full border-2 border-purple-400/50"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                />
                <motion.div
                  className="absolute inset-4 rounded-full border-2 border-fuchsia-400/50"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                />
                {/* Spinning gradient ring */}
                <motion.div
                  className="absolute inset-3 rounded-full"
                  style={{
                    background: 'conic-gradient(from 0deg, transparent, #8b5cf6, #a855f7, #d946ef, transparent)',
                    WebkitMaskImage: 'radial-gradient(transparent 60%, black 62%, black 70%, transparent 72%)',
                    maskImage: 'radial-gradient(transparent 60%, black 62%, black 70%, transparent 72%)',
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Sparkles className="w-10 h-10 text-violet-500" />
                  </motion.div>
                </div>
              </div>

              <div className="space-y-3">
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-bold text-gray-900"
                >
                  {t('generating')}
                </motion.h2>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={loadingMessageIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-gray-600 text-lg"
                  >
                    {(loadingMsg as any)[lang] || loadingMsg.es}
                  </motion.p>
                </AnimatePresence>
                <p className="text-xs text-gray-400">{t('generatingSubtitle')}</p>
              </div>

              {/* Animated progress bar */}
              <div className="max-w-xs mx-auto">
                <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500"
                    initial={{ width: '5%' }}
                    animate={{ width: `${Math.min(95, (loadingMessageIndex + 1) / LOADING_MESSAGES.length * 100)}%` }}
                    transition={{ duration: 2.5, ease: 'easeOut' }}
                  />
                  <motion.div
                    className="absolute top-0 left-0 h-full w-24 rounded-full"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }}
                    animate={{ left: ['-20%', '120%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results WOW screen */}
        {phase === 'results' && result && (
          <>
            <DemoResultsScreen
              propertyName={step1Data.propertyName}
              zonesCount={generatedZonesCount}
              onExplore={() => {
                const params = new URLSearchParams({
                  demo: '1',
                  coupon: result.couponCode,
                  expires: result.expiresAt,
                  email: leadData.email,
                  name: leadData.name,
                })
                router.push(`/guide/${result.propertyId}?${params.toString()}`)
              }}
              onShare={() => setShowDemoShareModal(true)}
            />
            <DemoShareModal
              isOpen={showDemoShareModal}
              onClose={() => setShowDemoShareModal(false)}
              propertyName={step1Data.propertyName}
              shareUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/guide/${result.propertyId}`}
            />
          </>
        )}
      </div>
    </div>
  )
}

// ============================================
// WRAPPER WITH I18N PROVIDER
// ============================================

export default function DemoPage() {
  return (
    <I18nProvider>
      <DemoPageInner />
    </I18nProvider>
  )
}
