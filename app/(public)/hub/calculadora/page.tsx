'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Calculator,
  TrendingUp,
  DollarSign,
  Target,
  AlertCircle,
  Check,
  Sparkles,
  Download,
  Calendar,
  MapPin
} from 'lucide-react'
import { CITIES } from '../../../../src/data/market-data'
import {
  RevenueComparisonChart,
  SeasonalAreaChart,
  NeighborhoodBarChart,
  SeasonalBarsChart
} from './Charts'
import { jsPDF } from 'jspdf'

interface CalculationResult {
  currentMonthlyRevenue: number
  marketMonthlyRevenue: number
  potentialGain: number
  suggestedPrice: number
  suggestedOccupancy: number
  priceRange: {
    min: number
    max: number
  }
  seasonal: {
    high: {
      price: number
      occupancy: number
      revenue: number
      months: string[]
    }
    mid: {
      price: number
      occupancy: number
      revenue: number
      months: string[]
    }
    low: {
      price: number
      occupancy: number
      revenue: number
      months: string[]
    }
  }
  neighborhoods: Array<{
    name: string
    premium: number
  }> | null
  insights: Array<{
    type: string
    severity: string
    message: string
    recommendation: string
  }>
}

export default function CalculadoraRentabilidad() {
  const [formData, setFormData] = useState({
    city: '',
    propertyType: '',
    currentPrice: '',
    currentOccupancy: ''
  })

  const [leadData, setLeadData] = useState({
    email: '',
    name: ''
  })

  const [result, setResult] = useState<CalculationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [showUnlockModal, setShowUnlockModal] = useState(false)
  const [sendingReport, setSendingReport] = useState(false)
  const [reportSent, setReportSent] = useState(false)
  const [error, setError] = useState('')
  const [hasFullAccess, setHasFullAccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleLeadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLeadData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Add artificial delay to make calculation feel more substantial
      const [response] = await Promise.all([
        fetch('/api/hub/calculate-profitability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            email: leadData.email,
            name: leadData.name
          })
        }),
        new Promise(resolve => setTimeout(resolve, 2500)) // 2.5 second minimum
      ])

      const data = await response.json()

      if (!response.ok || !data.success) {
        // Handle rate limit errors - show unlock modal
        if (data.requiresEmail || data.rateLimited) {
          setShowUnlockModal(true)
          setError(data.error)
          setLoading(false)
          return
        }

        // Handle email validation errors
        if (data.requiresValidEmail) {
          setError(data.error)
          setLoading(false)
          return
        }

        throw new Error(data.error || 'Error al calcular')
      }

      setResult(data.data)
      setHasFullAccess(data.data.hasFullAccess || false)

      // If email was provided and validated, mark report as sent
      if (leadData.email && data.data.hasFullAccess) {
        setReportSent(true)
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al calcular rentabilidad')
    } finally {
      setLoading(false)
    }
  }

  const handleSendReport = async () => {
    if (!leadData.email) {
      setError('Por favor ingresa tu email')
      return
    }

    setSendingReport(true)
    setError('')

    try {
      const response = await fetch('/api/hub/calculate-profitability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          email: leadData.email,
          name: leadData.name
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        // Handle validation errors
        if (data.requiresValidEmail || data.rateLimited) {
          setError(data.error)
          setSendingReport(false)
          return
        }
        throw new Error(data.error || 'Error al enviar reporte')
      }

      // Update result with full data
      setResult(data.data)
      setHasFullAccess(true)
      setReportSent(true)

      // Close modals
      setTimeout(() => {
        setShowLeadModal(false)
        setShowUnlockModal(false)
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar reporte')
    } finally {
      setSendingReport(false)
    }
  }

  const handleDownloadReport = async () => {
    if (!result) return

    const cityName = CITIES.find(c => c.value === formData.city)?.label || formData.city
    const propertyTypeLabel = {
      studio: 'Estudio',
      onebed: '1 Dormitorio',
      twobed: '2 Dormitorios',
      threebed: '3 Dormitorios'
    }[formData.propertyType] || formData.propertyType

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    let yPos = 20

    // Header
    doc.setFillColor(139, 92, 246) // violet-500
    doc.rect(0, 0, pageWidth, 40, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('Itineramio', 20, 25)

    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Calculadora de Rentabilidad', 20, 35)

    yPos = 55

    // Title
    doc.setTextColor(31, 41, 55) // gray-800
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Informe de Rentabilidad', 20, yPos)
    yPos += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(107, 114, 128) // gray-500
    doc.text(`Generado el ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}`, 20, yPos)
    yPos += 15

    // Property Info Box
    doc.setFillColor(249, 250, 251) // gray-50
    doc.roundedRect(20, yPos, pageWidth - 40, 35, 3, 3, 'F')

    doc.setTextColor(55, 65, 81) // gray-700
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Datos de la Propiedad', 30, yPos + 10)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(`Ciudad: ${cityName}`, 30, yPos + 20)
    doc.text(`Tipo: ${propertyTypeLabel}`, 100, yPos + 20)
    doc.text(`Precio actual: €${formData.currentPrice}/noche`, 30, yPos + 28)
    doc.text(`Ocupacion: ${formData.currentOccupancy}%`, 100, yPos + 28)
    yPos += 45

    // Revenue Comparison Section
    doc.setTextColor(31, 41, 55)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Comparativa de Ingresos', 20, yPos)
    yPos += 12

    // Current Revenue Box
    doc.setFillColor(243, 244, 246) // gray-100
    doc.roundedRect(20, yPos, 80, 30, 3, 3, 'F')
    doc.setTextColor(107, 114, 128)
    doc.setFontSize(9)
    doc.text('Ingresos Actuales', 30, yPos + 10)
    doc.setTextColor(31, 41, 55)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(`€${result.currentMonthlyRevenue.toLocaleString()}/mes`, 30, yPos + 22)

    // Market Revenue Box
    doc.setFillColor(237, 233, 254) // violet-100
    doc.roundedRect(110, yPos, 80, 30, 3, 3, 'F')
    doc.setTextColor(109, 40, 217) // violet-700
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('Potencial de Mercado', 120, yPos + 10)
    doc.setTextColor(76, 29, 149) // violet-800
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(`€${result.marketMonthlyRevenue.toLocaleString()}/mes`, 120, yPos + 22)
    yPos += 40

    // Opportunity Box
    if (result.potentialGain > 0) {
      doc.setFillColor(254, 243, 199) // amber-100
      doc.roundedRect(20, yPos, pageWidth - 40, 25, 3, 3, 'F')
      doc.setTextColor(146, 64, 14) // amber-800
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('Oportunidad de Mejora', 30, yPos + 10)
      doc.setFontSize(14)
      doc.text(`+€${result.potentialGain.toLocaleString()}/mes (€${(result.potentialGain * 12).toLocaleString()}/año)`, 30, yPos + 20)
    } else {
      doc.setFillColor(209, 250, 229) // green-100
      doc.roundedRect(20, yPos, pageWidth - 40, 25, 3, 3, 'F')
      doc.setTextColor(6, 95, 70) // green-800
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('¡Excelente! Superas el mercado', 30, yPos + 10)
      doc.setFontSize(14)
      doc.text(`+€${Math.abs(result.potentialGain).toLocaleString()}/mes por encima del promedio`, 30, yPos + 20)
    }
    yPos += 35

    // Pricing Recommendations
    doc.setTextColor(31, 41, 55)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Recomendaciones de Pricing', 20, yPos)
    yPos += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`• Precio sugerido: €${result.suggestedPrice}/noche`, 25, yPos)
    yPos += 7
    doc.text(`• Rango optimo: €${result.priceRange.min} - €${result.priceRange.max}/noche`, 25, yPos)
    yPos += 7
    doc.text(`• Ocupacion objetivo: ${result.suggestedOccupancy}%`, 25, yPos)
    yPos += 15

    // Seasonal Data (if available)
    if (result.seasonal && hasFullAccess) {
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Analisis Estacional', 20, yPos)
      yPos += 10

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')

      doc.text(`Temporada Alta (${result.seasonal.high.months.join(', ')}):`, 25, yPos)
      doc.text(`€${result.seasonal.high.price}/noche | ${result.seasonal.high.occupancy}% ocup. | €${result.seasonal.high.revenue}/mes`, 90, yPos)
      yPos += 7

      doc.text(`Temporada Media (${result.seasonal.mid.months.join(', ')}):`, 25, yPos)
      doc.text(`€${result.seasonal.mid.price}/noche | ${result.seasonal.mid.occupancy}% ocup. | €${result.seasonal.mid.revenue}/mes`, 90, yPos)
      yPos += 7

      doc.text(`Temporada Baja (${result.seasonal.low.months.join(', ')}):`, 25, yPos)
      doc.text(`€${result.seasonal.low.price}/noche | ${result.seasonal.low.occupancy}% ocup. | €${result.seasonal.low.revenue}/mes`, 90, yPos)
      yPos += 15
    }

    // Insights
    if (result.insights && result.insights.length > 0 && hasFullAccess) {
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Recomendaciones Personalizadas', 20, yPos)
      yPos += 10

      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')

      result.insights.forEach((insight, index) => {
        if (yPos > 260) {
          doc.addPage()
          yPos = 20
        }
        doc.setTextColor(31, 41, 55)
        doc.text(`${index + 1}. ${insight.message}`, 25, yPos)
        yPos += 5
        doc.setTextColor(107, 114, 128)
        doc.text(`   → ${insight.recommendation}`, 25, yPos)
        yPos += 8
      })
    }

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 20
    doc.setFillColor(249, 250, 251)
    doc.rect(0, footerY - 5, pageWidth, 25, 'F')

    doc.setTextColor(107, 114, 128)
    doc.setFontSize(8)
    doc.text('Generado por Itineramio - La plataforma de manuales digitales para anfitriones', 20, footerY)
    doc.text('itineramio.com', 20, footerY + 7)
    doc.text(`Datos de mercado actualizados: ${new Date().toLocaleDateString('es-ES')}`, pageWidth - 70, footerY + 7)

    // Save PDF
    doc.save(`rentabilidad-${cityName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky z-40 pwa-sticky-header">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/hub" className="flex items-center text-gray-600 hover:text-violet-600 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Volver</span>
            </Link>
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Itineramio
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero - Más compacto */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-2xl mb-4 shadow-sm">
            <Calculator className="w-7 h-7 text-violet-600" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Calculadora de Rentabilidad
          </h1>

          <p className="text-lg text-gray-600 max-w-xl mx-auto mb-6">
            Descubre cuánto dinero estás dejando de ganar comparando tu propiedad con el mercado
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-600">
            <div className="flex items-center bg-green-50 px-3 py-1.5 rounded-full">
              <Check className="w-4 h-4 text-green-600 mr-1.5" />
              <span className="font-medium">+1,200 propiedades</span>
            </div>
            <div className="flex items-center bg-blue-50 px-3 py-1.5 rounded-full">
              <Check className="w-4 h-4 text-blue-600 mr-1.5" />
              <span className="font-medium">20 ciudades</span>
            </div>
            <div className="flex items-center bg-violet-50 px-3 py-1.5 rounded-full">
              <Check className="w-4 h-4 text-violet-600 mr-1.5" />
              <span className="font-medium">Datos 2025</span>
            </div>
          </div>
        </div>

        {/* Main Content - Boxed */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Formulario - 2 columnas */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-violet-600" />
              Datos de tu propiedad
            </h2>

            <form onSubmit={handleCalculate} className="space-y-4">
              {/* Ciudad */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Ciudad <span className="text-red-500">*</span>
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                >
                  <option value="">Selecciona tu ciudad</option>
                  {CITIES.map((city) => (
                    <option key={city.value} value={city.value}>
                      {city.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo de propiedad */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Tipo de propiedad <span className="text-red-500">*</span>
                </label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                >
                  <option value="">Selecciona el tipo</option>
                  <option value="studio">Estudio</option>
                  <option value="onebed">1 Dormitorio</option>
                  <option value="twobed">2 Dormitorios</option>
                  <option value="threebed">3 Dormitorios</option>
                </select>
              </div>

              {/* Precio actual */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Precio por noche (€) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    €
                  </span>
                  <input
                    type="number"
                    name="currentPrice"
                    value={formData.currentPrice}
                    onChange={handleChange}
                    required
                    min="10"
                    step="1"
                    placeholder="85"
                    className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                  />
                </div>
              </div>

              {/* Ocupación actual */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Ocupación mensual (%) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="currentOccupancy"
                    value={formData.currentOccupancy}
                    onChange={handleChange}
                    required
                    min="0"
                    max="100"
                    step="1"
                    placeholder="70"
                    className="w-full pr-8 pl-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    %
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Ej: 21 días ocupados = 70%
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
                  <AlertCircle className="w-4 h-4 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-xs">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Calculando...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4 mr-2" />
                    Calcular Potencial
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                📊 Datos actualizados 2025
              </p>
            </form>
          </div>

          {/* Resultados - 3 columnas */}
          {loading ? (
            <div className="lg:col-span-3 bg-white rounded-xl shadow-md border border-gray-200 p-8 flex flex-col items-center justify-center text-center">
              <div className="relative mb-8">
                <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-violet-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Calculator className="w-8 h-8 text-violet-600" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Calculando tu rentabilidad...
              </h3>

              <div className="space-y-2 text-gray-600 max-w-md text-sm">
                <p className="flex items-center justify-center">
                  <span className="inline-block w-2 h-2 bg-violet-600 rounded-full mr-2 animate-pulse"></span>
                  Comparando con +1,200 propiedades en {formData.city && CITIES.find(c => c.value === formData.city)?.label}
                </p>
                <p className="flex items-center justify-center">
                  <span className="inline-block w-2 h-2 bg-violet-600 rounded-full mr-2 animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                  Analizando tendencias de mercado 2025
                </p>
                <p className="flex items-center justify-center">
                  <span className="inline-block w-2 h-2 bg-violet-600 rounded-full mr-2 animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                  Generando recomendaciones personalizadas
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 w-full">
                <p className="text-xs text-gray-500">
                  📊 Datos actualizados: Enero 2025
                </p>
              </div>
            </div>
          ) : result ? (
            <div className="lg:col-span-3 space-y-4">
              {/* Revenue actual vs potencial - Con Gráfico */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Potencial de Ingresos</h3>
                    <p className="text-sm text-gray-500 mt-1">Comparación mensual</p>
                  </div>
                  <Sparkles className="w-6 h-6 text-violet-600" />
                </div>

                {/* Chart */}
                <div className="mb-6">
                  <RevenueComparisonChart
                    current={result.currentMonthlyRevenue}
                    market={result.marketMonthlyRevenue}
                    potential={result.potentialGain}
                  />
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1 font-medium">Ingresos Actuales</p>
                    <p className="text-2xl font-bold text-gray-900">€{result.currentMonthlyRevenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">/mes</p>
                  </div>

                  <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl p-4 border border-violet-200">
                    <p className="text-xs text-violet-700 mb-1 font-medium">Potencial Mercado</p>
                    <p className="text-2xl font-bold text-violet-900">€{result.marketMonthlyRevenue.toLocaleString()}</p>
                    <p className="text-xs text-violet-600 mt-1">/mes</p>
                  </div>
                </div>

                {/* Gain/Loss Display */}
                {result.potentialGain > 0 && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border-2 border-amber-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-amber-800 mb-2 font-semibold">💰 Oportunidad de mejora</p>
                        <p className="text-3xl font-bold text-amber-900">
                          +€{result.potentialGain.toLocaleString()}<span className="text-lg">/mes</span>
                        </p>
                        <p className="text-sm text-amber-700 mt-2">
                          €{(result.potentialGain * 12).toLocaleString()}/año en potencial sin explotar
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-amber-600" />
                    </div>
                  </div>
                )}

                {result.potentialGain < 0 && (
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border-2 border-emerald-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-emerald-800 mb-2 font-semibold">🎉 ¡Excelente trabajo!</p>
                        <p className="text-2xl font-bold text-emerald-900">
                          Superas el mercado en €{Math.abs(result.potentialGain).toLocaleString()}/mes
                        </p>
                        <p className="text-sm text-emerald-700 mt-2">
                          Estás optimizando muy bien tu pricing
                        </p>
                      </div>
                      <Check className="w-8 h-8 text-emerald-600" />
                    </div>
                  </div>
                )}
              </div>

              {/* Pricing sugerido y Credibility en 2 columnas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pricing sugerido */}
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
                  <div className="flex items-center mb-3">
                    <Target className="w-4 h-4 text-violet-600 mr-2" />
                    <h3 className="text-sm font-semibold text-gray-900">Pricing Recomendado</h3>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Precio sugerido:</span>
                      <span className="text-lg font-bold text-gray-900">€{result.suggestedPrice}<span className="text-xs font-normal text-gray-500">/noche</span></span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Rango óptimo:</span>
                      <span className="text-sm text-gray-900 font-medium">
                        €{result.priceRange.min} - €{result.priceRange.max}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Ocupación objetivo:</span>
                      <span className="text-sm text-gray-900 font-medium">{result.suggestedOccupancy}%</span>
                    </div>
                  </div>
                </div>

                {/* Credibility Badge */}
                <div className="bg-gradient-to-r from-gray-50 to-violet-50 rounded-xl border border-gray-200 p-4 flex flex-col justify-center">
                  <div className="space-y-2">
                    <div className="flex items-center text-xs text-gray-700">
                      <Check className="w-4 h-4 text-green-600 mr-1.5 flex-shrink-0" />
                      <span className="font-medium">+1,200 propiedades</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-700">
                      <Check className="w-4 h-4 text-blue-600 mr-1.5 flex-shrink-0" />
                      <span className="font-medium">Datos mercado 2025</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-700">
                      <Check className="w-4 h-4 text-violet-600 mr-1.5 flex-shrink-0" />
                      <span className="font-medium">Actualizado: Ene 2025</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seasonal Data - Charts */}
              {(result.seasonal || !hasFullAccess) && (
              <>
                {/* Ingresos Mensuales - Area Chart */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 relative">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Ingresos Mensuales</h3>
                      <p className="text-sm text-gray-500 mt-1">Proyección anual por temporada</p>
                    </div>
                    <Calendar className="w-6 h-6 text-violet-600" />
                  </div>

                  <div className={!hasFullAccess ? 'blur-sm select-none' : ''}>
                    <SeasonalAreaChart
                      seasonal={result.seasonal}
                      basePrice={result.suggestedPrice}
                    />
                  </div>

                  {/* Unlock Overlay */}
                  {!hasFullAccess && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-2xl">
                      <button
                        onClick={() => setShowUnlockModal(true)}
                        className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transition-all flex items-center"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Desbloquear Datos Completos
                      </button>
                    </div>
                  )}
                </div>

                {/* Comparación Temporadas - Bar Chart */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 relative">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Análisis por Temporada</h3>
                      <p className="text-sm text-gray-500 mt-1">Ingresos mensuales estimados</p>
                    </div>
                    <TrendingUp className="w-6 h-6 text-violet-600" />
                  </div>

                  <div className={!hasFullAccess ? 'blur-sm select-none' : ''}>
                    <SeasonalBarsChart seasonal={result.seasonal} />
                  </div>

                  {/* Unlock Overlay */}
                  {!hasFullAccess && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-2xl">
                      <button
                        onClick={() => setShowUnlockModal(true)}
                        className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transition-all flex items-center"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Desbloquear Datos Completos
                      </button>
                    </div>
                  )}
                </div>
              </>
              )}

              {/* Neighborhoods - Bar Chart */}
              {result.neighborhoods && result.neighborhoods.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 relative">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Precios por Barrio</h3>
                      <p className="text-sm text-gray-500 mt-1">Precio promedio según ubicación</p>
                    </div>
                    <MapPin className="w-6 h-6 text-violet-600" />
                  </div>

                  <div className={!hasFullAccess ? 'blur-sm select-none' : ''}>
                    <NeighborhoodBarChart
                      neighborhoods={result.neighborhoods}
                      basePrice={result.suggestedPrice}
                    />
                  </div>

                  {/* Legend */}
                  {hasFullAccess && (
                    <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded bg-violet-600 mr-1.5"></div>
                        <span className="text-gray-600">Premium (+10%)</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded bg-indigo-500 mr-1.5"></div>
                        <span className="text-gray-600">Promedio</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded bg-slate-400 mr-1.5"></div>
                        <span className="text-gray-600">Económico (-5%)</span>
                      </div>
                    </div>
                  )}

                  {/* Unlock Overlay */}
                  {!hasFullAccess && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-2xl">
                      <button
                        onClick={() => setShowUnlockModal(true)}
                        className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transition-all flex items-center"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Desbloquear Datos Completos
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Insights */}
              {result.insights && result.insights.length > 0 && (
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 relative">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 text-violet-600" />
                    Recomendaciones
                  </h3>

                  <div className={`space-y-3 ${!hasFullAccess ? 'blur-sm select-none' : ''}`}>
                    {result.insights.map((insight, index) => (
                      <div
                        key={index}
                        className={`border-l-3 pl-3 py-2 ${
                          insight.severity === 'high'
                            ? 'border-red-500 bg-red-50/50'
                            : 'border-yellow-500 bg-yellow-50/50'
                        }`}
                      >
                        <p className="font-semibold text-gray-900 text-xs mb-1">{insight.message}</p>
                        <p className="text-xs text-gray-700">{insight.recommendation}</p>
                      </div>
                    ))}
                  </div>

                  {/* Unlock Overlay */}
                  {!hasFullAccess && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-xl">
                      <button
                        onClick={() => setShowUnlockModal(true)}
                        className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transition-all flex items-center"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Desbloquear Datos Completos
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* CTA */}
              <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl border-2 border-violet-200 p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">
                  ¿Quieres optimizar tu rentabilidad?
                </h3>
                <p className="text-xs text-gray-600 mb-3">
                  Descarga la guía completa de pricing dinámico
                </p>
                <button
                  onClick={handleDownloadReport}
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium text-xs transition-all shadow-sm hover:shadow-md flex items-center justify-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar Guía Gratis
                </button>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-3 bg-gradient-to-br from-gray-50 to-violet-50 rounded-xl border-2 border-dashed border-gray-300 p-12 flex flex-col items-center justify-center text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-gray-600 text-sm">
                Completa el formulario para ver tu potencial
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Captura de Lead */}
      {showLeadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-200">
            {/* Close button */}
            {!reportSent && (
              <button
                onClick={() => setShowLeadModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {!reportSent ? (
              <>
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="bg-violet-100 rounded-full p-4">
                    <Download className="w-8 h-8 text-violet-600" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-3">
                  ¡Descarga tu Reporte Completo Gratis!
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-center mb-6">
                  Recibe un análisis detallado de tu propiedad con estrategias personalizadas para aumentar tus ingresos hasta €{result?.potentialGain.toLocaleString()}/mes
                </p>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">Estrategias de pricing dinámico específicas para {formData.city && CITIES.find(c => c.value === formData.city)?.label}</p>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">Checklist de optimización de anuncio (fotos, título, descripción)</p>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">Calendario de pricing por temporada 2025</p>
                  </div>
                </div>

                {/* Form */}
                <div className="space-y-3">
                  <input
                    type="text"
                    name="name"
                    value={leadData.name}
                    onChange={handleLeadChange}
                    placeholder="Tu nombre"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <input
                    type="email"
                    name="email"
                    value={leadData.email}
                    onChange={handleLeadChange}
                    placeholder="tu@email.com"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />

                  <button
                    onClick={handleSendReport}
                    disabled={sendingReport}
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white px-6 py-4 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {sendingReport ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5 mr-2" />
                        Enviar Reporte Gratis
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center mt-4">
                  📧 Te enviaremos el reporte completo a tu email. Sin spam, prometido.
                </p>
              </>
            ) : (
              <>
                {/* Success State */}
                <div className="text-center py-8">
                  <div className="flex justify-center mb-6">
                    <div className="bg-green-100 rounded-full p-4">
                      <Check className="w-12 h-12 text-green-600" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    ¡Reporte Enviado!
                  </h3>

                  <p className="text-gray-600 mb-6">
                    Revisa tu email <span className="font-semibold text-violet-600">{leadData.email}</span> para acceder a tu reporte completo.
                  </p>

                  <p className="text-sm text-gray-500">
                    (Puede tardar unos minutos en llegar)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal de Desbloqueo (Rate Limit) */}
      {showUnlockModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-200">
            {/* Close button */}
            {!sendingReport && (
              <button
                onClick={() => setShowUnlockModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {!reportSent ? (
              <>
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="bg-violet-100 rounded-full p-4">
                    <Sparkles className="w-8 h-8 text-violet-600" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-3">
                  ¡Desbloquea el Análisis Completo!
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-center mb-6">
                  Obtén acceso a datos estacionales, precios por barrio y recomendaciones personalizadas proporcionando tu email
                </p>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">Datos por temporada (alta, media, baja)</p>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">Precios ajustados por barrio</p>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">Recomendaciones personalizadas de pricing</p>
                  </div>
                </div>

                {/* Form */}
                <div className="space-y-3">
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
                      <AlertCircle className="w-4 h-4 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-red-700 text-xs">{error}</p>
                    </div>
                  )}
                  <input
                    type="text"
                    name="name"
                    value={leadData.name}
                    onChange={handleLeadChange}
                    placeholder="Tu nombre (opcional)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <input
                    type="email"
                    name="email"
                    value={leadData.email}
                    onChange={handleLeadChange}
                    placeholder="tu@email.com"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />

                  <button
                    onClick={handleSendReport}
                    disabled={sendingReport}
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white px-6 py-4 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {sendingReport ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Desbloqueando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Desbloquear Análisis Completo
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center mt-4">
                  🔒 No usamos emails temporales. Sin spam, prometido.
                </p>
              </>
            ) : (
              <>
                {/* Success State */}
                <div className="text-center py-8">
                  <div className="flex justify-center mb-6">
                    <div className="bg-green-100 rounded-full p-4">
                      <Check className="w-12 h-12 text-green-600" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    ¡Análisis Desbloqueado!
                  </h3>

                  <p className="text-gray-600 mb-6">
                    Ya puedes ver todos los datos completos. Desplázate hacía abajo para explorarlos.
                  </p>

                  <p className="text-sm text-gray-500">
                    También recibirás una copia en tu email 📧
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
