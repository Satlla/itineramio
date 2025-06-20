'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Upload, X, Camera, User } from 'lucide-react'
import { Button } from './Button'

interface ImageUploadProps {
  value?: string
  onChange: (imageUrl: string | null) => void
  placeholder?: string
  className?: string
  variant?: 'property' | 'profile'
  maxSize?: number // in MB
  accept?: string
  error?: boolean
}

export function ImageUpload({
  value,
  onChange,
  placeholder = "Subir imagen",
  className = "",
  variant = 'property',
  maxSize = 5,
  accept = "image/*",
  error = false
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
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
      
      // Upload file to server
      const formData = new FormData()
      formData.append('file', file)
      
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
            </>
          )}
        </div>
      )}
    </div>
  )
}