'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  TrendingUp, Users, MousePointerClick, Eye, DollarSign, Zap,
  RefreshCw, Download, PlayCircle, PauseCircle, AlertTriangle, BarChart3,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

interface CampaignInsight {
  spend: string
  clicks: string
  impressions: string
  ctr: string
  cpc: string
  reach: string
  leads?: string
}

interface Campaign {
  id: string
  name: string
  status: string
  objective: string
  insights?: { data: CampaignInsight[] }
}

interface MetaData {
  connected: boolean
  adAccountName?: string
  lastSyncAt?: string
  campaigns: Campaign[]
  insights: CampaignInsight | null
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  color: string
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
      <div className={`p-2.5 rounded-xl ${color}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-lg font-bold text-gray-900">{value}</p>
      </div>
    </div>
  )
}

function exportCSV(campaigns: Campaign[], datePreset: string) {
  const rows = [
    ['Campaña', 'Estado', 'Objetivo', 'Gasto (€)', 'Impresiones', 'Clics', 'CTR (%)', 'Leads', 'CPC (€)', 'Alcance'],
    ...campaigns.map((c) => {
      const ins = c.insights?.data?.[0]
      return [
        c.name,
        c.status === 'ACTIVE' ? 'Activa' : 'Pausada',
        c.objective || '-',
        ins ? parseFloat(ins.spend).toFixed(2) : '0',
        ins ? ins.impressions : '0',
        ins ? ins.clicks : '0',
        ins ? parseFloat(ins.ctr).toFixed(2) : '0',
        ins ? (ins.leads ?? '0') : '0',
        ins ? parseFloat(ins.cpc).toFixed(2) : '0',
        ins ? ins.reach : '0',
      ]
    }),
  ]
  const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `meta-campanas-${datePreset}-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const DATE_PRESETS = [
  { value: 'last_7d', label: '7 días' },
  { value: 'last_30d', label: '30 días' },
  { value: 'last_90d', label: '90 días' },
]

export default function AdminMetaPage() {
  const [data, setData] = useState<MetaData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [datePreset, setDatePreset] = useState('last_30d')
  const [error, setError] = useState('')

  const fetchData = useCallback(async (preset = datePreset, silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/meta?datePreset=${preset}`, { credentials: 'include' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al cargar datos')
      setData(json)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [datePreset])

  useEffect(() => { fetchData() }, [])

  const handlePreset = (preset: string) => {
    setDatePreset(preset)
    fetchData(preset, true)
  }

  const campaigns = data?.campaigns ?? []
  const insights = data?.insights

  const chartData = campaigns
    .filter((c) => c.insights?.data?.[0])
    .map((c) => ({
      name: c.name.length > 22 ? c.name.slice(0, 22) + '…' : c.name,
      gasto: parseFloat(c.insights?.data?.[0]?.spend ?? '0'),
      leads: parseInt(c.insights?.data?.[0]?.leads ?? '0'),
    }))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Meta Ads</h1>
            <p className="text-sm text-gray-500">
              {data?.adAccountName ?? 'Panel de campañas'}{data?.lastSyncAt ? ` · Sync: ${new Date(data.lastSyncAt).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {DATE_PRESETS.map((p) => (
              <button
                key={p.value}
                onClick={() => handlePreset(p.value)}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors font-medium ${
                  datePreset === p.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => fetchData(datePreset, true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button
            onClick={() => exportCSV(campaigns, datePreset)}
            disabled={campaigns.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white text-sm font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm mb-6 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Not connected */}
      {!data?.connected && !error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-start gap-4">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-gray-900">Meta no conectado</p>
            <p className="text-gray-600 text-sm mt-1">
              Ve a <a href="/meta" className="text-blue-600 underline">tu perfil de usuario</a> y conecta tu cuenta de Meta Ads para ver los datos aquí.
            </p>
          </div>
        </div>
      )}

      {data?.connected && (
        <>
          {/* KPIs */}
          {insights && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              <StatCard icon={DollarSign} label="Gasto total" value={`€${parseFloat(insights.spend || '0').toFixed(0)}`} color="bg-blue-500" />
              <StatCard icon={Users} label="Leads" value={insights.leads ?? '0'} color="bg-emerald-500" />
              <StatCard icon={Eye} label="Alcance" value={parseInt(insights.reach || '0').toLocaleString('es')} color="bg-purple-500" />
              <StatCard icon={MousePointerClick} label="Clics" value={parseInt(insights.clicks || '0').toLocaleString('es')} color="bg-orange-500" />
              <StatCard icon={TrendingUp} label="CTR" value={`${parseFloat(insights.ctr || '0').toFixed(2)}%`} color="bg-cyan-500" />
              <StatCard icon={Zap} label="CPC" value={`€${parseFloat(insights.cpc || '0').toFixed(2)}`} color="bg-rose-500" />
            </div>
          )}

          {/* Chart */}
          {chartData.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-gray-400" />
                <h2 className="text-sm font-semibold text-gray-700">Gasto vs Leads por campaña</h2>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
                  />
                  <Bar dataKey="gasto" name="Gasto €" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="leads" name="Leads" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">Campañas ({campaigns.length})</h2>
            </div>
            {campaigns.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-sm">Sin campañas en este período</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {['Campaña', 'Estado', 'Gasto', 'Impresiones', 'Clics', 'CTR', 'Leads', 'CPC'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {campaigns.map((c) => {
                      const ins = c.insights?.data?.[0]
                      return (
                        <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900 truncate max-w-[200px]">{c.name}</p>
                            <p className="text-gray-400 text-xs">{c.objective}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                              c.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              {c.status === 'ACTIVE' ? <PlayCircle className="w-3 h-3" /> : <PauseCircle className="w-3 h-3" />}
                              {c.status === 'ACTIVE' ? 'Activa' : 'Pausada'}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-900">{ins ? `€${parseFloat(ins.spend).toFixed(2)}` : '—'}</td>
                          <td className="px-4 py-3 text-gray-600">{ins ? parseInt(ins.impressions).toLocaleString('es') : '—'}</td>
                          <td className="px-4 py-3 text-gray-600">{ins ? parseInt(ins.clicks).toLocaleString('es') : '—'}</td>
                          <td className="px-4 py-3 text-gray-600">{ins ? `${parseFloat(ins.ctr).toFixed(2)}%` : '—'}</td>
                          <td className="px-4 py-3">
                            {ins?.leads
                              ? <span className="font-semibold text-emerald-600">{ins.leads}</span>
                              : <span className="text-gray-400">0</span>}
                          </td>
                          <td className="px-4 py-3 text-gray-600">{ins ? `€${parseFloat(ins.cpc).toFixed(2)}` : '—'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
