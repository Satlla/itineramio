import Link from 'next/link'
import { POLICY_VERSION, POLICY_LAST_UPDATE, LEGAL_CONTACT } from '@/config/policies'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Términos y Condiciones</h1>
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
            <li>• Al usar Itineramio aceptas estos términos y nuestra política de privacidad</li>
            <li>• Ofrecemos período de prueba de 15 días para evaluar la plataforma</li>
            <li>• Eres responsable del contenido que publicas en tus manuales digitales</li>
            <li>• Podemos modificar estos términos con notificación previa de 30 días</li>
            <li>• Puedes cancelar tu suscripción en cualquier momento desde tu cuenta</li>
          </ul>
        </div>

        {/* Table of Contents */}
        <nav className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Índice de Contenidos</h2>
          <ul className="space-y-2">
            <li><a href="#aceptacion" className="text-blue-600 hover:underline">1. Aceptación de los Términos</a></li>
            <li><a href="#servicios" className="text-blue-600 hover:underline">2. Descripción de los Servicios</a></li>
            <li><a href="#registro" className="text-blue-600 hover:underline">3. Registro y Cuenta de Usuario</a></li>
            <li><a href="#suscripciones" className="text-blue-600 hover:underline">4. Suscripciones y Facturación</a></li>
            <li><a href="#uso-aceptable" className="text-blue-600 hover:underline">5. Uso Aceptable</a></li>
            <li><a href="#propiedad-intelectual" className="text-blue-600 hover:underline">6. Propiedad Intelectual</a></li>
            <li><a href="#contenido-usuario" className="text-blue-600 hover:underline">7. Contenido del Usuario</a></li>
            <li><a href="#privacidad" className="text-blue-600 hover:underline">8. Privacidad y Protección de Datos</a></li>
            <li><a href="#limitacion-responsabilidad" className="text-blue-600 hover:underline">9. Limitación de Responsabilidad</a></li>
            <li><a href="#modificaciones" className="text-blue-600 hover:underline">10. Modificaciones del Servicio</a></li>
            <li><a href="#suspension" className="text-blue-600 hover:underline">11. Suspensión y Terminación</a></li>
            <li><a href="#ley-aplicable" className="text-blue-600 hover:underline">12. Ley Aplicable y Jurisdicción</a></li>
            <li><a href="#contacto" className="text-blue-600 hover:underline">13. Contacto</a></li>
          </ul>
        </nav>

        {/* Content Sections */}
        <div className="prose prose-blue max-w-none space-y-8">

          <section id="aceptacion">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Aceptación de los Términos</h2>
            <p className="text-gray-700 mb-4">
              Al acceder y utilizar la plataforma Itineramio ("el Servicio"), usted acepta estar legalmente vinculado por estos Términos y Condiciones, todas las leyes y regulaciones aplicables, y acepta que es responsable del cumplimiento de todas las leyes locales aplicables.
            </p>
            <p className="text-gray-700 mb-4">
              Si no está de acuerdo con alguno de estos términos, tiene prohibido usar o acceder a este sitio. Los materiales contenidos en este sitio web están protegidos por las leyes de propiedad intelectual y derechos de autor aplicables.
            </p>
            <p className="text-gray-700">
              El uso continuado del Servicio después de cualquier modificación de estos términos constituye la aceptación de dichas modificaciones.
            </p>
          </section>

          <section id="servicios">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Descripción de los Servicios</h2>
            <p className="text-gray-700 mb-4">
              Itineramio es una plataforma SaaS que permite a propietarios y gestores de alojamientos turísticos crear, gestionar y compartir manuales digitales interactivos para sus huéspedes.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">El Servicio incluye:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Creación de manuales digitales personalizados por propiedad</li>
                <li>Gestión de zonas y pasos con contenido multimedia</li>
                <li>Códigos QR únicos para acceso de huéspedes</li>
                <li>Sistema de evaluaciones y feedback de huéspedes</li>
                <li>Analytics y métricas de uso</li>
                <li>Panel de administración con gestión de propiedades</li>
                <li>Soporte multiidioma (español, inglés, francés)</li>
              </ul>
            </div>
            <p className="text-gray-700">
              Nos reservamos el derecho de modificar, suspender o descontinuar cualquier aspecto del Servicio en cualquier momento, con o sin previo aviso.
            </p>
          </section>

          <section id="registro">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Registro y Cuenta de Usuario</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 Requisitos de Registro</h3>
            <p className="text-gray-700 mb-4">
              Para utilizar el Servicio, debe crear una cuenta proporcionando información precisa, actual y completa. Usted es responsable de mantener la confidencialidad de sus credenciales de acceso.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Responsabilidad de la Cuenta</h3>
            <p className="text-gray-700 mb-4">
              Usted es responsable de todas las actividades que ocurran bajo su cuenta. Debe notificarnos inmediatamente de cualquier uso no autorizado de su cuenta o cualquier otra violación de seguridad.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.3 Verificación de Email</h3>
            <p className="text-gray-700">
              Requiere verificar su dirección de correo electrónico antes de poder utilizar todas las funcionalidades del Servicio. El email de verificación se enviará automáticamente al registrarse.
            </p>
          </section>

          <section id="suscripciones">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Suscripciones y Facturación</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Período de Prueba</h3>
            <p className="text-gray-700 mb-4">
              Ofrecemos un período de evaluación de 15 días para que pueda probar la plataforma. Durante este período, tendrá acceso a todas las funcionalidades del plan correspondiente a su número de propiedades.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Planes de Suscripción</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-gray-700 mb-3">Ofrecemos los siguientes planes:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>BASIC:</strong> Hasta 2 propiedades - €9/mes</li>
                <li><strong>HOST:</strong> Hasta 10 propiedades - €29/mes</li>
                <li><strong>SUPERHOST:</strong> Hasta 25 propiedades - €69/mes</li>
                <li><strong>BUSINESS:</strong> Hasta 50 propiedades - €99/mes</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.3 Facturación y Renovación</h3>
            <p className="text-gray-700 mb-4">
              Las suscripciones se facturan mensualmente o semestralmente según su elección. La renovación es automática a menos que cancele antes del final del período de facturación.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.4 Política de Reembolsos</h3>
            <p className="text-gray-700 mb-4">
              Los pagos son no reembolsables excepto en casos establecidos por la legislación aplicable. Puede cancelar su suscripción en cualquier momento, con efecto al final del período de facturación actual.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.5 Cambios de Plan</h3>
            <p className="text-gray-700">
              Puede cambiar su plan en cualquier momento desde su panel de cuenta. Los cambios de plan se aplicarán inmediatamente con ajuste prorrateado según corresponda.
            </p>
          </section>

          <section id="uso-aceptable">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Uso Aceptable</h2>
            <p className="text-gray-700 mb-4">Al utilizar el Servicio, usted acepta NO:</p>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Violar cualquier ley o regulación local, nacional o internacional</li>
                <li>Infringir derechos de propiedad intelectual de terceros</li>
                <li>Subir contenido ilegal, ofensivo, difamatorio o inapropiado</li>
                <li>Intentar acceder de forma no autorizada a sistemas o redes</li>
                <li>Interferir con el funcionamiento del Servicio</li>
                <li>Transmitir virus, malware o código malicioso</li>
                <li>Usar el Servicio para spam o comunicaciones comerciales no solicitadas</li>
                <li>Hacerse pasar por otra persona o entidad</li>
                <li>Compartir credenciales de acceso con terceros</li>
              </ul>
            </div>
            <p className="text-gray-700">
              La violación de estas políticas puede resultar en la suspensión o terminación inmediata de su cuenta sin previo aviso y sin reembolso.
            </p>
          </section>

          <section id="propiedad-intelectual">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Propiedad Intelectual</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">6.1 Derechos de Itineramio</h3>
            <p className="text-gray-700 mb-4">
              Todos los derechos de propiedad intelectual del Servicio, incluyendo pero no limitado a: diseño, código fuente, gráficos, logotipos, marcas comerciales, y el nombre "Itineramio" son propiedad exclusiva de {LEGAL_CONTACT.company} o sus licenciantes.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">6.2 Licencia de Uso</h3>
            <p className="text-gray-700 mb-4">
              Se le otorga una licencia limitada, no exclusiva, intransferible y revocable para usar el Servicio de acuerdo con estos términos. Esta licencia no le otorga ningún derecho de propiedad sobre el Servicio.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">6.3 Restricciones</h3>
            <p className="text-gray-700">
              No puede copiar, modificar, distribuir, vender o alquilar ninguna parte del Servicio, ni realizar ingeniería inversa o intentar extraer el código fuente, a menos que las leyes lo prohíban o tenga nuestro permiso por escrito.
            </p>
          </section>

          <section id="contenido-usuario">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contenido del Usuario</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">7.1 Responsabilidad del Contenido</h3>
            <p className="text-gray-700 mb-4">
              Usted es el único responsable del contenido que sube, publica o comparte a través del Servicio, incluyendo textos, imágenes, videos y cualquier otro material ("Contenido del Usuario").
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">7.2 Derechos sobre el Contenido</h3>
            <p className="text-gray-700 mb-4">
              Usted conserva todos los derechos de propiedad sobre su Contenido del Usuario. Al subir contenido al Servicio, nos otorga una licencia mundial, no exclusiva, libre de regalías para usar, almacenar, reproducir y mostrar dicho contenido únicamente con el propósito de prestar el Servicio.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">7.3 Garantías del Contenido</h3>
            <p className="text-gray-700 mb-4">
              Al subir Contenido del Usuario, usted garantiza que:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>Posee todos los derechos necesarios sobre el contenido</li>
              <li>El contenido no infringe derechos de terceros</li>
              <li>El contenido cumple con todas las leyes aplicables</li>
              <li>El contenido es preciso y no engañoso</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">7.4 Remoción de Contenido</h3>
            <p className="text-gray-700">
              Nos reservamos el derecho de remover cualquier Contenido del Usuario que viole estos términos o que consideremos inapropiado, sin previo aviso y sin responsabilidad.
            </p>
          </section>

          <section id="privacidad">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Privacidad y Protección de Datos</h2>
            <p className="text-gray-700 mb-4">
              El uso del Servicio también está regido por nuestra{' '}
              <Link href="/legal/privacy" className="text-blue-600 hover:underline font-semibold">
                Política de Privacidad
              </Link>
              , que describe cómo recopilamos, usamos y protegemos su información personal de acuerdo con el RGPD (Reglamento General de Protección de Datos).
            </p>
            <p className="text-gray-700">
              Al usar el Servicio, usted consiente la recopilación y uso de información según lo descrito en nuestra Política de Privacidad.
            </p>
          </section>

          <section id="limitacion-responsabilidad">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitación de Responsabilidad</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">9.1 Servicio "TAL CUAL"</h3>
            <p className="text-gray-700 mb-4">
              El Servicio se proporciona "tal cual" y "según disponibilidad" sin garantías de ningún tipo, ya sean expresas o implícitas. No garantizamos que el Servicio sea ininterrumpido, seguro o libre de errores.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">9.2 Limitación de Daños</h3>
            <p className="text-gray-700 mb-4">
              En ningún caso {LEGAL_CONTACT.company} será responsable por daños indirectos, incidentales, especiales, consecuentes o punitivos, incluyendo pérdida de beneficios, datos, uso, fondo de comercio u otras pérdidas intangibles.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">9.3 Máxima Responsabilidad</h3>
            <p className="text-gray-700">
              Nuestra responsabilidad total por cualquier reclamo relacionado con el Servicio está limitada a la cantidad que usted haya pagado en los últimos 12 meses por el uso del Servicio.
            </p>
          </section>

          <section id="modificaciones">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Modificaciones del Servicio</h2>
            <p className="text-gray-700 mb-4">
              Nos reservamos el derecho de modificar o descontinuar, temporal o permanentemente, el Servicio (o cualquier parte del mismo) con o sin previo aviso.
            </p>
            <p className="text-gray-700 mb-4">
              Haremos esfuerzos razonables para notificarle con 30 días de anticipación sobre cambios materiales en estos términos. Su uso continuado del Servicio después de dichos cambios constituirá su aceptación de los nuevos términos.
            </p>
          </section>

          <section id="suspension">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Suspensión y Terminación</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">11.1 Suspensión por Violación</h3>
            <p className="text-gray-700 mb-4">
              Podemos suspender o terminar su acceso al Servicio inmediatamente, sin previo aviso, por cualquier motivo, incluyendo pero no limitado a violación de estos términos.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">11.2 Cancelación por el Usuario</h3>
            <p className="text-gray-700 mb-4">
              Puede cancelar su cuenta en cualquier momento desde la configuración de su cuenta. La cancelación será efectiva al final de su período de facturación actual.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">11.3 Efectos de la Terminación</h3>
            <p className="text-gray-700">
              Al terminar su cuenta, perderá acceso a su contenido y datos. Recomendamos exportar cualquier información importante antes de cancelar. No somos responsables por la pérdida de datos tras la terminación.
            </p>
          </section>

          <section id="ley-aplicable">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Ley Aplicable y Jurisdicción</h2>
            <p className="text-gray-700 mb-4">
              Estos términos se regirán e interpretarán de acuerdo con las leyes de España, sin dar efecto a ningún principio de conflictos de leyes.
            </p>
            <p className="text-gray-700">
              Cualquier disputa que surja de o relacionada con estos términos estará sujeta a la jurisdicción exclusiva de los tribunales de Madrid, España.
            </p>
          </section>

          <section id="contacto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contacto</h2>
            <p className="text-gray-700 mb-4">
              Si tiene preguntas sobre estos Términos y Condiciones, puede contactarnos en:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> {LEGAL_CONTACT.email}</p>
              <p className="text-gray-700"><strong>Soporte:</strong> {LEGAL_CONTACT.support}</p>
              <p className="text-gray-700"><strong>Dirección:</strong> {LEGAL_CONTACT.address}</p>
            </div>
          </section>

        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-4">Otras políticas legales:</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/legal/privacy" className="text-blue-600 hover:underline text-sm">
              Política de Privacidad
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
