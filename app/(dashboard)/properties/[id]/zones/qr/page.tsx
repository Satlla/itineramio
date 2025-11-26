'use client'

import React, { useState, useEffect } from 'react'

// Helper function to get text from multilingual objects
const getText = (value: any, fallback: string = '') => {
  if (typeof value === 'string') {
    return value
  }
  if (value && typeof value === 'object') {
    return value.es || value.en || value.fr || fallback
  }
  return fallback
}
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  QrCode,
  Share2,
  Copy,
  ExternalLink,
  Eye
} from 'lucide-react'
import { Button } from '../../../../../../src/components/ui/Button'
import { Card } from '../../../../../../src/components/ui/Card'
import { useParams, useRouter } from 'next/navigation'
import QRCodeLib from 'qrcode'
import Link from 'next/link'

interface Zone {
  id: string
  name: string
  description?: string
  icon: string
  color: string
  accessCode: string
  qrCode: string
  stepsCount: number
}

export default function ZoneQRPage() {
  const params = useParams()
  const router = useRouter()
  const [zones, setZones] = useState<Zone[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingQR, setGeneratingQR] = useState<string | null>(null)
  const [qrDataUrls, setQrDataUrls] = useState<Record<string, string>>({})
  
  const propertyId = params.id as string

  useEffect(() => {
    fetchZones()
  }, [propertyId])

  const fetchZones = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/properties/${propertyId}/zones`)
      if (response.ok) {
        const data = await response.json()
        setZones(data.data || [])
        
        // Generate QR codes for all zones
        const qrPromises = (data.data || []).map(async (zone: Zone) => {
          const qrDataUrl = await generateQRCode(zone.accessCode)
          return { zoneId: zone.id, qrDataUrl }
        })
        
        const qrResults = await Promise.all(qrPromises)
        const qrMap: Record<string, string> = {}
        qrResults.forEach(({ zoneId, qrDataUrl }) => {
          qrMap[zoneId] = qrDataUrl
        })
        setQrDataUrls(qrMap)
      }
    } catch (error) {
      console.error('Error fetching zones:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateQRCode = async (accessCode: string): Promise<string> => {
    try {
      const url = `${window.location.origin}/z/${accessCode}`
      const qrDataUrl = await QRCodeLib.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      return qrDataUrl
    } catch (error) {
      console.error('Error generating QR code:', error)
      return ''
    }
  }

  const downloadQR = async (zone: Zone) => {
    setGeneratingQR(zone.id)
    try {
      const url = `${window.location.origin}/z/${zone.accessCode}`
      const qrDataUrl = await QRCodeLib.toDataURL(url, {
        width: 800,
        margin: 4,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      
      // Create download link
      const link = document.createElement('a')
      link.download = `qr-${zone.name.toLowerCase().replace(/\s+/g, '-')}.png`
      link.href = qrDataUrl
      link.click()
    } catch (error) {
      console.error('Error downloading QR:', error)
    } finally {
      setGeneratingQR(null)
    }
  }

  const copyUrl = async (accessCode: string) => {
    const url = `${window.location.origin}/z/${accessCode}`
    try {
      await navigator.clipboard.writeText(url)
      // You could add a toast notification here
    } catch (error) {
      console.error('Error copying URL:', error)
    }
  }

  const printQR = (zone: Zone) => {
    const url = `${window.location.origin}/z/${zone.accessCode}`
    const qrDataUrl = qrDataUrls[zone.id]
    
    if (!qrDataUrl) return

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>QR Code - ${getText(zone.name, 'Zona')}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
              background: white;
            }
            .qr-container {
              text-align: center;
              border: 2px solid #e5e7eb;
              border-radius: 12px;
              padding: 30px;
              background: white;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            .zone-icon {
              width: 60px;
              height: 60px;
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 32px;
              margin: 0 auto 20px auto;
              background: ${zone.color || '#6366f1'};
            }
            .zone-name {
              font-size: 24px;
              font-weight: bold;
              color: #111827;
              margin-bottom: 8px;
            }
            .zone-description {
              font-size: 14px;
              color: #6b7280;
              margin-bottom: 20px;
            }
            .qr-code {
              margin: 20px 0;
            }
            .instructions {
              font-size: 12px;
              color: #6b7280;
              margin-top: 20px;
            }
            .url {
              font-size: 11px;
              color: #9ca3af;
              word-break: break-all;
              margin-top: 10px;
            }
            @media print {
              body { margin: 0; }
              .qr-container { 
                border: 2px solid #000; 
                box-shadow: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="zone-icon">${zone.icon}</div>
            <div class="zone-name">${getText(zone.name, 'Zona')}</div>
            ${zone.description ? `<div class="zone-description">${zone.description}</div>` : ''}
            <div class="qr-code">
              <img src="${qrDataUrl}" alt="QR Code" style="width: 200px; height: 200px;">
            </div>
            <div class="instructions">
              Escanea este código QR con tu teléfono<br>
              para acceder a las instrucciones
            </div>
            <div class="url">${url}</div>
          </div>
        </body>
        </html>
      `)
      printWindow.document.close()
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 500)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" style={{ paddingTop: 'calc(4rem + env(safe-area-inset-top, 0px))' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando códigos QR...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: 'calc(4rem + env(safe-area-inset-top, 0px))' }}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/properties/${propertyId}/zones`}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Códigos QR de Zonas</h1>
                <p className="text-gray-600 mt-1">
                  Genera e imprime códigos QR únicos para cada zona
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {zones.length === 0 ? (
          <div className="text-center py-12">
            <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay zonas disponibles
            </h3>
            <p className="text-gray-600 mb-4">
              Crea algunas zonas primero para generar sus códigos QR.
            </p>
            <Link href={`/properties/${propertyId}/zones`}>
              <Button>Crear zona</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {zones.map((zone) => (
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Zone Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                    style={{ backgroundColor: zone.color || '#6366f1' }}
                  >
                    {zone.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{getText(zone.name, 'Zona')}</h3>
                    <p className="text-sm text-gray-600">
                      {zone.stepsCount} pasos
                    </p>
                  </div>
                </div>

                {/* QR Code */}
                <div className="text-center mb-4">
                  {qrDataUrls[zone.id] ? (
                    <img 
                      src={qrDataUrls[zone.id]} 
                      alt={`QR Code para ${getText(zone.name, 'Zona')}`}
                      className="w-32 h-32 mx-auto border border-gray-200 rounded-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 mx-auto border border-gray-200 rounded-lg flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                    </div>
                  )}
                </div>

                {/* URL */}
                <div className="mb-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-600 break-all">
                      itineramio.com/z/{zone.accessCode}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadQR(zone)}
                      disabled={generatingQR === zone.id}
                      className="flex items-center justify-center gap-1"
                    >
                      {generatingQR === zone.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      <span className="text-xs">Descargar</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => printQR(zone)}
                      className="flex items-center justify-center gap-1"
                    >
                      <Printer className="w-4 h-4" />
                      <span className="text-xs">Imprimir</span>
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyUrl(zone.accessCode)}
                      className="flex items-center justify-center gap-1"
                    >
                      <Copy className="w-4 h-4" />
                      <span className="text-xs">Copiar URL</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/z/${zone.accessCode}`, '_blank')}
                      className="flex items-center justify-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-xs">Vista previa</span>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}