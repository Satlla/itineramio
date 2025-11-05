'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Filter, Users, Mail, Calendar, TrendingUp } from 'lucide-react'
import { archetypeDescriptions, type Archetype } from '@/src/data/hostProfileQuestions'

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
}

interface Stats {
  total: number
  withEmail: number
  withoutEmail: number
  byArchetype: Record<string, number>
}

export default function HostProfilesAdminPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Perfiles Operativos
          </h1>
          <p className="text-gray-600">
            Segmenta y exporta leads del test de perfil operativo
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                <TrendingUp className="w-6 h-6 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-600">Sin Email</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.withoutEmail}</p>
              <p className="text-sm text-gray-500">
                Oportunidad de remarketing
              </p>
            </motion.div>
          </div>
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
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Arquetipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fortaleza
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gap Crítico
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Consent
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {profile.email ? (
                            <span className="text-gray-900">{profile.email}</span>
                          ) : (
                            <span className="text-gray-400 italic">Sin email</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {profile.name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span>{info.icon}</span>
                            <span className="text-sm font-medium text-gray-900">
                              {info.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {profile.topStrength}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {profile.criticalGap}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {profile.emailConsent ? (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              Sí
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                              No
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
