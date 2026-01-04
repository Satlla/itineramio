'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Calculator,
  ArrowLeft,
  TrendingUp,
  Home,
  MapPin,
  Users,
  Star,
  Calendar,
  DollarSign,
  Sparkles,
  Info,
  Download,
  Check
} from 'lucide-react'
import { Navbar } from '../../../../../src/components/layout/Navbar'
import { SocialShare } from '../../../../../src/components/tools/SocialShare'
import { LeadCaptureModal } from '../../../../../src/components/tools/LeadCaptureModal'

const propertyTypes = [
  { id: 'apartment', label: 'Apartamento', multiplier: 1.0 },
  { id: 'house', label: 'Casa entera', multiplier: 1.3 },
  { id: 'room', label: 'Habitación privada', multiplier: 0.6 },
  { id: 'studio', label: 'Estudio', multiplier: 0.9 },
  { id: 'villa', label: 'Villa/Chalet', multiplier: 1.8 }
]

const locations = [
  { id: 'city-center', label: 'Centro ciudad', multiplier: 1.4 },
  { id: 'beach', label: 'Playa', multiplier: 1.5 },
  { id: 'mountain', label: 'Montaña', multiplier: 1.2 },
  { id: 'suburban', label: 'Suburbio', multiplier: 0.9 },
  { id: 'rural', label: 'Rural', multiplier: 0.7 }
]

const seasons = [
  { id: 'high', label: 'Temporada Alta', multiplier: 1.5 },
  { id: 'medium', label: 'Temporada Media', multiplier: 1.0 },
  { id: 'low', label: 'Temporada Baja', multiplier: 0.7 }
]

export default function PricingCalculator() {
  const [propertyType, setPropertyType] = useState(propertyTypes[0])
  const [location, setLocation] = useState(locations[0])
  const [season, setSeason] = useState(seasons[1])
  const [bedrooms, setBedrooms] = useState(1)
  const [bathrooms, setBathrooms] = useState(1)
  const [guests, setGuests] = useState(2)
  const [hasAmenities, setHasAmenities] = useState({
    pool: false,
    parking: false,
    wifi: true,
    kitchen: true,
    ac: false,
    heating: false,
    tv: true,
    workspace: false
  })

  // Lead capture states
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<'download' | null>(null)
  const [hasUnlockedDownload, setHasUnlockedDownload] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [pricing, setPricing] = useState({
    basePrice: 0,
    recommendedPrice: 0,
    minPrice: 0,
    maxPrice: 0,
    weekendPrice: 0,
    monthlyDiscount: 0,
    weeklyDiscount: 0
  })

  useEffect(() => {
    calculatePricing()
  }, [propertyType, location, season, bedrooms, bathrooms, guests, hasAmenities])

  const calculatePricing = () => {
    // Precio base por número de huéspedes
    const basePerGuest = 25
    let basePrice = basePerGuest * guests

    // Multiplicador por tipo de propiedad
    basePrice *= propertyType.multiplier

    // Multiplicador por ubicación
    basePrice *= location.multiplier

    // Ajuste por habitaciones y baños
    basePrice += (bedrooms - 1) * 15
    basePrice += (bathrooms - 1) * 10

    // Amenities premium
    const amenityPrices = {
      pool: 30,
      parking: 10,
      wifi: 0, // Básico esperado
      kitchen: 0, // Básico esperado
      ac: 15,
      heating: 10,
      tv: 0, // Básico esperado
      workspace: 8
    }

    Object.keys(hasAmenities).forEach(amenity => {
      if (hasAmenities[amenity as keyof typeof hasAmenities]) {
        basePrice += amenityPrices[amenity as keyof typeof amenityPrices]
      }
    })

    // Precio recomendado con temporada
    const recommendedPrice = Math.round(basePrice * season.multiplier)

    // Rangos de precio
    const minPrice = Math.round(recommendedPrice * 0.8)
    const maxPrice = Math.round(recommendedPrice * 1.3)

    // Precio fin de semana (20% más)
    const weekendPrice = Math.round(recommendedPrice * 1.2)

    // Descuentos sugeridos
    const weeklyDiscount = 10 // 10% descuento semanal
    const monthlyDiscount = 20 // 20% descuento mensual

    setPricing({
      basePrice: Math.round(basePrice),
      recommendedPrice,
      minPrice,
      maxPrice,
      weekendPrice,
      monthlyDiscount,
      weeklyDiscount
    })
  }

  const toggleAmenity = (amenity: keyof typeof hasAmenities) => {
    setHasAmenities(prev => ({
      ...prev,
      [amenity]: !prev[amenity]
    }))
  }

  const handleDownloadClick = () => {
    setPendingAction('download')
    setShowLeadModal(true)
  }

  const downloadResults = () => {
    const amenitiesList = Object.keys(hasAmenities)
      .filter(amenity => hasAmenities[amenity as keyof typeof hasAmenities])
      .map(amenity => amenity.charAt(0).toUpperCase() + amenity.slice(1))
      .join(', ')

    const summary = `
🏠 ANÁLISIS DE PRECIOS - ITINERAMIO

Tu Propiedad:
• Tipo: ${propertyType.label}
• Ubicación: ${location.label}
• Capacidad: ${guests} huéspedes
• Dormitorios: ${bedrooms}
• Baños: ${bathrooms}
• Servicios: ${amenitiesList || 'Básicos'}

💰 Precio Recomendado:
€${pricing.recommendedPrice}/noche (${season.label})

📊 Rango de Precios:
• Mínimo: €${pricing.minPrice}/noche
• Máximo: €${pricing.maxPrice}/noche
• Fin de semana: €${pricing.weekendPrice}/noche

🎯 Descuentos Sugeridos:
• Semanal: ${pricing.weeklyDiscount}%
• Mensual: ${pricing.monthlyDiscount}%

📈 Proyección de Ingresos Mensuales:
• Ocupación 50% (15 noches): €${pricing.recommendedPrice * 15}
• Ocupación 70% (21 noches): €${pricing.recommendedPrice * 21}
• Ocupación 90% (27 noches): €${pricing.recommendedPrice * 27}

💡 Consejos:
• Ajusta precios según eventos locales y festividades
• Monitorea competencia directa en tu zona
• Ofrece descuentos para reservas anticipadas
• Usa precios dinámicos para maximizar ocupación

Generado con Itineramio - https://www.itineramio.com
    `.trim()

    const blob = new Blob([summary], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `itineramio-pricing-analisis.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleLeadSubmit = async (data: { name: string; email: string }) => {
    setIsSubmitting(true)
    try {
      // Get list of selected amenities
      const selectedAmenities = Object.keys(hasAmenities)
        .filter(amenity => hasAmenities[amenity as keyof typeof hasAmenities])
        .map(amenity => amenity.charAt(0).toUpperCase() + amenity.slice(1))

      const response = await fetch('/api/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          source: 'pricing-calculator',
          metadata: {
            propertyType: propertyType.label,
            location: location.label,
            season: season.label,
            bedrooms,
            bathrooms,
            guests,
            amenities: selectedAmenities,
            recommendedPrice: pricing.recommendedPrice,
            minPrice: pricing.minPrice,
            maxPrice: pricing.maxPrice,
            weekendPrice: pricing.weekendPrice,
            weeklyDiscount: pricing.weeklyDiscount,
            monthlyDiscount: pricing.monthlyDiscount
          }
        })
      })

      const result = await response.json()

      if (response.ok) {
        console.log('Lead captured and PDF sent:', result)
        // Mark as sent - no download needed
        setHasUnlockedDownload(true)
      } else {
        console.error('Error capturing lead:', result.error)
      }
    } catch (error) {
      console.error('Error calling lead capture API:', error)
    }

    setIsSubmitting(false)
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
                title="Calculadora de Precios Airbnb - Itineramio"
                description="Calcula el precio óptimo para tu alojamiento según ubicación, servicios y temporada."
              />
            </div>

            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-gray-900">
                  Calculadora de Precios
                </h1>
                <p className="text-xl text-gray-600 mt-2">
                  Calcula el precio óptimo para tu alojamiento
                </p>
              </div>
            </div>

            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Basado en +10,000 alojamientos exitosos</span>
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
              {/* Property Type */}
              <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Home className="w-6 h-6 mr-3 text-blue-600" />
                  Tipo de propiedad
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {propertyTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setPropertyType(type)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        propertyType.id === type.id
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-semibold">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <MapPin className="w-6 h-6 mr-3 text-blue-600" />
                  Ubicación
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {locations.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => setLocation(loc)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        location.id === loc.id
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-semibold">{loc.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Capacity */}
              <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Users className="w-6 h-6 mr-3 text-blue-600" />
                  Capacidad
                </h2>

                <div className="space-y-6">
                  {/* Guests */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Huéspedes máximos
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="1"
                        max="12"
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <div className="w-16 text-center">
                        <span className="text-3xl font-bold text-blue-600">{guests}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bedrooms */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Dormitorios
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="1"
                        max="6"
                        value={bedrooms}
                        onChange={(e) => setBedrooms(Number(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <div className="w-16 text-center">
                        <span className="text-3xl font-bold text-blue-600">{bedrooms}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bathrooms */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Baños
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="1"
                        max="4"
                        value={bathrooms}
                        onChange={(e) => setBathrooms(Number(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <div className="w-16 text-center">
                        <span className="text-3xl font-bold text-blue-600">{bathrooms}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Star className="w-6 h-6 mr-3 text-blue-600" />
                  Servicios
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(hasAmenities).map((amenity) => (
                    <button
                      key={amenity}
                      onClick={() => toggleAmenity(amenity as keyof typeof hasAmenities)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        hasAmenities[amenity as keyof typeof hasAmenities]
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-semibold capitalize">{amenity}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Season */}
              <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Calendar className="w-6 h-6 mr-3 text-blue-600" />
                  Temporada
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {seasons.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSeason(s)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        season.id === s.id
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-semibold text-sm">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right: Results */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* Main Price Card */}
              <div className="bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-600 rounded-3xl p-8 text-white shadow-2xl sticky top-24">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3]
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"
                />

                <div className="relative z-10">
                  <h2 className="text-2xl font-bold mb-2">Precio Recomendado</h2>
                  <div className="text-7xl font-bold mb-6">
                    €{pricing.recommendedPrice}
                    <span className="text-2xl text-white/80">/noche</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                      <div className="text-sm text-white/80 mb-1">Mínimo</div>
                      <div className="text-2xl font-bold">€{pricing.minPrice}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                      <div className="text-sm text-white/80 mb-1">Máximo</div>
                      <div className="text-2xl font-bold">€{pricing.maxPrice}</div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-6 border-t border-white/20">
                    <div className="flex justify-between">
                      <span className="text-white/80">Fin de semana:</span>
                      <span className="font-bold">€{pricing.weekendPrice}/noche</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">Descuento semanal:</span>
                      <span className="font-bold">{pricing.weeklyDiscount}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">Descuento mensual:</span>
                      <span className="font-bold">{pricing.monthlyDiscount}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Earnings Projection */}
              <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                  Proyección de ingresos
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-gray-600">Ocupación 50% (15 noches/mes):</span>
                    <span className="font-bold text-gray-900">€{pricing.recommendedPrice * 15}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-gray-600">Ocupación 70% (21 noches/mes):</span>
                    <span className="font-bold text-gray-900">€{pricing.recommendedPrice * 21}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3">
                    <span className="text-gray-900 font-semibold">Ocupación 90% (27 noches/mes):</span>
                    <span className="font-bold text-green-600 text-xl">€{pricing.recommendedPrice * 27}</span>
                  </div>
                </div>
              </div>

              {/* Get Analysis Button */}
              {hasUnlockedDownload ? (
                <div className="p-6 bg-green-50 border-2 border-green-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-green-800 font-bold text-lg">
                        ¡Análisis enviado a tu email!
                      </p>
                      <p className="text-green-700 mt-1">
                        Revisa tu bandeja de entrada. Hemos enviado un PDF con tu análisis de precios completo, incluyendo proyecciones y consejos personalizados.
                      </p>
                      <p className="text-green-600 text-sm mt-2">
                        Si no lo ves, revisa la carpeta de spam.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleDownloadClick}
                  className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center group"
                >
                  <Download className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                  Recibir análisis por email
                </button>
              )}

              {/* Tips */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border-2 border-orange-200">
                <h3 className="font-bold text-orange-900 mb-3 flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  Consejos de pricing
                </h3>
                <ul className="space-y-2 text-sm text-orange-800">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Ajusta precios según eventos locales y festividades</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Monitorea competencia directa en tu zona</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Ofrece descuentos para reservas anticipadas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Usa precios dinámicos para maximizar ocupación</span>
                  </li>
                </ul>
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border-2 border-violet-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  ¿Quieres automatizar tu pricing?
                </h3>
                <p className="text-gray-600 mb-4">
                  Itineramio te ayuda a gestionar disponibilidad y responder consultas automáticamente
                </p>
                <Link href="/register">
                  <button className="w-full py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-2xl transition-all">
                    Empezar gratis
                  </button>
                </Link>
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
        title="Recibe tu análisis de precios"
        description="Te enviaremos un PDF profesional con tu análisis completo, proyecciones de ingresos y consejos personalizados"
        downloadLabel="Enviar a mi email"
      />
    </div>
  )
}
