'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { MessageCircle, Send, Reply, User, Clock, Loader2, CheckCircle, Mail, Shield } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'next/navigation'

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

// Generate a simple math captcha
function generateCaptcha(): { question: string; answer: number } {
  const num1 = Math.floor(Math.random() * 10) + 1
  const num2 = Math.floor(Math.random() * 10) + 1
  return {
    question: `${num1} + ${num2} = ?`,
    answer: num1 + num2
  }
}

export function BlogComments({ slug }: BlogCommentsProps) {
  const searchParams = useSearchParams()
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [error, setError] = useState('')

  // Form state - separate for main form and reply form
  const [authorName, setAuthorName] = useState('')
  const [authorEmail, setAuthorEmail] = useState('')
  const [content, setContent] = useState('')
  const [honeypot, setHoneypot] = useState('') // Hidden honeypot field
  const [captchaAnswer, setCaptchaAnswer] = useState('')

  // Reply form state
  const [replyAuthorName, setReplyAuthorName] = useState('')
  const [replyAuthorEmail, setReplyAuthorEmail] = useState('')
  const [replyContent, setReplyContent] = useState('')
  const [replyHoneypot, setReplyHoneypot] = useState('')
  const [replyCaptchaAnswer, setReplyCaptchaAnswer] = useState('')

  // Captcha state - initialize as null to avoid hydration mismatch
  const [captcha, setCaptcha] = useState<{ question: string; answer: number } | null>(null)
  const [replyCaptcha, setReplyCaptcha] = useState<{ question: string; answer: number } | null>(null)

  // Generate captcha on client-side only to avoid hydration issues
  useEffect(() => {
    setCaptcha(generateCaptcha())
    setReplyCaptcha(generateCaptcha())
  }, [])

  // Check for verification success in URL
  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      setShowSuccess(true)
      setSuccessMessage('Tu comentario ha sido verificado y enviado para aprobacion. Sera visible pronto.')
      setTimeout(() => {
        setShowSuccess(false)
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname)
      }, 6000)
    }
  }, [searchParams])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!authorName.trim() || !authorEmail.trim() || !content.trim()) {
      setError('Todos los campos son requeridos')
      return
    }

    if (!captchaAnswer.trim() || !captcha) {
      setError('Por favor, resuelve la operacion matematica')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/blog/${slug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: authorName.trim(),
          authorEmail: authorEmail.trim(),
          content: content.trim(),
          honeypot, // Send honeypot value (should be empty)
          captchaAnswer,
          captchaExpected: captcha.answer.toString()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al enviar comentario')
        // Regenerate captcha on error
        setCaptcha(generateCaptcha())
        setCaptchaAnswer('')
        return
      }

      // Show appropriate success message
      if (data.requiresVerification) {
        setSuccessMessage('Te hemos enviado un email para verificar tu comentario. Revisa tu bandeja de entrada (y spam).')
      } else {
        setSuccessMessage(data.message || 'Comentario enviado. Sera visible despues de ser aprobado.')
      }

      setShowSuccess(true)
      setAuthorName('')
      setAuthorEmail('')
      setContent('')
      setHoneypot('')
      setCaptchaAnswer('')
      setCaptcha(generateCaptcha())

      // Hide success after 6 seconds
      setTimeout(() => setShowSuccess(false), 6000)

      // Reload comments if auto-approved
      if (data.comment?.status === 'APPROVED') {
        loadComments()
      }
    } catch (err) {
      console.error('Error submitting comment:', err)
      setError('Error al enviar comentario')
      setCaptcha(generateCaptcha())
      setCaptchaAnswer('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReplySubmit = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault()
    setError('')

    if (!replyAuthorName.trim() || !replyAuthorEmail.trim() || !replyContent.trim()) {
      setError('Todos los campos son requeridos')
      return
    }

    if (!replyCaptchaAnswer.trim() || !replyCaptcha) {
      setError('Por favor, resuelve la operacion matematica')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/blog/${slug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: replyAuthorName.trim(),
          authorEmail: replyAuthorEmail.trim(),
          content: replyContent.trim(),
          parentId,
          honeypot: replyHoneypot,
          captchaAnswer: replyCaptchaAnswer,
          captchaExpected: replyCaptcha.answer.toString()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al enviar comentario')
        setReplyCaptcha(generateCaptcha())
        setReplyCaptchaAnswer('')
        return
      }

      // Show appropriate success message
      if (data.requiresVerification) {
        setSuccessMessage('Te hemos enviado un email para verificar tu respuesta. Revisa tu bandeja de entrada.')
      } else {
        setSuccessMessage(data.message || 'Respuesta enviada. Sera visible despues de ser aprobada.')
      }

      setShowSuccess(true)
      setReplyAuthorName('')
      setReplyAuthorEmail('')
      setReplyContent('')
      setReplyHoneypot('')
      setReplyCaptchaAnswer('')
      setReplyingTo(null)
      setReplyCaptcha(generateCaptcha())

      // Hide success after 6 seconds
      setTimeout(() => setShowSuccess(false), 6000)

      // Reload comments if auto-approved
      if (data.comment?.status === 'APPROVED') {
        loadComments()
      }
    } catch (err) {
      console.error('Error submitting reply:', err)
      setError('Error al enviar respuesta')
      setReplyCaptcha(generateCaptcha())
      setReplyCaptchaAnswer('')
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
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3"
          >
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-700 font-medium">
                {successMessage}
              </p>
              {successMessage.includes('email') && (
                <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  Recuerda revisar tambien la carpeta de spam
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Be the first to comment - shown when no comments */}
      {!isLoading && comments.length === 0 && (
        <div className="text-center py-8 mb-6 bg-violet-50 rounded-xl border border-violet-100">
          <MessageCircle className="w-10 h-10 text-violet-400 mx-auto mb-3" />
          <h4 className="font-semibold text-gray-900 mb-1">Se el primero en comentar</h4>
          <p className="text-gray-500 text-sm">
            Comparte tu opinion sobre este articulo
          </p>
        </div>
      )}

      {/* Main Comment Form */}
      <div className="bg-gray-50 rounded-xl p-6 mb-8">
        <h4 className="font-semibold text-gray-900 mb-4">Deja un comentario</h4>
        <form onSubmit={handleSubmit}>
          {/* Honeypot field - hidden from humans */}
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            style={{
              position: 'absolute',
              left: '-9999px',
              width: '1px',
              height: '1px',
              opacity: 0,
              pointerEvents: 'none'
            }}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="comment-name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                id="comment-name"
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Tu nombre"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none bg-white"
                required
              />
            </div>
            <div>
              <label htmlFor="comment-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="comment-email"
                type="email"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none bg-white"
                required
              />
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Solo para verificacion, no se publicara
              </p>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="comment-content" className="block text-sm font-medium text-gray-700 mb-1">
              Comentario
            </label>
            <textarea
              id="comment-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Que opinas sobre este articulo?"
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none resize-none bg-white"
              required
              maxLength={2000}
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {content.length}/2000
            </p>
          </div>

          {/* Math Captcha */}
          <div className="mb-4 p-4 bg-white border border-gray-200 rounded-lg">
            <label htmlFor="captcha" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-violet-600" />
              Verificacion anti-spam
            </label>
            <div className="flex items-center gap-3">
              <span className="text-lg font-mono bg-gray-100 px-4 py-2 rounded-lg text-gray-800">
                {captcha?.question || 'Cargando...'}
              </span>
              <input
                id="captcha"
                type="number"
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                placeholder="?"
                className="w-20 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none bg-white text-center text-lg"
                required
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end">
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
                  Comentar
                </>
              )}
            </button>
          </div>
        </form>
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
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="p-4 rounded-lg bg-white border border-gray-200">
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
                    <div className="mt-3 flex items-center gap-4">
                      <button
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="text-sm text-gray-500 hover:text-violet-600 flex items-center gap-1 transition-colors"
                      >
                        <Reply className="w-4 h-4" />
                        Responder
                      </button>
                    </div>
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
                      <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="bg-gray-50 p-4 rounded-lg">
                        {/* Honeypot for reply */}
                        <input
                          type="text"
                          name="website_reply"
                          value={replyHoneypot}
                          onChange={(e) => setReplyHoneypot(e.target.value)}
                          style={{
                            position: 'absolute',
                            left: '-9999px',
                            width: '1px',
                            height: '1px',
                            opacity: 0,
                            pointerEvents: 'none'
                          }}
                          tabIndex={-1}
                          autoComplete="off"
                          aria-hidden="true"
                        />

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label htmlFor={`reply-name-${comment.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                              Nombre
                            </label>
                            <input
                              id={`reply-name-${comment.id}`}
                              type="text"
                              value={replyAuthorName}
                              onChange={(e) => setReplyAuthorName(e.target.value)}
                              placeholder="Tu nombre"
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none bg-white"
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor={`reply-email-${comment.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                              Email
                            </label>
                            <input
                              id={`reply-email-${comment.id}`}
                              type="email"
                              value={replyAuthorEmail}
                              onChange={(e) => setReplyAuthorEmail(e.target.value)}
                              placeholder="tu@email.com"
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none bg-white"
                              required
                            />
                          </div>
                        </div>
                        <div className="mb-4">
                          <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Escribe tu respuesta..."
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none resize-none bg-white"
                            required
                            maxLength={2000}
                          />
                        </div>

                        {/* Math Captcha for reply */}
                        <div className="mb-4 p-3 bg-white border border-gray-200 rounded-lg">
                          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-violet-600" />
                            Verificacion
                          </label>
                          <div className="flex items-center gap-3">
                            <span className="text-base font-mono bg-gray-100 px-3 py-1 rounded text-gray-800">
                              {replyCaptcha?.question || 'Cargando...'}
                            </span>
                            <input
                              type="number"
                              value={replyCaptchaAnswer}
                              onChange={(e) => setReplyCaptchaAnswer(e.target.value)}
                              placeholder="?"
                              className="w-16 px-3 py-1 border border-gray-200 rounded focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none bg-white text-center"
                              required
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => setReplyingTo(null)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            Cancelar
                          </button>
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
                                Responder
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="space-y-2 ml-8 mt-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="p-4 rounded-lg bg-gray-50">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          reply.isAuthor
                            ? 'bg-violet-100 text-violet-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          <User className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900">{reply.authorName}</span>
                            {reply.isAuthor && (
                              <span className="text-xs font-medium text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                                Autor
                              </span>
                            )}
                            <span className="text-gray-400 text-sm flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(reply.createdAt)}
                            </span>
                          </div>
                          <p className="mt-2 text-gray-700 whitespace-pre-wrap break-words">
                            {reply.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : null}
    </section>
  )
}
