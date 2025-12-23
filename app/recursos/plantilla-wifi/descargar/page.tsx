'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function WifiCardContent() {
  const searchParams = useSearchParams()
  const nombre = searchParams.get('nombre') || 'Mi Alojamiento'
  const nombreRed = searchParams.get('red') || 'WiFi_Red'
  const password = searchParams.get('pass') || '********'

  // Generate WiFi QR code
  const wifiQrData = `WIFI:T:WPA;S:${nombreRed};P:${password};;`
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(wifiQrData)}&bgcolor=ffffff&color=222222`

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8 print:p-0">
      {/* Printable Card */}
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg print:shadow-none print:border print:max-w-full">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">📶</span>
            </div>
            <div>
              <p className="text-white/80 text-xs uppercase tracking-wider">WiFi del alojamiento</p>
              <p className="text-white text-xl font-semibold">{nombre}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="flex items-start gap-8">
            {/* QR Code */}
            <div className="flex-shrink-0">
              <div className="bg-gray-50 rounded-xl p-4">
                <img
                  src={qrCodeUrl}
                  alt="QR WiFi"
                  className="w-32 h-32 block"
                />
              </div>
              <p className="text-xs text-gray-500 text-center mt-3">
                Escanea para conectar
              </p>
            </div>

            {/* WiFi Details */}
            <div className="flex-1 space-y-6">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Nombre de la red</p>
                <p className="text-xl font-semibold text-gray-900">{nombreRed}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Contraseña</p>
                <p className="text-xl font-mono font-semibold text-gray-900 bg-gray-100 px-4 py-2 rounded-lg inline-block">
                  {password}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-600 text-center">
            📱 Escanea el código QR con la cámara de tu móvil para conectarte automáticamente
          </p>
        </div>
      </div>

      {/* Print Button - Hidden when printing */}
      <div className="fixed bottom-8 right-8 print:hidden">
        <button
          onClick={() => window.print()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimir / Guardar PDF
        </button>
      </div>

      {/* Instructions - Hidden when printing */}
      <div className="fixed top-8 left-8 max-w-xs print:hidden">
        <div className="bg-white rounded-lg shadow-lg p-4 border">
          <h3 className="font-semibold text-gray-900 mb-2">Instrucciones</h3>
          <ol className="text-sm text-gray-600 space-y-1">
            <li>1. Haz clic en "Imprimir"</li>
            <li>2. Selecciona "Guardar como PDF"</li>
            <li>3. Imprime en tamaño A5 o carta</li>
            <li>4. Enmarca y coloca junto al router</li>
          </ol>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A5 landscape;
            margin: 0.5cm;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  )
}

export default function PlantillaWifiDescargarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <WifiCardContent />
    </Suspense>
  )
}
