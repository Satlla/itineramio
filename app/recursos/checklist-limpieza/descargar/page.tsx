'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

interface ChecklistSection {
  title: string
  items: string[]
}

function ChecklistContent() {
  const searchParams = useSearchParams()
  const nombre = searchParams.get('nombre') || 'Mi Propiedad'
  const direccion = searchParams.get('direccion') || ''

  let sections: ChecklistSection[] = []
  try {
    const seccionesParam = searchParams.get('secciones')
    if (seccionesParam) {
      sections = JSON.parse(seccionesParam)
    }
  } catch {
    // Default sections if parsing fails
    sections = [
      { title: 'Cocina', items: ['Limpiar encimera', 'Limpiar electrodomésticos', 'Limpiar fregadero'] },
      { title: 'Baño', items: ['Limpiar inodoro', 'Limpiar lavabo', 'Limpiar ducha'] },
      { title: 'Dormitorio', items: ['Cambiar sábanas', 'Hacer cama', 'Aspirar'] },
      { title: 'General', items: ['Barrer y fregar suelos', 'Vaciar papeleras', 'Ventilar'] }
    ]
  }

  const totalTasks = sections.reduce((acc, s) => acc + s.items.length, 0)
  const currentDate = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header con botón - se oculta al imprimir */}
      <div className="print:hidden bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-gray-900">Checklist de Limpieza Profesional</h1>
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

      {/* Checklist - optimizada para impresión A4 */}
      <div className="max-w-[210mm] mx-auto p-6 print:p-0">
        <div className="bg-white border border-gray-200 print:border-gray-300 shadow-sm print:shadow-none">

          {/* Header con gradiente */}
          <div className="px-6 py-5 bg-gradient-to-r from-blue-500 to-cyan-500">
            <p className="text-[10px] uppercase tracking-wider text-white/80 mb-0.5">Checklist de Limpieza</p>
            <p className="text-xl font-semibold text-white mb-1">{nombre}</p>
            {direccion && (
              <p className="text-sm text-white/90 mb-2">📍 {direccion}</p>
            )}
            <div className="flex items-center justify-between">
              <p className="text-xs text-white/70">{totalTasks} tareas · {currentDate}</p>
            </div>
          </div>

          {/* Secciones del checklist */}
          <div className="divide-y divide-gray-100">
            {sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="px-6 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-900 mb-3">
                  {section.title}
                </p>
                <div className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start gap-3">
                      <div className="w-4 h-4 border-2 border-gray-300 rounded flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 leading-tight">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Espacio para notas */}
          <div className="px-6 py-4 border-t border-gray-100">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-2">Notas adicionales</p>
            <div className="border border-dashed border-gray-300 rounded-md p-3 min-h-[50px]">
              <p className="text-[10px] text-gray-400">Espacio para anotaciones...</p>
            </div>
          </div>

          {/* Footer con firma */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between text-[10px] text-gray-500">
              <span>Fecha: ________________</span>
              <span>Firma: ________________</span>
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
            margin: 10mm;
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

export default function DescargarChecklistPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Cargando checklist...</p>
      </div>
    }>
      <ChecklistContent />
    </Suspense>
  )
}
