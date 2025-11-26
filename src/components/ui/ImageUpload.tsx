'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Upload, X, Camera, User, FolderOpen } from 'lucide-react'
import { Button } from './Button'
import { MediaSelector } from './MediaSelector'
import { DuplicateMediaModal } from './DuplicateMediaModal'

interface ImageUploadProps {
  value?: string
  onChange: (imageUrl: string | null) => void
  placeholder?: string
  className?: string
  variant?: 'property' | 'profile'
  maxSize?: number // in MB
  accept?: string
  error?: boolean
  saveToLibrary?: boolean // Whether to save to media library
}

export function ImageUpload({
  value,
  onChange,
  placeholder = "Subir imagen",
  className = "",
  variant = 'property',
  maxSize = 10, // Increased for better quality images (was 5MB)
  accept = "image/jpeg,image/jpg,image/png,image/gif,image/webp",
  error = false,
  saveToLibrary = true
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showMediaSelector, setShowMediaSelector] = useState(false)
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [duplicateMediaInfo, setDuplicateMediaInfo] = useState<any>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const isProfile = variant === 'profile'
  const dimensions = isProfile ? 'w-24 h-24' : 'w-full h-48'

  // Sync previewUrl with initial value and clean blob URLs
  useEffect(() => {
    if (value) {
      // If the value is a blob URL, clear it and notify parent
      if (value.startsWith('blob:')) {
        console.warn('Blob URL detected, clearing:', value)
        onChange(null)
        setPreviewUrl(null)
        return
      }
      
      if (!previewUrl) {
        setPreviewUrl(value)
      }
    }
  }, [value, previewUrl, onChange])

  // Clean up blob URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Set max dimensions for better quality (increased from 400x300)
        const maxWidth = 800
        const maxHeight = 600
        
        let { width, height } = img
        
        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            resolve(file)
          }
        }, 'image/jpeg', 0.85) // 85% quality for better image quality (was 70%)
        
        URL.revokeObjectURL(img.src)
      }
      
      img.onerror = () => {
        resolve(file)
        URL.revokeObjectURL(img.src)
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  const uploadFile = async (file: File, skipDuplicateCheck = false) => {
    console.log('🚀 ImageUpload: Starting upload for file:', file.name, 'variant:', variant)
    try {
      // Clean up previous blob URL if exists
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
      
      // Compress image for property uploads to save space
      const finalFile = variant === 'property' ? await compressImage(file) : file
      
      // Upload file to server
      const formData = new FormData()
      formData.append('file', finalFile)
      if (skipDuplicateCheck) {
        formData.append('skipDuplicateCheck', 'true')
      }
      
      console.log('🌐 ImageUpload: Making fetch request to /api/upload')
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      console.log('📡 ImageUpload: Response status:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ ImageUpload: Response not ok:', errorText)
        throw new Error(`Upload failed: ${response.status} - ${errorText}`)
      }
      
      const result = await response.json()
      console.log('📄 ImageUpload: Response data:', result)
      
      // Handle duplicate detection
      if (result.duplicate) {
        setDuplicateMediaInfo(result.existingMedia)
        setPendingFile(file)
        setShowDuplicateModal(true)
        setUploading(false)
        return
      }
      
      if (result.success) {
        const imageUrl = result.url
        console.log('✅ ImageUpload: Upload successful, URL:', imageUrl)

        // No need to save to media library separately - already done in upload endpoint
        setPreviewUrl(imageUrl)
        onChange(imageUrl)
        console.log('✅ ImageUpload: onChange called with URL:', imageUrl)
      } else {
        console.error('❌ ImageUpload: Upload failed:', result.error)
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('❌ Error uploading file:', error)

      // Show specific error message to user
      let errorMessage = 'Error al subir la imagen. Por favor, inténtalo de nuevo.'

      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }

      // Add more helpful context for common errors
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.'
      } else if (errorMessage.includes('timeout')) {
        errorMessage = 'La carga tomó demasiado tiempo. Intenta con una imagen más pequeña.'
      } else if (errorMessage.includes('401') || errorMessage.includes('No autorizado')) {
        errorMessage = 'Sesión expirada. Por favor, vuelve a iniciar sesión.'
      }

      alert(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const handleFile = async (file: File) => {
    console.log('📁 ImageUpload: handleFile called with:', file.name, file.type, file.size)
    
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      console.error('❌ ImageUpload: File too large:', file.size, 'max:', maxSize * 1024 * 1024)
      alert(`El archivo es demasiado grande. Máximo ${maxSize}MB.`)
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('❌ ImageUpload: Invalid file type:', file.type)
      alert('Solo se permiten archivos de imagen.')
      return
    }

    // Check for unsupported formats
    const fileName = file.name.toLowerCase()
    const unsupportedFormats = ['.heic', '.heif']
    const isUnsupported = unsupportedFormats.some(format => fileName.endsWith(format)) || 
                          file.type === 'image/heic' || file.type === 'image/heif'
    
    if (isUnsupported) {
      console.error('❌ ImageUpload: Unsupported format:', file.type, fileName)
      alert('Formato no compatible. Por favor, usa JPG, PNG, GIF o WebP. Los archivos HEIC de iPhone no son compatibles con navegadores web.')
      return
    }

    console.log('✅ ImageUpload: File validation passed, starting upload')
    setUploading(true)
    await uploadFile(file, false)
  }

  const handleUseExisting = () => {
    if (duplicateMediaInfo) {
      setPreviewUrl(duplicateMediaInfo.url)
      onChange(duplicateMediaInfo.url)
      
      // Update usage count for existing media
      fetch(`/api/media-library/${duplicateMediaInfo.id}/use`, {
        method: 'PATCH'
      }).catch(error => console.error('Error updating usage count:', error))
    }
    
    setShowDuplicateModal(false)
    setDuplicateMediaInfo(null)
    setPendingFile(null)
  }

  const handleUploadNew = async () => {
    if (pendingFile) {
      setShowDuplicateModal(false)
      setUploading(true)
      await uploadFile(pendingFile, true) // Skip duplicate check
    }
    
    setDuplicateMediaInfo(null)
    setPendingFile(null)
  }

  const handleCloseDuplicateModal = () => {
    setShowDuplicateModal(false)
    setDuplicateMediaInfo(null)
    setPendingFile(null)
    setUploading(false)
  }

  const onButtonClick = () => {
    inputRef.current?.click()
  }

  const removeImage = () => {
    // Clean up blob URL if exists
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    onChange(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleSelectFromLibrary = (media: any) => {
    setPreviewUrl(media.url)
    onChange(media.url)
    setShowMediaSelector(false)
  }

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      
      {value ? (
        <div className={`relative ${dimensions} ${isProfile ? 'rounded-full mx-auto' : 'rounded-lg'} overflow-hidden border-2 ${error ? 'border-red-300' : 'border-gray-200'}`}>
          <img 
            src={previewUrl || value} 
            alt="Preview" 
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Error loading image:', previewUrl || value)
              // If the image fails to load, clear it
              if ((previewUrl || value)?.startsWith('blob:')) {
                console.warn('Clearing broken blob URL')
                onChange(null)
                setPreviewUrl(null)
              } else {
                // For other URLs, just hide the image but keep the URL
                e.currentTarget.style.display = 'none'
              }
            }}
            onLoad={(e) => {
              // Image loaded successfully, make sure it's visible
              e.currentTarget.style.display = 'block'
            }}
          />
          
          {/* Remove button */}
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
          
          {/* Change button */}
          <button
            type="button"
            onClick={onButtonClick}
            className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-opacity flex items-center justify-center"
          >
            <Camera className="w-6 h-6 text-white opacity-0 hover:opacity-100 transition-opacity" />
          </button>
        </div>
      ) : (
        <div
          className={`
            ${dimensions} ${isProfile ? 'rounded-full mx-auto' : 'rounded-lg'}
            border-2 border-dashed transition-colors cursor-pointer
            ${dragActive ? 'border-violet-400 bg-violet-50' : error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-violet-400 hover:bg-violet-50'}
            flex flex-col items-center justify-center
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
        >
          {uploading ? (
            <>
              <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-sm text-gray-600">Subiendo...</p>
            </>
          ) : (
            <>
              {isProfile ? (
                <User className="w-8 h-8 text-gray-400 mb-2" />
              ) : (
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
              )}
              <p className="text-sm font-medium text-gray-600 mb-1">
                {placeholder}
              </p>
              <p className="text-xs text-gray-500 text-center px-2">
                Arrastra una imagen aquí o haz clic para seleccionar
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Máximo {maxSize}MB (calidad mejorada)
              </p>
              
              {!isProfile && variant === 'property' && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-center">
                  <p className="text-xs text-blue-700">
                    📱 <strong>Formato vertical requerido</strong><br />
                    Optimizado para móviles
                  </p>
                </div>
              )}
              
              {!isProfile && (
                <div className="mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowMediaSelector(true)
                    }}
                    className="text-xs"
                  >
                    <FolderOpen className="w-4 h-4 mr-1" />
                    Desde biblioteca
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
      
      <MediaSelector
        type="image"
        isOpen={showMediaSelector}
        onSelect={handleSelectFromLibrary}
        onClose={() => setShowMediaSelector(false)}
      />

      {/* Duplicate Media Modal */}
      <DuplicateMediaModal
        isOpen={showDuplicateModal}
        onClose={handleCloseDuplicateModal}
        onUseExisting={handleUseExisting}
        onUploadNew={handleUploadNew}
        existingMedia={duplicateMediaInfo}
        uploadingFileName={pendingFile?.name || ''}
      />
    </div>
  )
}