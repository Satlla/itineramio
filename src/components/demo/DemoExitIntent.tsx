'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Clock, Gift, Copy, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface DemoExitIntentProps {
  propertyName: string
  couponCode: string
  expiresAt: string
  propertyId: string
  leadEmail?: string
  leadName?: string
}

export default function DemoExitIntent({
  propertyName,
  couponCode,
  expiresAt,
  propertyId,
  leadEmail,
  leadName,
}: DemoExitIntentProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [copiedCoupon, setCopiedCoupon] = useState(false)

  const registerUrl = `/register?from=demo&coupon=${couponCode}${propertyId ? `&propertyId=${propertyId}` : ''}${leadEmail ? `&email=${encodeURIComponent(leadEmail)}` : ''}${leadName ? `&name=${encodeURIComponent(leadName)}` : ''}`

  const showModal = useCallback(() => {
    // Only show once per session
    const shown = sessionStorage.getItem('demo-exit-intent-shown')
    if (shown) return
    sessionStorage.setItem('demo-exit-intent-shown', 'true')
    setIsVisible(true)

    try {
      fetch('/api/admin/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'demo_exit_intent_shown', data: { propertyId } }),
      }).catch(() => {})
    } catch {}
  }, [propertyId])

  useEffect(() => {
    // Desktop: mouse leaves viewport from the top
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 5) {
        showModal()
      }
    }

    // Mobile: popstate (back button press)
    const handlePopState = () => {
      const shown = sessionStorage.getItem('demo-exit-intent-shown')
      if (!shown) {
        // Push state back so user doesn't actually leave
        window.history.pushState(null, '', window.location.href)
        showModal()
      }
    }

    // Push an extra history entry so we can intercept back
    window.history.pushState(null, '', window.location.href)

    document.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('popstate', handlePopState)

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [showModal])

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText(couponCode).catch(() => {})
    setCopiedCoupon(true)
    setTimeout(() => setCopiedCoupon(false), 2000)
  }

  // Calculate remaining time
  const secondsLeft = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
  const minutesLeft = Math.ceil(secondsLeft / 60)

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          onClick={(e) => { if (e.target === e.currentTarget) setIsVisible(false) }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative w-full max-w-sm bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden"
          >
            {/* Glow */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 rounded-full bg-violet-500/15 blur-[80px] pointer-events-none" />

            {/* Close button */}
            <button
              onClick={() => setIsVisible(false)}
              className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-gray-300 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative p-6 space-y-5">
              {/* Icon */}
              <div className="flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center"
                >
                  <Clock className="w-7 h-7 text-orange-400" />
                </motion.div>
              </div>

              {/* Text */}
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-white">
                  Espera! Tu manual desaparece en {minutesLeft} min
                </h3>
                <p className="text-sm text-gray-400">
                  Registrate ahora y manten tu manual de <span className="text-violet-300 font-medium">{propertyName}</span> activo para siempre
                </p>
              </div>

              {/* Coupon */}
              <div className="flex items-center justify-center gap-3 p-3.5 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                <Gift className="w-5 h-5 text-violet-400" />
                <span className="text-lg font-mono font-bold text-violet-300 tracking-wider">{couponCode}</span>
                <button onClick={handleCopyCoupon} className="text-violet-400 hover:text-violet-300 transition-colors">
                  {copiedCoupon ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* CTA */}
              <Link
                href={registerUrl}
                onClick={() => {
                  try {
                    fetch('/api/admin/analytics', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ event: 'demo_exit_intent_register_clicked', data: { propertyId } }),
                    }).catch(() => {})
                  } catch {}
                }}
                className="block w-full py-3.5 rounded-xl text-base font-bold bg-gradient-to-r from-violet-600 to-purple-600 text-white text-center hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/20 transition-all"
              >
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Crear cuenta ahora
                </span>
              </Link>

              <p className="text-xs text-gray-600 text-center">
                20% de descuento con tu cupon exclusivo
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
