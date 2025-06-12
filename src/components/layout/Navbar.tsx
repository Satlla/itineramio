'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, User, Globe } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { ItineramioLogo } from '@/components/ui/ItineramioLogo'

interface NavbarProps {
  transparent?: boolean
}

export function Navbar({ transparent = false }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { t } = useTranslation('common')

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
          scrolled || !transparent
            ? 'bg-white/90 backdrop-blur-md border-b border-neutral-200/50 shadow-lg' 
            : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
            >
              <Link href="/" className="flex items-center space-x-2">
                <ItineramioLogo variant="icon" size="md" />
                <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  Itineramio
                </span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/#how-it-works"
                className="text-gray-700 hover:text-violet-600 font-medium transition-colors relative group"
              >
                ¿Cómo funciona?
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-600 transition-all duration-300 group-hover:w-full" />
              </Link>
              <Link
                href="/#features"
                className="text-gray-700 hover:text-violet-600 font-medium transition-colors relative group"
              >
                {t('navbar.features', 'Características')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-600 transition-all duration-300 group-hover:w-full" />
              </Link>
              <Link
                href="/#pricing"
                className="text-gray-700 hover:text-violet-600 font-medium transition-colors relative group"
              >
                {t('navbar.pricing', 'Precios')}
                <span className="absolute -bottom-1 left-0 w-0.5 bg-violet-600 transition-all duration-300 group-hover:w-full" />
              </Link>
              <Link
                href="/#testimonials"
                className="text-gray-700 hover:text-violet-600 font-medium transition-colors relative group"
              >
                Testimonios
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-600 transition-all duration-300 group-hover:w-full" />
              </Link>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Auth Buttons */}
              <div className="hidden md:flex items-center space-x-3">
                <Link href="/login">
                  <Button variant="ghost">
                    {t('navbar.login', 'Iniciar Sesión')}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-violet-600 hover:bg-violet-700">
                    {t('navbar.register', 'Registrarse')}
                  </Button>
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <motion.button
                onClick={() => setIsMenuOpen(true)}
                className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                <Menu className="w-6 h-6" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-white shadow-2xl z-50 md:hidden"
            >
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center space-x-2">
                  <ItineramioLogo variant="icon" size="md" />
                  <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                    Itineramio
                  </span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Navigation Links */}
                <div className="space-y-4">
                  <Link
                    href="/#how-it-works"
                    className="block text-lg font-medium text-gray-700 hover:text-violet-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    ¿Cómo funciona?
                  </Link>
                  <Link
                    href="/#features"
                    className="block text-lg font-medium text-gray-700 hover:text-violet-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('navbar.features', 'Características')}
                  </Link>
                  <Link
                    href="/#pricing"
                    className="block text-lg font-medium text-gray-700 hover:text-violet-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('navbar.pricing', 'Precios')}
                  </Link>
                  <Link
                    href="/#testimonials"
                    className="block text-lg font-medium text-gray-700 hover:text-violet-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Testimonios
                  </Link>
                </div>

                {/* Auth Buttons */}
                <div className="space-y-3 pt-6 border-t">
                  <Link href="/login" className="block">
                    <Button variant="outline" className="w-full">
                      {t('navbar.login', 'Iniciar Sesión')}
                    </Button>
                  </Link>
                  <Link href="/register" className="block">
                    <Button className="w-full bg-violet-600 hover:bg-violet-700">
                      {t('navbar.register', 'Registrarse')}
                    </Button>
                  </Link>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}