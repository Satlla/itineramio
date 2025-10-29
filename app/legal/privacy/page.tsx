import Link from 'next/link'
import { POLICY_VERSION, POLICY_LAST_UPDATE, LEGAL_CONTACT } from '@/src/config/policies'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Política de Privacidad</h1>
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
            <li>• Cumplimos con el RGPD y protegemos sus datos personales</li>
            <li>• Recopilamos solo la información necesaria para prestar el servicio</li>
            <li>• Nunca vendemos sus datos a terceros</li>
            <li>• Puede acceder, rectificar o eliminar sus datos en cualquier momento</li>
            <li>• Usamos cifrado SSL/TLS y medidas de seguridad robustas</li>
          </ul>
        </div>

        {/* Table of Contents */}
        <nav className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Índice de Contenidos</h2>
          <ul className="space-y-2">
            <li><a href="#responsable" className="text-blue-600 hover:underline">1. Responsable del Tratamiento</a></li>
            <li><a href="#datos-recopilados" className="text-blue-600 hover:underline">2. Datos que Recopilamos</a></li>
            <li><a href="#finalidad" className="text-blue-600 hover:underline">3. Finalidad del Tratamiento</a></li>
            <li><a href="#base-legal" className="text-blue-600 hover:underline">4. Base Legal</a></li>
            <li><a href="#destinatarios" className="text-blue-600 hover:underline">5. Destinatarios de los Datos</a></li>
            <li><a href="#conservacion" className="text-blue-600 hover:underline">6. Conservación de Datos</a></li>
            <li><a href="#derechos" className="text-blue-600 hover:underline">7. Sus Derechos</a></li>
            <li><a href="#seguridad" className="text-blue-600 hover:underline">8. Medidas de Seguridad</a></li>
            <li><a href="#cookies" className="text-blue-600 hover:underline">9. Cookies y Tecnologías Similares</a></li>
            <li><a href="#transferencias" className="text-blue-600 hover:underline">10. Transferencias Internacionales</a></li>
            <li><a href="#menores" className="text-blue-600 hover:underline">11. Menores de Edad</a></li>
            <li><a href="#cambios" className="text-blue-600 hover:underline">12. Cambios en esta Política</a></li>
            <li><a href="#contacto" className="text-blue-600 hover:underline">13. Contacto</a></li>
          </ul>
        </nav>

        {/* Content Sections */}
        <div className="prose prose-blue max-w-none space-y-8">

          <section id="responsable">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Responsable del Tratamiento</h2>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-gray-700 mb-2"><strong>Identidad:</strong> {LEGAL_CONTACT.company}</p>
              <p className="text-gray-700 mb-2"><strong>Dirección:</strong> {LEGAL_CONTACT.address}</p>
              <p className="text-gray-700 mb-2"><strong>Email de contacto:</strong> {LEGAL_CONTACT.email}</p>
              <p className="text-gray-700"><strong>Delegado de Protección de Datos:</strong> {LEGAL_CONTACT.legal}</p>
            </div>
            <p className="text-gray-700">
              {LEGAL_CONTACT.company} es el responsable del tratamiento de sus datos personales de acuerdo con el Reglamento General de Protección de Datos (RGPD - UE 2016/679) y la Ley Orgánica 3/2018 de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD).
            </p>
          </section>

          <section id="datos-recopilados">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Datos que Recopilamos</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Datos de Registro</h3>
            <p className="text-gray-700 mb-2">Cuando crea una cuenta, recopilamos:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>Nombre completo</li>
              <li>Dirección de correo electrónico</li>
              <li>Contraseña (cifrada)</li>
              <li>Número de teléfono (opcional)</li>
              <li>Información de la empresa (opcional)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Datos de Uso</h3>
            <p className="text-gray-700 mb-2">Durante el uso del servicio, recopilamos:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>Información de las propiedades creadas</li>
              <li>Contenido de los manuales digitales (textos, imágenes, videos)</li>
              <li>Datos de interacción con la plataforma</li>
              <li>Métricas y analytics de uso</li>
              <li>Evaluaciones y comentarios de huéspedes</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.3 Datos Técnicos</h3>
            <p className="text-gray-700 mb-2">Automáticamente recopilamos:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>Dirección IP</li>
              <li>Tipo de navegador y versión</li>
              <li>Sistema operativo</li>
              <li>Información del dispositivo</li>
              <li>Páginas visitadas y tiempo de visita</li>
              <li>Referrer URL</li>
              <li>Cookies y tecnologías similares (ver nuestra{' '}
                <Link href="/legal/cookies" className="text-blue-600 hover:underline">
                  Política de Cookies
                </Link>)
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.4 Datos de Facturación</h3>
            <p className="text-gray-700 mb-2">Para procesar pagos, recopilamos:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>Información de tarjeta de crédito/débito (procesada por Stripe)</li>
              <li>Dirección de facturación</li>
              <li>NIF/CIF (para facturación española)</li>
              <li>Historial de transacciones</li>
            </ul>
            <p className="text-sm text-gray-600 italic">
              Nota: Los datos de pago son procesados directamente por Stripe y no los almacenamos en nuestros servidores.
            </p>
          </section>

          <section id="finalidad">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Finalidad del Tratamiento</h2>
            <p className="text-gray-700 mb-4">Utilizamos sus datos personales para los siguientes fines:</p>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Prestación del Servicio</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Gestionar su cuenta y autenticación</li>
                  <li>Crear y administrar manuales digitales</li>
                  <li>Generar códigos QR únicos</li>
                  <li>Procesar evaluaciones de huéspedes</li>
                  <li>Proporcionar analytics y métricas</li>
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Facturación y Pagos</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Procesar suscripciones y pagos</li>
                  <li>Emitir facturas</li>
                  <li>Gestionar reembolsos</li>
                  <li>Prevenir fraude</li>
                </ul>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Comunicaciones</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Enviar notificaciones del servicio</li>
                  <li>Responder a consultas de soporte</li>
                  <li>Enviar actualizaciones importantes del servicio</li>
                  <li>Comunicaciones de marketing (solo con su consentimiento)</li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Mejora y Desarrollo</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Analizar patrones de uso</li>
                  <li>Mejorar funcionalidades</li>
                  <li>Detectar y corregir errores</li>
                  <li>Desarrollar nuevas características</li>
                </ul>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Cumplimiento Legal</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Cumplir con obligaciones legales</li>
                  <li>Responder a requerimientos judiciales</li>
                  <li>Proteger nuestros derechos y propiedad</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="base-legal">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Base Legal</h2>
            <p className="text-gray-700 mb-4">
              El tratamiento de sus datos personales se basa en las siguientes bases legales conforme al RGPD:
            </p>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-2 font-semibold text-gray-900">Finalidad</th>
                    <th className="text-left py-2 font-semibold text-gray-900">Base Legal (RGPD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-2 text-gray-700">Prestación del servicio</td>
                    <td className="py-2 text-gray-700">Ejecución del contrato (Art. 6.1.b)</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-700">Facturación y pagos</td>
                    <td className="py-2 text-gray-700">Ejecución del contrato (Art. 6.1.b)</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-700">Comunicaciones de marketing</td>
                    <td className="py-2 text-gray-700">Consentimiento (Art. 6.1.a)</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-700">Mejora del servicio</td>
                    <td className="py-2 text-gray-700">Interés legítimo (Art. 6.1.f)</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-700">Cumplimiento legal</td>
                    <td className="py-2 text-gray-700">Obligación legal (Art. 6.1.c)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="destinatarios">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Destinatarios de los Datos</h2>
            <p className="text-gray-700 mb-4">
              Compartimos sus datos personales únicamente con terceros de confianza que nos ayudan a prestar el servicio:
            </p>

            <div className="space-y-3 mb-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-900">Stripe</h4>
                <p className="text-sm text-gray-600">Procesamiento de pagos y suscripciones</p>
                <p className="text-xs text-gray-500">Política: stripe.com/privacy</p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-gray-900">Supabase</h4>
                <p className="text-sm text-gray-600">Almacenamiento y base de datos (servidores EU)</p>
                <p className="text-xs text-gray-500">Política: supabase.com/privacy</p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold text-gray-900">Resend</h4>
                <p className="text-sm text-gray-600">Envío de correos electrónicos transaccionales</p>
                <p className="text-xs text-gray-500">Política: resend.com/legal/privacy-policy</p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4">
                <h4 className="font-semibold text-gray-900">Vercel</h4>
                <p className="text-sm text-gray-600">Hosting y despliegue de la aplicación</p>
                <p className="text-xs text-gray-500">Política: vercel.com/legal/privacy-policy</p>
              </div>
            </div>

            <p className="text-gray-700 text-sm">
              <strong>Importante:</strong> Todos nuestros proveedores de servicios están sujetos a acuerdos de procesamiento de datos (DPA) que garantizan el cumplimiento del RGPD y la protección de sus datos personales.
            </p>
          </section>

          <section id="conservacion">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Conservación de Datos</h2>
            <p className="text-gray-700 mb-4">
              Conservamos sus datos personales durante el tiempo necesario para cumplir con las finalidades descritas:
            </p>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <ul className="space-y-3 text-gray-700">
                <li>
                  <strong>Datos de cuenta:</strong> Durante la vigencia de su suscripción + 6 años (obligación legal fiscal)
                </li>
                <li>
                  <strong>Datos de facturación:</strong> 6 años (Art. 30 Código de Comercio)
                </li>
                <li>
                  <strong>Cookies técnicas:</strong> Máximo 12 meses
                </li>
                <li>
                  <strong>Cookies analíticas/marketing:</strong> Máximo 24 meses (con su consentimiento)
                </li>
                <li>
                  <strong>Logs de seguridad:</strong> Máximo 90 días
                </li>
              </ul>
            </div>

            <p className="text-gray-700">
              Tras el período de conservación, sus datos serán eliminados de forma segura o anonimizados para análisis estadísticos.
            </p>
          </section>

          <section id="derechos">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Sus Derechos</h2>
            <p className="text-gray-700 mb-4">
              De acuerdo con el RGPD, usted tiene los siguientes derechos sobre sus datos personales:
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">✓ Derecho de Acceso</h4>
                <p className="text-sm text-gray-700">Conocer qué datos personales tenemos sobre usted</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">✓ Derecho de Rectificación</h4>
                <p className="text-sm text-gray-700">Corregir datos inexactos o incompletos</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">✓ Derecho de Supresión</h4>
                <p className="text-sm text-gray-700">Solicitar la eliminación de sus datos ("derecho al olvido")</p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">✓ Derecho de Oposición</h4>
                <p className="text-sm text-gray-700">Oponerse al tratamiento de sus datos en determinadas circunstancias</p>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">✓ Derecho de Limitación</h4>
                <p className="text-sm text-gray-700">Solicitar la restricción del tratamiento de sus datos</p>
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">✓ Derecho de Portabilidad</h4>
                <p className="text-sm text-gray-700">Recibir sus datos en formato estructurado y transferirlos a otro responsable</p>
              </div>
            </div>

            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">¿Cómo ejercer sus derechos?</h4>
              <p className="text-gray-700 text-sm mb-2">
                Puede ejercer cualquiera de estos derechos enviando un correo a:
              </p>
              <p className="text-gray-900 font-semibold">{LEGAL_CONTACT.legal}</p>
              <p className="text-gray-600 text-sm mt-2">
                Incluya: nombre completo, email registrado, copia de DNI/NIE, y descripción de la solicitud.
                Responderemos en un plazo máximo de 30 días.
              </p>
            </div>

            <p className="text-gray-700 text-sm">
              Si considera que no hemos atendido correctamente sus derechos, puede presentar una reclamación ante la{' '}
              <a
                href="https://www.aepd.es"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-semibold"
              >
                Agencia Española de Protección de Datos (AEPD)
              </a>.
            </p>
          </section>

          <section id="seguridad">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Medidas de Seguridad</h2>
            <p className="text-gray-700 mb-4">
              Implementamos medidas técnicas y organizativas apropiadas para proteger sus datos personales:
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">🔒 Cifrado</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• SSL/TLS en todas las comunicaciones</li>
                  <li>• Cifrado de contraseñas con bcrypt</li>
                  <li>• Cifrado de datos en reposo</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">🛡️ Autenticación</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Tokens JWT con expiración</li>
                  <li>• Verificación de email obligatoria</li>
                  <li>• Sesiones seguras con cookies HttpOnly</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">🔐 Acceso Restringido</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Principio de mínimo privilegio</li>
                  <li>• Autenticación de dos factores (admin)</li>
                  <li>• Auditorías de acceso regulares</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">📊 Monitoreo</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Logs de seguridad y auditoría</li>
                  <li>• Detección de actividades sospechosas</li>
                  <li>• Backups automáticos diarios</li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <p className="text-sm text-gray-700">
                <strong>Importante:</strong> A pesar de nuestras medidas de seguridad, ningún método de transmisión por Internet es 100% seguro.
                Le recomendamos usar contraseñas fuertes y únicas, y nunca compartir sus credenciales de acceso.
              </p>
            </div>
          </section>

          <section id="cookies">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Cookies y Tecnologías Similares</h2>
            <p className="text-gray-700 mb-4">
              Utilizamos cookies y tecnologías similares para mejorar su experiencia. Para más información, consulte nuestra{' '}
              <Link href="/legal/cookies" className="text-blue-600 hover:underline font-semibold">
                Política de Cookies
              </Link>.
            </p>
            <p className="text-gray-700">
              Puede gestionar sus preferencias de cookies en cualquier momento desde la configuración de su navegador.
            </p>
          </section>

          <section id="transferencias">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Transferencias Internacionales</h2>
            <p className="text-gray-700 mb-4">
              Almacenamos sus datos principalmente en servidores ubicados en la Unión Europea (región eu-north-1 de Supabase).
            </p>
            <p className="text-gray-700 mb-4">
              Algunos de nuestros proveedores de servicios (como Vercel o Stripe) pueden procesar datos fuera del EEE.
              En estos casos, garantizamos que:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>El país de destino tiene un nivel adecuado de protección reconocido por la Comisión Europea</li>
              <li>Se aplican Cláusulas Contractuales Tipo (SCC) aprobadas por la UE</li>
              <li>El proveedor cumple con el Marco de Privacidad de Datos UE-EE.UU. (Data Privacy Framework)</li>
            </ul>
          </section>

          <section id="menores">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Menores de Edad</h2>
            <p className="text-gray-700 mb-4">
              Nuestro servicio está dirigido a personas mayores de 18 años. No recopilamos intencionadamente información
              personal de menores de edad.
            </p>
            <p className="text-gray-700">
              Si tiene conocimiento de que un menor ha proporcionado datos personales sin consentimiento parental,
              contacte inmediatamente con nosotros en {LEGAL_CONTACT.legal} para proceder a su eliminación.
            </p>
          </section>

          <section id="cambios">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Cambios en esta Política</h2>
            <p className="text-gray-700 mb-4">
              Nos reservamos el derecho de actualizar esta Política de Privacidad para reflejar cambios en nuestras prácticas
              o por requisitos legales.
            </p>
            <p className="text-gray-700">
              Le notificaremos sobre cambios materiales por email o mediante un aviso destacado en la plataforma al menos
              30 días antes de que entren en vigor. Le recomendamos revisar periódicamente esta política.
            </p>
          </section>

          <section id="contacto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contacto</h2>
            <p className="text-gray-700 mb-4">
              Para cualquier consulta sobre esta Política de Privacidad o el tratamiento de sus datos personales, puede contactarnos en:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 mb-2"><strong>Responsable:</strong> {LEGAL_CONTACT.company}</p>
              <p className="text-gray-700 mb-2"><strong>Email de Privacidad:</strong> {LEGAL_CONTACT.legal}</p>
              <p className="text-gray-700 mb-2"><strong>Email de Soporte:</strong> {LEGAL_CONTACT.support}</p>
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
            <Link href="/legal/cookies" className="text-blue-600 hover:underline text-sm">
              Política de Cookies
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
