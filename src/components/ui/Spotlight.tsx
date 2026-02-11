'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

interface SpotlightProps {
  isActive: boolean
  targetId: string
  pulseColor?: string
  zIndex?: number
}

export function Spotlight({
  isActive,
  targetId,
  pulseColor = 'rgb(139, 92, 246)', // violet-500
  zIndex = 9998
}: SpotlightProps) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isActive || !mounted) {
      setTargetRect(null)
      return
    }

    const updatePosition = () => {
      const element = document.getElementById(targetId)
      if (element) {
        const rect = element.getBoundingClientRect()
        setTargetRect(rect)
      }
    }

    // Initial position
    updatePosition()

    // Update on scroll and resize (throttled with rAF)
    let ticking = false
    const throttledUpdate = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updatePosition()
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', throttledUpdate, true)
    window.addEventListener('resize', throttledUpdate)

    return () => {
      window.removeEventListener('scroll', throttledUpdate, true)
      window.removeEventListener('resize', throttledUpdate)
    }
  }, [isActive, targetId, mounted])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isActive && targetRect && (
        <>
          {/* Animated border around target - NO DARK OVERLAY */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              position: 'fixed',
              left: targetRect.left - 8,
              top: targetRect.top - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
              zIndex: zIndex + 1,
              pointerEvents: 'none',
              borderRadius: '12px'
            }}
          >
            {/* Pulsing glow */}
            <motion.div
              animate={{
                boxShadow: [
                  `0 0 0 0 ${pulseColor}`,
                  `0 0 0 8px ${pulseColor.replace('rgb', 'rgba').replace(')', ', 0.4)')}`,
                  `0 0 0 16px ${pulseColor.replace('rgb', 'rgba').replace(')', ', 0)')}`,
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '12px',
                border: `3px solid ${pulseColor}`
              }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
