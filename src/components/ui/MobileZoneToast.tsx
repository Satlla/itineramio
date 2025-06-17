'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, X, Plus, ChevronRight } from 'lucide-react'
import { Button } from './Button'
import { ZoneIconDisplay } from './IconSelector'
import { zoneTemplates, ZoneTemplate } from '../../data/zoneTemplates'

interface MobileZoneToastProps {
  existingZoneNames: string[]
  onCreateZone: (template: ZoneTemplate) => void
  onClose?: () => void
}

export function MobileZoneToast({
  existingZoneNames,
  onCreateZone,
  onClose
}: MobileZoneToastProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [showModal, setShowModal] = useState(false)
  
  // Check if mobile
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Filter available zones
  const availableZones = zoneTemplates
    .filter(template => 
      !existingZoneNames.some(existing => 
        existing.toLowerCase() === template.name.toLowerCase()
      )
    )
    .sort((a, b) => b.popularity - a.popularity)

  const hasAllEssentialZones = availableZones.filter(z => z.category === 'essential').length === 0

  if (!isMobile || !isOpen) return null

  if (hasAllEssentialZones) {
    return (
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 left-4 right-4 z-40"
      >
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-3 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <Lightbulb className="w-3 h-3 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-green-900">¡Enhorabuena! tu manual tiene muy buena pinta</p>
                <p className="text-xs text-green-700">Has añadido las zonas esenciales</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-green-100 rounded"
            >
              <X className="w-3 h-3 text-green-600" />
            </button>
          </div>
          
          <Button
            onClick={() => {
              setShowModal(true)
              // Scroll down to zone suggestions
              setTimeout(() => {
                const element = document.getElementById('zone-suggestions')
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              }, 300)
            }}
            variant="outline"
            size="sm"
            className="w-full text-xs bg-white/50 hover:bg-white/80"
          >
            Ver más zonas que puedes añadir
            <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 left-4 right-4 z-40"
      >
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Sugerencia</p>
                <p className="text-xs text-gray-600">{availableZones.length} zonas disponibles</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          
          <Button
            onClick={() => setShowModal(true)}
            variant="outline"
            size="sm"
            className="w-full text-xs"
          >
            Ver zonas sugeridas
            <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </motion.div>

      {/* Modal with zone suggestions */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white w-full rounded-t-2xl max-h-[80vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Zonas Sugeridas</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
              
              <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
                <div className="space-y-3">
                  {availableZones.slice(0, 10).map((template) => (
                    <div
                      key={template.id}
                      className="bg-gray-50 rounded-lg p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg">
                          <ZoneIconDisplay iconId={template.icon} size="sm" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-sm text-gray-900">
                            {template.name}
                          </h3>
                          <p className="text-xs text-gray-600 line-clamp-1">
                            {template.description}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          onCreateZone(template)
                          setShowModal(false)
                          setIsOpen(false)
                        }}
                        size="sm"
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
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