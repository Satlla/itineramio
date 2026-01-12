'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LogOut,
  Shield,
  Users,
  Home,
  CreditCard,
  Settings,
  Search,
  BarChart3,
  Building2,
  FileText,
  Menu,
  X,
  Tag,
  Star,
  DollarSign,
  TrendingUp,
  Bell,
  Mail,
  ChevronDown,
  ChevronRight,
  Megaphone,
  UsersRound,
  GraduationCap,
  HelpCircle,
  Video
} from 'lucide-react'

// Navigation structure organized by function
const navigationSections = [
  {
    id: 'inicio',
    title: null, // No title for first section
    color: 'red',
    items: [
      { name: 'Dashboard', href: '/admin', icon: Home },
    ]
  },
  {
    id: 'clientes',
    title: 'Clientes',
    color: 'blue',
    items: [
      { name: 'Usuarios', href: '/admin/users', icon: Users },
      { name: 'Suscripciones', href: '/admin/subscription-requests', icon: Bell, badge: true },
      { name: 'Propiedades', href: '/admin/properties', icon: Building2 },
    ]
  },
  {
    id: 'facturacion',
    title: 'Facturación',
    color: 'green',
    items: [
      { name: 'Pagos', href: '/admin/payments', icon: DollarSign },
      { name: 'Facturas', href: '/admin/billing', icon: CreditCard },
      { name: 'Reportes', href: '/admin/reports', icon: FileText },
    ]
  },
  {
    id: 'config',
    title: 'Configuración',
    color: 'gray',
    items: [
      { name: 'Planes', href: '/admin/plans', icon: Settings },
      { name: 'Precios', href: '/admin/pricing', icon: TrendingUp },
      { name: 'Cupones', href: '/admin/coupons', icon: Tag },
      { name: 'Custom Plans', href: '/admin/custom-plans', icon: Star },
    ]
  },
  {
    id: 'marketing',
    title: 'Marketing',
    color: 'violet',
    collapsible: true,
    items: [
      { name: 'Leads Cualificados', href: '/admin/leads', icon: UsersRound, hot: true },
      { name: 'Consultas', href: '/admin/consultas', icon: Video },
      { name: 'Suscriptores', href: '/admin/marketing/leads', icon: Mail },
      { name: 'Embudos', href: '/admin/funnels', icon: Megaphone },
      { name: 'Blog', href: '/admin/blog', icon: FileText },
      { name: 'FAQ', href: '/admin/faq', icon: HelpCircle },
      { name: 'Host Profiles', href: '/admin/host-profiles', icon: UsersRound },
    ]
  },
  {
    id: 'sistema',
    title: 'Sistema',
    color: 'slate',
    collapsible: true,
    items: [
      { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
      { name: 'Audit Logs', href: '/admin/audit-logs', icon: Shield },
      { name: 'Logs', href: '/admin/logs', icon: FileText },
    ]
  },
  {
    id: 'academia',
    title: 'Academia',
    color: 'purple',
    collapsible: true,
    items: [
      { name: 'Leads', href: '/admin/academia/leads', icon: UsersRound },
      { name: 'Quiz Leads', href: '/admin/academia/quiz-leads', icon: Mail },
      { name: 'Usuarios', href: '/admin/academia/users', icon: Users },
    ]
  },
]

// Keep these for backwards compatibility (used in mobile menu)
const adminNavigation = navigationSections.flatMap(s => s.items)
const marketingNavigation = navigationSections.find(s => s.id === 'marketing')?.items || []
const academyNavigation = navigationSections.find(s => s.id === 'academia')?.items || []

export default function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminName, setAdminName] = useState('')
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    marketing: false,
    sistema: true,
    academia: true,
  })
  const [pendingRequests, setPendingRequests] = useState(0)
  const [previousPendingCount, setPreviousPendingCount] = useState(-1) // -1 = not initialized
  const [audioEnabled, setAudioEnabled] = useState(false)

  // Initialize audio context on first user interaction
  useEffect(() => {
    const enableAudio = () => {
      setAudioEnabled(true)
      document.removeEventListener('click', enableAudio)
      document.removeEventListener('keydown', enableAudio)
    }
    document.addEventListener('click', enableAudio)
    document.addEventListener('keydown', enableAudio)
    return () => {
      document.removeEventListener('click', enableAudio)
      document.removeEventListener('keydown', enableAudio)
    }
  }, [])

  // Play notification sound using Web Audio API
  const playNotificationSound = () => {
    if (!audioEnabled) return

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Blip sound configuration
      oscillator.frequency.value = 800 // High pitch for blip
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (error) {
      console.error('Error playing notification sound:', error)
    }
  }

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === '/admin/login') {
      setLoading(false)
      return
    }

    checkAuth()
  }, [pathname])

  useEffect(() => {
    if (isAuthenticated) {
      fetchPendingRequests()
      // Poll every 30 seconds for new requests
      const interval = setInterval(fetchPendingRequests, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  // Monitor pending requests and play sound when count increases
  useEffect(() => {
    // Only play sound if count increased and this is not the initial load
    if (previousPendingCount >= 0 && pendingRequests > previousPendingCount) {
      console.log('🔔 Playing notification sound - new requests:', pendingRequests)
      playNotificationSound()
    }
    setPreviousPendingCount(pendingRequests)
  }, [pendingRequests, audioEnabled])

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch('/api/admin/subscription-requests/pending-count', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setPendingRequests(data.count)
      } else {
        // Silently fail - not critical
        setPendingRequests(0)
      }
    } catch (error) {
      // Silently fail - notification badge not critical for admin functionality
      setPendingRequests(0)
    }
  }

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth/check', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setIsAuthenticated(true)
        setAdminName(data.admin.name)
      } else {
        router.push('/admin/login')
      }
    } catch (error) {
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Show nothing while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  // Login page doesn't need the admin header
  if (pathname === '/admin/login') {
    return children
  }

  // Protected admin pages
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white shadow-lg sticky top-0 z-50">
        <div className="mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center min-w-0">
              {/* Mobile menu button */}
              <button
                type="button"
                className="lg:hidden p-1.5 sm:p-2 rounded-md text-gray-400 hover:text-gray-200 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 mr-2"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? (
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                ) : (
                  <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                )}
              </button>

              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 mr-2 sm:mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-sm sm:text-lg lg:text-xl font-semibold truncate">Panel Admin</h1>
                <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">Itineramio</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Notifications Icon */}
              <Link
                href="/admin/subscription-requests"
                className="relative p-1.5 sm:p-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-300" />
                {pendingRequests > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                    {pendingRequests > 9 ? '9+' : pendingRequests}
                  </span>
                )}
              </Link>

              <span className="text-xs sm:text-sm text-gray-300 hidden md:block truncate max-w-32">
                {adminName}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 sm:space-x-2 bg-gray-800 hover:bg-gray-700 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
            <nav className="fixed top-0 left-0 bottom-0 flex flex-col w-64 max-w-[80vw] bg-white shadow-xl pt-14 sm:pt-16 overflow-hidden">
              <div className="flex-1 px-3 py-4 overflow-y-auto">
                {navigationSections.map((section, sectionIndex) => {
                  const isCollapsible = section.collapsible
                  const isCollapsed = collapsedSections[section.id]
                  const colorClasses: Record<string, { bg: string; text: string; border: string; icon: string }> = {
                    red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-600', icon: 'text-red-600' },
                    blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-600', icon: 'text-blue-600' },
                    green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-600', icon: 'text-green-600' },
                    gray: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-600', icon: 'text-gray-600' },
                    violet: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-600', icon: 'text-violet-600' },
                    slate: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-600', icon: 'text-slate-600' },
                    purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-600', icon: 'text-purple-600' },
                  }
                  const colors = colorClasses[section.color] || colorClasses.gray

                  return (
                    <div key={section.id}>
                      {/* Section separator */}
                      {sectionIndex > 0 && section.title && (
                        <div className="my-3 border-t border-gray-200"></div>
                      )}

                      {/* Section title (if collapsible) */}
                      {section.title && isCollapsible && (
                        <button
                          onClick={() => setCollapsedSections(prev => ({ ...prev, [section.id]: !prev[section.id] }))}
                          className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:bg-gray-50 rounded-md transition-colors"
                        >
                          <span>{section.title}</span>
                          {isCollapsed ? (
                            <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                          )}
                        </button>
                      )}

                      {/* Section title (if NOT collapsible) */}
                      {section.title && !isCollapsible && (
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {section.title}
                        </div>
                      )}

                      {/* Section items */}
                      {(!isCollapsible || !isCollapsed) && (
                        <div className={isCollapsible ? 'ml-1' : ''}>
                          {section.items.map((item: any) => {
                            const isActive = pathname === item.href ||
                              (item.href !== '/admin' && pathname.startsWith(item.href))
                            return (
                              <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-md mb-0.5 transition-colors ${
                                  isActive
                                    ? `${colors.bg} ${colors.text} border-l-3 ${colors.border}`
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100'
                                }`}
                              >
                                <item.icon
                                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                                    isActive ? colors.icon : 'text-gray-400 group-hover:text-gray-600'
                                  }`}
                                />
                                <span className="truncate">{item.name}</span>
                                {item.hot && (
                                  <span className="ml-auto px-1.5 py-0.5 text-xs font-bold bg-rose-100 text-rose-600 rounded">
                                    HOT
                                  </span>
                                )}
                                {item.badge && pendingRequests > 0 && (
                                  <span className="ml-auto px-1.5 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full min-w-[1.25rem] text-center">
                                    {pendingRequests > 9 ? '9+' : pendingRequests}
                                  </span>
                                )}
                              </Link>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </nav>
          </div>
        )}

        {/* Desktop sidebar */}
        <nav className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-screen pt-4 sticky top-16">
          <div className="px-3 pb-4 overflow-y-auto max-h-[calc(100vh-4rem)]">
            {navigationSections.map((section, sectionIndex) => {
              const isCollapsible = section.collapsible
              const isCollapsed = collapsedSections[section.id]
              const colorClasses: Record<string, { bg: string; text: string; border: string; icon: string }> = {
                red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-600', icon: 'text-red-600' },
                blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-600', icon: 'text-blue-600' },
                green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-600', icon: 'text-green-600' },
                gray: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-600', icon: 'text-gray-600' },
                violet: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-600', icon: 'text-violet-600' },
                slate: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-600', icon: 'text-slate-600' },
                purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-600', icon: 'text-purple-600' },
              }
              const colors = colorClasses[section.color] || colorClasses.gray

              return (
                <div key={section.id}>
                  {/* Section separator */}
                  {sectionIndex > 0 && section.title && (
                    <div className="my-3 border-t border-gray-200"></div>
                  )}

                  {/* Section title (if collapsible) */}
                  {section.title && isCollapsible && (
                    <button
                      onClick={() => setCollapsedSections(prev => ({ ...prev, [section.id]: !prev[section.id] }))}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <span>{section.title}</span>
                      {isCollapsed ? (
                        <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                      )}
                    </button>
                  )}

                  {/* Section title (if NOT collapsible) */}
                  {section.title && !isCollapsible && (
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {section.title}
                    </div>
                  )}

                  {/* Section items */}
                  {(!isCollapsible || !isCollapsed) && (
                    <div className={isCollapsible ? 'ml-1' : ''}>
                      {section.items.map((item: any) => {
                        const isActive = pathname === item.href ||
                          (item.href !== '/admin' && pathname.startsWith(item.href))
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md mb-0.5 transition-colors ${
                              isActive
                                ? `${colors.bg} ${colors.text} border-l-3 ${colors.border}`
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                          >
                            <item.icon
                              className={`mr-3 h-4 w-4 flex-shrink-0 ${
                                isActive ? colors.icon : 'text-gray-400 group-hover:text-gray-500'
                              }`}
                            />
                            <span className="truncate">{item.name}</span>
                            {item.hot && (
                              <span className="ml-auto px-1.5 py-0.5 text-xs font-bold bg-rose-100 text-rose-600 rounded">
                                HOT
                              </span>
                            )}
                            {item.badge && pendingRequests > 0 && (
                              <span className="ml-auto px-1.5 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full min-w-[1.25rem] text-center">
                                {pendingRequests > 9 ? '9+' : pendingRequests}
                              </span>
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 w-full min-w-0 p-3 sm:p-4 md:p-5 lg:p-6 pb-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}