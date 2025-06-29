'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Upload, X, Camera, User, FolderOpen } from 'lucide-react'
import { Button } from './Button'
import { MediaSelector } from './MediaSelector'

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
  maxSize = 5,
  accept = "image/*",
  error = false,
  saveToLibrary = true
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showMediaSelector, setShowMediaSelector] = useState(false)
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
        // Set max dimensions for dashboard display (small size)
        const maxWidth = 400
        const maxHeight = 300
        
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
        }, 'image/jpeg', 0.7) // 70% quality for small file size
        
        URL.revokeObjectURL(img.src)
      }
      
      img.onerror = () => {
        resolve(file)
        URL.revokeObjectURL(img.src)
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  const handleFile = async (file: File) => {
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`El archivo es demasiado grande. Máximo ${maxSize}MB.`)
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten archivos de imagen.')
      return
    }

    setUploading(true)

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
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Error uploading file')
      }
      
      const result = await response.json()
      
      if (result.success) {
        const imageUrl = result.url
        
        // Save to media library if enabled
        if (saveToLibrary) {
          try {
            await fetch('/api/media-library', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                url: imageUrl,
                type: 'image',
                metadata: {
                  filename: result.filename,
                  originalName: file.name,
                  mimeType: file.type,
                  size: file.size
                }
              })
            })
          } catch (error) {
            console.warn('Failed to save to media library:', error)
            // Don't fail the upload if library save fails
          }
        }
        
        setPreviewUrl(imageUrl)
        onChange(imageUrl)
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Error al subir la imagen. Por favor, inténtalo de nuevo.')
    } finally {
      setUploading(false)
    }
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
            onLoad={() => {
              // Image loaded successfully, make sure it's visible
              const img = document.querySelector('img[alt="Preview"]') as HTMLImageElement
              if (img) {
                img.style.display = 'block'
              }
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
                Máximo {maxSize}MB
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
    </div>
  )
}