'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Star, Download, Mail, Phone, User, ArrowLeft, Check, Loader2, QrCode } from 'lucide-react'
import { fbEvents } from '@/components/analytics/FacebookPixel'

export default function PlantillaReviewsPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/recursos/plantilla-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al enviar')
      }

      // Facebook Pixel Lead event
      fbEvents.lead({
        content_name: 'Plantilla Reviews',
        content_category: 'recurso-gratuito',
        value: 0,
        currency: 'EUR'
      })

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar')
    } finally {
      setLoading(false)
    }
  }

  const formatPhoneForWhatsApp = (phone: string) => {
    // Remove spaces and special chars, keep + and digits
    return phone.replace(/[^\d+]/g, '')
  }

  const whatsappUrl = formData.telefono
    ? `https://wa.me/${formatPhoneForWhatsApp(formData.telefono)}?text=Hola%2C%20tengo%20una%20pregunta%20sobre%20mi%20estancia`
    : ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href="/recursos"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a recursos
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-700 rounded-full px-4 py-2 mb-6">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium">Plantilla Personalizable</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Guía Rápida de Reseñas
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Plantilla PRO para educar a tus huéspedes sobre el sistema de valoraciones de Airbnb.
            Personaliza con el nombre de tu alojamiento y QR de WhatsApp.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Personaliza tu plantilla
            </h2>

            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  ¡Enviado!
                </h3>
                <p className="text-gray-600 mb-4">
                  Revisa tu correo electrónico. Te hemos enviado la plantilla personalizada con tu QR de WhatsApp.
                </p>
                <p className="text-sm text-gray-500">
                  Si no lo ves, revisa la carpeta de spam.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Tu nombre o nombre del alojamiento
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej: María García o Apartamento Sol"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Teléfono de WhatsApp (con prefijo)
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="Ej: +34 612 345 678"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Incluye el prefijo del país (ej: +34 para España)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Tu email (donde enviamos la plantilla)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="tu@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-rose-500 to-orange-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-rose-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Recibir plantilla por email
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Al enviar, aceptas recibir la plantilla y ocasionalmente contenido útil para anfitriones.
                  Sin spam, puedes darte de baja en cualquier momento.
                </p>
              </form>
            )}
          </div>

          {/* Preview - Diseño idéntico a la plantilla de descarga */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
              Vista previa de la plantilla
            </h3>

            <div className="bg-white border border-gray-200 shadow-sm">
              {/* Header con nombre del alojamiento */}
              <div className="px-5 pt-4 pb-3 border-b border-gray-100">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Alojamiento</p>
                <p className="text-base font-semibold text-gray-900 mb-2">{formData.nombre || 'Tu Alojamiento'}</p>
                <h4 className="text-lg font-semibold text-gray-900">Guía rápida de reseñas</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">Tu opinión ayuda a futuros viajeros y nos permite mejorar.</p>
              </div>

              {/* Contexto */}
              <div className="px-5 py-2.5 bg-gray-50">
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  En Airbnb, las estrellas se interpretan distinto. <strong className="text-gray-900">5 estrellas</strong> = la estancia fue buena y cumplió lo prometido.
                </p>
              </div>

              {/* Antes de valorar */}
              <div className="px-5 py-2.5 border-b border-gray-100">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-900 mb-0.5">Antes de valorar</p>
                <p className="text-[11px] text-gray-600">
                  Si algo no estuvo perfecto, cuéntanoslo. La mayoría de incidencias se resuelven rápido.
                </p>
              </div>

              {/* Escala de estrellas */}
              <div className="px-5 py-2.5">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-900 mb-1.5">Escala orientativa</p>
                <table className="w-full text-[11px]">
                  <tbody>
                    <tr className="border-b border-gray-50">
                      <td className="py-1 w-16 text-gray-900">★★★★★</td>
                      <td className="py-1 text-gray-600">Todo según lo descrito, experiencia buena.</td>
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="py-1 w-16"><span className="text-gray-900">★★★★</span><span className="text-gray-300">★</span></td>
                      <td className="py-1 text-gray-600">Algún aspecto importante no cumplió expectativas.</td>
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="py-1 w-16"><span className="text-gray-900">★★★</span><span className="text-gray-300">★★</span></td>
                      <td className="py-1 text-gray-600">Varios problemas relevantes afectaron la estancia.</td>
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="py-1 w-16"><span className="text-gray-900">★★</span><span className="text-gray-300">★★★</span></td>
                      <td className="py-1 text-gray-600">Incidencias graves o deficiencias importantes.</td>
                    </tr>
                    <tr>
                      <td className="py-1 w-16"><span className="text-gray-900">★</span><span className="text-gray-300">★★★★</span></td>
                      <td className="py-1 text-gray-600">Experiencia inaceptable.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Nota de transparencia */}
              <div className="px-5 py-1.5 bg-gray-50 border-t border-gray-100">
                <p className="text-[9px] text-gray-400 italic">
                  Valora con honestidad. Esta guía solo aclara el significado habitual de las estrellas.
                </p>
              </div>

              {/* Caja de contacto */}
              <div className="px-5 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-900 mb-0.5">¿Necesitas ayuda?</p>
                    <p className="text-[11px] text-gray-600 mb-0.5">Escríbenos y lo resolvemos.</p>
                    <p className="text-sm font-medium text-gray-900">{formData.telefono || '+34 600 000 000'}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-gray-100 rounded flex items-center justify-center">
                      {formData.telefono ? (
                        <QrCode className="w-10 h-10 text-gray-400" />
                      ) : (
                        <span className="text-[8px] text-gray-400 text-center">QR</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-gray-900 text-sm mb-2">
                ¿Qué recibirás?
              </h4>
              <ul className="text-gray-600 text-sm space-y-1">
                <li>✓ Plantilla PDF lista para imprimir</li>
                <li>✓ Tu nombre de alojamiento personalizado</li>
                <li>✓ Código QR de tu WhatsApp</li>
                <li>✓ Diseño profesional A4</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Article link */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-2">
            ¿Quieres saber más sobre el sistema de estrellas de Airbnb?
          </p>
          <Link
            href="/blog/plantilla-significado-estrellas-airbnb-huespedes"
            className="text-rose-600 hover:text-rose-700 font-medium"
          >
            Lee el artículo completo →
          </Link>
        </div>
      </div>
    </div>
  )
}
