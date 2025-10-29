'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Clock, X, Sparkles } from 'lucide-react'

interface TrialStatus {
  isActive: boolean
  startedAt: Date | null
  endsAt: Date | null
  daysRemaining: number
  hasExpired: boolean
}

interface TrialTopBarProps {
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

export const TrialTopBar: React.FC<TrialTopBarProps> = ({
  trialStatus,
  hasActiveSubscription = false
}) => {
  const router = useRouter()
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
      return 'Activa tu suscripción'
    } else if (daysRemaining === 0) {
      return 'Último día de prueba'
    } else if (daysRemaining === 1) {
      return '1 día de prueba'
    } else {
      return `${daysRemaining} días de prueba`
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-[#24292f] border-b border-gray-800 text-white h-[48px]">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-center sm:justify-between h-full gap-4">
          {/* Left side - Message and countdown */}
          <div className="flex items-center gap-4">
            {isTrialActive ? (
              <>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">
                    Período de evaluación
                  </span>
                </div>

                {/* Inline countdown */}
                <div className="hidden sm:flex items-center gap-1.5 text-sm">
                  <span className="font-semibold tabular-nums">{timeRemaining.days}d</span>
                  <span className="text-gray-400">:</span>
                  <span className="font-semibold tabular-nums">{String(timeRemaining.hours).padStart(2, '0')}h</span>
                  <span className="text-gray-400">:</span>
                  <span className="font-semibold tabular-nums">{String(timeRemaining.minutes).padStart(2, '0')}m</span>
                  <span className="text-gray-400">:</span>
                  <span className="font-semibold tabular-nums">{String(timeRemaining.seconds).padStart(2, '0')}s</span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium">
                  Activa tu plan para continuar
                </span>
              </div>
            )}
          </div>

          {/* Right side - CTA and close */}
          <div className="flex items-center gap-2">
            <Link
              href="/funcionalidades"
              className="text-xs sm:text-sm font-medium px-3 py-1 text-gray-300 hover:text-white transition-colors whitespace-nowrap hidden sm:block"
            >
              Ver funcionalidades
            </Link>

            <button
              onClick={handleViewPlans}
              className="text-xs sm:text-sm font-medium px-3 py-1 bg-white text-gray-900 rounded-md hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              Ver planes →
            </button>

            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-white transition-colors hidden sm:block"
              aria-label="Cerrar barra"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
