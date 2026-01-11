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
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface QualifiedLead {
  id: string
  email: string
  name: string | null
  source: string
  createdAt: string
  metadata: {
    // Legacy fields
    propiedades?: string
    automatizacion?: string
    intereses?: string[]
    comentario?: string
    funnelLevel?: number
    resourceSlug?: string
    // New funnel journey fields
    currentLevel?: number
    currentStage?: string
    arrivedFrom?: string
    emailsClicked?: string[]
    resourcesRequested?: string[]
    emailsReceived?: string[]
    qualification?: {
      propiedades?: string
      automatizacion?: string
      intereses?: string[]
      comentario?: string
      score?: number
    }
    firstTouch?: string
    lastTouch?: string
  } | null
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
  'basico': { label: 'Algo básico', color: 'bg-yellow-100 text-yellow-700' },
  'herramientas': { label: 'Usa herramientas', color: 'bg-green-100 text-green-700' }
}

const INTEREST_LABELS: Record<string, string> = {
  'mensajes': '💬 Mensajes',
  'checkin': '🔑 Check-in',
  'limpieza': '🧹 Limpieza',
  'precios': '💰 Precios',
  'resenas': '⭐ Reseñas'
}

const STAGE_LABELS: Record<string, { label: string; color: string }> = {
  'captured': { label: 'Capturado', color: 'bg-gray-100 text-gray-700' },
  'email1_sent': { label: 'Email 1', color: 'bg-blue-100 text-blue-700' },
  'email1_clicked': { label: 'Click Email 1', color: 'bg-indigo-100 text-indigo-700' },
  'form_completed': { label: 'Formulario', color: 'bg-purple-100 text-purple-700' },
  'resource_sent': { label: 'Recurso enviado', color: 'bg-green-100 text-green-700' }
}

function getScoreColor(score: number): string {
  if (score >= 70) return 'text-green-600 bg-green-50'
  if (score >= 50) return 'text-amber-600 bg-amber-50'
  if (score >= 30) return 'text-orange-600 bg-orange-50'
  return 'text-gray-600 bg-gray-50'
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<QualifiedLead[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'hot'>('all')
  const [expandedLead, setExpandedLead] = useState<string | null>(null)

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/leads/qualified', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setLeads(data.leads || [])
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const isHotLead = (lead: QualifiedLead) => {
    const meta = lead.metadata
    // Support both old and new metadata structure
    const props = meta?.qualification?.propiedades || meta?.propiedades
    const auto = meta?.qualification?.automatizacion || meta?.automatizacion
    return ['4-5', '6-10', '10+'].includes(props || '') && auto === 'nada'
  }

  const getLeadScore = (lead: QualifiedLead): number | null => {
    return lead.metadata?.qualification?.score || null
  }

  const getProps = (lead: QualifiedLead): string | undefined => {
    return lead.metadata?.qualification?.propiedades || lead.metadata?.propiedades
  }

  const getAuto = (lead: QualifiedLead): string | undefined => {
    return lead.metadata?.qualification?.automatizacion || lead.metadata?.automatizacion
  }

  const getIntereses = (lead: QualifiedLead): string[] => {
    return lead.metadata?.qualification?.intereses || lead.metadata?.intereses || []
  }

  const getComentario = (lead: QualifiedLead): string | undefined => {
    return lead.metadata?.qualification?.comentario || lead.metadata?.comentario || undefined
  }

  const filteredLeads = filter === 'hot'
    ? leads.filter(isHotLead)
    : leads

  const hotLeadsCount = leads.filter(isHotLead).length

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
              <Users className="h-6 w-6 text-rose-600" />
              Leads Cualificados
            </h1>
            <p className="text-gray-600 mt-1">
              Leads del formulario de recursos con datos de cualificación
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos ({leads.length})
            </button>
            <button
              onClick={() => setFilter('hot')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                filter === 'hot'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
              }`}
            >
              <Flame className="w-4 h-4" />
              Calientes ({hotLeadsCount})
            </button>
            <button
              onClick={fetchLeads}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{leads.length}</div>
          <div className="text-sm text-gray-600">Total leads</div>
        </div>
        <div className="bg-rose-50 rounded-lg border border-rose-200 p-4">
          <div className="text-2xl font-bold text-rose-600">{hotLeadsCount}</div>
          <div className="text-sm text-rose-600">Leads calientes</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">
            {leads.filter(l => ['4-5', '6-10', '10+'].includes(l.metadata?.propiedades || '')).length}
          </div>
          <div className="text-sm text-gray-600">Con 4+ propiedades</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">
            {leads.filter(l => l.metadata?.automatizacion === 'nada').length}
          </div>
          <div className="text-sm text-gray-600">Sin automatizar</div>
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
            <p>No hay leads {filter === 'hot' ? 'calientes' : ''}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredLeads.map((lead) => {
              const hot = isHotLead(lead)
              const expanded = expandedLead === lead.id
              const meta = lead.metadata || {}
              const score = getLeadScore(lead)
              const props = getProps(lead)
              const auto = getAuto(lead)
              const intereses = getIntereses(lead)
              const comentario = getComentario(lead)

              return (
                <div
                  key={lead.id}
                  className={`${hot ? 'bg-rose-50/50' : ''}`}
                >
                  {/* Main row */}
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedLead(expanded ? null : lead.id)}
                  >
                    <div className="flex items-center gap-4">
                      {/* Hot indicator */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        hot ? 'bg-rose-100' : 'bg-gray-100'
                      }`}>
                        {hot ? (
                          <Flame className="w-5 h-5 text-rose-600" />
                        ) : (
                          <Users className="w-5 h-5 text-gray-400" />
                        )}
                      </div>

                      {/* Email & date */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 truncate">
                            {lead.email}
                          </span>
                          {hot && (
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-medium rounded-full">
                              HOT
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(lead.createdAt).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>

                      {/* Score */}
                      {score !== null && (
                        <div className="hidden lg:block">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${getScoreColor(score)}`}>
                            {score}pts
                          </span>
                        </div>
                      )}

                      {/* Properties */}
                      <div className="hidden sm:flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className={`font-medium ${
                          ['4-5', '6-10', '10+'].includes(props || '')
                            ? 'text-rose-600'
                            : 'text-gray-600'
                        }`}>
                          {PROPERTY_LABELS[props || ''] || props || '-'}
                        </span>
                      </div>

                      {/* Automation */}
                      <div className="hidden md:block">
                        {auto && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            AUTOMATION_LABELS[auto]?.color || 'bg-gray-100 text-gray-700'
                          }`}>
                            {AUTOMATION_LABELS[auto]?.label || auto}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
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
                      <div className="ml-14 bg-gray-50 rounded-lg p-4 space-y-3">
                        {/* Score & Stage (top row) */}
                        <div className="flex flex-wrap gap-2 items-center">
                          {score !== null && (
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(score)}`}>
                              Score: {score}/100
                            </span>
                          )}
                          {meta.currentStage && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              STAGE_LABELS[meta.currentStage]?.color || 'bg-gray-100 text-gray-700'
                            }`}>
                              {STAGE_LABELS[meta.currentStage]?.label || meta.currentStage}
                            </span>
                          )}
                          {meta.arrivedFrom && meta.arrivedFrom !== 'direct' && (
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                              Vino de: {meta.arrivedFrom}
                            </span>
                          )}
                        </div>

                        {/* Properties & Automation (mobile) */}
                        <div className="sm:hidden flex flex-wrap gap-2">
                          <div className="flex items-center gap-1 text-sm">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">
                              {PROPERTY_LABELS[props || ''] || '-'}
                            </span>
                          </div>
                          {auto && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              AUTOMATION_LABELS[auto]?.color
                            }`}>
                              {AUTOMATION_LABELS[auto]?.label}
                            </span>
                          )}
                        </div>

                        {/* Interests */}
                        {intereses.length > 0 && (
                          <div>
                            <div className="text-xs font-medium text-gray-500 mb-1">Intereses:</div>
                            <div className="flex flex-wrap gap-1">
                              {intereses.map((i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 bg-white border border-gray-200 rounded-full text-xs"
                                >
                                  {INTEREST_LABELS[i] || i}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Funnel journey info */}
                        {(meta.emailsClicked?.length || meta.resourcesRequested?.length) && (
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {meta.emailsClicked && meta.emailsClicked.length > 0 && (
                              <div>
                                <span className="text-gray-500">Emails clickados:</span>
                                <span className="ml-1 font-medium">{meta.emailsClicked.join(', ')}</span>
                              </div>
                            )}
                            {meta.resourcesRequested && meta.resourcesRequested.length > 0 && (
                              <div>
                                <span className="text-gray-500">Recursos:</span>
                                <span className="ml-1 font-medium">{meta.resourcesRequested.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Comment */}
                        {comentario && (
                          <div>
                            <div className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              Comentario:
                            </div>
                            <div className="text-sm text-gray-700 bg-white border border-gray-200 rounded-lg p-3">
                              {comentario}
                            </div>
                          </div>
                        )}

                        {/* Source & timestamps */}
                        <div className="text-xs text-gray-500 flex flex-wrap gap-3">
                          <span>Fuente: {meta.resourceSlug || lead.source}</span>
                          {meta.firstTouch && (
                            <span>Primer contacto: {new Date(meta.firstTouch).toLocaleDateString('es-ES')}</span>
                          )}
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
    </div>
  )
}
