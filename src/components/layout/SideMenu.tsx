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
  Bell
} from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher'
import { NotificationCenter } from '../ui/NotificationCenter'
import { useNotifications } from '../../hooks/useNotifications'

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
  const [showNotifications, setShowNotifications] = useState(false)
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  const menuItems = [
    {
      icon: <Home className="w-5 h-5" />,
      label: "Mis Propiedades",
      href: "/properties",
      description: "Gestionar propiedades y conjuntos",
      mobileOnly: true
    },
    {
      icon: (
        <div className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </div>
          )}
        </div>
      ),
      label: "Notificaciones",
      onClick: () => setShowNotifications(true),
      description: `${unreadCount} notificaciones sin leer`,
      badge: unreadCount
    },
    {
      icon: <User className="w-5 h-5" />,
      label: "Cuenta",
      href: "/account",
      description: "Información personal y configuración"
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: "Perfil",
      href: "/profile",
      description: "Editar tu perfil y preferencias"
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      label: "Facturación",
      href: "/billing",
      description: "Gestiona tu suscripción y pagos"
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      label: "Recursos para anfitriones",
      href: "/resources",
      description: "Guías y mejores prácticas"
    },
    {
      icon: <HelpCircle className="w-5 h-5" />,
      label: "Recibe Ayuda",
      href: "/help",
      description: "Centro de ayuda y soporte"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      label: "Privacidad y seguridad",
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
            className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-semibold text-gray-900">Menú</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* User Info */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {user?.name || 'Usuario'}
                  </h3>
                  <p className="text-sm text-gray-500">
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
                        className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="text-gray-500 group-hover:text-violet-600 transition-colors">
                            {item.icon}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 group-hover:text-violet-600 transition-colors">
                              {item.label}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.description}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-violet-600 transition-colors" />
                      </button>
                    ) : (
                      <Link
                        href={item.href || '#'}
                        onClick={onClose}
                        className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors group"
                      >
                      <div className="flex items-start space-x-3">
                        <div className="text-gray-500 group-hover:text-violet-600 transition-colors">
                          {item.icon}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 group-hover:text-violet-600 transition-colors">
                            {item.label}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.description}
                          </div>
                        </div>
                      </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-violet-600 transition-colors" />
                      </Link>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Language Switcher Section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                  <Globe className="w-5 h-5 text-gray-500" />
                  <span className="font-medium text-gray-900">Cambiar idioma</span>
                </div>
                <div className="pl-8">
                  <LanguageSwitcher />
                </div>
              </div>

              {/* Logout */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <motion.button
                  className="flex items-center space-x-3 w-full p-4 rounded-xl hover:bg-red-50 transition-colors group"
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
                  <LogOut className="w-5 h-5 text-gray-500 group-hover:text-red-600 transition-colors" />
                  <span className="font-medium text-gray-900 group-hover:text-red-600 transition-colors">
                    Cerrar sesión
                  </span>
                </motion.button>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">I</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Itineramio</span>
                </div>
                <p className="text-xs text-gray-500">
                  Versión 2.0 • © 2024 Itineramio
                </p>
              </div>
            </div>
            
            {/* Notification Center */}
            <NotificationCenter
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
              onBack={() => setShowNotifications(false)}
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}