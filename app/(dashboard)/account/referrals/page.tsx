'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Gift,
  Copy,
  Check,
  Share2,
  Loader2,
  TrendingUp,
  Clock,
  CheckCircle,
  User,
  Calendar,
  Crown
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ReferralData {
  referralCode: string
  referralLink: string
  stats: {
    totalReferrals: number
    activeReferrals: number
    pendingCommission: number
    paidCommission: number
    totalCommission: number
  }
  referrals: {
    id: string
    name: string
    joinedAt: string
    subscription: string | null
    commission: number
    status: string
  }[]
}

export default function ReferralsPage() {
  const { t } = useTranslation('account')
  const [data, setData] = useState<ReferralData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadReferralData()
  }, [])

  const loadReferralData = async () => {
    try {
      const response = await fetch('/api/account/referrals')
      if (!response.ok) throw new Error('Error loading referrals')
      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('Error:', err)
      setError(t('referrals.page.loadError'))
    } finally {
      setIsLoading(false)
    }
  }

  const copyLink = async () => {
    if (!data) return
    try {
      await navigator.clipboard.writeText(data.referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Error copying:', err)
    }
  }

  const shareLink = async () => {
    if (!data) return
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('referrals.page.shareTitle'),
          text: t('referrals.page.shareText'),
          url: data.referralLink
        })
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err)
        }
      }
    } else {
      copyLink()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">{error || t('referrals.page.genericError')}</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Gift className="w-7 h-7 text-violet-600" />
          {t('referrals.page.title')}
        </h1>
        <p className="text-gray-600 mt-2">
          {t('referrals.page.description')}
        </p>
      </div>

      {/* Referral Link Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-6 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative">
          <h2 className="text-lg font-semibold mb-1">{t('referrals.page.yourLink')}</h2>
          <p className="text-violet-200 text-sm mb-4">
            {t('referrals.page.yourLinkDesc')}
          </p>

          <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-lg p-3">
            <code className="flex-1 text-sm truncate">{data.referralLink}</code>
            <button
              onClick={copyLink}
              className="p-2 bg-white text-violet-600 rounded-lg hover:bg-violet-50 transition-colors"
              title={t('referrals.page.copyLink')}
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
            <button
              onClick={shareLink}
              className="p-2 bg-white text-violet-600 rounded-lg hover:bg-violet-50 transition-colors"
              title={t('referrals.page.share')}
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          <p className="text-violet-200 text-xs mt-3">
            {t('referrals.page.code')}: <span className="font-mono font-bold text-white">{data.referralCode}</span>
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-gray-200 p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-600">{t('referrals.page.totalReferrals')}</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{data.stats.totalReferrals}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-xl border border-gray-200 p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-600">{t('referrals.page.active')}</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{data.stats.activeReferrals}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-gray-200 p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-sm text-gray-600">{t('referrals.page.pending')}</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{data.stats.pendingCommission.toFixed(2)}€</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-xl border border-gray-200 p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
              <Gift className="w-5 h-5 text-violet-600" />
            </div>
            <span className="text-sm text-gray-600">{t('referrals.page.earned')}</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{data.stats.paidCommission.toFixed(2)}€</p>
        </motion.div>
      </div>

      {/* How it Works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-50 rounded-xl p-6"
      >
        <h3 className="font-semibold text-gray-900 mb-4">{t('referrals.page.howItWorks')}</h3>
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              1
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{t('referrals.page.step1Title')}</h4>
              <p className="text-sm text-gray-600 mt-1">
                {t('referrals.page.step1Desc')}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              2
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{t('referrals.page.step2Title')}</h4>
              <p className="text-sm text-gray-600 mt-1">
                {t('referrals.page.step2Desc')}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              3
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{t('referrals.page.step3Title')}</h4>
              <p className="text-sm text-gray-600 mt-1">
                {t('referrals.page.step3Desc')}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Referrals List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <h3 className="font-semibold text-gray-900 mb-4">{t('referrals.page.yourReferrals')}</h3>

        {data.referrals.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h4 className="font-medium text-gray-900 mb-2">{t('referrals.page.noReferrals')}</h4>
            <p className="text-gray-600 text-sm mb-4">
              {t('referrals.page.noReferralsDesc')}
            </p>
            <button
              onClick={copyLink}
              className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
            >
              <Copy className="w-4 h-4" />
              {t('referrals.page.copyLink')}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t('referrals.page.tableUser')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t('referrals.page.tableDate')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t('referrals.page.tablePlan')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t('referrals.page.tableCommission')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t('referrals.page.tableStatus')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.referrals.map((referral) => (
                    <tr key={referral.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <span className="font-medium text-gray-900">{referral.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(referral.joinedAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {referral.subscription ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-violet-100 text-violet-700 text-xs font-medium rounded-full">
                            <Crown className="w-3 h-3" />
                            {referral.subscription}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">{t('referrals.page.statusTrial')}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {referral.commission.toFixed(2)}€
                      </td>
                      <td className="px-6 py-4">
                        {referral.status === 'PAID' ? (
                          <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            {t('referrals.page.statusPaid')}
                          </span>
                        ) : referral.status === 'PENDING' ? (
                          <span className="inline-flex items-center gap-1 text-yellow-600 text-sm">
                            <Clock className="w-4 h-4" />
                            {t('referrals.page.statusPending')}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm">{referral.status}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>

      {/* Terms */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-50 rounded-xl p-6 text-sm text-gray-600"
      >
        <h4 className="font-medium text-gray-900 mb-2">{t('referrals.page.termsTitle')}</h4>
        <ul className="space-y-1 list-disc list-inside">
          <li>{t('referrals.page.term1')}</li>
          <li>{t('referrals.page.term2')}</li>
          <li>{t('referrals.page.term3')}</li>
          <li>{t('referrals.page.term4')}</li>
          <li>{t('referrals.page.term5')}</li>
        </ul>
      </motion.div>
    </div>
  )
}
