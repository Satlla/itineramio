'use client'

import { CheckSquare } from 'lucide-react'
import { ComingSoonTool } from '../../../../../src/components/tools/ComingSoonTool'

export default function CheckinBuilder() {
  return (
    <ComingSoonTool
      toolName="Constructor de Check-in"
      toolDescription="Crea checklists personalizados para cada etapa del check-in de tus huéspedes. Próximamente disponible para suscriptores."
      icon={<CheckSquare className="w-12 h-12 text-orange-600" />}
      color="orange"
      bgColor="bg-orange-100"
    />
  )
}
