'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, Check } from 'lucide-react'

interface AutoSaveIndicatorProps {
  isVisible: boolean
  lastSaved?: Date
}

export function AutoSaveIndicator({ isVisible, lastSaved }: AutoSaveIndicatorProps) {
  const [showSaved, setShowSaved] = useState(false)

  useEffect(() => {
    if (lastSaved) {
      setShowSaved(true)
      const timer = setTimeout(() => setShowSaved(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [lastSaved])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          className="fixed bottom-6 right-6 z-40"
        >
          <div className={`
            px-3 py-2 rounded-lg shadow-lg border backdrop-blur-sm text-sm flex items-center space-x-2
            ${showSaved 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : 'bg-blue-50 border-blue-200 text-blue-700'
            }
          `}>
            {showSaved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Guardado {lastSaved && formatTime(lastSaved)}</span>
              </>
            ) : (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Save className="w-4 h-4" />
                </motion.div>
                <span>Guardando borrador...</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}