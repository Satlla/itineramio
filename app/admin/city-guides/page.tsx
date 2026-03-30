'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Map,
  Plus,
  Edit,
  Trash2,
  Star,
  Globe,
  MapPin,
  Users,
  Loader2,
  X,
  ChevronDown,
  CheckCircle,
  ImageIcon,
  Pencil,
} from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface CityGuide {
  id: string
  title: string
  city: string
  country: string
  description?: string | null
  status: 'DRAFT' | 'PUBLISHED' | 'VERIFIED' | 'SUSPENDED'
  version: number
  subscriberCount: number
  author: { id: string; name?: string | null }
  _count: { places: number }
  createdAt: string
}

function StatusBadge({ status }: { status: CityGuide['status'] }) {
  const map = {
    VERIFIED: 'bg-amber-100 text-amber-700 border-amber-200',
    PUBLISHED: 'bg-violet-100 text-violet-700 border-violet-200',
    DRAFT: 'bg-gray-100 text-gray-600 border-gray-200',
    SUSPENDED: 'bg-red-100 text-red-600 border-red-200',
  }
  const labels = { VERIFIED: 'Verificada', PUBLISHED: 'Publicada', DRAFT: 'Borrador', SUSPENDED: 'Suspendida' }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${map[status]}`}>
      {status === 'VERIFIED' && <Star className="w-3 h-3 fill-amber-500 text-amber-500" />}
      {labels[status]}
    </span>
  )
}

// --- Create / Edit Modal ---

function GuideFormModal({
  guide,
  onClose,
  onSaved,
}: {
  guide?: CityGuide
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState({
    title: guide?.title ?? '',
    city: guide?.city ?? '',
    country: guide?.country ?? 'ES',
    description: guide?.description ?? '',
    status: guide?.status ?? 'DRAFT',
    coverImage: (guide as any)?.coverImage ?? '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'city-guide-cover')
      formData.append('skipDuplicateCheck', 'true')
      const res = await fetch('/api/upload', { method: 'POST', body: formData, credentials: 'include' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al subir imagen')
      const imageUrl = data.url || data.mediaUrl || data.blobUrl || data.existingMedia?.url
      if (!imageUrl) throw new Error('No se recibió URL de la imagen')
      setForm((f) => ({ ...f, coverImage: imageUrl }))
    } catch (e: any) {
      setError(e.message)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.city.trim()) {
      setError('El título y la ciudad son obligatorios')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = guide
        ? await fetch(`/api/city-guides/${guide.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(form),
          })
        : await fetch('/api/city-guides', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(form),
          })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al guardar')
      onSaved()
    } catch (e: any) {
      setError(e.message)
      setSubmitting(false)
    }
  }

  const countries = [
    ['ES', 'España'], ['FR', 'Francia'], ['PT', 'Portugal'], ['IT', 'Italia'],
    ['DE', 'Alemania'], ['GB', 'Reino Unido'], ['US', 'Estados Unidos'],
    ['MX', 'México'], ['AR', 'Argentina'], ['OTHER', 'Otro'],
  ]

  const statuses = [
    ['DRAFT', 'Borrador'], ['PUBLISHED', 'Publicada'], ['VERIFIED', 'Verificada'], ['SUSPENDED', 'Suspendida'],
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="relative bg-white border border-gray-200 rounded-2xl shadow-xl w-full max-w-md p-6"
      >
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
            <Map className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h2 className="text-gray-900 font-semibold">{guide ? 'Editar guía' : 'Nueva guía de ciudad'}</h2>
            <p className="text-gray-500 text-sm">Gestionada por Itineramio</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 font-medium uppercase tracking-wide mb-1.5">Título *</label>
            <input
              type="text"
              placeholder="Ej: Alicante — Lo esencial"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 font-medium uppercase tracking-wide mb-1.5">Ciudad *</label>
              <input
                type="text"
                placeholder="Ej: Alicante"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 font-medium uppercase tracking-wide mb-1.5">País</label>
              <div className="relative">
                <select
                  value={form.country}
                  onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm appearance-none focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-colors"
                >
                  {countries.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 font-medium uppercase tracking-wide mb-1.5">Estado</label>
            <div className="relative">
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm appearance-none focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-colors"
              >
                {statuses.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 font-medium uppercase tracking-wide mb-1.5">Descripción</label>
            <textarea
              placeholder="Describe qué hace especial esta guía..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-colors resize-none"
            />
          </div>

          {/* Cover image */}
          <div>
            <label className="block text-xs text-gray-500 font-medium uppercase tracking-wide mb-1.5">Imagen de portada</label>
            {form.coverImage ? (
              <div className="relative rounded-xl overflow-hidden mb-2 h-28">
                <img src={form.coverImage} alt="Portada" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, coverImage: '' }))}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-24 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition-colors">
                {uploadingImage ? (
                  <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
                ) : (
                  <>
                    <span className="text-gray-400 text-xs">Subir foto</span>
                    <span className="text-gray-300 text-[11px] mt-0.5">JPG, PNG — máx 5MB</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
              </label>
            )}
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors text-sm">
              Cancelar
            </button>
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {guide ? 'Guardar cambios' : 'Crear guía'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// --- Main Page ---

export default function AdminCityGuidesPage() {
  const [guides, setGuides] = useState<CityGuide[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingGuide, setEditingGuide] = useState<CityGuide | undefined>()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const [backfilling, setBackfilling] = useState(false)
  const [backfillStatus, setBackfillStatus] = useState('')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3500)
  }

  const fetchGuides = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/city-guides?all=true', { credentials: 'include' })
      const data = await res.json()
      setGuides(data.data || [])
    } catch {
      setGuides([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchGuides() }, [fetchGuides])

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar esta guía?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/city-guides/${id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) throw new Error()
      setGuides((prev) => prev.filter((g) => g.id !== id))
      showToast('Guía eliminada')
    } catch {
      showToast('Error al eliminar')
    } finally {
      setDeletingId(null)
    }
  }

  const handleSaved = () => {
    setShowForm(false)
    setEditingGuide(undefined)
    fetchGuides()
    showToast(editingGuide ? 'Guía actualizada' : 'Guía creada correctamente')
  }

  const handleBackfillPhotos = async () => {
    if (!confirm('¿Actualizar fotos de todos los lugares existentes? Esto hace llamadas a Google API (coste ~$0.017/lugar).')) return
    setBackfilling(true)
    let offset = 0
    let totalProcessed = 0

    try {
      while (true) {
        setBackfillStatus(`Procesando... (${totalProcessed} actualizados)`)
        const res = await fetch('/api/admin/places/backfill-photos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ offset }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Error')

        totalProcessed += data.processed
        if (data.done) break
        offset = data.nextOffset
      }
      showToast(`✅ ${totalProcessed} lugares actualizados con fotos`)
      setBackfillStatus('')
    } catch (e: any) {
      showToast(`Error: ${e.message}`)
      setBackfillStatus('')
    } finally {
      setBackfilling(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center">
              <Map className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Guías de ciudad</h1>
              <p className="text-gray-500 text-sm">Gestiona las guías oficiales de Itineramio</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBackfillPhotos}
              disabled={backfilling}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:text-gray-900 hover:border-gray-300 text-sm transition-colors disabled:opacity-50 shadow-sm"
              title="Actualizar fotos de lugares existentes"
            >
              {backfilling ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
              {backfilling ? backfillStatus || 'Actualizando...' : 'Actualizar fotos'}
            </button>
            <button
              onClick={() => { setEditingGuide(undefined); setShowForm(true) }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Nueva guía
            </button>
          </div>
        </div>

        {/* Stats summary */}
        {!loading && guides.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
              <div className="text-2xl font-bold text-gray-900">{guides.length}</div>
              <div className="text-xs text-gray-500 mt-0.5">Guías totales</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
              <div className="text-2xl font-bold text-violet-600">{guides.filter(g => g.status === 'PUBLISHED' || g.status === 'VERIFIED').length}</div>
              <div className="text-xs text-gray-500 mt-0.5">Publicadas</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
              <div className="text-2xl font-bold text-gray-900">{guides.reduce((acc, g) => acc + g.subscriberCount, 0)}</div>
              <div className="text-xs text-gray-500 mt-0.5">Propiedades suscritas</div>
            </div>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
          </div>
        ) : guides.length === 0 ? (
          <div className="text-center py-20">
            <Map className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">No hay guías creadas aún</p>
          </div>
        ) : (
          <div className="space-y-3">
            {guides.map((guide) => (
              <div
                key={guide.id}
                className="bg-white border border-gray-200 rounded-2xl p-5 flex items-start gap-4 hover:border-violet-200 hover:shadow-sm transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5 text-violet-500" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <StatusBadge status={guide.status} />
                    <span className="text-gray-400 text-xs">v{guide.version}</span>
                  </div>
                  <h3 className="text-gray-900 font-semibold text-base">{guide.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-gray-400 mt-1.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-violet-400" />
                      {guide.city}, {guide.country}
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {guide._count.places} lugares
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {guide.subscriberCount} propiedades
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/admin/city-guides/${guide.id}`}>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50 border border-violet-200 text-violet-700 hover:bg-violet-100 transition-colors text-sm font-medium">
                      <Pencil className="w-3.5 h-3.5" />
                      Editar
                    </button>
                  </Link>
                  <button
                    onClick={() => { setEditingGuide(guide); setShowForm(true) }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    title="Editar metadatos"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(guide.id)}
                    disabled={deletingId === guide.id}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="Eliminar"
                  >
                    {deletingId === guide.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <GuideFormModal
            guide={editingGuide}
            onClose={() => { setShowForm(false); setEditingGuide(undefined) }}
            onSaved={handleSaved}
          />
        )}
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-white border border-emerald-200 rounded-2xl px-4 py-3 shadow-xl"
          >
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <span className="text-gray-800 text-sm">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
