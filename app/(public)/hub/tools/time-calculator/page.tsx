'use client'

import { useState } from 'react'
import { Clock, ArrowRight, Mail, CheckCircle, AlertTriangle, TrendingDown, Calculator, Home, Users, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { Navbar } from '../../../../../src/components/layout/Navbar'

interface CalculationResult {
  hoursPerMonth: number
  hoursPerYear: number
  moneyLostPerYear: number
  tasksAutomatable: number
}

export default function TimeCalculatorPage() {
  const [step, setStep] = useState<'form' | 'result' | 'email' | 'success'>('form')
  const [properties, setProperties] = useState(1)
  const [checkinsPerMonth, setCheckinsPerMonth] = useState(4)
  const [minutesPerCheckin, setMinutesPerCheckin] = useState(30)
  const [result, setResult] = useState<CalculationResult | null>(null)

  // Email form
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const calculateTime = () => {
    const totalCheckinsPerMonth = properties * checkinsPerMonth
    const hoursPerMonth = (totalCheckinsPerMonth * minutesPerCheckin) / 60
    const hoursPerYear = hoursPerMonth * 12
    const hourlyRate = 25 // Valor hora promedio
    const moneyLostPerYear = Math.round(hoursPerYear * hourlyRate)
    const tasksAutomatable = Math.round(hoursPerYear * 0.8) // 80% automatizable

    setResult({
      hoursPerMonth: Math.round(hoursPerMonth * 10) / 10,
      hoursPerYear: Math.round(hoursPerYear),
      moneyLostPerYear,
      tasksAutomatable
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
          minutesPerCheckin,
          result
        })
      })

      if (!response.ok) throw new Error('Error al enviar')

      setStep('success')
    } catch (err) {
      setError('Error al enviar. Intentalo de nuevo.')
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
              Descubre cuantas horas pierdes en tareas repetitivas
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
                    Numero de propiedades
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
                    Check-ins por propiedad al mes
                  </label>
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

                {/* Minutes per check-in */}
                <div>
                  <label className="flex items-center gap-2 text-[#222222] font-medium mb-3">
                    <MessageSquare className="w-5 h-5 text-[#717171]" />
                    Minutos en mensajes/llamadas por reserva
                  </label>
                  <p className="text-sm text-[#717171] mb-3">
                    Incluye: explicar WiFi, electrodomesticos, parking, normas, resolver dudas...
                  </p>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="5"
                      max="120"
                      step="5"
                      value={minutesPerCheckin}
                      onChange={(e) => setMinutesPerCheckin(Number(e.target.value))}
                      className="flex-1 h-2 bg-[#DDDDDD] rounded-lg appearance-none cursor-pointer accent-[#FF385C]"
                    />
                    <span className="w-16 text-center text-xl font-semibold text-[#222222]">
                      {minutesPerCheckin} min
                    </span>
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

              {/* Alert Box */}
              <div className="bg-[#FEF3C7] border border-[#F59E0B] rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-[#D97706] flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-[#92400E] mb-1">
                      Estas perdiendo {result.hoursPerYear} horas al ano
                    </h3>
                    <p className="text-[#A16207] text-sm">
                      En tareas repetitivas que podrian automatizarse
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F7F7F7] rounded-xl p-6 text-center">
                  <p className="text-3xl font-bold text-[#222222]">{result.hoursPerMonth}h</p>
                  <p className="text-[#717171] text-sm mt-1">horas al mes</p>
                </div>
                <div className="bg-[#F7F7F7] rounded-xl p-6 text-center">
                  <p className="text-3xl font-bold text-[#222222]">{result.hoursPerYear}h</p>
                  <p className="text-[#717171] text-sm mt-1">horas al ano</p>
                </div>
                <div className="bg-[#FEE2E2] rounded-xl p-6 text-center">
                  <p className="text-3xl font-bold text-[#DC2626]">{result.moneyLostPerYear}€</p>
                  <p className="text-[#991B1B] text-sm mt-1">valor perdido/ano</p>
                </div>
                <div className="bg-[#DCFCE7] rounded-xl p-6 text-center">
                  <p className="text-3xl font-bold text-[#16A34A]">{result.tasksAutomatable}h</p>
                  <p className="text-[#166534] text-sm mt-1">automatizables</p>
                </div>
              </div>

              {/* What you could do */}
              <div className="bg-white border border-[#DDDDDD] rounded-xl p-6">
                <h3 className="font-semibold text-[#222222] mb-4">
                  Con {result.hoursPerYear} horas podrias:
                </h3>
                <ul className="space-y-3 text-[#717171]">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#16A34A]" />
                    Conseguir {Math.round(result.hoursPerYear / 5)} nuevas propiedades
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#16A34A]" />
                    Mejorar tus anuncios y fotos
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#16A34A]" />
                    Disfrutar de {Math.round(result.hoursPerYear / 8)} dias libres mas
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#16A34A]" />
                    Responder solo lo importante
                  </li>
                </ul>
              </div>

              {/* CTA to get report */}
              <button
                onClick={() => setStep('email')}
                className="w-full py-4 bg-[#222222] hover:bg-[#000000] text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Mail className="w-5 h-5" />
                Recibir informe completo por email
              </button>

              <p className="text-center text-[#717171] text-sm">
                Incluye: desglose detallado + guia para automatizar
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
                    placeholder="Ej: Maria"
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
                Sin spam. Solo contenido util para anfitriones.
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
                Informe enviado
              </h2>
              <p className="text-[#717171] mb-6">
                Revisa tu bandeja de entrada. Hemos incluido tu analisis completo y consejos para automatizar.
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
                  Ver mas herramientas
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
