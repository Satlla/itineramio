'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Users,
  Building2,
  Loader2,
  Mail,
  MessageSquare,
  Flame,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Calculator,
  FileText,
  Brain,
  Video,
  CheckCircle2,
  Circle,
  TrendingUp,
  Eye
} from 'lucide-react'
import { LeadDetailModal, UnifiedLead as ModalUnifiedLead } from '@/components/admin/LeadDetailModal'

interface UnifiedLeadMetadata {
  completed: {
    calculator?: boolean
    plantillasForm?: boolean
    quiz?: boolean
    videoCall?: boolean
  }
  calculator?: {
    properties: number
    hoursPerYear: number
    completedAt: string
  }
  plantillasForm?: {
    propiedades: string
    automatización: string
    intereses: string[]
    comentario?: string
    resourceSlug: string
    completedAt: string
  }
  quiz?: {
    testResultId: string
    archetype: string
    topStrength: string
    criticalGap: string
    scores: Record<string, number>
    completedAt: string
  }
  score: number
  status: 'cold' | 'warm' | 'hot'
  firstTouch: string
  lastActivity: string
  source: string
  emailsClicked?: string[]
}

interface UnifiedLead {
  id: string
  email: string
  source: string
  metadata: UnifiedLeadMetadata
  createdAt: string
}

interface Stats {
  total: number
  hot: number
  warm: number
  cold: number
  withQuiz: number
  withForm: number
  withCalculator: number
}

const PROPERTY_LABELS: Record<string, string> = {
  '1': '1 propiedad',
  '2-3': '2-3 propiedades',
  '4-5': '4-5 propiedades',
  '6-10': '6-10 propiedades',
  '10+': 'Más de 10'
}

const AUTOMATION_LABELS: Record<string, { label: string; color: string }> = {
  'nada': { label: 'Nada automatizado', color: 'bg-red-100 text-red-700' },
  'básico': { label: 'Algo básico', color: 'bg-yellow-100 text-yellow-700' },
  'herramientas': { label: 'Usa herramientas', color: 'bg-green-100 text-green-700' }
}

const INTEREST_LABELS: Record<string, string> = {
  'mensajes': '💬 Mensajes',
  'checkin': '🔑 Check-in',
  'limpieza': '🧹 Limpieza',
  'precios': '💰 Precios',
  'reseñas': '⭐ Reseñas'
}

const ARCHETYPE_EMOJIS: Record<string, string> = {
  'ESTRATEGA': '🎯',
  'SISTEMATICO': '⚙️',
  'DIFERENCIADOR': '✨',
  'EJECUTOR': '⚡',
  'RESOLUTOR': '🛡️',
  'EXPERIENCIAL': '❤️',
  'EQUILIBRADO': '⚖️',
  'IMPROVISADOR': '🎲'
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'hot': return 'bg-rose-100 text-rose-700 border-rose-200'
    case 'warm': return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'cold': return 'bg-blue-100 text-blue-700 border-blue-200'
    default: return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'hot': return 'Caliente'
    case 'warm': return 'Tibio'
    case 'cold': return 'Frío'
    default: return status
  }
}

function JourneyStep({ completed, icon: Icon, label }: { completed: boolean; icon: React.ElementType; label: string }) {
  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
      completed
        ? 'bg-green-100 text-green-700'
        : 'bg-gray-100 text-gray-400'
    }`}>
      {completed ? (
        <CheckCircle2 className="w-3.5 h-3.5" />
      ) : (
        <Circle className="w-3.5 h-3.5" />
      )}
      <Icon className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </div>
  )
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<UnifiedLead[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'hot' | 'warm' | 'cold' | 'quiz'>('all')
  const [expandedLead, setExpandedLead] = useState<string | null>(null)
  const [selectedLead, setSelectedLead] = useState<UnifiedLead | null>(null)

  const handleDeleteLead = (id: string) => {
    setLeads(leads.filter(l => l.id !== id))
    if (stats) {
      setStats({ ...stats, total: stats.total - 1 })
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/leads/unified', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setLeads(data.leads || [])
        setStats(data.stats || null)
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLeads = leads.filter(lead => {
    if (filter === 'all') return true
    if (filter === 'quiz') return lead.metadata.completed.quiz
    return lead.metadata.status === filter
  })

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al Admin</span>
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-violet-600" />
              Leads Unificados
            </h1>
            <p className="text-gray-600 mt-1">
              Vista completa del journey de cada lead
            </p>
          </div>

          <button
            onClick={fetchLeads}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-lg border p-3 text-left transition-all ${
              filter === 'all' ? 'ring-2 ring-violet-500 border-violet-300' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-600">Total</div>
          </button>
          <button
            onClick={() => setFilter('hot')}
            className={`rounded-lg border p-3 text-left transition-all ${
              filter === 'hot' ? 'ring-2 ring-rose-500 bg-rose-50 border-rose-300' : 'bg-rose-50/50 border-rose-200 hover:bg-rose-50'
            }`}
          >
            <div className="text-2xl font-bold text-rose-600 flex items-center gap-1">
              <Flame className="w-5 h-5" />
              {stats.hot}
            </div>
            <div className="text-xs text-rose-600">Calientes</div>
          </button>
          <button
            onClick={() => setFilter('warm')}
            className={`rounded-lg border p-3 text-left transition-all ${
              filter === 'warm' ? 'ring-2 ring-amber-500 bg-amber-50 border-amber-300' : 'bg-amber-50/50 border-amber-200 hover:bg-amber-50'
            }`}
          >
            <div className="text-2xl font-bold text-amber-600">{stats.warm}</div>
            <div className="text-xs text-amber-600">Tibios</div>
          </button>
          <button
            onClick={() => setFilter('cold')}
            className={`rounded-lg border p-3 text-left transition-all ${
              filter === 'cold' ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-300' : 'bg-blue-50/50 border-blue-200 hover:bg-blue-50'
            }`}
          >
            <div className="text-2xl font-bold text-blue-600">{stats.cold}</div>
            <div className="text-xs text-blue-600">Fríos</div>
          </button>
          <button
            onClick={() => setFilter('quiz')}
            className={`rounded-lg border p-3 text-left transition-all ${
              filter === 'quiz' ? 'ring-2 ring-violet-500 bg-violet-50 border-violet-300' : 'bg-violet-50/50 border-violet-200 hover:bg-violet-50'
            }`}
          >
            <div className="text-2xl font-bold text-violet-600 flex items-center gap-1">
              <Brain className="w-5 h-5" />
              {stats.withQuiz}
            </div>
            <div className="text-xs text-violet-600">Con Quiz</div>
          </button>
          <div className="rounded-lg border border-gray-200 p-3">
            <div className="text-2xl font-bold text-gray-700 flex items-center gap-1">
              <FileText className="w-5 h-5" />
              {stats.withForm}
            </div>
            <div className="text-xs text-gray-600">Con Formulario</div>
          </div>
          <div className="rounded-lg border border-gray-200 p-3">
            <div className="text-2xl font-bold text-gray-700 flex items-center gap-1">
              <Calculator className="w-5 h-5" />
              {stats.withCalculator}
            </div>
            <div className="text-xs text-gray-600">Con Calculadora</div>
          </div>
        </div>
      )}

      {/* Journey Legend */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4 flex flex-wrap items-center gap-4 text-xs text-gray-600">
        <span className="font-medium">Journey:</span>
        <div className="flex items-center gap-1">
          <Calculator className="w-3.5 h-3.5" />
          <span>Calculadora</span>
        </div>
        <div className="flex items-center gap-1">
          <FileText className="w-3.5 h-3.5" />
          <span>Formulario</span>
        </div>
        <div className="flex items-center gap-1">
          <Brain className="w-3.5 h-3.5" />
          <span>Quiz</span>
        </div>
        <div className="flex items-center gap-1">
          <Video className="w-3.5 h-3.5" />
          <span>VideoCall</span>
        </div>
      </div>

      {/* Leads List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            Cargando leads...
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No hay leads</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredLeads.map((lead) => {
              const expanded = expandedLead === lead.id
              const meta = lead.metadata
              const completed = meta.completed

              return (
                <div
                  key={lead.id}
                  className={`${meta.status === 'hot' ? 'bg-rose-50/30' : ''}`}
                >
                  {/* Main row */}
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedLead(expanded ? null : lead.id)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      {/* Status & Email */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(meta.status)}`}>
                          {meta.score}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 truncate">
                              {lead.email}
                            </span>
                            {meta.status === 'hot' && (
                              <Flame className="w-4 h-4 text-rose-500 flex-shrink-0" />
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(meta.lastActivity).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                            {' · '}
                            <span className="text-gray-400">{meta.source}</span>
                          </div>
                        </div>
                      </div>

                      {/* Journey Steps */}
                      <div className="flex items-center gap-1">
                        <JourneyStep completed={!!completed.calculator} icon={Calculator} label="Calc" />
                        <JourneyStep completed={!!completed.plantillasForm} icon={FileText} label="Form" />
                        <JourneyStep completed={!!completed.quiz} icon={Brain} label="Quiz" />
                        <JourneyStep completed={!!completed.videoCall} icon={Video} label="Call" />
                      </div>

                      {/* Archetype badge */}
                      {meta.quiz && (
                        <div className="hidden lg:flex items-center gap-1 px-2 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-medium">
                          <span>{ARCHETYPE_EMOJIS[meta.quiz.archetype] || ''}</span>
                          <span>{meta.quiz.archetype}</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedLead(lead)
                          }}
                          className="p-2 hover:bg-violet-100 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4 text-violet-600" />
                        </button>
                        <a
                          href={`mailto:${lead.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Enviar email"
                        >
                          <Mail className="w-4 h-4 text-gray-500" />
                        </a>
                        {expanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {expanded && (
                    <div className="px-4 pb-4 pt-0">
                      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                        {/* Status banner */}
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(meta.status)}`}>
                            {getStatusLabel(meta.status)} · {meta.score}/100 puntos
                          </span>
                          {meta.emailsClicked && meta.emailsClicked.length > 0 && (
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                              Emails clickados: {meta.emailsClicked.join(', ')}
                            </span>
                          )}
                        </div>

                        {/* Calculator data */}
                        {meta.calculator && (
                          <div className="bg-white rounded-lg border border-gray-200 p-3">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                              <Calculator className="w-4 h-4 text-green-600" />
                              Calculadora de Tiempo
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-gray-500">Propiedades:</span>
                                <span className="ml-1 font-medium">{meta.calculator.properties}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Horas/año:</span>
                                <span className="ml-1 font-medium">{meta.calculator.hoursPerYear}h</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Form data */}
                        {meta.plantillasForm && (
                          <div className="bg-white rounded-lg border border-gray-200 p-3">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                              <FileText className="w-4 h-4 text-blue-600" />
                              Formulario de Recursos
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex flex-wrap gap-2">
                                <span className="flex items-center gap-1">
                                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                                  {PROPERTY_LABELS[meta.plantillasForm.propiedades] || meta.plantillasForm.propiedades}
                                </span>
                                {meta.plantillasForm.automatización && (
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    AUTOMATION_LABELS[meta.plantillasForm.automatización]?.color || 'bg-gray-100'
                                  }`}>
                                    {AUTOMATION_LABELS[meta.plantillasForm.automatización]?.label || meta.plantillasForm.automatización}
                                  </span>
                                )}
                              </div>
                              {meta.plantillasForm.intereses.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {meta.plantillasForm.intereses.map((i) => (
                                    <span
                                      key={i}
                                      className="px-2 py-1 bg-gray-100 rounded-full text-xs"
                                    >
                                      {INTEREST_LABELS[i] || i}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {meta.plantillasForm.comentario && (
                                <div className="bg-gray-50 rounded p-2 text-gray-600">
                                  <MessageSquare className="w-3 h-3 inline mr-1" />
                                  {meta.plantillasForm.comentario}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Quiz data */}
                        {meta.quiz && (
                          <div className="bg-white rounded-lg border border-gray-200 p-3">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                              <Brain className="w-4 h-4 text-violet-600" />
                              Quiz de Perfil
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{ARCHETYPE_EMOJIS[meta.quiz.archetype]}</span>
                                <div>
                                  <div className="font-bold text-gray-900">{meta.quiz.archetype}</div>
                                  <div className="text-xs text-gray-500">
                                    Fortaleza: {meta.quiz.topStrength}
                                  </div>
                                </div>
                              </div>
                              <div className="text-xs text-amber-600 bg-amber-50 rounded px-2 py-1 inline-block">
                                Brecha crítica: {meta.quiz.criticalGap}
                              </div>
                              {meta.quiz.testResultId && (
                                <Link
                                  href={`/host-profile/results/${meta.quiz.testResultId}`}
                                  className="text-xs text-violet-600 hover:underline block"
                                  target="_blank"
                                >
                                  Ver resultados completos →
                                </Link>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Timestamps */}
                        <div className="text-xs text-gray-500 flex flex-wrap gap-3 pt-2 border-t border-gray-200">
                          <span>
                            Primer contacto: {new Date(meta.firstTouch).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                          <span>
                            Última actividad: {new Date(meta.lastActivity).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead as ModalUnifiedLead}
          type="unified"
          onClose={() => setSelectedLead(null)}
          onDelete={handleDeleteLead}
        />
      )}
    </div>
  )
}
