'use client'

import { BarChart3 } from 'lucide-react'
import { ComingSoonTool } from '../../../../../src/components/tools/ComingSoonTool'

export default function OccupancyCalculator() {
  return (
    <ComingSoonTool
      toolName="Calculadora de Ocupación"
      toolDescription="Calcula y optimiza tu tasa de ocupación mensual y anual. Próximamente disponible para suscriptores."
      icon={<BarChart3 className="w-12 h-12 text-teal-600" />}
      color="teal"
      bgColor="bg-teal-100"
    />
  )
}
