'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  Mail,
  Trash2,
  Download,
  Search,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  Tag,
  Eye
} from 'lucide-react'
import Link from 'next/link'
import { LeadDetailModal } from '@/components/admin/LeadDetailModal'

interface AcademiaLead {
  id: string
  email: string
  name: string | null
  source: string
  status: string
  tags: string[]
  createdAt: string
  unsubscribedAt: string | null
}

interface Stats {
  total: number
  active: number
  unsubscribed: number
  quizLeads: number
}

export default function AcademiaLeadsPage() {
  const [leads, setLeads] = useState<AcademiaLead[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, unsubscribed: 0, quizLeads: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [selectedLead, setSelectedLead] = useState<AcademiaLead | null>(null)

  const handleDeleteLead = (id: string) => {
    const lead = leads.find(l => l.id === id)
    setLeads(leads.filter(l => l.id !== id))
    setStats(prev => ({
      ...prev,
      total: prev.total - 1,
      active: prev.active - (lead?.status === 'active' ? 1 : 0)
    }))
    setSelectedLead(null)
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  async function fetchLeads() {
    try {
      const res = await fetch('/api/admin/academia/leads')
      const data = await res.json()

      if (res.ok) {
        setLeads(data.leads || [])
        setStats(data.stats || { total: 0, active: 0, unsubscribed: 0, quizLeads: 0 })
      } else {
        setError(data.error || 'Error al cargar leads')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  async function deleteLead(id: string, email: string) {
    if (!confirm(`¿Seguro que quieres eliminar a ${email}?`)) {
      return
    }

    setDeleting(id)
    setError('')

    try {
      const res = await fetch(`/api/admin/academia/leads?id=${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setLeads(leads.filter(l => l.id !== id))
        setStats(prev => ({
          ...prev,
          total: prev.total - 1,
          active: prev.active - (leads.find(l => l.id === id)?.status === 'active' ? 1 : 0)
        }))
      } else {
        const data = await res.json()
        setError(data.error || 'Error al eliminar')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setDeleting(null)
    }
  }

  function exportToCSV() {
    const headers = ['Email', 'Nombre', 'Fuente', 'Estado', 'Tags', 'Fecha']
    const rows = filteredLeads.map(lead => [
      lead.email,
      lead.name || 'N/A',
      lead.source,
      lead.status,
      lead.tags.join('; '),
      new Date(lead.createdAt).toLocaleDateString('es-ES')
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `academia-leads-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const filteredLeads = leads.filter(lead =>
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando leads...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/admin"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver al Dashboard</span>
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Users className="w-8 h-8 text-violet-600" />
                <h1 className="text-3xl font-bold text-gray-900">Leads Academia</h1>
              </div>
              <p className="text-gray-600">Usuarios interesados en Academia Itineramio (página "Próximamente")</p>
            </div>
            <Link
              href="/admin/academia/quiz-leads"
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
            >
              Ver Quiz Leads ({stats.quizLeads})
            </Link>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-violet-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Desuscritos</p>
                <p className="text-2xl font-bold text-red-600">{stats.unsubscribed}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Quiz Completados</p>
                <p className="text-2xl font-bold text-purple-600">{stats.quizLeads}</p>
              </div>
              <Mail className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Search and Export */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por email o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar CSV ({filteredLeads.length})
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fuente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      {searchTerm ? 'No se encontraron resultados' : 'No hay leads todavía'}
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {lead.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {lead.name || <span className="text-gray-400">-</span>}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-violet-100 text-violet-800">
                          {lead.source}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {lead.status === 'active' ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Activo
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            Desuscrito
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {lead.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {lead.tags.length > 3 && (
                            <span className="text-xs text-gray-400">+{lead.tags.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(lead.createdAt).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="p-2 text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteLead(lead.id, lead.email)}
                            disabled={deleting === lead.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Eliminar"
                          >
                            {deleting === lead.id ? (
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
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

      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetailModal
          lead={{
            id: selectedLead.id,
            email: selectedLead.email,
            status: selectedLead.status,
            createdAt: selectedLead.createdAt,
            unsubscribedAt: selectedLead.unsubscribedAt || undefined
          }}
          type="academia"
          onClose={() => setSelectedLead(null)}
          onDelete={handleDeleteLead}
        />
      )}
    </div>
  )
}
