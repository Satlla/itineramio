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
      case 'FREE_MONTHS': return 'Meses gratis'
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
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Cupones</h1>
          <p className="text-gray-600 mt-2">
            Administra cupones de descuento, ofertas especiales y planes personalizados
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Cupón
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Tag className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">{coupons.length}</h3>
                <p className="text-sm text-gray-600">Total cupones</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Gift className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">
                  {coupons.filter(c => c.isActive).length}
                </h3>
                <p className="text-sm text-gray-600">Cupones activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">
                  {coupons.reduce((sum, c) => sum + c.usedCount, 0)}
                </h3>
                <p className="text-sm text-gray-600">Usos totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Percent className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">
                  {coupons.filter(c => c.type === 'PERCENTAGE').length}
                </h3>
                <p className="text-sm text-gray-600">Desc. porcentual</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coupons List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Cupones</CardTitle>
        </CardHeader>
        <CardContent>
          {coupons.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay cupones creados
              </h3>
              <p className="text-gray-600">
                Crea tu primer cupón para empezar con las campañas de marketing
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className={`border rounded-lg p-4 ${
                    coupon.isActive
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          coupon.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {coupon.code}
                        </span>
                        <span className="text-sm text-gray-500">
                          {getCouponTypeLabel(coupon.type)}
                        </span>
                        <span className="font-semibold text-blue-600">
                          {getCouponValue(coupon)}
                        </span>
                      </div>
                      
                      <h3 className="font-medium text-gray-900">{coupon.name}</h3>
                      {coupon.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {coupon.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {coupon.usedCount} / {coupon.maxUses || '∞'} usos
                        </div>
                        
                        {coupon.campaignSource && (
                          <div className="flex items-center">
                            <Tag className="w-4 h-4 mr-1" />
                            {coupon.campaignSource}
                          </div>
                        )}
                        
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {coupon.validUntil ? (
                            `Hasta ${new Date(coupon.validUntil).toLocaleDateString()}`
                          ) : (
                            'Sin expiración'
                          )}
                        </div>
                        
                        {coupon.isPublic && (
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            Público
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        onClick={() => toggleCouponStatus(coupon.id, !coupon.isActive)}
                        variant="outline"
                        size="sm"
                        className={coupon.isActive ? 'text-red-600' : 'text-green-600'}
                      >
                        {coupon.isActive ? 'Desactivar' : 'Activar'}
                      </Button>
                      
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      <Button variant="outline" size="sm" className="text-red-600">
                        <Trash2 className="w-4 h-4" />
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