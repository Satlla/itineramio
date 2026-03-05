'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface ChatDemoBannerProps {
  text: string
  ctaText: string
}

export function ChatDemoBanner({ text, ctaText }: ChatDemoBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="sticky bottom-0 bg-violet-50 border border-violet-200 rounded-xl p-3 mx-1 mb-1 shadow-sm z-10"
    >
      <p className="text-xs text-gray-700 mb-2 leading-relaxed">{text}</p>
      <a
        href="/register?from=demo&utm_source=chatbot"
        className="block w-full text-center py-2 px-3 bg-black text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition-colors"
      >
        {ctaText}
      </a>
    </motion.div>
  )
}
