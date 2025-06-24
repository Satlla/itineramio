'use client'

import React, { useState, useEffect } from 'react'
import { 
  FileText, 
  Search, 
  Filter,
  Download,
  Eye,
  Calendar,
  User,
  Activity,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  Settings,
  CreditCard,
  Users,
  Building2,
  Clock,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

interface AdminLog {
  id: string
  adminUserId: string
  action: string
  targetType: string
  targetId: string
  description: string
  metadata: any
  createdAt: string
  admin?: {
    id: string
    name: string
    email: string
  }
}

const ActionIcon = ({ action }: { action: string }) => {
  if (action.includes('created')) return <CheckCircle className="w-4 h-4 text-green-500" />
  if (action.includes('updated') || action.includes('activated')) return <Settings className="w-4 h-4 text-blue-500" />
  if (action.includes('deleted') || action.includes('cancelled') || action.includes('deactivated')) return <XCircle className="w-4 h-4 text-red-500" />
  if (action.includes('paid') || action.includes('payment')) return <CreditCard className="w-4 h-4 text-green-500" />
  if (action.includes('user')) return <Users className="w-4 h-4 text-blue-500" />
  if (action.includes('property')) return <Building2 className="w-4 h-4 text-purple-500" />
  if (action.includes('invoice')) return <FileText className="w-4 h-4 text-orange-500" />
  return <Activity className="w-4 h-4 text-gray-500" />
}

const ActionLabel = ({ action }: { action: string }) => {
  const labels: Record<string, string> = {
    'user_created': 'Usuario creado',
    'user_updated': 'Usuario actualizado',
    'user_activated': 'Usuario activado',
    'user_deactivated': 'Usuario desactivado',
    'invoice_created': 'Factura creada',
    'invoice_paid': 'Factura pagada',
    'invoice_cancelled': 'Factura cancelada',
    'plan_created': 'Plan creado',
    'plan_updated': 'Plan actualizado',
    'subscription_created': 'Suscripción creada',
    'subscription_updated': 'Suscripción actualizada'
  }

  return <span>{labels[action] || action.replace('_', ' ').charAt(0).toUpperCase() + action.slice(1)}</span>
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [targetTypeFilter, setTargetTypeFilter] = useState('all')
  const [dateRange, setDateRange] = useState('all')
  const [expandedLog, setExpandedLog] = useState<string | null>(null)
  const [showExportMenu, setShowExportMenu] = useState(false)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (searchTerm) params.append('search', searchTerm)
      if (actionFilter !== 'all') params.append('action', actionFilter)
      if (targetTypeFilter !== 'all') params.append('targetType', targetTypeFilter)
      if (dateRange !== 'all') params.append('dateRange', dateRange)
      
      const response = await fetch(`/api/admin/logs?${params.toString()}`)
      const data = await response.json()
      
      if (data.success) {
        setLogs(data.logs)
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchLogs()
  }

  const handleExport = (format: 'csv' | 'json') => {
    const params = new URLSearchParams()
    
    params.append('format', format)
    if (searchTerm) params.append('search', searchTerm)
    if (actionFilter !== 'all') params.append('action', actionFilter)
    if (targetTypeFilter !== 'all') params.append('targetType', targetTypeFilter)
    if (dateRange !== 'all') params.append('dateRange', dateRange)
    
    // Create download link
    const url = `/api/admin/logs/export?${params.toString()}`
    const link = document.createElement('a')
    link.href = url
    link.download = `logs_admin_${new Date().toISOString().split('T')[0]}.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setShowExportMenu(false)
  }

  const getTargetTypeIcon = (targetType: string) => {
    switch (targetType) {
      case 'user':
        return <Users className="w-4 h-4 text-blue-500" />
      case 'property':
        return <Building2 className="w-4 h-4 text-purple-500" />
      case 'invoice':
        return <FileText className="w-4 h-4 text-orange-500" />
      case 'plan':
        return <CreditCard className="w-4 h-4 text-green-500" />
      default:
        return <Info className="w-4 h-4 text-gray-500" />
    }
  }

  const formatMetadata = (metadata: any) => {
    if (!metadata || typeof metadata !== 'object') return null
    
    return Object.entries(metadata).map(([key, value]) => (
      <div key={key} className="text-xs">
        <span className="font-medium text-gray-600">{key}:</span>{' '}
        <span className="text-gray-800">{String(value)}</span>
      </div>
    ))
  }

  const getUniqueActions = () => {
    const actions = [...new Set(logs.map(log => log.action))]
    return actions.sort()
  }

  const getUniqueTargetTypes = () => {
    const types = [...new Set(logs.map(log => log.targetType))]
    return types.sort()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Logs de Actividad</h1>
          <p className="text-gray-600 mt-2">
            Registro de todas las acciones administrativas del sistema
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  <button
                    onClick={() => handleExport('csv')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Exportar como CSV
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Exportar como JSON
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Logs</p>
              <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
            </div>
            <Activity className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Hoy</p>
              <p className="text-2xl font-bold text-blue-600">
                {logs.filter(log => {
                  const today = new Date().toDateString()
                  return new Date(log.createdAt).toDateString() === today
                }).length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Usuarios</p>
              <p className="text-2xl font-bold text-green-600">
                {logs.filter(log => log.targetType === 'user').length}
              </p>
            </div>
            <Users className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Facturas</p>
              <p className="text-2xl font-bold text-orange-600">
                {logs.filter(log => log.targetType === 'invoice').length}
              </p>
            </div>
            <FileText className="w-8 h-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 min-w-0">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar en descripción, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 w-full"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Buscar
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2 lg:gap-4">
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value)
                setTimeout(fetchLogs, 100)
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 min-w-0"
            >
              <option value="all">Todas las acciones</option>
              {getUniqueActions().map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>

            <select
              value={targetTypeFilter}
              onChange={(e) => {
                setTargetTypeFilter(e.target.value)
                setTimeout(fetchLogs, 100)
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 min-w-0"
            >
              <option value="all">Todos los tipos</option>
              {getUniqueTargetTypes().map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value)
                setTimeout(fetchLogs, 100)
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 min-w-0"
            >
              <option value="all">Todas las fechas</option>
              <option value="today">Hoy</option>
              <option value="week">Última semana</option>
              <option value="month">Último mes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="divide-y divide-gray-200">
          {logs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    <ActionIcon action={log.action} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <ActionLabel action={log.action} />
                      <span className="text-gray-400">•</span>
                      <div className="flex items-center space-x-1">
                        {getTargetTypeIcon(log.targetType)}
                        <span className="text-sm text-gray-600 capitalize">{log.targetType}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-800 mb-2">{log.description}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(log.createdAt).toLocaleString('es-ES')}</span>
                      </div>
                      
                      {log.admin && (
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{log.admin.name}</span>
                        </div>
                      )}
                      
                      <div>
                        <span className="font-mono">ID: {log.targetId.slice(0, 8)}...</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                  className="text-gray-400 hover:text-gray-600 ml-4"
                >
                  {expandedLog === log.id ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              </div>
              
              {/* Expanded Details */}
              {expandedLog === log.id && (
                <div className="mt-4 ml-7 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Detalles</h4>
                      <div className="space-y-1 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">ID Completo:</span>{' '}
                          <span className="font-mono text-gray-800">{log.targetId}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Admin ID:</span>{' '}
                          <span className="font-mono text-gray-800">{log.adminUserId}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Timestamp:</span>{' '}
                          <span className="text-gray-800">{log.createdAt}</span>
                        </div>
                      </div>
                    </div>
                    
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Metadata</h4>
                        <div className="space-y-1">
                          {formatMetadata(log.metadata)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {logs.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron logs</h3>
            <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  )
}