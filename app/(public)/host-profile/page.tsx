'use client'

export const dynamic = 'force-dynamic'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Clock, Target, Gift, CheckCircle2, Users, BarChart3, Zap } from 'lucide-react'

const archetypes = [
  { emoji: '🎯', name: 'Estratega', desc: 'Datos y optimización', color: 'blue' },
  { emoji: '⚙️', name: 'Sistemático', desc: 'Procesos y automatización', color: 'purple' },
  { emoji: '✨', name: 'Diferenciador', desc: 'Marketing único', color: 'pink' },
  { emoji: '⚡', name: 'Ejecutor', desc: 'Acción y resultados', color: 'orange' },
  { emoji: '🛡️', name: 'Resolutor', desc: 'Gestión de crisis', color: 'green' },
  { emoji: '❤️', name: 'Experiencial', desc: 'Hospitalidad excepcional', color: 'rose' },
  { emoji: '⚖️', name: 'Equilibrado', desc: 'Balance vida-negocio', color: 'teal' },
  { emoji: '🎲', name: 'Improvisador', desc: 'Flexibilidad creativa', color: 'amber' },
]

export default function HostProfileLandingPage() {
  const searchParams = useSearchParams()

  // Build test URL with tracking params
  const buildTestUrl = () => {
    const params = new URLSearchParams()
    const src = searchParams.get('src')
    const level = searchParams.get('level')
    const email = searchParams.get('email')

    if (src) params.set('src', src)
    if (level) params.set('level', level)
    if (email) params.set('email', email)

    const queryString = params.toString()
    return `/host-profile/test${queryString ? `?${queryString}` : ''}`
  }

  const testUrl = buildTestUrl()

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-blue-50">
      {/* Hero */}
      <section className="pt-16 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Clock className="w-4 h-4" />
            Test de 5 minutos · 100% gratis
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            ¿Qué tipo de<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-600">
              anfitrión eres?
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Descubre tu perfil operativo, tus fortalezas naturales y las áreas que te están
            costando tiempo y dinero sin saberlo.
          </p>

          <Link
            href={testUrl}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all"
          >
            Hacer el test ahora
            <ArrowRight className="w-5 h-5" />
          </Link>

          <p className="text-sm text-gray-500 mt-4">
            +2,500 anfitriones ya conocen su perfil
          </p>
        </div>
      </section>

      {/* What you get */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
            Qué descubrirás con el test
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-violet-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tu arquetipo de anfitrión
              </h3>
              <p className="text-gray-600 text-sm">
                Descubre cuál de los 8 perfiles operativos eres y entiende por qué
                gestionas tu alojamiento como lo haces.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Fortalezas y brechas
              </h3>
              <p className="text-gray-600 text-sm">
                Análisis detallado de 8 dimensiones: hospitalidad, operativa, comunicación,
                crisis, datos, marketing, límites y balance.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Guía personalizada gratis
              </h3>
              <p className="text-gray-600 text-sm">
                Recibirás una guía PDF específica para tu perfil con estrategias,
                plantillas y casos de éxito relevantes para ti.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The 8 archetypes */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-4">
            Los 8 perfiles de anfitrión
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Cada anfitrión tiene un estilo único. El test analiza cómo gestionas tu negocio
            y te asigna el perfil que mejor te representa.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {archetypes.map((arch) => (
              <div
                key={arch.name}
                className="bg-white rounded-xl p-4 border border-gray-100 hover:border-violet-200 hover:shadow-md transition-all text-center"
              >
                <span className="text-3xl mb-2 block">{arch.emoji}</span>
                <h3 className="font-semibold text-gray-900">{arch.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{arch.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
            Cómo funciona
          </h2>

          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 bg-violet-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Responde 45 preguntas rápidas</h3>
                <p className="text-gray-600 text-sm">
                  Preguntas sobre cómo gestionas tu alojamiento día a día. No hay respuestas correctas o incorrectas.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 bg-violet-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Descubre tu perfil</h3>
                <p className="text-gray-600 text-sm">
                  Nuestro algoritmo analiza tus respuestas y determina tu arquetipo dominante entre los 8 perfiles.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 bg-violet-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Recibe tu guía personalizada</h3>
                <p className="text-gray-600 text-sm">
                  Te enviamos por email una guía PDF con estrategias específicas para tu perfil,
                  plantillas y recomendaciones de mejora.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-violet-600 to-blue-600 rounded-2xl p-8 md:p-12 text-white text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Users className="w-8 h-8" />
              <span className="text-4xl font-bold">+2,500</span>
            </div>
            <p className="text-xl mb-2">anfitriones han descubierto su perfil</p>
            <p className="text-violet-200 text-sm">
              "Entender mi arquetipo me ayudó a dejar de intentar ser algo que no soy y
              potenciar mis fortalezas naturales."
            </p>
            <p className="text-violet-300 text-sm mt-2">— Laura M., Superhost Barcelona</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
            Preguntas frecuentes
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">¿Cuánto tiempo toma el test?</h3>
              <p className="text-gray-600 text-sm">
                Entre 5-7 minutos. Son 45 preguntas con respuestas de selección rápida.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">¿Es realmente gratis?</h3>
              <p className="text-gray-600 text-sm">
                Sí, el test y los resultados son 100% gratis. También recibirás una guía
                personalizada sin coste alguno.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">¿Para qué se usa mi email?</h3>
              <p className="text-gray-600 text-sm">
                Para enviarte los resultados y la guía. También recibirás contenido útil para anfitriones
                (sin spam, puedes darte de baja cuando quieras).
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">¿Puedo hacer el test más de una vez?</h3>
              <p className="text-gray-600 text-sm">
                Sí, puedes repetirlo cuando quieras. Tu perfil puede evolucionar con el tiempo
                a medida que cambias tu forma de gestionar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Zap className="w-12 h-12 text-violet-600 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            ¿Listo para descubrir tu perfil?
          </h2>
          <p className="text-gray-600 mb-8">
            5 minutos que pueden cambiar cómo gestionas tu alojamiento.
          </p>

          <Link
            href={testUrl}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white font-semibold py-4 px-10 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all"
          >
            Empezar el test gratis
            <ArrowRight className="w-5 h-5" />
          </Link>

          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Gratis
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              5 minutos
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Guía incluida
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}
