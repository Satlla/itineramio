'use client'

import React, { useState, useEffect } from 'react'
import { X, CreditCard, Check, Mail } from 'lucide-react'

interface Plan {
  id: string
  name: string
  description: string | null
  priceMonthly: number
  priceYearly: number | null
  aiMessagesIncluded: number
  maxProperties: number
  features: string[]
  isActive: boolean
}

interface ChangePlanModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  currentPlanId?: string
  userName: string
  userEmail: string
  onSuccess: () => void
}

export default function ChangePlanModal({ 
  isOpen, 
  onClose, 
  userId, 
  currentPlanId, 
  userName, 
  userEmail,
  onSuccess 
}: ChangePlanModalProps) {
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(false)
  const [sendEmail, setSendEmail] = useState(true)
  const [markAsPaid, setMarkAsPaid] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchPlans()
    }
  }, [isOpen])

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/admin/plans')
      const data = await response.json()
      if (data.success) {
        setPlans(data.plans.filter((plan: Plan) => plan.isActive))
      }
    } catch (error) {
      console.error('Error fetching plans:', error)
    }
  }

  const handleChangePlan = async () => {
    if (!selectedPlan) return

    try {
      setLoading(true)
      
      // Change the user's plan
      const response = await fetch(`/api/admin/users/${userId}/change-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan.id,
          sendEmail,
          markAsPaid
        })
      })

      const data = await response.json()
      
      if (data.success) {
        onSuccess()
        handleClose()
      } else {
        alert(data.error || 'Error al cambiar el plan')
      }
    } catch (error) {
      console.error('Error changing plan:', error)
      alert('Error al cambiar el plan')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedPlan(null)
    setSendEmail(true)
    setMarkAsPaid(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Cambiar Plan de Usuario</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Usuario:</p>
              <p className="font-medium text-gray-900">{userName}</p>
              <p className="text-sm text-gray-500">{userEmail}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Seleccionar Nuevo Plan</h3>
            <div className="grid gap-3">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  disabled={plan.id === currentPlanId}
                  className={`text-left p-4 rounded-lg border-2 transition-all ${
                    selectedPlan?.id === plan.id
                      ? 'border-red-500 bg-red-50'
                      : plan.id === currentPlanId
                      ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{plan.name}</span>
                        {plan.id === currentPlanId && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            Plan Actual
                          </span>
                        )}
                        {selectedPlan?.id === plan.id && (
                          <Check className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      {plan.description && (
                        <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>✉️ {plan.aiMessagesIncluded} mensajes IA</span>
                        <span>🏠 {plan.maxProperties} propiedades</span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-bold text-gray-900">€{plan.priceMonthly}/mes</div>
                      {plan.priceYearly && (
                        <div className="text-sm text-gray-500">€{plan.priceYearly}/año</div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedPlan && (
            <div className="space-y-4 mb-6">
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Opciones Adicionales</h4>
                
                <label className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Enviar email de notificación al usuario
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={markAsPaid}
                    onChange={(e) => setMarkAsPaid(e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    <CreditCard className="w-4 h-4 inline mr-1" />
                    Marcar como pagado (generar factura)
                  </span>
                </label>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Resumen del cambio:</strong><br />
                  • Plan actual: {plans.find(p => p.id === currentPlanId)?.name || 'Sin plan'}<br />
                  • Nuevo plan: {selectedPlan.name}<br />
                  • Precio: €{selectedPlan.priceMonthly}/mes<br />
                  {sendEmail && '• Se enviará notificación por email'}<br />
                  {markAsPaid && '• Se generará factura como pagada'}
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              onClick={handleChangePlan}
              disabled={loading || !selectedPlan}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
            >
              {loading ? 'Cambiando...' : 'Cambiar Plan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}