'use client'

import React, { useState } from 'react'
import { X, Download, Mail, User, Sparkles, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { fbEvents } from '@/components/analytics/FacebookPixel'

interface LeadCaptureModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string; email: string }) => void
  title: string
  description?: string
  downloadLabel?: string
  toolName?: string // For Facebook Pixel tracking
}

export function LeadCaptureModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  description = 'Déjanos tu email para enviarte el contenido y mantener contacto',
  downloadLabel = 'Descargar',
  toolName = 'Herramienta',
}: LeadCaptureModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Basic validation
    if (!name.trim() || !email.trim()) {
      setError('Por favor completa todos los campos')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Por favor ingresa un email válido')
      return
    }

    setIsSubmitting(true)

    try {
      // Call parent onSubmit
      await onSubmit({ name, email })

      // Facebook Pixel Lead event
      fbEvents.lead({
        content_name: toolName,
        content_category: 'herramienta-gratuita',
        value: 0,
        currency: 'EUR'
      })

      // Reset form
      setName('')
      setEmail('')
    } catch (err) {
      setError('Hubo un error. Por favor intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="bg-white rounded-xl sm:rounded-lg sm:rounded-xl md:rounded-2xl md:rounded-3xl shadow-2xl max-w-[90vw] sm:max-w-sm md:max-w-md w-full overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              {/* Header with gradient */}
              <div className="bg-gradient-to-br from-violet-500 via-purple-600 to-pink-600 p-3 sm:p-4 md:p-3 sm:p-4 md:p-6 lg:p-8 text-white relative overflow-hidden">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"
                />

                <div className="relative z-10">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center mb-4">
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-base sm:text-lg md:text-xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl md:text-3xl font-bold mb-2">{title}</h2>
                  <p className="text-white/90">{description}</p>
                </div>
              </div>

              {/* Form */}
              <div className="p-3 sm:p-4 md:p-3 sm:p-4 md:p-6 lg:p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tu nombre
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Juan Pérez"
                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:outline-none text-gray-900 placeholder-gray-400"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Email field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tu email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="juan@ejemplo.com"
                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:outline-none text-gray-900 placeholder-gray-400"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Error message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* Benefits */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                    <h3 className="text-sm font-bold text-green-900 mb-3 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Al descargar también recibirás:
                    </h3>
                    <ul className="space-y-2 text-sm text-green-800">
                      <li className="flex items-start">
                        <span className="mr-2">✓</span>
                        <span>Acceso a todas las herramientas gratuitas</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">✓</span>
                        <span>Guías y tips exclusivos cada semana</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">✓</span>
                        <span>Plantillas adicionales para tu negocio</span>
                      </li>
                    </ul>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg flex items-center justify-center hover:shadow-xl hover:shadow-violet-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
                        />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                        {downloadLabel}
                      </>
                    )}
                  </button>

                  {/* Privacy note */}
                  <p className="text-xs text-center text-gray-500">
                    Tu información está segura. No compartimos datos con terceros.
                  </p>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
