'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Mail, Loader2, ArrowRight } from 'lucide-react'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [resending, setResending] = useState(false)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setErrorMessage('Token de verificación no encontrado')
      return
    }

    verifyEmail(token)
  }, [token])

  async function verifyEmail(token: string) {
    try {
      const response = await fetch('/api/academia/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/academia/login?verified=true')
        }, 3000)
      } else {
        setStatus('error')
        setErrorMessage(data.error || 'Error al verificar el email')
      }
    } catch (error) {
      setStatus('error')
      setErrorMessage('Error al conectar con el servidor')
    }
  }

  async function handleResend() {
    setResending(true)
    try {
      const response = await fetch('/api/academia/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user-email' }) // You'll need to get this from somewhere
      })

      if (response.ok) {
        alert('Email de verificación reenviado exitosamente')
      } else {
        alert('Error al reenviar el email')
      }
    } catch (error) {
      alert('Error al conectar con el servidor')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Academia Itineramio</h1>
          </div>

          {/* Loading State */}
          {status === 'loading' && (
            <div>
              <Loader2 className="w-16 h-16 text-violet-600 animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verificando tu email...
              </h2>
              <p className="text-gray-600">
                Por favor espera mientras verificamos tu dirección de email
              </p>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Email verificado! ✨
              </h2>
              <p className="text-gray-600 mb-6">
                Tu cuenta ha sido verificada exitosamente. Serás redirigido al inicio de sesión en unos segundos...
              </p>
              <Link
                href="/academia/login?verified=true"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all"
              >
                Ir al inicio de sesión
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Error al verificar
              </h2>
              <p className="text-gray-600 mb-6">
                {errorMessage}
              </p>

              <div className="space-y-3">
                <p className="text-sm text-gray-500 mb-4">
                  El enlace puede haber expirado o ser inválido. Los enlaces de verificación expiran después de 24 horas.
                </p>

                <Link
                  href="/academia/register"
                  className="block w-full px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all"
                >
                  Volver a registrarse
                </Link>

                <Link
                  href="/academia/login"
                  className="block w-full px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all"
                >
                  Ir al inicio de sesión
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Help text */}
        <p className="text-center text-sm text-gray-600 mt-6">
          ¿Necesitas ayuda?{' '}
          <Link href="/help" className="text-violet-600 hover:text-violet-700 font-medium">
            Contacta con soporte
          </Link>
        </p>
      </div>
    </div>
  )
}
