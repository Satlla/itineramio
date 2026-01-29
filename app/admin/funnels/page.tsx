'use client'

import { useState, useEffect } from 'react'
import {
  Mail,
  Send,
  Plus,
  Users,
  ArrowLeft,
  X,
  Check,
  Loader2,
  Zap,
  Calendar,
  Clock,
  Target,
  ChevronDown,
  ChevronUp,
  Play,
  User,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  Eye,
  AlertTriangle,
  Building2
} from 'lucide-react'
import Link from 'next/link'
import {
  LEAD_MAGNETS_BY_THEME,
  FUNNELS,
  getAllThemes,
  getThemeLabel,
  type FunnelTheme
} from '@/data/funnels'

interface Lead {
  id: string
  email: string
  name: string | null
  source: string | null
  funnelTheme: string | null
  funnelStartedAt: string | null
  funnelCurrentDay: number | null
  propertyCount: string | null
  createdAt: string
}

export default function AdminFunnelsPage() {
  // Property count options
  const propertyCountOptions = [
    { value: '1-5', label: '1 a 5 propiedades' },
    { value: '6-10', label: '6 a 10 propiedades' },
    { value: '10+', label: 'Más de 10 propiedades' },
    { value: '20+', label: 'Más de 20 propiedades' }
  ]

  // State for adding new lead
  const [showAddModal, setShowAddModal] = useState(false)
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    theme: '' as FunnelTheme | '',
    propertyCount: ''
  })
  const [addingLead, setAddingLead] = useState(false)
  const [addSuccess, setAddSuccess] = useState(false)

  // State for leads list
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [themeFilter, setThemeFilter] = useState<string>('')

  // State for triggering funnel
  const [triggeringFunnel, setTriggeringFunnel] = useState<string | null>(null)
  const [triggerSuccess, setTriggerSuccess] = useState<string | null>(null)

  // Expanded funnel view
  const [expandedFunnel, setExpandedFunnel] = useState<string | null>(null)

  // Lead detail modal
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<Lead | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchLeads()
  }, [search, themeFilter])

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (themeFilter) params.set('theme', themeFilter)

      const response = await fetch(`/api/admin/funnels/leads?${params}`, {
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

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLead.email || !newLead.theme) return

    setAddingLead(true)
    try {
      const response = await fetch('/api/admin/funnels/add-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newLead)
      })

      if (response.ok) {
        setAddSuccess(true)
        setTimeout(() => {
          setShowAddModal(false)
          setNewLead({ name: '', email: '', theme: '', propertyCount: '' })
          setAddSuccess(false)
          fetchLeads()
        }, 1500)
      } else {
        const data = await response.json()
        alert(data.error || 'Error al agregar lead')
      }
    } catch (error) {
      console.error('Error adding lead:', error)
      alert('Error al agregar lead')
    } finally {
      setAddingLead(false)
    }
  }

  const handleTriggerFunnel = async (leadId: string, theme: FunnelTheme) => {
    setTriggeringFunnel(leadId)
    try {
      const response = await fetch('/api/admin/funnels/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ leadId, theme })
      })

      if (response.ok) {
        setTriggerSuccess(leadId)
        setTimeout(() => {
          setTriggerSuccess(null)
          fetchLeads()
        }, 2000)
      } else {
        const data = await response.json()
        alert(data.error || 'Error al lanzar embudo')
      }
    } catch (error) {
      console.error('Error triggering funnel:', error)
      alert('Error al lanzar embudo')
    } finally {
      setTriggeringFunnel(null)
    }
  }

  const handleDeleteLead = async (lead: Lead) => {
    setDeleting(true)
    try {
      const response = await fetch(`/api/admin/funnels/leads?id=${lead.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        setDeleteConfirm(null)
        fetchLeads()
      } else {
        const data = await response.json()
        alert(data.error || 'Error al eliminar lead')
      }
    } catch (error) {
      console.error('Error deleting lead:', error)
      alert('Error al eliminar lead')
    } finally {
      setDeleting(false)
    }
  }

  const themes = getAllThemes()
  const themeColors: Record<FunnelTheme, string> = {
    'reservas': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'gestión-huéspedes': 'bg-blue-100 text-blue-800 border-blue-200',
    'limpieza': 'bg-green-100 text-green-800 border-green-200',
    'precios': 'bg-amber-100 text-amber-800 border-amber-200',
    'reseñas': 'bg-rose-100 text-rose-800 border-rose-200'
  }

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
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Zap className="h-6 w-6 mr-2 text-violet-600" />
              Gestión de Embudos
            </h1>
            <p className="text-gray-600 mt-1">
              Añade leads manualmente y lanza embudos de email
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Añadir Lead
          </button>
        </div>
      </div>

      {/* Funnels Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {themes.map((theme) => {
          const leadMagnet = LEAD_MAGNETS_BY_THEME[theme]
          const funnel = FUNNELS[leadMagnet.funnelId]
          const isExpanded = expandedFunnel === theme

          return (
            <div
              key={theme}
              className={`bg-white border-2 rounded-xl overflow-hidden transition-all ${
                themeFilter === theme ? 'border-violet-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div
                className="p-4 cursor-pointer"
                onClick={() => setThemeFilter(themeFilter === theme ? '' : theme)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{leadMagnet.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate text-sm">
                      {getThemeLabel(theme)}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {funnel.emails.length} emails
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setExpandedFunnel(isExpanded ? null : theme)
                  }}
                  className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-1"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-3 h-3" />
                      Ocultar emails
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3" />
                      Ver emails
                    </>
                  )}
                </button>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100 p-3 bg-gray-50 max-h-64 overflow-y-auto">
                  {funnel.emails.map((email, idx) => (
                    <div key={idx} className="flex items-start gap-2 mb-2 last:mb-0">
                      <span className="flex-shrink-0 w-6 h-6 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center text-xs font-medium">
                        {email.day}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate" title={email.subject}>
                          {email.subject}
                        </p>
                        <p className="text-xs text-gray-500 truncate" title={email.previewText}>
                          {email.previewText}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por email o nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              value={themeFilter}
              onChange={(e) => setThemeFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm appearance-none bg-white min-w-[200px]"
            >
              <option value="">Todos los embudos</option>
              {themes.map((theme) => (
                <option key={theme} value={theme}>
                  {getThemeLabel(theme)}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={fetchLeads}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Embudo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Cargando leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>No hay leads en este embudo</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="mt-2 text-violet-600 hover:text-violet-700 text-sm font-medium"
                    >
                      Añadir primer lead
                    </button>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <div
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => setSelectedLead(lead)}
                      >
                        <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center group-hover:bg-violet-200 transition-colors">
                          <User className="w-4 h-4 text-violet-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 group-hover:text-violet-600 transition-colors">
                            {lead.name || 'Sin nombre'}
                          </div>
                          <div className="text-sm text-gray-500">{lead.email}</div>
                        </div>
                        <Eye className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {lead.funnelTheme ? (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${themeColors[lead.funnelTheme as FunnelTheme] || 'bg-gray-100 text-gray-800'}`}>
                          {LEAD_MAGNETS_BY_THEME[lead.funnelTheme as FunnelTheme]?.icon} {getThemeLabel(lead.funnelTheme as FunnelTheme)}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Sin asignar</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {lead.funnelStartedAt ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Play className="w-3 h-3 mr-1" />
                            Día {lead.funnelCurrentDay || 0}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          <Clock className="w-3 h-3 mr-1" />
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {new Date(lead.createdAt).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {triggerSuccess === lead.id ? (
                          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-green-100 text-green-700">
                            <Check className="w-4 h-4 mr-1" />
                            Enviado
                          </span>
                        ) : lead.funnelTheme && !lead.funnelStartedAt ? (
                          <button
                            onClick={() => handleTriggerFunnel(lead.id, lead.funnelTheme as FunnelTheme)}
                            disabled={triggeringFunnel === lead.id}
                            className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 transition-colors disabled:opacity-50"
                          >
                            {triggeringFunnel === lead.id ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                Enviando...
                              </>
                            ) : (
                              <>
                                <Send className="w-4 h-4 mr-1" />
                                Lanzar
                              </>
                            )}
                          </button>
                        ) : lead.funnelStartedAt ? (
                          <span className="text-sm text-gray-400">En curso</span>
                        ) : null}

                        {/* Delete button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteConfirm(lead)
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Añadir Lead Manual
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setNewLead({ name: '', email: '', theme: '', propertyCount: '' })
                  }}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            {addSuccess ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Lead añadido</h4>
                <p className="text-gray-600">El lead ha sido añadido correctamente al embudo.</p>
              </div>
            ) : (
              <form onSubmit={handleAddLead} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={newLead.name}
                      onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                      placeholder="Juan García"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={newLead.email}
                      onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                      placeholder="juan@ejemplo.com"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Embudo <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {themes.map((theme) => {
                        const leadMagnet = LEAD_MAGNETS_BY_THEME[theme]
                        const isSelected = newLead.theme === theme

                        return (
                          <button
                            key={theme}
                            type="button"
                            onClick={() => setNewLead({ ...newLead, theme })}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                              isSelected
                                ? 'border-violet-500 bg-violet-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <span className="text-xl">{leadMagnet.icon}</span>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 text-sm">
                                {getThemeLabel(theme)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {leadMagnet.title}
                              </div>
                            </div>
                            {isSelected && (
                              <Check className="w-5 h-5 text-violet-600" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de propiedades
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {propertyCountOptions.map((option) => {
                        const isSelected = newLead.propertyCount === option.value

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setNewLead({ ...newLead, propertyCount: option.value })}
                            className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all text-center ${
                              isSelected
                                ? 'border-violet-500 bg-violet-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <span className="font-medium text-gray-900 text-sm">
                              {option.label}
                            </span>
                            {isSelected && (
                              <Check className="w-4 h-4 text-violet-600" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setNewLead({ name: '', email: '', theme: '', propertyCount: '' })
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={addingLead || !newLead.email || !newLead.theme}
                    className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {addingLead ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Añadiendo...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Añadir Lead
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Detalle del Lead
                </h3>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-4">
                {/* Basic info */}
                <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                  <div className="w-14 h-14 bg-violet-100 rounded-full flex items-center justify-center">
                    <User className="w-7 h-7 text-violet-600" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">
                      {selectedLead.name || 'Sin nombre'}
                    </h4>
                    <p className="text-gray-600">{selectedLead.email}</p>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Embudo</p>
                    {selectedLead.funnelTheme ? (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${themeColors[selectedLead.funnelTheme as FunnelTheme] || 'bg-gray-100 text-gray-800'}`}>
                        {LEAD_MAGNETS_BY_THEME[selectedLead.funnelTheme as FunnelTheme]?.icon} {getThemeLabel(selectedLead.funnelTheme as FunnelTheme)}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">Sin asignar</span>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Estado</p>
                    {selectedLead.funnelStartedAt ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Play className="w-3 h-3 mr-1" />
                        Día {selectedLead.funnelCurrentDay || 0}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        <Clock className="w-3 h-3 mr-1" />
                        Pendiente
                      </span>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Fuente</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedLead.source || 'Desconocida'}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Fecha registro</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(selectedLead.createdAt).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Propiedades</p>
                    {selectedLead.propertyCount ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
                        <Building2 className="w-3 h-3 mr-1" />
                        {selectedLead.propertyCount === '1-5' && '1 a 5 propiedades'}
                        {selectedLead.propertyCount === '6-10' && '6 a 10 propiedades'}
                        {selectedLead.propertyCount === '10+' && 'Más de 10 propiedades'}
                        {selectedLead.propertyCount === '20+' && 'Más de 20 propiedades'}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">No especificado</span>
                    )}
                  </div>

                  {selectedLead.funnelStartedAt && (
                    <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Inicio del embudo</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(selectedLead.funnelStartedAt).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                </div>

                {/* ID */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">ID</p>
                  <p className="text-xs font-mono text-gray-600 break-all">{selectedLead.id}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setSelectedLead(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    setSelectedLead(null)
                    setDeleteConfirm(selectedLead)
                  }}
                  className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Eliminar Lead</h3>
                  <p className="text-gray-600 text-sm">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Vas a eliminar:</p>
                <p className="font-medium text-gray-900">{deleteConfirm.name || 'Sin nombre'}</p>
                <p className="text-sm text-gray-600">{deleteConfirm.email}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDeleteLead(deleteConfirm)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
