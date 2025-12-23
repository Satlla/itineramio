'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Megaphone,
  TrendingUp,
  Users,
  Mail,
  Target,
  Flame,
  CheckCircle,
  Clock,
  ArrowRight,
  BarChart3,
  Award,
  Brain,
  PlayCircle,
  MessageSquare,
  AlertTriangle,
  RefreshCw,
  Activity,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Send
} from 'lucide-react'

interface HealthData {
  leads: {
    today: number
    bySource: Record<string, number>
    weekly: number
    dailyAverage: string
  }
  emails: {
    queue: {
      pending: number
      sending: number
      sent: number
      failed: number
    }
    sentToday: number
    sentWeekly: number
    failedByTemplate: { template: string; count: number }[]
  }
  sequences: {
    list: {
      id: string
      name: string
      isActive: boolean
      subscribersActive: number
    }[]
    activeEnrollments: number
    soapOpera: Record<string, number>
  }
  alerts: { level: 'error' | 'warning' | 'info'; message: string }[]
}

interface FunnelStats {
  quiz: {
    total: number
    converted: number
    pending: number
    avgScore: number
  }
  hostProfile: {
    total: number
    withEmail: number
    downloadedGuide: number
    hotLeads: number
    warmLeads: number
    coldLeads: number
  }
  emailSequences: {
    activeSubscribers: number
    totalSent: number
    totalOpened: number
    avgOpenRate: number
  }
}

export default function MarketingFunnelsHub() {
  const [stats, setStats] = useState<FunnelStats | null>(null)
  const [health, setHealth] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchStats()
    fetchHealth()
  }, [])

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/admin/marketing/health')
      const data = await res.json()
      if (data.success) {
        setHealth(data)
      }
    } catch (error) {
      console.error('Error fetching health:', error)
    }
  }

  const refreshAll = async () => {
    setRefreshing(true)
    await Promise.all([fetchStats(), fetchHealth()])
    setRefreshing(false)
  }

  const fetchStats = async () => {
    setLoading(true)
    try {
      // Fetch de múltiples endpoints en paralelo
      const [quizRes, hostProfileRes] = await Promise.all([
        fetch('/api/admin/academia/quiz-leads'),
        fetch('/api/admin/host-profiles')
      ])

      const quizData = await quizRes.json()
      const hostProfileData = await hostProfileRes.json()

      setStats({
        quiz: {
          total: quizData.stats?.total || 0,
          converted: quizData.stats?.converted || 0,
          pending: quizData.stats?.pending || 0,
          avgScore: quizData.stats?.avgScore || 0
        },
        hostProfile: {
          total: hostProfileData.stats?.total || 0,
          withEmail: hostProfileData.stats?.withEmail || 0,
          downloadedGuide: hostProfileData.stats?.downloadedGuide || 0,
          hotLeads: hostProfileData.stats?.byEngagement?.hot || 0,
          warmLeads: hostProfileData.stats?.byEngagement?.warm || 0,
          coldLeads: hostProfileData.stats?.byEngagement?.cold || 0
        },
        emailSequences: {
          activeSubscribers: hostProfileData.stats?.withSubscriber || 0,
          totalSent: hostProfileData.stats?.emailMetrics?.totalSent || 0,
          totalOpened: hostProfileData.stats?.emailMetrics?.totalOpened || 0,
          avgOpenRate: hostProfileData.stats?.emailMetrics?.avgOpenRate || 0
        }
      })
    } catch (error) {
      console.error('Error fetching funnel stats:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calcular métricas globales
  const totalLeads = (stats?.quiz.total || 0) + (stats?.hostProfile.total || 0)
  const totalConverted = (stats?.quiz.converted || 0) + (stats?.hostProfile.downloadedGuide || 0)
  const globalConversionRate = totalLeads > 0 ? ((totalConverted / totalLeads) * 100).toFixed(1) : '0'
  const totalActiveInFunnel = (stats?.quiz.pending || 0) + (stats?.hostProfile.withEmail || 0) - (stats?.hostProfile.downloadedGuide || 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <Target className="w-8 h-8 mr-3" />
                Embudos de Conversión
              </h1>
              <p className="text-purple-100 mt-2">
                Vista unificada de todos los embudos de marketing y conversión
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={refreshAll}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
              <Link
                href="/admin"
                className="text-white/80 hover:text-white flex items-center"
              >
                Volver
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Health Monitor */}
      {health && (
        <div className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* Alerts */}
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-green-400" />
                <span className="text-sm font-medium">Estado del Sistema:</span>
                {health.alerts.map((alert, i) => (
                  <span
                    key={i}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                      alert.level === 'error' ? 'bg-red-500/20 text-red-300' :
                      alert.level === 'warning' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-green-500/20 text-green-300'
                    }`}
                  >
                    {alert.level === 'error' ? <XCircle className="w-3 h-3" /> :
                     alert.level === 'warning' ? <AlertCircle className="w-3 h-3" /> :
                     <CheckCircle2 className="w-3 h-3" />}
                    {alert.message}
                  </span>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-400">Hoy:</span>
                  <span className="font-bold">{health.leads.today} leads</span>
                </div>
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-green-400" />
                  <span className="text-gray-400">Enviados:</span>
                  <span className="font-bold">{health.emails.sentToday}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-400">Pending:</span>
                  <span className="font-bold">{health.emails.queue.pending}</span>
                </div>
                {health.emails.queue.failed > 0 && (
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="text-gray-400">Failed:</span>
                    <span className="font-bold text-red-400">{health.emails.queue.failed}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Global Metrics */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Cargando estadísticas...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-6 h-6 text-purple-600" />
                  <h3 className="text-sm font-semibold text-gray-600">Total Leads</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{totalLeads}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Todos los embudos combinados
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h3 className="text-sm font-semibold text-gray-600">Convertidos</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{totalConverted}</p>
                <p className="text-sm text-green-600 mt-1">
                  {globalConversionRate}% tasa de conversión
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-6 h-6 text-orange-600" />
                  <h3 className="text-sm font-semibold text-gray-600">En Progreso</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{totalActiveInFunnel}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Activos en algún embudo
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Flame className="w-6 h-6 text-red-600" />
                  <h3 className="text-sm font-semibold text-gray-600">Hot Leads</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats?.hostProfile.hotLeads || 0}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Alto engagement
                </p>
              </motion.div>
            </div>

            {/* Funnel Cards */}
            <div className="space-y-6">
              {/* Base de Datos de Leads - Card Principal */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Users className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Base de Datos de Leads</h2>
                        <p className="text-purple-100">Todos los leads unificados de todos los embudos</p>
                      </div>
                    </div>
                    <Link
                      href="/admin/marketing/leads"
                      className="flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-semibold"
                    >
                      Ver Todos los Leads
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="w-5 h-5 text-white" />
                        <span className="text-sm font-medium text-white">Total Leads</span>
                      </div>
                      <div className="text-2xl font-bold text-white">{totalLeads}</div>
                      <div className="text-xs text-purple-100 mt-1">Todos los embudos</div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-5 h-5 text-white" />
                        <span className="text-sm font-medium text-white">Con Email</span>
                      </div>
                      <div className="text-2xl font-bold text-white">{(stats?.hostProfile.withEmail || 0)}</div>
                      <div className="text-xs text-purple-100 mt-1">Emails activos</div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Flame className="w-5 h-5 text-white" />
                        <span className="text-sm font-medium text-white">Hot Leads</span>
                      </div>
                      <div className="text-2xl font-bold text-white">{stats?.hostProfile.hotLeads || 0}</div>
                      <div className="text-xs text-purple-100 mt-1">Alto engagement</div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-white" />
                        <span className="text-sm font-medium text-white">Fuentes</span>
                      </div>
                      <div className="text-2xl font-bold text-white">4+</div>
                      <div className="text-xs text-purple-100 mt-1">Canales activos</div>
                    </div>
                  </div>

                  <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <p className="text-sm text-purple-100">
                      💡 <strong className="text-white">Tip:</strong> Filtra por fuente (academia, test personalidad, quiz) y exporta en CSV
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Quiz Airbnb Funnel */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="border-l-4 border-blue-500">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Brain className="w-7 h-7 text-blue-600" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">Quiz de Airbnb</h2>
                          <p className="text-gray-600">Test de conocimiento para generar leads educativos</p>
                        </div>
                      </div>
                      <Link
                        href="/admin/academia/quiz-leads"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Ver Embudo
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>

                    {/* Funnel Flow */}
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <PlayCircle className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">Completados</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-900">{stats?.quiz.total}</div>
                        <div className="text-xs text-blue-700 mt-1">100%</div>
                      </div>

                      <div className="bg-orange-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-5 h-5 text-orange-600" />
                          <span className="text-sm font-medium text-orange-900">Pendientes</span>
                        </div>
                        <div className="text-2xl font-bold text-orange-900">{stats?.quiz.pending}</div>
                        <div className="text-xs text-orange-700 mt-1">
                          {stats?.quiz.total > 0 ? ((stats.quiz.pending / stats.quiz.total) * 100).toFixed(0) : 0}%
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium text-green-900">Convertidos</span>
                        </div>
                        <div className="text-2xl font-bold text-green-900">{stats?.quiz.converted}</div>
                        <div className="text-xs text-green-700 mt-1">
                          {stats?.quiz.total > 0 ? ((stats.quiz.converted / stats.quiz.total) * 100).toFixed(0) : 0}%
                        </div>
                      </div>

                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="w-5 h-5 text-purple-600" />
                          <span className="text-sm font-medium text-purple-900">Puntuación Media</span>
                        </div>
                        <div className="text-2xl font-bold text-purple-900">{stats?.quiz.avgScore}/100</div>
                        <div className="text-xs text-purple-700 mt-1">Promedio</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Host Profile Test Funnel */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="border-l-4 border-purple-500">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                          <Target className="w-7 h-7 text-purple-600" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">Test de Perfil Operativo</h2>
                          <p className="text-gray-600">Test de personalidad para segmentar anfitriones</p>
                        </div>
                      </div>
                      <Link
                        href="/admin/host-profiles"
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Ver Embudo
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>

                    {/* Funnel Flow */}
                    <div className="grid grid-cols-5 gap-4">
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <PlayCircle className="w-5 h-5 text-purple-600" />
                          <span className="text-sm font-medium text-purple-900">Tests</span>
                        </div>
                        <div className="text-2xl font-bold text-purple-900">{stats?.hostProfile.total}</div>
                        <div className="text-xs text-purple-700 mt-1">100%</div>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Mail className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">Con Email</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-900">{stats?.hostProfile.withEmail}</div>
                        <div className="text-xs text-blue-700 mt-1">
                          {stats?.hostProfile.total > 0 ? ((stats.hostProfile.withEmail / stats.hostProfile.total) * 100).toFixed(0) : 0}%
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium text-green-900">Descargaron</span>
                        </div>
                        <div className="text-2xl font-bold text-green-900">{stats?.hostProfile.downloadedGuide}</div>
                        <div className="text-xs text-green-700 mt-1">
                          {stats?.hostProfile.withEmail > 0 ? ((stats.hostProfile.downloadedGuide / stats.hostProfile.withEmail) * 100).toFixed(0) : 0}%
                        </div>
                      </div>

                      <div className="bg-red-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Flame className="w-5 h-5 text-red-600" />
                          <span className="text-sm font-medium text-red-900">Hot</span>
                        </div>
                        <div className="text-2xl font-bold text-red-900">{stats?.hostProfile.hotLeads}</div>
                        <div className="text-xs text-red-700 mt-1">Alto engage</div>
                      </div>

                      <div className="bg-yellow-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-5 h-5 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-900">Warm</span>
                        </div>
                        <div className="text-2xl font-bold text-yellow-900">{stats?.hostProfile.warmLeads}</div>
                        <div className="text-xs text-yellow-700 mt-1">Medio engage</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Email Sequences */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="border-l-4 border-green-500">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                          <MessageSquare className="w-7 h-7 text-green-600" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">Secuencias de Email</h2>
                          <p className="text-gray-600">Nurturing automático de leads captados</p>
                        </div>
                      </div>
                      <Link
                        href="/admin/blog/suscriptores"
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Ver Suscriptores
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>

                    {/* Email Stats */}
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium text-green-900">Activos</span>
                        </div>
                        <div className="text-2xl font-bold text-green-900">{stats?.emailSequences.activeSubscribers}</div>
                        <div className="text-xs text-green-700 mt-1">Suscriptores</div>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Mail className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">Enviados</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-900">{stats?.emailSequences.totalSent}</div>
                        <div className="text-xs text-blue-700 mt-1">Total emails</div>
                      </div>

                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-purple-600" />
                          <span className="text-sm font-medium text-purple-900">Abiertos</span>
                        </div>
                        <div className="text-2xl font-bold text-purple-900">{stats?.emailSequences.totalOpened}</div>
                        <div className="text-xs text-purple-700 mt-1">Total opens</div>
                      </div>

                      <div className="bg-orange-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="w-5 h-5 text-orange-600" />
                          <span className="text-sm font-medium text-orange-900">Open Rate</span>
                        </div>
                        <div className="text-2xl font-bold text-orange-900">{stats?.emailSequences.avgOpenRate.toFixed(1)}%</div>
                        <div className="text-xs text-orange-700 mt-1">Promedio</div>
                      </div>
                    </div>

                    {/* Sequence Timeline */}
                    <div className="mt-6 bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Secuencia Activa:</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Día 0: Bienvenida</span>
                        <span className="mx-2">→</span>
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>Día 3: Errores comunes</span>
                        <span className="mx-2">→</span>
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>Día 7: Case study</span>
                        <span className="mx-2">→</span>
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>Día 10: Trial</span>
                        <span className="mx-2">→</span>
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>Día 14: Urgencia</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
