'use client'

import { useState, useEffect, useRef } from 'react'
import { DashboardNavbar } from '../../src/components/layout/DashboardNavbar'
import { useAuth } from '../../src/providers/AuthProvider'
import { SubscriptionActivatedModal } from '../../src/components/ui/SubscriptionActivatedModal'
import { TrialTopBar } from '../../src/components/ui/TrialTopBar'
import { ImpersonationBanner } from '../../src/components/ui/ImpersonationBanner'
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

export function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()
  const [subscriptionNotification, setSubscriptionNotification] = useState<NotificationData | null>(null)
  const [trialStatus, setTrialStatus] = useState<any>(null)
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean | null>(null)
  const [isTrialBarDismissed, setIsTrialBarDismissed] = useState(false)
  const hasCheckedRef = useRef(false)
  const modalClosedRef = useRef(false)

  // Single consolidated fetch for trial status + subscription notification
  useEffect(() => {
    const fetchDashboardInit = async () => {
      if (!user || hasCheckedRef.current) return
      hasCheckedRef.current = true

      try {
        const response = await fetch('/api/dashboard/init', {
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          setTrialStatus(data.trialStatus)
          setHasActiveSubscription(data.hasActiveSubscription)
          if (data.subscriptionNotification && !modalClosedRef.current) {
            setSubscriptionNotification(data.subscriptionNotification)
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard init:', error)
      }
    }

    fetchDashboardInit()
  }, [user])

  const handleCloseModal = () => {
    modalClosedRef.current = true
    setSubscriptionNotification(null)
  }

  // Determinar si el TrialTopBar está visible
  const isTrialBarVisible = hasActiveSubscription !== null &&
                            hasActiveSubscription !== true &&
                            trialStatus !== null &&
                            !isTrialBarDismissed

  return (
    <OnboardingProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Cortina fija para iOS PWA - tapa contenido que pasa por debajo del status bar */}
        <div
          className="fixed top-0 left-0 right-0 bg-gray-50 pointer-events-none"
          style={{
            height: 'env(safe-area-inset-top, 0px)',
            zIndex: 10000
          }}
          aria-hidden="true"
        />

        {/* Banner de impersonation (siempre al tope) */}
        <ImpersonationBanner />

        {/* Top bar encima del navbar */}
        <TrialTopBar
          trialStatus={trialStatus}
          hasActiveSubscription={hasActiveSubscription}
          onClose={() => setIsTrialBarDismissed(true)}
        />

        <DashboardNavbar
          user={user ? {
            name: user.name,
            email: user.email,
            avatar: user.avatar
          } : undefined}
          isTrialBarVisible={isTrialBarVisible}
        />

        <main className={`transition-all duration-300 ${isTrialBarVisible ? 'pwa-main-content-with-trial' : 'pwa-main-content'}`}>
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
