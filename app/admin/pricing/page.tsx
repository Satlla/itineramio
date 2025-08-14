'use client'

import React, { useState, useEffect } from 'react'
import { 
  DollarSign, 
  Plus, 
  Edit3, 
  Save,
  X,
  AlertCircle,
  TrendingUp,
  Calculator
} from 'lucide-react'

interface PricingTier {
  id: string
  minProperties: number
  maxProperties: number | null
  pricePerProperty: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function AdminPricingPage() {
  const [tiers, setTiers] = useState<PricingTier[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    minProperties: 1,
    maxProperties: null as number | null,
    pricePerProperty: 8.00
  })

  useEffect(() => {
    fetchPricingTiers()
  }, [])

  const fetchPricingTiers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/pricing-tiers')
      const data = await response.json()
      if (data.success) {
        setTiers(data.tiers || [])
      }
    } catch (error) {
      console.error('Error fetching pricing tiers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (id?: string) => {
    try {
      setSaving(true)
      const url = id ? `/api/admin/pricing-tiers/${id}` : '/api/admin/pricing-tiers'
      const method = id ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })

      const data = await response.json()
      
      if (data.success) {
        await fetchPricingTiers()
        setEditingId(null)
        setEditForm({ minProperties: 1, maxProperties: null, pricePerProperty: 8.00 })
      } else {
        alert(data.error || 'Error al guardar')
      }
    } catch (error) {
      console.error('Error saving tier:', error)
      alert('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (tier: PricingTier) => {
    setEditingId(tier.id)
    setEditForm({
      minProperties: tier.minProperties,
      maxProperties: tier.maxProperties,
      pricePerProperty: tier.pricePerProperty
    })
  }

  const calculateExamplePrice = (properties: number) => {
    const applicableTier = tiers.find(tier => 
      properties >= tier.minProperties && 
      (tier.maxProperties === null || properties <= tier.maxProperties)
    )
    return applicableTier ? properties * applicableTier.pricePerProperty : 0
  }

  const examples = [1, 3, 5, 10, 15, 25]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <DollarSign className="h-8 w-8 mr-3 text-red-600" />
          Configuración de Precios
        </h1>
        <p className="text-gray-600 mt-2">
          Gestiona los tramos de precios según el número de propiedades
        </p>
      </div>

      {/* Pricing Calculator Preview */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 mb-8 text-white">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Calculator className="w-5 h-5 mr-2" />
          Vista Previa del Calculador
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {examples.map(count => (
            <div key={count} className="bg-white/20 rounded-lg p-3 text-center">
              <div className="text-sm opacity-90">{count} propiedad{count > 1 ? 'es' : ''}</div>
              <div className="text-lg font-bold">€{Number(calculateExamplePrice(count)).toFixed(2)}</div>
              <div className="text-xs opacity-75">/mes</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Tiers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Tramos de Precios</h2>
            <button
              onClick={() => setEditingId('new')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Tramo
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rango de Propiedades
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio por Propiedad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* New/Edit Row */}
              {editingId && (
                <tr className="bg-blue-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        value={editForm.minProperties}
                        onChange={(e) => setEditForm({...editForm, minProperties: parseInt(e.target.value) || 1})}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Min"
                      />
                      <span>a</span>
                      <input
                        type="number"
                        min="1"
                        value={editForm.maxProperties || ''}
                        onChange={(e) => setEditForm({...editForm, maxProperties: e.target.value ? parseInt(e.target.value) : null})}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Max"
                      />
                      <span className="text-xs text-gray-500">(vacío = ilimitado)</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="mr-1">€</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={editForm.pricePerProperty}
                        onChange={(e) => setEditForm({...editForm, pricePerProperty: parseFloat(e.target.value) || 0})}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Activo
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSave(editingId === 'new' ? undefined : editingId)}
                        disabled={saving}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {/* Existing Tiers */}
              {tiers.map((tier) => (
                <tr key={tier.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {tier.minProperties}{tier.maxProperties ? ` - ${tier.maxProperties}` : '+'} propiedades
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-lg font-bold text-gray-900">
                      €{Number(tier.pricePerProperty).toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">/propiedad/mes</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tier.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {tier.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(tier)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {tiers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No hay tramos de precios configurados</p>
                    <button
                      onClick={() => setEditingId('new')}
                      className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      Crear primer tramo
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}