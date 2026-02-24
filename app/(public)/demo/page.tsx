'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, ArrowLeft, Loader2, CheckCircle, ChevronRight,
  User, Mail, Phone, Gift, AlertCircle, X, Zap, Star, Shield,
  MessageCircle, Users, Flame,
} from 'lucide-react'
import { Turnstile } from '@marsidev/react-turnstile'
import { I18nProvider } from '../../../src/providers/I18nProvider'
import Step1Address, { type Step1Data } from '../../(dashboard)/ai-setup/components/Step1Address'
import Step2Details, { type Step2Data } from '../../(dashboard)/ai-setup/components/Step2Details'
import Step3Media, { type MediaItem } from '../../(dashboard)/ai-setup/components/Step2Media'
import Step4Review, { type LocationData } from '../../(dashboard)/ai-setup/components/Step4Review'

// ============================================
// TYPES
// ============================================

type Phase = 'wizard' | 'lead-capture' | 'generating' | 'redirect'

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
      {/* Main gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-950/40 via-gray-950 to-gray-950" />

      {/* Animated orbs */}
      <motion.div
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -80, 60, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-violet-600/[0.07] blur-[100px]"
      />
      <motion.div
        animate={{
          x: [0, -120, 80, 0],
          y: [0, 60, -40, 0],
          scale: [1, 0.8, 1.3, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 -right-32 w-[600px] h-[600px] rounded-full bg-purple-600/[0.06] blur-[120px]"
      />
      <motion.div
        animate={{
          x: [0, 60, -80, 0],
          y: [0, -60, 80, 0],
          scale: [1, 1.1, 0.85, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-20 left-1/4 w-[400px] h-[400px] rounded-full bg-fuchsia-600/[0.05] blur-[100px]"
      />
      <motion.div
        animate={{
          x: [0, -40, 60, 0],
          y: [0, 40, -60, 0],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/2 w-[300px] h-[300px] rounded-full bg-indigo-500/[0.04] blur-[80px]"
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating sparkle particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [-20, 20, -20],
            opacity: [0.2, 0.6, 0.2],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 3 + i * 0.7,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.5,
          }}
          className="absolute w-1 h-1 rounded-full bg-violet-400"
          style={{
            left: `${15 + i * 14}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
        />
      ))}
    </div>
  )
}

// ============================================
// PROGRESS BAR
// ============================================

function ProgressBar({ step, total }: { step: number; total: number }) {
  const progress = ((step - 1) / (total - 1)) * 100

  return (
    <div className="relative w-full h-1.5 bg-gray-800/50 rounded-full overflow-hidden">
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
  return localStorage.getItem('itineramio-language') || navigator.language?.split('-')[0] || 'es'
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
    leadPhone: 'Telefono (opcional)',
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
    leadPhone: 'Phone (optional)',
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
    leadPhone: 'Telephone (optionnel)',
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
// DEMO PAGE COMPONENT
// ============================================

function DemoPageInner() {
  const router = useRouter()

  // Phase & step state
  const [phase, setPhase] = useState<Phase>('wizard')
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
  const [media, setMedia] = useState<MediaItem[]>([])
  const [locationData, setLocationData] = useState<LocationData | null>(null)
  const [locationDataLoading, setLocationDataLoading] = useState(false)
  const [disabledZones, setDisabledZones] = useState<Set<string>>(new Set())
  const [reviewedContent, setReviewedContent] = useState<Record<string, string>>({})
  const [customTitles, setCustomTitles] = useState<Record<string, string>>({})
  const [customIcons, setCustomIcons] = useState<Record<string, string>>({})

  // Lead data
  const [leadData, setLeadData] = useState<LeadData>({ name: '', email: '', phone: '' })
  const [turnstileToken, setTurnstileToken] = useState('')

  // Spots / scarcity
  const [spotsUsed, setSpotsUsed] = useState(249)
  const [spotsTotal] = useState(500)

  // Generation state
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<DemoResult | null>(null)

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
      .catch(err => console.error('[demo] Failed to fetch location data:', err))
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

  // Generate the demo
  const handleGenerate = useCallback(async () => {
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
          mediaAnalysis: media.filter(m => m.analysis).map(m => ({
            category: m.category,
            analysis: m.analysis,
          })),
          disabledZones: [...disabledZones],
          reviewedContent,
          customTitles,
          customIcons,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error || 'Error al generar el demo')
        setPhase('lead-capture')
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

      setPhase('redirect')
      setConfettiBurst(prev => prev + 1)
      const params = new URLSearchParams({
        demo: '1',
        coupon: data.couponCode,
        expires: data.expiresAt,
        email: leadData.email,
        name: leadData.name,
      })
      setTimeout(() => {
        router.push(`/guide/${data.propertyId}?${params.toString()}`)
      }, 1500)
    } catch (err) {
      console.error('[demo] Generation error:', err)
      setError(err instanceof Error ? err.message : 'Error de conexion')
      setPhase('lead-capture')
    }
  }, [leadData, turnstileToken, step1Data, media, disabledZones, reviewedContent, customTitles, customIcons, router])

  const lang = typeof window !== 'undefined' ? getLang() : 'es'
  const loadingMsg = LOADING_MESSAGES[loadingMessageIndex]

  return (
    <div className="min-h-screen bg-gray-950 relative">
      {/* Animated background */}
      <AnimatedOrbs />

      {/* Confetti */}
      <ConfettiBurst active={confettiBurst > 0} key={confettiBurst} />

      {/* Content */}
      <div className="relative z-10">
        {/* Top bar — glassmorphism */}
        <div className="sticky top-0 z-40 border-b border-white/[0.06] bg-gray-950/60 backdrop-blur-2xl">
          <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={() => {
                  if (phase !== 'wizard') return
                  if (wizardStep > 1) setWizardStep(wizardStep - 1)
                  else window.location.href = '/'
                }}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              </button>

              {/* Logo */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                  <motion.div
                    className="absolute inset-0 rounded-full bg-violet-400/30 blur-md"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.2, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <span className="text-white font-bold text-sm sm:text-base tracking-tight">itineramio</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-violet-300 border border-violet-500/20">DEMO</span>
              </div>

              {/* Step counter */}
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
                            ? 'bg-violet-500/20 text-violet-400'
                            : 'bg-gray-800/80 text-gray-600'
                        }`}>
                          {step < wizardStep ? (
                            <CheckCircle className="w-3.5 h-3.5" />
                          ) : step}
                        </div>
                      </motion.div>
                      {step < 4 && (
                        <div className={`w-3 sm:w-4 h-px transition-colors duration-500 ${
                          step < wizardStep ? 'bg-violet-500/50' : 'bg-gray-800'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {phase !== 'wizard' && <div />}
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
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium">
                  <Zap className="w-3 h-3" />
                  {t('badge1')}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
                  <Gift className="w-3 h-3" />
                  {t('badge2')}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium">
                  <MessageCircle className="w-3 h-3" />
                  {t('badge3')}
                </span>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl sm:text-4xl font-extrabold text-white leading-tight"
              >
                {t('heroTitle')}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gray-400 text-sm sm:text-base max-w-lg mx-auto"
              >
                {t('heroSubtitle')}
              </motion.p>

              {/* Limited spots counter */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20"
              >
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-bold text-orange-300">{t('limitedOffer')}</span>
                </div>
                <div className="h-4 w-px bg-orange-500/30" />
                <div className="flex items-center gap-2">
                  {/* Mini progress bar */}
                  <div className="w-20 h-1.5 rounded-full bg-gray-800 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500"
                      initial={{ width: '0%' }}
                      animate={{ width: `${(spotsUsed / spotsTotal) * 100}%` }}
                      transition={{ duration: 1.5, delay: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-orange-200">
                    {spotsUsed}/{spotsTotal}
                  </span>
                </div>
              </motion.div>

              {/* Trust line */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-gray-600 text-xs flex items-center justify-center gap-2"
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
              className="flex items-center gap-2 text-xs text-gray-500"
            >
              <span className="px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-400 font-semibold">
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
              >
                {wizardStep === 1 && (
                  <Step1Address
                    data={step1Data}
                    onChange={setStep1Data}
                    onNext={() => setWizardStep(2)}
                  />
                )}

                {wizardStep === 2 && (
                  <Step2Details
                    data={step2Data}
                    onChange={setStep2Data}
                    onNext={() => setWizardStep(3)}
                    onBack={() => setWizardStep(1)}
                    checkInMethod={step1Data.checkInMethod}
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
                    analyzeEndpoint="/api/public/demo-analyze-media"
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
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* Lead capture modal — glassmorphism */}
        <AnimatePresence>
          {phase === 'lead-capture' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl"
            >
              <motion.div
                initial={{ scale: 0.85, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.85, opacity: 0, y: 30 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="relative w-full max-w-md overflow-hidden"
              >
                {/* Glass card */}
                <div className="relative bg-gray-900/80 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl shadow-violet-500/10">
                  {/* Glow accent */}
                  <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 rounded-full bg-violet-500/10 blur-[80px] pointer-events-none" />

                  {/* Close button */}
                  <button
                    type="button"
                    onClick={() => setPhase('wizard')}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors z-10"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="relative text-center space-y-3">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 12, delay: 0.1 }}
                      className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mx-auto border border-violet-500/20"
                    >
                      <Gift className="w-8 h-8 text-violet-400" />
                      <motion.div
                        className="absolute inset-0 rounded-2xl bg-violet-500/20 blur-xl"
                        animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </motion.div>
                    <h2 className="text-xl font-bold text-white">{t('leadTitle')}</h2>
                    <p className="text-sm text-gray-400">{t('leadSubtitle')}</p>
                  </div>

                  {/* Error */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20"
                    >
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-300">{error}</p>
                    </motion.div>
                  )}

                  <form
                    onSubmit={(e) => { e.preventDefault(); handleGenerate() }}
                    className="relative space-y-4"
                  >
                    <div className="relative group">
                      <User className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500 group-focus-within:text-violet-400 transition-colors" />
                      <input
                        type="text"
                        required
                        value={leadData.name}
                        onChange={(e) => setLeadData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder={t('leadName')}
                        className="w-full pl-11 pr-4 py-3 bg-gray-800/50 border border-white/[0.06] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/10 focus:bg-gray-800/70 transition-all"
                      />
                    </div>

                    <div className="relative group">
                      <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500 group-focus-within:text-violet-400 transition-colors" />
                      <input
                        type="email"
                        required
                        value={leadData.email}
                        onChange={(e) => setLeadData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder={t('leadEmail')}
                        className="w-full pl-11 pr-4 py-3 bg-gray-800/50 border border-white/[0.06] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/10 focus:bg-gray-800/70 transition-all"
                      />
                    </div>

                    <div className="relative group">
                      <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500 group-focus-within:text-violet-400 transition-colors" />
                      <input
                        type="tel"
                        value={leadData.phone}
                        onChange={(e) => setLeadData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder={t('leadPhone')}
                        className="w-full pl-11 pr-4 py-3 bg-gray-800/50 border border-white/[0.06] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/10 focus:bg-gray-800/70 transition-all"
                      />
                    </div>

                    <div className="flex justify-center">
                      <Turnstile
                        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
                        onSuccess={setTurnstileToken}
                        options={{ theme: 'dark', size: 'normal' }}
                      />
                    </div>

                    {/* Scarcity + Discount badges */}
                    <div className="space-y-2">
                      {/* Spots remaining alert */}
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center justify-center gap-2 text-xs text-orange-300 bg-orange-500/10 border border-orange-500/20 rounded-lg py-2"
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span className="font-semibold">{t('onlyXLeft')} {spotsTotal - spotsUsed} {t('spots')}</span>
                        <span className="text-orange-400/60">·</span>
                        <span className="font-mono text-orange-400">{spotsUsed}/{spotsTotal}</span>
                      </motion.div>

                      {/* Discount badge */}
                      <div className="flex items-center justify-center gap-2 text-xs text-violet-300 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/10 rounded-lg py-2.5">
                        <Gift className="w-3.5 h-3.5" />
                        {t('discount')}
                      </div>
                    </div>

                    {/* Submit button with shimmer */}
                    <button
                      type="submit"
                      disabled={!leadData.name || !leadData.email}
                      className="relative w-full h-13 py-3.5 rounded-xl text-base font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white shadow-xl shadow-violet-500/20 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] overflow-hidden group"
                    >
                      {/* Shimmer */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                      <Sparkles className="w-5 h-5 relative z-10" />
                      <span className="relative z-10">{t('generateNow')}</span>
                    </button>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generating screen — cinematic */}
        {phase === 'generating' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950">
            <AnimatedOrbs />
            <div className="relative z-10 text-center space-y-10 max-w-md">
              {/* Animated concentric rings */}
              <div className="relative mx-auto w-32 h-32">
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-violet-500/20"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-2 rounded-full border-2 border-purple-500/20"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                />
                <motion.div
                  className="absolute inset-4 rounded-full border-2 border-fuchsia-500/20"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0, 0.4] }}
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
                    <Sparkles className="w-10 h-10 text-violet-400" />
                  </motion.div>
                </div>
              </div>

              <div className="space-y-3">
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-bold text-white"
                >
                  {t('generating')}
                </motion.h2>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={loadingMessageIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-gray-400 text-lg"
                  >
                    {(loadingMsg as any)[lang] || loadingMsg.es}
                  </motion.p>
                </AnimatePresence>
                <p className="text-xs text-gray-600">{t('generatingSubtitle')}</p>
              </div>

              {/* Animated progress bar */}
              <div className="max-w-xs mx-auto">
                <div className="relative w-full h-2 bg-gray-800/50 rounded-full overflow-hidden">
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

        {/* Redirect screen */}
        {phase === 'redirect' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950">
            <AnimatedOrbs />
            <div className="relative z-10 text-center space-y-8 max-w-md">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                className="relative"
              >
                <CheckCircle className="w-20 h-20 text-emerald-400 mx-auto" />
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ scale: 1 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  transition={{ duration: 1 }}
                >
                  <div className="w-20 h-20 rounded-full border-2 border-emerald-400" />
                </motion.div>
              </motion.div>
              <div className="space-y-3">
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-white"
                >
                  {t('redirecting')}
                </motion.h2>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Loader2 className="w-6 h-6 text-violet-400 animate-spin mx-auto" />
                </motion.div>
              </div>
            </div>
          </div>
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
