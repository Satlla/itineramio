'use client'

import { useState } from 'react'
import {
  X,
  Mail,
  Calendar,
  Tag,
  Target,
  Flame,
  Clock,
  Users,
  Trash2,
  Edit3,
  Save,
  AlertTriangle,
  Loader2,
  Building2,
  Calculator,
  Brain,
  Video,
  FileText,
  CheckCircle2,
  MessageSquare
} from 'lucide-react'
import toast from 'react-hot-toast'

// Types for different lead sources
export interface UnifiedLeadMetadata {
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
    automatizacion: string
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

export interface UnifiedLead {
  id: string
  email: string
  source: string
  metadata: UnifiedLeadMetadata
  createdAt: string
}

export interface MarketingLead {
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

export interface AcademiaLead {
  id: string
  email: string
  status: string
  createdAt: string
  unsubscribedAt?: string
}

export interface QuizLead {
  id: string
  email: string
  fullName: string | null
  score: number
  level: string
  source: string | null
  completedAt: string
  converted: boolean
}

type LeadType = 'unified' | 'marketing' | 'academia' | 'quiz'

interface LeadDetailModalProps {
  lead: UnifiedLead | MarketingLead | AcademiaLead | QuizLead
  type: LeadType
  onClose: () => void
  onDelete?: (id: string) => void
  onUpdate?: (id: string, data: any) => void
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

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'hot': return 'bg-rose-100 text-rose-700 border-rose-200'
    case 'warm': return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'cold': return 'bg-blue-100 text-blue-700 border-blue-200'
    default: return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

export function LeadDetailModal({ lead, type, onClose, onDelete, onUpdate }: LeadDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editData, setEditData] = useState<any>({})

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const endpoint = getDeleteEndpoint(type, lead.id)
      const response = await fetch(endpoint, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        toast.success('Lead eliminado correctamente')
        onDelete?.(lead.id)
        onClose()
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Error al eliminar')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar lead')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const endpoint = getUpdateEndpoint(type, lead.id)
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editData)
      })

      if (response.ok) {
        toast.success('Lead actualizado correctamente')
        onUpdate?.(lead.id, editData)
        setIsEditing(false)
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Error al actualizar')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al actualizar lead')
    } finally {
      setIsSaving(false)
    }
  }

  function getDeleteEndpoint(type: LeadType, id: string): string {
    switch (type) {
      case 'unified': return `/api/admin/leads/${id}`
      case 'marketing': return `/api/admin/marketing/leads/${id}`
      case 'academia': return `/api/admin/academia/leads/${id}`
      case 'quiz': return `/api/admin/academia/quiz-leads/${id}`
      default: return `/api/admin/leads/${id}`
    }
  }

  function getUpdateEndpoint(type: LeadType, id: string): string {
    return getDeleteEndpoint(type, id)
  }

  const renderContent = () => {
    switch (type) {
      case 'unified':
        return renderUnifiedLead(lead as UnifiedLead)
      case 'marketing':
        return renderMarketingLead(lead as MarketingLead)
      case 'academia':
        return renderAcademiaLead(lead as AcademiaLead)
      case 'quiz':
        return renderQuizLead(lead as QuizLead)
      default:
        return null
    }
  }

  const renderUnifiedLead = (lead: UnifiedLead) => {
    const meta = lead.metadata
    const completed = meta.completed

    return (
      <div className="space-y-4">
        {/* Status banner */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(meta.status)}`}>
            {meta.status === 'hot' ? 'Caliente' : meta.status === 'warm' ? 'Tibio' : 'Frío'} · {meta.score}/100 puntos
          </span>
          {meta.emailsClicked && meta.emailsClicked.length > 0 && (
            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
              Emails clickados: {meta.emailsClicked.join(', ')}
            </span>
          )}
        </div>

        {/* Journey steps */}
        <div className="flex items-center gap-2 flex-wrap">
          <JourneyBadge completed={!!completed.calculator} icon={Calculator} label="Calculadora" />
          <JourneyBadge completed={!!completed.plantillasForm} icon={FileText} label="Formulario" />
          <JourneyBadge completed={!!completed.quiz} icon={Brain} label="Quiz" />
          <JourneyBadge completed={!!completed.videoCall} icon={Video} label="VideoCall" />
        </div>

        {/* Calculator data */}
        {meta.calculator && (
          <div className="bg-green-50 rounded-lg border border-green-200 p-3">
            <div className="flex items-center gap-2 text-sm font-medium text-green-700 mb-2">
              <Calculator className="w-4 h-4" />
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
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-3">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-700 mb-2">
              <FileText className="w-4 h-4" />
              Formulario de Recursos
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex flex-wrap gap-2">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  {PROPERTY_LABELS[meta.plantillasForm.propiedades] || meta.plantillasForm.propiedades}
                </span>
                {meta.plantillasForm.automatizacion && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    AUTOMATION_LABELS[meta.plantillasForm.automatizacion]?.color || 'bg-gray-100'
                  }`}>
                    {AUTOMATION_LABELS[meta.plantillasForm.automatizacion]?.label || meta.plantillasForm.automatizacion}
                  </span>
                )}
              </div>
              {meta.plantillasForm.intereses.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {meta.plantillasForm.intereses.map((i) => (
                    <span key={i} className="px-2 py-1 bg-white rounded-full text-xs border">
                      {INTEREST_LABELS[i] || i}
                    </span>
                  ))}
                </div>
              )}
              {meta.plantillasForm.comentario && (
                <div className="bg-white rounded p-2 text-gray-600 border">
                  <MessageSquare className="w-3 h-3 inline mr-1" />
                  {meta.plantillasForm.comentario}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quiz data */}
        {meta.quiz && (
          <div className="bg-violet-50 rounded-lg border border-violet-200 p-3">
            <div className="flex items-center gap-2 text-sm font-medium text-violet-700 mb-2">
              <Brain className="w-4 h-4" />
              Quiz de Perfil
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{ARCHETYPE_EMOJIS[meta.quiz.archetype]}</span>
                <div>
                  <div className="font-bold text-gray-900">{meta.quiz.archetype}</div>
                  <div className="text-xs text-gray-500">Fortaleza: {meta.quiz.topStrength}</div>
                </div>
              </div>
              <div className="text-xs text-amber-600 bg-amber-50 rounded px-2 py-1 inline-block border border-amber-200">
                Brecha crítica: {meta.quiz.criticalGap}
              </div>
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="text-xs text-gray-500 flex flex-wrap gap-3 pt-2 border-t border-gray-200">
          <span>Primer contacto: {formatDate(meta.firstTouch)}</span>
          <span>Última actividad: {formatDate(meta.lastActivity)}</span>
        </div>
      </div>
    )
  }

  const renderMarketingLead = (lead: MarketingLead) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <InfoBox icon={Target} label="Fuente">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
            {lead.source || 'unknown'}
          </span>
        </InfoBox>

        <InfoBox icon={Flame} label="Engagement">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            lead.engagementScore === 'hot' ? 'bg-red-100 text-red-800' :
            lead.engagementScore === 'warm' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {lead.engagementScore || 'warm'}
          </span>
        </InfoBox>

        <InfoBox icon={Clock} label="Journey Stage">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {lead.currentJourneyStage || 'subscribed'}
          </span>
        </InfoBox>

        {lead.archetype && (
          <InfoBox icon={Users} label="Arquetipo">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {ARCHETYPE_EMOJIS[lead.archetype] || ''} {lead.archetype}
            </span>
          </InfoBox>
        )}

        <InfoBox icon={Calendar} label="Fecha de registro">
          <span className="text-sm font-medium text-gray-900">{formatDate(lead.createdAt)}</span>
        </InfoBox>
      </div>

      {/* Tags */}
      <div>
        <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Tag className="w-4 h-4" />
          Tags ({lead.tags?.length || 0})
        </h5>
        {lead.tags && lead.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {lead.tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No tiene tags</p>
        )}
      </div>
    </div>
  )

  const renderAcademiaLead = (lead: AcademiaLead) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <InfoBox icon={CheckCircle2} label="Estado">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            lead.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {lead.status === 'active' ? 'Activo' : 'Dado de baja'}
          </span>
        </InfoBox>

        <InfoBox icon={Calendar} label="Fecha de registro">
          <span className="text-sm font-medium text-gray-900">{formatDate(lead.createdAt)}</span>
        </InfoBox>

        {lead.unsubscribedAt && (
          <InfoBox icon={X} label="Fecha de baja">
            <span className="text-sm font-medium text-red-600">{formatDate(lead.unsubscribedAt)}</span>
          </InfoBox>
        )}
      </div>
    </div>
  )

  const renderQuizLead = (lead: QuizLead) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <InfoBox icon={Brain} label="Puntuación">
          <span className="text-xl font-bold text-violet-600">{lead.score}/100</span>
        </InfoBox>

        <InfoBox icon={Target} label="Nivel">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            lead.level === 'expert' ? 'bg-green-100 text-green-800' :
            lead.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {lead.level}
          </span>
        </InfoBox>

        <InfoBox icon={Target} label="Fuente">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
            {lead.source || 'direct'}
          </span>
        </InfoBox>

        <InfoBox icon={CheckCircle2} label="Convertido">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            lead.converted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {lead.converted ? 'Sí' : 'No'}
          </span>
        </InfoBox>

        <InfoBox icon={Calendar} label="Completado">
          <span className="text-sm font-medium text-gray-900">{formatDate(lead.completedAt)}</span>
        </InfoBox>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {'name' in lead && lead.name ? lead.name : 'fullName' in lead && lead.fullName ? lead.fullName : 'Lead'}
                </h3>
                <p className="text-white/80 text-sm">{lead.email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between gap-3">
          {showDeleteConfirm ? (
            <div className="flex items-center gap-3 w-full">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-sm text-gray-700 flex-1">¿Eliminar este lead permanentemente?</span>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Eliminar
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${lead.email}`}
                  className="px-4 py-2 bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 transition-colors flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </a>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper components
function JourneyBadge({ completed, icon: Icon, label }: { completed: boolean; icon: React.ElementType; label: string }) {
  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
      completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
    }`}>
      {completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-current" />}
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </div>
  )
}

function InfoBox({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
        <Icon className="w-3 h-3" />
        {label}
      </div>
      {children}
    </div>
  )
}
