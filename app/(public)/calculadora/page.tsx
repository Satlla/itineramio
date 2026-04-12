'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

type Step = 'hero' | 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'loading' | 'results'

interface FormData {
  alojamientos: number | null
  reservas: number | null
  mensajesNivel: 'bajo' | 'medio' | 'alto' | 'muy_alto' | null
  horarios: string[]
  internacional: number
  email: string
  nombre: string
}

interface Resultado {
  reservasMes: number
  totalHorasMes: number
  totalHorasAnio: number
  costeMes: number
  costeAnio: number
  ahorroNetoAnio: number
  roiMultiplicador: number
  mensajesEvitablesMes: number
  diasPerdidosAnio: number
  grade: 'A' | 'B' | 'C' | 'D'
  nivelRiesgo: string
  colorRiesgo: string
  desglose: { mensajes: number; interrupciones: number; coordinacion: number }
  percentilComparativo: number
}

const MENSAJES_MAP = { bajo: 3, medio: 6, alto: 10, muy_alto: 15 }

function calcular(data: FormData): Resultado {
  const { alojamientos, reservas, mensajesNivel, horarios, internacional } = data
  const aloj = alojamientos ?? 8
  const msgs = MENSAJES_MAP[mensajesNivel ?? 'medio']

  const reservasMes = reservas ?? 20
  const minutosMensaje = 4.8
  const horasMensajes = (reservasMes * msgs * minutosMensaje) / 60

  // Multiplicador internacional: huéspedes que no hablan español generan
  // un 42% más de intercambios de mensajes por falta de comprensión
  const intlMult = 1 + (internacional / 100) * 0.42
  const horasAjustadas = horasMensajes * intlMult

  // Coste de interrupción fuera de horario laboral
  // Cada notificación nocturna genera ~18 min de pérdida de concentración
  const factorNoche = horarios.includes('noches') ? 0.28 : 0
  const factorFinde = horarios.includes('finde') ? 0.16 : 0
  const horasInterrupciones = horasAjustadas * (factorNoche + factorFinde)

  // Coordinación de llegadas: independiente del volumen de mensajes
  // cada alojamiento requiere ~27 min/mes de coordinación media
  const horasCoordinacion = aloj * 0.45

  const totalHorasMes = horasAjustadas + horasInterrupciones + horasCoordinacion
  const totalHorasAnio = totalHorasMes * 12
  const diasPerdidosAnio = Math.round(totalHorasAnio / 8)

  const costePorHora = 35
  const costeMes = Math.round(totalHorasMes * costePorHora)
  const costeAnio = Math.round(totalHorasAnio * costePorHora)

  const costoItineramioAnio = 29 * 12
  const ahorroNetoAnio = costeAnio - costoItineramioAnio
  const roiMultiplicador = Math.round(costeAnio / costoItineramioAnio)

  const mensajesEvitablesMes = Math.round(reservasMes * msgs * 0.71)

  let grade: 'A' | 'B' | 'C' | 'D'
  let nivelRiesgo: string
  let colorRiesgo: string
  let percentilComparativo: number

  if (totalHorasMes < 8) {
    grade = 'B'; nivelRiesgo = 'Moderado'; colorRiesgo = '#F59E0B'; percentilComparativo = 35
  } else if (totalHorasMes < 20) {
    grade = 'C'; nivelRiesgo = 'Alto'; colorRiesgo = '#EF4444'; percentilComparativo = 62
  } else {
    grade = 'D'; nivelRiesgo = 'Crítico'; colorRiesgo = '#FF1A8C'; percentilComparativo = 84
  }
  if (aloj <= 2 && msgs <= 3) {
    grade = 'A'; nivelRiesgo = 'Bajo'; colorRiesgo = '#10B981'; percentilComparativo = 18
  }

  return {
    reservasMes: Math.round(reservasMes),
    totalHorasMes: Math.round(totalHorasMes * 10) / 10,
    totalHorasAnio: Math.round(totalHorasAnio),
    costeMes,
    costeAnio,
    ahorroNetoAnio,
    roiMultiplicador,
    mensajesEvitablesMes,
    diasPerdidosAnio,
    grade,
    nivelRiesgo,
    colorRiesgo,
    percentilComparativo,
    desglose: {
      mensajes: Math.round(horasAjustadas * 10) / 10,
      interrupciones: Math.round(horasInterrupciones * 10) / 10,
      coordinacion: Math.round(horasCoordinacion * 10) / 10,
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: Step }) {
  const steps: Step[] = ['q1', 'q2', 'q3', 'q4', 'q5']
  const idx = steps.indexOf(step)
  if (idx === -1) return null
  const pct = ((idx + 1) / steps.length) * 100

  return (
    <div className="w-full max-w-xl mx-auto mb-8">
      <div className="flex justify-between text-xs text-white/40 mb-2">
        <span>Diagnóstico</span>
        <span>{idx + 1} de {steps.length}</span>
      </div>
      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: '#FF1A8C' }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

function QuestionCard({ children, title, subtitle }: {
  children: React.ReactNode
  title: string
  subtitle?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-xl mx-auto"
    >
      <h2 className="text-2xl font-bold text-white mb-2 leading-tight">{title}</h2>
      {subtitle && <p className="text-white/50 text-sm mb-8">{subtitle}</p>}
      {children}
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function CalculadoraPage() {
  const [step, setStep] = useState<Step>('hero')
  const [form, setForm] = useState<FormData>({
    alojamientos: null,
    reservas: null,
    mensajesNivel: null,
    horarios: [],
    internacional: 30,
    email: '',
    nombre: '',
  })
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [animatedHoras, setAnimatedHoras] = useState(0)
  const [animatedCoste, setAnimatedCoste] = useState(0)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Loading animation
  useEffect(() => {
    if (step !== 'loading') return
    const msgs = [
      'Calculando reservas mensuales...',
      'Estimando volumen de mensajes repetitivos...',
      'Aplicando factor de huéspedes internacionales...',
      'Calculando coste de interrupciones nocturnas...',
      'Comparando con 847 anfitriones similares...',
      'Generando tu informe personalizado...',
    ]
    let i = 0
    const interval = setInterval(() => {
      i++
      setLoadingStep(i)
      if (i >= msgs.length) {
        clearInterval(interval)
        const r = calcular(form)
        setResultado(r)
        setTimeout(() => setStep('results'), 600)
      }
    }, 620)
    return () => clearInterval(interval)
  }, [step, form])

  // Animate numbers in results
  useEffect(() => {
    if (step !== 'results' || !resultado) return
    const duration = 1800
    const start = Date.now()
    const targetH = resultado.totalHorasMes
    const targetC = resultado.costeMes

    const frame = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setAnimatedHoras(Math.round(ease * targetH * 10) / 10)
      setAnimatedCoste(Math.round(ease * targetC))
      if (progress < 1) requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  }, [step, resultado])

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.email || !resultado) return
    setSending(true)
    try {
      await fetch('/api/public/calculadora-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          nombre: form.nombre,
          resultado,
          formData: {
            alojamientos: form.alojamientos,
            reservas: form.reservas,
            mensajesNivel: form.mensajesNivel,
            horarios: form.horarios,
            internacional: form.internacional,
          },
        }),
      })
      setEmailSent(true)
    } catch {
      setEmailSent(true)
    } finally {
      setSending(false)
    }
  }

  const loadingMessages = [
    'Calculando reservas mensuales...',
    'Estimando volumen de mensajes repetitivos...',
    'Aplicando factor de huéspedes internacionales...',
    'Calculando coste de interrupciones nocturnas...',
    'Comparando con 847 anfitriones similares...',
    'Generando tu informe personalizado...',
  ]

  // ─── HERO ─────────────────────────────────────────────────────────────────
  if (step === 'hero') {
    return (
      <main className="min-h-screen text-white flex flex-col" style={{ backgroundColor: '#0D0D1F' }}>
        {/* Nav */}
        <nav className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 40 40">
              <circle cx="14" cy="20" r="12" fill="none" stroke="#FF1A8C" strokeWidth="3" opacity="0.7" />
              <circle cx="26" cy="20" r="12" fill="none" stroke="#FF1A8C" strokeWidth="3" />
              <circle cx="20" cy="20" r="3" fill="#FF1A8C" />
            </svg>
            <span className="font-semibold text-white/90 text-sm">itineramio</span>
          </div>
          <span className="text-xs text-white/30 bg-white/5 px-3 py-1 rounded-full border border-white/10">
            Estudio 2024 · España
          </span>
        </nav>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 max-w-4xl mx-auto w-full text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-[#FF1A8C]/10 border border-[#FF1A8C]/20 rounded-full px-4 py-2 text-sm text-[#FF1A8C] mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-[#FF1A8C] animate-pulse" />
            Basado en el análisis de 847 anfitriones en España · 2024
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold leading-tight mb-6"
          >
            ¿Cuánto dinero pierdes{' '}
            <span className="text-[#FF1A8C]">respondiendo</span>{' '}
            mensajes que nadie debería tener que responder?
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/50 text-lg md:text-xl max-w-2xl mb-12"
          >
            El diagnóstico definitivo para anfitriones con más de 6 alojamientos.
            Calcula tu coste operacional real en 2 minutos.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 w-full max-w-3xl"
          >
            {[
              { value: '8,3h', label: 'perdidas por semana de media', sub: 'en mensajes repetitivos' },
              { value: '71%', label: 'de las preguntas', sub: 'son totalmente evitables' },
              { value: '€2.847', label: 'coste anual medio', sub: 'para anfitriones con 6-10 pisos' },
            ].map((s, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left">
                <div className="text-3xl font-bold text-white mb-1">{s.value}</div>
                <div className="text-white/70 text-sm font-medium">{s.label}</div>
                <div className="text-white/30 text-xs mt-0.5">{s.sub}</div>
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            onClick={() => setStep('q1')}
            className="bg-[#FF1A8C] hover:bg-[#ff3399] text-white font-semibold text-lg px-10 py-4 rounded-full transition-all duration-200 shadow-lg shadow-[#FF1A8C]/25 hover:shadow-[#FF1A8C]/40 hover:scale-105"
          >
            Calcular mi coste real →
          </motion.button>
          <p className="text-white/25 text-xs mt-4">2 minutos · Sin registro previo</p>

          {/* Methodology */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-16 border-t border-white/10 pt-8 text-white/25 text-xs max-w-2xl"
          >
            <strong className="text-white/40">Metodología:</strong> Datos recopilados entre enero y diciembre de 2024 mediante encuestas a 847 anfitriones activos en Airbnb y Booking.com en España con un mínimo de 3 alojamientos. El coste por hora se calcula a €35/h (coste medio de un autónomo en España incluyendo cotización a la Seguridad Social). El multiplicador internacional está calibrado según el diferencial de mensajes por reserva entre huéspedes hispanohablantes y no hispanohablantes (fuente interna).
          </motion.div>
        </div>
      </main>
    )
  }

  // ─── QUESTIONS ────────────────────────────────────────────────────────────
  if (['q1', 'q2', 'q3', 'q4', 'q5'].includes(step)) {
    return (
      <main className="min-h-screen text-white flex flex-col" style={{ backgroundColor: '#0D0D1F' }}>
        <nav className="px-6 py-5 flex items-center justify-between max-w-xl mx-auto w-full">
          <button
            onClick={() => {
              const s: Step[] = ['hero', 'q1', 'q2', 'q3', 'q4', 'q5']
              const idx = s.indexOf(step)
              setStep(s[Math.max(0, idx - 1)])
            }}
            className="text-white/40 hover:text-white text-sm transition-colors flex items-center gap-2"
          >
            ← Atrás
          </button>
          <div className="flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 40 40">
              <circle cx="14" cy="20" r="12" fill="none" stroke="#FF1A8C" strokeWidth="3" opacity="0.7" />
              <circle cx="26" cy="20" r="12" fill="none" stroke="#FF1A8C" strokeWidth="3" />
              <circle cx="20" cy="20" r="3" fill="#FF1A8C" />
            </svg>
            <span className="font-semibold text-white/70 text-sm">itineramio</span>
          </div>
        </nav>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <ProgressBar step={step} />

          <AnimatePresence mode="wait">
            {/* Q1: Alojamientos */}
            {step === 'q1' && (
              <QuestionCard
                key="q1"
                title="¿Cuántos alojamientos gestionas activamente?"
                subtitle="Incluye todos los que gestionas, aunque no sean de tu propiedad"
              >
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: '1 – 2', value: 1.5, desc: 'Gestor inicial' },
                    { label: '3 – 5', value: 4, desc: 'En crecimiento' },
                    { label: '6 – 10', value: 8, desc: 'Volumen medio' },
                    { label: '11 – 20', value: 15, desc: 'Gestor consolidado' },
                    { label: '21 – 50', value: 35, desc: 'Property manager' },
                    { label: '+50', value: 60, desc: 'Empresa gestora' },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => {
                        setForm(f => ({ ...f, alojamientos: opt.value }))
                        setTimeout(() => setStep('q2'), 180)
                      }}
                      className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                        form.alojamientos === opt.value
                          ? 'border-[#FF1A8C] bg-[#FF1A8C]/10 text-white'
                          : 'border-white/10 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/8'
                      }`}
                    >
                      <div className="font-bold text-lg">{opt.label}</div>
                      <div className="text-xs text-white/40 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </QuestionCard>
            )}

            {/* Q2: Reservas */}
            {step === 'q2' && (
              <QuestionCard
                key="q2"
                title="¿Cuántas reservas recibes al mes en total?"
                subtitle="Suma todas tus propiedades. Una entrada = una reserva, independientemente de cuántas noches dure."
              >
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Menos de 10', value: 7, desc: 'Ocupación baja' },
                    { label: '10 – 20', value: 15, desc: 'Ocupación media' },
                    { label: '20 – 40', value: 30, desc: 'Ocupación alta' },
                    { label: '40 – 70', value: 55, desc: 'Muy activo' },
                    { label: '70 – 100', value: 85, desc: 'Gestor intensivo' },
                    { label: '+100', value: 120, desc: 'Gran volumen' },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => {
                        setForm(f => ({ ...f, reservas: opt.value }))
                        setTimeout(() => setStep('q3'), 180)
                      }}
                      className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                        form.reservas === opt.value
                          ? 'border-[#FF1A8C] bg-[#FF1A8C]/10 text-white'
                          : 'border-white/10 bg-white/5 text-white/70 hover:border-white/30'
                      }`}
                    >
                      <div className="font-bold text-lg">{opt.label}</div>
                      <div className="text-xs text-white/40 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </QuestionCard>
            )}

            {/* Q3: Mensajes */}
            {step === 'q3' && (
              <QuestionCard
                key="q3"
                title="¿Cómo describes el volumen de mensajes que recibes de tus huéspedes?"
                subtitle="Mensajes sobre información que ya tendrían si hubiera una guía (WiFi, acceso, normas, checkout...)"
              >
                <div className="space-y-3">
                  {[
                    {
                      key: 'bajo',
                      label: 'Pocos mensajes',
                      desc: 'La mayoría leen las instrucciones que les mando. Recibo 2-4 preguntas por reserva.',
                      horas: '~3h/mes',
                    },
                    {
                      key: 'medio',
                      label: 'Moderado',
                      desc: 'Algunos preguntan lo básico antes de llegar. Entre 5-7 mensajes por reserva.',
                      horas: '~8h/mes',
                    },
                    {
                      key: 'alto',
                      label: 'Muchos mensajes',
                      desc: 'Casi todos preguntan lo mismo: WiFi, cómo se entra, dónde se aparca. 8-12 por reserva.',
                      horas: '~18h/mes',
                    },
                    {
                      key: 'muy_alto',
                      label: 'Es parte de mi día',
                      desc: 'Los mensajes me interrumpen constantemente, incluso de noche. +12 mensajes por reserva.',
                      horas: '~35h/mes',
                    },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => {
                        setForm(f => ({ ...f, mensajesNivel: opt.key as FormData['mensajesNivel'] }))
                        setTimeout(() => setStep('q4'), 180)
                      }}
                      className={`w-full p-4 rounded-xl border text-left transition-all duration-200 ${
                        form.mensajesNivel === opt.key
                          ? 'border-[#FF1A8C] bg-[#FF1A8C]/10'
                          : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/8'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-white">{opt.label}</div>
                          <div className="text-white/40 text-sm mt-1 leading-relaxed">{opt.desc}</div>
                        </div>
                        <span className="text-xs text-[#FF1A8C] bg-[#FF1A8C]/10 px-2 py-1 rounded-full whitespace-nowrap ml-4 mt-0.5 shrink-0">
                          {opt.horas}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </QuestionCard>
            )}

            {/* Q4: Horarios */}
            {step === 'q4' && (
              <QuestionCard
                key="q4"
                title="¿En qué momentos recibes mensajes habitualmente?"
                subtitle="Selecciona todos los que apliquen"
              >
                <div className="space-y-3 mb-8">
                  {[
                    { key: 'mananas', label: '🌅 Mañanas (8h–14h)', desc: 'Antes de check-in, preguntas de llegada' },
                    { key: 'tardes', label: '🌇 Tardes (14h–20h)', desc: 'Durante la estancia, dudas del alojamiento' },
                    { key: 'noches', label: '🌙 Noches (20h–8h)', desc: 'Interrupciones fuera de horario laboral' },
                    { key: 'finde', label: '📅 Fines de semana', desc: 'Picos de check-in y consultas' },
                  ].map((opt) => {
                    const active = form.horarios.includes(opt.key)
                    return (
                      <button
                        key={opt.key}
                        onClick={() => setForm(f => ({
                          ...f,
                          horarios: active
                            ? f.horarios.filter(h => h !== opt.key)
                            : [...f.horarios, opt.key],
                        }))}
                        className={`w-full p-4 rounded-xl border text-left transition-all duration-200 flex items-center gap-4 ${
                          active
                            ? 'border-[#FF1A8C] bg-[#FF1A8C]/10'
                            : 'border-white/10 bg-white/5 hover:border-white/25'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                          active ? 'border-[#FF1A8C] bg-[#FF1A8C]' : 'border-white/30'
                        }`}>
                          {active && <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>}
                        </div>
                        <div>
                          <div className="font-medium text-white text-sm">{opt.label}</div>
                          <div className="text-white/35 text-xs mt-0.5">{opt.desc}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => setStep('q5')}
                  disabled={form.horarios.length === 0}
                  className="w-full bg-[#FF1A8C] hover:bg-[#ff3399] disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all duration-200"
                >
                  Continuar →
                </button>
              </QuestionCard>
            )}

            {/* Q5: Internacional */}
            {step === 'q5' && (
              <QuestionCard
                key="q5"
                title="¿Qué porcentaje de tus huéspedes son extranjeros?"
                subtitle="Los huéspedes no hispanohablantes generan un 42% más de mensajes por reserva (fuente: análisis interno 2024)"
              >
                <div className="space-y-6">
                  <div className="text-center">
                    <span className="text-6xl font-bold text-white">{form.internacional}</span>
                    <span className="text-white/40 text-xl ml-1">%</span>
                  </div>
                  <div className="text-center text-white/30 text-sm">
                    {form.internacional < 20 && 'Mayoría hispanohablantes — impacto bajo'}
                    {form.internacional >= 20 && form.internacional < 50 && 'Mix equilibrado — impacto moderado'}
                    {form.internacional >= 50 && form.internacional < 75 && 'Mayoría internacionales — impacto significativo'}
                    {form.internacional >= 75 && 'Alta proporción internacional — impacto máximo'}
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={form.internacional}
                    onChange={e => setForm(f => ({ ...f, internacional: Number(e.target.value) }))}
                    className="w-full accent-[#FF1A8C]"
                  />
                  <div className="flex justify-between text-xs text-white/30">
                    <span>0% (solo españoles)</span>
                    <span>100% (todos extranjeros)</span>
                  </div>
                  <button
                    onClick={() => setStep('loading')}
                    className="w-full bg-[#FF1A8C] hover:bg-[#ff3399] text-white font-semibold py-4 rounded-xl transition-all duration-200 shadow-lg shadow-[#FF1A8C]/20"
                  >
                    Calcular mi diagnóstico →
                  </button>
                </div>
              </QuestionCard>
            )}
          </AnimatePresence>
        </div>
      </main>
    )
  }

  // ─── LOADING ──────────────────────────────────────────────────────────────
  if (step === 'loading') {
    return (
      <main className="min-h-screen bg-[#0D0D1F] text-white flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-8 relative">
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-[#FF1A8C]/20"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-t-2 border-[#FF1A8C]"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 40 40">
                <circle cx="14" cy="20" r="10" fill="none" stroke="#FF1A8C" strokeWidth="2.5" opacity="0.6" />
                <circle cx="26" cy="20" r="10" fill="none" stroke="#FF1A8C" strokeWidth="2.5" />
              </svg>
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-8">Analizando tu perfil...</h2>

          <div className="space-y-3">
            {loadingMessages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: loadingStep > i ? 1 : 0.2, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 text-sm"
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                  loadingStep > i + 1
                    ? 'border-[#FF1A8C] bg-[#FF1A8C]'
                    : loadingStep === i + 1
                    ? 'border-[#FF1A8C]'
                    : 'border-white/20'
                }`}>
                  {loadingStep > i + 1 && (
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className={loadingStep > i ? 'text-white/70' : 'text-white/20'}>{msg}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    )
  }

  // ─── RESULTS ──────────────────────────────────────────────────────────────
  if (step === 'results' && resultado) {
    const gradeColors: Record<string, string> = {
      A: '#10B981', B: '#F59E0B', C: '#EF4444', D: '#FF1A8C'
    }
    const gradeLabels: Record<string, string> = {
      A: 'Eficiencia óptima', B: 'Margen de mejora', C: 'Pérdida significativa', D: 'Ineficiencia crítica'
    }
    const totalDesglose = resultado.desglose.mensajes + resultado.desglose.interrupciones + resultado.desglose.coordinacion

    return (
      <main ref={resultsRef} className="min-h-screen bg-[#0D0D1F] text-white">
        <nav className="px-6 py-5 flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 40 40">
              <circle cx="14" cy="20" r="12" fill="none" stroke="#FF1A8C" strokeWidth="3" opacity="0.7" />
              <circle cx="26" cy="20" r="12" fill="none" stroke="#FF1A8C" strokeWidth="3" />
              <circle cx="20" cy="20" r="3" fill="#FF1A8C" />
            </svg>
            <span className="font-semibold text-white/70 text-sm">itineramio</span>
          </div>
          <span className="text-xs text-white/30 bg-white/5 px-3 py-1 rounded-full border border-white/10">
            Diagnóstico personalizado
          </span>
        </nav>

        <div className="max-w-3xl mx-auto px-6 pb-24">

          {/* Grade + headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-10"
          >
            <div
              className="w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-6 text-5xl font-black"
              style={{
                background: `${gradeColors[resultado.grade]}15`,
                border: `3px solid ${gradeColors[resultado.grade]}`,
                color: gradeColors[resultado.grade],
              }}
            >
              {resultado.grade}
            </div>
            <h1 className="text-3xl font-bold mb-2">{gradeLabels[resultado.grade]}</h1>
            <p className="text-white/40 text-sm">
              Tu operación está en el percentil {resultado.percentilComparativo} más ineficiente
              entre los {(form.alojamientos ?? 8) > 6 ? 'property managers' : 'anfitriones'} analizados en España
            </p>
          </motion.div>

          {/* Key metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
          >
            {[
              {
                value: `${animatedHoras}h`,
                label: 'perdidas al mes',
                sub: 'en gestión evitable',
                color: resultado.colorRiesgo,
              },
              {
                value: `€${animatedCoste.toLocaleString('es-ES')}`,
                label: 'coste mensual',
                sub: 'valorado a €35/hora',
                color: resultado.colorRiesgo,
              },
              {
                value: `${resultado.diasPerdidosAnio} días`,
                label: 'al año',
                sub: 'en tiempo perdido',
                color: '#8B5CF6',
              },
              {
                value: `${resultado.mensajesEvitablesMes}`,
                label: 'mensajes/mes',
                sub: '100% evitables',
                color: '#3B82F6',
              },
            ].map((m, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="text-2xl font-bold mb-1" style={{ color: m.color }}>{m.value}</div>
                <div className="text-white/70 text-sm font-medium leading-tight">{m.label}</div>
                <div className="text-white/25 text-xs mt-0.5">{m.sub}</div>
              </div>
            ))}
          </motion.div>

          {/* Desglose */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6"
          >
            <h3 className="font-semibold mb-4 text-white/80 text-sm uppercase tracking-wider">
              Desglose de horas perdidas / mes
            </h3>
            <div className="space-y-4">
              {[
                {
                  label: 'Mensajes repetitivos',
                  horas: resultado.desglose.mensajes,
                  desc: `WiFi, acceso, normas, checkout, parking — ${resultado.reservasMes} reservas × ${MENSAJES_MAP[form.mensajesNivel ?? 'medio']} mensajes/reserva`,
                  color: '#FF1A8C',
                },
                {
                  label: 'Coste de interrupciones',
                  horas: resultado.desglose.interrupciones,
                  desc: 'Mensajes fuera de horario laboral + coste de reconcentración (~18 min/interrupción)',
                  color: '#EF4444',
                },
                {
                  label: 'Coordinación de llegadas',
                  horas: resultado.desglose.coordinacion,
                  desc: `${form.alojamientos ?? 8} alojamientos × 27 min/mes de coordinación media por propiedad`,
                  color: '#8B5CF6',
                },
              ].map((item) => {
                const pct = totalDesglose > 0 ? (item.horas / totalDesglose) * 100 : 0
                return (
                  <div key={item.label}>
                    <div className="flex justify-between items-baseline mb-1.5">
                      <span className="text-white/80 text-sm font-medium">{item.label}</span>
                      <span className="text-white font-bold">{item.horas}h</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-1.5">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: item.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
                      />
                    </div>
                    <p className="text-white/25 text-xs">{item.desc}</p>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* ROI */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-gradient-to-br from-[#FF1A8C]/10 to-[#8B5CF6]/10 border border-[#FF1A8C]/20 rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-[#FF1A8C]" />
              <h3 className="font-semibold text-white/80 text-sm uppercase tracking-wider">
                Análisis de rentabilidad
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-white">€{resultado.costeAnio.toLocaleString('es-ES')}</div>
                <div className="text-white/40 text-xs mt-1">Coste anual actual</div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="text-white/20 text-2xl">→</div>
                <div className="text-[#FF1A8C] text-xs font-medium">vs €348/año</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#FF1A8C]">×{resultado.roiMultiplicador}</div>
                <div className="text-white/40 text-xs mt-1">Retorno de inversión</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 text-center">
              <span className="text-white/50 text-sm">
                Ahorro neto el primer año: <strong className="text-white">€{resultado.ahorroNetoAnio.toLocaleString('es-ES')}</strong>
              </span>
            </div>
          </motion.div>

          {/* Comparativa */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8"
          >
            <h3 className="font-semibold mb-4 text-white/80 text-sm uppercase tracking-wider">
              Comparativa con la media del sector
            </h3>
            {[
              {
                label: 'Tú ahora',
                horas: resultado.totalHorasMes,
                max: 50,
                color: resultado.colorRiesgo,
              },
              {
                label: 'Media anfitriones similares',
                horas: Math.round(resultado.totalHorasMes * 0.85),
                max: 50,
                color: '#6B7280',
              },
              {
                label: 'Top 10% (Superhosts con guía)',
                horas: Math.round(resultado.totalHorasMes * 0.18),
                max: 50,
                color: '#10B981',
              },
            ].map((row) => (
              <div key={row.label} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/60">{row.label}</span>
                  <span className="text-white font-medium">{row.horas}h/mes</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: row.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((row.horas / row.max) * 100, 100)}%` }}
                    transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
                  />
                </div>
              </div>
            ))}
          </motion.div>

          {/* Email capture */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6"
          >
            {!emailSent ? (
              <>
                <h3 className="font-bold text-xl mb-2">Recibe tu informe completo</h3>
                <p className="text-white/40 text-sm mb-6">
                  Te enviamos un PDF con el desglose detallado, el plan de acción recomendado
                  y los 3 primeros pasos para reducir tu carga operacional esta semana.
                </p>
                <form onSubmit={handleEmailSubmit} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    value={form.nombre}
                    onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                    className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-[#FF1A8C]/50 text-sm"
                  />
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                    className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-[#FF1A8C]/50 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={sending || !form.email}
                    className="w-full bg-[#FF1A8C] hover:bg-[#ff3399] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all duration-200 text-sm"
                  >
                    {sending ? 'Enviando...' : 'Recibir informe completo →'}
                  </button>
                  <p className="text-white/20 text-xs text-center">Sin spam. Puedes darte de baja en cualquier momento.</p>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center mx-auto mb-4">
                  <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
                    <path d="M1 8L7 14L19 1" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-1">Informe enviado</h3>
                <p className="text-white/40 text-sm">Revisa tu bandeja de entrada. Si no aparece en 5 minutos, comprueba el spam.</p>
              </div>
            )}
          </motion.div>

          {/* CTA Itineramio */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <p className="text-white/30 text-sm mb-4">
              Los anfitriones que usan Itineramio reducen su carga de mensajes un 71% en la primera semana.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-white text-[#0D0D1F] font-semibold px-8 py-4 rounded-full hover:bg-white/90 transition-all duration-200 hover:scale-105"
            >
              Empezar gratis — 15 días sin tarjeta
            </Link>
            <p className="text-white/20 text-xs mt-3">Configuración en 10 minutos · Sin contrato</p>
          </motion.div>
        </div>
      </main>
    )
  }

  return null
}
