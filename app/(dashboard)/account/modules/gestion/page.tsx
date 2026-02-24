'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Receipt,
  Check,
  Building2,
  FileText,
  Users,
  BarChart3,
  CalendarDays,
  Sparkles,
  Shield,
  Zap,
  Tag,
  X,
  Loader2,
  Clock,
  Gift,
  AlertTriangle,
  CreditCard,
  Phone,
  Upload,
  Image,
  Copy,
  CheckCircle2
} from 'lucide-react'
import { MODULES } from '@/config/modules'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useGestionAccess } from '@/hooks/useModuleAccess'
import { useAuth } from '@/providers/AuthProvider'
import { generatePaymentReference } from '@/lib/property-number-generator'

type BillingPeriod = 'MONTHLY' | 'SEMESTRAL' | 'YEARLY'
type PaymentMethodType = 'CARD' | 'BIZUM' | 'TRANSFER'

interface ValidatedCoupon {
  id: string
  code: string
  name: string
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_MONTHS'
  discountPercent: number | null
  discountAmount: number | null
  freeMonths: number | null
}

const BILLING_OPTIONS_CONFIG: Record<BillingPeriod, { labelKey: string; months: number; discount: number; badge?: string }> = {
  MONTHLY: { labelKey: 'modules.gestion.billingOptions.monthly', months: 1, discount: 0 },
  SEMESTRAL: { labelKey: 'modules.gestion.billingOptions.semestral', months: 6, discount: 10, badge: '-10%' },
  YEARLY: { labelKey: 'modules.gestion.billingOptions.yearly', months: 12, discount: 20, badge: '-20%' }
}

const FEATURES_CONFIG = [
  { icon: Users, titleKey: 'modules.gestion.features.ownerManagement.title', descriptionKey: 'modules.gestion.features.ownerManagement.description' },
  { icon: CalendarDays, titleKey: 'modules.gestion.features.reservationImport.title', descriptionKey: 'modules.gestion.features.reservationImport.description' },
  { icon: FileText, titleKey: 'modules.gestion.features.autoInvoices.title', descriptionKey: 'modules.gestion.features.autoInvoices.description' },
  { icon: Receipt, titleKey: 'modules.gestion.features.monthlySettlements.title', descriptionKey: 'modules.gestion.features.monthlySettlements.description' },
  { icon: Building2, titleKey: 'modules.gestion.features.expenseControl.title', descriptionKey: 'modules.gestion.features.expenseControl.description' },
  { icon: BarChart3, titleKey: 'modules.gestion.features.profitabilityReports.title', descriptionKey: 'modules.gestion.features.profitabilityReports.description' }
]

export default function GestionModulePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { t } = useTranslation('account')
  const [selectedPeriod, setSelectedPeriod] = useState<BillingPeriod>('YEARLY')
  const [loading, setLoading] = useState(false)
  const [trialLoading, setTrialLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('CARD')

  // Manual payment state
  const [paymentReference, setPaymentReference] = useState('')
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [hasPendingRequest, setHasPendingRequest] = useState(false)
  const [billingDataMissing, setBillingDataMissing] = useState(false)
  const [checkingBillingData, setCheckingBillingData] = useState(false)

  // Check current module access
  const { hasAccess, isLoading: accessLoading, access, trialEndsAt } = useGestionAccess()

  // If user already has active access, redirect to /gestion
  useEffect(() => {
    if (!accessLoading && hasAccess) {
      router.replace('/gestion')
    }
  }, [accessLoading, hasAccess, router])

  // Generate payment reference and check pending requests when manual method selected
  useEffect(() => {
    if (paymentMethod !== 'CARD') {
      if (!paymentReference) {
        setPaymentReference(generatePaymentReference())
      }
      checkPendingRequest()
      checkBillingData()
    }
  }, [paymentMethod])

  // Determine if trial was already used (expired)
  const trialExpired = !hasAccess && trialEndsAt && new Date(trialEndsAt) < new Date()
  const canStartTrial = !hasAccess && !trialEndsAt

  // Coupon state
  const [couponCode, setCouponCode] = useState('')
  const [validatedCoupon, setValidatedCoupon] = useState<ValidatedCoupon | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState<string | null>(null)

  const module = MODULES.GESTION
  const basePrice = module.basePriceMonthly || 8
  const trialDays = module.trialDays || 14

  const calculatePrice = (period: BillingPeriod): number => {
    const { months, discount } = BILLING_OPTIONS_CONFIG[period]
    const total = basePrice * months
    return total * (1 - discount / 100)
  }

  const calculatePriceWithCoupon = (period: BillingPeriod): { original: number; final: number; savings: number } => {
    const original = calculatePrice(period)

    if (!validatedCoupon) {
      return { original, final: original, savings: 0 }
    }

    let final = original

    if (validatedCoupon.type === 'PERCENTAGE' && validatedCoupon.discountPercent) {
      final = original * (1 - validatedCoupon.discountPercent / 100)
    } else if (validatedCoupon.type === 'FIXED_AMOUNT' && validatedCoupon.discountAmount) {
      final = Math.max(0, original - validatedCoupon.discountAmount)
    } else if (validatedCoupon.type === 'FREE_MONTHS' && validatedCoupon.freeMonths) {
      const monthlyPrice = original / BILLING_OPTIONS_CONFIG[period].months
      final = Math.max(0, original - (monthlyPrice * validatedCoupon.freeMonths))
    }

    return { original, final, savings: original - final }
  }

  const getPricePerMonth = (period: BillingPeriod): number => {
    const total = calculatePrice(period)
    return total / BILLING_OPTIONS_CONFIG[period].months
  }

  const checkPendingRequest = async () => {
    try {
      const res = await fetch('/api/module-requests/pending', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setHasPendingRequest(data.hasPending)
      }
    } catch {
      // ignore
    }
  }

  const checkBillingData = async () => {
    try {
      setCheckingBillingData(true)
      const response = await fetch('/api/user/billing-info', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        const info = data.billingInfo
        if (!info) {
          setBillingDataMissing(true)
          return
        }
        const hasName = info.companyName || info.tradeName || (info.firstName && info.lastName)
        const isComplete = hasName && info.email && info.phone && info.address && info.city && info.postalCode && info.country
        setBillingDataMissing(!isComplete)
      } else {
        setBillingDataMissing(true)
      }
    } catch {
      setBillingDataMissing(true)
    } finally {
      setCheckingBillingData(false)
    }
  }

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError(t('modules.gestion.toasts.enterCouponCode'))
      return
    }

    setCouponLoading(true)
    setCouponError(null)

    try {
      const response = await fetch('/api/modules/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          moduleType: 'GESTION',
          amount: calculatePrice(selectedPeriod)
        })
      })

      const result = await response.json()

      if (result.success) {
        setValidatedCoupon(result.coupon)
        setCouponError(null)
        toast.success(t('modules.gestion.toasts.couponApplied', { name: result.coupon.name }))
      } else {
        setCouponError(result.error || t('modules.gestion.toasts.couponInvalid'))
        setValidatedCoupon(null)
      }
    } catch (error) {
      console.error('Error validating coupon:', error)
      setCouponError(t('modules.gestion.toasts.couponValidationError'))
      setValidatedCoupon(null)
    } finally {
      setCouponLoading(false)
    }
  }

  const removeCoupon = () => {
    setValidatedCoupon(null)
    setCouponCode('')
    setCouponError(null)
  }

  // Activar trial de 14 días
  const handleStartTrial = async () => {
    setTrialLoading(true)

    try {
      const response = await fetch('/api/modules/activate-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleCode: 'GESTION',
          trialDays
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success(t('modules.gestion.toasts.trialActivated', { days: trialDays }))
        router.push('/gestion')
      } else {
        toast.error(result.error || t('modules.gestion.toasts.trialActivationError'))
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error(t('modules.gestion.toasts.trialActivationError'))
    } finally {
      setTrialLoading(false)
    }
  }

  // Stripe checkout
  const handleStripeCheckout = async () => {
    setLoading(true)

    try {
      const { final } = calculatePriceWithCoupon(selectedPeriod)

      const response = await fetch('/api/modules/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleCode: 'GESTION',
          billingPeriod: selectedPeriod,
          couponCode: validatedCoupon?.code || null,
          amount: final
        })
      })

      const result = await response.json()

      if (result.success && result.url) {
        window.location.href = result.url
      } else {
        toast.error(result.error || t('modules.gestion.toasts.checkoutError'))
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error(t('modules.gestion.toasts.paymentProcessingError'))
    } finally {
      setLoading(false)
    }
  }

  // Manual payment (Bizum/Transfer)
  const handleFileUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('modules.gestion.toasts.imageTooLarge'))
        return
      }
      setPaymentProofFile(file)
    } else {
      toast.error(t('modules.gestion.toasts.invalidImage'))
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleManualPayment = async () => {
    if (!paymentProofFile) {
      toast.error(t('modules.gestion.toasts.attachProof'))
      return
    }

    if (billingDataMissing) {
      toast.error(t('modules.gestion.toasts.completeBillingFirst'))
      router.push('/account/billing')
      return
    }

    setLoading(true)

    try {
      // Upload payment proof
      const formData = new FormData()
      formData.append('file', paymentProofFile)

      const uploadResponse = await fetch('/api/upload-simple', {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) {
        throw new Error(t('modules.gestion.toasts.uploadError'))
      }

      const uploadResult = await uploadResponse.json()
      const paymentProofUrl = uploadResult.url || uploadResult.existingMedia?.url

      const { final } = calculatePriceWithCoupon(selectedPeriod)

      // Create module request
      const response = await fetch('/api/module-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleCode: 'GESTION',
          billingPeriod: selectedPeriod,
          paymentMethod,
          paymentReference,
          paymentProofUrl,
          totalAmount: final,
          couponCode: validatedCoupon?.code || null,
          userEmail: user?.email,
          userName: user?.name
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setShowSuccess(true)
      } else if (response.status === 409) {
        toast.error(result.error || t('modules.gestion.toasts.pendingRequestExists'))
        setHasPendingRequest(true)
      } else {
        toast.error(result.error || t('modules.gestion.toasts.requestSubmitError'))
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error(t('modules.gestion.toasts.requestProcessingError'))
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success(t('modules.gestion.toasts.copiedToClipboard'))
  }

  // Success screen
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center" style={{ paddingTop: 'calc(4rem + env(safe-area-inset-top, 0px))' }}>
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {t('modules.gestion.successTitle')}
          </h1>
          <p className="text-gray-600 mb-2">
            {t('modules.gestion.successDescription')}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            {t('modules.gestion.reference')} <span className="font-mono font-bold">{paymentReference}</span>
          </p>
          <button
            onClick={() => router.push('/gestion')}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors"
          >
            {t('modules.gestion.goToGestion')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white" style={{ paddingTop: 'calc(4rem + env(safe-area-inset-top, 0px))' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-medium">{t('modules.gestion.back')}</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: `${module.color}15` }}
          >
            <Receipt className="w-10 h-10" style={{ color: module.color }} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {module.name}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {module.description}
          </p>
        </div>

        {/* Loading state */}
        {accessLoading && (
          <div className="bg-gray-100 rounded-2xl p-8 text-center mb-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
            <p className="text-gray-500 mt-2">{t('modules.gestion.loading')}</p>
          </div>
        )}

        {/* Trial Expired Banner */}
        {!accessLoading && trialExpired && (
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 md:p-8 text-white text-center mb-8 shadow-lg">
            <div className="flex items-center justify-center gap-2 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <span className="text-lg font-semibold">{t('modules.gestion.trialExpired')}</span>
            </div>
            <p className="text-amber-100 mb-4">
              {t('modules.gestion.trialExpiredDescription', { date: new Date(trialEndsAt!).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) })}
            </p>
          </div>
        )}

        {/* Trial CTA - Only show if trial not used */}
        {!accessLoading && canStartTrial && (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 md:p-8 text-white text-center mb-8 shadow-lg">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Gift className="w-6 h-6" />
              <span className="text-lg font-semibold">{t('modules.gestion.trialFree', { days: trialDays })}</span>
            </div>
            <p className="text-emerald-100 mb-6">
              {t('modules.gestion.trialNoCreditCard')}
            </p>
            <button
              onClick={handleStartTrial}
              disabled={trialLoading}
              className="px-8 py-4 bg-white text-emerald-600 font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {trialLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('modules.gestion.activating')}
                </span>
              ) : (
                t('modules.gestion.startFreeTrial')
              )}
            </button>
          </div>
        )}

        {/* Divider - only show when trial option is available */}
        {!accessLoading && canStartTrial && (
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-500 text-sm">{t('modules.gestion.orSubscribeDirectly')}</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
        )}

        {/* Pending Request Banner */}
        {hasPendingRequest && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 mb-8 text-center">
            <Clock className="w-8 h-8 text-amber-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-amber-900 mb-2">
              {t('modules.gestion.pendingRequestTitle')}
            </h3>
            <p className="text-amber-700 text-sm">
              {t('modules.gestion.pendingRequestDescription')}
            </p>
          </div>
        )}

        {/* Pricing Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-12">
          {/* Period Selector */}
          <div className="bg-gray-50 p-4 border-b border-gray-100">
            <div className="flex justify-center gap-2">
              {(Object.keys(BILLING_OPTIONS_CONFIG) as BillingPeriod[]).map((period) => {
                const option = BILLING_OPTIONS_CONFIG[period]
                const isSelected = selectedPeriod === period
                return (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`relative px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {t(option.labelKey)}
                    {option.badge && (
                      <span className={`absolute -top-2 -right-2 px-1.5 py-0.5 text-xs font-bold rounded-full ${
                        isSelected ? 'bg-yellow-400 text-yellow-900' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {option.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Price Display */}
          <div className="p-8 text-center">
            {(() => {
              const { original, final, savings } = calculatePriceWithCoupon(selectedPeriod)
              const hasCoupon = validatedCoupon && savings > 0

              return (
                <>
                  <div className="flex items-baseline justify-center gap-2 mb-2">
                    {hasCoupon && (
                      <span className="text-2xl text-gray-400 line-through">
                        {original.toFixed(2).replace('.', ',')}€
                      </span>
                    )}
                    <span className={`text-5xl font-bold ${hasCoupon ? 'text-emerald-600' : 'text-gray-900'}`}>
                      {final.toFixed(2).replace('.', ',')}€
                    </span>
                    <span className="text-gray-500">
                      / {BILLING_OPTIONS_CONFIG[selectedPeriod].months === 1 ? t('modules.gestion.pricePerMonth') : t('modules.gestion.priceMonths', { count: BILLING_OPTIONS_CONFIG[selectedPeriod].months })}
                    </span>
                  </div>

                  {hasCoupon && (
                    <p className="text-emerald-600 font-semibold mb-2">
                      {t('modules.gestion.youSave', { amount: savings.toFixed(2).replace('.', ',') })}
                    </p>
                  )}

                  {selectedPeriod !== 'MONTHLY' && !hasCoupon && (
                    <p className="text-emerald-600 font-medium">
                      {t('modules.gestion.onlyPerMonth', { amount: getPricePerMonth(selectedPeriod).toFixed(2).replace('.', ',') })}
                    </p>
                  )}
                </>
              )
            })()}

            {/* Benefits */}
            <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-500" />
                {t('modules.gestion.unlimitedProperties')}
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-500" />
                {t('modules.gestion.cancelAnytime')}
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                {t('modules.gestion.prioritySupport')}
              </div>
            </div>

            {/* Coupon Section */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              {validatedCoupon ? (
                <div className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg">
                  <Tag className="w-4 h-4" />
                  <span className="font-medium">
                    {t('modules.gestion.couponApplied', { name: validatedCoupon.name })}
                    {validatedCoupon.type === 'PERCENTAGE' && ` (-${validatedCoupon.discountPercent}%)`}
                    {validatedCoupon.type === 'FIXED_AMOUNT' && ` (-${validatedCoupon.discountAmount}€)`}
                    {validatedCoupon.type === 'FREE_MONTHS' && ` (${t('modules.gestion.freeMonths', { count: validatedCoupon.freeMonths || 0 })})`}
                  </span>
                  <button
                    onClick={removeCoupon}
                    className="ml-2 p-1 hover:bg-emerald-100 rounded-full transition-colors"
                    title={t('modules.gestion.removeCouponTitle')}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="max-w-xs mx-auto">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder={t('modules.gestion.couponPlaceholder')}
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase())
                          setCouponError(null)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            validateCoupon()
                          }
                        }}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm uppercase"
                      />
                    </div>
                    <button
                      onClick={validateCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {couponLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        t('modules.gestion.apply')
                      )}
                    </button>
                  </div>
                  {couponError && (
                    <p className="mt-2 text-sm text-red-600">{couponError}</p>
                  )}
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-3">{t('modules.gestion.paymentMethod')}</p>
              <div className="flex justify-center gap-2">
                {([
                  { key: 'CARD' as PaymentMethodType, labelKey: 'modules.gestion.paymentCard', icon: CreditCard },
                  { key: 'BIZUM' as PaymentMethodType, labelKey: 'modules.gestion.paymentBizum', icon: Phone },
                  { key: 'TRANSFER' as PaymentMethodType, labelKey: 'modules.gestion.paymentTransfer', icon: Building2 }
                ]).map(({ key, labelKey, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setPaymentMethod(key)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                      paymentMethod === key
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {t(labelKey)}
                  </button>
                ))}
              </div>
            </div>

            {/* Card / Stripe CTA */}
            {paymentMethod === 'CARD' && (
              <button
                onClick={handleStripeCheckout}
                disabled={loading || hasPendingRequest}
                className="mt-8 w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('modules.gestion.processing') : t('modules.gestion.subscribeNow')}
              </button>
            )}

            {/* Bizum / Transfer instructions */}
            {paymentMethod !== 'CARD' && (
              <div className="mt-8 text-left max-w-md mx-auto space-y-4">
                {/* Billing data warning */}
                {billingDataMissing && !checkingBillingData && (
                  <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-amber-900">{t('modules.gestion.billingDataIncomplete')}</p>
                        <p className="text-xs text-amber-700 mt-1">
                          {t('modules.gestion.billingDataNeeded')}
                        </p>
                        <button
                          onClick={() => router.push('/account/billing')}
                          className="mt-2 text-xs font-medium text-amber-800 underline hover:text-amber-900"
                        >
                          {t('modules.gestion.completeBillingData')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment instructions */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    {paymentMethod === 'BIZUM' ? t('modules.gestion.bizumInstructions') : t('modules.gestion.transferInstructions')}
                  </h4>

                  {paymentMethod === 'BIZUM' ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{t('modules.gestion.sendBizumTo')}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900">+34 652 656 440</span>
                          <button
                            onClick={() => copyToClipboard('+34652656440')}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <Copy className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{t('modules.gestion.conceptImportant')}</p>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded">
                            {paymentReference}
                          </span>
                          <button
                            onClick={() => copyToClipboard(paymentReference)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <Copy className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{t('modules.gestion.amount')}</p>
                        <span className="text-lg font-bold text-emerald-600">
                          {calculatePriceWithCoupon(selectedPeriod).final.toFixed(2).replace('.', ',')}€
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{t('modules.gestion.iban')}</p>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-gray-900">ES82 0182 0304 8102 0158 7248</span>
                          <button
                            onClick={() => copyToClipboard('ES8201820304810201587248')}
                            className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                          >
                            <Copy className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{t('modules.gestion.conceptImportant')}</p>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded">
                            {paymentReference}
                          </span>
                          <button
                            onClick={() => copyToClipboard(paymentReference)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <Copy className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{t('modules.gestion.amount')}</p>
                        <span className="text-lg font-bold text-emerald-600">
                          {calculatePriceWithCoupon(selectedPeriod).final.toFixed(2).replace('.', ',')}€
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{t('modules.gestion.beneficiary')}</p>
                        <span className="text-sm text-gray-900">Itineramio S.L.</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment proof upload */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">{t('modules.gestion.paymentProof')}</p>
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                      dragActive
                        ? 'border-emerald-500 bg-emerald-50'
                        : paymentProofFile
                          ? 'border-emerald-300 bg-emerald-50'
                          : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('payment-proof-input')?.click()}
                  >
                    <input
                      id="payment-proof-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0])
                        }
                      }}
                    />

                    {paymentProofFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <Image className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-700">
                          {paymentProofFile.name}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setPaymentProofFile(null)
                          }}
                          className="p-1 hover:bg-emerald-100 rounded-full"
                        >
                          <X className="w-4 h-4 text-emerald-600" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          {t('modules.gestion.dragProofHerePlain')} <span className="text-emerald-600 font-medium">{t('modules.gestion.clickHere')}</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{t('modules.gestion.fileLimit')}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Submit button */}
                <button
                  onClick={handleManualPayment}
                  disabled={loading || !paymentProofFile || hasPendingRequest || billingDataMissing}
                  className="w-full px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('modules.gestion.sendingRequest')}
                    </span>
                  ) : (
                    t('modules.gestion.sendPaymentRequest')
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            {t('modules.gestion.allIncluded')}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {FEATURES_CONFIG.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-5 border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${module.color}15` }}
                  >
                    <feature.icon className="w-5 h-5" style={{ color: module.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{t(feature.titleKey)}</h3>
                    <p className="text-sm text-gray-600">{t(feature.descriptionKey)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ or Trust Section */}
        <div className="bg-emerald-50 rounded-2xl p-6 md:p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t('modules.gestion.questionsTitle')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('modules.gestion.questionsDescription')}
          </p>
          <a
            href="mailto:hola@itineramio.com?subject=Consulta sobre Gestión"
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            hola@itineramio.com
          </a>
        </div>
      </div>
    </div>
  )
}
