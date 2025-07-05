'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, FileImage, FileVideo, Clock, HardDrive, Copy, Check, X } from 'lucide-react'
import { Button } from './Button'

interface MediaUsageInfo {
  propertyId: string
  propertyName: string
  zoneId: string
  zoneName: string
  stepId: string
}

interface DuplicateMediaInfo {
  id: string
  url: string
  thumbnailUrl?: string
  filename: string
  originalName: string
  type: string
  size: number
  createdAt: string
  usageCount: number
  usageInfo: MediaUsageInfo[]
}

interface DuplicateMediaModalProps {
  isOpen: boolean
  onClose: () => void
  onUseExisting: () => void
  onUploadNew: () => void
  existingMedia: DuplicateMediaInfo
  uploadingFileName: string
}

export function DuplicateMediaModal({
  isOpen,
  onClose,
  onUseExisting,
  onUploadNew,
  existingMedia,
  uploadingFileName
}: DuplicateMediaModalProps) {
  if (!isOpen) return null

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Archivo Duplicado Detectado
              </h3>
              <p className="text-sm text-gray-600">
                Este archivo ya existe en tu biblioteca
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Upload comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* New file */}
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  {uploadingFileName.toLowerCase().includes('image') || uploadingFileName.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <FileImage className="w-6 h-6 text-blue-600" />
                  ) : (
                    <FileVideo className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Archivo Nuevo</h4>
                <p className="text-sm text-gray-600 truncate">{uploadingFileName}</p>
                <p className="text-xs text-gray-500 mt-1">Por subir</p>
              </div>
            </div>

            {/* Existing file */}
            <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  {existingMedia.type === 'image' ? (
                    <FileImage className="w-6 h-6 text-green-600" />
                  ) : (
                    <FileVideo className="w-6 h-6 text-green-600" />
                  )}
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Archivo Existente</h4>
                <p className="text-sm text-gray-600 truncate">{existingMedia.originalName}</p>
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 mt-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(existingMedia.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* File details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h5 className="font-medium text-gray-900 mb-3">Detalles del Archivo Existente</h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Tamaño:</span>
                <span className="ml-2 font-medium">{formatFileSize(existingMedia.size)}</span>
              </div>
              <div>
                <span className="text-gray-500">Tipo:</span>
                <span className="ml-2 font-medium">{existingMedia.type}</span>
              </div>
              <div>
                <span className="text-gray-500">Usado:</span>
                <span className="ml-2 font-medium">{existingMedia.usageCount} {existingMedia.usageCount === 1 ? 'vez' : 'veces'}</span>
              </div>
              <div>
                <span className="text-gray-500">Creado:</span>
                <span className="ml-2 font-medium">{formatDate(existingMedia.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Usage information */}
          {existingMedia.usageInfo && existingMedia.usageInfo.length > 0 && (
            <div className="mb-6">
              <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                <HardDrive className="w-4 h-4 mr-2" />
                Usado en {existingMedia.usageInfo.length} {existingMedia.usageInfo.length === 1 ? 'lugar' : 'lugares'}
              </h5>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {existingMedia.usageInfo.map((usage, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{usage.propertyName}</p>
                        <p className="text-xs text-gray-600">{usage.zoneName}</p>
                      </div>
                      <div className="text-xs text-gray-500">
                        Paso #{usage.stepId.slice(-6)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h6 className="font-medium text-amber-800 mb-1">¿Qué prefieres hacer?</h6>
                <p className="text-sm text-amber-700 leading-relaxed">
                  Puedes usar el archivo existente para ahorrar espacio, o subir una nueva copia si necesitas mantenerlos separados.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex-shrink-0">
          <div className="flex justify-end space-x-3">
            <Button
              onClick={onClose}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button
              onClick={onUploadNew}
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              <Copy className="w-4 h-4 mr-2" />
              Subir Nueva Copia
            </Button>
            <Button
              onClick={onUseExisting}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              Usar Archivo Existente
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}