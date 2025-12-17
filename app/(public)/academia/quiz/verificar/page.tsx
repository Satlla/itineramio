'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react'

interface VerificationResult {
  success: boolean
  message?: string
  error?: string
  alreadyVerified?: boolean
  lead?: {
    email: string
    fullName: string | null
    score: number
    level: string
  }
}

export default function VerificarEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<VerificationResult | null>(null)

  useEffect(() => {
    if (!token) {
      setResult({
        success: false,
        error: 'No se proporcionó un token de verificación'
      })
      setLoading(false)
      return
    }

    // Call verification API
    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/academia/quiz/verificar?token=${token}`)
        const data = await response.json()

        setResult(data)
      } catch (error) {
        console.error('Verification error:', error)
        setResult({
          success: false,
          error: 'Error al verificar el email. Por favor, intenta de nuevo.'
        })
      } finally {
        setLoading(false)
      }
    }

    verifyEmail()
  }, [token])

  // Level colors and labels
  const levelConfig = {
    'BASIC': { label: 'Principiante', color: 'text-green-600', bg: 'bg-green-50', badge: '🌱' },
    'INTERMEDIATE': { label: 'Intermedio', color: 'text-orange-600', bg: 'bg-orange-50', badge: '🔥' },
    'ADVANCED': { label: 'Avanzado', color: 'text-purple-600', bg: 'bg-purple-50', badge: '⭐' }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">

          {/* Loading state */}
          {loading && (
            <div className="text-center py-12">
              <Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Verificando tu email...
              </h2>
              <p className="text-gray-600">
                Por favor espera un momento
              </p>
            </div>
          )}

          {/* Success state */}
          {!loading && result?.success && (
            <div className="text-center">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {result.alreadyVerified ? '¡Email ya verificado!' : '¡Email verificado con éxito!'}
              </h1>

              <p className="text-lg text-gray-600 mb-8">
                {result.alreadyVerified
                  ? 'Tu email ya fue verificado anteriormente.'
                  : 'Gracias por confirmar tu dirección de email.'}
              </p>

              {/* Show results if available */}
              {result.lead && (
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Tus resultados del quiz
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4">
                      <div className="text-4xl font-bold text-purple-600 mb-1">
                        {result.lead.score}
                      </div>
                      <div className="text-sm text-gray-600">
                        Puntos totales
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="text-2xl font-bold mb-1">
                        {levelConfig[result.lead.level as keyof typeof levelConfig]?.badge}
                      </div>
                      <div className={`text-sm font-semibold ${levelConfig[result.lead.level as keyof typeof levelConfig]?.color}`}>
                        Nivel {levelConfig[result.lead.level as keyof typeof levelConfig]?.label}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-center gap-2 text-gray-700">
                      <Mail className="w-5 h-5" />
                      <span className="text-sm">
                        Hemos enviado tus resultados completos a <strong>{result.lead.email}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <Link
                  href="/academia/registro"
                  className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Crear mi cuenta en la Academia
                </Link>

                <Link
                  href="/"
                  className="block w-full text-gray-600 hover:text-gray-800 font-medium py-2 transition-colors"
                >
                  Volver al inicio
                </Link>
              </div>
            </div>
          )}

          {/* Error state */}
          {!loading && !result?.success && (
            <div className="text-center">
              <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Error al verificar email
              </h1>

              <p className="text-lg text-gray-600 mb-8">
                {result?.error || 'Ocurrió un error al verificar tu email'}
              </p>

              <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
                <p className="text-sm text-red-800">
                  {result?.error?.includes('expirado')
                    ? 'El enlace de verificación ha expirado. Por favor, completa el quiz nuevamente para recibir un nuevo enlace.'
                    : 'Si el problema persiste, por favor completa el quiz nuevamente.'}
                </p>
              </div>

              <div className="space-y-4">
                <Link
                  href="/academia/quiz"
                  className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Volver al quiz
                </Link>

                <Link
                  href="/"
                  className="block w-full text-gray-600 hover:text-gray-800 font-medium py-2 transition-colors"
                >
                  Volver al inicio
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
