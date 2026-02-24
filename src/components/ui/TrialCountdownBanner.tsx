'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Clock, Sparkles, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface TrialStatus {
  isActive: boolean
  startedAt: Date | null
  endsAt: Date | null
  daysRemaining: number
  hasExpired: boolean
}

interface TrialCountdownBannerProps {
  trialStatus: TrialStatus | null
  hasActiveSubscription?: boolean | null
}

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
}

export const TrialCountdownBanner: React.FC<TrialCountdownBannerProps> = ({
  trialStatus,
  hasActiveSubscription = false
}) => {
  const router = useRouter()
  const { t } = useTranslation('dashboard')
  const [isVisible, setIsVisible] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0
  })

  // Calcular tiempo restante en tiempo real
  useEffect(() => {
    const calculateTimeRemaining = () => {
      if (!trialStatus?.endsAt) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          total: 0
        }
      }

      const now = new Date().getTime()
      const end = new Date(trialStatus.endsAt).getTime()
      const difference = end - now

      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          total: 0
        }
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      return {
        days,
        hours,
        minutes,
        seconds,
        total: difference
      }
    }

    // Calcular inmediatamente
    setTimeRemaining(calculateTimeRemaining())

    // Actualizar cada segundo
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining())
    }, 1000)

    return () => clearInterval(interval)
  }, [trialStatus?.endsAt])

  // No mostrar mientras se está cargando el estado de suscripción
  if (hasActiveSubscription === null) {
    return null
  }

  // No mostrar si el usuario tiene suscripción activa
  if (hasActiveSubscription === true) {
    return null
  }

  if (!isVisible) {
    return null
  }

  // Si no hay trial o está expirado, mostrar mensaje genérico
  const isTrialActive = trialStatus && trialStatus.isActive && !trialStatus.hasExpired && timeRemaining.total > 0
  const daysRemaining = timeRemaining.days

  const handleViewPlans = () => {
    router.push('/account/plans')
  }

  const getMessage = () => {
    if (!isTrialActive) {
      return t('trial.countdown.activateSubscription')
    } else if (daysRemaining === 0) {
      return t('trial.countdown.lastDay')
    } else {
      return t('trial.countdown.daysLeft', { count: daysRemaining })
    }
  }

  const getDescription = () => {
    if (!isTrialActive) {
      return t('trial.countdown.choosePlan')
    } else if (daysRemaining <= 3) {
      return t('trial.countdown.aboutToEnd')
    } else {
      return t('trial.countdown.exploreFeatures')
    }
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-violet-50 via-purple-50 to-pink-50 rounded-2xl mb-3 shadow-sm border border-violet-100">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="relative px-6 py-4">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-3 right-3 text-violet-400 hover:text-violet-600 transition-colors"
          aria-label={t('trial.countdown.closeBanner')}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col md:flex-row md:items-center gap-4 pr-8">
          {/* Mensaje principal con icono */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              {isTrialActive ? (
                <Clock className="w-5 h-5 text-white" />
              ) : (
                <Sparkles className="w-5 h-5 text-white" />
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                {isTrialActive ? t('trial.countdown.evaluationPeriod') : t('trial.countdown.activatePlan')}
              </h3>
              {!isTrialActive && (
                <p className="text-xs text-gray-600 mt-0.5">
                  {t('trial.countdown.choosePlanShort')}
                </p>
              )}
            </div>
          </div>

          {/* Cuenta atrás destacada */}
          {isTrialActive && (
            <>
              <div className="hidden md:block h-10 w-px bg-violet-200"></div>

              <div className="flex items-center gap-2">
                <div className="text-center bg-white rounded-lg px-3 py-2 shadow-sm border border-violet-200 min-w-[60px]">
                  <div className="text-2xl font-bold text-violet-600 leading-none tabular-nums">
                    {timeRemaining.days}
                  </div>
                  <div className="text-[10px] font-medium text-gray-500 mt-1 uppercase">{t('trial.countdown.days')}</div>
                </div>

                <span className="text-xl text-violet-300 font-light">:</span>

                <div className="text-center bg-white rounded-lg px-3 py-2 shadow-sm border border-violet-200 min-w-[60px]">
                  <div className="text-2xl font-bold text-violet-600 leading-none tabular-nums">
                    {String(timeRemaining.hours).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] font-medium text-gray-500 mt-1 uppercase">{t('trial.countdown.hours')}</div>
                </div>

                <span className="text-xl text-violet-300 font-light">:</span>

                <div className="text-center bg-white rounded-lg px-3 py-2 shadow-sm border border-violet-200 min-w-[60px]">
                  <div className="text-2xl font-bold text-violet-600 leading-none tabular-nums">
                    {String(timeRemaining.minutes).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] font-medium text-gray-500 mt-1 uppercase">{t('trial.countdown.min')}</div>
                </div>

                <span className="text-xl text-violet-300 font-light">:</span>

                <div className="text-center bg-white rounded-lg px-3 py-2 shadow-sm border border-violet-200 min-w-[60px]">
                  <div className="text-2xl font-bold text-violet-600 leading-none tabular-nums">
                    {String(timeRemaining.seconds).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] font-medium text-gray-500 mt-1 uppercase">{t('trial.countdown.sec')}</div>
                </div>
              </div>
            </>
          )}

          {/* Separador */}
          {isTrialActive && <div className="hidden lg:block h-10 w-px bg-violet-200"></div>}

          {/* Beneficios rápidos */}
          <div className="hidden lg:flex items-center gap-6 flex-1">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400"></div>
              <span className="text-xs text-gray-600">{t('trial.countdown.unlimitedProperties')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400"></div>
              <span className="text-xs text-gray-600">{t('trial.countdown.prioritySupport')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400"></div>
              <span className="text-xs text-gray-600">{t('trial.countdown.noCommitment')}</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleViewPlans}
              className="inline-flex items-center justify-center px-5 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 transition-all shadow-sm whitespace-nowrap"
            >
              {t('trial.countdown.viewPlans')}
            </button>

            <Link
              href="/funcionalidades"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-violet-700 hover:bg-white/50 transition-colors whitespace-nowrap"
            >
              {t('trial.countdown.moreInfo')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
