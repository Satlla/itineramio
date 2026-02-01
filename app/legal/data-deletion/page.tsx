'use client'

import Link from 'next/link'
import { POLICY_VERSION, POLICY_LAST_UPDATE, LEGAL_CONTACT } from '@/config/policies'

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Eliminación de Cuenta y Datos</h1>
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
            <li>• Tienes derecho a solicitar la eliminación de tu cuenta y datos en cualquier momento</li>
            <li>• Procesamos las solicitudes en un máximo de 30 días (conforme al RGPD)</li>
            <li>• Algunos datos pueden retenerse por obligaciones legales (facturas, documentos fiscales)</li>
            <li>• La eliminación es irreversible - asegúrate de exportar tus datos antes</li>
            <li>• Las suscripciones activas deben cancelarse antes de eliminar la cuenta</li>
          </ul>
        </div>

        {/* Table of Contents */}
        <nav className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Índice de Contenidos</h2>
          <ul className="space-y-2">
            <li><a href="#derecho" className="text-blue-600 hover:underline">1. Tu Derecho a la Eliminación</a></li>
            <li><a href="#procedimiento" className="text-blue-600 hover:underline">2. Procedimiento de Solicitud</a></li>
            <li><a href="#datos-eliminados" className="text-blue-600 hover:underline">3. Datos que se Eliminan</a></li>
            <li><a href="#datos-retenidos" className="text-blue-600 hover:underline">4. Datos que se Retienen</a></li>
            <li><a href="#plazos" className="text-blue-600 hover:underline">5. Plazos de Procesamiento</a></li>
            <li><a href="#antes-eliminar" className="text-blue-600 hover:underline">6. Antes de Eliminar tu Cuenta</a></li>
            <li><a href="#consecuencias" className="text-blue-600 hover:underline">7. Consecuencias de la Eliminación</a></li>
            <li><a href="#contacto" className="text-blue-600 hover:underline">8. Contacto</a></li>
          </ul>
        </nav>

        {/* Content Sections */}
        <div className="prose prose-blue max-w-none space-y-8">

          <section id="derecho">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Tu Derecho a la Eliminación</h2>
            <p className="text-gray-700 mb-4">
              De acuerdo con el Artículo 17 del Reglamento General de Protección de Datos (RGPD),
              tienes derecho a solicitar la eliminación de tus datos personales cuando:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>Los datos ya no son necesarios para los fines para los que fueron recogidos</li>
              <li>Retiras tu consentimiento y no existe otra base legal para el tratamiento</li>
              <li>Te opones al tratamiento y no prevalecen otros motivos legítimos</li>
              <li>Los datos han sido tratados ilícitamente</li>
              <li>Deben suprimirse para cumplir una obligación legal</li>
            </ul>
            <div className="bg-green-50 border-l-4 border-green-500 p-4">
              <p className="text-green-800">
                <strong>Compromiso de Itineramio:</strong> Respetamos tu derecho al olvido y facilitamos
                el proceso de eliminación de datos de forma transparente y eficiente.
              </p>
            </div>
          </section>

          <section id="procedimiento">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Procedimiento de Solicitud</h2>
            <p className="text-gray-700 mb-4">
              Para solicitar la eliminación de tu cuenta y datos personales, sigue estos pasos:
            </p>

            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                <h3 className="font-semibold text-gray-900 mb-2">Opción 1: Desde tu Panel de Control (Recomendado)</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Inicia sesión en tu cuenta de Itineramio</li>
                  <li>Ve a <strong>Configuración</strong> → <strong>Cuenta</strong></li>
                  <li>Haz clic en <strong>&quot;Eliminar mi cuenta&quot;</strong></li>
                  <li>Confirma tu decisión introduciendo tu contraseña</li>
                  <li>Recibirás un email de confirmación</li>
                </ol>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400">
                <h3 className="font-semibold text-gray-900 mb-2">Opción 2: Por Email</h3>
                <p className="text-gray-700 mb-3">
                  Envía un email a <a href={`mailto:${LEGAL_CONTACT.email}`} className="text-blue-600 hover:underline">{LEGAL_CONTACT.email}</a> con:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li><strong>Asunto:</strong> &quot;Solicitud de eliminación de cuenta - RGPD&quot;</li>
                  <li><strong>Contenido:</strong>
                    <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                      <li>Email asociado a tu cuenta</li>
                      <li>Nombre completo del titular</li>
                      <li>Motivo de la solicitud (opcional)</li>
                      <li>Confirmación expresa de que deseas eliminar todos tus datos</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-4">
              <p className="text-yellow-800">
                <strong>Verificación de identidad:</strong> Para proteger tus datos, podemos solicitar
                información adicional para verificar que eres el titular de la cuenta.
              </p>
            </div>
          </section>

          <section id="datos-eliminados">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Datos que se Eliminan</h2>
            <p className="text-gray-700 mb-4">
              Cuando procesamos tu solicitud de eliminación, eliminamos permanentemente:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Datos de perfil:</strong> Nombre, email, teléfono, foto de perfil</li>
                <li><strong>Propiedades:</strong> Todas las propiedades creadas y su configuración</li>
                <li><strong>Manuales digitales:</strong> Todo el contenido de los manuales (textos, imágenes, vídeos)</li>
                <li><strong>Evaluaciones:</strong> Valoraciones y comentarios de huéspedes</li>
                <li><strong>Configuraciones:</strong> Preferencias, integraciones, zonas personalizadas</li>
                <li><strong>Historial de actividad:</strong> Logs de uso, métricas, analytics</li>
                <li><strong>Comunicaciones:</strong> Historial de emails y notificaciones</li>
              </ul>
            </div>
          </section>

          <section id="datos-retenidos">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Datos que se Retienen</h2>
            <p className="text-gray-700 mb-4">
              Por obligaciones legales, debemos retener ciertos datos durante los plazos establecidos por ley:
            </p>
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Tipo de Dato</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Plazo de Retención</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Base Legal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="px-4 py-3 text-sm text-gray-700">Facturas y documentos fiscales</td>
                    <td className="px-4 py-3 text-sm text-gray-700">6 años</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Código de Comercio (Art. 30)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-3 text-sm text-gray-700">Datos de transacciones de pago</td>
                    <td className="px-4 py-3 text-sm text-gray-700">5 años</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Ley de Prevención de Blanqueo</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-3 text-sm text-gray-700">Registros de consentimiento</td>
                    <td className="px-4 py-3 text-sm text-gray-700">5 años</td>
                    <td className="px-4 py-3 text-sm text-gray-700">RGPD (demostración de cumplimiento)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-700">Comunicaciones contractuales</td>
                    <td className="px-4 py-3 text-sm text-gray-700">5 años</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Código Civil (prescripción)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-600">
              Estos datos se almacenan de forma segura y anonimizada cuando es posible, y solo se utilizan
              para cumplir con obligaciones legales o defender derechos en caso de reclamación.
            </p>
          </section>

          <section id="plazos">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Plazos de Procesamiento</h2>
            <p className="text-gray-700 mb-4">
              Procesamos las solicitudes de eliminación siguiendo estos plazos:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ul className="list-disc list-inside space-y-3 text-gray-700">
                <li>
                  <strong>Confirmación de recepción:</strong> 72 horas desde la solicitud
                </li>
                <li>
                  <strong>Procesamiento completo:</strong> Máximo 30 días (conforme al RGPD Art. 12.3)
                </li>
                <li>
                  <strong>Notificación de finalización:</strong> Email confirmando la eliminación
                </li>
              </ul>
            </div>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
              <p className="text-blue-800">
                <strong>Prórroga:</strong> En casos excepcionales de complejidad, el plazo puede extenderse
                otros 60 días. Te notificaremos si esto ocurre y el motivo.
              </p>
            </div>
          </section>

          <section id="antes-eliminar">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Antes de Eliminar tu Cuenta</h2>
            <p className="text-gray-700 mb-4">
              Te recomendamos realizar estas acciones antes de solicitar la eliminación:
            </p>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">1. Exporta tus datos</h3>
                <p className="text-gray-700">
                  Descarga una copia de tus propiedades, manuales y evaluaciones desde
                  <strong> Configuración → Exportar Datos</strong>.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">2. Cancela tu suscripción</h3>
                <p className="text-gray-700">
                  Si tienes una suscripción activa, cancélala primero desde
                  <strong> Configuración → Suscripción → Cancelar</strong>.
                  No se realizarán reembolsos por el período no utilizado.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">3. Descarga tus facturas</h3>
                <p className="text-gray-700">
                  Guarda copias de tus facturas desde <strong>Configuración → Facturación</strong>
                  ya que no podrás acceder a ellas después de la eliminación.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">4. Informa a tus huéspedes</h3>
                <p className="text-gray-700">
                  Los enlaces a tus manuales digitales dejarán de funcionar. Considera notificar
                  a huéspedes con reservas activas si es necesario.
                </p>
              </div>
            </div>
          </section>

          <section id="consecuencias">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Consecuencias de la Eliminación</h2>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-red-800 font-semibold mb-2">La eliminación es permanente e irreversible</p>
              <p className="text-red-700">
                Una vez procesada la solicitud, no podremos recuperar tus datos bajo ninguna circunstancia.
              </p>
            </div>
            <p className="text-gray-700 mb-4">
              Tras la eliminación de tu cuenta:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Perderás acceso inmediato a la plataforma</li>
              <li>Tus manuales digitales y QR codes dejarán de funcionar</li>
              <li>Los huéspedes no podrán acceder al contenido de tus propiedades</li>
              <li>Se cancelarán todas las integraciones activas</li>
              <li>No podrás reactivar la cuenta ni recuperar los datos</li>
              <li>Si deseas volver a usar Itineramio, deberás crear una cuenta nueva</li>
            </ul>
          </section>

          <section id="contacto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contacto</h2>
            <p className="text-gray-700 mb-4">
              Para cualquier consulta sobre la eliminación de datos o para ejercer tus derechos:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700"><strong>Responsable:</strong> {LEGAL_CONTACT.companyName}</p>
              <p className="text-gray-700"><strong>Email:</strong> {LEGAL_CONTACT.email}</p>
              <p className="text-gray-700"><strong>Teléfono:</strong> {LEGAL_CONTACT.phone}</p>
              <p className="text-gray-700"><strong>Dirección:</strong> {LEGAL_CONTACT.fullAddress}</p>
            </div>
            <p className="text-gray-700 mt-4">
              Si no estás satisfecho con nuestra respuesta, puedes presentar una reclamación ante la
              <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                Agencia Española de Protección de Datos (AEPD)
              </a>.
            </p>
          </section>

        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-4">Otras políticas legales:</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/legal/privacy" className="text-blue-600 hover:underline text-sm">
              Política de Privacidad
            </Link>
            <Link href="/legal/terms" className="text-blue-600 hover:underline text-sm">
              Términos y Condiciones
            </Link>
            <Link href="/legal/dpa" className="text-blue-600 hover:underline text-sm">
              Acuerdo de Procesamiento de Datos
            </Link>
            <Link href="/legal/sla" className="text-blue-600 hover:underline text-sm">
              Acuerdo de Nivel de Servicio
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
