'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, Home, ArrowLeft, Download, Check, AlertCircle } from 'lucide-react'
import { Button } from './Button'
import { Card, CardContent } from './Card'
import { Input } from './Input'
import { cn } from '../../lib/utils'

interface Property {
  id: string
  name: string
  type: string
  location?: string
  status: string
}

interface SourceCategory {
  categoryId: string
  name: string
  icon: string
  count: number
}

interface ImportRecommendationsModalProps {
  isOpen: boolean
  onClose: () => void
  targetPropertyId: string
  targetPropertyLat: number | null
  targetPropertyLng: number | null
  onImportComplete: () => void
}

// Map icon names to emoji for display
const ICON_EMOJI: Record<string, string> = {
  UtensilsCrossed: '🍽️',
  Coffee: '☕',
  Landmark: '🏛️',
  TreePine: '🌲',
  Umbrella: '🏖️',
  ShoppingBag: '🛍️',
  ParkingCircle: '🅿️',
  ShoppingCart: '🏪',
  Pill: '💊',
  Cross: '🏥',
  Banknote: '🏧',
  Fuel: '⛽',
  Dumbbell: '💪',
  WashingMachine: '🧺',
  TrainFront: '🚉',
}

function getIconEmoji(iconName: string): string {
  return ICON_EMOJI[iconName] || '📍'
}

function getLocalizedName(name: any): string {
  if (typeof name === 'string') return name
  if (name && typeof name === 'object') {
    return name.es || name.en || Object.values(name)[0] as string || ''
  }
  return ''
}

export function ImportRecommendationsModal({
  isOpen,
  onClose,
  targetPropertyId,
  targetPropertyLat,
  targetPropertyLng,
  onImportComplete
}: ImportRecommendationsModalProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [properties, setProperties] = useState<Property[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  // Step 2
  const [categories, setCategories] = useState<SourceCategory[]>([])
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(new Set())
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  // Load properties on open
  useEffect(() => {
    if (isOpen) {
      loadProperties()
      setStep(1)
      setSelectedProperty(null)
      setCategories([])
      setSelectedCategoryIds(new Set())
      setSearchTerm('')
      setError(null)
    }
  }, [isOpen])

  const filteredProperties = useMemo(() => {
    if (!searchTerm.trim()) return properties
    const term = searchTerm.toLowerCase()
    return properties.filter(p =>
      p.name.toLowerCase().includes(term) ||
      (p.location && p.location.toLowerCase().includes(term))
    )
  }, [properties, searchTerm])

  const loadProperties = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/properties')
      const result = await response.json()
      if (response.ok && result.success) {
        const available = result.data.filter((p: Property) =>
          p.id !== targetPropertyId && p.status !== 'DELETED'
        )
        setProperties(available)
      } else {
        setError('Error al cargar propiedades')
      }
    } catch {
      setError('Error al cargar propiedades')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectProperty = async (property: Property) => {
    setSelectedProperty(property)
    setStep(2)
    setIsLoadingCategories(true)
    setError(null)
    try {
      const response = await fetch(`/api/properties/${property.id}/recommendations`)
      const result = await response.json()
      if (response.ok && result.success) {
        const cats: SourceCategory[] = result.data
          .filter((zone: any) => zone.recommendations && zone.recommendations.length > 0)
          .map((zone: any) => ({
            categoryId: zone.categoryId || zone.recommendationCategory,
            name: getLocalizedName(zone.name),
            icon: zone.icon || '',
            count: zone.recommendations.length,
          }))
        setCategories(cats)
        // Select all by default
        setSelectedCategoryIds(new Set(cats.map(c => c.categoryId)))
      } else {
        setError('Error al cargar recomendaciones')
      }
    } catch {
      setError('Error al cargar recomendaciones')
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const handleToggleCategory = (categoryId: string) => {
    const next = new Set(selectedCategoryIds)
    if (next.has(categoryId)) {
      next.delete(categoryId)
    } else {
      next.add(categoryId)
    }
    setSelectedCategoryIds(next)
  }

  const handleSelectAll = () => {
    setSelectedCategoryIds(new Set(categories.map(c => c.categoryId)))
  }

  const handleDeselectAll = () => {
    setSelectedCategoryIds(new Set())
  }

  const selectedCount = useMemo(() => {
    return categories
      .filter(c => selectedCategoryIds.has(c.categoryId))
      .reduce((sum, c) => sum + c.count, 0)
  }, [categories, selectedCategoryIds])

  const selectedCategoriesCount = selectedCategoryIds.size

  const handleImport = async () => {
    if (!selectedProperty || selectedCategoryIds.size === 0) return
    setIsImporting(true)
    setError(null)
    try {
      const response = await fetch(`/api/properties/${targetPropertyId}/recommendations/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourcePropertyId: selectedProperty.id,
          categoryIds: Array.from(selectedCategoryIds),
          targetLat: targetPropertyLat,
          targetLng: targetPropertyLng,
        }),
      })
      const result = await response.json()
      if (response.ok && result.success) {
        const { importedCount, skippedDuplicates } = result.data
        let msg = `${importedCount} lugares importados`
        if (skippedDuplicates > 0) {
          msg += ` (${skippedDuplicates} ya existían)`
        }
        // Use a simple alert-like notification via the parent
        onImportComplete()
        onClose()
        // Show toast after close
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('toast', {
              detail: { message: msg, type: importedCount > 0 ? 'success' : 'info' }
            }))
          }
        }, 100)
      } else {
        setError(result.error || 'Error al importar')
      }
    } catch {
      setError('Error al importar recomendaciones')
    } finally {
      setIsImporting(false)
    }
  }

  const handleClose = () => {
    setStep(1)
    setSelectedProperty(null)
    setCategories([])
    setSelectedCategoryIds(new Set())
    setSearchTerm('')
    setError(null)
    onClose()
  }

  const handleBack = () => {
    setStep(1)
    setSelectedProperty(null)
    setCategories([])
    setSelectedCategoryIds(new Set())
    setError(null)
  }

  if (!isOpen) return null

  const showSearchBar = properties.length > 5

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-[95vw] sm:max-w-sm md:max-w-md lg:max-w-lg h-[600px] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b">
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button
                onClick={handleBack}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
            )}
            <div>
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
                {step === 1 ? 'Importar recomendaciones' : `Importar de "${selectedProperty?.name}"`}
              </h2>
              <p className="text-sm text-gray-600 mt-0.5">
                {step === 1
                  ? 'Selecciona la propiedad de origen'
                  : 'Selecciona las categorías a importar'
                }
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
              <AlertCircle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
              >
                {showSearchBar && (
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type="text"
                        placeholder="Buscar propiedad..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                )}

                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                    <span className="ml-3 text-gray-600">Cargando propiedades...</span>
                  </div>
                ) : filteredProperties.length === 0 ? (
                  <div className="text-center py-8">
                    <Home className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      {searchTerm ? 'No se encontraron propiedades' : 'No tienes otras propiedades'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredProperties.map((property) => (
                      <Card
                        key={property.id}
                        className="cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-gray-50"
                        onClick={() => handleSelectProperty(property)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <Home className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{property.name}</h4>
                              {property.location && (
                                <span className="text-sm text-gray-500">{property.location}</span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.15 }}
              >
                {isLoadingCategories ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                    <span className="ml-3 text-gray-600">Cargando recomendaciones...</span>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Esta propiedad no tiene recomendaciones</p>
                  </div>
                ) : (
                  <>
                    {/* Select all / deselect buttons */}
                    <div className="flex gap-2 mb-4">
                      <button
                        onClick={handleSelectAll}
                        className="text-sm text-violet-600 hover:text-violet-800 font-medium"
                      >
                        Seleccionar todo
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={handleDeselectAll}
                        className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                      >
                        Deseleccionar
                      </button>
                    </div>

                    {/* Category checkboxes */}
                    <div className="space-y-2">
                      {categories.map((cat) => (
                        <div
                          key={cat.categoryId}
                          onClick={() => handleToggleCategory(cat.categoryId)}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                            selectedCategoryIds.has(cat.categoryId)
                              ? "border-violet-300 bg-violet-50"
                              : "border-gray-200 hover:bg-gray-50"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0",
                              selectedCategoryIds.has(cat.categoryId)
                                ? "bg-violet-600 border-violet-600"
                                : "border-gray-300"
                            )}>
                              {selectedCategoryIds.has(cat.categoryId) && (
                                <Check className="h-3 w-3 text-white" />
                              )}
                            </div>
                            <span className="text-lg">{getIconEmoji(cat.icon)}</span>
                            <span className="font-medium text-gray-900">{cat.name}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {cat.count} {cat.count === 1 ? 'lugar' : 'lugares'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {step === 2 && categories.length > 0 && (
          <div className="flex-shrink-0 flex items-center justify-between p-3 sm:p-4 md:p-6 border-t bg-gray-50">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isImporting}
              className="min-w-[80px]"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleImport}
              disabled={selectedCategoryIds.size === 0 || isImporting}
              className={cn(
                "font-medium px-4 sm:px-6 py-2",
                selectedCategoryIds.size === 0 || isImporting
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-violet-600 hover:bg-violet-700 text-white shadow-lg hover:shadow-xl transition-all"
              )}
            >
              {isImporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Importando...
                </>
              ) : selectedCategoryIds.size === 0 ? (
                'Selecciona categorías'
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Importar {selectedCount} lugares de {selectedCategoriesCount} {selectedCategoriesCount === 1 ? 'categoría' : 'categorías'}
                </>
              )}
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
