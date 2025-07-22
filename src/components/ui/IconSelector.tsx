'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { ZONE_ICONS } from '../../data/zoneIcons'
import { zoneIconMapping } from '../../data/zoneIconsAirbnb'
import { getZoneIcon as getExtendedZoneIcon, getZoneIconByName } from '../../data/zoneIconsExtended'
import { Button } from './Button'
import { Input } from './Input'

interface IconSelectorProps {
  selectedIconId?: string
  onSelect: (iconId: string) => void
  onClose?: () => void
  className?: string
}

export function IconSelector({ selectedIconId, onSelect, onClose, className }: IconSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredIcons = ZONE_ICONS.filter((icon) => {
    const matchesSearch = icon.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || icon.category.id === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = [
    { id: 'all', name: 'Todos', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    { id: 'travel', name: 'Viajes', color: 'bg-sky-100 text-sky-800 border-sky-200' },
    { id: 'nature', name: 'Naturaleza', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    { id: 'kitchen', name: 'Cocina', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    { id: 'bathroom', name: 'Baño', color: 'bg-teal-100 text-teal-800 border-teal-200' },
    { id: 'bedroom', name: 'Dormitorio', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { id: 'living', name: 'Salón', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    { id: 'access', name: 'Acceso', color: 'bg-red-100 text-red-800 border-red-200' },
    { id: 'exterior', name: 'Exterior', color: 'bg-green-100 text-green-800 border-green-200' },
    { id: 'services', name: 'Servicios', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { id: 'general', name: 'General', color: 'bg-gray-100 text-gray-800 border-gray-200' }
  ]

  return (
    <div className={cn("bg-white rounded-lg shadow-xl border p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Seleccionar Icono</h3>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Buscar iconos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium border transition-all",
              selectedCategory === category.id
                ? category.color
                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
            )}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Icons Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3">
          <AnimatePresence>
            {filteredIcons.map((icon) => {
              const IconComponent = icon.icon
              const isSelected = selectedIconId === icon.id
              
              return (
                <motion.button
                  key={icon.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelect(icon.id)}
                  className={cn(
                    "aspect-square p-3 rounded-lg border-2 transition-all group relative",
                    isSelected
                      ? "border-violet-500 bg-violet-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                  title={icon.name}
                >
                  <IconComponent 
                    className={cn(
                      "w-full h-full transition-colors",
                      isSelected 
                        ? "text-violet-600" 
                        : `${icon.color} group-hover:text-gray-700`
                    )} 
                  />
                  
                  {/* Selected indicator */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-violet-600 rounded-full flex items-center justify-center"
                    >
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </motion.div>
                  )}

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {icon.name}
                  </div>
                </motion.button>
              )
            })}
          </AnimatePresence>
        </div>

        {/* No results */}
        {filteredIcons.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No se encontraron iconos</div>
            <div className="text-gray-500 text-sm">
              Intenta cambiar los filtros o el término de búsqueda
            </div>
          </div>
        )}
      </div>

      {/* Selected icon info */}
      {selectedIconId && (
        <div className="mt-4 pt-4 border-t">
          {(() => {
            const selectedIcon = ZONE_ICONS.find(icon => icon.id === selectedIconId)
            if (!selectedIcon) return null
            
            const IconComponent = selectedIcon.icon
            return (
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg border-2 border-violet-500 bg-violet-50 flex items-center justify-center"
                )}>
                  <IconComponent className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{selectedIcon.name}</div>
                  <div className={cn(
                    "text-xs px-2 py-1 rounded-full inline-block",
                    selectedIcon.category.color
                  )}>
                    {selectedIcon.category.name}
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}

// Hook para obtener información de un icono
export function useZoneIcon(iconId?: string) {
  const icon = iconId ? ZONE_ICONS.find(i => i.id === iconId) : undefined
  return icon
}

// Componente para mostrar un icono seleccionado
interface ZoneIconDisplayProps {
  iconId?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ZoneIconDisplay({ iconId, size = 'md', className }: ZoneIconDisplayProps) {
  // First try to get icon from ZONE_ICONS array
  const zoneIcon = iconId ? ZONE_ICONS.find(icon => icon.id === iconId) : null
  let IconComponent = zoneIcon?.icon || null
  
  // Fallback: if not found in ZONE_ICONS, try extended icons
  if (!IconComponent && iconId) {
    // Direct iconId mapping (for commonly used iconIds)
    const iconIdMapping: { [key: string]: any } = {
      'wifi': getZoneIconByName('wifi'),
      'key': getZoneIconByName('check in'),
      'exit': getZoneIconByName('check out'),
      'door': getZoneIconByName('check in'),
      'car': getZoneIconByName('parking'),
      'kitchen': getZoneIconByName('cocina'),
      'thermometer': getZoneIconByName('climatizacion'),
      'phone': getZoneIconByName('emergencias'),
      'map-pin': getZoneIconByName('llegar'),
      'info': getZoneIconByName('info'),
      'home': getZoneIconByName('casa'),
      'bath': getZoneIconByName('baño'),
      'bed': getZoneIconByName('habitacion'),
      'tv': getZoneIconByName('television'),
      'washing': getZoneIconByName('lavadora'),
      'wind': getZoneIconByName('aire')
    }
    
    // Try direct iconId mapping
    IconComponent = iconIdMapping[iconId]
    
    // If not found, try by zone name
    if (!IconComponent) {
      IconComponent = getZoneIconByName(iconId)
    }
  }
  
  // If no icon found, show default
  if (!IconComponent) {
    return (
      <div className={cn(
        "rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center",
        size === 'sm' && "w-8 h-8",
        size === 'md' && "w-12 h-12", 
        size === 'lg' && "w-16 h-16",
        className
      )}>
        <div className={cn(
          "text-gray-400 font-medium",
          size === 'sm' && "text-xs",
          size === 'md' && "text-sm",
          size === 'lg' && "text-base"
        )}>?</div>
      </div>
    )
  }
  
  return (
    <div className={cn(
      "rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center shadow-sm border border-violet-200/50",
      size === 'sm' && "w-8 h-8",
      size === 'md' && "w-12 h-12",
      size === 'lg' && "w-16 h-16", 
      className
    )}>
      <IconComponent className={cn(
        "text-violet-600",
        size === 'sm' && "w-4 h-4",
        size === 'md' && "w-6 h-6",
        size === 'lg' && "w-8 h-8"
      )} />
    </div>
  )
}