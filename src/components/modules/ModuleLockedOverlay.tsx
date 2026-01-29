'use client'

import React from 'react'
import Link from 'next/link'
import { Lock, BookOpen, Briefcase, ArrowRight, Sparkles } from 'lucide-react'
import { type ModuleCode, MODULES, formatModulePrice } from '@/config/modules'

interface ModuleLockedOverlayProps {
  moduleCode: ModuleCode
  activationCTA?: string
  activationUrl?: string
  className?: string
}

const moduleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  MANUALES: BookOpen,
  GESTION: Briefcase,
  FACTURAMIO: Briefcase  // Legacy support
}

export function ModuleLockedOverlay({
  moduleCode,
  activationCTA,
  activationUrl,
  className = ''
}: ModuleLockedOverlayProps) {
  const module = MODULES[moduleCode]
  const Icon = moduleIcons[moduleCode]
  const cta = activationCTA || module.ctaText
  const url = activationUrl || module.activationUrl
  const priceText = module.basePriceMonthly !== null
    ? `desde ${formatModulePrice(moduleCode)}/mes`
    : 'Ver planes'

  return (
    <div className={`relative ${className}`}>
      {/* Blurred background content placeholder */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-50 blur-sm opacity-70" />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center z-10">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            {/* Lock Icon */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: `${module.color}15` }}
            >
              <Lock className="w-8 h-8" style={{ color: module.color }} />
            </div>

            {/* Module Info */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <Icon className="w-5 h-5" style={{ color: module.color }} />
              <h2 className="text-xl font-bold text-gray-900">{module.name}</h2>
            </div>

            <p className="text-gray-600 mb-6 leading-relaxed">
              {module.description}
            </p>

            {/* Features */}
            <div className="text-left mb-6 bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" style={{ color: module.color }} />
                Incluye:
              </p>
              <ul className="space-y-2">
                {module.features.slice(0, 4).map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <span
                      className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: module.color }}
                    />
                    {feature}
                  </li>
                ))}
                {module.features.length > 4 && (
                  <li className="text-sm text-gray-400 italic">
                    +{module.features.length - 4} más...
                  </li>
                )}
              </ul>
            </div>

            {/* CTA */}
            <Link
              href={url}
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl font-semibold text-white transition-all hover:shadow-lg hover:scale-[1.02]"
              style={{ backgroundColor: module.color }}
            >
              {cta}
              <ArrowRight className="w-4 h-4" />
            </Link>

            <p className="mt-4 text-sm text-gray-500">
              {priceText}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Versión inline más compacta para usar en cards o secciones pequeñas
 */
export function ModuleLockedInline({
  moduleCode,
  activationCTA,
  activationUrl,
  className = ''
}: ModuleLockedOverlayProps) {
  const module = MODULES[moduleCode]
  const Icon = moduleIcons[moduleCode]
  const cta = activationCTA || module.ctaText
  const url = activationUrl || module.activationUrl

  return (
    <div className={`bg-gray-50 rounded-xl p-4 border border-gray-100 ${className}`}>
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${module.color}15` }}
        >
          <Lock className="w-5 h-5" style={{ color: module.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Icon className="w-4 h-4" style={{ color: module.color }} />
            <span className="font-medium text-gray-900">{module.name}</span>
          </div>
          <p className="text-sm text-gray-500 mb-3">{module.shortDescription}</p>
          <Link
            href={url}
            className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
            style={{ color: module.color }}
          >
            {cta}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
