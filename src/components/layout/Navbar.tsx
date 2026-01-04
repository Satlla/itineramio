'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, User, Globe, Search } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { Button } from '../../components/ui/Button'
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher'
import { ItineramioLogo } from '../../components/ui/ItineramioLogo'
import { useLocale } from '../../hooks/useLocale'
import { LANGUAGE_CONFIG } from '../../i18n/config'

interface NavbarProps {
  transparent?: boolean
}

export function Navbar({ transparent = false }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showLangMenu, setShowLangMenu] = useState(false)
  const { t } = useTranslation('common')
  const { currentLanguage, changeLanguage, availableLanguages } = useLocale()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLanguageChange = async (lang: string) => {
    await changeLanguage(lang)
    setShowLangMenu(false)
    window.location.reload()
  }

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 safe-top transition-all duration-300 ${
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
            <div className="hidden lg:flex items-center space-x-8">
              <Link
                href="/funcionalidades"
                className="text-gray-700 hover:text-violet-600 font-medium transition-colors relative group"
              >
                {t('navbar.features', 'Funcionalidades')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-600 transition-all duration-300 group-hover:w-full" />
              </Link>
              <Link
                href="/blog"
                className="text-gray-700 hover:text-violet-600 font-medium transition-colors relative group"
              >
                {t('navbar.blog', 'Blog')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-600 transition-all duration-300 group-hover:w-full" />
              </Link>
              {/* Academia - hidden for now
              <Link
                href="/academia"
                className="text-gray-700 hover:text-violet-600 font-medium transition-colors relative group"
              >
                {t('navbar.academy', 'Academia')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-600 transition-all duration-300 group-hover:w-full" />
              </Link>
              */}
              <Link
                href="/hub"
                className="text-gray-700 hover:text-violet-600 font-medium transition-colors relative group"
              >
                {t('navbar.resources', 'Recursos')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-600 transition-all duration-300 group-hover:w-full" />
              </Link>
              <Link
                href="/#pricing"
                className="text-gray-700 hover:text-violet-600 font-medium transition-colors relative group"
              >
                {t('navbar.pricing', 'Precios')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-600 transition-all duration-300 group-hover:w-full" />
              </Link>
              <Link
                href="/casos-de-exito"
                className="text-gray-700 hover:text-violet-600 font-medium transition-colors relative group"
              >
                {t('navbar.successStories', 'Casos de Éxito')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-600 transition-all duration-300 group-hover:w-full" />
              </Link>
              {/* Comparar - hidden for now
              <Link
                href="/comparar"
                className="text-gray-700 hover:text-violet-600 font-medium transition-colors relative group"
              >
                {t('navbar.compare', 'Comparar')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-600 transition-all duration-300 group-hover:w-full" />
              </Link>
              */}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Search Icon */}
              <Link
                href="/blog"
                className="p-2 rounded-lg text-gray-600 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                title={t('navbar.searchArticles', 'Buscar artículos')}
              >
                <Search className="w-5 h-5" />
              </Link>

              {/* Language Toggle - Desktop */}
              <div className="hidden lg:block relative">
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-600 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {LANGUAGE_CONFIG[currentLanguage as keyof typeof LANGUAGE_CONFIG]?.flag}
                  </span>
                </button>

                <AnimatePresence>
                  {showLangMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2 min-w-[140px] z-50"
                    >
                      {availableLanguages.map((lang) => {
                        const config = LANGUAGE_CONFIG[lang as keyof typeof LANGUAGE_CONFIG]
                        return (
                          <button
                            key={lang}
                            onClick={() => handleLanguageChange(lang)}
                            className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                              currentLanguage === lang
                                ? 'bg-violet-50 text-violet-600 font-medium'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <span>{config.flag}</span>
                            <span>{config.name}</span>
                          </button>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Auth Buttons */}
              <div className="hidden lg:flex items-center space-x-3">
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
                className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
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
              className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-white shadow-2xl z-50 lg:hidden"
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
                {/* Mobile Search */}
                <Link
                  href="/blog"
                  className="flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-xl text-gray-500 hover:bg-violet-50 hover:text-violet-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Search className="w-5 h-5" />
                  <span>{t('navbar.searchArticles', 'Buscar artículos...')}</span>
                </Link>

                {/* Navigation Links */}
                <div className="space-y-4">
                  <Link
                    href="/funcionalidades"
                    className="block text-lg font-medium text-gray-700 hover:text-violet-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('navbar.features', 'Funcionalidades')}
                  </Link>
                  <Link
                    href="/blog"
                    className="block text-lg font-medium text-gray-700 hover:text-violet-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('navbar.blog', 'Blog')}
                  </Link>
                  {/* Academia - hidden for now
                  <Link
                    href="/academia"
                    className="block text-lg font-medium text-gray-700 hover:text-violet-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('navbar.academy', 'Academia')}
                  </Link>
                  */}
                  <Link
                    href="/hub"
                    className="block text-lg font-medium text-gray-700 hover:text-violet-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('navbar.resources', 'Recursos')}
                  </Link>
                  <Link
                    href="/#pricing"
                    className="block text-lg font-medium text-gray-700 hover:text-violet-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('navbar.pricing', 'Precios')}
                  </Link>
                  <Link
                    href="/casos-de-exito"
                    className="block text-lg font-medium text-gray-700 hover:text-violet-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('navbar.successStories', 'Casos de Éxito')}
                  </Link>
                  {/* Comparar - hidden for now
                  <Link
                    href="/comparar"
                    className="block text-lg font-medium text-gray-700 hover:text-violet-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('navbar.compare', 'Comparar')}
                  </Link>
                  */}
                </div>

                {/* Language Selector - Mobile */}
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    {t('navbar.language', 'Idioma')}
                  </p>
                  <div className="flex gap-2">
                    {availableLanguages.map((lang) => {
                      const config = LANGUAGE_CONFIG[lang as keyof typeof LANGUAGE_CONFIG]
                      return (
                        <button
                          key={lang}
                          onClick={() => handleLanguageChange(lang)}
                          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            currentLanguage === lang
                              ? 'bg-violet-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <span>{config.flag}</span>
                          <span>{config.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Auth Buttons */}
                <div className="space-y-3 pt-4 border-t">
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