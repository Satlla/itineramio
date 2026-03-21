'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Send,
  Save,
  Lock,
  Bot,
  User,
  ShieldCheck,
  Clock,
  MessageSquare,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  Trash2
} from 'lucide-react'

interface TicketMessage {
  id: string
  sender: 'USER' | 'AI' | 'ADMIN'
  content: string
  isInternal: boolean
  adminId: string | null
  aiConfidence: number | null
  createdAt: string
  admin?: {
    name: string
  } | null
}

interface TicketDetail {
  id: string
  subject: string
  email: string | null
  status: string
  priority: string
  aiEnabled: boolean
  assignedTo: string | null
  lastMessageAt: string | null
  createdAt: string
  updatedAt: string
  messages: TicketMessage[]
  user?: {
    id: string
    name: string | null
    email: string | null
  } | null
  assignedAdmin?: {
    id: string
    name: string
  } | null
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'hace unos segundos'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `hace ${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `hace ${days}d`
  return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    OPEN: { label: 'Abierto', className: 'bg-blue-100 text-blue-700' },
    WAITING_ADMIN: { label: 'Esperando Admin', className: 'bg-orange-100 text-orange-700' },
    RESOLVED: { label: 'Resuelto', className: 'bg-green-100 text-green-700' },
    CLOSED: { label: 'Cerrado', className: 'bg-gray-100 text-gray-600' },
  }
  const c = config[status] || { label: status, className: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.className}`}>
      {c.label}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const config: Record<string, { label: string; className: string }> = {
    LOW: { label: 'Baja', className: 'bg-gray-100 text-gray-600' },
    MEDIUM: { label: 'Media', className: 'bg-blue-100 text-blue-700' },
    HIGH: { label: 'Alta', className: 'bg-orange-100 text-orange-700' },
    URGENT: { label: 'Urgente', className: 'bg-red-100 text-red-700' },
  }
  const c = config[priority] || { label: priority, className: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.className}`}>
      {c.label}
    </span>
  )
}

export default function TicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const ticketId = params.id as string
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [ticket, setTicket] = useState<TicketDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Reply form
  const [replyContent, setReplyContent] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [sending, setSending] = useState(false)

  // Metadata editing
  const [editStatus, setEditStatus] = useState('')
  const [editPriority, setEditPriority] = useState('')
  const [editAiEnabled, setEditAiEnabled] = useState(true)
  const [editAssignedTo, setEditAssignedTo] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    fetchTicket()
  }, [ticketId])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [ticket?.messages])

  const fetchTicket = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/support/tickets/${ticketId}`, {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        const t = data.ticket ?? data
        setTicket(t)
        setEditStatus(t.status)
        setEditPriority(t.priority)
        setEditAiEnabled(t.aiEnabled)
        setEditAssignedTo(t.assignedTo || '')
      } else if (res.status === 404) {
        setError('Ticket no encontrado')
      } else {
        setError('Error al cargar el ticket')
      }
    } catch {
      setError('Error de conexion')
    } finally {
      setLoading(false)
    }
  }

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyContent.trim() || sending) return

    setSending(true)
    try {
      const res = await fetch(`/api/admin/support/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: replyContent.trim(),
          isInternal,
        }),
      })

      if (res.ok) {
        setReplyContent('')
        setIsInternal(false)
        await fetchTicket()
      } else {
        const errData = await res.json().catch(() => ({}))
        alert(errData.error || 'Error al enviar el mensaje')
      }
    } catch {
      alert('Error de conexion')
    } finally {
      setSending(false)
    }
  }

  const handleSaveMetadata = async () => {
    if (saving) return
    setSaving(true)
    setSaveSuccess(false)
    try {
      const res = await fetch(`/api/admin/support/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: editStatus,
          priority: editPriority,
          aiEnabled: editAiEnabled,
          assignedTo: editAssignedTo || null,
        }),
      })

      if (res.ok) {
        setSaveSuccess(true)
        await fetchTicket()
        setTimeout(() => setSaveSuccess(false), 2000)
      } else {
        const errData = await res.json().catch(() => ({}))
        alert(errData.error || 'Error al actualizar')
      }
    } catch {
      alert('Error de conexion')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="max-w-7xl mx-auto">
        <Link
          href="/admin/support/tickets"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Volver a Tickets</span>
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-8 rounded-lg text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <p>{error || 'Ticket no encontrado'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/support/tickets"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Volver a Tickets</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 flex-1">{ticket.subject}</h1>
          <div className="flex items-center gap-2">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Chat thread + Reply */}
        <div className="lg:col-span-2 space-y-4">
          {/* Messages */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-gray-600" />
              <h2 className="font-semibold text-gray-900">Conversacion</h2>
              <span className="text-sm text-gray-500">({ticket.messages.length} mensajes)</span>
            </div>

            <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
              {ticket.messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No hay mensajes en este ticket</p>
                </div>
              ) : (
                ticket.messages.map((msg) => {
                  // Internal note
                  if (msg.isInternal) {
                    return (
                      <div key={msg.id} className="flex justify-center">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 max-w-lg w-full">
                          <div className="flex items-center gap-2 mb-1">
                            <Lock className="w-3.5 h-3.5 text-yellow-600" />
                            <span className="text-xs font-medium text-yellow-700">
                              Nota interna {msg.admin?.name ? `- ${msg.admin.name}` : ''}
                            </span>
                            <span className="text-xs text-yellow-500 ml-auto">
                              {timeAgo(msg.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-yellow-800 whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    )
                  }

                  // USER message (right side)
                  if (msg.sender === 'USER') {
                    return (
                      <div key={msg.id} className="flex justify-end">
                        <div className="max-w-[75%]">
                          <div className="bg-violet-600 text-white rounded-2xl rounded-br-md px-4 py-3">
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          </div>
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <User className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-400">{timeAgo(msg.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  // AI message (left side)
                  if (msg.sender === 'AI') {
                    return (
                      <div key={msg.id} className="flex justify-start">
                        <div className="max-w-[75%]">
                          <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-bl-md px-4 py-3">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Bot className="w-3.5 h-3.5 text-gray-500" />
                              <span className="text-xs font-medium text-gray-500">IA</span>
                              {msg.aiConfidence !== null && (
                                <span className="text-xs text-gray-400 ml-1">
                                  ({Math.round(msg.aiConfidence * 100)}% confianza)
                                </span>
                              )}
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-gray-400">{timeAgo(msg.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  // ADMIN message (left side, blue)
                  return (
                    <div key={msg.id} className="flex justify-start">
                      <div className="max-w-[75%]">
                        <div className="bg-blue-50 text-gray-800 border border-blue-200 rounded-2xl rounded-bl-md px-4 py-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                            <span className="text-xs font-medium text-blue-600">
                              {msg.admin?.name || 'Admin'}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs text-gray-400">{timeAgo(msg.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Reply Form */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <form onSubmit={handleSendReply}>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={isInternal ? 'Escribe una nota interna...' : 'Escribe tu respuesta...'}
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none text-sm ${
                  isInternal
                    ? 'border-yellow-300 bg-yellow-50 placeholder-yellow-500'
                    : 'border-gray-300'
                }`}
              />
              <div className="flex items-center justify-between mt-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                  />
                  <Lock className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-gray-700">Nota interna</span>
                </label>
                <button
                  type="submit"
                  disabled={!replyContent.trim() || sending}
                  className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  {sending ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT: Metadata panel */}
        <div className="space-y-4">
          {/* Ticket Metadata */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Detalles del Ticket</h3>

            <div className="space-y-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm bg-white"
                >
                  <option value="OPEN">Abierto</option>
                  <option value="WAITING_ADMIN">Esperando Admin</option>
                  <option value="RESOLVED">Resuelto</option>
                  <option value="CLOSED">Cerrado</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm bg-white"
                >
                  <option value="LOW">Baja</option>
                  <option value="MEDIUM">Media</option>
                  <option value="HIGH">Alta</option>
                  <option value="URGENT">Urgente</option>
                </select>
              </div>

              {/* AI Enabled */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IA Habilitada</label>
                <button
                  type="button"
                  onClick={() => setEditAiEnabled(!editAiEnabled)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors w-full ${
                    editAiEnabled
                      ? 'bg-green-50 border-green-300 text-green-700'
                      : 'bg-gray-50 border-gray-300 text-gray-500'
                  }`}
                >
                  {editAiEnabled ? (
                    <ToggleRight className="w-5 h-5" />
                  ) : (
                    <ToggleLeft className="w-5 h-5" />
                  )}
                  <span className="text-sm">{editAiEnabled ? 'Activada' : 'Desactivada'}</span>
                </button>
              </div>

              {/* Assigned To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asignado a</label>
                <input
                  type="text"
                  value={editAssignedTo}
                  onChange={(e) => setEditAssignedTo(e.target.value)}
                  placeholder="ID del admin (opcional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveMetadata}
                disabled={saving}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  saveSuccess
                    ? 'bg-green-600 text-white'
                    : 'bg-violet-600 hover:bg-violet-700 text-white'
                } disabled:opacity-50`}
              >
                <Save className="w-4 h-4" />
                {saving ? 'Guardando...' : saveSuccess ? 'Guardado' : 'Guardar cambios'}
              </button>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Informacion del Usuario</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Nombre</p>
                <p className="text-sm font-medium text-gray-900">{ticket.user?.name || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">{ticket.user?.email || ticket.email || '-'}</p>
              </div>
              {ticket.user?.id && (
                <div>
                  <p className="text-xs text-gray-500">User ID</p>
                  <p className="text-xs text-gray-600 font-mono break-all">{ticket.user.id}</p>
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Tiempos</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Creado</p>
                  <p className="text-sm text-gray-900">
                    {new Date(ticket.createdAt).toLocaleString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
              {ticket.lastMessageAt && (
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Ultimo mensaje</p>
                    <p className="text-sm text-gray-900">
                      {new Date(ticket.lastMessageAt).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              )}
              {ticket.assignedAdmin && (
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Admin asignado</p>
                    <p className="text-sm text-gray-900">{ticket.assignedAdmin.name}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
