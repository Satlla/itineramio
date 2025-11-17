import { LeadMagnet } from '@/data/lead-magnets'
import { CheckCircle2 } from 'lucide-react'

export default function BenefitsSection({
  leadMagnet,
}: {
  leadMagnet: LeadMagnet
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8 border border-gray-100">
      {/* Header */}
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Lo que conseguirás
      </h2>
      <p className="text-gray-600 mb-8">
        Resultados concretos aplicando esta guía
      </p>

      {/* Benefits List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {leadMagnet.benefits.map((benefit, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-100 hover:shadow-md transition-shadow"
          >
            {/* Checkmark Icon */}
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>

            {/* Benefit Text */}
            <p className="text-gray-900 font-medium text-sm leading-relaxed pt-1">
              {benefit}
            </p>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-8 pt-8 border-t border-gray-200 text-center">
        <p className="text-gray-700 font-medium">
          Todo esto y más en una guía 100% gratuita
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Descárgala ahora usando el formulario →
        </p>
      </div>
    </div>
  )
}
