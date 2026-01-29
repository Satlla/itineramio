'use client'

import { useState } from 'react'
import { Clock, ArrowRight, Mail, CheckCircle, AlertTriangle, Calculator, Home, Users, MessageSquare, Key, Bot, BookOpen, Sparkles, ClipboardList, Wrench, Star, Calendar } from 'lucide-react'
import Link from 'next/link'
import { Navbar } from '../../../../../src/components/layout/Navbar'
import { PrioritySelector } from '../../../../../src/components/forms/PrioritySelector'

interface CalculationResult {
  hoursPerMonth: number
  hoursPerYear: number
  moneyLostPerYear: number
  tasksAutomatable: number
  currentAutomation: number
  breakdown: {
    messages: number
    cleaning: number
    maintenance: number
    reviews: number
    calendar: number
    checkin: number
  }
}

export default function TimeCalculatorPage() {
  const [step, setStep] = useState<'form' | 'result' | 'email' | 'success'>('form')
  const [properties, setProperties] = useState(2)
  const [checkinsPerMonth, setCheckinsPerMonth] = useState(6)

  // Automatizaciones actuales
  const [hasAutonomousCheckin, setHasAutonomousCheckin] = useState(false)
  const [hasAutomatedMessages, setHasAutomatedMessages] = useState(false)
  const [hasDigitalGuide, setHasDigitalGuide] = useState(false)

  const [result, setResult] = useState<CalculationResult | null>(null)

  // Email form
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [prioridades, setPrioridades] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const calculateTime = () => {
    const totalCheckinsPerMonth = properties * checkinsPerMonth

    // TIEMPO POR RESERVA (en minutos) - DESGLOSE REALISTA
    const timePerBooking = {
      // Mensajes: pre-reserva + dudas + instrucciones + durante estancia + post
      messages: 25, // 5 mensajes × 5 min cada uno
      // Coordinar limpieza: avisar, confirmar, revisar fotos
      cleaning: 15,
      // Gestión de incidencias (promedio): algo se rompe, falta algo, queja
      maintenance: 10,
      // Responder/solicitar reseñas
      reviews: 8,
      // Actualizar calendario, precios, sincronizar plataformas
      calendar: 7,
      // Preparar check-in: enviar instrucciones, códigos, indicaciones
      checkin: 20
    }

    // Total minutos base por reserva
    let totalMinutesPerBooking =
      timePerBooking.messages +
      timePerBooking.cleaning +
      timePerBooking.maintenance +
      timePerBooking.reviews +
      timePerBooking.calendar +
      timePerBooking.checkin // = 85 minutos por reserva

    // Calcular reducción por automatizaciones actuales
    let automationReduction = 0
    let adjustedTime = { ...timePerBooking }

    if (hasAutonomousCheckin) {
      automationReduction += 0.15
      adjustedTime.checkin = Math.round(timePerBooking.checkin * 0.3) // Reduce 70%
    }
    if (hasAutomatedMessages) {
      automationReduction += 0.12
      adjustedTime.messages = Math.round(timePerBooking.messages * 0.5) // Reduce 50%
    }
    if (hasDigitalGuide) {
      automationReduction += 0.18
      adjustedTime.messages = Math.round(adjustedTime.messages * 0.6) // Reduce otro 40%
      adjustedTime.checkin = Math.round(adjustedTime.checkin * 0.5) // Reduce 50%
    }

    // Recalcular total con ajustes
    const adjustedMinutesPerBooking =
      adjustedTime.messages +
      adjustedTime.cleaning +
      adjustedTime.maintenance +
      adjustedTime.reviews +
      adjustedTime.calendar +
      adjustedTime.checkin

    // Cálculo final
    const totalMinutesPerMonth = totalCheckinsPerMonth * adjustedMinutesPerBooking
    const hoursPerMonth = totalMinutesPerMonth / 60
    const hoursPerYear = hoursPerMonth * 12

    // Valor económico
    const hourlyRate = 30 // Valor hora de un profesional
    const moneyLostPerYear = Math.round(hoursPerYear * hourlyRate)

    // Horas automatizables (lo que NO tiene automatizado)
    const tasksAutomatable = Math.round(hoursPerYear * 0.75) // 75% es automatizable

    // Breakdown anual
    const monthlyBreakdown = {
      messages: (totalCheckinsPerMonth * adjustedTime.messages) / 60,
      cleaning: (totalCheckinsPerMonth * adjustedTime.cleaning) / 60,
      maintenance: (totalCheckinsPerMonth * adjustedTime.maintenance) / 60,
      reviews: (totalCheckinsPerMonth * adjustedTime.reviews) / 60,
      calendar: (totalCheckinsPerMonth * adjustedTime.calendar) / 60,
      checkin: (totalCheckinsPerMonth * adjustedTime.checkin) / 60
    }

    setResult({
      hoursPerMonth: Math.round(hoursPerMonth * 10) / 10,
      hoursPerYear: Math.round(hoursPerYear),
      moneyLostPerYear,
      tasksAutomatable,
      currentAutomation: Math.round(automationReduction * 100),
      breakdown: {
        messages: Math.round(monthlyBreakdown.messages * 12),
        cleaning: Math.round(monthlyBreakdown.cleaning * 12),
        maintenance: Math.round(monthlyBreakdown.maintenance * 12),
        reviews: Math.round(monthlyBreakdown.reviews * 12),
        calendar: Math.round(monthlyBreakdown.calendar * 12),
        checkin: Math.round(monthlyBreakdown.checkin * 12)
      }
    })
    setStep('result')
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !name.trim()) return

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/tools/time-calculator/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          properties,
          checkinsPerMonth,
          hasAutonomousCheckin,
          hasAutomatedMessages,
          hasDigitalGuide,
          result,
          prioridades
        })
      })

      if (!response.ok) throw new Error('Error al enviar')

      setStep('success')
    } catch (err) {
      setError('Error al enviar. Inténtalo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-20 pb-16">
        <div className="max-w-2xl mx-auto px-4">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FF385C]/10 rounded-full mb-4">
              <Clock className="w-8 h-8 text-[#FF385C]" />
            </div>
            <h1 className="text-[32px] font-semibold text-[#222222] mb-2">
              Calculadora de Tiempo
            </h1>
            <p className="text-[#717171] text-lg">
              Descubre cuántas horas pierdes al año en gestión de reservas
            </p>
          </div>

          {/* Form Step */}
          {step === 'form' && (
            <div className="bg-white border border-[#DDDDDD] rounded-xl p-8">
              <div className="space-y-8">

                {/* Properties */}
                <div>
                  <label className="flex items-center gap-2 text-[#222222] font-medium mb-3">
                    <Home className="w-5 h-5 text-[#717171]" />
                    Número de propiedades
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={properties}
                      onChange={(e) => setProperties(Number(e.target.value))}
                      className="flex-1 h-2 bg-[#DDDDDD] rounded-lg appearance-none cursor-pointer accent-[#FF385C]"
                    />
                    <span className="w-12 text-center text-xl font-semibold text-[#222222]">
                      {properties}
                    </span>
                  </div>
                </div>

                {/* Check-ins per month */}
                <div>
                  <label className="flex items-center gap-2 text-[#222222] font-medium mb-3">
                    <Users className="w-5 h-5 text-[#717171]" />
                    Reservas por propiedad al mes
                  </label>
                  <p className="text-sm text-[#717171] mb-3">
                    Cuenta todas las reservas: cortas, largas, fines de semana...
                  </p>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={checkinsPerMonth}
                      onChange={(e) => setCheckinsPerMonth(Number(e.target.value))}
                      className="flex-1 h-2 bg-[#DDDDDD] rounded-lg appearance-none cursor-pointer accent-[#FF385C]"
                    />
                    <span className="w-12 text-center text-xl font-semibold text-[#222222]">
                      {checkinsPerMonth}
                    </span>
                  </div>
                </div>

                {/* Info box - what we calculate */}
                <div className="bg-[#F7F7F7] rounded-xl p-4">
                  <p className="text-sm font-medium text-[#222222] mb-2">
                    Calculamos el tiempo de:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm text-[#717171]">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>Mensajes y dudas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Coordinar limpieza</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4" />
                      <span>Incidencias</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      <span>Reseñas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Calendario y precios</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      <span>Check-in/check-out</span>
                    </div>
                  </div>
                </div>

                {/* Separator */}
                <div className="border-t border-[#DDDDDD] pt-6">
                  <p className="text-[#222222] font-medium mb-4">
                    ¿Qué tienes automatizado actualmente?
                  </p>

                  {/* Automation checkboxes */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 border border-[#DDDDDD] rounded-lg cursor-pointer hover:border-[#FF385C] transition-colors">
                      <input
                        type="checkbox"
                        checked={hasAutonomousCheckin}
                        onChange={(e) => setHasAutonomousCheckin(e.target.checked)}
                        className="w-5 h-5 accent-[#FF385C]"
                      />
                      <Key className="w-5 h-5 text-[#717171]" />
                      <div>
                        <span className="text-[#222222] font-medium">Check-in autónomo</span>
                        <p className="text-sm text-[#717171]">Caja de llaves, cerraduras inteligentes</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 border border-[#DDDDDD] rounded-lg cursor-pointer hover:border-[#FF385C] transition-colors">
                      <input
                        type="checkbox"
                        checked={hasAutomatedMessages}
                        onChange={(e) => setHasAutomatedMessages(e.target.checked)}
                        className="w-5 h-5 accent-[#FF385C]"
                      />
                      <Bot className="w-5 h-5 text-[#717171]" />
                      <div>
                        <span className="text-[#222222] font-medium">Mensajes automatizados</span>
                        <p className="text-sm text-[#717171]">Plantillas, respuestas guardadas</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 border border-[#DDDDDD] rounded-lg cursor-pointer hover:border-[#FF385C] transition-colors">
                      <input
                        type="checkbox"
                        checked={hasDigitalGuide}
                        onChange={(e) => setHasDigitalGuide(e.target.checked)}
                        className="w-5 h-5 accent-[#FF385C]"
                      />
                      <BookOpen className="w-5 h-5 text-[#717171]" />
                      <div>
                        <span className="text-[#222222] font-medium">Guía del apartamento</span>
                        <p className="text-sm text-[#717171]">PDF o manual digital</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Calculate Button */}
                <button
                  onClick={calculateTime}
                  className="w-full py-4 bg-[#FF385C] hover:bg-[#E31C5F] text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Calculator className="w-5 h-5" />
                  Calcular mi tiempo perdido
                </button>
              </div>
            </div>
          )}

          {/* Result Step */}
          {step === 'result' && result && (
            <div className="space-y-6">

              {/* Alert Box - IMPACTANTE */}
              <div className="bg-[#FEE2E2] border-2 border-[#EF4444] rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-8 h-8 text-[#DC2626] flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-[#991B1B] text-xl mb-1">
                      Estás perdiendo {result.hoursPerYear} horas al año
                    </h3>
                    <p className="text-[#B91C1C]">
                      Eso son <strong>{Math.round(result.hoursPerYear / 8)} días laborables</strong> dedicados a tareas repetitivas
                    </p>
                  </div>
                </div>
              </div>

              {/* Current automation */}
              {result.currentAutomation > 0 && (
                <div className="bg-[#F0FDF4] border border-[#86EFAC] rounded-xl p-4">
                  <p className="text-[#166534] text-sm">
                    <CheckCircle className="w-4 h-4 inline mr-2" />
                    Ya tienes un <strong>{result.currentAutomation}%</strong> automatizado
                  </p>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F7F7F7] rounded-xl p-6 text-center">
                  <p className="text-4xl font-bold text-[#222222]">{result.hoursPerMonth}h</p>
                  <p className="text-[#717171] text-sm mt-1">horas al mes</p>
                </div>
                <div className="bg-[#F7F7F7] rounded-xl p-6 text-center">
                  <p className="text-4xl font-bold text-[#222222]">{result.hoursPerYear}h</p>
                  <p className="text-[#717171] text-sm mt-1">horas al año</p>
                </div>
                <div className="bg-[#FEE2E2] rounded-xl p-6 text-center">
                  <p className="text-4xl font-bold text-[#DC2626]">{result.moneyLostPerYear.toLocaleString()}€</p>
                  <p className="text-[#991B1B] text-sm mt-1">valor perdido/año</p>
                </div>
                <div className="bg-[#DCFCE7] rounded-xl p-6 text-center">
                  <p className="text-4xl font-bold text-[#16A34A]">{result.tasksAutomatable}h</p>
                  <p className="text-[#166534] text-sm mt-1">automatizables</p>
                </div>
              </div>

              {/* Breakdown */}
              <div className="bg-white border border-[#DDDDDD] rounded-xl p-6">
                <h3 className="font-semibold text-[#222222] mb-4">
                  ¿Dónde se va tu tiempo? (horas/año)
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#717171]">
                      <MessageSquare className="w-4 h-4" />
                      <span>Mensajes y dudas</span>
                    </div>
                    <span className="font-semibold text-[#222222]">{result.breakdown.messages}h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#717171]">
                      <Key className="w-4 h-4" />
                      <span>Check-in / instrucciones</span>
                    </div>
                    <span className="font-semibold text-[#222222]">{result.breakdown.checkin}h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#717171]">
                      <Sparkles className="w-4 h-4" />
                      <span>Coordinar limpieza</span>
                    </div>
                    <span className="font-semibold text-[#222222]">{result.breakdown.cleaning}h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#717171]">
                      <Wrench className="w-4 h-4" />
                      <span>Incidencias/mantenimiento</span>
                    </div>
                    <span className="font-semibold text-[#222222]">{result.breakdown.maintenance}h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#717171]">
                      <Star className="w-4 h-4" />
                      <span>Gestión de reseñas</span>
                    </div>
                    <span className="font-semibold text-[#222222]">{result.breakdown.reviews}h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#717171]">
                      <Calendar className="w-4 h-4" />
                      <span>Calendario y precios</span>
                    </div>
                    <span className="font-semibold text-[#222222]">{result.breakdown.calendar}h</span>
                  </div>
                </div>
              </div>

              {/* What you could do */}
              <div className="bg-[#F0FDF4] border border-[#86EFAC] rounded-xl p-6">
                <h3 className="font-semibold text-[#166534] mb-4">
                  Con {result.hoursPerYear} horas podrías:
                </h3>
                <ul className="space-y-3 text-[#166534]">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5" />
                    Gestionar {Math.round(result.hoursPerYear / 20)} propiedades más
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5" />
                    Disfrutar {Math.round(result.hoursPerYear / 8)} días libres extra
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5" />
                    Ganar {result.moneyLostPerYear.toLocaleString()}€ en vez de perderlos
                  </li>
                </ul>
              </div>

              {/* CTA to get report */}
              <button
                onClick={() => setStep('email')}
                className="w-full py-4 bg-[#222222] hover:bg-[#000000] text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Mail className="w-5 h-5" />
                Recibir informe detallado por email
              </button>

              <p className="text-center text-[#717171] text-sm">
                Incluye: desglose completo + guía para automatizar cada tarea
              </p>
            </div>
          )}

          {/* Email Step */}
          {step === 'email' && (
            <div className="bg-white border border-[#DDDDDD] rounded-xl p-8">
              <div className="text-center mb-6">
                <Mail className="w-12 h-12 text-[#FF385C] mx-auto mb-3" />
                <h2 className="text-xl font-semibold text-[#222222]">
                  Recibe tu informe completo
                </h2>
                <p className="text-[#717171] mt-2">
                  Te enviamos el desglose detallado y consejos para recuperar ese tiempo
                </p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#222222] mb-1">
                    Tu nombre
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: María"
                    className="w-full px-4 py-3 border border-[#DDDDDD] rounded-lg focus:border-[#222222] focus:outline-none focus:ring-1 focus:ring-[#222222]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#222222] mb-1">
                    Tu email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full px-4 py-3 border border-[#DDDDDD] rounded-lg focus:border-[#222222] focus:outline-none focus:ring-1 focus:ring-[#222222]"
                    required
                  />
                </div>

                {/* Priority selector */}
                <PrioritySelector
                  selected={prioridades}
                  onChange={setPrioridades}
                  variant="compact"
                />

                {error && (
                  <p className="text-red-600 text-sm">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#FF385C] hover:bg-[#E31C5F] text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Enviar mi informe
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-[#717171] text-xs mt-4">
                Sin spam. Solo contenido útil para anfitriones.
              </p>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="bg-white border border-[#DDDDDD] rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-[#DCFCE7] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-[#16A34A]" />
              </div>
              <h2 className="text-xl font-semibold text-[#222222] mb-2">
                ¡Informe enviado!
              </h2>
              <p className="text-[#717171] mb-6">
                Revisa tu bandeja de entrada. Hemos incluido tu análisis completo y consejos para automatizar.
              </p>

              <div className="space-y-3">
                <Link
                  href="/register"
                  className="block w-full py-3 bg-[#FF385C] hover:bg-[#E31C5F] text-white font-semibold rounded-lg text-center transition-colors"
                >
                  Crear mi manual digital gratis
                </Link>
                <Link
                  href="/hub/tools"
                  className="block w-full py-3 border border-[#DDDDDD] text-[#222222] font-medium rounded-lg text-center hover:bg-[#F7F7F7] transition-colors"
                >
                  Ver más herramientas
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
