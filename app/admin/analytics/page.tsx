'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts'
import {
  Eye,
  MessageSquare,
  Users,
  Building2,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  MapPin,
  Activity,
  Zap,
  Globe,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  LayoutGrid,
  Calendar,
  ChevronDown,
  Loader2
} from 'lucide-react'

interface AnalyticsData {
  overview?: {
    totalUsers: number
    totalProperties: number
    totalZones: number
    totalViews: number
    activeUsers: number
    publishedProperties: number
    newUsersInPeriod: number
    newPropertiesInPeriod: number
    userGrowthPercent: number
    propertyGrowthPercent: number
    avgViewsPerZone: number
  }
  visits?: {
    topZones: Array<{
      id: string
      name: string
      viewCount: number
      lastViewedAt: string
      property: { id: string; name: string; city: string; country: string }
    }>
    dailyVisits: Array<{ date: string; visits: number }>
    totalVisits: number
    totalZonesWithViews: number
  }
  chatbot?: {
    totalInteractions: number
    dailyUsage: Array<{ date: string; interactions: number }>
    recentInteractions: Array<any>
    growthPercent: number
    avgPerDay: number
  }
  users?: {
    growth: Array<{ date: string; new_users: number; active_users: number }>
    newUsers: number
    activeUsers: number
    usersWithProperties: number
    recentLogins: number
    retentionRate: number
    totalUsers: number
  }
  properties?: {
    performance: Array<{
      id: string
      name: string
      city: string
      country: string
      isPublished: boolean
      totalViews: number
      zonesCount: number
    }>
    totalProperties: number
    publishedProperties: number
    unpublishedProperties: number
    publishRate: number
    byCountry: Array<{ country: string; count: number }>
    byCity: Array<{ city: string; count: number }>
  }
  subscriptions?: {
    activeSubscriptions: number
    byPlan: Array<{ planId: string; planName: string; price: number; count: number }>
    mrr: number
    newSubscriptionsInPeriod: number
  }
  performance?: {
    totalZones: number
    totalProperties: number
    totalUsers: number
    totalViews: { _sum: { viewCount: number } }
    avgViewsPerZone: number
  }
}

const CHART_COLORS = {
  primary: '#ef4444',
  secondary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  purple: '#8b5cf6',
  pink: '#ec4899',
  gray: '#6b7280'
}

const PIE_COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']

// Stat Card Component
const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  change,
  changeType,
  subtitle
}: {
  title: string
  value: string | number
  icon: React.ElementType
  color: string
  change?: number | string
  changeType?: 'up' | 'down' | 'neutral'
  subtitle?: string
}) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{value}</p>
        {(change !== undefined || subtitle) && (
          <div className="mt-2 flex items-center gap-2">
            {change !== undefined && (
              <span className={`inline-flex items-center text-sm font-medium ${
                changeType === 'up' ? 'text-green-600' :
                changeType === 'down' ? 'text-red-600' : 'text-gray-500'
              }`}>
                {changeType === 'up' && <ArrowUpRight className="h-4 w-4" />}
                {changeType === 'down' && <ArrowDownRight className="h-4 w-4" />}
                {typeof change === 'number' ? `${change > 0 ? '+' : ''}${change}%` : change}
              </span>
            )}
            {subtitle && <span className="text-sm text-gray-500">{subtitle}</span>}
          </div>
        )}
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
)

// Mini Stat Card for secondary metrics
const MiniStatCard = ({
  title,
  value,
  icon: Icon,
  color
}: {
  title: string
  value: string | number
  icon: React.ElementType
  color: string
}) => (
  <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
    <div className={`p-2 rounded-lg ${color}`}>
      <Icon className="h-5 w-5 text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{title}</p>
    </div>
  </div>
)

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('30d')
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'properties' | 'engagement'>('overview')

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/analytics?timeframe=${timeframe}&metric=all`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        setData(result.analytics)
      } else {
        throw new Error(result.error || 'Error fetching analytics')
      }
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar analytics')
    } finally {
      setLoading(false)
    }
  }, [timeframe])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toLocaleString('es-ES')
  }

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
  }

  const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(num)
  }

  const timeframeOptions = [
    { value: '7d', label: '7 dias' },
    { value: '30d', label: '30 dias' },
    { value: '90d', label: '90 dias' },
    { value: '1y', label: '1 año' }
  ]

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-red-600 animate-spin mb-4" />
        <p className="text-gray-600">Cargando analytics...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Activity className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar datos</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </button>
      </div>
    )
  }

  // Prepare chart data with safe fallbacks
  const visitsChartData = data?.visits?.dailyVisits?.map(item => ({
    date: formatDate(item.date),
    visitas: item.visits
  })) || []

  const chatbotChartData = data?.chatbot?.dailyUsage?.map(item => ({
    date: formatDate(item.date),
    interacciones: item.interactions
  })) || []

  const userGrowthData = data?.users?.growth?.map(item => ({
    date: formatDate(item.date),
    nuevos: item.new_users,
    activos: item.active_users
  })) || []

  const propertyStatusData = [
    { name: 'Publicadas', value: data?.properties?.publishedProperties || 0, color: CHART_COLORS.success },
    { name: 'No publicadas', value: data?.properties?.unpublishedProperties || 0, color: CHART_COLORS.gray }
  ].filter(item => item.value > 0)

  const subscriptionPlanData = data?.subscriptions?.byPlan?.map((plan, index) => ({
    name: plan.planName,
    value: plan.count,
    color: PIE_COLORS[index % PIE_COLORS.length]
  })) || []

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Metricas y estadisticas de la plataforma
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-red-500 focus:border-red-500 cursor-pointer"
            >
              {timeframeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
          </div>

          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm font-medium disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Vistas"
          value={formatNumber(data?.overview?.totalViews || 0)}
          icon={Eye}
          color="bg-blue-500"
          subtitle={`${data?.overview?.avgViewsPerZone || 0} promedio/zona`}
        />
        <StatCard
          title="Usuarios"
          value={formatNumber(data?.overview?.totalUsers || 0)}
          icon={Users}
          color="bg-green-500"
          change={data?.overview?.userGrowthPercent}
          changeType={
            (data?.overview?.userGrowthPercent || 0) > 0 ? 'up' :
            (data?.overview?.userGrowthPercent || 0) < 0 ? 'down' : 'neutral'
          }
          subtitle={`${data?.overview?.newUsersInPeriod || 0} nuevos`}
        />
        <StatCard
          title="Propiedades"
          value={formatNumber(data?.overview?.totalProperties || 0)}
          icon={Building2}
          color="bg-purple-500"
          change={data?.overview?.propertyGrowthPercent}
          changeType={
            (data?.overview?.propertyGrowthPercent || 0) > 0 ? 'up' :
            (data?.overview?.propertyGrowthPercent || 0) < 0 ? 'down' : 'neutral'
          }
          subtitle={`${data?.overview?.publishedProperties || 0} publicadas`}
        />
        <StatCard
          title="Interacciones IA"
          value={formatNumber(data?.chatbot?.totalInteractions || 0)}
          icon={MessageSquare}
          color="bg-orange-500"
          change={data?.chatbot?.growthPercent}
          changeType={
            (data?.chatbot?.growthPercent || 0) > 0 ? 'up' :
            (data?.chatbot?.growthPercent || 0) < 0 ? 'down' : 'neutral'
          }
          subtitle={`${data?.chatbot?.avgPerDay || 0}/dia`}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        <MiniStatCard
          title="Usuarios Activos"
          value={data?.users?.activeUsers || 0}
          icon={Activity}
          color="bg-green-500"
        />
        <MiniStatCard
          title="Zonas Totales"
          value={data?.overview?.totalZones || 0}
          icon={LayoutGrid}
          color="bg-blue-500"
        />
        <MiniStatCard
          title="Tasa Retencion"
          value={`${data?.users?.retentionRate || 0}%`}
          icon={TrendingUp}
          color="bg-purple-500"
        />
        <MiniStatCard
          title="Logins Recientes"
          value={data?.users?.recentLogins || 0}
          icon={Users}
          color="bg-orange-500"
        />
        <MiniStatCard
          title="Suscripciones"
          value={data?.subscriptions?.activeSubscriptions || 0}
          icon={Zap}
          color="bg-pink-500"
        />
        <MiniStatCard
          title="MRR"
          value={formatCurrency(data?.subscriptions?.mrr || 0)}
          icon={DollarSign}
          color="bg-emerald-500"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visits Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Visitas a Zonas</h3>
              <p className="text-sm text-gray-500">Tendencia de visitas en el periodo</p>
            </div>
            <Eye className="h-5 w-5 text-blue-500" />
          </div>
          <div className="h-72">
            {visitsChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={visitsChartData}>
                  <defs>
                    <linearGradient id="colorVisitas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.secondary} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={CHART_COLORS.secondary} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="visitas"
                    stroke={CHART_COLORS.secondary}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorVisitas)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Eye className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No hay datos de visitas</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chatbot Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Uso del Chatbot IA</h3>
              <p className="text-sm text-gray-500">Interacciones diarias con el asistente</p>
            </div>
            <MessageSquare className="h-5 w-5 text-orange-500" />
          </div>
          <div className="h-72">
            {chatbotChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chatbotChartData}>
                  <defs>
                    <linearGradient id="colorChatbot" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.warning} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={CHART_COLORS.warning} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="interacciones"
                    stroke={CHART_COLORS.warning}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorChatbot)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No hay datos del chatbot</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Zones Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Top Zonas por Visitas</h3>
              <p className="text-sm text-gray-500">Las zonas mas visitadas</p>
            </div>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="h-80">
            {(data?.visits?.topZones?.length || 0) > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data?.visits?.topZones?.slice(0, 8).map(zone => {
                    const propName = zone.property?.name || 'Sin propiedad'
                    const shortProp = propName.length > 12 ? propName.substring(0, 12) + '..' : propName
                    const displayName = `${zone.name} (${shortProp})`
                    return {
                      name: displayName.length > 28 ? displayName.substring(0, 28) + '...' : displayName,
                      visitas: zone.viewCount || 0,
                      fullName: `${zone.name} — ${propName}`,
                      property: propName
                    }
                  })}
                  layout="vertical"
                  margin={{ left: 10, right: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} stroke="#9ca3af" width={160} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(value: any) => [value, 'Visitas']}
                    labelFormatter={(label: any, payload: any) => payload?.[0]?.payload?.fullName || label}
                  />
                  <Bar dataKey="visitas" fill={CHART_COLORS.success} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <LayoutGrid className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No hay zonas con visitas</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Property Status Pie */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Estado Propiedades</h3>
              <p className="text-sm text-gray-500">Publicadas vs No publicadas</p>
            </div>
            <Building2 className="h-5 w-5 text-purple-500" />
          </div>
          <div className="h-80">
            {propertyStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={propertyStatusData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {propertyStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Building2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No hay propiedades</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Crecimiento de Usuarios</h3>
              <p className="text-sm text-gray-500">Nuevos usuarios por dia</p>
            </div>
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <div className="h-72">
            {userGrowthData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="nuevos"
                    name="Nuevos"
                    stroke={CHART_COLORS.secondary}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS.secondary, strokeWidth: 0, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No hay datos de usuarios</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top Properties List */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Propiedades Destacadas</h3>
              <p className="text-sm text-gray-500">Por numero de visitas</p>
            </div>
            <Zap className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {(data?.properties?.performance?.length || 0) > 0 ? (
              data?.properties?.performance?.slice(0, 6).map((property, index) => (
                <div
                  key={property.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center min-w-0 flex-1">
                    <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3 ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-400' :
                      'bg-gray-300'
                    }`}>
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate text-sm">{property.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {property.city}, {property.country}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0 text-right">
                    <div>
                      <p className="font-bold text-gray-900">{formatNumber(property.totalViews)}</p>
                      <p className="text-xs text-gray-500">visitas</p>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{property.zonesCount}</p>
                      <p className="text-xs text-gray-500">zonas</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Building2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No hay propiedades</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Geographic Distribution */}
      {((data?.properties?.byCountry?.length || 0) > 0 || (data?.properties?.byCity?.length || 0) > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* By Country */}
          {(data?.properties?.byCountry?.length || 0) > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Propiedades por Pais</h3>
                  <p className="text-sm text-gray-500">Distribucion geografica</p>
                </div>
                <Globe className="h-5 w-5 text-blue-500" />
              </div>
              <div className="space-y-3">
                {data?.properties?.byCountry?.slice(0, 5).map((item, index) => (
                  <div key={item.country} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{item.country}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${(item.count / (data?.properties?.byCountry?.[0]?.count || 1)) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-900 w-8 text-right">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* By City */}
          {(data?.properties?.byCity?.length || 0) > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Propiedades por Ciudad</h3>
                  <p className="text-sm text-gray-500">Top ciudades</p>
                </div>
                <MapPin className="h-5 w-5 text-purple-500" />
              </div>
              <div className="space-y-3">
                {data?.properties?.byCity?.slice(0, 5).map((item) => (
                  <div key={item.city} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{item.city}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{
                            width: `${(item.count / (data?.properties?.byCity?.[0]?.count || 1)) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-900 w-8 text-right">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subscription Plans (if data available) */}
      {(data?.subscriptions?.byPlan?.length || 0) > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Suscripciones por Plan</h3>
              <p className="text-sm text-gray-500">Distribucion de planes activos</p>
            </div>
            <DollarSign className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data?.subscriptions?.byPlan?.map((plan, index) => (
              <div key={plan.planId} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                  />
                  <span className="font-medium text-gray-900">{plan.planName}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{plan.count}</p>
                <p className="text-sm text-gray-500">{formatCurrency(plan.price)}/mes</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Summary Footer */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="h-6 w-6" />
          <h3 className="text-lg font-semibold">Resumen de Rendimiento</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <p className="text-3xl font-bold">{data?.performance?.totalZones || 0}</p>
            <p className="text-red-200 text-sm">Total Zonas</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{data?.performance?.totalProperties || 0}</p>
            <p className="text-red-200 text-sm">Total Propiedades</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{data?.performance?.totalUsers || 0}</p>
            <p className="text-red-200 text-sm">Total Usuarios</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{data?.performance?.avgViewsPerZone || 0}</p>
            <p className="text-red-200 text-sm">Promedio Vistas/Zona</p>
          </div>
        </div>
      </div>
    </div>
  )
}
