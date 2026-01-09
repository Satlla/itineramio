'use client'

import { Clock } from 'lucide-react'
import { ComingSoonTool } from '../../../../../src/components/tools/ComingSoonTool'

export default function TimeCalculatorPage() {
  return (
    <ComingSoonTool
      toolName="Calculadora de Tiempo"
      toolDescription="Calcula cuántas horas pierdes respondiendo mensajes repetitivos y cuánto podrías ahorrar. Próximamente disponible para suscriptores."
      icon={<Clock className="w-12 h-12 text-indigo-600" />}
      color="indigo"
      bgColor="bg-indigo-100"
    />
  )
}
