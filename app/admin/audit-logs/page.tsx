'use client'

import React, { useState, useEffect } from 'react'
import { Shield, User, Activity, Clock, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../../../src/components/ui/Button'
import { Card } from '../../../src/components/ui/Card'

interface AuditLog {
  id: string
  adminName: string
  adminEmail: string
  targetUserName: string | null
  targetUserEmail: string | null
  action: string
  propertyName: string | null
  zoneName: string | null
  ipAddress: string | null
  metadata: any
  createdAt: string
  admin: {
    name: string
    email: string
    role: string
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const ACTION_LABELS: Record<string, string> = {
  'IMPERSONATE_START': 'Comenzó suplantación',
  'IMPERSONATE_END': 'Terminó suplantación',
  'PROPERTY_EDIT': 'Editó propiedad',
  'ZONE_EDIT': 'Editó zona',
  'ZONE_DELETE': 'Eliminó zona',
  'USER_EDIT': 'Editó usuario',
  'USER_DELETE': 'Eliminó usuario'
}

const ACTION_COLORS: Record<string, string> = {
  'IMPERSONATE_START': 'bg-blue-100 text-blue-800',
  'IMPERSONATE_END': 'bg-green-100 text-green-800',
  'PROPERTY_EDIT': 'bg-yellow-100 text-yellow-800',
  'ZONE_EDIT': 'bg-purple-100 text-purple-800',
  'ZONE_DELETE': 'bg-red-100 text-red-800',
  'USER_EDIT': 'bg-indigo-100 text-indigo-800',
  'USER_DELETE': 'bg-red-100 text-red-800'
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  })
  const [filter, setFilter] = useState<string>('')

  useEffect(() => {
    fetchLogs()
  }, [pagination.page, filter])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      })

      if (filter) {
        params.append('action', filter)
      }

      const response = await fetch(`/api/admin/audit-logs?${params}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date)
  }

  const formatDuration = (metadata: any) => {
    if (!metadata || !metadata.duration) return null
    const seconds = Math.floor(metadata.duration / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Logs de Auditoría</h1>
          </div>
          <p className="text-gray-600">
            Registro completo de todas las acciones realizadas por administradores
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <Activity className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total de Acciones</p>
                <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value)
                setPagination({ ...pagination, page: 1 })
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas las acciones</option>
              <option value="IMPERSONATE_START">Suplantaciones iniciadas</option>
              <option value="IMPERSONATE_END">Suplantaciones terminadas</option>
              <option value="PROPERTY_EDIT">Ediciones de propiedades</option>
              <option value="ZONE_EDIT">Ediciones de zonas</option>
              <option value="ZONE_DELETE">Eliminaciones de zonas</option>
            </select>
          </div>
        </Card>

        {/* Logs Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario Afectado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Detalles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>Cargando logs...</span>
                      </div>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No se encontraron logs
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{formatDate(log.createdAt)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-blue-600" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{log.adminName}</div>
                            <div className="text-xs text-gray-500">{log.adminEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-800'
                        }`}>
                          {ACTION_LABELS[log.action] || log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.targetUserEmail ? (
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {log.targetUserName || 'Sin nombre'}
                              </div>
                              <div className="text-xs text-gray-500">{log.targetUserEmail}</div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {log.propertyName && (
                            <div className="mb-1">
                              <span className="font-medium">Propiedad:</span> {log.propertyName}
                            </div>
                          )}
                          {log.zoneName && (
                            <div className="mb-1">
                              <span className="font-medium">Zona:</span> {log.zoneName}
                            </div>
                          )}
                          {log.action === 'IMPERSONATE_END' && log.metadata?.duration && (
                            <div className="text-xs text-gray-500">
                              Duración: {formatDuration(log.metadata)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.ipAddress || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                {pagination.total} logs
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  variant="outline"
                  size="sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>
                <span className="text-sm text-gray-600">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <Button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.totalPages}
                  variant="outline"
                  size="sm"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
