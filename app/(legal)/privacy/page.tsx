'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Shield, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../../../src/components/ui/Button'

export default function PrivacyPage() {
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
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Política de Privacidad
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Información sobre cómo protegemos y utilizamos tus datos personales
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
            <h2>Información que recopilamos</h2>
            <p>
              En Itineramio recopilamos únicamente la información necesaria para 
              proporcionar nuestros servicios de manera efectiva:
            </p>
            <ul>
              <li><strong>Información de cuenta:</strong> nombre, email, teléfono</li>
              <li><strong>Información de propiedades:</strong> direcciones, características</li>
              <li><strong>Datos de uso:</strong> cómo utilizas nuestra plataforma</li>
              <li><strong>Información de comunicación:</strong> mensajes con huéspedes</li>
            </ul>

            <h2>Cómo utilizamos tu información</h2>
            <p>Utilizamos tu información personal para:</p>
            <ul>
              <li>Proporcionar y mantener nuestros servicios</li>
              <li>Facilitar la comunicación entre hosts y huéspedes</li>
              <li>Mejorar y personalizar tu experiencia</li>
              <li>Enviar notificaciones importantes sobre tu cuenta</li>
              <li>Cumplir con obligaciones legales</li>
            </ul>

            <h2>Compartir información</h2>
            <p>
              No vendemos ni alquilamos tu información personal a terceros. 
              Podemos compartir tu información únicamente en estos casos:
            </p>
            <ul>
              <li><strong>Con huéspedes:</strong> información de contacto cuando sea necesario</li>
              <li><strong>Proveedores de servicios:</strong> para procesar pagos y enviar notificaciones</li>
              <li><strong>Cumplimiento legal:</strong> cuando sea requerido por ley</li>
            </ul>

            <h2>Seguridad de los datos</h2>
            <p>
              Implementamos medidas de seguridad técnicas y organizativas para 
              proteger tu información:
            </p>
            <ul>
              <li>Cifrado de datos en tránsito y en reposo</li>
              <li>Autenticación de dos factores</li>
              <li>Auditorías regulares de seguridad</li>
              <li>Acceso limitado a datos personales</li>
            </ul>

            <h2>Tus derechos</h2>
            <p>Según el RGPD, tienes derecho a:</p>
            <ul>
              <li><strong>Acceso:</strong> solicitar una copia de tus datos personales</li>
              <li><strong>Rectificación:</strong> corregir datos inexactos</li>
              <li><strong>Supresión:</strong> solicitar la eliminación de tus datos</li>
              <li><strong>Portabilidad:</strong> recibir tus datos en formato estructurado</li>
              <li><strong>Oposición:</strong> oponerte al procesamiento de tus datos</li>
            </ul>

            <h2>Retención de datos</h2>
            <p>
              Conservamos tu información personal durante el tiempo necesario para:
            </p>
            <ul>
              <li>Proporcionar nuestros servicios</li>
              <li>Cumplir con obligaciones legales</li>
              <li>Resolver disputas</li>
              <li>Hacer cumplir nuestros acuerdos</li>
            </ul>

            <h2>Contacto</h2>
            <p>
              Para ejercer tus derechos o resolver dudas sobre privacidad, contacta con nosotros:
            </p>
            <ul>
              <li>Email: privacy@itineramio.com</li>
              <li>Teléfono: +34 900 000 000</li>
              <li>Dirección: Calle de la Innovación, 123, 28001 Madrid</li>
            </ul>

            <p className="text-sm text-gray-600 mt-8">
              Última actualización: 8 de junio de 2025
            </p>
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