'use client'

import { FileText } from 'lucide-react'
import { ComingSoonTool } from '../../../../../src/components/tools/ComingSoonTool'

export default function HouseRulesGenerator() {
  return (
    <ComingSoonTool
      toolName="Generador de Normas de la Casa"
      toolDescription="Crea normas de la casa profesionales y personalizadas listas para imprimir. Próximamente disponible para suscriptores."
      icon={<FileText className="w-12 h-12 text-amber-600" />}
      color="amber"
      bgColor="bg-amber-100"
    />
  )
}
