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
  Eye
} from 'lucide-react'
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

export default function CouponsAdminPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

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
    </div>
  )
}