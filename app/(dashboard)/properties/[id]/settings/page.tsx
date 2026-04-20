'use client'

import React, { useState, useEffect } from 'react'
import {
  ArrowLeft,
  Save,
  User,
  Phone,
  Mail,
  Globe,
  Home,
  MapPin,
  BedDouble,
  Bath,
  Users,
  Ruler,
  CheckCircle,
  AlertCircle,
  Brain,
  Eye,
  MessageCircle,
  Bell,
} from 'lucide-react'
import { Button } from '../../../../../src/components/ui/Button'
import { Input } from '../../../../../src/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../src/components/ui/Card'
import { ImageUpload } from '../../../../../src/components/ui/ImageUpload'
import { useRouter, useParams } from 'next/navigation'

interface PropertySettings {
  id: string
  name: string
  description: string
  type: string
  street: string
  city: string
  state: string
  country: string
  postalCode: string
  bedrooms: number
  bathrooms: number
  maxGuests: number
  squareMeters: number | null
  profileImage: string | null
  hostContactName: string
  hostContactPhone: string
  hostContactEmail: string
  hostContactLanguage: string
  hostContactPhoto: string | null
}

export default function PropertySettingsPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [property, setProperty] = useState<PropertySettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [form, setForm] = useState<Partial<PropertySettings>>({})

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const headers: HeadersInit = {}
        try {
          const localToken = localStorage.getItem('auth-token')
          if (localToken) headers['Authorization'] = `Bearer ${localToken}`
        } catch {}

        const res = await fetch(`/api/properties/${id}/safe`, { credentials: 'include', headers })
        const data = await res.json()
        if (data.success && data.data) {
          setProperty(data.data)
          setForm(data.data)
        } else {
          setError('No se pudo cargar la propiedad')
        }
      } catch {
        setError('Error al cargar la propiedad')
      } finally {
        setLoading(false)
      }
    }
    fetchProperty()
  }, [id])

  const handleChange = (field: keyof PropertySettings, value: string | number | null) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      try {
        const localToken = localStorage.getItem('auth-token')
        if (localToken) headers['Authorization'] = `Bearer ${localToken}`
      } catch {}

      const res = await fetch(`/api/properties/${id}/safe`, {
        method: 'PUT',
        credentials: 'include',
        headers,
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        setError(data.error || 'Error al guardar')
      }
    } catch {
      setError('Error al guardar los cambios')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-gray-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">{error || 'Propiedad no encontrada'}</p>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-gray-50 pb-20"
    >
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <Button
              onClick={() => router.push(`/properties/${id}/zones`)}
              variant="ghost"
              size="sm"
              className="hover:bg-gray-100 rounded-full p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              {property.name || 'Configuración'}
            </h1>
          </div>
          <p className="text-gray-500 text-sm ml-12 mb-3">Edita los datos de la propiedad y del anfitrión</p>

          {/* Tabs nav — matches zones page style */}
          <div className="flex items-center gap-4 ml-12">
            <button
              onClick={() => router.push(`/properties/${id}/zones`)}
              className="text-gray-700 font-medium text-sm underline underline-offset-4 hover:text-gray-900 transition-colors"
            >
              Zonas
            </button>
            <button
              onClick={() => router.push(`/properties/${id}/chatbot`)}
              className="text-gray-700 font-medium text-sm underline underline-offset-4 hover:text-gray-900 transition-colors"
            >
              Chatbot
            </button>
            <button
              onClick={() => router.push(`/properties/${id}/announcements`)}
              className="text-gray-700 font-medium text-sm underline underline-offset-4 hover:text-gray-900 transition-colors"
            >
              Avisos
            </button>
            <button
              onClick={() => router.push(`/properties/${id}/intelligence`)}
              className="text-gray-600 font-medium text-sm underline underline-offset-4 hover:text-gray-700 transition-colors flex items-center gap-1"
            >
              <Brain className="w-3.5 h-3.5" />
              Inteligencia
            </button>
            <span className="text-gray-900 font-semibold text-sm border-b-2 border-gray-900 pb-0.5">
              Configuración
            </span>
            <button
              onClick={() => window.open(`${window.location.origin}/guide/${id}`, '_blank')}
              className="text-gray-500 hover:text-gray-700 transition-colors p-1"
              aria-label="Vista pública"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Success */}
        {saved && (
          <div className="mb-6 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            Cambios guardados correctamente
          </div>
        )}

        {/* ─── SECCIÓN 1: Anfitrión ────────────────────────────────── */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="w-4 h-4 text-gray-600" />
              Información del Anfitrión
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Foto */}
            <div className="flex flex-col items-center">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Foto de perfil
              </label>
              <ImageUpload
                value={form.hostContactPhoto ?? undefined}
                onChange={(url) => handleChange('hostContactPhoto', url || null)}
                variant="profile"
                maxSize={5}
                placeholder="Subir foto del anfitrión"
              />
              <p className="mt-2 text-xs text-gray-500 text-center">
                Aparece en la guía pública y en el chatbot
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="inline w-3.5 h-3.5 mr-1" />
                  Nombre completo
                </label>
                <Input
                  value={form.hostContactName ?? ''}
                  onChange={(e) => handleChange('hostContactName', e.target.value)}
                  placeholder="Alejandro Satllas"
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="inline w-3.5 h-3.5 mr-1" />
                  Teléfono
                </label>
                <Input
                  value={form.hostContactPhone ?? ''}
                  onChange={(e) => handleChange('hostContactPhone', e.target.value)}
                  placeholder="+34 600 000 000"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="inline w-3.5 h-3.5 mr-1" />
                  Email
                </label>
                <Input
                  type="email"
                  value={form.hostContactEmail ?? ''}
                  onChange={(e) => handleChange('hostContactEmail', e.target.value)}
                  placeholder="host@email.com"
                />
              </div>

              {/* Idioma */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Globe className="inline w-3.5 h-3.5 mr-1" />
                  Idioma preferido
                </label>
                <select
                  value={form.hostContactLanguage ?? 'es'}
                  onChange={(e) => handleChange('hostContactLanguage', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── SECCIÓN 2: Propiedad ────────────────────────────────── */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Home className="w-4 h-4 text-gray-600" />
              Información del Apartamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Imagen principal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagen principal
              </label>
              <ImageUpload
                value={form.profileImage ?? undefined}
                onChange={(url) => handleChange('profileImage', url || null)}
                variant="property"
                maxSize={10}
                placeholder="Subir imagen del apartamento"
              />
            </div>

            {/* Nombre y descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del apartamento
              </label>
              <Input
                value={form.name ?? ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ej: Mercado Central Loft"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={form.description ?? ''}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                placeholder="Describe el apartamento..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 resize-none"
              />
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de propiedad
              </label>
              <select
                value={form.type ?? 'APARTMENT'}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <option value="APARTMENT">Apartamento</option>
                <option value="HOUSE">Casa</option>
                <option value="ROOM">Habitación</option>
                <option value="VILLA">Villa</option>
              </select>
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="inline w-3.5 h-3.5 mr-1" />
                Dirección
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  value={form.street ?? ''}
                  onChange={(e) => handleChange('street', e.target.value)}
                  placeholder="Calle y número"
                  className="sm:col-span-2"
                />
                <Input
                  value={form.city ?? ''}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="Ciudad"
                />
                <Input
                  value={form.state ?? ''}
                  onChange={(e) => handleChange('state', e.target.value)}
                  placeholder="Provincia"
                />
                <Input
                  value={form.postalCode ?? ''}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                  placeholder="Código postal"
                />
                <Input
                  value={form.country ?? ''}
                  onChange={(e) => handleChange('country', e.target.value)}
                  placeholder="País"
                />
              </div>
            </div>

            {/* Características */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Características</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    <BedDouble className="inline w-3 h-3 mr-0.5" /> Habitaciones
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={20}
                    value={form.bedrooms ?? 1}
                    onChange={(e) => handleChange('bedrooms', Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    <Bath className="inline w-3 h-3 mr-0.5" /> Baños
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    value={form.bathrooms ?? 1}
                    onChange={(e) => handleChange('bathrooms', Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    <Users className="inline w-3 h-3 mr-0.5" /> Huéspedes máx.
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={form.maxGuests ?? 2}
                    onChange={(e) => handleChange('maxGuests', Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    <Ruler className="inline w-3 h-3 mr-0.5" /> m²
                  </label>
                  <Input
                    type="number"
                    min={10}
                    max={1000}
                    value={form.squareMeters ?? ''}
                    onChange={(e) => handleChange('squareMeters', e.target.value ? Number(e.target.value) : null)}
                    placeholder="—"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botón guardar */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-6"
          >
            {saving ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : saved ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Guardando…' : saved ? 'Guardado' : 'Guardar cambios'}
          </Button>
        </div>
      </div>
    </div>
  )
}
