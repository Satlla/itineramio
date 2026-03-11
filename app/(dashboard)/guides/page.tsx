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
  PartyPopper,
  BellOff,
} from 'lucide-react'
import { DashboardFooter } from '../../../src/components/layout/DashboardFooter'

// --- Types ---

interface GuideSubscription {
  propertyId: string
  propertyName: string
}

interface CityGuide {
  id: string
  title: string
  city: string
  country: string
  description?: string | null
  status: 'DRAFT' | 'PUBLISHED' | 'VERIFIED'
  _count: { places: number }
  subscriberCount: number
  author: { id: string; name?: string | null }
  subscriptions: GuideSubscription[]
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
  onDeactivate,
}: {
  guide: CityGuide
  onSubscribe: (guide: CityGuide) => void
  onDeactivate: (guide: CityGuide, subscription: GuideSubscription) => void
}) {
  const activeSubscriptions = guide.subscriptions ?? []
  const isImported = activeSubscriptions.length > 0

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
            {isImported && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                <CheckCircle className="w-3 h-3" />
                Importada
              </span>
            )}
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

      {isImported ? (
        <div className="space-y-2">
          {activeSubscriptions.map((sub) => (
            <div key={sub.propertyId} className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 rounded-lg bg-emerald-500/8 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Importada en <span className="font-medium">{sub.propertyName}</span></span>
              </div>
              <button
                onClick={() => onDeactivate(guide, sub)}
                className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-red-500/15 border border-zinc-700 hover:border-red-500/30 text-zinc-400 hover:text-red-400 transition-all text-xs flex items-center gap-1.5 whitespace-nowrap"
                title="Desactivar sincronización"
              >
                <BellOff className="w-3.5 h-3.5" />
                Desactivar
              </button>
            </div>
          ))}
          <button
            onClick={() => onSubscribe(guide)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-300 transition-colors text-xs"
          >
            <Import className="w-3.5 h-3.5" />
            Añadir a otra propiedad
          </button>
        </div>
      ) : (
        <button
          onClick={() => onSubscribe(guide)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors text-sm font-medium"
        >
          <Import className="w-3.5 h-3.5" />
          Añadir a propiedad
        </button>
      )}
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
  onSuccess: (count: number, propertyName: string) => void
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
      const prop = properties.find(p => p.id === selectedPropertyId)
      onSuccess(data.importedCount ?? guide._count.places, prop?.name ?? 'tu propiedad')
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

// --- Success Modal ---

function SuccessModal({
  count,
  guideTitle,
  propertyName,
  onClose,
}: {
  count: number
  guideTitle: string
  propertyName: string
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        className="relative bg-[#0f0f17] border border-emerald-500/20 rounded-2xl shadow-2xl w-full max-w-md p-7 text-center"
      >
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
          <PartyPopper className="w-8 h-8 text-emerald-400" />
        </div>

        <h2 className="text-white text-xl font-bold mb-2">¡Enhorabuena!</h2>

        <p className="text-zinc-300 text-sm leading-relaxed mb-4">
          Has importado{' '}
          <span className="text-emerald-400 font-semibold">{count} lugares</span>{' '}
          de la guía{' '}
          <span className="text-white font-medium">"{guideTitle}"</span>{' '}
          a{' '}
          <span className="text-violet-400 font-medium">{propertyName}</span>.
        </p>

        {/* Info boxes */}
        <div className="space-y-2.5 mb-6 text-left">
          <div className="flex items-start gap-3 bg-violet-500/8 border border-violet-500/15 rounded-xl px-4 py-3">
            <Sparkles className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
            <p className="text-zinc-300 text-xs leading-relaxed">
              <span className="text-white font-medium">Sincronización automática:</span> si el creador de esta guía añade nuevos lugares, también los recibirás tú automáticamente.
            </p>
          </div>
          <div className="flex items-start gap-3 bg-white/4 border border-white/8 rounded-xl px-4 py-3">
            <MapPin className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" />
            <p className="text-zinc-300 text-xs leading-relaxed">
              <span className="text-white font-medium">Tus lugares solo son tuyos:</span> puedes añadir los lugares que necesites. Solo aparecerán en tu guía, no en la original.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          ¡Perfecto!
        </button>
      </motion.div>
    </div>
  )
}

// --- Deactivate Confirm Modal ---

function DeactivateModal({
  guide,
  subscription,
  onClose,
  onConfirm,
  loading,
}: {
  guide: CityGuide
  subscription: GuideSubscription
  onClose: () => void
  onConfirm: () => void
  loading: boolean
}) {
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

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
            <BellOff className="w-5 h-5 text-zinc-400" />
          </div>
          <div>
            <h2 className="text-white font-semibold">Desactivar sincronización</h2>
            <p className="text-zinc-500 text-sm">{guide.title} → {subscription.propertyName}</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 mb-5">
          <p className="text-zinc-300 text-sm leading-relaxed">
            Dejarás de recibir nuevos lugares automáticamente, pero{' '}
            <span className="text-white font-medium">los que ya tienes importados no se borrarán</span>.
            Podrás volver a importar la guía cuando quieras.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BellOff className="w-4 h-4" />}
            Desactivar
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// --- Main Page ---

export default function GuidesPage() {
  const [guides, setGuides] = useState<CityGuide[]>([])
  const [loading, setLoading] = useState(true)
  const [cityFilter, setCityFilter] = useState('')
  const [debouncedCity, setDebouncedCity] = useState('')

  // Modal states
  const [subscribeGuide, setSubscribeGuide] = useState<CityGuide | null>(null)
  const [successData, setSuccessData] = useState<{ count: number; guideTitle: string; propertyName: string } | null>(null)
  const [deactivateTarget, setDeactivateTarget] = useState<{ guide: CityGuide; subscription: GuideSubscription } | null>(null)
  const [deactivating, setDeactivating] = useState(false)

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

  const handleSubscribeSuccess = (count: number, propertyName: string) => {
    setSubscribeGuide(null)
    setSuccessData({ count, guideTitle: subscribeGuide?.title ?? '', propertyName })
    // Refresh guides to update subscription state
    fetchGuides()
  }

  const handleDeactivateConfirm = async () => {
    if (!deactivateTarget) return
    setDeactivating(true)
    try {
      const res = await fetch(`/api/city-guides/${deactivateTarget.guide.id}/subscribe`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ propertyId: deactivateTarget.subscription.propertyId }),
      })
      if (!res.ok) throw new Error('Error al desactivar')
      setDeactivateTarget(null)
      fetchGuides()
    } catch {
      // silent — user can retry
    } finally {
      setDeactivating(false)
    }
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
                onDeactivate={(g, sub) => setDeactivateTarget({ guide: g, subscription: sub })}
              />
            ))}
          </motion.div>
        )}
      </div>

      <DashboardFooter />

      <AnimatePresence>
        {subscribeGuide && (
          <SubscribeModal
            key="subscribe"
            guide={subscribeGuide}
            onClose={() => setSubscribeGuide(null)}
            onSuccess={handleSubscribeSuccess}
          />
        )}
        {successData && (
          <SuccessModal
            key="success"
            count={successData.count}
            guideTitle={successData.guideTitle}
            propertyName={successData.propertyName}
            onClose={() => setSuccessData(null)}
          />
        )}
        {deactivateTarget && (
          <DeactivateModal
            key="deactivate"
            guide={deactivateTarget.guide}
            subscription={deactivateTarget.subscription}
            onClose={() => setDeactivateTarget(null)}
            onConfirm={handleDeactivateConfirm}
            loading={deactivating}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
