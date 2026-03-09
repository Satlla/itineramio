'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Megaphone,
  AlertTriangle
} from 'lucide-react'

type Lang = 'es' | 'en' | 'fr'

const TAG_OPTIONS = [
  { value: 'NEW', label: 'Nuevo' },
  { value: 'IMPROVEMENT', label: 'Mejora' },
  { value: 'FIX', label: 'Correccion' },
]

export default function NewProductUpdatePage() {
  const router = useRouter()
  const [activeLang, setActiveLang] = useState<Lang>('es')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: { es: '', en: '', fr: '' },
    description: { es: '', en: '', fr: '' },
    image: '',
    ctaText: { es: '', en: '', fr: '' },
    ctaUrl: '',
    tag: 'NEW',
    isPublished: false,
    publishedAt: '',
  })

  const handleMultilangChange = (field: 'title' | 'description' | 'ctaText', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: { ...prev[field], [activeLang]: value },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.es.trim()) {
      setError('El titulo en espanol es obligatorio')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const body: any = {
        title: formData.title,
        description: formData.description,
        image: formData.image || null,
        ctaText: (formData.ctaText.es || formData.ctaText.en || formData.ctaText.fr) ? formData.ctaText : null,
        ctaUrl: formData.ctaUrl || null,
        tag: formData.tag,
        isPublished: formData.isPublished,
        publishedAt: formData.isPublished
          ? (formData.publishedAt ? new Date(formData.publishedAt).toISOString() : new Date().toISOString())
          : null,
      }

      const res = await fetch('/api/admin/support/product-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })

      if (res.ok) {
        router.push('/admin/support/product-updates')
      } else {
        const errData = await res.json().catch(() => ({}))
        setError(errData.error || 'Error al crear la novedad')
      }
    } catch (err) {
      console.error('Error creating product update:', err)
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
          href="/admin/support/product-updates"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Volver a Novedades</span>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Megaphone className="h-8 w-8 text-green-600" />
          Nueva Novedad
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
                placeholder={`Titulo de la novedad en ${activeLang.toUpperCase()}`}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripcion ({activeLang.toUpperCase()})
              </label>
              <textarea
                value={formData.description[activeLang]}
                onChange={(e) => handleMultilangChange('description', e.target.value)}
                placeholder={`Descripcion detallada en ${activeLang.toUpperCase()}`}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-y"
              />
            </div>

            {/* CTA Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Texto del CTA ({activeLang.toUpperCase()})
                <span className="text-gray-400 font-normal ml-1">- Opcional</span>
              </label>
              <input
                type="text"
                value={formData.ctaText[activeLang]}
                onChange={(e) => handleMultilangChange('ctaText', e.target.value)}
                placeholder={`Ej: "Probar ahora", "Saber mas"...`}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuracion</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Image URL */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">URL de Imagen</label>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                placeholder="https://example.com/image.png"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            {/* CTA URL */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL del CTA
                <span className="text-gray-400 font-normal ml-1">- Opcional</span>
              </label>
              <input
                type="text"
                value={formData.ctaUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, ctaUrl: e.target.value }))}
                placeholder="https://itineramio.com/feature"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            {/* Tag */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Etiqueta</label>
              <select
                value={formData.tag}
                onChange={(e) => setFormData(prev => ({ ...prev, tag: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white"
              >
                {TAG_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Published At */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de publicacion</label>
              <input
                type="datetime-local"
                value={formData.publishedAt}
                onChange={(e) => setFormData(prev => ({ ...prev, publishedAt: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">Se establece automaticamente si se publica sin fecha</p>
            </div>
          </div>

          {/* Published checkbox */}
          <div className="mt-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              />
              <span className="text-sm text-gray-700">Publicar inmediatamente</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/support/product-updates"
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
            {saving ? 'Guardando...' : 'Crear Novedad'}
          </button>
        </div>
      </form>
    </div>
  )
}
