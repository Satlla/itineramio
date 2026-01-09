'use client'

import { Home } from 'lucide-react'
import { ComingSoonTool } from '../../../../../src/components/tools/ComingSoonTool'

export default function AirbnbSetupGenerator() {
  return (
    <ComingSoonTool
      toolName="Generador de Setup Airbnb"
      toolDescription="Crea una guía de configuración inicial para tu alojamiento en Airbnb. Próximamente disponible para suscriptores."
      icon={<Home className="w-12 h-12 text-pink-600" />}
      color="pink"
      bgColor="bg-pink-100"
    />
  )
}
