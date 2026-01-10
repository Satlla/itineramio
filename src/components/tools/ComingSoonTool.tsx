'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Lock, ArrowLeft, Bell, Mail, Clock, Sparkles, CheckCircle } from 'lucide-react'
import { Navbar } from '../layout/Navbar'

interface ComingSoonToolProps {
  toolName: string
  toolDescription: string
  icon: React.ReactNode
  color: string
  bgColor: string
}

export function ComingSoonTool({
  toolName,
  toolDescription,
  icon,
  color,
  bgColor
}: ComingSoonToolProps) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    try {
      await fetch('/api/email/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: `coming-soon-${toolName.toLowerCase().replace(/\s+/g, '-')}`,
          tags: ['waiting-list', 'coming-soon']
        })
      })
      setSubmitted(true)
    } catch (error) {
      console.error('Error subscribing:', error)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      <div className="pt-32 pb-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          {/* Back link */}
          <Link
            href="/hub"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Hub
          </Link>

          {/* Icon with lock */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative inline-block mb-8"
          >
            <div
              className={`w-24 h-24 rounded-3xl ${bgColor} flex items-center justify-center shadow-lg`}
            >
              {icon}
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-100">
              <Lock className="w-5 h-5 text-gray-500" />
            </div>
          </motion.div>

          {/* Coming Soon Badge */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium mb-6"
          >
            <Clock className="w-4 h-4" />
            Próximamente
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            {toolName}
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-gray-600 mb-8"
          >
            {toolDescription}
          </motion.p>

          {/* Status message */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center justify-center gap-2 text-violet-800 font-medium mb-2">
              <Sparkles className="w-5 h-5" />
              Estamos mejorando esta herramienta
            </div>
            <p className="text-gray-600">
              Esta herramienta estará disponible próximamente para suscriptores y usuarios de Itineramio.
              Déjanos tu email para ser el primero en acceder.
            </p>
          </motion.div>

          {/* Email Form */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {!submitted ? (
              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <Bell className="w-4 h-4" />
                    {loading ? 'Enviando...' : 'Avisarme'}
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  Te avisaremos cuando la herramienta esté disponible. Sin spam.
                </p>
              </form>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 max-w-md mx-auto">
                <div className="flex items-center justify-center gap-2 text-green-700 font-medium">
                  <CheckCircle className="w-5 h-5" />
                  ¡Perfecto! Te avisaremos pronto
                </div>
                <p className="text-sm text-green-600 mt-2">
                  Recibirás un email cuando esta herramienta esté disponible.
                </p>
              </div>
            )}
          </motion.div>

          {/* Available resources */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 pt-8 border-t border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Mientras tanto, prueba estas herramientas disponibles:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/hub/tools/cleaning-checklist"
                className="p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all group"
              >
                <div className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                  Checklist de Limpieza
                </div>
                <div className="text-sm text-gray-500">
                  Checklist profesional personalizable
                </div>
              </Link>
              <Link
                href="/recursos/plantilla-reviews"
                className="p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-rose-500 hover:shadow-md transition-all group"
              >
                <div className="font-semibold text-gray-900 group-hover:text-rose-600 transition-colors">
                  Guía de Reseñas
                </div>
                <div className="text-sm text-gray-500">
                  Educa a tus huéspedes sobre valoraciones
                </div>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
