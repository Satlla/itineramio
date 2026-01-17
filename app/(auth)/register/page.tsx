'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Zap,
  Mail,
  Lock,
  User,
  Phone,
  Globe,
  ArrowRight,
  Eye,
  EyeOff,
  Check,
  ChevronLeft,
  Gift
} from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { ItineramioLogo } from '../../../src/components/ui/ItineramioLogo'
import { Button, Input } from '../../../src/components/ui'
import { InlineSpinner } from '../../../src/components/ui/Spinner'
import { useRouter, useSearchParams } from 'next/navigation'
import { trackSignUp, trackGenerateLead } from '../../../src/lib/analytics'

export default function RegisterPage() {
  const { t } = useTranslation('auth')
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [referralCode, setReferralCode] = useState<string | null>(null)

  // Capture referral code from URL
  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) {
      setReferralCode(ref)
    }
  }, [searchParams])

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    terms: ''
  })

  const passwordRequirements = [
    { regex: /.{8,}/, textKey: 'register.passwordRequirements.minLength' },
    { regex: /[A-Z]/, textKey: 'register.passwordRequirements.uppercase' },
    { regex: /[a-z]/, textKey: 'register.passwordRequirements.lowercase' },
    { regex: /[0-9]/, textKey: 'register.passwordRequirements.number' },
  ]

  const validateForm = () => {
    const newErrors = {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      terms: ''
    }

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = t('register.errors.nameRequired')
    } else if (formData.name.length < 2) {
      newErrors.name = t('register.errors.nameTooShort')
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email) {
      newErrors.email = t('register.errors.emailRequired')
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = t('register.errors.emailInvalid')
    }

    // Validate phone
    const phoneDigits = formData.phone.replace(/[\s\-\(\)\.]/g, '')
    if (!formData.phone) {
      newErrors.phone = t('register.errors.phoneRequired')
    } else if (!/^\+?[0-9]{7,15}$/.test(phoneDigits)) {
      newErrors.phone = t('register.errors.invalidPhone')
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = t('register.errors.passwordRequired')
    } else if (formData.password.length < 8) {
      newErrors.password = t('register.errors.weakPassword')
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('register.errors.confirmRequired')
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('register.errors.passwordMismatch')
    }

    // Validate terms
    if (!acceptTerms) {
      newErrors.terms = t('register.errors.termsRequired')
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
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          acceptTerms,
          marketingConsent,
          registrationLanguage: navigator.language || 'es',
          ...(referralCode && { referralCode })
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        // Handle email sending failure - redirect to verify page so user can resend
        if (data.canResendEmail && data.email) {
          router.push(`/verify-required?email=${encodeURIComponent(data.email)}&emailError=true`)
          return
        }

        // Handle validation errors
        if (data.details && Array.isArray(data.details)) {
          const newErrors = { ...errors }
          data.details.forEach((detail: { field: string; message: string }) => {
            if (detail.field in newErrors) {
              newErrors[detail.field as keyof typeof newErrors] = detail.message
            }
          })
          setErrors(newErrors)
        } else {
          // Show general error
          setErrors(prev => ({
            ...prev,
            email: data.error || t('register.errors.registrationError')
          }))
        }
        return
      }
      
      // Track GA4 sign_up conversion
      trackSignUp({ method: 'email', userId: data.userId })
      trackGenerateLead({ source: 'landing', value: 15 })

      // Success - redirect to verification required page
      router.push(`/verify-required?email=${encodeURIComponent(formData.email)}`)
      
    } catch (error) {
      console.error('Registration error:', error)
      setErrors(prev => ({
        ...prev,
        email: t('register.errors.connectionError')
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
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex flex-col">
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
                {t('register.title')}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                {t('register.subtitle')}
              </p>
            </div>

            {/* Benefits */}
            <div className="bg-violet-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-violet-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                </div>
                <div className="text-xs sm:text-sm text-gray-700">
                  <span className="font-semibold">{t('register.trialBenefit')}</span> {t('register.trialDescription')}
                </div>
              </div>
            </div>

            {/* Referral Badge */}
            {referralCode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6"
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-semibold text-green-800">
                      {t('register.referralValid')}
                    </p>
                    <p className="text-xs sm:text-sm text-green-600">
                      {t('register.referralInvited')}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('register.nameLabel')}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={t('register.namePlaceholder')}
                    className="pl-10"
                    error={!!errors.name}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('register.emailLabel')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
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

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('register.phoneLabel')}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder={t('register.phonePlaceholder')}
                    className="pl-10"
                    error={!!errors.phone}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('register.password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
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
                
                {/* Password requirements */}
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          req.regex.test(formData.password)
                            ? 'bg-green-500'
                            : 'bg-gray-300'
                        }`}>
                          {req.regex.test(formData.password) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className={`text-xs ${
                          req.regex.test(formData.password)
                            ? 'text-green-600'
                            : 'text-gray-500'
                        }`}>
                          {t(req.textKey)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('register.confirmPassword')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="pl-10"
                    error={!!errors.confirmPassword}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms & Privacy (Mandatory) */}
              <div className="space-y-2 sm:space-y-3">
                <label className="flex items-start space-x-2 sm:space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => {
                      setAcceptTerms(e.target.checked)
                      if (errors.terms) {
                        setErrors(prev => ({ ...prev, terms: '' }))
                      }
                    }}
                    className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500 mt-0.5 flex-shrink-0"
                  />
                  <span className="text-xs sm:text-sm text-gray-600">
                    {t('register.acceptTermsRequired')}{' '}
                    <Link href="/legal/terms" target="_blank" className="text-violet-600 hover:underline font-medium">
                      {t('register.termsLink')}
                    </Link>
                    {', '}{t('register.andThe')}{' '}
                    <Link href="/legal/privacy" target="_blank" className="text-violet-600 hover:underline font-medium">
                      {t('register.privacyLink')}
                    </Link>
                    {' '}{t('register.andThe')}{' '}
                    <Link href="/legal/cookies" target="_blank" className="text-violet-600 hover:underline font-medium">
                      {t('register.cookiesLink')}
                    </Link>
                  </span>
                </label>
                {errors.terms && (
                  <p className="text-xs sm:text-sm text-red-600">{errors.terms}</p>
                )}

                {/* Marketing Consent (Optional) */}
                <label className="flex items-start space-x-2 sm:space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={marketingConsent}
                    onChange={(e) => setMarketingConsent(e.target.checked)}
                    className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500 mt-0.5 flex-shrink-0"
                  />
                  <span className="text-xs sm:text-sm text-gray-600">
                    {t('register.marketingConsent')}
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <InlineSpinner className="mr-2" color="white" />
                    {t('register.creating')}
                  </>
                ) : (
                  <>
                    {t('register.button')}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </form>

            {/* Login Link */}
            <p className="mt-6 text-center text-sm text-gray-600">
              {t('register.hasAccount')}{' '}
              <Link href="/login" className="font-medium text-violet-600 hover:text-violet-500">
                {t('register.signIn')}
              </Link>
            </p>
          </div>

          {/* Language Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 sm:mt-6 text-center px-4"
          >
            <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-gray-500">
              <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden sm:inline">{t('register.languageSaved')}</span>
              <span className="sm:hidden">{t('register.languageSavedShort')}</span>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}