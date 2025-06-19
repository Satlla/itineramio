'use client'

import React from 'react'
import { Plus, Eye } from 'lucide-react'
import { Button } from './Button'
import { Card } from './Card'
import { ZoneIconDisplay } from './IconSelector'
import { zoneTemplates, ZoneTemplate } from '../../data/zoneTemplates'
import { getText } from '../../lib/utils'

interface ZoneStaticSuggestionsProps {
  existingZoneNames: string[]
  onCreateZone: (template: ZoneTemplate) => void
  onViewDetails: (template: ZoneTemplate) => void
  maxVisible?: number
}

export function ZoneStaticSuggestions({
  existingZoneNames,
  onCreateZone,
  onViewDetails,
  maxVisible = 6
}: ZoneStaticSuggestionsProps) {
  // Filter out zones that already exist and get most popular ones
  const availableZones = zoneTemplates
    .filter(template => 
      !existingZoneNames.some(existing => 
        existing.toLowerCase() === template.name.toLowerCase()
      )
    )
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, maxVisible)

  if (availableZones.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-green-600 text-lg">✓</span>
        </div>
        <h3 className="text-sm font-medium text-gray-900 mb-1">
          ¡Excelente trabajo!
        </h3>
        <p className="text-xs text-gray-600">
          Has añadido las zonas más importantes
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          💡 Sugerencias de Zonas
        </h2>
        <p className="text-gray-600 text-sm">
          Zonas populares que podrías añadir
        </p>
      </div>
      
      {/* Zone Cards - Static Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {availableZones.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow duration-200 bg-white border border-gray-200">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <ZoneIconDisplay iconId={template.icon} size="sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 text-sm mb-1">
                    {getText(template.name, 'Zona')}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {getText(template.description, '')}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  {template.category === 'essential' && 'Esencial'}
                  {template.category === 'amenities' && 'Comodidad'}
                  {template.category === 'rules' && 'Normas'}
                  {template.category === 'local' && 'Local'}
                  {template.category === 'savings' && 'Ahorro'}
                  {template.category === 'emergency' && 'Emergencia'}
                </span>
                <span className="text-xs text-gray-500">
                  {template.popularity}% hosts
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => onCreateZone(template)}
                  size="sm"
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs h-8 font-medium"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Añadir
                </Button>
                <Button
                  onClick={() => onViewDetails(template)}
                  variant="outline"
                  size="sm"
                  className="border-gray-200 text-gray-500 hover:bg-gray-50 text-xs h-8 px-2"
                >
                  <Eye className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}