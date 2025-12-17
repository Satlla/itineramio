'use client'

import { useState, useEffect } from 'react'
import {
  HelpCircle,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Send,
  Trash2,
  Eye,
  Mail,
  User,
  Calendar,
  Tag,
  ChevronDown,
  Loader2,
  AlertCircle,
  RefreshCw,
  X
} from 'lucide-react'

interface FaqSubmission {
  id: string
  question: string
  answer: string | null
  email: string | null
  category: string | null
  status: 'PENDING' | 'REVIEWING' | 'ANSWERED' | 'PUBLISHED' | 'REJECTED'
  isPublished: boolean
  createdAt: string
  answeredAt: string | null
  answeredBy: string | null
  user: {
    name: string | null
    email: string
  } | null
}

const STATUS_CONFIG = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  REVIEWING: { label: 'Revisando', color: 'bg-blue-100 text-blue-800', icon: Eye },
  ANSWERED: { label: 'Respondida', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  PUBLISHED: { label: 'Publicada', color: 'bg-violet-100 text-violet-800', icon: MessageCircle },
  REJECTED: { label: 'Rechazada', color: 'bg-red-100 text-red-800', icon: XCircle }
}

const CATEGORIES = [
  { value: '', label: 'Todas las categorías' },
  { value: 'propiedades', label: 'Propiedades' },
  { value: 'conjuntos', label: 'Conjuntos de propiedades' },
  { value: 'zonas', label: 'Zonas y pasos' },
  { value: 'qr', label: 'Códigos QR' },
  { value: 'traducciones', label: 'Idiomas y traducciones' },
  { value: 'medios', label: 'Fotos y videos' },
  { value: 'cuenta', label: 'Mi cuenta' },
  { value: 'facturacion', label: 'Facturación y planes' },
  { value: 'otro', label: 'Otro' }
]

export default function AdminFaqPage() {
  const [submissions, setSubmissions] = useState<FaqSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedSubmission, setSelectedSubmission] = useState<FaqSubmission | null>(null)
  const [answerText, setAnswerText] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)

      const response = await fetch(`/api/faq/submit?${params.toString()}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Error al cargar las preguntas')
      }

      const data = await response.json()
      setSubmissions(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubmissions()
  }, [statusFilter])

  const handleSaveAnswer = async (id: string, answer: string, status: string) => {
    try {
      setSaving(true)
      const response = await fetch(`/api/admin/faq/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ answer, status })
      })

      if (!response.ok) {
        throw new Error('Error al guardar la respuesta')
      }

      // Refresh the list
      await fetchSubmissions()
      setSelectedSubmission(null)
      setAnswerText('')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta pregunta?')) return

    try {
      setDeleting(id)
      const response = await fetch(`/api/admin/faq/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Error al eliminar')
      }

      await fetchSubmissions()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar')
    } finally {
      setDeleting(null)
    }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/faq/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      })

      if (!response.ok) {
        throw new Error('Error al actualizar estado')
      }

      await fetchSubmissions()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al actualizar')
    }
  }

  const filteredSubmissions = submissions.filter(sub => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      sub.question.toLowerCase().includes(query) ||
      sub.email?.toLowerCase().includes(query) ||
      sub.user?.name?.toLowerCase().includes(query) ||
      sub.user?.email?.toLowerCase().includes(query) ||
      sub.category?.toLowerCase().includes(query)
    )
  })

  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'PENDING').length,
    answered: submissions.filter(s => s.status === 'ANSWERED').length,
    published: submissions.filter(s => s.status === 'PUBLISHED').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HelpCircle className="w-7 h-7 text-violet-600" />
            Preguntas de Usuarios
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona las preguntas enviadas desde el centro de ayuda
          </p>
        </div>
        <button
          onClick={fetchSubmissions}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-yellow-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-sm text-gray-500">Pendientes</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.answered}</p>
              <p className="text-sm text-gray-500">Respondidas</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-violet-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
              <Send className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-violet-600">{stats.published}</p>
              <p className="text-sm text-gray-500">Publicadas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por pregunta, email, usuario..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
          {/* Status filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white appearance-none cursor-pointer"
            >
              <option value="">Todos los estados</option>
              <option value="PENDING">Pendientes</option>
              <option value="REVIEWING">Revisando</option>
              <option value="ANSWERED">Respondidas</option>
              <option value="PUBLISHED">Publicadas</option>
              <option value="REJECTED">Rechazadas</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filteredSubmissions.length === 0 && (
        <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
          <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay preguntas
          </h3>
          <p className="text-gray-600">
            {searchQuery || statusFilter
              ? 'No se encontraron preguntas con los filtros seleccionados'
              : 'Aún no hay preguntas enviadas por los usuarios'}
          </p>
        </div>
      )}

      {/* Submissions list */}
      {!loading && !error && filteredSubmissions.length > 0 && (
        <div className="space-y-4">
          {filteredSubmissions.map((submission) => {
            const statusConfig = STATUS_CONFIG[submission.status]
            const StatusIcon = statusConfig.icon

            return (
              <div
                key={submission.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusConfig.label}
                      </span>
                      {submission.category && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                          <Tag className="w-3 h-3" />
                          {CATEGORIES.find(c => c.value === submission.category)?.label || submission.category}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(submission.id)}
                        disabled={deleting === submission.id}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        {deleting === submission.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Question */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {submission.question}
                  </h3>

                  {/* Answer (if exists) */}
                  {submission.answer && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3">
                      <p className="text-sm font-medium text-green-800 mb-1">Respuesta:</p>
                      <p className="text-green-900">{submission.answer}</p>
                      {submission.answeredBy && (
                        <p className="text-xs text-green-600 mt-2">
                          Respondida por {submission.answeredBy}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                    {(submission.email || submission.user?.email) && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {submission.email || submission.user?.email}
                      </span>
                    )}
                    {submission.user?.name && (
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {submission.user.name}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(submission.createdAt).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                    {submission.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedSubmission(submission)
                            setAnswerText(submission.answer || '')
                          }}
                          className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium"
                        >
                          Responder
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(submission.id, 'REJECTED')}
                          className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                        >
                          Rechazar
                        </button>
                      </>
                    )}
                    {submission.status === 'ANSWERED' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(submission.id, 'PUBLISHED')}
                          className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium"
                        >
                          Publicar en FAQ
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSubmission(submission)
                            setAnswerText(submission.answer || '')
                          }}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                          Editar respuesta
                        </button>
                      </>
                    )}
                    {submission.status === 'PUBLISHED' && (
                      <button
                        onClick={() => handleUpdateStatus(submission.id, 'ANSWERED')}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                      >
                        Despublicar
                      </button>
                    )}
                    {submission.status === 'REJECTED' && (
                      <button
                        onClick={() => handleUpdateStatus(submission.id, 'PENDING')}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                      >
                        Reabrir
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Answer Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Responder pregunta
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Tu respuesta se guardará y podrá publicarse en el FAQ
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedSubmission(null)
                    setAnswerText('')
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Question */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm font-medium text-gray-500 mb-1">Pregunta:</p>
                <p className="text-gray-900 font-medium">{selectedSubmission.question}</p>
                {selectedSubmission.category && (
                  <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-white rounded-full text-xs text-gray-600 border">
                    <Tag className="w-3 h-3" />
                    {CATEGORIES.find(c => c.value === selectedSubmission.category)?.label || selectedSubmission.category}
                  </span>
                )}
              </div>

              {/* Answer input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tu respuesta
                </label>
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  rows={6}
                  placeholder="Escribe una respuesta clara y útil..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedSubmission(null)
                  setAnswerText('')
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleSaveAnswer(selectedSubmission.id, answerText, 'ANSWERED')}
                disabled={saving || !answerText.trim()}
                className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Guardar respuesta
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
