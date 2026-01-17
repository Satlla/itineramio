'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { POLICY_VERSION, POLICY_LAST_UPDATE, LEGAL_CONTACT } from '@/config/policies'

export default function CookiesPage() {
  const { t } = useTranslation('legal')

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{t('cookies.title')}</h1>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              {t('common.version')} {POLICY_VERSION}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            {t('common.lastUpdate')}: {POLICY_LAST_UPDATE}
          </p>
        </div>

        {/* Executive Summary */}
        <div className="mb-8 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">{t('common.executiveSummary')}</h2>
          <ul className="space-y-2 text-blue-800">
            <li>• {t('cookies.summary.item1')}</li>
            <li>• {t('cookies.summary.item2')}</li>
            <li>• {t('cookies.summary.item3')}</li>
            <li>• {t('cookies.summary.item4')}</li>
            <li>• {t('cookies.summary.item5')}</li>
          </ul>
        </div>

        {/* Table of Contents */}
        <nav className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('common.tableOfContents')}</h2>
          <ul className="space-y-2">
            <li><a href="#que-son" className="text-blue-600 hover:underline">{t('cookies.toc.whatAre')}</a></li>
            <li><a href="#tipos" className="text-blue-600 hover:underline">{t('cookies.toc.types')}</a></li>
            <li><a href="#tecnicas" className="text-blue-600 hover:underline">{t('cookies.toc.technical')}</a></li>
            <li><a href="#analiticas" className="text-blue-600 hover:underline">{t('cookies.toc.analytics')}</a></li>
            <li><a href="#marketing" className="text-blue-600 hover:underline">{t('cookies.toc.marketing')}</a></li>
            <li><a href="#gestion" className="text-blue-600 hover:underline">{t('cookies.toc.management')}</a></li>
            <li><a href="#duracion" className="text-blue-600 hover:underline">{t('cookies.toc.duration')}</a></li>
            <li><a href="#terceros" className="text-blue-600 hover:underline">{t('cookies.toc.thirdParty')}</a></li>
            <li><a href="#actualizaciones" className="text-blue-600 hover:underline">{t('cookies.toc.updates')}</a></li>
            <li><a href="#contacto" className="text-blue-600 hover:underline">{t('cookies.toc.contact')}</a></li>
          </ul>
        </nav>

        {/* Content Sections */}
        <div className="prose prose-blue max-w-none space-y-8">

          <section id="que-son">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('cookies.section1.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('cookies.section1.description')}
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">{t('cookies.section1.purpose')}</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>{t('cookies.section1.item1')}</li>
                <li>{t('cookies.section1.item2')}</li>
                <li>{t('cookies.section1.item3')}</li>
                <li>{t('cookies.section1.item4')}</li>
                <li>{t('cookies.section1.item5')}</li>
              </ul>
            </div>
          </section>

          <section id="tipos">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('cookies.section2.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('cookies.section2.description')}
            </p>

            <div className="space-y-4">
              <div className="border-l-4 border-green-500 bg-green-50 p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{t('cookies.section2.technical.title')}</h3>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>{t('cookies.section2.technical.purpose')}</strong>
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>{t('cookies.section2.technical.consent')}</strong>
                </p>
                <p className="text-sm text-gray-700">
                  <strong>{t('cookies.section2.technical.examples')}</strong>
                </p>
              </div>

              <div className="border-l-4 border-blue-500 bg-blue-50 p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{t('cookies.section2.analytics.title')}</h3>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>{t('cookies.section2.analytics.purpose')}</strong>
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>{t('cookies.section2.analytics.consent')}</strong>
                </p>
                <p className="text-sm text-gray-700">
                  <strong>{t('cookies.section2.analytics.examples')}</strong>
                </p>
              </div>

              <div className="border-l-4 border-purple-500 bg-purple-50 p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{t('cookies.section2.marketing.title')}</h3>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>{t('cookies.section2.marketing.purpose')}</strong>
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>{t('cookies.section2.marketing.consent')}</strong>
                </p>
                <p className="text-sm text-gray-700">
                  <strong>{t('cookies.section2.marketing.examples')}</strong>
                </p>
              </div>
            </div>
          </section>

          <section id="tecnicas">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('cookies.section3.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('cookies.section3.description')}
            </p>

            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">{t('cookies.section3.table.name')}</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">{t('cookies.section3.table.purpose')}</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">{t('cookies.section3.table.duration')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-3 px-4 text-gray-700 font-mono text-xs">auth-token</td>
                    <td className="py-3 px-4 text-gray-700">{t('cookies.section3.authToken.purpose')}</td>
                    <td className="py-3 px-4 text-gray-700">{t('cookies.section3.authToken.duration')}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-gray-700 font-mono text-xs">__Secure-next-auth.session-token</td>
                    <td className="py-3 px-4 text-gray-700">{t('cookies.section3.sessionToken.purpose')}</td>
                    <td className="py-3 px-4 text-gray-700">{t('cookies.section3.sessionToken.duration')}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-gray-700 font-mono text-xs">cookie_consent</td>
                    <td className="py-3 px-4 text-gray-700">{t('cookies.section3.cookieConsent.purpose')}</td>
                    <td className="py-3 px-4 text-gray-700">{t('cookies.section3.cookieConsent.duration')}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-gray-700 font-mono text-xs">XSRF-TOKEN</td>
                    <td className="py-3 px-4 text-gray-700">{t('cookies.section3.xsrfToken.purpose')}</td>
                    <td className="py-3 px-4 text-gray-700">{t('cookies.section3.xsrfToken.duration')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-4">
              <p className="text-sm text-gray-700">
                <strong>{t('cookies.section3.legalNote')}</strong>
              </p>
            </div>
          </section>

          <section id="analiticas">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('cookies.section4.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('cookies.section4.description')}
            </p>

            <div className="bg-gray-50 rounded-lg overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">{t('cookies.section4.table.provider')}</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">{t('cookies.section4.table.cookie')}</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">{t('cookies.section4.table.purpose')}</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">{t('cookies.section4.table.duration')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-3 px-4 text-gray-700">Google</td>
                    <td className="py-3 px-4 text-gray-700 font-mono text-xs">_ga</td>
                    <td className="py-3 px-4 text-gray-700">ID único de usuario</td>
                    <td className="py-3 px-4 text-gray-700">24 meses</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-gray-700">Google</td>
                    <td className="py-3 px-4 text-gray-700 font-mono text-xs">_ga_*</td>
                    <td className="py-3 px-4 text-gray-700">Estado de sesión</td>
                    <td className="py-3 px-4 text-gray-700">24 meses</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-gray-700">Itineramio</td>
                    <td className="py-3 px-4 text-gray-700 font-mono text-xs">analytics_session</td>
                    <td className="py-3 px-4 text-gray-700">Análisis interno</td>
                    <td className="py-3 px-4 text-gray-700">30 min</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">{t('cookies.section4.infoCollected.title')}</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>{t('cookies.section4.infoCollected.item1')}</li>
                <li>{t('cookies.section4.infoCollected.item2')}</li>
                <li>{t('cookies.section4.infoCollected.item3')}</li>
                <li>{t('cookies.section4.infoCollected.item4')}</li>
                <li>{t('cookies.section4.infoCollected.item5')}</li>
              </ul>
              <p className="text-xs text-gray-600 mt-3">
                {t('cookies.section4.note')}
              </p>
            </div>
          </section>

          <section id="marketing">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('cookies.section5.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('cookies.section5.description')}
            </p>

            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-4">
              <p className="text-sm text-gray-700">
                <strong>{t('cookies.section5.currentStatus')}</strong>
              </p>
            </div>

            <p className="text-gray-700 text-sm">
              {t('cookies.section5.futureUse')}
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm mb-4">
              <li>{t('cookies.section5.item1')}</li>
              <li>{t('cookies.section5.item2')}</li>
              <li>{t('cookies.section5.item3')}</li>
              <li>{t('cookies.section5.item4')}</li>
            </ul>
          </section>

          <section id="gestion">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('cookies.section6.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('cookies.section6.description')}
            </p>

            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">🎛️ {t('cookies.section6.panel.title')}</h3>
                <p className="text-sm text-gray-700 mb-2">
                  {t('cookies.section6.panel.description')}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">🌐 {t('cookies.section6.browser.title')}</h3>
                <p className="text-sm text-gray-700 mb-2">
                  {t('cookies.section6.browser.description')}
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• <strong>Chrome:</strong> {t('cookies.section6.browser.chrome')}</li>
                  <li>• <strong>Firefox:</strong> {t('cookies.section6.browser.firefox')}</li>
                  <li>• <strong>Safari:</strong> {t('cookies.section6.browser.safari')}</li>
                  <li>• <strong>Edge:</strong> {t('cookies.section6.browser.edge')}</li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <p className="text-sm text-gray-700">
                <strong>{t('cookies.section6.important')}</strong>
              </p>
            </div>
          </section>

          <section id="duracion">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('cookies.section7.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('cookies.section7.description')}
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">{t('cookies.section7.session.title')}</h3>
                <p className="text-sm text-gray-700 mb-2">
                  {t('cookies.section7.session.description')}
                </p>
                <p className="text-xs text-gray-600">
                  {t('cookies.section7.session.example')}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">{t('cookies.section7.persistent.title')}</h3>
                <p className="text-sm text-gray-700 mb-2">
                  {t('cookies.section7.persistent.description')}
                </p>
                <p className="text-xs text-gray-600">
                  {t('cookies.section7.persistent.example')}
                </p>
              </div>
            </div>

            <div className="mt-4 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">{t('cookies.section7.maxRetention.title')}</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• <strong>{t('cookies.section7.maxRetention.technical')}</strong></li>
                <li>• <strong>{t('cookies.section7.maxRetention.analytics')}</strong></li>
                <li>• <strong>{t('cookies.section7.maxRetention.marketing')}</strong></li>
              </ul>
              <p className="text-xs text-gray-600 mt-3">
                {t('cookies.section7.compliance')}
              </p>
            </div>
          </section>

          <section id="terceros">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('cookies.section8.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('cookies.section8.description')}
            </p>

            <div className="space-y-3">
              <div className="border-l-4 border-gray-500 pl-4">
                <h4 className="font-semibold text-gray-900">{t('cookies.section8.stripe.title')}</h4>
                <p className="text-sm text-gray-600 mb-1">
                  {t('cookies.section8.stripe.description')}
                </p>
                <p className="text-xs text-gray-500">
                  {t('cookies.section8.stripe.policy')}{' '}
                  <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    stripe.com/privacy
                  </a>
                </p>
              </div>

              <div className="border-l-4 border-gray-500 pl-4">
                <h4 className="font-semibold text-gray-900">{t('cookies.section8.vercel.title')}</h4>
                <p className="text-sm text-gray-600 mb-1">
                  {t('cookies.section8.vercel.description')}
                </p>
                <p className="text-xs text-gray-500">
                  {t('cookies.section8.vercel.policy')}{' '}
                  <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    vercel.com/legal/privacy-policy
                  </a>
                </p>
              </div>
            </div>

            <p className="text-gray-700 text-sm mt-4">
              {t('cookies.section8.noControl')}
            </p>
          </section>

          <section id="actualizaciones">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('cookies.section9.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('cookies.section9.description')}
            </p>
            <p className="text-gray-700">
              {t('cookies.section9.notification')}
            </p>
          </section>

          <section id="contacto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('cookies.section10.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('cookies.section10.description')}
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 mb-2"><strong>{t('cookies.section10.email')}:</strong> {LEGAL_CONTACT.email}</p>
              <p className="text-gray-700 mb-2"><strong>{t('cookies.section10.support')}:</strong> {LEGAL_CONTACT.email}</p>
              <p className="text-gray-700"><strong>{t('cookies.section10.address')}:</strong> {LEGAL_CONTACT.address}</p>
            </div>
          </section>

        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-4">{t('common.otherPolicies')}:</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/legal/terms" className="text-blue-600 hover:underline text-sm">
              {t('links.termsAndConditions')}
            </Link>
            <Link href="/legal/privacy" className="text-blue-600 hover:underline text-sm">
              {t('links.privacyPolicy')}
            </Link>
            <Link href="/legal/billing" className="text-blue-600 hover:underline text-sm">
              {t('links.billingTerms')}
            </Link>
            <Link href="/legal/legal-notice" className="text-blue-600 hover:underline text-sm">
              {t('links.legalNotice')}
            </Link>
            <Link href="/legal/dpa" className="text-blue-600 hover:underline text-sm">
              {t('links.dpa')}
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:underline"
          >
            ← {t('common.backToHome')}
          </Link>
        </div>
      </div>
    </div>
  )
}
