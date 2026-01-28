'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  User,
  Settings,
  Globe,
  BookOpen,
  HelpCircle,
  LogOut,
  ChevronRight,
  Shield,
  CreditCard,
  Home,
  Bell,
  Receipt,
  Layers,
  Image,
  Briefcase
} from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { ItineramioLogo } from '../ui/ItineramioLogo'
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher'
import { useRealNotifications } from '../../hooks/useRealNotifications'

interface MenuItem {
  icon: React.ReactElement
  label: string
  href?: string
  description: string
  badge?: number
  mobileOnly?: boolean
  onClick?: () => void
}

interface SideMenuProps {
  isOpen: boolean
  onClose: () => void
  notificationCount?: number
  user?: {
    name: string
    email: string
    avatar?: string
  }
}

export function SideMenu({ isOpen, onClose, notificationCount = 0, user }: SideMenuProps) {
  const { t } = useTranslation('common')
  const { unreadCount } = useRealNotifications()

  const menuItems: MenuItem[] = [
    {
      icon: <Home className="w-5 h-5" />,
      label: "Propiedades",
      href: "/properties",
      description: "Gestionar tus propiedades",
      mobileOnly: true
    },
    {
      icon: <Layers className="w-5 h-5" />,
      label: "Conjuntos",
      href: "/properties?tab=sets",
      description: "Agrupar propiedades similares",
      mobileOnly: true
    },
    {
      icon: <Briefcase className="w-5 h-5" />,
      label: "Gestión",
      href: "/gestion",
      description: "Facturación, gastos y rentabilidad",
      mobileOnly: true
    },
    {
      icon: <Image className="w-5 h-5" />,
      label: "Biblioteca de Medios",
      href: "/media-library",
      description: "Gestionar imágenes y archivos"
    },
    {
      icon: <User className="w-5 h-5" />,
      label: "Cuenta",
      href: "/account",
      description: "Información personal y configuración"
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: "Configuración",
      href: "/account/notifications",
      description: "Editar tu perfil y preferencias"
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      label: "Suscripciones",
      href: "/subscriptions",
      description: "Gestiona tus suscripciones y facturas"
    },
    {
      icon: <Receipt className="w-5 h-5" />,
      label: "Facturación",
      href: "/account/billing",
      description: "Datos de facturación y documentación"
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      label: "Recursos del Host",
      href: "/recursos",
      description: "Guías y mejores prácticas"
    },
    {
      icon: <HelpCircle className="w-5 h-5" />,
      label: "Ayuda",
      href: "/help",
      description: "Centro de ayuda y soporte"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      label: "Privacidad",
      href: "/privacy",
      description: "Configuración de privacidad"
    }
  ]

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Side Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed top-0 right-0 h-full w-[85vw] sm:w-80 max-w-sm bg-white shadow-2xl z-50 overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              paddingTop: 'env(safe-area-inset-top, 0px)',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)'
            }}
          >
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Menú</h2>
                <button
                  onClick={onClose}
                  className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* User Info */}
              <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 rounded-xl mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 sm:w-6 sm:h-6" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate text-sm sm:text-base">
                    {user?.name || 'Usuario'}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    {user?.email || 'usuario@email.com'}
                  </p>
                </div>
              </div>

              {/* Menu Items */}
              <div className="space-y-2">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={item.mobileOnly ? "block md:hidden" : ""}
                  >
                    {item.onClick ? (
                      <button
                        onClick={() => {
                          item.onClick!()
                        }}
                        className="w-full flex items-center justify-between p-3 sm:p-4 rounded-xl hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex items-start space-x-2 sm:space-x-3 min-w-0">
                          <div className="text-gray-500 group-hover:text-violet-600 transition-colors flex-shrink-0">
                            {item.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 group-hover:text-violet-600 transition-colors text-sm sm:text-base">
                              {item.label}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500 truncate">
                              {item.description}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-violet-600 transition-colors flex-shrink-0" />
                      </button>
                    ) : (
                      <Link
                        href={item.href || '#'}
                        onClick={onClose}
                        className="flex items-center justify-between p-3 sm:p-4 rounded-xl hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex items-start space-x-2 sm:space-x-3 min-w-0">
                          <div className="text-gray-500 group-hover:text-violet-600 transition-colors flex-shrink-0">
                            {item.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 group-hover:text-violet-600 transition-colors text-sm sm:text-base">
                              {item.label}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500 truncate">
                              {item.description}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-violet-600 transition-colors flex-shrink-0" />
                      </Link>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Language Switcher Section */}
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                  <span className="font-medium text-gray-900 text-sm sm:text-base">Idioma</span>
                </div>
                <div className="pl-6 sm:pl-8">
                  <LanguageSwitcher />
                </div>
              </div>

              {/* Logout */}
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                <motion.button
                  className="flex items-center space-x-2 sm:space-x-3 w-full p-3 sm:p-4 rounded-xl hover:bg-red-50 transition-colors group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/auth/logout', {
                        method: 'POST'
                      })
                      if (response.ok) {
                        window.location.href = '/login'
                      }
                    } catch (error) {
                      console.error('Error logging out:', error)
                    }
                  }}
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 group-hover:text-red-600 transition-colors flex-shrink-0" />
                  <span className="font-medium text-gray-900 group-hover:text-red-600 transition-colors text-sm sm:text-base">
                    Cerrar sesión
                  </span>
                </motion.button>
              </div>

              {/* Footer */}
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 text-center">
                <div className="flex items-center justify-center space-x-1.5 sm:space-x-2 mb-1.5 sm:mb-2">
                  <ItineramioLogo size="sm" gradient />
                  <span className="text-xs sm:text-sm font-medium" style={{ color: '#484848' }}>Itineramio</span>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-500">
                  Versión 2.0 • © 2025 Itineramio
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}