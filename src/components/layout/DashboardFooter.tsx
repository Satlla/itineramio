'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Zap, Globe, Heart } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher'

export function DashboardFooter() {
  const { t } = useTranslation('common')
  const currentYear = new Date().getFullYear()

  const footerLinks = [
    { label: 'Ayuda', href: '/help' },
    { label: 'Privacidad', href: '/privacy' },
    { label: 'Términos', href: '/terms' },
    { label: 'Cookies', href: '/cookies' },
    { label: 'Contacto', href: '/contact' },
  ]

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Left - Logo and Copyright */}
          <motion.div
            className="flex items-center space-x-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Itineramio
              </span>
            </div>
            <span className="text-gray-400 text-sm">•</span>
            <p className="text-sm text-gray-500">
              © {currentYear} Itineramio. Todos los derechos reservados.
            </p>
          </motion.div>

          {/* Center - Links */}
          <motion.div
            className="flex flex-wrap items-center justify-center space-x-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {footerLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-500 hover:text-violet-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </motion.div>

          {/* Right - Language Switcher */}
          <motion.div
            className="flex items-center space-x-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Globe className="w-4 h-4" />
              <span>Idioma:</span>
            </div>
            <LanguageSwitcher />
          </motion.div>
        </div>

        {/* Bottom Row - Made with love */}
        <motion.div
          className="mt-6 pt-6 border-t border-gray-200 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-xs text-gray-400 flex items-center justify-center space-x-1">
            <span>Hecho con</span>
            <Heart className="w-3 h-3 text-red-400" />
            <span>para anfitriones de todo el mundo</span>
          </p>
        </motion.div>
      </div>
    </footer>
  )
}