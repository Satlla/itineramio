'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, MapPin, Trash2, Loader2, CheckCircle, Plus, ChevronDown, Star, Globe, Search,
  MessageSquare, Pencil, X, Check
} from 'lucide-react'
import Link from 'next/link'
import { PlaceSearchInput, PlaceSearchResult } from '../../../../src/components/ui/PlaceSearchInput'
import { CATEGORIES } from '../../../../src/lib/recommendations/categories'

interface GuidePlace {
  id: string
  category: string
  description?: string | null
  place: {
    id: string
    name: string
    address: string
    rating?: number | null
    photoUrl?: string | null
  }
}

interface Guide {
  id: string
  title: string
  city: string
  country: string
  status: string
  version: number
  subscriberCount: number
  _count: { places: number }
  places: GuidePlace[]
}

const CATEGORY_OPTIONS = CATEGORIES.map(c => ({ id: c.id, label: c.label }))

export default function AdminGuideDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [guide, setGuide] = useState<Guide | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(CATEGORY_OPTIONS[0]?.id ?? 'restaurant')
  const [adding, setAdding] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const [savedPlaceId, setSavedPlaceId] = useState<string | null>(null)
  const [pendingPlace, setPendingPlace] = useState<PlaceSearchResult | null>(null)
  const [pendingDescription, setPendingDescription] = useState('')
  const [editingDescriptionId, setEditingDescriptionId] = useState<string | null>(null)
  const [editingDescriptionText, setEditingDescriptionText] = useState('')
  const [savingDescriptionId, setSavingDescriptionId] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3500)
  }

  const fetchGuide = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/city-guides/${id}`, { credentials: 'include' })
      const data = await res.json()
      if (!res.ok) { router.replace('/admin/city-guides'); return }
      const g = data.data || data
      // Flatten placesByCategory into places array
      const places: GuidePlace[] = Object.values(g.placesByCategory || {}).flat() as GuidePlace[]
      setGuide({ ...g, places })
    } catch {
      router.replace('/admin/city-guides')
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => { fetchGuide() }, [fetchGuide])

  const handleSelect = (result: PlaceSearchResult) => {
    setPendingPlace(result)
    setPendingDescription('')
  }

  const handleConfirmAdd = async () => {
    if (!guide || !pendingPlace) return
    setAdding(true)
    try {
      // 1. Save place to DB
      const placeRes = await fetch('/api/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          googlePlaceId: pendingPlace.googlePlaceId,
          name: pendingPlace.name,
          address: pendingPlace.address,
          latitude: pendingPlace.lat,
          longitude: pendingPlace.lng,
          rating: pendingPlace.rating,
          photoUrl: pendingPlace.photoUrl,
          types: pendingPlace.types,
          source: 'GOOGLE',
        }),
      })
      const placeData = await placeRes.json()
      if (!placeRes.ok) throw new Error(placeData.error || 'Error al guardar el lugar')
      const placeId = placeData.id || placeData.place?.id || placeData.data?.id

      // 2. Add to guide with description
      const addRes = await fetch(`/api/city-guides/${id}/places`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          placeId,
          category: selectedCategory,
          description: pendingDescription.trim() || null,
        }),
      })
      const addData = await addRes.json()
      if (!addRes.ok) throw new Error(addData.error || 'Error al añadir el lugar')

      setSavedPlaceId(pendingPlace.googlePlaceId)
      setTimeout(() => setSavedPlaceId(null), 2000)
      showToast(`"${pendingPlace.name}" añadido a la guía`)
      setPendingPlace(null)
      setPendingDescription('')
      fetchGuide()
    } catch (e: any) {
      showToast(e.message)
    } finally {
      setAdding(false)
    }
  }

  const handleSaveDescription = async (guidePlace: GuidePlace) => {
    setSavingDescriptionId(guidePlace.id)
    try {
      const res = await fetch(`/api/city-guides/${id}/places/${guidePlace.id}/description`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ description: editingDescriptionText.trim() || null }),
      })
      if (!res.ok) throw new Error()
      setGuide(prev => prev ? {
        ...prev,
        places: prev.places.map(p =>
          p.id === guidePlace.id ? { ...p, description: editingDescriptionText.trim() || null } : p
        )
      } : prev)
      setEditingDescriptionId(null)
      showToast('Recomendación guardada')
    } catch {
      showToast('Error al guardar la recomendación')
    } finally {
      setSavingDescriptionId(null)
    }
  }

  const handleRemove = async (guidePlace: GuidePlace) => {
    if (!confirm(`¿Eliminar "${guidePlace.place.name}" de la guía?`)) return
    setRemovingId(guidePlace.id)
    try {
      const res = await fetch(`/api/city-guides/${id}/places`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ placeId: guidePlace.place.id }),
      })
      if (!res.ok) throw new Error()
      setGuide(prev => prev ? { ...prev, places: prev.places.filter(p => p.id !== guidePlace.id) } : prev)
      showToast('Lugar eliminado')
    } catch {
      showToast('Error al eliminar')
    } finally {
      setRemovingId(null)
    }
  }

  // Group by category
  const grouped = (guide?.places ?? []).reduce<Record<string, GuidePlace[]>>((acc, gp) => {
    const cat = gp.category || 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(gp)
    return acc
  }, {})

  const getCatLabel = (id: string) => CATEGORY_OPTIONS.find(c => c.id === id)?.label ?? id

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
      </div>
    )
  }

  if (!guide) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Back */}
        <Link
          href="/admin/city-guides"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a guías
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${
                  guide.status === 'VERIFIED' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                  guide.status === 'PUBLISHED' ? 'bg-violet-50 text-violet-600 border-violet-200' :
                  'bg-gray-100 text-gray-500 border-gray-200'
                }`}>
                  {guide.status === 'VERIFIED' && <Star className="w-3 h-3 fill-amber-400" />}
                  {guide.status === 'VERIFIED' ? 'Verificada' : guide.status === 'PUBLISHED' ? 'Publicada' : 'Borrador'}
                </span>
                <span className="text-xs text-gray-400">v{guide.version}</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">{guide.title}</h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-violet-500" />
                  {guide.city}, {guide.country}
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  {guide._count?.places ?? guide.places.length} lugares
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Add place */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-violet-500" />
            Añadir lugar
          </h2>

          {/* Category selector */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
              Categoría
            </label>
            <div className="relative max-w-xs">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 appearance-none focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent bg-white"
              >
                {CATEGORY_OPTIONS.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Search */}
          {!pendingPlace && (
            <PlaceSearchInput
              propertyLat={null}
              propertyLng={null}
              onSelect={handleSelect}
              placeholder={`Buscar lugar para añadir como ${getCatLabel(selectedCategory).toLowerCase()}...`}
              excludePlaceIds={[]}
            />
          )}

          {/* Pending place confirmation card */}
          {pendingPlace && (
            <div className="mt-3 border border-violet-200 rounded-xl overflow-hidden bg-violet-50/50">
              {/* Place header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-violet-100">
                {pendingPlace.photoUrl ? (
                  <img src={pendingPlace.photoUrl} alt={pendingPlace.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-violet-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{pendingPlace.name}</p>
                  <p className="text-xs text-gray-400 truncate">{pendingPlace.address}</p>
                </div>
                <button
                  onClick={() => { setPendingPlace(null); setPendingDescription('') }}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Description textarea */}
              <div className="px-4 py-3">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-violet-700 uppercase tracking-wide mb-2">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Tu recomendación personal (opcional)
                </label>
                <textarea
                  value={pendingDescription}
                  onChange={(e) => setPendingDescription(e.target.value)}
                  placeholder="Ej: Aquí te comes el mejor arroz de Alicante. Pide el arroz a banda y la ensalada de la casa. Solo con reserva en temporada alta."
                  rows={3}
                  className="w-full text-sm border border-violet-200 rounded-xl px-3 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent resize-none bg-white"
                />
                <p className="text-xs text-gray-400 mt-1.5">
                  Este texto aparecerá en la tarjeta del lugar cuando el huésped abra la guía.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 px-4 pb-3">
                <button
                  onClick={() => { setPendingPlace(null); setPendingDescription('') }}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-700 text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmAdd}
                  disabled={adding}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
                >
                  {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Añadir a la guía
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Places list */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">
              Lugares en la guía ({guide.places.length})
            </h2>
          </div>

          {guide.places.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Aún no hay lugares en esta guía</p>
              <p className="text-gray-300 text-xs mt-1">Usa el buscador de arriba para añadir</p>
            </div>
          ) : (
            <div>
              {Object.entries(grouped).map(([cat, places]) => (
                <div key={cat}>
                  <div className="px-6 py-2 bg-gray-50 border-b border-gray-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {getCatLabel(cat)}
                    </span>
                  </div>
                  {places.map((gp) => (
                    <div
                      key={gp.id}
                      className="px-6 py-3.5 border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {gp.place.photoUrl ? (
                          <img
                            src={gp.place.photoUrl}
                            alt={gp.place.name}
                            className="w-10 h-10 rounded-lg object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                            <MapPin className="w-4 h-4 text-violet-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{gp.place.name}</p>
                          <p className="text-xs text-gray-400 truncate">{gp.place.address}</p>
                        </div>
                        {gp.place.rating && (
                          <span className="flex items-center gap-0.5 text-xs text-amber-500 shrink-0">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {gp.place.rating}
                          </span>
                        )}
                        <button
                          onClick={() => {
                            setEditingDescriptionId(gp.id)
                            setEditingDescriptionText(gp.description ?? '')
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-violet-500 hover:bg-violet-50 transition-colors shrink-0"
                          title="Añadir recomendación"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemove(gp)}
                          disabled={removingId === gp.id}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors shrink-0"
                        >
                          {removingId === gp.id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Trash2 className="w-3.5 h-3.5" />
                          }
                        </button>
                      </div>

                      {/* Description display / edit */}
                      {editingDescriptionId === gp.id ? (
                        <div className="mt-2.5 ml-[52px]">
                          <textarea
                            value={editingDescriptionText}
                            onChange={(e) => setEditingDescriptionText(e.target.value)}
                            placeholder="Ej: Aquí te comes el mejor arroz de Alicante. Pide el arroz a banda, no te arrepentirás."
                            rows={2}
                            autoFocus
                            className="w-full text-sm border border-violet-200 rounded-xl px-3 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none bg-white mt-1"
                          />
                          <div className="flex items-center gap-2 mt-1.5">
                            <button
                              onClick={() => setEditingDescriptionId(null)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-gray-500 hover:text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                              <X className="w-3 h-3" /> Cancelar
                            </button>
                            <button
                              onClick={() => handleSaveDescription(gp)}
                              disabled={savingDescriptionId === gp.id}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 transition-colors"
                            >
                              {savingDescriptionId === gp.id
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : <Check className="w-3 h-3" />
                              }
                              Guardar
                            </button>
                          </div>
                        </div>
                      ) : gp.description ? (
                        <div
                          className="mt-2 ml-[52px] flex items-start gap-2 cursor-pointer group"
                          onClick={() => {
                            setEditingDescriptionId(gp.id)
                            setEditingDescriptionText(gp.description ?? '')
                          }}
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-violet-400 mt-0.5 shrink-0" />
                          <p className="text-xs text-violet-700 bg-violet-50 border border-violet-100 rounded-lg px-2.5 py-1.5 leading-relaxed group-hover:border-violet-300 transition-colors">
                            {gp.description}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-xl"
          >
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <span className="text-gray-800 text-sm">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
