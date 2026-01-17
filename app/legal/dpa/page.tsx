'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { POLICY_VERSION, POLICY_LAST_UPDATE, LEGAL_CONTACT } from '@/config/policies'

export default function DPAPage() {
  const { t } = useTranslation('legal')

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{t('dpa.title')}</h1>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              {t('common.version')} {POLICY_VERSION}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            {t('common.lastUpdate')}: {POLICY_LAST_UPDATE}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {t('dpa.subtitle')}
          </p>
        </div>

        {/* Executive Summary */}
        <div className="mb-8 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">{t('common.executiveSummary')}</h2>
          <ul className="space-y-2 text-blue-800">
            <li>• {t('dpa.summary.item1')}</li>
            <li>• {t('dpa.summary.item2')}</li>
            <li>• {t('dpa.summary.item3')}</li>
            <li>• {t('dpa.summary.item4')}</li>
            <li>• {t('dpa.summary.item5')}</li>
          </ul>
        </div>

        {/* Table of Contents */}
        <nav className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('common.tableOfContents')}</h2>
          <ul className="space-y-2">
            <li><a href="#definiciones" className="text-blue-600 hover:underline">{t('dpa.toc.definitions')}</a></li>
            <li><a href="#objeto" className="text-blue-600 hover:underline">{t('dpa.toc.object')}</a></li>
            <li><a href="#alcance" className="text-blue-600 hover:underline">{t('dpa.toc.scope')}</a></li>
            <li><a href="#obligaciones-encargado" className="text-blue-600 hover:underline">{t('dpa.toc.processorObligations')}</a></li>
            <li><a href="#subencargados" className="text-blue-600 hover:underline">{t('dpa.toc.subprocessors')}</a></li>
            <li><a href="#medidas-seguridad" className="text-blue-600 hover:underline">{t('dpa.toc.security')}</a></li>
            <li><a href="#transferencias" className="text-blue-600 hover:underline">{t('dpa.toc.transfers')}</a></li>
            <li><a href="#derechos-interesados" className="text-blue-600 hover:underline">{t('dpa.toc.dataSubjectRights')}</a></li>
            <li><a href="#notificacion-brechas" className="text-blue-600 hover:underline">{t('dpa.toc.breachNotification')}</a></li>
            <li><a href="#auditorias" className="text-blue-600 hover:underline">{t('dpa.toc.audits')}</a></li>
            <li><a href="#duracion" className="text-blue-600 hover:underline">{t('dpa.toc.duration')}</a></li>
            <li><a href="#contacto" className="text-blue-600 hover:underline">{t('dpa.toc.contact')}</a></li>
          </ul>
        </nav>

        {/* Content Sections */}
        <div className="prose prose-blue max-w-none space-y-8">

          <section id="definiciones">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('dpa.section1.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('dpa.section1.description')}
            </p>

            <div className="bg-gray-50 p-4 rounded-lg">
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="font-semibold text-gray-900">{t('dpa.section1.controller.term')}</dt>
                  <dd className="text-gray-700 ml-4">
                    {t('dpa.section1.controller.definition')}
                  </dd>
                </div>

                <div>
                  <dt className="font-semibold text-gray-900">{t('dpa.section1.processor.term')}</dt>
                  <dd className="text-gray-700 ml-4">
                    {LEGAL_CONTACT.companyName}, {t('dpa.section1.processor.definition')}
                  </dd>
                </div>

                <div>
                  <dt className="font-semibold text-gray-900">{t('dpa.section1.personalData.term')}</dt>
                  <dd className="text-gray-700 ml-4">
                    {t('dpa.section1.personalData.definition')}
                  </dd>
                </div>

                <div>
                  <dt className="font-semibold text-gray-900">{t('dpa.section1.processing.term')}</dt>
                  <dd className="text-gray-700 ml-4">
                    {t('dpa.section1.processing.definition')}
                  </dd>
                </div>

                <div>
                  <dt className="font-semibold text-gray-900">{t('dpa.section1.gdpr.term')}</dt>
                  <dd className="text-gray-700 ml-4">
                    {t('dpa.section1.gdpr.definition')}
                  </dd>
                </div>

                <div>
                  <dt className="font-semibold text-gray-900">{t('dpa.section1.dataSubject.term')}</dt>
                  <dd className="text-gray-700 ml-4">
                    {t('dpa.section1.dataSubject.definition')}
                  </dd>
                </div>
              </dl>
            </div>
          </section>

          <section id="objeto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('dpa.section2.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('dpa.section2.description', { companyName: LEGAL_CONTACT.companyName })}
            </p>

            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">{t('dpa.section2.relationship.title')}</h3>
              <p className="text-sm text-gray-700">
                {t('dpa.section2.relationship.description')}
              </p>
              <ul className="text-sm text-gray-700 space-y-1 mt-2">
                <li>• {t('dpa.section2.relationship.item1')}{' '}
                  <Link href="/legal/terms" className="text-blue-600 hover:underline">
                    {t('links.termsAndConditions')}
                  </Link>
                </li>
                <li>• {t('dpa.section2.relationship.item2')}{' '}
                  <Link href="/legal/privacy" className="text-blue-600 hover:underline">
                    {t('links.privacyPolicy')}
                  </Link>
                </li>
                <li>• {t('dpa.section2.relationship.item3')}</li>
              </ul>
            </div>

            <p className="text-gray-700 text-sm">
              {t('dpa.section2.conflict')}
            </p>
          </section>

          <section id="alcance">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('dpa.section3.title')}</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('dpa.section3.purpose.title')}</h3>
            <p className="text-gray-700 mb-4">
              {t('dpa.section3.purpose.description')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>{t('dpa.section3.purpose.item1')}</li>
              <li>{t('dpa.section3.purpose.item2')}</li>
              <li>{t('dpa.section3.purpose.item3')}</li>
              <li>{t('dpa.section3.purpose.item4')}</li>
              <li>{t('dpa.section3.purpose.item5')}</li>
              <li>{t('dpa.section3.purpose.item6')}</li>
              <li>{t('dpa.section3.purpose.item7')}</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('dpa.section3.nature.title')}</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-700 mb-2"><strong>{t('dpa.section3.nature.operations')}</strong></p>
              <p className="text-sm text-gray-700">
                {t('dpa.section3.nature.description')}
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('dpa.section3.categories.title')}</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="border border-gray-200 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{t('dpa.section3.categories.clientData.title')}</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• {t('dpa.section3.categories.clientData.item1')}</li>
                  <li>• {t('dpa.section3.categories.clientData.item2')}</li>
                  <li>• {t('dpa.section3.categories.clientData.item3')}</li>
                  <li>• {t('dpa.section3.categories.clientData.item4')}</li>
                </ul>
              </div>

              <div className="border border-gray-200 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{t('dpa.section3.categories.guestData.title')}</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• {t('dpa.section3.categories.guestData.item1')}</li>
                  <li>• {t('dpa.section3.categories.guestData.item2')}</li>
                  <li>• {t('dpa.section3.categories.guestData.item3')}</li>
                  <li>• {t('dpa.section3.categories.guestData.item4')}</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('dpa.section3.subjects.title')}</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>{t('dpa.section3.subjects.item1')}</li>
              <li>{t('dpa.section3.subjects.item2')}</li>
              <li>{t('dpa.section3.subjects.item3')}</li>
            </ul>
          </section>

          <section id="obligaciones-encargado">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('dpa.section4.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('dpa.section4.description')}
            </p>

            <div className="space-y-3">
              <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <h4 className="font-semibold text-gray-900 mb-1">✓ {t('dpa.section4.instructions.title')}</h4>
                <p className="text-sm text-gray-700">
                  {t('dpa.section4.instructions.description')}
                </p>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <h4 className="font-semibold text-gray-900 mb-1">✓ {t('dpa.section4.confidentiality.title')}</h4>
                <p className="text-sm text-gray-700">
                  {t('dpa.section4.confidentiality.description')}
                </p>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <h4 className="font-semibold text-gray-900 mb-1">✓ {t('dpa.section4.security.title')}</h4>
                <p className="text-sm text-gray-700">
                  {t('dpa.section4.security.description')}
                </p>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <h4 className="font-semibold text-gray-900 mb-1">✓ {t('dpa.section4.assistance.title')}</h4>
                <p className="text-sm text-gray-700">
                  {t('dpa.section4.assistance.description')}
                </p>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <h4 className="font-semibold text-gray-900 mb-1">✓ {t('dpa.section4.dpia.title')}</h4>
                <p className="text-sm text-gray-700">
                  {t('dpa.section4.dpia.description')}
                </p>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <h4 className="font-semibold text-gray-900 mb-1">✓ {t('dpa.section4.deletion.title')}</h4>
                <p className="text-sm text-gray-700">
                  {t('dpa.section4.deletion.description')}
                </p>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <h4 className="font-semibold text-gray-900 mb-1">✓ {t('dpa.section4.audit.title')}</h4>
                <p className="text-sm text-gray-700">
                  {t('dpa.section4.audit.description')}
                </p>
              </div>
            </div>
          </section>

          <section id="subencargados">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('dpa.section5.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('dpa.section5.description')}
            </p>

            <div className="bg-gray-50 rounded-lg overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">{t('dpa.section5.table.subprocessor')}</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">{t('dpa.section5.table.service')}</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">{t('dpa.section5.table.location')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-3 px-4 text-gray-700 font-semibold">Supabase Inc.</td>
                    <td className="py-3 px-4 text-gray-700">{t('dpa.section5.supabase.service')}</td>
                    <td className="py-3 px-4 text-gray-700">{t('dpa.section5.supabase.location')}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-gray-700 font-semibold">Stripe Inc.</td>
                    <td className="py-3 px-4 text-gray-700">{t('dpa.section5.stripe.service')}</td>
                    <td className="py-3 px-4 text-gray-700">{t('dpa.section5.stripe.location')}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-gray-700 font-semibold">Resend Inc.</td>
                    <td className="py-3 px-4 text-gray-700">{t('dpa.section5.resend.service')}</td>
                    <td className="py-3 px-4 text-gray-700">{t('dpa.section5.resend.location')}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-gray-700 font-semibold">Vercel Inc.</td>
                    <td className="py-3 px-4 text-gray-700">{t('dpa.section5.vercel.service')}</td>
                    <td className="py-3 px-4 text-gray-700">{t('dpa.section5.vercel.location')}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-gray-700 font-semibold">Anthropic PBC</td>
                    <td className="py-3 px-4 text-gray-700">{t('dpa.section5.anthropic.service')}</td>
                    <td className="py-3 px-4 text-gray-700">{t('dpa.section5.anthropic.location')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">{t('dpa.section5.guarantees.title')}</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• {t('dpa.section5.guarantees.item1')}</li>
                <li>• {t('dpa.section5.guarantees.item2')}</li>
                <li>• {t('dpa.section5.guarantees.item3')}</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{t('dpa.section5.changes.title')}</h3>
              <p className="text-sm text-gray-700">
                {t('dpa.section5.changes.description')}
              </p>
            </div>
          </section>

          <section id="medidas-seguridad">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('dpa.section6.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('dpa.section6.description')}
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{t('dpa.section6.encryption.title')}</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• {t('dpa.section6.encryption.item1')}</li>
                  <li>• {t('dpa.section6.encryption.item2')}</li>
                  <li>• {t('dpa.section6.encryption.item3')}</li>
                  <li>• {t('dpa.section6.encryption.item4')}</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{t('dpa.section6.accessControl.title')}</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• {t('dpa.section6.accessControl.item1')}</li>
                  <li>• {t('dpa.section6.accessControl.item2')}</li>
                  <li>• {t('dpa.section6.accessControl.item3')}</li>
                  <li>• {t('dpa.section6.accessControl.item4')}</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{t('dpa.section6.monitoring.title')}</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• {t('dpa.section6.monitoring.item1')}</li>
                  <li>• {t('dpa.section6.monitoring.item2')}</li>
                  <li>• {t('dpa.section6.monitoring.item3')}</li>
                  <li>• {t('dpa.section6.monitoring.item4')}</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{t('dpa.section6.backup.title')}</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• {t('dpa.section6.backup.item1')}</li>
                  <li>• {t('dpa.section6.backup.item2')}</li>
                  <li>• {t('dpa.section6.backup.item3')}</li>
                  <li>• {t('dpa.section6.backup.item4')}</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{t('dpa.section6.training.title')}</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• {t('dpa.section6.training.item1')}</li>
                  <li>• {t('dpa.section6.training.item2')}</li>
                  <li>• {t('dpa.section6.training.item3')}</li>
                  <li>• {t('dpa.section6.training.item4')}</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{t('dpa.section6.infrastructure.title')}</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• {t('dpa.section6.infrastructure.item1')}</li>
                  <li>• {t('dpa.section6.infrastructure.item2')}</li>
                  <li>• {t('dpa.section6.infrastructure.item3')}</li>
                  <li>• {t('dpa.section6.infrastructure.item4')}</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>{t('dpa.section6.certifications')}</strong>
              </p>
            </div>
          </section>

          <section id="transferencias">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('dpa.section7.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('dpa.section7.description')}
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('dpa.section7.outsideEEA.title')}</h3>
            <p className="text-gray-700 mb-4">
              {t('dpa.section7.outsideEEA.description')}
            </p>

            <div className="space-y-3 mb-4">
              <div className="border-l-4 border-green-500 bg-green-50 p-4">
                <h4 className="font-semibold text-gray-900 mb-1">{t('dpa.section7.stripe.title')}</h4>
                <p className="text-sm text-gray-700 mb-1">
                  <strong>{t('dpa.section7.stripe.legalBasis')}</strong>
                </p>
                <p className="text-xs text-gray-600">
                  {t('dpa.section7.stripe.description')}
                </p>
              </div>

              <div className="border-l-4 border-green-500 bg-green-50 p-4">
                <h4 className="font-semibold text-gray-900 mb-1">{t('dpa.section7.resend.title')}</h4>
                <p className="text-sm text-gray-700 mb-1">
                  <strong>{t('dpa.section7.resend.legalBasis')}</strong>
                </p>
                <p className="text-xs text-gray-600">
                  {t('dpa.section7.resend.description')}
                </p>
              </div>

              <div className="border-l-4 border-green-500 bg-green-50 p-4">
                <h4 className="font-semibold text-gray-900 mb-1">{t('dpa.section7.anthropic.title')}</h4>
                <p className="text-sm text-gray-700 mb-1">
                  <strong>{t('dpa.section7.anthropic.legalBasis')}</strong>
                </p>
                <p className="text-xs text-gray-600">
                  {t('dpa.section7.anthropic.description')}
                </p>
              </div>
            </div>

            <p className="text-gray-700 text-sm">
              {t('dpa.section7.requestCopy')} {LEGAL_CONTACT.email}
            </p>
          </section>

          <section id="derechos-interesados">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('dpa.section8.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('dpa.section8.description')}
            </p>

            <div className="space-y-3">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{t('dpa.section8.procedure.title')}</h4>
                <ol className="text-sm text-gray-700 space-y-2">
                  <li>{t('dpa.section8.procedure.step1')}</li>
                  <li>{t('dpa.section8.procedure.step2')}</li>
                  <li>{t('dpa.section8.procedure.step3')}</li>
                </ol>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{t('dpa.section8.selfService.title')}</h4>
                <p className="text-sm text-gray-700 mb-2">
                  {t('dpa.section8.selfService.description')}
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• <strong>{t('dpa.section8.selfService.access')}</strong></li>
                  <li>• <strong>{t('dpa.section8.selfService.rectification')}</strong></li>
                  <li>• <strong>{t('dpa.section8.selfService.erasure')}</strong></li>
                  <li>• <strong>{t('dpa.section8.selfService.restriction')}</strong></li>
                </ul>
              </div>
            </div>
          </section>

          <section id="notificacion-brechas">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('dpa.section9.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('dpa.section9.description')}
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-semibold text-sm">{t('dpa.section9.notification.time')}</span>
                <div>
                  <h4 className="font-semibold text-gray-900">{t('dpa.section9.notification.title')}</h4>
                  <p className="text-sm text-gray-700">
                    {t('dpa.section9.notification.description')}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{t('dpa.section9.content.title')}</h4>
                <p className="text-sm text-gray-700 mb-2">{t('dpa.section9.content.description')}</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• {t('dpa.section9.content.item1')}</li>
                  <li>• {t('dpa.section9.content.item2')}</li>
                  <li>• {t('dpa.section9.content.item3')}</li>
                  <li>• {t('dpa.section9.content.item4')}</li>
                  <li>• {t('dpa.section9.content.item5')}</li>
                  <li>• {t('dpa.section9.content.item6')}</li>
                  <li>• {t('dpa.section9.content.item7')}</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{t('dpa.section9.cooperation.title')}</h4>
                <p className="text-sm text-gray-700">
                  {t('dpa.section9.cooperation.description')}
                </p>
              </div>
            </div>
          </section>

          <section id="auditorias">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('dpa.section10.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('dpa.section10.description')}
            </p>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{t('dpa.section10.documentary.title')}</h4>
                <p className="text-sm text-gray-700 mb-2">
                  {t('dpa.section10.documentary.description')}
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• {t('dpa.section10.documentary.item1')}</li>
                  <li>• {t('dpa.section10.documentary.item2')}</li>
                  <li>• {t('dpa.section10.documentary.item3')}</li>
                  <li>• {t('dpa.section10.documentary.item4')}</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{t('dpa.section10.onSite.title')}</h4>
                <p className="text-sm text-gray-700 mb-2">
                  {t('dpa.section10.onSite.description')}
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• {t('dpa.section10.onSite.item1')}</li>
                  <li>• {t('dpa.section10.onSite.item2')}</li>
                  <li>• {t('dpa.section10.onSite.item3')}</li>
                  <li>• {t('dpa.section10.onSite.item4')}</li>
                  <li>• {t('dpa.section10.onSite.item5')}</li>
                  <li>• {t('dpa.section10.onSite.item6')}</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                <h4 className="font-semibold text-gray-900 mb-1">{t('dpa.section10.facilities.title')}</h4>
                <p className="text-sm text-gray-700">
                  {t('dpa.section10.facilities.description')}
                </p>
              </div>
            </div>
          </section>

          <section id="duracion">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('dpa.section11.title')}</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('dpa.section11.duration.title')}</h3>
            <p className="text-gray-700 mb-4">
              {t('dpa.section11.duration.description')}
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('dpa.section11.termination.title')}</h3>
            <p className="text-gray-700 mb-4">
              {t('dpa.section11.termination.description')}
            </p>

            <div className="space-y-3 mb-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{t('dpa.section11.return.title')}</h4>
                <p className="text-sm text-gray-700">
                  {t('dpa.section11.return.description')}
                </p>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{t('dpa.section11.deletion.title')}</h4>
                <p className="text-sm text-gray-700 mb-2">
                  {t('dpa.section11.deletion.description')}
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• {t('dpa.section11.deletion.item1')}</li>
                  <li>• {t('dpa.section11.deletion.item2')}</li>
                  <li>• {t('dpa.section11.deletion.item3')}</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('dpa.section11.legalRetention.title')}</h3>
            <p className="text-gray-700">
              {t('dpa.section11.legalRetention.description')}
            </p>
          </section>

          <section id="contacto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('dpa.section12.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('dpa.section12.description')}
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 mb-2"><strong>{t('dpa.section12.processor')}:</strong> {LEGAL_CONTACT.companyName}</p>
              <p className="text-gray-700 mb-2"><strong>{t('dpa.section12.dpo')}:</strong> {LEGAL_CONTACT.email}</p>
              <p className="text-gray-700 mb-2"><strong>{t('dpa.section12.email')}:</strong> {LEGAL_CONTACT.email}</p>
              <p className="text-gray-700"><strong>{t('dpa.section12.address')}:</strong> {LEGAL_CONTACT.fullAddress}</p>
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
            <Link href="/legal/legal-notice" className="text-blue-600 hover:underline text-sm">
              {t('links.legalNotice')}
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
