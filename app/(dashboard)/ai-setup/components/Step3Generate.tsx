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
  ListChecks,
  AlertCircle,
  ArrowRight,
  Loader2,
  Crown,
  MapPin,
  Heart,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { PREDEFINED_ZONES, type MediaItem } from './Step2Media'

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

// Map icon names to emojis
const iconMap: Record<string, string> = {
  'key': '🔑',
  'log-out': '🚪',
  'wifi': '📶',
  'map-pin': '📍',
  'scroll-text': '📜',
  'car': '🚗',
  'chef-hat': '👨‍🍳',
  'shopping-bag': '🛒',
  'utensils-crossed': '🍽️',
  'heart': '💊',
  'star': '⭐',
  'phone': '📞',
  'bus': '🚌',
  'waves': '🏊',
  'umbrella': '☂️',
  'droplets': '🚿',
  'bed': '🛏️',
  'sofa': '🛋️',
  'door-open': '🚪',
  'trees': '🌳',
  'shirt': '👕',
  'utensils': '🍴',
  'monitor': '💻',
  'dumbbell': '💪',
  'fence': '🏠',
  'home': '🏠',
  'thermometer': '🌡️',
  'snowflake': '❄️',
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
  const startTimeRef = useRef(Date.now())
  const scrollRef = useRef<HTMLDivElement>(null)
  const onCompleteRef = useRef(onComplete)
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
        console.error('[Step3] Generation error:', err)
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
        <div className="bg-white/80 border border-gray-200 rounded-2xl overflow-hidden backdrop-blur-xl">
          {/* Header */}
          <div className="p-6 sm:p-8 text-center space-y-3 border-b border-gray-200/50">
            <div className="w-16 h-16 mx-auto rounded-full bg-violet-500/20 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-violet-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {t('step5.confirmTitle')}
            </h2>
            <p className="text-gray-500 text-sm">
              {t('step5.confirmSubtitle')}
            </p>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8 space-y-4">
            {/* Essential zones */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/20">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-300">{t('step5.essentialZones')}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t('step5.essentialZonesList')}</p>
              </div>
            </div>

            {/* User zones (from media) */}
            {userZoneNames.length > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-violet-500/5 border border-violet-500/20">
                <CheckCircle className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-violet-700">
                    {t('step5.userZones', { count: userZoneNames.length })}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{userZoneNames.join(', ')}</p>
                </div>
              </div>
            )}

            {/* Nearby services */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/20">
              <Heart className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-700">{t('step5.nearbyServices')}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t('step5.nearbyServicesList')}</p>
              </div>
            </div>

            {/* Directions */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <MapPin className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-700">{t('step5.directions')}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t('step5.directionsList')}</p>
              </div>
            </div>

            {/* AI actions */}
            <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
              <p className="text-sm font-medium text-gray-600">{t('step5.aiWillDo')}</p>
              <ul className="space-y-1.5 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                  {t('step5.aiAction1')}
                </li>
                <li className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                  {t('step5.aiAction2')}
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                  {t('step5.aiAction3')}
                </li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 sm:p-8 pt-0 flex gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="flex-1 h-12 sm:h-14 rounded-xl text-base font-semibold border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                {t('step5.cancel')}
              </button>
            )}
            <button
              type="button"
              onClick={() => setConfirmed(true)}
              className="flex-1 h-12 sm:h-14 rounded-xl text-base sm:text-lg font-semibold bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/25 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-4">
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
              ? t('step5.statsFormat', { zones: stats.zones, steps: stats.steps, languages: stats.languages, time: stats.time })
              : error
              ? error
              : status}
          </p>
        </div>
      </div>

      {/* Progress stats bar */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-sm">
        <div className="flex items-center gap-2 text-gray-500">
          <Globe className="w-4 h-4" />
          <span>ES &#10003;</span>
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
          <ListChecks className="w-4 h-4" />
          <span>{totalSteps} {t('step5.steps')}</span>
        </div>
        <div className="w-px h-4 bg-gray-200 hidden sm:block" />
        <div className="flex items-center gap-2 text-gray-500">
          <Clock className="w-4 h-4" />
          <span>{stats?.time || elapsed}s</span>
        </div>
      </div>

      {/* Zone cards */}
      <div
        ref={scrollRef}
        className="max-h-[50vh] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
      >
        <AnimatePresence>
          {zones.map((zone, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                type: 'spring',
                damping: 20,
                stiffness: 200,
                delay: 0.05,
              }}
              className="bg-white backdrop-blur-xl border border-gray-200 rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-violet-600/20 flex items-center justify-center text-lg sm:text-xl flex-shrink-0">
                {iconMap[zone.icon] || '📋'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-gray-900 font-semibold truncate text-sm sm:text-base">{zone.name}</h3>
                <p className="text-gray-500 text-xs sm:text-sm truncate">{zone.description}</p>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <span className="text-[10px] sm:text-xs text-gray-400">{zone.stepsCount}</span>
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
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

      {/* Complete action */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: 'spring', damping: 20, stiffness: 200 }}
            className="pt-4 space-y-3"
          >
            {propertyId ? (
              <button
                type="button"
                onClick={() => {
                  if (!propertyId) return
                  router.push(`/properties/${propertyId}/zones`)
                }}
                className="w-full h-14 rounded-xl text-lg font-semibold bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/25 transition-all duration-300 flex items-center justify-center gap-2"
              >
                {t('step5.viewManual')}
                <ArrowRight className="w-5 h-5" />
              </button>
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
