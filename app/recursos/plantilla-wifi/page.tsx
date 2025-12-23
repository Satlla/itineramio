'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Wifi, Download, Mail, User, ArrowLeft, Check, Loader2, QrCode, Lock } from 'lucide-react'
import { fbEvents } from '@/components/analytics/FacebookPixel'

export default function PlantillaWifiPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    nombreRed: '',
    password: '',
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
      const response = await fetch('/api/recursos/plantilla-wifi', {
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
        content_name: 'Plantilla WiFi',
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
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
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-4 py-2 mb-6">
            <Wifi className="w-4 h-4" />
            <span className="text-sm font-medium">Plantilla Personalizable</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Tarjeta WiFi Profesional
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Plantilla elegante con los datos de tu WiFi y un QR para que tus huéspedes
            se conecten automáticamente. Solo escanear y listo.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Personaliza tu tarjeta WiFi
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
                  Revisa tu correo electrónico. Te hemos enviado la tarjeta WiFi
                  personalizada con el código QR.
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
                    Nombre del alojamiento
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej: Apartamento Sol y Mar"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Wifi className="w-4 h-4 inline mr-2" />
                    Nombre de la red WiFi (SSID)
                  </label>
                  <input
                    type="text"
                    value={formData.nombreRed}
                    onChange={(e) => setFormData({ ...formData, nombreRed: e.target.value })}
                    placeholder="Ej: ApartamentoSol_5G"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Contraseña WiFi
                  </label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Ej: MiClave2024"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    La contraseña se usa para generar el QR. No almacenamos esta información.
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Recibir tarjeta por email
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

          {/* Preview */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
              Vista previa
            </h3>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Wifi className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/80 text-xs">WiFi del alojamiento</p>
                    <p className="text-white font-semibold">
                      {formData.nombre || 'Tu alojamiento'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <div className="flex items-start gap-6">
                  {/* QR Code */}
                  <div className="flex-shrink-0">
                    <div className="w-28 h-28 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                      <QrCode className="w-16 h-16 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Escanea para conectar
                    </p>
                  </div>

                  {/* WiFi Details */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Red</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formData.nombreRed || 'NombreDeRed'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Contraseña</p>
                      <p className="text-lg font-mono font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded inline-block">
                        {formData.password || '••••••••'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="bg-gray-50 px-6 py-3 border-t">
                <p className="text-xs text-gray-500 text-center">
                  Escanea el QR con tu cámara para conectarte automáticamente
                </p>
              </div>
            </div>

            <div className="mt-4 bg-blue-50 rounded-xl p-4">
              <h4 className="font-medium text-blue-900 text-sm mb-2">
                ¿Qué recibirás?
              </h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>✓ Tarjeta WiFi lista para imprimir</li>
                <li>✓ Código QR funcional para conectar</li>
                <li>✓ Diseño profesional minimalista</li>
                <li>✓ Perfecto para enmarcar o plastificar</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
