import Link from 'next/link'
import { POLICY_VERSION, POLICY_LAST_UPDATE, LEGAL_CONTACT } from '@/config/policies'

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Términos de Facturación y Pagos</h1>
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
            <li>• Ofrecemos período de evaluación de 15 días para probar el servicio</li>
            <li>• Las suscripciones se facturan mensual o semestralmente por adelantado</li>
            <li>• Puede cancelar en cualquier momento, sin penalizaciones</li>
            <li>• Los cambios de plan se aplican con prorrateo automático</li>
            <li>• Pagos procesados de forma segura a través de Stripe</li>
          </ul>
        </div>

        {/* Table of Contents */}
        <nav className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Índice de Contenidos</h2>
          <ul className="space-y-2">
            <li><a href="#periodo-prueba" className="text-blue-600 hover:underline">1. Período de Evaluación</a></li>
            <li><a href="#planes" className="text-blue-600 hover:underline">2. Planes y Precios</a></li>
            <li><a href="#facturacion" className="text-blue-600 hover:underline">3. Ciclo de Facturación</a></li>
            <li><a href="#metodos-pago" className="text-blue-600 hover:underline">4. Métodos de Pago</a></li>
            <li><a href="#renovacion" className="text-blue-600 hover:underline">5. Renovación Automática</a></li>
            <li><a href="#cambios-plan" className="text-blue-600 hover:underline">6. Cambios de Plan</a></li>
            <li><a href="#cancelacion" className="text-blue-600 hover:underline">7. Cancelación</a></li>
            <li><a href="#reembolsos" className="text-blue-600 hover:underline">8. Política de Reembolsos</a></li>
            <li><a href="#impuestos" className="text-blue-600 hover:underline">9. Impuestos y Facturación</a></li>
            <li><a href="#fallos-pago" className="text-blue-600 hover:underline">10. Fallos de Pago</a></li>
            <li><a href="#cambios-precios" className="text-blue-600 hover:underline">11. Cambios en los Precios</a></li>
            <li><a href="#contacto" className="text-blue-600 hover:underline">12. Contacto</a></li>
          </ul>
        </nav>

        {/* Content Sections */}
        <div className="prose prose-blue max-w-none space-y-8">

          <section id="periodo-prueba">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Período de Evaluación</h2>
            <p className="text-gray-700 mb-4">
              Ofrecemos un <strong>período de evaluación de 15 días</strong> para que pueda probar Itineramio sin compromiso
              y decidir si el servicio se ajusta a sus necesidades.
            </p>

            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Características del período de evaluación:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm">
                <li>Acceso completo a todas las funcionalidades de su plan</li>
                <li>Sin necesidad de tarjeta de crédito para comenzar</li>
                <li>Sin cargos durante los primeros 15 días</li>
                <li>Puede cancelar en cualquier momento sin costes</li>
                <li>Al finalizar, puede contratar el plan que mejor se adapte a sus necesidades</li>
              </ul>
            </div>

            <p className="text-gray-700 text-sm">
              <strong>Importante:</strong> Una vez finalizado el período de evaluación, deberá contratar una suscripción
              para continuar utilizando el servicio. Sus datos y propiedades permanecerán guardados durante 30 días
              después del fin del período de evaluación.
            </p>
          </section>

          <section id="planes">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Planes y Precios</h2>
            <p className="text-gray-700 mb-4">
              Ofrecemos diferentes planes adaptados al número de propiedades que gestiona:
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900">BASIC</h3>
                  <span className="text-2xl font-bold text-blue-600">€9</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">Hasta 2 propiedades</p>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>✓ Manuales digitales ilimitados</li>
                  <li>✓ Códigos QR únicos</li>
                  <li>✓ Soporte multiidioma</li>
                  <li>✓ Analytics básicas</li>
                </ul>
              </div>

              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900">HOST</h3>
                  <span className="text-2xl font-bold text-blue-600">€29</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">Hasta 10 propiedades</p>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>✓ Todo lo del plan BASIC</li>
                  <li>✓ Analytics avanzadas</li>
                  <li>✓ Evaluaciones de huéspedes</li>
                  <li>✓ Conjuntos de propiedades</li>
                </ul>
              </div>

              <div className="border border-purple-200 rounded-lg p-4 bg-purple-50 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900">SUPERHOST</h3>
                  <span className="text-2xl font-bold text-purple-600">€69</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">Hasta 25 propiedades</p>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>✓ Todo lo del plan HOST</li>
                  <li>✓ Duplicación de propiedades</li>
                  <li>✓ Gestión de equipos</li>
                  <li>✓ Soporte prioritario</li>
                </ul>
              </div>

              <div className="border border-indigo-200 rounded-lg p-4 bg-indigo-50 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900">BUSINESS</h3>
                  <span className="text-2xl font-bold text-indigo-600">€99</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">Hasta 50 propiedades</p>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>✓ Todo lo del plan SUPERHOST</li>
                  <li>✓ Propiedades ilimitadas</li>
                  <li>✓ API de integración</li>
                  <li>✓ Soporte dedicado</li>
                </ul>
              </div>
            </div>

            <p className="text-sm text-gray-600 italic">
              Todos los precios están en Euros (€) e incluyen IVA. Los precios pueden variar según su ubicación geográfica
              debido a impuestos locales aplicables.
            </p>
          </section>

          <section id="facturacion">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Ciclo de Facturación</h2>
            <p className="text-gray-700 mb-4">
              Ofrecemos dos opciones de facturación para su comodidad:
            </p>

            <div className="space-y-4 mb-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">📅 Facturación Mensual</h3>
                <p className="text-sm text-gray-700">
                  Se le facturará el importe completo de su plan cada mes. El cargo se realiza el mismo día del mes
                  en que contrató la suscripción (ej: si contrata el 15, se factura cada día 15).
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">💰 Facturación Semestral (6 meses)</h3>
                <p className="text-sm text-gray-700 mb-2">
                  Ahorre hasta un 15% pagando por adelantado cada 6 meses. El cargo se realiza cada seis meses
                  desde la fecha de contratación.
                </p>
                <p className="text-xs text-gray-600">
                  Ejemplo: Plan HOST mensual €29/mes = €174 semestral. Con descuento semestral (10%): €156.60 (ahorro de €17.40).
                </p>
              </div>
            </div>

            <p className="text-gray-700 text-sm">
              La facturación se realiza siempre <strong>por adelantado</strong> al inicio de cada período.
              Recibirá un email con la factura después de cada cargo exitoso.
            </p>
          </section>

          <section id="metodos-pago">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Métodos de Pago</h2>
            <p className="text-gray-700 mb-4">
              Aceptamos los siguientes métodos de pago a través de nuestra plataforma segura Stripe:
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="border border-gray-200 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">💳 Tarjetas de Crédito/Débito</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Visa</li>
                  <li>• Mastercard</li>
                  <li>• American Express</li>
                  <li>• Discover</li>
                </ul>
              </div>

              <div className="border border-gray-200 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">🏦 Otros Métodos</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• SEPA Direct Debit (domiciliación bancaria)</li>
                  <li>• Bizum (próximamente)</li>
                  <li>• Transferencia bancaria (planes anuales)</li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <p className="text-sm text-gray-700">
                <strong>🔒 Seguridad:</strong> Todos los pagos son procesados de forma segura por Stripe, certificado PCI DSS Level 1.
                No almacenamos información de tarjetas de crédito en nuestros servidores. Stripe utiliza cifrado SSL/TLS
                y tokenización para proteger sus datos de pago.
              </p>
            </div>
          </section>

          <section id="renovacion">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Renovación Automática</h2>
            <p className="text-gray-700 mb-4">
              Su suscripción se renueva automáticamente al final de cada período de facturación para garantizar
              un servicio ininterrumpido.
            </p>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Cómo funciona la renovación automática:</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>1. <strong>7 días antes</strong> del fin de su período, le enviamos un recordatorio por email</li>
                <li>2. <strong>El día de renovación</strong>, se carga automáticamente el importe del siguiente período</li>
                <li>3. <strong>Tras el pago exitoso</strong>, recibe la factura y confirmación por email</li>
                <li>4. Su suscripción continúa sin interrupciones</li>
              </ul>
            </div>

            <p className="text-gray-700">
              Puede <strong>desactivar la renovación automática</strong> en cualquier momento desde la configuración
              de su cuenta. Al desactivarla, su suscripción finalizará al término del período actual y no se realizarán
              más cargos.
            </p>
          </section>

          <section id="cambios-plan">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cambios de Plan</h2>
            <p className="text-gray-700 mb-4">
              Puede cambiar su plan en cualquier momento según sus necesidades. Los cambios se aplican con prorrateo
              automático para que solo pague por lo que usa.
            </p>

            <div className="space-y-4 mb-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">⬆️ Upgrade (Mejorar Plan)</h3>
                <p className="text-sm text-gray-700 mb-2">
                  Al mejorar a un plan superior:
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• El cambio es <strong>inmediato</strong></li>
                  <li>• Se calcula el crédito del tiempo no usado de su plan actual</li>
                  <li>• Se aplica ese crédito al coste del nuevo plan</li>
                  <li>• Solo paga la diferencia prorrateada hasta el final de su período de facturación</li>
                </ul>
                <p className="text-xs text-gray-600 mt-2">
                  Ejemplo: Si está en BASIC (€9/mes) y pasa a HOST (€29/mes) a mitad de mes, se le cargará aproximadamente
                  €10 (diferencia de €20 prorrateada a 15 días).
                </p>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">⬇️ Downgrade (Reducir Plan)</h3>
                <p className="text-sm text-gray-700 mb-2">
                  Al cambiar a un plan inferior:
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• El cambio es efectivo al <strong>final de su período actual</strong></li>
                  <li>• Mantiene acceso a las funcionalidades del plan superior hasta el fin del período</li>
                  <li>• A partir del siguiente período, se factura el nuevo plan más económico</li>
                  <li>• No hay cargos adicionales ni penalizaciones</li>
                </ul>
                <p className="text-xs text-gray-600 mt-2">
                  Nota: Si tiene más propiedades que el límite del plan inferior, deberá reducir el número de propiedades
                  activas antes de que el cambio sea efectivo.
                </p>
              </div>
            </div>
          </section>

          <section id="cancelacion">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cancelación</h2>
            <p className="text-gray-700 mb-4">
              Puede cancelar su suscripción en cualquier momento sin penalizaciones ni cargos adicionales.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Proceso de cancelación:</h3>
              <ol className="space-y-2 text-sm text-gray-700">
                <li>1. Vaya a <strong>Configuración de Cuenta → Suscripción</strong></li>
                <li>2. Haga clic en <strong>"Cancelar Suscripción"</strong></li>
                <li>3. Confirme la cancelación</li>
                <li>4. Recibirá un email de confirmación</li>
              </ol>
            </div>

            <div className="space-y-3 text-gray-700 text-sm">
              <p>
                <strong>Efectos de la cancelación:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Su suscripción permanece activa hasta el final del período de facturación actual</li>
                <li>No se realizan más cargos después de la cancelación</li>
                <li>Conserva acceso a todas las funcionalidades hasta el fin del período pagado</li>
                <li>Sus datos y propiedades se mantienen durante 90 días tras la cancelación</li>
                <li>Puede reactivar su suscripción en cualquier momento dentro de esos 90 días</li>
              </ul>
            </div>

            <p className="text-gray-700 mt-4">
              Transcurridos 90 días desde la cancelación sin reactivación, sus propiedades pasarán a estado inactivo.
              Los datos se conservarán según nuestra{' '}
              <Link href="/legal/privacy" className="text-blue-600 hover:underline">
                Política de Privacidad
              </Link>.
            </p>
          </section>

          <section id="reembolsos">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Política de Reembolsos</h2>
            <p className="text-gray-700 mb-4">
              Los pagos de suscripción son <strong>no reembolsables</strong> excepto en las siguientes circunstancias:
            </p>

            <div className="space-y-3 mb-4">
              <div className="border-l-4 border-green-500 bg-green-50 p-4">
                <h3 className="font-semibold text-gray-900 mb-2">✓ Cargos Duplicados</h3>
                <p className="text-sm text-gray-700">
                  Si se le carga dos veces por error, reembolsamos inmediatamente el cargo duplicado.
                </p>
              </div>

              <div className="border-l-4 border-green-500 bg-green-50 p-4">
                <h3 className="font-semibold text-gray-900 mb-2">✓ Error Técnico de Facturación</h3>
                <p className="text-sm text-gray-700">
                  Si un error técnico causa un cargo incorrecto, se reembolsa el importe erróneo en un plazo de 5-7 días laborables.
                </p>
              </div>

              <div className="border-l-4 border-green-500 bg-green-50 p-4">
                <h3 className="font-semibold text-gray-900 mb-2">✓ Servicio No Disponible</h3>
                <p className="text-sm text-gray-700">
                  Si el servicio está inaccesible durante más de 72 horas por problemas técnicos de nuestra parte,
                  puede solicitar reembolso prorrateado del tiempo de inactividad.
                </p>
              </div>
            </div>

            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <h3 className="font-semibold text-gray-900 mb-2">✗ No se reembolsa en estos casos:</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Cancelación voluntaria antes del fin del período</li>
                <li>• Cambio de opinión o insatisfacción con el servicio</li>
                <li>• No uso del servicio durante el período de facturación</li>
                <li>• Suspensión por violación de los términos de uso</li>
              </ul>
            </div>

            <p className="text-gray-700 text-sm mt-4">
              Para solicitar un reembolso justificado, contacte con {LEGAL_CONTACT.email} indicando su ID de transacción
              y motivo. Procesamos solicitudes en un plazo máximo de 10 días laborables.
            </p>
          </section>

          <section id="impuestos">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Impuestos y Facturación</h2>
            <p className="text-gray-700 mb-4">
              Cumplimos con todas las obligaciones fiscales y de facturación aplicables en España y la Unión Europea.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">IVA (Impuesto sobre el Valor Añadido):</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>
                  <strong>Clientes en España:</strong> Se aplica el IVA vigente (actualmente 21%)
                </li>
                <li>
                  <strong>Clientes B2B en la UE:</strong> IVA aplicable según el mecanismo de inversión del sujeto pasivo
                  (proporcione NIF-IVA válido)
                </li>
                <li>
                  <strong>Clientes B2C en la UE:</strong> IVA del país de destino según normativa comunitaria
                </li>
                <li>
                  <strong>Clientes fuera de la UE:</strong> Sin IVA (0%)
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Facturas Electrónicas:</h3>
              <p className="text-sm text-gray-700 mb-2">
                Emitimos facturas electrónicas conformes con la normativa española (Ley 25/2013). Todas las facturas incluyen:
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Número de factura único y correlativo</li>
                <li>• Fecha de emisión y período facturado</li>
                <li>• Datos fiscales completos (emisor y cliente)</li>
                <li>• Detalle de servicios prestados</li>
                <li>• Base imponible, IVA aplicado y total</li>
              </ul>
            </div>

            <p className="text-gray-700 text-sm mt-4">
              Puede descargar todas sus facturas en cualquier momento desde <strong>Cuenta → Facturación → Historial</strong>.
              Las facturas se conservan durante 10 años según requisitos legales.
            </p>
          </section>

          <section id="fallos-pago">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Fallos de Pago</h2>
            <p className="text-gray-700 mb-4">
              Si un pago falla por fondos insuficientes, tarjeta expirada u otro motivo, seguimos este proceso:
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">1</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Notificación Inmediata</h4>
                  <p className="text-sm text-gray-700">
                    Le enviamos un email informándole del fallo de pago y solicitando que actualice su método de pago.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">2</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Período de Gracia (3 días)</h4>
                  <p className="text-sm text-gray-700">
                    Su servicio permanece activo durante 3 días para darle tiempo a resolver el problema.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">3</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Reintento Automático</h4>
                  <p className="text-sm text-gray-700">
                    Intentamos cobrar nuevamente a los 3 días. Si falla de nuevo, enviamos otro recordatorio.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">4</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Segundo Reintento (7 días)</h4>
                  <p className="text-sm text-gray-700">
                    Último intento de cobro a los 7 días. Si falla, su cuenta pasa a estado "Suspendida".
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">5</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Suspensión (después de 7 días)</h4>
                  <p className="text-sm text-gray-700">
                    Si no recibimos el pago, su cuenta se suspende temporalmente. Puede reactivarla actualizando
                    su método de pago y saldando la deuda pendiente.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-4">
              <p className="text-sm text-gray-700">
                <strong>Importante:</strong> Durante la suspensión, sus propiedades no estarán accesibles para los huéspedes.
                Reactivar su suscripción restaura el acceso inmediatamente.
              </p>
            </div>
          </section>

          <section id="cambios-precios">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Cambios en los Precios</h2>
            <p className="text-gray-700 mb-4">
              Nos reservamos el derecho de modificar nuestros precios, pero siempre con transparencia y respeto a nuestros clientes:
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Garantías ante cambios de precio:</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>
                  • <strong>Notificación con 30 días de antelación:</strong> Le avisaremos por email al menos un mes antes
                </li>
                <li>
                  • <strong>Grandfathering:</strong> Los clientes existentes mantienen su precio durante al menos 6 meses
                </li>
                <li>
                  • <strong>Derecho de cancelación:</strong> Puede cancelar sin penalización si no está de acuerdo
                </li>
                <li>
                  • <strong>Claridad:</strong> Explicaremos claramente los motivos del cambio de precio
                </li>
              </ul>
            </div>

            <p className="text-gray-700">
              Su aceptación continuada del servicio después de la notificación constituirá su aceptación del nuevo precio.
            </p>
          </section>

          <section id="contacto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contacto</h2>
            <p className="text-gray-700 mb-4">
              Para consultas sobre facturación, pagos o suscripciones, puede contactarnos en:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 mb-2"><strong>Email de facturación:</strong> {LEGAL_CONTACT.email}</p>
              <p className="text-gray-700 mb-2"><strong>Email general:</strong> {LEGAL_CONTACT.email}</p>
              <p className="text-gray-700"><strong>Horario de atención:</strong> Lunes a Viernes, 9:00 - 18:00 (CET)</p>
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
