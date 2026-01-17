'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { POLICY_VERSION, POLICY_LAST_UPDATE, LEGAL_CONTACT } from '@/config/policies'

export default function BillingPage() {
  const { t } = useTranslation('legal')

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{t('billing.title')}</h1>
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
            <li>• {t('billing.summary.item1')}</li>
            <li>• {t('billing.summary.item2')}</li>
            <li>• {t('billing.summary.item3')}</li>
            <li>• {t('billing.summary.item4')}</li>
            <li>• {t('billing.summary.item5')}</li>
          </ul>
        </div>

        {/* Table of Contents */}
        <nav className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('common.tableOfContents')}</h2>
          <ul className="space-y-2">
            <li><a href="#periodo-prueba" className="text-blue-600 hover:underline">{t('billing.toc.trialPeriod')}</a></li>
            <li><a href="#planes" className="text-blue-600 hover:underline">{t('billing.toc.plans')}</a></li>
            <li><a href="#facturacion" className="text-blue-600 hover:underline">{t('billing.toc.billing')}</a></li>
            <li><a href="#metodos-pago" className="text-blue-600 hover:underline">{t('billing.toc.paymentMethods')}</a></li>
            <li><a href="#renovacion" className="text-blue-600 hover:underline">{t('billing.toc.renewal')}</a></li>
            <li><a href="#cambios-plan" className="text-blue-600 hover:underline">{t('billing.toc.planChanges')}</a></li>
            <li><a href="#cancelacion" className="text-blue-600 hover:underline">{t('billing.toc.cancellation')}</a></li>
            <li><a href="#reembolsos" className="text-blue-600 hover:underline">{t('billing.toc.refunds')}</a></li>
            <li><a href="#impuestos" className="text-blue-600 hover:underline">{t('billing.toc.taxes')}</a></li>
            <li><a href="#fallos-pago" className="text-blue-600 hover:underline">{t('billing.toc.paymentFailures')}</a></li>
            <li><a href="#cambios-precios" className="text-blue-600 hover:underline">{t('billing.toc.priceChanges')}</a></li>
            <li><a href="#contacto" className="text-blue-600 hover:underline">{t('billing.toc.contact')}</a></li>
          </ul>
        </nav>

        {/* Content Sections */}
        <div className="prose prose-blue max-w-none space-y-8">

          <section id="periodo-prueba">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('billing.section1.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('billing.section1.description')}
            </p>

            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">{t('billing.section1.features.title')}</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm">
                <li>{t('billing.section1.features.item1')}</li>
                <li>{t('billing.section1.features.item2')}</li>
                <li>{t('billing.section1.features.item3')}</li>
                <li>{t('billing.section1.features.item4')}</li>
                <li>{t('billing.section1.features.item5')}</li>
              </ul>
            </div>

            <p className="text-gray-700 text-sm">
              <strong>{t('billing.section1.important')}</strong>
            </p>
          </section>

          <section id="planes">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('billing.section2.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('billing.section2.description')}
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{t('billing.section2.basic.name')}</h3>
                  <span className="text-2xl font-bold text-blue-600">{t('billing.section2.basic.price')}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{t('billing.section2.basic.properties')}</p>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>✓ {t('billing.section2.basic.feature1')}</li>
                  <li>✓ {t('billing.section2.basic.feature2')}</li>
                  <li>✓ {t('billing.section2.basic.feature3')}</li>
                  <li>✓ {t('billing.section2.basic.feature4')}</li>
                </ul>
              </div>

              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{t('billing.section2.host.name')}</h3>
                  <span className="text-2xl font-bold text-blue-600">{t('billing.section2.host.price')}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{t('billing.section2.host.properties')}</p>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>✓ {t('billing.section2.host.feature1')}</li>
                  <li>✓ {t('billing.section2.host.feature2')}</li>
                  <li>✓ {t('billing.section2.host.feature3')}</li>
                  <li>✓ {t('billing.section2.host.feature4')}</li>
                </ul>
              </div>

              <div className="border border-purple-200 rounded-lg p-4 bg-purple-50 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{t('billing.section2.superhost.name')}</h3>
                  <span className="text-2xl font-bold text-purple-600">{t('billing.section2.superhost.price')}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{t('billing.section2.superhost.properties')}</p>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>✓ {t('billing.section2.superhost.feature1')}</li>
                  <li>✓ {t('billing.section2.superhost.feature2')}</li>
                  <li>✓ {t('billing.section2.superhost.feature3')}</li>
                  <li>✓ {t('billing.section2.superhost.feature4')}</li>
                </ul>
              </div>

              <div className="border border-indigo-200 rounded-lg p-4 bg-indigo-50 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{t('billing.section2.business.name')}</h3>
                  <span className="text-2xl font-bold text-indigo-600">{t('billing.section2.business.price')}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{t('billing.section2.business.properties')}</p>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>✓ {t('billing.section2.business.feature1')}</li>
                  <li>✓ {t('billing.section2.business.feature2')}</li>
                  <li>✓ {t('billing.section2.business.feature3')}</li>
                  <li>✓ {t('billing.section2.business.feature4')}</li>
                </ul>
              </div>
            </div>

            <p className="text-sm text-gray-600 italic">
              {t('billing.section2.note')}
            </p>
          </section>

          <section id="facturacion">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('billing.section3.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('billing.section3.description')}
            </p>

            <div className="space-y-4 mb-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">{t('billing.section3.monthly.title')}</h3>
                <p className="text-sm text-gray-700">
                  {t('billing.section3.monthly.description')}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">{t('billing.section3.semiannual.title')}</h3>
                <p className="text-sm text-gray-700 mb-2">
                  {t('billing.section3.semiannual.description')}
                </p>
                <p className="text-xs text-gray-600">
                  {t('billing.section3.semiannual.example')}
                </p>
              </div>
            </div>

            <p className="text-gray-700 text-sm">
              {t('billing.section3.advance')}
            </p>
          </section>

          <section id="metodos-pago">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('billing.section4.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('billing.section4.description')}
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="border border-gray-200 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">{t('billing.section4.cards.title')}</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• {t('billing.section4.cards.visa')}</li>
                  <li>• {t('billing.section4.cards.mastercard')}</li>
                  <li>• {t('billing.section4.cards.amex')}</li>
                  <li>• {t('billing.section4.cards.discover')}</li>
                </ul>
              </div>

              <div className="border border-gray-200 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">{t('billing.section4.other.title')}</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• {t('billing.section4.other.sepa')}</li>
                  <li>• {t('billing.section4.other.bizum')}</li>
                  <li>• {t('billing.section4.other.transfer')}</li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <p className="text-sm text-gray-700">
                {t('billing.section4.security')}
              </p>
            </div>
          </section>

          <section id="renovacion">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('billing.section5.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('billing.section5.description')}
            </p>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">{t('billing.section5.howItWorks.title')}</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>1. <strong>{t('billing.section5.howItWorks.step1')}</strong></li>
                <li>2. <strong>{t('billing.section5.howItWorks.step2')}</strong></li>
                <li>3. <strong>{t('billing.section5.howItWorks.step3')}</strong></li>
                <li>4. <strong>{t('billing.section5.howItWorks.step4')}</strong></li>
              </ul>
            </div>

            <p className="text-gray-700">
              {t('billing.section5.disable')}
            </p>
          </section>

          <section id="cambios-plan">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('billing.section6.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('billing.section6.description')}
            </p>

            <div className="space-y-4 mb-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">{t('billing.section6.upgrade.title')}</h3>
                <p className="text-sm text-gray-700 mb-2">
                  {t('billing.section6.upgrade.description')}
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• {t('billing.section6.upgrade.item1')}</li>
                  <li>• {t('billing.section6.upgrade.item2')}</li>
                  <li>• {t('billing.section6.upgrade.item3')}</li>
                  <li>• {t('billing.section6.upgrade.item4')}</li>
                </ul>
                <p className="text-xs text-gray-600 mt-2">
                  {t('billing.section6.upgrade.example')}
                </p>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">{t('billing.section6.downgrade.title')}</h3>
                <p className="text-sm text-gray-700 mb-2">
                  {t('billing.section6.downgrade.description')}
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• {t('billing.section6.downgrade.item1')}</li>
                  <li>• {t('billing.section6.downgrade.item2')}</li>
                  <li>• {t('billing.section6.downgrade.item3')}</li>
                  <li>• {t('billing.section6.downgrade.item4')}</li>
                </ul>
                <p className="text-xs text-gray-600 mt-2">
                  {t('billing.section6.downgrade.note')}
                </p>
              </div>
            </div>
          </section>

          <section id="cancelacion">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('billing.section7.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('billing.section7.description')}
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">{t('billing.section7.process.title')}</h3>
              <ol className="space-y-2 text-sm text-gray-700">
                <li>{t('billing.section7.process.step1')}</li>
                <li>{t('billing.section7.process.step2')}</li>
                <li>{t('billing.section7.process.step3')}</li>
                <li>{t('billing.section7.process.step4')}</li>
              </ol>
            </div>

            <div className="space-y-3 text-gray-700 text-sm">
              <p>
                <strong>{t('billing.section7.effects.title')}</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>{t('billing.section7.effects.item1')}</li>
                <li>{t('billing.section7.effects.item2')}</li>
                <li>{t('billing.section7.effects.item3')}</li>
                <li>{t('billing.section7.effects.item4')}</li>
                <li>{t('billing.section7.effects.item5')}</li>
              </ul>
            </div>

            <p className="text-gray-700 mt-4">
              {t('billing.section7.afterPeriod')}{' '}
              <Link href="/legal/privacy" className="text-blue-600 hover:underline">
                {t('links.privacyPolicy')}
              </Link>.
            </p>
          </section>

          <section id="reembolsos">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('billing.section8.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('billing.section8.description')}
            </p>

            <div className="space-y-3 mb-4">
              <div className="border-l-4 border-green-500 bg-green-50 p-4">
                <h3 className="font-semibold text-gray-900 mb-2">✓ {t('billing.section8.duplicateCharges.title')}</h3>
                <p className="text-sm text-gray-700">
                  {t('billing.section8.duplicateCharges.description')}
                </p>
              </div>

              <div className="border-l-4 border-green-500 bg-green-50 p-4">
                <h3 className="font-semibold text-gray-900 mb-2">✓ {t('billing.section8.technicalError.title')}</h3>
                <p className="text-sm text-gray-700">
                  {t('billing.section8.technicalError.description')}
                </p>
              </div>

              <div className="border-l-4 border-green-500 bg-green-50 p-4">
                <h3 className="font-semibold text-gray-900 mb-2">✓ {t('billing.section8.serviceUnavailable.title')}</h3>
                <p className="text-sm text-gray-700">
                  {t('billing.section8.serviceUnavailable.description')}
                </p>
              </div>
            </div>

            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <h3 className="font-semibold text-gray-900 mb-2">✗ {t('billing.section8.noRefund.title')}</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• {t('billing.section8.noRefund.item1')}</li>
                <li>• {t('billing.section8.noRefund.item2')}</li>
                <li>• {t('billing.section8.noRefund.item3')}</li>
                <li>• {t('billing.section8.noRefund.item4')}</li>
              </ul>
            </div>

            <p className="text-gray-700 text-sm mt-4">
              {t('billing.section8.request', { email: LEGAL_CONTACT.email })}
            </p>
          </section>

          <section id="impuestos">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('billing.section9.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('billing.section9.description')}
            </p>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">{t('billing.section9.vat.title')}</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>
                  <strong>{t('billing.section9.vat.spain')}</strong>
                </li>
                <li>
                  <strong>{t('billing.section9.vat.euB2B')}</strong>
                </li>
                <li>
                  <strong>{t('billing.section9.vat.euB2C')}</strong>
                </li>
                <li>
                  <strong>{t('billing.section9.vat.nonEU')}</strong>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">{t('billing.section9.invoices.title')}</h3>
              <p className="text-sm text-gray-700 mb-2">
                {t('billing.section9.invoices.description')}
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• {t('billing.section9.invoices.item1')}</li>
                <li>• {t('billing.section9.invoices.item2')}</li>
                <li>• {t('billing.section9.invoices.item3')}</li>
                <li>• {t('billing.section9.invoices.item4')}</li>
                <li>• {t('billing.section9.invoices.item5')}</li>
              </ul>
            </div>

            <p className="text-gray-700 text-sm mt-4">
              {t('billing.section9.download')}
            </p>
          </section>

          <section id="fallos-pago">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('billing.section10.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('billing.section10.description')}
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">1</span>
                <div>
                  <h4 className="font-semibold text-gray-900">{t('billing.section10.step1.title')}</h4>
                  <p className="text-sm text-gray-700">
                    {t('billing.section10.step1.description')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">2</span>
                <div>
                  <h4 className="font-semibold text-gray-900">{t('billing.section10.step2.title')}</h4>
                  <p className="text-sm text-gray-700">
                    {t('billing.section10.step2.description')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">3</span>
                <div>
                  <h4 className="font-semibold text-gray-900">{t('billing.section10.step3.title')}</h4>
                  <p className="text-sm text-gray-700">
                    {t('billing.section10.step3.description')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">4</span>
                <div>
                  <h4 className="font-semibold text-gray-900">{t('billing.section10.step4.title')}</h4>
                  <p className="text-sm text-gray-700">
                    {t('billing.section10.step4.description')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">5</span>
                <div>
                  <h4 className="font-semibold text-gray-900">{t('billing.section10.step5.title')}</h4>
                  <p className="text-sm text-gray-700">
                    {t('billing.section10.step5.description')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-4">
              <p className="text-sm text-gray-700">
                <strong>{t('billing.section10.important')}</strong>
              </p>
            </div>
          </section>

          <section id="cambios-precios">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('billing.section11.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('billing.section11.description')}
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">{t('billing.section11.guarantees.title')}</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>
                  • <strong>{t('billing.section11.guarantees.item1')}</strong>
                </li>
                <li>
                  • <strong>{t('billing.section11.guarantees.item2')}</strong>
                </li>
                <li>
                  • <strong>{t('billing.section11.guarantees.item3')}</strong>
                </li>
                <li>
                  • <strong>{t('billing.section11.guarantees.item4')}</strong>
                </li>
              </ul>
            </div>

            <p className="text-gray-700">
              {t('billing.section11.acceptance')}
            </p>
          </section>

          <section id="contacto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('billing.section12.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('billing.section12.description')}
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 mb-2"><strong>{t('billing.section12.billingEmail')}:</strong> {LEGAL_CONTACT.email}</p>
              <p className="text-gray-700 mb-2"><strong>{t('billing.section12.generalEmail')}:</strong> {LEGAL_CONTACT.email}</p>
              <p className="text-gray-700"><strong>{t('billing.section12.hours')}</strong></p>
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
