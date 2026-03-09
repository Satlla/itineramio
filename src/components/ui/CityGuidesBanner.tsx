'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Map,
  ChevronDown,
  ChevronUp,
  Star,
  MapPin,
  Users,
  Import,
  CheckCircle,
  Loader2,
  X,
  Globe,
} from 'lucide-react'

// --- Types ---

interface CityGuide {
  id: string
  title: string
  city: string
  country: string
  description?: string | null
  status: 'DRAFT' | 'PUBLISHED' | 'VERIFIED'
  placesCount: number
  subscribersCount: number
  author: {
    id: string
    name?: string | null
    email: string
  }
}

interface CityGuidesBannerProps {
  city: string
  propertyId: string
  onImported: () => void
}

// --- Status badge (inline) ---

function StatusBadge({ status }: { status: CityGuide['status'] }) {
  if (status === 'VERIFIED') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
        <Star className="w-2.5 h-2.5 fill-amber-400" />
        Verificada
      </span>
    )
  }
  if (status === 'PUBLISHED') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-semibold bg-violet-500/20 text-violet-400 border border-violet-500/30">
        <Globe className="w-2.5 h-2.5" />
        Publicada
      </span>
    )
  }
  return null
}

// --- Individual Guide Card (compact) ---

function GuideCard({
  guide,
  propertyId,
  onImported,
}: {
  guide: CityGuide
  propertyId: string
  onImported: (count: number) => void
}) {
  const [importing, setImporting] = useState(false)
  const [imported, setImported] = useState(false)
  const [error, setError] = useState('')

  const handleImport = async () => {
    setImporting(true)
    setError('')
    try {
      const res = await fetch(`/api/city-guides/${guide.id}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ propertyId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al importar')
      setImported(true)
      onImported(data.importedCount ?? guide.placesCount)
    } catch (e: any) {
      setError(e.message)
      setImporting(false)
    }
  }

  return (
    <div className="bg-[#0f0f17] border border-white/8 rounded-xl p-3.5 hover:border-violet-500/25 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <StatusBadge status={guide.status} />
          </div>
          <h4 className="text-white text-sm font-medium leading-snug line-clamp-1">
            {guide.title}
          </h4>
        </div>
      </div>

      <div className="flex items-center gap-3 text-[11px] text-zinc-500 mb-2.5">
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-violet-400" />
          {guide.placesCount} lugares
        </span>
        {guide.author?.name && (
          <span>por {guide.author.name}</span>
        )}
      </div>

      {error && (
        <p className="text-red-400 text-xs mb-2">{error}</p>
      )}

      <button
        onClick={handleImport}
        disabled={importing || imported}
        className={`w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
          imported
            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 cursor-default'
            : 'bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-60'
        }`}
      >
        {importing ? (
          <>
            <Loader2 className="w-3 h-3 animate-spin" />
            Importando...
          </>
        ) : imported ? (
          <>
            <CheckCircle className="w-3 h-3" />
            Importada
          </>
        ) : (
          <>
            <Import className="w-3 h-3" />
            Importar a esta propiedad
          </>
        )}
      </button>
    </div>
  )
}

// --- Main Banner Component ---

export function CityGuidesBanner({ city, propertyId, onImported }: CityGuidesBannerProps) {
  const [guides, setGuides] = useState<CityGuide[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [importedCount, setImportedCount] = useState(0)
  const [successMessage, setSuccessMessage] = useState('')

  const fetchGuides = useCallback(async () => {
    if (!city) return
    setLoading(true)
    try {
      const res = await fetch(
        `/api/city-guides?city=${encodeURIComponent(city)}`,
        { credentials: 'include' }
      )
      const data = await res.json()
      const available = (data.guides || []).filter(
        (g: CityGuide) => g.status === 'PUBLISHED' || g.status === 'VERIFIED'
      )
      setGuides(available)
    } catch {
      setGuides([])
    } finally {
      setLoading(false)
    }
  }, [city])

  useEffect(() => {
    fetchGuides()
  }, [fetchGuides])

  const handleImported = (count: number) => {
    setImportedCount((prev) => prev + count)
    setSuccessMessage(`${count} lugares importados como recomendaciones`)
    onImported()
    setTimeout(() => setSuccessMessage(''), 4000)
  }

  // Don't render while loading or if no guides
  if (loading || guides.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      {/* Collapsed Banner */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-3 bg-violet-500/8 border border-violet-500/20 rounded-xl px-4 py-3 hover:bg-violet-500/12 hover:border-violet-500/30 transition-all duration-200 group"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-base">🗺️</span>
          <span className="text-sm text-violet-300 font-medium">
            {guides.length === 1
              ? `Hay 1 guía disponible para ${city}`
              : `Hay ${guides.length} guías disponibles para ${city}`}
          </span>
          {importedCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              <CheckCircle className="w-3 h-3" />
              {importedCount} importados
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-violet-400 group-hover:text-violet-300 transition-colors">
            {expanded ? 'Ocultar' : 'Ver guías'}
          </span>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-violet-400" />
          </motion.div>
        </div>
      </button>

      {/* Expanded Panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border border-violet-500/15 border-t-0 rounded-b-xl bg-[#0a0a12] px-3 pt-3 pb-3">
              {/* Success message */}
              <AnimatePresence>
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 mb-3 text-emerald-400 text-xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {successMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {guides.map((guide) => (
                  <GuideCard
                    key={guide.id}
                    guide={guide}
                    propertyId={propertyId}
                    onImported={handleImported}
                  />
                ))}
              </div>

              <p className="text-zinc-600 text-[11px] mt-3 text-center">
                Los lugares se importan a la zona de recomendaciones de esta propiedad
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default CityGuidesBanner
