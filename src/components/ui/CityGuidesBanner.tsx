'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Map,
  Star,
  MapPin,
  X,
  CheckCircle,
  Loader2,
  ChevronRight,
  Sparkles,
  Building2,
  Check,
} from 'lucide-react'
import { CATEGORIES } from '../../lib/recommendations/categories'

// ---------- Types ----------

interface CityGuide {
  id: string
  title: string
  city: string
  country: string
  description?: string | null
  status: 'DRAFT' | 'PUBLISHED' | 'VERIFIED'
  placesCount: number
  placesByCategory?: Record<string, { id: string; category: string }[]>
}

interface UserProperty {
  id: string
  name: string | Record<string, string>
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

// ---------- Import Modal ----------

function ImportModal({
  guide,
  currentPropertyId,
  onClose,
  onImported,
}: {
  guide: CityGuide
  currentPropertyId: string
  onClose: () => void
  onImported: (count: number) => void
}) {
  const categories = Object.keys(guide.placesByCategory ?? {})
  const [selectedCategories, setSelectedCategories] = useState<string[]>(categories)
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

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const toggleProperty = (id: string) => {
    setSelectedProperties(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

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
                {guide.status === 'VERIFIED' && <span className="inline-flex items-center gap-1 text-amber-500 font-medium"><Star className="w-3 h-3 fill-amber-400" />Verificada por Itineramio · </span>}
                {guide.placesCount} lugares curados
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {done ? (
          /* Success state */
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-12">
            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-emerald-500" />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-gray-900">¡Importación completada!</p>
              <p className="text-sm text-gray-500 mt-1">
                {importedCount > 0
                  ? `${importedCount} lugares añadidos a las zonas de recomendaciones`
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

              {/* Categories */}
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Selecciona qué categorías importar
              </p>
              {categories.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Esta guía aún no tiene lugares</p>
              ) : (
                <div className="space-y-1.5">
                  {categories.map(catId => {
                    const count = guide.placesByCategory?.[catId]?.length ?? 0
                    const selected = selectedCategories.includes(catId)
                    return (
                      <button
                        key={catId}
                        onClick={() => toggleCategory(catId)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                          selected
                            ? 'bg-violet-50 border-violet-200'
                            : 'bg-gray-50 border-gray-200 opacity-60'
                        }`}
                      >
                        <span className="text-lg leading-none">{getCatIcon(catId)}</span>
                        <span className="flex-1 text-left text-sm font-medium text-gray-800">
                          {getCatLabel(catId)}
                        </span>
                        <span className="text-xs text-gray-400 mr-1">{count} lugares</span>
                        <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                          selected ? 'bg-violet-600 border-violet-600' : 'border-gray-300 bg-white'
                        }`}>
                          {selected && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                      </button>
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
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancelar
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

// ---------- Main Banner Component ----------

export function CityGuidesBanner({ city, propertyId, onImported }: CityGuidesBannerProps) {
  const [guides, setGuides] = useState<CityGuide[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGuide, setSelectedGuide] = useState<CityGuide | null>(null)
  const [guideDetail, setGuideDetail] = useState<CityGuide | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [importedTotal, setImportedTotal] = useState(0)

  const fetchGuides = useCallback(async () => {
    if (!city) return
    setLoading(true)
    try {
      const res = await fetch(`/api/city-guides?city=${encodeURIComponent(city)}`, { credentials: 'include' })
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

  useEffect(() => { fetchGuides() }, [fetchGuides])

  const openModal = async (guide: CityGuide) => {
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

  const closeModal = () => {
    setSelectedGuide(null)
    setGuideDetail(null)
  }

  const handleImported = (count: number) => {
    setImportedTotal(prev => prev + count)
    onImported()
  }

  if (loading || guides.length === 0) return null

  const guide = guides[0] // show first available guide

  return (
    <>
      {/* Banner trigger */}
      <motion.button
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => openModal(guide)}
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

        {importedTotal > 0 && (
          <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
            <CheckCircle className="w-3 h-3" />
            {importedTotal} importados
          </span>
        )}

        <div className="flex items-center gap-1 text-xs font-medium text-violet-600 group-hover:text-violet-700 shrink-0">
          {loadingDetail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (
            <>Importar <ChevronRight className="w-3.5 h-3.5" /></>
          )}
        </div>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {selectedGuide && (guideDetail || loadingDetail) && (
          <>
            {loadingDetail ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
                <div className="relative bg-white rounded-2xl p-8 shadow-2xl flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-violet-600" />
                  <span className="text-sm text-gray-600">Cargando guía...</span>
                </div>
              </div>
            ) : guideDetail ? (
              <ImportModal
                guide={guideDetail}
                currentPropertyId={propertyId}
                onClose={closeModal}
                onImported={handleImported}
              />
            ) : null}
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default CityGuidesBanner
