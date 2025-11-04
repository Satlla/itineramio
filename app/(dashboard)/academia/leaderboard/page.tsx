'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/src/providers/AuthProvider'
import { motion } from 'framer-motion'
import {
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  Flame,
  Award
} from 'lucide-react'

interface LeaderboardEntry {
  position: number
  userId: string
  username: string
  avatar?: string
  points: number
  streak: number
  completedLessons: number
  isCurrentUser: boolean
}

type TimeFilter = 'week' | 'month' | 'all'

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/academia/leaderboard?period=${timeFilter}`)
        if (response.ok) {
          const data = await response.json()
          setLeaderboard(data.leaderboard)
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [timeFilter])

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="text-yellow-500" size={28} />
      case 2:
        return <Medal className="text-gray-400" size={24} />
      case 3:
        return <Medal className="text-orange-400" size={24} />
      default:
        return null
    }
  }

  const getPositionBg = (position: number, isCurrentUser: boolean) => {
    if (isCurrentUser) {
      return 'bg-violet-50 border-2 border-violet-400'
    }
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200'
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200'
      case 3:
        return 'bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200'
      default:
        return 'bg-white border border-gray-100'
    }
  }

  const currentUserEntry = leaderboard.find(entry => entry.isCurrentUser)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl">
            <Trophy className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ranking de Estudiantes</h1>
            <p className="text-gray-600">Compite con otros estudiantes y alcanza el top</p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-3 mb-8 overflow-x-auto pb-2"
      >
        <button
          onClick={() => setTimeFilter('week')}
          className={`px-6 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${
            timeFilter === 'week'
              ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          Esta Semana
        </button>
        <button
          onClick={() => setTimeFilter('month')}
          className={`px-6 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${
            timeFilter === 'month'
              ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          Este Mes
        </button>
        <button
          onClick={() => setTimeFilter('all')}
          className={`px-6 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${
            timeFilter === 'all'
              ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          Todo el Tiempo
        </button>
      </motion.div>

      {/* Current User Card (if not in top 10) */}
      {currentUserEntry && currentUserEntry.position > 10 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="bg-violet-50 border-2 border-violet-400 rounded-xl p-4">
            <p className="text-sm text-violet-700 font-medium mb-3">Tu posición actual:</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-violet-600 text-white rounded-full font-bold text-lg">
                {currentUserEntry.position}
              </div>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {currentUserEntry.avatar ? (
                  <img
                    src={currentUserEntry.avatar}
                    alt={currentUserEntry.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-violet-200 rounded-full flex items-center justify-center">
                    <span className="text-violet-700 font-bold">
                      {currentUserEntry.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {currentUserEntry.username}
                  </p>
                  <p className="text-sm text-gray-600">
                    {currentUserEntry.completedLessons} lecciones
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Flame className="text-orange-500" size={20} />
                  <span className="font-semibold text-gray-900">{currentUserEntry.streak}</span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-violet-600">
                    {currentUserEntry.points.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600">puntos</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="grid grid-cols-3 gap-4 items-end">
            {/* 2nd Place */}
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-gray-100 to-slate-100 rounded-t-xl p-4 border-2 border-gray-300"
              >
                {leaderboard[1].avatar ? (
                  <img
                    src={leaderboard[1].avatar}
                    alt={leaderboard[1].username}
                    className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-4 border-gray-300"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full mx-auto mb-3 bg-gray-300 flex items-center justify-center border-4 border-gray-400">
                    <span className="text-gray-700 font-bold text-2xl">
                      {leaderboard[1].username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <Medal className="text-gray-400 mx-auto mb-2" size={32} />
                <p className="font-bold text-gray-900 truncate">{leaderboard[1].username}</p>
                <p className="text-2xl font-bold text-gray-700 mt-1">
                  {leaderboard[1].points.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">puntos</p>
              </motion.div>
              <div className="bg-gray-300 h-24 rounded-b-lg flex items-center justify-center">
                <span className="text-4xl font-bold text-gray-600">2</span>
              </div>
            </div>

            {/* 1st Place */}
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-yellow-100 to-amber-100 rounded-t-xl p-6 border-2 border-yellow-400"
              >
                {leaderboard[0].avatar ? (
                  <img
                    src={leaderboard[0].avatar}
                    alt={leaderboard[0].username}
                    className="w-24 h-24 rounded-full mx-auto mb-3 object-cover border-4 border-yellow-400"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full mx-auto mb-3 bg-yellow-300 flex items-center justify-center border-4 border-yellow-500">
                    <span className="text-yellow-800 font-bold text-3xl">
                      {leaderboard[0].username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <Crown className="text-yellow-500 mx-auto mb-2" size={36} />
                <p className="font-bold text-gray-900 truncate">{leaderboard[0].username}</p>
                <p className="text-3xl font-bold text-yellow-700 mt-1">
                  {leaderboard[0].points.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">puntos</p>
              </motion.div>
              <div className="bg-yellow-400 h-32 rounded-b-lg flex items-center justify-center">
                <span className="text-5xl font-bold text-yellow-700">1</span>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-orange-100 to-red-100 rounded-t-xl p-4 border-2 border-orange-300"
              >
                {leaderboard[2].avatar ? (
                  <img
                    src={leaderboard[2].avatar}
                    alt={leaderboard[2].username}
                    className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-4 border-orange-300"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full mx-auto mb-3 bg-orange-300 flex items-center justify-center border-4 border-orange-400">
                    <span className="text-orange-800 font-bold text-2xl">
                      {leaderboard[2].username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <Medal className="text-orange-400 mx-auto mb-2" size={32} />
                <p className="font-bold text-gray-900 truncate">{leaderboard[2].username}</p>
                <p className="text-2xl font-bold text-orange-700 mt-1">
                  {leaderboard[2].points.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">puntos</p>
              </motion.div>
              <div className="bg-orange-300 h-20 rounded-b-lg flex items-center justify-center">
                <span className="text-4xl font-bold text-orange-600">3</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Rest of Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Clasificación Completa</h2>
        <div className="space-y-3">
          {leaderboard.slice(3).map((entry, index) => (
            <motion.div
              key={entry.userId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index }}
              className={`rounded-xl p-4 shadow-md hover:shadow-lg transition-all ${getPositionBg(
                entry.position,
                entry.isCurrentUser
              )}`}
            >
              <div className="flex items-center gap-4">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg ${
                  entry.isCurrentUser
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {entry.position}
                </div>

                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {entry.avatar ? (
                    <img
                      src={entry.avatar}
                      alt={entry.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      entry.isCurrentUser ? 'bg-violet-200' : 'bg-gray-200'
                    }`}>
                      <span className={`font-bold ${
                        entry.isCurrentUser ? 'text-violet-700' : 'text-gray-700'
                      }`}>
                        {entry.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold truncate ${
                      entry.isCurrentUser ? 'text-violet-900' : 'text-gray-900'
                    }`}>
                      {entry.username}
                      {entry.isCurrentUser && (
                        <span className="ml-2 text-xs bg-violet-600 text-white px-2 py-0.5 rounded-full">
                          Tú
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      {entry.completedLessons} lecciones completadas
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Flame className="text-orange-500" size={18} />
                    <span className="font-semibold text-gray-900">{entry.streak}</span>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${
                      entry.isCurrentUser ? 'text-violet-600' : 'text-gray-900'
                    }`}>
                      {entry.points.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600">puntos</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {leaderboard.length === 0 && (
        <div className="text-center py-12">
          <TrendingUp className="mx-auto text-gray-400 mb-4" size={64} />
          <p className="text-xl text-gray-600">No hay estudiantes en el ranking todavía</p>
          <p className="text-gray-500 mt-2">Sé el primero en completar lecciones</p>
        </div>
      )}
    </div>
  )
}
