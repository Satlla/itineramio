'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Globe, Shield, FileText } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher'
import { ItineramioLogo } from '../../components/ui/ItineramioLogo'

export function Footer() {
  const { t } = useTranslation('common')
  const currentYear = new Date().getFullYear()

  const companyLinks = [
    { label: 'Acerca de', href: '/about' },
    { label: 'Carreras', href: '/careers' },
    { label: 'Contacto', href: '/contact' },
    { label: 'Blog', href: '/blog' },
  ]

  const productLinks = [
    { label: 'Características', href: '/features' },
    { label: 'Precios', href: '/pricing' },
    { label: 'Integraciones', href: '/integrations' },
    { label: 'API', href: '/api' },
  ]

  const supportLinks = [
    { label: 'Ayuda', href: '/help' },
    { label: 'Documentación', href: '/docs' },
    { label: 'Estado', href: '/status' },
    { label: 'Comunidad', href: '/community' },
  ]

  const legalLinks = [
    { label: 'Privacidad', href: '/privacy' },
    { label: 'Términos', href: '/terms' },
    { label: 'Cookies', href: '/cookies' },
    { label: 'Seguridad', href: '/security' },
  ]

  return (
    <footer className="bg-white text-gray-900 border-t border-gray-200">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <motion.div
              className="flex items-center space-x-2 mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <ItineramioLogo variant="square" size="lg" />
              <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Itineramio
              </span>
            </motion.div>
            
            <motion.p
              className="text-gray-600 mb-6 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Crea manuales digitales interactivos para tus alojamientos. Automatiza la experiencia de tus huéspedes con códigos QR y reduce las consultas hasta un 80%.
            </motion.p>

            {/* Contact Info */}
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center space-x-3 text-gray-600">
                <Mail className="w-5 h-5 text-violet-600" />
                <span>hola@itineramio.com</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <Phone className="w-5 h-5 text-violet-600" />
                <span>+34 652 656 440</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <MapPin className="w-5 h-5 text-violet-600" />
                <span>Madrid, España</span>
              </div>
            </motion.div>
          </div>

          {/* Company Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-violet-600">
              Empresa
            </h3>
            <ul className="space-y-3">
              <li><Link href="/#how-it-works" className="text-gray-600 hover:text-violet-600 transition-colors">¿Cómo funciona?</Link></li>
              <li><Link href="/#about" className="text-gray-600 hover:text-violet-600 transition-colors">Acerca de</Link></li>
              <li><Link href="/#contact" className="text-gray-600 hover:text-violet-600 transition-colors">Contacto</Link></li>
              <li><Link href="/blog" className="text-gray-600 hover:text-violet-600 transition-colors">Blog</Link></li>
            </ul>
          </motion.div>

          {/* Product Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-violet-600">
              Producto
            </h3>
            <ul className="space-y-3">
              <li><Link href="/#features" className="text-gray-600 hover:text-violet-600 transition-colors">Características</Link></li>
              <li><Link href="/#pricing" className="text-gray-600 hover:text-violet-600 transition-colors">Precios</Link></li>
              <li><Link href="/integrations" className="text-gray-600 hover:text-violet-600 transition-colors">Integraciones</Link></li>
              <li><Link href="/api" className="text-gray-600 hover:text-violet-600 transition-colors">API</Link></li>
            </ul>
          </motion.div>

          {/* Support Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-violet-600">
              Soporte
            </h3>
            <ul className="space-y-3">
              <li><Link href="/help" className="text-gray-600 hover:text-violet-600 transition-colors">Ayuda</Link></li>
              <li><Link href="/faq" className="text-gray-600 hover:text-violet-600 transition-colors">Preguntas Frecuentes</Link></li>
              <li><Link href="/docs" className="text-gray-600 hover:text-violet-600 transition-colors">Documentación</Link></li>
              <li><Link href="/community" className="text-gray-600 hover:text-violet-600 transition-colors">Comunidad</Link></li>
            </ul>
          </motion.div>
        </div>

        {/* Newsletter Signup */}
        <motion.div
          className="mt-12 pt-8 border-t border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="max-w-md">
            <h3 className="text-lg font-semibold mb-2 text-violet-600">
              Newsletter
            </h3>
            <p className="text-gray-600 mb-4">
              Recibe las últimas noticias y actualizaciones de Itineramio directamente en tu bandeja de entrada.
            </p>
            <div className="flex space-x-3">
              <input
                type="email"
                placeholder="tu@email.com"
                className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
              <button className="px-6 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg font-medium hover:from-violet-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                Suscribirse
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Copyright */}
            <motion.div
              className="text-gray-500 text-sm"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              © {currentYear} Itineramio. Todos los derechos reservados.
            </motion.div>

            {/* Legal Links */}
            <motion.div
              className="flex items-center space-x-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Link href="/privacy" className="text-gray-500 hover:text-violet-600 text-sm transition-colors flex items-center space-x-1">
                <Shield className="w-3 h-3" />
                <span>Privacidad</span>
              </Link>
              <Link href="/terms" className="text-gray-500 hover:text-violet-600 text-sm transition-colors flex items-center space-x-1">
                <FileText className="w-3 h-3" />
                <span>Términos</span>
              </Link>
              <Link href="/cookies" className="text-gray-500 hover:text-violet-600 text-sm transition-colors">
                Cookies
              </Link>
            </motion.div>

            {/* Language Switcher - moved to bottom right like Airbnb */}
            <motion.div
              className="flex items-center space-x-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="hidden md:flex items-center space-x-2 text-gray-500">
                <Globe className="w-4 h-4" />
                <span className="text-sm">Idioma:</span>
              </div>
              <LanguageSwitcher variant="footer" />
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  )
}