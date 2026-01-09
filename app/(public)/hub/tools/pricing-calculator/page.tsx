'use client'

import { Calculator } from 'lucide-react'
import { ComingSoonTool } from '../../../../../src/components/tools/ComingSoonTool'

export default function PricingCalculator() {
  return (
    <ComingSoonTool
      toolName="Calculadora de Precios Airbnb"
      toolDescription="Calcula el precio óptimo para tu alojamiento según ubicación, temporada y servicios. Próximamente disponible para suscriptores."
      icon={<Calculator className="w-12 h-12 text-blue-600" />}
      color="blue"
      bgColor="bg-blue-100"
    />
  )
}
