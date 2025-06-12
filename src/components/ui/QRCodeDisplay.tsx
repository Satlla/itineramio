'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Download, Copy, Share2, RefreshCw, QrCode } from 'lucide-react'
import { Button } from './Button'
import { Card, CardContent, CardHeader, CardTitle } from './Card'
import { generateZoneQRCode, generatePropertyQRCode, downloadQRCode, getZoneURL } from '@/lib/qr'

interface QRCodeDisplayProps {
  propertyId: string
  zoneId?: string
  zoneName?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showActions?: boolean
  showTitle?: boolean
}

export function QRCodeDisplay({
  propertyId,
  zoneId,
  zoneName,
  className = '',
  size = 'md',
  showActions = true,
  showTitle = true
}: QRCodeDisplayProps) {
  const [qrCode, setQrCode] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64'
  }

  const generateQR = async () => {
    setLoading(true)
    setError('')
    
    try {
      const qrCodeData = zoneId 
        ? await generateZoneQRCode(propertyId, zoneId, { width: size === 'lg' ? 400 : size === 'md' ? 300 : 200 })
        : await generatePropertyQRCode(propertyId, { width: size === 'lg' ? 400 : size === 'md' ? 300 : 200 })
      
      setQrCode(qrCodeData)
    } catch (err) {
      setError('Error generating QR code')
      console.error('QR generation error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    generateQR()
  }, [propertyId, zoneId, size])

  const handleDownload = () => {
    if (qrCode) {
      const filename = zoneId 
        ? `qr-${propertyId}-${zoneId}.png`
        : `qr-${propertyId}.png`
      downloadQRCode(qrCode, filename)
    }
  }

  const handleCopyURL = async () => {
    const url = getZoneURL(propertyId, zoneId)
    try {
      await navigator.clipboard.writeText(url)
      // Could add toast notification here
    } catch (err) {
      console.error('Error copying URL:', err)
    }
  }

  const handleShare = async () => {
    const url = getZoneURL(propertyId, zoneId)
    const title = zoneId ? `${zoneName || 'Zone'} - Itineramio` : 'Property Manual - Itineramio'
    
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
          text: `Check out this interactive manual: ${title}`
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      // Fallback to copying URL
      handleCopyURL()
    }
  }

  const getTitle = () => {
    if (zoneId) {
      return `QR Code - ${zoneName || 'Zone'}`
    }
    return 'Property QR Code'
  }

  if (!showTitle && !showActions) {
    // Simple QR display without card wrapper
    return (
      <div className={`flex items-center justify-center ${className}`}>
        {loading ? (
          <div className={`${sizeClasses[size]} bg-gray-100 rounded-lg flex items-center justify-center`}>
            <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className={`${sizeClasses[size]} bg-red-50 border-2 border-dashed border-red-200 rounded-lg flex items-center justify-center`}>
            <QrCode className="w-8 h-8 text-red-400" />
          </div>
        ) : (
          <motion.img
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            src={qrCode}
            alt={`QR Code for ${zoneName || 'property'}`}
            className={`${sizeClasses[size]} rounded-lg border-2 border-gray-200 shadow-md`}
          />
        )}
      </div>
    )
  }

  return (
    <Card className={className}>
      {showTitle && (
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <QrCode className="w-5 h-5 text-violet-600" />
            {getTitle()}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {/* QR Code Display */}
        <div className="flex justify-center">
          {loading ? (
            <div className={`${sizeClasses[size]} bg-gray-100 rounded-lg flex items-center justify-center`}>
              <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className={`${sizeClasses[size]} bg-red-50 border-2 border-dashed border-red-200 rounded-lg flex items-center justify-center`}>
              <div className="text-center">
                <QrCode className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-sm text-red-600">{error}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={generateQR}
                  className="mt-2"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            <motion.img
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              src={qrCode}
              alt={`QR Code for ${zoneName || 'property'}`}
              className={`${sizeClasses[size]} rounded-lg border-2 border-gray-200 shadow-md`}
            />
          )}
        </div>

        {/* URL Display */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Public URL:</p>
          <p className="text-sm font-mono text-gray-700 break-all">
            {getZoneURL(propertyId, zoneId)}
          </p>
        </div>

        {/* Actions */}
        {showActions && !loading && !error && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyURL}
              className="flex-1"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy URL
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="flex-1"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        )}

        {/* Regenerate Button */}
        {showActions && !loading && (
          <Button
            variant="ghost"
            size="sm"
            onClick={generateQR}
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Regenerate QR Code
          </Button>
        )}
      </CardContent>
    </Card>
  )
}