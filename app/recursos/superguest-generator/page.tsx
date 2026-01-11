'use client'

import { useState, useRef } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Download, Share2, Copy, Check, Sparkles } from 'lucide-react'
import html2canvas from 'html2canvas'

export default function SuperGuestGeneratorPage() {
  const [guestName, setGuestName] = useState('')
  const [discount, setDiscount] = useState('15')
  const [propertyName, setPropertyName] = useState('')
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const generateCode = () => {
    const firstName = guestName.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '') || 'GUEST'
    return `SUPER-${firstName}${discount}`
  }

  const handleDownload = async () => {
    if (!cardRef.current || !guestName) return

    setDownloading(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false
      })

      const link = document.createElement('a')
      link.download = `superguest-${guestName.toLowerCase().replace(/\s+/g, '-')}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
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
        scale: 2,
        backgroundColor: null,
        logging: false
      })

      canvas.toBlob(async (blob) => {
        if (!blob) return

        const file = new File([blob], `superguest-${guestName}.png`, { type: 'image/png' })

        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Tu tarjeta SuperGuest',
            text: `Felicidades ${guestName}! Eres un SuperGuest. Usa el codigo ${generateCode()} para tu proximo descuento.`
          })
        } else {
          // Fallback: download
          handleDownload()
        }
      })
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href="/recursos"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Recursos
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Herramienta gratuita
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Generador de Tarjetas SuperGuest
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Crea tarjetas personalizadas para tus huéspedes ejemplares. Fideliza, consigue mejores reseñas
            y fomenta las reservas directas.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Personaliza la tarjeta</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del huésped *
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Ej: María García"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de tu alojamiento (opcional)
                </label>
                <input
                  type="text"
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  placeholder="Ej: White Coast Suite"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Porcentaje de descuento
                </label>
                <div className="flex gap-2">
                  {['10', '15', '20', '25'].map((value) => (
                    <button
                      key={value}
                      onClick={() => setDiscount(value)}
                      className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                        discount === value
                          ? 'bg-amber-500 text-white'
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
                  Código generado
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-gray-50 px-4 py-3 rounded-lg font-mono text-gray-900 border border-gray-200">
                    {generateCode()}
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Copiar código"
                  >
                    {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-gray-600" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
              <button
                onClick={handleDownload}
                disabled={!guestName || downloading}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                <Download className="w-5 h-5" />
                {downloading ? 'Generando...' : 'Descargar imagen'}
              </button>
              <button
                onClick={handleShare}
                disabled={!guestName}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 font-medium py-3 px-6 rounded-xl border border-gray-200 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                Compartir por WhatsApp
              </button>
            </div>
          </div>

          {/* Preview */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Vista previa</h2>

            {/* Card */}
            <div
              ref={cardRef}
              className="bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 rounded-2xl p-1.5"
            >
              <div className="bg-white rounded-xl p-6 text-center">
                <div className="text-4xl mb-2">🏆</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">SuperGuest</h3>
                <p className="text-sm text-gray-500 mb-4">Certificado de Huésped Ejemplar</p>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-gray-500 text-sm">Felicidades</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {guestName || 'Nombre del huésped'}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <p className="text-amber-700 text-sm">Tu descuento exclusivo</p>
                  <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
                    {discount}%
                  </p>
                  <p className="text-amber-700 text-sm">en tu próxima reserva</p>
                </div>

                <div className="text-sm text-gray-500 space-y-1">
                  <p>
                    Código: <span className="font-mono font-bold text-gray-900">{generateCode()}</span>
                  </p>
                  {propertyName && (
                    <p className="text-xs">en {propertyName}</p>
                  )}
                  <p className="text-xs mt-2">Válido contactando directamente</p>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-2">Cómo usar la tarjeta</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>1. Descarga la imagen generada</li>
                <li>2. Envíala por WhatsApp o mensaje de Airbnb</li>
                <li>3. Guarda el código para aplicar el descuento cuando te contacten</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Info section */}
        <div className="mt-12 bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            ¿Por qué usar el programa SuperGuest?
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div>
              <div className="text-2xl mb-2">⭐</div>
              <h3 className="font-medium text-gray-900 mb-1">Mejores reseñas</h3>
              <p className="text-sm text-gray-600">
                El huésped se siente valorado y tiene un incentivo emocional para dejarte una buena reseña.
              </p>
            </div>
            <div>
              <div className="text-2xl mb-2">💰</div>
              <h3 className="font-medium text-gray-900 mb-1">Reservas directas</h3>
              <p className="text-sm text-gray-600">
                El descuento solo es válido contactando directamente, evitando comisiones de plataformas.
              </p>
            </div>
            <div>
              <div className="text-2xl mb-2">🤝</div>
              <h3 className="font-medium text-gray-900 mb-1">Fidelización</h3>
              <p className="text-sm text-gray-600">
                Creas una relación a largo plazo con huéspedes de calidad que vuelven.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
