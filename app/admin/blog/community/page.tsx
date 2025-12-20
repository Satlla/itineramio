'use client'

import { useState, useEffect } from 'react'
import { Users, MessageCircle, Heart, TrendingUp, Mail, RefreshCw, ArrowLeft, Filter, Download, Tag } from 'lucide-react'
import Link from 'next/link'

interface Commenter {
  email: string
  name: string
  totalComments: number
  approvedComments: number
  totalLikes: number
  firstCommentAt: string
  lastCommentAt: string
  isVerified: boolean
  categories: { name: string; count: number }[]
  posts: { title: string; slug: string; count: number }[]
}

type SortBy = 'comments' | 'likes' | 'recent' | 'oldest'

export default function AdminBlogCommunityPage() {
  const [commenters, setCommenters] = useState<Commenter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortBy>('comments')
  const [searchTerm, setSearchTerm] = useState('')

  const loadCommenters = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/blog/community?sortBy=${sortBy}`)
      const data = await response.json()
      setCommenters(data.commenters || [])
    } catch (error) {
      console.error('Error loading commenters:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCommenters()
  }, [sortBy])

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(dateString))
  }

  const filteredCommenters = commenters.filter(c =>
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const exportCSV = () => {
    const headers = ['Email', 'Nombre', 'Comentarios', 'Aprobados', 'Likes', 'Primer comentario', 'Último comentario', 'Verificado', 'Categorías']
    const rows = commenters.map(c => [
      c.email,
      c.name,
      c.totalComments,
      c.approvedComments,
      c.totalLikes,
      formatDate(c.firstCommentAt),
      formatDate(c.lastCommentAt),
      c.isVerified ? 'Sí' : 'No',
      c.categories.map(cat => cat.name).join(', ')
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `comentaristas-blog-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  // Stats
  const stats = {
    totalCommenters: commenters.length,
    totalComments: commenters.reduce((sum, c) => sum + c.totalComments, 0),
    totalLikes: commenters.reduce((sum, c) => sum + c.totalLikes, 0),
    verifiedUsers: commenters.filter(c => c.isVerified).length
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/blog"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al Blog
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-violet-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Comunidad del Blog</h1>
              <p className="text-gray-500">Usuarios que comentan en tus artículos</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
            <button
              onClick={loadCommenters}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Comentaristas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCommenters}</p>
            </div>
            <Users className="w-10 h-10 text-violet-100" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Comentarios</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalComments}</p>
            </div>
            <MessageCircle className="w-10 h-10 text-blue-100" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Likes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalLikes}</p>
            </div>
            <Heart className="w-10 h-10 text-red-100" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Verificados</p>
              <p className="text-2xl font-bold text-green-600">{stats.verifiedUsers}</p>
            </div>
            <Mail className="w-10 h-10 text-green-100" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Buscar por email o nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-500">Ordenar:</span>
          {(['comments', 'likes', 'recent', 'oldest'] as SortBy[]).map((sort) => (
            <button
              key={sort}
              onClick={() => setSortBy(sort)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                sortBy === sort
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {sort === 'comments' && 'Más comentarios'}
              {sort === 'likes' && 'Más likes'}
              {sort === 'recent' && 'Más recientes'}
              {sort === 'oldest' && 'Más antiguos'}
            </button>
          ))}
        </div>
      </div>

      {/* Commenters List */}
      {isLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-violet-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Cargando comunidad...</p>
        </div>
      ) : filteredCommenters.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">No hay comentaristas</h3>
          <p className="text-gray-500">Aún no hay usuarios que hayan comentado</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Comentarios</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Likes</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Temas</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actividad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCommenters.map((commenter, index) => (
                <tr key={commenter.email} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-amber-600' :
                        'bg-violet-500'
                      }`}>
                        {index < 3 ? index + 1 : commenter.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{commenter.name}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {commenter.email}
                        </p>
                        {commenter.isVerified && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                            Verificado
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-xl font-bold text-gray-900">{commenter.totalComments}</span>
                      <span className="text-xs text-gray-500">{commenter.approvedComments} aprobados</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="font-semibold text-gray-900">{commenter.totalLikes}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {commenter.categories.slice(0, 3).map((cat) => (
                        <span
                          key={cat.name}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-800"
                        >
                          {cat.name} ({cat.count})
                        </span>
                      ))}
                      {commenter.categories.length > 3 && (
                        <span className="text-xs text-gray-500">+{commenter.categories.length - 3} más</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="text-gray-500">
                        Primer comentario: <span className="text-gray-700">{formatDate(commenter.firstCommentAt)}</span>
                      </p>
                      <p className="text-gray-500">
                        Último: <span className="text-gray-700">{formatDate(commenter.lastCommentAt)}</span>
                      </p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
