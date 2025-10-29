'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Crown,
  Check,
  CreditCard,
  Building2,
  Plus,
  Minus,
  TrendingUp
} from 'lucide-react'
import { useAuth } from '../../../../src/providers/AuthProvider'
import { VISIBLE_PLANS as PLANS, pricePerProperty, PLAN_THRESHOLDS, getPlan } from '../../../../src/config/plans'
import { planForPropertyCount } from '../../../../src/lib/select-plan'
import { UpgradeMarketingModal } from '../../../../src/components/billing/UpgradeMarketingModal'
import { StripeCheckoutButton } from '../../../../src/components/stripe/StripeCheckoutButton'
import { PricingCalculator } from '../../../../src/lib/pricing-calculator'

// Payment Links con descuentos anuales
const annualPaymentLinks = {
  'BASIC': {
    '6_months': 'https://buy.stripe.com/5kQ5kE81PffHfUn4yyfQI06',
    '12_months': 'https://buy.stripe.com/5kQ6oI2Hv5F7bE72qqfQI07'
  },
  'HOST': {
    '6_months': 'https://buy.stripe.com/4gMaEY81P9Vn37B1mmfQI08',
    '12_months': 'https://buy.stripe.com/bJe14oa9XgjLaA39SSfQI09'
  },
  'SUPERHOST': {
    '6_months': 'https://buy.stripe.com/7sY3cweqdebDbE7fdcfQI0a',
    '12_months': 'https://buy.stripe.com/aFa7sM6XL9VnfUn0iifQI0b'
  },
  'MANAGER': {
    '6_months': 'https://buy.stripe.com/fZucN695T5F7eQj3uufQI0c',
    '12_months': 'https://buy.stripe.com/cNi4gA0zn5F7fUn6GGfQI0d'
  },
  'BUSINESS': {
    '6_months': 'https://buy.stripe.com/14A3cwa9Xd7zbE7fdcfQI0e',
    '12_months': 'https://buy.stripe.com/eVq14ogylaZrdMf5CCfQI0f'
  }
};

export default function PlansPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [loading, setLoading] = useState(false)
  const [showDemoSuccess, setShowDemoSuccess] = useState(false)
  const [isRealStripeSuccess, setIsRealStripeSuccess] = useState(false)
  
  // Estado del contador de propiedades
  const [propertyCount, setPropertyCount] = useState(1)
  const [currentUserProperties, setCurrentUserProperties] = useState(0)
  const [totalSubscribedSlots, setTotalSubscribedSlots] = useState(0)
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[number] | null>(null)

  // Estado del modal de marketing
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradePreview, setUpgradePreview] = useState<any>(null)
  const [currentUserPlan, setCurrentUserPlan] = useState('BASIC')
  const [currentBillingPeriod, setCurrentBillingPeriod] = useState<'monthly' | 'biannual' | 'annual'>('monthly')
  
  // Estado del trial
  const [inTrial, setInTrial] = useState(false)
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null)

  // Estado del pago manual
  const [showManualPayment, setShowManualPayment] = useState(false)
  const [manualPaymentInfo, setManualPaymentInfo] = useState<{plan: string, amount: string} | null>(null)
  const [trialTimeLeft, setTrialTimeLeft] = useState<string>('')

  // Estado del período de facturación
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | '6_months' | '12_months'>('monthly')

  useEffect(() => {
    // Don't redirect if still loading auth
    if (authLoading) {
      return
    }
    
    if (!user) {
      router.push('/login')
      return
    }
    
    const urlParams = new URLSearchParams(window.location.search)
    
    // Verificar si viene de un checkout real exitoso de Stripe
    if (urlParams.get('success') === '1') {
      setShowDemoSuccess(true)
      setIsRealStripeSuccess(true)
      
      // Mostrar mensaje de éxito por 7 segundos para compra real
      setTimeout(() => {
        setShowDemoSuccess(false)
        setIsRealStripeSuccess(false)
        // Limpiar URL
        router.replace('/account/plans')
      }, 7000)
    }
    // Verificar si viene de un checkout demo exitoso
    else if (urlParams.get('demo_success') === '1') {
      setShowDemoSuccess(true)
      setIsRealStripeSuccess(false)
      const plan = urlParams.get('plan')
      const price = urlParams.get('price')

      // Mostrar mensaje de éxito demo por 3 segundos
      setTimeout(() => {
        setShowDemoSuccess(false)
        // Limpiar URL
        router.replace('/account/plans')
      }, 3000)
    }
    // Verificar si viene de un pago manual (fallback de Stripe)
    else if (urlParams.get('payment') === 'manual') {
      const plan = urlParams.get('plan')
      const amount = urlParams.get('amount')

      if (plan && amount) {
        setShowManualPayment(true)
        setManualPaymentInfo({ plan, amount })

        // Auto-cerrar después de 10 segundos
        setTimeout(() => {
          setShowManualPayment(false)
          setManualPaymentInfo(null)
          router.replace('/account/plans')
        }, 10000)
      }
    }
    
    // Cargar estado actual del usuario
    loadUserPlanInfo()
  }, [user, router, authLoading])

  const loadUserPlanInfo = async () => {
    try {
      const response = await fetch('/api/billing/plan-limits')
      if (response.ok) {
        const data = await response.json()
        setCurrentUserProperties(data.currentProperties)
        setCurrentUserPlan(data.planCode)
        setTotalSubscribedSlots(data.totalSubscribedSlots || 0)

        // ✅ GUARDAR billing period actual del usuario
        const userBillingPeriod = data.billingPeriod || 'monthly'
        setCurrentBillingPeriod(userBillingPeriod)

        // ✅ Inicializar selector con el período actual del usuario
        if (userBillingPeriod === 'biannual') {
          setBillingPeriod('6_months')
        } else if (userBillingPeriod === 'annual') {
          setBillingPeriod('12_months')
        } else {
          setBillingPeriod('monthly')
        }

        // Información del trial
        setInTrial(data.inTrial || false)
        setTrialEndsAt(data.trialEndsAt || null)

        // Usar el total de slots suscritos como punto de partida
        // Esto suma todas las suscripciones activas del usuario
        const startingCount = data.totalSubscribedSlots || data.currentProperties || 1

        // Si el usuario tiene suscripciones activas, empezar desde el total de slots suscritos
        // Esto permite que vea planes para agregar MÁS propiedades a las que ya tiene suscritas
        setPropertyCount(Math.max(startingCount, 1))

        // CORRECCIÓN: Solo preseleccionar plan si el usuario TIENE un plan activo
        // Si planCode es 'NONE' significa que no tiene plan y debe elegir uno
        if (data.planCode !== 'NONE' && data.planCode !== 'TRIAL') {
          // Usuario con plan activo: seleccionar plan apropiado para el contador
          const planCode = planForPropertyCount(startingCount)
          setSelectedPlan(getPlan(planCode))
        } else {
          // Usuario SIN plan activo (planCode='NONE') o trial expirado:
          // NO preseleccionar ningún plan - dejar que elija libremente
          setSelectedPlan(null)
          console.log('⚠️ Usuario sin plan activo, NO preseleccionar ningún plan')
        }
      }
    } catch (error) {
      console.error('Error loading user plan info:', error)
    }
  }

  // Actualizar plan seleccionado cuando cambia el contador
  useEffect(() => {
    // SOLO auto-seleccionar si el usuario YA tiene un plan activo
    // Si no tiene plan (currentUserPlan === 'NONE'), dejar que elija manualmente
    if (currentUserPlan && currentUserPlan !== 'NONE' && currentUserPlan !== 'TRIAL') {
      const newPlanCode = planForPropertyCount(propertyCount)
      const newPlan = getPlan(newPlanCode)
      setSelectedPlan(newPlan)
    }
    // Si no tiene plan activo, NO auto-seleccionar nada
  }, [propertyCount, currentUserPlan])

  // Cuenta atrás del trial en tiempo real
  useEffect(() => {
    if (!inTrial || !trialEndsAt) {
      setTrialTimeLeft('')
      return
    }

    const updateTrialTimeLeft = () => {
      const now = new Date()
      const endDate = new Date(trialEndsAt)
      const timeLeft = endDate.getTime() - now.getTime()

      if (timeLeft <= 0) {
        setTrialTimeLeft('Trial expirado')
        setInTrial(false)
        return
      }

      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24))
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
      
      if (days > 0) {
        setTrialTimeLeft(`${days} días y ${hours} horas`)
      } else if (hours > 0) {
        setTrialTimeLeft(`${hours} horas y ${minutes} minutos`)
      } else {
        setTrialTimeLeft(`${minutes} minutos`)
      }
    }

    updateTrialTimeLeft()
    const interval = setInterval(updateTrialTimeLeft, 60000) // Actualizar cada minuto

    return () => clearInterval(interval)
  }, [inTrial, trialEndsAt])

  const handleThresholdCrossed = async (newPlan: typeof PLANS[number]) => {
    // Verificar si es un upgrade válido
    try {
      const response = await fetch(
        `/api/billing/upgrade?from=${currentUserPlan}&to=${newPlan.code}&totalProps=${propertyCount}`
      )
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.validation.isValid) {
          setUpgradePreview(data.preview)
          setShowUpgradeModal(true)
        }
      }
    } catch (error) {
      console.error('Error checking upgrade:', error)
    }
  }

  const handleCounterChange = (delta: number) => {
    // No permitir bajar por debajo de los slots ya suscritos
    const minCount = Math.max(totalSubscribedSlots, 1)
    const newCount = Math.max(minCount, Math.min(100, propertyCount + delta))
    setPropertyCount(newCount)
  }

  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false)
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<typeof PLANS[number] | null>(null)

  const handlePlanAction = async (plan: typeof PLANS[number]) => {
    // ✅ PERMITIR UPGRADE DE PERÍODO: Convertir billing periods para comparación
    const currentPeriodNormalized = currentBillingPeriod === 'biannual' ? '6_months' : currentBillingPeriod === 'annual' ? '12_months' : 'monthly'

    // Si es el plan actual con el mismo número de propiedades Y mismo billing period, no hacer nada
    if (selectedPlan && plan.code === selectedPlan.code && propertyCount === currentUserProperties && billingPeriod === currentPeriodNormalized) {
      return
    }

    // ✅ CASO ESPECIAL: Si el plan es el mismo pero cambia el período → Extender suscripción
    if (selectedPlan && plan.code === selectedPlan.code && billingPeriod !== currentPeriodNormalized) {
      console.log('🔄 PERIOD UPGRADE: Same plan, different billing period', {
        currentPlan: plan.code,
        from: currentPeriodNormalized,
        to: billingPeriod
      })
      // TODO: Crear endpoint para extender período de suscripción existente
    }

    // Guardar plan seleccionado y mostrar opciones de pago
    setSelectedPlanForPayment(plan)
    setShowPaymentMethodModal(true)
  }

  const handleManualPayment = async (plan: typeof PLANS[number]) => {
    setLoading(true)
    
    try {
      // Activar suscripción automáticamente
      const response = await fetch('/api/subscriptions/activate-manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planCode: plan.code,
          propertyCount: propertyCount
        })
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        // Mostrar mensaje de éxito
        alert(`✅ ${data.message}\n\nAhora puedes gestionar hasta ${data.subscription.maxProperties} propiedades.`)
        
        // Redirigir a propiedades
        router.push('/properties')
      } else {
        alert('Error activando el plan: ' + (data.error || 'Intenta de nuevo'))
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error activando el plan. Por favor, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleStripeCheckout = async (plan: typeof PLANS[number]) => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: propertyCount, // Número de propiedades del contador
          planCode: plan.code,
          successUrl: window.location.origin + '/properties',
          cancelUrl: window.location.origin + '/account/plans'
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        // Si es error 503, Stripe no está configurado
        if (response.status === 503 && data.instructions) {
          console.error('❌ Stripe no configurado. Instrucciones:')
          data.instructions.forEach((instruction: string) => console.log(instruction))
          alert('⚠️ Stripe no está configurado.\n\nRevisa la consola del navegador para ver las instrucciones de configuración.')
          return
        }

        // Si es error 500 (conexión), intentar fallback automático
        if (response.status === 500) {
          console.log('🔄 Checkout falló, intentando fallback automático...')
          try {
            const fallbackResponse = await fetch('/api/stripe/checkout-fallback', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                planCode: plan.code
              })
            })

            const fallbackData = await fallbackResponse.json()

            if (fallbackResponse.ok && fallbackData.success && fallbackData.url) {
              console.log('✅ Fallback exitoso, redirigiendo a payment link')
              window.location.href = fallbackData.url
              return
            } else {
              console.error('❌ Fallback también falló:', fallbackData.error)
            }
          } catch (fallbackError) {
            console.error('❌ Error en fallback:', fallbackError)
          }
        }

        alert('Error: ' + (data.error || 'Error desconocido'))
        return
      }
      
      if (data.success && data.url) {
        if (data.demo) {
          console.log('🧪 MODO DEMO: Redirigiendo a página de confirmación sin pago real')
        }
        window.location.href = data.url
      } else {
        alert('Función de pago no disponible: ' + (data.error || 'Contacta con soporte'))
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error conectando con el sistema de pagos')
    } finally {
      setLoading(false)
    }
  }

  const handleSimulatePayment = async (planCode: string) => {
    setLoading(true)

    try {
      console.log('🧪 SIMULATION: Starting payment simulation for plan:', planCode)

      const response = await fetch('/api/debug/simulate-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planCode: planCode
        })
      })

      const data = await response.json()

      if (!response.ok) {
        alert('Error en simulación: ' + (data.error || 'Error desconocido'))
        return
      }

      if (data.success) {
        console.log('✅ SIMULATION: Payment simulation successful!')

        // Mostrar éxito y redirigir a página de éxito
        alert(`🧪 ¡Simulación exitosa!\n\nPlan: ${planCode}\nPrecio: €${data.price}/mes\n\nRevisa tu email y ve al dashboard para verificar que todo funciona.`)

        // Redirigir a página de éxito con parámetro de simulación
        router.push(`/subscription-success?plan=${planCode}&simulation=true`)
      } else {
        alert('Error en simulación: ' + (data.error || 'Error desconocido'))
      }
    } catch (error) {
      console.error('Error en simulación:', error)
      alert('Error de conexión durante la simulación')
    } finally {
      setLoading(false)
    }
  }

  // Funciones para calcular precios con descuentos
  const calculateDiscountedPrice = (monthlyPrice: number, billingPeriod: '6_months' | '12_months') => {
    const months = billingPeriod === '6_months' ? 6 : 12;
    const discount = billingPeriod === '6_months' ? 0.1 : 0.2; // 10% o 20%
    const totalWithoutDiscount = monthlyPrice * months;
    const totalWithDiscount = Math.round(totalWithoutDiscount * (1 - discount));
    const savings = totalWithoutDiscount - totalWithDiscount;

    return {
      total: totalWithDiscount,
      savings,
      monthlyEquivalent: totalWithDiscount / months,
      discount: Math.round(discount * 100)
    };
  };

  // Función para obtener el precio según el período de facturación
  const getPriceForBillingPeriod = (monthlyPrice: number) => {
    if (billingPeriod === 'monthly') {
      return {
        displayPrice: monthlyPrice,
        totalPrice: monthlyPrice,
        savings: 0,
        discount: 0,
        period: '/mes'
      };
    } else {
      const discounted = calculateDiscountedPrice(monthlyPrice, billingPeriod);
      return {
        displayPrice: Math.round(discounted.monthlyEquivalent),
        totalPrice: discounted.total,
        savings: discounted.savings,
        discount: discounted.discount,
        period: billingPeriod === '6_months' ? '/mes (6 meses)' : '/mes (12 meses)'
      };
    }
  };

  const handleAnnualPayment = async (planCode: string, billingPeriod: '6_months' | '12_months') => {
    setLoading(true);

    try {
      // PASO 1: Crear subscription request en la base de datos ANTES de redirigir a Stripe
      const response = await fetch('/api/subscriptions/create-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planCode,
          billingPeriod: billingPeriod === '6_months' ? 'biannual' : 'annual',
          propertyCount: propertyCount,
          paymentMethod: 'STRIPE_PAYMENT_LINK'
        })
      });

      if (!response.ok) {
        const data = await response.json();
        alert('Error creando solicitud: ' + (data.error || 'Intenta de nuevo'));
        return;
      }

      // PASO 2: Redirigir a Stripe Payment Link
      const paymentUrl = annualPaymentLinks[planCode as keyof typeof annualPaymentLinks]?.[billingPeriod];
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        alert('Payment link not available for this plan and billing period');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error procesando pago. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar el pago según el billing period seleccionado
  const handlePaymentForSelectedPeriod = (planCode: string) => {
    if (billingPeriod === 'monthly') {
      // Usar el StripeCheckoutButton existente para pagos mensuales
      return true; // Permitir que el StripeCheckoutButton maneje esto
    } else {
      // Usar Payment Links para pagos anuales
      handleAnnualPayment(planCode, billingPeriod);
      return false; // Evitar que el StripeCheckoutButton procese
    }
  };

  const getPlanCardColor = (plan: typeof PLANS[number]) => {
    if (selectedPlan && plan.code === selectedPlan.code) {
      return 'ring-2 ring-blue-500 bg-blue-50 border-blue-200'
    }
    return 'border-gray-200 hover:border-gray-300'
  }

  const getPlanBadgeColor = (plan: typeof PLANS[number]) => {
    switch (plan.code) {
      case 'BASIC': return 'bg-blue-100 text-blue-800'
      case 'HOST': return 'bg-emerald-100 text-emerald-800'
      case 'SUPERHOST': return 'bg-orange-100 text-orange-800'
      case 'MANAGER': return 'bg-violet-100 text-violet-800'
      case 'BUSINESS': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner de modo demo si Stripe no está configurado */}
        {process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && (
          <div className="mb-8 p-4 bg-yellow-100 border-2 border-yellow-300 rounded-lg">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🧪</span>
              <div>
                <h3 className="font-bold text-yellow-900">Modo DEMO activado</h3>
                <p className="text-yellow-800 text-sm">
                  Stripe no está configurado. Las suscripciones se crearán sin procesar pagos reales.
                  Para configurar Stripe, consulta el archivo STRIPE_SETUP.md
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Mensaje de éxito de checkout */}
        {showDemoSuccess && (
          <div className="mb-8 p-6 bg-green-100 border-2 border-green-300 rounded-lg shadow-lg animate-pulse">
            <div className="flex items-center">
              <span className="text-3xl mr-4">✅</span>
              <div className="flex-1">
                <h3 className="font-bold text-green-900 text-lg">
                  {isRealStripeSuccess ? '¡Pago Procesado Exitosamente!' : '¡Pago Demo Procesado!'}
                </h3>
                <p className="text-green-800 mt-1">
                  {isRealStripeSuccess 
                    ? 'Tu suscripción ha sido activada correctamente. Ya puedes empezar a gestionar tus propiedades con tu nuevo plan.'
                    : 'Tu plan se ha activado correctamente en modo demostración. En producción, este sería un pago real procesado por Stripe.'
                  }
                </p>
                {isRealStripeSuccess && (
                  <p className="text-green-700 text-sm mt-2">
                    📧 Recibirás un email de confirmación en breve con los detalles de tu suscripción.
                  </p>
                )}
                <p className="text-green-700 text-sm mt-2">
                  Este mensaje se cerrará automáticamente en unos segundos...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Pago Manual */}
        {showManualPayment && manualPaymentInfo && (
          <div className="mb-8 p-6 bg-blue-100 border-2 border-blue-300 rounded-lg shadow-lg">
            <div className="flex items-center">
              <span className="text-3xl mr-4">💳</span>
              <div className="flex-1">
                <h3 className="font-bold text-blue-900 text-lg">
                  ¡Sistema de pago automático temporalmente no disponible!
                </h3>
                <p className="text-blue-800 mt-2">
                  Para activar tu plan <strong>{manualPaymentInfo.plan}</strong> (€{manualPaymentInfo.amount}/mes),
                  por favor realiza el pago mediante:
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center">
                    <span className="text-blue-600 mr-2">📱</span>
                    <span className="font-semibold">Bizum:</span>
                    <span className="ml-2 font-mono bg-blue-200 px-2 py-1 rounded">639 84 94 37</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-blue-600 mr-2">🏦</span>
                    <span className="font-semibold">Transferencia:</span>
                    <span className="ml-2 font-mono bg-blue-200 px-2 py-1 rounded">ES76 0049 4596 5928 1637 2202</span>
                  </div>
                </div>
                <p className="text-blue-700 text-sm mt-3">
                  📧 Incluye tu email en el concepto para confirmar el pago automáticamente.
                  Tu plan se activará en 24-48 horas tras la confirmación.
                </p>
                <p className="text-blue-700 text-sm mt-2">
                  Este mensaje se cerrará automáticamente en 10 segundos...
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Elige tu plan
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Gestiona más propiedades con precios que escalan contigo. 
            El precio por propiedad baja automáticamente al crecer.
          </p>
        </div>

        {/* Banner del trial */}
        {inTrial && trialTimeLeft && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">¡Trial de 15 días activo!</h3>
                    <p className="text-purple-100">
                      Propiedades ilimitadas durante tu prueba
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{trialTimeLeft}</div>
                  <div className="text-purple-100 text-sm">restantes</div>
                </div>
              </div>
              <div className="mt-4 bg-white/10 rounded-lg p-3">
                <p className="text-sm text-purple-100">
                  Tu trial termina el {trialEndsAt ? new Date(trialEndsAt).toLocaleDateString('es-ES', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : ''}. Elige un plan para continuar sin interrupciones.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Contador de propiedades */}
        <div className="max-w-md mx-auto mb-12 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            ¿Cuántas propiedades gestionarás?
          </h3>
          
          {/* Indicador de suscripciones actuales */}
          {totalSubscribedSlots > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Building2 className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm text-blue-800">
                    Ya tienes {totalSubscribedSlots} {totalSubscribedSlots === 1 ? 'slot' : 'slots'} cubiertos
                  </span>
                </div>
                {propertyCount > totalSubscribedSlots && (
                  <span className="text-xs text-blue-600 font-medium">
                    +{propertyCount - totalSubscribedSlots} adicionales
                  </span>
                )}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => handleCounterChange(-1)}
              disabled={propertyCount <= Math.max(totalSubscribedSlots, 1)}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus className="w-4 h-4" />
            </button>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{propertyCount}</div>
              <div className="text-sm text-gray-500">propiedades</div>
            </div>
            
            <button
              onClick={() => handleCounterChange(1)}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Switch de período de facturación */}
          <div className="mt-6 mb-4">
            <div className="bg-gray-100 rounded-lg p-1 grid grid-cols-3 gap-1">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingPeriod === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Mensual
              </button>
              <button
                onClick={() => setBillingPeriod('6_months')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                  billingPeriod === '6_months'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                6 meses
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1 rounded-full">
                  -10%
                </span>
              </button>
              <button
                onClick={() => setBillingPeriod('12_months')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                  billingPeriod === '12_months'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                12 meses
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1 rounded-full">
                  -20%
                </span>
              </button>
            </div>
          </div>

          {/* Indicador del plan seleccionado y precio */}
          {selectedPlan ? (
            <div className="mt-6 text-center">
              {(() => {
                const priceInfo = getPriceForBillingPeriod(selectedPlan.priceMonthly);
                return (
                  <>
                    <div className="mb-2">
                      <span className="text-2xl font-bold text-gray-900">€{priceInfo.displayPrice}</span>
                      <span className="text-gray-500">{priceInfo.period}</span>
                      {priceInfo.savings > 0 && (
                        <div className="text-sm text-green-600 font-medium">
                          Ahorras €{priceInfo.savings} ({priceInfo.discount}% de descuento)
                        </div>
                      )}
                      {billingPeriod !== 'monthly' && (
                        <div className="text-sm text-gray-500">
                          Total: €{priceInfo.totalPrice} por {billingPeriod === '6_months' ? '6 meses' : '12 meses'}
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPlanBadgeColor(selectedPlan)}`}>
                Plan {selectedPlan.name}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                €{pricePerProperty(selectedPlan.code)} por propiedad
              </div>
            </div>
          ) : (
            <div className="mt-6 text-center">
              <div className="mb-2">
                <span className="text-lg text-gray-600">Selecciona un plan</span>
              </div>
              <div className="text-sm text-gray-500">
                Elige el plan que mejor se adapte a tus necesidades
              </div>
            </div>
          )}
        </div>

        {/* Tarjetas de planes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {PLANS.map((plan) => {
            const unitPriceForPlan = pricePerProperty(plan.code)
            const isSelected = selectedPlan ? plan.code === selectedPlan.code : false
            const isRecommended = selectedPlan ? plan.code === selectedPlan.code && propertyCount > currentUserProperties : false

            return (
              <div
                key={plan.code}
                className={`relative p-6 rounded-lg border transition-all duration-200 ${getPlanCardColor(plan)}`}
              >
                {isRecommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      <Crown className="w-4 h-4 mr-1" />
                      Recomendado
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  
                  <div className="mb-4">
                    {(() => {
                      const priceInfo = getPriceForBillingPeriod(plan.priceMonthly);
                      return (
                        <>
                          <div className="relative">
                            <span className="text-3xl font-bold text-gray-900">
                              €{priceInfo.displayPrice}
                            </span>
                            <span className="text-sm text-gray-500">{priceInfo.period}</span>
                            {priceInfo.savings > 0 && (
                              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                -{priceInfo.discount}%
                              </span>
                            )}
                          </div>
                          {priceInfo.savings > 0 && (
                            <div className="text-sm text-green-600 font-medium mt-1">
                              Ahorras €{priceInfo.savings}
                            </div>
                          )}
                          {billingPeriod !== 'monthly' && (
                            <div className="text-sm text-gray-500 mt-1">
                              Total: €{priceInfo.totalPrice} por {billingPeriod === '6_months' ? '6 meses' : '12 meses'}
                            </div>
                          )}
                          <div className="text-sm text-gray-400 mt-1">
                            €{unitPriceForPlan.toFixed(2)} por propiedad
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <div className="mb-6">
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-center font-semibold text-gray-700">
                        Hasta {plan.maxProperties} propiedades
                      </p>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                        QR codes ilimitados
                      </div>
                      <div className="flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                        Guías digitales completas
                      </div>
                      <div className="flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                        Analytics básicas
                      </div>
                      {plan.priceMonthly >= 29 && (
                        <div className="flex items-center">
                          <Check className="w-4 h-4 text-green-500 mr-2" />
                          Soporte prioritario
                        </div>
                      )}
                    </div>
                  </div>

                  {(() => {
                    // ✅ Detectar si es cambio de período solamente
                    const currentPeriodNormalized = currentBillingPeriod === 'biannual' ? '6_months' : currentBillingPeriod === 'annual' ? '12_months' : 'monthly'

                    if (isSelected && propertyCount === currentUserProperties && billingPeriod === currentPeriodNormalized) {
                      // Plan actual con mismo período: deshabilitar
                      return (
                        <button
                          disabled={true}
                          className="w-full py-3 px-4 rounded-md font-medium bg-gray-300 cursor-not-allowed text-gray-500"
                        >
                          Plan actual
                        </button>
                      )
                    } else {
                      // Mostrar solo botón "Seleccionar" que abre modal
                      return (
                        <button
                          onClick={() => {
                            setSelectedPlanForPayment(plan)
                            setShowPaymentMethodModal(true)
                          }}
                          className="w-full py-3 px-4 rounded-md font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center"
                        >
                          Seleccionar Plan
                        </button>
                      )
                    }
                  })()}
                </div>
              </div>
            )
          })}
        </div>

        {/* Banner para +15 propiedades */}
        <div className="max-w-4xl mx-auto mb-12 p-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg text-white text-center">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 mr-3" />
            <h3 className="text-xl font-bold">¿Gestionas más de 15 propiedades?</h3>
          </div>
          <p className="text-lg mb-4 opacity-90">
            Tenemos soluciones empresariales personalizadas para gestoras y grandes operadores
          </p>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-lg font-medium">Contacta con nosotros:</span>
            <a 
              href="mailto:hola@itineramio.com" 
              className="inline-flex items-center px-4 py-2 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              hola@itineramio.com
            </a>
          </div>
        </div>

        {/* Información adicional */}
        <div className="text-center text-gray-600">
          <p className="mb-2">
            Precio por propiedad disminuye al crecer • Más propiedades, más descuento
          </p>
          <p className="text-sm">
            Pago seguro con Stripe • Cambios de plan con prorrateo automático
          </p>
        </div>
      </div>

      {/* Modal de marketing para upgrades */}
      {showUpgradeModal && upgradePreview && (
        <UpgradeMarketingModal
          preview={upgradePreview}
          onClose={() => setShowUpgradeModal(false)}
          onConfirm={() => {
            setShowUpgradeModal(false)
            handleStripeCheckout(upgradePreview.toPlan)
          }}
        />
      )}

      {/* Modal de selección de método de pago mejorado */}
      {showPaymentMethodModal && selectedPlanForPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-lg">
              <h3 className="text-2xl font-bold text-white mb-2">
                Confirmar Plan
              </h3>
              <p className="text-blue-100 text-sm">
                Selecciona tu método de pago preferido
              </p>
            </div>

            <div className="p-6">
              {/* Resumen del Plan */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Plan seleccionado</p>
                    <p className="text-xl font-bold text-gray-900">{selectedPlanForPayment.name}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getPlanBadgeColor(selectedPlanForPayment)}`}>
                    Hasta {selectedPlanForPayment.maxProperties} propiedades
                  </div>
                </div>

                {/* Desglose de precio */}
                <div className="border-t border-gray-200 pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Precio base:</span>
                    <span className="font-medium">€{getPriceForBillingPeriod(selectedPlanForPayment.priceMonthly).displayPrice}/mes</span>
                  </div>
                  {billingPeriod !== 'monthly' && (
                    <>
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Descuento ({getPriceForBillingPeriod(selectedPlanForPayment.priceMonthly).discount}%):</span>
                        <span className="font-medium">-€{getPriceForBillingPeriod(selectedPlanForPayment.priceMonthly).savings}</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-200">
                        <span className="text-gray-900">Total {billingPeriod === '6_months' ? '6 meses' : '12 meses'}:</span>
                        <span className="text-blue-600">€{getPriceForBillingPeriod(selectedPlanForPayment.priceMonthly).totalPrice}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Métodos de Pago */}
              <div className="space-y-3 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Elige tu método de pago:</h4>

                {/* Bizum */}
                <button
                  onClick={() => {
                    const priceInfo = getPriceForBillingPeriod(selectedPlanForPayment.priceMonthly);
                    const billingParam = billingPeriod === '6_months' ? 'biannual' : billingPeriod === '12_months' ? 'annual' : 'monthly';
                    setShowPaymentMethodModal(false)
                    router.push(`/checkout/manual?plan=${selectedPlanForPayment.code}&price=${priceInfo.totalPrice}&properties=${selectedPlanForPayment.maxProperties}&billingPeriod=${billingParam}&method=BIZUM`);
                  }}
                  className="w-full border-2 border-gray-200 hover:border-blue-500 rounded-lg p-4 transition-all group hover:bg-blue-50"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors">
                      <Phone className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900">Bizum</p>
                      <p className="text-sm text-gray-600">Pago instantáneo desde tu móvil</p>
                      <p className="text-xs text-gray-500 mt-1">Número: +34 652 656 440</p>
                    </div>
                    <div className="text-blue-600 font-semibold">
                      →
                    </div>
                  </div>
                </button>

                {/* Transferencia */}
                <button
                  onClick={() => {
                    const priceInfo = getPriceForBillingPeriod(selectedPlanForPayment.priceMonthly);
                    const billingParam = billingPeriod === '6_months' ? 'biannual' : billingPeriod === '12_months' ? 'annual' : 'monthly';
                    setShowPaymentMethodModal(false)
                    router.push(`/checkout/manual?plan=${selectedPlanForPayment.code}&price=${priceInfo.totalPrice}&properties=${selectedPlanForPayment.maxProperties}&billingPeriod=${billingParam}&method=TRANSFER`);
                  }}
                  className="w-full border-2 border-gray-200 hover:border-green-500 rounded-lg p-4 transition-all group hover:bg-green-50"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4 group-hover:bg-green-200 transition-colors">
                      <Building2 className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900">Transferencia Bancaria</p>
                      <p className="text-sm text-gray-600">Pago tradicional desde tu banco</p>
                      <p className="text-xs text-gray-500 mt-1 font-mono">ES82 0182 0304 8102 0158 7248</p>
                    </div>
                    <div className="text-green-600 font-semibold">
                      →
                    </div>
                  </div>
                </button>

                {/* Stripe (Tarjeta) */}
                <button
                  onClick={() => {
                    setShowPaymentMethodModal(false)
                    if (billingPeriod === 'monthly') {
                      handleStripeCheckout(selectedPlanForPayment)
                    } else {
                      handleAnnualPayment(selectedPlanForPayment.code, billingPeriod)
                    }
                  }}
                  className="w-full border-2 border-gray-200 hover:border-purple-500 rounded-lg p-4 transition-all group hover:bg-purple-50"
                  disabled={loading}
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4 group-hover:bg-purple-200 transition-colors">
                      <CreditCard className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900">Tarjeta de Crédito/Débito</p>
                      <p className="text-sm text-gray-600">Pago seguro con Stripe</p>
                      <p className="text-xs text-gray-500 mt-1">Procesamiento inmediato</p>
                    </div>
                    <div className="text-purple-600 font-semibold">
                      →
                    </div>
                  </div>
                </button>
              </div>

              {/* Información adicional */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <div className="text-blue-600 mr-3 mt-0.5">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-blue-900 font-medium mb-1">Información importante</p>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• Para Bizum y Transferencia: deberás subir el comprobante de pago</li>
                      <li>• Tu plan se activará en 24-48h tras verificar el pago</li>
                      <li>• Con tarjeta: activación inmediata</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Botón cancelar */}
              <button
                onClick={() => setShowPaymentMethodModal(false)}
                className="w-full py-3 text-gray-600 hover:text-gray-800 font-medium hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}