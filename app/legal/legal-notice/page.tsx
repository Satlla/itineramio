'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { POLICY_VERSION, POLICY_LAST_UPDATE, LEGAL_CONTACT } from '@/config/policies'

export default function LegalNoticePage() {
  const { t } = useTranslation('legal')

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{t('legalNotice.title')}</h1>
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
            <li>• {t('legalNotice.summary.item1')}</li>
            <li>• {t('legalNotice.summary.item2', { companyName: LEGAL_CONTACT.companyName })}</li>
            <li>• {t('legalNotice.summary.item3')}</li>
            <li>• {t('legalNotice.summary.item4')}</li>
            <li>• {t('legalNotice.summary.item5', { email: LEGAL_CONTACT.email })}</li>
          </ul>
        </div>

        {/* Table of Contents */}
        <nav className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('common.tableOfContents')}</h2>
          <ul className="space-y-2">
            <li><a href="#datos-identificativos" className="text-blue-600 hover:underline">{t('legalNotice.toc.identification')}</a></li>
            <li><a href="#objeto" className="text-blue-600 hover:underline">{t('legalNotice.toc.object')}</a></li>
            <li><a href="#condiciones-acceso" className="text-blue-600 hover:underline">{t('legalNotice.toc.accessConditions')}</a></li>
            <li><a href="#propiedad-intelectual" className="text-blue-600 hover:underline">{t('legalNotice.toc.intellectualProperty')}</a></li>
            <li><a href="#proteccion-datos" className="text-blue-600 hover:underline">{t('legalNotice.toc.dataProtection')}</a></li>
            <li><a href="#exclusion-garantias" className="text-blue-600 hover:underline">{t('legalNotice.toc.disclaimer')}</a></li>
            <li><a href="#enlaces" className="text-blue-600 hover:underline">{t('legalNotice.toc.links')}</a></li>
            <li><a href="#modificaciones" className="text-blue-600 hover:underline">{t('legalNotice.toc.modifications')}</a></li>
            <li><a href="#legislacion" className="text-blue-600 hover:underline">{t('legalNotice.toc.legislation')}</a></li>
            <li><a href="#contacto" className="text-blue-600 hover:underline">{t('legalNotice.toc.contact')}</a></li>
          </ul>
        </nav>

        {/* Content Sections */}
        <div className="prose prose-blue max-w-none space-y-8">

          <section id="datos-identificativos">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('legalNotice.section1.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('legalNotice.section1.description')}
            </p>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-2 font-semibold text-gray-900 w-1/3">{t('legalNotice.section1.companyName')}:</td>
                    <td className="py-2 text-gray-700">{LEGAL_CONTACT.companyName}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-semibold text-gray-900">{t('legalNotice.section1.taxId')}:</td>
                    <td className="py-2 text-gray-700">{LEGAL_CONTACT.nif}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-semibold text-gray-900">{t('legalNotice.section1.address')}:</td>
                    <td className="py-2 text-gray-700">{LEGAL_CONTACT.fullAddress}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-semibold text-gray-900">{t('legalNotice.section1.email')}:</td>
                    <td className="py-2 text-gray-700">{LEGAL_CONTACT.email}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-semibold text-gray-900">{t('legalNotice.section1.website')}:</td>
                    <td className="py-2 text-gray-700">https://www.itineramio.com</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="objeto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('legalNotice.section2.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('legalNotice.section2.description', { companyName: LEGAL_CONTACT.companyName })}
            </p>

            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">{t('legalNotice.section2.purpose.title')}</h3>
              <p className="text-sm text-gray-700 mb-2">
                {t('legalNotice.section2.purpose.description')}
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• {t('legalNotice.section2.purpose.item1')}</li>
                <li>• {t('legalNotice.section2.purpose.item2')}</li>
                <li>• {t('legalNotice.section2.purpose.item3')}</li>
                <li>• {t('legalNotice.section2.purpose.item4')}</li>
                <li>• {t('legalNotice.section2.purpose.item5')}</li>
              </ul>
            </div>

            <p className="text-gray-700">
              {t('legalNotice.section2.acceptance')}
            </p>
          </section>

          <section id="condiciones-acceso">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('legalNotice.section3.title')}</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('legalNotice.section3.access.title')}</h3>
            <p className="text-gray-700 mb-4">
              {t('legalNotice.section3.access.p1')}
            </p>
            <p className="text-gray-700 mb-4">
              {t('legalNotice.section3.access.p2')}
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('legalNotice.section3.correctUse.title')}</h3>
            <p className="text-gray-700 mb-2">{t('legalNotice.section3.correctUse.description')}</p>

            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">{t('legalNotice.section3.correctUse.obligations')}</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li>{t('legalNotice.section3.correctUse.item1')}</li>
                <li>{t('legalNotice.section3.correctUse.item2')}</li>
                <li>{t('legalNotice.section3.correctUse.item3')}</li>
                <li>{t('legalNotice.section3.correctUse.item4')}</li>
                <li>{t('legalNotice.section3.correctUse.item5')}</li>
                <li>{t('legalNotice.section3.correctUse.item6')}</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('legalNotice.section3.responsibility.title')}</h3>
            <p className="text-gray-700">
              {t('legalNotice.section3.responsibility.description', { companyName: LEGAL_CONTACT.companyName })}
            </p>
          </section>

          <section id="propiedad-intelectual">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('legalNotice.section4.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('legalNotice.section4.description', { companyName: LEGAL_CONTACT.companyName })}
            </p>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">{t('legalNotice.section4.trademarks.title')}</h3>
              <p className="text-sm text-gray-700 mb-2">
                {t('legalNotice.section4.trademarks.description', { companyName: LEGAL_CONTACT.companyName })}
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">{t('legalNotice.section4.userContent.title')}</h3>
              <p className="text-sm text-gray-700">
                {t('legalNotice.section4.userContent.description', { companyName: LEGAL_CONTACT.companyName })}
              </p>
            </div>

            <p className="text-gray-700 text-sm">
              {t('legalNotice.section4.prohibition', { companyName: LEGAL_CONTACT.companyName })}
            </p>
          </section>

          <section id="proteccion-datos">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('legalNotice.section5.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('legalNotice.section5.description', { companyName: LEGAL_CONTACT.companyName })}
            </p>

            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">{t('legalNotice.section5.moreInfo.title')}</h3>
              <p className="text-sm text-gray-700 mb-2">
                {t('legalNotice.section5.moreInfo.description')}{' '}
                <Link href="/legal/privacy" className="text-blue-600 hover:underline font-semibold">
                  {t('links.privacyPolicy')}
                </Link>.
              </p>
              <p className="text-sm text-gray-700">
                {t('legalNotice.section5.moreInfo.contact')} {LEGAL_CONTACT.email}
              </p>
            </div>
          </section>

          <section id="exclusion-garantias">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('legalNotice.section6.title')}</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('legalNotice.section6.availability.title')}</h3>
            <p className="text-gray-700 mb-4">
              {t('legalNotice.section6.availability.description', { companyName: LEGAL_CONTACT.companyName })}
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('legalNotice.section6.accuracy.title')}</h3>
            <p className="text-gray-700 mb-4">
              {t('legalNotice.section6.accuracy.description', { companyName: LEGAL_CONTACT.companyName })}
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('legalNotice.section6.malware.title')}</h3>
            <p className="text-gray-700 mb-4">
              {t('legalNotice.section6.malware.description', { companyName: LEGAL_CONTACT.companyName })}
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('legalNotice.section6.usage.title')}</h3>
            <p className="text-gray-700">
              {t('legalNotice.section6.usage.description', { companyName: LEGAL_CONTACT.companyName })}
            </p>
          </section>

          <section id="enlaces">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('legalNotice.section7.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('legalNotice.section7.description', { companyName: LEGAL_CONTACT.companyName })}
            </p>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
              <p className="text-sm text-gray-700">
                <strong>{t('legalNotice.section7.important', { companyName: LEGAL_CONTACT.companyName })}</strong>
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('legalNotice.section7.linksToUs.title')}</h3>
            <p className="text-gray-700">
              {t('legalNotice.section7.linksToUs.description')}
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm mb-4">
              <li>{t('legalNotice.section7.linksToUs.item1')}</li>
              <li>{t('legalNotice.section7.linksToUs.item2')}</li>
              <li>{t('legalNotice.section7.linksToUs.item3')}</li>
              <li>{t('legalNotice.section7.linksToUs.item4', { companyName: LEGAL_CONTACT.companyName })}</li>
            </ul>
          </section>

          <section id="modificaciones">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('legalNotice.section8.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('legalNotice.section8.p1', { companyName: LEGAL_CONTACT.companyName })}
            </p>
            <p className="text-gray-700">
              {t('legalNotice.section8.p2', { companyName: LEGAL_CONTACT.companyName })}
            </p>
          </section>

          <section id="legislacion">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('legalNotice.section9.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('legalNotice.section9.p1')}
            </p>
            <p className="text-gray-700 mb-4">
              {t('legalNotice.section9.p2', { companyName: LEGAL_CONTACT.companyName })}
            </p>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">{t('legalNotice.section9.legalFramework.title')}</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• {t('legalNotice.section9.legalFramework.item1')}</li>
                <li>• {t('legalNotice.section9.legalFramework.item2')}</li>
                <li>• {t('legalNotice.section9.legalFramework.item3')}</li>
                <li>• {t('legalNotice.section9.legalFramework.item4')}</li>
                <li>• {t('legalNotice.section9.legalFramework.item5')}</li>
              </ul>
            </div>
          </section>

          <section id="contacto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('legalNotice.section10.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('legalNotice.section10.description')}
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 mb-2"><strong>{t('legalNotice.section10.company')}:</strong> {LEGAL_CONTACT.companyName}</p>
              <p className="text-gray-700 mb-2"><strong>{t('legalNotice.section10.legalEmail')}:</strong> {LEGAL_CONTACT.email}</p>
              <p className="text-gray-700 mb-2"><strong>{t('legalNotice.section10.generalEmail')}:</strong> {LEGAL_CONTACT.email}</p>
              <p className="text-gray-700"><strong>{t('legalNotice.section10.address')}:</strong> {LEGAL_CONTACT.fullAddress}</p>
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
            <Link href="/legal/cookies" className="text-blue-600 hover:underline text-sm">
              {t('links.cookiesPolicy')}
            </Link>
            <Link href="/legal/billing" className="text-blue-600 hover:underline text-sm">
              {t('links.billingTerms')}
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
