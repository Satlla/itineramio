'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Map,
  Search,
  Star,
  MapPin,
  Users,
  Globe,
  X,
  Sparkles,
  Loader2,
  Import,
  CheckCircle,
  ChevronDown,
} from 'lucide-react'
import { DashboardFooter } from '../../../src/components/layout/DashboardFooter'

// --- Types ---

interface CityGuide {
  id: string
  title: string
  city: string
  country: string
  description?: string | null
  status: 'DRAFT' | 'PUBLISHED' | 'VERIFIED'
  _count: { places: number }
  subscriberCount: number
  author: {
    id: string
    name?: string | null
  }
}

interface Property {
  id: string
  name: string
}

// --- Status Badge ---

function StatusBadge({ status }: { status: CityGuide['status'] }) {
  if (status === 'VERIFIED') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
        <Star className="w-3 h-3 fill-amber-400" />
        Verificada
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-500/20 text-violet-400 border border-violet-500/30">
      <Globe className="w-3 h-3" />
      Publicada
    </span>
  )
}

// --- Guide Card ---

function GuideCard({
  guide,
  onSubscribe,
}: {
  guide: CityGuide
  onSubscribe: (guide: CityGuide) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-[#0f0f17] border border-white/8 rounded-2xl p-5 hover:border-violet-500/30 hover:bg-[#13131e] transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <StatusBadge status={guide.status} />
          </div>
          <h3 className="text-white font-semibold text-base leading-snug mt-1">
            {guide.title}
          </h3>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-zinc-400 text-sm mb-2">
        <MapPin className="w-3.5 h-3.5 text-violet-400" />
        <span>{guide.city}, {guide.country}</span>
      </div>

      {guide.description && (
        <p className="text-zinc-500 text-sm leading-relaxed mb-3 line-clamp-2">
          {guide.description}
        </p>
      )}

      <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4">
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {guide._count.places} lugares
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {guide.subscriberCount} propiedades
        </span>
      </div>

      <button
        onClick={() => onSubscribe(guide)}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors text-sm font-medium"
      >
        <Import className="w-3.5 h-3.5" />
        Añadir a propiedad
      </button>
    </motion.div>
  )
}

// --- Subscribe Modal ---

function SubscribeModal({
  guide,
  onClose,
  onSuccess,
}: {
  guide: CityGuide
  onClose: () => void
  onSuccess: (count: number) => void
}) {
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedPropertyId, setSelectedPropertyId] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/properties', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        setProperties(data.properties || [])
        if ((data.properties || []).length > 0) {
          setSelectedPropertyId(data.properties[0].id)
        }
      })
      .catch(() => setError('Error cargando propiedades'))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async () => {
    if (!selectedPropertyId) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`/api/city-guides/${guide.id}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ propertyId: selectedPropertyId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al añadir la guía')
      onSuccess(data.importedCount ?? guide._count.places)
    } catch (e: any) {
      setError(e.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="relative bg-[#0f0f17] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/8 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
            <Import className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-white font-semibold">Añadir guía a propiedad</h2>
            <p className="text-zinc-500 text-sm">{guide.title}</p>
          </div>
        </div>

        <p className="text-zinc-400 text-sm mb-4">
          ¿A qué propiedad quieres añadir esta guía? Se importarán{' '}
          <span className="text-violet-400 font-medium">{guide._count.places} lugares</span> como recomendaciones.
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
          </div>
        ) : properties.length === 0 ? (
          <p className="text-zinc-500 text-sm text-center py-4">No tienes propiedades creadas aún.</p>
        ) : (
          <div className="mb-5">
            <label className="block text-xs text-zinc-400 font-medium uppercase tracking-wide mb-2">
              Propiedad
            </label>
            <div className="relative">
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm appearance-none focus:outline-none focus:border-violet-500/50 transition-colors"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            </div>
          </div>
        )}

        {error && (
          <p className="text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !selectedPropertyId || properties.length === 0}
            className="flex-1 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Import className="w-4 h-4" />}
            Importar guía
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// --- Success Toast ---

function SuccessToast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#1a1a2e] border border-emerald-500/30 rounded-2xl px-4 py-3 shadow-xl"
    >
      <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
      <span className="text-white text-sm">{message}</span>
    </motion.div>
  )
}

// --- Main Page ---

export default function GuidesPage() {
  const [guides, setGuides] = useState<CityGuide[]>([])
  const [loading, setLoading] = useState(true)
  const [cityFilter, setCityFilter] = useState('')
  const [debouncedCity, setDebouncedCity] = useState('')
  const [subscribeGuide, setSubscribeGuide] = useState<CityGuide | null>(null)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedCity(cityFilter), 400)
    return () => clearTimeout(t)
  }, [cityFilter])

  const fetchGuides = useCallback(async () => {
    setLoading(true)
    try {
      const params = debouncedCity ? `?city=${encodeURIComponent(debouncedCity)}` : ''
      const res = await fetch(`/api/city-guides${params}`, { credentials: 'include' })
      const data = await res.json()
      setGuides(data.data || [])
    } catch {
      setGuides([])
    } finally {
      setLoading(false)
    }
  }, [debouncedCity])

  useEffect(() => {
    fetchGuides()
  }, [fetchGuides])

  const handleSubscribeSuccess = (count: number) => {
    setSubscribeGuide(null)
    setSuccessMessage(`${count} lugares importados correctamente como recomendaciones`)
  }

  return (
    <div className="min-h-screen bg-[#070710] text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
              <Map className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Guías de ciudad</h1>
              <p className="text-zinc-500 text-sm">
                Descubre los mejores lugares de cada ciudad y añádelos a tus propiedades
              </p>
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <div className="relative mb-6 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Filtrar por ciudad..."
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="w-full bg-[#0f0f17] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500/40 transition-colors"
          />
          {cityFilter && (
            <button
              onClick={() => setCityFilter('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
          </div>
        ) : guides.length === 0 ? (
          <div className="text-center py-16">
            <Map className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-400 font-medium">
              {debouncedCity
                ? `No hay guías publicadas para "${debouncedCity}"`
                : 'No hay guías publicadas aún'}
            </p>
            <p className="text-zinc-600 text-sm mt-1">
              El equipo de Itineramio está preparando guías para las principales ciudades
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {guides.map((guide) => (
              <GuideCard
                key={guide.id}
                guide={guide}
                onSubscribe={setSubscribeGuide}
              />
            ))}
          </motion.div>
        )}
      </div>

      <DashboardFooter />

      <AnimatePresence>
        {subscribeGuide && (
          <SubscribeModal
            guide={subscribeGuide}
            onClose={() => setSubscribeGuide(null)}
            onSuccess={handleSubscribeSuccess}
          />
        )}
        {successMessage && (
          <SuccessToast
            message={successMessage}
            onClose={() => setSuccessMessage('')}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
