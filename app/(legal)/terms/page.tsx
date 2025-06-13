'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FileText, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function TermsPage() {
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
              <FileText className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Términos y Condiciones
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Condiciones de uso de la plataforma Itineramio
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
            <h2>1. Aceptación de los términos</h2>
            <p>
              Al acceder y utilizar Itineramio, aceptas estar sujeto a estos términos 
              y condiciones y a nuestra política de privacidad. Si no estás de acuerdo 
              con alguna parte de estos términos, no debes utilizar nuestro servicio.
            </p>

            <h2>2. Descripción del servicio</h2>
            <p>
              Itineramio es una plataforma que permite a los propietarios de alojamientos 
              crear manuales digitales interactivos para sus huéspedes, facilitando:
            </p>
            <ul>
              <li>Creación de manuales digitales con códigos QR</li>
              <li>Gestión de propiedades y zonas</li>
              <li>Comunicación directa con huéspedes via WhatsApp</li>
              <li>Sistema de feedback y valoraciones</li>
            </ul>

            <h2>3. Registro y cuenta de usuario</h2>
            <p>Para utilizar nuestros servicios, debes:</p>
            <ul>
              <li>Ser mayor de 18 años</li>
              <li>Proporcionar información precisa y actualizada</li>
              <li>Mantener la seguridad de tu cuenta</li>
              <li>Notificar inmediatamente cualquier uso no autorizado</li>
            </ul>

            <h2>4. Uso aceptable</h2>
            <p>Te comprometes a utilizar Itineramio únicamente para:</p>
            <ul>
              <li>Gestionar propiedades de alojamiento legítimas</li>
              <li>Proporcionar información veraz a los huéspedes</li>
              <li>Cumplir con todas las leyes y regulaciones aplicables</li>
              <li>Respetar los derechos de otros usuarios</li>
            </ul>

            <h2>5. Contenido del usuario</h2>
            <p>Respecto al contenido que creas en Itineramio:</p>
            <ul>
              <li>Mantienes la propiedad de tu contenido</li>
              <li>Nos otorgas licencia para almacenar y mostrar tu contenido</li>
              <li>Eres responsable de la precisión de la información</li>
              <li>No debes incluir contenido ofensivo o ilegal</li>
            </ul>

            <h2>6. Pagos y facturación</h2>
            <p>Nuestro modelo de precios incluye:</p>
            <ul>
              <li>Plan gratuito con funcionalidades básicas</li>
              <li>Planes premium con características avanzadas</li>
              <li>Pagos procesados de forma segura</li>
              <li>Reembolsos según nuestras políticas</li>
            </ul>

            <h2>7. Limitación de responsabilidad</h2>
            <p>
              Itineramio se proporciona "tal como está". No garantizamos que el servicio 
              esté libre de errores o interrupciones. Nuestra responsabilidad se limita 
              al máximo permitido por la ley.
            </p>

            <h2>8. Modificaciones del servicio</h2>
            <p>
              Nos reservamos el derecho de modificar o discontinuar el servicio en 
              cualquier momento, con o sin previo aviso.
            </p>

            <h2>9. Terminación</h2>
            <p>
              Podemos suspender o terminar tu cuenta si violas estos términos. 
              Puedes cancelar tu cuenta en cualquier momento desde la configuración.
            </p>

            <h2>10. Ley aplicable</h2>
            <p>
              Estos términos se rigen por las leyes de España. Cualquier disputa 
              se resolverá en los tribunales de Madrid.
            </p>

            <h2>11. Contacto</h2>
            <p>
              Para preguntas sobre estos términos, contacta con nosotros:
            </p>
            <ul>
              <li>Email: legal@itineramio.com</li>
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