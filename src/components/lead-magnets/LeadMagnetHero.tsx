import { LeadMagnet } from '@/data/lead-magnets'
import {
  TrendingUp,
  ListChecks,
  Sparkles,
  Flame,
  ShieldCheck,
  Heart,
  Scale,
  Zap,
} from 'lucide-react'

const iconMap = {
  TrendingUp,
  ListChecks,
  Sparkles,
  Flame,
  ShieldCheck,
  Heart,
  Scale,
  Zap,
}

const colorMap = {
  blue: 'from-blue-600 to-blue-700',
  purple: 'from-purple-600 to-purple-700',
  orange: 'from-orange-600 to-orange-700',
  red: 'from-red-600 to-red-700',
  green: 'from-green-600 to-green-700',
  pink: 'from-pink-600 to-pink-700',
  teal: 'from-teal-600 to-teal-700',
  yellow: 'from-yellow-500 to-yellow-600',
}

export default function LeadMagnetHero({
  leadMagnet,
}: {
  leadMagnet: LeadMagnet
}) {
  const Icon = iconMap[leadMagnet.icon as keyof typeof iconMap] || TrendingUp
  const gradientClass = colorMap[leadMagnet.color as keyof typeof colorMap]

  return (
    <div className={`bg-gradient-to-r ${gradientClass} text-white py-12 lg:py-16`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Icon className="w-8 h-8 lg:w-10 lg:h-10" />
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
            <span className="text-sm font-medium">
              Guía gratuita para {leadMagnet.archetype}s
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3 leading-tight">
            {leadMagnet.title}
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl lg:text-2xl font-light mb-4 text-white/90">
            {leadMagnet.subtitle}
          </p>

          {/* Description */}
          <p className="text-base md:text-lg lg:text-xl max-w-3xl mx-auto mb-6 text-white/80">
            {leadMagnet.description}
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-5 py-2.5">
              <div className="font-bold text-xl lg:text-2xl">{leadMagnet.pages}</div>
              <div className="text-white/80 text-xs">páginas</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-5 py-2.5">
              <div className="font-bold text-xl lg:text-2xl">
                {leadMagnet.downloadables.length}
              </div>
              <div className="text-white/80 text-xs">recursos</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-5 py-2.5">
              <div className="font-bold text-xl lg:text-2xl">100%</div>
              <div className="text-white/80 text-xs">gratis</div>
            </div>
          </div>

          {/* Scroll CTA */}
          <div className="mt-8">
            <p className="text-white/60 text-sm">↓ Descarga gratis abajo ↓</p>
          </div>
        </div>
      </div>
    </div>
  )
}
