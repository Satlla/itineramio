'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Wifi, 
  Key, 
  Car, 
  Utensils, 
  Bath, 
  Bed, 
  Home, 
  MapPin,
  DoorOpen,
  Phone,
  Info,
  Building2,
  Sparkles,
  Clock,
  Shield,
  Users
} from 'lucide-react'

interface AnimatedLoadingSpinnerProps {
  text?: string
  type?: 'zones' | 'properties' | 'general'
}

export function AnimatedLoadingSpinner({ 
  text = 'Cargando...', 
  type = 'general' 
}: AnimatedLoadingSpinnerProps) {
  const [currentIconIndex, setCurrentIconIndex] = useState(0)

  // Different icon sets for different contexts
  const zoneIcons = [
    { icon: Wifi, color: 'text-blue-500', bgColor: 'bg-blue-100', label: 'WiFi' },
    { icon: Key, color: 'text-amber-500', bgColor: 'bg-amber-100', label: 'Check-in' },
    { icon: DoorOpen, color: 'text-green-500', bgColor: 'bg-green-100', label: 'Check-out' },
    { icon: Info, color: 'text-purple-500', bgColor: 'bg-purple-100', label: 'Info' },
    { icon: Car, color: 'text-gray-600', bgColor: 'bg-gray-100', label: 'Parking' },
    { icon: Phone, color: 'text-red-500', bgColor: 'bg-red-100', label: 'Contactos' },
    { icon: Utensils, color: 'text-orange-500', bgColor: 'bg-orange-100', label: 'Cocina' },
    { icon: Bath, color: 'text-cyan-500', bgColor: 'bg-cyan-100', label: 'Baño' }
  ]

  const propertyIcons = [
    { icon: Home, color: 'text-violet-500', bgColor: 'bg-violet-100', label: 'Casa' },
    { icon: Building2, color: 'text-indigo-500', bgColor: 'bg-indigo-100', label: 'Apartamento' },
    { icon: Bed, color: 'text-pink-500', bgColor: 'bg-pink-100', label: 'Habitación' },
    { icon: MapPin, color: 'text-green-500', bgColor: 'bg-green-100', label: 'Ubicación' },
    { icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-100', label: 'Huéspedes' },
    { icon: Shield, color: 'text-purple-500', bgColor: 'bg-purple-100', label: 'Seguridad' }
  ]

  const generalIcons = [
    { icon: Sparkles, color: 'text-yellow-500', bgColor: 'bg-yellow-100', label: 'Preparando' },
    { icon: Clock, color: 'text-blue-500', bgColor: 'bg-blue-100', label: 'Cargando' }
  ]

  const icons = type === 'zones' ? zoneIcons : type === 'properties' ? propertyIcons : generalIcons

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIconIndex((prev) => (prev + 1) % icons.length)
    }, 800) // Change icon every 800ms

    return () => clearInterval(interval)
  }, [icons.length])

  const currentIcon = icons[currentIconIndex]
  const IconComponent = currentIcon.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
      <div className="text-center">
        {/* Animated Icon Container */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          {/* Background circle */}
          <motion.div
            className="absolute inset-0 bg-gray-100 rounded-full"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Icon transitions */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIconIndex}
              initial={{ scale: 0, opacity: 0, rotate: -180 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0, rotate: 180 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className={`absolute inset-0 flex items-center justify-center rounded-full ${currentIcon.bgColor}`}
            >
              <IconComponent className={`w-10 h-10 ${currentIcon.color}`} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {text}
          </h2>
          
          {/* Animated subtitle based on current icon */}
          <AnimatePresence mode="wait">
            <motion.p
              key={currentIconIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
              className="text-sm text-gray-600"
            >
              {type === 'zones' && `Preparando zona: ${currentIcon.label}`}
              {type === 'properties' && `Configurando: ${currentIcon.label}`}
              {type === 'general' && 'Un momento por favor...'}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        {/* Progress dots */}
        <div className="flex items-center justify-center space-x-2 mt-8">
          {[0, 1, 2].map((dot) => (
            <motion.div
              key={dot}
              className="w-2 h-2 bg-gray-400 rounded-full"
              animate={{
                scale: currentIconIndex % 3 === dot ? [1, 1.5, 1] : 1,
                backgroundColor: currentIconIndex % 3 === dot ? '#8B5CF6' : '#CBD5E1'
              }}
              transition={{
                duration: 0.5,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}