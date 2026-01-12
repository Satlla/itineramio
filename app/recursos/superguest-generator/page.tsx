'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, Share2, Copy, Check, Sparkles, Award, FileText } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export default function SuperGuestGeneratorPage() {
  const [guestName, setGuestName] = useState('')
  const [discount, setDiscount] = useState('15')
  const [propertyName, setPropertyName] = useState('')
  const [hostName, setHostName] = useState('')
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const generateCode = () => {
    const firstName = guestName.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '') || 'GUEST'
    return `SUPER-${firstName}${discount}`
  }

  const currentYear = new Date().getFullYear()

  const handleDownload = async (format: 'png' | 'pdf' = 'png') => {
    if (!cardRef.current || !guestName) return

    setDownloading(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true
      })

      if (format === 'pdf') {
        // Crear PDF con dimensiones de la tarjeta
        const imgWidth = 100 // mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        const pdf = new jsPDF({
          orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
          unit: 'mm',
          format: [imgWidth + 20, imgHeight + 20] // Añadir margen
        })

        const imgData = canvas.toDataURL('image/png', 1.0)
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight)
        pdf.save(`superguest-${guestName.toLowerCase().replace(/\s+/g, '-')}.pdf`)
      } else {
        const link = document.createElement('a')
        link.download = `superguest-${guestName.toLowerCase().replace(/\s+/g, '-')}.png`
        link.href = canvas.toDataURL('image/png', 1.0)
        link.click()
      }
    } catch (error) {
      console.error('Error generating image:', error)
    } finally {
      setDownloading(false)
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateCode())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (!cardRef.current || !guestName) return

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        backgroundColor: '#ffffff',
        logging: false
      })

      canvas.toBlob(async (blob) => {
        if (!blob) return

        const file = new File([blob], `superguest-${guestName}.png`, { type: 'image/png' })

        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Tu tarjeta SuperGuest',
            text: `¡Felicidades ${guestName}! Eres un SuperGuest. Usa el código ${generateCode()} para tu próximo descuento.`
          })
        } else {
          handleDownload()
        }
      })
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link
            href="/hub"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Hub
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-100 to-amber-100 text-rose-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Award className="w-4 h-4" />
            Herramienta gratuita
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Generador de Insignias SuperGuest
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Crea insignias exclusivas para tus mejores huéspedes. Fideliza, mejora tus reseñas
            y fomenta las reservas directas con un programa de reconocimiento profesional.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 lg:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-500" />
              Personaliza la insignia
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del huésped *
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Ej: María García"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tu nombre (anfitrión)
                </label>
                <input
                  type="text"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  placeholder="Ej: Alejandro"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del alojamiento
                </label>
                <input
                  type="text"
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  placeholder="Ej: Casa Sol Costa Brava"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Descuento para próxima reserva
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['10', '15', '20', '25'].map((value) => (
                    <button
                      key={value}
                      onClick={() => setDiscount(value)}
                      className={`py-3 rounded-xl font-semibold transition-all ${
                        discount === value
                          ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {value}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de descuento generado
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-gray-50 px-4 py-3 rounded-xl font-mono text-lg font-bold text-gray-900 border border-gray-200 text-center">
                    {generateCode()}
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                    title="Copiar código"
                  >
                    {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-gray-600" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleDownload('png')}
                  disabled={!guestName || downloading}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 disabled:from-gray-300 disabled:to-gray-300 text-white font-semibold py-4 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
                >
                  <Download className="w-5 h-5" />
                  {downloading ? 'Generando...' : 'PNG'}
                </button>
                <button
                  onClick={() => handleDownload('pdf')}
                  disabled={!guestName || downloading}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 disabled:from-gray-300 disabled:to-gray-300 text-white font-semibold py-4 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
                >
                  <FileText className="w-5 h-5" />
                  {downloading ? 'Generando...' : 'PDF'}
                </button>
              </div>
              <button
                onClick={handleShare}
                disabled={!guestName}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 font-medium py-3 px-6 rounded-xl border-2 border-gray-200 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                Compartir por WhatsApp
              </button>
            </div>
          </div>

          {/* Preview */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-6">Vista previa de la insignia</h2>

            {/* Card - Shield Design */}
            <div
              ref={cardRef}
              className="bg-white p-8"
              style={{ width: '400px', margin: '0 auto' }}
            >
              {/* Shield Container */}
              <div className="relative">
                {/* Shield SVG Background */}
                <svg viewBox="0 0 200 240" className="w-full h-auto">
                  {/* Shield shape with gradient */}
                  <defs>
                    <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f43f5e" />
                      <stop offset="50%" stopColor="#fb7185" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                    <linearGradient id="innerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#fef7f0" />
                    </linearGradient>
                  </defs>

                  {/* Outer shield */}
                  <path
                    d="M100 10 L190 40 L190 120 Q190 200 100 230 Q10 200 10 120 L10 40 Z"
                    fill="url(#shieldGradient)"
                  />

                  {/* Inner shield */}
                  <path
                    d="M100 20 L180 47 L180 118 Q180 190 100 218 Q20 190 20 118 L20 47 Z"
                    fill="url(#innerGradient)"
                    stroke="#fecdd3"
                    strokeWidth="1"
                  />

                  {/* Laurel left */}
                  <g fill="#d4a574" opacity="0.6">
                    <ellipse cx="40" cy="100" rx="8" ry="15" transform="rotate(-30 40 100)" />
                    <ellipse cx="35" cy="120" rx="7" ry="13" transform="rotate(-20 35 120)" />
                    <ellipse cx="33" cy="140" rx="6" ry="11" transform="rotate(-10 33 140)" />
                    <ellipse cx="35" cy="158" rx="5" ry="10" transform="rotate(0 35 158)" />
                  </g>

                  {/* Laurel right */}
                  <g fill="#d4a574" opacity="0.6">
                    <ellipse cx="160" cy="100" rx="8" ry="15" transform="rotate(30 160 100)" />
                    <ellipse cx="165" cy="120" rx="7" ry="13" transform="rotate(20 165 120)" />
                    <ellipse cx="167" cy="140" rx="6" ry="11" transform="rotate(10 167 140)" />
                    <ellipse cx="165" cy="158" rx="5" ry="10" transform="rotate(0 165 158)" />
                  </g>

                  {/* Star at top */}
                  <polygon
                    points="100,35 104,47 117,47 107,55 111,67 100,59 89,67 93,55 83,47 96,47"
                    fill="#f59e0b"
                  />
                </svg>

                {/* Content overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
                  {/* SuperGuest Title */}
                  <div className="mt-8 text-center">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-rose-400 font-medium">
                      Certificado
                    </p>
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-amber-500 tracking-tight">
                      SuperGuest
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">{currentYear}</p>
                  </div>

                  {/* Guest Name */}
                  <div className="mt-3 text-center px-6">
                    <p className="text-xl font-bold text-gray-800 leading-tight">
                      {guestName || 'Nombre del huésped'}
                    </p>
                  </div>

                  {/* Discount Badge */}
                  <div className="mt-4 bg-gradient-to-r from-rose-500 to-amber-500 rounded-full px-6 py-2">
                    <p className="text-white text-center">
                      <span className="text-2xl font-black">{discount}%</span>
                      <span className="text-xs ml-1 opacity-90">OFF</span>
                    </p>
                  </div>

                  {/* Code */}
                  <div className="mt-3">
                    <p className="text-xs text-gray-400">Código exclusivo</p>
                    <p className="font-mono font-bold text-gray-700 text-sm tracking-wide">
                      {generateCode()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer info */}
              <div className="mt-4 text-center border-t border-gray-100 pt-4">
                {propertyName && (
                  <p className="text-sm font-medium text-gray-700">{propertyName}</p>
                )}
                {hostName && (
                  <p className="text-xs text-gray-400 mt-1">Otorgado por {hostName}</p>
                )}
                <p className="text-[10px] text-gray-300 mt-2">
                  Válido para reserva directa • {currentYear}
                </p>
              </div>
            </div>

            {/* Tips */}
            <div className="mt-8 bg-gradient-to-r from-rose-50 to-amber-50 rounded-xl border border-rose-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-lg">💡</span> Cómo usarlo
              </h3>
              <ol className="text-sm text-gray-600 space-y-2">
                <li className="flex gap-2">
                  <span className="font-bold text-rose-500">1.</span>
                  Descarga la insignia tras el checkout del huésped
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-rose-500">2.</span>
                  Envíala junto con tu mensaje de agradecimiento
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-rose-500">3.</span>
                  Guarda el código para aplicar el descuento cuando te contacten
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Benefits section */}
        <div className="mt-16 bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            ¿Por qué funciona el programa SuperGuest?
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-rose-100 to-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Mejores reseñas</h3>
              <p className="text-sm text-gray-600">
                El huésped se siente valorado y reconocido. Tiene un incentivo emocional
                para dejarte una reseña de 5 estrellas.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-rose-100 to-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Reservas directas</h3>
              <p className="text-sm text-gray-600">
                El descuento solo aplica contactándote directamente. Evitas
                comisiones del 15-20% de las plataformas.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-rose-100 to-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔄</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Huéspedes recurrentes</h3>
              <p className="text-sm text-gray-600">
                Creas una relación a largo plazo con huéspedes de calidad probada
                que vuelven año tras año.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
