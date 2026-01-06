'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import {
  Eye,
  Clock,
  Users,
  Star,
  TrendingUp,
  Calendar,
  Timer,
  ArrowUp,
  ArrowDown,
  MapPin
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../src/components/ui/Card'
import { Button } from '../../../src/components/ui/Button'
import { useAuth } from '../../../src/providers/AuthProvider'
import { AnimatedLoadingSpinner } from '../../../src/components/ui/AnimatedLoadingSpinner'
import { useTranslation } from 'react-i18next'

interface PropertyAnalytics {
  id: string
  name: string
  views: number
  avgTimeSpent: number
  completionRate: number
  avgRating: number
  timeSavedMinutes: number
  zonesCount: number
  topZones: Array<{
    name: string
    views: number
    avgTimeSpent: number
    completionRate: number
  }>
}

interface AnalyticsData {
  properties: PropertyAnalytics[]
  totals: {
    totalViews: number
    totalTimeSaved: number
    avgCompletionRate: number
    avgRating: number
  }
  trends: Array<{
    date: string
    views: number
    completions: number
  }>
}

const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444']

export default function AnalyticsPage() {
  const { user } = useAuth()
  const { t } = useTranslation('dashboard')
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('30d')
  const [data, setData] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeframe])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics/detailed?timeframe=${timeframe}`)
      const result = await response.json()
      
      if (response.ok && result.data) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <AnimatedLoadingSpinner text={t('analytics.loading')} type="general" />
  }

  const properties = data?.properties || []
  const totals = data?.totals || { totalViews: 0, totalTimeSaved: 0, avgCompletionRate: 0, avgRating: 0 }
  const trends = data?.trends || []

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {t('analytics.title')}
                </h1>
                <p className="text-gray-600 mt-2">
                  {t('analytics.subtitle')}
                </p>
              </div>
              <div className="flex space-x-2">
                {['7d', '30d', '90d'].map((period) => (
                  <Button
                    key={period}
                    variant={timeframe === period ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimeframe(period)}
                  >
                    {t(`analytics.periods.${period}`)}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Summary Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t('analytics.totalViews')}</p>
                    <p className="text-2xl font-bold text-gray-900">{totals.totalViews.toLocaleString()}</p>
                  </div>
                  <Eye className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t('analytics.timeSaved')}</p>
                    <p className="text-2xl font-bold text-gray-900">{Math.round(totals.totalTimeSaved / 60)}h</p>
                  </div>
                  <Timer className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t('analytics.completionRate')}</p>
                    <p className="text-2xl font-bold text-gray-900">{Number(totals.avgCompletionRate).toFixed(1)}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t('analytics.avgRating')}</p>
                    <p className="text-2xl font-bold text-gray-900">{Number(totals.avgRating).toFixed(1)}</p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Views Trend Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>{t('analytics.viewsTrend')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="views" stroke="#8B5CF6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Property Performance Pie Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>{t('analytics.viewsDistribution')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={properties.slice(0, 5)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${Number((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="views"
                      >
                        {properties.slice(0, 5).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Properties Performance Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{t('analytics.propertyPerformance')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">{t('analytics.table.property')}</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">{t('analytics.table.views')}</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">{t('analytics.table.avgTime')}</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">{t('analytics.table.completion')}</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">{t('analytics.table.rating')}</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">{t('analytics.table.timeSaved')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {properties.map((property, index) => (
                        <tr key={property.id} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                              <div>
                                <p className="font-medium text-gray-900">{property.name}</p>
                                <p className="text-sm text-gray-500">{property.zonesCount} {t('analytics.zones')}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <span className="font-medium">{property.views.toLocaleString()}</span>
                              <Eye className="h-4 w-4 text-gray-400 ml-1" />
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <span>{Math.round(property.avgTimeSpent / 60)}min</span>
                              <Clock className="h-4 w-4 text-gray-400 ml-1" />
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <span className={`font-medium ${
                                property.completionRate >= 80 ? 'text-green-600' : 
                                property.completionRate >= 60 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {Number(property.completionRate).toFixed(1)}%
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <span className="font-medium">{Number(property.avgRating).toFixed(1)}</span>
                              <Star className="h-4 w-4 text-yellow-500 ml-1" />
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <span className="font-medium text-green-600">
                                {Math.round(property.timeSavedMinutes / 60)}h
                              </span>
                              <Timer className="h-4 w-4 text-green-500 ml-1" />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}