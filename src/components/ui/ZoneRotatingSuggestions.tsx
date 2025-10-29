'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ChevronLeft, ChevronRight, Sparkles, Eye } from 'lucide-react'
import { Button } from './Button'
import { Card } from './Card'
import { ZoneIconDisplay } from './IconSelector'
import { zoneTemplates, ZoneTemplate } from '../../data/zoneTemplates'

interface ZoneRotatingSuggestionsProps {
  existingZoneNames: string[]
  onCreateZone: (template: ZoneTemplate) => void
  onViewDetails: (template: ZoneTemplate) => void
  maxVisible?: number
  autoRotate?: boolean
  rotateInterval?: number
}

export function ZoneRotatingSuggestions({
  existingZoneNames,
  onCreateZone,
  onViewDetails,
  maxVisible = 3,
  autoRotate = true,
  rotateInterval = 8000
}: ZoneRotatingSuggestionsProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  // Filter out zones that already exist
  const availableZones = zoneTemplates.filter(template => 
    !existingZoneNames.some(existing => 
      existing.toLowerCase() === template.name.toLowerCase()
    )
  )

  // Auto-rotate through zones
  useEffect(() => {
    if (!autoRotate || availableZones.length <= maxVisible) return

    const interval = setInterval(() => {
      setDirection(1)
      setCurrentIndex(prev => 
        prev + maxVisible >= availableZones.length ? 0 : prev + maxVisible
      )
    }, rotateInterval)

    return () => clearInterval(interval)
  }, [autoRotate, rotateInterval, availableZones.length, maxVisible])

  const handleNext = () => {
    if (currentIndex + maxVisible >= availableZones.length) return
    setDirection(1)
    setCurrentIndex(prev => prev + maxVisible)
  }

  const handlePrev = () => {
    if (currentIndex === 0) return
    setDirection(-1)
    setCurrentIndex(prev => Math.max(0, prev - maxVisible))
  }

  const getCurrentZones = () => {
    return availableZones.slice(currentIndex, currentIndex + maxVisible)
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      essential: 'from-blue-500 to-blue-600',
      amenities: 'from-green-500 to-green-600',
      rules: 'from-amber-500 to-amber-600',
      local: 'from-purple-500 to-purple-600',
      savings: 'from-emerald-500 to-emerald-600',
      emergency: 'from-red-500 to-red-600'
    }
    return colors[category as keyof typeof colors] || 'from-gray-500 to-gray-600'
  }

  const getCategoryLabel = (category: string) => {
    const labels = {
      essential: 'Esencial',
      amenities: 'Comodidad',
      rules: 'Normas',
      local: 'Local',
      savings: 'Ahorro',
      emergency: 'Emergencia'
    }
    return labels[category as keyof typeof labels] || category
  }

  if (availableZones.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          ¡Increíble trabajo! 🎉
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Has añadido todas las zonas disponibles. Tu manual está completísimo.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-600" />
            Inspiración de Zonas
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            {availableZones.length} zonas disponibles para añadir
          </p>
        </div>
        
        {/* Navigation */}
        {availableZones.length > maxVisible && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="w-8 h-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs text-gray-500 px-2">
              {Math.floor(currentIndex / maxVisible) + 1} de {Math.ceil(availableZones.length / maxVisible)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentIndex + maxVisible >= availableZones.length}
              className="w-8 h-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Zone Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AnimatePresence mode="wait" custom={direction}>
          {getCurrentZones().map((template, index) => (
            <motion.div
              key={`${template.id}-${currentIndex}`}
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -50 : 50 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-white shadow-sm hover:shadow-xl">
                {/* Category stripe */}
                <div className={`h-1 bg-gradient-to-r ${getCategoryColor(template.category)}`} />
                
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <ZoneIconDisplay iconId={template.icon} size="sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">
                        {template.name}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getCategoryColor(template.category)} text-white`}>
                      {getCategoryLabel(template.category)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {template.popularity}% hosts lo usan
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => onCreateZone(template)}
                      size="sm"
                      className="flex-1 bg-gray-900 hover:bg-gray-800 text-white text-xs h-8"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Añadir
                    </Button>
                    <Button
                      onClick={() => onViewDetails(template)}
                      variant="outline"
                      size="sm"
                      className="border-gray-200 text-gray-600 hover:bg-gray-50 text-xs h-8 px-3"
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      {availableZones.length > maxVisible && (
        <div className="flex justify-center gap-1">
          {Array.from({ length: Math.ceil(availableZones.length / maxVisible) }).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > Math.floor(currentIndex / maxVisible) ? 1 : -1)
                setCurrentIndex(index * maxVisible)
              }}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === Math.floor(currentIndex / maxVisible)
                  ? 'bg-violet-600 w-6'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}

      {/* Auto-rotate indicator */}
      {autoRotate && availableZones.length > maxVisible && (
        <div className="flex justify-center">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <div className="w-1 h-1 bg-violet-600 rounded-full animate-pulse" />
            Rotación automática activada
          </span>
        </div>
      )}
    </div>
  )
}