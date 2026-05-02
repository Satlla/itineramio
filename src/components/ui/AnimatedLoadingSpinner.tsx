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

  const zoneIcons = [
    { icon: Wifi, label: 'WiFi' },
    { icon: Key, label: 'Check-in' },
    { icon: DoorOpen, label: 'Check-out' },
    { icon: Info, label: 'Info' },
    { icon: Car, label: 'Parking' },
    { icon: Phone, label: 'Contactos' },
    { icon: Utensils, label: 'Cocina' },
    { icon: Bath, label: 'Baño' }
  ]

  const propertyIcons = [
    { icon: Home, label: 'Casa' },
    { icon: Building2, label: 'Apartamento' },
    { icon: Bed, label: 'Habitación' },
    { icon: MapPin, label: 'Ubicación' },
    { icon: Users, label: 'Huéspedes' },
    { icon: Shield, label: 'Seguridad' }
  ]

  const generalIcons = [
    { icon: Sparkles, label: 'Preparando' },
    { icon: Clock, label: 'Cargando' }
  ]

  const icons = type === 'zones' ? zoneIcons : type === 'properties' ? propertyIcons : generalIcons

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIconIndex((prev) => (prev + 1) % icons.length)
    }, 800)

    return () => clearInterval(interval)
  }, [icons.length])

  const currentIcon = icons[currentIconIndex]
  const IconComponent = currentIcon.icon

  return (
    <div role="status" aria-label="Cargando" className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-8">
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: '#f0efed' }}
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIconIndex}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <IconComponent className="w-9 h-9" style={{ color: '#555' }} />
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className="text-xl font-semibold mb-2" style={{ color: '#111' }}>
            {text}
          </h2>

          <AnimatePresence mode="wait">
            <motion.p
              key={currentIconIndex}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="text-sm"
              style={{ color: '#555' }}
            >
              {type === 'zones' && `Preparando zona: ${currentIcon.label}`}
              {type === 'properties' && `Configurando: ${currentIcon.label}`}
              {type === 'general' && 'Un momento por favor...'}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        <div className="flex items-center justify-center gap-1.5 mt-8">
          {[0, 1, 2].map((dot) => (
            <motion.div
              key={dot}
              className="rounded-full"
              animate={{
                width: currentIconIndex % 3 === dot ? 20 : 6,
                height: 6,
                backgroundColor: currentIconIndex % 3 === dot ? '#7c3aed' : 'rgba(0,0,0,0.1)'
              }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
