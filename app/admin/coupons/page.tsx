'use client'

import React, { useState, useEffect } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  Tag,
  Calendar,
  Users,
  Percent,
  Gift,
  Eye,
  X,
  Loader2,
  Check,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '../../../src/components/ui/Button'
import { Input } from '../../../src/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '../../../src/components/ui/Card'

interface Coupon {
  id: string
  code: string
  name: string
  description: string | null
  type: string
  discountPercent: number | null
  discountAmount: number | null
  freeMonths: number | null
  maxUses: number | null
  usedCount: number
  maxUsesPerUser: number
  validFrom: string
  validUntil: string | null
  isActive: boolean
  isPublic: boolean
  campaignSource: string | null
  createdAt: string
}

interface NewCoupon {
  code: string
  name: string
  description: string
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_MONTHS'
  discountPercent: number
  discountAmount: number
  freeMonths: number
  maxUses: number | null
  maxUsesPerUser: number
  validUntil: string
  isPublic: boolean
  campaignSource: string
}

const initialNewCoupon: NewCoupon = {
  code: '',
  name: '',
  description: '',
  type: 'PERCENTAGE',
  discountPercent: 20,
  discountAmount: 10,
  freeMonths: 1,
  maxUses: null,
  maxUsesPerUser: 1,
  validUntil: '',
  isPublic: false,
  campaignSource: ''
}

export default function CouponsAdminPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newCoupon, setNewCoupon] = useState<NewCoupon>(initialNewCoupon)
  const [creating, setCreating] = useState(false)
  const [createSuccess, setCreateSuccess] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/coupons')
      if (response.ok) {
        const data = await response.json()
        setCoupons(data.coupons || [])
      }
    } catch (error) {
      console.error('Error fetching coupons:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleCouponStatus = async (couponId: string, newStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/coupons/${couponId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus })
      })
      
      if (response.ok) {
        setCoupons(coupons.map(coupon => 
          coupon.id === couponId 
            ? { ...coupon, isActive: newStatus }
            : coupon
        ))
      }
    } catch (error) {
      console.error('Error toggling coupon:', error)
    }
  }

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setCreateError(null)

    try {
      const response = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...newCoupon,
          validUntil: newCoupon.validUntil || null,
          maxUses: newCoupon.maxUses || null,
          campaignSource: newCoupon.campaignSource || null
        })
      })

      const data = await response.json()

      if (response.ok) {
        setCreateSuccess(true)
        setTimeout(() => {
          setShowCreateModal(false)
          setNewCoupon(initialNewCoupon)
          setCreateSuccess(false)
          fetchCoupons()
        }, 1500)
      } else {
        setCreateError(data.error || 'Error al crear el cupón')
      }
    } catch (error) {
      console.error('Error creating coupon:', error)
      setCreateError('Error de conexión')
    } finally {
      setCreating(false)
    }
  }

  const getCouponTypeLabel = (type: string) => {
    switch (type) {
      case 'PERCENTAGE': return 'Porcentaje'
      case 'FIXED_AMOUNT': return 'Cantidad fija'
      case 'FREE_MONTHS': return 'Meses incluidos'
      case 'CUSTOM_PLAN': return 'Plan personalizado'
      default: return type
    }
  }

  const getCouponValue = (coupon: Coupon) => {
    switch (coupon.type) {
      case 'PERCENTAGE':
        return `${coupon.discountPercent}%`
      case 'FIXED_AMOUNT':
        return `€${coupon.discountAmount}`
      case 'FREE_MONTHS':
        return `${coupon.freeMonths} meses`
      case 'CUSTOM_PLAN':
        return 'Plan especial'
      default:
        return 'N/A'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center">
            <Tag className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 mr-2 text-red-600" />
            Gestión de Cupones
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1 sm:mt-2">
            Administra cupones de descuento, ofertas especiales y planes personalizados
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Cupón
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <Tag className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mb-2 sm:mb-0 sm:mr-3" />
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{coupons.length}</h3>
                <p className="text-xs sm:text-sm text-gray-600">Total cupones</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <Gift className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mb-2 sm:mb-0 sm:mr-3" />
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {coupons.filter(c => c.isActive).length}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">Cupones activos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 mb-2 sm:mb-0 sm:mr-3" />
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {coupons.reduce((sum, c) => sum + c.usedCount, 0)}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">Usos totales</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <Percent className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 mb-2 sm:mb-0 sm:mr-3" />
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {coupons.filter(c => c.type === 'PERCENTAGE').length}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">Desc. porcentual</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coupons List */}
      <Card>
        <CardHeader className="p-3 sm:p-4 lg:p-6">
          <CardTitle className="text-base sm:text-lg lg:text-xl">Lista de Cupones</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 lg:p-6">
          {coupons.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <Tag className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                No hay cupones creados
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Crea tu primer cupón para empezar con las campañas de marketing
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className={`border rounded-lg p-3 sm:p-4 ${
                    coupon.isActive
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                        <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${
                          coupon.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {coupon.code}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-500">
                          {getCouponTypeLabel(coupon.type)}
                        </span>
                        <span className="text-sm sm:text-base font-semibold text-blue-600">
                          {getCouponValue(coupon)}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-medium text-gray-900">{coupon.name}</h3>
                      {coupon.description && (
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          {coupon.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 sm:mt-3 text-xs sm:text-sm text-gray-500">
                        <div className="flex items-center">
                          <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          {coupon.usedCount} / {coupon.maxUses || '∞'} usos
                        </div>

                        {coupon.campaignSource && (
                          <div className="flex items-center">
                            <Tag className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            {coupon.campaignSource}
                          </div>
                        )}

                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          {coupon.validUntil ? (
                            `Hasta ${new Date(coupon.validUntil).toLocaleDateString()}`
                          ) : (
                            'Sin expiración'
                          )}
                        </div>

                        {coupon.isPublic && (
                          <div className="flex items-center">
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Público
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 lg:pt-0 lg:ml-4 border-t lg:border-t-0 border-gray-200">
                      <Button
                        onClick={() => toggleCouponStatus(coupon.id, !coupon.isActive)}
                        variant="outline"
                        size="sm"
                        className={`text-xs sm:text-sm ${coupon.isActive ? 'text-red-600' : 'text-green-600'}`}
                      >
                        {coupon.isActive ? 'Desactivar' : 'Activar'}
                      </Button>

                      <Button variant="outline" size="sm" className="p-1.5 sm:p-2">
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>

                      <Button variant="outline" size="sm" className="text-red-600 p-1.5 sm:p-2">
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Coupon Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 rounded-t-xl sticky top-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Crear Nuevo Cupón
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewCoupon(initialNewCoupon)
                    setCreateError(null)
                  }}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            {createSuccess ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Cupón Creado</h4>
                <p className="text-gray-600">El cupón {newCoupon.code.toUpperCase()} se ha creado correctamente.</p>
              </div>
            ) : (
              <form onSubmit={handleCreateCoupon} className="p-6">
                {createError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {createError}
                  </div>
                )}

                <div className="space-y-4">
                  {/* Código y Nombre */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Código <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newCoupon.code}
                        onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                        placeholder="WELCOME20"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newCoupon.name}
                        onChange={(e) => setNewCoupon({ ...newCoupon, name: e.target.value })}
                        placeholder="Descuento bienvenida"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      value={newCoupon.description}
                      onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                      placeholder="Descripción del cupón para uso interno..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    />
                  </div>

                  {/* Tipo de descuento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de descuento <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'PERCENTAGE', label: 'Porcentaje', icon: '%' },
                        { value: 'FIXED_AMOUNT', label: 'Cantidad', icon: '€' },
                        { value: 'FREE_MONTHS', label: 'Meses', icon: '📅' }
                      ].map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setNewCoupon({ ...newCoupon, type: type.value as NewCoupon['type'] })}
                          className={`p-3 rounded-lg border-2 transition-all text-center ${
                            newCoupon.type === type.value
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-lg">{type.icon}</span>
                          <p className="text-xs mt-1 font-medium">{type.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Valor del descuento según tipo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {newCoupon.type === 'PERCENTAGE' && 'Porcentaje de descuento'}
                      {newCoupon.type === 'FIXED_AMOUNT' && 'Cantidad fija (€)'}
                      {newCoupon.type === 'FREE_MONTHS' && 'Meses incluidos'}
                    </label>
                    {newCoupon.type === 'PERCENTAGE' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={newCoupon.discountPercent}
                          onChange={(e) => setNewCoupon({ ...newCoupon, discountPercent: parseInt(e.target.value) || 0 })}
                          min="1"
                          max="100"
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <span className="text-gray-500">%</span>
                      </div>
                    )}
                    {newCoupon.type === 'FIXED_AMOUNT' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={newCoupon.discountAmount}
                          onChange={(e) => setNewCoupon({ ...newCoupon, discountAmount: parseInt(e.target.value) || 0 })}
                          min="1"
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <span className="text-gray-500">€</span>
                      </div>
                    )}
                    {newCoupon.type === 'FREE_MONTHS' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={newCoupon.freeMonths}
                          onChange={(e) => setNewCoupon({ ...newCoupon, freeMonths: parseInt(e.target.value) || 0 })}
                          min="1"
                          max="12"
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <span className="text-gray-500">meses</span>
                      </div>
                    )}
                  </div>

                  {/* Límites */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Máximo usos totales
                      </label>
                      <input
                        type="number"
                        value={newCoupon.maxUses || ''}
                        onChange={(e) => setNewCoupon({ ...newCoupon, maxUses: e.target.value ? parseInt(e.target.value) : null })}
                        placeholder="Ilimitado"
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Usos por usuario
                      </label>
                      <input
                        type="number"
                        value={newCoupon.maxUsesPerUser}
                        onChange={(e) => setNewCoupon({ ...newCoupon, maxUsesPerUser: parseInt(e.target.value) || 1 })}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  {/* Fecha expiración y campaña */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha expiración
                      </label>
                      <input
                        type="date"
                        value={newCoupon.validUntil}
                        onChange={(e) => setNewCoupon({ ...newCoupon, validUntil: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Campaña/Fuente
                      </label>
                      <input
                        type="text"
                        value={newCoupon.campaignSource}
                        onChange={(e) => setNewCoupon({ ...newCoupon, campaignSource: e.target.value })}
                        placeholder="ej: email-junio"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  {/* Público */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={newCoupon.isPublic}
                      onChange={(e) => setNewCoupon({ ...newCoupon, isPublic: e.target.checked })}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <label htmlFor="isPublic" className="text-sm text-gray-700">
                      Cupón público (visible en la web)
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      setNewCoupon(initialNewCoupon)
                      setCreateError(null)
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !newCoupon.code || !newCoupon.name}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Crear Cupón
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}