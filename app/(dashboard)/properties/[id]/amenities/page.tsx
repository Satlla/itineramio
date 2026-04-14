'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Check, Loader2 } from 'lucide-react'
import { AMENITY_CATEGORIES, getAmenityById } from '@/data/amenities'

export default function AmenitiesPage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string

  const [activeAmenities, setActiveAmenities] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch(`/api/properties/${propertyId}/amenities`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.success && Array.isArray(data.amenities)) {
          setActiveAmenities(new Set(data.amenities))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [propertyId])

  const toggle = (id: string) => {
    setActiveAmenities(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    setSaved(false)
  }

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/properties/${propertyId}/amenities`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amenities: [...activeAmenities] }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch {}
    finally { setSaving(false) }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push(`/properties/${propertyId}/zones`)}
          className="flex items-center text-gray-500 hover:text-gray-900 mb-4 text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Volver
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Amenities</h1>
            <p className="text-sm text-gray-500 mt-1">
              {activeAmenities.size} servicios activos
            </p>
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4" />
            ) : null}
            {saved ? 'Guardado' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-8">
        {AMENITY_CATEGORIES.map(category => (
          <div key={category.id}>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {category.name.es}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {category.amenities.map(amenity => {
                const isActive = activeAmenities.has(amenity.id)
                return (
                  <button
                    key={amenity.id}
                    onClick={() => toggle(amenity.id)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${
                      isActive
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className={`text-sm ${isActive ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                      {amenity.name.es}
                    </span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      isActive
                        ? 'border-gray-900 bg-gray-900'
                        : 'border-gray-300'
                    }`}>
                      {isActive && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom save bar */}
      <div className="sticky bottom-4 mt-8">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-4 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {activeAmenities.size} servicios seleccionados
          </span>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {saved ? 'Guardado' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}
