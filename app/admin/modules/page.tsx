'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Search,
  Users,
  BookOpen,
  Briefcase,
  Check,
  X,
  Plus,
  Clock,
  Building2,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface UserModule {
  id: string
  moduleType: 'MANUALES' | 'GESTION'
  status: string
  isActive: boolean
  activatedAt: string
  expiresAt: string | null
  trialEndsAt: string | null
  subscriptionPlan: {
    name: string
    code: string
  } | null
  _source?: 'module' | 'subscription' | 'user_trial'
}

interface UserWithModules {
  id: string
  email: string
  name: string
  companyName: string | null
  createdAt: string
  trialEndsAt: string | null
  manualesModule: UserModule | null
  gestionModule: UserModule | null
  activeSubscription?: {
    id: string
    status: string
    plan: { name: string; code: string } | null
  } | null
  _count: {
    properties: number
  }
}

interface ActivateModalData {
  userId: string
  userName: string
  userEmail: string
  moduleType: 'MANUALES' | 'GESTION'
}

export default function AdminModulesPage() {
  const [users, setUsers] = useState<UserWithModules[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [moduleFilter, setModuleFilter] = useState<'ALL' | 'MANUALES' | 'GESTION'>('ALL')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [activateModal, setActivateModal] = useState<ActivateModalData | null>(null)
  const [activating, setActivating] = useState(false)
  const [trialDays, setTrialDays] = useState<number>(0)

  useEffect(() => {
    fetchUsers()
  }, [page, search, moduleFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(moduleFilter !== 'ALL' && { module: moduleFilter })
      })

      const response = await fetch(`/api/admin/modules?${params}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const handleActivateModule = async () => {
    if (!activateModal) return

    setActivating(true)
    try {
      const response = await fetch('/api/admin/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: activateModal.userId,
          moduleType: activateModal.moduleType,
          trialDays: trialDays > 0 ? trialDays : null
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        setActivateModal(null)
        setTrialDays(0)
        fetchUsers()
      } else {
        toast.error(data.error || 'Error al activar módulo')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setActivating(false)
    }
  }

  const handleDeactivateModule = async (userId: string, moduleType: string, userName: string) => {
    if (!confirm(`¿Desactivar módulo ${moduleType} para ${userName}?`)) return

    try {
      const response = await fetch(
        `/api/admin/modules?userId=${userId}&moduleType=${moduleType}`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      )

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        fetchUsers()
      } else {
        toast.error(data.error || 'Error al desactivar módulo')
      }
    } catch (error) {
      toast.error('Error de conexión')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getModuleStatusBadge = (module: UserModule | null, moduleType: 'MANUALES' | 'GESTION') => {
    if (!module || module.status === 'EXPIRED') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
          <X className="w-3 h-3" />
          {module?.status === 'EXPIRED' ? 'Expirado' : 'Sin activar'}
        </span>
      )
    }

    if (!module.isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
          <X className="w-3 h-3" />
          Sin activar
        </span>
      )
    }

    if (module.status === 'TRIAL') {
      const trialEnd = module.trialEndsAt ? new Date(module.trialEndsAt) : null
      const daysLeft = trialEnd ? Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0
      const isExpired = daysLeft < 0
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
          isExpired ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
        }`}>
          <Clock className="w-3 h-3" />
          Trial ({daysLeft}d)
        </span>
      )
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
        <Check className="w-3 h-3" />
        Activo
      </span>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al Dashboard</span>
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Users className="h-6 w-6 mr-2 text-violet-600" />
              Gestión de Módulos
            </h1>
            <p className="text-gray-600 mt-1">Activar y gestionar módulos de usuarios</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o empresa..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={moduleFilter}
            onChange={(e) => {
              setModuleFilter(e.target.value as any)
              setPage(1)
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
          >
            <option value="ALL">Todos</option>
            <option value="MANUALES">Con Manuales</option>
            <option value="GESTION">Con Gestión</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.manualesModule?.isActive).length}
              </p>
              <p className="text-sm text-gray-500">Manuales activos</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.gestionModule?.isActive).length}
              </p>
              <p className="text-sm text-gray-500">Gestión activos</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u =>
                  u.manualesModule?.status === 'TRIAL' || u.gestionModule?.status === 'TRIAL'
                ).length}
              </p>
              <p className="text-sm text-gray-500">En trial</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              <p className="text-sm text-gray-500">Total usuarios</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron usuarios</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4 text-violet-500" />
                      Manuales
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4 text-emerald-500" />
                      Gestión
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Props
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        {user.companyName && (
                          <p className="text-xs text-gray-400">{user.companyName}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getModuleStatusBadge(user.manualesModule, 'MANUALES')}
                      {user.manualesModule?.subscriptionPlan && (
                        <p className="text-xs text-gray-400 mt-1">
                          {user.manualesModule.subscriptionPlan.name}
                          {user.manualesModule._source === 'subscription' && ' (suscripción)'}
                          {user.manualesModule._source === 'user_trial' && ' (trial usuario)'}
                        </p>
                      )}
                      {user.manualesModule?._source === 'user_trial' && !user.manualesModule?.subscriptionPlan && (
                        <p className="text-xs text-gray-400 mt-1">Trial usuario</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getModuleStatusBadge(user.gestionModule, 'GESTION')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Building2 className="w-4 h-4" />
                        {user._count.properties}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!user.manualesModule?.isActive && (
                          <button
                            onClick={() => setActivateModal({
                              userId: user.id,
                              userName: user.name,
                              userEmail: user.email,
                              moduleType: 'MANUALES'
                            })}
                            className="px-2 py-1 text-xs font-medium text-violet-600 hover:bg-violet-50 rounded transition-colors"
                          >
                            +Manuales
                          </button>
                        )}
                        {user.manualesModule?.isActive && (
                          <button
                            onClick={() => handleDeactivateModule(user.id, 'MANUALES', user.name)}
                            className="px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            -Manuales
                          </button>
                        )}
                        {!user.gestionModule?.isActive && (
                          <button
                            onClick={() => setActivateModal({
                              userId: user.id,
                              userName: user.name,
                              userEmail: user.email,
                              moduleType: 'GESTION'
                            })}
                            className="px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                          >
                            +Gestión
                          </button>
                        )}
                        {user.gestionModule?.isActive && (
                          <button
                            onClick={() => handleDeactivateModule(user.id, user.gestionModule?.moduleType || 'GESTION', user.name)}
                            className="px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            -Gestión
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Página {page} de {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Activate Module Modal */}
      {activateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Activar {activateModal.moduleType === 'MANUALES' ? 'Manuales' : 'Gestión'}
            </h3>
            <p className="text-gray-600 mb-6">
              Para <strong>{activateModal.userName}</strong> ({activateModal.userEmail})
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Días de trial (0 = activación directa)
                </label>
                <input
                  type="number"
                  min="0"
                  value={trialDays}
                  onChange={(e) => setTrialDays(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  placeholder="Ej: 14"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {trialDays > 0
                    ? `Se activará como trial hasta el ${new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES')}`
                    : 'Se activará como suscripción activa'}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setActivateModal(null)
                  setTrialDays(0)
                }}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleActivateModule}
                disabled={activating}
                className={`flex-1 px-4 py-2 text-white font-medium rounded-lg transition-colors disabled:opacity-50 ${
                  activateModal.moduleType === 'MANUALES'
                    ? 'bg-violet-600 hover:bg-violet-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {activating ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  'Activar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
