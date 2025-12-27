'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  ArrowLeft,
  DollarSign,
  Clock,
  Users,
  Phone,
  CheckCircle,
  Sparkles,
  TrendingDown,
  Award
} from 'lucide-react'
import { Navbar } from '../../../../../src/components/layout/Navbar'
import { SocialShare } from '../../../../../src/components/tools/SocialShare'
import { LeadCaptureModal } from '../../../../../src/components/tools/LeadCaptureModal'

export default function ROICalculator() {
  // Inputs
  const [properties, setProperties] = useState(3)
  const [monthlyBookings, setMonthlyBookings] = useState(10)
  const [hourlyRate, setHourlyRate] = useState(25)
  const [avgCalls, setAvgCalls] = useState(15)
  const [callDuration, setCallDuration] = useState(5)

  // Lead capture states
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<'download' | null>(null)

  // Results
  const [results, setResults] = useState({
    hoursPerMonth: 0,
    costPerMonth: 0,
    yearlyTimeSaved: 0,
    yearlyCostSaved: 0,
    itineramioCost: 0,
    netSavings: 0,
    roi: 0,
    paybackDays: 0
  })

  useEffect(() => {
    calculateROI()
  }, [properties, monthlyBookings, hourlyRate, avgCalls, callDuration])

  const calculateROI = () => {
    // Tiempo actual gastado por mes
    const totalMonthlyBookings = monthlyBookings * properties
    const totalMonthlyCalls = totalMonthlyBookings * avgCalls
    const totalMinutesPerMonth = totalMonthlyCalls * callDuration
    const hoursPerMonth = totalMinutesPerMonth / 60

    // Costo por mes basado en tiempo
    const costPerMonth = hoursPerMonth * hourlyRate

    // Ahorros anuales
    const yearlyTimeSaved = hoursPerMonth * 12
    const yearlyCostSaved = costPerMonth * 12

    // Costo Itineramio (basado en planes reales)
    let itineramioCost
    if (properties <= 2) itineramioCost = 9
    else if (properties <= 10) itineramioCost = 29
    else if (properties <= 25) itineramioCost = 69
    else itineramioCost = 99

    const yearlyItineramioCost = itineramioCost * 12

    // Ahorro neto
    const netSavings = yearlyCostSaved - yearlyItineramioCost

    // ROI (Return on Investment)
    const roi = ((netSavings / yearlyItineramioCost) * 100)

    // Payback period (días para recuperar inversión)
    const paybackDays = (yearlyItineramioCost / yearlyCostSaved) * 365

    setResults({
      hoursPerMonth,
      costPerMonth,
      yearlyTimeSaved,
      yearlyCostSaved,
      itineramioCost,
      netSavings,
      roi,
      paybackDays
    })
  }

  const handleDownloadClick = () => {
    setPendingAction('download')
    setShowLeadModal(true)
  }

  const downloadResults = () => {
    // Create a simple text summary that can be copied or downloaded
    const summary = `
🎯 ANÁLISIS ROI - ITINERAMIO

Tu Situación:
• ${properties} propiedades
• ${monthlyBookings} reservas/mes por propiedad
• ${avgCalls} llamadas/mensajes por reserva
• ${callDuration} minutos promedio por llamada
• €${hourlyRate}/hora tu tarifa horaria

📊 Resultados Anuales:
• Ahorro neto: €${Math.round(results.netSavings).toLocaleString()}
• Tiempo ahorrado: ${Math.round(results.yearlyTimeSaved)} horas
• ROI: ${Math.round(results.roi)}%
• Recuperación de inversión: ${Math.round(results.paybackDays)} días

💰 Desglose Mensual:
• Horas gastadas ahora: ${Math.round(results.hoursPerMonth)}h
• Costo actual: €${Math.round(results.costPerMonth)}
• Costo con Itineramio: €${results.itineramioCost}
• Ahorro mensual: €${Math.round(results.costPerMonth - results.itineramioCost)}

Generado con Itineramio - https://itineramio.com
    `.trim()

    // Create and download as text file
    const blob = new Blob([summary], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `itineramio-roi-analisis.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleLeadSubmit = async (data: { name: string; email: string }) => {
    try {
      // Call API endpoint
      const response = await fetch('/api/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          source: 'roi-calculator',
          metadata: {
            properties,
            monthlyBookings,
            estimatedSavings: Math.round(results.netSavings)
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

    // Proceed with download
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
                title="Calculadora ROI - Itineramio"
                description="Calcula cuánto tiempo y dinero ahorras automatizando tu gestión de alojamientos turísticos."
              />
            </div>

            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-gray-900">
                  Calculadora ROI
                </h1>
                <p className="text-xl text-gray-600 mt-2">
                  Descubre cuánto tiempo y dinero ahorras con Itineramio
                </p>
              </div>
            </div>

            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-50 rounded-full border border-orange-200">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">Cálculo basado en datos reales de +500 anfitriones</span>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left: Inputs */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Tu situación actual
                </h2>

                {/* Propiedades */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Número de propiedades
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={properties}
                      onChange={(e) => setProperties(Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                    />
                    <div className="w-20 text-center">
                      <span className="text-3xl font-bold text-orange-600">{properties}</span>
                    </div>
                  </div>
                </div>

                {/* Reservas mensuales */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Reservas mensuales por propiedad
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={monthlyBookings}
                      onChange={(e) => setMonthlyBookings(Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                    />
                    <div className="w-20 text-center">
                      <span className="text-3xl font-bold text-orange-600">{monthlyBookings}</span>
                    </div>
                  </div>
                </div>

                {/* Llamadas promedio */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    Llamadas/mensajes promedio por reserva
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={avgCalls}
                      onChange={(e) => setAvgCalls(Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                    />
                    <div className="w-20 text-center">
                      <span className="text-3xl font-bold text-orange-600">{avgCalls}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    WiFi, parking, electrodomésticos, check-in/out, etc.
                  </p>
                </div>

                {/* Duración promedio */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Duración promedio por llamada (minutos)
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={callDuration}
                      onChange={(e) => setCallDuration(Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                    />
                    <div className="w-20 text-center">
                      <span className="text-3xl font-bold text-orange-600">{callDuration}</span>
                    </div>
                  </div>
                </div>

                {/* Tarifa horaria */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Tu tarifa horaria (€/hora)
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                    />
                    <div className="w-20 text-center">
                      <span className="text-3xl font-bold text-orange-600">€{hourlyRate}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    ¿Cuánto vale tu tiempo? (salario mínimo ~€10/h)
                  </p>
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
              {/* Main Result Card */}
              <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3]
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Tu ahorro anual</h2>
                    <Award className="w-10 h-10" />
                  </div>

                  <div className="mb-8">
                    <div className="text-6xl font-bold mb-2">
                      €{Math.round(results.netSavings).toLocaleString()}
                    </div>
                    <div className="text-white/80 text-lg">
                      Ahorro neto al año
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                      <div className="text-3xl font-bold">{Math.round(results.yearlyTimeSaved)}h</div>
                      <div className="text-white/80 text-sm">Tiempo ahorrado</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                      <div className="text-3xl font-bold">{Math.round(results.roi)}%</div>
                      <div className="text-white/80 text-sm">ROI</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Breakdown Cards */}
              <div className="grid grid-cols-2 gap-4">
                {/* Costo actual */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-2xl p-6 border-2 border-red-200 shadow-lg"
                >
                  <TrendingDown className="w-8 h-8 text-red-600 mb-3" />
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    €{Math.round(results.yearlyCostSaved)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Costo actual anual
                  </div>
                </motion.div>

                {/* Costo con Itineramio */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-2xl p-6 border-2 border-green-200 shadow-lg"
                >
                  <TrendingUp className="w-8 h-8 text-green-600 mb-3" />
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    €{results.itineramioCost * 12}
                  </div>
                  <div className="text-sm text-gray-600">
                    Con Itineramio/año
                  </div>
                </motion.div>
              </div>

              {/* Payback Period */}
              <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Período de recuperación
                </h3>
                <div className="flex items-center space-x-4">
                  <Clock className="w-12 h-12 text-violet-600" />
                  <div>
                    <div className="text-4xl font-bold text-gray-900">
                      {Math.round(results.paybackDays)} días
                    </div>
                    <div className="text-gray-600">
                      para recuperar tu inversión
                    </div>
                  </div>
                </div>
              </div>

              {/* Breakdown Details */}
              <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Desglose mensual
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-gray-600">Horas gastadas ahora:</span>
                    <span className="font-bold text-gray-900">{Math.round(results.hoursPerMonth)}h</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-gray-600">Costo en tu tiempo:</span>
                    <span className="font-bold text-gray-900">€{Math.round(results.costPerMonth)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-gray-600">Costo Itineramio:</span>
                    <span className="font-bold text-green-600">€{results.itineramioCost}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3">
                    <span className="text-gray-900 font-semibold">Ahorro mensual:</span>
                    <span className="font-bold text-orange-600 text-xl">€{Math.round(results.costPerMonth - results.itineramioCost)}</span>
                  </div>
                </div>
              </div>

              {/* Download Results Button */}
              <button
                onClick={handleDownloadClick}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center group"
              >
                <TrendingUp className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                Descargar análisis completo
              </button>

              {/* CTA */}
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border-2 border-violet-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  ¿Listo para recuperar tu tiempo?
                </h3>
                <p className="text-gray-600 mb-4">
                  Únete a cientos de anfitriones que ya ahorran {Math.round(results.yearlyTimeSaved)} horas al año
                </p>
                <Link href="/register">
                  <button className="w-full py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-2xl transition-all">
                    Empezar gratis ahora
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
        title="¡Descarga tu análisis ROI personalizado!"
        description="Déjanos tu email para recibir este análisis y más recursos gratuitos"
        downloadLabel="Descargar análisis"
      />
    </div>
  )
}
