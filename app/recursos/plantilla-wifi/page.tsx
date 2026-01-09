'use client'

import { Wifi } from 'lucide-react'
import { ComingSoonTool } from '../../../src/components/tools/ComingSoonTool'

export default function PlantillaWifiPage() {
  return (
    <ComingSoonTool
      toolName="Plantilla WiFi Personalizada"
      toolDescription="Crea una tarjeta WiFi personalizada con QR para tu alojamiento. Próximamente disponible para suscriptores."
      icon={<Wifi className="w-12 h-12 text-blue-600" />}
      color="blue"
      bgColor="bg-blue-100"
    />
  )
}
