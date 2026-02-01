'use client'

import Link from 'next/link'
import { POLICY_VERSION, POLICY_LAST_UPDATE, LEGAL_CONTACT } from '@/config/policies'

export default function SLAPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Acuerdo de Nivel de Servicio (SLA)</h1>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              Versión {POLICY_VERSION}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Última actualización: {POLICY_LAST_UPDATE}
          </p>
        </div>

        {/* Executive Summary */}
        <div className="mb-8 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">Resumen Ejecutivo</h2>
          <ul className="space-y-2 text-blue-800">
            <li>• Garantizamos una disponibilidad del 99.5% del servicio</li>
            <li>• Tiempo de respuesta de soporte: máximo 24-48 horas</li>
            <li>• Mantenimientos programados con aviso previo de 48 horas</li>
            <li>• Compensaciones por incumplimiento de disponibilidad</li>
            <li>• Monitorización continua 24/7</li>
          </ul>
        </div>

        {/* Table of Contents */}
        <nav className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Índice de Contenidos</h2>
          <ul className="space-y-2">
            <li><a href="#disponibilidad" className="text-blue-600 hover:underline">1. Compromiso de Disponibilidad</a></li>
            <li><a href="#mantenimiento" className="text-blue-600 hover:underline">2. Mantenimiento Programado</a></li>
            <li><a href="#soporte" className="text-blue-600 hover:underline">3. Tiempos de Respuesta de Soporte</a></li>
            <li><a href="#incidencias" className="text-blue-600 hover:underline">4. Gestión de Incidencias</a></li>
            <li><a href="#compensaciones" className="text-blue-600 hover:underline">5. Compensaciones</a></li>
            <li><a href="#exclusiones" className="text-blue-600 hover:underline">6. Exclusiones</a></li>
            <li><a href="#reclamaciones" className="text-blue-600 hover:underline">7. Procedimiento de Reclamaciones</a></li>
            <li><a href="#contacto" className="text-blue-600 hover:underline">8. Contacto</a></li>
          </ul>
        </nav>

        {/* Content Sections */}
        <div className="prose prose-blue max-w-none space-y-8">

          <section id="disponibilidad">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Compromiso de Disponibilidad</h2>
            <p className="text-gray-700 mb-4">
              Itineramio se compromete a mantener una disponibilidad del servicio del <strong>99.5%</strong> mensual,
              medida sobre el tiempo total del mes natural excluyendo los períodos de mantenimiento programado.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Cálculo de Disponibilidad</h3>
              <p className="text-gray-700 mb-2">
                La disponibilidad se calcula mediante la siguiente fórmula:
              </p>
              <code className="block bg-gray-100 p-3 rounded text-sm">
                Disponibilidad (%) = ((Tiempo Total - Tiempo de Inactividad) / Tiempo Total) × 100
              </code>
            </div>
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
              <p className="text-green-800">
                <strong>Objetivo:</strong> 99.5% de disponibilidad equivale a un máximo de aproximadamente
                3.6 horas de inactividad no programada al mes.
              </p>
            </div>
          </section>

          <section id="mantenimiento">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Mantenimiento Programado</h2>
            <p className="text-gray-700 mb-4">
              Para garantizar el correcto funcionamiento y la seguridad de la plataforma,
              realizamos mantenimientos programados de forma regular.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Ventana de Mantenimiento</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Horario preferente:</strong> Martes y Jueves de 02:00 a 06:00 (hora de Madrid)</li>
                <li><strong>Aviso previo:</strong> Mínimo 48 horas para mantenimientos planificados</li>
                <li><strong>Comunicación:</strong> Por email a todos los usuarios con suscripción activa</li>
              </ul>
            </div>
            <p className="text-gray-700">
              Los mantenimientos programados no se contabilizan como tiempo de inactividad a efectos
              del cálculo de disponibilidad del SLA.
            </p>
          </section>

          <section id="soporte">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Tiempos de Respuesta de Soporte</h2>
            <p className="text-gray-700 mb-4">
              Nuestro equipo de soporte está disponible para ayudarte con cualquier consulta o incidencia.
            </p>
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Prioridad</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Descripción</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Primera Respuesta</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Resolución Objetivo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="px-4 py-3 text-sm"><span className="px-2 py-1 bg-red-100 text-red-800 rounded font-medium">Crítica</span></td>
                    <td className="px-4 py-3 text-sm text-gray-700">Servicio completamente inaccesible</td>
                    <td className="px-4 py-3 text-sm text-gray-700">4 horas</td>
                    <td className="px-4 py-3 text-sm text-gray-700">8 horas</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-3 text-sm"><span className="px-2 py-1 bg-orange-100 text-orange-800 rounded font-medium">Alta</span></td>
                    <td className="px-4 py-3 text-sm text-gray-700">Funcionalidad principal afectada</td>
                    <td className="px-4 py-3 text-sm text-gray-700">12 horas</td>
                    <td className="px-4 py-3 text-sm text-gray-700">24 horas</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-3 text-sm"><span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded font-medium">Media</span></td>
                    <td className="px-4 py-3 text-sm text-gray-700">Funcionalidad secundaria afectada</td>
                    <td className="px-4 py-3 text-sm text-gray-700">24 horas</td>
                    <td className="px-4 py-3 text-sm text-gray-700">72 horas</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm"><span className="px-2 py-1 bg-gray-100 text-gray-800 rounded font-medium">Baja</span></td>
                    <td className="px-4 py-3 text-sm text-gray-700">Consultas generales</td>
                    <td className="px-4 py-3 text-sm text-gray-700">48 horas</td>
                    <td className="px-4 py-3 text-sm text-gray-700">5 días laborables</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-600">
              Los tiempos de respuesta se miden en horas laborables (lunes a viernes, 09:00-18:00 hora de Madrid),
              excepto para incidencias críticas que se atienden 24/7.
            </p>
          </section>

          <section id="incidencias">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Gestión de Incidencias</h2>
            <p className="text-gray-700 mb-4">
              Disponemos de un sistema de monitorización 24/7 que nos permite detectar y responder
              proactivamente a cualquier incidencia.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Proceso de Gestión</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li><strong>Detección:</strong> Identificación automática o reporte del usuario</li>
                <li><strong>Clasificación:</strong> Asignación de prioridad según impacto</li>
                <li><strong>Comunicación:</strong> Notificación a usuarios afectados (si aplica)</li>
                <li><strong>Resolución:</strong> Trabajo del equipo técnico para solucionar la incidencia</li>
                <li><strong>Verificación:</strong> Confirmación de que el servicio funciona correctamente</li>
                <li><strong>Post-mortem:</strong> Análisis de causas y medidas preventivas (incidencias críticas)</li>
              </ol>
            </div>
          </section>

          <section id="compensaciones">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Compensaciones</h2>
            <p className="text-gray-700 mb-4">
              Si no cumplimos con el compromiso de disponibilidad del 99.5%, ofrecemos las siguientes compensaciones:
            </p>
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Disponibilidad Mensual</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Crédito de Servicio</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="px-4 py-3 text-sm text-gray-700">99.0% - 99.49%</td>
                    <td className="px-4 py-3 text-sm text-gray-700">10% de la cuota mensual</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-3 text-sm text-gray-700">95.0% - 98.99%</td>
                    <td className="px-4 py-3 text-sm text-gray-700">25% de la cuota mensual</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-700">Menos de 95.0%</td>
                    <td className="px-4 py-3 text-sm text-gray-700">50% de la cuota mensual</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <p className="text-yellow-800">
                <strong>Nota:</strong> Los créditos se aplican en la siguiente factura y no son acumulables
                ni transferibles. El crédito máximo por mes no superará el 50% de la cuota mensual.
              </p>
            </div>
          </section>

          <section id="exclusiones">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Exclusiones</h2>
            <p className="text-gray-700 mb-4">
              Las siguientes situaciones no se consideran incumplimiento del SLA:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Mantenimientos programados notificados con antelación</li>
                <li>Interrupciones causadas por proveedores externos (hosting, DNS, etc.)</li>
                <li>Ataques de denegación de servicio (DDoS) u otros ataques maliciosos</li>
                <li>Causas de fuerza mayor (desastres naturales, conflictos, etc.)</li>
                <li>Problemas de conectividad del usuario</li>
                <li>Uso indebido del servicio por parte del usuario</li>
                <li>Incidencias durante el período de prueba gratuita</li>
              </ul>
            </div>
          </section>

          <section id="reclamaciones">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Procedimiento de Reclamaciones</h2>
            <p className="text-gray-700 mb-4">
              Para solicitar un crédito por incumplimiento del SLA:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <ol className="list-decimal list-inside space-y-3 text-gray-700">
                <li>
                  <strong>Plazo:</strong> La reclamación debe realizarse dentro de los 15 días siguientes
                  al fin del mes en que ocurrió la incidencia.
                </li>
                <li>
                  <strong>Formato:</strong> Envía un email a {LEGAL_CONTACT.email} con el asunto
                  &quot;Reclamación SLA - [Tu email de cuenta]&quot;.
                </li>
                <li>
                  <strong>Información requerida:</strong>
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>Fechas y horas de la incidencia</li>
                    <li>Descripción del problema experimentado</li>
                    <li>Impacto en tu uso del servicio</li>
                  </ul>
                </li>
                <li>
                  <strong>Respuesta:</strong> Revisaremos tu reclamación y responderemos en un máximo
                  de 10 días laborables.
                </li>
              </ol>
            </div>
          </section>

          <section id="contacto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contacto</h2>
            <p className="text-gray-700 mb-4">
              Para cualquier consulta relacionada con este Acuerdo de Nivel de Servicio:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> {LEGAL_CONTACT.email}</p>
              <p className="text-gray-700"><strong>Teléfono:</strong> {LEGAL_CONTACT.phone}</p>
              <p className="text-gray-700"><strong>Dirección:</strong> {LEGAL_CONTACT.fullAddress}</p>
            </div>
          </section>

        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-4">Otras políticas legales:</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/legal/terms" className="text-blue-600 hover:underline text-sm">
              Términos y Condiciones
            </Link>
            <Link href="/legal/privacy" className="text-blue-600 hover:underline text-sm">
              Política de Privacidad
            </Link>
            <Link href="/legal/billing" className="text-blue-600 hover:underline text-sm">
              Términos de Facturación
            </Link>
            <Link href="/legal/data-deletion" className="text-blue-600 hover:underline text-sm">
              Eliminación de Datos
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:underline"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
