'use client'

import { redirect } from 'next/navigation'
import { useTranslation } from 'react-i18next'
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

export default function PricingV2Page() {
  const { t } = useTranslation('dashboard')

  // Feature flag check - redirect to 404 if disabled
  if (!isFeatureEnabled('ENABLE_PRICING_V2')) {
    redirect('/404')
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: 'calc(4rem + env(safe-area-inset-top, 0px))' }}>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              {t('pricing.hero.title')}
            </h1>
            <p className="text-xl sm:text-2xl text-violet-100 max-w-3xl mx-auto mb-8">
              {t('pricing.hero.subtitle')}
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
              {t('pricing.whyChoose.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('pricing.whyChoose.subtitle')}
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
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('pricing.benefits.fairPrice.title')}</h3>
              <p className="text-gray-600">
                {t('pricing.benefits.fairPrice.description')}
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('pricing.benefits.noCommitment.title')}</h3>
              <p className="text-gray-600">
                {t('pricing.benefits.noCommitment.description')}
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('pricing.benefits.instantSetup.title')}</h3>
              <p className="text-gray-600">
                {t('pricing.benefits.instantSetup.description')}
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
              {t('pricing.comparison.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('pricing.comparison.subtitle')}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow-lg border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{t('pricing.comparison.feature')}</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-violet-600">Itineramio</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-500">{t('pricing.comparison.competitorA')}</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-500">{t('pricing.comparison.competitorB')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">{t('pricing.comparison.priceFor5')}</td>
                  <td className="px-6 py-4 text-center text-sm font-semibold text-violet-600">{t('pricing.comparison.itineramioPrice')}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">{t('pricing.comparison.competitorAPrice')}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">{t('pricing.comparison.competitorBPrice')}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700">{t('pricing.comparison.customQr')}</td>
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
                  <td className="px-6 py-4 text-sm text-gray-700">{t('pricing.comparison.multilanguage')}</td>
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
                    <span className="text-xs text-gray-500">{t('pricing.comparison.multilanguageExtra')}</span>
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700">{t('pricing.comparison.advancedAnalytics')}</td>
                  <td className="px-6 py-4 text-center">
                    <svg className="w-6 h-6 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs text-gray-500">{t('pricing.comparison.premiumOnly')}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <svg className="w-6 h-6 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">{t('pricing.comparison.whatsappIntegration')}</td>
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
              {t('pricing.faq.title')}
            </h2>
          </div>

          <div className="space-y-6">
            <details className="group bg-gray-50 rounded-lg p-6 cursor-pointer">
              <summary className="font-semibold text-gray-900 text-lg flex justify-between items-center">
                {t('pricing.faq.trialQuestion')}
                <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-4 text-gray-600">
                {t('pricing.faq.trialAnswer')}
              </p>
            </details>

            <details className="group bg-gray-50 rounded-lg p-6 cursor-pointer">
              <summary className="font-semibold text-gray-900 text-lg flex justify-between items-center">
                {t('pricing.faq.changePropertiesQuestion')}
                <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-4 text-gray-600">
                {t('pricing.faq.changePropertiesAnswer')}
              </p>
            </details>

            <details className="group bg-gray-50 rounded-lg p-6 cursor-pointer">
              <summary className="font-semibold text-gray-900 text-lg flex justify-between items-center">
                {t('pricing.faq.annualDiscountQuestion')}
                <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-4 text-gray-600">
                {t('pricing.faq.annualDiscountAnswer')}
              </p>
            </details>

            <details className="group bg-gray-50 rounded-lg p-6 cursor-pointer">
              <summary className="font-semibold text-gray-900 text-lg flex justify-between items-center">
                {t('pricing.faq.couponQuestion')}
                <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-4 text-gray-600">
                {t('pricing.faq.couponAnswer')}
              </p>
            </details>

            <details className="group bg-gray-50 rounded-lg p-6 cursor-pointer">
              <summary className="font-semibold text-gray-900 text-lg flex justify-between items-center">
                {t('pricing.faq.paymentMethodsQuestion')}
                <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-4 text-gray-600">
                {t('pricing.faq.paymentMethodsAnswer')}
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            {t('pricing.cta.title')}
          </h2>
          <p className="text-xl text-violet-100 mb-8">
            {t('pricing.cta.subtitle')}
          </p>
          <a
            href="/register"
            className="inline-block bg-white text-violet-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors shadow-xl"
          >
            {t('pricing.cta.button')}
          </a>
          <p className="mt-4 text-violet-200 text-sm">
            {t('pricing.cta.disclaimer')}
          </p>
        </div>
      </section>
    </div>
  )
}
