'use client'

import { TrendingUp } from 'lucide-react'
import { ComingSoonTool } from '../../../../../src/components/tools/ComingSoonTool'

export default function ROICalculator() {
  return (
    <ComingSoonTool
      toolName="Calculadora de ROI"
      toolDescription="Calcula cuánto tiempo y dinero puedes ahorrar automatizando tu gestión de alquiler vacacional. Próximamente disponible para suscriptores."
      icon={<TrendingUp className="w-12 h-12 text-rose-600" />}
      color="rose"
      bgColor="bg-rose-100"
    />
  )
}
