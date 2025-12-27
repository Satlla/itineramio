'use client'

import { useState } from 'react'
import { X, Phone, Clock, Save } from 'lucide-react'

interface CallLogModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  userName: string
  onSaved: () => void
}

export default function CallLogModal({
  isOpen,
  onClose,
  userId,
  userName,
  onSaved
}: CallLogModalProps) {
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    type: 'INCOMING',
    duration: '',
    reason: '',
    resolution: '',
    notes: '',
    followUpRequired: false,
    followUpDate: ''
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      
      const response = await fetch(`/api/admin/users/${userId}/calls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        onSaved()
        onClose()
        // Reset form
        setFormData({
          type: 'INCOMING',
          duration: '',
          reason: '',
          resolution: '',
          notes: '',
          followUpRequired: false,
          followUpDate: ''
        })
      } else {
        const error = await response.json()
        alert(error.error || 'Error al registrar la llamada')
      }
    } catch (error) {
      console.error('Error saving call:', error)
      alert('Error al guardar la llamada')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Phone className="h-6 w-6 text-green-600 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Registrar Llamada
              </h2>
              <p className="text-sm text-gray-600">
                Usuario: {userName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Call Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Llamada *
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            >
              <option value="INCOMING">Entrante</option>
              <option value="OUTGOING">Saliente</option>
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duración (minutos)
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Ej: 15"
                min="0"
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo de la Llamada *
            </label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Ej: Problema con el acceso a la propiedad"
              required
            />
          </div>

          {/* Resolution */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resolución
            </label>
            <textarea
              value={formData.resolution}
              onChange={(e) => handleInputChange('resolution', e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Describe cómo se resolvió el problema..."
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas Adicionales
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Información adicional sobre la llamada..."
            />
          </div>

          {/* Follow-up */}
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="followUp"
                checked={formData.followUpRequired}
                onChange={(e) => handleInputChange('followUpRequired', e.target.checked)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="followUp" className="ml-2 block text-sm text-gray-900">
                Requiere seguimiento
              </label>
            </div>

            {formData.followUpRequired && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Seguimiento
                </label>
                <input
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => handleInputChange('followUpDate', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Guardando...' : 'Guardar Llamada'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}