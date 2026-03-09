'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Loader2, CheckCircle, AlertCircle, MapPin, Building2 } from 'lucide-react'

interface Property {
  id: string
  name: string
  city: string
}

interface RecommendationZone {
  id: string
  categoryId: string | null
  name: string
}

interface CopyRecommendationsModalProps {
  isOpen: boolean
  sourcePropertyId: string
  sourcePropertyName: string
  onClose: () => void
  onCopied: () => void
}

export function CopyRecommendationsModal({
  isOpen,
  sourcePropertyId,
  sourcePropertyName,
  onClose,
  onCopied,
}: CopyRecommendationsModalProps) {
  const [properties, setProperties] = useState<Property[]>([])
  const [zones, setZones] = useState<RecommendationZone[]>([])
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set())
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [loadingData, setLoadingData] = useState(true)
  const [copying, setCopying] = useState(false)
  const [result, setResult] = useState<{ copiedTo: number; totalRecommendations: number } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setSelectedProperties(new Set())
      setSelectedCategories(new Set())
      setResult(null)
      setError('')
      return
    }

    setLoadingData(true)
    Promise.all([
      fetch('/api/properties', { credentials: 'include' })
        .then((r) => r.json())
        .then((d) => (d.properties || []) as Property[]),
      fetch(`/api/properties/${sourcePropertyId}/recommendations`, { credentials: 'include' })
        .then((r) => r.json())
        .then((d) => (d.data || []) as RecommendationZone[]),
    ])
      .then(([allProperties, sourceZones]) => {
        setProperties(allProperties.filter((p: Property) => p.id !== sourcePropertyId))
        setZones(sourceZones.filter((z: RecommendationZone) => z.categoryId))
        // Select all categories by default
        setSelectedCategories(new Set(sourceZones.map((z: RecommendationZone) => z.categoryId).filter(Boolean) as string[]))
      })
      .catch(() => setError('Error cargando datos'))
      .finally(() => setLoadingData(false))
  }, [isOpen, sourcePropertyId])

  const toggleProperty = (id: string) => {
    setSelectedProperties((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })
  }

  const toggleAllProperties = () => {
    if (selectedProperties.size === properties.length) {
      setSelectedProperties(new Set())
    } else {
      setSelectedProperties(new Set(properties.map((p) => p.id)))
    }
  }

  const toggleAllCategories = () => {
    if (selectedCategories.size === zones.length) {
      setSelectedCategories(new Set())
    } else {
      setSelectedCategories(new Set(zones.map((z) => z.categoryId).filter(Boolean) as string[]))
    }
  }

  const handleCopy = async () => {
    if (selectedProperties.size === 0 || selectedCategories.size === 0) return
    setCopying(true)
    setError('')
    try {
      const res = await fetch(`/api/properties/${sourcePropertyId}/recommendations/copy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          targetPropertyIds: Array.from(selectedProperties),
          categories: Array.from(selectedCategories),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al copiar')
      setResult({ copiedTo: data.copiedTo, totalRecommendations: data.totalRecommendations })
      onCopied()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setCopying(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
            <Copy className="w-4 h-4 text-violet-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-gray-900">Copiar recomendaciones</h2>
            <p className="text-xs text-gray-400 truncate">desde {sourcePropertyName}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {loadingData ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
            </div>
          ) : result ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">
                {result.totalRecommendations} lugares copiados
              </p>
              <p className="text-xs text-gray-500">
                a {result.copiedTo} {result.copiedTo === 1 ? 'propiedad' : 'propiedades'} correctamente
              </p>
              <button
                onClick={onClose}
                className="mt-5 px-5 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <>
              {/* Categories */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Categorías a copiar
                  </p>
                  <button onClick={toggleAllCategories} className="text-xs text-violet-500 hover:text-violet-700 transition-colors">
                    {selectedCategories.size === zones.length ? 'Desmarcar todo' : 'Seleccionar todo'}
                  </button>
                </div>
                {zones.length === 0 ? (
                  <p className="text-xs text-gray-400 py-3 text-center">
                    Esta propiedad no tiene recomendaciones aún
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-1.5">
                    {zones.map((zone) => {
                      const cat = zone.categoryId!
                      const selected = selectedCategories.has(cat)
                      return (
                        <button
                          key={zone.id}
                          onClick={() => toggleCategory(cat)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs transition-all border ${
                            selected
                              ? 'bg-violet-50 border-violet-200 text-violet-700'
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 ${
                            selected ? 'bg-violet-500 border-violet-500' : 'border-gray-300'
                          }`}>
                            {selected && <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </div>
                          <span className="truncate">{zone.name}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Properties */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Propiedades destino
                  </p>
                  <button onClick={toggleAllProperties} className="text-xs text-violet-500 hover:text-violet-700 transition-colors">
                    {selectedProperties.size === properties.length ? 'Desmarcar todo' : 'Seleccionar todo'}
                  </button>
                </div>
                {properties.length === 0 ? (
                  <p className="text-xs text-gray-400 py-3 text-center">
                    No tienes otras propiedades
                  </p>
                ) : (
                  <div className="space-y-1">
                    {properties.map((property) => {
                      const selected = selectedProperties.has(property.id)
                      return (
                        <button
                          key={property.id}
                          onClick={() => toggleProperty(property.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all border ${
                            selected
                              ? 'bg-violet-50 border-violet-200'
                              : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            selected ? 'bg-violet-500 border-violet-500' : 'border-gray-300'
                          }`}>
                            {selected && <svg className="w-3 h-3 text-white" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </div>
                          <Building2 className={`w-3.5 h-3.5 shrink-0 ${selected ? 'text-violet-500' : 'text-gray-400'}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium truncate ${selected ? 'text-violet-700' : 'text-gray-700'}`}>
                              {property.name}
                            </p>
                            {property.city && (
                              <p className="text-[10px] text-gray-400 flex items-center gap-0.5 mt-0.5">
                                <MapPin className="w-2.5 h-2.5" />
                                {property.city}
                              </p>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!result && !loadingData && (
          <div className="px-5 py-4 border-t border-gray-100 shrink-0 flex items-center justify-between gap-3">
            <p className="text-xs text-gray-400">
              {selectedProperties.size} {selectedProperties.size === 1 ? 'propiedad' : 'propiedades'} · {selectedCategories.size} {selectedCategories.size === 1 ? 'categoría' : 'categorías'}
            </p>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCopy}
                disabled={copying || selectedProperties.size === 0 || selectedCategories.size === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
              >
                {copying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                Copiar
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
