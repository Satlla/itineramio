'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import {
  BookOpen,
  Receipt,
  ArrowRight,
  Check,
  Clock,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react'
import { useAllModulesAccess } from '@/hooks/useModuleAccess'
import { MODULES } from '@/config/modules'

export default function ModulesPage() {
  const router = useRouter()
  const { t } = useTranslation('account')
  const { manuales, gestion, isLoading } = useAllModulesAccess()

  const getStatusBadge = (access: typeof manuales | typeof gestion, moduleCode: 'MANUALES' | 'GESTION') => {
    if (!access) return null

    if (access.hasAccess && access.isTrialActive) {
      const trialEnd = access.trialEndsAt ? new Date(access.trialEndsAt) : null
      const daysLeft = trialEnd ? Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          <Clock className="w-3 h-3" />
          {t('modules.trialDays', { count: daysLeft })}
        </span>
      )
    }

    if (access.hasAccess) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <Check className="w-3 h-3" />
          {t('modules.active')}
        </span>
      )
    }

    if (access.expiresAt && new Date(access.expiresAt) < new Date()) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertTriangle className="w-3 h-3" />
          {t('modules.expired')}
        </span>
      )
    }

    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" style={{ paddingTop: 'calc(4rem + env(safe-area-inset-top, 0px))' }}>
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-medium">{t('modules.back')}</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('modules.title')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('modules.subtitle')}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Manuales Card */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 hover:border-violet-300 transition-all overflow-hidden">
              <div className="bg-gradient-to-r from-violet-500 to-violet-600 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-7 h-7 text-white" />
                  </div>
                  {getStatusBadge(manuales, 'MANUALES')}
                </div>
                <h2 className="text-2xl font-bold mb-1">{MODULES.MANUALES.name}</h2>
                <p className="text-violet-100 text-sm">{MODULES.MANUALES.shortDescription}</p>
              </div>

              <div className="p-6">
                <p className="text-gray-600 text-sm mb-4">
                  {MODULES.MANUALES.description}
                </p>

                <ul className="space-y-2 mb-6">
                  {MODULES.MANUALES.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-violet-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => router.push(manuales?.hasAccess ? '/main' : '/account/plans')}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-colors"
                >
                  {manuales?.hasAccess ? t('modules.goToManuales') : t('modules.viewPlans')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Gestión Card */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 hover:border-emerald-300 transition-all overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    <Receipt className="w-7 h-7 text-white" />
                  </div>
                  {getStatusBadge(gestion, 'GESTION')}
                </div>
                <h2 className="text-2xl font-bold mb-1">{MODULES.GESTION.name}</h2>
                <p className="text-emerald-100 text-sm">{MODULES.GESTION.shortDescription}</p>
              </div>

              <div className="p-6">
                <p className="text-gray-600 text-sm mb-4">
                  {MODULES.GESTION.description}
                </p>

                <ul className="space-y-2 mb-6">
                  {MODULES.GESTION.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="text-center mb-4">
                  <span className="text-3xl font-bold text-gray-900">
                    {MODULES.GESTION.basePriceMonthly}€
                  </span>
                  <span className="text-gray-500">{t('modules.perMonth')}</span>
                </div>

                <button
                  onClick={() => router.push(gestion?.hasAccess ? '/gestion' : '/account/modules/gestion')}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors"
                >
                  {gestion?.hasAccess ? t('modules.goToGestion') : t('modules.activateGestion')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
