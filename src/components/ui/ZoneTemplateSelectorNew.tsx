'use client'

import React, { useState } from 'react'
import { X, Check, Info as InfoIcon, Image, Link, Video, FileText, Plus } from 'lucide-react'
import { zoneTemplates, zoneCategories } from '@/data/zoneTemplates'
import { ZoneIcon } from '@/data/zoneIconsNew'
import { Button } from './Button'

interface ZoneTemplateSelectorProps {
  onClose: () => void
  onSelectZones: (zoneIds: string[]) => void
  existingZoneIds: string[]
}

export function ZoneTemplateSelector({ 
  onClose, 
  onSelectZones,
  existingZoneIds = []
}: ZoneTemplateSelectorProps) {
  const [selectedZones, setSelectedZones] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('essential')

  // Group zones by category
  const zonesByCategory = zoneTemplates.reduce((acc, zone) => {
    if (!acc[zone.category]) {
      acc[zone.category] = []
    }
    acc[zone.category].push(zone)
    return acc
  }, {} as Record<string, typeof zoneTemplates>)

  // Sort zones by popularity within each category
  Object.keys(zonesByCategory).forEach(category => {
    zonesByCategory[category].sort((a, b) => b.popularity - a.popularity)
  })

  const handleToggleZone = (zoneId: string) => {
    setSelectedZones(prev => 
      prev.includes(zoneId) 
        ? prev.filter(id => id !== zoneId)
        : [...prev, zoneId]
    )
  }

  const handleAddZones = () => {
    if (selectedZones.length > 0) {
      onSelectZones(selectedZones)
      onClose()
    }
  }

  const isZoneExisting = (zoneId: string) => existingZoneIds.includes(zoneId)
  const isZoneSelected = (zoneId: string) => selectedZones.includes(zoneId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Añadir Zonas
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Selecciona múltiples zonas para añadir a tu propiedad
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Category tabs */}
          <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
            {Object.entries(zoneCategories).map(([key, category]) => (
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
                {category.name}
                <span className="ml-2 text-xs opacity-70">
                  ({zonesByCategory[key]?.length || 0})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Info banner */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-3">
              <InfoIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-2">
                  En cada zona podrás añadir contenido ilimitado:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Texto</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Image className="w-4 h-4 text-blue-600" />
                    <span>Imágenes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link className="w-4 h-4 text-blue-600" />
                    <span>Enlaces</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-blue-600" />
                    <span>Vídeos <span className="text-xs">(próximamente)</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Category description */}
          <div className="mb-4">
            <h3 className="font-medium text-gray-900">
              {zoneCategories[activeCategory as keyof typeof zoneCategories].name}
            </h3>
            <p className="text-sm text-gray-600">
              {zoneCategories[activeCategory as keyof typeof zoneCategories].description}
            </p>
          </div>

          {/* Zone grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {zonesByCategory[activeCategory]?.map((zone) => {
              const isExisting = isZoneExisting(zone.id)
              const isSelected = isZoneSelected(zone.id)
              const isDisabled = isExisting

              return (
                <button
                  key={zone.id}
                  onClick={() => !isDisabled && handleToggleZone(zone.id)}
                  disabled={isDisabled}
                  className={`
                    relative p-4 rounded-lg border-2 transition-all text-left
                    ${isDisabled 
                      ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60' 
                      : isSelected
                        ? 'bg-violet-50 border-violet-400 shadow-sm'
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className={`
                      p-2 rounded-lg
                      ${isSelected ? 'bg-violet-100' : 'bg-gray-100'}
                    `}>
                      <ZoneIcon 
                        iconId={zone.icon} 
                        className={`w-5 h-5 ${isSelected ? 'text-violet-600' : 'text-gray-600'}`}
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {zone.name}
                      </h4>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {zone.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          <div className="w-full bg-gray-200 rounded-full h-1.5 w-20">
                            <div 
                              className="bg-violet-600 h-1.5 rounded-full"
                              style={{ width: `${zone.popularity}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {zone.popularity}% popular
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}

                    {/* Existing indicator */}
                    {isExisting && (
                      <div className="absolute top-2 right-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                        Ya añadida
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedZones.length > 0 ? (
                <span className="font-medium text-violet-600">
                  {selectedZones.length} zona{selectedZones.length !== 1 ? 's' : ''} seleccionada{selectedZones.length !== 1 ? 's' : ''}
                </span>
              ) : (
                'Selecciona las zonas que quieres añadir'
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddZones}
                disabled={selectedZones.length === 0}
                className="min-w-[120px]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Añadir {selectedZones.length > 0 && `(${selectedZones.length})`}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}