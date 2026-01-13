'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, Share2, Copy, Check, Sparkles, Award, FileText, Mail, Loader2, CheckCircle } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export default function SuperGuestGeneratorPage() {
  const [guestName, setGuestName] = useState('')
  const [discount, setDiscount] = useState('15')
  const [propertyName, setPropertyName] = useState('')
  const [hostName, setHostName] = useState('')
  const [email, setEmail] = useState('')
  const [format, setFormat] = useState<'png' | 'pdf'>('png')
  const [copied, setCopied] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const cardRef = useRef<HTMLDivElement>(null)

  const generateCode = () => {
    const firstName = guestName.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '') || 'GUEST'
    return `SUPER-${firstName}${discount}`
  }

  const currentYear = new Date().getFullYear()

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateCode())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSendByEmail = async () => {
    if (!cardRef.current || !guestName || !email) return

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Por favor, introduce un email válido')
      return
    }

    setSending(true)
    setError('')

    try {
      // Generate image with transparent background for PNG
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        backgroundColor: format === 'png' ? null : '#ffffff', // Transparent for PNG
        logging: false,
        useCORS: true,
        allowTaint: true
      })

      let fileData: string

      if (format === 'pdf') {
        // Generate PDF
        const imgWidth = 100 // mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: [imgWidth + 20, imgHeight + 20]
        })

        const imgData = canvas.toDataURL('image/png', 1.0)
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight)
        // Get base64 directly without the data URI prefix issues
        const pdfBase64 = pdf.output('datauristring').split(',')[1]
        fileData = 'data:application/pdf;base64,' + pdfBase64
      } else {
        // PNG with transparency
        fileData = canvas.toDataURL('image/png', 1.0)
      }

      // Send to API
      const response = await fetch('/api/recursos/superguest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          hostName: hostName || 'Anfitrión',
          propertyName: propertyName || '',
          guestName,
          discount,
          code: generateCode(),
          fileData,
          format
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar')
      }

      setSent(true)
    } catch (err) {
      console.error('Error sending email:', err)
      setError('Error al enviar el email. Inténtalo de nuevo.')
    } finally {
      setSending(false)
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

              {/* Email field */}
              <div className="pt-4 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tu email (para recibir la insignia) *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="tu@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                />
                {error && (
                  <p className="mt-2 text-sm text-red-600">{error}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            {sent ? (
              <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  ¡Insignia enviada!
                </h3>
                <p className="text-green-700 text-sm mb-4">
                  Hemos enviado la insignia SuperGuest a <strong>{email}</strong>
                </p>
                <button
                  onClick={() => {
                    setSent(false)
                    setGuestName('')
                    setEmail('')
                  }}
                  className="text-green-600 hover:text-green-700 text-sm font-medium underline"
                >
                  Crear otra insignia
                </button>
              </div>
            ) : (
              <div className="mt-8 space-y-4">
                {/* Format selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Formato de la insignia
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setFormat('png')}
                      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
                        format === 'png'
                          ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Download className="w-4 h-4" />
                      PNG (transparente)
                    </button>
                    <button
                      onClick={() => setFormat('pdf')}
                      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
                        format === 'pdf'
                          ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      PDF
                    </button>
                  </div>
                </div>

                {/* Primary CTA - Send by email */}
                <button
                  onClick={handleSendByEmail}
                  disabled={!guestName || !email || sending}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 disabled:from-gray-300 disabled:to-gray-300 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      Recibir insignia por email
                    </>
                  )}
                </button>
              </div>
            )}
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
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '16px' }}>
                  {/* SuperGuest Title */}
                  <div style={{ marginTop: '32px', textAlign: 'center' }}>
                    <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#fb7185', fontWeight: 500, margin: 0 }}>
                      Certificado
                    </p>
                    <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#f43f5e', letterSpacing: '-0.025em', margin: '4px 0 0 0' }}>
                      SuperGuest
                    </h3>
                    <p style={{ fontSize: '10px', color: '#9ca3af', margin: '2px 0 0 0' }}>{currentYear}</p>
                  </div>

                  {/* Guest Name */}
                  <div style={{ marginTop: '12px', textAlign: 'center', padding: '0 24px' }}>
                    <p style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937', lineHeight: 1.25, margin: 0 }}>
                      {guestName || 'Nombre del huésped'}
                    </p>
                  </div>

                  {/* Discount Badge */}
                  <div style={{ marginTop: '16px', background: 'linear-gradient(to right, #f43f5e, #f59e0b)', borderRadius: '9999px', padding: '8px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '24px', fontWeight: 900, color: 'white', lineHeight: 1 }}>{discount}%</span>
                    <span style={{ fontSize: '12px', marginLeft: '4px', color: 'white', opacity: 0.9, lineHeight: 1 }}>OFF</span>
                  </div>

                  {/* Code */}
                  <div style={{ marginTop: '12px', textAlign: 'center' }}>
                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Código exclusivo</p>
                    <p style={{ fontFamily: 'monospace', fontWeight: 700, color: '#374151', fontSize: '14px', letterSpacing: '0.05em', margin: '4px 0 0 0' }}>
                      {generateCode()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer info */}
              <div style={{ marginTop: '16px', textAlign: 'center', borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
                {propertyName && (
                  <p style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>{propertyName}</p>
                )}
                {hostName && (
                  <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>Otorgado por {hostName}</p>
                )}
                <p style={{ fontSize: '10px', color: '#d1d5db', marginTop: '8px' }}>
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
