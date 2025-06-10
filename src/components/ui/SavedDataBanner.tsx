'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, X, Clock, RefreshCw } from 'lucide-react'
import { Button } from './Button'

interface SavedDataBannerProps {
  isVisible: boolean
  onRestore: () => void
  onDiscard: () => void
  timestamp?: Date | null
  onClose: () => void
}

export function SavedDataBanner({ 
  isVisible, 
  onRestore, 
  onDiscard, 
  timestamp,
  onClose 
}: SavedDataBannerProps) {
  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) {
      return 'hace un momento'
    } else if (diffInMinutes < 60) {
      return `hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `hace ${hours} hora${hours > 1 ? 's' : ''}`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return `hace ${days} día${days > 1 ? 's' : ''}`
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="mb-6"
        >
          <div className="bg-gradient-to-r from-blue-50 to-violet-50 border border-blue-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Save className="w-5 h-5 text-blue-600" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    📝 Datos guardados encontrados
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Encontramos información de una propiedad que estabas creando anteriormente.
                    {timestamp && (
                      <span className="flex items-center mt-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        Guardado {formatTimestamp(timestamp)}
                      </span>
                    )}
                  </p>
                  
                  <div className="flex items-center space-x-3">
                    <Button
                      onClick={onRestore}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Continuar donde lo dejé
                    </Button>
                    
                    <Button
                      onClick={onDiscard}
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Empezar de nuevo
                    </Button>
                  </div>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors ml-2"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}