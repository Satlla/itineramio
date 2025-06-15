'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Zap, ChevronLeft, Cookie } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../../../src/components/ui/Button'

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Cookie className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Política de Cookies
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Información sobre el uso de cookies en Itineramio
          </p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="prose prose-violet max-w-none">
            <h2>¿Qué son las cookies?</h2>
            <p>
              Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo 
              cuando visitas nuestro sitio web. Nos ayudan a mejorar tu experiencia y 
              proporcionar funcionalidades personalizadas.
            </p>

            <h2>Tipos de cookies que utilizamos</h2>
            
            <h3>Cookies esenciales</h3>
            <p>
              Estas cookies son necesarias para el funcionamiento básico del sitio web 
              y no se pueden desactivar. Incluyen:
            </p>
            <ul>
              <li>Cookies de sesión para mantener tu login</li>
              <li>Cookies de seguridad para proteger tu cuenta</li>
              <li>Cookies de preferencias de idioma</li>
            </ul>

            <h3>Cookies de rendimiento</h3>
            <p>
              Estas cookies nos ayudan a entender cómo interactúas con nuestro sitio web:
            </p>
            <ul>
              <li>Google Analytics para análisis de uso</li>
              <li>Métricas de rendimiento de la aplicación</li>
              <li>Estadísticas de navegación</li>
            </ul>

            <h2>Control de cookies</h2>
            <p>
              Puedes controlar y gestionar las cookies de varias maneras:
            </p>
            <ul>
              <li>Configurar tu navegador para rechazar cookies</li>
              <li>Eliminar cookies existentes en tu navegador</li>
              <li>Usar nuestro panel de preferencias de cookies</li>
            </ul>

            <h2>Cookies de terceros</h2>
            <p>
              Algunos servicios externos que utilizamos pueden establecer sus propias cookies:
            </p>
            <ul>
              <li><strong>Google Analytics:</strong> Para análisis de tráfico web</li>
              <li><strong>Stripe:</strong> Para procesamiento de pagos</li>
              <li><strong>WhatsApp Business:</strong> Para integración de mensajería</li>
            </ul>

            <h2>Contacto</h2>
            <p>
              Si tienes preguntas sobre nuestra política de cookies, puedes contactarnos en:
            </p>
            <ul>
              <li>Email: privacy@itineramio.com</li>
              <li>Teléfono: +34 900 000 000</li>
            </ul>
          </div>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <Link href="/">
            <Button variant="outline" className="bg-white/50 backdrop-blur-sm">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}