'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, CheckCircle, Globe, MessageCircle, MapPin,
  ArrowRight, Share2, Layers
} from 'lucide-react'

interface DemoResultsScreenProps {
  propertyName: string
  zonesCount: number
  onExplore: () => void
  onShare: () => void
}

// Confetti particle component
function ConfettiParticle({ delay, color }: { delay: number; color: string }) {
  const x = Math.random() * 100
  const duration = 2 + Math.random() * 2
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full"
      style={{ backgroundColor: color, left: `${x}%`, top: '-5%' }}
      initial={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
      animate={{
        opacity: [1, 1, 0],
        y: ['0vh', '60vh'],
        rotate: [0, 360 + Math.random() * 360],
        x: [0, (Math.random() - 0.5) * 100],
        scale: [1, 0.5],
      }}
      transition={{ duration, delay, ease: 'easeOut' }}
    />
  )
}

const CONFETTI_COLORS = ['#8b5cf6', '#a855f7', '#d946ef', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

const statItems = [
  { icon: Layers, labelKey: 'zones', color: 'text-violet-400', bgColor: 'bg-violet-500/10', borderColor: 'border-violet-500/20' },
  { icon: Globe, labelKey: 'languages', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/20' },
  { icon: MessageCircle, labelKey: 'chatbot', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20' },
  { icon: MapPin, labelKey: 'services', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/20' },
]

export default function DemoResultsScreen({
  propertyName,
  zonesCount,
  onExplore,
  onShare,
}: DemoResultsScreenProps) {
  const [showStats, setShowStats] = useState(false)
  const [showCTA, setShowCTA] = useState(false)
  const [visibleStats, setVisibleStats] = useState(0)

  useEffect(() => {
    // Track WOW screen view
    try {
      if ((window as any).dataLayer) {
        (window as any).dataLayer.push({ event: 'demo_wow_screen_viewed', zonesCount })
      }
      if ((window as any).gtag) {
        (window as any).gtag('event', 'demo_wow_screen_viewed', { zonesCount })
      }
    } catch {}

    // Sequence: confetti → stats one by one → CTA
    const timers = [
      setTimeout(() => setShowStats(true), 600),
      setTimeout(() => setVisibleStats(1), 900),
      setTimeout(() => setVisibleStats(2), 1200),
      setTimeout(() => setVisibleStats(3), 1500),
      setTimeout(() => setVisibleStats(4), 1800),
      setTimeout(() => setShowCTA(true), 2200),
    ]
    return () => timers.forEach(clearTimeout)
  }, [zonesCount])

  const statValues = [
    `${zonesCount} zonas creadas`,
    '3 idiomas: ES · EN · FR',
    'Chatbot IA activado 24/7',
    'Servicios cercanos incluidos',
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950 overflow-hidden">
      {/* Confetti */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 40 }).map((_, i) => (
          <ConfettiParticle
            key={i}
            delay={i * 0.05}
            color={CONFETTI_COLORS[i % CONFETTI_COLORS.length]}
          />
        ))}
      </div>

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-violet-500/10 blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full bg-fuchsia-500/10 blur-[100px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md text-center space-y-6">
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200 }}
          className="relative mx-auto"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 1 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 1.2 }}
          >
            <div className="w-20 h-20 rounded-2xl border-2 border-emerald-400" />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Tu manual digital esta listo
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            Nuestra IA ha creado un manual completo para <span className="text-violet-300 font-medium">{propertyName}</span>
          </p>
        </motion.div>

        {/* Stats */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2.5"
            >
              {statItems.map((stat, index) => (
                <motion.div
                  key={stat.labelKey}
                  initial={{ opacity: 0, x: -20 }}
                  animate={visibleStats > index ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4 }}
                  className={`flex items-center gap-3 p-3 rounded-xl ${stat.bgColor} border ${stat.borderColor}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.bgColor}`}>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-200">{statValues[index]}</span>
                  <CheckCircle className={`w-4 h-4 ${stat.color} ml-auto`} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTAs */}
        <AnimatePresence>
          {showCTA && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 pt-2"
            >
              {/* Primary CTA */}
              <button
                onClick={onExplore}
                className="relative w-full py-4 rounded-xl text-base font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white shadow-xl shadow-violet-500/20 transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] overflow-hidden group"
              >
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <Sparkles className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Explorar mi manual</span>
                <ArrowRight className="w-5 h-5 relative z-10" />
              </button>

              {/* Secondary CTA */}
              <button
                onClick={onShare}
                className="w-full py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white border border-white/[0.06] hover:border-white/[0.12] transition-all flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Comparte con otros anfitriones
              </button>

              {/* Email note */}
              <p className="text-xs text-gray-600">
                Te hemos enviado un email con el enlace a tu manual
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
