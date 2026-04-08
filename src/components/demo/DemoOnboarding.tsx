'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, ArrowRight,
  QrCode, Globe, MessageCircle, CheckCircle,
  Video, Brain, PhoneCall,
} from 'lucide-react'

// ──────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────

interface Slide {
  id: number
  eyebrow: string
  title: string
  subtitle: string
  bullets: { icon: React.ReactNode; text: string }[]
  visual: React.ReactNode
}

// ──────────────────────────────────────────────
// VISUAL COMPONENTS — limpios, sin fake mockups
// ──────────────────────────────────────────────

function GuideVisual() {
  const features = [
    { icon: <QrCode className="w-4 h-4 text-violet-500" />, label: 'QR único por zona', sub: 'Escaneable desde cualquier móvil' },
    { icon: <Globe className="w-4 h-4 text-violet-500" />, label: '7 idiomas automáticos', sub: 'ES · EN · FR · DE · IT · PT · NL' },
    { icon: <MessageCircle className="w-4 h-4 text-violet-500" />, label: 'Chatbot IA 24/7', sub: 'Responde sin que toques el móvil' },
  ]
  return (
    <div className="w-full space-y-2.5 md:space-y-3">
      {features.map((f, i) => (
        <div key={i} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
          <div className="shrink-0 w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
            {f.icon}
          </div>
          <div>
            <p className="text-[13px] font-semibold text-gray-800">{f.label}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{f.sub}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function VideoVisual() {
  const steps = [
    { n: '1', text: 'Introduce la dirección y datos básicos' },
    { n: '2', text: 'Sube fotos o vídeos de cada zona' },
    { n: '3', text: 'La IA detecta y estructura el manual' },
  ]
  return (
    <div className="w-full space-y-3">
      {steps.map((s, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-violet-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
            {s.n}
          </div>
          <div className="flex-1 bg-white border border-gray-100 rounded-xl px-4 py-2.5 shadow-sm">
            <p className="text-[13px] text-gray-700">{s.text}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function ChatbotVisual() {
  return (
    <div className="w-full space-y-3">
      <div className="flex items-end gap-2">
        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-sm shrink-0">👤</div>
        <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-2.5">
          <p className="text-[12px] text-gray-700">¿Dónde está el mando del aire?</p>
        </div>
      </div>
      <div className="flex items-end gap-2 justify-end">
        <div className="bg-violet-500 rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[220px]">
          <p className="text-[12px] text-white">En el cajón de la mesita derecha. Aquí tienes el vídeo 👇</p>
        </div>
        <div className="w-7 h-7 rounded-full bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
          <MessageCircle className="w-3.5 h-3.5 text-violet-500" />
        </div>
      </div>
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2">
        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
        <p className="text-[11px] text-gray-500">Respondido automáticamente en 2 seg</p>
      </div>
    </div>
  )
}

function AgentVisual() {
  const items = [
    { icon: <CheckCircle className="w-4 h-4 text-green-500" />, text: 'Revisamos las zonas creadas' },
    { icon: <Brain className="w-4 h-4 text-violet-500" />, text: 'Optimizamos el chatbot con tu caso' },
    { icon: <PhoneCall className="w-4 h-4 text-blue-400" />, text: 'Llamada de seguimiento corta' },
  ]
  return (
    <div className="w-full space-y-2.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
          <div className="shrink-0">{item.icon}</div>
          <p className="text-[13px] text-gray-700">{item.text}</p>
        </div>
      ))}
    </div>
  )
}

// ──────────────────────────────────────────────
// SLIDES DATA
// ──────────────────────────────────────────────

const SLIDES: Slide[] = [
  {
    id: 0,
    eyebrow: 'Lo que vas a crear',
    title: 'La guía digital de tu apartamento',
    subtitle: 'Un manual que tus huéspedes sí usan — y que reduce las consultas hasta un 80%.',
    bullets: [
      { icon: <CheckCircle className="w-4 h-4 text-green-500" />, text: 'Gratis, sin tarjeta de crédito' },
      { icon: <CheckCircle className="w-4 h-4 text-green-500" />, text: 'QR por zona, en cualquier idioma' },
      { icon: <CheckCircle className="w-4 h-4 text-green-500" />, text: 'Chatbot de IA incluido 24/7' },
    ],
    visual: <GuideVisual />,
  },
  {
    id: 1,
    eyebrow: 'Cómo funciona',
    title: 'Tú pones los datos, nosotros creamos el manual.',
    subtitle: 'Rellenas lo básico y subes vídeos de las zonas. La IA hace el resto.',
    bullets: [
      { icon: <Video className="w-4 h-4 text-violet-500" />, text: 'Lavadora, caldera, check-in...' },
      { icon: <Brain className="w-4 h-4 text-violet-500" />, text: 'La IA detecta y estructura las zonas' },
      { icon: <CheckCircle className="w-4 h-4 text-violet-500" />, text: 'Cuanto más completo, mejor resultado' },
    ],
    visual: <VideoVisual />,
  },
  {
    id: 2,
    eyebrow: 'El resultado',
    title: 'Tu chatbot responde en 7 idiomas',
    subtitle: 'Responde preguntas y envía los vídeos que subiste. Sin que toques el móvil.',
    bullets: [
      { icon: <MessageCircle className="w-4 h-4 text-violet-500" />, text: 'Respuesta automática al instante' },
      { icon: <Globe className="w-4 h-4 text-violet-500" />, text: 'ES, EN, FR, DE, IT, PT, NL' },
      { icon: <Brain className="w-4 h-4 text-violet-500" />, text: 'Entrénalo desde Intelligence' },
    ],
    visual: <ChatbotVisual />,
  },
  {
    id: 3,
    eyebrow: 'Después de crear',
    title: 'Un agente revisa tu caso contigo',
    subtitle: 'Te contactamos para asegurarnos de que todo está bien configurado.',
    bullets: [
      { icon: <CheckCircle className="w-4 h-4 text-blue-400" />, text: 'Revisamos que las zonas están bien' },
      { icon: <Brain className="w-4 h-4 text-blue-400" />, text: 'Optimizamos el chatbot con tu caso' },
      { icon: <PhoneCall className="w-4 h-4 text-blue-400" />, text: 'La llamada es corta — el manual ya está listo' },
    ],
    visual: <AgentVisual />,
  },
]

// ──────────────────────────────────────────────
// DOT INDICATOR
// ──────────────────────────────────────────────

function Dots({ current, total, onDot }: { current: number; total: number; onDot: (i: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onDot(i)}
          className="transition-all duration-300"
          style={{
            width: i === current ? 20 : 7,
            height: 7,
            borderRadius: 4,
            background: i === current ? '#7c3aed' : '#e5e7eb',
          }}
        />
      ))}
    </div>
  )
}

// ──────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────

interface DemoOnboardingProps {
  onComplete: () => void
}

export default function DemoOnboarding({ onComplete }: DemoOnboardingProps) {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)
  const isLast = current === SLIDES.length - 1

  const goTo = (idx: number) => {
    setDirection(idx > current ? 1 : -1)
    setCurrent(idx)
  }

  const next = () => {
    if (isLast) onComplete()
    else goTo(current + 1)
  }

  const prev = () => {
    if (current > 0) goTo(current - 1)
  }

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x < -50 && current < SLIDES.length - 1) goTo(current + 1)
    if (info.offset.x > 50 && current > 0) goTo(current - 1)
  }

  const slide = SLIDES[current]

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      {/* Mobile: max-w-sm | Desktop: max-w-2xl, dos columnas */}
      <div className="w-full max-w-sm md:max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[620px] md:h-[540px]">

        {/* ── HEADER ── */}
        <div className="h-14 flex items-center justify-between px-5 shrink-0 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <img src="/isotipo-gradient.svg" alt="Itineramio" width={28} height={16} className="object-contain" />
            <span className="text-sm font-semibold text-gray-900">Itineramio</span>
          </div>
          <button
            onClick={onComplete}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded-md hover:bg-gray-100"
          >
            Saltar →
          </button>
        </div>

        {/* ── SLIDES — mobile: column | desktop: row ── */}
        <div className="relative overflow-hidden shrink-0 h-[430px] md:h-[370px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'tween', duration: 0.28, ease: 'easeInOut' }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.1}
              onDragEnd={handleDragEnd}
              className="absolute inset-0 flex flex-col md:flex-row cursor-grab active:cursor-grabbing"
            >
              {/* Visual — mobile: h-52 arriba | desktop: columna izquierda */}
              <div className="h-52 md:h-full md:w-[280px] shrink-0 flex items-center justify-center px-6 pt-4 md:pt-0 overflow-hidden md:border-r md:border-gray-100 md:bg-gray-50">
                {slide.visual}
              </div>

              {/* Text — mobile: resto | desktop: columna derecha */}
              <div className="flex-1 px-5 pt-4 pb-2 overflow-hidden md:flex md:flex-col md:justify-center md:px-10 md:py-8">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-600 mb-2">
                  {slide.eyebrow}
                </p>
                <h2 className="text-[18px] md:text-[22px] font-bold text-gray-900 leading-snug mb-2">
                  {slide.title}
                </h2>
                <p className="text-[13px] md:text-sm text-gray-500 leading-relaxed mb-4">
                  {slide.subtitle}
                </p>
                <ul className="space-y-2">
                  {slide.bullets.map((b, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className="shrink-0">{b.icon}</div>
                      <span className="text-[13px] md:text-sm text-gray-600">{b.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── NAV ── */}
        <div className="shrink-0 px-5 md:px-8 pt-3 pb-5 border-t border-gray-100 h-[134px] md:h-[116px]">
          <div className="flex items-center justify-between mb-3">
            <Dots current={current} total={SLIDES.length} onDot={goTo} />
            <span className="text-xs text-gray-400">{current + 1} / {SLIDES.length}</span>
          </div>

          <div className="flex gap-3">
            {current > 0 && (
              <button
                onClick={prev}
                className="flex items-center justify-center w-11 h-11 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors shrink-0"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={next}
              className="flex-1 h-11 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-colors bg-violet-600 hover:bg-violet-700 active:bg-violet-800"
            >
              {isLast ? (
                <>Empezar — es gratis <ArrowRight className="w-4 h-4" /></>
              ) : (
                <>Siguiente <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>

          <p className="text-center text-[11px] text-gray-400 mt-2.5">
            Sin tarjeta de crédito · Sin compromiso · 3 minutos
          </p>
        </div>

      </div>
    </div>
  )
}
