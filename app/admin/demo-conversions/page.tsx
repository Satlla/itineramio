'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Target, Users, UserCheck, CreditCard, Crown, Mail,
  MessageCircle, Flame, Clock, AlertTriangle, Search,
  RefreshCw, Loader2, ChevronLeft, ChevronRight, X,
  ExternalLink, Phone, Building2, Gift, CheckCircle,
  Circle, ArrowRight,
} from 'lucide-react'

// ============================================
// TYPES
// ============================================

interface LeadProperty {
  name: string
  city: string
  id: string
}

interface LeadCoupon {
  code: string
  validUntil: string | null
  isActive: boolean
  used: boolean
}

interface LeadEmails {
  confirmation: string | null
  feedback: string | null
  chatbot: string | null
  fomo: string | null
  urgency: string | null
  lastChance: string | null
}

interface DemoLead {
  id: string
  name: string
  email: string
  phone: string
  createdAt: string
  property: LeadProperty
  coupon: LeadCoupon | null
  emails: LeadEmails
  conversion: 'lead' | 'registered' | 'subscribed'
}

interface FunnelStats {
  totalLeads: number
  emailsSent: {
    feedback: number
    chatbot: number
    fomo: number
    urgency: number
    lastChance: number
  }
  couponsUsed: number
  registered: number
  subscribed: number
}

interface ApiResponse {
  leads: DemoLead[]
  total: number
  page: number
  limit: number
  funnelStats: FunnelStats
}

// ============================================
// HELPER COMPONENTS
// ============================================

function FunnelStatsBar({ stats }: { stats: FunnelStats }) {
  const steps = [
    { label: 'Total Leads', value: stats.totalLeads, icon: Users, color: 'from-violet-500 to-violet-600', bg: 'bg-violet-50', text: 'text-violet-700', iconColor: 'text-violet-500' },
    { label: 'Demo Generado', value: stats.totalLeads, icon: Target, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-700', iconColor: 'text-blue-500' },
    { label: 'Cupón Usado', value: stats.couponsUsed, icon: Gift, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-700', iconColor: 'text-amber-500' },
    { label: 'Registrado', value: stats.registered, icon: UserCheck, color: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-50', text: 'text-cyan-700', iconColor: 'text-cyan-500' },
    { label: 'Suscrito', value: stats.subscribed, icon: Crown, color: 'from-emerald-500 to-green-500', bg: 'bg-emerald-50', text: 'text-emerald-700', iconColor: 'text-emerald-500' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {steps.map((step, i) => {
        const prevValue = i > 0 ? steps[i - 1].value : 0
        const pct = prevValue > 0 ? Math.round((step.value / prevValue) * 100) : i === 0 ? 100 : 0
        const Icon = step.icon
        return (
          <div key={step.label} className="relative">
            <div className={`${step.bg} rounded-xl p-4 border border-gray-100`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${step.iconColor}`} />
                <span className="text-xs font-medium text-gray-500">{step.label}</span>
              </div>
              <div className={`text-2xl font-bold ${step.text}`}>{step.value}</div>
              {i > 0 && (
                <div className="mt-1 text-xs text-gray-400">
                  {pct}% del paso anterior
                </div>
              )}
            </div>
            {i < steps.length - 1 && (
              <div className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10">
                <ArrowRight className="w-4 h-4 text-gray-300" />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function EmailEngagementRow({ stats }: { stats: FunnelStats }) {
  const emails = [
    { label: 'Feedback', count: stats.emailsSent.feedback, icon: MessageCircle, color: 'bg-blue-100 text-blue-700' },
    { label: 'Chatbot', count: stats.emailsSent.chatbot, icon: MessageCircle, color: 'bg-purple-100 text-purple-700' },
    { label: 'FOMO', count: stats.emailsSent.fomo, icon: Flame, color: 'bg-orange-100 text-orange-700' },
    { label: 'Urgencia', count: stats.emailsSent.urgency, icon: Clock, color: 'bg-red-100 text-red-700' },
    { label: 'Última Oportunidad', count: stats.emailsSent.lastChance, icon: AlertTriangle, color: 'bg-gray-100 text-gray-700' },
  ]

  return (
    <div className="flex flex-wrap gap-2">
      <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
        <Mail className="w-3.5 h-3.5" /> Emails enviados:
      </span>
      {emails.map(e => {
        const Icon = e.icon
        return (
          <span key={e.label} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${e.color}`}>
            <Icon className="w-3 h-3" />
            {e.label}: {e.count}
          </span>
        )
      })}
    </div>
  )
}

function EmailTimelineDots({ emails }: { emails: LeadEmails }) {
  const dots = [
    { key: 'confirmation', label: 'Conf', sent: emails.confirmation },
    { key: 'feedback', label: 'FB', sent: emails.feedback },
    { key: 'chatbot', label: 'Chat', sent: emails.chatbot },
    { key: 'fomo', label: 'FOMO', sent: emails.fomo },
    { key: 'urgency', label: 'Urg', sent: emails.urgency },
    { key: 'lastChance', label: 'LC', sent: emails.lastChance },
  ]

  return (
    <div className="flex items-center gap-1">
      {dots.map((d, i) => (
        <div key={d.key} className="flex items-center">
          <div
            className={`w-2.5 h-2.5 rounded-full ${d.sent ? 'bg-emerald-500' : 'bg-gray-300'}`}
            title={`${d.label}: ${d.sent ? new Date(d.sent).toLocaleString('es-ES') : 'Pendiente'}`}
          />
          {i < dots.length - 1 && <div className="w-1.5 h-px bg-gray-200" />}
        </div>
      ))}
    </div>
  )
}

function EmailTimelineFull({ emails }: { emails: LeadEmails }) {
  const steps = [
    { key: 'confirmation', label: 'Confirmación', icon: Mail, sent: emails.confirmation },
    { key: 'feedback', label: 'Feedback (1h)', icon: MessageCircle, sent: emails.feedback },
    { key: 'chatbot', label: 'Chatbot (6h)', icon: MessageCircle, sent: emails.chatbot },
    { key: 'fomo', label: 'FOMO (12h)', icon: Flame, sent: emails.fomo },
    { key: 'urgency', label: 'Urgencia (23h)', icon: Clock, sent: emails.urgency },
    { key: 'lastChance', label: 'Última Oportunidad (48h)', icon: AlertTriangle, sent: emails.lastChance },
  ]

  return (
    <div className="space-y-0">
      {steps.map((step, i) => {
        const Icon = step.icon
        return (
          <div key={step.key} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${step.sent ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                {step.sent ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-400" />
                )}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-px h-6 ${step.sent ? 'bg-emerald-200' : 'bg-gray-200'}`} />
              )}
            </div>
            <div className="pb-4">
              <div className="flex items-center gap-2">
                <Icon className={`w-3.5 h-3.5 ${step.sent ? 'text-emerald-600' : 'text-gray-400'}`} />
                <span className={`text-sm font-medium ${step.sent ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
              {step.sent ? (
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(step.sent).toLocaleString('es-ES', {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              ) : (
                <p className="text-xs text-gray-400 mt-0.5">Pendiente</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ConversionBadge({ conversion }: { conversion: 'lead' | 'registered' | 'subscribed' }) {
  const config = {
    lead: { label: 'Lead', bg: 'bg-gray-100', text: 'text-gray-700' },
    registered: { label: 'Registrado', bg: 'bg-blue-100', text: 'text-blue-700' },
    subscribed: { label: 'Suscrito', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  }
  const c = config[conversion]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  )
}

function CouponStatusBadge({ coupon }: { coupon: LeadCoupon | null }) {
  if (!coupon) return <span className="text-xs text-gray-400">-</span>
  if (coupon.used) return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-700">
      Usado
    </span>
  )
  if (!coupon.isActive) return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
      Expirado
    </span>
  )
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
      Activo
    </span>
  )
}

// ============================================
// LEAD DETAIL MODAL
// ============================================

function LeadDetailModal({ lead, onClose }: { lead: DemoLead; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Detalle del Lead</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Contact info */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Contacto</h4>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">{lead.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700">{lead.email}</span>
              </div>
              {lead.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{lead.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">
                  {new Date(lead.createdAt).toLocaleString('es-ES', {
                    day: 'numeric', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Property */}
          {lead.property.name && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Propiedad</h4>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <div>
                      <span className="text-sm font-medium text-gray-900">{lead.property.name}</span>
                      {lead.property.city && (
                        <span className="text-xs text-gray-500 ml-2">({lead.property.city})</span>
                      )}
                    </div>
                  </div>
                  {lead.property.id && (
                    <a
                      href={`/guide/${lead.property.id}?demo=1`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700"
                    >
                      Ver guía <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Email Timeline */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Timeline de Emails</h4>
            <div className="bg-gray-50 rounded-xl p-4">
              <EmailTimelineFull emails={lead.emails} />
            </div>
          </div>

          {/* Coupon */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Cupón</h4>
            <div className="bg-gray-50 rounded-xl p-4">
              {lead.coupon ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <code className="text-sm font-mono bg-white px-2 py-1 rounded border border-gray-200">{lead.coupon.code}</code>
                    <CouponStatusBadge coupon={lead.coupon} />
                  </div>
                  {lead.coupon.validUntil && (
                    <p className="text-xs text-gray-500">
                      Válido hasta: {new Date(lead.coupon.validUntil).toLocaleString('es-ES', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400">Sin cupón</p>
              )}
            </div>
          </div>

          {/* Conversion */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Conversión</h4>
            <div className="bg-gray-50 rounded-xl p-4">
              <ConversionBadge conversion={lead.conversion} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// MAIN PAGE
// ============================================

export default function DemoConversionsPage() {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedLead, setSelectedLead] = useState<DemoLead | null>(null)
  const limit = 20

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        status: statusFilter,
      })
      if (search) params.set('search', search)

      const res = await fetch(`/api/admin/demo-conversions?${params}`, { credentials: 'include' })
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch {
      // ignore fetch error
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSearch = () => {
    setPage(1)
    setSearch(searchInput)
  }

  const totalPages = data ? Math.ceil(data.total / limit) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-100">
            <Target className="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Demo Conversiones</h1>
            <p className="text-sm text-gray-500">Seguimiento de leads, emails y conversiones del demo</p>
          </div>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium text-gray-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Funnel Stats */}
      {data?.funnelStats && <FunnelStatsBar stats={data.funnelStats} />}

      {/* Email Engagement */}
      {data?.funnelStats && (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <EmailEngagementRow stats={data.funnelStats} />
        </div>
      )}

      {/* Search + Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            >
              <option value="all">Todos</option>
              <option value="lead">Lead</option>
              <option value="registered">Registrado</option>
              <option value="subscribed">Suscrito</option>
            </select>
            <button
              onClick={handleSearch}
              className="px-4 py-2.5 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors"
            >
              Buscar
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
        </div>
      )}

      {/* Table (desktop) / Cards (mobile) */}
      {!loading && data && (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Lead</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Propiedad</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Emails</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Cupón</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Conversión</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.leads.map(lead => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                      <div className="text-xs text-gray-500">{lead.email}</div>
                      {lead.phone && <div className="text-xs text-gray-400">{lead.phone}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-700">{lead.property.name || '-'}</div>
                      {lead.property.city && (
                        <div className="text-xs text-gray-400">{lead.property.city}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <EmailTimelineDots emails={lead.emails} />
                    </td>
                    <td className="px-4 py-3">
                      <CouponStatusBadge coupon={lead.coupon} />
                    </td>
                    <td className="px-4 py-3">
                      <ConversionBadge conversion={lead.conversion} />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleDateString('es-ES', {
                        day: 'numeric', month: 'short',
                      })}
                      <br />
                      {new Date(lead.createdAt).toLocaleTimeString('es-ES', {
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.leads.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm">
                No se encontraron leads de demo
              </div>
            )}
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {data.leads.map(lead => (
              <div
                key={lead.id}
                onClick={() => setSelectedLead(lead)}
                className="bg-white rounded-xl border border-gray-100 p-4 space-y-3 cursor-pointer hover:border-violet-200 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                    <div className="text-xs text-gray-500">{lead.email}</div>
                    {lead.phone && <div className="text-xs text-gray-400">{lead.phone}</div>}
                  </div>
                  <ConversionBadge conversion={lead.conversion} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <EmailTimelineDots emails={lead.emails} />
                    <CouponStatusBadge coupon={lead.coupon} />
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(lead.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                {lead.property.name && (
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {lead.property.name} {lead.property.city && `(${lead.property.city})`}
                  </div>
                )}
              </div>
            ))}
            {data.leads.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm">
                No se encontraron leads de demo
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3">
              <span className="text-sm text-gray-500">
                Página {page} de {totalPages} ({data.total} leads)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}
    </div>
  )
}
