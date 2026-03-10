'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, MapPin, Trash2, Loader2, CheckCircle, Plus, ChevronDown, Star, Globe,
  MessageSquare, Pencil, X, Check, ExternalLink, Tag, ChevronLeft, ChevronRight, Utensils
} from 'lucide-react'
import Link from 'next/link'
import { PlaceSearchInput, PlaceSearchResult } from '../../../../src/components/ui/PlaceSearchInput'
import { CATEGORIES, CATEGORY_GROUPS, getCategoryById } from '../../../../src/lib/recommendations/categories'

interface GuidePlace {
  id: string
  category: string
  description?: string | null
  highlight?: string | null
  externalUrl?: string | null
  tags?: string[] | null
  place: {
    id: string
    name: string
    address: string
    rating?: number | null
    priceLevel?: number | null
    photoUrl?: string | null
    photoUrls?: string[] | null
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

// Group categories by their group id for the grouped select
const CATEGORIES_BY_GROUP = CATEGORY_GROUPS.map(group => ({
  ...group,
  categories: CATEGORIES.filter(c => c.group === group.id),
})).filter(g => g.categories.length > 0)

function priceLabel(level: number | null | undefined) {
  if (level == null) return null
  return ['Gratis', '$', '$$', '$$$', '$$$$'][level] ?? null
}

function PhotoCarousel({ urls, name }: { urls: string[]; name: string }) {
  const [idx, setIdx] = useState(0)
  if (!urls.length) return (
    <div className="w-12 h-12 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
      <MapPin className="w-4 h-4 text-violet-400" />
    </div>
  )
  return (
    <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 group">
      <img src={urls[idx]} alt={name} className="w-full h-full object-cover" />
      {urls.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setIdx(i => (i - 1 + urls.length) % urls.length) }}
            className="absolute left-0 top-0 bottom-0 w-4 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-2.5 h-2.5 text-white" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setIdx(i => (i + 1) % urls.length) }}
            className="absolute right-0 top-0 bottom-0 w-4 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-2.5 h-2.5 text-white" />
          </button>
          <div className="absolute bottom-0.5 left-0 right-0 flex justify-center gap-0.5">
            {urls.map((_, i) => (
              <div key={i} className={`w-1 h-1 rounded-full ${i === idx ? 'bg-white' : 'bg-white/40'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function TagPicker({ selected, onChange, availableTags }: { selected: string[]; onChange: (tags: string[]) => void; availableTags: string[] }) {
  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter(t => t !== id) : [...selected, id])
  }
  if (!availableTags.length) return null
  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {availableTags.map(tagId => (
        <button
          key={tagId}
          type="button"
          onClick={() => toggle(tagId)}
          className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
            selected.includes(tagId)
              ? 'bg-violet-100 border-violet-300 text-violet-700'
              : 'bg-white border-gray-200 text-gray-500 hover:border-violet-200 hover:text-violet-600'
          }`}
        >
          {tagId.replace(/_/g, ' ')}
        </button>
      ))}
    </div>
  )
}

export default function AdminGuideDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [guide, setGuide] = useState<Guide | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]?.id ?? 'restaurant')
  const [adding, setAdding] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const [savedPlaceId, setSavedPlaceId] = useState<string | null>(null)
  const [pendingPlace, setPendingPlace] = useState<PlaceSearchResult | null>(null)
  const [pendingDescription, setPendingDescription] = useState('')
  const [pendingHighlight, setPendingHighlight] = useState('')
  const [pendingExternalUrl, setPendingExternalUrl] = useState('')
  const [pendingTags, setPendingTags] = useState<string[]>([])

  // Edit state per place
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ description: '', highlight: '', externalUrl: '', tags: [] as string[] })
  const [savingEditId, setSavingEditId] = useState<string | null>(null)

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
    setPendingHighlight('')
    setPendingExternalUrl('')
    setPendingTags([])
  }

  const handleConfirmAdd = async () => {
    if (!guide || !pendingPlace) return
    setAdding(true)
    try {
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
          photoUrls: pendingPlace.photoUrls,
          priceLevel: pendingPlace.priceLevel,
          types: pendingPlace.types,
          source: 'GOOGLE',
        }),
      })
      const placeData = await placeRes.json()
      if (!placeRes.ok) throw new Error(placeData.error || 'Error al guardar el lugar')
      const placeId = placeData.id || placeData.place?.id || placeData.data?.id

      const addRes = await fetch(`/api/city-guides/${id}/places`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          placeId,
          category: selectedCategory,
          description: pendingDescription.trim() || null,
          highlight: pendingHighlight.trim() || null,
          externalUrl: pendingExternalUrl.trim() || null,
          tags: pendingTags,
        }),
      })
      const addData = await addRes.json()
      if (!addRes.ok) throw new Error(addData.error || 'Error al añadir el lugar')

      setSavedPlaceId(pendingPlace.googlePlaceId)
      setTimeout(() => setSavedPlaceId(null), 2000)
      showToast(`"${pendingPlace.name}" añadido a la guía`)
      setPendingPlace(null)
      setPendingDescription('')
      setPendingHighlight('')
      setPendingExternalUrl('')
      setPendingTags([])
      fetchGuide()
    } catch (e: any) {
      showToast(e.message)
    } finally {
      setAdding(false)
    }
  }

  const startEdit = (gp: GuidePlace) => {
    setEditingId(gp.id)
    setEditForm({
      description: gp.description ?? '',
      highlight: gp.highlight ?? '',
      externalUrl: gp.externalUrl ?? '',
      tags: gp.tags ?? [],
    })
  }

  const handleSaveEdit = async (gp: GuidePlace) => {
    setSavingEditId(gp.id)
    try {
      const res = await fetch(`/api/city-guides/${id}/places/${gp.id}/description`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          description: editForm.description.trim() || null,
          highlight: editForm.highlight.trim() || null,
          externalUrl: editForm.externalUrl.trim() || null,
          tags: editForm.tags,
        }),
      })
      if (!res.ok) throw new Error()
      setGuide(prev => prev ? {
        ...prev,
        places: prev.places.map(p =>
          p.id === gp.id ? {
            ...p,
            description: editForm.description.trim() || null,
            highlight: editForm.highlight.trim() || null,
            externalUrl: editForm.externalUrl.trim() || null,
            tags: editForm.tags,
          } : p
        )
      } : prev)
      setEditingId(null)
      showToast('Lugar actualizado')
    } catch {
      showToast('Error al guardar')
    } finally {
      setSavingEditId(null)
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

  const grouped = (guide?.places ?? []).reduce<Record<string, GuidePlace[]>>((acc, gp) => {
    const cat = gp.category || 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(gp)
    return acc
  }, {})

  const getCatLabel = (id: string) => getCategoryById(id)?.label ?? id

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

        <Link href="/admin/city-guides" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm mb-6 transition-colors">
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

          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Categoría</label>
            <div className="relative max-w-xs">
              <select
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setPendingTags([]) }}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 appearance-none focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent bg-white"
              >
                {CATEGORIES_BY_GROUP.map(group => (
                  <optgroup key={group.id} label={`${group.emoji} ${group.label}`}>
                    {group.categories.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {!pendingPlace && (
            <PlaceSearchInput
              propertyLat={null}
              propertyLng={null}
              onSelect={handleSelect}
              placeholder={`Buscar lugar para añadir como ${getCatLabel(selectedCategory).toLowerCase()}...`}
              excludePlaceIds={[]}
            />
          )}

          {pendingPlace && (
            <div className="mt-3 border border-violet-200 rounded-xl overflow-hidden bg-violet-50/30">
              {/* Place header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-violet-100 bg-white">
                {pendingPlace.photoUrls?.length ? (
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0">
                    <img src={pendingPlace.photoUrls[0]} alt={pendingPlace.name} className="w-full h-full object-cover" />
                    {pendingPlace.photoUrls.length > 1 && (
                      <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1 rounded">
                        +{pendingPlace.photoUrls.length - 1}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-violet-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{pendingPlace.name}</p>
                  <p className="text-xs text-gray-400 truncate">{pendingPlace.address}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {pendingPlace.rating && (
                      <span className="flex items-center gap-0.5 text-xs text-amber-600">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {pendingPlace.rating.toFixed(1)}
                      </span>
                    )}
                    {priceLabel(pendingPlace.priceLevel) && (
                      <span className="text-xs text-gray-500 font-medium">{priceLabel(pendingPlace.priceLevel)}</span>
                    )}
                    {pendingPlace.photoUrls?.length > 1 && (
                      <span className="text-xs text-violet-600">{pendingPlace.photoUrls.length} fotos</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => { setPendingPlace(null); setPendingDescription(''); setPendingHighlight(''); setPendingExternalUrl(''); setPendingTags([]) }}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Extra fields */}
              <div className="px-4 py-4 space-y-4">
                {(() => {
                  const catConfig = getCategoryById(selectedCategory)
                  const highlightLabel = catConfig?.highlightLabel
                  const highlightPlaceholder = catConfig?.highlightPlaceholder ?? ''
                  const extUrlLabel = catConfig?.externalUrlLabel
                  const extUrlPlaceholder = catConfig?.externalUrlPlaceholder ?? 'https://...'
                  const catTags = catConfig?.tags ?? []
                  return (
                    <>
                      {/* Description */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-violet-700 uppercase tracking-wide mb-1.5">
                          <MessageSquare className="w-3.5 h-3.5" />
                          Recomendación personal <span className="text-gray-400 font-normal normal-case">(opcional)</span>
                        </label>
                        <textarea
                          value={pendingDescription}
                          onChange={(e) => setPendingDescription(e.target.value)}
                          placeholder="Tu recomendación personal para los huéspedes..."
                          rows={2}
                          className="w-full text-sm border border-violet-200 rounded-xl px-3 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none bg-white"
                        />
                      </div>

                      {/* Highlight (dynamic label) */}
                      {highlightLabel && (
                        <div>
                          <label className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 uppercase tracking-wide mb-1.5">
                            <Utensils className="w-3.5 h-3.5" />
                            {highlightLabel} <span className="text-gray-400 font-normal normal-case">(opcional)</span>
                          </label>
                          <input
                            type="text"
                            value={pendingHighlight}
                            onChange={(e) => setPendingHighlight(e.target.value)}
                            placeholder={highlightPlaceholder}
                            className="w-full text-sm border border-orange-200 rounded-xl px-3 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 bg-white"
                          />
                        </div>
                      )}

                      {/* External URL (dynamic label) */}
                      {extUrlLabel && (
                        <div>
                          <label className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1.5">
                            <ExternalLink className="w-3.5 h-3.5" />
                            {extUrlLabel} <span className="text-gray-400 font-normal normal-case">(opcional)</span>
                          </label>
                          <input
                            type="url"
                            value={pendingExternalUrl}
                            onChange={(e) => setPendingExternalUrl(e.target.value)}
                            placeholder={extUrlPlaceholder}
                            className="w-full text-sm border border-emerald-200 rounded-xl px-3 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 bg-white"
                          />
                        </div>
                      )}

                      {/* Tags (dynamic per category) */}
                      {catTags.length > 0 && (
                        <div>
                          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                            <Tag className="w-3.5 h-3.5" />
                            Etiquetas <span className="text-gray-400 font-normal normal-case">(opcional)</span>
                          </label>
                          <TagPicker selected={pendingTags} onChange={setPendingTags} availableTags={catTags} />
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>

              <div className="flex items-center gap-2 px-4 pb-4">
                <button
                  onClick={() => { setPendingPlace(null); setPendingDescription(''); setPendingHighlight(''); setPendingExternalUrl(''); setPendingTags([]) }}
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
                      {getCatLabel(cat)} ({places.length})
                    </span>
                  </div>
                  {places.map((gp) => {
                    const photos = (gp.place.photoUrls as string[] | null) || (gp.place.photoUrl ? [gp.place.photoUrl] : [])
                    const isEditing = editingId === gp.id
                    return (
                      <div key={gp.id} className="px-6 py-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-start gap-3">
                          <PhotoCarousel urls={photos} name={gp.place.name} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{gp.place.name}</p>
                                <p className="text-xs text-gray-400 truncate">{gp.place.address}</p>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                  {gp.place.rating && (
                                    <span className="flex items-center gap-0.5 text-xs text-amber-600">
                                      <Star className="w-3 h-3 fill-amber-400" />
                                      {gp.place.rating.toFixed(1)}
                                    </span>
                                  )}
                                  {priceLabel(gp.place.priceLevel) && (
                                    <span className="text-xs text-gray-500 font-medium">{priceLabel(gp.place.priceLevel)}</span>
                                  )}
                                  {photos.length > 1 && (
                                    <span className="text-xs text-violet-500">{photos.length} fotos</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => isEditing ? setEditingId(null) : startEdit(gp)}
                                  className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${isEditing ? 'text-violet-600 bg-violet-50' : 'text-gray-300 hover:text-violet-500 hover:bg-violet-50'}`}
                                  title="Editar"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleRemove(gp)}
                                  disabled={removingId === gp.id}
                                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                                >
                                  {removingId === gp.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>

                            {/* Display badges (not editing) */}
                            {!isEditing && (
                              <div className="mt-2 space-y-1.5">
                                {gp.description && (
                                  <div className="flex items-start gap-1.5">
                                    <MessageSquare className="w-3 h-3 text-violet-400 mt-0.5 shrink-0" />
                                    <p className="text-xs text-gray-600 leading-relaxed">{gp.description}</p>
                                  </div>
                                )}
                                {gp.highlight && (
                                  <div className="flex items-start gap-1.5">
                                    <Utensils className="w-3 h-3 text-orange-400 mt-0.5 shrink-0" />
                                    <p className="text-xs text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md">
                                      {getCategoryById(gp.category)?.highlightLabel && (
                                        <span className="font-semibold mr-1">{getCategoryById(gp.category)?.highlightLabel}:</span>
                                      )}
                                      {gp.highlight}
                                    </p>
                                  </div>
                                )}
                                {gp.externalUrl && (
                                  <a
                                    href={gp.externalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    {getCategoryById(gp.category)?.externalUrlLabel ?? 'Ver más'}
                                  </a>
                                )}
                                {gp.tags && gp.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {gp.tags.map(tag => (
                                      <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{tag.replace(/_/g, ' ')}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Edit form */}
                            {isEditing && (
                              <div className="mt-3 space-y-3 border-t border-gray-100 pt-3">
                                {(() => {
                                  const catConfig = getCategoryById(gp.category)
                                  const highlightLabel = catConfig?.highlightLabel
                                  const highlightPlaceholder = catConfig?.highlightPlaceholder ?? ''
                                  const extUrlLabel = catConfig?.externalUrlLabel
                                  const extUrlPlaceholder = catConfig?.externalUrlPlaceholder ?? 'https://...'
                                  const catTags = catConfig?.tags ?? []
                                  return (
                                    <>
                                      <div>
                                        <label className="flex items-center gap-1 text-xs font-medium text-violet-700 mb-1">
                                          <MessageSquare className="w-3 h-3" /> Recomendación
                                        </label>
                                        <textarea
                                          value={editForm.description}
                                          onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))}
                                          rows={2}
                                          placeholder="Tu recomendación personal..."
                                          autoFocus
                                          className="w-full text-sm border border-violet-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none bg-white"
                                        />
                                      </div>
                                      {highlightLabel && (
                                        <div>
                                          <label className="flex items-center gap-1 text-xs font-medium text-orange-600 mb-1">
                                            <Utensils className="w-3 h-3" /> {highlightLabel}
                                          </label>
                                          <input
                                            type="text"
                                            value={editForm.highlight}
                                            onChange={(e) => setEditForm(f => ({ ...f, highlight: e.target.value }))}
                                            placeholder={highlightPlaceholder}
                                            className="w-full text-sm border border-orange-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200 bg-white"
                                          />
                                        </div>
                                      )}
                                      {extUrlLabel && (
                                        <div>
                                          <label className="flex items-center gap-1 text-xs font-medium text-emerald-700 mb-1">
                                            <ExternalLink className="w-3 h-3" /> {extUrlLabel}
                                          </label>
                                          <input
                                            type="url"
                                            value={editForm.externalUrl}
                                            onChange={(e) => setEditForm(f => ({ ...f, externalUrl: e.target.value }))}
                                            placeholder={extUrlPlaceholder}
                                            className="w-full text-sm border border-emerald-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200 bg-white"
                                          />
                                        </div>
                                      )}
                                      {catTags.length > 0 && (
                                        <div>
                                          <label className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1">
                                            <Tag className="w-3 h-3" /> Etiquetas
                                          </label>
                                          <TagPicker
                                            selected={editForm.tags}
                                            onChange={(tags) => setEditForm(f => ({ ...f, tags }))}
                                            availableTags={catTags}
                                          />
                                        </div>
                                      )}
                                    </>
                                  )
                                })()}
                              <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
                                  >
                                    <X className="w-3 h-3" /> Cancelar
                                  </button>
                                  <button
                                    onClick={() => handleSaveEdit(gp)}
                                    disabled={savingEditId === gp.id}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 transition-colors"
                                  >
                                    {savingEditId === gp.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                    Guardar
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
