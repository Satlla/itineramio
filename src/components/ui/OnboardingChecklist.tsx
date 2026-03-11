'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Circle, ChevronRight, X, Rocket, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface OnboardingStep {
  id: string
  label: string
  description: string
  href: string
  completed: boolean
  badge?: string | null
}

interface ChecklistData {
  steps: OnboardingStep[]
  completedCount: number
  totalCount: number
  allCompleted: boolean
}

const DISMISSED_KEY = 'onboarding_checklist_v2_dismissed'

export function OnboardingChecklist() {
  const [data, setData] = useState<ChecklistData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const isDismissed = localStorage.getItem(DISMISSED_KEY) === '1'
    if (isDismissed) {
      setDismissed(true)
      setLoading(false)
      return
    }

    fetch('/api/user/onboarding-checklist', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(json => { if (json) setData(json) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, '1')
    setDismissed(true)
  }

  if (loading || dismissed || !data) return null

  const progress = (data.completedCount / data.totalCount) * 100
  const pendingSteps = data.steps.filter(s => !s.completed)
  const completedSteps = data.steps.filter(s => s.completed)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-white border border-violet-100 rounded-2xl shadow-md overflow-hidden mb-6"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
          onClick={() => setCollapsed(c => !c)}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Rocket className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900 text-sm">Empieza a sacarle partido</p>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full">
                  <Sparkles className="w-2.5 h-2.5" /> Novedades
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {data.completedCount} de {data.totalCount} completados
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-violet-600 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-medium text-violet-600">{Math.round(progress)}%</span>
            {collapsed
              ? <ChevronDown className="w-4 h-4 text-gray-400" />
              : <ChevronUp className="w-4 h-4 text-gray-400" />
            }
            <button
              onClick={(e) => { e.stopPropagation(); dismiss() }}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              title="Cerrar"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Steps */}
        {!collapsed && (
          <div className="border-t border-gray-50 divide-y divide-gray-50">
            {/* Pending steps first */}
            {pendingSteps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={step.href}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-violet-50/50 transition-colors group"
                >
                  <Circle className="w-5 h-5 text-gray-300 flex-shrink-0 group-hover:text-violet-400 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-800 group-hover:text-violet-700 transition-colors">
                        {step.label}
                      </p>
                      {step.badge && (
                        <span className="text-[10px] font-semibold bg-violet-600 text-white px-1.5 py-0.5 rounded-full flex-shrink-0">
                          {step.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{step.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-violet-500 transition-colors flex-shrink-0" />
                </Link>
              </motion.div>
            ))}

            {/* Completed steps at the bottom, collapsed */}
            {completedSteps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (pendingSteps.length + index) * 0.05 }}
              >
                <div className="flex items-center gap-3 px-5 py-3 opacity-50">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-500 line-through">{step.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
