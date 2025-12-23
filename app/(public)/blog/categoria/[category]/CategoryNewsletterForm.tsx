'use client'

import { useState } from 'react'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { fbEvents } from '@/components/analytics/FacebookPixel'

interface CategoryNewsletterFormProps {
  category: string
  categoryName: string
}

export default function CategoryNewsletterForm({ category, categoryName }: CategoryNewsletterFormProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setStatus('error')
      setMessage('Por favor ingresa tu email')
      return
    }

    setStatus('loading')

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          name,
          source: `blog-categoria-${category}`,
          categories: [category]
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Facebook Pixel Lead event
        fbEvents.lead({
          content_name: `Newsletter ${categoryName}`,
          content_category: 'blog-newsletter',
          value: 0,
          currency: 'EUR'
        })

        setStatus('success')
        setMessage('¡Suscripción exitosa! Revisa tu email.')
        setEmail('')
        setName('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Error al suscribirse')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Error de conexión. Intenta de nuevo.')
    }
  }

  if (status === 'success') {
    return (
      <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-serif font-bold text-green-900 mb-1">
              ¡Gracias por suscribirte!
            </h3>
            <p className="text-sm text-green-700">
              Revisa tu email para confirmar tu suscripción a {categoryName}.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">
        Recibe consejos de {categoryName}
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Únete a nuestra lista y recibe contenido exclusivo sobre {categoryName.toLowerCase()} directo a tu email.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Tu nombre (opcional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={status === 'loading'}
          className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        />

        <input
          type="email"
          placeholder="Tu email *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'loading'}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        />

        {status === 'error' && (
          <div className="flex items-center space-x-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{message}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Suscribiendo...
            </>
          ) : (
            'Suscribirme'
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          Sin spam. Prueba 15 días sin compromiso.
        </p>
      </form>
    </div>
  )
}
