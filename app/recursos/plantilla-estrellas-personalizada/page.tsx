'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Star,
  ArrowLeft,
  Mail,
  User,
  Phone,
  Check,
  Loader2,
  CheckCircle,
  Download,
  MessageCircle,
  Sparkles
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'

export default function PlantillaEstrellasPage() {
  const [hostName, setHostName] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // QR Code state
  const [QRCodeStyling, setQRCodeStyling] = useState<any>(null)
  const [qrCode, setQrCode] = useState<any>(null)
  const qrRef = useRef<HTMLDivElement>(null)

  // Dynamically import qr-code-styling on client side only
  useEffect(() => {
    import('qr-code-styling').then((module) => {
      setQRCodeStyling(() => module.default)
    })
  }, [])

  // Generate WhatsApp QR code when number changes
  useEffect(() => {
    if (!QRCodeStyling || !whatsappNumber) {
      if (qrRef.current) {
        qrRef.current.innerHTML = ''
      }
      setQrCode(null)
      return
    }

    // Clean the phone number (remove spaces, dashes, etc.)
    const cleanNumber = whatsappNumber.replace(/[\s\-\(\)]/g, '')
    const whatsappUrl = `https://wa.me/${cleanNumber.startsWith('+') ? cleanNumber.slice(1) : cleanNumber}?text=Hola%20${encodeURIComponent(hostName || 'anfitrión')}%2C%20soy%20tu%20huésped`

    const qr = new QRCodeStyling({
      width: 100,
      height: 100,
      data: whatsappUrl,
      margin: 0,
      qrOptions: {
        typeNumber: 0,
        mode: 'Byte',
        errorCorrectionLevel: 'M'
      },
      dotsOptions: {
        type: 'rounded',
        color: '#25D366'
      },
      backgroundOptions: {
        color: '#ffffff'
      },
      cornersSquareOptions: {
        type: 'extra-rounded',
        color: '#128C7E'
      },
      cornersDotOptions: {
        type: 'dot',
        color: '#128C7E'
      }
    })

    if (qrRef.current) {
      qrRef.current.innerHTML = ''
      qr.append(qrRef.current)
    }
    setQrCode(qr)
  }, [QRCodeStyling, whatsappNumber, hostName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')

    if (!hostName.trim() || !whatsappNumber.trim() || !userEmail.trim()) {
      setSubmitError('Por favor completa todos los campos')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
      setSubmitError('Email no válido')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/recursos/plantilla-estrellas-personalizada', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostName,
          whatsappNumber,
          email: userEmail
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al enviar')
      }

      setSubmitSuccess(true)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Error al enviar')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = hostName && whatsappNumber && userEmail

  const starMeanings = [
    { stars: 5, emoji: '⭐⭐⭐⭐⭐', title: 'Perfecto', color: 'bg-green-500', description: 'Todo fue excelente' },
    { stars: 4, emoji: '⭐⭐⭐⭐', title: 'Bien, pero...', color: 'bg-yellow-500', description: 'Algo podría mejorar' },
    { stars: 3, emoji: '⭐⭐⭐', title: 'Problemas', color: 'bg-orange-500', description: 'Hubo inconvenientes' },
    { stars: 2, emoji: '⭐⭐', title: 'Muy malo', color: 'bg-red-500', description: 'Experiencia negativa' },
    { stars: 1, emoji: '⭐', title: 'Inaceptable', color: 'bg-red-700', description: 'Evitar completamente' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <Navbar />

      <div className="pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <Link
              href="/recursos"
              className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium group mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Volver a recursos
            </Link>

            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center">
                <Star className="w-8 h-8 text-white fill-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  Plantilla: Significado de las Estrellas
                </h1>
                <p className="text-xl text-gray-600 mt-2">
                  Explica a tus huéspedes cómo funciona el sistema de valoraciones
                </p>
              </div>
            </div>

            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-100 rounded-full border border-amber-200">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-900">Personalizable con tu WhatsApp</span>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left: Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Personaliza tu plantilla
                </h2>

                {submitSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 text-center"
                  >
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-green-900 mb-2">
                      ¡Enviado!
                    </h3>
                    <p className="text-green-700 mb-4">
                      Revisa tu correo <strong>{userEmail}</strong>. Te hemos enviado la plantilla personalizada.
                    </p>
                    <button
                      onClick={() => {
                        setSubmitSuccess(false)
                        setHostName('')
                        setWhatsappNumber('')
                        setUserEmail('')
                      }}
                      className="text-green-600 font-semibold hover:text-green-700"
                    >
                      Crear otra plantilla
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Host Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-2" />
                        Tu nombre (como anfitrión)
                      </label>
                      <input
                        type="text"
                        value={hostName}
                        onChange={(e) => setHostName(e.target.value)}
                        placeholder="Ej: María, Carlos..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none text-gray-900 placeholder-gray-400"
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* WhatsApp */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <MessageCircle className="w-4 h-4 inline mr-2" />
                        Tu número de WhatsApp
                      </label>
                      <input
                        type="tel"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        placeholder="Ej: +34 612 345 678"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none text-gray-900 placeholder-gray-400"
                        disabled={isSubmitting}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Se genera un QR para que el huésped te contacte antes de puntuar
                      </p>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Mail className="w-4 h-4 inline mr-2" />
                        Tu email (donde enviamos la plantilla)
                      </label>
                      <input
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="tu@email.com"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none text-gray-900 placeholder-gray-400"
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Error */}
                    {submitError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
                      >
                        {submitError}
                      </motion.div>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={!isFormValid || isSubmitting}
                      className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold flex items-center justify-center hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Generando...
                        </>
                      ) : (
                        <>
                          <Mail className="w-5 h-5 mr-2" />
                          Recibir plantilla por email
                        </>
                      )}
                    </button>

                    <p className="text-xs text-center text-gray-500">
                      Al enviar, aceptas recibir la plantilla y ocasionalmente contenido útil para anfitriones.
                    </p>
                  </form>
                )}
              </div>

              {/* Why this matters */}
              <div className="mt-8 p-6 bg-amber-50 border-2 border-amber-200 rounded-2xl">
                <h3 className="font-bold text-amber-900 mb-3 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  ¿Por qué usar esta plantilla?
                </h3>
                <ul className="space-y-2 text-sm text-amber-800">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Muchos huéspedes no saben que 4 estrellas en Airbnb es una mala valoración</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Les invitas a contactarte antes de puntuar si algo no fue perfecto</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Incluye un QR de WhatsApp para que te escriban fácilmente</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Imprime y coloca en el alojamiento o inclúyela en tu manual digital</span>
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

                {/* Card Preview */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200">
                  {/* Header */}
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">
                      ¿Cómo valorar tu estancia?
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      En Airbnb, menos de 5 estrellas afecta al anfitrión
                    </p>
                  </div>

                  {/* Stars Meanings */}
                  <div className="space-y-3 mb-6">
                    {starMeanings.map((item) => (
                      <div key={item.stars} className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm">
                        <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                        <div className="text-lg font-medium w-28">{item.emoji}</div>
                        <div>
                          <span className="font-semibold text-gray-900">{item.title}</span>
                          <span className="text-gray-500 text-sm ml-2">{item.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Contact section */}
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-start gap-4">
                      <div>
                        <p className="font-semibold text-green-800 text-sm mb-1">
                          ¿Algo no fue perfecto?
                        </p>
                        <p className="text-green-700 text-sm">
                          Escríbeme antes de puntuar y lo solucionamos.
                        </p>
                        <p className="text-green-800 font-medium mt-2">
                          {hostName || 'Tu nombre'}, anfitrión
                        </p>
                      </div>
                      {/* QR Code */}
                      {whatsappNumber ? (
                        <div className="flex-shrink-0 bg-white rounded-lg p-2 shadow">
                          <div ref={qrRef} className="w-[80px] h-[80px]" />
                          <p className="text-[8px] text-gray-500 text-center mt-1">
                            WhatsApp
                          </p>
                        </div>
                      ) : (
                        <div className="flex-shrink-0 bg-gray-100 rounded-lg p-2 w-[96px] h-[96px] flex items-center justify-center">
                          <MessageCircle className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* What you get */}
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-2">¿Qué recibirás?</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Plantilla lista para imprimir (PDF)
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Tu QR de WhatsApp incluido
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Diseño profesional y limpio
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Perfecta para enmarcar o plastificar
                    </li>
                  </ul>
                </div>

                {/* CTA */}
                <div className="mt-6 p-4 bg-violet-50 rounded-xl">
                  <p className="text-sm text-violet-900">
                    <strong>¿Quieres un manual digital completo?</strong>
                    <br />
                    <Link href="/register" className="text-violet-600 hover:text-violet-700 font-semibold underline">
                      Crea tu manual con Itineramio
                    </Link>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
