'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, User, Zap, Bell } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { SideMenu } from './SideMenu'
import { useRealNotifications } from '../../hooks/useRealNotifications'
import { useRouter } from 'next/navigation'

interface DashboardNavbarProps {
  user?: {
    name: string
    email: string
    avatar?: string
  }
  isTrialBarVisible?: boolean
}

export function DashboardNavbar({ user, isTrialBarVisible = false }: DashboardNavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [previousUnreadCount, setPreviousUnreadCount] = useState(-1) // -1 = not initialized
  const [audioEnabled, setAudioEnabled] = useState(false)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { t } = useTranslation('common')
  const { unreadCount } = useRealNotifications()

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
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Monitor unreadCount and play sound when it increases
  useEffect(() => {
    // Only play sound if count increased and this is not the initial load
    if (previousUnreadCount >= 0 && unreadCount > previousUnreadCount) {
      console.log('🔔 Playing notification sound - new notifications:', unreadCount)
      playNotificationSound()
    }
    setPreviousUnreadCount(unreadCount)
  }, [unreadCount, audioEnabled])

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false)
      }
    }

    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isNotificationsOpen])

  return (
    <>
      <motion.nav
        className={`fixed left-0 right-0 z-[100] transition-all duration-300 ${
          scrolled
            ? 'bg-white border-b border-neutral-200/50 shadow-lg'
            : 'bg-white border-b border-neutral-100'
        }`}
        style={{
          top: isTrialBarVisible
            ? 'calc(48px + env(safe-area-inset-top, 0px))'
            : 'env(safe-area-inset-top, 0px)'
        }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12 sm:h-14 md:h-16">
            {/* Logo */}
            <motion.div
              className="flex items-center space-x-1 sm:space-x-2"
              whileHover={{ scale: 1.05 }}
            >
              <Link href="/main" className="flex items-center space-x-1">
                <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                </div>
                <span className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent hidden xs:block">
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

            {/* Right Side - Notifications, User Profile & Menu */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Notifications Bell */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="relative"
                ref={notificationsRef}
              >
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative p-1.5 sm:p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <span className="text-white text-[10px] sm:text-xs font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    </motion.div>
                  )}
                </button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {isNotificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="fixed left-3 right-3 top-14 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-80 sm:max-w-sm bg-white rounded-lg shadow-2xl border border-gray-200 z-50"
                    >
                      <div className="p-4 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-900">Notificaciones</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {unreadCount === 0 ? (
                          <div className="p-8 text-center">
                            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p className="text-gray-500 text-sm">No tienes notificaciones</p>
                          </div>
                        ) : (
                          <div className="p-2">
                            <button
                              onClick={() => {
                                router.push('/notifications')
                                setIsNotificationsOpen(false)
                              }}
                              className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-900 font-medium">
                                    Tienes {unreadCount} notificación{unreadCount !== 1 ? 'es' : ''} sin leer
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Haz clic para ver todas las notificaciones
                                  </p>
                                </div>
                              </div>
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="p-3 border-t border-gray-200">
                        <button
                          onClick={() => {
                            router.push('/notifications')
                            setIsNotificationsOpen(false)
                          }}
                          className="w-full text-center text-sm text-violet-600 hover:text-violet-700 font-medium"
                        >
                          Ver todas las notificaciones
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

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