'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Search, 
  CheckCircle, 
  XCircle, 
  Building2,
  Calendar,
  Mail,
  Phone,
  Eye
} from 'lucide-react'
import UserProfileModal from './components/UserProfileModal'

interface User {
  id: string
  email: string
  name: string
  phone: string | null
  companyName: string | null
  role: string
  status: string
  subscription: string
  isActive: boolean
  createdAt: string
  lastLoginAt: string | null
  currentSubscription: {
    billingPeriod: string
    plan: {
      name: string
    }
  } | null
  _count: {
    properties: number
    propertySets: number
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [page, search])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search })
      })
      
      const response = await fetch(`/api/admin/users?${params}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-red-600" />
              Usuarios
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Gestión de usuarios registrados</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4 sm:mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o empresa..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Users Table/Cards */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-6 h-6 sm:w-8 sm:h-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <Users className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm sm:text-base text-gray-500">No se encontraron usuarios</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200">
              {users.map((user) => (
                <div key={user.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{user.name}</h3>
                      <p className="text-xs text-gray-500 truncate">{user.companyName || '-'}</p>
                    </div>
                    <div className="flex items-center ml-2">
                      {user.isActive ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center text-xs text-gray-600">
                      <Mail className="h-3 w-3 mr-1 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center text-xs text-gray-600">
                        <Phone className="h-3 w-3 mr-1 text-gray-400 flex-shrink-0" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <div className="flex items-center">
                        <Building2 className="h-3 w-3 mr-1 text-gray-400" />
                        <span>{user._count.properties} props</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                        <span>{formatDate(user.createdAt)}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Plan: {user.currentSubscription?.billingPeriod
                        ? `${user.currentSubscription.plan.name} (${user.currentSubscription.billingPeriod})`
                        : user.subscription}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedUserId(user.id)}
                    className="w-full flex items-center justify-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded text-xs hover:bg-red-700"
                  >
                    <Eye className="h-3 w-3" />
                    <span>Ver Perfil</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Propiedades
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.companyName || '-'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="flex items-center text-gray-900">
                            <Mail className="h-4 w-4 mr-1 text-gray-400" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center text-gray-500 mt-1">
                              <Phone className="h-4 w-4 mr-1 text-gray-400" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center">
                            <Building2 className="h-4 w-4 mr-1 text-gray-400" />
                            <span className="text-gray-900">{user._count.properties}</span>
                          </div>
                          <div className="text-gray-500">
                            Conjuntos: {user._count.propertySets}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.isActive ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <span className={`ml-2 text-sm ${user.isActive ? 'text-green-700' : 'text-red-700'}`}>
                            {user.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Plan: {user.currentSubscription?.billingPeriod
                            ? `${user.currentSubscription.plan.name} (${user.currentSubscription.billingPeriod})`
                            : user.subscription}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="flex items-center text-gray-900">
                            <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                            {formatDate(user.createdAt)}
                          </div>
                          {user.lastLoginAt && (
                            <div className="text-xs text-gray-500 mt-1">
                              Último acceso: {formatDate(user.lastLoginAt)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedUserId(user.id)}
                          className="flex items-center space-x-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Ver Perfil</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 sm:mt-6 flex items-center justify-between gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="text-xs sm:text-sm text-gray-700">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* User Profile Modal */}
      <UserProfileModal
        userId={selectedUserId}
        isOpen={!!selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />
    </div>
  )
}