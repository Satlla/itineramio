'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Briefcase,
  Check,
  Building2,
  FileText,
  Receipt,
  Users,
  BarChart3,
  CalendarDays,
  Sparkles,
  Shield,
  Zap
} from 'lucide-react'
import { MODULES } from '@/config/modules'
import { toast } from 'react-hot-toast'

type BillingPeriod = 'MONTHLY' | 'SEMESTRAL' | 'YEARLY'

const BILLING_OPTIONS: Record<BillingPeriod, { label: string; months: number; discount: number; badge?: string }> = {
  MONTHLY: { label: 'Mensual', months: 1, discount: 0 },
  SEMESTRAL: { label: 'Semestral', months: 6, discount: 10, badge: '-10%' },
  YEARLY: { label: 'Anual', months: 12, discount: 20, badge: '-20%' }
}

const FEATURES = [
  {
    icon: Users,
    title: 'Gestión de Propietarios',
    description: 'Centraliza la información de tus clientes propietarios'
  },
  {
    icon: CalendarDays,
    title: 'Importación de Reservas',
    description: 'Importa automáticamente desde Airbnb, Booking y otros'
  },
  {
    icon: FileText,
    title: 'Facturas Automáticas',
    description: 'Genera facturas conformes a normativa española'
  },
  {
    icon: Receipt,
    title: 'Liquidaciones Mensuales',
    description: 'Crea liquidaciones detalladas para propietarios'
  },
  {
    icon: Building2,
    title: 'Control de Gastos',
    description: 'Registra y categoriza gastos por propiedad'
  },
  {
    icon: BarChart3,
    title: 'Informes de Rentabilidad',
    description: 'Analiza el rendimiento de cada propiedad'
  }
]

export default function GestionModulePage() {
  const router = useRouter()
  const [selectedPeriod, setSelectedPeriod] = useState<BillingPeriod>('MONTHLY')
  const [loading, setLoading] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)

  const module = MODULES.GESTION
  const basePrice = module.basePriceMonthly || 8

  const calculatePrice = (period: BillingPeriod): number => {
    const { months, discount } = BILLING_OPTIONS[period]
    const total = basePrice * months
    return total * (1 - discount / 100)
  }

  const getPricePerMonth = (period: BillingPeriod): number => {
    const total = calculatePrice(period)
    return total / BILLING_OPTIONS[period].months
  }

  const handleActivate = async () => {
    setLoading(true)

    try {
      // Por ahora, mostrar formulario de contacto
      // En el futuro, esto conectará con Stripe
      setShowContactForm(true)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al procesar la solicitud')
    } finally {
      setLoading(false)
    }
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simular envío - en producción esto enviaría un email
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('¡Solicitud enviada! Te contactaremos pronto.')
      setShowContactForm(false)
      router.push('/account')
    } catch (error) {
      toast.error('Error al enviar la solicitud')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white" style={{ paddingTop: 'calc(4rem + env(safe-area-inset-top, 0px))' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-medium">Volver</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: `${module.color}15` }}
          >
            <Briefcase className="w-10 h-10" style={{ color: module.color }} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {module.name}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {module.description}
          </p>
        </div>

        {/* Pricing Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-12">
          {/* Period Selector */}
          <div className="bg-gray-50 p-4 border-b border-gray-100">
            <div className="flex justify-center gap-2">
              {(Object.keys(BILLING_OPTIONS) as BillingPeriod[]).map((period) => {
                const option = BILLING_OPTIONS[period]
                const isSelected = selectedPeriod === period
                return (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`relative px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {option.label}
                    {option.badge && (
                      <span className={`absolute -top-2 -right-2 px-1.5 py-0.5 text-xs font-bold rounded-full ${
                        isSelected ? 'bg-yellow-400 text-yellow-900' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {option.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Price Display */}
          <div className="p-8 text-center">
            <div className="flex items-baseline justify-center gap-2 mb-2">
              <span className="text-5xl font-bold text-gray-900">
                {calculatePrice(selectedPeriod).toFixed(2).replace('.', ',')}€
              </span>
              <span className="text-gray-500">
                / {BILLING_OPTIONS[selectedPeriod].months === 1 ? 'mes' : `${BILLING_OPTIONS[selectedPeriod].months} meses`}
              </span>
            </div>
            {selectedPeriod !== 'MONTHLY' && (
              <p className="text-emerald-600 font-medium">
                Solo {getPricePerMonth(selectedPeriod).toFixed(2).replace('.', ',')}€/mes
              </p>
            )}

            {/* Benefits */}
            <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-500" />
                Sin límite de propiedades
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-500" />
                Cancela cuando quieras
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                Soporte prioritario
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleActivate}
              disabled={loading}
              className="mt-8 w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Procesando...' : 'Activar Gestión de Alquileres'}
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Todo lo que incluye
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {FEATURES.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-5 border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${module.color}15` }}
                  >
                    <feature.icon className="w-5 h-5" style={{ color: module.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ or Trust Section */}
        <div className="bg-emerald-50 rounded-2xl p-6 md:p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            ¿Tienes dudas?
          </h3>
          <p className="text-gray-600 mb-4">
            Escríbenos y te ayudamos a decidir si Gestión es para ti.
          </p>
          <a
            href="mailto:hola@itineramio.com?subject=Consulta sobre módulo Gestión"
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            hola@itineramio.com
          </a>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Activar Gestión de Alquileres
            </h3>
            <p className="text-gray-600 mb-6">
              Déjanos tus datos y te activamos el módulo en menos de 24h.
            </p>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="tu@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan seleccionado
                </label>
                <input
                  type="text"
                  readOnly
                  value={`${BILLING_OPTIONS[selectedPeriod].label} - ${calculatePrice(selectedPeriod).toFixed(2)}€`}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensaje (opcional)
                </label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                  placeholder="¿Cuántas propiedades gestionas?"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Enviando...' : 'Enviar solicitud'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
