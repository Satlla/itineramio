'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { usePathname } from 'next/navigation'

interface DashboardStats {
  totalProperties: number
  totalOwners: number
  totalInvoices: number
  pendingInvoices: number
  yearlyIncome: number
  yearlyCommission: number
  monthlyIncome: number
  monthlyCommission: number
  pendingLiquidations: number
  recentReservations: number
  yearlyReservations: number
  totalExpenses: number
}

interface OnboardingStatus {
  companyConfigured: boolean
  hasClients: boolean
  hasConfiguredProperties: boolean
  hasLiquidations: boolean
  allComplete: boolean
}

interface PendingActions {
  unliquidatedReservations: number
  draftInvoices: number
  unpaidInvoices: number
}

interface GestionDashboardContextType {
  stats: DashboardStats | null
  onboarding: OnboardingStatus | null
  pendingActions: PendingActions | null
  loading: boolean
  refresh: () => Promise<void>
}

const GestionDashboardContext = createContext<GestionDashboardContextType | undefined>(undefined)

export function GestionDashboardProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [onboarding, setOnboarding] = useState<OnboardingStatus | null>(null)
  const [pendingActions, setPendingActions] = useState<PendingActions | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/gestion/dashboard', {
        credentials: 'include',
        cache: 'no-store'
      })
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setOnboarding(data.onboarding)
        setPendingActions(data.pendingActions)
      }
    } catch (error) {
      // Silently ignore fetch errors
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch on mount and when pathname changes
  useEffect(() => {
    const timer = setTimeout(fetchData, 100)
    return () => clearTimeout(timer)
  }, [pathname, fetchData])

  const value = useMemo(() => ({
    stats,
    onboarding,
    pendingActions,
    loading,
    refresh: fetchData
  }), [stats, onboarding, pendingActions, loading, fetchData])

  return (
    <GestionDashboardContext.Provider value={value}>
      {children}
    </GestionDashboardContext.Provider>
  )
}

export function useGestionDashboard() {
  const context = useContext(GestionDashboardContext)
  if (context === undefined) {
    throw new Error('useGestionDashboard must be used within a GestionDashboardProvider')
  }
  return context
}
