import { redirect } from 'next/navigation'
import { isFeatureEnabled } from '../../../src/lib/feature-flags'
import PricingCalculator from '../../components/PricingCalculator'

/**
 * Pricing V2 Page
 *
 * Nueva página de pricing con modelo flexible pay-per-property.
 * Gateada por feature flag ENABLE_PRICING_V2.
 *
 * Para activar/desactivar:
 * - Editar .env.local: NEXT_PUBLIC_ENABLE_PRICING_V2="true" o "false"
 * - Reiniciar servidor de desarrollo
 *
 * Modelo implementado:
 * - Pricing dinámico basado en número de propiedades
 * - Descuentos por volumen automáticos
 * - Calculadora interactiva en tiempo real
 * - Integración con sistema de cupones
 */

export const metadata = {
  title: 'Precios | Itineramio',
  description: 'Pricing transparente y flexible. Paga solo por las propiedades que uses con descuentos automáticos por volumen.',
}

export default function PricingV2Page() {
  // Feature flag check - redirect to 404 if disabled
  if (!isFeatureEnabled('ENABLE_PRICING_V2')) {
    redirect('/404')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Precios simples y transparentes
            </h1>
            <p className="text-xl sm:text-2xl text-violet-100 max-w-3xl mx-auto mb-8">
              Paga solo por las propiedades que uses. Sin costes ocultos. Sin compromisos a largo plazo.
            </p>

            {/* Feature Flag Indicator (only visible in development) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="inline-block bg-green-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                ✅ PRICING_V2 ENABLED
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Calculator Component */}
      <PricingCalculator />

      {/* Value Proposition Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir Itineramio?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              La solución completa para gestionar la información de tus propiedades vacacionales
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Precio justo</h3>
              <p className="text-gray-600">
                Paga solo por lo que usas. Más propiedades = mejor precio por unidad.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sin compromisos</h3>
              <p className="text-gray-600">
                Prueba 15 días sin compromiso. Sin penalizaciones ni preguntas.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Configuración instantánea</h3>
              <p className="text-gray-600">
                Empieza en minutos. 15 días de evaluación sin necesidad de tarjeta.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Comparativa con la competencia
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Precios más competitivos con más funcionalidades incluidas
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow-lg border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Característica</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-violet-600">Itineramio</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-500">Competidor A</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-500">Competidor B</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">Precio por 5 propiedades</td>
                  <td className="px-6 py-4 text-center text-sm font-semibold text-violet-600">€30/mes</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">€49/mes</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">€39/mes</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700">Códigos QR personalizados</td>
                  <td className="px-6 py-4 text-center">
                    <svg className="w-6 h-6 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <svg className="w-6 h-6 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <svg className="w-6 h-6 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">Multiidioma</td>
                  <td className="px-6 py-4 text-center">
                    <svg className="w-6 h-6 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <svg className="w-6 h-6 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs text-gray-500">+€10/mes</span>
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700">Analytics avanzados</td>
                  <td className="px-6 py-4 text-center">
                    <svg className="w-6 h-6 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs text-gray-500">Premium only</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <svg className="w-6 h-6 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">Integración WhatsApp</td>
                  <td className="px-6 py-4 text-center">
                    <svg className="w-6 h-6 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <svg className="w-6 h-6 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <svg className="w-6 h-6 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Preguntas frecuentes
            </h2>
          </div>

          <div className="space-y-6">
            <details className="group bg-gray-50 rounded-lg p-6 cursor-pointer">
              <summary className="font-semibold text-gray-900 text-lg flex justify-between items-center">
                ¿Qué incluye el período de evaluación?
                <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-4 text-gray-600">
                El período de evaluación de 15 días incluye acceso completo a todas las funcionalidades de la plataforma. No necesitas introducir tarjeta de crédito para empezar.
              </p>
            </details>

            <details className="group bg-gray-50 rounded-lg p-6 cursor-pointer">
              <summary className="font-semibold text-gray-900 text-lg flex justify-between items-center">
                ¿Puedo cambiar el número de propiedades en cualquier momento?
                <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-4 text-gray-600">
                Sí, puedes añadir o quitar propiedades cuando quieras. El precio se ajusta automáticamente y se prorratean los cambios en tu próxima factura.
              </p>
            </details>

            <details className="group bg-gray-50 rounded-lg p-6 cursor-pointer">
              <summary className="font-semibold text-gray-900 text-lg flex justify-between items-center">
                ¿Hay descuentos por pago anual?
                <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-4 text-gray-600">
                Sí, obtienes un 15% de descuento si pagas anualmente en lugar de mensualmente.
              </p>
            </details>

            <details className="group bg-gray-50 rounded-lg p-6 cursor-pointer">
              <summary className="font-semibold text-gray-900 text-lg flex justify-between items-center">
                ¿Cómo funcionan los cupones de descuento?
                <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-4 text-gray-600">
                Puedes introducir un código de cupón durante el registro o en la calculadora de precios. Los cupones pueden ofrecer descuentos porcentuales, meses incluidos o descuentos fijos.
              </p>
            </details>

            <details className="group bg-gray-50 rounded-lg p-6 cursor-pointer">
              <summary className="font-semibold text-gray-900 text-lg flex justify-between items-center">
                ¿Qué métodos de pago aceptan?
                <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-4 text-gray-600">
                Aceptamos tarjetas de crédito/débito (Visa, Mastercard, American Express), SEPA Direct Debit para Europa, y próximamente Bizum para España.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            ¿Listo para empezar?
          </h2>
          <p className="text-xl text-violet-100 mb-8">
            Únete a cientos de propietarios que ya confían en Itineramio
          </p>
          <a
            href="/register"
            className="inline-block bg-white text-violet-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors shadow-xl"
          >
            Comienza tu evaluación de 15 días
          </a>
          <p className="mt-4 text-violet-200 text-sm">
            Sin tarjeta requerida • Prueba 15 días sin compromiso
          </p>
        </div>
      </section>
    </div>
  )
}
