'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, type LucideIcon } from 'lucide-react'

interface OnboardingInfoModalProps {
  storageKey: string
  icon: LucideIcon
  title: string
  children: React.ReactNode
  buttonText?: string
}

export function OnboardingInfoModal({
  storageKey,
  icon: Icon,
  title,
  children,
  buttonText = 'Entendido',
}: OnboardingInfoModalProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const visited = localStorage.getItem(storageKey)
    if (!visited) setShow(true)
  }, [storageKey])

  const handleClose = () => {
    localStorage.setItem(storageKey, '1')
    setShow(false)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-violet-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            </div>

            <div className="space-y-3 text-sm text-gray-600 mb-6">
              {children}
            </div>

            <button
              onClick={handleClose}
              className="w-full py-2.5 px-4 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-800 transition-colors"
            >
              {buttonText}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
