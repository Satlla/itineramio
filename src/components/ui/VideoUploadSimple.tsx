'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Upload, X, Video, CheckCircle, Loader2, AlertCircle, Copy } from 'lucide-react'
import { Button } from './Button'
// Dynamically imported below to avoid Safari bundling issues
import { compressVideoFFmpeg, isFFmpegSupported, preloadFFmpeg } from '../../utils/ffmpegCompression'
import { compressVideo } from '../../utils/videoCompression'

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

interface DuplicateMedia {
  id: string
  url: string
  originalName: string
  size: number
}

export function VideoUploadSimple({
  value,
  onChange,
  placeholder = "Subir video (máx. 30 segundos)",
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
  const [duplicateMedia, setDuplicateMedia] = useState<DuplicateMedia | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  // Calculate file hash for duplicate detection
  // For files over 20MB, return null to skip client-side detection (server will catch duplicates)
  const calculateHash = async (file: File): Promise<string | null> => {
    const MAX_HASH_SIZE = 20 * 1024 * 1024 // 20MB - skip client hash for larger files

    if (file.size > MAX_HASH_SIZE) {
      return null
    }

    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // Check if file already exists by hash
  const checkDuplicateByHash = async (hash: string): Promise<DuplicateMedia | null> => {
    try {
      const response = await fetch('/api/upload/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ hash })
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json()

      if (data.exists && data.media) {
        return data.media
      }
      return null
    } catch (error) {
      return null
    }
  }

  // Check if file already exists by name (for large files where hash is slow)
  const checkDuplicateByName = async (name: string): Promise<DuplicateMedia | null> => {
    try {
      const response = await fetch('/api/upload/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ originalName: name })
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json()

      if (data.exists && data.media) {
        return data.media
      }
      return null
    } catch (error) {
      return null
    }
  }

  // Use existing video
  const useExistingVideo = () => {
    if (duplicateMedia) {
      setPreviewUrl(duplicateMedia.url)
      setUploadSuccess(true)
      onChange(duplicateMedia.url)
      setDuplicateMedia(null)
      setPendingFile(null)
    }
  }

  // Upload new video anyway
  const uploadNewVideo = async () => {
    if (pendingFile) {
      setDuplicateMedia(null)
      await processUpload(pendingFile, true) // skipDuplicateCheck = true
      setPendingFile(null)
    }
  }

  // Pre-load FFmpeg WASM on mount so it's ready when user selects a file
  useEffect(() => {
    preloadFFmpeg()
  }, [])

  // Sync with value prop changes
  useEffect(() => {
    if (value !== previewUrl) {
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

    setVideoError(null)
    return true
  }

  const uploadFile = async (file: File): Promise<string> => {
    const sizeMB = file.size / (1024 * 1024)

    // For files under 4MB, use regular upload
    // For larger files, use Vercel Blob client upload (Vercel has 4.5MB body limit)
    if (sizeMB <= 4) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'video')

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()

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
              } else if (response.duplicate && response.existingMedia) {
                // Handle duplicate detection
                resolve(response.existingMedia.url)
              } else {
                reject(new Error(response.error || 'No URL in response'))
              }
            } catch (e) {
              reject(new Error('Invalid response format'))
            }
          } else {
            // Try to parse error message
            try {
              const errorResponse = JSON.parse(xhr.responseText)
              reject(new Error(errorResponse.error || `Upload failed: ${xhr.status}`))
            } catch {
              reject(new Error(`Upload failed: ${xhr.status}`))
            }
          }
        }

        xhr.onerror = () => {
          reject(new Error('Network error during upload'))
        }

        xhr.open('POST', '/api/upload')
        xhr.send(formData)
      })
    }

    // For files over 4MB, use Vercel Blob client upload
    // Add timestamp to filename to avoid "blob already exists" error
    const uniqueFilename = `${Date.now()}-${file.name}`
    try {
      const { upload } = await import('@vercel/blob/client')
      const blob = await upload(uniqueFilename, file, {
        access: 'public',
        handleUploadUrl: '/api/upload-token',
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100)
          setUploadProgress(progress)
        },
      })

      return blob.url
    } catch (blobError: unknown) {
      const errorMessage = blobError instanceof Error ? blobError.message : 'Error desconocido'
      throw new Error(`Error subiendo video (${sizeMB.toFixed(1)}MB): ${errorMessage}`)
    }
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
              // thumbnail generation failed silently
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

  // Process upload after duplicate check
  const processUpload = async (file: File, skipDuplicateCheck: boolean = false, fileHash?: string) => {
    // Show preview immediately
    const objectUrl = URL.createObjectURL(file)
    if (!value || value.startsWith('blob:')) {
      setPreviewUrl(objectUrl)
    }

    let fileToUpload = file
    const sizeMB = file.size / (1024 * 1024)

    // Compress videos larger than 4MB
    if (sizeMB > 4) {
      setIsCompressing(true)

      try {
        if (isFFmpegSupported()) {
          // FFmpeg.wasm — best quality, requires SharedArrayBuffer (Chrome/Firefox)
          fileToUpload = await compressVideoFFmpeg(file, {
            maxSizeMB: 4,
            quality: sizeMB > 30 ? 'low' : sizeMB > 15 ? 'medium' : 'high',
            onProgress: (message) => {
              setVideoError(message)
            }
          })
        } else {
          // Canvas + MediaRecorder fallback — works in Safari
          setVideoError('Comprimiendo vídeo…')
          fileToUpload = await compressVideo(file, {
            maxSizeMB: 8,
            scale: sizeMB > 30 ? 0.5 : sizeMB > 15 ? 0.65 : 0.8,
            fps: 24,
            onProgress: (p) => {
              setVideoError(`Comprimiendo… ${Math.round(p * 100)}%`)
            }
          })
        }
        setVideoError(null)
      } catch (error) {
        // Compression failed — upload original
        setVideoError(null)
      } finally {
        setIsCompressing(false)
      }
    }

    setUploading(true)

    try {
      const videoUrl = await uploadFile(fileToUpload)
      const metadata = await generateThumbnail(file)

      setUploadSuccess(true)

      // Clean up blob URL and replace with actual URL
      URL.revokeObjectURL(objectUrl)
      setPreviewUrl(videoUrl) // Replace blob URL with actual URL

      // Notify parent
      onChange(videoUrl, metadata)

    } catch (error) {
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

  const handleFileSelect = async (file: File) => {
    // Reset states
    setVideoError(null)
    setUploadSuccess(false)
    setUploadProgress(0)
    setDuplicateMedia(null)
    setPendingFile(null)

    // Validate file
    if (!validateFile(file)) {
      return
    }

    const sizeMB = file.size / (1024 * 1024)

    // Check if file exceeds absolute limit (100MB)
    if (sizeMB > 100) {
      setVideoError(`El video es demasiado grande (${sizeMB.toFixed(0)}MB). El límite es 100MB.`)
      return
    }

    // Check for duplicates
    setIsCheckingDuplicate(true)
    setVideoError('Verificando archivo...')

    try {
      let existingMedia: DuplicateMedia | null = null

      if (sizeMB <= 20) {
        // Small files: use hash for accurate duplicate detection
        const hash = await calculateHash(file)

        if (hash) {
          existingMedia = await checkDuplicateByHash(hash)
        }
      } else {
        // Large files: use name for quick duplicate check
        existingMedia = await checkDuplicateByName(file.name)
      }

      if (existingMedia) {
        setDuplicateMedia(existingMedia)
        setPendingFile(file)
        setVideoError(null)
        setIsCheckingDuplicate(false)
        return // Wait for user decision
      }

      setVideoError(null)

    } catch (error) {
      // Continue with upload even if duplicate check fails
    } finally {
      setIsCheckingDuplicate(false)
    }

    // No duplicate found, proceed with upload
    await processUpload(file)
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
            ${uploading || isCheckingDuplicate ? 'pointer-events-none opacity-50' : ''}
          `}
          onClick={() => !uploading && !isCheckingDuplicate && inputRef.current?.click()}
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
            {uploading || isCompressing || isCheckingDuplicate ? (
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-gray-400" />
            )}

            <div>
              <p className="text-sm font-medium text-gray-700">
                {isCheckingDuplicate ? 'Verificando archivo...' : isCompressing ? 'Comprimiendo video...' : uploading ? 'Subiendo video...' : placeholder}
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
              if (previewUrl && previewUrl.startsWith('blob:')) {
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

      {/* Duplicate Detection Modal */}
      {duplicateMedia && (
        <div className="p-4 rounded-lg border border-amber-300 bg-amber-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">
                Este video ya existe en tu biblioteca
              </p>
              <p className="text-xs text-amber-700 mt-1">
                &quot;{duplicateMedia.originalName}&quot; ({(duplicateMedia.size / (1024 * 1024)).toFixed(1)}MB)
              </p>
              <div className="flex gap-2 mt-3">
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={useExistingVideo}
                  className="text-xs"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Usar existente
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={uploadNewVideo}
                  className="text-xs"
                >
                  <Upload className="w-3 h-3 mr-1" />
                  Subir de nuevo
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDuplicateMedia(null)
                    setPendingFile(null)
                  }}
                  className="text-xs"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {videoError && !duplicateMedia && (
        <div className={`p-3 rounded-lg border ${videoError.includes('📦') || videoError.includes('Verificando') || videoError.includes('Comprimiendo') ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
          <p className={`text-sm ${videoError.includes('📦') || videoError.includes('Verificando') || videoError.includes('Comprimiendo') ? 'text-blue-700' : 'text-red-700'}`}>
            {videoError}
          </p>
        </div>
      )}
    </div>
  )
}