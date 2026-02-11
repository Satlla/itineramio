'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  Settings,
  Receipt,
  BarChart3,
  ListChecks,
  ChevronLeft,
  Link2,
  CalendarDays,
  Home
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { OnboardingProgress } from '@/components/gestion/OnboardingProgress'
import { ModuleGate } from '@/components/modules'
import { GestionDashboardProvider, useGestionDashboard } from '@/contexts/GestionDashboardContext'

interface NavItem {
  href: string
  labelKey: string
  descriptionKey: string
  icon: React.ReactNode
  badgeKey?: 'unliquidatedReservations' | 'draftInvoices' | 'unpaidInvoices'
}

interface NavCategory {
  titleKey: string
  items: NavItem[]
}

interface PendingActions {
  unliquidatedReservations: number
  draftInvoices: number
  unpaidInvoices: number
}

interface OnboardingStatus {
  companyConfigured: boolean
  hasClients: boolean
  hasConfiguredProperties: boolean
  hasLiquidations: boolean
  allComplete: boolean
}

const navCategories: NavCategory[] = [
  {
    titleKey: 'nav.operations',
    items: [
      {
        href: '/gestion',
        labelKey: 'nav.items.dashboard.title',
        icon: <LayoutDashboard className="w-5 h-5" />,
        descriptionKey: 'nav.items.dashboard.description'
      },
      {
        href: '/gestion/reservas',
        labelKey: 'nav.items.reservations.title',
        icon: <CalendarDays className="w-5 h-5" />,
        descriptionKey: 'nav.items.reservations.description',
        badgeKey: 'unliquidatedReservations'
      },
      {
        href: '/gestion/liquidaciones',
        labelKey: 'nav.items.settlements.title',
        icon: <Receipt className="w-5 h-5" />,
        descriptionKey: 'nav.items.settlements.description'
      },
      {
        href: '/gestion/facturacion',
        labelKey: 'nav.items.billing.title',
        icon: <Building2 className="w-5 h-5" />,
        descriptionKey: 'nav.items.billing.description'
      }
    ]
  },
  {
    titleKey: 'nav.documents',
    items: [
      {
        href: '/gestion/facturas',
        labelKey: 'nav.items.invoices.title',
        icon: <FileText className="w-5 h-5" />,
        descriptionKey: 'nav.items.invoices.description',
        badgeKey: 'draftInvoices'
      },
      {
        href: '/gestion/gastos',
        labelKey: 'nav.items.expenses.title',
        icon: <Receipt className="w-5 h-5" />,
        descriptionKey: 'nav.items.expenses.description'
      }
    ]
  },
  {
    titleKey: 'nav.administration',
    items: [
      {
        href: '/gestion/clientes',
        labelKey: 'nav.items.owners.title',
        icon: <Users className="w-5 h-5" />,
        descriptionKey: 'nav.items.owners.description'
      },
      {
        href: '/gestion/apartamentos',
        labelKey: 'nav.items.apartments.title',
        icon: <Home className="w-5 h-5" />,
        descriptionKey: 'nav.items.apartments.description'
      },
      {
        href: '/gestion/perfil-gestor',
        labelKey: 'nav.items.company.title',
        icon: <ListChecks className="w-5 h-5" />,
        descriptionKey: 'nav.items.company.description'
      },
      {
        href: '/gestion/integraciones',
        labelKey: 'nav.items.integrations.title',
        icon: <Link2 className="w-5 h-5" />,
        descriptionKey: 'nav.items.integrations.description'
      },
      {
        href: '/gestion/rentabilidad',
        labelKey: 'nav.items.profitability.title',
        icon: <BarChart3 className="w-5 h-5" />,
        descriptionKey: 'nav.items.profitability.description'
      }
    ]
  }
]

// Flat list for mobile navigation
const navItems = navCategories.flatMap(cat => cat.items)

// Rutas donde se oculta el sidebar (modo fullscreen)
const fullscreenRoutes = ['/gestion/facturas/nueva', '/gestion/facturas/']

// Badge component
function NavBadge({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">
      {count > 99 ? '99+' : count}
    </span>
  )
}

export default function GestionLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <GestionDashboardProvider>
      <GestionLayoutInner>{children}</GestionLayoutInner>
    </GestionDashboardProvider>
  )
}

function GestionLayoutInner({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { t } = useTranslation('gestion')
  const { pendingActions, onboarding, stats } = useGestionDashboard()
  const recentReservations = stats?.recentReservations || 0

  // Auto-activate GESTION trial on first visit
  useEffect(() => {
    const autoActivateTrial = async () => {
      try {
        // Check if we've already tried to activate (avoid repeated calls)
        const alreadyAttempted = sessionStorage.getItem('gestion-trial-attempted')
        if (alreadyAttempted) return

        sessionStorage.setItem('gestion-trial-attempted', 'true')

        const response = await fetch('/api/modules/auto-activate-gestion', {
          method: 'POST',
          credentials: 'include'
        })

        if (response.ok) {
          const result = await response.json()
          if (result.activated) {
            console.log('🎉 GESTION trial auto-activated')
          }
        }
      } catch (error) {
        // Silently ignore - trial activation is best-effort
        console.error('Error auto-activating GESTION trial:', error)
      }
    }

    autoActivateTrial()
  }, []) // Run only once on mount

  const isActive = (href: string) => {
    if (href === '/gestion') {
      return pathname === '/gestion'
    }
    return pathname.startsWith(href)
  }

  const getBadgeCount = (badgeKey?: 'unliquidatedReservations' | 'draftInvoices' | 'unpaidInvoices') => {
    if (!badgeKey || !pendingActions) return 0
    return pendingActions[badgeKey] || 0
  }

  // Detectar si estamos en modo fullscreen (editor de facturas)
  const isFullscreen = pathname === '/gestion/facturas/nueva' ||
    (pathname.startsWith('/gestion/facturas/') && pathname !== '/gestion/facturas')

  // Si es fullscreen, mostrar solo el children sin sidebar
  if (isFullscreen) {
    return (
      <ModuleGate module="GESTION" overlayClassName="min-h-screen">
        <div className="min-h-screen bg-gray-100">
          {children}
        </div>
      </ModuleGate>
    )
  }

  return (
    <ModuleGate module="GESTION" overlayClassName="min-h-screen">
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Top Navigation */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <Link
            href="/properties"
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {t('nav.properties')}
          </Link>
          <h1 className="font-semibold text-gray-900">{t('nav.title')}</h1>
          <div className="w-20" />
        </div>
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex px-2 pb-2 gap-1">
            {navItems.map(item => {
              const badgeCount = getBadgeCount(item.badgeKey)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                    isActive(item.href)
                      ? 'bg-violet-100 text-violet-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  {t(item.labelKey)}
                  {badgeCount > 0 && (
                    <span className="bg-amber-100 text-amber-700 text-xs font-medium px-1.5 py-0.5 rounded-full">
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white lg:pt-16">
          <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
            <div className="px-4 mb-6">
              <Link
                href="/properties"
                className="flex items-center text-sm text-gray-500 hover:text-gray-700"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                {t('nav.backToProperties')}
              </Link>
              <h2 className="mt-4 text-lg font-bold text-gray-900">
                {t('nav.title')}
              </h2>
              <p className="text-sm text-gray-500">
                {t('nav.subtitle')}
              </p>
            </div>

            <nav className="flex-1 px-2 space-y-4">
              {navCategories.map((category, catIndex) => (
                <div key={category.titleKey}>
                  <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    {t(category.titleKey)}
                  </h3>
                  <div className="space-y-1">
                    {category.items.map(item => {
                      const badgeCount = getBadgeCount(item.badgeKey)
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                            isActive(item.href)
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <span className={`mr-3 flex-shrink-0 ${isActive(item.href) ? 'text-violet-600' : 'text-gray-400 group-hover:text-gray-500'}`}>
                            {item.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="block truncate">{t(item.labelKey)}</span>
                            {item.descriptionKey && (
                              <span className="block text-xs text-gray-400 font-normal truncate">
                                {t(item.descriptionKey)}
                              </span>
                            )}
                          </div>
                          <NavBadge count={badgeCount} />
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:pl-64">
          {children}
        </main>
      </div>

      {/* Onboarding Progress Widget */}
      {onboarding && !onboarding.allComplete && (
        <OnboardingProgress
          progress={{
            hasCompany: onboarding.companyConfigured,
            hasClients: onboarding.hasClients,
            hasConfiguredProperties: onboarding.hasConfiguredProperties,
            hasReservations: recentReservations > 0
          }}
        />
      )}
    </div>
    </ModuleGate>
  )
}
