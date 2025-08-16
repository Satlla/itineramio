'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BillingOverview } from '../../../../src/components/billing/BillingOverview'
import { SubscriptionCard } from '../../../../src/components/billing/SubscriptionCard'
import { PropertySubscriptionStatus } from '../../../../src/components/billing/PropertySubscriptionStatus'
import { InvoiceTable } from '../../../../src/components/billing/InvoiceTable'
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '../../../../src/components/ui/tabs'
import { useAuth } from '../../../../src/providers/AuthProvider'
import { useNotifications } from '../../../../src/hooks/useNotifications'

interface SubscriptionData {
  subscriptions: Array<{
    id: string
    status: string
    startDate: string
    endDate: string
    daysUntilExpiration: number
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
    isActive: boolean
    isCovered: boolean
    needsSubscription: boolean
    coveringSubscription?: {
      id: string
      planName: string
      endDate: string
      daysUntilExpiration: number
      status: string
    }
  }>
  usage: {
    freeLimit: number
    usedSlots: number
    availableSlots: number
    totalProperties: number
    uncoveredProperties: number
  }
  summary: {
    totalProperties: number
    coveredProperties: number
    uncoveredProperties: number
    activeSubscriptions: number
  }
}

interface InvoicesData {
  invoices: Array<{
    id: string
    invoiceNumber: string
    amount: number
    discountAmount: number
    finalAmount: number
    status: string
    paymentMethod?: string
    paymentReference?: string
    dueDate: string
    paidDate?: string
    createdAt: string
    subscription?: {
      id: string
      plan?: {
        name: string
      }
    }
  }>
  summary: {
    totalPaid: number
    pendingAmount: number
    totalInvoices: number
  }
}

export default function SubscriptionsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  
  const [loading, setLoading] = useState(true)
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null)
  const [propertiesData, setPropertiesData] = useState<PropertiesData | null>(null)
  const [invoicesData, setInvoicesData] = useState<InvoicesData | null>(null)
  const [renewingSubscription, setRenewingSubscription] = useState<string | null>(null)

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
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudieron cargar los datos. Inténtalo de nuevo.',
        read: false
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/user/subscriptions')
      if (response.ok) {
        const data = await response.json()
        setSubscriptionData(data)
      } else {
        throw new Error('Failed to fetch subscriptions')
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    }
  }

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/user/properties-subscription')
      if (response.ok) {
        const data = await response.json()
        setPropertiesData(data)
      } else {
        throw new Error('Failed to fetch properties')
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
    }
  }

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/user/invoices?limit=10')
      if (response.ok) {
        const data = await response.json()
        setInvoicesData(data)
      } else {
        throw new Error('Failed to fetch invoices')
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
    }
  }

  const handleBuyNewSubscription = () => {
    router.push('/account/plans')
  }

  const handleRenewSubscription = async (subscriptionId: string) => {
    try {
      setRenewingSubscription(subscriptionId)
      
      // Create a renewal request (similar to buying new subscription)
      const response = await fetch('/api/subscription-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          renewalFor: subscriptionId,
          requestType: 'RENEWAL'
        })
      })

      if (response.ok) {
        addNotification({
          type: 'success',
          title: 'Solicitud de renovación enviada',
          message: 'Serás redirigido al proceso de pago para renovar tu suscripción',
          read: false
        })
        
        // Redirect to plans page with renewal context
        router.push(`/account/plans?renewal=${subscriptionId}`)
      } else {
        throw new Error('Failed to create renewal request')
      }
    } catch (error) {
      console.error('Error renewing subscription:', error)
      addNotification({
        type: 'error',
        title: 'Error al renovar',
        message: 'No se pudo procesar la renovación. Inténtalo de nuevo.',
        read: false
      })
    } finally {
      setRenewingSubscription(null)
    }
  }

  const handleRenewAllSubscriptions = async () => {
    // For now, redirect to plans page - could implement bulk renewal later
    router.push('/account/plans?renewAll=true')
  }

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `factura-${invoiceId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        throw new Error('Failed to download invoice')
      }
    } catch (error) {
      console.error('Error downloading invoice:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo descargar la factura',
        read: false
      })
    }
  }

  const handleViewInvoice = (invoice: any) => {
    // Open invoice in new window
    window.open(`/invoices/${invoice.id}`, '_blank')
  }

  // Prepare data for BillingOverview
  const getSubscriptionsOverviewData = () => {
    if (!subscriptionData) return {
      activeSubscriptions: 0,
      totalSlots: 0,
      expiringCount: 0,
      expiredCount: 0
    }

    const activeSubscriptions = subscriptionData.subscriptions.filter(sub => sub.status === 'ACTIVE').length
    const totalSlots = subscriptionData.subscriptions
      .filter(sub => sub.status === 'ACTIVE')
      .reduce((total, sub) => total + (sub.plan?.maxProperties || 0), 0)
    
    const expiringCount = subscriptionData.subscriptions.filter(sub => sub.status === 'EXPIRING_SOON').length
    const expiredCount = subscriptionData.subscriptions.filter(sub => sub.status === 'EXPIRED').length
    
    // Find next expiration
    const nextExpiring = subscriptionData.subscriptions
      .filter(sub => sub.status === 'ACTIVE' && sub.daysUntilExpiration <= 30)
      .sort((a, b) => a.daysUntilExpiration - b.daysUntilExpiration)[0]

    return {
      activeSubscriptions,
      totalSlots,
      nextExpiration: nextExpiring ? {
        date: nextExpiring.endDate,
        daysUntil: nextExpiring.daysUntilExpiration,
        planName: nextExpiring.plan?.name || 'Plan personalizado'
      } : undefined,
      expiringCount,
      expiredCount
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Suscripciones y Facturación</h1>
        <p className="text-gray-600 mt-2">
          Gestiona tus suscripciones activas, propiedades cubiertas y historial de facturas
        </p>
      </div>

      {/* Billing Overview */}
      {subscriptionData && (
        <BillingOverview
          currentPlan={subscriptionData.currentPlan}
          planStatus={subscriptionData.planStatus}
          propertyCount={subscriptionData.propertyCount}
          subscriptionsData={getSubscriptionsOverviewData()}
          onBuyNewSubscription={handleBuyNewSubscription}
          onRenewAll={handleRenewAllSubscriptions}
          isLoading={loading}
        />
      )}

      {/* Tabs */}
      <Tabs defaultValue="subscriptions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="subscriptions">Suscripciones Activas</TabsTrigger>
          <TabsTrigger value="properties">Propiedades</TabsTrigger>
          <TabsTrigger value="invoices">Facturas</TabsTrigger>
        </TabsList>

        {/* Active Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Tus Suscripciones</h2>
            {subscriptionData?.subscriptions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes suscripciones activas</h3>
                <p className="text-gray-600 mb-4">
                  Compra tu primera suscripción para expandir tu límite de propiedades
                </p>
                <button
                  onClick={handleBuyNewSubscription}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Comprar Suscripción
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subscriptionData?.subscriptions.map((subscription) => (
                  <SubscriptionCard
                    key={subscription.id}
                    subscription={subscription}
                    onRenew={handleRenewSubscription}
                    isRenewing={renewingSubscription === subscription.id}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Properties Tab */}
        <TabsContent value="properties" className="space-y-6">
          {propertiesData && (
            <PropertySubscriptionStatus
              properties={propertiesData.properties}
              usage={propertiesData.usage}
            />
          )}
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-6">
          {invoicesData && (
            <InvoiceTable
              invoices={invoicesData.invoices}
              summary={invoicesData.summary}
              onDownloadInvoice={handleDownloadInvoice}
              onViewInvoice={handleViewInvoice}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}