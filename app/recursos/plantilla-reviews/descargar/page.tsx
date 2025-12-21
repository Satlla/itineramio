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

      {/* Plantilla - optimizada para impresión A4 en UNA página */}
      <div className="max-w-[210mm] mx-auto p-6 print:p-0">
        <div className="bg-white border border-gray-200 print:border-gray-300 shadow-sm print:shadow-none">

          {/* Header con nombre + título en una fila */}
          <div className="px-6 pt-5 pb-4 border-b border-gray-100">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Alojamiento</p>
            <p className="text-lg font-semibold text-gray-900 mb-3">{nombre}</p>
            <h2 className="text-xl font-semibold text-gray-900">Guía rápida de reseñas</h2>
            <p className="text-xs text-gray-500 mt-1">Tu opinión ayuda a futuros viajeros y nos permite mejorar.</p>
          </div>

          {/* Contexto - más compacto */}
          <div className="px-6 py-3 bg-gray-50">
            <p className="text-xs text-gray-600 leading-relaxed">
              En Airbnb, las estrellas se interpretan distinto. <strong className="text-gray-900">5 estrellas</strong> = la estancia fue buena y cumplió lo prometido.
            </p>
          </div>

          {/* Antes de valorar - compacto */}
          <div className="px-6 py-3 border-b border-gray-100">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-900 mb-1">Antes de valorar</p>
            <p className="text-xs text-gray-600">
              Si algo no estuvo perfecto, cuéntanoslo. La mayoría de incidencias se resuelven rápido.
            </p>
          </div>

          {/* Escala de estrellas - compacta */}
          <div className="px-6 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-900 mb-2">Escala orientativa</p>

            <table className="w-full text-xs">
              <tbody>
                <tr className="border-b border-gray-50">
                  <td className="py-1.5 w-20 text-sm text-gray-900">★★★★★</td>
                  <td className="py-1.5 text-gray-600">Todo según lo descrito, experiencia buena.</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="py-1.5 w-20 text-sm"><span className="text-gray-900">★★★★</span><span className="text-gray-300">★</span></td>
                  <td className="py-1.5 text-gray-600">Algún aspecto importante no cumplió expectativas.</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="py-1.5 w-20 text-sm"><span className="text-gray-900">★★★</span><span className="text-gray-300">★★</span></td>
                  <td className="py-1.5 text-gray-600">Varios problemas relevantes afectaron la estancia.</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="py-1.5 w-20 text-sm"><span className="text-gray-900">★★</span><span className="text-gray-300">★★★</span></td>
                  <td className="py-1.5 text-gray-600">Incidencias graves o deficiencias importantes.</td>
                </tr>
                <tr>
                  <td className="py-1.5 w-20 text-sm"><span className="text-gray-900">★</span><span className="text-gray-300">★★★★</span></td>
                  <td className="py-1.5 text-gray-600">Experiencia inaceptable (seguridad, higiene, veracidad).</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Nota de transparencia - una línea */}
          <div className="px-6 py-2 bg-gray-50 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 italic">
              Valora con honestidad. Esta guía solo aclara el significado habitual de las estrellas.
            </p>
          </div>

          {/* Caja de contacto - compacta */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-900 mb-1">¿Necesitas ayuda?</p>
                <p className="text-xs text-gray-600 mb-1">Escríbenos y lo resolvemos.</p>
                <p className="text-sm font-medium text-gray-900">{telefono}</p>
              </div>
              <div className="flex-shrink-0">
                <img src={qrCodeUrl} alt="QR WhatsApp" className="w-16 h-16" />
              </div>
            </div>
          </div>

        </div>

        {/* Footer - se oculta al imprimir */}
        <div className="print:hidden mt-4 text-center">
          <p className="text-xs text-gray-500">
            Creado con <a href="https://www.itineramio.com" className="text-gray-700 hover:underline">Itineramio</a>
          </p>
        </div>
      </div>

      {/* Estilos de impresión */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm;
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
