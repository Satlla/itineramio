'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Globe, Shield, FileText } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher'
import { ItineramioLogo } from '../../components/ui/ItineramioLogo'

export function Footer() {
  const { t } = useTranslation('common')
  const [currentYear, setCurrentYear] = useState(2025)

  useEffect(() => {
    setCurrentYear(new Date().getFullYear())
  }, [])

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
              <ItineramioLogo size="lg" />
              <span className="text-2xl font-bold" style={{ color: '#484848' }}>
                Itineramio
              </span>
            </motion.div>
            
            <motion.p
              className="text-gray-600 mb-6 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {t('meta.siteDescription', 'Crea manuales digitales interactivos para tus alojamientos turísticos')}
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
              {t('footer.company', 'Empresa')}
            </h3>
            <ul className="space-y-3">
              <li><Link href="/#how-it-works" className="text-gray-600 hover:text-violet-600 transition-colors">{t('footer.howItWorks', '¿Cómo funciona?')}</Link></li>
              <li><Link href="/casos-de-exito" className="text-gray-600 hover:text-violet-600 transition-colors">{t('footer.successStories', 'Casos de Éxito')}</Link></li>
              <li><Link href="/#contact" className="text-gray-600 hover:text-violet-600 transition-colors">{t('footer.contact', 'Contacto')}</Link></li>
              <li><Link href="/blog" className="text-gray-600 hover:text-violet-600 transition-colors">{t('footer.blog', 'Blog')}</Link></li>
            </ul>
          </motion.div>

          {/* Product Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-violet-600">
              {t('footer.product', 'Producto')}
            </h3>
            <ul className="space-y-3">
              <li><Link href="/#features" className="text-gray-600 hover:text-violet-600 transition-colors">{t('footer.features', 'Características')}</Link></li>
              <li><Link href="/#pricing" className="text-gray-600 hover:text-violet-600 transition-colors">{t('footer.pricing', 'Precios')}</Link></li>
              <li><Link href="/comparar" className="text-gray-600 hover:text-violet-600 transition-colors">{t('footer.comparisons', 'Comparativas')}</Link></li>
              <li><Link href="/recursos" className="text-gray-600 hover:text-violet-600 transition-colors">{t('footer.resources', 'Recursos')}</Link></li>
            </ul>
          </motion.div>

          {/* Support Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-violet-600">
              {t('footer.support', 'Soporte')}
            </h3>
            <ul className="space-y-3">
              <li><Link href="/faq" className="text-gray-600 hover:text-violet-600 transition-colors">{t('footer.faq', 'Preguntas Frecuentes')}</Link></li>
              <li><Link href="/bienvenido" className="text-gray-600 hover:text-violet-600 transition-colors">{t('footer.documentation', 'Guías')}</Link></li>
              <li><Link href="/hub" className="text-gray-600 hover:text-violet-600 transition-colors">{t('footer.tools', 'Herramientas')}</Link></li>
              <li><Link href="/academia" className="text-gray-600 hover:text-violet-600 transition-colors">{t('footer.academy', 'Academia')}</Link></li>
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
              {t('footer.newsletter', 'Newsletter')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('footer.newsletterDescription', 'Recibe las últimas noticias y actualizaciones de Itineramio directamente en tu bandeja de entrada.')}
            </p>
            <div className="flex space-x-3">
              <input
                type="email"
                placeholder="tu@email.com"
                className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
              <button className="px-6 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg font-medium hover:from-violet-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                {t('footer.subscribe', 'Suscribirse')}
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
              © {currentYear} Itineramio. {t('footer.copyright', 'Todos los derechos reservados.')}
            </motion.div>

            {/* Legal Links */}
            <motion.div
              className="flex items-center space-x-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Link href="/legal/privacy" className="text-gray-500 hover:text-violet-600 text-sm transition-colors flex items-center space-x-1">
                <Shield className="w-3 h-3" />
                <span>{t('footer.privacy', 'Privacidad')}</span>
              </Link>
              <Link href="/legal/terms" className="text-gray-500 hover:text-violet-600 text-sm transition-colors flex items-center space-x-1">
                <FileText className="w-3 h-3" />
                <span>{t('footer.terms', 'Términos')}</span>
              </Link>
              <Link href="/legal/cookies" className="text-gray-500 hover:text-violet-600 text-sm transition-colors">
                {t('footer.cookies', 'Cookies')}
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
                <span className="text-sm">{t('footer.language', 'Idioma')}:</span>
              </div>
              <LanguageSwitcher variant="footer" />
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  )
}