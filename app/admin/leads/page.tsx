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
  Eye,
  Search,
  Download,
  Calendar,
  Filter,
} from 'lucide-react'
import { LeadDetailModal, UnifiedLead as ModalUnifiedLead, MarketingLead as ModalMarketingLead } from '@/components/admin/LeadDetailModal'

// ─── Unified leads types ───────────────────────────────────────────────────

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

interface UnifiedStats {
  total: number
  hot: number
  warm: number
  cold: number
  withQuiz: number
  withForm: number
  withCalculator: number
}

// ─── Marketing leads types ─────────────────────────────────────────────────

interface MarketingLead {
  id: string
  email: string
  name: string | null
  source: string | null
  tags: string[]
  archetype: string | null
  createdAt: string
  currentJourneyStage: string
  engagementScore: string
}

// ─── Shared labels ─────────────────────────────────────────────────────────

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

// ─── Helpers ───────────────────────────────────────────────────────────────

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
      completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
    }`}>
      {completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
      <Icon className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </div>
  )
}

// ─── Unified tab ───────────────────────────────────────────────────────────

function UnifiedTab() {
  const [leads, setLeads] = useState<UnifiedLead[]>([])
  const [stats, setStats] = useState<UnifiedStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'hot' | 'warm' | 'cold' | 'quiz'>('all')
  const [expandedLead, setExpandedLead] = useState<string | null>(null)
  const [selectedLead, setSelectedLead] = useState<UnifiedLead | null>(null)

  const handleDeleteLead = (id: string) => {
    setLeads(leads.filter(l => l.id !== id))
    if (stats) setStats({ ...stats, total: stats.total - 1 })
  }

  useEffect(() => { fetchLeads() }, [])

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/leads/unified', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setLeads(data.leads || [])
        setStats(data.stats || null)
      }
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  const filteredLeads = leads.filter(lead => {
    if (filter === 'all') return true
    if (filter === 'quiz') return lead.metadata.completed.quiz
    return lead.metadata.status === filter
  })

  return (
    <div>
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          {[
            { key: 'all', label: 'Total', value: stats.total, className: 'border-gray-200' },
            { key: 'hot', label: 'Calientes', value: stats.hot, className: 'bg-rose-50/50 border-rose-200' },
            { key: 'warm', label: 'Tibios', value: stats.warm, className: 'bg-amber-50/50 border-amber-200' },
            { key: 'cold', label: 'Fríos', value: stats.cold, className: 'bg-blue-50/50 border-blue-200' },
            { key: 'quiz', label: 'Con Quiz', value: stats.withQuiz, className: 'bg-violet-50/50 border-violet-200', icon: Brain },
          ].map(({ key, label, value, className, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key as typeof filter)}
              className={`rounded-lg border p-3 text-left transition-all ${className} ${
                filter === key ? 'ring-2 ring-violet-500' : 'hover:border-gray-300'
              }`}
            >
              <div className="text-2xl font-bold text-gray-900 flex items-center gap-1">
                {key === 'hot' && <Flame className="w-5 h-5 text-rose-500" />}
                {Icon && key !== 'hot' && <Icon className="w-5 h-5 text-violet-600" />}
                {value}
              </div>
              <div className="text-xs text-gray-600">{label}</div>
            </button>
          ))}
          <div className="rounded-lg border border-gray-200 p-3">
            <div className="text-2xl font-bold text-gray-700 flex items-center gap-1">
              <FileText className="w-5 h-5" />{stats.withForm}
            </div>
            <div className="text-xs text-gray-600">Con Formulario</div>
          </div>
          <div className="rounded-lg border border-gray-200 p-3">
            <div className="text-2xl font-bold text-gray-700 flex items-center gap-1">
              <Calculator className="w-5 h-5" />{stats.withCalculator}
            </div>
            <div className="text-xs text-gray-600">Con Calculadora</div>
          </div>
        </div>
      )}

      {/* Journey legend */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4 flex flex-wrap items-center gap-4 text-xs text-gray-600">
        <span className="font-medium">Journey:</span>
        {[
          { icon: Calculator, label: 'Calculadora' },
          { icon: FileText, label: 'Formulario' },
          { icon: Brain, label: 'Quiz' },
          { icon: Video, label: 'VideoCall' },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-1">
            <Icon className="w-3.5 h-3.5" /><span>{label}</span>
          </div>
        ))}
      </div>

      {/* Leads list */}
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
                <div key={lead.id} className={meta.status === 'hot' ? 'bg-rose-50/30' : ''}>
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedLead(expanded ? null : lead.id)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(meta.status)}`}>
                          {meta.score}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 truncate">{lead.email}</span>
                            {meta.status === 'hot' && <Flame className="w-4 h-4 text-rose-500 flex-shrink-0" />}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(meta.lastActivity).toLocaleDateString('es-ES', {
                              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                            })}
                            {' · '}<span className="text-gray-400">{meta.source}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <JourneyStep completed={!!completed.calculator} icon={Calculator} label="Calc" />
                        <JourneyStep completed={!!completed.plantillasForm} icon={FileText} label="Form" />
                        <JourneyStep completed={!!completed.quiz} icon={Brain} label="Quiz" />
                        <JourneyStep completed={!!completed.videoCall} icon={Video} label="Call" />
                      </div>

                      {meta.quiz && (
                        <div className="hidden lg:flex items-center gap-1 px-2 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-medium">
                          <span>{ARCHETYPE_EMOJIS[meta.quiz.archetype] || ''}</span>
                          <span>{meta.quiz.archetype}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedLead(lead) }}
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
                        {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                      </div>
                    </div>
                  </div>

                  {expanded && (
                    <div className="px-4 pb-4 pt-0">
                      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
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

                        {meta.calculator && (
                          <div className="bg-white rounded-lg border border-gray-200 p-3">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                              <Calculator className="w-4 h-4 text-green-600" />Calculadora de Tiempo
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div><span className="text-gray-500">Propiedades:</span><span className="ml-1 font-medium">{meta.calculator.properties}</span></div>
                              <div><span className="text-gray-500">Horas/año:</span><span className="ml-1 font-medium">{meta.calculator.hoursPerYear}h</span></div>
                            </div>
                          </div>
                        )}

                        {meta.plantillasForm && (
                          <div className="bg-white rounded-lg border border-gray-200 p-3">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                              <FileText className="w-4 h-4 text-blue-600" />Formulario de Recursos
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
                                    <span key={i} className="px-2 py-1 bg-gray-100 rounded-full text-xs">
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

                        {meta.quiz && (
                          <div className="bg-white rounded-lg border border-gray-200 p-3">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                              <Brain className="w-4 h-4 text-violet-600" />Quiz de Perfil
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{ARCHETYPE_EMOJIS[meta.quiz.archetype]}</span>
                                <div>
                                  <div className="font-bold text-gray-900">{meta.quiz.archetype}</div>
                                  <div className="text-xs text-gray-500">Fortaleza: {meta.quiz.topStrength}</div>
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

                        <div className="text-xs text-gray-500 flex flex-wrap gap-3 pt-2 border-t border-gray-200">
                          <span>Primer contacto: {new Date(meta.firstTouch).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          <span>Última actividad: {new Date(meta.lastActivity).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
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

// ─── Marketing tab ─────────────────────────────────────────────────────────

function MarketingTab() {
  const [leads, setLeads] = useState<MarketingLead[]>([])
  const [sources, setSources] = useState<string[]>([])
  const [stats, setStats] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [exporting, setExporting] = useState(false)
  const [selectedLead, setSelectedLead] = useState<MarketingLead | null>(null)

  const handleDeleteLead = (id: string) => {
    setLeads(leads.filter(l => l.id !== id))
    setTotal(total - 1)
    setSelectedLead(null)
  }

  useEffect(() => { fetchLeads() }, [page, search, sourceFilter])

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(search && { search }),
        ...(sourceFilter && { source: sourceFilter })
      })
      const response = await fetch(`/api/admin/marketing/leads?${params}`, { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setLeads(data.leads)
        setTotalPages(data.pagination.totalPages)
        setTotal(data.pagination.total)
        setSources(data.sources)
        if (data.stats) setStats(data.stats.bySource)
      }
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      const params = new URLSearchParams({ ...(sourceFilter && { source: sourceFilter }) })
      const response = await fetch(`/api/admin/marketing/leads/export?${params}`, { credentials: 'include' })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch {
      alert('Error al exportar leads')
    } finally { setExporting(false) }
  }

  return (
    <div>
      {/* Stats by source */}
      {Object.keys(stats).length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {Object.entries(stats).sort((a, b) => b[1] - a[1]).map(([source, count]) => {
            const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0
            const sourceColors: Record<string, { bg: string; text: string; border: string }> = {
              'calculadora-rentabilidad': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
              'newsletter-footer': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
              'landing-page': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
              'blog': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
              'academia-coming-soon': { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-200' },
              'host_profile_test': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
              'test': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
              'unknown': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' }
            }
            const colors = sourceColors[source] || sourceColors['unknown']
            return (
              <div
                key={source}
                onClick={() => setSourceFilter(source)}
                className={`${colors.bg} ${colors.border} border-2 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all ${
                  sourceFilter === source ? 'ring-2 ring-offset-2 ring-violet-500 shadow-lg' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-semibold ${colors.text} uppercase tracking-wide`}>{source}</span>
                  <span className={`text-xs ${colors.text} font-medium`}>{percentage}%</span>
                </div>
                <div className={`text-2xl font-bold ${colors.text}`}>{count}</div>
                <div className="text-xs text-gray-500 mt-1">{count === 1 ? 'lead' : 'leads'}</div>
                <div className="mt-2 bg-white rounded-full h-1.5 overflow-hidden">
                  <div className={`h-full ${colors.text.replace('text', 'bg')}`} style={{ width: `${percentage}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Filters + Export */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por email, nombre o ciudad..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
            />
          </div>
          <div className="relative flex-1">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              value={sourceFilter}
              onChange={(e) => { setSourceFilter(e.target.value); setPage(1) }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm appearance-none"
            >
              <option value="">Todas las fuentes</option>
              {sources.map(source => <option key={source} value={source}>{source}</option>)}
            </select>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
          >
            {exporting ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />Exportando...</> : <><Download className="h-4 w-4" />Exportar CSV</>}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Lead', 'Arquetipo', 'Fuente', 'Journey Stage', 'Engagement', 'Tags', 'Fecha', 'Ver'].map((h, i) => (
                  <th key={h} className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${i === 7 ? 'text-center' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center"><div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" /></div></td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No se encontraron leads</td></tr>
              ) : leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-start">
                      <Mail className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{lead.name || 'Sin nombre'}</div>
                        <div className="text-sm text-gray-500">{lead.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {lead.archetype
                      ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">{lead.archetype}</span>
                      : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800">{lead.source || 'unknown'}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{lead.currentJourneyStage || 'subscribed'}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      lead.engagementScore === 'hot' ? 'bg-red-100 text-red-800' :
                      lead.engagementScore === 'warm' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>{lead.engagementScore || 'warm'}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[150px]">
                      {lead.tags && lead.tags.length > 0 ? (
                        <>
                          {lead.tags.slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 truncate max-w-[120px]" title={tag}>{tag}</span>
                          ))}
                          {lead.tags.length > 2 && (
                            <button onClick={() => setSelectedLead(lead)} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors">
                              +{lead.tags.length - 2} más
                            </button>
                          )}
                        </>
                      ) : <span className="text-gray-400 text-sm">-</span>}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                      {new Date(lead.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <button onClick={() => setSelectedLead(lead)} className="p-2 text-violet-600 hover:bg-violet-50 rounded-lg transition-colors" title="Ver detalles">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{(page - 1) * 50 + 1}</span> a{' '}
              <span className="font-medium">{Math.min(page * 50, total)}</span> de{' '}
              <span className="font-medium">{total}</span> leads
            </p>
            <nav className="inline-flex rounded-md shadow-sm -space-x-px">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-2 border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50 rounded-l-md">Anterior</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(pageNum => (
                <button key={pageNum} onClick={() => setPage(pageNum)} className={`px-4 py-2 border text-sm font-medium ${page === pageNum ? 'z-10 bg-violet-50 border-violet-500 text-violet-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}>{pageNum}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-2 border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50 rounded-r-md">Siguiente</button>
            </nav>
          </div>
        )}
      </div>

      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead as ModalMarketingLead}
          type="marketing"
          onClose={() => setSelectedLead(null)}
          onDelete={handleDeleteLead}
        />
      )}
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function AdminLeadsPage() {
  const [tab, setTab] = useState<'unified' | 'marketing'>('unified')

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/admin" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al Admin</span>
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-violet-600" />
          Leads
        </h1>
        <p className="text-gray-600 mt-1">Vista completa de todos los anfitriones captados</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab('unified')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            tab === 'unified' ? 'bg-white text-violet-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Journey & Score
        </button>
        <button
          onClick={() => setTab('marketing')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            tab === 'marketing' ? 'bg-white text-violet-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Marketing & Fuentes
        </button>
      </div>

      {tab === 'unified' ? <UnifiedTab /> : <MarketingTab />}
    </div>
  )
}
