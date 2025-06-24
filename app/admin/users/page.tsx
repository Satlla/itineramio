'use client'

import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  MoreHorizontal,
  UserCheck,
  UserX,
  Crown,
  Building2,
  Calendar,
  Mail,
  Phone
} from 'lucide-react'
import CreateUserModal from './components/CreateUserModal'
import EditUserModal from './components/EditUserModal'

interface User {
  id: string
  email: string
  name: string
  phone?: string
  companyName?: string
  isAdmin: boolean
  isActive: boolean
  status: string
  subscription: string
  createdAt: string
  lastLoginAt?: string
  notes?: string
  properties: { id: string, name: string }[]
  currentSubscription?: {
    id: string
    plan: {
      id: string
      name: string
      priceMonthly: number
    }
    status: string
  }
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      if (data.success) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive) ||
      (statusFilter === 'admin' && user.isAdmin)

    const matchesPlan = planFilter === 'all' || 
      user.currentSubscription?.plan.name.toLowerCase() === planFilter.toLowerCase()

    return matchesSearch && matchesStatus && matchesPlan
  })

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      })
      
      if (response.ok) {
        fetchUsers() // Refresh list
      }
    } catch (error) {
      console.error('Error toggling user status:', error)
    }
  }

  const StatusBadge = ({ user }: { user: User }) => {
    if (user.isAdmin) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <Crown className="w-3 h-3 mr-1" />
          Admin
        </span>
      )
    }
    
    if (user.isActive) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <UserCheck className="w-3 h-3 mr-1" />
          Activo
        </span>
      )
    }
    
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <UserX className="w-3 h-3 mr-1" />
        Inactivo
      </span>
    )
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-2">
            {users.length} usuarios registrados • {users.filter(u => u.isActive).length} activos
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Crear Usuario
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, email o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 w-full"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2 lg:gap-4">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 min-w-0"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
              <option value="admin">Administradores</option>
            </select>

            {/* Plan Filter */}
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 min-w-0"
            >
              <option value="all">Todos los planes</option>
              <option value="gratuito">Gratuito</option>
              <option value="premium">Premium</option>
              <option value="profesional">Profesional</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table - Desktop */}
      <div className="hidden lg:block bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Propiedades
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
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 font-medium text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {user.phone}
                          </div>
                        )}
                        {user.companyName && (
                          <div className="text-xs text-gray-400">{user.companyName}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge user={user} />
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.currentSubscription?.plan.name || 'Sin plan'}
                    </div>
                    {user.currentSubscription && (
                      <div className="text-sm text-gray-500">
                        €{user.currentSubscription.plan.priceMonthly}/mes
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Building2 className="w-4 h-4 mr-1" />
                      {user.properties.length}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(user.createdAt).toLocaleDateString('es-ES')}
                    </div>
                    {user.lastLoginAt && (
                      <div className="text-xs text-gray-400">
                        Último: {new Date(user.lastLoginAt).toLocaleDateString('es-ES')}
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => toggleUserStatus(user.id, user.isActive)}
                        className={`${user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                      >
                        {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                      
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users Cards - Mobile & Tablet */}
      <div className="lg:hidden space-y-4">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white rounded-lg border p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center flex-1 min-w-0">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-red-600 font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-gray-900 truncate">{user.name}</h3>
                  <p className="text-xs text-gray-500 truncate flex items-center">
                    <Mail className="w-3 h-3 mr-1" />
                    {user.email}
                  </p>
                  {user.phone && (
                    <p className="text-xs text-gray-500 flex items-center">
                      <Phone className="w-3 h-3 mr-1" />
                      {user.phone}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-1 ml-2">
                <StatusBadge user={user} />
                {user.isAdmin && <Crown className="w-3 h-3 text-yellow-500" />}
              </div>
            </div>

            {/* User Details */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-xs text-gray-500">Plan</p>
                <p className="text-sm font-medium text-gray-900">
                  {user.currentSubscription?.plan.name || 'Sin plan'}
                </p>
                {user.currentSubscription && (
                  <p className="text-xs text-gray-500">
                    €{user.currentSubscription.plan.priceMonthly}/mes
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500">Propiedades</p>
                <p className="text-sm font-medium text-gray-900 flex items-center">
                  <Building2 className="w-3 h-3 mr-1" />
                  {user.properties.length}
                </p>
              </div>
            </div>

            {/* Additional Info */}
            {user.companyName && (
              <div className="mb-3">
                <p className="text-xs text-gray-500">Empresa</p>
                <p className="text-sm text-gray-900">{user.companyName}</p>
              </div>
            )}

            {/* Registration Date */}
            <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
              <div className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                Registrado: {new Date(user.createdAt).toLocaleDateString('es-ES')}
              </div>
              {user.lastLoginAt && (
                <div>
                  Último login: {new Date(user.lastLoginAt).toLocaleDateString('es-ES')}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <button
                onClick={() => setSelectedUser(user)}
                className="flex items-center text-blue-600 hover:text-blue-900 text-sm"
              >
                <Edit className="w-4 h-4 mr-1" />
                Editar
              </button>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => toggleUserStatus(user.id, user.isActive)}
                  className={`flex items-center text-sm ${
                    user.isActive 
                      ? 'text-red-600 hover:text-red-900' 
                      : 'text-green-600 hover:text-green-900'
                  }`}
                >
                  {user.isActive ? (
                    <>
                      <UserX className="w-4 h-4 mr-1" />
                      Suspender
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4 mr-1" />
                      Activar
                    </>
                  )}
                </button>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron usuarios</h3>
          <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchUsers}
      />

      {/* Edit User Modal */}
      {selectedUser && (
        <EditUserModal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          onSuccess={fetchUsers}
          user={selectedUser}
        />
      )}
    </div>
  )
}