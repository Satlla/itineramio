'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Hash,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  FileText,
  RefreshCw,
  ArrowLeft,
  Star
} from 'lucide-react'
import Link from 'next/link'
import { Button, Card, CardContent, Badge } from '../../../../../src/components/ui'
import { AnimatedLoadingSpinner } from '../../../../../src/components/ui/AnimatedLoadingSpinner'
import { DashboardFooter } from '../../../../../src/components/layout/DashboardFooter'

interface InvoiceSeries {
  id: string
  name: string
  prefix: string
  year: number
  type: 'STANDARD' | 'RECTIFYING'
  currentNumber: number
  resetYearly: boolean
  isDefault: boolean
  isActive: boolean
  nextNumber: string
  editable: boolean
}

export default function SeriesConfigPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [series, setSeries] = useState<InvoiceSeries[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Edit/Create state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    prefix: '',
    type: 'STANDARD' as 'STANDARD' | 'RECTIFYING',
    resetYearly: true,
    isDefault: false,
    currentNumber: 0
  })

  useEffect(() => {
    fetchSeries()
  }, [])

  const fetchSeries = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/gestion/invoice-series', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setSeries(data.series || [])
      }
    } catch (err) {
      console.error('Error fetching series:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.name || !formData.prefix) {
      setError('Nombre y prefijo son obligatorios')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/gestion/invoice-series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSuccess('Serie creada correctamente')
        setCreating(false)
        setFormData({ name: '', prefix: '', type: 'STANDARD', resetYearly: true, isDefault: false, currentNumber: 0 })
        fetchSeries()
      } else {
        const data = await response.json()
        setError(data.error || 'Error al crear la serie')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (id: string, originalCurrentNumber: number) => {
    setSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/gestion/invoice-series', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id,
          name: formData.name,
          isDefault: formData.isDefault,
          // Only send currentNumber if it changed
          ...(formData.currentNumber !== originalCurrentNumber && { currentNumber: formData.currentNumber })
        })
      })

      if (response.ok) {
        setSuccess('Serie actualizada correctamente')
        setEditingId(null)
        fetchSeries()
      } else {
        const data = await response.json()
        setError(data.error || 'Error al actualizar la serie')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta serie? Esta acción no se puede deshacer.')) return

    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/gestion/invoice-series?id=${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        setSuccess('Serie eliminada correctamente')
        fetchSeries()
      } else {
        const data = await response.json()
        setError(data.error || 'Error al eliminar la serie')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  const handleSetDefault = async (id: string) => {
    setSaving(true)
    try {
      const response = await fetch('/api/gestion/invoice-series', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, isDefault: true })
      })

      if (response.ok) {
        fetchSeries()
      }
    } catch (err) {
      console.error('Error setting default:', err)
    } finally {
      setSaving(false)
    }
  }

  const startEditing = (s: InvoiceSeries) => {
    setEditingId(s.id)
    setFormData({
      name: s.name,
      prefix: s.prefix,
      type: s.type,
      resetYearly: s.resetYearly,
      isDefault: s.isDefault,
      currentNumber: s.currentNumber
    })
    setCreating(false)
  }

  const startCreating = () => {
    setCreating(true)
    setEditingId(null)
    setFormData({ name: '', prefix: '', type: 'STANDARD', resetYearly: true, isDefault: false, currentNumber: 0 })
  }

  const cancel = () => {
    setCreating(false)
    setEditingId(null)
    setFormData({ name: '', prefix: '', type: 'STANDARD', resetYearly: true, isDefault: false, currentNumber: 0 })
  }

  const standardSeries = series.filter(s => s.type === 'STANDARD')
  const rectifyingSeries = series.filter(s => s.type === 'RECTIFYING')

  if (loading) {
    return <AnimatedLoadingSpinner text="Cargando series..." type="general" />
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <Link
              href="/gestion/apartamentos"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Volver a Apartamentos
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <Hash className="h-7 w-7 text-violet-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Series de Facturación</h1>
                  <p className="text-sm text-gray-600">
                    Configura las series de numeración para tus facturas
                  </p>
                </div>
              </div>

              <Button
                onClick={startCreating}
                disabled={creating || editingId !== null}
                className="bg-violet-600 hover:bg-violet-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva serie
              </Button>
            </div>
          </motion.div>

          {/* Alerts */}
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-700 flex-1">{error}</p>
                  <button onClick={() => setError(null)}>
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {success && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4 flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <p className="text-green-700 flex-1">{success}</p>
                  <button onClick={() => setSuccess(null)}>
                    <X className="w-4 h-4 text-green-500" />
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Create Form */}
          {creating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Nueva Serie</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ej: Facturas 2025"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prefijo * (1-3 letras)
                      </label>
                      <input
                        type="text"
                        value={formData.prefix}
                        onChange={(e) => setFormData(prev => ({ ...prev, prefix: e.target.value.toUpperCase().slice(0, 3) }))}
                        placeholder="Ej: F"
                        maxLength={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de serie
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'STANDARD' | 'RECTIFYING' }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      >
                        <option value="STANDARD">Facturas normales</option>
                        <option value="RECTIFYING">Facturas rectificativas</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.resetYearly}
                          onChange={(e) => setFormData(prev => ({ ...prev, resetYearly: e.target.checked }))}
                          className="rounded text-violet-600 focus:ring-violet-500"
                        />
                        <span className="text-sm text-gray-700">Reiniciar numeración cada año</span>
                      </label>
                    </div>
                    <div className="sm:col-span-2 flex items-center gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isDefault}
                          onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                          className="rounded text-violet-600 focus:ring-violet-500"
                        />
                        <span className="text-sm text-gray-700">Usar como serie predeterminada</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" onClick={cancel} disabled={saving}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreate} disabled={saving} className="bg-violet-600 hover:bg-violet-700">
                      {saving ? 'Creando...' : 'Crear serie'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Standard Series */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Facturas Normales</h2>
            </div>

            {standardSeries.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500">No hay series de facturas normales</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={startCreating}>
                    <Plus className="w-4 h-4 mr-1" />
                    Crear serie
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {standardSeries.map((s) => (
                  <SeriesCard
                    key={s.id}
                    series={s}
                    isEditing={editingId === s.id}
                    formData={formData}
                    setFormData={setFormData}
                    onEdit={() => startEditing(s)}
                    onSave={() => handleUpdate(s.id, s.currentNumber)}
                    onCancel={cancel}
                    onDelete={() => handleDelete(s.id)}
                    onSetDefault={() => handleSetDefault(s.id)}
                    saving={saving}
                  />
                ))}
              </div>
            )}
          </motion.div>

          {/* Rectifying Series */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <RefreshCw className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-semibold text-gray-900">Facturas Rectificativas</h2>
            </div>

            {rectifyingSeries.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500">No hay series de rectificativas</p>
                  <p className="text-xs text-gray-400 mt-1">Se creará automáticamente al emitir una rectificativa</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {rectifyingSeries.map((s) => (
                  <SeriesCard
                    key={s.id}
                    series={s}
                    isEditing={editingId === s.id}
                    formData={formData}
                    setFormData={setFormData}
                    onEdit={() => startEditing(s)}
                    onSave={() => handleUpdate(s.id, s.currentNumber)}
                    onCancel={cancel}
                    onDelete={() => handleDelete(s.id)}
                    onSetDefault={() => handleSetDefault(s.id)}
                    saving={saving}
                  />
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8"
          >
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h3 className="font-medium text-blue-800 mb-2">Sobre las series de facturación</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>- El prefijo se usa para generar el número completo (ej: F2025001)</li>
                  <li>- Las series con facturas emitidas no se pueden eliminar</li>
                  <li>- Las rectificativas deben usar una serie separada por ley</li>
                  <li>- Si activas el reinicio anual, la numeración empezará en 1 cada año</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <DashboardFooter />
    </div>
  )
}

// Series Card Component
function SeriesCard({
  series,
  isEditing,
  formData,
  setFormData,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onSetDefault,
  saving
}: {
  series: InvoiceSeries
  isEditing: boolean
  formData: any
  setFormData: (fn: (prev: any) => any) => void
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  onDelete: () => void
  onSetDefault: () => void
  saving: boolean
}) {
  return (
    <Card>
      <CardContent className="p-4">
        {isEditing ? (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Último número emitido</label>
                <input
                  type="number"
                  min={0}
                  value={formData.currentNumber}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, currentNumber: parseInt(e.target.value) || 0 }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <p className="text-xs text-gray-500 mt-1">La siguiente factura será {formData.currentNumber + 1}</p>
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, isDefault: e.target.checked }))}
                    className="rounded text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-sm text-gray-700">Serie predeterminada</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={onCancel} disabled={saving}>
                Cancelar
              </Button>
              <Button size="sm" onClick={onSave} disabled={saving} className="bg-violet-600 hover:bg-violet-700">
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="font-bold text-gray-700">{series.prefix}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{series.name}</span>
                  {series.isDefault && (
                    <Badge className="bg-amber-100 text-amber-700 text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      Predeterminada
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                  <span>Año: {series.year}</span>
                  <span>Actual: {series.currentNumber}</span>
                  <span className="text-violet-600 font-medium">Siguiente: {series.nextNumber}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!series.isDefault && (
                <button
                  onClick={onSetDefault}
                  className="p-2 text-gray-400 hover:text-amber-600 transition-colors"
                  title="Establecer como predeterminada"
                >
                  <Star className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onEdit}
                className="p-2 text-gray-400 hover:text-violet-600 transition-colors"
                title="Editar"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              {series.editable && (
                <button
                  onClick={onDelete}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
