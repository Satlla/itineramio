'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Wifi,
  ArrowLeft,
  Download,
  Eye,
  EyeOff,
  Copy,
  Check,
  Printer,
  Sparkles
} from 'lucide-react'
import { Navbar } from '../../../../../src/components/layout/Navbar'
import { SocialShare } from '../../../../../src/components/tools/SocialShare'
import { LeadCaptureModal } from '../../../../../src/components/tools/LeadCaptureModal'
import html2canvas from 'html2canvas'

const cardStyles = [
  { id: 'modern', name: 'Moderno', colors: 'from-violet-500 to-purple-600', textColor: 'text-white', emoji: '✨' },
  { id: 'minimal', name: 'Minimalista', colors: 'from-gray-50 to-white', textColor: 'text-gray-900', border: 'border-4 border-gray-900', emoji: '⚪' },
  { id: 'ocean', name: 'Océano', colors: 'from-blue-400 to-cyan-500', textColor: 'text-white', emoji: '🌊' },
  { id: 'sunset', name: 'Atardecer', colors: 'from-orange-400 via-pink-500 to-rose-500', textColor: 'text-white', emoji: '🌅' },
  { id: 'forest', name: 'Bosque', colors: 'from-emerald-600 to-green-700', textColor: 'text-white', emoji: '🌲' },
  { id: 'vintage', name: 'Vintage', colors: 'from-amber-100 to-orange-200', textColor: 'text-amber-900', border: 'border-8 border-amber-800', emoji: '📻' },
  { id: 'tropical', name: 'Tropical', colors: 'from-lime-400 via-emerald-400 to-teal-500', textColor: 'text-white', emoji: '🌴' },
  { id: 'nordic', name: 'Nórdico', colors: 'from-slate-100 to-blue-100', textColor: 'text-slate-800', emoji: '❄️' },
  { id: 'urban', name: 'Urbano', colors: 'from-zinc-800 to-neutral-900', textColor: 'text-white', emoji: '🏙️' },
  { id: 'pastel', name: 'Pastel', colors: 'from-pink-200 via-purple-200 to-indigo-200', textColor: 'text-purple-900', emoji: '🎨' }
]

export default function WiFiCardGenerator() {
  const [networkName, setNetworkName] = useState('')
  const [password, setPassword] = useState('')
  const [propertyName, setPropertyName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState(cardStyles[0])
  const [copied, setCopied] = useState(false)
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<'download' | 'print' | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const copyPassword = () => {
    navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadClick = () => {
    setPendingAction('download')
    setShowLeadModal(true)
  }

  const handlePrintClick = () => {
    setPendingAction('print')
    setShowLeadModal(true)
  }

  const downloadCard = async () => {
    if (!cardRef.current) return

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        backgroundColor: null
      })

      const link = document.createElement('a')
      link.download = `wifi-card-${propertyName || 'itineramio'}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('Error generating image:', error)
    }
  }

  const printCard = () => {
    window.print()
  }

  const handleLeadSubmit = async (data: { name: string; email: string }) => {
    try {
      const response = await fetch('/api/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          source: 'wifi-card',
          metadata: {
            propertyName,
            style: selectedStyle.name,
            action: pendingAction
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

    // Execute pending action
    if (pendingAction === 'download') {
      await downloadCard()
    } else if (pendingAction === 'print') {
      printCard()
    }

    // Close modal and reset
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
                title="Generador WiFi Card - Itineramio"
                description="Crea tarjetas WiFi imprimibles con diseños profesionales para tu alojamiento. ¡Elimina el 86% de consultas sobre WiFi!"
              />
            </div>

            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                <Wifi className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-gray-900">
                  Generador WiFi Card
                </h1>
                <p className="text-xl text-gray-600 mt-2">
                  Crea tarjetas WiFi imprimibles para tu alojamiento
                </p>
              </div>
            </div>

            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-50 rounded-full border border-green-200">
              <Sparkles className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Elimina el 86% de consultas sobre WiFi</span>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left: Controls */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Información WiFi
                </h2>

                {/* Property Name */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Nombre de tu alojamiento (opcional)
                  </label>
                  <input
                    type="text"
                    value={propertyName}
                    onChange={(e) => setPropertyName(e.target.value)}
                    placeholder="Apartamento Vista al Mar"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-gray-900 placeholder-gray-400"
                  />
                </div>

                {/* Network Name */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Nombre de la red WiFi
                  </label>
                  <input
                    type="text"
                    value={networkName}
                    onChange={(e) => setNetworkName(e.target.value)}
                    placeholder="Mi_WiFi_5G"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-gray-900 placeholder-gray-400"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    El nombre exacto que aparece en los dispositivos
                  </p>
                </div>

                {/* Password */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="********"
                      className="w-full px-4 py-3 pr-24 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-gray-900 placeholder-gray-400"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5 text-gray-400" />
                        ) : (
                          <Eye className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={copyPassword}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {copied ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <Copy className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Style Selector */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Estilo de tarjeta
                  </label>
                  <div className="grid grid-cols-5 gap-3">
                    {cardStyles.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style)}
                        className={`relative aspect-square rounded-xl transition-all ${
                          selectedStyle.id === style.id
                            ? 'ring-4 ring-green-500 ring-offset-2 scale-110'
                            : 'hover:scale-105'
                        }`}
                      >
                        <div className={`w-full h-full rounded-xl bg-gradient-to-br ${style.colors} flex items-center justify-center`}>
                          <span className="text-2xl">{style.emoji}</span>
                          {selectedStyle.id === style.id && (
                            <Check className="w-6 h-6 text-white absolute inset-0 m-auto z-10" />
                          )}
                        </div>
                        <span className="text-xs text-gray-600 mt-1 block">{style.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleDownloadClick}
                    disabled={!networkName || !password}
                    className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold flex items-center justify-center hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <Download className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                    Descargar tarjeta
                  </button>

                  <button
                    onClick={handlePrintClick}
                    disabled={!networkName || !password}
                    className="w-full py-4 bg-white border-2 border-gray-200 text-gray-900 rounded-xl font-bold flex items-center justify-center hover:border-gray-300 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Printer className="w-5 h-5 mr-2" />
                    Imprimir tarjeta
                  </button>
                </div>
              </div>

              {/* Tips */}
              <div className="mt-8 p-6 bg-green-50 border-2 border-green-200 rounded-2xl">
                <h3 className="font-bold text-green-900 mb-3 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Tips de uso
                </h3>
                <ul className="space-y-2 text-sm text-green-800">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Imprime en papel de alta calidad para mejor durabilidad</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Plastifica la tarjeta para protegerla del agua</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Colócala en lugar visible: entrada, mesa, refrigerador</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Imprime varias copias para diferentes ubicaciones</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Right: Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-xl sticky top-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Vista previa
                </h2>

                {/* WiFi Card Preview */}
                <div className="flex items-center justify-center mb-6">
                  <div
                    ref={cardRef}
                    className={`w-full max-w-md aspect-[3/2] rounded-3xl bg-gradient-to-br ${selectedStyle.colors} ${selectedStyle.textColor} ${selectedStyle.border || ''} p-8 shadow-2xl relative overflow-hidden`}
                  >
                    {/* Background decoration */}
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.3, 0.2]
                      }}
                      transition={{ duration: 5, repeat: Infinity }}
                      className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"
                    />

                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col justify-between">
                      <div>
                        {/* Style emoji decoration */}
                        <div className="absolute top-0 right-0 text-4xl opacity-30">
                          {selectedStyle.emoji}
                        </div>

                        {propertyName && (
                          <div className="text-xl font-bold mb-2">
                            {propertyName}
                          </div>
                        )}
                        <div className="flex items-center space-x-2 mb-6">
                          <Wifi className="w-8 h-8" />
                          <span className="text-2xl font-bold">WiFi</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="text-sm opacity-70 mb-1">Red:</div>
                          <div className="text-2xl font-bold break-all">
                            {networkName || 'Tu_Red_WiFi'}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm opacity-70 mb-1">Contraseña:</div>
                          <div className="text-2xl font-bold break-all">
                            {password || '••••••••'}
                          </div>
                        </div>
                      </div>

                      {/* Itineramio branding */}
                      <div className="mt-6 text-xs opacity-50">
                        Creado con Itineramio
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="p-6 bg-gray-50 rounded-2xl">
                  <h3 className="font-bold text-gray-900 mb-3">
                    Cómo conectarse:
                  </h3>
                  <ol className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="font-bold mr-2 w-5">1.</span>
                      <span>Abre la configuración WiFi en tu dispositivo</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold mr-2 w-5">2.</span>
                      <span>Busca la red: <strong>{networkName || 'Tu_Red_WiFi'}</strong></span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold mr-2 w-5">3.</span>
                      <span>Introduce la contraseña exactamente como aparece</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold mr-2 w-5">4.</span>
                      <span>¡Listo! Ya estás conectado</span>
                    </li>
                  </ol>
                </div>

                {/* CTA */}
                <div className="mt-6 p-4 bg-violet-50 rounded-xl">
                  <p className="text-sm text-violet-900">
                    <strong>¿Quieres automatizar más consultas?</strong>
                    <br />
                    <Link href="/register" className="text-violet-600 hover:text-violet-700 font-semibold underline">
                      Crea tu manual digital completo con Itineramio →
                    </Link>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #wifi-card-print * {
            visibility: visible;
          }
          #wifi-card-print {
            position: absolute;
            left: 0;
            top: 0;
          }
        }
      `}</style>

      {/* Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={showLeadModal}
        onClose={() => {
          setShowLeadModal(false)
          setPendingAction(null)
        }}
        onSubmit={handleLeadSubmit}
        title={pendingAction === 'download' ? '¡Descarga tu tarjeta WiFi!' : '¡Imprime tu tarjeta WiFi!'}
        description="Déjanos tu email para recibir más recursos gratuitos y consejos para tu negocio"
        downloadLabel={pendingAction === 'download' ? 'Descargar' : 'Continuar a imprimir'}
      />
    </div>
  )
}
