import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getLeadMagnetBySlug, getAllLeadMagnetSlugs } from '@/data/lead-magnets'
import {
  CheckCircle2,
  Download,
  Mail,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

export async function generateStaticParams() {
  return getAllLeadMagnetSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const leadMagnet = getLeadMagnetBySlug(slug)

  if (!leadMagnet) {
    return {
      title: 'Gracias',
    }
  }

  return {
    title: `Descarga tu guía: ${leadMagnet.title} | Itineramio`,
    description: `Gracias por descargar ${leadMagnet.title}. Tu guía está lista.`,
  }
}

export default async function ThankYouPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const leadMagnet = getLeadMagnetBySlug(slug)

  if (!leadMagnet) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Success Header */}
        <div className="text-center mb-12">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            ¡Todo listo!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tu guía <span className="font-semibold">{leadMagnet.title}</span> está
            lista para descargar
          </p>
        </div>

        {/* Download Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl mb-4">
              <Download className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Descarga tu guía ahora
            </h2>
            <p className="text-gray-600 mb-6">
              Haz clic en el botón para descargar tu PDF ({leadMagnet.pages}{' '}
              páginas)
            </p>

            {/* Download Button */}
            <a
              href={leadMagnet.downloadUrl}
              download
              className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-4 px-8 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Download className="w-5 h-5" />
              Descargar {leadMagnet.title}
            </a>

            <p className="text-sm text-gray-500 mt-4">
              Si la descarga no empieza automáticamente, haz clic en el botón
            </p>
          </div>
        </div>

        {/* Email Confirmation */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                También lo enviamos a tu email
              </h3>
              <p className="text-gray-600 text-sm">
                Revisa tu bandeja de entrada (y spam por si acaso). Te hemos
                enviado un email con el enlace de descarga y recursos adicionales.
              </p>
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            ¿Qué sigue ahora?
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Lee tu guía completa
                </h3>
                <p className="text-gray-600 text-sm">
                  Dedica {Math.ceil(leadMagnet.pages * 2)} minutos a leer todo el
                  contenido y toma notas.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Implementa una acción hoy mismo
                </h3>
                <p className="text-gray-600 text-sm">
                  Elige la recomendación más fácil de aplicar y hazla ahora.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Únete a nuestra comunidad
                </h3>
                <p className="text-gray-600 text-sm">
                  Recibirás consejos semanales y recursos exclusivos por email.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA to Itineramio */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            ¿Listo para automatizar tu negocio?
          </h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Itineramio te ayuda a gestionar tus propiedades de alquiler vacacional
            de forma eficiente. Automatiza tareas, ahorra tiempo y aumenta tus
            ingresos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-all duration-200"
            >
              Explorar Itineramio
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/recursos"
              className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white font-semibold py-3 px-6 rounded-lg hover:bg-white/20 transition-all duration-200 border border-white/20"
            >
              Ver más recursos
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
