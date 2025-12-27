'use client'

import { useState, useRef } from 'react'
import { Upload, Loader2, X, Check } from 'lucide-react'
import Image from 'next/image'

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void
  currentImage?: string
  label?: string
  className?: string
}

export default function ImageUploader({
  onImageUploaded,
  currentImage,
  label = "Imagen de portada",
  className = ""
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona una imagen válida')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen es muy grande. Máximo 5MB')
      return
    }

    setError('')
    setUploading(true)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to server
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/blog/upload-image', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al subir imagen')
      }

      onImageUploaded(data.url)
    } catch (err: any) {
      setError(err.message || 'Error al subir imagen')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onImageUploaded('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {preview ? (
        <div className="relative group">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <Check className="w-4 h-4 mr-1" />
            Imagen subida correctamente
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className={`flex flex-col items-center justify-center cursor-pointer ${uploading ? 'opacity-50' : ''}`}
          >
            {uploading ? (
              <>
                <Loader2 className="w-12 h-12 text-gray-400 animate-spin mb-3" />
                <p className="text-sm text-gray-600">Subiendo imagen...</p>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-sm text-gray-600 mb-1">
                  Click para subir o arrastra una imagen
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, WebP o GIF (máx. 5MB)
                </p>
              </>
            )}
          </label>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
