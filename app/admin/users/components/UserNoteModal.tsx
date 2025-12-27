'use client'

import { useState } from 'react'
import { X, FileText, Save, AlertCircle, Info, MessageCircle } from 'lucide-react'

interface UserNoteModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  userName: string
  onSaved: () => void
}

export default function UserNoteModal({
  isOpen,
  onClose,
  userId,
  userName,
  onSaved
}: UserNoteModalProps) {
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    type: 'GENERAL',
    priority: 'MEDIUM',
    title: '',
    content: '',
    isPrivate: false,
    tags: [] as string[]
  })

  if (!isOpen) return null

  const noteTypes = [
    { value: 'GENERAL', label: 'General', icon: Info },
    { value: 'BEHAVIOR', label: 'Comportamiento', icon: MessageCircle },
    { value: 'TECHNICAL', label: 'Técnico', icon: FileText },
    { value: 'BILLING', label: 'Facturación', icon: FileText },
    { value: 'COMPLAINT', label: 'Queja', icon: AlertCircle },
    { value: 'COMPLIMENT', label: 'Elogio', icon: MessageCircle }
  ]

  const priorities = [
    { value: 'LOW', label: 'Baja', color: 'text-green-600' },
    { value: 'MEDIUM', label: 'Media', color: 'text-yellow-600' },
    { value: 'HIGH', label: 'Alta', color: 'text-orange-600' },
    { value: 'URGENT', label: 'Urgente', color: 'text-red-600' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      
      const response = await fetch(`/api/admin/users/${userId}/notes`, {
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
          type: 'GENERAL',
          priority: 'MEDIUM',
          title: '',
          content: '',
          isPrivate: false,
          tags: []
        })
      } else {
        const error = await response.json()
        alert(error.error || 'Error al crear la nota')
      }
    } catch (error) {
      console.error('Error saving note:', error)
      alert('Error al guardar la nota')
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

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag)
    handleInputChange('tags', tags)
  }

  const selectedType = noteTypes.find(type => type.value === formData.type)
  const TypeIcon = selectedType?.icon || Info

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <TypeIcon className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Nueva Nota
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
          {/* Type and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Nota *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              >
                {noteTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridad *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              >
                {priorities.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Ej: Usuario reporta problema con zona de cocina"
              required
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contenido *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows={5}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Describe los detalles de la nota..."
              required
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Etiquetas
            </label>
            <input
              type="text"
              value={formData.tags.join(', ')}
              onChange={(e) => handleTagsChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="problema, cocina, urgente (separadas por comas)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separa las etiquetas con comas para facilitar la búsqueda
            </p>
          </div>

          {/* Private Note */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPrivate"
              checked={formData.isPrivate}
              onChange={(e) => handleInputChange('isPrivate', e.target.checked)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-900">
              Nota privada (solo visible para administradores)
            </label>
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
              <span>{saving ? 'Guardando...' : 'Guardar Nota'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}