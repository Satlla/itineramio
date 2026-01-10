'use client'

import React, { useState } from 'react'
import { Plus, Eye, Lightbulb, X } from 'lucide-react'
import { Button } from './Button'
import { Card } from './Card'
import { ZoneIconDisplay } from './IconSelector'
import { zoneTemplates, ZoneTemplate } from '../../data/zoneTemplates'
import { getText } from '../../lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

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
  const [showModal, setShowModal] = useState(false)

  // Filter out zones that already exist and get most popular ones
  const availableZones = zoneTemplates
    .filter(template => {
      // Check if the zone already exists with normalized comparison
      const templateNameNormalized = getText(template.name, '').toLowerCase().trim();
      return !existingZoneNames.some(existing => {
        const existingNormalized = existing.toLowerCase().trim();
        // Check exact match
        if (existingNormalized === templateNameNormalized) return true;
        // Check if it's a variation (e.g., "Check-in" vs "Check in" vs "Checkin")
        const templateClean = templateNameNormalized.replace(/[\s-_]/g, '');
        const existingClean = existingNormalized.replace(/[\s-_]/g, '');
        return templateClean === existingClean;
      });
    })
    .sort((a, b) => b.popularity - a.popularity)

  // Check if all essential zones are completed
  const essentialZones = zoneTemplates.filter(z => z.category === 'essential')
  const hasAllEssentialZones = essentialZones.every(essential => {
    const essentialNameNormalized = getText(essential.name, '').toLowerCase().trim();
    return existingZoneNames.some(existing => {
      const existingNormalized = existing.toLowerCase().trim();
      // Check exact match
      if (existingNormalized === essentialNameNormalized) return true;
      // Check if it's a variation (e.g., "Check-in" vs "Check in" vs "Checkin")
      const essentialClean = essentialNameNormalized.replace(/[\s-_]/g, '');
      const existingClean = existingNormalized.replace(/[\s-_]/g, '');
      return essentialClean === existingClean;
    });
  })

  // If all essential zones are completed, show congratulations banner
  if (hasAllEssentialZones) {
    const suggestedZones = availableZones.slice(0, 3) // Show 3 suggestions

    return (
      <>
        <div className="space-y-4">
          {/* Congratulations Banner */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-green-900 mb-1">
                  ¡Enhorabuena! tu manual tiene muy buena pinta
                </h3>
                <p className="text-xs text-green-700">
                  Has añadido las zonas esenciales
                </p>
              </div>
            </div>
          </div>

          {/* 3 Zone Suggestions */}
          {suggestedZones.length > 0 && (
            <div className="space-y-3">
              {suggestedZones.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow duration-200 bg-white border border-gray-200 min-w-0">
                  {/* Desktop Compact Design */}
                  <div className="hidden lg:block p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-1.5 bg-gray-50 rounded-lg flex-shrink-0">
                          <ZoneIconDisplay iconId={template.icon} size="sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm truncate">
                            {getText(template.name, 'Zona')}
                          </h3>
                          <p className="text-xs text-gray-500 truncate">
                            {getText(template.description, '').substring(0, 40)}...
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <Button
                          onClick={() => onViewDetails(template)}
                          variant="outline"
                          size="sm"
                          className="border-gray-200 text-gray-600 hover:bg-gray-50 text-xs h-7 px-2"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={() => onCreateZone(template)}
                          size="sm"
                          className="bg-violet-600 hover:bg-violet-700 text-white text-xs h-7 px-2"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Full Design */}
                  <div className="lg:hidden p-3">
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-3 min-w-0">
                      <div className="p-2 bg-gray-50 rounded-lg flex-shrink-0">
                        <ZoneIconDisplay iconId={template.icon} size="sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">
                          {getText(template.name, 'Zona')}
                        </h3>
                        <p className="text-xs text-gray-600 line-clamp-2 overflow-hidden">
                          {getText(template.description, '')}
                        </p>
                      </div>
                    </div>

                    {/* Actions - Botón Ver más grande, Añadir más pequeño */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => onViewDetails(template)}
                        variant="outline"
                        size="sm"
                        className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 text-xs h-8 font-medium"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Ver más
                      </Button>
                      <Button
                        onClick={() => onCreateZone(template)}
                        size="sm"
                        className="bg-violet-600 hover:bg-violet-700 text-white text-xs h-8 px-2"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Ver más button */}
              {availableZones.length > 3 && (
                <Button
                  onClick={() => setShowModal(true)}
                  variant="outline"
                  className="w-full text-sm border-dashed border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  Ver más sugerencias ({availableZones.length - 3} más)
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Modal with all suggestions */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg w-full max-w-3xl max-h-[80vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Todas las Sugerencias</h2>
                    <button
                      onClick={() => setShowModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>
                
                <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availableZones.map((template) => (
                      <Card key={template.id} className="hover:shadow-md transition-shadow duration-200 bg-white border border-gray-200 min-w-0">
                        <div className="p-3">
                          <div className="flex items-start gap-3 mb-3 min-w-0">
                            <div className="p-2 bg-gray-50 rounded-lg flex-shrink-0">
                              <ZoneIconDisplay iconId={template.icon} size="sm" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">
                                {getText(template.name, 'Zona')}
                              </h3>
                              <p className="text-xs text-gray-600 line-clamp-2 overflow-hidden">
                                {getText(template.description, '')}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                onViewDetails(template)
                                setShowModal(false)
                              }}
                              variant="outline"
                              size="sm"
                              className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 text-xs h-8"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Ver más
                            </Button>
                            <Button
                              onClick={() => {
                                onCreateZone(template)
                                setShowModal(false)
                              }}
                              size="sm"
                              className="bg-violet-600 hover:bg-violet-700 text-white text-xs h-8 px-2"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    )
  }

  // Default state when essential zones are not completed
  const displayZones = availableZones.slice(0, maxVisible)

  if (displayZones.length === 0) {
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
      
      {/* Zone Cards - Responsive Design */}
      <div className="space-y-3">
        {displayZones.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow duration-200 bg-white border border-gray-200 min-w-0">
            {/* Desktop Compact Design - Hidden on Mobile */}
            <div className="hidden lg:block p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-1.5 bg-gray-50 rounded-lg flex-shrink-0">
                    <ZoneIconDisplay iconId={template.icon} size="sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm truncate">
                      {getText(template.name, 'Zona')}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500">
                        {template.category === 'essential' && 'Esencial'}
                        {template.category === 'amenities' && 'Comodidad'}
                        {template.category === 'rules' && 'Normas'}
                        {template.category === 'local' && 'Local'}
                        {template.category === 'savings' && 'Ahorro'}
                        {template.category === 'emergency' && 'Emergencia'}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {template.popularity}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <Button
                    onClick={() => onViewDetails(template)}
                    variant="outline"
                    size="sm"
                    className="border-gray-200 text-gray-600 hover:bg-gray-50 text-xs h-7 px-2"
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={() => onCreateZone(template)}
                    size="sm"
                    className="bg-violet-600 hover:bg-violet-700 text-white text-xs h-7 px-2"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Mobile Full Design - Hidden on Desktop */}
            <div className="lg:hidden p-4">
              {/* Header */}
              <div className="flex items-start gap-3 mb-3 min-w-0">
                <div className="p-2 bg-gray-50 rounded-lg flex-shrink-0">
                  <ZoneIconDisplay iconId={template.icon} size="sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">
                    {getText(template.name, 'Zona')}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2 overflow-hidden">
                    {getText(template.description, '')}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-2 mb-3 min-w-0">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 flex-shrink-0">
                  {template.category === 'essential' && 'Esencial'}
                  {template.category === 'amenities' && 'Comodidad'}
                  {template.category === 'rules' && 'Normas'}
                  {template.category === 'local' && 'Local'}
                  {template.category === 'savings' && 'Ahorro'}
                  {template.category === 'emergency' && 'Emergencia'}
                </span>
                <span className="text-xs text-gray-500 truncate">
                  {template.popularity}% hosts
                </span>
              </div>

              {/* Actions - Botón Ver más grande, Añadir más pequeño */}
              <div className="flex gap-2">
                <Button
                  onClick={() => onViewDetails(template)}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 text-xs h-8 font-medium"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Ver más
                </Button>
                <Button
                  onClick={() => onCreateZone(template)}
                  size="sm"
                  className="bg-violet-600 hover:bg-violet-700 text-white text-xs h-8 px-2"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}