'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Upload, X, Video, AlertCircle, Loader2, FolderOpen } from 'lucide-react'
import { Button } from './Button'
import { MediaSelector } from './MediaSelector'

interface VideoUploadProps {
  value?: string
  onChange: (videoUrl: string | null, metadata?: VideoMetadata) => void
  placeholder?: string
  className?: string
  maxSize?: number // in MB
  maxDuration?: number // in seconds
  accept?: string
  error?: boolean
  saveToLibrary?: boolean // Whether to save to media library
}

interface VideoMetadata {
  duration: number
  thumbnail: string
  size: number
  width: number
  height: number
}

export function VideoUpload({
  value,
  onChange,
  placeholder = "Subir video (máx. 30 segundos)",
  className = "",
  maxSize = 50,
  maxDuration = 30,
  accept = "video/mp4,video/webm,video/quicktime",
  error = false,
  saveToLibrary = true
}: VideoUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null)
  const [showMediaSelector, setShowMediaSelector] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Sync previewUrl with initial value
  useEffect(() => {
    if (value && !value.startsWith('blob:')) {
      setPreviewUrl(value)
    }
  }, [value])

  // Clean up blob URLs when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const validateVideo = async (file: File): Promise<boolean> => {
    // Check file size
    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > maxSize) {
      setVideoError(`El video debe ser menor a ${maxSize}MB`)
      return false
    }

    // Check video duration
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      
      video.onloadedmetadata = () => {
        if (video.duration > maxDuration) {
          setVideoError(`El video debe durar máximo ${maxDuration} segundos`)
          URL.revokeObjectURL(video.src)
          resolve(false)
        } else {
          // Generate thumbnail from first frame
          const canvas = document.createElement('canvas')
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          
          video.currentTime = 0.5 // Get frame at 0.5 seconds
          video.onseeked = () => {
            const ctx = canvas.getContext('2d')
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
              const thumbnail = canvas.toDataURL('image/jpeg', 0.8)
              
              setMetadata({
                duration: video.duration,
                thumbnail,
                size: file.size,
                width: video.videoWidth,
                height: video.videoHeight
              })
            }
            URL.revokeObjectURL(video.src)
            resolve(true)
          }
        }
      }
      
      video.onerror = () => {
        setVideoError('Error al procesar el video')
        URL.revokeObjectURL(video.src)
        resolve(false)
      }
      
      video.src = URL.createObjectURL(file)
    })
  }

  const handleUpload = async (file: File) => {
    setVideoError(null)
    
    // Validate video
    const isValid = await validateVideo(file)
    if (!isValid) return

    // Create preview
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    
    // Upload to server
    setUploading(true)
    setUploadProgress(0)
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'video')
    
    try {
      const xhr = new XMLHttpRequest()
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100)
          setUploadProgress(progress)
        }
      })
      
      xhr.onload = async () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText)
          if (data.url) {
            // Save to media library if enabled
            if (saveToLibrary) {
              try {
                await fetch('/api/media-library', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    url: data.url,
                    type: 'video',
                    metadata: {
                      filename: data.filename,
                      originalName: file.name,
                      mimeType: file.type,
                      size: file.size,
                      duration: metadata?.duration,
                      width: metadata?.width,
                      height: metadata?.height,
                      thumbnail: metadata?.thumbnail
                    }
                  })
                })
              } catch (error) {
                console.warn('Failed to save to media library:', error)
                // Don't fail the upload if library save fails
              }
            }
            
            onChange(data.url, metadata || undefined)
            setPreviewUrl(data.url)
            URL.revokeObjectURL(objectUrl)
          }
        } else {
          throw new Error('Error al subir el video')
        }
        setUploading(false)
      }
      
      xhr.onerror = () => {
        setVideoError('Error al subir el video')
        setUploading(false)
        URL.revokeObjectURL(objectUrl)
      }
      
      xhr.open('POST', '/api/upload')
      xhr.send(formData)
      
    } catch (error) {
      console.error('Error uploading video:', error)
      setVideoError('Error al subir el video')
      setUploading(false)
      URL.revokeObjectURL(objectUrl)
    }
  }

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
      handleUpload(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0])
    }
  }

  const handleRemove = () => {
    if (previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    setMetadata(null)
    setVideoError(null)
    onChange(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleSelectFromLibrary = (media: any) => {
    setPreviewUrl(media.url)
    setMetadata({
      duration: media.duration || 0,
      thumbnail: media.thumbnailUrl || '',
      size: media.size || 0,
      width: media.width || 0,
      height: media.height || 0
    })
    onChange(media.url, {
      duration: media.duration || 0,
      thumbnail: media.thumbnailUrl || '',
      size: media.size || 0,
      width: media.width || 0,
      height: media.height || 0
    })
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
        disabled={uploading}
      />
      
      {!previewUrl ? (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-6
            ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
            ${error ? 'border-red-500' : ''}
            ${uploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            transition-colors duration-200
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                <p className="text-sm text-gray-600">Subiendo... {uploadProgress}%</p>
                <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </>
            ) : (
              <>
                <Video className="w-8 h-8 text-gray-400" />
                <p className="text-sm text-gray-600">{placeholder}</p>
                <p className="text-xs text-gray-500">MP4, WebM o MOV hasta {maxSize}MB</p>
                <div className="mt-3 flex gap-2">
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
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="relative">
          <video
            ref={videoRef}
            src={previewUrl}
            controls
            className="w-full rounded-lg shadow-sm"
            style={{ maxHeight: '300px' }}
          />
          {metadata && (
            <div className="mt-2 text-xs text-gray-600">
              Duración: {Math.round(metadata.duration)}s | 
              Tamaño: {(metadata.size / (1024 * 1024)).toFixed(1)}MB |
              {metadata.width}x{metadata.height}
            </div>
          )}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            disabled={uploading}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {videoError && (
        <div className="mt-2 flex items-center text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mr-1" />
          {videoError}
        </div>
      )}
      
      <MediaSelector
        type="video"
        isOpen={showMediaSelector}
        onSelect={handleSelectFromLibrary}
        onClose={() => setShowMediaSelector(false)}
      />
    </div>
  )
}