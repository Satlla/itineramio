'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Calendar, Clock, Video, CheckCircle2, Loader2, ArrowRight, User, Mail, Building2, MessageSquare } from 'lucide-react'

interface Slot {
  date: string
  label: string
  times: string[]
}

export default function ConsultaPage() {
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [slots, setSlots] = useState<Slot[]>([])

  const [formData, setFormData] = useState({
    name: '',
    email: searchParams.get('email') || '',
    properties: '',
    challenge: '',
    selectedDate: '',
    selectedTime: ''
  })

  // Fetch available slots from API
  useEffect(() => {
    async function fetchSlots() {
      try {
        const res = await fetch('/api/consulta/slots')
        if (res.ok) {
          const data = await res.json()
          setSlots(data.slots || [])
        }
      } catch (err) {
        console.error('Error fetching slots:', err)
      } finally {
        setLoadingSlots(false)
      }
    }
    fetchSlots()
  }, [])

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/consulta/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          source: searchParams.get('src') || 'direct',
          sourceLevel: searchParams.get('level') || null
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al agendar')
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agendar la llamada')
    } finally {
      setLoading(false)
    }
  }

  // Pre-fill email from URL if coming from funnel
  useEffect(() => {
    const email = searchParams.get('email')
    if (email) {
      setFormData(prev => ({ ...prev, email }))
    }
  }, [searchParams])

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            ¡Llamada agendada!
          </h1>
          <p className="text-gray-600 mb-6">
            Te he enviado un email de confirmación con los detalles y el link para la videollamada.
          </p>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-left">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-5 h-5 text-violet-600" />
              <span className="font-medium">
                {new Date(formData.selectedDate).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm mt-2">
              <Clock className="w-5 h-5 text-violet-600" />
              <span className="font-medium">{formData.selectedTime}h (hora España)</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            Si necesitas cambiar la fecha, responde al email de confirmación.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-blue-50">
      {/* Hero */}
      <section className="pt-12 pb-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span className="line-through text-green-600/60 mr-1">99€</span>
            <span className="font-bold">GRATIS</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Sesión de creación de tu Manual Digital
          </h1>

          <p className="text-lg text-gray-600">
            30 minutos donde analizamos tu operativa actual, identificamos mejoras y creamos el esquema de tu manual digital personalizado.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="pb-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center mb-3">
                <Building2 className="w-5 h-5 text-violet-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Análisis de tu operativa</h3>
              <p className="text-sm text-gray-600">
                Revisamos cómo gestionas tu alojamiento y detectamos áreas de mejora.
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Tu Manual Digital</h3>
              <p className="text-sm text-gray-600">
                Creamos juntos el esquema de tu manual con instrucciones y procesos.
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Plan de acción</h3>
              <p className="text-sm text-gray-600">
                Te llevas pasos concretos para implementar desde el día siguiente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Progress */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 ${step >= 1 ? 'text-violet-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    step >= 1 ? 'bg-violet-600 text-white' : 'bg-gray-200'
                  }`}>
                    1
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">Tus datos</span>
                </div>
                <div className="flex-1 h-1 bg-gray-200 rounded">
                  <div className={`h-full bg-violet-600 rounded transition-all ${step >= 2 ? 'w-full' : 'w-0'}`} />
                </div>
                <div className={`flex items-center gap-2 ${step >= 2 ? 'text-violet-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    step >= 2 ? 'bg-violet-600 text-white' : 'bg-gray-200'
                  }`}>
                    2
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">Fecha y hora</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <User className="w-4 h-4 inline mr-1" />
                      Tu nombre
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: María García"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="tu@email.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Building2 className="w-4 h-4 inline mr-1" />
                      ¿Cuántas propiedades gestionas?
                    </label>
                    <select
                      value={formData.properties}
                      onChange={(e) => setFormData({ ...formData, properties: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    >
                      <option value="">Selecciona...</option>
                      <option value="1">1 propiedad</option>
                      <option value="2-3">2-3 propiedades</option>
                      <option value="4-5">4-5 propiedades</option>
                      <option value="6-10">6-10 propiedades</option>
                      <option value="10+">Más de 10</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <MessageSquare className="w-4 h-4 inline mr-1" />
                      ¿Cuál es tu mayor reto ahora mismo? (opcional)
                    </label>
                    <textarea
                      value={formData.challenge}
                      onChange={(e) => setFormData({ ...formData, challenge: e.target.value })}
                      placeholder="Ej: No tengo tiempo para responder mensajes, quiero automatizar..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (!formData.name || !formData.email || !formData.properties) {
                        setError('Por favor completa los campos obligatorios')
                        return
                      }
                      setError('')
                      setStep(2)
                    }}
                    className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    Elegir fecha y hora
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  {error && (
                    <p className="text-red-600 text-sm text-center">{error}</p>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <button
                    onClick={() => setStep(1)}
                    className="text-sm text-gray-600 hover:text-gray-900 mb-2"
                  >
                    ← Volver
                  </button>

                  {loadingSlots ? (
                    <div className="py-8 text-center text-gray-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Cargando horarios disponibles...
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="py-8 text-center text-gray-500">
                      <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>No hay horarios disponibles en los próximos días.</p>
                      <p className="text-sm mt-1">Por favor, inténtalo más tarde.</p>
                    </div>
                  ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Selecciona un día
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {slots.slice(0, 6).map((slot) => (
                        <button
                          key={slot.date}
                          onClick={() => setFormData({ ...formData, selectedDate: slot.date, selectedTime: '' })}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            formData.selectedDate === slot.date
                              ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-500'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-xs text-gray-500 capitalize">
                            {new Date(slot.date).toLocaleDateString('es-ES', { weekday: 'short' })}
                          </div>
                          <div className="font-semibold text-gray-900">
                            {new Date(slot.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  )}

                  {formData.selectedDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Selecciona una hora (España peninsular)
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {slots.find(s => s.date === formData.selectedDate)?.times.map((time) => (
                          <button
                            key={time}
                            onClick={() => setFormData({ ...formData, selectedTime: time })}
                            className={`p-3 rounded-lg border font-medium transition-all ${
                              formData.selectedTime === time
                                ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-500 text-violet-700'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.selectedDate && formData.selectedTime && (
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Agendando...
                        </>
                      ) : (
                        <>
                          <Video className="w-5 h-5" />
                          Confirmar videollamada
                        </>
                      )}
                    </button>
                  )}

                  {error && (
                    <p className="text-red-600 text-sm text-center">{error}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Trust elements */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Videollamada por Google Meet · 30 minutos · Sin compromiso</p>
          </div>
        </div>
      </section>
    </div>
  )
}
