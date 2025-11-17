import { LeadMagnet } from '@/data/lead-magnets'
import { FileText, CheckCircle2 } from 'lucide-react'

export default function ContentPreview({
  leadMagnet,
}: {
  leadMagnet: LeadMagnet
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8 border border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
          <FileText className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Qué incluye esta guía
          </h2>
          <p className="text-gray-600">
            {leadMagnet.pages} páginas de contenido práctico
          </p>
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-4">
        {Object.entries(leadMagnet.preview).map(([key, value], index) => (
          <div
            key={key}
            className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg"
          >
            <h3 className="font-semibold text-gray-900 mb-2">
              Capítulo {index + 1}
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">{value}</p>
          </div>
        ))}
      </div>

      {/* Downloadables */}
      {leadMagnet.downloadables.length > 0 && (
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Recursos descargables incluidos
          </h3>
          <ul className="space-y-3">
            {leadMagnet.downloadables.map((item, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-gray-700 text-sm"
              >
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold text-xs">
                  {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 text-center">
        <p className="text-gray-900 font-semibold mb-2">
          ¿Listo para transformar tu negocio?
        </p>
        <p className="text-gray-600 text-sm">
          Descarga esta guía gratis y empieza hoy mismo →
        </p>
      </div>
    </div>
  )
}
