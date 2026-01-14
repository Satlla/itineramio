'use client'

import React, { useState, useEffect } from 'react'
import { X, CreditCard, Building2, Smartphone, Upload, Check, Loader2, AlertCircle, Info, Copy } from 'lucide-react'
import { toast } from 'react-hot-toast'

type PaymentMethod = 'bizum' | 'transfer' | 'stripe'

interface PaymentMethodModalProps {
  isOpen: boolean
  onClose: () => void
  planDetails: {
    code: string
    name: string
    price: number
    properties: number
    billingPeriod: string
    priceId?: string
    // Proration data
    hasProration?: boolean
    proratedAmount?: number
    daysRemaining?: number
    creditAmount?: number
    // Plan features
    features: string[]
    maxProperties: number
    monthlyPrice: number
    // Coupon data
    couponCode?: string | null
    couponDiscountType?: string | null
    couponDiscountValue?: number | null
    couponDiscountAmount?: number | null
  }
}

/**
 * Genera un código alfanumérico aleatorio de 6 caracteres
 * Solo usa caracteres fáciles de leer (sin O/0, I/1 para evitar confusión)
 */
function generateRandomCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ' // Sin O, I, 0, 1
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

function generatePaymentReference(): string {
  return `PAY-${generateRandomCode()}`
}

export default function PaymentMethodModal({ isOpen, onClose, planDetails }: PaymentMethodModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('stripe')
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [paymentReference, setPaymentReference] = useState<string>('')

  // Generate payment reference when modal opens
  useEffect(() => {
    if (isOpen && !paymentReference) {
      setPaymentReference(generatePaymentReference())
    }
  }, [isOpen, paymentReference])

  if (!isOpen) return null

  const handleCopyReference = () => {
    navigator.clipboard.writeText(paymentReference)
    toast.success('Referencia copiada al portapapeles', { icon: '📋' })
  }

  const getBillingPeriodText = (period: string) => {
    switch (period.toLowerCase()) {
      case 'monthly':
        return 'Mensual'
      case 'semiannual':
      case 'semestral':
        return 'Semestral'
      case 'annual':
      case 'yearly':
        return 'Anual'
      default:
        return period
    }
  }

  const getBillingPeriodMonths = (period: string) => {
    switch (period.toLowerCase()) {
      case 'monthly':
        return 1
      case 'semiannual':
      case 'semestral':
        return 6
      case 'annual':
      case 'yearly':
        return 12
      default:
        return 1
    }
  }

  const getDiscountPercentage = (period: string) => {
    switch (period.toLowerCase()) {
      case 'semiannual':
      case 'semestral':
        return 10
      case 'annual':
      case 'yearly':
        return 20
      default:
        return 0
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
      if (!validTypes.includes(file.type)) {
        toast.error('Solo se permiten imágenes (JPG, PNG, WEBP) o PDF')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('El archivo no puede superar 5MB')
        return
      }

      setPaymentProof(file)
    }
  }

  const handleSubmit = async () => {
    // Validate payment proof for manual methods
    if ((selectedMethod === 'bizum' || selectedMethod === 'transfer') && !paymentProof) {
      toast.error('Debes adjuntar el comprobante de pago')
      return
    }

    setProcessing(true)

    try {
      // If Stripe, redirect to Stripe Checkout
      if (selectedMethod === 'stripe') {
        try {
          // Map billing period to backend format
          const periodMap: Record<string, string> = {
            'monthly': 'MONTHLY',
            'semiannual': 'SEMESTRAL',
            'annual': 'YEARLY'
          }
          const backendPeriod = periodMap[planDetails.billingPeriod.toLowerCase()] || 'MONTHLY'

          const response = await fetch('/api/stripe/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              planCode: planDetails.code,
              billingPeriod: backendPeriod,
              // Send proration data if exists
              hasProration: planDetails.hasProration,
              proratedAmount: planDetails.proratedAmount,
              originalPrice: planDetails.price,
              // Send coupon data if exists
              couponCode: planDetails.couponCode,
              couponDiscountAmount: planDetails.couponDiscountAmount
            })
          })

          const data = await response.json()

          if (!response.ok) {
            if (data.requiresSetup) {
              toast.error('Stripe no está configurado. Por favor, usa otro método de pago.')
            } else {
              toast.error(data.error || 'Error al crear sesión de pago')
            }
            setProcessing(false)
            return
          }

          if (data.url) {
            // Redirect to Stripe Checkout
            window.location.href = data.url
          } else {
            toast.error('Error: No se recibió URL de pago')
            setProcessing(false)
          }
          return
        } catch (error) {
          console.error('Stripe checkout error:', error)
          toast.error('Error al conectar con Stripe')
          setProcessing(false)
          return
        }
      }

      // Upload payment proof first
      let proofUrl = ''
      if (paymentProof) {
        setUploading(true)
        const formData = new FormData()
        formData.append('file', paymentProof)
        formData.append('context', 'payment-proof')

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          credentials: 'include',
          body: formData
        })

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          // Handle both normal upload and duplicate detection
          proofUrl = uploadData.duplicate ? uploadData.existingMedia.url : uploadData.url
        } else {
          throw new Error('Error al subir el comprobante de pago')
        }
        setUploading(false)
      }

      // Create subscription request
      const response = await fetch('/api/subscription-requests', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          planCode: planDetails.code,
          billingPeriod: planDetails.billingPeriod,
          properties: planDetails.properties,
          paymentMethod: selectedMethod,
          paymentReference: paymentReference, // Include payment reference
          amount: planDetails.hasProration ? planDetails.proratedAmount : planDetails.price,
          paymentProofUrl: proofUrl,
          prorationData: planDetails.hasProration ? {
            daysRemaining: planDetails.daysRemaining,
            creditAmount: planDetails.creditAmount,
            originalAmount: planDetails.price
          } : null
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('¡Solicitud enviada correctamente!', {
          duration: 5000,
          icon: '✅'
        })

        toast.success('Recibirás confirmación en 24-48 horas', {
          duration: 8000,
          icon: '📧'
        })

        // Close modal and redirect
        onClose()
        setTimeout(() => {
          window.location.href = '/subscription-success?method=' + selectedMethod
        }, 1000)
      } else {
        // Mostrar error principal
        toast.error(data.error || 'Error al crear la solicitud', {
          duration: 6000
        })

        // Si hay detalles adicionales, mostrarlos también
        if (data.details) {
          toast.error(data.details, {
            duration: 8000,
            icon: 'ℹ️'
          })
        }

        // Si hay hint, mostrarlo como info
        if (data.hint) {
          toast(data.hint, {
            duration: 10000,
            icon: '💡'
          })
        }
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al procesar el pago')
    } finally {
      setProcessing(false)
      setUploading(false)
    }
  }

  // Calculate breakdown
  const months = getBillingPeriodMonths(planDetails.billingPeriod)
  const discount = getDiscountPercentage(planDetails.billingPeriod)
  const basePrice = planDetails.monthlyPrice * months
  const discountAmount = basePrice * (discount / 100)
  const finalPrice = planDetails.hasProration ? planDetails.proratedAmount || planDetails.price : planDetails.price

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl max-w-[95vw] sm:max-w-[95vw] sm:max-w-[90vw] sm:max-w-[90vw] sm:max-w-sm md:max-w-md md:max-w-lg md:max-w-xl md:max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-3 sm:px-4 md:px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">Método de Pago</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-3 sm:p-4 md:p-6 space-y-6">
          {/* Total Amount - Simplified */}
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-200 rounded-xl p-3 sm:p-4 md:p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Plan {planDetails.name} • {getBillingPeriodText(planDetails.billingPeriod)}
              </p>
              <p className="text-lg font-semibold text-gray-900 mb-1">
                Total a pagar hoy <span className="text-xs font-medium text-gray-600">(IVA inc.)</span>
              </p>
              <p className="text-4xl font-bold text-violet-600">€{finalPrice.toFixed(2)}</p>
              {months > 1 && (
                <p className="text-sm text-gray-600 mt-2">
                  Equivalente a €{(finalPrice / months).toFixed(2)}/mes
                </p>
              )}
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Selecciona el método de pago</h3>

            <div className="space-y-3">
              {/* Stripe - Tarjeta (First option) */}
              <button
                onClick={() => setSelectedMethod('stripe')}
                className={`w-full p-5 rounded-xl border-2 transition-all text-left ${
                  selectedMethod === 'stripe'
                    ? 'border-violet-600 bg-violet-50 ring-2 ring-violet-100'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      selectedMethod === 'stripe' ? 'bg-violet-600' : 'bg-gray-100'
                    }`}>
                      <CreditCard className={`w-6 h-6 ${
                        selectedMethod === 'stripe' ? 'text-white' : 'text-gray-900'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-semibold text-gray-900">Tarjeta de crédito/débito</h4>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                          Recomendado
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Visa, Mastercard, American Express</p>
                      <p className="text-xs text-gray-500 mt-2">Pago seguro con Stripe · Activación inmediata</p>
                    </div>
                  </div>
                  {selectedMethod === 'stripe' && (
                    <Check className="w-6 h-6 text-violet-600 flex-shrink-0 mt-1" />
                  )}
                </div>
              </button>

              {/* Bizum */}
              <button
                onClick={() => setSelectedMethod('bizum')}
                className={`w-full p-5 rounded-xl border-2 transition-all text-left ${
                  selectedMethod === 'bizum'
                    ? 'border-violet-600 bg-violet-50 ring-2 ring-violet-100'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      selectedMethod === 'bizum' ? 'bg-violet-600' : 'bg-gray-100'
                    }`}>
                      <Smartphone className={`w-6 h-6 ${
                        selectedMethod === 'bizum' ? 'text-white' : 'text-gray-900'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-gray-900">Bizum</h4>
                      <p className="text-sm text-gray-600 mt-1">Pago rápido desde tu móvil</p>
                      <p className="text-sm font-medium text-violet-600 mt-2">+34 652 656 440</p>

                      {/* Referencia de pago */}
                      {selectedMethod === 'bizum' && paymentReference && (
                        <div className="mt-3 p-3 bg-amber-50 border-2 border-amber-300 rounded-lg">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="text-xs font-semibold text-amber-900 mb-1">
                                ⚠️ CONCEPTO OBLIGATORIO:
                              </p>
                              <p className="text-lg font-mono font-bold text-amber-900">
                                {paymentReference}
                              </p>
                              <p className="text-xs text-amber-800 mt-1">
                                Escribe exactamente este código en el concepto del Bizum
                              </p>
                            </div>
                            <div
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCopyReference()
                              }}
                              className="p-2 bg-amber-200 hover:bg-amber-300 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                              title="Copiar referencia"
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.stopPropagation()
                                  handleCopyReference()
                                }
                              }}
                            >
                              <Copy className="w-4 h-4 text-amber-900" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedMethod === 'bizum' && (
                    <Check className="w-6 h-6 text-violet-600 flex-shrink-0 mt-1" />
                  )}
                </div>
              </button>

              {/* Bank Transfer */}
              <button
                onClick={() => setSelectedMethod('transfer')}
                className={`w-full p-5 rounded-xl border-2 transition-all text-left ${
                  selectedMethod === 'transfer'
                    ? 'border-violet-600 bg-violet-50 ring-2 ring-violet-100'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      selectedMethod === 'transfer' ? 'bg-violet-600' : 'bg-gray-100'
                    }`}>
                      <Building2 className={`w-6 h-6 ${
                        selectedMethod === 'transfer' ? 'text-white' : 'text-gray-900'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-gray-900">Transferencia Bancaria</h4>
                      <p className="text-sm text-gray-600 mt-1">Pago mediante SEPA</p>
                      <p className="text-sm font-mono text-violet-600 mt-2">ES82 0182 0304 8102 0158 7248</p>

                      {/* Referencia de pago */}
                      {selectedMethod === 'transfer' && paymentReference && (
                        <div className="mt-3 p-3 bg-amber-50 border-2 border-amber-300 rounded-lg">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="text-xs font-semibold text-amber-900 mb-1">
                                ⚠️ CONCEPTO OBLIGATORIO:
                              </p>
                              <p className="text-lg font-mono font-bold text-amber-900">
                                {paymentReference}
                              </p>
                              <p className="text-xs text-amber-800 mt-1">
                                Escribe exactamente este código en el concepto de la transferencia
                              </p>
                            </div>
                            <div
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCopyReference()
                              }}
                              className="p-2 bg-amber-200 hover:bg-amber-300 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                              title="Copiar referencia"
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.stopPropagation()
                                  handleCopyReference()
                                }
                              }}
                            >
                              <Copy className="w-4 h-4 text-amber-900" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedMethod === 'transfer' && (
                    <Check className="w-6 h-6 text-violet-600 flex-shrink-0 mt-1" />
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Upload Payment Proof - Only for manual methods */}
          {(selectedMethod === 'bizum' || selectedMethod === 'transfer') && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
              <div className="flex items-start gap-3 mb-4">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Adjunta el comprobante de pago</h4>
                  <p className="text-sm text-blue-800">
                    Una vez realices el pago, adjunta una captura de pantalla o PDF del comprobante.
                    Tu cuenta se activará en 24-48 horas tras verificar el pago.
                  </p>
                </div>
              </div>

              <label className="block">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className={`border-2 border-dashed rounded-lg p-3 sm:p-4 md:p-6 text-center cursor-pointer transition-all ${
                  paymentProof
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-violet-500 bg-white'
                }`}>
                  {paymentProof ? (
                    <div className="flex items-center justify-center gap-3">
                      <Check className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-900">{paymentProof.name}</p>
                        <p className="text-sm text-green-700">
                          {(paymentProof.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                      <p className="font-medium text-gray-900">Haz clic para seleccionar un archivo</p>
                      <p className="text-sm text-gray-600 mt-1">
                        JPG, PNG, WEBP o PDF (máx. 5MB)
                      </p>
                    </div>
                  )}
                </div>
              </label>
            </div>
          )}

          {/* Activation Time Warning */}
          {(selectedMethod === 'bizum' || selectedMethod === 'transfer') && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">
                    Tiempo de activación: 24-48 horas laborables
                  </p>
                  <p className="text-xs text-yellow-800 mt-1">
                    Verificaremos tu pago y activaremos tu suscripción lo antes posible. Recibirás un email de confirmación.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-3 sm:px-4 md:px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all"
              disabled={processing || uploading}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={processing || uploading || (selectedMethod !== 'stripe' && !paymentProof)}
              className="flex-1 px-3 sm:px-4 md:px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Subiendo comprobante...
                </>
              ) : processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  Confirmar y Pagar
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-center text-gray-600">
            Al confirmar, aceptas nuestros términos de servicio y política de privacidad
          </p>
        </div>
      </div>
    </div>
  )
}
