'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  BookOpen,
  Trophy,
  User,
  Menu,
  X,
  GraduationCap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface NavItemProps {
  href: string
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick?: () => void
}

function NavItem({ href, icon, label, active, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        active
          ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  )
}

export default function AcademiaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = [
    { href: '/academia/dashboard', icon: <Home size={20} />, label: 'Dashboard' },
    { href: '/academia/dashboard', icon: <BookOpen size={20} />, label: 'Mis Cursos' },
    { href: '/academia/leaderboard', icon: <Trophy size={20} />, label: 'Ranking' },
    { href: '/academia/perfil', icon: <User size={20} />, label: 'Mi Perfil' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-violet-50 to-purple-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-16 left-0 right-0 bg-white border-b border-gray-200 z-40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="text-violet-600" size={24} />
          <h1 className="text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Academia Itineramio
          </h1>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40 top-[112px]"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="lg:hidden fixed left-0 top-[112px] bottom-0 w-70 bg-white border-r border-gray-200 z-50 overflow-y-auto"
            >
              <nav className="p-4 space-y-2">
                {navItems.map((item) => (
                  <NavItem
                    key={item.href}
                    {...item}
                    active={pathname === item.href || pathname?.startsWith(item.href + '/')}
                    onClick={() => setSidebarOpen(false)}
                  />
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-16 bottom-0 w-70 bg-white border-r border-gray-200 overflow-y-auto z-30">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg">
              <GraduationCap className="text-white" size={24} />
            </div>
            <div>
              <h2 className="font-bold text-lg bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Academia
              </h2>
              <p className="text-sm text-gray-500">Itineramio</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavItem
                key={item.href}
                {...item}
                active={pathname === item.href || pathname?.startsWith(item.href + '/')}
              />
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-70 pt-16 lg:pt-0">
        {/* Mobile spacing for header */}
        <div className="lg:hidden h-16" />
        {children}
      </main>
    </div>
  )
}
