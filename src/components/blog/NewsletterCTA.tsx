'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, CheckCircle, Rocket, Gift, ArrowRight, Bell, Shield, User, BookOpen, Zap, TrendingUp, Settings, Megaphone, Award } from 'lucide-react'
import { trackNewsletterSubscribed, trackGenerateLead } from '@/lib/analytics'
import { fbEvents } from '@/components/analytics/FacebookPixel'

// Configuración de cada embudo/categoría
const categoryConfig: Record<string, {
  icon: typeof Mail
  title: string
  description: string
  buttonText: string
  gradient: string
  iconBg: string
  iconColor: string
  buttonBg: string
  buttonHover: string
}> = {
  // NORMATIVA - Alertas legales
  normativa: {
    icon: Bell,
    title: 'Recibe alertas de cambios en la normativa',
    description: 'Te avisamos cuando haya novedades legales que afecten a tu alquiler vacacional.',
    buttonText: 'Activar alertas',
    gradient: 'from-slate-900 via-slate-800 to-slate-900',
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-400',
    buttonBg: 'bg-amber-500 hover:bg-amber-400',
    buttonHover: 'shadow-amber-500/20'
  },
  // GUIAS - Guías prácticas
  guias: {
    icon: BookOpen,
    title: 'Recibe guías exclusivas para anfitriones',
    description: 'Guías paso a paso para gestionar tu alquiler vacacional como un profesional.',
    buttonText: 'Quiero las guías',
    gradient: 'from-violet-900 via-purple-800 to-violet-900',
    iconBg: 'bg-violet-500/20',
    iconColor: 'text-violet-400',
    buttonBg: 'bg-violet-500 hover:bg-violet-400',
    buttonHover: 'shadow-violet-500/20'
  },
  // AUTOMATIZACION - Tips de automatización
  automatizacion: {
    icon: Zap,
    title: 'Automatiza tu Airbnb y ahorra horas',
    description: 'Recibe estrategias de automatización para gestionar tus propiedades sin estrés.',
    buttonText: 'Quiero automatizar',
    gradient: 'from-cyan-900 via-blue-800 to-cyan-900',
    iconBg: 'bg-cyan-500/20',
    iconColor: 'text-cyan-400',
    buttonBg: 'bg-cyan-500 hover:bg-cyan-400',
    buttonHover: 'shadow-cyan-500/20'
  },
  // MEJORES_PRACTICAS - Best practices
  mejores_practicas: {
    icon: Award,
    title: 'Aprende de los mejores anfitriones',
    description: 'Mejores prácticas y trucos que usan los Superhosts para destacar.',
    buttonText: 'Quiero mejorar',
    gradient: 'from-emerald-900 via-green-800 to-emerald-900',
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-400',
    buttonBg: 'bg-emerald-500 hover:bg-emerald-400',
    buttonHover: 'shadow-emerald-500/20'
  },
  // OPERACIONES - Gestión operativa
  operaciones: {
    icon: Settings,
    title: 'Optimiza las operaciones de tu alojamiento',
    description: 'Consejos prácticos para mejorar limpieza, check-in, mantenimiento y más.',
    buttonText: 'Optimizar ahora',
    gradient: 'from-orange-900 via-amber-800 to-orange-900',
    iconBg: 'bg-orange-500/20',
    iconColor: 'text-orange-400',
    buttonBg: 'bg-orange-500 hover:bg-orange-400',
    buttonHover: 'shadow-orange-500/20'
  },
  // MARKETING - Promoción y visibilidad
  marketing: {
    icon: Megaphone,
    title: 'Consigue más reservas para tu alojamiento',
    description: 'Estrategias de marketing y visibilidad para llenar tu calendario.',
    buttonText: 'Más reservas',
    gradient: 'from-pink-900 via-rose-800 to-pink-900',
    iconBg: 'bg-pink-500/20',
    iconColor: 'text-pink-400',
    buttonBg: 'bg-pink-500 hover:bg-pink-400',
    buttonHover: 'shadow-pink-500/20'
  },
  // CASOS_ESTUDIO - Casos de éxito
  casos_estudio: {
    icon: TrendingUp,
    title: 'Casos de éxito de anfitriones reales',
    description: 'Aprende de las historias y estrategias de anfitriones que han triunfado.',
    buttonText: 'Ver más casos',
    gradient: 'from-indigo-900 via-blue-800 to-indigo-900',
    iconBg: 'bg-indigo-500/20',
    iconColor: 'text-indigo-400',
    buttonBg: 'bg-indigo-500 hover:bg-indigo-400',
    buttonHover: 'shadow-indigo-500/20'
  }
}

interface NewsletterCTAProps {
  variant?: 'inline' | 'box' | 'trial' | 'normativa' | 'guias' | 'automatizacion' | 'mejores_practicas' | 'operaciones' | 'marketing' | 'casos_estudio'
  title?: string
  description?: string
  placeholder?: string
  buttonText?: string
  source?: string
}

export function NewsletterCTA({
  variant = 'box',
  title,
  description,
  placeholder = 'tu@email.com',
  buttonText,
  source = 'blog'
}: NewsletterCTAProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || name.trim().length < 2) {
      setStatus('error')
      setMessage('Por favor, introduce tu nombre')
      return
    }

    if (!email || !email.includes('@')) {
      setStatus('error')
      setMessage('Por favor, introduce un email válido')
      return
    }

    setStatus('loading')

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email,
          source,
          tags: ['blog-subscriber', `funnel-${variant}`]
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage('¡Genial! Revisa tu email para confirmar la suscripción')
        setName('')
        setEmail('')

        trackNewsletterSubscribed({
          source: source as 'blog' | 'homepage' | 'modal' | 'footer',
          listName: `blog-${variant}`
        })
        trackGenerateLead({
          source: 'blog',
          value: 10
        })
        fbEvents.lead({
          content_name: 'Newsletter Subscription',
          content_category: source,
          value: 10,
          currency: 'EUR'
        })
      } else {
        setStatus('error')
        setMessage(data.error || 'Hubo un error. Inténtalo de nuevo.')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Error de conexión. Inténtalo de nuevo.')
    }

    setTimeout(() => {
      setStatus('idle')
      setMessage('')
    }, 5000)
  }

  // Variant: Trial CTA
  if (variant === 'trial') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="my-12 bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl"
      >
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-full mb-6"
          >
            <Gift className="w-4 h-4" />
            <span className="text-sm font-medium">Oferta especial</span>
          </motion.div>

          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            {title || '¿Listo para crear tu manual digital profesional?'}
          </h3>
          <p className="text-xl text-white/90 mb-8">
            {description || 'Prueba Itineramio gratis durante 15 días. Sin tarjeta de crédito.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://www.itineramio.com?utm_source=blog&utm_medium=cta&utm_campaign=trial"
              className="inline-flex items-center px-8 py-4 bg-white text-violet-600 font-semibold rounded-xl hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Prueba 15 Días Gratis
              <ArrowRight className="w-5 h-5 ml-2" />
            </a>
            <span className="text-sm text-white/80">
              ✨ Sin tarjeta · 500+ anfitriones ya lo usan
            </span>
          </div>
        </div>
      </motion.div>
    )
  }

  // Variant: Inline
  if (variant === 'inline') {
    return (
      <div className="my-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 rounded-lg">
        <h4 className="text-lg font-bold text-gray-900 mb-2">
          {title || '📧 ¿Quieres más contenido como este?'}
        </h4>
        <p className="text-gray-600 mb-4">
          {description || 'Suscríbete y recibe contenido exclusivo para profesionalizar tu negocio de alquiler vacacional.'}
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              disabled={status === 'loading' || status === 'success'}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              disabled={status === 'loading' || status === 'success'}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
            />
          </div>
          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed inline-flex items-center justify-center"
          >
            {status === 'loading' ? 'Enviando...' : status === 'success' ? (
              <><CheckCircle className="w-5 h-5 mr-2" />¡Listo!</>
            ) : buttonText || 'Suscribirse'}
          </button>
        </form>
        {message && (
          <p className={`mt-3 text-sm ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>
    )
  }

  // Category-specific variants (normativa, guias, automatizacion, etc.)
  const config = categoryConfig[variant]
  if (config) {
    const Icon = config.icon
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={`my-10 bg-gradient-to-br ${config.gradient} rounded-2xl p-8 text-white shadow-xl relative overflow-hidden`}
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex items-start gap-4 mb-6">
            <div className={`w-14 h-14 ${config.iconBg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-7 h-7 ${config.iconColor}`} />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">
                {title || config.title}
              </h3>
              <p className="text-white/70 text-sm">
                {description || config.description}
              </p>
            </div>
          </div>

          {status === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 bg-green-500/20 text-green-300 px-5 py-4 rounded-xl"
            >
              <CheckCircle className="w-6 h-6" />
              <div>
                <span className="font-semibold block">¡Suscripción confirmada!</span>
                <span className="text-sm text-green-400">Revisa tu email para confirmar.</span>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre"
                    disabled={status === 'loading'}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-white/30 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="flex-1 relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={placeholder}
                    disabled={status === 'loading'}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-white/30 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className={`w-full sm:w-auto px-6 py-4 ${config.buttonBg} text-white font-bold rounded-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg ${config.buttonHover} whitespace-nowrap`}
              >
                {status === 'loading' ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Icon className="w-5 h-5" />
                    {buttonText || config.buttonText}
                  </>
                )}
              </button>
            </form>
          )}

          {message && status === 'error' && (
            <p className="mt-3 text-sm text-red-400">{message}</p>
          )}

          <div className="mt-5 flex items-center gap-4 text-xs text-white/50">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              Sin spam
            </span>
            <span>Contenido exclusivo</span>
            <span>Baja cuando quieras</span>
          </div>
        </div>
      </motion.div>
    )
  }

  // Default: Box variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="my-12 bg-white rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-gray-100"
    >
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            {title || 'No te pierdas ninguna guía'}
          </h3>
          <p className="text-lg text-gray-600">
            {description || 'Únete a más de 500 anfitriones que reciben estrategias semanales para profesionalizar su negocio.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  disabled={status === 'loading' || status === 'success'}
                  className="w-full pl-14 pr-6 py-4 rounded-xl border-2 border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500 focus:outline-none disabled:bg-gray-100 text-lg"
                />
              </div>
              <div className="relative flex-1">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={placeholder}
                  disabled={status === 'loading' || status === 'success'}
                  className="w-full pl-14 pr-6 py-4 rounded-xl border-2 border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500 focus:outline-none disabled:bg-gray-100 text-lg"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed inline-flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {status === 'loading' ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />Enviando...</>
              ) : status === 'success' ? (
                <><CheckCircle className="w-5 h-5 mr-2" />¡Suscrito!</>
              ) : (
                <><Mail className="w-5 h-5 mr-2" />{buttonText || 'Suscribirse'}</>
              )}
            </button>
          </div>

          {message && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-center font-medium ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}
            >
              {message}
            </motion.p>
          )}
        </form>

        <p className="mt-6 text-sm text-gray-500 text-center">
          📬 1 email semanal · Sin spam · Baja cuando quieras
        </p>
      </div>
    </motion.div>
  )
}
