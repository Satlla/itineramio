import Link from 'next/link'
import { POLICY_VERSION, POLICY_LAST_UPDATE, LEGAL_CONTACT } from '@/src/config/policies'

export default function LegalNoticePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Aviso Legal</h1>
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
            <li>• Este aviso legal cumple con la Ley 34/2002 (LSSI-CE)</li>
            <li>• {LEGAL_CONTACT.company} es el titular y responsable del sitio web itineramio.com</li>
            <li>• El uso del sitio implica la aceptación de estos términos legales</li>
            <li>• Protegemos sus datos según el RGPD y la LOPDGDD</li>
            <li>• Puede contactarnos en {LEGAL_CONTACT.legal}</li>
          </ul>
        </div>

        {/* Table of Contents */}
        <nav className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Índice de Contenidos</h2>
          <ul className="space-y-2">
            <li><a href="#datos-identificativos" className="text-blue-600 hover:underline">1. Datos Identificativos</a></li>
            <li><a href="#objeto" className="text-blue-600 hover:underline">2. Objeto</a></li>
            <li><a href="#condiciones-acceso" className="text-blue-600 hover:underline">3. Condiciones de Acceso y Uso</a></li>
            <li><a href="#propiedad-intelectual" className="text-blue-600 hover:underline">4. Propiedad Intelectual e Industrial</a></li>
            <li><a href="#proteccion-datos" className="text-blue-600 hover:underline">5. Protección de Datos Personales</a></li>
            <li><a href="#exclusion-garantias" className="text-blue-600 hover:underline">6. Exclusión de Garantías</a></li>
            <li><a href="#enlaces" className="text-blue-600 hover:underline">7. Enlaces a Terceros</a></li>
            <li><a href="#modificaciones" className="text-blue-600 hover:underline">8. Modificaciones</a></li>
            <li><a href="#legislacion" className="text-blue-600 hover:underline">9. Legislación Aplicable</a></li>
            <li><a href="#contacto" className="text-blue-600 hover:underline">10. Contacto</a></li>
          </ul>
        </nav>

        {/* Content Sections */}
        <div className="prose prose-blue max-w-none space-y-8">

          <section id="datos-identificativos">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Datos Identificativos</h2>
            <p className="text-gray-700 mb-4">
              En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de
              Comercio Electrónico (LSSI-CE), se informa de los datos identificativos del titular del sitio web:
            </p>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-2 font-semibold text-gray-900 w-1/3">Denominación social:</td>
                    <td className="py-2 text-gray-700">{LEGAL_CONTACT.company}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-semibold text-gray-900">Domicilio social:</td>
                    <td className="py-2 text-gray-700">{LEGAL_CONTACT.address}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-semibold text-gray-900">Email:</td>
                    <td className="py-2 text-gray-700">{LEGAL_CONTACT.email}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-semibold text-gray-900">Email legal:</td>
                    <td className="py-2 text-gray-700">{LEGAL_CONTACT.legal}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-semibold text-gray-900">Sitio web:</td>
                    <td className="py-2 text-gray-700">https://itineramio.com</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="objeto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Objeto</h2>
            <p className="text-gray-700 mb-4">
              El presente Aviso Legal regula el uso y utilización del sitio web <strong>itineramio.com</strong>
              (en adelante, "el Sitio Web"), del que es titular {LEGAL_CONTACT.company}.
            </p>

            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Finalidad del Sitio Web:</h3>
              <p className="text-sm text-gray-700 mb-2">
                El Sitio Web tiene como finalidad proporcionar información sobre nuestros servicios de creación y gestión
                de manuales digitales para alojamientos turísticos, así como permitir a los usuarios registrados:
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Crear y gestionar propiedades de alojamiento</li>
                <li>• Diseñar manuales digitales personalizados</li>
                <li>• Generar códigos QR para acceso de huéspedes</li>
                <li>• Analizar métricas de uso y evaluaciones</li>
                <li>• Contratar planes de suscripción</li>
              </ul>
            </div>

            <p className="text-gray-700">
              La navegación por el Sitio Web atribuye la condición de usuario del mismo e implica la aceptación plena
              y sin reservas de todas y cada una de las disposiciones incluidas en este Aviso Legal.
            </p>
          </section>

          <section id="condiciones-acceso">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Condiciones de Acceso y Uso</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 Acceso al Sitio Web</h3>
            <p className="text-gray-700 mb-4">
              El acceso al Sitio Web es gratuito, salvo en lo relativo al coste de la conexión a través de la red
              de telecomunicaciones suministrada por el proveedor de acceso contratado por el usuario.
            </p>
            <p className="text-gray-700 mb-4">
              Algunas funcionalidades del Sitio Web requieren registro de usuario y contratación de un plan de
              suscripción de pago.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Uso Correcto del Sitio Web</h3>
            <p className="text-gray-700 mb-2">El usuario se compromete a utilizar el Sitio Web de conformidad con la ley y el presente Aviso Legal, así como con la moral y buenas costumbres generalmente aceptadas y el orden público.</p>

            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">El usuario se obliga a NO:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li>Realizar acciones que puedan dañar, inutilizar o sobrecargar el Sitio Web</li>
                <li>Introducir virus, código malicioso o cualquier otro sistema que pueda causar daños</li>
                <li>Intentar acceder a áreas restringidas del Sitio Web sin autorización</li>
                <li>Utilizar el Sitio Web con fines ilícitos, ilegales, contrarios a lo establecido en este Aviso Legal</li>
                <li>Reproducir, copiar, distribuir o modificar cualquier contenido sin autorización expresa</li>
                <li>Realizar ingeniería inversa, descompilar o desensamblar cualquier software del Sitio Web</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.3 Responsabilidad del Usuario</h3>
            <p className="text-gray-700">
              El usuario es el único responsable de las infracciones en las que pueda incurrir o de los perjuicios
              que pueda causar por la utilización del Sitio Web, exonerando a {LEGAL_CONTACT.company} y a sus
              colaboradores de cualquier responsabilidad.
            </p>
          </section>

          <section id="propiedad-intelectual">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Propiedad Intelectual e Industrial</h2>
            <p className="text-gray-700 mb-4">
              Todos los contenidos del Sitio Web, incluyendo pero no limitándose a textos, fotografías, gráficos,
              imágenes, iconos, tecnología, software, links y demás contenidos audiovisuales o sonoros, así como su
              diseño gráfico y códigos fuente, son propiedad intelectual de {LEGAL_CONTACT.company} o de terceros,
              sin que puedan entenderse cedidos al usuario ninguno de los derechos de explotación reconocidos por la
              normativa vigente en materia de propiedad intelectual sobre los mismos.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Marcas y Logotipos:</h3>
              <p className="text-sm text-gray-700 mb-2">
                Las marcas, nombres comerciales o signos distintivos que aparecen en el Sitio Web son titularidad de
                {LEGAL_CONTACT.company} o de terceros, sin que pueda entenderse que el acceso al Sitio Web atribuya
                al usuario derecho alguno sobre las marcas, nombres comerciales y/o signos distintivos.
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Contenido del Usuario:</h3>
              <p className="text-sm text-gray-700">
                El contenido que los usuarios suben al Sitio Web (textos, imágenes, vídeos, etc.) es de su exclusiva
                propiedad. Al subir contenido, el usuario otorga a {LEGAL_CONTACT.company} una licencia mundial, no exclusiva,
                libre de regalías para usar, reproducir y mostrar dicho contenido únicamente con el propósito de prestar
                el servicio. Esta licencia finaliza cuando el usuario elimina el contenido o cierra su cuenta.
              </p>
            </div>

            <p className="text-gray-700 text-sm">
              Queda prohibida cualquier reproducción, distribución, comunicación pública, transformación o cualquier
              otra forma de explotación de los contenidos del Sitio Web sin la previa autorización expresa y por
              escrito de {LEGAL_CONTACT.company}.
            </p>
          </section>

          <section id="proteccion-datos">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Protección de Datos Personales</h2>
            <p className="text-gray-700 mb-4">
              {LEGAL_CONTACT.company} cumple con el Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo,
              de 27 de abril de 2016, relativo a la protección de las personas físicas en lo que respecta al
              tratamiento de datos personales (RGPD) y la Ley Orgánica 3/2018, de 5 de diciembre, de Protección
              de Datos Personales y garantía de los derechos digitales (LOPDGDD).
            </p>

            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Información sobre Protección de Datos:</h3>
              <p className="text-sm text-gray-700 mb-2">
                Para más información sobre cómo tratamos sus datos personales, consulte nuestra{' '}
                <Link href="/legal/privacy" className="text-blue-600 hover:underline font-semibold">
                  Política de Privacidad
                </Link>.
              </p>
              <p className="text-sm text-gray-700">
                Si tiene preguntas sobre el tratamiento de sus datos personales o desea ejercer sus derechos,
                puede contactarnos en: {LEGAL_CONTACT.legal}
              </p>
            </div>
          </section>

          <section id="exclusion-garantias">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Exclusión de Garantías y Responsabilidad</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">6.1 Disponibilidad del Servicio</h3>
            <p className="text-gray-700 mb-4">
              {LEGAL_CONTACT.company} no garantiza la disponibilidad continua e ininterrumpida del Sitio Web.
              Nos esforzamos por mantener el servicio disponible, pero pueden producirse interrupciones debido a
              mantenimientos, actualizaciones o problemas técnicos ajenos a nuestra voluntad.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">6.2 Exactitud de la Información</h3>
            <p className="text-gray-700 mb-4">
              {LEGAL_CONTACT.company} excluye cualquier responsabilidad por los daños y perjuicios de toda naturaleza
              que pudieran deberse a la falta de exactitud, exhaustividad, actualidad, así como a los errores u omisiones
              de los que pudieran adolecer las informaciones y servicios contenidos en el Sitio Web.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">6.3 Virus y Malware</h3>
            <p className="text-gray-700 mb-4">
              {LEGAL_CONTACT.company} no se hace responsable de los daños que pudieran derivarse de la presencia de
              virus u otros elementos lesivos en los contenidos que puedan producir alteraciones en los sistemas
              informáticos, documentos electrónicos o ficheros de los usuarios.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">6.4 Uso del Sitio Web</h3>
            <p className="text-gray-700">
              El usuario es el único responsable del uso que haga del Sitio Web y de los contenidos que publique.
              {LEGAL_CONTACT.company} no se hace responsable de los daños que pudieran derivarse de un uso inadecuado
              del Sitio Web por parte de los usuarios.
            </p>
          </section>

          <section id="enlaces">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Enlaces a Terceros</h2>
            <p className="text-gray-700 mb-4">
              El Sitio Web puede contener enlaces a otros sitios web de terceros. {LEGAL_CONTACT.company} no controla
              ni es responsable del contenido de dichos sitios web ni de las políticas de privacidad o prácticas de
              seguridad de terceros.
            </p>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
              <p className="text-sm text-gray-700">
                <strong>Importante:</strong> La inclusión de enlaces a sitios web de terceros no implica la aprobación,
                apoyo o recomendación de los mismos por parte de {LEGAL_CONTACT.company}. Le recomendamos leer los
                términos y condiciones y políticas de privacidad de cualquier sitio web de terceros que visite.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Enlaces desde Terceros a Nuestro Sitio</h3>
            <p className="text-gray-700">
              Si desea establecer un enlace desde su sitio web a itineramio.com, puede hacerlo libremente siempre que:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm mb-4">
              <li>No se utilice frames que alteren nuestro contenido</li>
              <li>No se realicen manifestaciones falsas sobre nuestra empresa o servicios</li>
              <li>El enlace se realice al home principal (no a páginas internas sin autorización)</li>
              <li>No se implique falsamente que {LEGAL_CONTACT.company} patrocina o apoya el sitio enlazante</li>
            </ul>
          </section>

          <section id="modificaciones">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Modificaciones</h2>
            <p className="text-gray-700 mb-4">
              {LEGAL_CONTACT.company} se reserva el derecho de efectuar sin previo aviso las modificaciones que
              considere oportunas en el Sitio Web, pudiendo cambiar, suprimir o añadir tanto los contenidos y
              servicios que se presten a través del mismo como la forma en la que éstos aparezcan presentados
              o localizados.
            </p>
            <p className="text-gray-700">
              Asimismo, {LEGAL_CONTACT.company} se reserva el derecho de modificar en cualquier momento el presente
              Aviso Legal. Le recomendamos revisar periódicamente este documento.
            </p>
          </section>

          <section id="legislacion">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Legislación Aplicable y Jurisdicción</h2>
            <p className="text-gray-700 mb-4">
              El presente Aviso Legal se rige en todos y cada uno de sus extremos por la ley española.
            </p>
            <p className="text-gray-700 mb-4">
              Para la resolución de cualquier controversia o conflicto que pueda surgir en relación con el uso del
              Sitio Web o la interpretación y ejecución de este Aviso Legal, {LEGAL_CONTACT.company} y el usuario
              se someten, con renuncia expresa a cualquier otro fuero que pudiera corresponderles, a los Juzgados
              y Tribunales de Madrid (España).
            </p>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Marco Legal Aplicable:</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Ley 34/2002 de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE)</li>
                <li>• Reglamento (UE) 2016/679 de Protección de Datos (RGPD)</li>
                <li>• Ley Orgánica 3/2018 de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD)</li>
                <li>• Código Civil español</li>
                <li>• Código de Comercio español</li>
              </ul>
            </div>
          </section>

          <section id="contacto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contacto</h2>
            <p className="text-gray-700 mb-4">
              Para cualquier consulta relacionada con este Aviso Legal, puede contactarnos en:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 mb-2"><strong>Empresa:</strong> {LEGAL_CONTACT.company}</p>
              <p className="text-gray-700 mb-2"><strong>Email legal:</strong> {LEGAL_CONTACT.legal}</p>
              <p className="text-gray-700 mb-2"><strong>Email general:</strong> {LEGAL_CONTACT.email}</p>
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
            <Link href="/legal/cookies" className="text-blue-600 hover:underline text-sm">
              Política de Cookies
            </Link>
            <Link href="/legal/billing" className="text-blue-600 hover:underline text-sm">
              Términos de Facturación
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
