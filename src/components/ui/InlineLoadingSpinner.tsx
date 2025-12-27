'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Wifi, 
  Key, 
  Car, 
  Home, 
  Building2,
  Sparkles
} from 'lucide-react'

interface InlineLoadingSpinnerProps {
  text?: string
  type?: 'zones' | 'properties'
}

export function InlineLoadingSpinner({ 
  text = 'Cargando...', 
  type = 'zones' 
}: InlineLoadingSpinnerProps) {
  const [currentIconIndex, setCurrentIconIndex] = useState(0)

  const icons = type === 'zones' 
    ? [
        { icon: Wifi, color: 'text-blue-500' },
        { icon: Key, color: 'text-amber-500' },
        { icon: Car, color: 'text-gray-600' }
      ]
    : [
        { icon: Home, color: 'text-violet-500' },
        { icon: Building2, color: 'text-indigo-500' },
        { icon: Sparkles, color: 'text-yellow-500' }
      ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIconIndex((prev) => (prev + 1) % icons.length)
    }, 600)

    return () => clearInterval(interval)
  }, [icons.length])

  const currentIcon = icons[currentIconIndex]
  const IconComponent = currentIcon.icon

  return (
    <div className="flex items-center justify-center space-x-3 py-8">
      {/* Animated Icon */}
      <div className="relative w-8 h-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIconIndex}
            initial={{ scale: 0, opacity: 0, rotate: -90 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <IconComponent className={`w-6 h-6 ${currentIcon.color}`} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Loading Text */}
      <span className="text-sm text-gray-600 font-medium">{text}</span>

      {/* Animated dots */}
      <div className="flex space-x-1">
        {[0, 1, 2].map((dot) => (
          <motion.div
            key={dot}
            className="w-1.5 h-1.5 bg-gray-400 rounded-full"
            animate={{
              y: currentIconIndex === dot ? [-3, 0] : 0,
              backgroundColor: currentIconIndex === dot ? '#8B5CF6' : '#CBD5E1'
            }}
            transition={{
              duration: 0.3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </div>
  )
}