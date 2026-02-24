'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Clock,
  ChevronRight,
  User,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { Card, CardContent, Badge } from '@/components/ui'
import { formatCurrency } from '@/lib/format'
import { useTranslation } from 'react-i18next'

interface OwnerGroup {
  owner: {
    id: string
    type: string
    firstName: string
    lastName: string
    companyName: string
  }
  properties: {
    property: { id: string; name: string; city: string }
    totals: { count: number; nights: number }
  }[]
  totals: {
    count: number
    nights: number
    hostEarnings: number
    netEarnings: number
    totalExpenses: number
  }
}

interface PendingData {
  owners: OwnerGroup[]
  totalPending: number
  daysInMonth: number
  year: number
  month: number
}

const MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'
]

export function PendingSettlementsSection() {
  const { t } = useTranslation('gestion')
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingData, setPendingData] = useState<PendingData | null>(null)

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  useEffect(() => {
    fetchPendingData()
  }, [])

  const fetchPendingData = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({
        year: currentYear.toString(),
        month: currentMonth.toString()
      })

      const response = await fetch(`/api/gestion/reservations/pending?${params}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        console.log('[PendingSettlements] Data received:', data)
        setPendingData(data)
      } else {
        const errorText = await response.text()
        console.error('[PendingSettlements] Response not OK:', response.status, errorText)
        setError(`Error ${response.status}: ${errorText}`)
      }
    } catch (err) {
      console.error('[PendingSettlements] Error fetching pending data:', err)
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const getOwnerName = (owner: OwnerGroup['owner']) => {
    if (owner.type === 'EMPRESA') {
      return owner.companyName
    }
    return `${owner.firstName} ${owner.lastName}`
  }

  const handleOwnerClick = (ownerId: string) => {
    router.push(`/gestion/liquidaciones/nueva?ownerId=${ownerId}&year=${currentYear}&month=${currentMonth}`)
  }

  // Show loading state
  if (loading) {
    return (
      <Card className="mb-6 border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50 to-white">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-amber-600 animate-spin" />
            <span className="text-amber-700 font-medium">{t('settlements.pending.loading')}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    )
  }

  // Hide if no pending data
  if (!pendingData || pendingData.totalPending === 0) {
    return null
  }

  const monthName = t(`common.months.${MONTHS[currentMonth - 1]}`)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <Card className="border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50 to-white">
        <CardContent className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {t('settlements.pending.title')} - {monthName} {currentYear}
                </h2>
                <p className="text-sm text-gray-600">
                  {t('settlements.pending.subtitle')}
                </p>
              </div>
            </div>
            <Badge className="bg-amber-100 text-amber-700 border-amber-200">
              {pendingData.totalPending} {t('settlements.pending.reservations')}
            </Badge>
          </div>

          {/* Owners List - Click to open preview */}
          <div className="space-y-2">
            {pendingData.owners.map((ownerGroup) => {
              const ownerName = getOwnerName(ownerGroup.owner)

              return (
                <button
                  key={ownerGroup.owner.id}
                  onClick={() => handleOwnerClick(ownerGroup.owner.id)}
                  className="w-full bg-white rounded-lg border border-gray-200 p-4 hover:bg-violet-50 hover:border-violet-300 transition-all group text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-violet-600" />
                      <div>
                        <span className="font-medium text-gray-900 group-hover:text-violet-700">
                          {ownerName}
                        </span>
                        <p className="text-sm text-gray-500">
                          {ownerGroup.totals.count} {t('settlements.pending.reservations')} · {ownerGroup.totals.nights} {t('settlements.pending.nights')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{t('settlements.pending.netPrice')}</p>
                        <p className="font-semibold text-green-600">{formatCurrency(ownerGroup.totals.netEarnings)}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-violet-600 transition-colors" />
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
