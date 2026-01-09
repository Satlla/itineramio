'use client'

import { Wifi } from 'lucide-react'
import { ComingSoonTool } from '../../../../../src/components/tools/ComingSoonTool'

export default function WiFiCardGenerator() {
  return (
    <ComingSoonTool
      toolName="Generador de Tarjeta WiFi"
      toolDescription="Crea tarjetas WiFi imprimibles con diseños profesionales para tu alojamiento. Próximamente disponible para suscriptores."
      icon={<Wifi className="w-12 h-12 text-sky-600" />}
      color="sky"
      bgColor="bg-sky-100"
    />
  )
}
