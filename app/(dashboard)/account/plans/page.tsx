'use client'

import React, { useState, useEffect } from 'react'
import { 
  CreditCard, 
  Check, 
  Building2, 
  Zap,
  Crown,
  ArrowRight,
  AlertCircle,
  Upload,
  X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../src/components/ui/Card'
import { Button } from '../../../../../src/components/ui/Button'
import { Input } from '../../../../../src/components/ui/Input'
import { useAuth } from '../../../../../src/providers/AuthProvider'
import { useNotifications } from '../../../../../src/hooks/useNotifications'

interface Plan {
  id: string
  name: string
  description?: string
  priceMonthly: number
  maxProperties: number
  features: string[]
  isActive: boolean
  popular?: boolean
}

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  plan: Plan | null
  propertiesCount?: number
  onSubmit: (data: SubscriptionRequestData) => void
  loading: boolean
}

interface SubscriptionRequestData {
  planId?: string
  propertiesCount?: number
  paymentMethod: 'BIZUM' | 'TRANSFER'
  paymentReference?: string
  paymentProofFile?: File
}

const PaymentModal: React.FC<PaymentModalProps> = ({ 
  isOpen, 
  onClose, 
  plan, 
  propertiesCount, 
  onSubmit, 
  loading 
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'BIZUM' | 'TRANSFER'>('BIZUM')
  const [paymentReference, setPaymentReference] = useState('')
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)

  if (!isOpen || !plan) return null

  const totalAmount = propertiesCount ? plan.priceMonthly * propertiesCount : plan.priceMonthly

  const handleFileUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('La imagen debe ser menor a 5MB')
        return
      }
      setPaymentProofFile(file)
    } else {
      alert('Por favor selecciona una imagen válida')
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

  const handleSubmit = () => {
    if (!paymentProofFile) {
      alert('Por favor adjunta el justificante de pago')
      return
    }

    onSubmit({
      planId: plan.id,
      propertiesCount,
      paymentMethod,
      paymentReference,
      paymentProofFile
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Completar Suscripción</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Plan Summary */}
          <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-violet-900 mb-2">{plan.name}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-violet-700">Precio por propiedad:</span>
                <span className="font-semibold text-violet-900 ml-2">€{plan.priceMonthly}/mes</span>
              </div>
              {propertiesCount && (
                <>
                  <div>
                    <span className="text-violet-700">Propiedades:</span>
                    <span className="font-semibold text-violet-900 ml-2">{propertiesCount}</span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-violet-200">
                    <span className="text-violet-700">Total mensual:</span>
                    <span className="font-bold text-violet-900 ml-2 text-lg">€{totalAmount.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Selecciona método de pago</h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('BIZUM')}
                className={`p-4 border rounded-lg text-left ${
                  paymentMethod === 'BIZUM' 
                    ? 'border-violet-500 bg-violet-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">Bizum</div>
                <div className="text-sm text-gray-600">+34 652 656 440</div>
              </button>
              <button
                onClick={() => setPaymentMethod('TRANSFER')}
                className={`p-4 border rounded-lg text-left ${
                  paymentMethod === 'TRANSFER' 
                    ? 'border-violet-500 bg-violet-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">Transferencia</div>
                <div className="text-sm text-gray-600">ES82 0182 0304 8102 0158 7248</div>
              </button>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-900 mb-2">Instrucciones de pago</h4>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Realiza el pago de <strong>€{totalAmount.toFixed(2)}</strong> usando el método seleccionado</li>
              <li>2. {paymentMethod === 'BIZUM' ? 'Usa como concepto' : 'Incluye en el concepto'}: "Itineramio - {plan.name}"</li>
              <li>3. Haz una captura de pantalla o foto del justificante</li>
              <li>4. Súbela en esta página y envía la solicitud</li>
              <li>5. Revisaremos tu pago y activaremos tu suscripción en 24-48h</li>
            </ol>
          </div>

          {/* Payment Reference */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Referencia de pago (opcional)
            </label>
            <Input
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="Número de operación, últimos dígitos de tarjeta, etc."
            />
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Justificante de pago *
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center ${
                dragActive 
                  ? 'border-violet-500 bg-violet-50' 
                  : paymentProofFile
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {paymentProofFile ? (
                <div className="space-y-2">
                  <Check className="w-8 h-8 text-green-600 mx-auto" />
                  <p className="font-medium text-green-900">{paymentProofFile.name}</p>
                  <p className="text-sm text-green-700">
                    {(paymentProofFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    onClick={() => setPaymentProofFile(null)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Eliminar archivo
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-gray-600">
                    Arrastra aquí tu justificante o{' '}
                    <label className="text-violet-600 hover:text-violet-800 cursor-pointer font-medium">
                      selecciona archivo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG hasta 5MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !paymentProofFile}
              className="flex-1 bg-violet-600 hover:bg-violet-700"
            >
              {loading ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              ) : null}
              {loading ? 'Enviando...' : 'Enviar Solicitud'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PlansPage() {
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserStats, setCurrentUserStats] = useState({
    currentPlan: 'Gratuito',
    propertiesCount: 0,
    monthlyFee: 0
  })
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [customPropertiesCount, setCustomPropertiesCount] = useState(1)
  const [submittingRequest, setSubmittingRequest] = useState(false)

  useEffect(() => {
    fetchPlans()
    fetchUserStats()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/subscription-plans')
      if (response.ok) {
        const data = await response.json()
        setPlans(data)
      }
    } catch (error) {
      console.error('Error fetching plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/account/plan-info')
      if (response.ok) {
        const data = await response.json()
        setCurrentUserStats(data)
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan)
    setShowPaymentModal(true)
  }

  const handleCustomPlan = () => {
    if (customPropertiesCount < 1) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Debe ser al menos 1 propiedad',
        read: false
      })
      return
    }

    // Use the first available plan for custom property count
    const basePlan = plans.find(p => p.isActive)
    if (basePlan) {
      setSelectedPlan(basePlan)
      setShowPaymentModal(true)
    }
  }

  const submitSubscriptionRequest = async (data: SubscriptionRequestData) => {
    try {
      setSubmittingRequest(true)

      // First upload the payment proof
      const formData = new FormData()
      if (data.paymentProofFile) {
        formData.append('file', data.paymentProofFile)
      }

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) {
        throw new Error('Error uploading payment proof')
      }

      const uploadResult = await uploadResponse.json()
      let paymentProofUrl = ''

      if (uploadResult.success) {
        paymentProofUrl = uploadResult.url
      } else if (uploadResult.duplicate && uploadResult.existingMedia?.url) {
        paymentProofUrl = uploadResult.existingMedia.url
      } else {
        throw new Error('Failed to upload payment proof')
      }

      // Create subscription request
      const requestData = {
        planId: data.planId,
        requestType: 'PLAN',
        propertiesCount: data.propertiesCount || 1,
        paymentMethod: data.paymentMethod,
        paymentReference: data.paymentReference,
        paymentProofUrl,
        totalAmount: selectedPlan ? (
          data.propertiesCount ? 
            selectedPlan.priceMonthly * data.propertiesCount : 
            selectedPlan.priceMonthly
        ) : 0
      }

      const response = await fetch('/api/subscription-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      if (response.ok) {
        addNotification({
          type: 'success',
          title: 'Solicitud enviada',
          message: 'Tu solicitud de suscripción ha sido enviada. Revisaremos tu pago en 24-48h.',
          read: false
        })
        setShowPaymentModal(false)
        setSelectedPlan(null)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error creating subscription request')
      }
    } catch (error) {
      console.error('Error submitting request:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Error al enviar la solicitud',
        read: false
      })
    } finally {
      setSubmittingRequest(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Planes y Suscripciones</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Elige el plan perfecto para tu negocio. Gestiona múltiples propiedades con facilidad.
        </p>
      </div>

      {/* Current Plan Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Tu Plan Actual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900">{currentUserStats.currentPlan}</h3>
              <p className="text-sm text-blue-700">Plan actual</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900">{currentUserStats.propertiesCount}</h3>
              <p className="text-sm text-green-700">Propiedades activas</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900">€{currentUserStats.monthlyFee}</h3>
              <p className="text-sm text-purple-700">Coste mensual</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative ${plan.popular ? 'border-violet-500 border-2' : ''}`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-violet-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Más Popular
                </span>
              </div>
            )}
            <CardHeader className="text-center">
              <div className="mb-4">
                {plan.name.includes('Básico') && <Zap className="w-12 h-12 text-blue-600 mx-auto" />}
                {plan.name.includes('Growth') && <Building2 className="w-12 h-12 text-violet-600 mx-auto" />}
                {plan.name.includes('Enterprise') && <Crown className="w-12 h-12 text-yellow-600 mx-auto" />}
              </div>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <div className="text-4xl font-bold text-violet-600">
                €{plan.priceMonthly}
                <span className="text-lg text-gray-600 font-normal">/mes por propiedad</span>
              </div>
              {plan.description && (
                <p className="text-gray-600 mt-2">{plan.description}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-600 mr-2" />
                  <span>Hasta {plan.maxProperties === -1 ? 'ilimitadas' : plan.maxProperties} propiedades</span>
                </div>
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 mr-2" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <Button 
                onClick={() => handleSelectPlan(plan)}
                className={`w-full ${
                  plan.popular 
                    ? 'bg-violet-600 hover:bg-violet-700' 
                    : 'bg-gray-800 hover:bg-gray-900'
                }`}
              >
                Seleccionar Plan
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Custom Plan */}
      <Card className="border-2 border-dashed border-gray-300">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Plan Personalizado</CardTitle>
          <p className="text-gray-600">¿Necesitas un número específico de propiedades?</p>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-4">
            <label className="text-lg font-medium">Número de propiedades:</label>
            <Input
              type="number"
              min="1"
              value={customPropertiesCount}
              onChange={(e) => setCustomPropertiesCount(parseInt(e.target.value) || 1)}
              className="w-20 text-center"
            />
          </div>
          <div className="text-2xl font-bold text-violet-600">
            €{((plans[0]?.priceMonthly || 2.5) * customPropertiesCount).toFixed(2)}/mes
          </div>
          <Button 
            onClick={handleCustomPlan}
            variant="outline"
            className="border-violet-600 text-violet-600 hover:bg-violet-50"
          >
            Crear Plan Personalizado
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Benefits Section */}
      <Card className="bg-gradient-to-r from-violet-50 to-purple-50">
        <CardContent className="p-8">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-6">
            ¿Por qué elegir nuestros planes?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-white rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-semibold mb-2">Sin compromisos</h4>
              <p className="text-sm text-gray-600">Cancela cuando quieras</p>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-2">Activación rápida</h4>
              <p className="text-sm text-gray-600">24-48h de revisión</p>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-violet-600" />
              </div>
              <h4 className="font-semibold mb-2">Escalabilidad</h4>
              <p className="text-sm text-gray-600">Crece a tu ritmo</p>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Crown className="w-8 h-8 text-yellow-600" />
              </div>
              <h4 className="font-semibold mb-2">Soporte premium</h4>
              <p className="text-sm text-gray-600">Ayuda personalizada</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false)
          setSelectedPlan(null)
        }}
        plan={selectedPlan}
        propertiesCount={customPropertiesCount}
        onSubmit={submitSubscriptionRequest}
        loading={submittingRequest}
      />
    </div>
  )
}