'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Clock,
  Globe,
  QrCode,
  CheckCircle,
  ArrowRight,
  Link2,
  Loader2,
  X,
  Camera,
  Languages,
  Zap,
} from 'lucide-react'

interface Step0IntroProps {
  onStart: () => void
  onAirbnbImport: (url: string) => void
  airbnbImport: {
    importing: boolean
    imported: boolean
    error: string | null
    importedFields: string[]
  }
}

const WHAT_YOU_GET = [
  {
    icon: CheckCircle,
    color: 'text-green-500',
    bg: 'bg-green-50',
    title: 'Zonas esenciales listas',
    desc: 'Check-in, WiFi, Normas, Emergencias, Reciclaje y Cómo llegar',
  },
  {
    icon: Languages,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    title: '3 idiomas automáticos',
    desc: 'Todo en Español, Inglés y Francés sin esfuerzo',
  },
  {
    icon: QrCode,
    color: 'text-violet-500',
    bg: 'bg-violet-50',
    title: 'QR por zona',
    desc: 'Cada zona con su QR único para tus huéspedes',
  },
  {
    icon: Camera,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    title: 'Zonas de tus fotos',
    desc: 'Sube fotos de tu lavadora, cafetera, TV... y la IA las convierte en zonas',
  },
]

export default function Step0Intro({ onStart, onAirbnbImport, airbnbImport }: Step0IntroProps) {
  const [showAirbnbInput, setShowAirbnbInput] = useState(false)
  const [airbnbUrl, setAirbnbUrl] = useState('')

  const handleImport = () => {
    if (!airbnbUrl.trim()) return
    onAirbnbImport(airbnbUrl.trim())
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Hero */}
      <div className="text-center space-y-3 pt-2">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="w-16 h-16 mx-auto rounded-2xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/30"
        >
          <Sparkles className="w-8 h-8 text-white" />
        </motion.div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Crea tu manual en 8 minutos
        </h1>
        <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto">
          La IA genera instrucciones profesionales en 3 idiomas para cada zona de tu alojamiento.
        </p>

        {/* Meta */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs text-gray-400 pt-1">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            ~8 minutos
          </span>
          <span className="w-px h-3 bg-gray-200" />
          <span className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            ES · EN · FR
          </span>
          <span className="w-px h-3 bg-gray-200" />
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            Sin conocimientos técnicos
          </span>
        </div>
      </div>

      {/* What you get */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Qué obtienes
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {WHAT_YOU_GET.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.07 }}
              className="flex items-start gap-3"
            >
              <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Airbnb import — prominente */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3"
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Link2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">¿Tienes alojamiento en Airbnb?</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Importa el nombre, descripción, fotos y datos del alojamiento en un clic.
              Ahorra 5 minutos.
            </p>
          </div>
        </div>

        {airbnbImport.imported ? (
          <div className="flex items-center gap-2 p-2.5 bg-green-50 border border-green-200 rounded-xl">
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            <p className="text-sm text-green-700 font-medium">
              Datos importados: {airbnbImport.importedFields.length} campos
            </p>
          </div>
        ) : !showAirbnbInput ? (
          <button
            type="button"
            onClick={() => setShowAirbnbInput(true)}
            className="w-full h-10 rounded-xl text-sm font-semibold bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700 transition-colors"
          >
            Importar desde Airbnb
          </button>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="url"
                value={airbnbUrl}
                onChange={e => setAirbnbUrl(e.target.value)}
                placeholder="https://www.airbnb.es/rooms/..."
                className="flex-1 h-10 px-3 rounded-xl border border-amber-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                onKeyDown={e => e.key === 'Enter' && handleImport()}
                autoFocus
              />
              <button
                type="button"
                onClick={handleImport}
                disabled={airbnbImport.importing || !airbnbUrl.trim()}
                className="h-10 px-4 rounded-xl text-sm font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0"
              >
                {airbnbImport.importing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Importar'
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowAirbnbInput(false)}
                className="h-10 w-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {airbnbImport.error && (
              <p className="text-xs text-red-500">{airbnbImport.error}</p>
            )}
          </div>
        )}
      </motion.div>

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        type="button"
        onClick={onStart}
        className="w-full h-14 rounded-2xl text-base sm:text-lg font-semibold bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/25 transition-all duration-300 flex items-center justify-center gap-2"
      >
        <Sparkles className="w-5 h-5" />
        {airbnbImport.imported ? 'Continuar con datos importados' : 'Empezar'}
        <ArrowRight className="w-5 h-5" />
      </motion.button>

      <p className="text-center text-xs text-gray-400">
        Puedes editar todo después de la creación
      </p>
    </motion.div>
  )
}
