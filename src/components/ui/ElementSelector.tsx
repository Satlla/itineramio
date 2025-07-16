'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Search, Plus } from 'lucide-react'
import { apartmentElements, categoryLabels, ApartmentElement } from '../../data/apartmentElements'
import { ZoneIconDisplay } from './IconSelector'
import { Button } from './Button'
import { Input } from './Input'

interface ElementSelectorProps {
  onClose: () => void
  onSelectElements: (elementIds: string[]) => void
  existingElementNames: string[]
  isLoading?: boolean
}

export function ElementSelector({ 
  onClose, 
  onSelectElements,
  existingElementNames = [],
  isLoading = false
}: ElementSelectorProps) {
  const [selectedElements, setSelectedElements] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Filter elements by category and search
  const filteredElements = apartmentElements.filter(element => {
    const matchesCategory = activeCategory === 'all' || element.category === activeCategory
    const matchesSearch = element.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         element.description.toLowerCase().includes(searchTerm.toLowerCase())
    const notExists = !existingElementNames.some(existing => 
      existing.toLowerCase() === element.name.toLowerCase()
    )
    return matchesCategory && matchesSearch && notExists
  })

  // Group elements by category
  const elementsByCategory = filteredElements.reduce((acc, element) => {
    if (!acc[element.category]) {
      acc[element.category] = []
    }
    acc[element.category].push(element)
    return acc
  }, {} as Record<string, ApartmentElement[]>)

  // Sort elements by priority within each category
  Object.keys(elementsByCategory).forEach(category => {
    elementsByCategory[category].sort((a, b) => b.priority - a.priority)
  })

  const handleToggleElement = (elementId: string) => {
    console.log('🔄 Toggling element:', elementId)
    setSelectedElements(prev => {
      const newSelection = prev.includes(elementId) 
        ? prev.filter(id => id !== elementId)
        : [...prev, elementId]
      console.log('📋 New selection:', newSelection)
      return newSelection
    })
  }

  const handleAddElements = () => {
    console.log('🎯 ElementSelector handleAddElements called')
    console.log('🎯 Selected elements:', selectedElements)
    
    if (selectedElements.length > 0) {
      console.log('🚀 Calling onSelectElements with:', selectedElements)
      onSelectElements(selectedElements)
      onClose()
    } else {
      console.warn('⚠️ No elements selected in ElementSelector')
    }
  }

  const isElementSelected = (elementId: string) => selectedElements.includes(elementId)

  const categories = [
    { key: 'all', name: 'Todos' },
    ...Object.entries(categoryLabels).map(([key, name]) => ({ key, name }))
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Añadir Elementos al Manual
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Selecciona múltiples elementos de tu apartamento turístico
              </p>
              {selectedElements.length > 0 && (
                <p className="mt-2 text-sm font-medium text-violet-600">
                  {selectedElements.length} elemento{selectedElements.length !== 1 ? 's' : ''} seleccionado{selectedElements.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar elementos (vitrocerámica, smart tv, jacuzzi...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category tabs */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {categories.map(({ key, name }) => {
              const count = key === 'all' 
                ? filteredElements.length 
                : elementsByCategory[key]?.length || 0
              
              return (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                    ${activeCategory === key 
                      ? 'bg-violet-100 text-violet-700 border-2 border-violet-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                    }
                  `}
                >
                  {name}
                  <span className="ml-2 text-xs opacity-70">
                    ({count})
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeCategory === 'all' ? (
            // Show all categories
            <div className="space-y-8">
              {Object.entries(elementsByCategory).map(([category, elements]) => {
                if (elements.length === 0) return null
                
                return (
                  <div key={category}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <div className="w-2 h-2 bg-violet-500 rounded-full mr-2" />
                      {categoryLabels[category as keyof typeof categoryLabels]}
                      <span className="ml-2 text-sm text-gray-500">({elements.length})</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {elements.map((element) => {
                        const isSelected = isElementSelected(element.id)
                        return (
                          <motion.div
                            key={element.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`
                              p-4 rounded-xl border-2 cursor-pointer transition-all
                              ${isSelected 
                                ? 'border-violet-500 bg-violet-50 shadow-lg shadow-violet-100' 
                                : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50/50'
                              }
                            `}
                            onClick={() => handleToggleElement(element.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3 flex-1">
                                <ZoneIconDisplay 
                                  iconId={element.icon} 
                                  size="sm"
                                />
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 text-sm mb-1">
                                    {element.name}
                                  </h4>
                                  <p className="text-xs text-gray-600 line-clamp-2">
                                    {element.description}
                                  </p>
                                  <div className="mt-2 flex items-center">
                                    <div className="text-xs text-violet-600 bg-violet-100 px-2 py-1 rounded-full">
                                      Prioridad {element.priority}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className={`
                                w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                                ${isSelected 
                                  ? 'border-violet-500 bg-violet-500' 
                                  : 'border-gray-300'
                                }
                              `}>
                                {isSelected && (
                                  <Check className="w-3 h-3 text-white" />
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            // Show specific category
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {elementsByCategory[activeCategory]?.map((element) => {
                const isSelected = isElementSelected(element.id)
                return (
                  <motion.div
                    key={element.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`
                      p-4 rounded-xl border-2 cursor-pointer transition-all
                      ${isSelected 
                        ? 'border-violet-500 bg-violet-50 shadow-lg shadow-violet-100' 
                        : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50/50'
                      }
                    `}
                    onClick={() => handleToggleElement(element.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <ZoneIconDisplay 
                          iconId={element.icon} 
                          size="sm"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">
                            {element.name}
                          </h4>
                          <p className="text-xs text-gray-600 line-clamp-3">
                            {element.description}
                          </p>
                          <div className="mt-2 flex items-center">
                            <div className="text-xs text-violet-600 bg-violet-100 px-2 py-1 rounded-full">
                              Prioridad {element.priority}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={`
                        w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                        ${isSelected 
                          ? 'border-violet-500 bg-violet-500' 
                          : 'border-gray-300'
                        }
                      `}>
                        {isSelected && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {filteredElements.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">No se encontraron elementos</div>
              <div className="text-gray-500 text-sm">
                Intenta cambiar los filtros o el término de búsqueda
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedElements.length > 0 && (
                <>Se añadirán {selectedElements.length} elemento{selectedElements.length !== 1 ? 's' : ''} al manual</>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                onClick={handleAddElements}
                disabled={selectedElements.length === 0 || isLoading}
                className="bg-violet-600 hover:bg-violet-700"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Añadiendo...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Añadir {selectedElements.length > 0 ? `(${selectedElements.length})` : 'Elementos'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}