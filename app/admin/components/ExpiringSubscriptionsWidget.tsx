'use client'

import { useState, useEffect } from 'react'
import {
  AlertTriangle,
  Clock,
  Phone,
  Mail,
  Calendar,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

interface ExpiringSubscription {
  id: string
  userId: string
  userName: string
  userEmail: string
  userPhone: string | null
  planName: string
  planCode: string | null
  endDate: string
  daysRemaining: number
  price: number
  cancelAtPeriodEnd?: boolean
  canceledAt?: string | null
  cancelReason?: string | null
}

interface ExpiringData {
  urgent: ExpiringSubscription[]
  warning: ExpiringSubscription[]
  upcoming: ExpiringSubscription[]
  total: number
}

export default function ExpiringSubscriptionsWidget() {
  const [data, setData] = useState<ExpiringData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedSection, setExpandedSection] = useState<'urgent' | 'warning' | 'upcoming' | null>('urgent')

  useEffect(() => {
    fetchExpiringSubscriptions()
  }, [])

  const fetchExpiringSubscriptions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/expiring-subscriptions', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setData(data)
      }
    } catch (error) {
      console.error('Error fetching expiring subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Cargando vencimientos...</span>
        </div>
      </div>
    )
  }

  if (!data || data.total === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-green-600" />
          Próximos Vencimientos
        </h3>
        <p className="text-gray-600 text-sm">
          ✅ No hay suscripciones por vencer en los próximos 30 días
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-between">
          <span className="flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-gray-700" />
            Próximos Vencimientos
          </span>
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
            {data.total} suscripciones
          </span>
        </h3>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 px-6 py-4 bg-gray-50">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{data.urgent.length}</div>
          <div className="text-xs text-gray-600">Urgente (&lt; 7 días)</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{data.warning.length}</div>
          <div className="text-xs text-gray-600">Atención (7-15 días)</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{data.upcoming.length}</div>
          <div className="text-xs text-gray-600">Próximos (15-30 días)</div>
        </div>
      </div>

      {/* Urgent - Expiran en < 7 días */}
      {data.urgent.length > 0 && (
        <div className="border-t border-gray-200">
          <button
            onClick={() => setExpandedSection(expandedSection === 'urgent' ? null : 'urgent')}
            className="w-full px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              <span className="font-medium text-gray-900">
                Urgente - {data.urgent.length} suscripciones
              </span>
            </div>
            {expandedSection === 'urgent' ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSection === 'urgent' && (
            <div className="px-6 pb-4 space-y-2">
              {data.urgent.map((subscription) => (
                <SubscriptionItem
                  key={subscription.id}
                  subscription={subscription}
                  urgencyColor="red"
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Warning - Expiran en 7-15 días */}
      {data.warning.length > 0 && (
        <div className="border-t border-gray-200">
          <button
            onClick={() => setExpandedSection(expandedSection === 'warning' ? null : 'warning')}
            className="w-full px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-orange-600 mr-2" />
              <span className="font-medium text-gray-900">
                Atención - {data.warning.length} suscripciones
              </span>
            </div>
            {expandedSection === 'warning' ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSection === 'warning' && (
            <div className="px-6 pb-4 space-y-2">
              {data.warning.map((subscription) => (
                <SubscriptionItem
                  key={subscription.id}
                  subscription={subscription}
                  urgencyColor="orange"
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upcoming - Expiran en 15-30 días */}
      {data.upcoming.length > 0 && (
        <div className="border-t border-gray-200">
          <button
            onClick={() => setExpandedSection(expandedSection === 'upcoming' ? null : 'upcoming')}
            className="w-full px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="font-medium text-gray-900">
                Próximos - {data.upcoming.length} suscripciones
              </span>
            </div>
            {expandedSection === 'upcoming' ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSection === 'upcoming' && (
            <div className="px-6 pb-4 space-y-2">
              {data.upcoming.map((subscription) => (
                <SubscriptionItem
                  key={subscription.id}
                  subscription={subscription}
                  urgencyColor="yellow"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SubscriptionItem({
  subscription,
  urgencyColor
}: {
  subscription: ExpiringSubscription
  urgencyColor: 'red' | 'orange' | 'yellow'
}) {
  const bgColors = {
    red: 'bg-red-50 border-red-200',
    orange: 'bg-orange-50 border-orange-200',
    yellow: 'bg-yellow-50 border-yellow-200'
  }

  const textColors = {
    red: 'text-red-700',
    orange: 'text-orange-700',
    yellow: 'text-yellow-700'
  }

  return (
    <div className={`border rounded-lg p-4 ${bgColors[urgencyColor]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/users?userId=${subscription.userId}`}
                className="font-medium text-gray-900 hover:text-red-600 transition-colors"
              >
                {subscription.userName}
              </Link>
              {subscription.cancelAtPeriodEnd && (
                <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                  CANCELADA
                </span>
              )}
            </div>
            <span className={`font-bold ${textColors[urgencyColor]}`}>
              {subscription.daysRemaining} días
            </span>
          </div>

          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-2 text-gray-400" />
              <a href={`mailto:${subscription.userEmail}`} className="hover:text-gray-900">
                {subscription.userEmail}
              </a>
            </div>

            {subscription.userPhone && (
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                <a href={`tel:${subscription.userPhone}`} className="hover:text-gray-900">
                  {subscription.userPhone}
                </a>
              </div>
            )}

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
              <span className="text-xs">
                Plan: <span className="font-medium">{subscription.planName}</span>
              </span>
              <span className="text-xs">
                Vence: <span className="font-medium">{new Date(subscription.endDate).toLocaleDateString('es-ES')}</span>
              </span>
            </div>

            {subscription.cancelAtPeriodEnd && (
              <div className="mt-2 pt-2 border-t border-red-200 bg-red-50 -mx-4 -mb-4 p-3 rounded-b-lg">
                <p className="text-xs font-semibold text-red-800 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Usuario canceló la suscripción
                </p>
                {subscription.cancelReason && (
                  <p className="text-xs text-red-700 mt-1">Motivo: {subscription.cancelReason}</p>
                )}
                <p className="text-xs text-red-600 mt-1">
                  Cancelada el: {new Date(subscription.canceledAt!).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
