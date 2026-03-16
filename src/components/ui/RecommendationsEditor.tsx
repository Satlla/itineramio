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
import { CATEGORIES, getCategoryById } from '../../lib/recommendations/categories'

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
  name: string
  address: string
  rating: number | null
  photoUrl: string | null
  categoryLabel: string
  categoryIcon: string
  deleting?: boolean
}

// --- Sortable Card (reused in zone mode) ---

function SortableRecommendationCard({
  rec,
  onDelete,
  onEditDescription,
}: {
  rec: Recommendation
  onDelete: (id: string) => void
  onEditDescription: (id: string, desc: string, highlight?: string, externalUrl?: string, tags?: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: rec.id })
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(rec.description || '')
  const [editHighlight, setEditHighlight] = useState(rec.highlight || '')
  const [editExternalUrl, setEditExternalUrl] = useState(rec.externalUrl || '')
  const [editTags, setEditTags] = useState(Array.isArray(rec.tags) ? rec.tags.join(', ') : '')
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
    onEditDescription(rec.id, editText, editHighlight, editExternalUrl, editTags)
    setIsEditing(false)
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`bg-white rounded-lg border ${isDragging ? 'shadow-xl border-violet-400' : 'border-gray-200'} p-3 mb-2`}
    >
      <div className="flex items-start gap-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 mt-0.5 hover:bg-gray-100 rounded flex-shrink-0"
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-medium text-gray-900 text-sm truncate">{rec.place?.name || 'Sin nombre'}</h4>
            <div className="flex items-center gap-1 flex-shrink-0">
              {rec.place?.rating && (
                <span className="flex items-center text-xs text-amber-600">
                  <Star className="w-3 h-3 mr-0.5 fill-amber-400 text-amber-400" />
                  {(rec.place.rating as number).toFixed(1)}
                </span>
              )}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                rec.source === 'MANUAL' ? 'bg-blue-50 text-blue-600' : 'bg-violet-50 text-violet-600'
              }`}>
                {rec.source === 'MANUAL' ? 'MANUAL' : 'AUTO'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
            {rec.place?.address && (
              <span className="truncate">{rec.place.address}</span>
            )}
          </div>

          {(rec.distanceMeters || rec.walkMinutes) && (
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
              {rec.distanceMeters && <span>{rec.distanceMeters < 1000 ? `${rec.distanceMeters}m` : `${(rec.distanceMeters / 1000).toFixed(1)}km`}</span>}
              {rec.walkMinutes && <span>· {rec.walkMinutes} min a pie</span>}
            </div>
          )}

          {isEditing ? (
            <div className="mt-2 space-y-2">
              <textarea
                ref={textareaRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full text-xs text-gray-700 border border-gray-300 rounded p-2 resize-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                rows={2}
                placeholder="Descripción del lugar..."
              />
              <input
                type="text"
                value={editHighlight}
                onChange={(e) => setEditHighlight(e.target.value)}
                className="w-full text-xs text-gray-700 border border-gray-300 rounded p-2 focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                placeholder="Plato estrella / Destacado..."
              />
              <input
                type="url"
                value={editExternalUrl}
                onChange={(e) => setEditExternalUrl(e.target.value)}
                className="w-full text-xs text-gray-700 border border-gray-300 rounded p-2 focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                placeholder="URL externa (https://...)"
              />
              <input
                type="text"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                className="w-full text-xs text-gray-700 border border-gray-300 rounded p-2 focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                placeholder="Tags separados por coma..."
              />
              <div className="flex gap-1">
                <button
                  onClick={handleSaveDescription}
                  className="text-xs px-2 py-1 bg-violet-600 text-white rounded hover:bg-violet-700 flex items-center gap-1"
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
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-1 space-y-0.5">
              {rec.description && (
                <p className="text-xs text-gray-600 italic line-clamp-2">&ldquo;{rec.description}&rdquo;</p>
              )}
              {rec.highlight && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
                  {rec.highlight}
                </p>
              )}
              {rec.externalUrl && (
                <a href={rec.externalUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-violet-600 hover:underline flex items-center gap-1 truncate">
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  {rec.externalUrl}
                </a>
              )}
              {Array.isArray(rec.tags) && rec.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {(rec.tags as string[]).map((tag, i) => (
                    <span key={i} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => {
                setIsEditing(true)
                setEditText(rec.description || '')
                setEditHighlight(rec.highlight || '')
                setEditExternalUrl(rec.externalUrl || '')
                setEditTags(Array.isArray(rec.tags) ? rec.tags.join(', ') : '')
              }}
              className="text-xs text-gray-500 hover:text-violet-600 flex items-center gap-1"
            >
              <Pencil className="w-3 h-3" /> Editar
            </button>

            {showDeleteConfirm ? (
              <div className="flex items-center gap-1 ml-auto">
                <span className="text-xs text-red-600">¿Eliminar?</span>
                <button
                  onClick={() => onDelete(rec.id)}
                  className="text-xs px-2 py-0.5 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Sí
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs text-gray-400 hover:text-red-500 ml-auto flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Collect all googlePlaceIds already in recommendations (zone mode)
  const excludePlaceIds = recommendations
    .map(r => r.place?.placeId)
    .filter((id): id is string => !!id)

  // Also exclude from global mode: places in all existing zones
  // (We'd need to fetch all recs for all zones — for now just exclude pending/added)
  const globalExcludePlaceIds = pending ? [pending.result.googlePlaceId] : []

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
              name: rec.place.name,
              address: rec.place.address,
              rating: rec.place.rating ?? null,
              photoUrl: rec.place.photoUrl ?? null,
              categoryLabel: cat?.label ?? zone.categoryId,
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
      console.error('Error fetching recommendations:', err)
    } finally {
      setLoading(false)
    }
  }, [mode, propertyId, zone])

  useEffect(() => {
    fetchRecommendations()
  }, [fetchRecommendations])

  // --- Zone mode: add recommendation directly to zone ---
  const handleAddToZone = async (result: PlaceSearchResult) => {
    if (!zone) return
    try {
      const res = await fetch(`/api/properties/${propertyId}/zones/${zone.id}/recommendations`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          googlePlaceId: result.googlePlaceId,
          name: result.name,
          address: result.address,
          lat: result.lat,
          lng: result.lng,
          rating: result.rating,
          photoUrl: result.photoUrl,
          types: result.types,
          propertyLat,
          propertyLng,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setRecommendations(prev => [...prev, data.data])
        setHasChanges(true)
      }
    } catch (err) {
      console.error('Error adding recommendation:', err)
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
        const catLabel = cat?.label || pending.categoryId
        const newItem = {
          recommendationId: data.data.recommendation.id,
          zoneId: data.data.zone.id,
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
      console.error('Error adding recommendation:', err)
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
      console.error('Error deleting recommendation:', err)
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
      console.error('Error deleting recommendation:', err)
    }
  }

  // --- Zone mode: edit fields ---
  const handleEditDescription = async (recId: string, description: string, highlight?: string, externalUrl?: string, tagsStr?: string) => {
    if (!zone) return
    const tags = tagsStr ? tagsStr.split(',').map((t: string) => t.trim()).filter(Boolean) : null
    try {
      const res = await fetch(
        `/api/properties/${propertyId}/zones/${zone.id}/recommendations/${recId}`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description, highlight: highlight || null, externalUrl: externalUrl || null, tags }),
        }
      )
      if (res.ok) {
        setRecommendations(prev =>
          prev.map(r => r.id === recId ? { ...r, description, highlight: highlight || null, externalUrl: externalUrl || null, tags: tags || null } : r)
        )
        setHasChanges(true)
      }
    } catch (err) {
      console.error('Error editing recommendation:', err)
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
      console.error('Error persisting reorder:', err)
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
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Añadir recomendación</h1>
              <p className="text-gray-500 text-xs sm:text-sm">Busca un lugar y selecciona su categoría</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          {/* City guides banner */}
          {propertyCity && (
            <CityGuidesBanner
              city={propertyCity}
              propertyId={propertyId}
              onImported={onUpdate}
            />
          )}

          {/* Search */}
          <PlaceSearchInput
            propertyLat={propertyLat}
            propertyLng={propertyLng}
            onSelect={handleGlobalSelect}
            placeholder="Buscar restaurante, farmacia, gasolinera..."
            excludePlaceIds={globalExcludePlaceIds}
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
          ) : addedItems.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Recomendaciones ({addedItems.length})
              </h3>
              <div className="space-y-2">
                {addedItems.map((item, i) => (
                  <motion.div
                    key={`${item.recommendationId}-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: item.deleting ? 0.5 : 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm"
                  >
                    {/* Thumbnail or icon */}
                    {item.photoUrl ? (
                      <img
                        src={item.photoUrl}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                    )}
                    {/* Info */}
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
                      <p className="text-xs text-gray-500 truncate">{item.address}</p>
                    </div>
                    {/* Category badge */}
                    <span className="text-[11px] font-medium px-2.5 py-1 bg-violet-50 text-violet-700 rounded-full flex-shrink-0 whitespace-nowrap">
                      {item.categoryLabel}
                    </span>
                    {/* Delete button */}
                    <button
                      onClick={() => handleDeleteAdded(i)}
                      disabled={item.deleting}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0 disabled:opacity-50"
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

        {/* Recommendations list */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-medium text-gray-700">Lugares en esta zona</h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
            </div>
          ) : recommendations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No hay lugares en esta zona todavía.</p>
              <p className="text-xs mt-1">Usa la barra de búsqueda para añadir lugares.</p>
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
                <AnimatePresence mode="popLayout">
                  {recommendations.map((rec) => (
                    <SortableRecommendationCard
                      key={rec.id}
                      rec={rec}
                      onDelete={handleDelete}
                      onEditDescription={handleEditDescription}
                    />
                  ))}
                </AnimatePresence>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  )
}
