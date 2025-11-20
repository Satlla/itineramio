'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, Check } from 'lucide-react'

interface AutoSaveIndicatorProps {
  isVisible: boolean
  lastSaved?: Date
  isSaving?: boolean
}

export function AutoSaveIndicator({ isVisible, lastSaved, isSaving = false }: AutoSaveIndicatorProps) {
  const [showSaved, setShowSaved] = useState(false)
  const [showIndicator, setShowIndicator] = useState(false)

  // Show "Guardado" message briefly when lastSaved changes
  useEffect(() => {
    if (lastSaved) {
      setShowSaved(true)
      setShowIndicator(true)
      const timer = setTimeout(() => {
        setShowSaved(false)
        // Hide indicator completely after showing "Guardado"
        setTimeout(() => setShowIndicator(false), 300)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [lastSaved])

  // Show indicator when saving
  useEffect(() => {
    if (isSaving) {
      setShowIndicator(true)
    }
  }, [isSaving])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <AnimatePresence>
      {showIndicator && isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40"
        >
          <div className={`
            px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg shadow-lg border backdrop-blur-sm text-xs sm:text-sm flex items-center space-x-1.5 sm:space-x-2
            ${showSaved
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-blue-50 border-blue-200 text-blue-700'
            }
          `}>
            {showSaved ? (
              <>
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Guardado {lastSaved && formatTime(lastSaved)}</span>
                <span className="inline sm:hidden">Guardado</span>
              </>
            ) : (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </motion.div>
                <span className="hidden sm:inline">Guardando borrador...</span>
                <span className="inline sm:hidden">Guardando...</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}