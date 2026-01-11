'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LeadMagnet } from '@/data/lead-magnets'
import { CheckCircle2, Download, Loader2, Mail } from 'lucide-react'
import { trackGenerateLead, trackLeadMagnetDownloaded } from '@/lib/analytics'
import { fbEvents } from '@/components/analytics/FacebookPixel'
import { PrioritySelector } from '@/components/forms/PrioritySelector'

export default function LeadMagnetForm({
  leadMagnet,
}: {
  leadMagnet: LeadMagnet
}) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [prioridades, setPrioridades] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/email/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'lead_magnet',
          metadata: {
            leadMagnetSlug: leadMagnet.slug,
            leadMagnetTitle: leadMagnet.title,
            archetype: leadMagnet.archetype,
          },
          prioridades,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al procesar la solicitud')
      }

      const data = await response.json()

      // Track analytics events
      trackGenerateLead({
        source: 'recursos',
        leadMagnet: leadMagnet.slug
      })
      trackLeadMagnetDownloaded({
        resourceName: leadMagnet.title,
        resourceType: 'guide',
        articleSlug: leadMagnet.slug
      })
      // Facebook Pixel event
      fbEvents.lead({
        content_name: leadMagnet.title,
        content_category: 'lead_magnet',
        value: 10,
        currency: 'EUR'
      })

      // Redirigir a página de gracias con enlace directo al PDF
      router.push(`/recursos/${leadMagnet.slug}/gracias`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl mb-4">
          <Download className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Descarga instantánea y gratis
        </h2>
        <p className="text-gray-600">
          Descarga inmediata + copia en tu email
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Tu email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Priority Selector */}
        <PrioritySelector
          selected={prioridades}
          onChange={setPrioridades}
          variant="compact"
        />

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Descargar guía gratis
            </>
          )}
        </button>

        {/* Trust Signals */}
        <div className="pt-4 border-t border-gray-200 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>Descarga inmediata</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>Sin spam, solo contenido de valor</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>Cancelar suscripción en cualquier momento</span>
          </div>
        </div>
      </form>

      {/* Additional Info */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Al descargar esta guía, aceptas recibir emails con recursos y consejos
          para hacer crecer tu negocio de alquiler vacacional. Puedes cancelar tu
          suscripción en cualquier momento.
        </p>
      </div>
    </div>
  )
}
