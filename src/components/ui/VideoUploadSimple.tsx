'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Upload, X, Video, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { Button } from './Button'
import { uploadFileInChunks } from '../../utils/chunkedUpload'
import { compressVideoSimple } from '../../utils/videoCompression'

interface VideoUploadProps {
  value?: string
  onChange: (videoUrl: string | null, metadata?: VideoMetadata) => void
  placeholder?: string
  className?: string
  maxSize?: number // in MB
  maxDuration?: number // in seconds
  accept?: string
  error?: boolean
  saveToLibrary?: boolean
}

interface VideoMetadata {
  duration: number
  thumbnail: string
  size: number
  width: number
  height: number
}

export function VideoUploadSimple({
  value,
  onChange,
  placeholder = "Subir video (máx. 60 segundos)",
  className = "",
  maxSize = 100, // 100MB limit with chunked upload
  maxDuration = 300, // 5 minutes max
  accept = "video/*",
  error = false,
  saveToLibrary = true
}: VideoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync with value prop changes
  useEffect(() => {
    if (value !== previewUrl) {
      console.log('🔄 VideoUpload: value prop changed from', previewUrl, 'to', value)
      setPreviewUrl(value || null)
      if (value) {
        setUploadSuccess(true) // Mark as uploaded if we have a value
      }
    }
  }, [value, previewUrl])

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!file.type.startsWith('video/')) {
      setVideoError('Por favor selecciona un archivo de video válido')
      return false
    }

    // Check file size (simple check)
    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > maxSize) {
      setVideoError(`Archivo demasiado grande (${sizeMB.toFixed(1)}MB). Máximo ${maxSize}MB.`)
      return false
    }

    console.log('✅ File validated:', file.name, sizeMB.toFixed(2) + 'MB')
    setVideoError(null)
    return true
  }

  const uploadFile = async (file: File): Promise<string> => {
    const sizeMB = file.size / (1024 * 1024)
    console.log('📊 File size for upload:', sizeMB.toFixed(2), 'MB')
    
    // Use chunked upload for files larger than 3MB (lower threshold for safety)
    if (sizeMB > 3) {
      console.log('📦 Using chunked upload for file:', file.name, sizeMB.toFixed(2), 'MB')
      try {
        const result = await uploadFileInChunks({
          file,
          chunkSize: 2 * 1024 * 1024, // 2MB chunks to stay under Vercel limit
          onProgress: (progress) => {
            setUploadProgress(Math.round(progress))
          },
          onChunkComplete: (chunk, total) => {
            console.log(`✅ Chunk ${chunk}/${total} uploaded`)
          }
        })
        console.log('📦 Chunked upload complete:', result.url)
        return result.url
      } catch (error) {
        console.error('❌ Chunked upload failed:', error)
        throw error
      }
    }
    
    // Regular upload for smaller files
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'video')

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      
      // Track upload progress
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100)
          setUploadProgress(progress)
        }
      }

      xhr.onload = () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText)
            if (response.url) {
              resolve(response.url)
            } else {
              reject(new Error('No URL in response'))
            }
          } catch (e) {
            reject(new Error('Invalid response format'))
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`))
        }
      }

      xhr.onerror = () => {
        reject(new Error('Network error during upload'))
      }

      xhr.open('POST', '/api/upload')
      xhr.send(formData)
    })
  }

  const generateThumbnail = (file: File): Promise<VideoMetadata> => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      
      const timeout = setTimeout(() => {
        // Fallback metadata if video doesn't load
        resolve({
          duration: 0,
          thumbnail: '',
          size: file.size,
          width: 0,
          height: 0
        })
      }, 5000)

      video.onloadedmetadata = () => {
        clearTimeout(timeout)
        
        // Create canvas for thumbnail
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth || 640
        canvas.height = video.videoHeight || 480
        
        video.currentTime = 1 // Get frame at 1 second
        
        video.onseeked = () => {
          const ctx = canvas.getContext('2d')
          let thumbnail = ''
          
          if (ctx) {
            try {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
              thumbnail = canvas.toDataURL('image/jpeg', 0.8)
            } catch (e) {
              console.warn('Could not generate thumbnail:', e)
            }
          }
          
          URL.revokeObjectURL(video.src)
          
          resolve({
            duration: video.duration || 0,
            thumbnail,
            size: file.size,
            width: video.videoWidth || 0,
            height: video.videoHeight || 0
          })
        }
      }

      video.onerror = () => {
        clearTimeout(timeout)
        URL.revokeObjectURL(video.src)
        
        // Return basic metadata on error
        resolve({
          duration: 0,
          thumbnail: '',
          size: file.size,
          width: 0,
          height: 0
        })
      }

      video.src = URL.createObjectURL(file)
    })
  }

  const handleFileSelect = async (file: File) => {
    console.log('📁 File selected:', file.name, file.type, file.size)
    
    // Reset states
    setVideoError(null)
    setUploadSuccess(false)
    setUploadProgress(0)
    
    // Validate file
    if (!validateFile(file)) {
      return
    }

    // Show preview immediately (but only if we don't already have a real URL)
    const objectUrl = URL.createObjectURL(file)
    if (!value || value.startsWith('blob:')) {
      setPreviewUrl(objectUrl)
    }
    
    let fileToUpload = file
    const sizeMB = file.size / (1024 * 1024)
    
    // Compress if file is large
    if (sizeMB > 4) {
      setIsCompressing(true)
      setVideoError('📦 Comprimiendo video para optimizar subida...')
      
      try {
        console.log('🔄 Compressing large video...')
        fileToUpload = await compressVideoSimple(file, {
          maxSizeMB: 3,
          onProgress: (progress) => {
            setUploadProgress(Math.round(progress * 0.5)) // Show 0-50% for compression
          }
        })
        const compressedSizeMB = fileToUpload.size / (1024 * 1024)
        console.log('✅ Compressed from', sizeMB.toFixed(1), 'MB to', compressedSizeMB.toFixed(1), 'MB')
        setVideoError(null)
      } catch (error) {
        console.warn('⚠️ Compression failed, using original:', error)
        // Continue with original file
      } finally {
        setIsCompressing(false)
      }
    }
    
    setUploading(true)
    
    try {
      // Upload file
      console.log('📤 Starting upload...')
      const videoUrl = await uploadFile(fileToUpload)
      console.log('✅ Upload successful:', videoUrl)
      
      // Generate metadata
      const metadata = await generateThumbnail(file)
      console.log('📋 Metadata generated:', metadata)
      
      // Success!
      setUploadSuccess(true)
      
      // Clean up blob URL and replace with actual URL
      URL.revokeObjectURL(objectUrl)
      setPreviewUrl(videoUrl) // Replace blob URL with actual URL
      
      console.log('🎯 Video upload complete, calling onChange with:', videoUrl)
      
      // Notify parent
      onChange(videoUrl, metadata)
      
      // Video uploaded successfully - log for debugging
      console.log('✅ Video upload notification: Video subido correctamente')
      
    } catch (error) {
      console.error('❌ Upload failed:', error)
      setVideoError(error instanceof Error ? error.message : 'Error al subir el video')
      
      // Clean up on error
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
      setPreviewUrl(null)
      
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const clearVideo = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    setVideoError(null)
    setUploadSuccess(false)
    onChange(null)
    
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Upload Area */}
      {!previewUrl && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            transition-colors duration-200
            ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'}
            ${uploading ? 'pointer-events-none opacity-50' : ''}
          `}
          onClick={() => !uploading && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
            disabled={uploading}
          />
          
          <div className="flex flex-col items-center space-y-2">
            {uploading || isCompressing ? (
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-gray-400" />
            )}
            
            <div>
              <p className="text-sm font-medium text-gray-700">
                {isCompressing ? 'Comprimiendo video...' : uploading ? 'Subiendo video...' : placeholder}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Máximo {maxSize}MB • Formatos: MP4, WebM, MOV
              </p>
            </div>
          </div>
          
          {/* Progress Bar */}
          {(uploading || isCompressing) && (
            <div className="absolute bottom-2 left-2 right-2">
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {isCompressing ? `Comprimiendo... ${uploadProgress}%` : `${uploadProgress}%`}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Video Preview */}
      {previewUrl && (
        <div className="relative">
          <video
            src={previewUrl}
            controls
            className="w-full max-h-64 rounded-lg bg-black"
            style={{ aspectRatio: '16/9' }}
            onError={() => {
              console.warn('❌ Video failed to load:', previewUrl)
              if (previewUrl.startsWith('blob:')) {
                console.warn('❌ Broken blob URL detected, clearing preview')
                setPreviewUrl(null)
                setVideoError('Video preview failed to load')
              }
            }}
          />
          
          <button
            onClick={clearVideo}
            className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
          
          {uploadSuccess && (
            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-green-500 bg-opacity-90 rounded text-white text-xs">
              <CheckCircle className="w-3 h-3" />
              Subido
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {videoError && (
        <div className={`p-3 rounded-lg border ${videoError.includes('📦') ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
          <p className={`text-sm ${videoError.includes('📦') ? 'text-blue-700' : 'text-red-700'}`}>
            {videoError}
          </p>
        </div>
      )}
    </div>
  )
}