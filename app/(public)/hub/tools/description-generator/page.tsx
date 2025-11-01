'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  FileText,
  ArrowLeft,
  Copy,
  Check,
  Sparkles,
  Wand2,
  Download,
  RefreshCw
} from 'lucide-react'
import { Navbar } from '../../../../../src/components/layout/Navbar'
import { SocialShare } from '../../../../../src/components/tools/SocialShare'
import { LeadCaptureModal } from '../../../../../src/components/tools/LeadCaptureModal'

const propertyTypes = [
  'Apartamento',
  'Casa entera',
  'Habitación privada',
  'Estudio',
  'Villa/Chalet',
  'Loft'
]

const styles = [
  { id: 'professional', name: 'Profesional', emoji: '💼' },
  { id: 'friendly', name: 'Amigable', emoji: '😊' },
  { id: 'luxury', name: 'Lujo', emoji: '✨' },
  { id: 'minimalist', name: 'Minimalista', emoji: '🎯' }
]

const highlights = [
  'WiFi de alta velocidad',
  'Cocina equipada',
  'Parking gratuito',
  'Terraza/Balcón',
  'Aire acondicionado',
  'Calefacción',
  'Smart TV',
  'Lavadora',
  'Zona de trabajo',
  'Vista panorámica',
  'Piscina',
  'Cerca de metro/transporte'
]

export default function DescriptionGenerator() {
  const [propertyName, setPropertyName] = useState('')
  const [propertyType, setPropertyType] = useState(propertyTypes[0])
  const [location, setLocation] = useState('')
  const [guests, setGuests] = useState(2)
  const [bedrooms, setBedrooms] = useState(1)
  const [selectedStyle, setSelectedStyle] = useState(styles[0])
  const [selectedHighlights, setSelectedHighlights] = useState<string[]>([])
  const [generatedDescription, setGeneratedDescription] = useState('')
  const [copied, setCopied] = useState(false)

  // Lead capture states
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<'download' | null>(null)

  const toggleHighlight = (highlight: string) => {
    setSelectedHighlights(prev =>
      prev.includes(highlight)
        ? prev.filter(h => h !== highlight)
        : [...prev, highlight]
    )
  }

  const generateDescription = () => {
    const templates = {
      professional: `Bienvenido a ${propertyName || 'nuestro alojamiento'}, un ${propertyType.toLowerCase()} cuidadosamente diseñado en ${location || 'una ubicación privilegiada'}.

Este espacio ofrece capacidad para ${guests} huéspedes con ${bedrooms} ${bedrooms === 1 ? 'dormitorio' : 'dormitorios'}, ideal para ${guests <= 2 ? 'parejas' : guests <= 4 ? 'familias pequeñas' : 'grupos'}.

Características destacadas:
${selectedHighlights.map(h => `• ${h}`).join('\n')}

El alojamiento cuenta con todo lo necesario para una estancia confortable y productiva. La ubicación estratégica permite acceso rápido a los principales puntos de interés de la zona.

Perfecto para viajeros que buscan calidad, confort y una experiencia memorable.`,

      friendly: `¡Hola! Te damos la bienvenida a ${propertyName || 'nuestro hogar'} 🏠

Imagina despertar en ${location || 'un lugar maravilloso'}, en nuestro acogedor ${propertyType.toLowerCase()} con espacio para ${guests} personas. Con ${bedrooms} ${bedrooms === 1 ? 'habitación' : 'habitaciones'} súper cómodas, ¡te sentirás como en casa!

✨ Lo que vas a amar:
${selectedHighlights.map(h => `• ${h}`).join('\n')}

Hemos preparado todo con mucho cariño para que tu estancia sea perfecta. Ya sea que vengas ${guests <= 2 ? 'en pareja' : guests <= 4 ? 'en familia' : 'con amigos'}, aquí encontrarás el descanso que necesitas.

¡Estamos deseando recibirte! 😊`,

      luxury: `${propertyName || 'Este exclusivo alojamiento'} redefine el concepto de elegancia en ${location || 'la ciudad'}.

Diseñado para los viajeros más exigentes, este ${propertyType.toLowerCase()} de ${bedrooms} ${bedrooms === 1 ? 'dormitorio' : 'dormitorios'} ofrece una experiencia premium para hasta ${guests} huéspedes.

Servicios Premium:
${selectedHighlights.map(h => `• ${h}`).join('\n')}

Cada detalle ha sido meticulosamente seleccionado para garantizar una experiencia de cinco estrellas. Desde los acabados de primera calidad hasta la ubicación privilegiada, todo está pensado para su máximo confort.

Una oportunidad única de experimentar el lujo y la sofisticación en su máxima expresión.`,

      minimalist: `${propertyName || 'Alojamiento'} | ${location || 'Ubicación central'}

${propertyType} · ${bedrooms}BR · ${guests} huéspedes

Incluye:
${selectedHighlights.map(h => `• ${h}`).join('\n')}

${guests <= 2 ? 'Perfecto para parejas' : guests <= 4 ? 'Ideal para familias' : 'Espacioso para grupos'}.

Todo lo esencial. Nada superfluo.`
    }

    setGeneratedDescription(templates[selectedStyle.id as keyof typeof templates])
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedDescription)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadClick = () => {
    setPendingAction('download')
    setShowLeadModal(true)
  }

  const downloadAsText = () => {
    const element = document.createElement('a')
    const file = new Blob([generatedDescription], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `descripcion-${propertyName || 'propiedad'}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleLeadSubmit = async (data: { name: string; email: string }) => {
    try {
      const response = await fetch('/api/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          source: 'description-generator',
          metadata: {
            propertyType,
            location,
            style: selectedStyle.name
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
      downloadAsText()
    }

    setShowLeadModal(false)
    setPendingAction(null)
  }

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
                title="Generador de Descripciones Airbnb - Itineramio"
                description="Crea descripciones profesionales y atractivas para tu listado de Airbnb en segundos."
              />
            </div>

            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-gray-900">
                  Generador de Descripciones
                </h1>
                <p className="text-xl text-gray-600 mt-2">
                  Crea descripciones atractivas para tu listado de Airbnb
                </p>
              </div>
            </div>

            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-50 rounded-full border border-purple-200">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Aumenta reservas hasta 45% con descripciones profesionales</span>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left: Inputs */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              {/* Basic Info */}
              <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Información básica
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre del alojamiento
                    </label>
                    <input
                      type="text"
                      value={propertyName}
                      onChange={(e) => setPropertyName(e.target.value)}
                      placeholder="Apartamento Vista al Mar"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tipo de propiedad
                    </label>
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                    >
                      {propertyTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ubicación
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Centro de Madrid"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Huéspedes
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Dormitorios
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="6"
                        value={bedrooms}
                        onChange={(e) => setBedrooms(Number(e.target.value))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Style */}
              <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Estilo de descripción
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {styles.map(style => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedStyle.id === style.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">{style.emoji}</div>
                      <div className="font-semibold">{style.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Highlights */}
              <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Características destacadas
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {highlights.map(highlight => (
                    <button
                      key={highlight}
                      onClick={() => toggleHighlight(highlight)}
                      className={`p-3 rounded-xl border-2 transition-all text-sm ${
                        selectedHighlights.includes(highlight)
                          ? 'border-purple-500 bg-purple-50 text-purple-900'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {highlight}
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-sm text-gray-500">
                  Selecciona 3-6 características para mejor impacto
                </p>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateDescription}
                className="w-full py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/30 transition-all flex items-center justify-center group"
              >
                <Wand2 className="w-6 h-6 mr-2 group-hover:rotate-12 transition-transform" />
                Generar Descripción
              </button>
            </motion.div>

            {/* Right: Output */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-xl sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Tu descripción
                  </h2>
                  {generatedDescription && (
                    <div className="flex items-center space-x-2">
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
                      <button
                        onClick={generateDescription}
                        className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
                        title="Regenerar"
                      >
                        <RefreshCw className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  )}
                </div>

                {generatedDescription ? (
                  <div className="min-h-[400px]">
                    <div className="p-6 bg-gray-50 rounded-2xl border-2 border-gray-200">
                      <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                        {generatedDescription}
                      </pre>
                    </div>

                    {/* Character count */}
                    <div className="mt-4 text-sm text-gray-500 flex items-center justify-between">
                      <span>{generatedDescription.length} caracteres</span>
                      <span className={generatedDescription.length > 500 ? 'text-orange-600 font-semibold' : ''}>
                        {generatedDescription.length > 500 ? '⚠️ Considera acortar para mejor engagement' : '✓ Longitud óptima'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="min-h-[400px] flex items-center justify-center">
                    <div className="text-center">
                      <FileText className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        Completa los datos y genera tu descripción
                      </p>
                    </div>
                  </div>
                )}

                {/* Tips */}
                {generatedDescription && (
                  <div className="mt-6 p-4 bg-purple-50 rounded-xl">
                    <h3 className="font-bold text-purple-900 mb-2 text-sm">
                      💡 Consejos para mejorar tu listado
                    </h3>
                    <ul className="space-y-1 text-sm text-purple-800">
                      <li>• Añade fotos profesionales de alta calidad</li>
                      <li>• Destaca la ubicación y cercanía a transportes</li>
                      <li>• Menciona experiencias únicas de la zona</li>
                      <li>• Actualiza calendario de disponibilidad</li>
                    </ul>
                  </div>
                )}

                {/* CTA */}
                <div className="mt-6 p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border-2 border-violet-200">
                  <p className="text-sm text-violet-900 mb-3">
                    <strong>¿Quieres automatizar más de tu gestión?</strong>
                  </p>
                  <Link href="/register">
                    <button className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transition-all">
                      Crear manual digital con Itineramio
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
        title="¡Descarga tu descripción!"
        description="Déjanos tu email para recibir esta descripción y más recursos gratuitos"
        downloadLabel="Descargar descripción"
      />
    </div>
  )
}
