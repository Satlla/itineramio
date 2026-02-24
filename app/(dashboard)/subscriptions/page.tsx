'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import {
  Crown,
  Calendar,
  Building2,
  FileText,
  ChevronRight,
  Check,
  ArrowRight,
  CreditCard,
  Download,
  Eye,
  Sparkles
} from 'lucide-react'
import { useAuth } from '../../../src/providers/AuthProvider'
import { getDiscount } from '../../../src/config/plans'

interface SubscriptionData {
  subscriptions: Array<{
    id: string
    status: string
    startDate: string
    endDate: string
    daysUntilExpiration: number
    cancelAtPeriodEnd?: boolean
    canceledAt?: string | null
    cancelReason?: string | null
    plan?: {
      name: string
      priceMonthly: number
      maxProperties: number
    }
  }>
  propertyCount: number
  currentPlan: string
  planStatus: string
}

interface PropertiesData {
  properties: Array<{
    id: string
    name: string
    slug: string
    createdAt: string
    isCovered: boolean
    needsSubscription: boolean
    coveringSubscription?: {
      planName: string
      endDate: string
      daysUntilExpiration: number
    }
  }>
  usage: {
    availableSlots: number
    totalProperties: number
  }
}

interface InvoicesData {
  invoices: Array<{
    id: string
    invoiceNumber: string
    finalAmount: number
    status: string
    createdAt: string
    subscription?: {
      plan?: {
        name: string
      }
    }
  }>
  summary: {
    totalPaid: number
  }
}

export default function SubscriptionsPage() {
  const router = useRouter()
  const { t, i18n } = useTranslation('account')
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null)
  const [propertiesData, setPropertiesData] = useState<PropertiesData | null>(null)
  const [invoicesData, setInvoicesData] = useState<InvoicesData | null>(null)

  useEffect(() => {
    if (user) {
      fetchAllData()
    }
  }, [user])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchSubscriptions(),
        fetchProperties(),
        fetchInvoices()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/user/subscriptions', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setSubscriptionData(data)
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    }
  }

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/user/properties-subscription', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setPropertiesData(data)
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
    }
  }

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/user/invoices?limit=10', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setInvoicesData(data)
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
    }
  }

  const calculateBillingPeriod = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const totalDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    if (totalDays <= 35) return { period: t('subscriptions.billingPeriod.monthly'), months: 1 }
    if (totalDays >= 150 && totalDays <= 210) return { period: t('subscriptions.billingPeriod.semestral'), months: 6 }
    if (totalDays >= 300) return { period: t('subscriptions.billingPeriod.yearly'), months: 12 }

    const approxMonths = Math.round(totalDays / 30)
    return { period: t('subscriptions.billingPeriod.custom'), months: approxMonths }
  }

  const formatDate = (dateString: string) => {
    const localeMap: Record<string, string> = { es: 'es-ES', en: 'en-US', fr: 'fr-FR' }
    return new Date(dateString).toLocaleDateString(localeMap[i18n.language] || 'es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white" style={{ paddingTop: 'calc(4rem + env(safe-area-inset-top, 0px))' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-200 rounded-lg w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded-2xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-48 bg-gray-200 rounded-2xl"></div>
              <div className="h-48 bg-gray-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const activeSub = subscriptionData?.subscriptions.find(s => s.status === 'ACTIVE')
  const billingPeriod = activeSub ? calculateBillingPeriod(activeSub.startDate, activeSub.endDate) : null

  // Obtener el precio real pagado de la última factura, o calcular el precio de renovación
  const lastPaidInvoice = invoicesData?.invoices.find(i => i.status === 'PAID')
  const paidPrice = lastPaidInvoice?.finalAmount || 0

  // Precio de renovación (sin prorrateo)
  const renewalPrice = activeSub && billingPeriod
    ? (activeSub.plan!.priceMonthly * billingPeriod.months * (
        1 - getDiscount(
          billingPeriod.months === 1 ? 'MONTHLY' :
          billingPeriod.months === 6 ? 'SEMESTRAL' :
          billingPeriod.months === 12 ? 'YEARLY' : 'MONTHLY'
        ) / 100
      ))
    : 0

  // Mostrar el precio pagado si existe, si no el de renovación
  const totalPrice = paidPrice > 0 ? paidPrice : renewalPrice

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" style={{ paddingTop: 'calc(4rem + env(safe-area-inset-top, 0px))' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-semibold text-gray-900">{t('subscriptions.title')}</h1>
          <p className="mt-2 text-gray-600">{t('subscriptions.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 space-y-12">

        {/* Plan Actual - Hero Section */}
        {activeSub && (
          <div className={`relative overflow-hidden rounded-3xl p-8 md:p-12 text-white shadow-xl ${
            activeSub.cancelAtPeriodEnd
              ? 'bg-gradient-to-br from-orange-500 to-red-600'
              : 'bg-gradient-to-br from-blue-500 to-blue-600'
          }`}>
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
            <div className={`absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 opacity-10 rounded-full blur-3xl ${
              activeSub.cancelAtPeriodEnd ? 'bg-red-400' : 'bg-blue-400'
            }`}></div>

            <div className="relative">
              {activeSub.cancelAtPeriodEnd ? (
                <div className="bg-red-700 bg-opacity-50 border-2 border-white border-opacity-30 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-white bg-opacity-20 p-2 rounded-full">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">{t('subscriptions.cancelScheduled')}</h3>
                      <p className="text-sm text-red-100 mt-1">
                        {t('subscriptions.cancelScheduledDescription', { date: formatDate(activeSub.endDate), days: activeSub.daysUntilExpiration })}
                      </p>
                      {activeSub.cancelReason && (
                        <p className="text-xs text-red-200 mt-1">{t('subscriptions.cancelReason', { reason: activeSub.cancelReason })}</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2 mb-4">
                  <Sparkles className="h-5 w-5" />
                  <span className="text-blue-100 text-sm font-medium">{t('subscriptions.activePlan')}</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-4xl font-bold mb-2">{activeSub.plan?.name}</h2>
                  <p className="text-blue-100 text-lg mb-6">
                    {t('subscriptions.propertiesActive', { used: propertiesData?.usage.totalProperties || 0, max: activeSub.plan?.maxProperties })}
                  </p>

                  <div className="flex items-baseline space-x-2 mb-2">
                    <span className="text-5xl font-bold">€{totalPrice.toFixed(2)}</span>
                    <span className="text-blue-100">/ {billingPeriod?.period.toLowerCase()}</span>
                  </div>
                  <p className="text-blue-100 text-sm mb-6">
                    {paidPrice > 0 && paidPrice !== renewalPrice
                      ? t('subscriptions.pricePaidProrated', { renewalPrice: renewalPrice.toFixed(2) })
                      : t('subscriptions.priceCurrentPeriod')
                    }
                  </p>

                  <button
                    onClick={() => router.push('/account/plans')}
                    className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-full font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
                  >
                    {t('subscriptions.changePlan')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <Calendar className="h-6 w-6 mb-3 text-blue-200" />
                    <div className="text-sm text-blue-100 mb-1">{t('subscriptions.expiration')}</div>
                    <div className="text-lg font-semibold">{formatDate(activeSub.endDate)}</div>
                    <div className="text-sm text-blue-200 mt-2">{t('subscriptions.daysRemaining', { days: activeSub.daysUntilExpiration })}</div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <Building2 className="h-6 w-6 mb-3 text-blue-200" />
                    <div className="text-sm text-blue-100 mb-1">{t('subscriptions.properties')}</div>
                    <div className="text-lg font-semibold">{activeSub.plan?.maxProperties}</div>
                    <div className="text-sm text-blue-200 mt-2">{t('subscriptions.included')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sin suscripción activa */}
        {!activeSub && (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-12 text-center border border-gray-200">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Crown className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t('subscriptions.startWithPlan')}
              </h2>
              <p className="text-gray-600 mb-8">
                {t('subscriptions.startWithPlanDescription')}
              </p>
              <button
                onClick={() => router.push('/account/plans')}
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                {t('subscriptions.viewAvailablePlans')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Propiedades */}
        {propertiesData && propertiesData.properties.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{t('subscriptions.yourProperties')}</h2>
                <p className="text-gray-600 mt-1">
                  {t('subscriptions.propertyCount', { count: propertiesData.usage.totalProperties })}
                </p>
              </div>
              <button
                onClick={() => router.push('/properties')}
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
              >
                {t('subscriptions.viewAll')}
                <ChevronRight className="ml-1 h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {propertiesData.properties.slice(0, 6).map((property) => (
                <div
                  key={property.id}
                  className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => router.push(`/properties/${property.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <Building2 className="h-6 w-6 text-gray-400" />
                    {property.isCovered && (
                      <span className="flex items-center text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full font-medium">
                        <Check className="h-3 w-3 mr-1" />
                        {t('subscriptions.covered')}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{property.name}</h3>
                  {property.coveringSubscription && (
                    <p className="text-sm text-gray-500">
                      {t('subscriptions.planLabel', { name: property.coveringSubscription.planName })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Facturas */}
        {invoicesData && invoicesData.invoices.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{t('subscriptions.paymentHistory')}</h2>
                <p className="text-gray-600 mt-1">
                  {t('subscriptions.totalPaid', { amount: invoicesData.summary.totalPaid.toFixed(2) })}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
              {invoicesData.invoices.slice(0, 5).map((invoice) => (
                <div
                  key={invoice.id}
                  className="p-6 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                        <FileText className="h-6 w-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{invoice.invoiceNumber}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          {formatDate(invoice.createdAt)} · {invoice.subscription?.plan?.name || 'N/A'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">€{invoice.finalAmount.toFixed(2)}</div>
                        <div className="text-sm text-green-600 mt-1">
                          {invoice.status === 'PAID' ? t('subscriptions.invoicePaid') : invoice.status}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => window.open(`/api/user/invoices/${invoice.id}/preview`, '_blank')}
                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                          title={t('subscriptions.viewInvoice')}
                        >
                          <Eye className="h-5 w-5 text-blue-600" />
                        </button>
                        <button
                          onClick={() => window.open(`/api/user/invoices/${invoice.id}/download`, '_blank')}
                          className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                          title={t('subscriptions.downloadPdf')}
                        >
                          <Download className="h-5 w-5 text-green-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Ayuda */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-white">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">{t('subscriptions.needHelp')}</h2>
            <p className="text-gray-300 mb-6">
              {t('subscriptions.needHelpDescription')}
            </p>
            <a
              href="https://wa.me/34652656440"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition-all shadow-lg hover:shadow-xl"
            >
              {t('subscriptions.contactWhatsApp')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
