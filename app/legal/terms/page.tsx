'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { POLICY_VERSION, POLICY_LAST_UPDATE, LEGAL_CONTACT } from '@/config/policies'

export default function TermsPage() {
  const { t } = useTranslation('legal')

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{t('terms.title')}</h1>
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
            <li>• {t('terms.summary.item1')}</li>
            <li>• {t('terms.summary.item2')}</li>
            <li>• {t('terms.summary.item3')}</li>
            <li>• {t('terms.summary.item4')}</li>
            <li>• {t('terms.summary.item5')}</li>
          </ul>
        </div>

        {/* Table of Contents */}
        <nav className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('common.tableOfContents')}</h2>
          <ul className="space-y-2">
            <li><a href="#aceptacion" className="text-blue-600 hover:underline">{t('terms.toc.acceptance')}</a></li>
            <li><a href="#servicios" className="text-blue-600 hover:underline">{t('terms.toc.services')}</a></li>
            <li><a href="#registro" className="text-blue-600 hover:underline">{t('terms.toc.registration')}</a></li>
            <li><a href="#suscripciones" className="text-blue-600 hover:underline">{t('terms.toc.subscriptions')}</a></li>
            <li><a href="#uso-aceptable" className="text-blue-600 hover:underline">{t('terms.toc.acceptableUse')}</a></li>
            <li><a href="#propiedad-intelectual" className="text-blue-600 hover:underline">{t('terms.toc.intellectualProperty')}</a></li>
            <li><a href="#contenido-usuario" className="text-blue-600 hover:underline">{t('terms.toc.userContent')}</a></li>
            <li><a href="#privacidad" className="text-blue-600 hover:underline">{t('terms.toc.privacy')}</a></li>
            <li><a href="#limitacion-responsabilidad" className="text-blue-600 hover:underline">{t('terms.toc.liability')}</a></li>
            <li><a href="#modificaciones" className="text-blue-600 hover:underline">{t('terms.toc.modifications')}</a></li>
            <li><a href="#suspension" className="text-blue-600 hover:underline">{t('terms.toc.suspension')}</a></li>
            <li><a href="#ley-aplicable" className="text-blue-600 hover:underline">{t('terms.toc.applicableLaw')}</a></li>
            <li><a href="#contacto" className="text-blue-600 hover:underline">{t('terms.toc.contact')}</a></li>
          </ul>
        </nav>

        {/* Content Sections */}
        <div className="prose prose-blue max-w-none space-y-8">

          <section id="aceptacion">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.section1.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('terms.section1.p1')}
            </p>
            <p className="text-gray-700 mb-4">
              {t('terms.section1.p2')}
            </p>
            <p className="text-gray-700">
              {t('terms.section1.p3')}
            </p>
          </section>

          <section id="servicios">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.section2.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('terms.section2.description')}
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">{t('terms.section2.includes')}</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>{t('terms.section2.item1')}</li>
                <li>{t('terms.section2.item2')}</li>
                <li>{t('terms.section2.item3')}</li>
                <li>{t('terms.section2.item4')}</li>
                <li>{t('terms.section2.item5')}</li>
                <li>{t('terms.section2.item6')}</li>
                <li>{t('terms.section2.item7')}</li>
              </ul>
            </div>
            <p className="text-gray-700">
              {t('terms.section2.reserve')}
            </p>
          </section>

          <section id="registro">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.section3.title')}</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('terms.section3.requirements.title')}</h3>
            <p className="text-gray-700 mb-4">
              {t('terms.section3.requirements.description')}
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('terms.section3.responsibility.title')}</h3>
            <p className="text-gray-700 mb-4">
              {t('terms.section3.responsibility.description')}
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('terms.section3.verification.title')}</h3>
            <p className="text-gray-700">
              {t('terms.section3.verification.description')}
            </p>
          </section>

          <section id="suscripciones">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.section4.title')}</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('terms.section4.trial.title')}</h3>
            <p className="text-gray-700 mb-4">
              {t('terms.section4.trial.description')}
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('terms.section4.plans.title')}</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-gray-700 mb-3">{t('terms.section4.plans.description')}</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>{t('terms.section4.plans.basic')}</strong></li>
                <li><strong>{t('terms.section4.plans.host')}</strong></li>
                <li><strong>{t('terms.section4.plans.superhost')}</strong></li>
                <li><strong>{t('terms.section4.plans.business')}</strong></li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('terms.section4.billing.title')}</h3>
            <p className="text-gray-700 mb-4">
              {t('terms.section4.billing.description')}
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('terms.section4.refunds.title')}</h3>
            <p className="text-gray-700 mb-4">
              {t('terms.section4.refunds.description')}
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('terms.section4.planChanges.title')}</h3>
            <p className="text-gray-700">
              {t('terms.section4.planChanges.description')}
            </p>
          </section>

          <section id="uso-aceptable">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.section5.title')}</h2>
            <p className="text-gray-700 mb-4">{t('terms.section5.description')}</p>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>{t('terms.section5.item1')}</li>
                <li>{t('terms.section5.item2')}</li>
                <li>{t('terms.section5.item3')}</li>
                <li>{t('terms.section5.item4')}</li>
                <li>{t('terms.section5.item5')}</li>
                <li>{t('terms.section5.item6')}</li>
                <li>{t('terms.section5.item7')}</li>
                <li>{t('terms.section5.item8')}</li>
                <li>{t('terms.section5.item9')}</li>
              </ul>
            </div>
            <p className="text-gray-700">
              {t('terms.section5.violation')}
            </p>
          </section>

          <section id="propiedad-intelectual">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.section6.title')}</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('terms.section6.rights.title')}</h3>
            <p className="text-gray-700 mb-4">
              {t('terms.section6.rights.description', { companyName: LEGAL_CONTACT.companyName })}
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('terms.section6.license.title')}</h3>
            <p className="text-gray-700 mb-4">
              {t('terms.section6.license.description')}
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('terms.section6.restrictions.title')}</h3>
            <p className="text-gray-700">
              {t('terms.section6.restrictions.description')}
            </p>
          </section>

          <section id="contenido-usuario">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.section7.title')}</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('terms.section7.responsibility.title')}</h3>
            <p className="text-gray-700 mb-4">
              {t('terms.section7.responsibility.description')}
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('terms.section7.rights.title')}</h3>
            <p className="text-gray-700 mb-4">
              {t('terms.section7.rights.description')}
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('terms.section7.warranties.title')}</h3>
            <p className="text-gray-700 mb-4">
              {t('terms.section7.warranties.description')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>{t('terms.section7.warranties.item1')}</li>
              <li>{t('terms.section7.warranties.item2')}</li>
              <li>{t('terms.section7.warranties.item3')}</li>
              <li>{t('terms.section7.warranties.item4')}</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('terms.section7.removal.title')}</h3>
            <p className="text-gray-700">
              {t('terms.section7.removal.description')}
            </p>
          </section>

          <section id="privacidad">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.section8.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('terms.section8.description')}{' '}
              <Link href="/legal/privacy" className="text-blue-600 hover:underline font-semibold">
                {t('links.privacyPolicy')}
              </Link>.
            </p>
            <p className="text-gray-700">
              {t('terms.section8.consent')}
            </p>
          </section>

          <section id="limitacion-responsabilidad">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.section9.title')}</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('terms.section9.asIs.title')}</h3>
            <p className="text-gray-700 mb-4">
              {t('terms.section9.asIs.description')}
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('terms.section9.damages.title')}</h3>
            <p className="text-gray-700 mb-4">
              {t('terms.section9.damages.description', { companyName: LEGAL_CONTACT.companyName })}
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('terms.section9.maxLiability.title')}</h3>
            <p className="text-gray-700">
              {t('terms.section9.maxLiability.description')}
            </p>
          </section>

          <section id="modificaciones">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.section10.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('terms.section10.p1')}
            </p>
            <p className="text-gray-700 mb-4">
              {t('terms.section10.p2')}
            </p>
          </section>

          <section id="suspension">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.section11.title')}</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('terms.section11.violation.title')}</h3>
            <p className="text-gray-700 mb-4">
              {t('terms.section11.violation.description')}
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('terms.section11.userCancellation.title')}</h3>
            <p className="text-gray-700 mb-4">
              {t('terms.section11.userCancellation.description')}
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('terms.section11.effects.title')}</h3>
            <p className="text-gray-700">
              {t('terms.section11.effects.description')}
            </p>
          </section>

          <section id="ley-aplicable">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.section12.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('terms.section12.p1')}
            </p>
            <p className="text-gray-700">
              {t('terms.section12.p2')}
            </p>
          </section>

          <section id="contacto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.section13.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('terms.section13.description')}
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700"><strong>{t('terms.section13.email')}:</strong> {LEGAL_CONTACT.email}</p>
              <p className="text-gray-700"><strong>{t('terms.section13.support')}:</strong> {LEGAL_CONTACT.email}</p>
              <p className="text-gray-700"><strong>{t('terms.section13.address')}:</strong> {LEGAL_CONTACT.address}</p>
            </div>
          </section>

        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-4">{t('common.otherPolicies')}:</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/legal/privacy" className="text-blue-600 hover:underline text-sm">
              {t('links.privacyPolicy')}
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
