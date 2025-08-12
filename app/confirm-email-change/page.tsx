'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader2, Mail, AlertTriangle } from 'lucide-react'

function ConfirmEmailChangeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [newEmail, setNewEmail] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Token no válido. Por favor, verifica el enlace.')
      return
    }

    confirmEmailChange()
  }, [token])

  const confirmEmailChange = async () => {
    try {
      const response = await fetch('/api/account/confirm-email-change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message || 'Email actualizado correctamente')
        setNewEmail(data.newEmail || '')
        
        // Redirect to login after 5 seconds
        setTimeout(() => {
          router.push('/login')
        }, 5000)
      } else {
        setStatus('error')
        setMessage(data.error || 'Error al confirmar el cambio de email')
      }
    } catch (error) {
      console.error('Error:', error)
      setStatus('error')
      setMessage('Error de conexión. Por favor, intenta nuevamente.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Loading State */}
          {status === 'loading' && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Confirmando cambio de email
              </h1>
              <p className="text-gray-600">
                Por favor, espera mientras procesamos tu solicitud...
              </p>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4"
              >
                <CheckCircle className="w-8 h-8 text-green-600" />
              </motion.div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Email actualizado!
              </h1>
              
              <p className="text-gray-600 mb-6">
                {message}
              </p>

              {newEmail && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700 font-medium">{newEmail}</span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <p className="text-sm text-gray-500">
                  Serás redirigido al inicio de sesión en 5 segundos...
                </p>
                
                <button
                  onClick={() => router.push('/login')}
                  className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                >
                  Ir a iniciar sesión
                </button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex gap-2">
                  <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Importante:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Usa tu nuevo email para iniciar sesión</li>
                      <li>• Tu contraseña sigue siendo la misma</li>
                      <li>• Has recibido confirmación en ambos emails</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4"
              >
                <XCircle className="w-8 h-8 text-red-600" />
              </motion.div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Error al confirmar
              </h1>
              
              <p className="text-gray-600 mb-6">
                {message}
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => router.push('/account')}
                  className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                >
                  Ir a mi cuenta
                </button>
                
                <button
                  onClick={() => router.push('/login')}
                  className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  Iniciar sesión
                </button>
              </div>

              <div className="mt-6 text-sm text-gray-500">
                <p>¿Necesitas ayuda?</p>
                <a href="/contact" className="text-purple-600 hover:text-purple-700 font-medium">
                  Contactar soporte
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Logo */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Itineramio
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default function ConfirmEmailChangePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Cargando...
            </h1>
          </div>
        </div>
      </div>
    }>
      <ConfirmEmailChangeContent />
    </Suspense>
  )
}