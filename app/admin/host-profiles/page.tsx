'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Filter, Users, Mail, Calendar, Flame, Trash2, Eye, X, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react'
import { archetypeDescriptions, type Archetype } from '@/data/hostProfileQuestions'
import Link from 'next/link'

interface Subscriber {
  engagementScore: string
  currentJourneyStage: string
  emailsSent: number
  emailsOpened: number
  emailsClicked: number
  downloadedGuide: boolean
  day3SentAt: string | null
  day7SentAt: string | null
  day10SentAt: string | null
  day14SentAt: string | null
  sequenceStatus: string
  lastEngagement: string | null
  openRate: number
  clickRate: number
}

interface Profile {
  id: string
  createdAt: string
  email: string | null
  name: string | null
  gender: string | null
  archetype: Archetype
  topStrength: string
  criticalGap: string
  emailConsent: boolean
  shareConsent: boolean
  subscriber: Subscriber | null
}

interface Stats {
  total: number
  withEmail: number
  withoutEmail: number
  byArchetype: Record<string, number>
  withSubscriber: number
  downloadedGuide: number
  byEngagement: {
    hot: number
    warm: number
    cold: number
  }
}

export default function HostProfilesAdminPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)

  // Filters
  const [archetypeFilter, setArchetypeFilter] = useState<string>('ALL')
  const [emailFilter, setEmailFilter] = useState<string>('ALL')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const fetchProfiles = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()

      if (archetypeFilter !== 'ALL') params.set('archetype', archetypeFilter)
      if (emailFilter === 'WITH') params.set('hasEmail', 'true')
      if (emailFilter === 'WITHOUT') params.set('hasEmail', 'false')
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)

      const response = await fetch(`/api/admin/host-profiles?${params}`)
      const data = await response.json()

      setProfiles(data.profiles || [])
      setStats(data.stats || null)
    } catch (error) {
      console.error('Error fetching profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfiles()
  }, [archetypeFilter, emailFilter, dateFrom, dateTo])

  const handleExportCSV = () => {
    const params = new URLSearchParams()
    params.set('export', 'csv')

    if (archetypeFilter !== 'ALL') params.set('archetype', archetypeFilter)
    if (emailFilter === 'WITH') params.set('hasEmail', 'true')
    if (emailFilter === 'WITHOUT') params.set('hasEmail', 'false')
    if (dateFrom) params.set('dateFrom', dateFrom)
    if (dateTo) params.set('dateTo', dateTo)

    window.location.href = `/api/admin/host-profiles?${params}`
  }

  const handleDelete = async (email: string) => {
    if (!confirm(`¿Eliminar usuario ${email}? Esta acción no se puede deshacer.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/host-profiles?email=${encodeURIComponent(email)}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Usuario eliminado correctamente')
        fetchProfiles()
      } else {
        alert('Error al eliminar usuario')
      }
    } catch (error) {
      console.error('Error deleting:', error)
      alert('Error al eliminar usuario')
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEngagementColor = (score: string) => {
    switch (score) {
      case 'hot': return 'bg-red-100 text-red-800'
      case 'warm': return 'bg-yellow-100 text-yellow-800'
      case 'cold': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getJourneyColor = (stage: string) => {
    switch (stage) {
      case 'subscribed': return 'bg-purple-100 text-purple-800'
      case 'guide_downloaded': return 'bg-green-100 text-green-800'
      case 'engaged': return 'bg-blue-100 text-blue-800'
      case 'customer': return 'bg-emerald-100 text-emerald-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/admin/marketing"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver a Embudos</span>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Perfiles Operativos
          </h1>
          <p className="text-gray-600">
            Segmenta, monitorea el funnel y gestiona leads del test de perfil operativo
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-6 h-6 text-purple-600" />
                  <h3 className="text-sm font-semibold text-gray-600">Total Tests</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="w-6 h-6 text-green-600" />
                  <h3 className="text-sm font-semibold text-gray-600">Con Email</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.withEmail}</p>
                <p className="text-sm text-gray-500">
                  {((stats.withEmail / stats.total) * 100).toFixed(1)}% conversión
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                  <h3 className="text-sm font-semibold text-gray-600">Descargaron Guía</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.downloadedGuide}</p>
                <p className="text-sm text-gray-500">
                  {stats.withEmail > 0 ? ((stats.downloadedGuide / stats.withEmail) * 100).toFixed(1) : 0}% de emails
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Flame className="w-6 h-6 text-orange-600" />
                  <h3 className="text-sm font-semibold text-gray-600">Hot Leads</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.byEngagement.hot}</p>
                <p className="text-sm text-gray-500">
                  {stats.byEngagement.warm} warm · {stats.byEngagement.cold} cold
                </p>
              </motion.div>
            </div>
          </>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Archetype Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arquetipo
              </label>
              <select
                value={archetypeFilter}
                onChange={(e) => setArchetypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="ALL">Todos</option>
                {Object.keys(archetypeDescriptions).map(archetype => (
                  <option key={archetype} value={archetype}>
                    {archetypeDescriptions[archetype as Archetype].name}
                  </option>
                ))}
              </select>
            </div>

            {/* Email Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <select
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="ALL">Todos</option>
                <option value="WITH">Con email</option>
                <option value="WITHOUT">Sin email</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desde
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hasta
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              <Download className="w-5 h-5" />
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Archetype Distribution */}
        {stats && stats.byArchetype && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Distribución por Arquetipo
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.byArchetype).map(([archetype, count]) => {
                const info = archetypeDescriptions[archetype as Archetype]
                const percentage = ((count / stats.total) * 100).toFixed(1)

                return (
                  <div
                    key={archetype}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-400 transition-colors"
                  >
                    <div className="text-3xl mb-2">{info.icon}</div>
                    <div className="text-sm font-semibold text-gray-700 mb-1">
                      {info.name}
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {count}
                    </div>
                    <div className="text-xs text-gray-500">
                      {percentage}%
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Profiles Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Perfiles ({profiles.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-gray-500">
                Cargando...
              </div>
            ) : profiles.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                No se encontraron perfiles con los filtros seleccionados
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Arquetipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Engagement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Journey
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Emails
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {profiles.map((profile) => {
                    const info = archetypeDescriptions[profile.archetype]
                    return (
                      <tr key={profile.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(profile.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {profile.name || 'Sin nombre'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {profile.email || 'Sin email'}
                            </div>
                            {profile.gender && (
                              <div className="text-xs text-gray-400">
                                {profile.gender === 'M' ? 'Masculino' : profile.gender === 'F' ? 'Femenino' : 'Otro'}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span>{info.icon}</span>
                            <span className="text-sm font-medium text-gray-900">
                              {info.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {profile.subscriber ? (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEngagementColor(profile.subscriber.engagementScore)}`}>
                              {profile.subscriber.engagementScore.toUpperCase()}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {profile.subscriber ? (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getJourneyColor(profile.subscriber.currentJourneyStage)}`}>
                              {profile.subscriber.currentJourneyStage.replace('_', ' ')}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {profile.subscriber ? (
                            <div>
                              <div>{profile.subscriber.emailsSent} enviados</div>
                              <div className="text-xs text-gray-500">
                                {profile.subscriber.emailsOpened} abiertos
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedProfile(profile)}
                              className="text-purple-600 hover:text-purple-900"
                              title="Ver detalles"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            {profile.email && (
                              <button
                                onClick={() => handleDelete(profile.email!)}
                                className="text-red-600 hover:text-red-900"
                                title="Eliminar"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Detail Modal */}
        <AnimatePresence>
          {selectedProfile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedProfile(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Detalles del Perfil
                  </h2>
                  <button
                    onClick={() => setSelectedProfile(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Info Personal */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Información Personal</h3>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                    <div>
                      <div className="text-sm text-gray-500">Nombre</div>
                      <div className="font-medium">{selectedProfile.name || '-'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <div className="font-medium">{selectedProfile.email || '-'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Género</div>
                      <div className="font-medium">
                        {selectedProfile.gender === 'M' ? 'Masculino' : selectedProfile.gender === 'F' ? 'Femenino' : selectedProfile.gender === 'O' ? 'Otro' : '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Fecha</div>
                      <div className="font-medium">{formatDate(selectedProfile.createdAt)}</div>
                    </div>
                  </div>
                </div>

                {/* Arquetipo */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Arquetipo</h3>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{archetypeDescriptions[selectedProfile.archetype].icon}</span>
                      <div>
                        <div className="font-bold text-lg">{archetypeDescriptions[selectedProfile.archetype].name}</div>
                        <div className="text-sm text-gray-600">{archetypeDescriptions[selectedProfile.archetype].description}</div>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-sm text-gray-500">Fortaleza Principal</div>
                        <div className="font-medium text-green-700">{selectedProfile.topStrength}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Gap Crítico</div>
                        <div className="font-medium text-orange-700">{selectedProfile.criticalGap}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Funnel Tracking */}
                {selectedProfile.subscriber && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Tracking del Embudo</h3>
                    <div className="space-y-3">
                      {/* Engagement & Journey */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-sm text-gray-500 mb-1">Engagement Score</div>
                          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getEngagementColor(selectedProfile.subscriber.engagementScore)}`}>
                            {selectedProfile.subscriber.engagementScore.toUpperCase()}
                          </span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-sm text-gray-500 mb-1">Journey Stage</div>
                          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getJourneyColor(selectedProfile.subscriber.currentJourneyStage)}`}>
                            {selectedProfile.subscriber.currentJourneyStage.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Email Stats */}
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-blue-900">{selectedProfile.subscriber.emailsSent}</div>
                            <div className="text-xs text-blue-700">Enviados</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-blue-900">{selectedProfile.subscriber.emailsOpened}</div>
                            <div className="text-xs text-blue-700">Abiertos</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-blue-900">{(selectedProfile.subscriber.openRate * 100).toFixed(0)}%</div>
                            <div className="text-xs text-blue-700">Open Rate</div>
                          </div>
                        </div>
                      </div>

                      {/* Sequence Progress */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm font-semibold text-gray-700 mb-3">Secuencia de Emails</div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm">Día 0 - Bienvenida</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {selectedProfile.subscriber.day3SentAt ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm">Día 3 - Errores comunes ({formatDate(selectedProfile.subscriber.day3SentAt)})</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500">Día 3 - Pendiente</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {selectedProfile.subscriber.day7SentAt ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm">Día 7 - Case Study ({formatDate(selectedProfile.subscriber.day7SentAt)})</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500">Día 7 - Pendiente</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {selectedProfile.subscriber.day10SentAt ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm">Día 10 - Trial ({formatDate(selectedProfile.subscriber.day10SentAt)})</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500">Día 10 - Pendiente</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {selectedProfile.subscriber.day14SentAt ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm">Día 14 - Urgencia ({formatDate(selectedProfile.subscriber.day14SentAt)})</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500">Día 14 - Pendiente</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          {selectedProfile.subscriber.downloadedGuide ? (
                            <>
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <span className="font-medium text-green-900">Descargó la guía personalizada</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-5 h-5 text-gray-400" />
                              <span className="text-gray-600">No ha descargado la guía</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!selectedProfile.subscriber && selectedProfile.email && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <Clock className="w-5 h-5" />
                      <span className="font-medium">Este usuario aún no está en el sistema de email marketing</span>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
