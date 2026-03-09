'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Plus,
  Megaphone,
  Edit,
  Trash2,
  Calendar,
  Eye,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'

interface ProductUpdateItem {
  id: string
  title: Record<string, string>
  description: Record<string, string>
  image: string | null
  tag: string
  isPublished: boolean
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  _count?: {
    reads: number
  }
}

function TagBadge({ tag }: { tag: string }) {
  const config: Record<string, { label: string; className: string }> = {
    NEW: { label: 'Nuevo', className: 'bg-green-100 text-green-700' },
    IMPROVEMENT: { label: 'Mejora', className: 'bg-blue-100 text-blue-700' },
    FIX: { label: 'Correccion', className: 'bg-orange-100 text-orange-700' },
  }
  const c = config[tag] || { label: tag, className: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.className}`}>
      {c.label}
    </span>
  )
}

export default function ProductUpdatesListPage() {
  const router = useRouter()
  const [updates, setUpdates] = useState<ProductUpdateItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchUpdates()
  }, [])

  const fetchUpdates = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/support/product-updates', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setUpdates(data.updates || data || [])
      } else {
        setError('Error al cargar las novedades')
      }
    } catch (err) {
      setError('Error de conexion')
      console.error('Error fetching product updates:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Estas seguro de que quieres eliminar esta novedad? Esta accion no se puede deshacer.')) return

    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/support/product-updates/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (res.ok) {
        setUpdates(updates.filter((u) => u.id !== id))
      } else {
        alert('Error al eliminar la novedad')
      }
    } catch (err) {
      console.error('Error deleting product update:', err)
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
              <Megaphone className="h-8 w-8 text-green-600" />
              Novedades del Producto
            </h1>
            <p className="text-gray-600 mt-1">{updates.length} actualizaciones</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchUpdates}
              className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              href="/admin/support/product-updates/new"
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nueva Novedad
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

      {/* Updates List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full"></div>
          </div>
        ) : updates.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <Megaphone className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No hay novedades todavia</p>
            <Link
              href="/admin/support/product-updates/new"
              className="mt-3 inline-flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700"
            >
              <Plus className="w-4 h-4" />
              Crear la primera novedad
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titulo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Etiqueta</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Lecturas</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {updates.map((update) => (
                  <tr key={update.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {update.title?.es || update.title?.en || '-'}
                      </p>
                      {update.image && (
                        <p className="text-xs text-gray-400 truncate max-w-xs">{update.image}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <TagBadge tag={update.tag} />
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        update.isPublished
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {update.isPublished ? 'Publicado' : 'Borrador'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {update.publishedAt
                        ? new Date(update.publishedAt).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : new Date(update.createdAt).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                      }
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                        <Eye className="w-3.5 h-3.5" />
                        {update._count?.reads || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => router.push(`/admin/support/product-updates/${update.id}`)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(update.id)}
                          disabled={deleting === update.id}
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
