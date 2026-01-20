'use client'

import React from 'react'
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
  ChevronLeft
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  description?: string
}

const navItems: NavItem[] = [
  {
    href: '/gestion',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    description: 'Resumen general'
  },
  {
    href: '/gestion/facturacion',
    label: 'Facturación',
    icon: <Building2 className="w-5 h-5" />,
    description: 'Por propiedad'
  },
  {
    href: '/gestion/facturas',
    label: 'Facturas',
    icon: <FileText className="w-5 h-5" />,
    description: 'Todas las facturas'
  },
  {
    href: '/gestion/clientes',
    label: 'Clientes',
    icon: <Users className="w-5 h-5" />,
    description: 'Propietarios y clientes'
  },
  {
    href: '/gestion/gastos',
    label: 'Gastos',
    icon: <Receipt className="w-5 h-5" />,
    description: 'Control de gastos'
  },
  {
    href: '/gestion/rentabilidad',
    label: 'Rentabilidad',
    icon: <BarChart3 className="w-5 h-5" />,
    description: 'Informes y métricas'
  },
  {
    href: '/gestion/configuracion',
    label: 'Configuración',
    icon: <Settings className="w-5 h-5" />,
    description: 'Propiedades y comisiones'
  },
  {
    href: '/gestion/perfil-gestor',
    label: 'Mi Empresa',
    icon: <ListChecks className="w-5 h-5" />,
    description: 'Datos fiscales y logo'
  }
]

export default function GestionLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/gestion') {
      return pathname === '/gestion'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Top Navigation */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <Link
            href="/properties"
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Propiedades
          </Link>
          <h1 className="font-semibold text-gray-900">Gestión</h1>
          <div className="w-20" />
        </div>
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex px-2 pb-2 gap-1">
            {navItems.map(item => (
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
                {item.label}
              </Link>
            ))}
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
                Volver a Propiedades
              </Link>
              <h2 className="mt-4 text-lg font-bold text-gray-900">
                Gestión
              </h2>
              <p className="text-sm text-gray-500">
                Facturación y contabilidad
              </p>
            </div>

            <nav className="flex-1 px-2 space-y-1">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-violet-50 text-violet-700 border-l-4 border-violet-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className={`mr-3 ${isActive(item.href) ? 'text-violet-600' : 'text-gray-400 group-hover:text-gray-500'}`}>
                    {item.icon}
                  </span>
                  <div>
                    <span className="block">{item.label}</span>
                    {item.description && (
                      <span className="block text-xs text-gray-400 font-normal">
                        {item.description}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:pl-64">
          {children}
        </main>
      </div>
    </div>
  )
}
