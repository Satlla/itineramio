'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bell, Sparkles, Clock, CheckCircle } from 'lucide-react'

interface ComingSoonModalProps {
  isOpen: boolean
  onClose: () => void
  toolName: string
  toolDescription: string
  toolIcon?: React.ReactNode
}

export function ComingSoonModal({
  isOpen,
  onClose,
  toolName,
  toolDescription,
  toolIcon
}: ComingSoonModalProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: `coming_soon_${toolName.toLowerCase().replace(/\s+/g, '_')}`,
          toolName
        })
      })

      if (!response.ok) {
        throw new Error('Error al registrar')
      }

      setIsSuccess(true)

      // Track event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'waitlist_signup', {
          event_category: 'lead',
          event_label: toolName
        })
      }
    } catch (err) {
      setError('Hubo un error. Inténtalo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setIsSuccess(false)
    setError('')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 p-6 text-white">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  {toolIcon || <Clock className="w-6 h-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                      Próximamente
                    </span>
                  </div>
                  <h2 className="text-xl font-bold">{toolName}</h2>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {!isSuccess ? (
                <>
                  <div className="flex items-start gap-3 mb-5 p-4 bg-violet-50 rounded-xl border border-violet-100">
                    <Sparkles className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-violet-900 font-medium mb-1">
                        Estamos mejorando esta herramienta
                      </p>
                      <p className="text-xs text-violet-700">
                        {toolDescription}
                      </p>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Sé el primero en probarlo
                  </h3>
                  <p className="text-gray-600 text-sm mb-5">
                    Déjanos tu email y te avisaremos en cuanto esté disponible.
                    Además, tendrás acceso anticipado exclusivo.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:outline-none transition-colors"
                      />
                    </div>

                    {error && (
                      <p className="text-red-600 text-sm">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Bell className="w-4 h-4" />
                          Avisarme cuando esté listo
                        </>
                      )}
                    </button>
                  </form>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    Sin spam. Solo te avisaremos cuando esté disponible.
                  </p>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    ¡Apuntado!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Te avisaremos a <strong>{email}</strong> en cuanto {toolName} esté disponible.
                  </p>
                  <button
                    onClick={handleClose}
                    className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
