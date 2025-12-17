'use client'

import { useState, useEffect, useCallback } from 'react'
import { MessageCircle, Send, Reply, User, Clock, Loader2, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Comment {
  id: string
  authorName: string
  content: string
  isAuthor: boolean
  createdAt: string
  likes: number
  replies?: Comment[]
}

interface BlogCommentsProps {
  slug: string
}

export function BlogComments({ slug }: BlogCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    authorName: '',
    authorEmail: '',
    content: ''
  })
  const [error, setError] = useState('')

  const loadComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/blog/${slug}/comments`)
      const data = await response.json()
      setComments(data.comments || [])
    } catch (err) {
      console.error('Error loading comments:', err)
    } finally {
      setIsLoading(false)
    }
  }, [slug])

  useEffect(() => {
    loadComments()
  }, [loadComments])

  const handleSubmit = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault()
    setError('')

    if (!formData.authorName.trim() || !formData.authorEmail.trim() || !formData.content.trim()) {
      setError('Todos los campos son requeridos')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/blog/${slug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          parentId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al enviar comentario')
        return
      }

      // Show success message
      setShowSuccess(true)
      setFormData({ authorName: '', authorEmail: '', content: '' })
      setReplyingTo(null)

      // Hide success after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000)

      // Reload comments if auto-approved
      if (data.comment?.status === 'APPROVED') {
        loadComments()
      }
    } catch (err) {
      console.error('Error submitting comment:', err)
      setError('Error al enviar comentario')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const CommentCard = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isReply ? 'ml-8 mt-4' : ''}`}
    >
      <div className={`p-4 rounded-lg ${isReply ? 'bg-gray-50' : 'bg-white border border-gray-200'}`}>
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            comment.isAuthor
              ? 'bg-violet-100 text-violet-600'
              : 'bg-gray-100 text-gray-600'
          }`}>
            <User className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900">{comment.authorName}</span>
              {comment.isAuthor && (
                <span className="text-xs font-medium text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                  Autor
                </span>
              )}
              <span className="text-gray-400 text-sm flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(comment.createdAt)}
              </span>
            </div>

            {/* Content */}
            <p className="mt-2 text-gray-700 whitespace-pre-wrap break-words">
              {comment.content}
            </p>

            {/* Actions */}
            {!isReply && (
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="mt-3 text-sm text-gray-500 hover:text-violet-600 flex items-center gap-1 transition-colors"
              >
                <Reply className="w-4 h-4" />
                Responder
              </button>
            )}
          </div>
        </div>

        {/* Reply Form */}
        <AnimatePresence>
          {replyingTo === comment.id && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 ml-13"
            >
              <CommentForm
                onSubmit={(e) => handleSubmit(e, comment.id)}
                isReply
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2">
          {comment.replies.map((reply) => (
            <CommentCard key={reply.id} comment={reply} isReply />
          ))}
        </div>
      )}
    </motion.div>
  )

  const CommentForm = ({ onSubmit, isReply = false }: { onSubmit: (e: React.FormEvent) => void; isReply?: boolean }) => (
    <form onSubmit={onSubmit} className={`${isReply ? 'bg-gray-50 p-4 rounded-lg' : ''}`}>
      <div className={`grid ${isReply ? 'grid-cols-2' : 'sm:grid-cols-2'} gap-4 mb-4`}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre
          </label>
          <input
            type="text"
            value={formData.authorName}
            onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
            placeholder="Tu nombre"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={formData.authorEmail}
            onChange={(e) => setFormData({ ...formData, authorEmail: e.target.value })}
            placeholder="tu@email.com"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
            required
          />
          <p className="text-xs text-gray-500 mt-1">No se publicará</p>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Comentario
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder={isReply ? 'Escribe tu respuesta...' : '¿Qué opinas sobre este artículo?'}
          rows={isReply ? 3 : 4}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none resize-none"
          required
          maxLength={2000}
        />
        <p className="text-xs text-gray-500 mt-1 text-right">
          {formData.content.length}/2000
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3">
        {isReply && (
          <button
            type="button"
            onClick={() => setReplyingTo(null)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              {isReply ? 'Responder' : 'Comentar'}
            </>
          )}
        </button>
      </div>
    </form>
  )

  return (
    <section className="mt-16 pt-8 border-t border-gray-200">
      <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-8">
        <MessageCircle className="w-6 h-6 text-violet-600" />
        Comentarios
        {comments.length > 0 && (
          <span className="text-base font-normal text-gray-500">
            ({comments.length})
          </span>
        )}
      </h3>

      {/* Success Message */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3"
          >
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-700">
              ¡Gracias por tu comentario! Será visible después de ser aprobado.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comment Form */}
      <div className="bg-gray-50 rounded-xl p-6 mb-8">
        <h4 className="font-semibold text-gray-900 mb-4">Deja un comentario</h4>
        <CommentForm onSubmit={handleSubmit} />
      </div>

      {/* Comments List */}
      {isLoading ? (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 text-violet-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Cargando comentarios...</p>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h4 className="font-semibold text-gray-900 mb-2">Sé el primero en comentar</h4>
          <p className="text-gray-500">
            Comparte tu opinión sobre este artículo
          </p>
        </div>
      )}
    </section>
  )
}
