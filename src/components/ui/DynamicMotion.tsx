'use client'

import dynamic from 'next/dynamic'
import React from 'react'

// Lazy-loaded motion components for pages where animations are below-the-fold
// or not critical for initial render. Use regular `motion` from framer-motion
// for above-the-fold animations that must be visible immediately.

const LazyMotionDiv = dynamic(
  () => import('framer-motion').then(mod => {
    const { motion } = mod
    return { default: motion.div }
  }),
  { ssr: false }
)

const LazyMotionButton = dynamic(
  () => import('framer-motion').then(mod => {
    const { motion } = mod
    return { default: motion.button }
  }),
  { ssr: false }
)

const LazyAnimatePresence = dynamic(
  () => import('framer-motion').then(mod => {
    return { default: mod.AnimatePresence }
  }),
  { ssr: false }
)

export { LazyMotionDiv, LazyMotionButton, LazyAnimatePresence }
