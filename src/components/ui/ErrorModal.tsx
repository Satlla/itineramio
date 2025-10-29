'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XCircle, X, AlertTriangle } from 'lucide-react'

interface ErrorModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: 'error' | 'warning'
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'error'
}) => {
  if (!isOpen) return null

  const isError = type === 'error'
  const Icon = isError ? XCircle : AlertTriangle
  const colorClasses = isError
    ? {
        gradient: 'from-red-500 to-rose-600',
        hoverGradient: 'hover:from-red-600 hover:to-rose-700',
        bg: 'bg-red-500'
      }
    : {
        gradient: 'from-orange-500 to-amber-600',
        hoverGradient: 'hover:from-orange-600 hover:to-amber-700',
        bg: 'bg-orange-500'
      }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          {/* Header con gradiente rojo/naranja */}
          <div className={`bg-gradient-to-r ${colorClasses.gradient} p-8 text-white relative`}>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', damping: 15 }}
                className="bg-white/20 backdrop-blur-sm rounded-full p-4 mb-4"
              >
                <Icon className="h-16 w-16 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold">{title}</h2>
            </div>
          </div>

          {/* Contenido */}
          <div className="p-8 text-center">
            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">{message}</p>

            <button
              onClick={onClose}
              className={`mt-6 w-full bg-gradient-to-r ${colorClasses.gradient} text-white py-3 px-6 rounded-lg font-medium ${colorClasses.hoverGradient} transition-all shadow-lg hover:shadow-xl`}
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
