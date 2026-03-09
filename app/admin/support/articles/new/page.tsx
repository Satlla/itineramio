'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  FileText,
  AlertTriangle
} from 'lucide-react'

type Lang = 'es' | 'en' | 'fr'

const CATEGORY_OPTIONS = [
  { value: 'GETTING_STARTED', label: 'Primeros Pasos' },
  { value: 'PROPERTIES', label: 'Propiedades' },
  { value: 'GUIDES', label: 'Guias' },
  { value: 'BILLING', label: 'Facturacion' },
  { value: 'ACCOUNT', label: 'Cuenta' },
  { value: 'INTEGRATIONS', label: 'Integraciones' },
  { value: 'TROUBLESHOOTING', label: 'Solucion de Problemas' },
  { value: 'FEATURES', label: 'Funcionalidades' },
]

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Borrador' },
  { value: 'PUBLISHED', label: 'Publicado' },
]

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export default function NewArticlePage() {
  const router = useRouter()
  const [activeLang, setActiveLang] = useState<Lang>('es')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    slug: '',
    title: { es: '', en: '', fr: '' },
    excerpt: { es: '', en: '', fr: '' },
    content: { es: '', en: '', fr: '' },
    category: 'GETTING_STARTED',
    icon: '',
    order: 0,
    status: 'DRAFT',
    featured: false,
    searchTerms: '',
  })

  const handleMultilangChange = (field: 'title' | 'excerpt' | 'content', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: { ...prev[field], [activeLang]: value },
    }))

    // Auto-generate slug from Spanish title
    if (field === 'title' && activeLang === 'es' && !formData.slug) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value),
        title: { ...prev.title, es: value },
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.es.trim()) {
      setError('El titulo en espanol es obligatorio')
      return
    }
    if (!formData.slug.trim()) {
      setError('El slug es obligatorio')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const body = {
        slug: formData.slug.trim(),
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        icon: formData.icon || null,
        order: formData.order,
        status: formData.status,
        featured: formData.featured,
        searchTerms: formData.searchTerms
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
      }

      const res = await fetch('/api/admin/support/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })

      if (res.ok) {
        router.push('/admin/support/articles')
      } else {
        const errData = await res.json().catch(() => ({}))
        setError(errData.error || 'Error al crear el articulo')
      }
    } catch (err) {
      console.error('Error creating article:', err)
      setError('Error de conexion')
    } finally {
      setSaving(false)
    }
  }

  const langs: { key: Lang; label: string }[] = [
    { key: 'es', label: 'ES' },
    { key: 'en', label: 'EN' },
    { key: 'fr', label: 'FR' },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/support/articles"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Volver a Articulos</span>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FileText className="h-8 w-8 text-blue-600" />
          Nuevo Articulo
        </h1>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Language Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-1">
              {langs.map((lang) => (
                <button
                  key={lang.key}
                  type="button"
                  onClick={() => setActiveLang(lang.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeLang === lang.key
                      ? 'bg-violet-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titulo ({activeLang.toUpperCase()}) {activeLang === 'es' && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                value={formData.title[activeLang]}
                onChange={(e) => handleMultilangChange('title', e.target.value)}
                placeholder={`Titulo del articulo en ${activeLang.toUpperCase()}`}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Extracto ({activeLang.toUpperCase()})
              </label>
              <textarea
                value={formData.excerpt[activeLang]}
                onChange={(e) => handleMultilangChange('excerpt', e.target.value)}
                placeholder={`Resumen breve en ${activeLang.toUpperCase()}`}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contenido ({activeLang.toUpperCase()})
              </label>
              <textarea
                value={formData.content[activeLang]}
                onChange={(e) => handleMultilangChange('content', e.target.value)}
                placeholder={`Contenido en ${activeLang.toUpperCase()}...`}
                rows={12}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-y font-mono text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">
                Soporta Markdown: <code className="bg-gray-100 px-1 rounded">**negrita**</code> · <code className="bg-gray-100 px-1 rounded">## Título</code> · <code className="bg-gray-100 px-1 rounded">- lista</code> · <code className="bg-gray-100 px-1 rounded">[enlace](url)</code>
              </p>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuracion</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="url-friendly-slug"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent font-mono text-sm"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Icon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icono</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                placeholder="Emoji o nombre de icono"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            {/* Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Search Terms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Terminos de busqueda
              </label>
              <input
                type="text"
                value={formData.searchTerms}
                onChange={(e) => setFormData(prev => ({ ...prev, searchTerms: e.target.value }))}
                placeholder="termino1, termino2, termino3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">Separados por coma</p>
            </div>
          </div>

          {/* Featured checkbox */}
          <div className="mt-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              />
              <span className="text-sm text-gray-700">Articulo destacado</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/support/articles"
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Crear Articulo'}
          </button>
        </div>
      </form>
    </div>
  )
}
