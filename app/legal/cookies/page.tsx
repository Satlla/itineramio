import Link from 'next/link'
import { POLICY_VERSION, POLICY_LAST_UPDATE, LEGAL_CONTACT } from '@/config/policies'

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Política de Cookies</h1>
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
            <li>• Usamos cookies para mejorar su experiencia y funcionamiento del sitio</li>
            <li>• Las cookies técnicas son esenciales y no requieren consentimiento</li>
            <li>• Las cookies analíticas y de marketing requieren su consentimiento explícito</li>
            <li>• Puede gestionar sus preferencias de cookies en cualquier momento</li>
            <li>• No utilizamos cookies de terceros para publicidad sin su consentimiento</li>
          </ul>
        </div>

        {/* Table of Contents */}
        <nav className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Índice de Contenidos</h2>
          <ul className="space-y-2">
            <li><a href="#que-son" className="text-blue-600 hover:underline">1. ¿Qué son las Cookies?</a></li>
            <li><a href="#tipos" className="text-blue-600 hover:underline">2. Tipos de Cookies que Utilizamos</a></li>
            <li><a href="#técnicas" className="text-blue-600 hover:underline">3. Cookies Técnicas (Esenciales)</a></li>
            <li><a href="#analiticas" className="text-blue-600 hover:underline">4. Cookies Analíticas</a></li>
            <li><a href="#marketing" className="text-blue-600 hover:underline">5. Cookies de Marketing</a></li>
            <li><a href="#gestión" className="text-blue-600 hover:underline">6. Gestión de Cookies</a></li>
            <li><a href="#duracion" className="text-blue-600 hover:underline">7. Duración de las Cookies</a></li>
            <li><a href="#terceros" className="text-blue-600 hover:underline">8. Cookies de Terceros</a></li>
            <li><a href="#actualizaciones" className="text-blue-600 hover:underline">9. Actualizaciones de esta Política</a></li>
            <li><a href="#contacto" className="text-blue-600 hover:underline">10. Contacto</a></li>
          </ul>
        </nav>

        {/* Content Sections */}
        <div className="prose prose-blue max-w-none space-y-8">

          <section id="que-son">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. ¿Qué son las Cookies?</h2>
            <p className="text-gray-700 mb-4">
              Las cookies son pequeños archivos de texto que se almacenan en su dispositivo (ordenador, tablet, smartphone)
              cuando visita un sitio web. Las cookies permiten que el sitio web recuerde sus acciones y preferencias
              durante un período de tiempo.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">¿Para qué sirven las cookies?</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>Mantener su sesión activa mientras navega</li>
                <li>Recordar sus preferencias (idioma, región, etc.)</li>
                <li>Mejorar la experiencia de usuario</li>
                <li>Analizar cómo se usa el sitio web</li>
                <li>Ofrecer contenido personalizado</li>
              </ul>
            </div>
          </section>

          <section id="tipos">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Tipos de Cookies que Utilizamos</h2>
            <p className="text-gray-700 mb-4">
              En Itineramio utilizamos diferentes tipos de cookies según su propósito y origen:
            </p>

            <div className="space-y-4">
              <div className="border-l-4 border-green-500 bg-green-50 p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Cookies Técnicas (Esenciales)</h3>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Finalidad:</strong> Necesarias para el funcionamiento básico del sitio web.
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Consentimiento:</strong> No requieren consentimiento (Art. 22.2 LSSI-CE).
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Ejemplos:</strong> Autenticación, carrito de compra, seguridad.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 bg-blue-50 p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Cookies Analíticas</h3>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Finalidad:</strong> Analizar el comportamiento de los usuarios y mejorar el servicio.
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Consentimiento:</strong> Requieren consentimiento explícito.
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Ejemplos:</strong> Estadísticas de visitas, páginas populares, tiempo de navegación.
                </p>
              </div>

              <div className="border-l-4 border-purple-500 bg-purple-50 p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Cookies de Marketing/Publicidad</h3>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Finalidad:</strong> Ofrecer publicidad personalizada y medir campañas.
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Consentimiento:</strong> Requieren consentimiento explícito.
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Ejemplos:</strong> Retargeting, publicidad personalizada, seguimiento de conversiones.
                </p>
              </div>
            </div>
          </section>

          <section id="técnicas">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Cookies Técnicas (Esenciales)</h2>
            <p className="text-gray-700 mb-4">
              Estás cookies son estrictamente necesarias para que pueda navegar por el sitio web y usar sus funcionalidades.
              Sin estás cookies, no podemos prestar el servicio correctamente.
            </p>

            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Nombre</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Propósito</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Duración</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-3 px-4 text-gray-700 font-mono text-xs">auth-token</td>
                    <td className="py-3 px-4 text-gray-700">Token de autenticación para mantener su sesión activa</td>
                    <td className="py-3 px-4 text-gray-700">7 días</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-gray-700 font-mono text-xs">__Secure-next-auth.session-token</td>
                    <td className="py-3 px-4 text-gray-700">Sesión segura de Next.js</td>
                    <td className="py-3 px-4 text-gray-700">30 días</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-gray-700 font-mono text-xs">cookie_consent</td>
                    <td className="py-3 px-4 text-gray-700">Almacena sus preferencias de cookies</td>
                    <td className="py-3 px-4 text-gray-700">12 meses</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-gray-700 font-mono text-xs">XSRF-TOKEN</td>
                    <td className="py-3 px-4 text-gray-700">Protección contra ataques CSRF</td>
                    <td className="py-3 px-4 text-gray-700">Sesión</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-4">
              <p className="text-sm text-gray-700">
                <strong>Nota legal:</strong> Según el Art. 22.2 de la LSSI-CE, estás cookies están exentas de la obligación
                de obtener consentimiento informado, ya que son estrictamente necesarias para la prestación del servicio
                solicitado expresamente por el usuario.
              </p>
            </div>
          </section>

          <section id="analiticas">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Cookies Analíticas</h2>
            <p className="text-gray-700 mb-4">
              Utilizamos cookies analíticas para entender cómo interactúa con nuestro sitio web y mejorar su experiencia.
              Solo activamos estás cookies si nos ha dado su consentimiento explícito.
            </p>

            <div className="bg-gray-50 rounded-lg overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Proveedor</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Cookie</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Propósito</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Duración</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-3 px-4 text-gray-700">Propio</td>
                    <td className="py-3 px-4 text-gray-700 font-mono text-xs">_ga</td>
                    <td className="py-3 px-4 text-gray-700">Identificador único de usuario</td>
                    <td className="py-3 px-4 text-gray-700">24 meses</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-gray-700">Propio</td>
                    <td className="py-3 px-4 text-gray-700 font-mono text-xs">_ga_*</td>
                    <td className="py-3 px-4 text-gray-700">Estado de sesión de Google Analytics</td>
                    <td className="py-3 px-4 text-gray-700">24 meses</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-gray-700">Propio</td>
                    <td className="py-3 px-4 text-gray-700 font-mono text-xs">analytics_session</td>
                    <td className="py-3 px-4 text-gray-700">Análisis interno de navegación</td>
                    <td className="py-3 px-4 text-gray-700">30 minutos</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Información que recopilamos:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>Páginas visitadas y tiempo de permanencia</li>
                <li>Fuente de tráfico (cómo llegó a nuestro sitio)</li>
                <li>Dispositivo y navegador utilizado</li>
                <li>Resolución de pantalla</li>
                <li>Eventos e interacciones (clics, scroll, etc.)</li>
              </ul>
              <p className="text-xs text-gray-600 mt-3">
                Todos los datos recopilados son anónimos y agregados. No identificamos a usuarios individuales.
              </p>
            </div>
          </section>

          <section id="marketing">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cookies de Marketing</h2>
            <p className="text-gray-700 mb-4">
              Las cookies de marketing nos permiten mostrarle contenido relevante y medir la efectividad de nuestras campañas.
              Solo las usamos si ha dado su consentimiento explícito.
            </p>

            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-4">
              <p className="text-sm text-gray-700">
                <strong>Estado actual:</strong> Actualmente no utilizamos cookies de marketing de terceros.
                Si en el futuro decidimos implementarlas, solicitaremos su consentimiento explícito a través del banner de cookies.
              </p>
            </div>

            <p className="text-gray-700 text-sm">
              Cuando implementemos cookies de marketing, serán para:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm mb-4">
              <li>Personalizar el contenido que ve en nuestra web</li>
              <li>Mostrar anuncios relevantes en otras plataformas</li>
              <li>Medir la efectividad de campañas publicitarias</li>
              <li>Evitar mostrarle el mismo anuncio repetidamente</li>
            </ul>
          </section>

          <section id="gestión">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Gestión de Cookies</h2>
            <p className="text-gray-700 mb-4">
              Usted tiene control total sobre las cookies que acepta. Puede gestionar sus preferencias de las siguientes formas:
            </p>

            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">🎛️ Panel de Preferencias de Itineramio</h3>
                <p className="text-sm text-gray-700 mb-2">
                  Haga clic en el botón "Configurar Cookies" que aparece en el pie de página o en el banner de cookies
                  para cambiar sus preferencias en cualquier momento.
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">🌐 Configuración del Navegador</h3>
                <p className="text-sm text-gray-700 mb-2">
                  Puede bloquear o eliminar cookies desde la configuración de su navegador:
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• <strong>Chrome:</strong> Configuración → Privacidad y seguridad → Cookies</li>
                  <li>• <strong>Firefox:</strong> Preferencias → Privacidad y seguridad → Cookies y datos del sitio</li>
                  <li>• <strong>Safari:</strong> Preferencias → Privacidad → Gestionar datos del sitio web</li>
                  <li>• <strong>Edge:</strong> Configuración → Cookies y permisos del sitio → Cookies</li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <p className="text-sm text-gray-700">
                <strong>Importante:</strong> Si bloquea las cookies técnicas, algunas funcionalidades del sitio web
                pueden no funcionar correctamente. Por ejemplo, no podrá iniciar sesión o mantener su sesión activa.
              </p>
            </div>
          </section>

          <section id="duracion">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Duración de las Cookies</h2>
            <p className="text-gray-700 mb-4">
              Las cookies pueden ser de sesión o persistentes según su duración:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Cookies de Sesión</h3>
                <p className="text-sm text-gray-700 mb-2">
                  Se eliminan automáticamente cuando cierra el navegador.
                </p>
                <p className="text-xs text-gray-600">
                  Ejemplo: Token CSRF para protección de formularios.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Cookies Persistentes</h3>
                <p className="text-sm text-gray-700 mb-2">
                  Permanecen en su dispositivo durante un período específico o hasta que las elimine manualmente.
                </p>
                <p className="text-xs text-gray-600">
                  Ejemplo: Preferencias de idioma (12 meses), autenticación (7 días).
                </p>
              </div>
            </div>

            <div className="mt-4 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Períodos máximos de conservación:</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• <strong>Cookies técnicas:</strong> Máximo 12 meses</li>
                <li>• <strong>Cookies analíticas:</strong> Máximo 24 meses</li>
                <li>• <strong>Cookies de marketing:</strong> Máximo 24 meses</li>
              </ul>
              <p className="text-xs text-gray-600 mt-3">
                Cumplimos con las directrices del GT29 (Grupo de Trabajo del Artículo 29) sobre cookies.
              </p>
            </div>
          </section>

          <section id="terceros">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies de Terceros</h2>
            <p className="text-gray-700 mb-4">
              Algunos servicios externos que utilizamos pueden instalar sus propias cookies en su dispositivo:
            </p>

            <div className="space-y-3">
              <div className="border-l-4 border-gray-500 pl-4">
                <h4 className="font-semibold text-gray-900">Stripe (Procesamiento de Pagos)</h4>
                <p className="text-sm text-gray-600 mb-1">
                  Cookies utilizadas para procesar pagos de forma segura y prevenir fraude.
                </p>
                <p className="text-xs text-gray-500">
                  Política de privacidad:{' '}
                  <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    stripe.com/privacy
                  </a>
                </p>
              </div>

              <div className="border-l-4 border-gray-500 pl-4">
                <h4 className="font-semibold text-gray-900">Vercel (Hosting)</h4>
                <p className="text-sm text-gray-600 mb-1">
                  Cookies técnicas para funcionamiento y seguridad de la infraestructura.
                </p>
                <p className="text-xs text-gray-500">
                  Política de privacidad:{' '}
                  <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    vercel.com/legal/privacy-policy
                  </a>
                </p>
              </div>
            </div>

            <p className="text-gray-700 text-sm mt-4">
              No tenemos control sobre las cookies de terceros. Le recomendamos revisar las políticas de privacidad
              de estos servicios para entender cómo usan las cookies.
            </p>
          </section>

          <section id="actualizaciones">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Actualizaciones de esta Política</h2>
            <p className="text-gray-700 mb-4">
              Podemos actualizar esta Política de Cookies periódicamente para reflejar cambios en nuestras prácticas
              o requisitos legales.
            </p>
            <p className="text-gray-700">
              La fecha de la última actualización se muestra al inicio de esta página. Le recomendamos revisar
              esta política regularmente. Si realizamos cambios significativos, se lo notificaremos mediante un
              aviso destacado en el sitio web.
            </p>
          </section>

          <section id="contacto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contacto</h2>
            <p className="text-gray-700 mb-4">
              Si tiene preguntas sobre nuestra Política de Cookies, puede contactarnos en:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 mb-2"><strong>Email:</strong> {LEGAL_CONTACT.email}</p>
              <p className="text-gray-700 mb-2"><strong>Soporte:</strong> {LEGAL_CONTACT.email}</p>
              <p className="text-gray-700"><strong>Dirección:</strong> {LEGAL_CONTACT.address}</p>
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
            <Link href="/legal/legal-notice" className="text-blue-600 hover:underline text-sm">
              Aviso Legal
            </Link>
            <Link href="/legal/dpa" className="text-blue-600 hover:underline text-sm">
              DPA
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:underline"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
