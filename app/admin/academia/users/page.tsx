'use client'

import { useState, useEffect } from 'react'
import { Trash2, Users, Mail, Trophy, Flame, AlertCircle } from 'lucide-react'

interface AcademyUser {
  id: string
  email: string
  fullName: string
  username: string | null
  academyPoints: number
  academyStreak: number
  enrolledAt: string
  lastActivityAt: string
  _count: {
    progress: number
    quizAttempts: number
  }
}

export default function AdminAcademyUsersPage() {
  const [users, setUsers] = useState<AcademyUser[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      const res = await fetch('/api/admin/academy/users')
      const data = await res.json()

      if (res.ok) {
        setUsers(data.users)
      } else {
        setError(data.error || 'Error al cargar usuarios')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  async function deleteUser(userId: string, userEmail: string) {
    if (!confirm(`¿Seguro que quieres eliminar a ${userEmail}? Esta acción no se puede deshacer.`)) {
      return
    }

    setDeleting(userId)
    setError('')

    try {
      const res = await fetch(`/api/admin/academy/users?id=${userId}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId))
        alert('Usuario eliminado exitosamente')
      } else {
        setError(data.error || 'Error al eliminar usuario')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Users className="w-8 h-8 text-violet-600" />
            <h1 className="text-3xl font-bold text-gray-900">Usuarios de Academia</h1>
          </div>
          <p className="text-gray-600">Gestiona los usuarios inscritos en Academia Itineramio</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-violet-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Puntos Totales</p>
                <p className="text-2xl font-bold text-violet-600">
                  {users.reduce((sum, u) => sum + u.academyPoints, 0)}
                </p>
              </div>
              <Trophy className="w-8 h-8 text-violet-600" />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Puntos
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Racha
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progreso
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inscrito
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No hay usuarios inscritos todavía
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">{user.fullName}</div>
                          {user.username && (
                            <div className="text-sm text-gray-500">@{user.username}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center text-sm text-gray-900">
                          <Trophy className="w-4 h-4 mr-1 text-violet-600" />
                          {user.academyPoints}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center text-sm text-gray-900">
                          <Flame className="w-4 h-4 mr-1 text-orange-500" />
                          {user.academyStreak}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900">
                          {user._count.progress} lecciones
                          <div className="text-xs text-gray-500">
                            {user._count.quizAttempts} exámenes
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                        {new Date(user.enrolledAt).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => deleteUser(user.id, user.email)}
                          disabled={deleting === user.id}
                          className="inline-flex items-center px-3 py-1.5 border border-red-200 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {deleting === user.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                              Eliminando...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4 mr-1" />
                              Eliminar
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
