'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { 
  Mail, 
  ArrowRight, 
  RefreshCw,
  CheckCircle,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { useRouter, useSearchParams } from 'next/navigation'

function VerifyRequiredContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    const email = searchParams.get('email')
    if (email) {
      setUserEmail(decodeURIComponent(email))
    }
  }, [searchParams])

  const resendVerificationEmail = async () => {
    if (!userEmail) return

    setIsResending(true)
    setResendSuccess(false)

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      })

      if (response.ok) {
        setResendSuccess(true)
      }
    } catch (error) {
      console.error('Error resending verification email:', error)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Itineramio
              </span>
            </motion.div>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            {/* Icon */}
            <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-violet-600" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Verifica tu email
            </h1>

            <p className="text-gray-600 mb-6">
              Te hemos enviado un email de verificación. Por favor, revisa tu bandeja de entrada 
              y haz clic en el enlace para activar tu cuenta.
            </p>

            {/* Email Input for Resend */}
            <div className="mb-6">
              <input
                type="email"
                placeholder="Ingresa tu email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            {/* Success Message */}
            {resendSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-700">
                    ¡Email enviado! Revisa tu bandeja de entrada.
                  </span>
                </div>
              </div>
            )}

            {/* Resend Button */}
            <Button
              onClick={resendVerificationEmail}
              disabled={isResending || !userEmail}
              className="w-full mb-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
              loading={isResending}
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  Reenviar email
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>

            {/* Tips */}
            <div className="text-sm text-gray-500 space-y-2">
              <p>💡 <strong>No encuentras el email?</strong></p>
              <ul className="text-left space-y-1 ml-4">
                <li>• Revisa tu carpeta de spam</li>
                <li>• Asegúrate de que el email sea correcto</li>
                <li>• El enlace expira en 24 horas</li>
              </ul>
            </div>

            {/* Back to Login */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <Link 
                href="/login"
                className="text-sm text-violet-600 hover:text-violet-700 font-medium"
              >
                ← Volver al login
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default function VerifyRequiredPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center"><div className="text-center"><div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p className="text-gray-600">Cargando...</p></div></div>}>
      <VerifyRequiredContent />
    </Suspense>
  )
}