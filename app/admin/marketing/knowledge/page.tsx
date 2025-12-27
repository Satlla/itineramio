'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  Copy,
  Calendar,
  CheckCircle,
  Clock,
  Archive,
  Sparkles,
  MessageSquare,
  Download,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react'

export default function KnowledgeAdminDashboard() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Stats (mock por ahora)
  const stats = {
    totalArticles: 145,
    published: 89,
    drafts: 32,
    scheduled: 12,
    totalViews: 8234,
    totalQuestions: 1234,
    totalDownloads: 567,
    revenue: 2345
  }

  // Mock articles data
  const mockArticles = [
    {
      id: '1',
      title: 'Check-in Remoto Sin Llaves: Guía Completa 2025',
      status: 'PUBLISHED',
      category: 'CHECKIN_CHECKOUT',
      views: 1247,
      helpfulVotes: 234,
      hasTemplate: true,
      aiGenerated: false,
      publishedAt: new Date('2025-10-28'),
      author: 'Equipo Itineramio'
    },
    {
      id: '2',
      title: 'VUT Madrid 2025: Requisitos y Checklist',
      status: 'DRAFT',
      category: 'LEGAL_VUT',
      views: 0,
      helpfulVotes: 0,
      hasTemplate: true,
      aiGenerated: true,
      lastEdited: new Date(),
      author: 'Alejandro'
    },
    {
      id: '3',
      title: 'WiFi para Apartamentos: Guía Definitiva',
      status: 'SCHEDULED',
      category: 'WIFI_TECH',
      views: 0,
      helpfulVotes: 0,
      hasTemplate: false,
      aiGenerated: false,
      scheduledFor: new Date('2025-10-30'),
      author: 'Equipo Itineramio'
    }
  ]

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setArticles(mockArticles)
      setLoading(false)
    }, 500)
  }, [])

  const getStatusBadge = (status: string) => {
    const badges = {
      PUBLISHED: { color: 'bg-green-100 text-green-700', icon: CheckCircle, text: 'Publicado' },
      DRAFT: { color: 'bg-gray-100 text-gray-700', icon: Edit, text: 'Borrador' },
      SCHEDULED: { color: 'bg-blue-100 text-blue-700', icon: Clock, text: 'Programado' },
      PREVIEW: { color: 'bg-yellow-100 text-yellow-700', icon: Eye, text: 'Preview' },
      ARCHIVED: { color: 'bg-red-100 text-red-700', icon: Archive, text: 'Archivado' }
    }

    const badge = badges[status] || badges.DRAFT
    const Icon = badge.icon

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.text}
      </span>
    )
  }

  const getCategoryName = (category: string) => {
    const categories = {
      CHECKIN_CHECKOUT: 'Check-in',
      WIFI_TECH: 'WiFi/Tech',
      LEGAL_VUT: 'Legal',
      GUEST_COMMUNICATION: 'Comunicación',
      REVIEWS_RATINGS: 'Reviews',
      EMERGENCIES: 'Emergencias',
      AMENITIES: 'Amenidades',
      MAINTENANCE: 'Mantenimiento',
      MARKETING: 'Marketing',
      OPERATIONS: 'Operaciones'
    }
    return categories[category] || category
  }

  const filteredArticles = articles.filter(article => {
    const matchesFilter = filter === 'ALL' || article.status === filter
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <BookOpen className="w-8 h-8 mr-3 text-violet-600" />
                Centro de Conocimiento
              </h1>
              <p className="text-gray-600 mt-1">
                Gestiona artículos, plantillas y contenido del Knowledge Center
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/admin/marketing/knowledge/new"
                className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nuevo Artículo Manual
              </Link>
              <Link
                href="/admin/marketing/knowledge/generate"
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Generar con IA
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Artículos</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalArticles}</p>
                <p className="text-sm text-green-600 mt-1">+8 últimos 7 días</p>
              </div>
              <div className="bg-violet-100 p-3 rounded-lg">
                <BookOpen className="w-6 h-6 text-violet-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Visitas Totales</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
                <p className="text-sm text-green-600 mt-1">+23% vs semana anterior</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Preguntas IA</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalQuestions.toLocaleString()}</p>
                <p className="text-sm text-green-600 mt-1">+45 últimos 7 días</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Revenue</p>
                <p className="text-3xl font-bold text-gray-900">€{stats.revenue.toLocaleString()}</p>
                <p className="text-sm text-green-600 mt-1">+234€ últimos 7 días</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/knowledge"
              className="px-4 py-2 bg-violet-100 text-violet-700 rounded-lg font-medium"
            >
              📝 Artículos
            </Link>
            <Link
              href="/admin/knowledge/templates"
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              💾 Plantillas
            </Link>
            <Link
              href="/admin/knowledge/questions"
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              💬 Preguntas (Q&A)
            </Link>
            <Link
              href="/admin/knowledge/analytics"
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              📊 Analytics
            </Link>
            <Link
              href="/admin/knowledge/settings"
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ⚙️ Configuración
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFilter('ALL')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'ALL' ? 'bg-violet-100 text-violet-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Todos ({stats.totalArticles})
              </button>
              <button
                onClick={() => setFilter('PUBLISHED')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Publicados ({stats.published})
              </button>
              <button
                onClick={() => setFilter('DRAFT')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'DRAFT' ? 'bg-gray-100 text-gray-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Borradores ({stats.drafts})
              </button>
              <button
                onClick={() => setFilter('SCHEDULED')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Programados ({stats.scheduled})
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar artículos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Articles List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando artículos...</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">
                {searchQuery ? 'No se encontraron artículos' : 'No hay artículos aún'}
              </p>
              <p className="text-gray-500 mb-6">
                {searchQuery ? 'Intenta con otra búsqueda' : 'Empieza creando tu primer artículo'}
              </p>
              <Link
                href="/admin/knowledge/new"
                className="inline-flex items-center bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Crear Primer Artículo
              </Link>
            </div>
          ) : (
            filteredArticles.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      {getStatusBadge(article.status)}
                      <span className="px-3 py-1 bg-violet-100 text-violet-700 text-xs font-medium rounded-full">
                        {getCategoryName(article.category)}
                      </span>
                      {article.aiGenerated && (
                        <span className="px-3 py-1 bg-gradient-to-r from-violet-100 to-indigo-100 text-violet-700 text-xs font-medium rounded-full flex items-center">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Generado con IA
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {article.title}
                    </h3>

                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      {article.status === 'PUBLISHED' && (
                        <>
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            {article.views} vistas
                          </div>
                          <div className="flex items-center">
                            👍 {article.helpfulVotes} útil
                          </div>
                        </>
                      )}
                      {article.hasTemplate && (
                        <div className="flex items-center text-violet-600">
                          <Download className="w-4 h-4 mr-1" />
                          Plantilla incluida
                        </div>
                      )}
                      {article.publishedAt && (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Publicado: {article.publishedAt.toLocaleDateString('es')}
                        </div>
                      )}
                      {article.scheduledFor && (
                        <div className="flex items-center text-blue-600">
                          <Clock className="w-4 h-4 mr-1" />
                          Programado: {article.scheduledFor.toLocaleDateString('es')}
                        </div>
                      )}
                      <div>Por: {article.author}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      href={`/admin/knowledge/${article.id}`}
                      className="p-2 text-gray-600 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                    <Link
                      href={`/knowledge/${article.id}/preview`}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Vista previa"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                    <Link
                      href={`/admin/knowledge/${article.id}/analytics`}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Analytics"
                    >
                      <BarChart3 className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => console.log('Duplicar', article.id)}
                      className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Duplicar"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => console.log('Eliminar', article.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
