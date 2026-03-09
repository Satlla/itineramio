'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  MapPin,
  Search,
  Trash2,
  Plus,
  Star,
  Globe,
  CheckCircle,
  Loader2,
  X,
  ChevronDown,
  Edit,
  Save,
  AlertTriangle,
  Coffee,
  Utensils,
  ShoppingBag,
  Music,
  TreePine,
  Camera,
  Waves,
  Dumbbell,
  Heart,
  MoreHorizontal,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { AnimatedLoadingSpinner } from '../../../../src/components/ui/AnimatedLoadingSpinner'
import { DashboardFooter } from '../../../../src/components/layout/DashboardFooter'

// --- Types ---

interface Author {
  id: string
  name?: string | null
  email: string
}

interface PlaceResult {
  placeId: string
  name: string
  address: string
  latitude?: number
  longitude?: number
  rating?: number | null
  types?: string[]
}

interface GuidePlace {
  id: string
  category: string
  description?: string | null
  order: number
  place: {
    id: string
    placeId?: string | null
    name: string
    address: string
    latitude: number
    longitude: number
    rating?: number | null
    photoUrl?: string | null
    types?: any
  }
}

interface CityGuide {
  id: string
  title: string
  city: string
  country: string
  description?: string | null
  status: 'DRAFT' | 'PUBLISHED' | 'VERIFIED'
  placesCount: number
  subscribersCount: number
  author: Author
  places: GuidePlace[]
  isOwner: boolean
}

// --- Category config ---

const CATEGORIES: { id: string; label: string; icon: React.ReactNode }[] = [
  { id: 'restaurants', label: 'Restaurantes', icon: <Utensils className="w-3.5 h-3.5" /> },
  { id: 'cafes', label: 'Cafés', icon: <Coffee className="w-3.5 h-3.5" /> },
  { id: 'shopping', label: 'Compras', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
  { id: 'nightlife', label: 'Ocio nocturno', icon: <Music className="w-3.5 h-3.5" /> },
  { id: 'nature', label: 'Naturaleza', icon: <TreePine className="w-3.5 h-3.5" /> },
  { id: 'culture', label: 'Cultura', icon: <Camera className="w-3.5 h-3.5" /> },
  { id: 'beaches', label: 'Playas', icon: <Waves className="w-3.5 h-3.5" /> },
  { id: 'sports', label: 'Deporte', icon: <Dumbbell className="w-3.5 h-3.5" /> },
  { id: 'health', label: 'Salud', icon: <Heart className="w-3.5 h-3.5" /> },
  { id: 'other', label: 'Otros', icon: <MapPin className="w-3.5 h-3.5" /> },
]

function getCategoryLabel(id: string) {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id
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

// --- Add Place Panel ---

function AddPlacePanel({
  guideId,
  onAdded,
  onClose,
}: {
  guideId: string
  onAdded: (place: GuidePlace) => void
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PlaceResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState<PlaceResult | null>(null)
  const [category, setCategory] = useState('restaurants')
  const [description, setDescription] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return
    setSearching(true)
    setResults([])
    setError('')
    try {
      const res = await fetch(
        `/api/places/search?q=${encodeURIComponent(query)}&lat=0&lng=0`,
        { credentials: 'include' }
      )
      const data = await res.json()
      setResults(data.data || data.results || data.places || [])
    } catch {
      setError('Error buscando lugares')
    } finally {
      setSearching(false)
    }
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleAdd = async () => {
    if (!selected) return
    setAdding(true)
    setError('')
    try {
      // 1. Save place to DB (find or create)
      const placeRes = await fetch('/api/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          googlePlaceId: selected.googlePlaceId,
          name: selected.name,
          address: selected.address,
          latitude: selected.lat,
          longitude: selected.lng,
          rating: selected.rating,
          photoUrl: selected.photoUrl,
          types: selected.types,
        }),
      })
      const placeData = await placeRes.json()
      if (!placeRes.ok) throw new Error(placeData.error || 'Error al guardar el lugar')
      const dbPlaceId = placeData.id

      // 2. Add to guide
      const res = await fetch(`/api/city-guides/${guideId}/places`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          placeId: dbPlaceId,
          category,
          description: description.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al añadir lugar')
      onAdded(data.data || data.guidePlace || data)
      setSelected(null)
      setQuery('')
      setResults([])
      setDescription('')
    } catch (e: any) {
      setError(e.message)
      setAdding(false)
    }
  }

  return (
    <div className="bg-[#0a0a12] border border-violet-500/20 rounded-2xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium flex items-center gap-2">
          <Plus className="w-4 h-4 text-violet-400" />
          Añadir lugar
        </h3>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-white hover:bg-white/8 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar restaurante, museo, parque..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-[#0f0f17] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500/40 transition-colors"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={!query.trim() || searching}
          className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Buscar
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && !selected && (
        <div className="space-y-2 mb-4 max-h-56 overflow-y-auto">
          {results.map((result) => (
            <button
              key={result.placeId}
              onClick={() => setSelected(result)}
              className="w-full text-left bg-[#0f0f17] border border-white/8 rounded-xl p-3 hover:border-violet-500/30 hover:bg-[#13131e] transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{result.name}</p>
                  <p className="text-zinc-500 text-xs truncate">{result.address}</p>
                </div>
                {result.rating && (
                  <span className="flex items-center gap-1 text-xs text-amber-400 flex-shrink-0">
                    <Star className="w-3 h-3 fill-amber-400" />
                    {result.rating}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Selected place — confirm form */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="bg-violet-500/8 border border-violet-500/20 rounded-xl p-3 mb-3 flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-violet-300 text-sm font-medium">{selected.name}</p>
              <p className="text-zinc-500 text-xs">{selected.address}</p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-zinc-500 hover:text-white flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-400 font-medium uppercase tracking-wide mb-1.5">
                Categoría
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#0f0f17] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm appearance-none focus:outline-none focus:border-violet-500/40 transition-colors"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 font-medium uppercase tracking-wide mb-1.5">
                Nota (opcional)
              </label>
              <input
                type="text"
                placeholder="Ej: Pide la pasta trufa..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#0f0f17] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500/40 transition-colors"
              />
            </div>
          </div>
        </motion.div>
      )}

      {error && (
        <p className="text-red-400 text-sm mb-3 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {searching && results.length === 0 && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
        </div>
      )}

      {selected && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => { setSelected(null); setResults([]) }}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleAdd}
            disabled={adding}
            className="flex-1 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
          >
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Añadir lugar
          </button>
        </div>
      )}
    </div>
  )
}

// --- Place Card ---

function PlaceCard({
  guidePlace,
  guideId,
  onRemoved,
}: {
  guidePlace: GuidePlace
  guideId: string
  onRemoved: (id: string) => void
}) {
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState('')

  const handleRemove = async () => {
    if (!confirm('¿Eliminar este lugar de la guía?')) return
    setRemoving(true)
    try {
      const res = await fetch(`/api/city-guides/${guideId}/places`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ placeId: guidePlace.id }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Error al eliminar')
      }
      onRemoved(guidePlace.id)
    } catch (e: any) {
      setError(e.message)
      setRemoving(false)
    }
  }

  const place = guidePlace.place

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      className="flex items-start gap-3 bg-[#0f0f17] border border-white/8 rounded-xl p-3.5 group hover:border-white/14 transition-colors"
    >
      {/* Photo or placeholder */}
      <div className="w-12 h-12 rounded-lg bg-zinc-800 flex-shrink-0 overflow-hidden">
        {place.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={place.photoUrl} alt={place.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="w-5 h-5 text-zinc-600" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{place.name}</p>
            <p className="text-zinc-500 text-xs truncate">{place.address}</p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {place.rating && (
              <span className="flex items-center gap-0.5 text-xs text-amber-400">
                <Star className="w-3 h-3 fill-amber-400" />
                {place.rating}
              </span>
            )}
            <button
              onClick={handleRemove}
              disabled={removing}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
            >
              {removing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {guidePlace.description && (
          <p className="text-zinc-400 text-xs mt-1 line-clamp-1">{guidePlace.description}</p>
        )}

        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      </div>
    </motion.div>
  )
}

// --- Main Page ---

export default function GuideDetailPage() {
  const router = useRouter()
  const params = useParams()
  const guideId = params?.id as string

  const [guide, setGuide] = useState<CityGuide | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Editing title/description inline
  const [editingMeta, setEditingMeta] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [savingMeta, setSavingMeta] = useState(false)

  const fetchGuide = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/city-guides/${guideId}`, { credentials: 'include' })
      if (res.status === 403 || res.status === 401) {
        router.replace('/guides')
        return
      }
      if (res.status === 404) {
        setNotFound(true)
        return
      }
      const data = await res.json()
      const g: CityGuide = data.data || data.guide || data
      if (!g.isOwner) {
        router.replace('/guides')
        return
      }
      setGuide(g)
      setEditTitle(g.title)
      setEditDescription(g.description || '')
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }, [guideId, router])

  useEffect(() => {
    fetchGuide()
  }, [fetchGuide])

  const handleSaveMeta = async () => {
    if (!guide) return
    setSavingMeta(true)
    try {
      const res = await fetch(`/api/city-guides/${guideId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: editTitle, description: editDescription }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al guardar')
      setGuide((prev) => prev ? { ...prev, title: editTitle, description: editDescription } : prev)
      setEditingMeta(false)
      showSuccess('Guía actualizada')
    } catch (e: any) {
      // noop — could add error state
    } finally {
      setSavingMeta(false)
    }
  }

  const handlePlaceAdded = (guidePlace: GuidePlace) => {
    setGuide((prev) =>
      prev ? { ...prev, places: [...prev.places, guidePlace], placesCount: prev.placesCount + 1 } : prev
    )
    showSuccess('Lugar añadido a la guía')
  }

  const handlePlaceRemoved = (id: string) => {
    setGuide((prev) =>
      prev
        ? {
            ...prev,
            places: prev.places.filter((p) => p.id !== id),
            placesCount: Math.max(0, prev.placesCount - 1),
          }
        : prev
    )
  }

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(''), 4000)
  }

  // Group places by category
  const placesByCategory = guide?.places.reduce<Record<string, GuidePlace[]>>((acc, gp) => {
    const cat = gp.category || 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(gp)
    return acc
  }, {}) ?? {}

  if (loading) {
    return <AnimatedLoadingSpinner text="Cargando guía..." type="general" />
  }

  if (notFound || !guide) {
    return (
      <div className="min-h-screen bg-[#070710] text-white flex items-center justify-center p-4">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400 font-medium">Guía no encontrada</p>
          <Link href="/guides" className="text-violet-400 text-sm mt-2 inline-block hover:text-violet-300">
            Volver a guías
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#070710] text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Back */}
        <Link
          href="/guides"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a guías
        </Link>

        {/* Meta header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0f0f17] border border-white/8 rounded-2xl p-5 mb-6"
        >
          {editingMeta ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-400 font-medium uppercase tracking-wide mb-1.5">
                  Título
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 font-medium uppercase tracking-wide mb-1.5">
                  Descripción
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => { setEditingMeta(false); setEditTitle(guide.title); setEditDescription(guide.description || '') }}
                  className="flex-1 px-4 py-2 rounded-xl border border-white/10 text-zinc-400 hover:text-white transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveMeta}
                  disabled={savingMeta}
                  className="flex-1 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {savingMeta ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Guardar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <StatusBadge status={guide.status} />
                </div>
                <h1 className="text-xl font-bold text-white mt-1 mb-1">{guide.title}</h1>
                <div className="flex items-center gap-1.5 text-zinc-500 text-sm mb-2">
                  <MapPin className="w-3.5 h-3.5 text-violet-400" />
                  {guide.city}, {guide.country}
                </div>
                {guide.description && (
                  <p className="text-zinc-400 text-sm leading-relaxed">{guide.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-zinc-600 mt-2">
                  <span>{guide.placesCount} lugares</span>
                  <span>{guide.subscribersCount} propiedades suscritas</span>
                </div>
              </div>
              <button
                onClick={() => setEditingMeta(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-white/8 transition-colors flex-shrink-0"
              >
                <Edit className="w-3.5 h-3.5" />
                Editar
              </button>
            </div>
          )}
        </motion.div>

        {/* Add Place Panel */}
        <AnimatePresence>
          {showAddPanel && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <AddPlacePanel
                guideId={guideId}
                onAdded={(gp) => { handlePlaceAdded(gp); setShowAddPanel(false) }}
                onClose={() => setShowAddPanel(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add button */}
        {!showAddPanel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
            <button
              onClick={() => setShowAddPanel(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Añadir lugar
            </button>
          </motion.div>
        )}

        {/* Places grouped by category */}
        {Object.keys(placesByCategory).length === 0 ? (
          <div className="text-center py-12 border border-white/6 rounded-2xl">
            <MapPin className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-400 font-medium">Esta guía no tiene lugares aún</p>
            <p className="text-zinc-600 text-sm mt-1">Añade restaurantes, museos, parques y más</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(placesByCategory).map(([cat, places]) => (
              <motion.div key={cat} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-violet-400">
                    {CATEGORIES.find((c) => c.id === cat)?.icon ?? <MapPin className="w-3.5 h-3.5" />}
                  </span>
                  <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">
                    {getCategoryLabel(cat)}
                  </h2>
                  <span className="text-xs text-zinc-600 bg-white/4 px-1.5 py-0.5 rounded-full">
                    {places.length}
                  </span>
                </div>
                <div className="space-y-2">
                  <AnimatePresence>
                    {places.map((gp) => (
                      <PlaceCard
                        key={gp.id}
                        guidePlace={gp}
                        guideId={guideId}
                        onRemoved={handlePlaceRemoved}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <DashboardFooter />

      {/* Success toast */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#1a1a2e] border border-emerald-500/30 rounded-2xl px-4 py-3 shadow-xl"
          >
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-white text-sm">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
