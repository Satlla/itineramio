'use client'

import { useState, useEffect } from 'react'
import { Mail, TrendingUp, Users, UserCheck, Download, Search, Filter } from 'lucide-react'

interface QuizLead {
  id: string
  email: string
  fullName: string | null
  score: number
  level: string
  timeElapsed: number
  converted: boolean
  completedAt: string
  source: string
  emailVerified: boolean
  verifiedAt: string | null
}

export default function QuizLeadsPage() {
  const [leads, setLeads] = useState<QuizLead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLevel, setFilterLevel] = useState<string>('ALL')
  const [filterConverted, setFilterConverted] = useState<string>('ALL')
  const [filterVerified, setFilterVerified] = useState<string>('ALL')

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/admin/academia/quiz-leads')
      const data = await response.json()
      setLeads(data.leads || [])
    } catch (error) {
      console.error('Error fetching quiz leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    const headers = ['Email', 'Nombre', 'Puntuación', 'Nivel', 'Verificado', 'Convertido', 'Tiempo (seg)', 'Fecha']
    const rows = filteredLeads.map(lead => [
      lead.email,
      lead.fullName || 'N/A',
      lead.score,
      lead.level,
      lead.emailVerified ? 'Sí' : 'No',
      lead.converted ? 'Sí' : 'No',
      lead.timeElapsed,
      new Date(lead.completedAt).toLocaleDateString('es-ES')
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quiz-leads-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || false)

    const matchesLevel = filterLevel === 'ALL' || lead.level === filterLevel
    const matchesConverted =
      filterConverted === 'ALL' ||
      (filterConverted === 'CONVERTED' && lead.converted) ||
      (filterConverted === 'NOT_CONVERTED' && !lead.converted)
    const matchesVerified =
      filterVerified === 'ALL' ||
      (filterVerified === 'VERIFIED' && lead.emailVerified) ||
      (filterVerified === 'NOT_VERIFIED' && !lead.emailVerified)

    return matchesSearch && matchesLevel && matchesConverted && matchesVerified
  })

  const stats = {
    total: leads.length,
    verified: leads.filter(l => l.emailVerified).length,
    converted: leads.filter(l => l.converted).length,
    notConverted: leads.filter(l => !l.converted).length,
    avgScore: leads.length > 0 ? Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length) : 0
  }

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'BASIC': return 'bg-green-100 text-green-800'
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800'
      case 'ADVANCED': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'BASIC': return 'Principiante'
      case 'INTERMEDIATE': return 'Intermedio'
      case 'ADVANCED': return 'Avanzado'
      default: return level
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Leads</h1>
          <p className="text-gray-600">Todos los usuarios que han completado el quiz de Airbnb</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Leads</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Verificados</p>
                <p className="text-3xl font-bold text-blue-600">{stats.verified}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Convertidos</p>
                <p className="text-3xl font-bold text-green-600">{stats.converted}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Sin Convertir</p>
                <p className="text-3xl font-bold text-orange-600">{stats.notConverted}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Puntuación Media</p>
                <p className="text-3xl font-bold text-purple-600">{stats.avgScore}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por email o nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Level Filter */}
            <div>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="ALL">Todos los niveles</option>
                <option value="BASIC">Principiante</option>
                <option value="INTERMEDIATE">Intermedio</option>
                <option value="ADVANCED">Avanzado</option>
              </select>
            </div>

            {/* Verification Filter */}
            <div>
              <select
                value={filterVerified}
                onChange={(e) => setFilterVerified(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="ALL">Todos</option>
                <option value="VERIFIED">Verificados</option>
                <option value="NOT_VERIFIED">Sin verificar</option>
              </select>
            </div>

            {/* Conversion Filter */}
            <div>
              <select
                value={filterConverted}
                onChange={(e) => setFilterConverted(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="ALL">Todos</option>
                <option value="CONVERTED">Convertidos</option>
                <option value="NOT_CONVERTED">Sin convertir</option>
              </select>
            </div>
          </div>

          {/* Export Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <Download className="w-4 h-4" />
              Exportar CSV ({filteredLeads.length})
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Puntuación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nivel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tiempo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No se encontraron leads
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {lead.fullName || 'Sin nombre'}
                          </div>
                          <div className="text-sm text-gray-500">{lead.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{lead.score}/100</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelBadgeColor(lead.level)}`}>
                          {getLevelLabel(lead.level)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {Math.floor(lead.timeElapsed / 60)}:{(lead.timeElapsed % 60).toString().padStart(2, '0')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {lead.converted ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            ✓ Registrado
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                            ⏳ Pendiente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(lead.completedAt).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-center text-sm text-gray-600">
          Mostrando {filteredLeads.length} de {leads.length} leads
        </div>
      </div>
    </div>
  )
}
