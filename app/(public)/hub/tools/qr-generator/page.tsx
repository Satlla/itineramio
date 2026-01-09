'use client'

import { QrCode } from 'lucide-react'
import { ComingSoonTool } from '../../../../../src/components/tools/ComingSoonTool'

export default function QRGenerator() {
  return (
    <ComingSoonTool
      toolName="Generador de Códigos QR"
      toolDescription="Crea códigos QR personalizados para tu manual digital, WiFi, contacto y más. Próximamente disponible para suscriptores."
      icon={<QrCode className="w-12 h-12 text-violet-600" />}
      color="violet"
      bgColor="bg-violet-100"
    />
  )
}
