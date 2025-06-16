'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  ChevronRight, 
  Star, 
  Clock, 
  TrendingUp,
  Lightbulb,
  CheckCircle,
  Eye,
  Plus,
  Sparkles
} from 'lucide-react'
import { Button } from './Button'
import { Card } from './Card'
import { Badge } from './Badge'
import { ZoneIconDisplay } from './IconSelector'
import { InspirationZone } from '../../data/zoneInspiration'

interface ZoneInspirationCardProps {
  inspiration: InspirationZone
  onDismiss: () => void
  onCreateZone: () => void
  onViewExamples: () => void
  isVisible: boolean
}

export function ZoneInspirationCard({
  inspiration,
  onDismiss,
  onCreateZone,
  onViewExamples,
  isVisible
}: ZoneInspirationCardProps) {
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0)

  // Rotate examples every 4 seconds
  useEffect(() => {
    if (!isVisible || inspiration.examples.length <= 1) return

    const interval = setInterval(() => {
      setCurrentExampleIndex((prev) => 
        (prev + 1) % inspiration.examples.length
      )
    }, 4000)

    return () => clearInterval(interval)
  }, [isVisible, inspiration.examples.length])

  const categoryLabels = {
    transport: 'Transporte',
    local: 'Información Local',
    services: 'Servicios',
    experience: 'Experiencias',
    convenience: 'Comodidad',
    safety: 'Seguridad'
  }

  const impactColors = {
    high: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800', 
    low: 'bg-gray-100 text-gray-600'
  }

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-orange-100 text-orange-800',
    advanced: 'bg-red-100 text-red-800'
  }

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative"
    >
      <Card className="overflow-hidden bg-gradient-to-br from-violet-500 via-purple-600 to-violet-700 text-white shadow-2xl border-0">
        {/* Header with close button */}
        <div className="relative p-6 pb-4">
          <div className="absolute top-4 right-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-6 w-6 p-0 text-white hover:bg-white/20 rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-start space-x-3 pr-8">
            <div className="p-2 bg-white/20 rounded-lg">
              <ZoneIconDisplay iconId={inspiration.icon} size="sm" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span className="text-xs font-medium opacity-90">Sugerencia de Zona</span>
              </div>
              <h3 className="text-lg font-bold">{inspiration.name}</h3>
              <p className="text-sm opacity-90">{inspiration.title}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Category and Stats */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs border-white/30 text-white">
              {categoryLabels[inspiration.category]}
            </Badge>
            <div className="flex items-center space-x-3 text-xs">
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full bg-white/20`}>
                <TrendingUp className="w-3 h-3" />
                <span className="font-medium">Impacto {inspiration.impact}</span>
              </div>
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full bg-white/20`}>
                <Clock className="w-3 h-3" />
                <span className="font-medium">{inspiration.estimatedTime}</span>
              </div>
            </div>
          </div>

          {/* Rotating examples */}
          <div className="bg-white/10 rounded-lg p-3 min-h-[60px] flex items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentExampleIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-sm leading-relaxed"
              >
                <div className="flex items-start space-x-2">
                  <Lightbulb className="w-4 h-4 text-yellow-300 flex-shrink-0 mt-0.5" />
                  <span className="text-white/90">
                    {inspiration.examples[currentExampleIndex]}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Benefits preview */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-300" />
              <span className="text-sm font-medium">Beneficios principales:</span>
            </div>
            <div className="grid grid-cols-1 gap-1 text-xs">
              {inspiration.benefits.slice(0, 2).map((benefit, index) => (
                <div key={index} className="flex items-center space-x-2 text-white/80">
                  <div className="w-1 h-1 bg-green-300 rounded-full"></div>
                  <span>{benefit}</span>
                </div>
              ))}
              {inspiration.benefits.length > 2 && (
                <div className="text-white/60 text-xs">
                  +{inspiration.benefits.length - 2} beneficios más...
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-2 pt-2">
            <Button
              onClick={onCreateZone}
              className="flex-1 bg-white text-violet-700 hover:bg-gray-50 font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Añadir Zona
            </Button>
            <Button
              onClick={onViewExamples}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <Eye className="w-4 h-4 mr-1" />
              Ver Más
            </Button>
          </div>
        </div>
      </Card>

      {/* Progress dots for examples */}
      {inspiration.examples.length > 1 && (
        <div className="flex justify-center mt-3 space-x-1">
          {inspiration.examples.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentExampleIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentExampleIndex 
                  ? 'bg-violet-600 w-4' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}