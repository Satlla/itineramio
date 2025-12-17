'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function UnsubscribeContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleUnsubscribe = async () => {
    if (!email) {
      setErrorMessage('Email no proporcionado')
      setStatus('error')
      return
    }

    setStatus('loading')

    try {
      const response = await fetch('/api/email/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
      } else {
        setErrorMessage(data.error || 'Error al procesar la solicitud')
        setStatus('error')
      }
    } catch (error) {
      setErrorMessage('Error de conexion. Intenta de nuevo.')
      setStatus('error')
    }
  }

  if (!email) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">!</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Enlace invalido
          </h1>
          <p className="text-gray-600 mb-6">
            El enlace de baja no contiene un email valido.
            Si necesitas ayuda, contactanos en hola@itineramio.com
          </p>
          <Link
            href="/"
            className="inline-block bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition-colors"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-green-500 text-5xl mb-4">&#10003;</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Te has dado de baja
          </h1>
          <p className="text-gray-600 mb-6">
            Ya no recibiras mas emails de nuestra parte.
            Lamentamos verte partir.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Si cambias de opinion, siempre puedes volver a suscribirte
            completando nuestro quiz de anfitriones.
          </p>
          <Link
            href="/"
            className="inline-block bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition-colors"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Darse de baja
        </h1>
        <p className="text-gray-600 mb-2">
          Vas a cancelar tu suscripcion para:
        </p>
        <p className="font-semibold text-gray-900 mb-6 break-all">
          {email}
        </p>

        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {errorMessage}
          </div>
        )}

        <p className="text-sm text-gray-500 mb-6">
          Ya no recibiras emails de la secuencia de Itineramio.
          Puedes volver a suscribirte en cualquier momento.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleUnsubscribe}
            disabled={status === 'loading'}
            className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Procesando...' : 'Confirmar baja'}
          </button>

          <Link
            href="/"
            className="block w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  )
}
