'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import {
  Zap,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  ChevronLeft,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { ItineramioLogo } from '../../../src/components/ui/ItineramioLogo'
import { Button, Input } from '../../../src/components/ui'
import { InlineSpinner } from '../../../src/components/ui/Spinner'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../../../src/providers/AuthProvider'
import { useTranslation } from 'react-i18next'

function LoginContent() {
  const { t } = useTranslation('auth')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [resendingEmail, setResendingEmail] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: ''
  })

  const [messages, setMessages] = useState({
    success: '',
    info: '',
    warning: ''
  })

  // Handle URL parameters for messages
  useEffect(() => {
    const verified = searchParams.get('verified')
    const error = searchParams.get('error')
    const message = searchParams.get('message')

    if (verified === 'true') {
      setMessages(prev => ({
        ...prev,
        success: t('login.success.emailVerified')
      }))
    } else if (error) {
      setErrors(prev => ({
        ...prev,
        general: decodeURIComponent(error)
      }))
    } else if (message) {
      setMessages(prev => ({
        ...prev,
        info: decodeURIComponent(message)
      }))
    }
  }, [searchParams])


  const validateForm = () => {
    const newErrors = {
      email: '',
      password: '',
      general: ''
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email) {
      newErrors.email = t('login.errors.emailRequired')
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = t('login.errors.emailInvalid')
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = t('login.errors.passwordRequired')
    } else if (formData.password.length < 6) {
      newErrors.password = t('login.errors.passwordTooShort')
    }

    setErrors(newErrors)
    return Object.values(newErrors).every(error => error === '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors(prev => ({ ...prev, general: '' }))
    
    try {
      const response = await fetch('/api/auth/simple-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Critical for PWA cookie persistence
        body: JSON.stringify({
          ...formData,
          rememberMe
        }),
      })
      
      const data = await response.json()
      console.log('Login response:', data)
      
      if (!response.ok) {
        if (data.error === 'EMAIL_NOT_VERIFIED') {
          // Redirect to verification page with email
          router.push(`/verify-required?email=${encodeURIComponent(data.email)}`)
          return
        }
        
        setErrors(prev => ({
          ...prev,
          general: data.error || t('login.errors.loginError')
        }))
        return
      }
      
      if (data.success) {
        // Success - save token to localStorage for PWA persistence
        if (data.token) {
          try {
            localStorage.setItem('auth-token', data.token)
            console.log('✅ Token saved to localStorage for PWA')
          } catch (e) {
            console.warn('⚠️ Failed to save token to localStorage:', e)
          }
        }

        // Smart routing based on active modules
        const fromUrl = searchParams.get('from')
        if (fromUrl) {
          router.push(fromUrl)
        } else {
          try {
            const moduleRes = await fetch('/api/auth/module-status', { credentials: 'include' })
            if (moduleRes.ok) {
              const { manualesActive, gestionActive } = await moduleRes.json()
              if (gestionActive && !manualesActive) {
                router.push('/gestion')
              } else if (manualesActive || (!manualesActive && !gestionActive)) {
                router.push(manualesActive ? '/main' : '/account/modules')
              } else {
                router.push('/main')
              }
            } else {
              router.push('/main')
            }
          } catch {
            router.push('/main')
          }
        }
      } else {
        setErrors(prev => ({
          ...prev,
          general: t('login.errors.loginError')
        }))
      }
      
    } catch (error) {
      console.error('Login error:', error)
      setErrors(prev => ({
        ...prev,
        general: t('login.errors.connectionError')
      }))
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Limpiar error cuando el usuario empieza a escribir
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    // Limpiar error general también
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }))
    }
  }


  const resendVerificationEmail = async () => {
    if (!formData.email) {
      setErrors(prev => ({
        ...prev,
        email: t('login.errors.enterEmailToResend')
      }))
      return
    }

    setResendingEmail(true)
    setMessages({ success: '', info: '', warning: '' })
    setErrors(prev => ({ ...prev, general: '' }))

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessages(prev => ({
          ...prev,
          success: t('login.success.verificationSent')
        }))
      } else {
        setErrors(prev => ({
          ...prev,
          general: data.error || t('login.errors.resendError')
        }))
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        general: t('login.errors.connectionError')
      }))
    } finally {
      setResendingEmail(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <header className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <ItineramioLogo size="md" gradient />
              <span className="text-lg sm:text-xl font-bold" style={{ color: '#484848' }}>
                Itineramio
              </span>
            </motion.div>
          </Link>

          <Link href="/">
            <Button variant="ghost" size="sm" className="h-8 sm:h-9">
              <ChevronLeft className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('common.back')}</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
            {/* Title */}
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {t('login.welcome')}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                {t('login.subtitle')}
              </p>
            </div>


            {/* Success Message */}
            {messages.success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm text-green-700">{messages.success}</span>
                </div>
              </div>
            )}

            {/* Info Message */}
            {messages.info && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-blue-700">{messages.info}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resendVerificationEmail}
                    disabled={resendingEmail}
                    className="h-8 px-3 text-xs text-blue-600 hover:text-blue-700"
                  >
                    {resendingEmail ? (
                      <>
                        <InlineSpinner size="xs" className="mr-1" />
                        {t('common.sending')}
                      </>
                    ) : (
                      t('login.resendEmail')
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-700">{errors.general}</span>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} autoComplete="on" className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('login.emailLabel')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="tu@email.com"
                    className="pl-10"
                    error={!!errors.email}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('login.password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    error={!!errors.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Remember me & Forgot password */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-[#FF385C] border-gray-300 rounded focus:ring-[#FF385C]"
                  />
                  <span className="text-sm text-gray-600">{t('login.rememberMe')}</span>
                </label>

                <Link
                  href="/forgot-password"
                  className="text-sm text-[#FF385C] hover:text-[#FF385C]/80 hover:underline"
                >
                  {t('login.forgotPassword')}
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <InlineSpinner className="mr-2" color="white" />
                    {t('common.loggingIn')}
                  </>
                ) : (
                  <>
                    {t('login.button')}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </form>

            {/* Register Link */}
            <p className="mt-6 text-center text-sm text-gray-600">
              {t('login.noAccount')}{' '}
              <Link href="/register" className="font-medium text-[#FF385C] hover:text-[#FF385C]/80">
                {t('login.signUp')}
              </Link>
            </p>
          </div>

          {/* Features reminder */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 sm:mt-6 text-center"
          >
            <div className="bg-white/80 rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-gray-600">
              <span className="font-medium text-[#FF385C]">✨ {t('common.trialInfo')}</span>
              <span className="hidden sm:inline"> + {t('common.plansFrom')}</span>
              <span className="sm:hidden block mt-1">{t('common.plansFrom')}</span>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}

function LoadingFallback() {
  const { t } = useTranslation('auth')
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">{t('common.loading')}</p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoginContent />
    </Suspense>
  )
}