'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, BookOpen, X, Play, Users, Star } from 'lucide-react'
import { Button } from './Button'
import { essentialTemplates } from '../../data/essentialTemplates'

interface WelcomeTemplatesModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
  userName?: string
}

export function WelcomeTemplatesModal({
  isOpen,
  onClose,
  onAccept,
  userName = 'Usuario'
}: WelcomeTemplatesModalProps) {

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
                <Sparkles className="w-10 h-10 text-violet-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                🎉 ¡Bienvenido a Itineramio, {userName}!
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Hemos preparado un <span className="font-semibold text-violet-600">manual básico profesional</span> con las zonas más importantes para que veas cómo funciona la plataforma.
              </p>
            </div>

            {/* Features highlights */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Play className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Videos reales</h3>
                <p className="text-sm text-gray-600">Ejemplos con videos profesionales para inspirarte</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Contenido completo</h3>
                <p className="text-sm text-gray-600">Textos, imágenes y estructuras ya preparadas</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">100% personalizable</h3>
                <p className="text-sm text-gray-600">Edita, elimina o adapta todo a tu apartamento</p>
              </div>
            </div>

            {/* Templates preview */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                📋 Tu manual incluye {essentialTemplates.length} zonas esenciales:
              </h3>
              
              <div className="grid md:grid-cols-3 gap-3">
                {essentialTemplates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">🏠</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {template.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {template.steps.length} paso{template.steps.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-gradient-to-br from-violet-50 to-blue-50 border border-violet-200 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Star className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-violet-900 mb-2">✨ ¿Por qué te ayudará este manual?</h4>
                  <ul className="space-y-2 text-sm text-violet-800">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-violet-400 rounded-full"></span>
                      <span>Ahorra tiempo: no empiezas desde cero</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-violet-400 rounded-full"></span>
                      <span>Ve ejemplos reales de contenido profesional</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-violet-400 rounded-full"></span>
                      <span>Aprende qué información incluir en cada zona</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-violet-400 rounded-full"></span>
                      <span>Adapta todo a tu apartamento específico</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Call to action */}
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                <span className="font-medium">¡Es solo el punto de partida!</span> Siéntete libre de editar, eliminar, adaptar todo a tu apartamento y crear nuevas zonas personalizadas.
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
                💡 Podrás modificar o eliminar cualquier zona en cualquier momento
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}