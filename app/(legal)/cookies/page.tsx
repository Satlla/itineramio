import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center text-sm text-violet-600 hover:text-violet-700 mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al inicio
        </Link>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Política de Cookies
          </h1>
          <p className="text-gray-600">
            Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-8">
          {/* Introducción */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              1. Introducción
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              En Itineramio utilizamos cookies y tecnologías similares para mejorar tu experiencia en nuestra plataforma,
              analizar el uso del sitio, personalizar el contenido y ofrecer funcionalidades esenciales para el servicio.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Esta Política de Cookies explica qué son las cookies, cómo las utilizamos, qué tipos empleamos,
              y cómo puedes controlar tus preferencias.
            </p>
          </section>

          {/* Qué son las cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              2. ¿Qué son las cookies?
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web.
              Se utilizan ampliamente para hacer que los sitios web funcionen de manera más eficiente y proporcionar
              información a los propietarios del sitio.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Las cookies pueden ser "persistentes" o "de sesión". Las cookies persistentes permanecen en tu dispositivo
              después de cerrar el navegador, mientras que las cookies de sesión se eliminan cuando cierras el navegador.
            </p>
          </section>

          {/* Tipos de cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. Tipos de cookies que utilizamos
            </h2>

            <div className="space-y-6">
              {/* Cookies esenciales */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  3.1 Cookies Esenciales
                </h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Estas cookies son necesarias para el funcionamiento básico de la plataforma.
                  Sin ellas, no podrías acceder a áreas seguras del sitio ni utilizar funciones básicas.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Autenticación de sesión de usuario</li>
                  <li>Preferencias de seguridad</li>
                  <li>Funcionalidad del carrito de compra</li>
                  <li>Balance de carga del servidor</li>
                </ul>
                <p className="text-sm text-gray-600 mt-3">
                  <strong>Base legal:</strong> Interés legítimo (necesarias para el servicio)
                </p>
              </div>

              {/* Cookies de rendimiento */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  3.2 Cookies de Rendimiento y Análisis
                </h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Nos ayudan a entender cómo los visitantes interactúan con nuestro sitio web,
                  recopilando información de forma anónima.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Google Analytics (análisis de uso y estadísticas)</li>
                  <li>Métricas de rendimiento del sitio</li>
                  <li>Análisis de errores y diagnóstico</li>
                  <li>Mapas de calor y comportamiento del usuario</li>
                </ul>
                <p className="text-sm text-gray-600 mt-3">
                  <strong>Base legal:</strong> Consentimiento del usuario
                </p>
              </div>

              {/* Cookies funcionales */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  3.3 Cookies Funcionales
                </h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Permiten que el sitio web recuerde tus elecciones (como idioma, región o preferencias)
                  y proporcionan funciones mejoradas y personalizadas.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Preferencias de idioma</li>
                  <li>Configuración de visualización</li>
                  <li>Recordar formularios completados</li>
                  <li>Estado de modales y banners cerrados</li>
                </ul>
                <p className="text-sm text-gray-600 mt-3">
                  <strong>Base legal:</strong> Consentimiento del usuario
                </p>
              </div>

              {/* Cookies de marketing */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  3.4 Cookies de Marketing
                </h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Se utilizan para rastrear visitantes en diferentes sitios web con el fin de mostrar
                  anuncios relevantes y atractivos para el usuario individual.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Seguimiento de conversiones</li>
                  <li>Remarketing y retargeting</li>
                  <li>Publicidad personalizada</li>
                  <li>Análisis de campañas publicitarias</li>
                </ul>
                <p className="text-sm text-gray-600 mt-3">
                  <strong>Base legal:</strong> Consentimiento del usuario
                </p>
              </div>
            </div>
          </section>

          {/* Cookies de terceros */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              4. Cookies de terceros
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Además de nuestras propias cookies, también utilizamos servicios de terceros que establecen sus propias cookies:
            </p>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Servicio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Propósito
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Más información
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Google Analytics
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      Análisis de tráfico y comportamiento
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:text-violet-700 underline">
                        Política de Google
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Stripe
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      Procesamiento de pagos
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:text-violet-700 underline">
                        Política de Stripe
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Gestión de cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              5. Cómo gestionar y eliminar cookies
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Puedes controlar y/o eliminar las cookies como desees. Puedes eliminar todas las cookies
              que ya están en tu dispositivo y configurar la mayoría de los navegadores para que no se instalen.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Nota importante:</strong> Si eliminas o rechazas las cookies, algunas funciones
                de nuestro sitio web pueden no funcionar correctamente.
              </p>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Configuración del navegador
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              La mayoría de los navegadores web permiten controlar las cookies a través de su configuración:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>
                <strong>Chrome:</strong> Configuración → Privacidad y seguridad → Cookies y otros datos de sitios
              </li>
              <li>
                <strong>Firefox:</strong> Opciones → Privacidad y seguridad → Cookies y datos del sitio
              </li>
              <li>
                <strong>Safari:</strong> Preferencias → Privacidad → Cookies y datos de sitios web
              </li>
              <li>
                <strong>Edge:</strong> Configuración → Privacidad, búsqueda y servicios → Cookies
              </li>
            </ul>
          </section>

          {/* Cambios en la política */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              6. Cambios en esta política
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Podemos actualizar esta Política de Cookies ocasionalmente para reflejar cambios en nuestras
              prácticas o por otras razones operativas, legales o regulatorias. Te notificaremos sobre
              cualquier cambio material publicando la nueva política en esta página con una fecha de
              "última actualización" revisada.
            </p>
          </section>

          {/* Contacto */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              7. Contacto
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Si tienes preguntas sobre nuestra Política de Cookies o cómo utilizamos las cookies,
              por favor contáctanos:
            </p>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <p className="text-gray-700">
                <strong>Email:</strong> privacy@itineramio.com
              </p>
              <p className="text-gray-700 mt-2">
                <strong>Dirección:</strong> [Tu dirección]
              </p>
            </div>
          </section>

          {/* Footer legal */}
          <section className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Esta Política de Cookies forma parte integral de nuestros{' '}
              <Link href="/terms" className="text-violet-600 hover:text-violet-700 underline">
                Términos y Condiciones
              </Link>
              {' '}y nuestra{' '}
              <Link href="/privacy" className="text-violet-600 hover:text-violet-700 underline">
                Política de Privacidad
              </Link>
              .
            </p>
          </section>
        </div>

        {/* Additional links */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center text-sm">
          <Link href="/terms" className="text-violet-600 hover:text-violet-700 underline">
            Términos y Condiciones
          </Link>
          <Link href="/privacy" className="text-violet-600 hover:text-violet-700 underline">
            Política de Privacidad
          </Link>
          <Link href="/legal/dpa" className="text-violet-600 hover:text-violet-700 underline">
            Acuerdo de Procesamiento de Datos
          </Link>
        </div>
      </div>
    </div>
  )
}
