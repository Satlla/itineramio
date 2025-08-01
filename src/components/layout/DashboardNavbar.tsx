'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, User, Zap } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { SideMenu } from './SideMenu'
import { useNotifications } from '../../hooks/useNotifications'

interface DashboardNavbarProps {
  user?: {
    name: string
    email: string
    avatar?: string
  }
}

export function DashboardNavbar({ user }: DashboardNavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { t } = useTranslation('common')
  const { unreadCount } = useNotifications()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/90 backdrop-blur-md border-b border-neutral-200/50 shadow-lg' 
            : 'bg-white/80 backdrop-blur-sm'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <motion.div
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
            >
              <Link href="/main" className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent hidden xs:block">
                  Itineramio
                </span>
              </Link>
            </motion.div>

            {/* Center - Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/main"
                className="text-gray-700 hover:text-violet-600 font-medium transition-colors relative group"
              >
                Panel Principal
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-600 transition-all duration-300 group-hover:w-full" />
              </Link>
              <Link
                href="/properties"
                className="text-gray-700 hover:text-violet-600 font-medium transition-colors relative group"
              >
                Mis Propiedades
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-600 transition-all duration-300 group-hover:w-full" />
              </Link>
              <Link
                href="/properties/groups"
                className="text-gray-700 hover:text-violet-600 font-medium transition-colors relative group"
              >
                Conjuntos
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-600 transition-all duration-300 group-hover:w-full" />
              </Link>
              <Link
                href="/media-library"
                className="text-gray-700 hover:text-violet-600 font-medium transition-colors relative group"
              >
                Biblioteca de Medios
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-600 transition-all duration-300 group-hover:w-full" />
              </Link>
            </div>

            {/* Right Side - User Profile & Menu */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* User Avatar */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="relative"
              >
                <Link 
                  href="/account"
                  className="block w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                >
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </Link>
                {unreadCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg"
                  >
                    <span className="text-white text-[10px] sm:text-xs font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  </motion.div>
                )}
              </motion.div>

              {/* Menu Button */}
              <motion.button
                onClick={() => setIsMenuOpen(true)}
                className="p-1.5 sm:p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors shadow-sm border border-gray-200"
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Menu className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Side Menu */}
      <SideMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        notificationCount={unreadCount}
        user={user}
      />
    </>
  )
}