'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, BookOpen, X, Play, Users, Star, Check, Gift } from 'lucide-react'
import { Button } from './Button'
import { manualEjemploZones } from '../../data/manualEjemplo'

interface ManualEjemploModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
  userName?: string
}

export function ManualEjemploModal({
  isOpen,
  onClose,
  onAccept,
  userName = 'Usuario'
}: ManualEjemploModalProps) {

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-100 to-blue-100 rounded-full mb-6">
                <Gift className="w-10 h-10 text-violet-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                🎁 ¡Sorpresa, {userName}!
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Hemos creado un <span className="font-semibold text-violet-600">manual completo de ejemplo</span> para que veas cómo funciona Itineramio y te inspires.
              </p>
            </div>

            {/* Value proposition */}
            <div className="bg-gradient-to-br from-violet-50 to-blue-50 border border-violet-200 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Star className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-violet-900 mb-2">✨ ¿Por qué hemos hecho esto?</h3>
                  <ul className="space-y-2 text-sm text-violet-800">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-violet-600" />
                      <span>Para que veas ejemplos reales de contenido profesional</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-violet-600" />
                      <span>Para que sepas qué tipo de información incluir</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-violet-600" />
                      <span>Para que ahorres tiempo - solo adapta lo que necesites</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-violet-600" />
                      <span>Para que veas el potencial de los manuales digitales</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Manual preview */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                📚 Tu manual incluye estas {manualEjemploZones.length} secciones esenciales:
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                {manualEjemploZones.map((zona, index) => (
                  <motion.div
                    key={zona.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">
                          {zona.name === 'Check In' && '🔑'}
                          {zona.name === 'WiFi' && '📶'}
                          {zona.name === 'Check Out' && '🚪'}
                          {zona.name === 'Equipaje' && '🧳'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{zona.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{zona.description}</p>
                        <div className="text-xs text-violet-600 font-medium">
                          {zona.steps.length} pasos incluidos
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Features highlight */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Play className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Videos incluidos</h4>
                <p className="text-sm text-gray-600">Ejemplos visuales profesionales</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Contenido completo</h4>
                <p className="text-sm text-gray-600">Textos, listas, enlaces y más</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">100% personalizable</h4>
                <p className="text-sm text-gray-600">Edita todo como necesites</p>
              </div>
            </div>

            {/* Call to action */}
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                <span className="font-medium">¡Es solo el punto de partida!</span> Siéntete libre de editar, eliminar o adaptar todo a tu apartamento específico.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={onAccept}
                  className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-8 py-3 text-lg"
                >
                  🚀 ¡Perfecto! Ver mi manual
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="px-8 py-3 text-lg border-gray-300"
                >
                  Empezar desde cero
                </Button>
              </div>
              
              <p className="text-xs text-gray-500 mt-4">
                💡 Puedes editar o eliminar cualquier sección en cualquier momento
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}