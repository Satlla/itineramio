'use client'

import React, { useState } from 'react'
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
  Plus
} from 'lucide-react'
import { Button } from './Button'
import { Card } from './Card'
import { Badge } from './Badge'
import { ZoneIcon } from '../../data/zoneIconsNew'
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
  const [showExamples, setShowExamples] = useState(false)
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0)

  const impactColors = {
    low: 'text-gray-600 bg-gray-100',
    medium: 'text-yellow-600 bg-yellow-100',
    high: 'text-green-600 bg-green-100'
  }

  const difficultyColors = {
    easy: 'text-green-600 bg-green-100',
    medium: 'text-yellow-600 bg-yellow-100',
    advanced: 'text-red-600 bg-red-100'
  }

  const categoryLabels = {
    transport: 'Transporte',
    local: 'Local',
    services: 'Servicios',
    experience: 'Experiencia',
    convenience: 'Comodidad',
    safety: 'Seguridad'
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        <Card className="overflow-hidden bg-gradient-to-br from-white via-gray-50 to-gray-100 border-l-4 border-l-violet-500 shadow-lg hover:shadow-xl transition-shadow">
          {/* Header */}
          <div className="relative p-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white">
            <div className="absolute top-2 right-2">
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
                <ZoneIcon iconId={inspiration.icon} className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <Lightbulb className="w-4 h-4 text-yellow-300" />
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
              <Badge variant="outline" className="text-xs">
                {categoryLabels[inspiration.category]}
              </Badge>
              <div className="flex items-center space-x-3 text-xs">
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${impactColors[inspiration.impact]}`}>
                  <TrendingUp className="w-3 h-3" />
                  <span className="font-medium">Impacto {inspiration.impact}</span>
                </div>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${difficultyColors[inspiration.difficulty]}`}>
                  <Star className="w-3 h-3" />
                  <span className="font-medium">{inspiration.difficulty}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-700 text-sm leading-relaxed">
              {inspiration.description}
            </p>

            {/* Benefits */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-900">Beneficios principales:</span>
              </div>
              <ul className="space-y-1 ml-6">
                {inspiration.benefits.slice(0, 2).map((benefit, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start">
                    <span className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            {/* Time and Examples Preview */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <Clock className="w-3 h-3" />
                  <span>{inspiration.estimatedTime}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowExamples(!showExamples)}
                  className="h-6 text-xs text-violet-600 hover:text-violet-700"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  {showExamples ? 'Ocultar' : 'Ver ejemplos'}
                </Button>
              </div>
              
              {/* Example Preview */}
              <AnimatePresence>
                {showExamples && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2"
                  >
                    <div className="text-xs font-medium text-gray-900">
                      Ejemplo {currentExampleIndex + 1} de {inspiration.examples.length}:
                    </div>
                    <div className="text-xs text-gray-600 bg-white p-2 rounded border">
                      {inspiration.examples[currentExampleIndex]}
                    </div>
                    {inspiration.examples.length > 1 && (
                      <div className="flex justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentExampleIndex((prev) => 
                            (prev + 1) % inspiration.examples.length
                          )}
                          className="h-5 text-xs text-gray-500 hover:text-gray-700"
                        >
                          Siguiente ejemplo <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="flex space-x-2 pt-2">
              <Button
                onClick={onCreateZone}
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear esta zona
              </Button>
              <Button
                onClick={onViewExamples}
                variant="outline"
                className="px-3 text-sm"
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Floating inspiration indicator */}
          <div className="absolute -top-2 -right-2">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg"
            >
              <Lightbulb className="w-4 h-4 text-yellow-800" />
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}