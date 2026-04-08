'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle, Zap, CheckCircle, ArrowRight, ChevronLeft, ChevronRight,
  Video, Brain, Users, Star, Shield, PhoneCall,
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
// VISUAL MOCKUPS PER SLIDE
// ──────────────────────────────────────────────

function GuideVisual() {
  const zones = [
    { icon: '🔑', label: 'Check-In', info: '3 pasos' },
    { icon: '📶', label: 'WiFi', info: 'Clave: Mi_Piso_2024' },
    { icon: '🚿', label: 'Caldera', info: '2 instrucciones' },
    { icon: '🅿️', label: 'Parking', info: 'Plaza B-14' },
    { icon: '🏠', label: 'Normas', info: '5 reglas' },
  ]
  return (
    <div className="w-full max-w-[200px] mx-auto">
      <div className="rounded-2xl overflow-hidden shadow-xl border border-purple-100" style={{ background: '#fff' }}>
        <div className="px-3 py-2 flex items-center gap-1.5" style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
          <span className="text-white text-[9px] font-semibold ml-1">Manual del apartamento</span>
        </div>
        <div className="divide-y divide-gray-50">
          {zones.map((z, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5">
              <span className="text-sm">{z.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-medium text-gray-800">{z.label}</p>
                <p className="text-[8px] text-gray-400 truncate">{z.info}</p>
              </div>
              <ChevronRight className="w-2.5 h-2.5 text-gray-300 shrink-0" />
            </div>
          ))}
        </div>
        <div className="px-3 py-2 flex justify-end">
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
            <MessageCircle className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      </div>
    </div>
  )
}

function VideoVisual() {
  const zones = ['Lavadora', 'Check-in', 'Microondas', 'Caldera', 'TV']
  return (
    <div className="w-full max-w-[200px] mx-auto space-y-2">
      {zones.map((z, i) => (
        <div key={i} className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-sm border border-purple-50">
          <div className="w-8 h-6 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
            <Video className="w-3 h-3 text-white" />
          </div>
          <span className="text-[10px] font-medium text-gray-700">{z}</span>
          <div className="ml-auto w-2 h-2 rounded-full bg-green-400 shrink-0" />
        </div>
      ))}
    </div>
  )
}

function ChatbotVisual() {
  return (
    <div className="w-full max-w-[200px] mx-auto space-y-2">
      <div className="flex items-start gap-1.5">
        <div className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
          <MessageCircle className="w-2.5 h-2.5 text-white" />
        </div>
        <div className="bg-white rounded-xl rounded-tl-none px-3 py-2 shadow-sm text-[10px] text-gray-700 max-w-[140px] border border-purple-50">
          ¿Dónde está el mando del aire acondicionado?
        </div>
      </div>
      <div className="flex items-start gap-1.5 justify-end">
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl rounded-tr-none px-3 py-2 text-[10px] text-white max-w-[140px]">
          Está en el cajón de la mesita derecha. Aquí tienes el vídeo 👇
        </div>
        <div className="w-5 h-5 rounded-full bg-gray-200 shrink-0 flex items-center justify-center text-[9px]">👤</div>
      </div>
      <div className="flex items-start gap-1.5">
        <div className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
          <MessageCircle className="w-2.5 h-2.5 text-white" />
        </div>
        <div className="bg-white rounded-xl rounded-tl-none px-3 py-2 shadow-sm border border-purple-50 max-w-[140px]">
          <div className="w-full h-14 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            <Video className="w-5 h-5 text-purple-400" />
          </div>
        </div>
      </div>
    </div>
  )
}

function AgentVisual() {
  return (
    <div className="w-full max-w-[200px] mx-auto space-y-3">
      <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-purple-50 text-center">
        <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-lg" style={{ background: 'linear-gradient(135deg,#7c3aed22,#db277722)' }}>
          🧑‍💼
        </div>
        <p className="text-[10px] font-semibold text-gray-800">Agente Itineramio</p>
        <p className="text-[9px] text-gray-400 mt-0.5">Te contactará en 24h</p>
      </div>
      <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-sm border border-green-100">
        <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
        <p className="text-[10px] text-gray-600">Manual revisado</p>
      </div>
      <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-sm border border-purple-100">
        <Brain className="w-3.5 h-3.5 text-purple-500 shrink-0" />
        <p className="text-[10px] text-gray-600">Chatbot optimizado</p>
      </div>
      <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-sm border border-blue-100">
        <PhoneCall className="w-3.5 h-3.5 text-blue-500 shrink-0" />
        <p className="text-[10px] text-gray-600">Caso analizado</p>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// SLIDES DATA
// ──────────────────────────────────────────────

const SLIDES: Slide[] = [
  {
    id: 0,
    eyebrow: 'Lo que vas a crear ahora',
    title: 'La guía digital de tu apartamento',
    subtitle: 'En 3 minutos tendrás un manual que tus huéspedes sí usan — y que reduce tus consultas hasta un 80%.',
    bullets: [
      { icon: <CheckCircle className="w-4 h-4 text-green-500" />, text: 'Gratis, sin tarjeta de crédito' },
      { icon: <CheckCircle className="w-4 h-4 text-green-500" />, text: 'QR por zona, accesible en cualquier idioma' },
      { icon: <CheckCircle className="w-4 h-4 text-green-500" />, text: 'Chatbot de IA incluido 24/7' },
    ],
    visual: <GuideVisual />,
  },
  {
    id: 1,
    eyebrow: 'Paso a paso',
    title: 'Te preguntamos, tú subes. Nosotros creamos.',
    subtitle: 'Rellenas los datos básicos de tu alojamiento y subes los vídeos de tus zonas clave.',
    bullets: [
      { icon: <Video className="w-4 h-4 text-purple-500" />, text: 'Lavadora, caldera, microondas, check-in...' },
      { icon: <Zap className="w-4 h-4 text-purple-500" />, text: 'Nuestra IA detecta y estructura las zonas' },
      { icon: <Star className="w-4 h-4 text-purple-500" />, text: 'Cuanto más completo, mejor resultado' },
    ],
    visual: <VideoVisual />,
  },
  {
    id: 2,
    eyebrow: 'El resultado',
    title: 'Tu chatbot IA trabaja por ti — en 7 idiomas',
    subtitle: 'El chatbot responde automáticamente a cada pregunta y envía los vídeos que subiste. Sin que toques el móvil.',
    bullets: [
      { icon: <MessageCircle className="w-4 h-4 text-pink-500" />, text: '¿Dónde está el mando? → vídeo enviado al instante' },
      { icon: <Users className="w-4 h-4 text-pink-500" />, text: 'Responde en ES, EN, FR, DE, IT, PT, NL' },
      { icon: <Brain className="w-4 h-4 text-pink-500" />, text: 'Entrénalo desde Intelligence para afinar respuestas' },
    ],
    visual: <ChatbotVisual />,
  },
  {
    id: 3,
    eyebrow: 'Lo que pasa después',
    title: 'Un agente analiza tu caso y te ayuda',
    subtitle: 'Después de crear el manual, un agente de Itineramio se pone en contacto contigo para asegurarse de que todo está optimizado.',
    bullets: [
      { icon: <Shield className="w-4 h-4 text-blue-500" />, text: 'Revisamos que las zonas están bien configuradas' },
      { icon: <Brain className="w-4 h-4 text-blue-500" />, text: 'Te ayudamos a optimizar el chatbot con tu caso' },
      { icon: <PhoneCall className="w-4 h-4 text-blue-500" />, text: 'La llamada es corta — ya tendrás el manual creado' },
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
            background: i === current
              ? 'linear-gradient(90deg,#7c3aed,#db2777)'
              : '#e5e7eb',
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
    if (isLast) {
      onComplete()
    } else {
      goTo(current + 1)
    }
  }

  const prev = () => {
    if (current > 0) goTo(current - 1)
  }

  // Swipe handler
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50/50 to-white overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
            <span className="text-white text-[10px] font-black">i</span>
          </div>
          <span className="text-sm font-semibold text-gray-800">Itineramio</span>
        </div>
        <button
          onClick={onComplete}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100"
        >
          Saltar intro →
        </button>
      </div>

      {/* Slide area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 flex flex-col px-5 pt-4 pb-2 cursor-grab active:cursor-grabbing"
          >
            {/* Visual */}
            <div className="flex-1 flex items-center justify-center py-2 min-h-0">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.4 }}
              >
                {slide.visual}
              </motion.div>
            </div>

            {/* Text content */}
            <div className="shrink-0 pb-4">
              <motion.p
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: '#7c3aed' }}
              >
                {slide.eyebrow}
              </motion.p>
              <motion.h2
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="text-xl font-bold text-gray-900 leading-tight mb-2"
              >
                {slide.title}
              </motion.h2>
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm text-gray-500 leading-relaxed mb-4"
              >
                {slide.subtitle}
              </motion.p>
              <motion.ul
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="space-y-2"
              >
                {slide.bullets.map((b, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <div className="shrink-0">{b.icon}</div>
                    <span className="text-sm text-gray-700">{b.text}</span>
                  </li>
                ))}
              </motion.ul>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom nav */}
      <div className="shrink-0 px-5 pb-8 pt-3 bg-white border-t border-gray-100">
        <div className="flex items-center justify-between mb-4">
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
            className="flex-1 h-11 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)', boxShadow: '0 4px 20px rgba(124,58,237,0.35)' }}
          >
            {isLast ? (
              <>Empezar — es gratis <ArrowRight className="w-4 h-4" /></>
            ) : (
              <>Siguiente <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </div>

        {/* Trust line */}
        <p className="text-center text-[11px] text-gray-400 mt-3">
          Sin tarjeta de crédito · Sin compromiso · Resultado en 3 minutos
        </p>
      </div>
    </div>
  )
}
