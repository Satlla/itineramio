'use client'

import Link from 'next/link'
import { XCircle } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const reason = searchParams.get('reason')

  const messages: Record<string, string> = {
    'missing-token': 'El enlace de confirmación no es válido.',
    'invalid-token': 'El enlace ha expirado o ya fue utilizado.',
    'server-error': 'Ha ocurrido un error. Por favor, inténtalo de nuevo.'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Error de confirmación
        </h1>
        <p className="text-gray-600 mb-6">
          {messages[reason || ''] || 'No se pudo confirmar tu suscripción.'}
        </p>
        <Link
          href="/blog"
          className="inline-block bg-violet-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-violet-700 transition-colors"
        >
          Volver al blog
        </Link>
      </div>
    </div>
  )
}

export default function NewsletterError() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <ErrorContent />
    </Suspense>
  )
}
