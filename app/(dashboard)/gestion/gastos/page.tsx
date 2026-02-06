'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Calendar,
  Building2,
  Trash2,
  Edit2,
  X,
  Upload,
  FileText,
  Euro,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { AnimatePresence } from 'framer-motion'
import { formatCurrency } from '@/lib/format'
import { Button, Card, CardContent, Badge } from '../../../../src/components/ui'
import { AnimatedLoadingSpinner } from '../../../../src/components/ui/AnimatedLoadingSpinner'
import { DashboardFooter } from '../../../../src/components/layout/DashboardFooter'

interface Property {
  id: string
  name: string
  billingConfigId?: string
}

interface BillingUnit {
  id: string
  name: string
  city: string | null
}

interface Expense {
  id: string
  date: string
  concept: string
  category: string
  amount: number
  vatAmount: number
  chargeToOwner: boolean
  supplierName?: string
  invoiceNumber?: string
  invoiceUrl?: string
  property: {
    id: string
    name: string
  }
  billingUnitId?: string
  liquidation?: {
    id: string
    status: string
  }
}

const EXPENSE_CATEGORIES = [
  { value: 'MAINTENANCE', label: 'Mantenimiento' },
  { value: 'SUPPLIES', label: 'Suministros' },
  { value: 'REPAIR', label: 'Reparaciones' },
  { value: 'CLEANING', label: 'Limpieza' },
  { value: 'FURNITURE', label: 'Mobiliario' },
  { value: 'TAXES', label: 'Impuestos' },
  { value: 'INSURANCE', label: 'Seguros' },
  { value: 'OTHER', label: 'Otros' }
]

export default function GastosPage() {
  const [loading, setLoading] = useState(true)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [billingUnits, setBillingUnits] = useState<BillingUnit[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null)

  // Success modal
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successInfo, setSuccessInfo] = useState<{ concept: string; propertyName: string; date: string } | null>(null)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProperty, setSelectedProperty] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedMonth, setSelectedMonth] = useState<string>('')

  // Form state
  const [formData, setFormData] = useState({
    propertyId: '',
    billingUnitId: '', // Nuevo: apartamento de Gestión
    date: new Date().toISOString().split('T')[0],
    concept: '',
    category: 'OTHER',
    amount: '',
    vatAmount: '',
    chargeToOwner: true,
    supplierName: '',
    invoiceNumber: ''
  })

  useEffect(() => {
    fetchData()
  }, [selectedProperty, selectedCategory, selectedMonth])

  const fetchData = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams()
      if (selectedProperty) params.append('propertyId', selectedProperty)
      if (selectedCategory) params.append('category', selectedCategory)
      if (selectedMonth) params.append('month', selectedMonth)

      const [expensesRes, propertiesRes] = await Promise.all([
        fetch(`/api/gestion/expenses?${params}`, { credentials: 'include' }),
        fetch('/api/gestion/properties-simple', { credentials: 'include' })
      ])

      if (expensesRes.ok) {
        const data = await expensesRes.json()
        setExpenses(data.expenses || [])
      }

      if (propertiesRes.ok) {
        const data = await propertiesRes.json()
        setProperties(data.properties || [])
        setBillingUnits(data.billingUnits || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    // Validación frontend - requiere billingUnitId O propertyId
    if (!formData.propertyId && !formData.billingUnitId) {
      setFormError('Debes seleccionar un apartamento')
      return
    }

    if (!formData.date) {
      setFormError('La fecha es obligatoria')
      return
    }

    if (!formData.concept.trim()) {
      setFormError('El concepto es obligatorio')
      return
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setFormError('El importe debe ser mayor que 0')
      return
    }

    // Verificar que la propiedad tiene configuración (solo si es legacy property)
    if (formData.propertyId && !formData.billingUnitId) {
      const selectedProp = properties.find(p => p.id === formData.propertyId)
      if (selectedProp && !selectedProp.billingConfigId) {
        setFormError('Esta propiedad no tiene configuración de facturación. Configúrala primero.')
        return
      }
    }

    setSaving(true)

    try {
      const url = editingExpense
        ? `/api/gestion/expenses/${editingExpense.id}`
        : '/api/gestion/expenses'

      const response = await fetch(url, {
        method: editingExpense ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount) || 0,
          vatAmount: parseFloat(formData.vatAmount) || 0
        })
      })

      if (response.ok) {
        // Get property/unit name for success modal
        const selectedUnit = billingUnits.find(u => u.id === formData.billingUnitId)
        const selectedProp = properties.find(p => p.id === formData.propertyId)
        const propertyName = selectedUnit?.name || selectedProp?.name || 'el apartamento'

        // Only show success modal for new expenses (not edits)
        if (!editingExpense) {
          setSuccessInfo({
            concept: formData.concept,
            propertyName,
            date: formData.date
          })
          setShowSuccessModal(true)
        }

        setShowModal(false)
        resetForm()
        fetchData()
      } else {
        const data = await response.json()
        setFormError(data.error || 'Error al guardar el gasto')
      }
    } catch (error) {
      console.error('Error saving expense:', error)
      setFormError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = (expense: Expense) => {
    setExpenseToDelete(expense)
    setShowDeleteConfirm(true)
  }

  const handleDelete = async () => {
    if (!expenseToDelete) return

    setDeleting(expenseToDelete.id)
    try {
      const response = await fetch(`/api/gestion/expenses/${expenseToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        fetchData()
        setShowDeleteConfirm(false)
        setExpenseToDelete(null)
      }
    } catch (error) {
      console.error('Error deleting expense:', error)
    } finally {
      setDeleting(null)
    }
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setFormData({
      propertyId: expense.property.id,
      billingUnitId: expense.billingUnitId || '',
      date: expense.date.split('T')[0],
      concept: expense.concept,
      category: expense.category,
      amount: expense.amount.toString(),
      vatAmount: expense.vatAmount.toString(),
      chargeToOwner: expense.chargeToOwner,
      supplierName: expense.supplierName || '',
      invoiceNumber: expense.invoiceNumber || ''
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setEditingExpense(null)
    setFormError(null)
    setFormData({
      propertyId: '',
      billingUnitId: '',
      date: new Date().toISOString().split('T')[0],
      concept: '',
      category: 'OTHER',
      amount: '',
      vatAmount: '',
      chargeToOwner: true,
      supplierName: '',
      invoiceNumber: ''
    })
  }

  const getCategoryLabel = (category: string) => {
    return EXPENSE_CATEGORIES.find(c => c.value === category)?.label || category
  }

  // Filter expenses
  const filteredExpenses = expenses.filter(expense => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      if (!expense.concept.toLowerCase().includes(term) &&
          !expense.supplierName?.toLowerCase().includes(term)) {
        return false
      }
    }
    return true
  })

  // Calculate totals
  const totals = filteredExpenses.reduce((acc, exp) => ({
    total: acc.total + exp.amount,
    vat: acc.vat + exp.vatAmount,
    count: acc.count + 1
  }), { total: 0, vat: 0, count: 0 })

  // Generate month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(new Date().getFullYear(), i, 1)
    return {
      value: `${new Date().getFullYear()}-${String(i + 1).padStart(2, '0')}`,
      label: date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    }
  })

  if (loading) {
    return <AnimatedLoadingSpinner text="Cargando gastos..." type="general" />
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <Receipt className="h-7 w-7 text-violet-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Gastos</h1>
                  <p className="text-sm text-gray-600">
                    Gestiona los gastos de tus propiedades
                  </p>
                </div>
              </div>

              <Button
                onClick={() => { resetForm(); setShowModal(true) }}
                className="bg-violet-600 hover:bg-violet-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo gasto
              </Button>
            </div>
          </motion.div>

          {/* Totals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-3 gap-3 sm:gap-4 mb-6"
          >
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-gray-600">Total gastos</p>
                  <p className="text-lg sm:text-2xl font-bold text-red-600">
                    {formatCurrency(totals.total)}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-gray-600">IVA soportado</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-600">
                    {formatCurrency(totals.vat)}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-gray-600">Nº gastos</p>
                  <p className="text-lg sm:text-2xl font-bold text-violet-600">
                    {totals.count}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mb-6"
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por concepto o proveedor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <select
                    value={selectedProperty}
                    onChange={(e) => setSelectedProperty(e.target.value)}
                    className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="">Todas las propiedades</option>
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}{!p.billingConfigId ? ' (sin config.)' : ''}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="">Todas las categorías</option>
                    {EXPENSE_CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="">Todo el año</option>
                    {monthOptions.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Expenses List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {filteredExpenses.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Receipt className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-700 font-medium mb-2">No hay gastos registrados</p>
                  <p className="text-sm text-gray-500">
                    Añade gastos para incluirlos en la facturación mensual
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredExpenses.map((expense, index) => (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                  >
                    <Card className={expense.liquidation ? 'opacity-75' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900 truncate">
                                {expense.concept}
                              </span>
                              <Badge className="bg-gray-100 text-gray-600 text-xs">
                                {getCategoryLabel(expense.category)}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {expense.property.name}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(expense.date).toLocaleDateString('es-ES')}
                              </span>
                              {expense.supplierName && (
                                <span>{expense.supplierName}</span>
                              )}
                              {expense.invoiceNumber && (
                                <span className="flex items-center gap-1">
                                  <FileText className="w-3 h-3" />
                                  {expense.invoiceNumber}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-bold text-red-600">
                                -{formatCurrency(expense.amount)}
                              </p>
                              {expense.vatAmount > 0 && (
                                <p className="text-xs text-gray-500">
                                  IVA: {formatCurrency(expense.vatAmount)}
                                </p>
                              )}
                            </div>

                            {expense.liquidation ? (
                              <Badge className="bg-green-100 text-green-700 text-xs">
                                Facturado
                              </Badge>
                            ) : (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleEdit(expense)}
                                  className="p-2 text-gray-400 hover:text-violet-600 transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => confirmDelete(expense)}
                                  disabled={deleting === expense.id}
                                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <DashboardFooter />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingExpense ? 'Editar gasto' : 'Nuevo gasto'}
                </h2>
                <button
                  onClick={() => { setShowModal(false); resetForm() }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {formError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apartamento *
                  </label>
                  <select
                    required
                    value={formData.billingUnitId ? `unit:${formData.billingUnitId}` : formData.propertyId}
                    onChange={(e) => {
                      const value = e.target.value
                      // Si empieza con "unit:", es un BillingUnit
                      if (value.startsWith('unit:')) {
                        setFormData(prev => ({ ...prev, billingUnitId: value.replace('unit:', ''), propertyId: '' }))
                      } else {
                        setFormData(prev => ({ ...prev, propertyId: value, billingUnitId: '' }))
                      }
                      setFormError(null)
                    }}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                      !formData.propertyId && !formData.billingUnitId && formError ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecciona un apartamento</option>
                    {/* BillingUnits (módulo Gestión) */}
                    {billingUnits.length > 0 && (
                      <optgroup label="Apartamentos de Gestión">
                        {billingUnits.map(u => (
                          <option key={u.id} value={`unit:${u.id}`}>
                            {u.name} {u.city && `(${u.city})`}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {/* Properties (módulo Manuales - legacy) */}
                    {properties.filter(p => p.billingConfigId).length > 0 && (
                      <optgroup label="Propiedades de Manuales">
                        {properties.filter(p => p.billingConfigId).map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  {billingUnits.length === 0 && properties.filter(p => p.billingConfigId).length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      No tienes apartamentos configurados
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      {EXPENSE_CATEGORIES.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Concepto *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.concept}
                    onChange={(e) => setFormData(prev => ({ ...prev, concept: e.target.value }))}
                    placeholder="Ej: Reparación calentador"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Importe (€) *
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      IVA (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.vatAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, vatAmount: e.target.value }))}
                      placeholder="0.00"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Proveedor
                    </label>
                    <input
                      type="text"
                      value={formData.supplierName}
                      onChange={(e) => setFormData(prev => ({ ...prev, supplierName: e.target.value }))}
                      placeholder="Nombre del proveedor"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nº Factura
                    </label>
                    <input
                      type="text"
                      value={formData.invoiceNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                      placeholder="Nº de factura"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="chargeToOwner"
                    checked={formData.chargeToOwner}
                    onChange={(e) => setFormData(prev => ({ ...prev, chargeToOwner: e.target.checked }))}
                    className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                  <label htmlFor="chargeToOwner" className="text-sm text-gray-700">
                    Descontar al propietario en la factura
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setShowModal(false); resetForm() }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-violet-600 hover:bg-violet-700"
                  >
                    {saving ? 'Guardando...' : editingExpense ? 'Actualizar' : 'Crear gasto'}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      <AnimatePresence>
        {showDeleteConfirm && expenseToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>

                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                  Eliminar gasto
                </h3>

                <p className="text-gray-600 text-center mb-4">
                  ¿Estás seguro de eliminar <span className="font-medium">{expenseToDelete.concept}</span>?
                </p>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <p className="text-amber-800 text-sm">
                    <strong>Aviso:</strong> Si este gasto está incluido en un borrador de factura, también se eliminará de la factura.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      setExpenseToDelete(null)
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleDelete}
                    disabled={deleting === expenseToDelete.id}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    {deleting === expenseToDelete.id ? 'Eliminando...' : 'Eliminar'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal after creating expense */}
      <AnimatePresence>
        {showSuccessModal && successInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowSuccessModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Gasto registrado
                </h3>
                <p className="text-gray-600">
                  Se ha registrado <strong>{successInfo.concept}</strong> en <strong>{successInfo.propertyName}</strong>
                </p>
              </div>

              <div className="bg-violet-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-violet-800">
                  <span className="font-medium">Siguiente paso:</span> Para revisar todos los gastos y facturar al propietario, ve a <strong>Facturación → {successInfo.propertyName}</strong> y revisa el mes de {new Date(successInfo.date).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowSuccessModal(false)}
                  className="flex-1"
                >
                  Añadir otro
                </Button>
                <Link href="/gestion/facturacion" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800">
                    Ir a Facturación
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
