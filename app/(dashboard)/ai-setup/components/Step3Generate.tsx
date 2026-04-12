'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  CheckCircle,
  Globe,
  QrCode,
  Clock,
  Layers,
  AlertCircle,
  ArrowRight,
  Loader2,
  Crown,
  MapPin,
  Heart,
  Share2,
  Languages,
  Smartphone,
  Star,
  Key,
  LogOut,
  Wifi,
  ScrollText,
  Car,
  Snowflake,
  Coffee,
  Flame,
  Tv,
  Wind,
  Thermometer,
  Lock,
  Waves,
  Umbrella,
  TreePine,
  Bath,
  Shirt,
  Utensils,
  Home,
  Phone,
  Recycle,
  Wrench,
  Bike,
  ShowerHead,
  Bed,
  Sofa,
  type LucideIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { PREDEFINED_ZONES, type MediaItem } from './Step2Media'

// ── Slides para mostrar durante la generación ──
const CONCEPT_SLIDES = [
  {
    icon: Languages,
    color: 'from-violet-500 to-purple-600',
    title: 'Traduciendo a 3 idiomas',
    subtitle: 'Español · English · Français',
    detail: 'Cada zona quedará perfecta para huéspedes de todo el mundo',
  },
  {
    icon: QrCode,
    color: 'from-blue-500 to-indigo-600',
    title: 'Generando QR únicos',
    subtitle: 'Un código por zona',
    detail: 'Tus huéspedes escanean y ven las instrucciones al instante',
  },
  {
    icon: Smartphone,
    color: 'from-emerald-500 to-teal-600',
    title: 'Manual listo para móvil',
    subtitle: 'Optimizado para cualquier dispositivo',
    detail: 'Sin apps, sin descargas — funciona desde el navegador',
  },
  {
    icon: Star,
    color: 'from-amber-500 to-orange-500',
    title: 'Instrucciones profesionales',
    subtitle: 'Generadas con IA',
    detail: 'Claras, estructuradas y listas para compartir',
  },
]

interface ZoneEvent {
  name: string
  icon: string
  description: string
  stepsCount: number
}

interface GenerationStats {
  zones: number
  steps: number
  languages: number
  time: number
}

interface Step3GenerateProps {
  propertyData: any
  mediaAnalysis: MediaItem[]
  onComplete?: () => void
  onBack?: () => void
}

// Map icon names to Lucide icon components — Airbnb-style (vector, neutral)
const ZONE_ICON_MAP: Record<string, LucideIcon> = {
  'key': Key,
  'log-out': LogOut,
  'wifi': Wifi,
  'map-pin': MapPin,
  'scroll-text': ScrollText,
  'car': Car,
  'snowflake': Snowflake,
  'coffee': Coffee,
  'flame': Flame,
  'tv': Tv,
  'wind': Wind,
  'thermometer': Thermometer,
  'lock': Lock,
  'waves': Waves,
  'umbrella': Umbrella,
  'trees': TreePine,
  'tree-pine': TreePine,
  'bath': Bath,
  'shirt': Shirt,
  'utensils': Utensils,
  'utensils-crossed': Utensils,
  'home': Home,
  'phone': Phone,
  'recycle': Recycle,
  'wrench': Wrench,
  'bike': Bike,
  'shower': ShowerHead,
  'shower-head': ShowerHead,
  'bed': Bed,
  'sofa': Sofa,
  'globe': Globe,
  'star': Star,
  'heart': Heart,
  'qr-code': QrCode,
}

function ZoneCardIcon({ iconName }: { iconName: string }) {
  const Icon = ZONE_ICON_MAP[iconName]
  if (!Icon) return <MapPin className="w-4 h-4 text-gray-500" />
  return <Icon className="w-4 h-4 text-gray-600" />
}

export default function Step3Generate({ propertyData, mediaAnalysis, onComplete, onBack }: Step3GenerateProps) {
  const router = useRouter()
  const { t } = useTranslation('ai-setup')
  const [confirmed, setConfirmed] = useState(false)
  const [status, setStatus] = useState(() => t('step5.preparing'))
  const [zones, setZones] = useState<ZoneEvent[]>([])
  const [translations, setTranslations] = useState<Record<string, number>>({})
  const [stats, setStats] = useState<GenerationStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [upgradeRequired, setUpgradeRequired] = useState(false)
  const [propertyId, setPropertyId] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [retryCount, setRetryCount] = useState(0)
  const [slideIndex, setSlideIndex] = useState(0)
  const startTimeRef = useRef(Date.now())
  const scrollRef = useRef<HTMLDivElement>(null)
  const onCompleteRef = useRef(onComplete)

  // Build all slides: user photos first, then concept slides
  const userPhotoUrls = useMemo(
    () => mediaAnalysis.filter(m => m.type === 'image' && m.url).map(m => m.url),
    [mediaAnalysis],
  )
  const allSlides = useMemo(() => {
    type PhotoSlide = { type: 'photo'; url: string }
    type ConceptSlide = (typeof CONCEPT_SLIDES)[number] & { type: 'concept' }
    const photoSlides: PhotoSlide[] = userPhotoUrls.map(url => ({ type: 'photo', url }))
    const conceptSlides: ConceptSlide[] = CONCEPT_SLIDES.map(s => ({ type: 'concept', ...s }))
    // Interleave: concept, photo, concept, photo...
    const result: Array<PhotoSlide | ConceptSlide> = []
    const maxLen = Math.max(conceptSlides.length, photoSlides.length)
    for (let i = 0; i < maxLen; i++) {
      if (conceptSlides[i]) result.push(conceptSlides[i])
      if (photoSlides[i]) result.push(photoSlides[i])
    }
    return result.length > 0 ? result : conceptSlides
  }, [userPhotoUrls])
  onCompleteRef.current = onComplete

  // Compute user zones from media for the confirmation modal
  const userZoneNames = useMemo(() => {
    const zoneNames = new Set<string>()
    for (const item of mediaAnalysis) {
      if (item.zoneId) {
        const zone = PREDEFINED_ZONES.find(z => z.id === item.zoneId)
        if (zone) zoneNames.add(zone.name)
      } else if (item.customZoneName?.trim()) {
        zoneNames.add(item.customZoneName.trim())
      }
    }
    return Array.from(zoneNames)
  }, [mediaAnalysis])

  // Elapsed time counter
  useEffect(() => {
    if (!confirmed || stats) return
    const interval = setInterval(() => {
      setElapsed(Math.round((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [confirmed, stats])

  // Slider auto-advance during generation
  useEffect(() => {
    if (!confirmed || stats || error) return
    const interval = setInterval(() => {
      setSlideIndex(i => (i + 1) % allSlides.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [confirmed, stats, error, allSlides.length])

  // Auto-scroll to latest zone
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [zones])

  // Start generation only after confirmation
  useEffect(() => {
    if (!confirmed) return

    const controller = new AbortController()
    const TIMEOUT_MS = 5 * 60 * 1000

    // Reset state on retry
    setStatus(t('step5.preparing'))
    setZones([])
    setTranslations({})
    setStats(null)
    setError(null)
    setUpgradeRequired(false)
    setPropertyId(null)
    setElapsed(0)
    startTimeRef.current = Date.now()

    const timeoutId = setTimeout(() => {
      controller.abort()
      setError(t('step5.timeoutError'))
    }, TIMEOUT_MS)

    const generate = async () => {
      try {
        const tokenCookie = document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))
        const token = tokenCookie ? tokenCookie.trim().split('=').slice(1).join('=') : undefined

        const response = await fetch('/api/ai-setup/generate-manual', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            propertyData,
            mediaAnalysis: mediaAnalysis,
          }),
          signal: controller.signal,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          if (response.status === 403 && errorData.upgradeRequired) {
            setUpgradeRequired(true)
            setError(errorData.error || t('step5.upgrade.title'))
            return
          }
          throw new Error(errorData.error || `Error ${response.status}`)
        }

        const reader = response.body?.getReader()
        if (!reader) throw new Error('No response stream')

        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })

          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue

            try {
              const event = JSON.parse(line.slice(6))

              switch (event.type) {
                case 'status':
                  setStatus(event.message)
                  break
                case 'zone':
                  setZones(prev => [...prev, event.zone])
                  break
                case 'translation':
                  setTranslations(prev => ({
                    ...prev,
                    [event.language]: event.progress,
                  }))
                  break
                case 'complete':
                  setStats(event.stats)
                  break
                case 'property_id':
                  if (!event.propertyId) {
                    setError('Error: no se recibió ID de propiedad')
                    return
                  }
                  setPropertyId(event.propertyId)
                  onCompleteRef.current?.()
                  break
                case 'error':
                  setError(event.error)
                  break
              }
            } catch {
              // Skip malformed SSE events
            }
          }
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        setError(err instanceof Error ? err.message : t('step5.unknownError'))
      } finally {
        clearTimeout(timeoutId)
      }
    }

    generate()

    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [confirmed, retryCount]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Confirmation Modal ──
  if (!confirmed) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        {/* Card: flex column, max height = viewport - top bar - step bar - padding */}
        <div className="bg-white/80 border border-gray-200 rounded-2xl overflow-hidden backdrop-blur-xl flex flex-col max-h-[calc(100dvh-180px)]">
          {/* Header — fixed */}
          <div className="flex-shrink-0 px-6 pt-6 pb-4 text-center space-y-2 border-b border-gray-100">
            <div className="w-12 h-12 mx-auto rounded-full bg-violet-500/15 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-violet-500" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              {t('step5.confirmTitle')}
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm">
              {t('step5.confirmSubtitle')}
            </p>
          </div>

          {/* Content — scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            {/* Essential zones */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-100">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">{t('step5.essentialZones')}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t('step5.essentialZonesList')}</p>
              </div>
            </div>

            {/* User zones (from media) */}
            {userZoneNames.length > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-violet-50 border border-violet-100">
                <CheckCircle className="w-4 h-4 text-violet-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-violet-700">
                    {t('step5.userZones', { count: userZoneNames.length })}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{userZoneNames.join(', ')}</p>
                </div>
              </div>
            )}

            {/* Directions */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
              <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-700">{t('step5.directions')}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t('step5.directionsList')}</p>
              </div>
            </div>

            {/* AI actions — compact */}
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1.5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('step5.aiWillDo')}</p>
              <div className="space-y-1">
                {[
                  { Icon: Sparkles, text: t('step5.aiAction1') },
                  { Icon: Globe, text: t('step5.aiAction2') },
                  { Icon: MapPin, text: t('step5.aiAction3') },
                ].map(({ Icon, text }, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                    <Icon className="w-3 h-3 text-violet-400 flex-shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions — always visible at bottom */}
          <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="flex-1 h-12 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {t('step5.cancel')}
              </button>
            )}
            <button
              type="button"
              onClick={() => setConfirmed(true)}
              className="flex-1 h-12 rounded-xl text-sm sm:text-base font-semibold bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 shadow-md shadow-violet-500/20 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {t('step5.generate')}
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  // ── Generation Progress ──
  const isComplete = !!stats
  const totalSteps = zones.reduce((sum, z) => sum + z.stepsCount, 0)
  const currentSlide = allSlides[slideIndex % allSlides.length]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
        >
          {isComplete ? (
            <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
          ) : error ? (
            <div className="w-20 h-20 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
          ) : (
            <div className="w-20 h-20 mx-auto rounded-full bg-violet-500/20 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-violet-400 animate-pulse" />
            </div>
          )}
        </motion.div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {isComplete
              ? t('step5.complete')
              : error
              ? t('step5.error')
              : t('step5.creating')}
          </h2>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            {isComplete
              ? `${stats.zones} zonas · ${stats.steps} instrucciones · ES/EN/FR · ${stats.time}s`
              : error
              ? error
              : status}
          </p>
        </div>
      </div>

      {/* ── SLIDER durante generación ── */}
      {!isComplete && !error && (
        <AnimatePresence mode="wait">
          <motion.div
            key={slideIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl overflow-hidden h-32 sm:h-36 relative"
          >
            {currentSlide.type === 'photo' ? (
              <div className="w-full h-full relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentSlide.url}
                  alt="Tu alojamiento"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
                <div className="absolute inset-0 flex items-center px-5">
                  <div>
                    <p className="text-white text-sm font-semibold">Tu alojamiento</p>
                    <p className="text-white/70 text-xs mt-0.5">La IA está generando las instrucciones...</p>
                  </div>
                </div>
              </div>
            ) : (
              (() => {
                const ConceptIcon = currentSlide.icon
                return (
                  <div className={`w-full h-full bg-gradient-to-br ${currentSlide.color} flex items-center px-6 gap-4`}>
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                      <ConceptIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-bold text-sm leading-tight">{currentSlide.title}</p>
                      <p className="text-white/80 text-xs mt-0.5">{currentSlide.subtitle}</p>
                      <p className="text-white/60 text-[11px] mt-1 max-w-xs leading-snug">{currentSlide.detail}</p>
                    </div>
                    {/* Dots — right side */}
                    <div className="ml-auto flex flex-col gap-1">
                      {allSlides.map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 h-1 rounded-full transition-all ${i === slideIndex % allSlides.length ? 'bg-white' : 'bg-white/30'}`}
                        />
                      ))}
                    </div>
                  </div>
                )
              })()
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* ── Post-gen celebración ── */}
      {isComplete && propertyId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', damping: 20 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 sm:p-6 space-y-4"
        >
          {/* Stats celebración */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white/80 rounded-xl p-3">
              <p className="text-2xl font-bold text-violet-600">{stats?.zones}</p>
              <p className="text-xs text-gray-500 mt-0.5">zonas</p>
            </div>
            <div className="bg-white/80 rounded-xl p-3">
              <p className="text-2xl font-bold text-blue-600">3</p>
              <p className="text-xs text-gray-500 mt-0.5">idiomas</p>
            </div>
            <div className="bg-white/80 rounded-xl p-3">
              <p className="text-2xl font-bold text-green-600">{stats?.zones}</p>
              <p className="text-xs text-gray-500 mt-0.5">QR únicos</p>
            </div>
          </div>

          {/* Qué hacer ahora */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">¿Qué hacer ahora?</p>
            {[
              { icon: '✏️', text: 'Revisa y edita el contenido de cada zona' },
              { icon: '🔗', text: 'Comparte el enlace o QR con tu próximo huésped' },
              { icon: '📸', text: 'Añade más fotos para mejorar las instrucciones' },
            ].map((tip, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                <span>{tip.icon}</span>
                <span>{tip.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Progress stats bar */}
      {!isComplete && (
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <Globe className="w-4 h-4" />
            <span>ES ✓</span>
            <span>EN {translations.en !== undefined ? (translations.en >= 100 ? '✓' : '...') : ''}</span>
            <span>FR {translations.fr !== undefined ? (translations.fr >= 100 ? '✓' : '...') : ''}</span>
          </div>
          <div className="w-px h-4 bg-gray-200 hidden sm:block" />
          <div className="flex items-center gap-2 text-gray-500">
            <Layers className="w-4 h-4" />
            <span>{zones.length} {t('step5.zones')}</span>
          </div>
          <div className="w-px h-4 bg-gray-200 hidden sm:block" />
          <div className="flex items-center gap-2 text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{elapsed}s</span>
          </div>
        </div>
      )}

      {/* Zone cards */}
      <div
        ref={scrollRef}
        className="max-h-[40vh] overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
      >
        <AnimatePresence>
          {zones.map((zone, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300, delay: 0.03 }}
              className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                <ZoneCardIcon iconName={zone.icon} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-gray-900 font-medium truncate text-sm">{zone.name}</h3>
                <p className="text-gray-400 text-xs truncate">{zone.description}</p>
              </div>
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            </motion.div>
          ))}
        </AnimatePresence>

        {!isComplete && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-4 gap-3"
          >
            <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
            <span className="text-sm text-gray-400">{t('step5.generatingNext')}</span>
          </motion.div>
        )}
      </div>

      {/* CTAs post-generación */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: 'spring', damping: 20 }}
            className="space-y-3"
          >
            {propertyId ? (
              <>
                <button
                  type="button"
                  onClick={() => router.push(`/properties/${propertyId}/zones`)}
                  className="w-full h-14 rounded-xl text-base sm:text-lg font-semibold bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/25 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Ver mi manual
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/properties/${propertyId}/zones`)}
                  className="w-full h-11 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Compartir con huésped
                </button>
              </>
            ) : (
              <div className="w-full rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-center">
                <p className="text-red-600 text-sm font-medium">
                  {error || 'Error: no se recibió ID de propiedad'}
                </p>
                <button
                  type="button"
                  onClick={() => router.push('/properties')}
                  className="mt-3 w-full h-12 rounded-xl text-base font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  {t('step5.goToProperties')}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error retry / Upgrade prompt */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pt-4 space-y-4"
        >
          {upgradeRequired && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5 text-center space-y-3">
              <Crown className="w-8 h-8 text-amber-400 mx-auto" />
              <p className="text-amber-700 font-medium">{t('step5.upgrade.title')}</p>
              <p className="text-sm text-gray-500">{t('step5.upgrade.subtitle')}</p>
              <button
                type="button"
                onClick={() => router.push('/account/plans')}
                className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-amber-500/25 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Crown className="w-5 h-5" />
                {t('step5.upgrade.button')}
              </button>
            </div>
          )}
          <div className="flex gap-4">
            {!upgradeRequired && (
              <button
                type="button"
                onClick={() => setRetryCount(c => c + 1)}
                className="flex-1 h-14 rounded-xl text-lg font-semibold border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                {t('step5.retry')}
              </button>
            )}
            <button
              type="button"
              onClick={() => router.push('/properties')}
              className={`${upgradeRequired ? 'w-full' : 'flex-1'} h-14 rounded-xl text-lg font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2`}
            >
              {t('step5.backToProperties')}
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
