'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { CityGuidesBanner } from './CityGuidesBanner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Search,
  Trash2,
  GripVertical,
  Star,
  MapPin,
  Plus,
  ExternalLink,
  Pencil,
  Check,
  X,
  Loader2,
  ChevronDown,
  MessageSquare,
  Utensils,
  Tag,
  Sparkles,
  Bell,
  Info,
  ChevronRight,
} from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ZoneIconDisplay } from './IconSelector'
import { PlaceSearchInput, PlaceSearchResult } from './PlaceSearchInput'
import { CATEGORIES, getCategoryById, getCategoryLabel } from '../../lib/recommendations/categories'

// --- Types ---

interface Place {
  id: string
  placeId?: string | null
  name: string
  address: string
  latitude: number
  longitude: number
  rating?: number | null
  photoUrl?: string | null
  types?: any
  source: string
}

interface Recommendation {
  id: string
  zoneId: string
  placeId: string | null
  description: string | null
  descriptionTranslations?: any
  highlight: string | null
  externalUrl: string | null
  tags: any
  source: string
  distanceMeters: number | null
  walkMinutes: number | null
  order: number
  place: Place | null
}

interface ZoneInfo {
  id: string
  name: string
  iconId: string
  type?: string
  recommendationCategory?: string
  recommendationsCount?: number
}

interface RecommendationsEditorProps {
  mode: 'global' | 'zone'
  // Global mode props
  propertyId: string
  propertyLat: number | null
  propertyLng: number | null
  existingZones?: ZoneInfo[]
  // Zone mode props
  zone?: ZoneInfo
  // Common
  propertyCity?: string
  onClose: () => void
  onUpdate: () => void
}

// --- Google types → categoryId mapping ---

const GOOGLE_TYPE_TO_CATEGORY: Record<string, string> = {
  gas_station: 'gas_station',
  restaurant: 'restaurant',
  cafe: 'cafe',
  pharmacy: 'pharmacy',
  hospital: 'hospital',
  parking: 'parking',
  supermarket: 'supermarket',
  grocery_or_supermarket: 'supermarket',
  atm: 'atm',
  gym: 'gym',
  laundry: 'laundry',
  transit_station: 'transit_station',
  train_station: 'transit_station',
  bus_station: 'transit_station',
  subway_station: 'transit_station',
  tourist_attraction: 'tourist_attraction',
  park: 'park',
  beach: 'beach',
  shopping_mall: 'shopping_mall',
  department_store: 'shopping_mall',
  food: 'restaurant',
  meal_delivery: 'restaurant',
  meal_takeaway: 'restaurant',
  bar: 'restaurant',
  bakery: 'cafe',
  drugstore: 'pharmacy',
  doctor: 'hospital',
  dentist: 'hospital',
  physiotherapist: 'hospital',
  veterinary_care: 'hospital',
  clothing_store: 'shopping_mall',
  shoe_store: 'shopping_mall',
  electronics_store: 'shopping_mall',
  museum: 'tourist_attraction',
  church: 'tourist_attraction',
  art_gallery: 'tourist_attraction',
  amusement_park: 'tourist_attraction',
  zoo: 'tourist_attraction',
  aquarium: 'tourist_attraction',
  stadium: 'tourist_attraction',
  spa: 'gym',
  campground: 'park',
  natural_feature: 'park',
}

function suggestCategory(types: string[]): string {
  for (const t of types) {
    if (GOOGLE_TYPE_TO_CATEGORY[t]) return GOOGLE_TYPE_TO_CATEGORY[t]
  }
  return 'restaurant' // default fallback
}

// --- Category inspiration chips (shown in global mode to guide the user) ---
const INSPIRATION_CHIPS = [
  { emoji: '🍽️', label: 'Restaurantes',     query: 'restaurante',    categoryId: 'restaurant' },
  { emoji: '☕', label: 'Cafeterías',        query: 'cafetería café',  categoryId: 'cafe' },
  { emoji: '🛒', label: 'Supermercado',      query: 'supermercado',   categoryId: 'supermarket' },
  { emoji: '💊', label: 'Farmacia',          query: 'farmacia',       categoryId: 'pharmacy' },
  { emoji: '🏛️', label: 'Monumentos',        query: 'monumento',      categoryId: 'tourist_attraction' },
  { emoji: '🌿', label: 'Parques',           query: 'parque',         categoryId: 'park' },
  { emoji: '🍸', label: 'Bares',             query: 'bar',            categoryId: 'bar' },
  { emoji: '🌊', label: 'Playas',            query: 'playa',          categoryId: 'beach' },
  { emoji: '🛍️', label: 'Compras',           query: 'tiendas',        categoryId: 'shopping_mall' },
  { emoji: '🚌', label: 'Transporte',        query: 'parada bus metro', categoryId: 'transit_station' },
  { emoji: '🏧', label: 'Cajero',            query: 'cajero automático', categoryId: 'atm' },
  { emoji: '🎨', label: 'Arte & Cultura',    query: 'museo galería',  categoryId: 'museum' },
]

// --- Pending item (selected but not yet saved) ---

interface PendingItem {
  result: PlaceSearchResult
  categoryId: string
  description: string
  highlight: string
  externalUrl: string
  tags: string[]
  saving: boolean
}

// --- Added item (confirmed) ---

interface AddedItem {
  recommendationId: string
  zoneId: string
  googlePlaceId: string | null
  name: string
  address: string
  rating: number | null
  photoUrl: string | null
  categoryLabel: string
  categoryIcon: string
  deleting?: boolean
}

// --- Sortable Card (admin-style row) ---

function SortableRecommendationCard({
  rec,
  onDelete,
  onEditDescription,
  currentCategory,
}: {
  rec: Recommendation
  onDelete: (id: string) => void
  onEditDescription: (id: string, desc: string, highlight?: string, externalUrl?: string, tags?: string, categoryId?: string) => void
  currentCategory?: string
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: rec.id })
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(rec.description || '')
  const [editHighlight, setEditHighlight] = useState(rec.highlight || '')
  const [editExternalUrl, setEditExternalUrl] = useState(rec.externalUrl || '')
  const [editTags, setEditTags] = useState(Array.isArray(rec.tags) ? rec.tags.join(', ') : '')
  const [editCategory, setEditCategory] = useState(currentCategory || '')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  }

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(editText.length, editText.length)
    }
  }, [isEditing])

  const handleSaveDescription = () => {
    onEditDescription(rec.id, editText, editHighlight, editExternalUrl, editTags, editCategory !== currentCategory ? editCategory : undefined)
    setIsEditing(false)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border-b border-gray-50 last:border-0 transition-colors ${isDragging ? 'bg-violet-50 shadow-md' : 'hover:bg-gray-50/50'}`}
    >
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-start gap-3">
          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing mt-1 p-0.5 hover:bg-gray-100 rounded flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-3.5 h-3.5 text-gray-300" />
          </div>

          {/* Photo */}
          {rec.place?.photoUrl ? (
            <img
              src={rec.place.photoUrl as string}
              alt={rec.place.name}
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-violet-400" />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{rec.place?.name || 'Sin nombre'}</p>
                <p className="text-xs text-gray-400 truncate">{rec.place?.address}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {rec.place?.rating && (
                    <span className="flex items-center gap-0.5 text-xs text-amber-600">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {(rec.place.rating as number).toFixed(1)}
                    </span>
                  )}
                  {(rec.distanceMeters || rec.walkMinutes) && (
                    <span className="text-xs text-gray-400">
                      {rec.distanceMeters && (rec.distanceMeters < 1000 ? `${rec.distanceMeters}m` : `${(rec.distanceMeters / 1000).toFixed(1)}km`)}
                      {rec.walkMinutes && ` · ${rec.walkMinutes}min a pie`}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {!showDeleteConfirm && (
                  <button
                    onClick={() => {
                      setIsEditing(e => !e)
                      if (!isEditing) {
                        setEditText(rec.description || '')
                        setEditHighlight(rec.highlight || '')
                        setEditExternalUrl(rec.externalUrl || '')
                        setEditTags(Array.isArray(rec.tags) ? rec.tags.join(', ') : '')
                        setEditCategory(currentCategory || '')
                      }
                    }}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${isEditing ? 'text-violet-600 bg-violet-50' : 'text-gray-300 hover:text-violet-500 hover:bg-violet-50'}`}
                    title="Editar"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
                {showDeleteConfirm ? (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-red-600 whitespace-nowrap">¿Eliminar?</span>
                    <button onClick={() => onDelete(rec.id)} className="text-xs px-2 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700">Sí</button>
                    <button onClick={() => setShowDeleteConfirm(false)} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">No</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Badges (not editing) */}
            {!isEditing && (
              <div className="mt-1.5 space-y-1">
                {rec.description && (
                  <div className="flex items-start gap-1.5">
                    <MessageSquare className="w-3 h-3 text-violet-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-600 leading-relaxed italic">{rec.description}</p>
                  </div>
                )}
                {rec.highlight && (
                  <p className="text-xs text-orange-700 bg-orange-50 inline-flex items-center gap-1 px-2 py-0.5 rounded-md">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
                    {rec.highlight}
                  </p>
                )}
                {rec.externalUrl && (
                  <a href={rec.externalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 truncate">
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    {rec.externalUrl}
                  </a>
                )}
                {Array.isArray(rec.tags) && rec.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {(rec.tags as string[]).map((tag, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{tag.replace(/_/g, ' ')}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Edit form */}
            {isEditing && (
              <div className="mt-3 space-y-3 border-t border-gray-100 pt-3">
                {currentCategory !== undefined && (
                  <div>
                    <label className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1">
                      Categoría
                    </label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                    {editCategory !== currentCategory && (
                      <p className="text-xs text-amber-600 mt-1">⚠️ Se moverá a la categoría "{getCategoryLabel(editCategory)}"</p>
                    )}
                  </div>
                )}
                <div>
                  <label className="flex items-center gap-1 text-xs font-medium text-violet-700 mb-1">
                    <MessageSquare className="w-3 h-3" /> Recomendación personal
                  </label>
                  <textarea
                    ref={textareaRef}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full text-sm border border-violet-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none bg-white"
                    rows={2}
                    placeholder="Tu recomendación personal..."
                  />
                </div>
                <input
                  type="text"
                  value={editHighlight}
                  onChange={(e) => setEditHighlight(e.target.value)}
                  className="w-full text-sm border border-orange-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200 bg-white"
                  placeholder="Plato estrella / Destacado..."
                />
                <input
                  type="url"
                  value={editExternalUrl}
                  onChange={(e) => setEditExternalUrl(e.target.value)}
                  className="w-full text-sm border border-emerald-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200 bg-white"
                  placeholder="URL externa (https://...)"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveDescription}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-white bg-violet-600 hover:bg-violet-700 transition-colors"
                  >
                    <Check className="w-3 h-3" /> Guardar
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setEditText(rec.description || '')
                      setEditHighlight(rec.highlight || '')
                      setEditExternalUrl(rec.externalUrl || '')
                      setEditTags(Array.isArray(rec.tags) ? rec.tags.join(', ') : '')
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <X className="w-3 h-3" /> Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function RecommendationsEditor({
  mode,
  propertyId,
  propertyLat,
  propertyLng,
  existingZones = [],
  zone,
  propertyCity = '',
  onClose,
  onUpdate,
}: RecommendationsEditorProps) {
  // Zone mode state
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(mode === 'zone')
  const [hasChanges, setHasChanges] = useState(false)

  // Global mode state
  const [pending, setPending] = useState<PendingItem | null>(null)
  const [addedItems, setAddedItems] = useState<AddedItem[]>([])
  const [loadingExisting, setLoadingExisting] = useState(mode === 'global')
  const [toast, setToast] = useState<string | null>(null)
  // Category chip → pre-fill search; key forces PlaceSearchInput remount
  const [searchSeed, setSearchSeed] = useState<{ key: string; query: string }>({ key: '', query: '' })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Collect all googlePlaceIds already in recommendations (zone mode)
  const excludePlaceIds = recommendations
    .map(r => r.place?.placeId)
    .filter((id): id is string => !!id)

  // Exclude from global mode: all places already added across all zones + current pending
  const globalExcludePlaceIds = [
    ...addedItems.map(i => i.googlePlaceId).filter((id): id is string => !!id),
    ...(pending ? [pending.result.googlePlaceId] : []),
  ]

  // --- Global mode: load existing recommendations on mount ---
  useEffect(() => {
    if (mode !== 'global') return
    const load = async () => {
      try {
        const res = await fetch(`/api/properties/${propertyId}/recommendations`, { credentials: 'include' })
        const data = await res.json()
        if (!data.success) return
        const items: AddedItem[] = []
        for (const zone of data.data as any[]) {
          const cat = getCategoryById(zone.categoryId)
          for (const rec of zone.recommendations) {
            if (!rec.place) continue
            items.push({
              recommendationId: rec.id,
              zoneId: zone.id,
              googlePlaceId: rec.place.placeId ?? null,
              name: rec.place.name,
              address: rec.place.address,
              rating: rec.place.rating ?? null,
              photoUrl: rec.place.photoUrl ?? null,
              categoryLabel: getCategoryLabel(zone.categoryId),
              categoryIcon: cat?.icon ?? 'MapPin',
            })
          }
        }
        setAddedItems(items)
      } catch {
        // silently ignore — not critical
      } finally {
        setLoadingExisting(false)
      }
    }
    load()
  }, [mode, propertyId])

  // --- Zone mode: fetch recommendations ---
  const fetchRecommendations = useCallback(async () => {
    if (mode !== 'zone' || !zone) return
    try {
      const res = await fetch(`/api/properties/${propertyId}/zones/${zone.id}/recommendations`, {
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success) {
        setRecommendations(data.data)
      }
    } catch (err) {
      // fetch error suppressed
    } finally {
      setLoading(false)
    }
  }, [mode, propertyId, zone])

  useEffect(() => {
    fetchRecommendations()
  }, [fetchRecommendations])

  // --- Zone mode: select place → show pending card (same as global) ---
  const handleAddToZone = (result: PlaceSearchResult) => {
    const category = zone?.recommendationCategory ?? suggestCategory(result.types)
    setPending({ result, categoryId: category, description: '', highlight: '', externalUrl: '', tags: [], saving: false })
  }

  // --- Zone mode: confirm pending → POST to zone endpoint ---
  const handleConfirmAddToZone = async () => {
    if (!pending || !zone) return
    setPending(prev => prev ? { ...prev, saving: true } : null)
    try {
      const res = await fetch(`/api/properties/${propertyId}/zones/${zone.id}/recommendations`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          googlePlaceId: pending.result.googlePlaceId,
          name: pending.result.name,
          address: pending.result.address,
          lat: pending.result.lat,
          lng: pending.result.lng,
          rating: pending.result.rating,
          photoUrl: pending.result.photoUrl,
          types: pending.result.types,
          description: pending.description || null,
          highlight: pending.highlight || null,
          externalUrl: pending.externalUrl || null,
          tags: pending.tags.length > 0 ? pending.tags : null,
          propertyLat,
          propertyLng,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setRecommendations(prev => [...prev, data.data])
        setHasChanges(true)
        setPending(null)
        setToast(`✓ "${pending.result.name}" añadido`)
        setTimeout(() => setToast(null), 2500)
      } else {
        setToast(data.error || 'Error al añadir')
        setTimeout(() => setToast(null), 3000)
        setPending(prev => prev ? { ...prev, saving: false } : null)
      }
    } catch (err) {
      // add error suppressed
      setPending(prev => prev ? { ...prev, saving: false } : null)
    }
  }

  // --- Global mode: select place → show pending card ---
  const handleGlobalSelect = (result: PlaceSearchResult) => {
    const suggested = suggestCategory(result.types)
    setPending({ result, categoryId: suggested, description: '', highlight: '', externalUrl: '', tags: [], saving: false })
  }

  // --- Global mode: confirm pending → POST unified endpoint ---
  const handleConfirmAdd = async () => {
    if (!pending) return
    setPending(prev => prev ? { ...prev, saving: true } : null)

    try {
      const res = await fetch(`/api/properties/${propertyId}/recommendations/add`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          googlePlaceId: pending.result.googlePlaceId,
          name: pending.result.name,
          address: pending.result.address,
          lat: pending.result.lat,
          lng: pending.result.lng,
          rating: pending.result.rating,
          photoUrl: pending.result.photoUrl,
          types: pending.result.types,
          categoryId: pending.categoryId,
          description: pending.description || null,
          highlight: pending.highlight || null,
          externalUrl: pending.externalUrl || null,
          tags: pending.tags.length > 0 ? pending.tags : null,
          propertyLat,
          propertyLng,
        }),
      })
      const data = await res.json()
      if (data.success) {
        const cat = getCategoryById(pending.categoryId)
        const catLabel = getCategoryLabel(pending.categoryId)
        const newItem = {
          recommendationId: data.data.recommendation.id,
          zoneId: data.data.zone.id,
          googlePlaceId: pending!.result.googlePlaceId ?? null,
          name: pending!.result.name,
          address: pending!.result.address,
          rating: pending!.result.rating,
          photoUrl: pending!.result.photoUrl,
          categoryLabel: catLabel,
          categoryIcon: cat?.icon || 'MapPin',
        }
        // Only add to list if not already there
        setAddedItems(prev =>
          prev.some(i => i.recommendationId === data.data.recommendation.id)
            ? prev
            : [...prev, newItem]
        )
        setPending(null)
        setHasChanges(true)

        if (data.alreadyExists) {
          setToast(`"${pending!.result.name}" ya estaba en la lista`)
        } else if (data.data.zoneCreated) {
          setToast(`✓ Zona "${catLabel}" creada con el lugar`)
        } else {
          setToast(`✓ "${pending!.result.name}" añadido`)
        }
        setTimeout(() => setToast(null), 3000)
        onUpdate()
      } else {
        setToast(`Error: ${data.error || 'No se pudo añadir'}`)
        setTimeout(() => setToast(null), 4000)
      }
    } catch (err) {
      // add error suppressed
      setPending(prev => prev ? { ...prev, saving: false } : null)
    }
  }

  // --- Global mode: delete added item ---
  const handleDeleteAdded = async (index: number) => {
    const item = addedItems[index]
    if (!item) return
    setAddedItems(prev => prev.map((it, i) => i === index ? { ...it, deleting: true } : it))
    try {
      const res = await fetch(
        `/api/properties/${propertyId}/zones/${item.zoneId}/recommendations/${item.recommendationId}`,
        { method: 'DELETE', credentials: 'include' }
      )
      if (res.ok) {
        setAddedItems(prev => prev.filter((_, i) => i !== index))
        setToast(`"${item.name}" eliminado`)
        setTimeout(() => setToast(null), 2500)
        onUpdate()
      }
    } catch (err) {
      // delete error suppressed
      setAddedItems(prev => prev.map((it, i) => i === index ? { ...it, deleting: false } : it))
    }
  }

  // --- Zone mode: delete ---
  const handleDelete = async (recId: string) => {
    if (!zone) return
    try {
      const res = await fetch(
        `/api/properties/${propertyId}/zones/${zone.id}/recommendations/${recId}`,
        { method: 'DELETE', credentials: 'include' }
      )
      if (res.ok) {
        setRecommendations(prev => prev.filter(r => r.id !== recId))
        setHasChanges(true)
      }
    } catch (err) {
      // delete error suppressed
    }
  }

  // --- Zone mode: edit fields ---
  const handleEditDescription = async (recId: string, description: string, highlight?: string, externalUrl?: string, tagsStr?: string, categoryId?: string) => {
    if (!zone) return
    const tags = tagsStr ? tagsStr.split(',').map((t: string) => t.trim()).filter(Boolean) : null
    try {
      const res = await fetch(
        `/api/properties/${propertyId}/zones/${zone.id}/recommendations/${recId}`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description, highlight: highlight || null, externalUrl: externalUrl || null, tags, ...(categoryId && { categoryId }) }),
        }
      )
      if (res.ok) {
        const data = await res.json()
        if (data.movedToZone) {
          // Rec moved to another zone — remove from current list and trigger refresh
          setRecommendations(prev => prev.filter(r => r.id !== recId))
          setHasChanges(true)
          onUpdate()
        } else {
          setRecommendations(prev =>
            prev.map(r => r.id === recId ? { ...r, description, highlight: highlight || null, externalUrl: externalUrl || null, tags: tags || null } : r)
          )
          setHasChanges(true)
        }
      }
    } catch (err) {
      // edit error suppressed
    }
  }

  // --- Zone mode: drag & drop reorder ---
  const handleDragEnd = async (event: DragEndEvent) => {
    if (!zone) return
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = recommendations.findIndex(r => r.id === active.id)
    const newIndex = recommendations.findIndex(r => r.id === over.id)

    const reordered = arrayMove(recommendations, oldIndex, newIndex).map((r, i) => ({
      ...r,
      order: i,
    }))

    setRecommendations(reordered)
    setHasChanges(true)

    try {
      await fetch(`/api/properties/${propertyId}/zones/${zone.id}/recommendations`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reorder: reordered.map(r => ({ id: r.id, order: r.order })),
        }),
      })
    } catch (err) {
      // reorder error suppressed
    }
  }

  const handleClose = () => {
    if (hasChanges) onUpdate()
    onClose()
  }

  // ==========================================
  // RENDER
  // ==========================================

  if (mode === 'global') {
    return (
      <div className="fixed inset-0 bg-gray-50 z-[200] overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sticky top-0 z-10">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <button
              onClick={handleClose}
              className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full p-2 transition-colors flex-shrink-0"
              aria-label="Volver"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Añadir lugar</h1>
              <p className="text-gray-500 text-xs sm:text-sm">Elige una categoría o busca directamente</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          {/* City guides banner — import or update notifications */}
          {propertyCity && (
            <CityGuidesBanner
              city={propertyCity}
              propertyId={propertyId}
              onImported={onUpdate}
            />
          )}

          {/* Inspiration chips — ideas of what to add */}
          {!pending && (
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-violet-500" />
                <h2 className="text-sm font-semibold text-gray-700">Ideas de lugares para añadir</h2>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {INSPIRATION_CHIPS.map(chip => {
                  const isCovered = existingZones.some(z =>
                    z.recommendationCategory === chip.categoryId ||
                    addedItems.some(a => a.categoryLabel === chip.label)
                  )
                  return (
                    <button
                      key={chip.categoryId}
                      onClick={() => setSearchSeed({ key: chip.categoryId + Date.now(), query: chip.query })}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-center transition-all ${
                        isCovered
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-white border-gray-100 hover:border-violet-300 hover:bg-violet-50 text-gray-600 hover:text-violet-700'
                      }`}
                    >
                      <span className="text-xl leading-none">{chip.emoji}</span>
                      <span className="text-[11px] font-medium leading-tight">{chip.label}</span>
                      {isCovered && <span className="text-[10px] text-emerald-600 font-medium">✓</span>}
                    </button>
                  )
                })}
              </div>
              {/* Auto-update info */}
              {propertyCity && (
                <div className="mt-3 flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
                  <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">
                    Si importas la <strong>Guía de {propertyCity}</strong>, Itineramio te avisará cuando se añadan nuevos lugares para que puedas aceptarlos con un clic.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Search */}
          <PlaceSearchInput
            key={searchSeed.key}
            propertyLat={propertyLat}
            propertyLng={propertyLng}
            onSelect={handleGlobalSelect}
            placeholder="Buscar restaurante, farmacia, gasolinera..."
            excludePlaceIds={globalExcludePlaceIds}
            initialQuery={searchSeed.query}
          />

          {/* Pending card */}
          <AnimatePresence>
            {pending && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 bg-white border-2 border-violet-200 rounded-2xl overflow-hidden shadow-lg"
              >
                {/* Photo banner */}
                {pending.result.photoUrl ? (
                  <div className="relative h-36 sm:h-44 bg-gray-100">
                    <img
                      src={pending.result.photoUrl}
                      alt={pending.result.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <button
                      onClick={() => setPending(null)}
                      className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white rounded-full p-1.5 hover:bg-black/60 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="font-bold text-white text-lg leading-tight truncate">{pending.result.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        {pending.result.rating && (
                          <span className="flex items-center gap-0.5 text-sm text-amber-300 font-medium">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            {pending.result.rating.toFixed(1)}
                          </span>
                        )}
                        <span className="text-white/80 text-xs truncate">{pending.result.address}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 pt-4 pb-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-5 h-5 text-violet-600" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-gray-900 truncate">{pending.result.name}</h3>
                            <div className="flex items-center gap-1.5">
                              {pending.result.rating && (
                                <span className="flex items-center text-xs text-amber-600 font-medium">
                                  <Star className="w-3 h-3 mr-0.5 fill-amber-400 text-amber-400" />
                                  {pending.result.rating.toFixed(1)}
                                </span>
                              )}
                              <span className="text-xs text-gray-500 truncate">{pending.result.address}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setPending(null)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Category + Extra fields + Actions */}
                <div className="px-4 py-4">
                  {/* Category */}
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Categoría</label>
                  <div className="relative mb-4">
                    <select
                      value={pending.categoryId}
                      onChange={(e) => setPending(prev => prev ? { ...prev, categoryId: e.target.value, tags: [] } : null)}
                      className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium pr-10 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Extra fields — admin-style */}
                  {(() => {
                    const catConfig = getCategoryById(pending.categoryId)
                    const highlightLabel = catConfig?.highlightLabel
                    const highlightPlaceholder = catConfig?.highlightPlaceholder ?? ''
                    const extUrlLabel = catConfig?.externalUrlLabel
                    const extUrlPlaceholder = catConfig?.externalUrlPlaceholder ?? 'https://...'
                    const catTags = catConfig?.tags ?? []
                    return (
                      <div className="space-y-4">
                        {/* Description */}
                        <div>
                          <label className="flex items-center gap-1.5 text-xs font-semibold text-violet-700 uppercase tracking-wide mb-1.5">
                            <MessageSquare className="w-3.5 h-3.5" />
                            Recomendación personal <span className="text-gray-400 font-normal normal-case">(opcional)</span>
                          </label>
                          <textarea
                            value={pending.description}
                            onChange={(e) => setPending(prev => prev ? { ...prev, description: e.target.value } : null)}
                            placeholder="Tu recomendación personal para los huéspedes..."
                            rows={2}
                            className="w-full text-sm border border-violet-200 rounded-xl px-3 py-2.5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"
                          />
                        </div>

                        {/* Highlight (dynamic label per category) */}
                        {highlightLabel && (
                          <div>
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 uppercase tracking-wide mb-1.5">
                              <Utensils className="w-3.5 h-3.5" />
                              {highlightLabel} <span className="text-gray-400 font-normal normal-case">(opcional)</span>
                            </label>
                            <input
                              type="text"
                              value={pending.highlight}
                              onChange={(e) => setPending(prev => prev ? { ...prev, highlight: e.target.value } : null)}
                              placeholder={highlightPlaceholder}
                              className="w-full text-sm border border-orange-200 rounded-xl px-3 py-2.5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                            />
                          </div>
                        )}

                        {/* External URL (dynamic label per category) */}
                        {extUrlLabel && (
                          <div>
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1.5">
                              <ExternalLink className="w-3.5 h-3.5" />
                              {extUrlLabel} <span className="text-gray-400 font-normal normal-case">(opcional)</span>
                            </label>
                            <input
                              type="url"
                              value={pending.externalUrl}
                              onChange={(e) => setPending(prev => prev ? { ...prev, externalUrl: e.target.value } : null)}
                              placeholder={extUrlPlaceholder}
                              className="w-full text-sm border border-emerald-200 rounded-xl px-3 py-2.5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                            />
                          </div>
                        )}

                        {/* Tags (chip selector per category) */}
                        {catTags.length > 0 && (
                          <div>
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                              <Tag className="w-3.5 h-3.5" />
                              Etiquetas <span className="text-gray-400 font-normal normal-case">(opcional)</span>
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                              {catTags.map(tagId => (
                                <button
                                  key={tagId}
                                  type="button"
                                  onClick={() => setPending(prev => {
                                    if (!prev) return null
                                    const newTags = prev.tags.includes(tagId)
                                      ? prev.tags.filter(t => t !== tagId)
                                      : [...prev.tags, tagId]
                                    return { ...prev, tags: newTags }
                                  })}
                                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                                    pending.tags.includes(tagId)
                                      ? 'bg-violet-100 border-violet-300 text-violet-700'
                                      : 'bg-white border-gray-200 text-gray-500 hover:border-violet-200 hover:text-violet-600'
                                  }`}
                                >
                                  {tagId.replace(/_/g, ' ')}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setPending(null)}
                      className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleConfirmAdd}
                      disabled={pending.saving}
                      className="flex-1 px-4 py-2.5 text-sm font-medium bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      {pending.saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Añadir a zona
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Added items list */}
          {loadingExisting ? (
            <div className="flex items-center justify-center gap-2 py-10 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Cargando recomendaciones...</span>
            </div>
          ) : addedItems.length > 0 ? (
            <div className="mt-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900">Lugares añadidos ({addedItems.length})</h3>
                </div>
                {/* Group by category, admin-style */}
                {(() => {
                  const grouped: Record<string, { label: string; items: { item: AddedItem; index: number }[] }> = {}
                  addedItems.forEach((item, i) => {
                    const key = item.categoryLabel
                    if (!grouped[key]) grouped[key] = { label: item.categoryLabel, items: [] }
                    grouped[key].items.push({ item, index: i })
                  })
                  return Object.values(grouped).map(group => (
                    <div key={group.label}>
                      {/* Category header */}
                      <div className="px-6 py-2 bg-gray-50 border-b border-gray-100">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          {group.label} ({group.items.length})
                        </span>
                      </div>
                      {group.items.map(({ item, index }) => (
                        <motion.div
                          key={`${item.recommendationId}-${index}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: item.deleting ? 0.5 : 1, x: 0 }}
                          exit={{ opacity: 0, x: 100 }}
                          transition={{ delay: index * 0.03 }}
                          className="flex items-center gap-3 px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                        >
                          {item.photoUrl ? (
                            <img
                              src={item.photoUrl}
                              alt={item.name}
                              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                              <MapPin className="w-4 h-4 text-violet-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900 truncate">{item.name}</span>
                              {item.rating && (
                                <span className="flex items-center text-xs text-amber-600 flex-shrink-0">
                                  <Star className="w-3 h-3 mr-0.5 fill-amber-400 text-amber-400" />
                                  {item.rating.toFixed(1)}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 truncate">{item.address}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteAdded(index)}
                            disabled={item.deleting}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors flex-shrink-0 disabled:opacity-50"
                          >
                            {item.deleting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  ))
                })()}
              </div>
            </div>
          ) : !pending && !loadingExisting && (
            <div className="mt-8 text-center py-8 text-gray-400">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Aún no has añadido ningún lugar</p>
              <p className="text-xs mt-1">Usa las categorías de arriba o busca directamente</p>
            </div>
          )}
        </div>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm z-[200]"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // ==========================================
  // ZONE MODE
  // ==========================================

  const publicUrl = zone
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/guide/${propertyId}/${zone.id}`
    : ''

  return (
    <div className="fixed inset-0 bg-gray-50 z-[200] overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full p-2 transition-colors flex-shrink-0"
              aria-label="Volver"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            {zone && <ZoneIconDisplay iconId={zone.iconId} size="md" />}
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">{zone?.name || 'Zona'}</h1>
              <p className="text-gray-500 text-xs sm:text-sm">
                {recommendations.length} {recommendations.length === 1 ? 'lugar' : 'lugares'}
              </p>
            </div>
          </div>
          <button
            onClick={() => window.open(publicUrl, '_blank')}
            className="text-xs sm:text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Vista previa</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* City guides banner — only for RECOMMENDATIONS zones */}
        {propertyCity && zone?.type === 'RECOMMENDATIONS' && (
          <CityGuidesBanner
            city={propertyCity}
            propertyId={propertyId}
            onImported={onUpdate}
          />
        )}

        {/* Search bar */}
        <div className="mb-4 sm:mb-6">
          <PlaceSearchInput
            propertyLat={propertyLat}
            propertyLng={propertyLng}
            onSelect={handleAddToZone}
            placeholder="Buscar lugar en Google Places..."
            excludePlaceIds={excludePlaceIds}
          />
        </div>

        {/* Pending card — same UI as global mode */}
        <AnimatePresence>
          {pending && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 bg-white border-2 border-violet-200 rounded-2xl overflow-hidden shadow-lg"
            >
              {/* Photo / place header */}
              {pending.result.photoUrl ? (
                <div className="relative h-36 bg-gray-100">
                  <img src={pending.result.photoUrl} alt={pending.result.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <button onClick={() => setPending(null)} className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white rounded-full p-1.5 hover:bg-black/60 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="font-bold text-white text-lg leading-tight truncate">{pending.result.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      {pending.result.rating && (
                        <span className="flex items-center gap-0.5 text-sm text-amber-300 font-medium">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {pending.result.rating.toFixed(1)}
                        </span>
                      )}
                      <span className="text-white/80 text-xs truncate">{pending.result.address}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="px-4 pt-4 pb-2 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-violet-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{pending.result.name}</h3>
                      <div className="flex items-center gap-1.5">
                        {pending.result.rating && (
                          <span className="flex items-center text-xs text-amber-600 font-medium">
                            <Star className="w-3 h-3 mr-0.5 fill-amber-400 text-amber-400" />
                            {pending.result.rating.toFixed(1)}
                          </span>
                        )}
                        <span className="text-xs text-gray-500 truncate">{pending.result.address}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setPending(null)} className="text-gray-400 hover:text-gray-600 p-1 flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Extra fields */}
              <div className="px-4 py-4">
                {(() => {
                  const catConfig = getCategoryById(pending.categoryId)
                  const highlightLabel = catConfig?.highlightLabel
                  const highlightPlaceholder = catConfig?.highlightPlaceholder ?? ''
                  const extUrlLabel = catConfig?.externalUrlLabel
                  const extUrlPlaceholder = catConfig?.externalUrlPlaceholder ?? 'https://...'
                  const catTags = catConfig?.tags ?? []
                  return (
                    <div className="space-y-4">
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-violet-700 uppercase tracking-wide mb-1.5">
                          <MessageSquare className="w-3.5 h-3.5" />
                          Recomendación personal <span className="text-gray-400 font-normal normal-case">(opcional)</span>
                        </label>
                        <textarea
                          value={pending.description}
                          onChange={(e) => setPending(prev => prev ? { ...prev, description: e.target.value } : null)}
                          placeholder="Tu recomendación personal para los huéspedes..."
                          rows={2}
                          className="w-full text-sm border border-violet-200 rounded-xl px-3 py-2.5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"
                        />
                      </div>
                      {highlightLabel && (
                        <div>
                          <label className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 uppercase tracking-wide mb-1.5">
                            <Utensils className="w-3.5 h-3.5" />
                            {highlightLabel} <span className="text-gray-400 font-normal normal-case">(opcional)</span>
                          </label>
                          <input
                            type="text"
                            value={pending.highlight}
                            onChange={(e) => setPending(prev => prev ? { ...prev, highlight: e.target.value } : null)}
                            placeholder={highlightPlaceholder}
                            className="w-full text-sm border border-orange-200 rounded-xl px-3 py-2.5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                          />
                        </div>
                      )}
                      {extUrlLabel && (
                        <div>
                          <label className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1.5">
                            <ExternalLink className="w-3.5 h-3.5" />
                            {extUrlLabel} <span className="text-gray-400 font-normal normal-case">(opcional)</span>
                          </label>
                          <input
                            type="url"
                            value={pending.externalUrl}
                            onChange={(e) => setPending(prev => prev ? { ...prev, externalUrl: e.target.value } : null)}
                            placeholder={extUrlPlaceholder}
                            className="w-full text-sm border border-emerald-200 rounded-xl px-3 py-2.5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                          />
                        </div>
                      )}
                      {catTags.length > 0 && (
                        <div>
                          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                            <Tag className="w-3.5 h-3.5" />
                            Etiquetas <span className="text-gray-400 font-normal normal-case">(opcional)</span>
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {catTags.map(tagId => (
                              <button
                                key={tagId}
                                type="button"
                                onClick={() => setPending(prev => {
                                  if (!prev) return null
                                  const newTags = prev.tags.includes(tagId) ? prev.tags.filter(t => t !== tagId) : [...prev.tags, tagId]
                                  return { ...prev, tags: newTags }
                                })}
                                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                                  pending.tags.includes(tagId)
                                    ? 'bg-violet-100 border-violet-300 text-violet-700'
                                    : 'bg-white border-gray-200 text-gray-500 hover:border-violet-200 hover:text-violet-600'
                                }`}
                              >
                                {tagId.replace(/_/g, ' ')}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()}

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setPending(null)}
                    className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmAddToZone}
                    disabled={pending.saving}
                    className="flex-1 px-4 py-2.5 text-sm font-medium bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    {pending.saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Añadir a la guía</>}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recommendations list */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">
              Lugares en esta zona
            </h3>
            {recommendations.length > 0 && (
              <span className="text-xs text-gray-400">{recommendations.length} lugar{recommendations.length !== 1 ? 'es' : ''}</span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
            </div>
          ) : recommendations.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No hay lugares todavía.</p>
              <p className="text-xs mt-1">Usa la barra de búsqueda para añadir.</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={recommendations.map(r => r.id)}
                strategy={verticalListSortingStrategy}
              >
                {recommendations.map((rec) => (
                  <SortableRecommendationCard
                    key={rec.id}
                    rec={rec}
                    onDelete={handleDelete}
                    onEditDescription={handleEditDescription}
                    currentCategory={zone?.recommendationCategory}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  )
}
