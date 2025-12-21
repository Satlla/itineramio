'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function PlantillaContent() {
  const searchParams = useSearchParams()
  const nombre = searchParams.get('nombre') || 'Tu Alojamiento'
  const telefono = searchParams.get('telefono') || '+34 600 000 000'

  const whatsappPhone = telefono.replace(/[^\d+]/g, '').replace('+', '')
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent('Hola, tengo una pregunta sobre mi estancia')}`
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(whatsappUrl)}&bgcolor=ffffff&color=222222`

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header con botón - se oculta al imprimir */}
      <div className="print:hidden bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-gray-900">Guía Rápida de Reseñas</h1>
            <p className="text-sm text-gray-500">Guarda como PDF o imprime directamente</p>
          </div>
          <button
            onClick={handlePrint}
            className="bg-black text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Descargar PDF
          </button>
        </div>
      </div>

      {/* Plantilla - optimizada para impresión A4 */}
      <div className="max-w-[210mm] mx-auto p-8 print:p-0">
        <div className="bg-white border border-gray-200 print:border-gray-300 shadow-sm print:shadow-none">

          {/* Header con nombre del alojamiento */}
          <div className="px-8 pt-8 pb-0">
            <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Alojamiento</p>
            <p className="text-xl font-semibold text-gray-900">{nombre}</p>
          </div>

          {/* Título principal */}
          <div className="px-8 pt-6 pb-5 border-b border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Guía rápida de reseñas</h2>
            <p className="text-sm text-gray-600">Tu opinión ayuda a futuros viajeros y nos permite mejorar.</p>
          </div>

          {/* Contexto */}
          <div className="px-8 py-5 bg-gray-50">
            <p className="text-sm text-gray-600 leading-relaxed">
              En Airbnb, las estrellas suelen interpretarse de forma distinta a la escala tradicional.
              En general, <strong className="text-gray-900">5 estrellas</strong> significa que la estancia
              fue buena y que el alojamiento cumplió lo prometido.
            </p>
          </div>

          {/* Antes de valorar */}
          <div className="px-8 py-5 border-b border-gray-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-900 mb-2">Antes de valorar</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Si algo no ha estado perfecto, por favor cuéntanoslo. La mayoría de incidencias
              (Wi-Fi, climatización, ruido, reposición) se resuelven rápido si lo sabemos a tiempo.
            </p>
          </div>

          {/* Escala de estrellas */}
          <div className="px-8 py-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-900 mb-4">Escala orientativa</p>

            <div className="space-y-3">
              <div className="flex items-start gap-4 pb-3 border-b border-gray-50">
                <span className="text-base tracking-wide text-gray-900 w-24 flex-shrink-0">★★★★★</span>
                <p className="text-sm text-gray-600">Todo estuvo según lo descrito y la experiencia fue buena.</p>
              </div>

              <div className="flex items-start gap-4 pb-3 border-b border-gray-50">
                <span className="text-base tracking-wide w-24 flex-shrink-0">
                  <span className="text-gray-900">★★★★</span><span className="text-gray-300">★</span>
                </span>
                <p className="text-sm text-gray-600">Hubo algún aspecto importante que no cumplió expectativas.</p>
              </div>

              <div className="flex items-start gap-4 pb-3 border-b border-gray-50">
                <span className="text-base tracking-wide w-24 flex-shrink-0">
                  <span className="text-gray-900">★★★</span><span className="text-gray-300">★★</span>
                </span>
                <p className="text-sm text-gray-600">Hubo varios problemas relevantes que afectaron la estancia.</p>
              </div>

              <div className="flex items-start gap-4 pb-3 border-b border-gray-50">
                <span className="text-base tracking-wide w-24 flex-shrink-0">
                  <span className="text-gray-900">★★</span><span className="text-gray-300">★★★</span>
                </span>
                <p className="text-sm text-gray-600">La experiencia tuvo incidencias graves o deficiencias importantes.</p>
              </div>

              <div className="flex items-start gap-4">
                <span className="text-base tracking-wide w-24 flex-shrink-0">
                  <span className="text-gray-900">★</span><span className="text-gray-300">★★★★</span>
                </span>
                <p className="text-sm text-gray-600">Experiencia inaceptable (seguridad, higiene o veracidad).</p>
              </div>
            </div>
          </div>

          {/* Nota de transparencia */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-500 italic leading-relaxed">
              Valora con total honestidad. Esta guía solo pretende aclarar el significado
              habitual de las estrellas en la plataforma.
            </p>
          </div>

          {/* Caja de contacto */}
          <div className="px-8 py-6 border-t border-gray-200">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-900 mb-2">Soporte</p>
                <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                  Si necesitas algo durante tu estancia, escríbenos y lo resolvemos lo antes posible.
                </p>
                <p className="text-base font-medium text-gray-900">{telefono}</p>
              </div>
              <div className="flex-shrink-0">
                <img
                  src={qrCodeUrl}
                  alt="QR WhatsApp"
                  className="w-20 h-20"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Footer - se oculta al imprimir */}
        <div className="print:hidden mt-6 text-center">
          <p className="text-sm text-gray-500">
            Creado con <a href="https://www.itineramio.com" className="text-gray-700 hover:underline">Itineramio</a>
          </p>
        </div>
      </div>

      {/* Estilos de impresión */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  )
}

export default function DescargarPlantillaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Cargando plantilla...</p>
      </div>
    }>
      <PlantillaContent />
    </Suspense>
  )
}
