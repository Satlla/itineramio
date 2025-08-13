'use client'

import React, { useState, useEffect } from 'react'
import { X, Search, Calculator, FileText, Calendar, DollarSign, User } from 'lucide-react'

interface CreateInvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface User {
  id: string
  email: string
  name: string
  companyName?: string
  currentSubscription?: {
    id: string
    plan: {
      name: string
      priceMonthly: number
    }
  }
}

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

export default function CreateInvoiceModal({ isOpen, onClose, onSuccess }: CreateInvoiceModalProps) {
  const [users, setUsers] = useState<User[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchingUsers, setSearchingUsers] = useState(false)
  
  const [formData, setFormData] = useState({
    amount: '',
    discountAmount: '0',
    discountPercentage: '0',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    paymentMethod: '',
    notes: '',
    linkToSubscription: true
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      fetchPlans()
      if (searchTerm.length >= 2) {
        searchUsers()
      }
    }
  }, [searchTerm, isOpen])

  useEffect(() => {
    if (selectedPlan) {
      setFormData(prev => ({
        ...prev,
        amount: selectedPlan.priceMonthly.toString()
      }))
    } else if (selectedUser && selectedUser.currentSubscription && formData.linkToSubscription) {
      setFormData(prev => ({
        ...prev,
        amount: selectedUser.currentSubscription!.plan.priceMonthly.toString()
      }))
    }
  }, [selectedUser, selectedPlan, formData.linkToSubscription])

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

  const searchUsers = async () => {
    try {
      setSearchingUsers(true)
      const response = await fetch(`/api/admin/users?search=${searchTerm}`)
      const data = await response.json()
      if (data.success) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setSearchingUsers(false)
    }
  }

  const calculateFinalAmount = () => {
    const amount = parseFloat(formData.amount) || 0
    const discountAmount = parseFloat(formData.discountAmount) || 0
    return Math.max(0, amount - discountAmount)
  }

  const handleDiscountPercentageChange = (percentage: string) => {
    const percent = parseFloat(percentage) || 0
    const amount = parseFloat(formData.amount) || 0
    const discountAmount = (amount * percent) / 100
    
    setFormData(prev => ({
      ...prev,
      discountPercentage: percentage,
      discountAmount: discountAmount.toFixed(2)
    }))
  }

  const handleDiscountAmountChange = (discountAmount: string) => {
    const discount = parseFloat(discountAmount) || 0
    const amount = parseFloat(formData.amount) || 0
    const percentage = amount > 0 ? (discount / amount) * 100 : 0
    
    setFormData(prev => ({
      ...prev,
      discountAmount: discountAmount,
      discountPercentage: percentage.toFixed(2)
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!selectedUser) {
      newErrors.user = 'Debes seleccionar un usuario'
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'El importe debe ser mayor que 0'
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'La fecha de vencimiento es requerida'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      setLoading(true)
      
      const response = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser!.id,
          subscriptionId: formData.linkToSubscription ? selectedUser!.currentSubscription?.id : null,
          amount: parseFloat(formData.amount),
          discountAmount: parseFloat(formData.discountAmount) || 0,
          finalAmount: calculateFinalAmount(),
          dueDate: formData.dueDate,
          paymentMethod: formData.paymentMethod || null,
          notes: formData.notes || null
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        onSuccess()
        handleClose()
      } else {
        alert(data.error || 'Error al crear la factura')
      }
    } catch (error) {
      console.error('Error creating invoice:', error)
      alert('Error al crear la factura')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedUser(null)
    setSelectedPlan(null)
    setSearchTerm('')
    setUsers([])
    setFormData({
      amount: '',
      discountAmount: '0',
      discountPercentage: '0',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentMethod: '',
      notes: '',
      linkToSubscription: true
    })
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Nueva Factura</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Usuario
              </label>
              
              {!selectedUser ? (
                <div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar usuario por nombre o email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 w-full"
                    />
                  </div>
                  
                  {searchingUsers && (
                    <div className="mt-2 text-sm text-gray-500">Buscando...</div>
                  )}
                  
                  {users.length > 0 && (
                    <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                      {users.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => setSelectedUser(user)}
                          className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {user.companyName && (
                            <div className="text-xs text-gray-400">{user.companyName}</div>
                          )}
                          {user.currentSubscription && (
                            <div className="text-xs text-blue-600 mt-1">
                              Plan: {user.currentSubscription.plan.name} - €{user.currentSubscription.plan.priceMonthly}/mes
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900">{selectedUser.name}</div>
                      <div className="text-sm text-gray-500">{selectedUser.email}</div>
                      {selectedUser.currentSubscription && (
                        <div className="text-xs text-blue-600 mt-1">
                          Plan: {selectedUser.currentSubscription.plan.name}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedUser(null)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Cambiar
                    </button>
                  </div>
                </div>
              )}
              
              {errors.user && (
                <p className="mt-1 text-sm text-red-600">{errors.user}</p>
              )}
            </div>

            {selectedUser && (
              <>
                {/* Link to subscription */}
                {selectedUser.currentSubscription && (
                  <div>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.linkToSubscription}
                        onChange={(e) => {
                          setFormData({ ...formData, linkToSubscription: e.target.checked })
                          if (e.target.checked) {
                            setSelectedPlan(null)
                          }
                        }}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Vincular a suscripción actual ({selectedUser.currentSubscription.plan.name})
                      </span>
                    </label>
                  </div>
                )}

                {/* Plan Selection */}
                {!formData.linkToSubscription && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seleccionar Plan (opcional)
                    </label>
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
                      {plans.map((plan) => (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => setSelectedPlan(plan)}
                          className={`text-left p-3 rounded-lg border transition-all ${
                            selectedPlan?.id === plan.id
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{plan.name}</div>
                              {plan.description && (
                                <div className="text-xs text-gray-500 mt-1">{plan.description}</div>
                              )}
                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                                <span>✉️ {plan.aiMessagesIncluded} mensajes IA</span>
                                <span>🏠 {plan.maxProperties} propiedades</span>
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <div className="font-bold text-gray-900">€{plan.priceMonthly}/mes</div>
                              {plan.priceYearly && (
                                <div className="text-xs text-gray-500">€{plan.priceYearly}/año</div>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    {selectedPlan && (
                      <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-blue-700">Plan seleccionado: {selectedPlan.name}</span>
                          <button
                            type="button"
                            onClick={() => setSelectedPlan(null)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Importe (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="0.00"
                  />
                  {errors.amount && (
                    <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                  )}
                </div>

                {/* Discount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Calculator className="w-4 h-4 inline mr-1" />
                    Descuento
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Porcentaje (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.discountPercentage}
                        onChange={(e) => handleDiscountPercentageChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Cantidad (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.discountAmount}
                        onChange={(e) => handleDiscountAmountChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Final Amount Display */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Importe final:</span>
                    <span className="text-2xl font-bold text-gray-900">
                      €{calculateFinalAmount().toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Fecha de vencimiento
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                  {errors.dueDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Notas (opcional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Notas adicionales sobre esta factura..."
                  />
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !selectedUser}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
              >
                {loading ? 'Creando...' : 'Crear Factura'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}