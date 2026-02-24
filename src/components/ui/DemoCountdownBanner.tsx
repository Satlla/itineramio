'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Gift, AlertTriangle, X, Sparkles, Copy, CheckCircle, Flame } from 'lucide-react'
import Link from 'next/link'

interface DemoCountdownBannerProps {
  expiresAt: string
  couponCode: string
  leadEmail?: string
  leadName?: string
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

// Inline translations
const T: Record<string, Record<string, string>> = {
  es: {
    demoManual: 'Manual de demo',
    expiresIn: 'Expira en',
    registerSave: 'Crea tu cuenta y ahorra',
    registerNow: 'Crear cuenta ahora',
    couponValid: 'Cupón válido',
    minutes: 'min',
    hurryUp: '¡Date prisa!',
    almostGone: 'Tu manual desaparecerá pronto',
    expired: 'Tu manual de demo ha expirado',
    expiredDesc: 'Regístrate ahora para crear tu propio manual permanente con un 20% de descuento.',
    createAccount: 'Crear cuenta con 20% dto.',
    copyCoupon: 'Copiar cupón',
    copied: 'Copiado',
    shareCta: 'Comparte con otros anfitriones',
    spotsLeft: 'plazas restantes',
    limitedOffer: 'Oferta limitada',
  },
  en: {
    demoManual: 'Demo manual',
    expiresIn: 'Expires in',
    registerSave: 'Sign up and save',
    registerNow: 'Create account now',
    couponValid: 'Coupon valid',
    minutes: 'min',
    hurryUp: 'Hurry up!',
    almostGone: 'Your manual will disappear soon',
    expired: 'Your demo manual has expired',
    expiredDesc: 'Sign up now to create your own permanent manual with 20% off.',
    createAccount: 'Create account with 20% off',
    copyCoupon: 'Copy coupon',
    copied: 'Copied',
    shareCta: 'Share with other hosts',
    spotsLeft: 'spots left',
    limitedOffer: 'Limited offer',
  },
  fr: {
    demoManual: 'Manuel de démonstration',
    expiresIn: 'Expire dans',
    registerSave: 'Inscrivez-vous et économisez',
    registerNow: 'Créer un compte',
    couponValid: 'Coupon valide',
    minutes: 'min',
    hurryUp: 'Dépêchez-vous !',
    almostGone: 'Votre manuel va bientôt disparaître',
    expired: 'Votre manuel de démonstration a expiré',
    expiredDesc: 'Inscrivez-vous maintenant pour créer votre propre manuel permanent avec 20% de réduction.',
    createAccount: 'Créer un compte avec -20%',
    copyCoupon: 'Copier le coupon',
    copied: 'Copié',
    shareCta: "Partagez avec d'autres hôtes",
    spotsLeft: 'places restantes',
    limitedOffer: 'Offre limitée',
  },
}

function getLang(): string {
  if (typeof window === 'undefined') return 'es'
  return localStorage.getItem('itineramio-language') || navigator.language?.split('-')[0] || 'es'
}

export default function DemoCountdownBanner({ expiresAt, couponCode, leadEmail, leadName }: DemoCountdownBannerProps) {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
    return Math.max(0, diff)
  })
  const [dismissed, setDismissed] = useState(false)
  const [urgencyLevel, setUrgencyLevel] = useState<'normal' | 'warning' | 'critical' | 'expired'>('normal')
  const [copiedCoupon, setCopiedCoupon] = useState(false)
  const [showUrgencyAlert, setShowUrgencyAlert] = useState(false)
  const [spotsRemaining, setSpotsRemaining] = useState(28)

  const lang = typeof window !== 'undefined' ? getLang() : 'es'
  const tr = T[lang] || T.es

  // Fetch spots on mount
  useEffect(() => {
    fetch('/api/public/demo-spots')
      .then(res => res.json())
      .then(data => {
        if (data.remaining != null) setSpotsRemaining(data.remaining)
      })
      .catch(() => {})
  }, [])

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
      const remaining = Math.max(0, diff)
      setSecondsLeft(remaining)

      if (remaining === 0) {
        setUrgencyLevel('expired')
        clearInterval(interval)
      } else if (remaining <= 120) {
        setUrgencyLevel('critical')
      } else if (remaining <= 300) {
        setUrgencyLevel('warning')
      } else {
        setUrgencyLevel('normal')
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [expiresAt])

  // Show urgency alerts at thresholds
  useEffect(() => {
    if (urgencyLevel === 'warning' || urgencyLevel === 'critical') {
      setShowUrgencyAlert(true)
      const timer = setTimeout(() => setShowUrgencyAlert(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [urgencyLevel])

  const registerUrl = `/register?from=demo&coupon=${couponCode}${leadEmail ? `&email=${encodeURIComponent(leadEmail)}` : ''}${leadName ? `&name=${encodeURIComponent(leadName)}` : ''}`

  const handleCopyCoupon = useCallback(() => {
    navigator.clipboard.writeText(couponCode).catch(() => {})
    setCopiedCoupon(true)
    setTimeout(() => setCopiedCoupon(false), 2000)
  }, [couponCode])

  const timerColor = urgencyLevel === 'critical' ? 'text-red-400' : urgencyLevel === 'warning' ? 'text-orange-400' : 'text-green-400'
  const timerBg = urgencyLevel === 'critical' ? 'bg-red-500/10 border-red-500/30' : urgencyLevel === 'warning' ? 'bg-orange-500/10 border-orange-500/30' : 'bg-green-500/10 border-green-500/30'

  // Expired overlay
  if (urgencyLevel === 'expired') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-lg bg-gray-900 border border-gray-700 rounded-2xl p-8 text-center space-y-6"
        >
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8 text-red-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">{tr.expired}</h2>
            <p className="text-gray-400">{tr.expiredDesc}</p>
          </div>

          {/* Spots remaining */}
          <div className="flex items-center justify-center gap-2 text-sm text-orange-300">
            <Flame className="w-4 h-4" />
            <span className="font-bold">{tr.limitedOffer} · {spotsRemaining} {tr.spotsLeft}</span>
          </div>

          {/* Coupon display */}
          <div className="flex items-center justify-center gap-3 p-4 bg-violet-500/10 border border-violet-500/30 rounded-xl">
            <Gift className="w-5 h-5 text-violet-400" />
            <span className="text-lg font-mono font-bold text-violet-300">{couponCode}</span>
            <button onClick={handleCopyCoupon} className="text-violet-400 hover:text-violet-300">
              {copiedCoupon ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <Link
            href={registerUrl}
            className="block w-full py-4 rounded-xl text-lg font-semibold bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/25 transition-all"
          >
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              {tr.createAccount}
            </span>
          </Link>
        </motion.div>
      </div>
    )
  }

  if (dismissed) return null

  return (
    <>
      {/* Top banner with countdown */}
      <div className={`fixed top-0 left-0 right-0 z-50 border-b ${timerBg}`}>
        <div className="max-w-6xl mx-auto px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 ${timerColor} font-mono font-bold text-sm`}>
              <Clock className="w-4 h-4" />
              <span>{formatTime(secondsLeft)}</span>
            </div>
            <span className="text-xs text-gray-400 hidden sm:inline">{tr.demoManual} · {tr.expiresIn} {Math.ceil(secondsLeft / 60)} {tr.minutes}</span>
            <div className="hidden md:flex items-center gap-1.5 text-xs text-orange-300">
              <Flame className="w-3 h-3" />
              <span className="font-semibold">{spotsRemaining} {tr.spotsLeft}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={registerUrl}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-violet-600 text-white hover:bg-violet-500 transition-colors"
            >
              {tr.registerNow}
            </Link>
            <button onClick={() => setDismissed(true)} className="text-gray-500 hover:text-gray-300 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-xl border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-3 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Gift className="w-5 h-5 text-violet-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{tr.registerSave} 20%  <span className="text-orange-400 font-semibold">· {spotsRemaining} {tr.spotsLeft}</span></p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-violet-300">{couponCode}</span>
                <button onClick={handleCopyCoupon} className="text-violet-400 hover:text-violet-300">
                  {copiedCoupon ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>

          <Link
            href={registerUrl}
            className="flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/25 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">{tr.createAccount}</span>
            <span className="sm:hidden">{tr.registerNow}</span>
          </Link>
        </div>
      </div>

      {/* Urgency alert overlay (5 min, 2 min) */}
      <AnimatePresence>
        {showUrgencyAlert && (urgencyLevel === 'warning' || urgencyLevel === 'critical') && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-14 left-1/2 -translate-x-1/2 z-[60] max-w-sm w-full px-4"
          >
            <div className={`flex items-center gap-3 p-4 rounded-xl border shadow-lg ${
              urgencyLevel === 'critical'
                ? 'bg-red-500/20 border-red-500/40 text-red-200'
                : 'bg-orange-500/20 border-orange-500/40 text-orange-200'
            }`}>
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">{tr.hurryUp}</p>
                <p className="text-xs opacity-80">{tr.almostGone}</p>
              </div>
              <button onClick={() => setShowUrgencyAlert(false)} className="ml-auto opacity-60 hover:opacity-100">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacers to prevent content from hiding behind fixed elements */}
      <div className="h-10" /> {/* Top spacer */}
    </>
  )
}
