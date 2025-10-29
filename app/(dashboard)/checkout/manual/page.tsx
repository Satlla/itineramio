'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../../../../src/providers/AuthProvider'
import { ArrowLeft, Check, Upload, Phone, Building2, Image, Loader2, Copy, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { generatePaymentReference } from '../../../../src/lib/property-number-generator'

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic'

function ManualCheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const [loading, setLoading] = useState(false)

  // Get plan details from URL params
  const planCode = searchParams.get('plan') || ''
  const basePrice = parseFloat(searchParams.get('price') || '0')
  const propertyCount = parseInt(searchParams.get('properties') || '1')
  const billingPeriod = searchParams.get('billingPeriod') || 'monthly' // ✅ CRITICAL: Get billing period from URL
  const methodFromURL = searchParams.get('method') as 'BIZUM' | 'TRANSFER' | null

  // Preseleccionar método de pago desde URL o default a BIZUM
  const [paymentMethod, setPaymentMethod] = useState<'BIZUM' | 'TRANSFER'>(methodFromURL || 'BIZUM')
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null)
  const [paymentReference, setPaymentReference] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [billingDataMissing, setBillingDataMissing] = useState(false)
  const [checkingBillingData, setCheckingBillingData] = useState(true)

  // Coupon state
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponError, setCouponError] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)

  // Proration state
  const [prorationData, setProrationData] = useState<any>(null)
  const [loadingProration, setLoadingProration] = useState(true)

  // Calculate final price with proration and coupons
  const prorationCredit = prorationData?.creditAmount || 0
  const priceAfterCoupon = basePrice - couponDiscount
  const finalPrice = prorationData?.hasProration
    ? prorationData.finalPrice - couponDiscount
    : Math.max(0, priceAfterCoupon - prorationCredit)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    if (!planCode || !basePrice) {
      router.push('/pricing-v2')
      return
    }

    // Generate payment reference automatically
    const reference = generatePaymentReference()
    setPaymentReference(reference)

    // Preseleccionar método si viene en URL
    if (methodFromURL && (methodFromURL === 'BIZUM' || methodFromURL === 'TRANSFER')) {
      setPaymentMethod(methodFromURL)
    }

    // Check if billing data is complete
    checkBillingData()

    // Fetch proration data
    fetchProrationData()
  }, [user, planCode, basePrice, router, methodFromURL])

  const checkBillingData = async () => {
    try {
      setCheckingBillingData(true)
      const response = await fetch('/api/user/billing-info', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        const billingInfo = data.billingInfo

        console.log('📋 Checking billing data:', billingInfo)

        // Si no hay billingInfo en absoluto
        if (!billingInfo) {
          console.log('❌ No billing info found')
          setBillingDataMissing(true)
          return
        }

        // Validar que los campos esenciales existan (nuevos campos)
        const hasName = billingInfo.companyName || billingInfo.tradeName || (billingInfo.firstName && billingInfo.lastName)
        const isComplete = hasName &&
                          billingInfo.email &&
                          billingInfo.phone &&
                          billingInfo.address &&
                          billingInfo.city &&
                          billingInfo.postalCode &&
                          billingInfo.country

        console.log('✅ Billing data complete:', isComplete)

        if (!isComplete) {
          console.log('❌ Missing fields:', {
            hasName,
            email: !!billingInfo.email,
            phone: !!billingInfo.phone,
            address: !!billingInfo.address,
            city: !!billingInfo.city,
            postalCode: !!billingInfo.postalCode,
            country: !!billingInfo.country
          })
          setBillingDataMissing(true)
        } else {
          setBillingDataMissing(false)
        }
      } else {
        // Si falla la API, asumir que no hay datos
        console.log('❌ API failed, status:', response.status)
        setBillingDataMissing(true)
      }
    } catch (error) {
      console.error('❌ Error checking billing data:', error)
      setBillingDataMissing(true)
    } finally {
      setCheckingBillingData(false)
    }
  }

  const fetchProrationData = async () => {
    try {
      setLoadingProration(true)
      console.log('🔄 Fetching proration data for checkout...', {
        targetPlanCode: planCode,
        targetBillingPeriod: billingPeriod
      })

      const response = await fetch('/api/billing/preview-proration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          targetPlanCode: planCode,
          targetBillingPeriod: billingPeriod
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Proration data received:', data)
        setProrationData(data)
      } else {
        console.log('ℹ️ No proration available (user may not have active subscription)')
        setProrationData(null)
      }
    } catch (error) {
      console.error('❌ Error fetching proration:', error)
      setProrationData(null)
    } finally {
      setLoadingProration(false)
    }
  }

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Ingresa un código de cupón')
      return
    }

    setValidatingCoupon(true)
    setCouponError('')

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          couponCode: couponCode.toUpperCase(),
          planCode,
          propertyCount
        })
      })

      const data = await response.json()

      if (data.valid) {
        setCouponApplied(true)
        setAppliedCoupon(data.coupon)
        setCouponDiscount(data.discount.discountAmount)
        setFinalPrice(data.discount.finalAmount)
        toast.success(`¡Cupón aplicado! Descuento: €${data.discount.discountAmount.toFixed(2)}`)
      } else {
        setCouponError(data.error || 'Cupón no válido')
        toast.error(data.error || 'Cupón no válido')
      }
    } catch (error) {
      console.error('Error validating coupon:', error)
      setCouponError('Error al validar el cupón')
      toast.error('Error al validar el cupón')
    } finally {
      setValidatingCoupon(false)
    }
  }

  const removeCoupon = () => {
    setCouponCode('')
    setCouponApplied(false)
    setAppliedCoupon(null)
    setCouponDiscount(0)
    setFinalPrice(basePrice)
    setCouponError('')
    toast.success('Cupón eliminado')
  }
  
  const handleFileUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('La imagen debe ser menor a 5MB')
        return
      }
      setPaymentProofFile(file)
    } else {
      toast.error('Por favor selecciona una imagen válida')
    }
  }
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }
  
  const handleSubmit = async () => {
    if (!paymentProofFile) {
      toast.error('Por favor adjunta el justificante de pago')
      return
    }
    
    if (!paymentReference) {
      toast.error('Error generando referencia de pago')
      return
    }
    
    setLoading(true)
    
    try {
      // Upload the payment proof
      const formData = new FormData()
      formData.append('file', paymentProofFile)

      const uploadResponse = await fetch('/api/upload-simple', {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) {
        throw new Error('Error al subir el justificante')
      }

      const uploadResult = await uploadResponse.json()
      const paymentProofUrl = uploadResult.url || uploadResult.existingMedia?.url

      // Prepare request data
      const requestData = {
        planCode: planCode,
        billingPeriod: billingPeriod,
        propertiesCount: propertyCount,
        paymentMethod,
        paymentReference,
        paymentProofUrl,
        totalAmount: finalPrice,
        couponCode: couponApplied ? couponCode.toUpperCase() : null,
        discountAmount: couponDiscount,
        userEmail: user?.email || 'usuario@itineramio.com',
        userName: user?.name || 'Usuario de Itineramio'
      }

      console.log('📤 Sending subscription request:', requestData)

      // Use simple endpoint directly since there are auth issues with the main endpoint
      const response = await fetch('/api/subscription-requests-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('❌ API Error Response:', error)
        console.error('❌ Status:', response.status)
        throw new Error(error.error || error.details || 'Error al procesar la solicitud')
      }

      // Limpiar compra pendiente del localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pendingPurchase')
      }

      setShowSuccess(true)
      toast.success('Solicitud enviada correctamente')

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/main')
      }, 3000)
      
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'Error al procesar el pago')
    } finally {
      setLoading(false)
    }
  }
  
  const getPlanName = (code: string) => {
    const plans: Record<string, string> = {
      'BASIC': 'Basic',
      'HOST': 'Host',
      'SUPERHOST': 'Superhost',
      'BUSINESS': 'Business'
    }
    return plans[code] || code
  }
  
  // Loading state
  if (checkingBillingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verificando datos de facturación...</p>
        </div>
      </div>
    )
  }

  // Billing data missing - redirect to complete it
  if (billingDataMissing) {
    // Guardar intent de compra en localStorage para recuperarlo después
    const purchaseIntent = {
      planCode,
      price: basePrice,
      propertyCount,
      billingPeriod,
      timestamp: Date.now()
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('pendingPurchase', JSON.stringify(purchaseIntent))
    }

    return (
      <div className="min-h-screen bg-gray-50 py-6 sm:py-8 md:py-12">
        <div className="max-w-2xl mx-auto px-3 sm:px-4">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-yellow-100 rounded-full mb-3 sm:mb-4">
                <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Datos de facturación requeridos
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-2">
                Antes de continuar con tu compra, necesitas completar tus datos de facturación.
                Esto es necesario para emitir facturas legalmente válidas según la normativa española.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <p className="text-xs sm:text-sm text-blue-800">
                  <strong>Información de tu compra:</strong><br />
                  Plan {getPlanName(planCode)} - €{basePrice.toFixed(2)}{billingPeriod === 'annual' ? '/año' : billingPeriod === 'biannual' ? '/semestre' : '/mes'}
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <p className="text-xs sm:text-sm text-green-800">
                  ✓ Tu selección de plan se guardará automáticamente<br />
                  ✓ Volverás aquí después de completar tus datos
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                <button
                  onClick={() => router.push('/account/billing?tab=settings&from=checkout')}
                  className="bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  Completar datos de facturación
                </button>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem('pendingPurchase')
                    }
                    router.push('/account/plans')
                  }}
                  className="bg-gray-100 text-gray-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm sm:text-base"
                >
                  Cancelar compra
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 sm:py-8 md:py-12">
        <div className="max-w-2xl mx-auto px-3 sm:px-4">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full mb-3 sm:mb-4">
                <Check className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                ¡Solicitud Enviada!
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 px-2">
                Hemos recibido tu justificante de pago. Lo revisaremos en las próximas 24 horas.
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                Recibirás una confirmación por email cuando tu plan esté activado.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 md:py-12">
      <div className="max-w-2xl mx-auto px-3 sm:px-4">
        <button
          onClick={() => router.push('/account/plans')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 sm:mb-6 text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a planes
        </button>

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
            Completar Pago Manual
          </h1>
          
          {/* Plan Summary */}
          <div className="bg-blue-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
              <div>
                <h2 className="font-semibold text-base sm:text-lg">Plan {getPlanName(planCode)}</h2>
                <p className="text-xs sm:text-sm text-gray-600">Hasta {propertyCount} propiedades</p>
              </div>
              <div className="text-left sm:text-right">
                {prorationData?.hasProration || couponApplied ? (
                  <>
                    <p className="text-xs sm:text-sm text-gray-500 line-through">€{basePrice.toFixed(2)}</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-600">
                      €{finalPrice.toFixed(2)}{billingPeriod === 'annual' ? '/año' : billingPeriod === 'biannual' ? '/semestre' : '/mes'}
                    </p>
                    {prorationCredit > 0 && (
                      <p className="text-xs text-green-600">Crédito prorrateo: -€{prorationCredit.toFixed(2)}</p>
                    )}
                    {couponDiscount > 0 && (
                      <p className="text-xs text-green-600">Descuento cupón: -€{couponDiscount.toFixed(2)}</p>
                    )}
                  </>
                ) : (
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">
                    €{basePrice.toFixed(2)}{billingPeriod === 'annual' ? '/año' : billingPeriod === 'biannual' ? '/semestre' : '/mes'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Proration Details */}
          {prorationData?.hasProration && prorationData.creditAmount > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 text-sm sm:text-base mb-1">
                    Crédito por plan anterior aplicado
                  </h3>
                  <p className="text-xs sm:text-sm text-green-700">
                    Has recibido un crédito de <strong>€{prorationData.creditAmount.toFixed(2)}</strong> por los días no utilizados de tu plan anterior.
                  </p>
                  {prorationData.currentPlan?.daysRemaining && (
                    <p className="text-xs text-green-600 mt-1">
                      ({prorationData.currentPlan.daysRemaining} días restantes de tu plan {prorationData.currentPlan.name})
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Coupon Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Código de cupón
            </h3>

            {!couponApplied ? (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Ingresa tu código de cupón"
                    className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase text-sm sm:text-base"
                    disabled={validatingCoupon}
                  />
                  <button
                    onClick={validateCoupon}
                    disabled={validatingCoupon || !couponCode.trim()}
                    className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 whitespace-nowrap text-sm sm:text-base"
                  >
                    {validatingCoupon ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Validando...
                      </>
                    ) : (
                      'Aplicar'
                    )}
                  </button>
                </div>

                {couponError && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{couponError}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <p className="font-semibold text-green-900">
                        Cupón aplicado: {appliedCoupon.code}
                      </p>
                    </div>
                    <p className="text-sm text-green-700 mb-1">
                      {appliedCoupon.discountType === 'PERCENTAGE'
                        ? `${appliedCoupon.discountValue}% de descuento`
                        : `€${appliedCoupon.discountValue} de descuento`}
                    </p>
                    <p className="text-xs text-green-600">
                      Total con descuento: €{finalPrice.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Payment Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <h3 className="font-semibold mb-3 text-sm sm:text-base">Instrucciones de Pago:</h3>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="font-medium">Para Bizum:</div>
              <div className="pl-2 sm:pl-4 space-y-1">
                <p>Teléfono: <span className="font-mono font-bold">+34 652 656 440</span></p>
                <p className="break-all">Concepto: <span className="font-mono font-bold">Pago Suscripción {paymentReference}</span></p>
              </div>

              <div className="font-medium mt-3">Para Transferencia:</div>
              <div className="pl-2 sm:pl-4 space-y-1">
                <p className="break-all">IBAN: <span className="font-mono text-[10px] sm:text-xs">ES82 0182 0304 8102 0158 7248</span></p>
                <p>Beneficiario: Itineramio S.L.</p>
                <p className="break-all">Concepto: <span className="font-mono font-bold">Pago Suscripción {paymentReference}</span></p>
              </div>
            </div>
          </div>
          
          {/* Payment Method Selection */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-3">
              Método de pago utilizado
            </label>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <button
                onClick={() => setPaymentMethod('BIZUM')}
                className={`p-3 sm:p-4 border-2 rounded-lg transition-all ${
                  paymentMethod === 'BIZUM'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Phone className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-blue-600" />
                <p className="font-semibold text-sm sm:text-base">Bizum</p>
              </button>

              <button
                onClick={() => setPaymentMethod('TRANSFER')}
                className={`p-3 sm:p-4 border-2 rounded-lg transition-all ${
                  paymentMethod === 'TRANSFER'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-blue-600" />
                <p className="font-semibold text-sm sm:text-base">Transferencia</p>
              </button>
            </div>
          </div>
          
          {/* Payment Reference Display */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Tu referencia de pago
            </label>
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-base sm:text-lg font-bold text-gray-900 break-all">{paymentReference}</p>
                <p className="text-xs sm:text-sm text-gray-600">Usa esta referencia como concepto en tu pago</p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`Pago Suscripción ${paymentReference}`)
                  toast.success('Concepto copiado al portapapeles')
                }}
                className="flex items-center justify-center gap-2 px-3 py-1.5 sm:py-1 text-xs sm:text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors flex-shrink-0 w-full sm:w-auto"
              >
                <Copy className="w-4 h-4" />
                Copiar
              </button>
            </div>
          </div>
          
          {/* File Upload */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Justificante de pago *
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-4 sm:p-6 md:p-8 text-center transition-all ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              } ${paymentProofFile ? 'bg-green-50 border-green-300' : ''}`}
            >
              {paymentProofFile ? (
                <div className="space-y-2">
                  <Image className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-green-600" />
                  <p className="font-semibold text-green-600 text-sm sm:text-base break-all px-2">{paymentProofFile.name}</p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {(paymentProofFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    onClick={() => setPaymentProofFile(null)}
                    className="text-red-500 hover:text-red-700 text-xs sm:text-sm"
                  >
                    Eliminar archivo
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-400 mb-2 sm:mb-3" />
                  <p className="text-gray-600 mb-2 text-xs sm:text-sm px-2">
                    Arrastra tu justificante aquí o haz clic para seleccionar
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0])
                      }
                    }}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer text-xs sm:text-sm"
                  >
                    Seleccionar archivo
                  </label>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-2">
                    Solo imágenes (JPG, PNG) - Máximo 5MB
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading || !paymentProofFile}
            className="w-full py-2.5 sm:py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center text-sm sm:text-base"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Enviar Justificante
              </>
            )}
          </button>

          <p className="text-[10px] sm:text-xs text-gray-500 text-center mt-3 sm:mt-4">
            Tu solicitud será revisada en menos de 24 horas
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ManualCheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <ManualCheckoutContent />
    </Suspense>
  )
}