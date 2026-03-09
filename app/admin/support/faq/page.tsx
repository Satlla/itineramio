'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Plus,
  HelpCircle,
  Archive,
  RefreshCw,
  AlertTriangle,
  X,
  BarChart3,
  Mail,
} from 'lucide-react'

interface FAQ {
  id: string
  question: string
  category: string
  answer: Record<string, string> | null
  frequency: number
  isAutoDetected: boolean
  includeInWelcomeEmail: boolean
  status: string
  lastAskedAt: string
  createdAt: string
}

const CATEGORY_LABELS: Record<string, string> = {
  GENERAL: 'General',
  PROPERTIES: 'Propiedades',
  BILLING: 'Facturacion',
  GESTION: 'Gestion',
  ACCOUNT: 'Cuenta',
  GETTING_STARTED: 'Primeros Pasos',
  INTEGRATIONS: 'Integraciones',
}

const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS)

export default function FAQAdminPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)
  const [archiving, setArchiving] = useState<string | null>(null)

  // Create form state
  const [newQuestion, setNewQuestion] = useState('')
  const [newCategory, setNewCategory] = useState('GENERAL')
  const [newAnswerEs, setNewAnswerEs] = useState('')
  const [newAnswerEn, setNewAnswerEn] = useState('')
  const [newAnswerFr, setNewAnswerFr] = useState('')
  const [newIncludeWelcome, setNewIncludeWelcome] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchFAQs()
  }, [statusFilter])

  const fetchFAQs = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      params.set('limit', '100')

      const res = await fetch(`/api/admin/support/faq?${params.toString()}`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setFaqs(data.faqs || [])
      } else {
        setError('Error al cargar las FAQs')
      }
    } catch (err) {
      setError('Error de conexion')
      console.error('Error fetching FAQs:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleWelcomeEmail = async (faq: FAQ) => {
    setToggling(faq.id)
    try {
      const res = await fetch(`/api/admin/support/faq/${faq.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ includeInWelcomeEmail: !faq.includeInWelcomeEmail }),
      })
      if (res.ok) {
        setFaqs(faqs.map(f => f.id === faq.id ? { ...f, includeInWelcomeEmail: !f.includeInWelcomeEmail } : f))
      }
    } catch (err) {
      console.error('Error toggling welcome email:', err)
    } finally {
      setToggling(null)
    }
  }

  const handleArchive = async (id: string) => {
    if (!confirm('Archivar esta pregunta frecuente?')) return
    setArchiving(id)
    try {
      const res = await fetch(`/api/admin/support/faq/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (res.ok) {
        setFaqs(faqs.filter(f => f.id !== id))
      }
    } catch (err) {
      console.error('Error archiving FAQ:', err)
    } finally {
      setArchiving(null)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQuestion.trim()) return

    setCreating(true)
    try {
      const answer = (newAnswerEs || newAnswerEn || newAnswerFr)
        ? { es: newAnswerEs, en: newAnswerEn, fr: newAnswerFr }
        : null

      const res = await fetch('/api/admin/support/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          question: newQuestion.trim(),
          category: newCategory,
          answer,
          includeInWelcomeEmail: newIncludeWelcome,
        }),
      })

      if (res.ok) {
        setShowCreateModal(false)
        setNewQuestion('')
        setNewCategory('GENERAL')
        setNewAnswerEs('')
        setNewAnswerEn('')
        setNewAnswerFr('')
        setNewIncludeWelcome(false)
        fetchFAQs()
      } else {
        alert('Error al crear la FAQ')
      }
    } catch (err) {
      console.error('Error creating FAQ:', err)
      alert('Error de conexion')
    } finally {
      setCreating(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/support"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Volver al Soporte</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <HelpCircle className="h-8 w-8 text-teal-600" />
              Preguntas Frecuentes (FAQ)
            </h1>
            <p className="text-gray-600 mt-1">
              {faqs.length} preguntas {statusFilter === 'ACTIVE' ? 'activas' : 'archivadas'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchFAQs}
              className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nueva FAQ
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setStatusFilter('ACTIVE')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === 'ACTIVE'
              ? 'bg-teal-100 text-teal-700 border border-teal-300'
              : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Activas
        </button>
        <button
          onClick={() => setStatusFilter('ARCHIVED')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === 'ARCHIVED'
              ? 'bg-gray-200 text-gray-700 border border-gray-400'
              : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Archivadas
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* FAQ Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full"></div>
          </div>
        ) : faqs.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <HelpCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No hay preguntas frecuentes {statusFilter === 'ACTIVE' ? 'activas' : 'archivadas'}</p>
            {statusFilter === 'ACTIVE' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-3 inline-flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700"
              >
                <Plus className="w-4 h-4" />
                Crear la primera FAQ
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pregunta</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Frecuencia</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Email Bienvenida</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ultima vez</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {faqs.map((faq) => (
                  <tr key={faq.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-xs" title={faq.question}>
                        {faq.question}
                      </p>
                      {faq.answer && (
                        <p className="text-xs text-gray-400 mt-0.5">Tiene respuesta curada</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {CATEGORY_LABELS[faq.category] || faq.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-700">
                        <BarChart3 className="w-3.5 h-3.5 text-gray-400" />
                        {faq.frequency}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {faq.isAutoDetected ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          Auto
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Manual
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleWelcomeEmail(faq)}
                        disabled={toggling === faq.id}
                        className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50"
                        style={{ backgroundColor: faq.includeInWelcomeEmail ? '#0d9488' : '#d1d5db' }}
                        title={faq.includeInWelcomeEmail ? 'Incluido en email de bienvenida' : 'No incluido en email de bienvenida'}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            faq.includeInWelcomeEmail ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {formatDate(faq.lastAskedAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {statusFilter === 'ACTIVE' && (
                          <button
                            onClick={() => handleArchive(faq.id)}
                            disabled={archiving === faq.id}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                            title="Archivar"
                          >
                            <Archive className="w-4 h-4 text-gray-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Nueva Pregunta Frecuente</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {/* Question */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pregunta</label>
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Ej: Como puedo crear una nueva propiedad?"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  {CATEGORY_OPTIONS.map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Answer ES */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Respuesta (ES) - Opcional</label>
                <textarea
                  value={newAnswerEs}
                  onChange={(e) => setNewAnswerEs(e.target.value)}
                  rows={3}
                  placeholder="Respuesta curada en espanol..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              {/* Answer EN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Respuesta (EN) - Opcional</label>
                <textarea
                  value={newAnswerEn}
                  onChange={(e) => setNewAnswerEn(e.target.value)}
                  rows={3}
                  placeholder="Curated answer in English..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              {/* Answer FR */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Respuesta (FR) - Opcional</label>
                <textarea
                  value={newAnswerFr}
                  onChange={(e) => setNewAnswerFr(e.target.value)}
                  rows={3}
                  placeholder="Reponse curee en francais..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              {/* Include in Welcome Email */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setNewIncludeWelcome(!newIncludeWelcome)}
                  className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                  style={{ backgroundColor: newIncludeWelcome ? '#0d9488' : '#d1d5db' }}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      newIncludeWelcome ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Mail className="w-4 h-4 text-gray-400" />
                  Incluir en email de bienvenida
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating || !newQuestion.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                >
                  {creating ? 'Creando...' : 'Crear FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
