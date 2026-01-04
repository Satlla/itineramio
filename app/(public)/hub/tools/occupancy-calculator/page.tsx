'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BarChart3,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Percent,
  Target,
  Sparkles,
  Info,
  Download
} from 'lucide-react'
import { Navbar } from '../../../../../src/components/layout/Navbar'
import { SocialShare } from '../../../../../src/components/tools/SocialShare'
import { LeadCaptureModal } from '../../../../../src/components/tools/LeadCaptureModal'

const monthsData = [
  { id: 1, name: 'Enero', season: 'low' },
  { id: 2, name: 'Febrero', season: 'low' },
  { id: 3, name: 'Marzo', season: 'medium' },
  { id: 4, name: 'Abril', season: 'high' },
  { id: 5, name: 'Mayo', season: 'high' },
  { id: 6, name: 'Junio', season: 'high' },
  { id: 7, name: 'Julio', season: 'high' },
  { id: 8, name: 'Agosto', season: 'high' },
  { id: 9, name: 'Septiembre', season: 'medium' },
  { id: 10, name: 'Octubre', season: 'medium' },
  { id: 11, name: 'Noviembre', season: 'low' },
  { id: 12, name: 'Diciembre', season: 'low' }
]

export default function OccupancyCalculator() {
  const [bookedNights, setBookedNights] = useState(15)
  const [avgNightlyRate, setAvgNightlyRate] = useState(75)
  const [expenses, setExpenses] = useState(500)
  const [targetOccupancy, setTargetOccupancy] = useState(70)

  // Lead capture states
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<'download' | null>(null)

  const [metrics, setMetrics] = useState({
    occupancyRate: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    netIncome: 0,
    revenuePerNight: 0,
    nightsNeeded: 0,
    gap: 0
  })

  useEffect(() => {
    calculateMetrics()
  }, [bookedNights, avgNightlyRate, expenses, targetOccupancy])

  const calculateMetrics = () => {
    const daysInMonth = 30
    const occupancyRate = (bookedNights / daysInMonth) * 100
    const monthlyRevenue = bookedNights * avgNightlyRate
    const yearlyRevenue = monthlyRevenue * 12
    const netIncome = monthlyRevenue - expenses
    const revenuePerNight = avgNightlyRate
    const nightsNeeded = Math.ceil((targetOccupancy / 100) * daysInMonth)
    const gap = nightsNeeded - bookedNights

    setMetrics({
      occupancyRate: Math.round(occupancyRate),
      monthlyRevenue: Math.round(monthlyRevenue),
      yearlyRevenue: Math.round(yearlyRevenue),
      netIncome: Math.round(netIncome),
      revenuePerNight,
      nightsNeeded,
      gap
    })
  }

  const getStatusColor = (rate: number) => {
    if (rate >= 80) return 'green'
    if (rate >= 60) return 'blue'
    if (rate >= 40) return 'orange'
    return 'red'
  }

  const statusColor = getStatusColor(metrics.occupancyRate)

  const handleDownloadClick = () => {
    setPendingAction('download')
    setShowLeadModal(true)
  }

  const downloadResults = () => {
    const summary = `
📊 ANÁLISIS DE OCUPACIÓN - ITINERAMIO

Datos Actuales:
• Noches reservadas: ${bookedNights} de 30
• Precio promedio por noche: €${avgNightlyRate}
• Gastos mensuales: €${expenses}
• Objetivo de ocupación: ${targetOccupancy}%

📈 Métricas de Rendimiento:
• Tasa de ocupación actual: ${metrics.occupancyRate}%
• Ingresos mensuales: €${metrics.monthlyRevenue.toLocaleString()}
• Beneficio neto mensual: €${metrics.netIncome.toLocaleString()}

📅 Proyección Anual:
• Ingresos anuales: €${metrics.yearlyRevenue.toLocaleString()}
• Gastos anuales: €${(expenses * 12).toLocaleString()}
• Beneficio neto anual: €${(metrics.netIncome * 12).toLocaleString()}

${metrics.gap > 0 ? `
🎯 Plan de Acción:
• Necesitas ${metrics.gap} reservas adicionales este mes
• Ingreso potencial: €${metrics.gap * avgNightlyRate}
• Considera ajustar precios o promociones especiales
• Mejora fotos y descripción para mayor conversión
` : `
✅ ¡Objetivo cumplido!
Has alcanzado tu objetivo de ocupación del ${targetOccupancy}%
`}

💡 Benchmarks del Sector:
• Excelente: 80-100%
• Buena: 60-79%
• Media: 40-59%
• Baja: <40%

Tu ocupación actual (${metrics.occupancyRate}%) es ${
  metrics.occupancyRate >= 80 ? 'EXCELENTE' :
  metrics.occupancyRate >= 60 ? 'BUENA' :
  metrics.occupancyRate >= 40 ? 'MEDIA' :
  'BAJA'
}

Generado con Itineramio - https://www.itineramio.com
    `.trim()

    const blob = new Blob([summary], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `itineramio-ocupacion-analisis.txt`
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
          source: 'occupancy-calculator',
          metadata: {
            occupancyRate: metrics.occupancyRate,
            monthlyRevenue: metrics.monthlyRevenue,
            targetOccupancy
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
      downloadResults()
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
                title="Calculadora de Ocupación - Itineramio"
                description="Calcula y optimiza tu tasa de ocupación mensual y proyecciones de ingresos."
              />
            </div>

            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-gray-900">
                  Calculadora de Ocupación
                </h1>
                <p className="text-xl text-gray-600 mt-2">
                  Calcula y optimiza tu tasa de ocupación mensual
                </p>
              </div>
            </div>

            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-200">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-900">Mejora tu rentabilidad con datos precisos</span>
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
              {/* Current Occupancy */}
              <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Calendar className="w-6 h-6 mr-3 text-emerald-600" />
                  Ocupación actual
                </h2>

                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Noches reservadas este mes
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={bookedNights}
                      onChange={(e) => setBookedNights(Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <div className="w-20 text-center">
                      <span className="text-4xl font-bold text-emerald-600">{bookedNights}</span>
                      <div className="text-xs text-gray-500">de 30</div>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Precio promedio por noche
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="20"
                      max="300"
                      step="5"
                      value={avgNightlyRate}
                      onChange={(e) => setAvgNightlyRate(Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <div className="w-24 text-center">
                      <span className="text-4xl font-bold text-emerald-600">€{avgNightlyRate}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Gastos mensuales
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="0"
                      max="2000"
                      step="50"
                      value={expenses}
                      onChange={(e) => setExpenses(Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <div className="w-24 text-center">
                      <span className="text-4xl font-bold text-emerald-600">€{expenses}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Limpieza, mantenimiento, servicios, etc.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Objetivo de ocupación
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={targetOccupancy}
                      onChange={(e) => setTargetOccupancy(Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <div className="w-20 text-center">
                      <span className="text-4xl font-bold text-emerald-600">{targetOccupancy}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benchmarks */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200">
                <h3 className="font-bold text-blue-900 mb-4 flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  Benchmarks del sector
                </h3>
                <div className="space-y-3 text-sm text-blue-800">
                  <div className="flex justify-between items-center">
                    <span>Ocupación excelente:</span>
                    <span className="font-bold text-green-700">80-100%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Ocupación buena:</span>
                    <span className="font-bold text-blue-700">60-79%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Ocupación media:</span>
                    <span className="font-bold text-orange-700">40-59%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Ocupación baja:</span>
                    <span className="font-bold text-red-700">&lt;40%</span>
                  </div>
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
              {/* Main Metric */}
              <div className={`bg-gradient-to-br from-${statusColor}-500 to-${statusColor}-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden`}
                style={{
                  background: `linear-gradient(135deg, ${
                    statusColor === 'green' ? '#10b981' :
                    statusColor === 'blue' ? '#3b82f6' :
                    statusColor === 'orange' ? '#f59e0b' :
                    '#ef4444'
                  } 0%, ${
                    statusColor === 'green' ? '#059669' :
                    statusColor === 'blue' ? '#2563eb' :
                    statusColor === 'orange' ? '#d97706' :
                    '#dc2626'
                  } 100%)`
                }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3]
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">Tasa de Ocupación</h2>
                    <Percent className="w-10 h-10" />
                  </div>

                  <div className="text-7xl font-bold mb-6">
                    {metrics.occupancyRate}%
                  </div>

                  <div className="flex items-center space-x-2 text-lg">
                    {metrics.occupancyRate >= targetOccupancy ? (
                      <>
                        <TrendingUp className="w-6 h-6" />
                        <span>¡Objetivo cumplido!</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-6 h-6" />
                        <span>Necesitas {metrics.gap} noches más</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Revenue Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
                  <DollarSign className="w-8 h-8 text-emerald-600 mb-3" />
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    €{metrics.monthlyRevenue.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Ingresos/mes</div>
                </div>

                <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
                  <Target className="w-8 h-8 text-blue-600 mb-3" />
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    €{metrics.netIncome.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Beneficio neto</div>
                </div>
              </div>

              {/* Annual Projection */}
              <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                  Proyección anual
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-gray-600">Ingresos anuales:</span>
                    <span className="font-bold text-gray-900 text-xl">€{metrics.yearlyRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-gray-600">Gastos anuales:</span>
                    <span className="font-bold text-red-600 text-xl">-€{(expenses * 12).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3">
                    <span className="text-gray-900 font-semibold">Beneficio neto anual:</span>
                    <span className="font-bold text-emerald-600 text-2xl">€{(metrics.netIncome * 12).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Plan */}
              {metrics.gap > 0 && (
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border-2 border-orange-200">
                  <h3 className="font-bold text-orange-900 mb-4">
                    Plan de acción para alcanzar {targetOccupancy}%
                  </h3>
                  <ul className="space-y-2 text-sm text-orange-800">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Necesitas {metrics.gap} reservas adicionales este mes</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Ingreso potencial: €{metrics.gap * avgNightlyRate}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Considera ajustar precios o promociones especiales</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Mejora fotos y descripción para mayor conversión</span>
                    </li>
                  </ul>
                </div>
              )}

              {/* Download Button */}
              <button
                onClick={handleDownloadClick}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center group"
              >
                <Download className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                Descargar análisis completo
              </button>

              {/* CTA */}
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border-2 border-violet-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  ¿Quieres aumentar tu ocupación?
                </h3>
                <p className="text-gray-600 mb-4">
                  Itineramio te ayuda a mejorar la experiencia del huésped y obtener más reviews positivas
                </p>
                <Link href="/register">
                  <button className="w-full py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-2xl transition-all">
                    Mejorar experiencia de huéspedes
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
        title="¡Descarga tu análisis de ocupación!"
        description="Déjanos tu email para recibir este análisis y más recursos gratuitos"
        downloadLabel="Descargar análisis"
      />
    </div>
  )
}
