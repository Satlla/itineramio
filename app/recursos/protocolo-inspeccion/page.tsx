'use client'

import { Shield } from 'lucide-react'
import { ComingSoonTool } from '../../../src/components/tools/ComingSoonTool'

export default function ProtocoloInspeccionPage() {
  return (
    <ComingSoonTool
      toolName="Protocolo de Inspección Pre-Huésped"
      toolDescription="Checklist completo de inspección antes de la llegada de cada huésped. Próximamente disponible para suscriptores."
      icon={<Shield className="w-12 h-12 text-green-600" />}
      color="green"
      bgColor="bg-green-100"
    />
  )
}
