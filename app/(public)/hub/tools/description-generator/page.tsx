'use client'

import { FileText } from 'lucide-react'
import { ComingSoonTool } from '../../../../../src/components/tools/ComingSoonTool'

export default function DescriptionGenerator() {
  return (
    <ComingSoonTool
      toolName="Generador de Descripciones IA"
      toolDescription="Crea descripciones profesionales y atractivas para tu listado de Airbnb usando inteligencia artificial. Próximamente disponible para suscriptores."
      icon={<FileText className="w-12 h-12 text-purple-600" />}
      color="purple"
      bgColor="bg-purple-100"
    />
  )
}
