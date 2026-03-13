'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Map,
  Star,
  X,
  CheckCircle,
  Loader2,
  ChevronRight,
  Sparkles,
  Building2,
  Check,
  Bell,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { CATEGORIES } from '../../lib/recommendations/categories'

// ---------- Types ----------

interface Place {
  id: string
  name: string
  address?: string | null
  photoUrl?: string | null
  rating?: number | null
}

interface GuidePlace {
  id: string
  category: string
  description?: string | null
  place: Place
}

interface GuideSubscription {
  propertyId: string
  propertyName: string
  status: 'ACTIVE' | 'UNSUBSCRIBED'
}

interface CityGuide {
  id: string
  title: string
  city: string
  country: string
  description?: string | null
  status: 'DRAFT' | 'PUBLISHED' | 'VERIFIED'
  placesCount: number
  placesByCategory?: Record<string, GuidePlace[]>
  subscriptions?: GuideSubscription[]
}

interface UserProperty {
  id: string
  name: string | Record<string, string>
}

interface PendingNotification {
  id: string
  propertyId: string
  update: {
    id: string
    summary: string
    addedPlaces: Array<{
      placeId: string
      category: string
      place: Place
    }>
  }
}

interface CityGuidesBannerProps {
  city: string
  propertyId: string
  onImported: () => void
}

// ---------- Helpers ----------

function getCatLabel(catId: string) {
  return CATEGORIES.find(c => c.id === catId)?.label ?? catId
}

function getCatIcon(catId: string) {
  const icons: Record<string, string> = {
    restaurant: '🍽️',
    cafe: '☕',
    tourist_attraction: '🏛️',
    park: '🌳',
    beach: '🌊',
    shopping_mall: '🛍️',
    museum: '🖼️',
    bar: '🍷',
    pharmacy: '💊',
    hospital: '🏥',
    supermarket: '🛒',
    gym: '🏋️',
    parking: '🅿️',
    atm: '💳',
    gas_station: '⛽',
    laundry: '👕',
    transit_station: '🚇',
  }
  return icons[catId] ?? '📍'
}

function getPropertyName(prop: UserProperty): string {
  if (typeof prop.name === 'string') return prop.name
  return prop.name?.es ?? prop.name?.en ?? prop.name?.fr ?? 'Propiedad'
}

function getDismissedKey(propertyId: string, guideId: string) {
  return `dismissed-guide-${propertyId}-${guideId}`
}

// ---------- Import Modal (first-time import) ----------

function ImportModal({
  guide,
  currentPropertyId,
  onClose,
  onImported,
  onDismiss,
}: {
  guide: CityGuide
  currentPropertyId: string
  onClose: () => void
  onImported: (count: number) => void
  onDismiss: () => void
}) {
  const categories = Object.keys(guide.placesByCategory ?? {})
  const [selectedCategories, setSelectedCategories] = useState<string[]>(categories)
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const [properties, setProperties] = useState<UserProperty[]>([])
  const [selectedProperties, setSelectedProperties] = useState<string[]>([currentPropertyId])
  const [loadingProps, setLoadingProps] = useState(true)
  const [importing, setImporting] = useState(false)
  const [done, setDone] = useState(false)
  const [importedCount, setImportedCount] = useState(0)

  useEffect(() => {
    fetch('/api/properties', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setProperties(d.properties || d.data || []))
      .catch(() => setProperties([]))
      .finally(() => setLoadingProps(false))
  }, [])

  const totalPlaces = categories
    .filter(c => selectedCategories.includes(c))
    .reduce((sum, c) => sum + (guide.placesByCategory?.[c]?.length ?? 0), 0)

  const toggleCategory = (id: string) =>
    setSelectedCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])

  const toggleExpand = (id: string) =>
    setExpandedCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])

  const toggleProperty = (id: string) =>
    setSelectedProperties(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])

  const handleImport = async () => {
    if (selectedCategories.length === 0 || selectedProperties.length === 0) return
    setImporting(true)
    let total = 0
    try {
      for (const propId of selectedProperties) {
        const res = await fetch(`/api/city-guides/${guide.id}/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ propertyId: propId, categories: selectedCategories }),
        })
        const data = await res.json()
        if (res.ok) total += data.data?.importedCount ?? data.importedCount ?? 0
      }
      setImportedCount(total)
      setDone(true)
      onImported(total)
    } finally {
      setImporting(false)
    }
  }

  const handleNoMostrar = () => {
    // Store in localStorage so this guide never shows again for this property
    localStorage.setItem(getDismissedKey(currentPropertyId, guide.id), '1')
    onDismiss()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.18 }}
        onClick={e => e.stopPropagation()}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center shrink-0">
              <Map className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Guía de {guide.city}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {guide.status === 'VERIFIED' && (
                  <span className="inline-flex items-center gap-1 text-amber-500 font-medium">
                    <Star className="w-3 h-3 fill-amber-400" />Verificada ·
                  </span>
                )}
                {guide.placesCount} lugares curados
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-12">
            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-emerald-500" />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-gray-900">¡Importación completada!</p>
              <p className="text-sm text-gray-500 mt-1">
                {importedCount > 0
                  ? `${importedCount} lugares añadidos a tus recomendaciones`
                  : 'Los lugares ya estaban en tus recomendaciones'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-2 px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              Listo
            </button>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1">
            <div className="px-6 py-4">

              {/* Categories with expandable place list */}
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Selecciona qué categorías importar
              </p>
              {categories.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Esta guía aún no tiene lugares</p>
              ) : (
                <div className="space-y-1.5">
                  {categories.map(catId => {
                    const places = guide.placesByCategory?.[catId] ?? []
                    const count = places.length
                    const selected = selectedCategories.includes(catId)
                    const expanded = expandedCategories.includes(catId)
                    return (
                      <div key={catId}>
                        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all ${
                          selected ? 'bg-violet-50 border-violet-200' : 'bg-gray-50 border-gray-200 opacity-60'
                        }`}>
                          {/* Category toggle (checkbox) */}
                          <button
                            onClick={() => toggleCategory(catId)}
                            className={`w-4 h-4 rounded flex items-center justify-center border transition-all shrink-0 ${
                              selected ? 'bg-violet-600 border-violet-600' : 'border-gray-300 bg-white'
                            }`}
                          >
                            {selected && <Check className="w-2.5 h-2.5 text-white" />}
                          </button>

                          {/* Main row (click to select) */}
                          <button
                            onClick={() => toggleCategory(catId)}
                            className="flex items-center gap-2 flex-1 min-w-0"
                          >
                            <span className="text-lg leading-none">{getCatIcon(catId)}</span>
                            <span className="flex-1 text-left text-sm font-medium text-gray-800">
                              {getCatLabel(catId)}
                            </span>
                            <span className="text-xs text-gray-400">
                              {count} {count === 1 ? 'lugar' : 'lugares'}
                            </span>
                          </button>

                          {/* Expand toggle */}
                          <button
                            onClick={() => toggleExpand(catId)}
                            className="p-1 rounded-lg hover:bg-black/5 text-gray-400 transition-colors shrink-0"
                          >
                            {expanded
                              ? <ChevronUp className="w-3.5 h-3.5" />
                              : <ChevronDown className="w-3.5 h-3.5" />
                            }
                          </button>
                        </div>

                        {/* Expanded place names */}
                        {expanded && places.length > 0 && (
                          <div className="mt-1 ml-10 space-y-0.5">
                            {places.map(gp => (
                              <div key={gp.id} className="flex items-center gap-2 px-2 py-1 text-xs text-gray-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-violet-300 shrink-0" />
                                <span className="flex-1 truncate font-medium">{gp.place.name}</span>
                                {gp.place.rating != null && (
                                  <span className="text-amber-500 shrink-0">★ {gp.place.rating.toFixed(1)}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Properties */}
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-5 mb-3">
                Aplicar a estas propiedades
              </p>
              {loadingProps ? (
                <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cargando propiedades...
                </div>
              ) : properties.length === 0 ? (
                <p className="text-sm text-gray-400">No se encontraron propiedades</p>
              ) : (
                <div className="space-y-1.5">
                  {properties.map(prop => {
                    const selected = selectedProperties.includes(prop.id)
                    const isCurrent = prop.id === currentPropertyId
                    return (
                      <button
                        key={prop.id}
                        onClick={() => toggleProperty(prop.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                          selected
                            ? 'bg-violet-50 border-violet-200'
                            : 'bg-gray-50 border-gray-200 opacity-60'
                        }`}
                      >
                        <Building2 className={`w-4 h-4 shrink-0 ${selected ? 'text-violet-500' : 'text-gray-400'}`} />
                        <span className="flex-1 text-left text-sm font-medium text-gray-800 truncate">
                          {getPropertyName(prop)}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] text-violet-500 font-medium bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded-md">
                            Esta
                          </span>
                        )}
                        <div className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-all ${
                          selected ? 'bg-violet-600 border-violet-600' : 'border-gray-300 bg-white'
                        }`}>
                          {selected && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        {!done && (
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
            <button
              onClick={handleNoMostrar}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              No mostrar más
            </button>
            <button
              onClick={handleImport}
              disabled={importing || selectedCategories.length === 0 || selectedProperties.length === 0 || totalPlaces === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
            >
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  Importar {totalPlaces > 0 ? `${totalPlaces} lugares` : ''}
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

// ---------- Update Modal (pending notifications from admin additions) ----------

function UpdateModal({
  guideId,
  guideCity,
  notifications,
  propertyId,
  onClose,
  onAccepted,
  onUnsubscribe,
}: {
  guideId: string
  guideCity: string
  notifications: PendingNotification[]
  propertyId: string
  onClose: () => void
  onAccepted: (count: number) => void
  onUnsubscribe: () => void
}) {
  const [accepting, setAccepting] = useState(false)
  const [declining, setDeclining] = useState(false)
  const [unsubscribing, setUnsubscribing] = useState(false)
  const [done, setDone] = useState(false)
  const [acceptedCount, setAcceptedCount] = useState(0)

  const myNotifications = notifications.filter(n => n.propertyId === propertyId)

  // Collect all unique new places across all pending notifications
  const allNewPlaces = myNotifications
    .flatMap(n => n.update.addedPlaces)
    .filter((p, i, arr) => arr.findIndex(x => x.placeId === p.placeId) === i)

  // Group by category for display
  const placesByCategory: Record<string, typeof allNewPlaces> = {}
  for (const p of allNewPlaces) {
    if (!placesByCategory[p.category]) placesByCategory[p.category] = []
    placesByCategory[p.category].push(p)
  }

  const handleAcceptAll = async () => {
    setAccepting(true)
    let total = 0
    try {
      for (const notif of myNotifications) {
        const res = await fetch(`/api/city-guides/${guideId}/notifications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ notificationId: notif.id, action: 'accept_all' }),
        })
        const data = await res.json()
        if (res.ok) total += data.data?.importedCount ?? 0
      }
      setAcceptedCount(total)
      setDone(true)
      onAccepted(total)
    } finally {
      setAccepting(false)
    }
  }

  const handleDecline = async () => {
    setDeclining(true)
    try {
      for (const notif of myNotifications) {
        await fetch(`/api/city-guides/${guideId}/notifications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ notificationId: notif.id, action: 'decline' }),
        })
      }
    } finally {
      setDeclining(false)
    }
    onClose()
  }

  const handleNoMostrar = async () => {
    setUnsubscribing(true)
    try {
      // Decline all pending notifications first
      for (const notif of myNotifications) {
        await fetch(`/api/city-guides/${guideId}/notifications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ notificationId: notif.id, action: 'decline' }),
        }).catch(() => {})
      }
      // Unsubscribe → stops future GuideUpdateNotification creation
      await fetch(`/api/city-guides/${guideId}/subscribe`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ propertyId }),
      })
    } finally {
      setUnsubscribing(false)
    }
    onUnsubscribe()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.18 }}
        onClick={e => e.stopPropagation()}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Nuevos lugares en {guideCity}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {allNewPlaces.length} {allNewPlaces.length === 1 ? 'lugar nuevo añadido' : 'nuevos lugares añadidos'} a la guía
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-12">
            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-emerald-500" />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-gray-900">¡Lugares añadidos!</p>
              <p className="text-sm text-gray-500 mt-1">
                {acceptedCount > 0
                  ? `${acceptedCount} nuevos lugares importados a tus recomendaciones`
                  : 'Los lugares ya estaban en tus recomendaciones'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-2 px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              Listo
            </button>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 px-6 py-4">
            {Object.keys(placesByCategory).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No hay nuevos lugares disponibles</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(placesByCategory).map(([catId, places]) => (
                  <div key={catId}>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      {getCatIcon(catId)} {getCatLabel(catId)}
                    </p>
                    <div className="space-y-1">
                      {places.map(p => (
                        <div
                          key={p.placeId}
                          className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-lg"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="flex-1 text-sm font-medium text-gray-800 truncate">
                            {p.place.name}
                          </span>
                          {p.place.rating != null && (
                            <span className="text-xs text-amber-500 shrink-0">
                              ★ {p.place.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        {!done && (
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
            <button
              onClick={handleNoMostrar}
              disabled={unsubscribing}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              {unsubscribing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              No mostrar más
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDecline}
                disabled={declining}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                {declining
                  ? <Loader2 className="w-4 h-4 animate-spin inline" />
                  : 'Ignorar'
                }
              </button>
              <button
                onClick={handleAcceptAll}
                disabled={accepting || allNewPlaces.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
              >
                {accepting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    Añadir {allNewPlaces.length} {allNewPlaces.length === 1 ? 'lugar' : 'lugares'}
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

// ---------- Main Banner Component ----------

export function CityGuidesBanner({ city, propertyId, onImported }: CityGuidesBannerProps) {
  const [guides, setGuides] = useState<CityGuide[]>([])
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  // Import modal state (first-time)
  const [selectedGuide, setSelectedGuide] = useState<CityGuide | null>(null)
  const [guideDetail, setGuideDetail] = useState<CityGuide | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // Update notifications state (already subscribed)
  const [updateGuide, setUpdateGuide] = useState<CityGuide | null>(null)
  const [pendingNotifications, setPendingNotifications] = useState<PendingNotification[]>([])
  const [showUpdateModal, setShowUpdateModal] = useState(false)

  const fetchGuides = useCallback(async () => {
    if (!city) return
    setLoading(true)
    try {
      const res = await fetch(`/api/city-guides?city=${encodeURIComponent(city)}`, { credentials: 'include' })
      const data = await res.json()
      const available: CityGuide[] = (data.data || data.guides || []).filter(
        (g: CityGuide) => g.status === 'PUBLISHED' || g.status === 'VERIFIED'
      )
      setGuides(available)

      // Check if current property is already ACTIVE subscribed to any guide
      const subscribedGuide = available.find(g =>
        g.subscriptions?.some(s => s.propertyId === propertyId && s.status === 'ACTIVE')
      )

      if (subscribedGuide) {
        // Fetch pending notifications for this guide
        const notifRes = await fetch(`/api/city-guides/${subscribedGuide.id}/notifications`, { credentials: 'include' })
        const notifData = await notifRes.json()
        const pending: PendingNotification[] = (notifData.data || []).filter(
          (n: PendingNotification) => n.propertyId === propertyId
        )
        if (pending.length > 0) {
          setUpdateGuide(subscribedGuide)
          setPendingNotifications(pending)
        }
      }
    } catch {
      setGuides([])
    } finally {
      setLoading(false)
    }
  }, [city, propertyId])

  useEffect(() => { fetchGuides() }, [fetchGuides])

  // First-time import modal
  const openImportModal = async (guide: CityGuide) => {
    setSelectedGuide(guide)
    setLoadingDetail(true)
    try {
      const res = await fetch(`/api/city-guides/${guide.id}`, { credentials: 'include' })
      const data = await res.json()
      const g = data.data || data
      setGuideDetail({
        ...guide,
        placesByCategory: g.placesByCategory ?? {},
        placesCount: g._count?.places ?? guide.placesCount,
      })
    } catch {
      setGuideDetail({ ...guide, placesByCategory: {} })
    } finally {
      setLoadingDetail(false)
    }
  }

  const closeImportModal = () => {
    setSelectedGuide(null)
    setGuideDetail(null)
  }

  const handleImported = () => {
    setDismissed(true)
    closeImportModal()
    onImported()
  }

  const handleImportDismiss = () => {
    setDismissed(true)
    closeImportModal()
  }

  // Update notifications
  const closeUpdateModal = () => setShowUpdateModal(false)

  const handleNotificationAccepted = () => {
    setPendingNotifications([])
    setUpdateGuide(null)
    onImported()
  }

  const handleUpdateUnsubscribe = () => {
    setPendingNotifications([])
    setUpdateGuide(null)
    setShowUpdateModal(false)
  }

  if (loading || dismissed) return null

  // Mode 2: already subscribed, has pending notifications from admin additions
  if (updateGuide && pendingNotifications.length > 0) {
    const newCount = pendingNotifications
      .flatMap(n => n.update.addedPlaces)
      .filter((p, i, arr) => arr.findIndex(x => x.placeId === p.placeId) === i)
      .length

    return (
      <>
        <motion.button
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setShowUpdateModal(true)}
          className="w-full flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-xl px-4 py-3 hover:from-emerald-100 hover:to-teal-100 hover:border-emerald-300 transition-all duration-200 group text-left"
        >
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-emerald-900">
              {newCount} nuevos lugares en la guía de {city}
            </p>
            <p className="text-xs text-emerald-600 mt-0.5">
              Itineramio ha añadido lugares nuevos — ¿quieres importarlos?
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 group-hover:text-emerald-700 shrink-0">
            Ver <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </motion.button>

        <AnimatePresence>
          {showUpdateModal && (
            <UpdateModal
              guideId={updateGuide.id}
              guideCity={updateGuide.city}
              notifications={pendingNotifications}
              propertyId={propertyId}
              onClose={closeUpdateModal}
              onAccepted={handleNotificationAccepted}
              onUnsubscribe={handleUpdateUnsubscribe}
            />
          )}
        </AnimatePresence>
      </>
    )
  }

  // Mode 1: not subscribed → show import banner
  // Filter out guides where this property has been dismissed or is already subscribed/unsubscribed
  const guide = guides.find(g => {
    const sub = g.subscriptions?.find(s => s.propertyId === propertyId)
    if (sub) return false // already subscribed or unsubscribed
    if (typeof window !== 'undefined' && localStorage.getItem(getDismissedKey(propertyId, g.id))) return false
    return true
  })

  if (!guide) return null

  return (
    <>
      <motion.button
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => openImportModal(guide)}
        className="w-full flex items-center gap-3 bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200/80 rounded-xl px-4 py-3 hover:from-violet-100 hover:to-indigo-100 hover:border-violet-300 transition-all duration-200 group text-left"
      >
        <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-violet-600" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-violet-900">
            Guía de {city} disponible
          </p>
          <p className="text-xs text-violet-500 mt-0.5">
            {guide.placesCount} lugares curados por Itineramio — restaurantes, monumentos y más
          </p>
        </div>

        <div className="flex items-center gap-1 text-xs font-medium text-violet-600 group-hover:text-violet-700 shrink-0">
          {loadingDetail
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <>Importar <ChevronRight className="w-3.5 h-3.5" /></>
          }
        </div>
      </motion.button>

      <AnimatePresence>
        {selectedGuide && (guideDetail || loadingDetail) && (
          <>
            {loadingDetail ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeImportModal} />
                <div className="relative bg-white rounded-2xl p-8 shadow-2xl flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-violet-600" />
                  <span className="text-sm text-gray-600">Cargando guía...</span>
                </div>
              </div>
            ) : guideDetail ? (
              <ImportModal
                guide={guideDetail}
                currentPropertyId={propertyId}
                onClose={closeImportModal}
                onImported={handleImported}
                onDismiss={handleImportDismiss}
              />
            ) : null}
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default CityGuidesBanner
