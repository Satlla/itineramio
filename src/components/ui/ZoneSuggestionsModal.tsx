'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './Button'
import { X, Lightbulb, ChevronRight } from 'lucide-react'
import { zoneSuggestions } from '../../data/zoneSuggestions'
import * as LucideIcons from 'lucide-react'

interface ZoneSuggestionsModalProps {
  isOpen: boolean
  onClose: () => void
  zoneName: string
}

export function ZoneSuggestionsModal({
  isOpen,
  onClose,
  zoneName
}: ZoneSuggestionsModalProps) {
  if (!isOpen) return null

  // Normalize zone name to match our suggestions
  const normalizedZoneName = zoneName.toLowerCase().trim()
  const suggestions = zoneSuggestions[normalizedZoneName]

  if (!suggestions) {
    return null
  }

  // Helper to get icon component
  const getIcon = (iconName: string) => {
    const iconMap: Record<string, any> = {
      'map-pin': LucideIcons.MapPin,
      'message-circle': LucideIcons.MessageCircle,
      'video': LucideIcons.Video,
      'key': LucideIcons.Key,
      'lock': LucideIcons.Lock,
      'clock': LucideIcons.Clock,
      'thermometer': LucideIcons.Thermometer,
      'home': LucideIcons.Home,
      'message-square': LucideIcons.MessageSquare,
      'wifi': LucideIcons.Wifi,
      'router': LucideIcons.Router,
      'signal': LucideIcons.Signal,
      'phone': LucideIcons.Phone,
      'shield': LucideIcons.Shield,
      'heart': LucideIcons.Heart,
      'user': LucideIcons.User,
      'building': LucideIcons.Building,
      'volume-x': LucideIcons.VolumeX,
      'users': LucideIcons.Users,
      'cigarette': LucideIcons.Cigarette,
      'dog': LucideIcons.Dog,
      'party-popper': LucideIcons.PartyPopper,
      'car': LucideIcons.Car,
      'ticket': LucideIcons.Ticket,
      'map': LucideIcons.Map,
      'euro': LucideIcons.Euro,
      'ruler': LucideIcons.Ruler,
      'train': LucideIcons.Train,
      'bus': LucideIcons.Bus,
      'plane': LucideIcons.Plane,
      'credit-card': LucideIcons.CreditCard,
      'wind': LucideIcons.Wind,
      'remote': LucideIcons.Zap,
      'droplets': LucideIcons.Droplets,
      'navigation': LucideIcons.Navigation,
      'utensils': LucideIcons.Utensils,
      'coffee': LucideIcons.Coffee,
      'shopping-bag': LucideIcons.ShoppingBag,
      'star': LucideIcons.Star,
      'trash': LucideIcons.Trash,
      'recycle': LucideIcons.Recycle,
      'package': LucideIcons.Package,
      'leaf': LucideIcons.Leaf
    }

    const IconComponent = iconMap[iconName] || LucideIcons.HelpCircle
    return <IconComponent className="w-5 h-5" />
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl w-full max-w-[95vw] sm:max-w-2xl md:max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden my-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-3 sm:p-4 md:p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl font-bold text-gray-900">{suggestions.title}</h2>
                  <p className="text-gray-600 mt-1">{suggestions.description}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Suggestions Section */}
            <div className="p-3 sm:p-4 md:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-amber-500">💡</span> Ideas y Sugerencias
              </h3>
              <div className="grid gap-4">
                {suggestions.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-white rounded-lg flex items-center justify-center text-amber-600 shadow-sm">
                      {getIcon(suggestion.icon)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{suggestion.title}</h4>
                      <p className="text-sm text-gray-600">{suggestion.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Examples Section */}
            <div className="p-3 sm:p-4 md:p-6 bg-blue-50 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-blue-500">📝</span> Ejemplo de Pasos
              </h3>
              <div className="bg-white rounded-lg p-4 space-y-3">
                {suggestions.examples.map((example, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                    </div>
                    <p className="text-gray-700 pt-1">{example}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="p-3 sm:p-4 md:p-6 bg-green-50 border-t">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600">✨</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Consejo Pro</h4>
                  <p className="text-sm text-gray-700">
                    Sé específico y claro en tus instrucciones. Recuerda que tus huéspedes pueden no conocer 
                    la zona y agradecerán todos los detalles que les faciliten su estancia.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 sm:p-4 md:p-6 border-t bg-gray-50">
            <Button
              onClick={onClose}
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              Entendido, ¡voy a crear mis pasos!
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}