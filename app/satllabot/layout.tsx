'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, Calendar, BarChart2, Building2, LogOut, Users, Receipt } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/satllabot', label: 'Hoy', icon: Home },
  { href: '/satllabot/calendario', label: 'Calendario', icon: Calendar },
  { href: '/satllabot/kpis', label: 'KPIs', icon: BarChart2 },
  { href: '/satllabot/apartamentos', label: 'Aptos', icon: Building2 },
  { href: '/satllabot/empleadas', label: 'Empleadas', icon: Users },
  { href: '/satllabot/gastos', label: 'Gastos', icon: Receipt },
]

// Mobile bottom nav shows only the first 4 items
const MOBILE_NAV_ITEMS = NAV_ITEMS.slice(0, 4)

export default function SatllaLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  if (pathname === '/satllabot/login') return <>{children}</>

  const handleLogout = async () => {
    await fetch('/api/satllabot/auth/logout', { method: 'POST' })
    router.push('/satllabot/login')
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Desktop sidebar (lg+) */}
      <aside className="hidden lg:flex flex-col w-60 bg-gray-900 border-r border-gray-800 fixed inset-y-0 left-0 z-20">
        <div className="p-4 flex items-center gap-2 border-b border-gray-800">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-xs font-bold text-white">S</span>
          </div>
          <span className="font-semibold text-white">SatllaBot</span>
        </div>
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/satllabot' && pathname.startsWith(href))
            return (
              <button
                key={href}
                onClick={() => router.push(href)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </button>
            )
          })}
        </nav>
        <div className="p-3 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile top bar (< lg) */}
      <header className="lg:hidden bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between fixed top-0 left-0 right-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-xs font-bold text-white">S</span>
          </div>
          <span className="font-semibold text-white">SatllaBot</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-gray-400 hover:text-white transition-colors p-1"
          title="Cerrar sesión"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto lg:ml-60 pt-14 lg:pt-0 pb-20 lg:pb-0">
        {children}
      </main>

      {/* Mobile bottom navigation (< lg) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex safe-area-pb z-10">
        {MOBILE_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/satllabot' && pathname.startsWith(href))
          return (
            <button
              key={href}
              onClick={() => router.push(href)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors ${
                isActive ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
