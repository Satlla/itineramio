'use client'

import React, { useState, useEffect } from 'react'
import { Mail, TrendingUp, Users, UserCheck, Download, Search, Filter, ChevronDown, ChevronRight, CheckCircle2, XCircle, ArrowLeft, Trash2, Pencil, X, Loader2, Eye } from 'lucide-react'
import Link from 'next/link'
import { LeadDetailModal } from '@/components/admin/LeadDetailModal'

interface QuizAnswer {
  questionId: number
  question: string
  category: string
  selectedOptions: string[]
  correctOptions: string[]
  isCorrect: boolean
  points: number
  earnedPoints: number
}

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
  answers: QuizAnswer[]
}

export default function QuizLeadsPage() {
  const [leads, setLeads] = useState<QuizLead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLevel, setFilterLevel] = useState<string>('ALL')
  const [filterConverted, setFilterConverted] = useState<string>('ALL')
  const [filterVerified, setFilterVerified] = useState<string>('ALL')
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null)

  // Edit/Delete/View state
  const [editingLead, setEditingLead] = useState<QuizLead | null>(null)
  const [viewingLead, setViewingLead] = useState<QuizLead | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleDeleteFromModal = (id: string) => {
    setLeads(leads.filter(l => l.id !== id))
    setViewingLead(null)
  }

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

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`¿Seguro que quieres eliminar el lead de ${email}?`)) return

    setDeletingId(id)
    setError('')

    try {
      const res = await fetch(`/api/admin/academia/quiz-leads?id=${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setLeads(leads.filter(l => l.id !== id))
      } else {
        const data = await res.json()
        setError(data.error || 'Error al eliminar')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setDeletingId(null)
    }
  }

  const handleSaveEdit = async () => {
    if (!editingLead) return

    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/admin/academia/quiz-leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingLead.id,
          email: editingLead.email,
          fullName: editingLead.fullName,
          level: editingLead.level,
          converted: editingLead.converted,
          emailVerified: editingLead.emailVerified
        })
      })

      if (res.ok) {
        setLeads(leads.map(l =>
          l.id === editingLead.id ? { ...l, ...editingLead } : l
        ))
        setEditingLead(null)
      } else {
        const data = await res.json()
        setError(data.error || 'Error al guardar')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setSaving(false)
    }
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

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'FUNDAMENTOS': return 'bg-blue-100 text-blue-800'
      case 'OPTIMIZACIÓN': return 'bg-orange-100 text-orange-800'
      case 'AVANZADO': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAnswerStats = (answers: QuizAnswer[]) => {
    const correct = answers.filter(a => a.isCorrect).length
    const incorrect = answers.length - correct
    const byCategory = answers.reduce((acc, answer) => {
      if (!acc[answer.category]) {
        acc[answer.category] = { correct: 0, total: 0 }
      }
      acc[answer.category].total++
      if (answer.isCorrect) acc[answer.category].correct++
      return acc
    }, {} as Record<string, { correct: number, total: number }>)

    return { correct, incorrect, byCategory }
  }

  const toggleExpand = (leadId: string) => {
    setExpandedLeadId(expandedLeadId === leadId ? null : leadId)
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
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/admin/marketing"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver a Embudos</span>
            </Link>
          </div>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">

                  </th>
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
                    Aciertos
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
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                      No se encontraron leads
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const isExpanded = expandedLeadId === lead.id
                    const stats = getAnswerStats(lead.answers || [])

                    return (
                      <React.Fragment key={lead.id}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => toggleExpand(lead.id)}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-5 h-5" />
                              ) : (
                                <ChevronRight className="w-5 h-5" />
                              )}
                            </button>
                          </td>
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
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <span className="text-green-600 font-semibold">{stats.correct}</span>
                              {' / '}
                              <span className="text-red-600">{stats.incorrect}</span>
                              <span className="text-gray-500 text-xs ml-1">({lead.answers?.length || 0})</span>
                            </div>
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
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setViewingLead(lead)}
                                className="p-1.5 text-violet-600 hover:bg-violet-50 rounded transition-colors"
                                title="Ver detalles"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingLead(lead)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Editar"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(lead.id, lead.email)}
                                disabled={deletingId === lead.id}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                title="Eliminar"
                              >
                                {deletingId === lead.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Row */}
                        {isExpanded && lead.answers && lead.answers.length > 0 && (
                          <tr>
                            <td colSpan={9} className="px-6 py-6 bg-gray-50">
                              <div className="space-y-4">
                                {/* Stats by Category */}
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                  {Object.entries(stats.byCategory).map(([category, data]) => (
                                    <div key={category} className="bg-white rounded-lg p-3 shadow-sm">
                                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryBadgeColor(category)}`}>
                                        {category}
                                      </span>
                                      <div className="mt-2 text-sm">
                                        <span className="text-green-600 font-semibold">{data.correct}</span>
                                        <span className="text-gray-500"> / {data.total}</span>
                                        <span className="text-gray-400 text-xs ml-1">
                                          ({Math.round((data.correct / data.total) * 100)}%)
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* Detailed Answers */}
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                  <h4 className="font-semibold text-gray-900 mb-3">Desglose de respuestas</h4>
                                  <div className="space-y-3">
                                    {lead.answers.map((answer, idx) => (
                                      <div
                                        key={idx}
                                        className={`p-3 rounded-lg border-l-4 ${
                                          answer.isCorrect
                                            ? 'bg-green-50 border-green-500'
                                            : 'bg-red-50 border-red-500'
                                        }`}
                                      >
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                              {answer.isCorrect ? (
                                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                              ) : (
                                                <XCircle className="w-4 h-4 text-red-600" />
                                              )}
                                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getCategoryBadgeColor(answer.category)}`}>
                                                {answer.category}
                                              </span>
                                              <span className="text-xs text-gray-500">
                                                Pregunta {answer.questionId}
                                              </span>
                                            </div>
                                            <p className="text-sm text-gray-700 mb-2">{answer.question}</p>
                                            {!answer.isCorrect && (
                                              <div className="text-xs text-gray-600 mt-1">
                                                <div className="mb-1">
                                                  <span className="font-medium">Respuesta(s) correcta(s):</span> {answer.correctOptions.join(', ')}
                                                </div>
                                                <div>
                                                  <span className="font-medium">Seleccionó:</span> {answer.selectedOptions.join(', ') || 'Ninguna'}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                          <div className="text-right ml-4">
                                            <div className={`text-sm font-semibold ${answer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                              {answer.earnedPoints}/{answer.points} pts
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-center text-sm text-gray-600">
          Mostrando {filteredLeads.length} de {leads.length} leads
        </div>

        {/* Error Toast */}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Edit Modal */}
        {editingLead && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Editar Lead</h3>
                <button
                  onClick={() => setEditingLead(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editingLead.email}
                    onChange={(e) => setEditingLead({ ...editingLead, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={editingLead.fullName || ''}
                    onChange={(e) => setEditingLead({ ...editingLead, fullName: e.target.value || null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
                  <select
                    value={editingLead.level}
                    onChange={(e) => setEditingLead({ ...editingLead, level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="BASIC">Principiante</option>
                    <option value="INTERMEDIATE">Intermedio</option>
                    <option value="ADVANCED">Avanzado</option>
                  </select>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingLead.emailVerified}
                      onChange={(e) => setEditingLead({ ...editingLead, emailVerified: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Email verificado</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingLead.converted}
                      onChange={(e) => setEditingLead({ ...editingLead, converted: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Convertido</span>
                  </label>
                </div>

                <div className="pt-2 text-sm text-gray-500">
                  <p>Puntuación: {editingLead.score}/100</p>
                  <p>Tiempo: {Math.floor(editingLead.timeElapsed / 60)}:{(editingLead.timeElapsed % 60).toString().padStart(2, '0')}</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingLead(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Lead Modal */}
        {viewingLead && (
          <LeadDetailModal
            lead={{
              id: viewingLead.id,
              email: viewingLead.email,
              fullName: viewingLead.fullName,
              score: viewingLead.score,
              level: viewingLead.level,
              source: viewingLead.source,
              completedAt: viewingLead.completedAt,
              converted: viewingLead.converted
            }}
            type="quiz"
            onClose={() => setViewingLead(null)}
            onDelete={handleDeleteFromModal}
          />
        )}
      </div>
    </div>
  )
}
