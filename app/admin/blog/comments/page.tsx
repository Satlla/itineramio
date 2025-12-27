'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, CheckCircle, XCircle, Trash2, Clock, Mail, Shield, Eye, RefreshCw, Filter } from 'lucide-react'

interface Comment {
  id: string
  authorName: string
  authorEmail: string
  content: string
  status: string
  emailVerified: boolean
  isAuthor: boolean
  createdAt: string
  post: {
    title: string
    slug: string
  }
}

type FilterStatus = 'ALL' | 'PENDING_VERIFICATION' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM'

export default function AdminBlogCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<FilterStatus>('PENDING')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const loadComments = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/blog/comments?status=${filter}`)
      const data = await response.json()
      setComments(data.comments || [])
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadComments()
  }, [filter])

  const handleAction = async (commentId: string, action: 'approve' | 'reject' | 'spam' | 'delete') => {
    setActionLoading(commentId)
    try {
      const response = await fetch(`/api/admin/blog/comments/${commentId}`, {
        method: action === 'delete' ? 'DELETE' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: action !== 'delete' ? JSON.stringify({ action }) : undefined
      })

      if (response.ok) {
        loadComments()
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string, emailVerified: boolean) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      PENDING_VERIFICATION: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Esperando verificación email' },
      PENDING: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Pendiente aprobación' },
      APPROVED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Aprobado' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rechazado' },
      SPAM: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Spam' }
    }
    const badge = badges[status] || badges.PENDING
    return (
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
          {badge.label}
        </span>
        {emailVerified && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <Mail className="w-3 h-3" />
            Verificado
          </span>
        )}
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))
  }

  const filterCounts: Record<FilterStatus, string> = {
    ALL: 'Todos',
    PENDING_VERIFICATION: 'Verificación pendiente',
    PENDING: 'Pendientes',
    APPROVED: 'Aprobados',
    REJECTED: 'Rechazados',
    SPAM: 'Spam'
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-8 h-8 text-violet-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Comentarios del Blog</h1>
            <p className="text-gray-500">Gestiona y modera los comentarios</p>
          </div>
        </div>
        <button
          onClick={loadComments}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Filter className="w-4 h-4 text-gray-500" />
        {(Object.keys(filterCounts) as FilterStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-violet-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filterCounts[status]}
          </button>
        ))}
      </div>

      {/* Comments List */}
      {isLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-violet-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Cargando comentarios...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">No hay comentarios</h3>
          <p className="text-gray-500">No se encontraron comentarios con este filtro</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="font-semibold text-gray-900">{comment.authorName}</span>
                    {comment.isAuthor && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
                        Autor del post
                      </span>
                    )}
                    <span className="text-gray-400 text-sm flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>

                  {/* Email */}
                  <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {comment.authorEmail}
                  </p>

                  {/* Status */}
                  <div className="mb-3">
                    {getStatusBadge(comment.status, comment.emailVerified)}
                  </div>

                  {/* Content */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-3">
                    <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                  </div>

                  {/* Post info */}
                  <div className="text-sm text-gray-500">
                    En: <a
                      href={`/blog/${comment.post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-600 hover:underline"
                    >
                      {comment.post.title}
                    </a>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {comment.status !== 'APPROVED' && (
                    <button
                      onClick={() => handleAction(comment.id, 'approve')}
                      disabled={actionLoading === comment.id}
                      className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Aprobar
                    </button>
                  )}
                  {comment.status !== 'REJECTED' && (
                    <button
                      onClick={() => handleAction(comment.id, 'reject')}
                      disabled={actionLoading === comment.id}
                      className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 text-sm"
                    >
                      <XCircle className="w-4 h-4" />
                      Rechazar
                    </button>
                  )}
                  {comment.status !== 'SPAM' && (
                    <button
                      onClick={() => handleAction(comment.id, 'spam')}
                      disabled={actionLoading === comment.id}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 text-sm"
                    >
                      <Shield className="w-4 h-4" />
                      Spam
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm('¿Eliminar este comentario permanentemente?')) {
                        handleAction(comment.id, 'delete')
                      }
                    }}
                    disabled={actionLoading === comment.id}
                    className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
