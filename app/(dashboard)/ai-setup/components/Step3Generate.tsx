'use client'

import React, { useState, useEffect, useRef } from 'react'
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
} from 'lucide-react'
import { useRouter } from 'next/navigation'

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
  mediaAnalysis: any[]
  onComplete?: () => void
}

// Map icon names to lucide components
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

export default function Step3Generate({ propertyData, mediaAnalysis, onComplete }: Step3GenerateProps) {
  const router = useRouter()
  const [status, setStatus] = useState('Preparando...')
  const [zones, setZones] = useState<ZoneEvent[]>([])
  const [translations, setTranslations] = useState<Record<string, number>>({})
  const [stats, setStats] = useState<GenerationStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [propertyId, setPropertyId] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [retryCount, setRetryCount] = useState(0)
  const startTimeRef = useRef(Date.now())
  const scrollRef = useRef<HTMLDivElement>(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  // Elapsed time counter
  useEffect(() => {
    if (stats) return // Stop when complete
    const interval = setInterval(() => {
      setElapsed(Math.round((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [stats])

  // Auto-scroll to latest zone
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [zones])

  // Start generation
  useEffect(() => {
    const controller = new AbortController()
    const TIMEOUT_MS = 5 * 60 * 1000 // 5 minutes max

    // Reset state on retry
    setStatus('Preparando...')
    setZones([])
    setTranslations({})
    setStats(null)
    setError(null)
    setPropertyId(null)
    setElapsed(0)
    startTimeRef.current = Date.now()

    const timeoutId = setTimeout(() => {
      controller.abort()
      setError('La generación ha tardado demasiado. Por favor, inténtalo de nuevo.')
    }, TIMEOUT_MS)

    const generate = async () => {
      try {
        // Parse auth token correctly — JWT tokens contain '=' in base64
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

          // Process complete SSE events
          const lines = buffer.split('\n')
          buffer = lines.pop() || '' // Keep incomplete line in buffer

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
                  setPropertyId(event.propertyId)
                  // Generation succeeded — clear the draft
                  onCompleteRef.current?.()
                  break
                case 'error':
                  setError(event.error)
                  break
              }
            } catch (parseErr) {
              // Skip malformed SSE events
            }
          }
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return // Timeout already handled
        console.error('[Step3] Generation error:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        clearTimeout(timeoutId)
      }
    }

    generate()

    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [retryCount]) // eslint-disable-line react-hooks/exhaustive-deps

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
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            {isComplete
              ? 'Tu manual está listo'
              : error
              ? 'Ha ocurrido un error'
              : 'Creando tu manual...'}
          </h2>
          <p className="text-gray-400 mt-2 text-sm sm:text-base">
            {isComplete
              ? `${stats.zones} zonas, ${stats.steps} pasos, ${stats.languages} idiomas en ${stats.time}s`
              : error
              ? error
              : status}
          </p>
        </div>
      </div>

      {/* Progress stats bar */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-sm">
        {/* Languages */}
        <div className="flex items-center gap-2 text-gray-400">
          <Globe className="w-4 h-4" />
          <span>ES ✓</span>
          <span>EN {translations.en !== undefined ? (translations.en >= 100 ? '✓' : '...') : ''}</span>
          <span>FR {translations.fr !== undefined ? (translations.fr >= 100 ? '✓' : '...') : ''}</span>
        </div>

        <div className="w-px h-4 bg-gray-700 hidden sm:block" />

        {/* Zones */}
        <div className="flex items-center gap-2 text-gray-400">
          <Layers className="w-4 h-4" />
          <span>{zones.length} zonas</span>
        </div>

        <div className="w-px h-4 bg-gray-700 hidden sm:block" />

        {/* Steps */}
        <div className="flex items-center gap-2 text-gray-400">
          <ListChecks className="w-4 h-4" />
          <span>{totalSteps} pasos</span>
        </div>

        <div className="w-px h-4 bg-gray-700 hidden sm:block" />

        {/* Time */}
        <div className="flex items-center gap-2 text-gray-400">
          <Clock className="w-4 h-4" />
          <span>{stats?.time || elapsed}s</span>
        </div>
      </div>

      {/* Zone cards */}
      <div
        ref={scrollRef}
        className="max-h-[50vh] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
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
              className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-violet-600/20 flex items-center justify-center text-lg sm:text-xl flex-shrink-0">
                {iconMap[zone.icon] || '📋'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold truncate text-sm sm:text-base">{zone.name}</h3>
                <p className="text-gray-500 text-xs sm:text-sm truncate">{zone.description}</p>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <span className="text-[10px] sm:text-xs text-gray-500">{zone.stepsCount}</span>
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
            <span className="text-sm text-gray-500">Generando siguiente zona...</span>
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
                onClick={() => router.push(`/properties/${propertyId}/zones`)}
                className="w-full h-14 rounded-xl text-lg font-semibold bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/25 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Ver mi manual
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => router.push('/properties')}
                className="w-full h-14 rounded-xl text-lg font-semibold bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/25 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Ir a mis propiedades
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error retry */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pt-4 flex gap-4"
        >
          <button
            type="button"
            onClick={() => setRetryCount(c => c + 1)}
            className="flex-1 h-14 rounded-xl text-lg font-semibold border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            Reintentar
          </button>
          <button
            type="button"
            onClick={() => router.push('/properties')}
            className="flex-1 h-14 rounded-xl text-lg font-semibold bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            Volver a propiedades
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}
