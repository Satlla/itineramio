'use client'

import React from 'react'
import { ShieldCheck, ExternalLink, CheckCircle } from 'lucide-react'

interface GuestRegistrationGateProps {
  propertyId: string
  propertyName: string
  config: { required: boolean; url: string; message?: string }
  onComplete: () => void
}

const DEFAULT_MESSAGE = `De acuerdo con las normas del alojamiento estamos obligados a realizar a todos los huéspedes mayores de 14 años el registro obligatorio en autoridades.

A continuación tienes el enlace de la app Partee para dar de alta a todos los huéspedes que van a hospedarse durante tu estancia.`

export function GuestRegistrationGate({
  propertyId,
  propertyName,
  config,
  onComplete,
}: GuestRegistrationGateProps) {
  const handleComplete = () => {
    try {
      localStorage.setItem(`reg-${propertyId}`, '1')
    } catch {}
    onComplete()
  }

  const message = config.message?.trim() || DEFAULT_MESSAGE

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Card */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 px-6 py-8 text-center text-white">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-9 h-9 text-white" />
            </div>
          </div>
          <h2 className="text-xl font-bold mb-1">Registro obligatorio</h2>
          <p className="text-blue-100 text-sm">{propertyName}</p>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex flex-col gap-3">
          <a
            href={config.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir Partee
          </a>

          <button
            onClick={handleComplete}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors text-sm"
          >
            <CheckCircle className="w-4 h-4 text-green-600" />
            Ya me he registrado — Acceder al manual
          </button>
        </div>
      </div>
    </div>
  )
}
