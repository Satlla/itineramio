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

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header con botón - se oculta al imprimir */}
      <div className="print:hidden bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-gray-900">Checklist de Limpieza</h1>
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
      <div className="max-w-[210mm] mx-auto p-6 print:p-0">
        <div className="bg-white border border-gray-200 print:border-gray-300 shadow-sm print:shadow-none">

          {/* Header con nombre del alojamiento */}
          <div className="px-6 pt-5 pb-4 border-b border-gray-100">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Alojamiento</p>
            <p className="text-lg font-semibold text-gray-900">{nombre}</p>
            {direccion && (
              <p className="text-xs text-gray-500 mt-1">📍 {direccion}</p>
            )}
            <div className="mt-3">
              <h2 className="text-xl font-semibold text-gray-900">Checklist de Limpieza</h2>
              <p className="text-xs text-gray-500 mt-1">{totalTasks} tareas · Marcar cada tarea completada</p>
            </div>
          </div>

          {/* Instrucciones */}
          <div className="px-6 py-3 bg-gray-50">
            <p className="text-xs text-gray-600 leading-relaxed">
              Completa cada tarea en orden. <strong className="text-gray-900">Marca con ✓</strong> cuando termines cada una.
            </p>
          </div>

          {/* Secciones del checklist */}
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className={sectionIndex > 0 ? 'border-t border-gray-100' : ''}>
              <div className="px-6 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-900 mb-2">
                  {section.title}
                </p>
                <div className="space-y-1.5">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start gap-3">
                      <div className="w-4 h-4 border border-gray-300 rounded-sm flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-gray-700 leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Espacio para notas */}
          <div className="px-6 py-3 border-t border-gray-100">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-900 mb-2">Notas</p>
            <div className="border border-dashed border-gray-200 rounded p-3 min-h-[40px]">
              <p className="text-[10px] text-gray-300">Espacio para anotaciones...</p>
            </div>
          </div>

          {/* Footer con firma */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center justify-between text-[10px] text-gray-500">
              <span>Fecha: ________________</span>
              <span>Firma: ________________</span>
            </div>
          </div>

          {/* Nota final */}
          <div className="px-6 py-2 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 italic">
              Verificar todas las tareas antes de la llegada del huésped.
            </p>
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
