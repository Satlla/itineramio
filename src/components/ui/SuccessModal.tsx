'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, X } from 'lucide-react'

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  autoClose?: boolean
  autoCloseDelay?: number
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  autoClose = true,
  autoCloseDelay = 3000
}) => {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose()
      }, autoCloseDelay)

      return () => clearTimeout(timer)
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-2xl max-w-[90vw] sm:max-w-sm md:max-w-md w-full overflow-hidden"
        >
          {/* Header con gradiente verde */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 sm:p-4 md:p-3 sm:p-4 md:p-6 lg:p-8 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', damping: 15 }}
                className="bg-white/20 backdrop-blur-sm rounded-full p-4 mb-4"
              >
                <CheckCircle2 className="h-16 w-16 text-white" />
              </motion.div>
              <h2 className="text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl font-bold">{title}</h2>
            </div>
          </div>

          {/* Contenido */}
          <div className="p-3 sm:p-4 md:p-3 sm:p-4 md:p-6 lg:p-8 text-center">
            <p className="text-gray-700 text-lg leading-relaxed">{message}</p>

            <button
              onClick={onClose}
              className="mt-6 w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-3 sm:px-4 md:px-6 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
            >
              Entendido
            </button>
          </div>

          {/* Progress bar si autoClose está activado */}
          {autoClose && (
            <motion.div
              className="h-1 bg-gradient-to-r from-green-500 to-emerald-600"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: autoCloseDelay / 1000, ease: 'linear' }}
            />
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
