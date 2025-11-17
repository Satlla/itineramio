import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { validateDownloadToken } from '@/lib/tokens'
import { getLeadMagnetBySlug } from '@/data/lead-magnets'
import { Download, CheckCircle2, Sparkles, ArrowRight, BookOpen } from 'lucide-react'
import { genderWord, type Gender } from '@/lib/gender-text'

export const metadata: Metadata = {
  title: 'Descarga tu guía | Itineramio',
  robots: 'noindex, nofollow' // No indexar esta página
}

export default async function DownloadPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ token?: string }>
}) {
  const { slug } = await params
  const { token } = await searchParams

  // Validar que existe el lead magnet
  const leadMagnet = getLeadMagnetBySlug(slug)
  if (!leadMagnet) {
    notFound()
  }

  // Si no hay token, redirect a landing normal
  if (!token) {
    redirect(`/recursos/${slug}`)
  }

  // Validar token
  const tokenValidation = validateDownloadToken(token)

  if (!tokenValidation.valid) {
    // Token inválido o expirado → redirect a landing normal
    redirect(`/recursos/${slug}?error=token_invalid`)
  }

  // Verificar que el token corresponde a este lead magnet
  if (tokenValidation.leadMagnetSlug !== slug) {
    redirect(`/recursos/${slug}?error=token_mismatch`)
  }

  // Verificar que el subscriber existe y está activo
  const subscriber = await prisma.emailSubscriber.findUnique({
    where: { id: tokenValidation.subscriberId }
  })

  if (!subscriber || subscriber.status !== 'active') {
    redirect(`/recursos/${slug}?error=subscriber_inactive`)
  }

  // Actualizar tracking: marcar que descargó la guía
  await prisma.emailSubscriber.update({
    where: { id: subscriber.id },
    data: {
      downloadedGuide: true,
      lastEngagement: new Date(),
      currentJourneyStage: 'guide_downloaded',
      // Si no estaba en hot, subirlo a hot
      engagementScore: subscriber.engagementScore === 'cold' ? 'warm' : 'hot'
    }
  })

  // Texto adaptado por género
  const readyText = genderWord('listo', subscriber.gender as Gender)
  const anfitrionText = genderWord('anfitrion', subscriber.gender as Gender)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">

        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            ¡Tu guía está {readyText}!
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Hola {subscriber.name || anfitrionText}, gracias por tu interés.
            Tu guía personalizada está disponible para descarga.
          </p>
        </div>

        {/* Guide Info Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className={`w-16 h-16 rounded-xl ${leadMagnet.color} flex items-center justify-center text-3xl flex-shrink-0`}>
              {leadMagnet.icon}
            </div>
            <div className="flex-1">
              <div className="mb-3">
                <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                  {leadMagnet.archetype}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {leadMagnet.title}
              </h2>
              <p className="text-lg text-gray-600">
                {leadMagnet.subtitle}
              </p>
            </div>
          </div>

          {/* What's included */}
          <div className="border-t border-gray-200 pt-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              📦 Lo que incluye tu guía:
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {leadMagnet.downloadables.map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Download Button */}
          <div className="text-center">
            <a
              href={leadMagnet.downloadUrl}
              download
              className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg px-8 py-4 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Download className="w-6 h-6" />
              Descargar PDF ahora ({leadMagnet.pages} páginas)
            </a>

            <p className="text-sm text-gray-500 mt-4">
              PDF optimizado · {leadMagnet.pages} páginas · Descarga ilimitada
            </p>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-bold text-gray-900">
              ¿Qué sigue ahora?
            </h3>
          </div>

          <ol className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <div className="font-bold text-gray-900">Lee tu guía completa</div>
                <div className="text-gray-600 text-sm">
                  Revisa las {leadMagnet.pages} páginas y descarga los recursos incluidos
                </div>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <div className="font-bold text-gray-900">Implementa los consejos</div>
                <div className="text-gray-600 text-sm">
                  Pon en práctica las estrategias específicas para tu perfil
                </div>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <div className="font-bold text-gray-900">Revisa tu email en los próximos días</div>
                <div className="text-gray-600 text-sm">
                  Te enviaré casos de éxito y recursos adicionales personalizados
                </div>
              </div>
            </li>
          </ol>
        </div>

        {/* CTA to Product */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              ¿{readyText.charAt(0).toUpperCase() + readyText.slice(1)} para automatizar tu gestión?
            </h3>
            <p className="text-gray-600 mb-6">
              Con Itineramio puedes crear manuales digitales interactivos para tus alojamientos
              y ahorrar hasta 15 horas al mes respondiendo las mismas preguntas.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/register"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                <Sparkles className="w-5 h-5" />
                Prueba 15 días gratis
                <ArrowRight className="w-5 h-5" />
              </a>

              <a
                href="/demo"
                className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 font-semibold px-6 py-3 rounded-xl hover:bg-gray-200 transition-all"
              >
                <BookOpen className="w-5 h-5" />
                Ver demo
              </a>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              Sin tarjeta · Prueba 15 días sin compromiso · Setup en 5 minutos
            </p>
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            ¿Tienes preguntas? Responde al email y te ayudaré personalmente.
          </p>
        </div>
      </div>
    </div>
  )
}
