'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, CheckCircle, Rocket, Gift, ArrowRight, Bell, Shield } from 'lucide-react'
import { trackNewsletterSubscribed, trackGenerateLead } from '@/lib/analytics'
import { fbEvents } from '@/components/analytics/FacebookPixel'

interface NewsletterCTAProps {
  variant?: 'inline' | 'box' | 'trial' | 'normativa'
  title?: string
  description?: string
  placeholder?: string
  buttonText?: string
  source?: string // Para tracking de dónde vino la conversión
}

export function NewsletterCTA({
  variant = 'box',
  title,
  description,
  placeholder = 'tu@email.com',
  buttonText = 'Suscribirse',
  source = 'blog'
}: NewsletterCTAProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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
          email,
          source,
          tags: ['blog-subscriber']
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage('¡Genial! Revisa tu email para confirmar la suscripción')
        setEmail('')

        // Track analytics events (GTM + GA4)
        trackNewsletterSubscribed({
          source: source as 'blog' | 'homepage' | 'modal' | 'footer',
          listName: 'blog-subscriber'
        })
        trackGenerateLead({
          source: 'blog',
          value: 10
        })
        // Facebook Pixel event
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

  // Variant: Trial CTA (Específico para prueba gratuita)
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
            {description || 'Prueba Itineramio gratis durante 15 días. Sin tarjeta de crédito. Prueba 15 días sin compromiso.'}
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

  // Variant: Normativa (Para artículos de normativa - captura leads interesados en regulación)
  if (variant === 'normativa') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="my-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Bell className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">
                {title || 'Recibe alertas de cambios en la normativa'}
              </h3>
              <p className="text-slate-400 text-sm">
                {description || 'Te avisamos cuando haya novedades importantes que afecten a tu alquiler vacacional.'}
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
                <span className="text-sm text-green-400">Te avisaremos de cualquier cambio normativo importante.</span>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={placeholder}
                  disabled={status === 'loading'}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-6 py-4 bg-amber-500 text-slate-900 font-bold rounded-xl hover:bg-amber-400 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 whitespace-nowrap"
              >
                {status === 'loading' ? (
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Bell className="w-5 h-5" />
                    {buttonText || 'Activar alertas'}
                  </>
                )}
              </button>
            </form>
          )}

          {message && status === 'error' && (
            <p className="mt-3 text-sm text-red-400">{message}</p>
          )}

          <div className="mt-5 flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              Sin spam
            </span>
            <span>Solo novedades importantes</span>
            <span>Baja cuando quieras</span>
          </div>
        </div>
      </motion.div>
    )
  }

  // Variant: Inline (Para dentro del contenido)
  if (variant === 'inline') {
    return (
      <div className="my-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 rounded-lg">
        <h4 className="text-lg font-bold text-gray-900 mb-2">
          {title || '📧 ¿Quieres más guías como esta?'}
        </h4>
        <p className="text-gray-600 mb-4">
          {description || 'Suscríbete y recibe contenido exclusivo para profesionalizar tu negocio de alquiler vacacional.'}
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            disabled={status === 'loading' || status === 'success'}
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed inline-flex items-center justify-center"
          >
            {status === 'loading' ? (
              'Enviando...'
            ) : status === 'success' ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                ¡Listo!
              </>
            ) : (
              buttonText
            )}
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

  // Variant: Box (Default - Para final de artículo)
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
            {description || 'Únete a más de 500 anfitriones que reciben estrategias semanales para profesionalizar su negocio de alquiler vacacional.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              disabled={status === 'loading' || status === 'success'}
              className="flex-1 px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500 focus:outline-none disabled:bg-gray-100 text-lg"
            />
            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed inline-flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {status === 'loading' ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Enviando...
                </>
              ) : status === 'success' ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  ¡Suscrito!
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5 mr-2" />
                  {buttonText}
                </>
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
          📬 1 email semanal · Sin spam · Prueba 15 días sin compromiso
        </p>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-gray-600 mb-4">
            ¿Prefieres empezar ahora mismo?
          </p>
          <div className="text-center">
            <a
              href="https://www.itineramio.com?utm_source=blog&utm_medium=newsletter&utm_campaign=trial"
              className="inline-flex items-center text-violet-600 hover:text-violet-700 font-semibold"
            >
              Prueba Itineramio 15 días gratis
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
