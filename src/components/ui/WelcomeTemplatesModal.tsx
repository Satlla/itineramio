'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, BookOpen, X, Play, Users, Star, Home } from 'lucide-react'
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
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="bg-white rounded-2xl p-5 sm:p-7 md:p-8 max-w-3xl w-full max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.12)' }}
          >
            <div className="text-center mb-7 sm:mb-8">
              <div
                className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
                style={{ backgroundColor: '#f0efed' }}
              >
                <Sparkles className="w-7 h-7" style={{ color: '#7c3aed' }} />
              </div>
              <h1
                className="text-2xl sm:text-3xl font-semibold mb-3 tracking-tight"
                style={{ color: '#111' }}
              >
                Bienvenido a Itineramio, {userName}
              </h1>
              <p className="text-base leading-relaxed max-w-xl mx-auto" style={{ color: '#555' }}>
                Hemos preparado un manual básico con las zonas más importantes para que veas cómo
                funciona la plataforma.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 sm:gap-4 mb-7 sm:mb-8">
              {[
                { icon: Play, title: 'Videos reales', desc: 'Ejemplos profesionales para inspirarte' },
                { icon: BookOpen, title: 'Contenido completo', desc: 'Textos, imágenes y estructuras listas' },
                { icon: Users, title: '100% personalizable', desc: 'Edita o adapta todo a tu apartamento' }
              ].map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="text-center p-5 rounded-2xl"
                  style={{ backgroundColor: '#f5f3f0' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: 'rgba(0,0,0,0.04)' }}
                  >
                    <Icon className="w-5 h-5" style={{ color: '#555' }} />
                  </div>
                  <h3 className="font-semibold mb-1.5 text-sm" style={{ color: '#111' }}>{title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: '#555' }}>{desc}</p>
                </div>
              ))}
            </div>

            <div className="mb-7 sm:mb-8">
              <p
                className="text-[11px] uppercase tracking-[0.18em] font-medium mb-4 text-center"
                style={{ color: '#aaa' }}
              >
                Tu manual incluye {essentialTemplates.length} zonas esenciales
              </p>

              <div className="grid sm:grid-cols-3 gap-2.5 sm:gap-3">
                {essentialTemplates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="flex items-center gap-3 p-3 rounded-xl border"
                    style={{ backgroundColor: '#fff', borderColor: 'rgba(0,0,0,0.06)' }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: '#f0efed' }}
                    >
                      <Home className="w-4 h-4" style={{ color: '#555' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate" style={{ color: '#111' }}>
                        {template.name}
                      </p>
                      <p className="text-xs truncate" style={{ color: '#aaa' }}>
                        {template.steps.length} paso{template.steps.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div
              className="rounded-2xl p-5 sm:p-6 mb-7 sm:mb-8"
              style={{ backgroundColor: '#f5f3f0' }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(0,0,0,0.04)' }}
                >
                  <Star className="w-4 h-4" style={{ color: '#555' }} />
                </div>
                <div>
                  <h4 className="font-semibold mb-2.5 text-sm" style={{ color: '#111' }}>
                    Por qué te ayudará este manual
                  </h4>
                  <ul className="space-y-1.5 text-sm" style={{ color: '#555' }}>
                    {[
                      'Ahorra tiempo: no empiezas desde cero',
                      'Ve ejemplos reales de contenido profesional',
                      'Aprende qué información incluir en cada zona',
                      'Adapta todo a tu apartamento específico'
                    ].map((line) => (
                      <li key={line} className="flex items-center gap-2">
                        <span
                          className="w-1 h-1 rounded-full flex-shrink-0"
                          style={{ backgroundColor: '#7c3aed' }}
                        />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="mb-6 text-sm" style={{ color: '#555' }}>
                Es solo el punto de partida. Siéntete libre de editar, eliminar y adaptar todo a tu
                apartamento.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={onAccept}
                  className="font-semibold px-7 py-3 text-base rounded-full text-white"
                  style={{ backgroundColor: '#7c3aed' }}
                >
                  Ver mi manual
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="px-7 py-3 text-base rounded-full"
                  style={{ borderColor: 'rgba(0,0,0,0.1)', color: '#555' }}
                >
                  Empezar desde cero
                </Button>
              </div>

              <p className="text-xs mt-4" style={{ color: '#aaa' }}>
                Podrás modificar o eliminar cualquier zona en cualquier momento.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
