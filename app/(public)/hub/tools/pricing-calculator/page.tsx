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
import { useTranslation } from 'react-i18next'
import { Navbar } from '../../../../../src/components/layout/Navbar'
import { SocialShare } from '../../../../../src/components/tools/SocialShare'
import { LeadCaptureModal } from '../../../../../src/components/tools/LeadCaptureModal'

// Config only - labels come from translations
const propertyTypesConfig = [
  { id: 'apartment', labelKey: 'apartment', multiplier: 1.0 },
  { id: 'house', labelKey: 'house', multiplier: 1.3 },
  { id: 'room', labelKey: 'room', multiplier: 0.6 },
  { id: 'studio', labelKey: 'studio', multiplier: 0.9 },
  { id: 'villa', labelKey: 'villa', multiplier: 1.8 }
]

const locationsConfig = [
  { id: 'city-center', labelKey: 'cityCenter', multiplier: 1.4 },
  { id: 'beach', labelKey: 'beach', multiplier: 1.5 },
  { id: 'mountain', labelKey: 'mountain', multiplier: 1.2 },
  { id: 'suburban', labelKey: 'suburban', multiplier: 0.9 },
  { id: 'rural', labelKey: 'rural', multiplier: 0.7 }
]

const seasonsConfig = [
  { id: 'high', labelKey: 'high', multiplier: 1.5 },
  { id: 'medium', labelKey: 'medium', multiplier: 1.0 },
  { id: 'low', labelKey: 'low', multiplier: 0.7 }
]

export default function PricingCalculator() {
  const { t } = useTranslation('tools')

  const [propertyType, setPropertyType] = useState(propertyTypesConfig[0])
  const [location, setLocation] = useState(locationsConfig[0])
  const [season, setSeason] = useState(seasonsConfig[1])
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
                {t('common.backToHub')}
              </Link>
              <SocialShare
                title={t('pricingCalculator.shareTitle')}
                description={t('pricingCalculator.shareDescription')}
              />
            </div>

            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-gray-900">
                  {t('pricingCalculator.title')}
                </h1>
                <p className="text-xl text-gray-600 mt-2">
                  {t('pricingCalculator.subtitle')}
                </p>
              </div>
            </div>

            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">{t('pricingCalculator.badge')}</span>
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
                  {t('pricingCalculator.propertyType')}
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {propertyTypesConfig.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setPropertyType(type)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        propertyType.id === type.id
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-semibold">{t(`pricingCalculator.propertyTypes.${type.labelKey}`)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <MapPin className="w-6 h-6 mr-3 text-blue-600" />
                  {t('pricingCalculator.location')}
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {locationsConfig.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => setLocation(loc)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        location.id === loc.id
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-semibold">{t(`pricingCalculator.locations.${loc.labelKey}`)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Capacity */}
              <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Users className="w-6 h-6 mr-3 text-blue-600" />
                  {t('pricingCalculator.capacity')}
                </h2>

                <div className="space-y-6">
                  {/* Guests */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      {t('pricingCalculator.maxGuests')}
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
                      {t('pricingCalculator.bedrooms')}
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
                      {t('pricingCalculator.bathrooms')}
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
                  {t('pricingCalculator.amenities')}
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
                      <span className="font-semibold">{t(`pricingCalculator.amenitiesList.${amenity}`)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Season */}
              <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Calendar className="w-6 h-6 mr-3 text-blue-600" />
                  {t('pricingCalculator.season')}
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {seasonsConfig.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSeason(s)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        season.id === s.id
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-semibold text-sm">{t(`pricingCalculator.seasons.${s.labelKey}`)}</span>
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
                  <h2 className="text-2xl font-bold mb-2">{t('pricingCalculator.results.recommendedPrice')}</h2>
                  <div className="text-7xl font-bold mb-6">
                    €{pricing.recommendedPrice}
                    <span className="text-2xl text-white/80">{t('pricingCalculator.results.perNight')}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                      <div className="text-sm text-white/80 mb-1">{t('pricingCalculator.results.minimum')}</div>
                      <div className="text-2xl font-bold">€{pricing.minPrice}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                      <div className="text-sm text-white/80 mb-1">{t('pricingCalculator.results.maximum')}</div>
                      <div className="text-2xl font-bold">€{pricing.maxPrice}</div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-6 border-t border-white/20">
                    <div className="flex justify-between">
                      <span className="text-white/80">{t('pricingCalculator.results.weekend')}</span>
                      <span className="font-bold">€{pricing.weekendPrice}{t('pricingCalculator.results.perNight')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">{t('pricingCalculator.results.weeklyDiscount')}</span>
                      <span className="font-bold">{pricing.weeklyDiscount}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">{t('pricingCalculator.results.monthlyDiscount')}</span>
                      <span className="font-bold">{pricing.monthlyDiscount}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Earnings Projection */}
              <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                  {t('pricingCalculator.projection.title')}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-gray-600">{t('pricingCalculator.projection.occupancy50')}</span>
                    <span className="font-bold text-gray-900">€{pricing.recommendedPrice * 15}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-gray-600">{t('pricingCalculator.projection.occupancy70')}</span>
                    <span className="font-bold text-gray-900">€{pricing.recommendedPrice * 21}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3">
                    <span className="text-gray-900 font-semibold">{t('pricingCalculator.projection.occupancy90')}</span>
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
                        {t('pricingCalculator.emailSent.title')}
                      </p>
                      <p className="text-green-700 mt-1">
                        {t('pricingCalculator.emailSent.message')}
                      </p>
                      <p className="text-green-600 text-sm mt-2">
                        {t('pricingCalculator.emailSent.spam')}
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
                  {t('pricingCalculator.emailButton')}
                </button>
              )}

              {/* Tips */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border-2 border-orange-200">
                <h3 className="font-bold text-orange-900 mb-3 flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  {t('pricingCalculator.tips.title')}
                </h3>
                <ul className="space-y-2 text-sm text-orange-800">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{t('pricingCalculator.tips.tip1')}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{t('pricingCalculator.tips.tip2')}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{t('pricingCalculator.tips.tip3')}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{t('pricingCalculator.tips.tip4')}</span>
                  </li>
                </ul>
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border-2 border-violet-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {t('pricingCalculator.cta.title')}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t('pricingCalculator.cta.subtitle')}
                </p>
                <Link href="/register">
                  <button className="w-full py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-2xl transition-all">
                    {t('pricingCalculator.cta.button')}
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
        title={t('pricingCalculator.leadModal.title')}
        description={t('pricingCalculator.leadModal.description')}
        downloadLabel={t('pricingCalculator.leadModal.button')}
      />
    </div>
  )
}
