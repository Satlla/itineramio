'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { POLICY_VERSION, POLICY_LAST_UPDATE, LEGAL_CONTACT } from '@/config/policies'

export default function PrivacyPage() {
  const { t } = useTranslation('legal')

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{t('privacy.title')}</h1>
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
            <li>• {t('privacy.summary.item1')}</li>
            <li>• {t('privacy.summary.item2')}</li>
            <li>• {t('privacy.summary.item3')}</li>
            <li>• {t('privacy.summary.item4')}</li>
            <li>• {t('privacy.summary.item5')}</li>
          </ul>
        </div>

        {/* Table of Contents */}
        <nav className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('common.tableOfContents')}</h2>
          <ul className="space-y-2">
            <li><a href="#responsable" className="text-blue-600 hover:underline">{t('privacy.toc.responsable')}</a></li>
            <li><a href="#datos-recopilados" className="text-blue-600 hover:underline">{t('privacy.toc.datosRecopilados')}</a></li>
            <li><a href="#finalidad" className="text-blue-600 hover:underline">{t('privacy.toc.finalidad')}</a></li>
            <li><a href="#base-legal" className="text-blue-600 hover:underline">{t('privacy.toc.baseLegal')}</a></li>
            <li><a href="#destinatarios" className="text-blue-600 hover:underline">{t('privacy.toc.destinatarios')}</a></li>
            <li><a href="#conservacion" className="text-blue-600 hover:underline">{t('privacy.toc.conservacion')}</a></li>
            <li><a href="#derechos" className="text-blue-600 hover:underline">{t('privacy.toc.derechos')}</a></li>
            <li><a href="#seguridad" className="text-blue-600 hover:underline">{t('privacy.toc.seguridad')}</a></li>
            <li><a href="#cookies" className="text-blue-600 hover:underline">{t('privacy.toc.cookies')}</a></li>
            <li><a href="#transferencias" className="text-blue-600 hover:underline">{t('privacy.toc.transferencias')}</a></li>
            <li><a href="#menores" className="text-blue-600 hover:underline">{t('privacy.toc.menores')}</a></li>
            <li><a href="#cambios" className="text-blue-600 hover:underline">{t('privacy.toc.cambios')}</a></li>
            <li><a href="#contacto" className="text-blue-600 hover:underline">{t('privacy.toc.contacto')}</a></li>
          </ul>
        </nav>

        {/* Content Sections */}
        <div className="prose prose-blue max-w-none space-y-8">

          <section id="responsable">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('privacy.section1.title')}</h2>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-gray-700 mb-2"><strong>{t('privacy.section1.identity')}:</strong> {LEGAL_CONTACT.companyName}</p>
              <p className="text-gray-700 mb-2"><strong>{t('privacy.section1.address')}:</strong> {LEGAL_CONTACT.address}</p>
              <p className="text-gray-700 mb-2"><strong>{t('privacy.section1.contactEmail')}:</strong> {LEGAL_CONTACT.email}</p>
              <p className="text-gray-700"><strong>{t('privacy.section1.dpo')}:</strong> {LEGAL_CONTACT.email}</p>
            </div>
            <p className="text-gray-700">
              {LEGAL_CONTACT.companyName} {t('privacy.section1.description')}
            </p>
          </section>

          <section id="datos-recopilados">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('privacy.section2.title')}</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('privacy.section2.registrationData.title')}</h3>
            <p className="text-gray-700 mb-2">{t('privacy.section2.registrationData.description')}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>{t('privacy.section2.registrationData.fullName')}</li>
              <li>{t('privacy.section2.registrationData.email')}</li>
              <li>{t('privacy.section2.registrationData.password')}</li>
              <li>{t('privacy.section2.registrationData.phone')}</li>
              <li>{t('privacy.section2.registrationData.company')}</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('privacy.section2.usageData.title')}</h3>
            <p className="text-gray-700 mb-2">{t('privacy.section2.usageData.description')}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>{t('privacy.section2.usageData.properties')}</li>
              <li>{t('privacy.section2.usageData.manualContent')}</li>
              <li>{t('privacy.section2.usageData.platformInteraction')}</li>
              <li>{t('privacy.section2.usageData.analytics')}</li>
              <li>{t('privacy.section2.usageData.reviews')}</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('privacy.section2.technicalData.title')}</h3>
            <p className="text-gray-700 mb-2">{t('privacy.section2.technicalData.description')}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>{t('privacy.section2.technicalData.ip')}</li>
              <li>{t('privacy.section2.technicalData.browser')}</li>
              <li>{t('privacy.section2.technicalData.os')}</li>
              <li>{t('privacy.section2.technicalData.device')}</li>
              <li>{t('privacy.section2.technicalData.pagesVisited')}</li>
              <li>{t('privacy.section2.technicalData.referrer')}</li>
              <li>{t('privacy.section2.technicalData.cookies')}{' '}
                <Link href="/legal/cookies" className="text-blue-600 hover:underline">
                  {t('links.cookiesPolicy')}
                </Link>)
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('privacy.section2.billingData.title')}</h3>
            <p className="text-gray-700 mb-2">{t('privacy.section2.billingData.description')}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>{t('privacy.section2.billingData.card')}</li>
              <li>{t('privacy.section2.billingData.billingAddress')}</li>
              <li>{t('privacy.section2.billingData.taxId')}</li>
              <li>{t('privacy.section2.billingData.transactions')}</li>
            </ul>
            <p className="text-sm text-gray-600 italic">
              {t('privacy.section2.billingData.note')}
            </p>
          </section>

          <section id="finalidad">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('privacy.section3.title')}</h2>
            <p className="text-gray-700 mb-4">{t('privacy.section3.description')}</p>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{t('privacy.section3.serviceProvision.title')}</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>{t('privacy.section3.serviceProvision.item1')}</li>
                  <li>{t('privacy.section3.serviceProvision.item2')}</li>
                  <li>{t('privacy.section3.serviceProvision.item3')}</li>
                  <li>{t('privacy.section3.serviceProvision.item4')}</li>
                  <li>{t('privacy.section3.serviceProvision.item5')}</li>
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{t('privacy.section3.billing.title')}</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>{t('privacy.section3.billing.item1')}</li>
                  <li>{t('privacy.section3.billing.item2')}</li>
                  <li>{t('privacy.section3.billing.item3')}</li>
                  <li>{t('privacy.section3.billing.item4')}</li>
                </ul>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{t('privacy.section3.communications.title')}</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>{t('privacy.section3.communications.item1')}</li>
                  <li>{t('privacy.section3.communications.item2')}</li>
                  <li>{t('privacy.section3.communications.item3')}</li>
                  <li>{t('privacy.section3.communications.item4')}</li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{t('privacy.section3.improvement.title')}</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>{t('privacy.section3.improvement.item1')}</li>
                  <li>{t('privacy.section3.improvement.item2')}</li>
                  <li>{t('privacy.section3.improvement.item3')}</li>
                  <li>{t('privacy.section3.improvement.item4')}</li>
                </ul>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{t('privacy.section3.legal.title')}</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>{t('privacy.section3.legal.item1')}</li>
                  <li>{t('privacy.section3.legal.item2')}</li>
                  <li>{t('privacy.section3.legal.item3')}</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="base-legal">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('privacy.section4.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('privacy.section4.description')}
            </p>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-2 font-semibold text-gray-900">{t('privacy.section4.table.purpose')}</th>
                    <th className="text-left py-2 font-semibold text-gray-900">{t('privacy.section4.table.legalBasis')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-2 text-gray-700">{t('privacy.section4.table.serviceProvision')}</td>
                    <td className="py-2 text-gray-700">{t('privacy.section4.table.contractExecution')}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-700">{t('privacy.section4.table.billing')}</td>
                    <td className="py-2 text-gray-700">{t('privacy.section4.table.contractExecution')}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-700">{t('privacy.section4.table.marketing')}</td>
                    <td className="py-2 text-gray-700">{t('privacy.section4.table.consent')}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-700">{t('privacy.section4.table.serviceImprovement')}</td>
                    <td className="py-2 text-gray-700">{t('privacy.section4.table.legitimateInterest')}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-700">{t('privacy.section4.table.legalCompliance')}</td>
                    <td className="py-2 text-gray-700">{t('privacy.section4.table.legalObligation')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="destinatarios">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('privacy.section5.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('privacy.section5.description')}
            </p>

            <div className="space-y-3 mb-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-900">{t('privacy.section5.stripe.name')}</h4>
                <p className="text-sm text-gray-600">{t('privacy.section5.stripe.description')}</p>
                <p className="text-xs text-gray-500">{t('privacy.section5.stripe.policy')}</p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-gray-900">{t('privacy.section5.supabase.name')}</h4>
                <p className="text-sm text-gray-600">{t('privacy.section5.supabase.description')}</p>
                <p className="text-xs text-gray-500">{t('privacy.section5.supabase.policy')}</p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold text-gray-900">{t('privacy.section5.resend.name')}</h4>
                <p className="text-sm text-gray-600">{t('privacy.section5.resend.description')}</p>
                <p className="text-xs text-gray-500">{t('privacy.section5.resend.policy')}</p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4">
                <h4 className="font-semibold text-gray-900">{t('privacy.section5.vercel.name')}</h4>
                <p className="text-sm text-gray-600">{t('privacy.section5.vercel.description')}</p>
                <p className="text-xs text-gray-500">{t('privacy.section5.vercel.policy')}</p>
              </div>
            </div>

            <p className="text-gray-700 text-sm">
              <strong>{t('privacy.section5.important')}</strong>
            </p>
          </section>

          <section id="conservacion">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('privacy.section6.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('privacy.section6.description')}
            </p>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <ul className="space-y-3 text-gray-700">
                <li>
                  <strong>{t('privacy.section6.accountData')}</strong>
                </li>
                <li>
                  <strong>{t('privacy.section6.billingData')}</strong>
                </li>
                <li>
                  <strong>{t('privacy.section6.technicalCookies')}</strong>
                </li>
                <li>
                  <strong>{t('privacy.section6.analyticsCookies')}</strong>
                </li>
                <li>
                  <strong>{t('privacy.section6.securityLogs')}</strong>
                </li>
              </ul>
            </div>

            <p className="text-gray-700">
              {t('privacy.section6.afterRetention')}
            </p>
          </section>

          <section id="derechos">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('privacy.section7.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('privacy.section7.description')}
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{t('privacy.section7.access.title')}</h4>
                <p className="text-sm text-gray-700">{t('privacy.section7.access.description')}</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{t('privacy.section7.rectification.title')}</h4>
                <p className="text-sm text-gray-700">{t('privacy.section7.rectification.description')}</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{t('privacy.section7.erasure.title')}</h4>
                <p className="text-sm text-gray-700">{t('privacy.section7.erasure.description')}</p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{t('privacy.section7.objection.title')}</h4>
                <p className="text-sm text-gray-700">{t('privacy.section7.objection.description')}</p>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{t('privacy.section7.restriction.title')}</h4>
                <p className="text-sm text-gray-700">{t('privacy.section7.restriction.description')}</p>
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{t('privacy.section7.portability.title')}</h4>
                <p className="text-sm text-gray-700">{t('privacy.section7.portability.description')}</p>
              </div>
            </div>

            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">{t('privacy.section7.howToExercise.title')}</h4>
              <p className="text-gray-700 text-sm mb-2">
                {t('privacy.section7.howToExercise.description')}
              </p>
              <p className="text-gray-900 font-semibold">{LEGAL_CONTACT.email}</p>
              <p className="text-gray-600 text-sm mt-2">
                {t('privacy.section7.howToExercise.instructions')}
              </p>
            </div>

            <p className="text-gray-700 text-sm">
              {t('privacy.section7.aepd')}{' '}
              <a
                href="https://www.aepd.es"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-semibold"
              >
                (AEPD)
              </a>.
            </p>
          </section>

          <section id="seguridad">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('privacy.section8.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('privacy.section8.description')}
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{t('privacy.section8.encryption.title')}</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• {t('privacy.section8.encryption.item1')}</li>
                  <li>• {t('privacy.section8.encryption.item2')}</li>
                  <li>• {t('privacy.section8.encryption.item3')}</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{t('privacy.section8.authentication.title')}</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• {t('privacy.section8.authentication.item1')}</li>
                  <li>• {t('privacy.section8.authentication.item2')}</li>
                  <li>• {t('privacy.section8.authentication.item3')}</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{t('privacy.section8.accessControl.title')}</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• {t('privacy.section8.accessControl.item1')}</li>
                  <li>• {t('privacy.section8.accessControl.item2')}</li>
                  <li>• {t('privacy.section8.accessControl.item3')}</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{t('privacy.section8.monitoring.title')}</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• {t('privacy.section8.monitoring.item1')}</li>
                  <li>• {t('privacy.section8.monitoring.item2')}</li>
                  <li>• {t('privacy.section8.monitoring.item3')}</li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <p className="text-sm text-gray-700">
                <strong>{t('privacy.section8.important')}</strong>
              </p>
            </div>
          </section>

          <section id="cookies">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('privacy.section9.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('privacy.section9.description')}{' '}
              <Link href="/legal/cookies" className="text-blue-600 hover:underline font-semibold">
                {t('links.cookiesPolicy')}
              </Link>.
            </p>
            <p className="text-gray-700">
              {t('privacy.section9.manage')}
            </p>
          </section>

          <section id="transferencias">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('privacy.section10.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('privacy.section10.description')}
            </p>
            <p className="text-gray-700 mb-4">
              {t('privacy.section10.someProviders')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>{t('privacy.section10.adequacy')}</li>
              <li>{t('privacy.section10.scc')}</li>
              <li>{t('privacy.section10.dpf')}</li>
            </ul>
          </section>

          <section id="menores">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('privacy.section11.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('privacy.section11.description')}
            </p>
            <p className="text-gray-700">
              {t('privacy.section11.contact')} {LEGAL_CONTACT.email}.
            </p>
          </section>

          <section id="cambios">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('privacy.section12.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('privacy.section12.description')}
            </p>
            <p className="text-gray-700">
              {t('privacy.section12.notification')}
            </p>
          </section>

          <section id="contacto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('privacy.section13.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('privacy.section13.description')}
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 mb-2"><strong>{t('privacy.section13.responsible')}:</strong> {LEGAL_CONTACT.companyName}</p>
              <p className="text-gray-700 mb-2"><strong>{t('privacy.section13.privacyEmail')}:</strong> {LEGAL_CONTACT.email}</p>
              <p className="text-gray-700 mb-2"><strong>{t('privacy.section13.supportEmail')}:</strong> {LEGAL_CONTACT.email}</p>
              <p className="text-gray-700"><strong>{t('privacy.section13.address')}:</strong> {LEGAL_CONTACT.address}</p>
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
            <Link href="/legal/cookies" className="text-blue-600 hover:underline text-sm">
              {t('links.cookiesPolicy')}
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
            {t('common.backToHome')}
          </Link>
        </div>
      </div>
    </div>
  )
}
