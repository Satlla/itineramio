'use client'

import { useState, useEffect, useRef } from 'react'
import { DashboardNavbar } from '../../src/components/layout/DashboardNavbar'
import { useAuth } from '../../src/providers/AuthProvider'
import { SubscriptionActivatedModal } from '../../src/components/ui/SubscriptionActivatedModal'
import { TrialTopBar } from '../../src/components/ui/TrialTopBar'
import { CookieBanner } from '../../src/components/ui/CookieBanner'
import { OnboardingProvider } from '../../src/contexts/OnboardingContext'

interface NotificationData {
  id: string
  data?: {
    planName?: string
    subscriptionId?: string
    invoiceId?: string
  }
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()
  const [subscriptionNotification, setSubscriptionNotification] = useState<NotificationData | null>(null)
  const [trialStatus, setTrialStatus] = useState<any>(null)
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean | null>(null)
  const hasCheckedRef = useRef(false)
  const modalClosedRef = useRef(false)

  useEffect(() => {
    // Verificar si hay una notificación de suscripción activada no leída
    const checkForActivatedSubscription = async () => {
      // Evitar múltiples checks o si el modal ya fue cerrado
      if (hasCheckedRef.current || modalClosedRef.current) return
      hasCheckedRef.current = true

      try {
        const response = await fetch('/api/notifications?type=subscription_approved&read=false&limit=1', {
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          if (data.notifications && data.notifications.length > 0) {
            setSubscriptionNotification(data.notifications[0])
          }
        }
      } catch (error) {
        console.error('Error checking subscription notifications:', error)
      }
    }

    if (user && !hasCheckedRef.current) {
      checkForActivatedSubscription()
    }
  }, [user])

  // Obtener estado del trial y suscripción
  useEffect(() => {
    const fetchTrialStatus = async () => {
      if (!user) return

      try {
        const response = await fetch('/api/account/plan-info', {
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          setTrialStatus(data.trialStatus)
          setHasActiveSubscription(data.hasActiveSubscription)
        }
      } catch (error) {
        console.error('Error fetching trial status:', error)
      }
    }

    fetchTrialStatus()
  }, [user])

  const handleCloseModal = () => {
    modalClosedRef.current = true
    setSubscriptionNotification(null)
  }

  // Determinar si el TrialTopBar está visible
  const isTrialBarVisible = hasActiveSubscription !== null &&
                            hasActiveSubscription !== true &&
                            (trialStatus !== null)

  return (
    <OnboardingProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Top bar encima del navbar */}
        <TrialTopBar
          trialStatus={trialStatus}
          hasActiveSubscription={hasActiveSubscription}
        />

        <DashboardNavbar
          user={user ? {
            name: user.name,
            email: user.email,
            avatar: user.avatar
          } : undefined}
          isTrialBarVisible={isTrialBarVisible}
        />

        <main className={`transition-all duration-300 ${isTrialBarVisible ? "pt-[112px]" : "pt-16"}`}>
          {children}
        </main>

        {/* Modal de suscripción activada */}
        {subscriptionNotification && !modalClosedRef.current && (
          <SubscriptionActivatedModal
            notification={subscriptionNotification}
            onClose={handleCloseModal}
          />
        )}

        {/* Cookie Banner */}
        <CookieBanner />
      </div>
    </OnboardingProvider>
  )
}