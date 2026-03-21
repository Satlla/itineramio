'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Plus,
  FileText,
  Edit,
  Trash2,
  Eye,
  ThumbsUp,
  Star,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'

interface Article {
  id: string
  slug: string
  title: Record<string, string>
  category: string
  status: string
  featured: boolean
  views: number
  helpfulYes: number
  helpfulNo: number
  order: number
  createdAt: string
  updatedAt: string
}

const CATEGORY_LABELS: Record<string, string> = {
  GETTING_STARTED: 'Primeros Pasos',
  PROPERTIES: 'Propiedades',
  GUIDES: 'Guias',
  BILLING: 'Facturacion',
  ACCOUNT: 'Cuenta',
  INTEGRATIONS: 'Integraciones',
  TROUBLESHOOTING: 'Solucion de Problemas',
  FEATURES: 'Funcionalidades',
}

export default function ArticlesListPage() {
  const router = useRouter()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/support/articles', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setArticles(data.articles || data || [])
      } else {
        setError('Error al cargar los articulos')
      }
    } catch {
      setError('Error de conexion')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Estas seguro de que quieres eliminar este articulo? Esta accion no se puede deshacer.')) return

    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/support/articles/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (res.ok) {
        setArticles(articles.filter((a) => a.id !== id))
      } else {
        alert('Error al eliminar el articulo')
      }
    } catch {
      alert('Error de conexion')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/support"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Volver al Soporte</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-600" />
              Articulos del Help Center
            </h1>
            <p className="text-gray-600 mt-1">{articles.length} articulos</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchArticles}
              className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              href="/admin/support/articles/new"
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuevo Articulo
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Articles Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full"></div>
          </div>
        ) : articles.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No hay articulos todavia</p>
            <Link
              href="/admin/support/articles/new"
              className="mt-3 inline-flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700"
            >
              <Plus className="w-4 h-4" />
              Crear el primer articulo
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titulo (ES)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Destacado</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Vistas</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Util</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {article.title?.es || article.title?.en || '-'}
                      </p>
                      <p className="text-xs text-gray-400 font-mono">{article.slug}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {CATEGORY_LABELS[article.category] || article.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        article.status === 'PUBLISHED'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {article.status === 'PUBLISHED' ? 'Publicado' : 'Borrador'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {article.featured ? (
                        <Star className="w-4 h-4 text-yellow-500 mx-auto fill-yellow-500" />
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                        <Eye className="w-3.5 h-3.5" />
                        {article.views}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        {article.helpfulYes}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => router.push(`/admin/support/articles/${article.id}`)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(article.id)}
                          disabled={deleting === article.id}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
