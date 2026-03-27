'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle,
  Users,
  AlertTriangle,
  BarChart3,
  ArrowLeft,
  X,
  Mail,
  Globe,
  Calendar,
  ChevronRight,
  Trash2,
  CheckCircle,
  Send,
  Brain,
  Pencil,
  Check,
  Sparkles
} from 'lucide-react'
import { Button } from '../../../../../src/components/ui/Button'
import { Card, CardContent } from '../../../../../src/components/ui/Card'
import { useRouter, useParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

interface Conversation {
  id: string
  sessionId: string
  language: string
  guestEmail: string | null
  guestName: string | null
  messages: Message[]
  unansweredQuestions: string[]
  createdAt: string
  updatedAt: string
}

interface Guest {
  email: string
  name: string | null
  conversationCount: number
  language: string
  firstSeen: string
  lastSeen: string
}

interface Stats {
  totalConversations: number
  capturedGuests: number
  totalUnanswered: number
  languageDistribution: Record<string, number>
  last7Days: number
  last30Days: number
}

type Tab = 'conversations' | 'unanswered' | 'intelligence' | 'guests' | 'summary'

export default function ChatbotDashboardPage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string
  const { t, i18n } = useTranslation('dashboard')

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [propertyName, setPropertyName] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('conversations')
  const [customQA, setCustomQA] = useState<{ question: string; answer: string; addedAt: string; updatedAt?: string }[]>([])

  // Open unanswered tab automatically if URL has ?tab=unanswered
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search)
      if (sp.get('tab') === 'unanswered') setActiveTab('unanswered')
    }
  }, [])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const deleteConversations = async (ids: string[]) => {
    setDeleting(true)
    try {
      const response = await fetch(`/api/properties/${propertyId}/chatbot/conversations`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationIds: ids })
      })
      const result = await response.json()
      if (result.success) {
        setConversations(prev => prev.filter(c => !ids.includes(c.id)))
        setSelectedConversation(null)
        setConfirmDeleteAll(false)
        // Refresh stats
        fetchData()
      }
    } catch (error) {
      // error deleting conversations
    } finally {
      setDeleting(false)
    }
  }

  useEffect(() => {
    fetchData()
    fetchPropertyInfo()
    fetchCustomQA()
  }, [propertyId])

  const fetchCustomQA = async () => {
    try {
      const res = await fetch(`/api/properties/${propertyId}/chatbot-qa`, { credentials: 'include' })
      const result = await res.json()
      if (result.ok) setCustomQA(result.data)
    } catch {}
  }

  const fetchPropertyInfo = async () => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`, { credentials: 'include' })
      const result = await response.json()
      if (result.success) {
        setPropertyName(result.data.name)
      }
    } catch (error) {
      // error fetching property info
    }
  }

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/properties/${propertyId}/chatbot/conversations`, {
        credentials: 'include'
      })
      const result = await response.json()
      if (result.success) {
        setConversations(result.data.conversations)
        setStats(result.data.stats)
        setGuests(result.data.guests)
      }
    } catch (error) {
      // error fetching chatbot data
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const localeMap: Record<string, string> = { es: 'es-ES', en: 'en-US', fr: 'fr-FR' }
    return new Date(dateString).toLocaleDateString(localeMap[i18n.language] || 'es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDateShort = (dateString: string) => {
    const localeMap: Record<string, string> = { es: 'es-ES', en: 'en-US', fr: 'fr-FR' }
    return new Date(dateString).toLocaleDateString(localeMap[i18n.language] || 'es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const langLabel = (lang: string) => {
    const labels: Record<string, string> = { es: 'ES', en: 'EN', fr: 'FR', de: 'DE', it: 'IT', pt: 'PT' }
    return labels[lang] || lang.toUpperCase()
  }

  const langColor = (lang: string) => {
    const colors: Record<string, string> = {
      es: 'bg-yellow-100 text-yellow-800',
      en: 'bg-blue-100 text-blue-800',
      fr: 'bg-indigo-100 text-indigo-800',
      de: 'bg-gray-100 text-gray-800',
      it: 'bg-green-100 text-green-800',
      pt: 'bg-orange-100 text-orange-800'
    }
    return colors[lang] || 'bg-gray-100 text-gray-800'
  }

  // Collect all unanswered questions across all conversations
  const allUnansweredItems = conversations.flatMap(conv =>
    (Array.isArray(conv.unansweredQuestions) ? conv.unansweredQuestions : []).map((q: any) => ({
      question: typeof q === 'string' ? q : q.question || q.text || JSON.stringify(q),
      conversationId: conv.id,
      guestName: conv.guestName,
      guestEmail: conv.guestEmail,
      date: conv.updatedAt,
      language: conv.language
    }))
  )

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'conversations', label: t('chatbot.tabs.conversations', 'Conversaciones'), count: stats?.totalConversations },
    { key: 'unanswered', label: t('chatbot.tabs.unanswered', 'Sin respuesta'), count: stats?.totalUnanswered },
    { key: 'intelligence', label: 'Inteligencia', count: customQA.length },
    { key: 'guests', label: t('chatbot.tabs.guests', 'Huéspedes'), count: stats?.capturedGuests },
    { key: 'summary', label: t('chatbot.tabs.summary', 'Resumen') }
  ]

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            onClick={() => router.push(`/properties/${propertyId}/zones`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('chatbot.back', 'Volver')}
          </Button>
        </div>

        <h1 className="text-3xl font-bold text-gray-900">
          {t('chatbot.title', { name: propertyName, defaultValue: 'Chatbot — {{name}}' })}
        </h1>
        <p className="text-gray-600 mt-2">
          {t('chatbot.subtitle', 'Conversaciones, preguntas sin respuesta y huéspedes capturados')}
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-6 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'border-violet-500 text-violet-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key
                      ? 'bg-violet-100 text-violet-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'conversations' && (
        <>
          {conversations.length > 0 && (
            <div className="flex justify-end mb-3">
              {confirmDeleteAll ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-red-600">{t('chatbot.deleteAllConfirm', '¿Borrar todas las conversaciones?')}</span>
                  <button
                    onClick={() => deleteConversations(conversations.map(c => c.id))}
                    disabled={deleting}
                    className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {deleting ? t('chatbot.deleting', 'Borrando...') : t('chatbot.confirmDelete', 'Confirmar')}
                  </button>
                  <button
                    onClick={() => setConfirmDeleteAll(false)}
                    className="px-3 py-1.5 text-xs bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    {t('common.cancel', 'Cancelar')}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDeleteAll(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t('chatbot.deleteAll', 'Borrar todas')}
                </button>
              )}
            </div>
          )}
          <ConversationsTab
            conversations={conversations}
            onSelect={setSelectedConversation}
            onDelete={(id) => deleteConversations([id])}
            formatDate={formatDate}
            langLabel={langLabel}
            langColor={langColor}
            t={t}
          />
        </>
      )}

      {activeTab === 'unanswered' && (
        <UnansweredTab
          items={allUnansweredItems}
          propertyId={propertyId}
          onViewConversation={(id) => {
            const conv = conversations.find(c => c.id === id)
            if (conv) setSelectedConversation(conv)
          }}
          onAnswerSaved={() => { fetchCustomQA(); setActiveTab('intelligence') }}
          formatDate={formatDate}
          t={t}
        />
      )}

      {activeTab === 'intelligence' && (
        <IntelligenceTab
          propertyId={propertyId}
          propertyName={propertyName}
          items={customQA}
          onRefresh={fetchCustomQA}
        />
      )}

      {activeTab === 'guests' && (
        <GuestsTab
          guests={guests}
          langLabel={langLabel}
          langColor={langColor}
          formatDateShort={formatDateShort}
          t={t}
        />
      )}

      {activeTab === 'summary' && stats && (
        <SummaryTab stats={stats} t={t} />
      )}

      {/* Conversation Detail Modal */}
      <AnimatePresence>
        {selectedConversation && (
          <ConversationModal
            conversation={selectedConversation}
            onClose={() => setSelectedConversation(null)}
            onDelete={(id) => deleteConversations([id])}
            formatDate={formatDate}
            langLabel={langLabel}
            langColor={langColor}
            t={t}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Tab: Conversations ──────────────────────────────────────────────────

function ConversationsTab({
  conversations,
  onSelect,
  onDelete,
  formatDate,
  langLabel,
  langColor,
  t
}: {
  conversations: Conversation[]
  onSelect: (c: Conversation) => void
  onDelete: (id: string) => void
  formatDate: (d: string) => string
  langLabel: (l: string) => string
  langColor: (l: string) => string
  t: any
}) {
  if (conversations.length === 0) {
    return (
      <Card className="p-8 text-center">
        <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('chatbot.empty.conversations', 'No hay conversaciones')}
        </h3>
        <p className="text-gray-600">
          {t('chatbot.empty.conversationsDesc', 'Las conversaciones del chatbot aparecerán aquí cuando los huéspedes interactúen con él.')}
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {conversations.map((conv) => {
        const messages = Array.isArray(conv.messages) ? conv.messages : []
        const unanswered = Array.isArray(conv.unansweredQuestions) ? conv.unansweredQuestions : []
        const hasUnanswered = unanswered.length > 0
        const guestDisplay = conv.guestName || conv.guestEmail || t('chatbot.anonymous', 'Anónimo')

        return (
          <motion.div
            key={conv.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelect(conv)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 truncate">{guestDisplay}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${langColor(conv.language)}`}>
                        {langLabel(conv.language)}
                      </span>
                      {hasUnanswered && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {unanswered.length}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {messages.length} {t('chatbot.messages', 'mensajes')}
                      </span>
                      <span>{formatDate(conv.updatedAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(conv.id) }}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title={t('chatbot.deleteConversation', 'Borrar conversación')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

// ─── Tab: Unanswered ─────────────────────────────────────────────────────

function UnansweredTab({
  items,
  propertyId,
  onViewConversation,
  onAnswerSaved,
  formatDate,
  t
}: {
  items: { question: string; conversationId: string; guestName: string | null; guestEmail: string | null; date: string; language: string }[]
  propertyId: string
  onViewConversation: (id: string) => void
  onAnswerSaved: () => void
  formatDate: (d: string) => string
  t: any
}) {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [saved, setSaved] = useState<Record<number, boolean>>({})
  const [saving, setSaving] = useState<Record<number, boolean>>({})

  const handleSave = async (idx: number, question: string) => {
    const answer = answers[idx]?.trim()
    if (!answer) return
    setSaving(s => ({ ...s, [idx]: true }))
    try {
      await fetch(`/api/properties/${propertyId}/chatbot-qa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer })
      })
      setSaved(s => ({ ...s, [idx]: true }))
      // After 2s redirect to intelligence tab
      setTimeout(() => onAnswerSaved(), 2000)
    } finally {
      setSaving(s => ({ ...s, [idx]: false }))
    }
  }

  if (items.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('chatbot.empty.unanswered', 'Sin preguntas sin respuesta')}
        </h3>
        <p className="text-gray-600">
          {t('chatbot.empty.unansweredDesc', 'El chatbot ha podido responder todas las preguntas de los huéspedes.')}
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 mb-1">
        Preguntas que los huéspedes hicieron y el chatbot no supo responder. Añade la respuesta y se guardará en la inteligencia de este apartamento.
      </p>
      {items.map((item, idx) => {
        const guestDisplay = item.guestName || item.guestEmail || t('chatbot.anonymous', 'Anónimo')
        return (
          <motion.div
            key={`${item.conversationId}-${idx}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.03 }}
          >
            <Card className="border-l-4 border-l-orange-400 hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-3">
                <p className="text-gray-900 font-medium">
                  &ldquo;{item.question}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{guestDisplay}</span>
                    <span>{formatDate(item.date)}</span>
                  </div>
                  <button
                    onClick={() => onViewConversation(item.conversationId)}
                    className="text-xs text-violet-600 hover:text-violet-800 font-medium"
                  >
                    {t('chatbot.viewConversation', 'Ver conversación')}
                  </button>
                </div>
                <AnimatePresence mode="wait">
                  {saved[idx] ? (
                    <motion.div
                      key="saved"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-lg px-3 py-2"
                    >
                      <Brain className="w-4 h-4 text-violet-600 flex-shrink-0" />
                      <span className="text-sm text-violet-700 font-medium">Añadida a inteligencia — yendo a la sección...</span>
                    </motion.div>
                  ) : (
                    <motion.div key="input" className="flex gap-2">
                      <input
                        type="text"
                        value={answers[idx] || ''}
                        onChange={e => setAnswers(a => ({ ...a, [idx]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && handleSave(idx, item.question)}
                        placeholder="Escribe la respuesta para el chatbot..."
                        className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-violet-400"
                      />
                      <button
                        onClick={() => handleSave(idx, item.question)}
                        disabled={!answers[idx]?.trim() || saving[idx]}
                        className="px-3 py-2 bg-violet-600 text-white rounded-lg disabled:opacity-40 hover:bg-violet-700 transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

// ─── Tab: Intelligence ───────────────────────────────────────────────────

function IntelligenceTab({
  propertyId,
  propertyName,
  items,
  onRefresh
}: {
  propertyId: string
  propertyName: string
  items: { question: string; answer: string; addedAt: string; updatedAt?: string }[]
  onRefresh: () => void
}) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [editAnswer, setEditAnswer] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)

  const handleEdit = (idx: number) => {
    setEditingIdx(idx)
    setEditAnswer(items[idx].answer)
  }

  const handleSaveEdit = async (idx: number) => {
    if (!editAnswer.trim()) return
    setSaving(true)
    try {
      await fetch(`/api/properties/${propertyId}/chatbot-qa`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalQuestion: items[idx].question, answer: editAnswer.trim() })
      })
      setEditingIdx(null)
      onRefresh()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (idx: number) => {
    setDeleting(idx)
    try {
      await fetch(`/api/properties/${propertyId}/chatbot-qa`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: items[idx].question })
      })
      onRefresh()
    } finally {
      setDeleting(null)
    }
  }

  if (items.length === 0) {
    return (
      <Card className="p-10 text-center border-dashed">
        <Brain className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin inteligencia personalizada aún</h3>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          Cuando respondas preguntas del tab &ldquo;Sin respuesta&rdquo;, se guardarán aquí. El chatbot las usará con prioridad máxima.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4 text-violet-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-violet-900">
            Inteligencia de {propertyName || 'este apartamento'}
          </p>
          <p className="text-xs text-violet-700 mt-0.5">
            {items.length} {items.length === 1 ? 'respuesta personalizada' : 'respuestas personalizadas'} — el chatbot las usa con prioridad máxima sobre cualquier otra fuente
          </p>
        </div>
      </div>

      {/* Q&A list */}
      <div className="space-y-3">
        {items.map((item, idx) => (
          <motion.div
            key={item.question + idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.04 }}
          >
            <Card className="border border-black/[0.06] hover:shadow-sm transition-shadow">
              <CardContent className="p-4 space-y-3">
                {/* Question */}
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13px] text-gray-500 font-medium leading-snug">
                    P: &ldquo;{item.question}&rdquo;
                  </p>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {editingIdx !== idx && (
                      <>
                        <button
                          onClick={() => handleEdit(idx)}
                          className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                          title="Editar respuesta"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(idx)}
                          disabled={deleting === idx}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Answer */}
                {editingIdx === idx ? (
                  <div className="space-y-2">
                    <textarea
                      value={editAnswer}
                      onChange={e => setEditAnswer(e.target.value)}
                      rows={3}
                      className="w-full text-sm border border-violet-300 rounded-lg px-3 py-2 outline-none focus:border-violet-500 resize-none"
                      autoFocus
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setEditingIdx(null)}
                        className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleSaveEdit(idx)}
                        disabled={!editAnswer.trim() || saving}
                        className="px-3 py-1.5 text-xs bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-40 transition-colors flex items-center gap-1.5"
                      >
                        <Check className="w-3 h-3" />
                        Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg px-3 py-2">
                    <p className="text-sm text-gray-800 leading-relaxed">R: {item.answer}</p>
                  </div>
                )}

                {/* Meta */}
                <p className="text-[11px] text-gray-400">
                  Añadida {new Date(item.addedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {item.updatedAt && ' · editada'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── Tab: Guests ─────────────────────────────────────────────────────────

function GuestsTab({
  guests,
  langLabel,
  langColor,
  formatDateShort,
  t
}: {
  guests: Guest[]
  langLabel: (l: string) => string
  langColor: (l: string) => string
  formatDateShort: (d: string) => string
  t: any
}) {
  if (guests.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('chatbot.empty.guests', 'Sin huéspedes capturados')}
        </h3>
        <p className="text-gray-600">
          {t('chatbot.empty.guestsDesc', 'Cuando los huéspedes compartan su email con el chatbot, aparecerán aquí.')}
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {guests.map((guest) => (
        <motion.div
          key={guest.email}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900 truncate">{guest.email}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${langColor(guest.language)}`}>
                      {langLabel(guest.language)}
                    </span>
                  </div>
                  {guest.name && (
                    <p className="text-sm text-gray-600 ml-6">{guest.name}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-1 ml-6">
                    <span>
                      {guest.conversationCount} {guest.conversationCount === 1
                        ? t('chatbot.conversation', 'conversación')
                        : t('chatbot.conversationsPlural', 'conversaciones')}
                    </span>
                    <span>
                      {t('chatbot.firstSeen', 'Primera vez')}: {formatDateShort(guest.firstSeen)}
                    </span>
                    <span>
                      {t('chatbot.lastSeen', 'Última vez')}: {formatDateShort(guest.lastSeen)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

// ─── Tab: Summary ────────────────────────────────────────────────────────

function SummaryTab({ stats, t }: { stats: Stats; t: any }) {
  const statCards = [
    {
      icon: MessageCircle,
      label: t('chatbot.stats.totalConversations', 'Total conversaciones'),
      value: stats.totalConversations,
      color: 'text-blue-500'
    },
    {
      icon: Users,
      label: t('chatbot.stats.capturedGuests', 'Huéspedes capturados'),
      value: stats.capturedGuests,
      color: 'text-green-500'
    },
    {
      icon: AlertTriangle,
      label: t('chatbot.stats.unanswered', 'Preguntas sin respuesta'),
      value: stats.totalUnanswered,
      color: 'text-orange-500'
    },
    {
      icon: Calendar,
      label: t('chatbot.stats.last7Days', 'Últimos 7 días'),
      value: stats.last7Days,
      color: 'text-violet-500'
    }
  ]

  const maxLangCount = Math.max(...Object.values(stats.languageDistribution), 1)

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <card.icon className={`h-8 w-8 ${card.color}`} />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{card.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Language distribution */}
      {Object.keys(stats.languageDistribution).length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900">
                {t('chatbot.stats.languageDistribution', 'Distribución por idioma')}
              </h3>
            </div>
            <div className="space-y-3">
              {Object.entries(stats.languageDistribution)
                .sort(([, a], [, b]) => b - a)
                .map(([lang, count]) => {
                  const langNames: Record<string, string> = {
                    es: 'Español', en: 'English', fr: 'Français',
                    de: 'Deutsch', it: 'Italiano', pt: 'Português'
                  }
                  return (
                    <div key={lang} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600 w-20">{langNames[lang] || lang}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-violet-500 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${(count / maxLangCount) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 30 days stat */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900">
              {t('chatbot.stats.activity', 'Actividad')}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-sm text-gray-500">{t('chatbot.stats.last7Days', 'Últimos 7 días')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.last7Days} {t('chatbot.conversationsPlural', 'conversaciones')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('chatbot.stats.last30Days', 'Últimos 30 días')}</p>
              <p className="text-xl font-bold text-gray-900">{stats.last30Days} {t('chatbot.conversationsPlural', 'conversaciones')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Modal: Conversation Detail ──────────────────────────────────────────

function ConversationModal({
  conversation,
  onClose,
  onDelete,
  formatDate,
  langLabel,
  langColor,
  t
}: {
  conversation: Conversation
  onClose: () => void
  onDelete: (id: string) => void
  formatDate: (d: string) => string
  langLabel: (l: string) => string
  langColor: (l: string) => string
  t: any
}) {
  const messages = Array.isArray(conversation.messages) ? conversation.messages : []
  const unanswered = Array.isArray(conversation.unansweredQuestions) ? conversation.unansweredQuestions : []
  const guestDisplay = conversation.guestName || conversation.guestEmail || t('chatbot.anonymous', 'Anónimo')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-gray-900">{guestDisplay}</h2>
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${langColor(conversation.language)}`}>
                {langLabel(conversation.language)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{formatDate(conversation.createdAt)}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onDelete(conversation.id)}
              className="p-2 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500 transition-colors"
              title={t('chatbot.deleteConversation', 'Borrar conversación')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-violet-500 text-white rounded-br-md'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        {/* Unanswered Questions */}
        {unanswered.length > 0 && (
          <div className="border-t bg-amber-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-800">
                {t('chatbot.modal.unansweredTitle', 'Preguntas sin respuesta')}
              </span>
            </div>
            <ul className="space-y-1">
              {unanswered.map((q: any, idx: number) => (
                <li key={idx} className="text-sm text-amber-700">
                  &bull; {typeof q === 'string' ? q : q.question || q.text || JSON.stringify(q)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
