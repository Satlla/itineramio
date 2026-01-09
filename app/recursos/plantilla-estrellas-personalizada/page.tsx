'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  Star,
  ArrowLeft,
  User,
  Download,
  MessageCircle,
  Sparkles,
  Loader2,
  Check,
  Mail
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'

// Dynamic import of motion to avoid hydration issues
const MotionDiv = dynamic(
  () => import('framer-motion').then((mod) => mod.motion.div),
  { ssr: false }
)

export default function PlantillaEstrellasPage() {
  const [mounted, setMounted] = useState(false)
  const [hostName, setHostName] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDownloaded, setIsDownloaded] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState('')

  // QR Code state
  const [QRCodeStyling, setQRCodeStyling] = useState<any>(null)
  const qrRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  // Set mounted on client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Dynamically import qr-code-styling on client side only
  useEffect(() => {
    if (!mounted) return
    import('qr-code-styling').then((module) => {
      setQRCodeStyling(() => module.default)
    })
  }, [mounted])

  // Generate WhatsApp QR code when number changes
  useEffect(() => {
    if (!mounted || !QRCodeStyling || !whatsappNumber || !qrRef.current) return

    const cleanNumber = whatsappNumber.replace(/[\s\-\(\)]/g, '')
    const phoneForUrl = cleanNumber.startsWith('+') ? cleanNumber.slice(1) : cleanNumber
    const whatsappUrl = `https://wa.me/${phoneForUrl}?text=Hola%20${encodeURIComponent(hostName || 'anfitrión')}%2C%20soy%20tu%20huésped`

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

    qrRef.current.innerHTML = ''
    qr.append(qrRef.current)
  }, [mounted, QRCodeStyling, whatsappNumber, hostName])

  const handleDownload = useCallback(async () => {
    if (!cardRef.current || !hostName || !whatsappNumber) return

    setIsGenerating(true)
    setError('')

    try {
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')

      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false
      })

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a5'
      })

      const imgData = canvas.toDataURL('image/png')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight) * 0.9

      const imgX = (pdfWidth - imgWidth * ratio) / 2
      const imgY = (pdfHeight - imgHeight * ratio) / 2

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
      pdf.save(`plantilla-estrellas-${hostName.toLowerCase().replace(/\s+/g, '-')}.pdf`)

      setIsDownloaded(true)
      setTimeout(() => setIsDownloaded(false), 3000)

      // Track lead
      if (userEmail) {
        fetch('/api/leads/capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: hostName,
            email: userEmail,
            source: 'plantilla-estrellas',
            metadata: { whatsappNumber, action: 'download' }
          })
        }).catch(() => {})
      }

    } catch (err) {
      console.error('Error generating PDF:', err)
      setError('Error al generar el PDF. Inténtalo de nuevo.')
    } finally {
      setIsGenerating(false)
    }
  }, [hostName, whatsappNumber, userEmail])

  const handleSendEmail = useCallback(async () => {
    if (!hostName || !whatsappNumber || !userEmail) return

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userEmail)) {
      setError('Email no válido')
      return
    }

    setIsSendingEmail(true)
    setError('')

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

      if (!response.ok) {
        throw new Error('Error al enviar')
      }

      setEmailSent(true)
    } catch (err) {
      setError('Error al enviar el email. Inténtalo de nuevo.')
    } finally {
      setIsSendingEmail(false)
    }
  }, [hostName, whatsappNumber, userEmail])

  const isFormValid = hostName.trim() && whatsappNumber.trim()
  const canSendEmail = isFormValid && userEmail.trim()

  const starMeanings = [
    { stars: 5, emoji: '★★★★★', title: 'Excelente', color: '#22C55E', description: 'Todo fue perfecto' },
    { stars: 4, emoji: '★★★★☆', title: 'Bien, pero...', color: '#EAB308', description: 'Algo podría mejorar' },
    { stars: 3, emoji: '★★★☆☆', title: 'Regular', color: '#F97316', description: 'Hubo problemas' },
    { stars: 2, emoji: '★★☆☆☆', title: 'Malo', color: '#EF4444', description: 'Mala experiencia' },
    { stars: 1, emoji: '★☆☆☆☆', title: 'Muy malo', color: '#B91C1C', description: 'Inaceptable' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      <div className="pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <Link
              href="/hub"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 font-medium group mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Volver al Hub
            </Link>

            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#FF385C] to-[#E31C5F] rounded-2xl flex items-center justify-center">
                <Star className="w-8 h-8 text-white fill-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  Plantilla: Significado de las Estrellas
                </h1>
                <p className="text-xl text-gray-600 mt-2">
                  Explica a tus huéspedes cómo valorar en Airbnb
                </p>
              </div>
            </div>

            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[#FF385C]/10 rounded-full border border-[#FF385C]/20">
              <Sparkles className="w-4 h-4 text-[#FF385C]" />
              <span className="text-sm font-medium text-[#FF385C]">Descarga PDF gratuita</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left: Form */}
            <div>
              <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Personaliza tu plantilla
                </h2>

                {emailSent ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">¡Enviado!</h3>
                    <p className="text-gray-600 mb-4">
                      Revisa tu correo <strong>{userEmail}</strong>
                    </p>
                    <button
                      onClick={() => {
                        setEmailSent(false)
                        setHostName('')
                        setWhatsappNumber('')
                        setUserEmail('')
                      }}
                      className="text-[#FF385C] font-semibold hover:underline"
                    >
                      Crear otra plantilla
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Host Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-2" />
                        Tu nombre (como anfitrión) *
                      </label>
                      <input
                        type="text"
                        value={hostName}
                        onChange={(e) => setHostName(e.target.value)}
                        placeholder="Ej: María, Carlos..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF385C] focus:outline-none text-gray-900 placeholder-gray-400"
                      />
                    </div>

                    {/* WhatsApp */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <MessageCircle className="w-4 h-4 inline mr-2" />
                        Tu número de WhatsApp *
                      </label>
                      <input
                        type="tel"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        placeholder="Ej: +34 612 345 678"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF385C] focus:outline-none text-gray-900 placeholder-gray-400"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Se genera un QR para que el huésped te contacte
                      </p>
                    </div>

                    {/* Email (optional for sending) */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Mail className="w-4 h-4 inline mr-2" />
                        Tu email (opcional, para recibirla por correo)
                      </label>
                      <input
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="tu@email.com"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF385C] focus:outline-none text-gray-900 placeholder-gray-400"
                      />
                    </div>

                    {/* Error */}
                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                        {error}
                      </div>
                    )}

                    {/* Buttons */}
                    <div className="space-y-3">
                      {/* Download Button */}
                      <button
                        onClick={handleDownload}
                        disabled={!isFormValid || isGenerating}
                        className="w-full py-4 bg-gradient-to-r from-[#FF385C] to-[#E31C5F] text-white rounded-xl font-bold flex items-center justify-center hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Generando PDF...
                          </>
                        ) : isDownloaded ? (
                          <>
                            <Check className="w-5 h-5 mr-2" />
                            ¡Descargado!
                          </>
                        ) : (
                          <>
                            <Download className="w-5 h-5 mr-2" />
                            Descargar PDF gratis
                          </>
                        )}
                      </button>

                      {/* Send Email Button (only if email provided) */}
                      {userEmail && (
                        <button
                          onClick={handleSendEmail}
                          disabled={!canSendEmail || isSendingEmail}
                          className="w-full py-3 bg-white border-2 border-[#FF385C] text-[#FF385C] rounded-xl font-semibold flex items-center justify-center hover:bg-[#FF385C]/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSendingEmail ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Enviando...
                            </>
                          ) : (
                            <>
                              <Mail className="w-5 h-5 mr-2" />
                              Enviar a mi email
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Why this matters */}
              <div className="mt-8 p-6 bg-[#FFF8F6] border-2 border-[#FF385C]/20 rounded-2xl">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-[#FF385C]" />
                  ¿Por qué usar esta plantilla?
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2 text-[#FF385C]">•</span>
                    <span>Muchos huéspedes no saben que 4★ en Airbnb perjudica al anfitrión</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-[#FF385C]">•</span>
                    <span>Les invitas a contactarte antes de puntuar si algo no fue perfecto</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-[#FF385C]">•</span>
                    <span>Incluye tu QR de WhatsApp para contacto directo</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-[#FF385C]">•</span>
                    <span>Imprime y coloca en el alojamiento (entrada, salón, nevera...)</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right: Preview / Card to Download */}
            <div>
              <div className="sticky top-24">
                <h2 className="text-lg font-semibold text-gray-500 mb-4">Vista previa</h2>

                {/* The actual card that gets converted to PDF */}
                <div
                  ref={cardRef}
                  className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-200"
                  style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                >
                  {/* Airbnb-style header */}
                  <div className="bg-gradient-to-r from-[#FF385C] to-[#E31C5F] px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <Star className="w-5 h-5 text-white fill-white" />
                      </div>
                      <div className="text-white">
                        <p className="text-xs opacity-80">Guía para huéspedes</p>
                        <p className="font-bold text-lg">¿Cómo valorar tu estancia?</p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <p className="text-gray-600 text-sm mb-5 text-center">
                      En Airbnb, menos de 5 estrellas afecta negativamente al anfitrión
                    </p>

                    {/* Star meanings */}
                    <div className="space-y-2 mb-6">
                      {starMeanings.map((item) => (
                        <div
                          key={item.stars}
                          className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3"
                        >
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <div className="text-lg font-medium text-amber-500 w-24 flex-shrink-0">
                            {item.emoji}
                          </div>
                          <div className="flex-1">
                            <span className="font-semibold text-gray-900">{item.title}</span>
                            <span className="text-gray-500 text-sm ml-2">– {item.description}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Contact box */}
                    <div className="bg-[#DCF8C6] rounded-xl p-4 border border-[#25D366]/30">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <p className="font-semibold text-[#075E54] text-sm mb-1">
                            ¿Algo no fue perfecto?
                          </p>
                          <p className="text-[#128C7E] text-sm mb-2">
                            Escríbeme antes de puntuar y lo solucionamos.
                          </p>
                          <p className="text-[#075E54] font-bold" suppressHydrationWarning>
                            {hostName || 'Tu nombre'}, anfitrión
                          </p>
                        </div>
                        {/* QR Code */}
                        <div className="flex-shrink-0">
                          {mounted && whatsappNumber ? (
                            <div className="bg-white rounded-lg p-2 shadow-sm">
                              <div ref={qrRef} className="w-[80px] h-[80px]" />
                              <p className="text-[10px] text-[#128C7E] text-center mt-1 font-medium">
                                WhatsApp
                              </p>
                            </div>
                          ) : (
                            <div className="bg-white/50 rounded-lg p-2 w-[96px] h-[96px] flex flex-col items-center justify-center">
                              <MessageCircle className="w-8 h-8 text-[#25D366]/40" />
                              <p className="text-[9px] text-gray-400 mt-1">Tu QR aquí</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-gray-400 text-xs mt-4">
                      Generado con itineramio.com
                    </p>
                  </div>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
