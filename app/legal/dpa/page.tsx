import Link from 'next/link'
import { POLICY_VERSION, POLICY_LAST_UPDATE, LEGAL_CONTACT } from '@/config/policies'

export default function DPAPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Data Processing Agreement (DPA)</h1>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              Versión {POLICY_VERSION}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Última actualización: {POLICY_LAST_UPDATE}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Acuerdo de Procesamiento de Datos según Art. 28 RGPD
          </p>
        </div>

        {/* Executive Summary */}
        <div className="mb-8 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">Resumen Ejecutivo</h2>
          <ul className="space-y-2 text-blue-800">
            <li>• Este DPA complementa nuestros Términos y Condiciones para clientes empresariales</li>
            <li>• Cumplimos con el Art. 28 del RGPD en el procesamiento de datos personales</li>
            <li>• Usted es el Responsable del Tratamiento; nosotros somos el Encargado del Tratamiento</li>
            <li>• Implementamos medidas técnicas y organizativas para proteger los datos</li>
            <li>• No transferimos datos fuera del EEE sin las garantías adecuadas</li>
          </ul>
        </div>

        {/* Table of Contents */}
        <nav className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Índice de Contenidos</h2>
          <ul className="space-y-2">
            <li><a href="#definiciones" className="text-blue-600 hover:underline">1. Definiciones</a></li>
            <li><a href="#objeto" className="text-blue-600 hover:underline">2. Objeto del Acuerdo</a></li>
            <li><a href="#alcance" className="text-blue-600 hover:underline">3. Alcance y Naturaleza del Tratamiento</a></li>
            <li><a href="#obligaciones-encargado" className="text-blue-600 hover:underline">4. Obligaciones del Encargado</a></li>
            <li><a href="#subencargados" className="text-blue-600 hover:underline">5. Subencargados del Tratamiento</a></li>
            <li><a href="#medidas-seguridad" className="text-blue-600 hover:underline">6. Medidas de Seguridad</a></li>
            <li><a href="#transferencias" className="text-blue-600 hover:underline">7. Transferencias Internacionales</a></li>
            <li><a href="#derechos-interesados" className="text-blue-600 hover:underline">8. Derechos de los Interesados</a></li>
            <li><a href="#notificacion-brechas" className="text-blue-600 hover:underline">9. Notificación de Brechas de Seguridad</a></li>
            <li><a href="#auditorias" className="text-blue-600 hover:underline">10. Auditorías e Inspecciones</a></li>
            <li><a href="#duracion" className="text-blue-600 hover:underline">11. Duración y Finalización</a></li>
            <li><a href="#contacto" className="text-blue-600 hover:underline">12. Contacto</a></li>
          </ul>
        </nav>

        {/* Content Sections */}
        <div className="prose prose-blue max-w-none space-y-8">

          <section id="definiciones">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Definiciones</h2>
            <p className="text-gray-700 mb-4">
              A efectos del presente Acuerdo de Procesamiento de Datos (en adelante, "el Acuerdo"), se entenderá por:
            </p>

            <div className="bg-gray-50 p-4 rounded-lg">
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="font-semibold text-gray-900">Responsable del Tratamiento (Cliente):</dt>
                  <dd className="text-gray-700 ml-4">
                    La persona física o jurídica que contrata los servicios de Itineramio y que determina los fines
                    y medios del tratamiento de datos personales.
                  </dd>
                </div>

                <div>
                  <dt className="font-semibold text-gray-900">Encargado del Tratamiento (Itineramio):</dt>
                  <dd className="text-gray-700 ml-4">
                    {LEGAL_CONTACT.company}, que trata datos personales por cuenta del Responsable en el marco de la
                    prestación del servicio.
                  </dd>
                </div>

                <div>
                  <dt className="font-semibold text-gray-900">Datos Personales:</dt>
                  <dd className="text-gray-700 ml-4">
                    Toda información sobre una persona física identificada o identificable que el Responsable introduzca
                    en la plataforma Itineramio.
                  </dd>
                </div>

                <div>
                  <dt className="font-semibold text-gray-900">Tratamiento:</dt>
                  <dd className="text-gray-700 ml-4">
                    Cualquier operación realizada sobre datos personales: recogida, registro, organización, estructuración,
                    conservación, adaptación, modificación, extracción, consulta, utilización, comunicación, difusión o
                    cualquier otra forma de habilitación de acceso, cotejo, interconexión, limitación, supresión o destrucción.
                  </dd>
                </div>

                <div>
                  <dt className="font-semibold text-gray-900">RGPD:</dt>
                  <dd className="text-gray-700 ml-4">
                    Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo de 27 de abril de 2016 relativo a la
                    protección de las personas físicas en lo que respecta al tratamiento de datos personales.
                  </dd>
                </div>

                <div>
                  <dt className="font-semibold text-gray-900">Interesado:</dt>
                  <dd className="text-gray-700 ml-4">
                    Persona física cuyos datos personales son objeto de tratamiento (ej: huéspedes, usuarios finales).
                  </dd>
                </div>
              </dl>
            </div>
          </section>

          <section id="objeto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Objeto del Acuerdo</h2>
            <p className="text-gray-700 mb-4">
              El presente Acuerdo establece las condiciones bajo las cuales {LEGAL_CONTACT.company} (Encargado del Tratamiento)
              tratará datos personales por cuenta del Cliente (Responsable del Tratamiento) en el marco de la prestación
              del servicio de manuales digitales para alojamientos turísticos.
            </p>

            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Relación con Otros Documentos:</h3>
              <p className="text-sm text-gray-700">
                Este DPA complementa y forma parte integral de:
              </p>
              <ul className="text-sm text-gray-700 space-y-1 mt-2">
                <li>• Los{' '}
                  <Link href="/legal/terms" className="text-blue-600 hover:underline">
                    Términos y Condiciones
                  </Link> de uso del servicio
                </li>
                <li>• La{' '}
                  <Link href="/legal/privacy" className="text-blue-600 hover:underline">
                    Política de Privacidad
                  </Link>
                </li>
                <li>• Cualquier contrato de suscripción vigente entre las partes</li>
              </ul>
            </div>

            <p className="text-gray-700 text-sm">
              En caso de conflicto entre este DPA y otros documentos, prevalecerán las disposiciones de este DPA en
              lo relativo al tratamiento de datos personales.
            </p>
          </section>

          <section id="alcance">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Alcance y Naturaleza del Tratamiento</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 Finalidad del Tratamiento</h3>
            <p className="text-gray-700 mb-4">
              El Encargado tratará los datos personales exclusivamente para las siguientes finalidades:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>Almacenar y procesar la información de propiedades del Cliente</li>
              <li>Procesar contenido de manuales digitales creados por el Cliente</li>
              <li>Generar códigos QR y URLs de acceso para huéspedes</li>
              <li>Recopilar y procesar evaluaciones de huéspedes</li>
              <li>Proporcionar analytics y métricas de uso</li>
              <li>Enviar notificaciones relacionadas con el servicio</li>
              <li>Proporcionar soporte técnico al Cliente</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Naturaleza del Tratamiento</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-700 mb-2"><strong>Operaciones de tratamiento:</strong></p>
              <p className="text-sm text-gray-700">
                Recogida, registro, organización, estructuración, conservación, adaptación, modificación, extracción,
                consulta, utilización, comunicación por transmisión, difusión (a huéspedes con acceso autorizado),
                limitación, supresión y destrucción de datos.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.3 Categorías de Datos Personales</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="border border-gray-200 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Datos del Cliente</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Nombre y apellidos</li>
                  <li>• Email y teléfono</li>
                  <li>• Dirección postal</li>
                  <li>• Datos de facturación y pago</li>
                </ul>
              </div>

              <div className="border border-gray-200 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Datos de Huéspedes</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Nombre (opcional)</li>
                  <li>• Email (opcional)</li>
                  <li>• Dirección IP</li>
                  <li>• Evaluaciones y comentarios</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.4 Categorías de Interesados</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Propietarios y gestores de alojamientos turísticos (Clientes)</li>
              <li>Huéspedes que acceden a los manuales digitales</li>
              <li>Personal del Cliente con acceso a la plataforma</li>
            </ul>
          </section>

          <section id="obligaciones-encargado">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Obligaciones del Encargado</h2>
            <p className="text-gray-700 mb-4">
              El Encargado se compromete a:
            </p>

            <div className="space-y-3">
              <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <h4 className="font-semibold text-gray-900 mb-1">✓ Tratamiento Conforme a Instrucciones</h4>
                <p className="text-sm text-gray-700">
                  Tratar los datos personales únicamente siguiendo las instrucciones documentadas del Responsable,
                  incluso en lo relativo a transferencias de datos a terceros países u organizaciones internacionales,
                  salvo que esté obligado a ello en virtud del Derecho de la Unión o de los Estados miembros.
                </p>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <h4 className="font-semibold text-gray-900 mb-1">✓ Confidencialidad</h4>
                <p className="text-sm text-gray-700">
                  Garantizar que las personas autorizadas para tratar datos personales se hayan comprometido a respetar
                  la confidencialidad o estén sujetas a una obligación de confidencialidad de naturaleza estatutaria.
                </p>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <h4 className="font-semibold text-gray-900 mb-1">✓ Medidas de Seguridad</h4>
                <p className="text-sm text-gray-700">
                  Aplicar todas las medidas técnicas y organizativas apropiadas para garantizar un nivel de seguridad
                  adecuado al riesgo, incluyendo cifrado, seudonimización cuando proceda, confidencialidad, integridad,
                  disponibilidad y resiliencia permanentes de los sistemas de tratamiento.
                </p>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <h4 className="font-semibold text-gray-900 mb-1">✓ Asistencia al Responsable</h4>
                <p className="text-sm text-gray-700">
                  Asistir al Responsable en la medida de lo posible para que este pueda cumplir con sus obligaciones
                  de responder a las solicitudes de ejercicio de derechos de los interesados: acceso, rectificación,
                  supresión, oposición, limitación, portabilidad.
                </p>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <h4 className="font-semibold text-gray-900 mb-1">✓ Evaluaciones de Impacto</h4>
                <p className="text-sm text-gray-700">
                  Ayudar al Responsable a garantizar el cumplimiento de las obligaciones relativas a evaluaciones de
                  impacto en la protección de datos y consultas previas a la autoridad de control, teniendo en cuenta
                  la naturaleza del tratamiento y la información disponible.
                </p>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <h4 className="font-semibold text-gray-900 mb-1">✓ Destrucción de Datos</h4>
                <p className="text-sm text-gray-700">
                  Suprimir o devolver todos los datos personales al Responsable una vez finalice la prestación de
                  servicios de tratamiento, y suprimir las copias existentes, salvo que se requiera la conservación
                  de los datos en virtud del Derecho de la Unión o de los Estados miembros.
                </p>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <h4 className="font-semibold text-gray-900 mb-1">✓ Información para Auditorías</h4>
                <p className="text-sm text-gray-700">
                  Poner a disposición del Responsable toda la información necesaria para demostrar el cumplimiento de
                  las obligaciones del artículo 28 del RGPD, así como permitir y contribuir a la realización de auditorías,
                  incluidas inspecciones, por parte del Responsable o de otro auditor autorizado por dicho Responsable.
                </p>
              </div>
            </div>
          </section>

          <section id="subencargados">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Subencargados del Tratamiento</h2>
            <p className="text-gray-700 mb-4">
              El Encargado puede contratar a otros Encargados (Subencargados) para realizar actividades de tratamiento
              específicas. El Responsable autoriza al Encargado a contratar los siguientes Subencargados:
            </p>

            <div className="bg-gray-50 rounded-lg overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Subencargado</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Servicio</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Ubicación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-3 px-4 text-gray-700 font-semibold">Supabase Inc.</td>
                    <td className="py-3 px-4 text-gray-700">Almacenamiento de base de datos</td>
                    <td className="py-3 px-4 text-gray-700">UE (Estocolmo)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-gray-700 font-semibold">Stripe Inc.</td>
                    <td className="py-3 px-4 text-gray-700">Procesamiento de pagos</td>
                    <td className="py-3 px-4 text-gray-700">EEE / USA (DPF)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-gray-700 font-semibold">Resend Inc.</td>
                    <td className="py-3 px-4 text-gray-700">Envío de emails transaccionales</td>
                    <td className="py-3 px-4 text-gray-700">USA (DPF)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-gray-700 font-semibold">Vercel Inc.</td>
                    <td className="py-3 px-4 text-gray-700">Hosting e infraestructura</td>
                    <td className="py-3 px-4 text-gray-700">Global (UE prioritaria)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Garantías de los Subencargados:</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Todos los Subencargados han firmado acuerdos de procesamiento de datos conformes al RGPD</li>
                <li>• Se aplican las mismas obligaciones de protección de datos que las establecidas en este DPA</li>
                <li>• El Encargado sigue siendo plenamente responsable ante el Responsable del cumplimiento de los Subencargados</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Cambios en los Subencargados:</h3>
              <p className="text-sm text-gray-700">
                El Encargado informará al Responsable de cualquier cambio previsto en la incorporación o sustitución
                de Subencargados con al menos 30 días de antelación, dando al Responsable la oportunidad de oponerse
                a dichos cambios por motivos legítimos relacionados con la protección de datos.
              </p>
            </div>
          </section>

          <section id="medidas-seguridad">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Medidas de Seguridad</h2>
            <p className="text-gray-700 mb-4">
              El Encargado implementa las siguientes medidas técnicas y organizativas para garantizar la seguridad
              de los datos personales:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">🔐 Cifrado y Seudonimización</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Cifrado SSL/TLS (HTTPS) en tránsito</li>
                  <li>• Cifrado AES-256 de datos en reposo</li>
                  <li>• Hash bcrypt para contraseñas (factor 12)</li>
                  <li>• Tokens JWT firmados para autenticación</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">🔒 Control de Acceso</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Autenticación multifactor para administradores</li>
                  <li>• Principio de mínimo privilegio</li>
                  <li>• Gestión de roles y permisos granular</li>
                  <li>• Revisión periódica de accesos</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">📊 Monitoreo y Auditoría</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Logs de acceso y actividad</li>
                  <li>• Detección de anomalías</li>
                  <li>• Alertas de seguridad en tiempo real</li>
                  <li>• Auditorías de seguridad trimestrales</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">💾 Backup y Recuperación</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Backups automáticos diarios</li>
                  <li>• Retención de backups por 30 días</li>
                  <li>• Plan de recuperación ante desastres</li>
                  <li>• RTO &lt; 4 horas, RPO &lt; 1 hora</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">👥 Formación y Concienciación</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Formación anual en protección de datos</li>
                  <li>• Políticas de seguridad documentadas</li>
                  <li>• Acuerdos de confidencialidad firmados</li>
                  <li>• Procedimientos de respuesta a incidentes</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">🛡️ Infraestructura Segura</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Firewalls y segmentación de red</li>
                  <li>• DDoS protection (Cloudflare/Vercel)</li>
                  <li>• Actualizaciones de seguridad automáticas</li>
                  <li>• Escaneo de vulnerabilidades mensual</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Certificaciones:</strong> Nuestros proveedores de infraestructura (Supabase, Vercel, Stripe)
                cuentan con certificaciones SOC 2 Type II, ISO 27001 y PCI DSS (Stripe). Revisamos anualmente estas
                certificaciones para garantizar el cumplimiento continuo.
              </p>
            </div>
          </section>

          <section id="transferencias">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Transferencias Internacionales</h2>
            <p className="text-gray-700 mb-4">
              Los datos personales se almacenan principalmente en la Unión Europea (región eu-north-1 de Supabase en Estocolmo).
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">7.1 Transferencias Fuera del EEE</h3>
            <p className="text-gray-700 mb-4">
              Para algunos servicios complementarios, puede ser necesario transferir datos a terceros países:
            </p>

            <div className="space-y-3 mb-4">
              <div className="border-l-4 border-green-500 bg-green-50 p-4">
                <h4 className="font-semibold text-gray-900 mb-1">Stripe Inc. (USA)</h4>
                <p className="text-sm text-gray-700 mb-1">
                  <strong>Base legal:</strong> Decisión de adecuación - Marco de Privacidad de Datos UE-EE.UU. (Data Privacy Framework)
                </p>
                <p className="text-xs text-gray-600">
                  Stripe está certificado bajo el EU-US Data Privacy Framework, reconocido por la Comisión Europea como
                  garantía adecuada de protección de datos.
                </p>
              </div>

              <div className="border-l-4 border-green-500 bg-green-50 p-4">
                <h4 className="font-semibold text-gray-900 mb-1">Resend Inc. (USA)</h4>
                <p className="text-sm text-gray-700 mb-1">
                  <strong>Base legal:</strong> Cláusulas Contractuales Tipo (SCC) de la Comisión Europea
                </p>
                <p className="text-xs text-gray-600">
                  Hemos firmado las SCC estándar aprobadas por la Comisión Europea con Resend para garantizar un nivel
                  adecuado de protección de datos.
                </p>
              </div>
            </div>

            <p className="text-gray-700 text-sm">
              El Cliente puede solicitar una copia de las garantías implementadas para transferencias internacionales
              contactando con {LEGAL_CONTACT.legal}.
            </p>
          </section>

          <section id="derechos-interesados">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Derechos de los Interesados</h2>
            <p className="text-gray-700 mb-4">
              El Encargado asistirá al Responsable en el ejercicio de los derechos de los interesados:
            </p>

            <div className="space-y-3">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Procedimiento de Asistencia:</h4>
                <ol className="text-sm text-gray-700 space-y-2">
                  <li>1. Si el Encargado recibe una solicitud directa de un interesado, la reenviará al Responsable dentro de las 48 horas</li>
                  <li>2. El Encargado proporcionará al Responsable la información y asistencia técnica necesaria para responder a la solicitud</li>
                  <li>3. El Responsable es el único responsable de responder al interesado dentro de los plazos legales (1 mes, prorrogable 2 meses)</li>
                </ol>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Herramientas de Autoservicio:</h4>
                <p className="text-sm text-gray-700 mb-2">
                  Para facilitar el cumplimiento, el Encargado proporciona al Responsable herramientas de autoservicio para:
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• <strong>Acceso:</strong> Exportar datos en formato JSON/CSV desde el panel de control</li>
                  <li>• <strong>Rectificación:</strong> Editar datos directamente en la plataforma</li>
                  <li>• <strong>Supresión:</strong> Eliminar datos desde la configuración de cuenta</li>
                  <li>• <strong>Limitación:</strong> Desactivar propiedades sin eliminarlas</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="notificacion-brechas">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Notificación de Brechas de Seguridad</h2>
            <p className="text-gray-700 mb-4">
              En caso de violación de la seguridad de los datos personales, el Encargado seguirá el siguiente protocolo:
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-semibold text-sm">24h</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Notificación Inmediata</h4>
                  <p className="text-sm text-gray-700">
                    El Encargado notificará al Responsable sin dilación indebida y, a más tardar, en las 24 horas siguientes
                    a tener conocimiento de la violación de seguridad.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Información de la Notificación:</h4>
                <p className="text-sm text-gray-700 mb-2">La notificación incluirá, como mínimo:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Descripción de la naturaleza de la violación de seguridad</li>
                  <li>• Categorías y número aproximado de interesados afectados</li>
                  <li>• Categorías y número aproximado de registros de datos afectados</li>
                  <li>• Consecuencias probables de la violación</li>
                  <li>• Medidas adoptadas o propuestas para remediar la violación</li>
                  <li>• Medidas propuestas para mitigar los posibles efectos negativos</li>
                  <li>• Punto de contacto para obtener más información</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Cooperación:</h4>
                <p className="text-sm text-gray-700">
                  El Encargado cooperará plenamente con el Responsable y proporcionará toda la asistencia necesaria para
                  que este pueda cumplir con su obligación de notificar la violación a la autoridad de control (AEPD)
                  en el plazo de 72 horas, y a los interesados cuando proceda.
                </p>
              </div>
            </div>
          </section>

          <section id="auditorias">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Auditorías e Inspecciones</h2>
            <p className="text-gray-700 mb-4">
              El Responsable tiene derecho a auditar el cumplimiento de este DPA por parte del Encargado.
            </p>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Auditorías Documentales:</h4>
                <p className="text-sm text-gray-700 mb-2">
                  El Encargado proporcionará al Responsable, previa solicitud y con periodicidad anual:
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Certificaciones SOC 2 Type II de proveedores de infraestructura</li>
                  <li>• Informes de auditoría de seguridad (redactados)</li>
                  <li>• Evidencias de cumplimiento de medidas de seguridad</li>
                  <li>• Documentación de formación en protección de datos del personal</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Auditorías In Situ:</h4>
                <p className="text-sm text-gray-700 mb-2">
                  El Responsable puede solicitar una auditoría in situ con las siguientes condiciones:
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Notificación previa de al menos 30 días</li>
                  <li>• Frecuencia máxima de una auditoría por año (salvo que exista una violación de seguridad)</li>
                  <li>• Horario laboral normal y sin interferir con las operaciones del Encargado</li>
                  <li>• Puede realizarse por el Responsable o auditor externo cualificado</li>
                  <li>• Costes de la auditoría a cargo del Responsable</li>
                  <li>• Acuerdo de confidencialidad firmado por los auditores</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                <h4 className="font-semibold text-gray-900 mb-1">Acceso a Instalaciones:</h4>
                <p className="text-sm text-gray-700">
                  Dado que el Encargado utiliza servicios en la nube, el acceso físico a servidores no es aplicable.
                  Las auditorías se centrarán en controles lógicos, políticas y procedimientos.
                </p>
              </div>
            </div>
          </section>

          <section id="duracion">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Duración y Finalización</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">11.1 Duración</h3>
            <p className="text-gray-700 mb-4">
              Este DPA entrará en vigor en la fecha de aceptación de los Términos y Condiciones por parte del Cliente
              y permanecerá vigente mientras el Encargado preste servicios que impliquen el tratamiento de datos personales.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">11.2 Finalización del Tratamiento</h3>
            <p className="text-gray-700 mb-4">
              Una vez finalizada la prestación de servicios de tratamiento, el Encargado:
            </p>

            <div className="space-y-3 mb-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Opción 1: Devolución de Datos</h4>
                <p className="text-sm text-gray-700">
                  A petición del Responsable, el Encargado devolverá todos los datos personales en formato estructurado
                  (JSON/CSV) dentro de los 30 días siguientes a la finalización del contrato.
                </p>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Opción 2: Supresión de Datos</h4>
                <p className="text-sm text-gray-700 mb-2">
                  Si el Responsable no solicita la devolución:
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Los datos personales se conservarán durante 90 días tras la finalización</li>
                  <li>• Transcurrido este plazo, se procederá a la supresión segura e irreversible</li>
                  <li>• Se emitirá un certificado de destrucción de datos a petición del Responsable</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">11.3 Conservación Legal</h3>
            <p className="text-gray-700">
              No obstante lo anterior, el Encargado podrá conservar los datos personales en la medida y durante el tiempo
              que sea necesario para cumplir con obligaciones legales (ej: conservación de facturas durante 6 años según
              el Código de Comercio), siempre limitando el acceso a los mismos.
            </p>
          </section>

          <section id="contacto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contacto</h2>
            <p className="text-gray-700 mb-4">
              Para cualquier consulta relacionada con este Data Processing Agreement, puede contactarnos en:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 mb-2"><strong>Encargado del Tratamiento:</strong> {LEGAL_CONTACT.company}</p>
              <p className="text-gray-700 mb-2"><strong>Delegado de Protección de Datos:</strong> {LEGAL_CONTACT.legal}</p>
              <p className="text-gray-700 mb-2"><strong>Email de contacto:</strong> {LEGAL_CONTACT.email}</p>
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
            <Link href="/legal/legal-notice" className="text-blue-600 hover:underline text-sm">
              Aviso Legal
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
