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
import { ItineramioLogo } from '../../../src/components/ui/ItineramioLogo'
import { Button } from '../../../src/components/ui'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'

function VerifyRequiredContent() {
  const { t } = useTranslation('auth')
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [emailError, setEmailError] = useState(false)

  useEffect(() => {
    const email = searchParams.get('email')
    const hasEmailError = searchParams.get('emailError') === 'true'
    if (email) {
      setUserEmail(decodeURIComponent(email))
    }
    setEmailError(hasEmailError)
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
              <ItineramioLogo size="md" gradient />
              <span className="text-xl font-bold" style={{ color: '#484848' }}>
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
              {t('verifyRequired.title')}
            </h1>

            {emailError && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-amber-800">
                  ⚠️ {t('verifyRequired.errorWarning')}
                </p>
              </div>
            )}

            <p className="text-gray-600 mb-6">
              {emailError
                ? t('verifyRequired.descriptionError')
                : t('verifyRequired.description')}
            </p>

            {/* Email Input for Resend */}
            <div className="mb-6">
              <input
                type="email"
                placeholder={t('verifyRequired.emailPlaceholder')}
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
                    {t('verifyRequired.success')}
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
                  {t('verifyRequired.sending')}
                </>
              ) : (
                <>
                  {t('verifyRequired.resendButton')}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>

            {/* Tips */}
            <div className="text-sm text-gray-500 space-y-2">
              <p>💡 <strong>{t('verifyRequired.tips.title')}</strong></p>
              <ul className="text-left space-y-1 ml-4">
                <li>• {t('verifyRequired.tips.checkSpam')}</li>
                <li>• {t('verifyRequired.tips.checkEmail')}</li>
                <li>• {t('verifyRequired.tips.expiry')}</li>
              </ul>
            </div>

            {/* Back to Login */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <Link
                href="/login"
                className="text-sm text-violet-600 hover:text-violet-700 font-medium"
              >
                ← {t('verifyRequired.backToLogin')}
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

function LoadingFallback() {
  const { t } = useTranslation('auth')
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">{t('verifyRequired.loading')}</p>
      </div>
    </div>
  )
}

export default function VerifyRequiredPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyRequiredContent />
    </Suspense>
  )
}