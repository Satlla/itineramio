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
  ArrowLeft,
  QrCode,
  Globe,
  Bot,
  Bell,
  Sparkles,
  Users,
  FileText,
  Download,
  ShieldCheck,
  TrendingUp,
  Zap
} from 'lucide-react'
import { useAllModulesAccess } from '@/hooks/useModuleAccess'
import { MODULES } from '@/config/modules'

// ─── Features personalizadas con iconos ───
const MANUALES_FEATURES = [
  { icon: Sparkles, text: 'Creaci\u00f3n de manual con IA', highlight: true },
  { icon: Bot, text: 'Chatbot inteligente 24/7', highlight: true },
  { icon: Globe, text: 'Traducciones autom\u00e1ticas', highlight: false },
  { icon: QrCode, text: 'C\u00f3digos QR por zona', highlight: false },
  { icon: Bell, text: 'Avisos push para hu\u00e9spedes', highlight: false },
  { icon: TrendingUp, text: 'Anal\u00edticas de uso en tiempo real', highlight: false },
]

const GESTION_FEATURES = [
  { icon: Download, text: 'Importa de Airbnb, Booking y Excel', highlight: true },
  { icon: FileText, text: 'Liquidaciones mensuales autom\u00e1ticas', highlight: true },
  { icon: Receipt, text: 'Facturaci\u00f3n profesional', badge: 'Verifactu pronto', highlight: false },
  { icon: Users, text: 'Gesti\u00f3n de propietarios', highlight: false },
  { icon: ShieldCheck, text: 'Conforme a normativa fiscal', highlight: false },
  { icon: TrendingUp, text: 'Informes de rentabilidad', highlight: false },
]

export default function ModulesPage() {
  const router = useRouter()
  const { t } = useTranslation('account')
  const { manuales, gestion, isLoading } = useAllModulesAccess()

  const getStatusBadge = (access: typeof manuales | typeof gestion) => {
    if (!access) return null

    if (access.hasAccess && access.isTrialActive) {
      const trialEnd = access.trialEndsAt ? new Date(access.trialEndsAt) : null
      const daysLeft = trialEnd ? Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-sm">
          <Clock className="w-3 h-3" />
          {t('modules.trialDays', { count: daysLeft })}
        </span>
      )
    }

    if (access.hasAccess) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-sm">
          <Check className="w-3 h-3" />
          {t('modules.active')}
        </span>
      )
    }

    if (access.expiresAt && new Date(access.expiresAt) < new Date()) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30 backdrop-blur-sm">
          <AlertTriangle className="w-3 h-3" />
          {t('modules.expired')}
        </span>
      )
    }

    return null
  }

  return (
    <div
      className="min-h-screen bg-gray-950 relative overflow-hidden"
      style={{ paddingTop: 'calc(4rem + env(safe-area-inset-top, 0px))' }}
    >
      {/* ─── Background effects ─── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute -bottom-32 right-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[160px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-violet-600/[0.03] rounded-full blur-[200px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900/80 via-gray-950 to-gray-950" />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* Back button */}
      <div className="relative z-10 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-medium">{t('modules.back')}</span>
          </button>
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        {/* ─── Header ─── */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-gray-400 text-xs font-medium mb-6">
            <Zap className="w-3.5 h-3.5 text-violet-400" />
            Potencia tu negocio de alquiler vacacional
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-b from-white via-white to-gray-500 bg-clip-text text-transparent mb-5 leading-tight">
            {t('modules.title')}
          </h1>
          <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            {t('modules.subtitle')}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-[3px] border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 items-stretch">

            {/* ═══════════════ Manuales Card ═══════════════ */}
            <div className="group relative rounded-3xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/[0.08] backdrop-blur-xl transition-all duration-500 hover:border-violet-500/40 hover:bg-white/[0.06] hover:-translate-y-1.5 hover:shadow-[0_0_60px_-12px_rgba(139,92,246,0.35)] flex flex-col">

              {/* Floating tag */}
              {manuales?.hasAccess && !manuales.isTrialActive ? (
                <div className="absolute top-5 right-5 z-10">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-violet-500/15 text-violet-300 border border-violet-500/30 backdrop-blur-sm">
                    Incluido en plan
                  </span>
                </div>
              ) : !manuales?.hasAccess && (
                <div className="absolute top-5 right-5 z-10">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-violet-500/20 text-violet-300 border border-violet-500/40 backdrop-blur-sm">
                    Popular
                  </span>
                </div>
              )}

              {/* Top gradient line */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

              <div className="p-6 md:p-8 flex flex-col flex-1">
                {/* Icon with glow */}
                <div className="relative w-16 h-16 mb-6">
                  <div className="absolute inset-0 bg-violet-500/25 rounded-2xl blur-xl scale-150 group-hover:bg-violet-500/40 transition-all duration-500" />
                  <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-violet-600/10 border border-violet-500/25 flex items-center justify-center group-hover:border-violet-400/50 transition-all duration-500">
                    <BookOpen className="w-8 h-8 text-violet-400 group-hover:text-violet-300 transition-colors" />
                  </div>
                </div>

                {/* Title + subtitle */}
                <h2 className="text-2xl md:text-[1.7rem] font-bold text-white mb-1.5">{MODULES.MANUALES.name}</h2>
                <p className="text-sm text-violet-400/70 font-medium mb-4">{MODULES.MANUALES.shortDescription}</p>

                {/* Description */}
                <p className="text-sm text-gray-400 leading-relaxed mb-7">
                  Crea gu&iacute;as interactivas con inteligencia artificial. Tus hu&eacute;spedes tendr&aacute;n todo lo que necesitan antes, durante y despu&eacute;s de su estancia.
                </p>

                {/* Features grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 flex-1">
                  {MANUALES_FEATURES.map((feature, i) => {
                    const Icon = feature.icon
                    return (
                      <div key={i} className="flex items-center gap-2.5 group/feat">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                          feature.highlight
                            ? 'bg-violet-500/15 border border-violet-500/25'
                            : 'bg-white/[0.04] border border-white/[0.06]'
                        }`}>
                          <Icon className={`w-4 h-4 ${feature.highlight ? 'text-violet-400' : 'text-gray-400'}`} />
                        </div>
                        <span className={`text-sm ${feature.highlight ? 'text-gray-200 font-medium' : 'text-gray-400'}`}>
                          {feature.text}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Bottom section - pushed to end */}
                <div className="mt-auto">
                  {/* Separator */}
                  <div className="h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent mb-6" />

                  {/* Status badge */}
                  {getStatusBadge(manuales) && (
                    <div className="flex items-center justify-center mb-5">
                      {getStatusBadge(manuales)}
                    </div>
                  )}

                  {/* CTA */}
                  <button
                    onClick={() => router.push(manuales?.hasAccess ? '/main' : '/account/plans')}
                    className="w-full relative overflow-hidden flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-white transition-all duration-300 bg-gradient-to-r from-violet-600 via-violet-500 to-purple-500 hover:shadow-[0_0_32px_-4px_rgba(139,92,246,0.6)] hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-violet-400 via-purple-400 to-violet-400 opacity-0 hover:opacity-100 transition-opacity duration-500" />
                    <span className="relative flex items-center gap-2">
                      {manuales?.hasAccess ? t('modules.goToManuales') : t('modules.viewPlans')}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* ═══════════════ Gesti&oacute;n Card ═══════════════ */}
            <div className="group relative rounded-3xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/[0.08] backdrop-blur-xl transition-all duration-500 hover:border-emerald-500/40 hover:bg-white/[0.06] hover:-translate-y-1.5 hover:shadow-[0_0_60px_-12px_rgba(16,185,129,0.35)] flex flex-col">

              {/* Floating tag */}
              {gestion?.hasAccess && !gestion.isTrialActive ? (
                <div className="absolute top-5 right-5 z-10">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 backdrop-blur-sm">
                    Activo
                  </span>
                </div>
              ) : !gestion?.hasAccess && (
                <div className="absolute top-5 right-5 z-10">
                  <span className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-sm animate-pulse">
                    14 d&iacute;as gratis
                  </span>
                </div>
              )}

              {/* Top gradient line */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

              <div className="p-6 md:p-8 flex flex-col flex-1">
                {/* Icon with glow */}
                <div className="relative w-16 h-16 mb-6">
                  <div className="absolute inset-0 bg-emerald-500/25 rounded-2xl blur-xl scale-150 group-hover:bg-emerald-500/40 transition-all duration-500" />
                  <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/25 flex items-center justify-center group-hover:border-emerald-400/50 transition-all duration-500">
                    <Receipt className="w-8 h-8 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                  </div>
                </div>

                {/* Title + subtitle */}
                <h2 className="text-2xl md:text-[1.7rem] font-bold text-white mb-1.5">{MODULES.GESTION.name}</h2>
                <p className="text-sm text-emerald-400/70 font-medium mb-4">{MODULES.GESTION.shortDescription}</p>

                {/* Description */}
                <p className="text-sm text-gray-400 leading-relaxed mb-7">
                  Automatiza la gesti&oacute;n econ&oacute;mica de tus alojamientos. Importa reservas, genera liquidaciones y factura a tus propietarios en minutos.
                </p>

                {/* Features grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 flex-1">
                  {GESTION_FEATURES.map((feature, i) => {
                    const Icon = feature.icon
                    return (
                      <div key={i} className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                          feature.highlight
                            ? 'bg-emerald-500/15 border border-emerald-500/25'
                            : 'bg-white/[0.04] border border-white/[0.06]'
                        }`}>
                          <Icon className={`w-4 h-4 ${feature.highlight ? 'text-emerald-400' : 'text-gray-400'}`} />
                        </div>
                        <span className={`text-sm ${feature.highlight ? 'text-gray-200 font-medium' : 'text-gray-400'}`}>
                          {feature.text}
                        </span>
                        {'badge' in feature && feature.badge && (
                          <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20 whitespace-nowrap">
                            {feature.badge}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Bottom section - pushed to end */}
                <div className="mt-auto">
                  {/* Separator */}
                  <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent mb-6" />

                  {/* Price */}
                  <div className="text-center mb-5">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-extrabold bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-300 bg-clip-text text-transparent">
                        {MODULES.GESTION.basePriceMonthly}&euro;
                      </span>
                      <span className="text-gray-500 text-sm font-medium">{t('modules.perMonth')}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">por propiedad &middot; sin permanencia</p>
                  </div>

                  {/* Status badge */}
                  {getStatusBadge(gestion) && (
                    <div className="flex items-center justify-center mb-5">
                      {getStatusBadge(gestion)}
                    </div>
                  )}

                  {/* CTA */}
                  <button
                    onClick={() => router.push(gestion?.hasAccess ? '/gestion' : '/account/modules/gestion')}
                    className="w-full relative overflow-hidden flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-white transition-all duration-300 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:shadow-[0_0_32px_-4px_rgba(16,185,129,0.6)] hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 opacity-0 hover:opacity-100 transition-opacity duration-500" />
                    <span className="relative flex items-center gap-2">
                      {gestion?.hasAccess ? t('modules.goToGestion') : t('modules.activateGestion')}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
