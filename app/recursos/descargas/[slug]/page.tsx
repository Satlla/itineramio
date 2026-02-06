'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Gift,
  Loader2,
  Check,
  Mail,
  Home,
  Settings,
  Target,
  MessageSquare,
  ArrowLeft
} from 'lucide-react'
import { getFunnelResource, FORM_OPTIONS, type FunnelResource } from '@/data/funnel-resources'

export default function FunnelResourcePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string

  // Get resource synchronously - no useEffect needed
  const resource = useMemo(() => getFunnelResource(slug), [slug])

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Initialize from URL params
  const initialEmail = searchParams.get('email') || ''
  const sourceEmail = searchParams.get('src') || null  // e.g., 'email1', 'email2'
  const sourceLevel = searchParams.get('level') || null // e.g., '1', '2'

  const [formData, setFormData] = useState({
    email: initialEmail,
    propiedades: '',
    automatizacion: '',
    intereses: [] as string[],
    comentario: ''
  })

  // Update email if URL param changes
  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam && emailParam !== formData.email) {
      setFormData(prev => ({ ...prev, email: emailParam }))
    }
  }, [searchParams])

  const handleInteresToggle = (id: string) => {
    setFormData(prev => ({
      ...prev,
      intereses: prev.intereses.includes(id)
        ? prev.intereses.filter(i => i !== id)
        : [...prev.intereses, id]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/recursos/descargas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          resourceSlug: slug,
          // Tracking params
          sourceEmail,
          sourceLevel
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al enviar')
      }

      // Track conversion
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'funnel_form_completed', {
          event_category: 'conversion',
          event_label: slug,
          value: formData.propiedades === '10+' ? 100 :
                 formData.propiedades === '6-10' ? 50 :
                 formData.propiedades === '4-5' ? 30 : 10
        })
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar')
    } finally {
      setLoading(false)
    }
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Recurso no encontrado</p>
          <Link href="/hub" className="text-rose-600 hover:underline">
            Volver al hub de recursos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* noindex for search engines */}
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Minimal header */}
        <div className="bg-white border-b">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Itineramio
            </Link>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-12">
          {success ? (
            /* Success State */
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                ¡Revisa tu email!
              </h1>
              <p className="text-gray-600 mb-6">
                Te hemos enviado <strong>{resource.resourceName}</strong> a<br />
                <span className="text-gray-900 font-medium">{formData.email}</span>
              </p>
              <p className="text-sm text-gray-500 mb-8">
                Si no lo ves en unos minutos, revisa la carpeta de spam.
              </p>

              <div className="bg-gray-50 rounded-xl p-6 text-left">
                <p className="text-sm text-gray-600 mb-3">
                  <strong>¿Qué sigue?</strong>
                </p>
                <p className="text-sm text-gray-600">
                  En los próximos días te enviaré más contenido útil para reducir
                  el tiempo que dedicas a gestionar tus propiedades. Estate atento.
                </p>
              </div>
            </div>
          ) : (
            /* Form State */
            <>
              {/* Hero */}
              <div className="text-center mb-8">
                <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${resource.theme.gradient} text-white rounded-full px-4 py-2 mb-6`}>
                  <Gift className="w-4 h-4" />
                  <span className="text-sm font-medium">Recurso Gratis</span>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {resource.title}
                </h1>
                <p className="text-xl text-gray-500 mb-4">
                  {resource.subtitle}
                </p>
                <p className="text-gray-600 max-w-lg mx-auto">
                  {resource.description}
                </p>
              </div>

              {/* What they get */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-r ${resource.theme.gradient} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Gift className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{resource.resourceName}</p>
                    <p className="text-sm text-gray-600">{resource.resourceDescription}</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">

                  {/* Email */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4" />
                      Tu email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="tu@email.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Aquí te enviamos el recurso
                    </p>
                  </div>

                  {/* Propiedades */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                      <Home className="w-4 h-4" />
                      ¿Cuántas propiedades gestionas?
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {FORM_OPTIONS.propiedades.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, propiedades: option.value })}
                          className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                            formData.propiedades === option.value
                              ? 'border-rose-500 bg-rose-50 text-rose-700'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Automatización */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                      <Settings className="w-4 h-4" />
                      ¿Tienes algo automatizado actualmente?
                    </label>
                    <div className="space-y-2">
                      {FORM_OPTIONS.automatizacion.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, automatizacion: option.value })}
                          className={`w-full px-4 py-3 rounded-lg border text-sm text-left transition-all ${
                            formData.automatizacion === option.value
                              ? 'border-rose-500 bg-rose-50 text-rose-700'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Intereses */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                      <Target className="w-4 h-4" />
                      ¿Qué te quita más tiempo? <span className="text-gray-400 font-normal">(selecciona los que apliquen)</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {FORM_OPTIONS.intereses.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handleInteresToggle(option.id)}
                          className={`px-4 py-3 rounded-lg border text-sm text-left transition-all flex items-center gap-2 ${
                            formData.intereses.includes(option.id)
                              ? 'border-rose-500 bg-rose-50 text-rose-700'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <span>{option.icon}</span>
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comentario */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <MessageSquare className="w-4 h-4" />
                      ¿Algo más que quieras contarnos? <span className="text-gray-400 font-normal">(opcional)</span>
                    </label>
                    <textarea
                      value={formData.comentario}
                      onChange={(e) => setFormData({ ...formData, comentario: e.target.value })}
                      placeholder="Tu mayor frustración, una pregunta, lo que sea..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading || !formData.email || !formData.propiedades || !formData.automatizacion}
                    className={`w-full py-4 bg-gradient-to-r ${resource.theme.gradient} text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Gift className="w-5 h-5" />
                        Enviarme el recurso gratis
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    Al enviar, aceptas recibir el recurso y contenido ocasional para anfitriones.
                    Sin spam, puedes darte de baja en cualquier momento.
                  </p>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
