'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckSquare,
  ArrowLeft,
  Copy,
  Check,
  Download,
  Sparkles,
  Plus,
  Trash2,
  Clock,
  MapPin,
  Key,
  Wifi,
  Home,
  AlertCircle
} from 'lucide-react'
import { Navbar } from '../../../../../src/components/layout/Navbar'
import { SocialShare } from '../../../../../src/components/tools/SocialShare'
import { LeadCaptureModal } from '../../../../../src/components/tools/LeadCaptureModal'

interface ChecklistItem {
  id: string
  text: string
  category: 'before' | 'arrival' | 'during' | 'departure'
  completed: boolean
}

const predefinedItems = {
  before: [
    'Confirmar reserva y enviar detalles',
    'Verificar limpieza programada',
    'Revisar inventario y amenities',
    'Enviar instrucciones de acceso',
    'Compartir recomendaciones locales'
  ],
  arrival: [
    'Verificar código de acceso/llaves',
    'Check-in remoto completado',
    'Confirmar llegada del huésped',
    'Verificar que todo funcione correctamente',
    'Mensaje de bienvenida enviado'
  ],
  during: [
    'Responder consultas en <2h',
    'Verificar que no hay incidencias',
    'Ofrecer servicios adicionales',
    'Check mid-stay (estancias +7 días)',
    'Mantener comunicación proactiva'
  ],
  departure: [
    'Recordatorio check-out (día anterior)',
    'Confirmar hora de salida',
    'Inspección post check-out',
    'Solicitar review',
    'Preparar propiedad para siguiente huésped'
  ]
}

const categoryInfo = {
  before: { icon: Clock, label: 'Antes del Check-in', color: 'blue' },
  arrival: { icon: Key, label: 'Llegada', color: 'green' },
  during: { icon: Home, label: 'Durante la Estancia', color: 'purple' },
  departure: { icon: MapPin, label: 'Check-out', color: 'orange' }
}

export default function CheckinBuilder() {
  const [propertyName, setPropertyName] = useState('')
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([])
  const [newItemText, setNewItemText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'before' | 'arrival' | 'during' | 'departure'>('before')
  const [copied, setCopied] = useState(false)

  // Lead capture states
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<'download' | null>(null)

  const addPredefinedItems = (category: keyof typeof predefinedItems) => {
    const items: ChecklistItem[] = predefinedItems[category].map((text, index) => ({
      id: `${category}-${Date.now()}-${index}`,
      text,
      category,
      completed: false
    }))
    setChecklistItems(prev => [...prev, ...items])
  }

  const addCustomItem = () => {
    if (!newItemText.trim()) return

    const newItem: ChecklistItem = {
      id: `custom-${Date.now()}`,
      text: newItemText,
      category: selectedCategory,
      completed: false
    }
    setChecklistItems(prev => [...prev, newItem])
    setNewItemText('')
  }

  const removeItem = (id: string) => {
    setChecklistItems(prev => prev.filter(item => item.id !== id))
  }

  const toggleItem = (id: string) => {
    setChecklistItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    )
  }

  const generateChecklist = () => {
    const grouped = {
      before: checklistItems.filter(i => i.category === 'before'),
      arrival: checklistItems.filter(i => i.category === 'arrival'),
      during: checklistItems.filter(i => i.category === 'during'),
      departure: checklistItems.filter(i => i.category === 'departure')
    }

    let output = `CHECKLIST DE CHECK-IN/OUT - ${propertyName || 'Mi Propiedad'}\n`
    output += `${'='.repeat(60)}\n\n`

    Object.entries(grouped).forEach(([category, items]) => {
      if (items.length === 0) return
      const info = categoryInfo[category as keyof typeof categoryInfo]
      output += `${info.label.toUpperCase()}\n${'-'.repeat(info.label.length)}\n`
      items.forEach((item, index) => {
        output += `${index + 1}. [ ] ${item.text}\n`
      })
      output += '\n'
    })

    output += `\nGenerado con Itineramio - https://itineramio.com\n`
    return output
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateChecklist())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadClick = () => {
    setPendingAction('download')
    setShowLeadModal(true)
  }

  const downloadChecklist = () => {
    const content = generateChecklist()
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `checklist-${propertyName || 'propiedad'}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleLeadSubmit = async (data: { name: string; email: string }) => {
    try {
      const response = await fetch('/api/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          source: 'checkin-builder',
          metadata: {
            propertyName,
            itemCount: checklistItems.length
          }
        })
      })

      const result = await response.json()

      if (response.ok) {
        console.log('Lead captured successfully:', result)
      } else {
        console.error('Error capturing lead:', result.error)
      }
    } catch (error) {
      console.error('Error calling lead capture API:', error)
    }

    if (pendingAction === 'download') {
      downloadChecklist()
    }

    setShowLeadModal(false)
    setPendingAction(null)
  }

  const progress = checklistItems.length > 0
    ? Math.round((checklistItems.filter(i => i.completed).length / checklistItems.length) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      <div className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-6">
              <Link
                href="/hub"
                className="inline-flex items-center text-violet-600 hover:text-violet-700 font-medium group"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Volver al Hub
              </Link>
              <SocialShare
                title="Check-in Template Builder - Itineramio"
                description="Crea checklists personalizados para cada etapa del proceso de check-in y check-out."
              />
            </div>

            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <CheckSquare className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-gray-900">
                  Check-in Template Builder
                </h1>
                <p className="text-xl text-gray-600 mt-2">
                  Crea checklists personalizados para cada etapa
                </p>
              </div>
            </div>

            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-50 rounded-full border border-indigo-200">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-900">Reduce incidencias 67% con proceso estandarizado</span>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left: Builder */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              {/* Property Name */}
              <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-xl">
                <label className="block text-lg font-bold text-gray-900 mb-4">
                  Nombre de la propiedad
                </label>
                <input
                  type="text"
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  placeholder="Apartamento Vista Mar"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none text-lg"
                />
              </div>

              {/* Quick Add Templates */}
              <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Plantillas rápidas
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(categoryInfo).map(([key, info]) => {
                    const Icon = info.icon
                    const hasItems = checklistItems.some(item => item.category === key)
                    return (
                      <button
                        key={key}
                        onClick={() => addPredefinedItems(key as keyof typeof predefinedItems)}
                        disabled={hasItems}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          hasItems
                            ? 'border-green-300 bg-green-50 cursor-not-allowed'
                            : 'border-gray-200 hover:border-indigo-500 hover:bg-indigo-50'
                        }`}
                      >
                        <Icon className={`w-6 h-6 mx-auto mb-2 ${
                          hasItems ? 'text-green-600' : 'text-gray-600'
                        }`} />
                        <div className="font-semibold text-sm">{info.label}</div>
                        {hasItems && (
                          <div className="text-xs text-green-600 mt-1">✓ Agregado</div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Add Custom Item */}
              <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Agregar tarea personalizada
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Categoría
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value as any)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                    >
                      {Object.entries(categoryInfo).map(([key, info]) => (
                        <option key={key} value={key}>{info.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Descripción de la tarea
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addCustomItem()}
                        placeholder="Ej: Verificar temperatura AC"
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                      />
                      <button
                        onClick={addCustomItem}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
                <h3 className="font-bold text-blue-900 mb-3 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Tips para un check-in perfecto
                </h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Envía instrucciones 24h antes del check-in</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Verifica que todo funcione antes de cada llegada</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Mantén comunicación proactiva durante la estancia</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Solicita reviews inmediatamente tras check-out</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Right: Preview & Download */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-xl sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Tu Checklist
                  </h2>
                  <div className="flex items-center space-x-2">
                    {checklistItems.length > 0 && (
                      <>
                        <button
                          onClick={copyToClipboard}
                          className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
                          title="Copiar"
                        >
                          {copied ? (
                            <Check className="w-5 h-5 text-green-500" />
                          ) : (
                            <Copy className="w-5 h-5 text-gray-600" />
                          )}
                        </button>
                        <button
                          onClick={handleDownloadClick}
                          className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
                          title="Descargar"
                        >
                          <Download className="w-5 h-5 text-gray-600" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {checklistItems.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">Progreso</span>
                      <span className="text-sm font-bold text-indigo-600">{progress}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-blue-600"
                      />
                    </div>
                  </div>
                )}

                {/* Checklist Items */}
                <div className="space-y-6 max-h-[600px] overflow-y-auto">
                  {checklistItems.length > 0 ? (
                    Object.entries(categoryInfo).map(([category, info]) => {
                      const items = checklistItems.filter(i => i.category === category)
                      if (items.length === 0) return null

                      const Icon = info.icon
                      return (
                        <div key={category} className="space-y-3">
                          <div className={`flex items-center space-x-2 text-${info.color}-600`}>
                            <Icon className="w-5 h-5" />
                            <h3 className="font-bold">{info.label}</h3>
                          </div>
                          <AnimatePresence>
                            {items.map((item) => (
                              <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                className={`flex items-start space-x-3 p-3 rounded-xl border-2 transition-all ${
                                  item.completed
                                    ? 'border-green-300 bg-green-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <button
                                  onClick={() => toggleItem(item.id)}
                                  className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                    item.completed
                                      ? 'border-green-500 bg-green-500'
                                      : 'border-gray-300 hover:border-gray-400'
                                  }`}
                                >
                                  {item.completed && <Check className="w-3 h-3 text-white" />}
                                </button>
                                <span className={`flex-1 ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                  {item.text}
                                </span>
                                <button
                                  onClick={() => removeItem(item.id)}
                                  className="p-1 hover:bg-red-100 rounded transition-colors"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-12">
                      <CheckSquare className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        Agrega plantillas o crea tareas personalizadas
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {checklistItems.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <button
                      onClick={handleDownloadClick}
                      className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center group"
                    >
                      <Download className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                      Descargar Checklist
                    </button>
                  </div>
                )}

                {/* CTA */}
                <div className="mt-6 p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border-2 border-violet-200">
                  <p className="text-sm text-violet-900 mb-3">
                    <strong>¿Quieres automatizar todo el proceso?</strong>
                  </p>
                  <Link href="/register">
                    <button className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transition-all">
                      Automatizar con Itineramio
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={showLeadModal}
        onClose={() => {
          setShowLeadModal(false)
          setPendingAction(null)
        }}
        onSubmit={handleLeadSubmit}
        title="¡Descarga tu checklist!"
        description="Déjanos tu email para recibir este checklist y más recursos gratuitos"
        downloadLabel="Descargar checklist"
      />
    </div>
  )
}
