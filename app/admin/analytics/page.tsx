'use client'

import React, { useState, useEffect } from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import {
  TrendingUp,
  Users,
  Eye,
  MessageSquare,
  Building2,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  Activity,
  Globe,
  Clock,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

interface AnalyticsData {
  visits?: {
    topZones: any[]
    dailyVisits: any[]
    totalVisits: number
  }
  chatbot?: {
    totalInteractions: number
    dailyUsage: any[]
    recentInteractions: any[]
  }
  users?: {
    growth: any[]
    newUsers: number
    activeUsers: number
  }
  properties?: {
    performance: any[]
    totalProperties: number
    publishedProperties: number
  }
  performance?: {
    totalZones: number
    totalProperties: number
    totalUsers: number
    totalViews: { _sum: { viewCount: number } }
    avgViewsPerZone: number
  }
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  change,
  trend 
}: { 
  title: string
  value: string | number
  icon: any
  color: string
  change?: string
  trend?: 'up' | 'down' | 'neutral'
}) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
    <div className="flex items-center justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-600 truncate">{title}</p>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{value}</p>
        {change && (
          <div className="flex items-center mt-1">
            {trend === 'up' && <ArrowUp className="w-4 h-4 text-green-500 mr-1" />}
            {trend === 'down' && <ArrowDown className="w-4 h-4 text-red-500 mr-1" />}
            <p className={`text-sm ${
              trend === 'up' ? 'text-green-600' : 
              trend === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {change}
            </p>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
)

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({})
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('all')

  useEffect(() => {
    fetchAnalytics()
  }, [timeframe, selectedMetric])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/analytics?timeframe=${timeframe}&metric=${selectedMetric}`)
      const data = await response.json()
      
      if (data.success) {
        setAnalytics(data.analytics)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const timeframeOptions = [
    { value: '7d', label: 'Últimos 7 días' },
    { value: '30d', label: 'Últimos 30 días' },
    { value: '90d', label: 'Últimos 90 días' },
    { value: '1y', label: 'Último año' }
  ]

  const metricOptions = [
    { value: 'all', label: 'Todas las métricas' },
    { value: 'visits', label: 'Visitas' },
    { value: 'chatbot', label: 'Chatbot' },
    { value: 'users', label: 'Usuarios' },
    { value: 'properties', label: 'Propiedades' }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Análisis detallado del rendimiento de la plataforma
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            {timeframeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            {metricOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          
          <button
            onClick={fetchAnalytics}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      {analytics.performance && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <StatCard
            title="Total Vistas"
            value={analytics.performance.totalViews._sum.viewCount || 0}
            icon={Eye}
            color="bg-blue-500"
            change={`${analytics.performance.avgViewsPerZone} promedio por zona`}
            trend="up"
          />
          
          <StatCard
            title="Usuarios Totales"
            value={analytics.performance.totalUsers}
            icon={Users}
            color="bg-green-500"
            change={analytics.users ? `${analytics.users.activeUsers} activos` : ''}
          />
          
          <StatCard
            title="Propiedades"
            value={analytics.performance.totalProperties}
            icon={Building2}
            color="bg-purple-500"
            change={analytics.properties ? `${analytics.properties.publishedProperties} publicadas` : ''}
          />
          
          <StatCard
            title="Zonas Totales"
            value={analytics.performance.totalZones}
            icon={Globe}
            color="bg-orange-500"
          />
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Daily Visits Chart */}
        {analytics.visits && analytics.visits.dailyVisits.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
              Visitas Diarias
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.visits.dailyVisits}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  fontSize={12}
                />
                <YAxis fontSize={12} />
                <Tooltip 
                  labelFormatter={(value) => formatDate(value as string)}
                  formatter={(value: any) => [value, 'Visitas']}
                />
                <Area 
                  type="monotone" 
                  dataKey="visits" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Zones */}
        {analytics.visits && analytics.visits.topZones.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
              Zonas Más Visitadas
            </h3>
            <div className="space-y-3">
              {analytics.visits.topZones.slice(0, 5).map((zone, index) => (
                <div key={zone.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{zone.name}</p>
                    <p className="text-sm text-gray-600 truncate">
                      {zone.property?.name} - {zone.property?.city}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      #{index + 1}
                    </span>
                    <span className="font-bold text-gray-900">{zone.viewCount || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chatbot Usage */}
        {analytics.chatbot && analytics.chatbot.dailyUsage.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-purple-500" />
              Uso del Chatbot
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.chatbot.dailyUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  fontSize={12}
                />
                <YAxis fontSize={12} />
                <Tooltip 
                  labelFormatter={(value) => formatDate(value as string)}
                  formatter={(value: any) => [value, 'Interacciones']}
                />
                <Line 
                  type="monotone" 
                  dataKey="interactions" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* User Growth */}
        {analytics.users && analytics.users.growth.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-green-500" />
              Crecimiento de Usuarios
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.users.growth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  fontSize={12}
                />
                <YAxis fontSize={12} />
                <Tooltip 
                  labelFormatter={(value) => formatDate(value as string)}
                />
                <Bar dataKey="new_users" fill="#22c55e" name="Nuevos Usuarios" />
                <Bar dataKey="active_users" fill="#3b82f6" name="Usuarios Activos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Property Performance Table */}
      {analytics.properties && analytics.properties.performance.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-purple-500" />
              Rendimiento de Propiedades
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Propiedad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zonas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Vistas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.properties.performance.slice(0, 10).map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{property.name}</div>
                        <div className="text-sm text-gray-500">ID: {property.id.slice(0, 8)}...</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {property.city}, {property.country}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {property.zonesCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm font-medium text-gray-900">{property.totalViews}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        property.isPublished 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {property.isPublished ? 'Publicada' : 'Borrador'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}