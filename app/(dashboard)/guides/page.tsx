'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Map,
  Plus,
  Search,
  Star,
  MapPin,
  Users,
  CheckCircle,
  Globe,
  Trash2,
  Edit,
  X,
  ChevronDown,
  BookOpen,
  Sparkles,
  Loader2,
  MoreVertical,
  Import,
  Eye
} from 'lucide-react'
import Link from 'next/link'
import { Button, Card, CardContent, Badge } from '../../../src/components/ui'
import { AnimatedLoadingSpinner } from '../../../src/components/ui/AnimatedLoadingSpinner'
import { DashboardFooter } from '../../../src/components/layout/DashboardFooter'

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
  createdAt: string
  isOwner?: boolean
}

interface Property {
  id: string
  name: string
}

// --- Sub-components ---

function StatusBadge({ status }: { status: CityGuide['status'] }) {
  if (status === 'VERIFIED') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
        <Star className="w-3 h-3 fill-amber-400" />
        Verificada
      </span>
    )
  }
  if (status === 'PUBLISHED') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-500/20 text-violet-400 border border-violet-500/30">
        <Globe className="w-3 h-3" />
        Publicada
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-zinc-700/60 text-zinc-400 border border-zinc-600/40">
      Borrador
    </span>
  )
}

function GuideCard({
  guide,
  onSubscribe,
  onDelete,
  showOwnerActions,
}: {
  guide: CityGuide
  onSubscribe?: (guide: CityGuide) => void
  onDelete?: (guide: CityGuide) => void
  showOwnerActions?: boolean
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group bg-[#0f0f17] border border-white/8 rounded-2xl p-5 hover:border-violet-500/30 hover:bg-[#13131e] transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <StatusBadge status={guide.status} />
          </div>
          <h3 className="text-white font-semibold text-base leading-snug truncate mt-1">
            {guide.title}
          </h3>
        </div>

        {showOwnerActions && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/8 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    className="absolute right-0 top-9 z-20 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-xl py-1 w-40"
                  >
                    <Link
                      href={`/guides/${guide.id}`}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/6 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Editar
                    </Link>
                    <button
                      onClick={() => {
                        setMenuOpen(false)
                        onDelete?.(guide)
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/8 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Eliminar
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* City */}
      <div className="flex items-center gap-1.5 text-zinc-400 text-sm mb-2">
        <MapPin className="w-3.5 h-3.5 text-violet-400" />
        <span>{guide.city}, {guide.country}</span>
      </div>

      {/* Description */}
      {guide.description && (
        <p className="text-zinc-500 text-sm leading-relaxed mb-3 line-clamp-2">
          {guide.description}
        </p>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4">
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {guide.placesCount} lugares
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {guide.subscribersCount} propiedades
        </span>
        {guide.author?.name && (
          <span className="flex items-center gap-1">
            por {guide.author.name}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {showOwnerActions ? (
          <Link href={`/guides/${guide.id}`} className="flex-1">
            <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-violet-500/15 text-violet-400 hover:bg-violet-500/25 transition-colors text-sm font-medium border border-violet-500/20">
              <Edit className="w-3.5 h-3.5" />
              Editar guía
            </button>
          </Link>
        ) : (
          <button
            onClick={() => onSubscribe?.(guide)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors text-sm font-medium"
          >
            <Import className="w-3.5 h-3.5" />
            Añadir a propiedad
          </button>
        )}
      </div>
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
      if (!res.ok) throw new Error(data.error || 'Error al suscribirse')
      onSuccess(data.importedCount ?? guide.placesCount)
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
          <span className="text-violet-400 font-medium">{guide.placesCount} lugares</span> como recomendaciones.
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

// --- Create Guide Modal ---

function CreateGuideModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: (guide: CityGuide) => void
}) {
  const [form, setForm] = useState({ title: '', city: '', country: 'ES', description: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.city.trim()) {
      setError('El título y la ciudad son obligatorios')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/city-guides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al crear la guía')
      onCreated(data.guide || data)
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
            <Plus className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-white font-semibold">Nueva guía de ciudad</h2>
            <p className="text-zinc-500 text-sm">Crea y comparte con la comunidad</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 font-medium uppercase tracking-wide mb-1.5">
              Título *
            </label>
            <input
              type="text"
              placeholder="Ej: Los mejores rincones de Barcelona"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-400 font-medium uppercase tracking-wide mb-1.5">
                Ciudad *
              </label>
              <input
                type="text"
                placeholder="Ej: Barcelona"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 font-medium uppercase tracking-wide mb-1.5">
                País
              </label>
              <div className="relative">
                <select
                  value={form.country}
                  onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                  className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm appearance-none focus:outline-none focus:border-violet-500/50 transition-colors"
                >
                  <option value="ES">España</option>
                  <option value="FR">Francia</option>
                  <option value="PT">Portugal</option>
                  <option value="IT">Italia</option>
                  <option value="DE">Alemania</option>
                  <option value="GB">Reino Unido</option>
                  <option value="US">Estados Unidos</option>
                  <option value="MX">México</option>
                  <option value="AR">Argentina</option>
                  <option value="OTHER">Otro</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 font-medium uppercase tracking-wide mb-1.5">
              Descripción
            </label>
            <textarea
              placeholder="Describe qué hace especial esta guía..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Crear guía
            </button>
          </div>
        </form>
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

// --- Delete Confirm Modal ---

function DeleteConfirmModal({
  guide,
  onClose,
  onDeleted,
}: {
  guide: CityGuide
  onClose: () => void
  onDeleted: () => void
}) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/city-guides/${guide.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Error al eliminar')
      }
      onDeleted()
    } catch (e: any) {
      setError(e.message)
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-[#0f0f17] border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm p-6"
      >
        <h2 className="text-white font-semibold mb-2">Eliminar guía</h2>
        <p className="text-zinc-400 text-sm mb-5">
          ¿Seguro que quieres eliminar <span className="text-white">"{guide.title}"</span>? Esta acción no se puede deshacer.
        </p>
        {error && (
          <p className="text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Eliminar
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// --- Main Page ---

export default function GuidesPage() {
  const [activeTab, setActiveTab] = useState<'discover' | 'mine'>('discover')
  const [guides, setGuides] = useState<CityGuide[]>([])
  const [myGuides, setMyGuides] = useState<CityGuide[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMine, setLoadingMine] = useState(true)
  const [cityFilter, setCityFilter] = useState('')
  const [debouncedCity, setDebouncedCity] = useState('')
  const [subscribeGuide, setSubscribeGuide] = useState<CityGuide | null>(null)
  const [deleteGuide, setDeleteGuide] = useState<CityGuide | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Debounce city filter
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
      setGuides(data.guides || [])
    } catch {
      setGuides([])
    } finally {
      setLoading(false)
    }
  }, [debouncedCity])

  const fetchMyGuides = useCallback(async () => {
    setLoadingMine(true)
    try {
      const res = await fetch('/api/city-guides?mine=true', { credentials: 'include' })
      const data = await res.json()
      setMyGuides(data.guides || [])
    } catch {
      setMyGuides([])
    } finally {
      setLoadingMine(false)
    }
  }, [])

  useEffect(() => {
    fetchGuides()
  }, [fetchGuides])

  useEffect(() => {
    fetchMyGuides()
  }, [fetchMyGuides])

  const handleSubscribeSuccess = (count: number) => {
    setSubscribeGuide(null)
    setSuccessMessage(`${count} lugares importados correctamente como recomendaciones`)
  }

  const handleCreated = (guide: CityGuide) => {
    setShowCreateModal(false)
    setMyGuides((prev) => [guide, ...prev])
    setActiveTab('mine')
    setSuccessMessage('Guía creada correctamente')
  }

  const handleDeleted = () => {
    setDeleteGuide(null)
    fetchMyGuides()
    setSuccessMessage('Guía eliminada')
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
              <p className="text-zinc-500 text-sm">Descubre y comparte los mejores lugares con tus huéspedes</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 bg-white/4 rounded-xl p-1 w-fit border border-white/6">
          {(['discover', 'mine'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab
                  ? 'text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="tab-bg"
                  className="absolute inset-0 bg-violet-600 rounded-lg"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">
                {tab === 'discover' ? (
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Descubrir
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    Mis guías
                    {myGuides.length > 0 && (
                      <span className="bg-white/15 text-white text-xs px-1.5 py-0.5 rounded-full leading-none">
                        {myGuides.length}
                      </span>
                    )}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>

        {/* Discover Tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'discover' && (
            <motion.div
              key="discover"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
            >
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
                  <p className="text-zinc-600 text-sm mt-1">Sé el primero en crear una</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {guides.map((guide) => (
                    <GuideCard
                      key={guide.id}
                      guide={guide}
                      onSubscribe={setSubscribeGuide}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* My Guides Tab */}
          {activeTab === 'mine' && (
            <motion.div
              key="mine"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
            >
              <div className="flex items-center justify-between mb-6">
                <p className="text-zinc-400 text-sm">
                  Guías que has creado y puedes editar
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nueva guía
                </button>
              </div>

              {loadingMine ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
                </div>
              ) : myGuides.length === 0 ? (
                <div className="text-center py-16">
                  <BookOpen className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-400 font-medium">Aún no has creado ninguna guía</p>
                  <p className="text-zinc-600 text-sm mt-1 mb-5">
                    Crea una guía para compartir los mejores lugares de tu ciudad
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Crear primera guía
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myGuides.map((guide) => (
                    <GuideCard
                      key={guide.id}
                      guide={guide}
                      showOwnerActions
                      onDelete={setDeleteGuide}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <DashboardFooter />

      {/* Modals */}
      <AnimatePresence>
        {subscribeGuide && (
          <SubscribeModal
            guide={subscribeGuide}
            onClose={() => setSubscribeGuide(null)}
            onSuccess={handleSubscribeSuccess}
          />
        )}
        {showCreateModal && (
          <CreateGuideModal
            onClose={() => setShowCreateModal(false)}
            onCreated={handleCreated}
          />
        )}
        {deleteGuide && (
          <DeleteConfirmModal
            guide={deleteGuide}
            onClose={() => setDeleteGuide(null)}
            onDeleted={handleDeleted}
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
