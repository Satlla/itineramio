'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Building2,
  User,
  Briefcase,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Save,
  Mail,
  Phone,
  MapPin,
  FileText,
  Download,
  Calendar,
  CreditCard,
  Clock,
  Receipt,
  Eye,
  X
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'

type EntityType = 'company' | 'self-employed' | 'individual'
type TabType = 'data' | 'history'

interface BillingFormData {
  entityType: EntityType
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  country: string
  companyName?: string
  companyTaxId?: string
  tradeName?: string
  taxId?: string
  businessActivity?: string
  firstName?: string
  lastName?: string
  nationalId?: string
}

interface Invoice {
  id: string
  invoiceNumber: string
  amount: number
  finalAmount: number
  discountAmount: number
  status: string
  dueDate: string
  paidDate?: string
  createdAt: string
  subscription?: {
    plan: {
      name: string
    }
  }
}

interface SubscriptionInfo {
  plan: string
  expiresAt: string | null
  status: string
}

export default function BillingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useTranslation('account')
  const fromCheckout = searchParams.get('from') === 'checkout'
  const initialTab = (searchParams.get('tab') as TabType) || 'data'

  const [activeTab, setActiveTab] = useState<TabType>(initialTab)
  const [entityType, setEntityType] = useState<EntityType>('company')
  const [formData, setFormData] = useState<BillingFormData>({
    entityType: 'company',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'España'
  })
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Load data
  useEffect(() => {
    loadBillingData()
    loadInvoices()
    loadSubscription()
  }, [])

  const loadBillingData = async () => {
    try {
      const response = await fetch('/api/user/billing-info', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.billingInfo) {
          // Convert Spanish entity types from API to English for frontend
          const convertEntityType = (type: string): EntityType => {
            if (type === 'empresa') return 'company'
            if (type === 'autonomo') return 'self-employed'
            return 'individual'
          }

          const apiEntityType = convertEntityType(data.billingInfo.entityType || 'particular')

          // Map API response fields to form fields
          const billingData: BillingFormData = {
            entityType: apiEntityType,
            email: data.billingInfo.email || '',
            phone: data.billingInfo.phone || '',
            address: data.billingInfo.billingAddress || '',
            city: data.billingInfo.billingCity || '',
            postalCode: data.billingInfo.billingPostalCode || '',
            country: data.billingInfo.billingCountry || 'España',
            // Company fields
            companyName: data.billingInfo.companyName || '',
            companyTaxId: apiEntityType === 'company' ? data.billingInfo.vatNumber || '' : '',
            // Self-employed fields
            tradeName: data.billingInfo.tradeName || '',
            taxId: apiEntityType === 'self-employed' ? data.billingInfo.vatNumber || '' : '',
            businessActivity: data.billingInfo.businessActivity || '',
            // Individual fields
            firstName: data.billingInfo.firstName || '',
            lastName: data.billingInfo.lastName || '',
            nationalId: apiEntityType === 'individual' ? data.billingInfo.vatNumber || '' : ''
          }

          setFormData(billingData)
          setEntityType(apiEntityType)
        }
      }
    } catch (error) {
      console.error('Error loading billing data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadInvoices = async () => {
    try {
      const response = await fetch('/api/user/invoices', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setInvoices(data.invoices || [])
      }
    } catch (error) {
      console.error('Error loading invoices:', error)
    }
  }

  const loadSubscription = async () => {
    try {
      const response = await fetch('/api/user/subscription-status', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setSubscription(data)
      }
    } catch (error) {
      console.error('Error loading subscription:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleEntityTypeChange = (type: EntityType) => {
    setEntityType(type)
    setFormData(prev => ({ ...prev, entityType: type }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      // Convert English entity types to Spanish for API
      const convertEntityTypeToSpanish = (type: EntityType): string => {
        if (type === 'company') return 'empresa'
        if (type === 'self-employed') return 'autonomo'
        return 'particular'
      }

      // Prepare data with Spanish entity type
      const dataToSend = {
        ...formData,
        entityType: convertEntityTypeToSpanish(formData.entityType)
      }

      const response = await fetch('/api/user/billing-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(dataToSend)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || t('errors.saveError'))
      }

      setSuccessMessage(t('billing.success'))

      if (fromCheckout) {
        setTimeout(() => {
          const pendingPurchase = localStorage.getItem('pendingPurchase')
          if (pendingPurchase) {
            const purchase = JSON.parse(pendingPurchase)
            router.push(`/checkout/manual?plan=${purchase.planCode}&price=${purchase.price}&properties=${purchase.propertyCount}&billingPeriod=${purchase.billingPeriod}`)
          } else {
            router.push('/account/plans')
          }
        }, 1500)
      } else {
        setTimeout(() => {
          setSuccessMessage('')
        }, 3000)
      }
    } catch (error) {
      console.error('Error:', error)
      setErrorMessage(error instanceof Error ? error.message : t('billing.error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownloadInvoice = (invoiceId: string) => {
    // Open invoice in new tab - user can use "Guardar como PDF" button or browser print
    window.open(`/api/user/invoices/${invoiceId}/download`, '_blank')
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      PAID: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      OVERDUE: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800'
    }

    const labels = {
      PAID: t('invoices.status.paid'),
      PENDING: t('invoices.status.pending'),
      OVERDUE: t('invoices.status.overdue'),
      CANCELLED: t('invoices.status.cancelled')
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.PENDING}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 sm:py-8 md:py-12 px-3 sm:px-4" style={{ paddingTop: 'calc(4rem + env(safe-area-inset-top, 0px))' }}>
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 md:py-12 px-3 sm:px-4" style={{ paddingTop: 'calc(4rem + env(safe-area-inset-top, 0px))' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-sm sm:text-base text-gray-600 hover:text-gray-900 transition-colors mb-3 sm:mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5 sm:mr-2" />
            {t('billing.back')}
          </button>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1.5 sm:mb-2">
            {t('billing.title')}
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {t('billing.pageSubtitle')}
          </p>
        </div>

        {/* Subscription Info Card */}
        {subscription && (
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="bg-white/20 p-2 sm:p-3 rounded-lg flex-shrink-0">
                  <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm opacity-90">{t('billing.currentPlan')}</p>
                  <p className="text-xl sm:text-2xl font-bold">{subscription.plan || t('billing.noPlan')}</p>
                </div>
              </div>
              {subscription.expiresAt && (
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="bg-white/20 p-2 sm:p-3 rounded-lg flex-shrink-0">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm opacity-90">{t('billing.nextRenewal')}</p>
                    <p className="text-lg sm:text-xl font-semibold">
                      {new Date(subscription.expiresAt).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              )}
              <div className="self-start sm:self-auto">
                <span className={`inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                  subscription.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {subscription.status === 'ACTIVE' ? t('billing.active') : t('billing.inactive')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Success/Error Messages */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3"
          >
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-green-800">{successMessage}</p>
          </motion.div>
        )}

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{errorMessage}</p>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('data')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'data'
                    ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  {t('billing.tabs.data')}
                </div>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'history'
                    ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Receipt className="w-4 h-4" />
                  {t('billing.tabs.history')} ({invoices.length})
                </div>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'data' ? (
              /* DATOS DE FACTURACION TAB */
              <form onSubmit={handleSubmit} className="space-y-8">
                {fromCheckout && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>{t('billing.checkoutInfo')}</strong>
                    </p>
                  </div>
                )}

                {/* Entity Type Selection */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {t('billing.entityType.title')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => handleEntityTypeChange('company')}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        entityType === 'company'
                          ? 'border-violet-600 bg-violet-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Building2 className={`w-8 h-8 mx-auto mb-3 ${
                        entityType === 'company' ? 'text-violet-600' : 'text-gray-400'
                      }`} />
                      <h3 className="font-semibold text-gray-900 mb-1">{t('billing.entityType.company')}</h3>
                      <p className="text-sm text-gray-600">{t('billing.entityType.companyDescription')}</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEntityTypeChange('self-employed')}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        entityType === 'self-employed'
                          ? 'border-violet-600 bg-violet-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Briefcase className={`w-8 h-8 mx-auto mb-3 ${
                        entityType === 'self-employed' ? 'text-violet-600' : 'text-gray-400'
                      }`} />
                      <h3 className="font-semibold text-gray-900 mb-1">{t('billing.entityType.selfEmployed')}</h3>
                      <p className="text-sm text-gray-600">{t('billing.entityType.selfEmployedDescription')}</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEntityTypeChange('individual')}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        entityType === 'individual'
                          ? 'border-violet-600 bg-violet-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <User className={`w-8 h-8 mx-auto mb-3 ${
                        entityType === 'individual' ? 'text-violet-600' : 'text-gray-400'
                      }`} />
                      <h3 className="font-semibold text-gray-900 mb-1">{t('billing.entityType.individual')}</h3>
                      <p className="text-sm text-gray-600">{t('billing.entityType.individualDescription')}</p>
                    </button>
                  </div>
                </div>

                {/* Entity-specific fields */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {t('billing.fiscalData.title')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {entityType === 'company' && (
                      <>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('billing.fiscalData.companyName')} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="companyName"
                            required
                            value={formData.companyName || ''}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            placeholder={t('billing.fiscalData.companyNamePlaceholder')}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('billing.fiscalData.cif')} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="companyTaxId"
                            required
                            value={formData.companyTaxId || ''}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            placeholder={t('billing.fiscalData.cifPlaceholder')}
                          />
                        </div>
                      </>
                    )}

                    {entityType === 'self-employed' && (
                      <>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('billing.fiscalData.tradeName')} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="tradeName"
                            required
                            value={formData.tradeName || ''}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            placeholder={t('billing.fiscalData.tradeNamePlaceholder')}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('billing.fiscalData.nif')} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="taxId"
                            required
                            value={formData.taxId || ''}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            placeholder={t('billing.fiscalData.nifPlaceholder')}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('billing.fiscalData.businessActivity')} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="businessActivity"
                            required
                            value={formData.businessActivity || ''}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            placeholder={t('billing.fiscalData.businessActivityPlaceholder')}
                          />
                        </div>
                      </>
                    )}

                    {entityType === 'individual' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('billing.fiscalData.firstName')} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            required
                            value={formData.firstName || ''}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            placeholder={t('billing.fiscalData.firstNamePlaceholder')}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('billing.fiscalData.lastName')} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            required
                            value={formData.lastName || ''}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            placeholder={t('billing.fiscalData.lastNamePlaceholder')}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('billing.fiscalData.nationalId')} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="nationalId"
                            required
                            value={formData.nationalId || ''}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            placeholder={t('billing.fiscalData.nationalIdPlaceholder')}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-violet-600" />
                    {t('billing.contact.title')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('billing.contact.email')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        placeholder={t('billing.contact.emailPlaceholder')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('billing.contact.phone')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        placeholder={t('billing.contact.phonePlaceholder')}
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-violet-600" />
                    {t('billing.address.title')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('billing.address.address')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        placeholder={t('billing.address.addressPlaceholder')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('billing.address.city')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        placeholder={t('billing.address.cityPlaceholder')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('billing.address.postalCode')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        required
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        placeholder={t('billing.address.postalCodePlaceholder')}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('billing.address.country')} <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="country"
                        required
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      >
                        <option value="España">{t('billing.address.countries.spain')}</option>
                        <option value="Portugal">{t('billing.address.countries.portugal')}</option>
                        <option value="Francia">{t('billing.address.countries.france')}</option>
                        <option value="Italia">{t('billing.address.countries.italy')}</option>
                        <option value="Alemania">{t('billing.address.countries.germany')}</option>
                        <option value="Reino Unido">{t('billing.address.countries.uk')}</option>
                        <option value="Otro">{t('billing.address.countries.other')}</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Info Note */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">{t('billing.infoNote.title')}</p>
                      <p>
                        {t('billing.infoNote.description')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    {t('billing.buttons.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {t('billing.buttons.saving')}
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        {t('billing.buttons.save')}
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* HISTORIAL DE FACTURAS TAB */
              <div className="space-y-6">
                {invoices.length === 0 ? (
                  <div className="text-center py-12">
                    <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t('invoices.noInvoices')}
                    </h3>
                    <p className="text-gray-600">
                      {t('invoices.noInvoicesDescription')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div className="flex items-start gap-4">
                            <div className="bg-violet-100 p-3 rounded-lg">
                              <Receipt className="w-6 h-6 text-violet-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-1">
                                {invoice.invoiceNumber}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">
                                {invoice.subscription?.plan?.name || 'Plan'} - {new Date(invoice.createdAt).toLocaleDateString('es-ES')}
                              </p>
                              <div className="flex items-center gap-3">
                                {getStatusBadge(invoice.status)}
                                {invoice.paidDate && (
                                  <span className="text-sm text-gray-500">
                                    {t('invoices.paidOn')}: {new Date(invoice.paidDate).toLocaleDateString('es-ES')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              {invoice.discountAmount > 0 && (
                                <p className="text-sm text-gray-500 line-through">
                                  {invoice.amount.toFixed(2)}
                                </p>
                              )}
                              <p className="text-2xl font-bold text-gray-900">
                                {invoice.finalAmount.toFixed(2)}
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => setSelectedInvoice(invoice)}
                                className="p-2 text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                                title={t('invoices.viewInvoice')}
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDownloadInvoice(invoice.id)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title={t('invoices.downloadInvoice')}
                              >
                                <Download className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Viewer Modal (Airbnb style) */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">{t('invoices.modal.title')} {selectedInvoice.invoiceNumber}</h2>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Invoice Content - Airbnb Style */}
            <div className="p-8">
              {/* Company Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">I</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Itineramio</h3>
                    <p className="text-sm text-gray-600">Gestión de Alojamientos Turisticos</p>
                  </div>
                </div>
              </div>

              {/* Invoice Details Grid */}
              <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">{t('invoices.modal.billedTo')}</p>
                  <p className="font-semibold text-gray-900">{formData.companyName || formData.tradeName || `${formData.firstName} ${formData.lastName}`}</p>
                  <p className="text-sm text-gray-600">{formData.email}</p>
                  <p className="text-sm text-gray-600">{formData.address}</p>
                  <p className="text-sm text-gray-600">{formData.city}, {formData.postalCode}</p>
                  <p className="text-sm text-gray-600">{formData.country}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-500 mb-1">{t('invoices.modal.invoiceDetails')}</p>
                  <p className="text-sm text-gray-600">{t('invoices.modal.number')}: <span className="font-semibold text-gray-900">{selectedInvoice.invoiceNumber}</span></p>
                  <p className="text-sm text-gray-600">{t('invoices.modal.date')}: <span className="font-semibold text-gray-900">{new Date(selectedInvoice.createdAt).toLocaleDateString('es-ES')}</span></p>
                  <p className="text-sm text-gray-600">{t('invoices.modal.dueDate')}: <span className="font-semibold text-gray-900">{new Date(selectedInvoice.dueDate).toLocaleDateString('es-ES')}</span></p>
                  {selectedInvoice.paidDate && (
                    <p className="text-sm text-gray-600">{t('invoices.modal.paidDate')}: <span className="font-semibold text-green-600">{new Date(selectedInvoice.paidDate).toLocaleDateString('es-ES')}</span></p>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-8">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 text-sm font-medium text-gray-500">{t('invoices.modal.description')}</th>
                      <th className="text-right py-3 text-sm font-medium text-gray-500">{t('invoices.modal.amount')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-4">
                        <p className="font-medium text-gray-900">{selectedInvoice.subscription?.plan?.name || t('invoices.modal.subscription')}</p>
                        <p className="text-sm text-gray-600">{t('invoices.modal.billingPeriod')}</p>
                      </td>
                      <td className="text-right py-4 font-semibold text-gray-900">
                        {selectedInvoice.amount.toFixed(2)}
                      </td>
                    </tr>
                    {selectedInvoice.discountAmount > 0 && (
                      <tr className="border-b border-gray-100">
                        <td className="py-4">
                          <p className="font-medium text-green-600">{t('invoices.modal.discount')}</p>
                        </td>
                        <td className="text-right py-4 font-semibold text-green-600">
                          -{selectedInvoice.discountAmount.toFixed(2)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Total */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-medium text-gray-900">{t('invoices.modal.total')}</p>
                  <p className="text-3xl font-bold text-gray-900">{selectedInvoice.finalAmount.toFixed(2)}</p>
                </div>
                {selectedInvoice.status === 'PAID' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">{t('invoices.modal.paid')}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="text-center text-sm text-gray-500 border-t border-gray-200 pt-6">
                <p>{t('invoices.modal.footer')}</p>
                <p className="mt-2">{t('invoices.modal.footerContact')}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => handleDownloadInvoice(selectedInvoice.id)}
                  className="flex-1 bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  {t('invoices.modal.viewButton')}
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  {t('invoices.modal.closeButton')}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
