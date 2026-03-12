'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  TrendingUp,
  Users,
  MousePointerClick,
  Eye,
  DollarSign,
  Zap,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  PauseCircle,
  Link2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../src/components/ui/Card'
import { Button } from '../../../src/components/ui/Button'
import { AnimatedLoadingSpinner } from '../../../src/components/ui/AnimatedLoadingSpinner'
import { useSearchParams } from 'next/navigation'

// ─── Types ───────────────────────────────────────────────────────────────────

interface MetaStatus {
  connected: boolean
  tokenExpired?: boolean
  adAccountId?: string
  adAccountName?: string
  pageId?: string
  pageName?: string
  lastSyncAt?: string
}

interface CampaignInsight {
  spend: string
  clicks: string
  impressions: string
  ctr: string
  cpc: string
  reach: string
  leads: string
}

interface Campaign {
  id: string
  name: string
  status: string
  objective: string
  created_time: string
  insights?: { data: CampaignInsight[] }
}

interface AccountInsights {
  spend: string
  clicks: string
  impressions: string
  ctr: string
  cpc: string
  reach: string
  leads: string
}

// ─── Stat card ───────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType
  label: string
  value: string
  sub?: string
  color: string
}) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">{label}</p>
            <p className="mt-1 text-2xl font-bold text-white">{value}</p>
            {sub && <p className="mt-0.5 text-xs text-zinc-500">{sub}</p>}
          </div>
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Campaign row ─────────────────────────────────────────────────────────────

function CampaignRow({ campaign }: { campaign: Campaign }) {
  const ins = campaign.insights?.data?.[0]
  const statusIcon =
    campaign.status === 'ACTIVE' ? (
      <PlayCircle className="w-4 h-4 text-emerald-400" />
    ) : (
      <PauseCircle className="w-4 h-4 text-zinc-500" />
    )

  return (
    <tr className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          {statusIcon}
          <span className="text-sm text-white font-medium truncate max-w-[200px]">
            {campaign.name}
          </span>
        </div>
        <p className="ml-6 text-xs text-zinc-500">{campaign.objective}</p>
      </td>
      <td className="py-3 px-4 text-sm text-zinc-300">
        €{ins ? parseFloat(ins.spend).toFixed(2) : '—'}
      </td>
      <td className="py-3 px-4 text-sm text-zinc-300">
        {ins ? parseInt(ins.impressions).toLocaleString('es') : '—'}
      </td>
      <td className="py-3 px-4 text-sm text-zinc-300">
        {ins ? parseInt(ins.clicks).toLocaleString('es') : '—'}
      </td>
      <td className="py-3 px-4 text-sm text-zinc-300">
        {ins ? `${parseFloat(ins.ctr).toFixed(2)}%` : '—'}
      </td>
      <td className="py-3 px-4 text-sm text-emerald-400 font-semibold">
        {ins ? ins.leads || '0' : '—'}
      </td>
      <td className="py-3 px-4 text-sm text-zinc-300">
        {ins ? `€${parseFloat(ins.cpc).toFixed(2)}` : '—'}
      </td>
    </tr>
  )
}

// ─── Not connected state ──────────────────────────────────────────────────────

function NotConnected() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="p-4 bg-blue-500/10 rounded-2xl mb-4">
        <svg className="w-12 h-12 text-blue-400 mx-auto" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Conecta tu cuenta de Meta</h2>
      <p className="text-zinc-400 mb-6 max-w-sm text-sm">
        Conecta Meta Business Suite para ver métricas de campañas y captar leads directamente en Itineramio.
      </p>
      <div className="space-y-3 text-left bg-zinc-900 border border-zinc-800 rounded-xl p-4 max-w-sm w-full mb-6">
        <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Necesitas</p>
        {[
          'Cuenta de Meta Business',
          'Acceso a Meta Ads Manager',
          'Página de Facebook (para leads)',
        ].map((item) => (
          <div key={item} className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-sm text-zinc-300">{item}</span>
          </div>
        ))}
      </div>
      <div className="space-y-2 text-left bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 max-w-sm w-full mb-6">
        <p className="text-xs text-amber-400 uppercase tracking-wider font-semibold flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Configuración requerida
        </p>
        <p className="text-xs text-zinc-400">
          Añade <code className="text-amber-300">META_APP_ID</code> y{' '}
          <code className="text-amber-300">META_APP_SECRET</code> a tus variables de entorno antes de conectar.
        </p>
      </div>
      <a href="/api/integrations/meta/connect">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Link2 className="w-4 h-4" />
          Conectar con Meta
        </Button>
      </a>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

const DATE_PRESETS = [
  { label: '7 días', value: 'last_7d' },
  { label: '30 días', value: 'last_30d' },
  { label: '90 días', value: 'last_90d' },
]

export default function MetaDashboardPage() {
  const searchParams = useSearchParams()
  const connected = searchParams.get('connected')

  const [status, setStatus] = useState<MetaStatus | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [insights, setInsights] = useState<AccountInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [datePreset, setDatePreset] = useState('last_30d')

  const loadStatus = useCallback(async () => {
    const res = await fetch('/api/integrations/meta/status')
    const data = await res.json()
    setStatus(data)
    return data
  }, [])

  const loadData = useCallback(async (preset: string) => {
    const [campaignsRes, insightsRes] = await Promise.all([
      fetch(`/api/meta/campaigns?datePreset=${preset}`),
      fetch(`/api/meta/insights?datePreset=${preset}`),
    ])
    const [campaignsData, insightsData] = await Promise.all([
      campaignsRes.json(),
      insightsRes.json(),
    ])
    if (campaignsData.data) setCampaigns(campaignsData.data)
    if (insightsData.data) setInsights(insightsData.data)
  }, [])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      const s = await loadStatus()
      if (s.connected && !s.tokenExpired) {
        await loadData(datePreset)
      }
      setLoading(false)
    }
    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadData(datePreset)
    setRefreshing(false)
  }

  const handlePresetChange = async (preset: string) => {
    setDatePreset(preset)
    setRefreshing(true)
    await loadData(preset)
    setRefreshing(false)
  }

  const handleDisconnect = async () => {
    if (!confirm('¿Desconectar tu cuenta de Meta?')) return
    await fetch('/api/integrations/meta/disconnect', { method: 'DELETE' })
    setStatus({ connected: false })
    setCampaigns([])
    setInsights(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <AnimatedLoadingSpinner />
      </div>
    )
  }

  if (!status?.connected || status.tokenExpired) {
    return <NotConnected />
  }

  // Build chart data from campaigns
  const chartData = campaigns
    .filter((c) => c.insights?.data?.[0])
    .map((c) => ({
      name: c.name.length > 20 ? c.name.slice(0, 20) + '…' : c.name,
      gasto: parseFloat(c.insights?.data?.[0]?.spend ?? '0'),
      leads: parseInt(c.insights?.data?.[0]?.leads ?? '0'),
      clics: parseInt(c.insights?.data?.[0]?.clicks ?? '0'),
    }))

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <h1 className="text-2xl font-bold">Meta Ads</h1>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30">
                Conectado
              </span>
            </div>
            <p className="text-sm text-zinc-500">
              {status.adAccountName} · {status.pageName && `Página: ${status.pageName} · `}
              {connected && 'Cuenta conectada correctamente'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Date preset */}
            <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
              {DATE_PRESETS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => handlePresetChange(p.value)}
                  className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                    datePreset === p.value
                      ? 'bg-blue-600 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="border-zinc-700 text-zinc-300 hover:text-white gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDisconnect}
              className="border-zinc-700 text-zinc-400 hover:text-red-400 hover:border-red-500/50 text-xs"
            >
              Desconectar
            </Button>
          </div>
        </motion.div>

        {/* Global stats */}
        {insights && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8"
          >
            <StatCard icon={DollarSign} label="Gasto total" value={`€${parseFloat(insights.spend || '0').toFixed(0)}`} color="bg-blue-600" />
            <StatCard icon={Users} label="Leads" value={insights.leads || '0'} color="bg-emerald-600" />
            <StatCard icon={Eye} label="Alcance" value={parseInt(insights.reach || '0').toLocaleString('es')} color="bg-purple-600" />
            <StatCard icon={MousePointerClick} label="Clics" value={parseInt(insights.clicks || '0').toLocaleString('es')} color="bg-orange-600" />
            <StatCard icon={TrendingUp} label="CTR" value={`${parseFloat(insights.ctr || '0').toFixed(2)}%`} color="bg-cyan-600" />
            <StatCard icon={Zap} label="CPC" value={`€${parseFloat(insights.cpc || '0').toFixed(2)}`} sub="coste por clic" color="bg-rose-600" />
          </motion.div>
        )}

        {/* Chart + table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bar chart */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-zinc-900 border-zinc-800 h-full">
              <CardHeader>
                <CardTitle className="text-sm text-zinc-300">Gasto vs Leads por campaña</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 10 }} />
                      <YAxis tick={{ fill: '#71717a', fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8 }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="gasto" name="Gasto €" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="leads" name="Leads" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[240px] text-zinc-600 text-sm">
                    Sin datos para este período
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* CPL analysis */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="bg-zinc-900 border-zinc-800 h-full">
              <CardHeader>
                <CardTitle className="text-sm text-zinc-300">Coste por Lead (CPL)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {campaigns
                    .filter((c) => c.insights?.data?.[0]?.leads && parseInt(c.insights.data[0].leads) > 0)
                    .map((c) => {
                      const ins = c.insights?.data?.[0]!
                      const cpl = parseFloat(ins.spend) / parseInt(ins.leads)
                      const maxCpl = 50
                      const pct = Math.min((cpl / maxCpl) * 100, 100)
                      return (
                        <div key={c.id}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-zinc-400 truncate max-w-[180px]">{c.name}</span>
                            <span className="text-xs font-semibold text-white">€{cpl.toFixed(2)}/lead</span>
                          </div>
                          <div className="h-1.5 bg-zinc-800 rounded-full">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-blue-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  {campaigns.filter((c) => c.insights?.data?.[0]?.leads && parseInt(c.insights.data[0].leads) > 0).length === 0 && (
                    <div className="flex items-center justify-center h-[200px] text-zinc-600 text-sm">
                      Sin leads registrados en este período
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Campaigns table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-zinc-300">
                Campañas ({campaigns.length})
              </CardTitle>
              <a
                href={`https://adsmanager.facebook.com/adsmanager/manage/campaigns`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-blue-400 transition-colors"
              >
                Abrir Ads Manager <ExternalLink className="w-3 h-3" />
              </a>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      {['Campaña', 'Gasto', 'Impresiones', 'Clics', 'CTR', 'Leads', 'CPC'].map((h) => (
                        <th key={h} className="py-2 px-4 text-left text-xs text-zinc-500 font-medium">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.length > 0 ? (
                      campaigns.map((c) => <CampaignRow key={c.id} campaign={c} />)
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-zinc-600 text-sm">
                          No hay campañas en este período
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
