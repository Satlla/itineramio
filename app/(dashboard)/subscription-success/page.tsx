'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Clock, CreditCard, Building2, Smartphone, ArrowRight, Loader2, XCircle } from 'lucide-react'
import { trackPurchase, trackBeginCheckout } from '../../../src/lib/analytics'

export default function SubscriptionSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [paymentMethod, setPaymentMethod] = useState<string>('')
  const [isStripePayment, setIsStripePayment] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null)
  const trackedRef = useRef(false)
  const verifiedRef = useRef(false)

  useEffect(() => {
    const method = searchParams.get('method')
    const sessionId = searchParams.get('session_id')
    const plan = searchParams.get('plan')
    const amount = searchParams.get('amount')
    const transactionId = searchParams.get('txn') || `txn_${Date.now()}`

    setPaymentMethod(method || '')

    // Check if this is a Stripe payment (has session_id)
    if (sessionId && !verifiedRef.current) {
      verifiedRef.current = true
      setIsStripePayment(true)
      verifyStripePayment(sessionId)
    }

    // Track purchase conversion (only once)
    if (!trackedRef.current && plan) {
      trackedRef.current = true
      const value = amount ? parseFloat(amount) : 0

      trackPurchase({
        transactionId,
        value,
        currency: 'EUR',
        items: [{
          item_id: plan.toLowerCase(),
          item_name: `Plan ${plan}`,
          price: value,
          item_category: 'subscription'
        }]
      })
    }
  }, [searchParams])

  const verifyStripePayment = async (sessionId: string) => {
    setVerifying(true)
    setVerificationError(null)

    try {
      const response = await fetch('/api/stripe/verify-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sessionId })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setVerified(true)
        setSubscriptionInfo(data.subscription)
      } else {
        setVerificationError(data.error || data.message || 'Error al verificar el pago')
      }
    } catch (error) {
      console.error('Error verifying Stripe payment:', error)
      setVerificationError('Error al conectar con el servidor')
    } finally {
      setVerifying(false)
    }
  }

  const getPaymentMethodInfo = () => {
    switch (paymentMethod) {
      case 'bizum':
        return {
          icon: <Smartphone className="w-16 h-16 text-violet-600" />,
          name: 'Bizum',
          description: 'Pago instantáneo'
        }
      case 'transfer':
        return {
          icon: <Building2 className="w-16 h-16 text-violet-600" />,
          name: 'Transferencia Bancaria',
          description: 'Pago mediante SEPA'
        }
      case 'stripe':
        return {
          icon: <CreditCard className="w-16 h-16 text-violet-600" />,
          name: 'Tarjeta',
          description: 'Pago con tarjeta'
        }
      default:
        return {
          icon: <CreditCard className="w-16 h-16 text-violet-600" />,
          name: 'Pago',
          description: 'Método de pago'
        }
    }
  }

  const methodInfo = getPaymentMethodInfo()

  // If Stripe payment, show different UI
  if (isStripePayment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 flex items-center justify-center p-4" style={{ paddingTop: 'calc(4rem + env(safe-area-inset-top, 0px))' }}>
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className={`p-8 text-center ${
              verifying ? 'bg-gradient-to-r from-blue-600 to-indigo-600' :
              verified ? 'bg-gradient-to-r from-green-600 to-emerald-600' :
              verificationError ? 'bg-gradient-to-r from-red-600 to-rose-600' :
              'bg-gradient-to-r from-violet-600 to-purple-600'
            }`}>
              {verifying ? (
                <>
                  <Loader2 className="w-20 h-20 text-white mx-auto mb-4 animate-spin" />
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Verificando pago...
                  </h1>
                  <p className="text-blue-100 text-lg">
                    Estamos confirmando tu pago con Stripe
                  </p>
                </>
              ) : verified ? (
                <>
                  <div className="inline-block animate-bounce mb-4">
                    <CheckCircle className="w-20 h-20 text-white" strokeWidth={2} />
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    ¡Pago Confirmado!
                  </h1>
                  <p className="text-green-100 text-lg">
                    Tu suscripción está activa
                  </p>
                </>
              ) : verificationError ? (
                <>
                  <XCircle className="w-20 h-20 text-white mx-auto mb-4" />
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Error en la verificación
                  </h1>
                  <p className="text-red-100 text-lg">
                    {verificationError}
                  </p>
                </>
              ) : null}
            </div>

            {/* Content */}
            <div className="p-8">
              {verified && subscriptionInfo && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-8">
                  <h3 className="font-semibold text-green-900 mb-4">Detalles de tu suscripción</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-green-800">
                      <strong>Plan:</strong> {subscriptionInfo.planName}
                    </p>
                    <p className="text-green-800">
                      <strong>Válido hasta:</strong> {new Date(subscriptionInfo.endDate).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push('/main')}
                  className="flex-1 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  Ir al Dashboard
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => router.push('/account/billing')}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  Ver Facturación
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Manual payment UI (Bizum, Transfer)
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 flex items-center justify-center p-4" style={{ paddingTop: 'calc(4rem + env(safe-area-inset-top, 0px))' }}>
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header with animated checkmark */}
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-8 text-center">
            <div className="inline-block animate-bounce mb-4">
              <CheckCircle className="w-20 h-20 text-white" strokeWidth={2} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              ¡Solicitud Enviada Correctamente!
            </h1>
            <p className="text-violet-100 text-lg">
              Hemos recibido tu comprobante de pago
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Payment Method Info */}
            <div className="flex items-center justify-center gap-4 mb-8 p-6 bg-violet-50 rounded-xl">
              {methodInfo.icon}
              <div>
                <p className="text-sm text-gray-600">{methodInfo.description}</p>
                <p className="text-xl font-semibold text-gray-900">{methodInfo.name}</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Comprobante recibido</h3>
                  <p className="text-sm text-gray-600">
                    Tu comprobante de pago ha sido enviado correctamente a nuestro equipo.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-violet-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Verificación en proceso</h3>
                  <p className="text-sm text-gray-600">
                    Nuestro equipo verificará tu pago en las próximas 24-48 horas laborables.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 opacity-50">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Activación de suscripción</h3>
                  <p className="text-sm text-gray-600">
                    Recibirás un email de confirmación cuando tu suscripción esté activa.
                  </p>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">ℹ️</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 mb-2">¿Qué sucede ahora?</h4>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>Recibirás un email de confirmación cuando verifiquemos tu pago</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>Tu suscripción se activará automáticamente tras la verificación</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>Puedes consultar el estado en tu panel de control</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push('/subscriptions')}
                className="flex-1 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                Ver Estado de Suscripción
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push('/main')}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                Ir al Dashboard
              </button>
            </div>

            {/* Support */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                ¿Tienes alguna pregunta?{' '}
                <a href="mailto:hola@itineramio.com" className="text-violet-600 hover:text-violet-700 font-medium">
                  Contáctanos
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Gracias por confiar en Itineramio 🎉
          </p>
        </div>
      </div>
    </div>
  )
}
