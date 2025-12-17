'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Eye,
  Users,
  Clock,
  Star,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Layers,
  Calendar,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  MessageSquare,
  ThumbsUp,
  Activity,
  Zap,
  Target
} from 'lucide-react'
import { Button } from '../../../../../src/components/ui/Button'
import { Card } from '../../../../../src/components/ui/Card'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Helper to extract text from i18n JSON or string
const getZoneName = (name: string | { es?: string; en?: string; fr?: string }): string => {
  if (typeof name === 'string') return name
  if (name && typeof name === 'object') {
    return name.es || name.en || name.fr || 'Zona'
  }
  return 'Zona'
}

interface AnalyticsData {
  property: {
    id: string
    name: string
    isPublished: boolean
    createdAt: string
  }
  summary: {
    totalViews: number
    uniqueVisitors: number
    avgSessionDuration: number
    maxSessionDuration: number
    minSessionDuration: number
    sessionsWithActivity: number
    avgPagesPerSession: number
    maxPagesPerSession: number
    avgRating: number
    totalRatings: number
    whatsappClicks: number
    engagementRate: number
    contactRate: number
    lastViewedAt: string | null
    avgZonesPerSession: number
    avgZoneRating: number
    totalZoneRatings: number
  }
  zones: Array<{
    id: string
    name: string | { es?: string; en?: string; fr?: string }
    icon: string
    viewCount: number
    uniqueVisitors: number
    percentage: number
  }>
  insights: {
    mostViewedZone: { name: string | { es?: string; en?: string; fr?: string }; views: number } | null
    leastViewedZone: { name: string | { es?: string; en?: string; fr?: string }; views: number } | null
    totalZoneViews: number
  }
  dailyStats: Array<{
    date: string
    views: number
    uniqueVisitors: number
    whatsappClicks: number
  }>
  recentEvaluations: Array<{
    id: string
    rating: number
    comment: string | null
    createdAt: string
  }>
  viewsByHour: Array<{ hour: number; count: number }>
  viewsByDayOfWeek: Array<{ dayOfWeek: number; count: number }>
  zoneReviews: Array<{
    id: string
    zoneId: string
    zoneName: string | { es?: string; en?: string; fr?: string }
    overallRating: number
    clarity: number
    completeness: number
    helpfulness: number
    upToDate: number
    feedback: string | null
    improvementSuggestions: string | null
    language: string
    createdAt: string
  }>
  zoneComments: Array<{
    id: string
    zoneId: string
    zoneName: string | { es?: string; en?: string; fr?: string }
    text: string
    rating: number
    guestName: string | null
    language: string
    createdAt: string
  }>
}

const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const dayNamesFull = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

function formatFullDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Hoy'
  if (days === 1) return 'Ayer'
  if (days < 7) return `Hace ${days} días`
  if (days < 30) return `Hace ${Math.floor(days / 7)} semanas`
  return formatDate(dateString)
}

// Metric Card Component - Google Analytics Style
function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = 'blue'
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow'
}) {
  const colorStyles = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', accent: 'text-blue-600' },
    green: { bg: 'bg-green-50', icon: 'text-green-600', accent: 'text-green-600' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', accent: 'text-purple-600' },
    orange: { bg: 'bg-orange-50', icon: 'text-orange-600', accent: 'text-orange-600' },
    red: { bg: 'bg-red-50', icon: 'text-red-600', accent: 'text-red-600' },
    yellow: { bg: 'bg-yellow-50', icon: 'text-yellow-600', accent: 'text-yellow-600' }
  }

  const styles = colorStyles[color]

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${styles.bg}`}>
          <Icon className={`w-5 h-5 ${styles.icon}`} />
        </div>
        {trend && trendValue && (
          <div className={`flex items-center text-xs font-medium ${
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-500' : 'text-gray-500'
          }`}>
            {trend === 'up' && <TrendingUp className="w-3 h-3 mr-1" />}
            {trend === 'down' && <TrendingDown className="w-3 h-3 mr-1" />}
            {trendValue}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{title}</p>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
    </div>
  )
}

// Mini Spark Chart Component
function SparkChart({ data, color = '#6366f1' }: { data: number[], color?: string }) {
  if (data.length === 0) return null
  const max = Math.max(...data, 1)
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - (v / max) * 80}`).join(' ')

  return (
    <svg viewBox="0 0 100 100" className="w-full h-12" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Bar Chart Component - Google Analytics Style
function BarChart({
  data,
  labelKey,
  valueKey,
  color = '#6366f1',
  height = 200
}: {
  data: any[]
  labelKey: string
  valueKey: string
  color?: string
  height?: number
}) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400">
        Sin datos disponibles
      </div>
    )
  }

  const maxValue = Math.max(...data.map(d => d[valueKey]), 1)

  return (
    <div className="flex items-end justify-between gap-1" style={{ height }}>
      {data.map((item, index) => {
        const heightPercent = (item[valueKey] / maxValue) * 100
        return (
          <div key={index} className="flex-1 flex flex-col items-center group">
            <div className="relative w-full flex justify-center mb-1">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(heightPercent, 2)}%` }}
                transition={{ duration: 0.5, delay: index * 0.03 }}
                className="w-full max-w-[40px] rounded-t-sm cursor-pointer transition-colors"
                style={{
                  backgroundColor: color,
                  opacity: 0.8,
                  minHeight: '4px'
                }}
                whileHover={{ opacity: 1 }}
              />
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                {item[valueKey]} visitas
              </div>
            </div>
            <span className="text-[10px] text-gray-500 truncate max-w-full">
              {item[labelKey]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// Horizontal Bar Component
function HorizontalBar({
  label,
  value,
  maxValue,
  color = '#6366f1',
  rank
}: {
  label: string
  value: number
  maxValue: number
  color?: string
  rank?: number
}) {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0

  return (
    <div className="flex items-center gap-3">
      {rank && (
        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
          rank === 1 ? 'bg-yellow-100 text-yellow-700' :
          rank === 2 ? 'bg-gray-200 text-gray-700' :
          rank === 3 ? 'bg-orange-100 text-orange-700' :
          'bg-gray-100 text-gray-500'
        }`}>
          {rank}
        </span>
      )}
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm text-gray-500">{value}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.6 }}
            className="h-2 rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>
      </div>
    </div>
  )
}

// Star Rating Display
function StarRating({ rating, size = 'sm' }: { rating: number, size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' }
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'
          }`}
        />
      ))}
    </div>
  )
}

// Review Card Component
function ReviewCard({
  zoneName,
  rating,
  feedback,
  date,
  metrics
}: {
  zoneName: string
  rating: number
  feedback: string | null
  date: string
  metrics?: { clarity: number, completeness: number, helpfulness: number, upToDate: number }
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-medium text-gray-900 text-sm">{zoneName}</p>
          <p className="text-xs text-gray-500">{formatTimeAgo(date)}</p>
        </div>
        <StarRating rating={rating} />
      </div>
      {feedback && (
        <p className="text-sm text-gray-600 mb-3 italic">"{feedback}"</p>
      )}
      {metrics && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500">Claridad</span>
            <span className="font-medium">{metrics.clarity}/5</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Completo</span>
            <span className="font-medium">{metrics.completeness}/5</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Útil</span>
            <span className="font-medium">{metrics.helpfulness}/5</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Actualizado</span>
            <span className="font-medium">{metrics.upToDate}/5</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function PropertyAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'zones' | 'reviews'>('overview')
  const router = useRouter()

  useEffect(() => {
    params.then(p => setId(p.id))
  }, [params])

  useEffect(() => {
    if (!id) return

    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/properties/${id}/analytics/detailed`, {
          credentials: 'include'
        })

        const result = await response.json()

        if (result.success) {
          setData(result.data)
        } else {
          setError(result.error || 'Error al cargar analíticas')
        }
      } catch (err) {
        console.error('Error fetching analytics:', err)
        setError('Error de conexión')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando analíticas...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar analíticas</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.back()}>Volver</Button>
        </div>
      </div>
    )
  }

  const maxZoneViews = Math.max(...data.zones.map(z => z.viewCount), 1)
  const dailyViewsData = data.dailyStats.slice(-14).map(d => d.views)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Airbnb Style */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href={`/properties/${id}/zones`}>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Analíticas</h1>
                <p className="text-sm text-gray-500">{data.property.name}</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              {[
                { id: 'overview', label: 'General' },
                { id: 'zones', label: 'Zonas' },
                { id: 'reviews', label: 'Reviews' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Period Selector */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">Últimos 30 días</p>
          {data.summary.lastViewedAt && (
            <p className="text-sm text-gray-500">
              Última visita: {formatTimeAgo(data.summary.lastViewedAt)}
            </p>
          )}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                title="Visitas totales"
                value={data.summary.totalViews}
                icon={Eye}
                color="blue"
              />
              <MetricCard
                title="Visitantes únicos"
                value={data.summary.uniqueVisitors}
                icon={Users}
                color="green"
              />
              <MetricCard
                title="Contactos WhatsApp"
                value={data.summary.whatsappClicks}
                subtitle={`${data.summary.contactRate}% tasa de contacto`}
                icon={MessageCircle}
                color="purple"
              />
              <MetricCard
                title="Valoración media"
                value={data.summary.avgZoneRating > 0 ? data.summary.avgZoneRating.toFixed(1) : '-'}
                subtitle={`${data.summary.totalZoneRatings} valoraciones`}
                icon={Star}
                color="yellow"
              />
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                title="Zonas por sesión"
                value={data.summary.avgZonesPerSession > 0 ? data.summary.avgZonesPerSession.toFixed(1) : '-'}
                subtitle="Media de zonas exploradas"
                icon={Layers}
                color="orange"
              />
              <MetricCard
                title="Engagement"
                value={`${data.summary.engagementRate}%`}
                subtitle="Visitas que exploran zonas"
                icon={Activity}
                color="blue"
              />
              <MetricCard
                title="Tiempo en manual"
                value={data.summary.avgSessionDuration > 0 ? formatDuration(data.summary.avgSessionDuration) : '-'}
                subtitle={data.summary.sessionsWithActivity > 0
                  ? `${data.summary.sessionsWithActivity} sesiones activas`
                  : "Duración media sesión"}
                icon={Clock}
                color="green"
              />
              <MetricCard
                title="Total interacciones"
                value={data.insights.totalZoneViews}
                subtitle="Vistas de zonas"
                icon={Zap}
                color="purple"
              />
            </div>

            {/* Time Stats Card */}
            {data.summary.sessionsWithActivity > 0 && (
              <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Tiempo de uso del manual</h3>
                    <p className="text-sm text-gray-500">Basado en {data.summary.sessionsWithActivity} sesiones activas</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-white/60 rounded-lg">
                    <p className="text-2xl font-bold text-green-700">{formatDuration(data.summary.avgSessionDuration)}</p>
                    <p className="text-xs text-gray-500">Tiempo medio</p>
                  </div>
                  <div className="text-center p-3 bg-white/60 rounded-lg">
                    <p className="text-2xl font-bold text-green-700">{formatDuration(data.summary.maxSessionDuration)}</p>
                    <p className="text-xs text-gray-500">Sesión más larga</p>
                  </div>
                  <div className="text-center p-3 bg-white/60 rounded-lg">
                    <p className="text-2xl font-bold text-green-700">{data.summary.avgPagesPerSession.toFixed(1)}</p>
                    <p className="text-xs text-gray-500">Páginas/sesión</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Activity Chart */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Actividad diaria</h3>
                  <span className="text-sm text-gray-500">Últimos 14 días</span>
                </div>
                <BarChart
                  data={data.dailyStats.slice(-14).map(d => ({
                    label: formatDate(d.date),
                    value: d.views
                  }))}
                  labelKey="label"
                  valueKey="value"
                  color="#6366f1"
                  height={180}
                />
              </Card>

              {/* Activity by Day of Week */}
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Actividad por día</h3>
                <div className="space-y-3">
                  {dayNamesFull.map((day, index) => {
                    const dayData = data.viewsByDayOfWeek.find(d => d.dayOfWeek === index)
                    const count = dayData?.count || 0
                    const maxCount = Math.max(...data.viewsByDayOfWeek.map(d => d.count), 1)
                    return (
                      <HorizontalBar
                        key={index}
                        label={day}
                        value={count}
                        maxValue={maxCount}
                        color="#6366f1"
                      />
                    )
                  })}
                </div>
              </Card>
            </div>

            {/* Insights Cards */}
            {(data.insights.mostViewedZone || data.insights.leastViewedZone) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.insights.mostViewedZone && (
                  <div className="bg-green-50 border border-green-100 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-green-700 font-medium">Zona más popular</p>
                        <p className="text-lg font-bold text-green-900">
                          {getZoneName(data.insights.mostViewedZone.name)}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-green-600">
                      {data.insights.mostViewedZone.views} visitas
                    </p>
                  </div>
                )}
                {data.insights.leastViewedZone && (
                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Target className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-orange-700 font-medium">Oportunidad de mejora</p>
                        <p className="text-lg font-bold text-orange-900">
                          {getZoneName(data.insights.leastViewedZone.name)}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-orange-600">
                      Solo {data.insights.leastViewedZone.views} visitas - considera mejorar su contenido
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Zones Tab */}
        {activeTab === 'zones' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-6">Ranking de zonas por visitas</h3>
              {data.zones.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Layers className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No hay zonas creadas todavía</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.zones.map((zone, index) => (
                    <HorizontalBar
                      key={zone.id}
                      label={getZoneName(zone.name)}
                      value={zone.viewCount}
                      maxValue={maxZoneViews}
                      color={index === 0 ? '#6366f1' : index === 1 ? '#8b5cf6' : index === 2 ? '#a78bfa' : '#c4b5fd'}
                      rank={index + 1}
                    />
                  ))}
                </div>
              )}
            </Card>

            {/* Zone Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-5 text-center">
                <p className="text-3xl font-bold text-gray-900">{data.zones.length}</p>
                <p className="text-sm text-gray-500">Zonas totales</p>
              </Card>
              <Card className="p-5 text-center">
                <p className="text-3xl font-bold text-gray-900">{data.insights.totalZoneViews}</p>
                <p className="text-sm text-gray-500">Vistas de zonas</p>
              </Card>
              <Card className="p-5 text-center">
                <p className="text-3xl font-bold text-gray-900">
                  {data.summary.avgZonesPerSession > 0 ? data.summary.avgZonesPerSession.toFixed(1) : '-'}
                </p>
                <p className="text-sm text-gray-500">Zonas por visita</p>
              </Card>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* Reviews Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {data.summary.avgZoneRating > 0 ? data.summary.avgZoneRating.toFixed(1) : '-'}
                    </p>
                    <p className="text-sm text-gray-500">Valoración media</p>
                  </div>
                </div>
              </Card>
              <Card className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{data.summary.totalZoneRatings}</p>
                    <p className="text-sm text-gray-500">Valoraciones de zonas</p>
                  </div>
                </div>
              </Card>
              <Card className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <ThumbsUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{data.summary.totalRatings}</p>
                    <p className="text-sm text-gray-500">Evaluaciones propiedad</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Zone Reviews */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Valoraciones de zonas</h3>
              {data.zoneReviews.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No hay valoraciones de zonas todavía</p>
                  <p className="text-sm">Las valoraciones aparecerán cuando los huéspedes evalúen las zonas</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.zoneReviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      zoneName={getZoneName(review.zoneName)}
                      rating={review.overallRating}
                      feedback={review.feedback}
                      date={review.createdAt}
                      metrics={{
                        clarity: review.clarity,
                        completeness: review.completeness,
                        helpfulness: review.helpfulness,
                        upToDate: review.upToDate
                      }}
                    />
                  ))}
                </div>
              )}
            </Card>

            {/* Property Evaluations */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Evaluaciones de la propiedad</h3>
              {data.recentEvaluations.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No hay evaluaciones de la propiedad todavía</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.recentEvaluations.map((evaluation) => (
                    <div key={evaluation.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <StarRating rating={evaluation.rating} size="md" />
                      <div className="flex-1">
                        {evaluation.comment && (
                          <p className="text-sm text-gray-700">"{evaluation.comment}"</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimeAgo(evaluation.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Zone Comments */}
            {data.zoneComments.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Comentarios de huéspedes</h3>
                <div className="space-y-4">
                  {data.zoneComments.map((comment) => (
                    <div key={comment.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {getZoneName(comment.zoneName)}
                        </span>
                        <StarRating rating={comment.rating} />
                      </div>
                      <p className="text-sm text-gray-700">"{comment.text}"</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {comment.guestName || 'Anónimo'} · {formatTimeAgo(comment.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
