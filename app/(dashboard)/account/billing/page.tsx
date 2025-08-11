'use client'

import React, { useState, useEffect } from 'react'
import { 
  CreditCard, 
  Building2, 
  User, 
  MapPin, 
  FileText,
  Save,
  AlertCircle,
  CheckCircle,
  Euro,
  Gift,
  Users,
  Copy,
  Check,
  Tag,
  Percent,
  Eye
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../src/components/ui/Card'
import { Button } from '../../../../src/components/ui/Button'
import { Input } from '../../../../src/components/ui/Input'
import { useAuth } from '../../../../src/providers/AuthProvider'
import { useNotifications } from '../../../../src/hooks/useNotifications'

interface BillingData {
  companyName?: string
  billingAddress?: string
  billingCity?: string
  billingCountry?: string
  billingPostalCode?: string
  vatNumber?: string
  phone?: string
  referralCode?: string
  affiliateCommission?: number
}

interface PlanInfo {
  currentPlan: string
  propertiesCount: number
  monthlyFee: number
  nextBillingDate?: string
  planDescription?: string
}

interface CouponValidation {
  valid: boolean
  coupon?: {
    code: string
    name: string
    description: string
    type: string
  }
  discount?: {
    originalAmount: number
    discountAmount: number
    finalAmount: number
    freeMonthsGained: number
    percentageOff: number
  }
  details?: {
    usesRemaining: string | number
    userUsesRemaining: number
    validUntil: string | null
  }
  error?: string
}

export default function BillingPage() {
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [couponValidation, setCouponValidation] = useState<CouponValidation | null>(null)
  
  const [billingData, setBillingData] = useState<BillingData>({
    companyName: '',
    billingAddress: '',
    billingCity: '',
    billingCountry: 'España',
    billingPostalCode: '',
    vatNumber: '',
    phone: '',
    referralCode: '',
    affiliateCommission: 0
  })

  const [planInfo, setPlanInfo] = useState<PlanInfo>({
    currentPlan: 'Gratuito',
    propertiesCount: 0,
    monthlyFee: 0
  })

  const [invoices, setInvoices] = useState<any[]>([])
  const [loadingInvoices, setLoadingInvoices] = useState(false)

  useEffect(() => {
    fetchBillingData()
    fetchPlanInfo()
    fetchInvoices()
  }, [])

  const fetchBillingData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/account/billing-info')
      if (response.ok) {
        const data = await response.json()
        setBillingData({
          companyName: data.companyName || '',
          billingAddress: data.billingAddress || '',
          billingCity: data.billingCity || '',
          billingCountry: data.billingCountry || 'España',
          billingPostalCode: data.billingPostalCode || '',
          vatNumber: data.vatNumber || '',
          phone: data.phone || '',
          referralCode: data.referralCode || '',
          affiliateCommission: data.affiliateCommission || 0
        })
      }
    } catch (error) {
      console.error('Error fetching billing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPlanInfo = async () => {
    try {
      const response = await fetch('/api/account/plan-info')
      if (response.ok) {
        const data = await response.json()
        setPlanInfo(data)
      }
    } catch (error) {
      console.error('Error fetching plan info:', error)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/account/billing-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billingData)
      })

      if (response.ok) {
        addNotification({
          type: 'success',
          title: 'Datos guardados',
          message: 'Tus datos de facturación han sido actualizados',
          read: false
        })
      } else {
        throw new Error('Error saving data')
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudieron guardar los datos. Inténtalo de nuevo.',
        read: false
      })
    } finally {
      setSaving(false)
    }
  }

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/register?ref=${billingData.referralCode}`
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    
    addNotification({
      type: 'success',
      title: 'Enlace copiado',
      message: 'Enlace de referido copiado al portapapeles',
      read: false
    })
  }

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponValidation({ valid: false, error: 'Ingresa un código de cupón' })
      return
    }

    try {
      setValidatingCoupon(true)
      setCouponValidation(null)
      
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          couponCode: couponCode.trim(),
          propertyCount: planInfo.propertiesCount + 1, // For next property
          duration: 1 // Default to 1 month
        })
      })

      const result = await response.json()
      setCouponValidation(result)

      if (result.valid) {
        addNotification({
          type: 'success',
          title: 'Cupón válido',
          message: `${result.coupon.name} aplicado correctamente`,
          read: false
        })
      }
    } catch (error) {
      setCouponValidation({
        valid: false,
        error: 'Error al validar el cupón. Inténtalo de nuevo.'
      })
    } finally {
      setValidatingCoupon(false)
    }
  }

  const fetchInvoices = async () => {
    try {
      setLoadingInvoices(true)
      const response = await fetch('/api/account/invoices')
      if (response.ok) {
        const data = await response.json()
        setInvoices(data || [])
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setLoadingInvoices(false)
    }
  }

  const viewInvoice = (invoiceId: string) => {
    const url = `/api/invoices/${invoiceId}/view`
    window.open(url, '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Facturación y Suscripción</h1>
        <p className="text-gray-600 mt-2">
          Gestiona tus datos fiscales, plan actual y programa de afiliados
        </p>
      </div>

      {/* Plan Actual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Tu Plan Actual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900">{planInfo.currentPlan}</h3>
              <p className="text-sm text-blue-700">Plan actual</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900">{planInfo.propertiesCount}</h3>
              <p className="text-sm text-green-700">Propiedades activas</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900">€{planInfo.monthlyFee}</h3>
              <p className="text-sm text-purple-700">Coste mensual</p>
            </div>
          </div>
          
          {planInfo.currentPlan === 'Gratuito' && planInfo.propertiesCount >= 1 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-amber-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-900">¡Desbloquea más propiedades!</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Estás usando tu propiedad gratuita. Para agregar más propiedades, actualiza a nuestro plan Growth por solo €2.50/mes por propiedad adicional.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cupones de Descuento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Tag className="w-5 h-5 mr-2" />
            Cupones de Descuento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-900 mb-2">¿Tienes un cupón de descuento?</h3>
            <p className="text-sm text-green-700 mb-4">
              Valida tu cupón para obtener descuentos especiales, meses gratis o acceso a planes personalizados
            </p>
            
            <div className="flex space-x-2">
              <Input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="LAUNCH50, SUMMER25, FRIEND6M..."
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && validateCoupon()}
              />
              <Button
                onClick={validateCoupon}
                disabled={validatingCoupon || !couponCode.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                {validatingCoupon ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Coupon Validation Results */}
          {couponValidation && (
            <div className={`p-4 rounded-lg border ${
              couponValidation.valid 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              {couponValidation.valid ? (
                <div className="space-y-3">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-green-900">
                        {couponValidation.coupon?.name}
                      </h4>
                      <p className="text-sm text-green-700">
                        {couponValidation.coupon?.description}
                      </p>
                    </div>
                  </div>

                  {couponValidation.discount && (
                    <div className="bg-white p-3 rounded border border-green-200">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {couponValidation.discount.originalAmount > 0 && (
                          <>
                            <div>
                              <span className="text-gray-600">Precio original:</span>
                              <span className="font-semibold text-gray-900 ml-1">
                                €{couponValidation.discount.originalAmount.toFixed(2)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Descuento:</span>
                              <span className="font-semibold text-red-600 ml-1">
                                -€{couponValidation.discount.discountAmount.toFixed(2)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Precio final:</span>
                              <span className="font-semibold text-green-600 ml-1">
                                €{couponValidation.discount.finalAmount.toFixed(2)}
                              </span>
                            </div>
                          </>
                        )}
                        {couponValidation.discount.freeMonthsGained > 0 && (
                          <div>
                            <span className="text-gray-600">Meses gratis:</span>
                            <span className="font-semibold text-green-600 ml-1">
                              {couponValidation.discount.freeMonthsGained}
                            </span>
                          </div>
                        )}
                        {couponValidation.discount.percentageOff > 0 && (
                          <div>
                            <span className="text-gray-600">Descuento:</span>
                            <span className="font-semibold text-blue-600 ml-1">
                              {couponValidation.discount.percentageOff}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {couponValidation.details && (
                    <div className="text-xs text-green-600 space-y-1">
                      <p>• Usos restantes: {couponValidation.details.usesRemaining}</p>
                      <p>• Tus usos restantes: {couponValidation.details.userUsesRemaining}</p>
                      {couponValidation.details.validUntil && (
                        <p>• Válido hasta: {new Date(couponValidation.details.validUntil).toLocaleDateString()}</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-900">Cupón no válido</h4>
                    <p className="text-sm text-red-700">
                      {couponValidation.error}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Datos Fiscales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Datos de Facturación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900">Información importante</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Incluye tu número de teléfono para que podamos contactarte directamente sobre solicitudes de pago.
                  Esta información ayuda a nuestro equipo a gestionar tus pagos de forma más eficiente.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="w-4 h-4 inline mr-1" />
                Nombre de la empresa (opcional)
              </label>
              <Input
                value={billingData.companyName}
                onChange={(e) => setBillingData({ ...billingData, companyName: e.target.value })}
                placeholder="Tu empresa S.L."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                NIF/CIF
              </label>
              <Input
                value={billingData.vatNumber}
                onChange={(e) => setBillingData({ ...billingData, vatNumber: e.target.value })}
                placeholder="12345678Z"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="text-red-500">*</span> Teléfono de contacto
            </label>
            <Input
              value={billingData.phone}
              onChange={(e) => setBillingData({ ...billingData, phone: e.target.value })}
              placeholder="+34 600 000 000"
              type="tel"
            />
            <p className="text-xs text-gray-500 mt-1">
              Necesario para confirmaciones de pago y comunicación directa
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Dirección de facturación
            </label>
            <Input
              value={billingData.billingAddress}
              onChange={(e) => setBillingData({ ...billingData, billingAddress: e.target.value })}
              placeholder="Calle Principal 123, 1º A"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ciudad
              </label>
              <Input
                value={billingData.billingCity}
                onChange={(e) => setBillingData({ ...billingData, billingCity: e.target.value })}
                placeholder="Madrid"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código postal
              </label>
              <Input
                value={billingData.billingPostalCode}
                onChange={(e) => setBillingData({ ...billingData, billingPostalCode: e.target.value })}
                placeholder="28001"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                País
              </label>
              <Input
                value={billingData.billingCountry}
                onChange={(e) => setBillingData({ ...billingData, billingCountry: e.target.value })}
                placeholder="España"
              />
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
            {saving ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saving ? 'Guardando...' : 'Guardar datos'}
          </Button>
        </CardContent>
      </Card>

      {/* Sistema de Afiliados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gift className="w-5 h-5 mr-2" />
            Programa de Afiliados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
            <h3 className="font-semibold text-purple-900 mb-2">¡Gana dinero refiriendo anfitriones!</h3>
            <p className="text-sm text-purple-700 mb-4">
              Por cada anfitrión que se registre con tu enlace y cree su primera propiedad, ganarás €5. 
              Además, recibirás el 10% de sus pagos mensuales durante 12 meses.
            </p>
            
            {billingData.referralCode && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    Tu código de referido
                  </label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={billingData.referralCode}
                      readOnly
                      className="font-mono"
                    />
                    <Button
                      onClick={copyReferralLink}
                      variant="outline"
                      size="sm"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Comisiones ganadas</h4>
                      <p className="text-sm text-gray-600">Total acumulado</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        €{billingData.affiliateCommission?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Información de Pagos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Euro className="w-5 h-5 mr-2" />
            Formas de Pago
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Métodos de pago disponibles</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Bizum: +34652656440</li>
              <li>• Transferencia bancaria: ES82 0182 0304 8102 0158 7248</li>
              <li>• Las facturas se envían por email el día 1 de cada mes</li>
              <li>• Plazo de pago: 15 días desde la emisión</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Facturas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Mis Facturas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingInvoices ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin w-6 h-6 border-4 border-violet-600 border-t-transparent rounded-full"></div>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay facturas disponibles
              </h3>
              <p className="text-gray-600">
                Las facturas aparecerán aquí una vez que realices tu primer pago
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map((invoice: any) => (
                <div
                  key={invoice.id}
                  className={`border rounded-lg p-4 flex items-center justify-between ${
                    invoice.status === 'PAID' 
                      ? 'border-green-200 bg-green-50' 
                      : invoice.status === 'REJECTED'
                      ? 'border-red-200 bg-red-50'
                      : 'border-orange-200 bg-orange-50'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-mono text-sm font-semibold">
                        {invoice.invoiceNumber}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'PAID'
                          ? 'bg-green-100 text-green-800'
                          : invoice.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {invoice.status === 'PAID' ? 'Pagado' : 
                         invoice.status === 'REJECTED' ? 'Rechazado' : 'Pendiente'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Importe:</span>
                        <span className="font-semibold text-green-600 ml-2">
                          €{Number(invoice.finalAmount).toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Fecha:</span>
                        <span className="ml-2">
                          {new Date(invoice.createdAt).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Vencimiento:</span>
                        <span className="ml-2">
                          {new Date(invoice.dueDate).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>

                    {invoice.status === 'PAID' && invoice.paidDate && (
                      <div className="mt-2 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        Pagado el {new Date(invoice.paidDate).toLocaleDateString('es-ES')}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      onClick={() => viewInvoice(invoice.id)}
                      size="sm"
                      variant="outline"
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver Factura
                    </Button>
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