'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/src/providers/AuthProvider'
import { motion } from 'framer-motion'
import {
  User,
  Trophy,
  Flame,
  BookOpen,
  Award,
  TrendingUp,
  Calendar,
  Download,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  X
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  badge?: string
  rarity: string
  points: number
  unlockedAt: string
}

interface ProfileData {
  username: string
  avatar?: string
  enrolledAt: string
  stats: {
    points: number
    streak: number
    completedLessons: number
    totalLessons: number
    completedQuizzes: number
    averageQuizScore: number
    rankPosition: number
  }
  achievements: Achievement[]
  progressHistory: Array<{
    date: string
    points: number
  }>
  hasCertificate: boolean
  certificateUrl?: string
}

export default function PerfilPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingUsername, setEditingUsername] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/academia/profile')
        if (response.ok) {
          const data = await response.json()
          setProfile(data)
          setNewUsername(data.username)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== profile?.username) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch('/api/academy/user/delete', {
        method: 'DELETE'
      })

      if (response.ok) {
        // Logout and redirect
        await fetch('/api/academy/auth/logout', { method: 'POST' })
        window.location.href = '/academia/login'
      } else {
        const data = await response.json()
        alert(data.error || 'Error al eliminar la cuenta')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Error al eliminar la cuenta')
    } finally {
      setIsDeleting(false)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'LEGENDARY': return 'from-yellow-400 to-orange-500'
      case 'EPIC': return 'from-purple-400 to-pink-500'
      case 'RARE': return 'from-blue-400 to-cyan-500'
      default: return 'from-gray-400 to-gray-500'
    }
  }

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'LEGENDARY': return 'border-yellow-400'
      case 'EPIC': return 'border-purple-400'
      case 'RARE': return 'border-blue-400'
      default: return 'border-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">No se pudo cargar el perfil</p>
      </div>
    )
  }

  const completionPercentage = (profile.stats.completedLessons / profile.stats.totalLessons) * 100

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl shadow-xl p-8 text-white mb-8"
      >
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.username}
                className="w-32 h-32 rounded-full object-cover border-4 border-white/30"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
                <User className="text-white" size={64} />
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 bg-white text-violet-600 rounded-full p-2 cursor-pointer hover:bg-gray-100 transition-colors">
              <Edit2 size={16} />
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
              {editingUsername ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="px-3 py-1 rounded-lg text-gray-900 font-bold text-2xl"
                  />
                  <button
                    onClick={() => setEditingUsername(false)}
                    className="bg-white text-violet-600 p-2 rounded-lg hover:bg-gray-100"
                  >
                    <CheckCircle2 size={20} />
                  </button>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold">{profile.username}</h1>
                  <button
                    onClick={() => setEditingUsername(true)}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <Edit2 size={20} />
                  </button>
                </>
              )}
            </div>
            <p className="text-white/80 mb-4">
              Miembro desde {new Date(profile.enrolledAt).toLocaleDateString('es-ES', {
                month: 'long',
                year: 'numeric'
              })}
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-6 justify-center md:justify-start">
              <div className="flex items-center gap-2">
                <Trophy size={20} />
                <div>
                  <p className="text-2xl font-bold">{profile.stats.points}</p>
                  <p className="text-sm text-white/80">Puntos</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Flame size={20} />
                <div>
                  <p className="text-2xl font-bold">{profile.stats.streak}</p>
                  <p className="text-sm text-white/80">Racha</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp size={20} />
                <div>
                  <p className="text-2xl font-bold">#{profile.stats.rankPosition}</p>
                  <p className="text-sm text-white/80">Ranking</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Stats */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-violet-100 rounded-lg">
                  <BookOpen className="text-violet-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Lecciones</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {profile.stats.completedLessons}/{profile.stats.totalLessons}
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-violet-600 to-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">{completionPercentage.toFixed(0)}% completado</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle2 className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Exámenes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {profile.stats.completedQuizzes}
                  </p>
                </div>
              </div>
              <p className="text-gray-600">
                Promedio: <span className="font-bold text-green-600">
                  {profile.stats.averageQuizScore}%
                </span>
              </p>
            </motion.div>
          </div>

          {/* Progress Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="text-violet-600" size={24} />
              <h2 className="text-xl font-bold text-gray-900">Progreso en el Tiempo</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={profile.progressHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="points"
                  stroke="#7c3aed"
                  strokeWidth={3}
                  dot={{ fill: '#7c3aed', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Certificate */}
          {profile.hasCertificate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl shadow-lg p-8 border-2 border-amber-200"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl">
                  <Award className="text-white" size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">¡Certificado Desbloqueado!</h2>
                  <p className="text-gray-600">Has completado el curso con éxito</p>
                </div>
              </div>
              <button className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all">
                <Download size={20} />
                Descargar Certificado
              </button>
            </motion.div>
          )}
        </div>

        {/* Right Column - Achievements */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 sticky top-24"
          >
            <div className="flex items-center gap-2 mb-6">
              <Award className="text-violet-600" size={24} />
              <h2 className="text-xl font-bold text-gray-900">
                Logros ({profile.achievements.length})
              </h2>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {profile.achievements.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="mx-auto text-gray-300 mb-3" size={48} />
                  <p className="text-gray-500">No has desbloqueado logros todavía</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Completa lecciones para obtener logros
                  </p>
                </div>
              ) : (
                profile.achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className={`p-4 rounded-xl border-2 ${getRarityBorder(achievement.rarity)} bg-gradient-to-br ${getRarityColor(achievement.rarity)} bg-opacity-10`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-3 bg-gradient-to-br ${getRarityColor(achievement.rarity)} rounded-lg flex-shrink-0`}>
                        <Award className="text-white" size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 mb-1 truncate">
                          {achievement.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {achievement.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            achievement.rarity === 'LEGENDARY'
                              ? 'bg-yellow-100 text-yellow-700'
                              : achievement.rarity === 'EPIC'
                              ? 'bg-purple-100 text-purple-700'
                              : achievement.rarity === 'RARE'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {achievement.rarity}
                          </span>
                          <span className="text-sm font-bold text-gray-900">
                            +{achievement.points} pts
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(achievement.unlockedAt).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-12 bg-red-50 rounded-xl shadow-lg p-8 border-2 border-red-200"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-100 rounded-lg">
            <AlertTriangle className="text-red-600" size={28} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Zona de Peligro</h2>
            <p className="text-gray-600 mb-6">
              Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, asegúrate de que realmente quieres hacer esto.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              <Trash2 size={20} />
              Eliminar Cuenta
            </button>
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
          >
            <button
              onClick={() => {
                setShowDeleteModal(false)
                setDeleteConfirmation('')
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-red-100 rounded-full">
                <AlertTriangle className="text-red-600" size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">¿Eliminar cuenta?</h3>
                <p className="text-sm text-gray-600">Esta acción no se puede deshacer</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-red-900 mb-2">Se eliminará permanentemente:</h4>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• Tu perfil y datos personales</li>
                <li>• Todo tu progreso de aprendizaje</li>
                <li>• Tus logros y certificados</li>
                <li>• Tu historial de actividad</li>
              </ul>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Para confirmar, escribe tu nombre de usuario:{' '}
                <span className="font-bold text-gray-900">{profile?.username}</span>
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Escribe tu nombre de usuario"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled={isDeleting}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteConfirmation('')
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation !== profile?.username || isDeleting}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 size={20} />
                    Eliminar Cuenta
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
