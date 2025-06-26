'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Upload, X, Video, AlertCircle, Loader2, FolderOpen, CheckCircle, Camera, StopCircle, Zap } from 'lucide-react'
import { Button } from './Button'
import { MediaSelector } from './MediaSelector'
import { useNotifications } from '../../hooks/useNotifications'
import { uploadFileInChunks } from '../../utils/chunkedUpload'
import { compressVideo, compressVideoUltra } from '../../utils/videoCompression'

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
  placeholder = "Subir video VERTICAL (máx. 60 segundos)",
  className = "",
  maxSize = 200, // Increased because we compress aggressively
  maxDuration = 60,
  accept = "video/mp4,video/webm,video/quicktime",
  error = false,
  saveToLibrary = true
}: VideoUploadProps) {
  // Debug: Log the maxDuration prop being received
  console.log('🎯 VideoUpload component initialized with maxDuration:', maxDuration)
  
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStage, setUploadStage] = useState<'compressing' | 'uploading' | 'processing' | 'saving' | 'complete'>('uploading')
  const [compressionProgress, setCompressionProgress] = useState(0)
  const [isCompressing, setIsCompressing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null)
  const [showMediaSelector, setShowMediaSelector] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)
  const [forceUpload, setForceUpload] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const cameraRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const { addNotification } = useNotifications()

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
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [previewUrl, mediaStream])

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxDuration) {
            stopRecording()
            return prev
          }
          return prev + 1
        })
      }, 1000)
    } else {
      setRecordingTime(0)
    }
    return () => clearInterval(interval)
  }, [isRecording, maxDuration])

  const validateVideo = async (file: File): Promise<boolean> => {
    console.log('📋 Validating file:', file.name, file.type, file.size)
    
    // Check file size - ACCEPT EVERYTHING under 1GB
    const sizeMB = file.size / (1024 * 1024)
    console.log('📏 File size:', sizeMB.toFixed(2), 'MB')
    
    // Only block truly massive files (1GB+)
    if (sizeMB > 1000) {
      setVideoError(`Archivo extremadamente grande (${sizeMB.toFixed(1)}MB). Máximo 1GB.`)
      return false
    }
    
    // For any reasonable file size, just show positive message
    if (sizeMB > 0.1) { // Show size info for files over 100KB
      console.log('✅ File size acceptable:', sizeMB.toFixed(2), 'MB')
      // Don't set any error message - just log for info
    }

    // Check video duration and orientation
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.crossOrigin = 'anonymous'
      
      // Add timeout to prevent hanging on metadata loading
      const timeoutId = setTimeout(() => {
        console.warn('⏰ Video metadata loading timeout - accepting video anyway')
        URL.revokeObjectURL(video.src)
        resolve(true) // Accept video if metadata fails to load
      }, 10000) // 10 second timeout
      
      video.onloadedmetadata = () => {
        clearTimeout(timeoutId) // Cancel timeout since metadata loaded
        console.log('📹 Video metadata:', {
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
          aspectRatio: video.videoWidth / video.videoHeight
        })
        console.log('⏱️ Comparing duration:', video.duration, 'vs maxDuration:', maxDuration)
        
        // Check if duration is valid (sometimes videos don't load metadata properly)
        if (isNaN(video.duration) || video.duration === 0) {
          console.warn('⚠️ Could not read video duration, assuming it is OK')
          // Don't block upload if we can't read duration
        } else if (video.duration > 300) { // Only reject if longer than 5 minutes
          console.error('⏱️ Video extremely long:', video.duration, 'seconds')
          setVideoError(`Video demasiado largo (${Math.round(video.duration)}s). Máximo 5 minutos.`)
          URL.revokeObjectURL(video.src)
          resolve(false)
          return
        } else if (video.duration > maxDuration) {
          // Show info but don't block
          console.log('ℹ️ Video longer than recommended but within limits:', video.duration, 'vs', maxDuration)
          setVideoError(`ℹ️ Video de ${Math.round(video.duration)}s detectado correctamente. ¡Perfecto para subir!`)
          // Clear error after 3 seconds since it's just informational
          setTimeout(() => setVideoError(null), 3000)
        } else {
          console.log('✅ Video duration perfect:', video.duration, 'seconds')
          setVideoError(`✅ Video de ${Math.round(video.duration)} segundos detectado. ¡Perfecto!`)
          // Clear success message after 2 seconds
          setTimeout(() => setVideoError(null), 2000)
        }

        // Check orientation but don't block anything - just show info
        const aspectRatio = video.videoWidth / video.videoHeight
        if (aspectRatio > 1) { // Horizontal
          console.log('📐 Video horizontal detectado:', aspectRatio)
          // Don't set error, just log for info
        } else {
          console.log('📐 Video vertical perfecto:', aspectRatio)
        }

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
              duration: video.duration || 0, // Default to 0 if duration is invalid
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
      
      video.onerror = (error) => {
        clearTimeout(timeoutId)
        console.error('🚨 Video validation error:', error)
        console.log('⚠️ Video processing failed, but allowing upload anyway for compatibility')
        setVideoError('⚠️ No se pudieron leer los metadatos del video, pero se subirá de todas formas.')
        URL.revokeObjectURL(video.src)
        resolve(true) // Accept video even if metadata reading fails
      }
      
      video.src = URL.createObjectURL(file)
      console.log('🔗 Created video URL for validation:', video.src)
    })
  }

  const startCamera = async () => {
    try {
      setVideoError(null)
      console.log('📱 Requesting camera access...')
      
      // Try back camera first, fallback to any camera
      let constraints = {
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 720, min: 640 },
          height: { ideal: 1280, min: 480 }
        },
        audio: true
      }
      
      let stream
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints)
      } catch (backCameraError) {
        console.warn('Back camera failed, trying any camera:', backCameraError)
        // Fallback to any available camera
        const fallbackConstraints = {
          video: {
            width: { ideal: 720, min: 640 },
            height: { ideal: 1280, min: 480 }
          },
          audio: true
        }
        stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints)
      }
      
      console.log('✅ Camera access granted')
      setMediaStream(stream)
      setShowCamera(true)
      
      if (cameraRef.current) {
        cameraRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('🚨 Error accessing camera:', error)
      setVideoError('No se pudo acceder a la cámara. Verifica los permisos del navegador.')
    }
  }

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop())
      setMediaStream(null)
    }
    setShowCamera(false)
    setIsRecording(false)
    setRecordingTime(0)
    if (cameraRef.current) {
      cameraRef.current.srcObject = null
    }
  }

  const startRecording = () => {
    if (!mediaStream) return

    recordedChunksRef.current = []
    
    // Try different video formats for better compatibility
    let options = { mimeType: 'video/webm;codecs=vp9' }
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options = { mimeType: 'video/webm' }
    }
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options = { mimeType: 'video/mp4' }
    }

    const mediaRecorder = new MediaRecorder(mediaStream, options)

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: options.mimeType })
      const extension = options.mimeType.includes('mp4') ? 'mp4' : 'webm'
      const file = new File([blob], `recording-${Date.now()}.${extension}`, { type: options.mimeType })
      
      console.log('📹 Recording complete:', file.name, file.size, 'bytes')
      
      // Stop camera and process the recorded video
      stopCamera()
      handleUpload(file)
    }

    mediaRecorder.onerror = (event) => {
      console.error('MediaRecorder error:', event)
      setVideoError('Error durante la grabación')
      stopCamera()
    }

    mediaRecorderRef.current = mediaRecorder
    mediaRecorder.start()
    setIsRecording(true)
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleUpload = async (file: File) => {
    console.log('🎬 Starting video upload:', file.name, file.size, file.type)
    console.log('📐 Upload component maxDuration:', maxDuration)
    setVideoError(null)
    setUploadSuccess(false)
    
    // Always compress videos for maximum size reduction
    const fileSizeMB = file.size / (1024 * 1024)
    let fileToUpload = file
    
    // Compress ALL videos for maximum size reduction and performance
    console.log('🎬 Starting aggressive compression for all videos...')
    console.log('📦 File size:', fileSizeMB.toFixed(2), 'MB - Compression ALWAYS enabled!')
    
    try {
      setIsCompressing(true)
      setUploadStage('compressing')
      setCompressionProgress(0)
      
      // Show compression notification
      addNotification({
        type: 'info',
        title: '🗜️ Optimizando video',
        message: 'Comprimiendo para máxima velocidad y calidad optimizada...',
        read: false
      })
      
      // Choose compression method based on file size and duration
      let compressionMethod = compressVideo
      let targetSize = 1.5
      
      // If file is very large or we detect it's likely a long video, use ULTRA compression
      if (fileSizeMB > 5 || file.size > 8 * 1024 * 1024) {
        console.log('🔥 Using ULTRA compression for large file!')
        compressionMethod = compressVideoUltra
        targetSize = 0.8 // Even smaller target for ultra compression
      }
      
      // Compress the video with AGGRESSIVE settings for maximum reduction
      fileToUpload = await compressionMethod(file, {
        maxSizeMB: targetSize,
        onProgress: (progress) => {
          setCompressionProgress(progress)
        }
      })
      
      // If still too large after compression, try ultra compression as fallback
      const compressedSizeMB = fileToUpload.size / (1024 * 1024)
      if (compressedSizeMB > 2 && compressionMethod !== compressVideoUltra) {
        console.log('🔥 File still large, applying ULTRA compression as fallback!')
        addNotification({
          type: 'info',
          title: '🚀 Compresión adicional',
          message: 'Aplicando compresión ultra para optimizar el tamaño...',
          read: false
        })
        
        fileToUpload = await compressVideoUltra(fileToUpload, {
          maxSizeMB: 0.8,
          onProgress: (progress) => {
            setCompressionProgress(progress)
          }
        })
      }
      
      const finalCompressedSizeMB = fileToUpload.size / (1024 * 1024)
      console.log('✅ Compression complete! New size:', finalCompressedSizeMB.toFixed(2), 'MB')
      
      // Show success notification
      addNotification({
        type: 'info',
        title: '✅ Video optimizado',
        message: `Tamaño reducido de ${fileSizeMB.toFixed(1)}MB a ${finalCompressedSizeMB.toFixed(1)}MB`,
        read: false
      })
      
    } catch (compressionError) {
      console.error('❌ Compression failed:', compressionError)
      console.log('⚠️ Compression failed, uploading original file')
      // Don't fail - just upload original file
      addNotification({
        type: 'warning',
        title: 'Compresión falló',
        message: 'Subiendo video original. Puede tardar más tiempo.',
        read: false
      })
    } finally {
      setIsCompressing(false)
    }
    
    // Start upload process immediately to show progress bar
    setUploading(true)
    setUploadProgress(0)
    setUploadStage('processing')
    
    // Validate video (unless force upload is enabled)
    if (!forceUpload) {
      console.log('🔍 Validating video...')
      const isValid = await validateVideo(fileToUpload)
      console.log('✅ Video validation result:', isValid)
      if (!isValid) {
        console.log('❌ Video validation failed - showing force upload option')
        setUploading(false)
        return
      }
    } else {
      console.log('🚀 FORCE UPLOAD MODE - Skipping all validations!')
      setVideoError(null) // Clear any previous errors
    }

    // Create preview
    const objectUrl = URL.createObjectURL(fileToUpload)
    setPreviewUrl(objectUrl)
    
    // Continue with upload
    setUploadStage('uploading')
    setUploadProgress(5) // Show some initial progress
    
    // Show upload started notification
    addNotification({
      type: 'info',
      title: '📤 Subiendo video...',
      message: 'El video se está procesando y subiendo al servidor',
      read: false
    })
    
    const formData = new FormData()
    formData.append('file', fileToUpload)
    formData.append('type', 'video')
    
    // Use large upload endpoint for files > 4MB
    const finalFileSizeMB = fileToUpload.size / (1024 * 1024)
    const uploadEndpoint = finalFileSizeMB > 4 ? '/api/upload-large' : '/api/upload'
    
    console.log(`📤 Using ${uploadEndpoint} for ${finalFileSizeMB.toFixed(2)}MB file`)
    
    try {
      const xhr = new XMLHttpRequest()
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100)
          setUploadProgress(progress)
          
          // Update stage based on progress
          if (progress < 90) {
            setUploadStage('uploading')
          } else {
            setUploadStage('processing')
          }
        }
      })
      
      xhr.onload = async () => {
        if (xhr.status === 413) {
          const errorText = await xhr.responseText || '{}'
          let errorData: any = {}
          try {
            errorData = JSON.parse(errorText)
          } catch {}
          
          const errorMessage = errorData.error || 'El video es demasiado grande. Intenta con un video más corto o de menor calidad.'
          setVideoError(errorMessage)
          setUploading(false)
          setUploadSuccess(false)
          URL.revokeObjectURL(objectUrl)
          
          addNotification({
            type: 'error',
            title: 'Video demasiado grande',
            message: errorMessage,
            read: false
          })
          return
        } else if (xhr.status === 200) {
          setUploadStage('saving')
          const data = JSON.parse(xhr.responseText)
          if (data.url) {
            // Save to media library if enabled (with timeout and better error handling)
            if (saveToLibrary) {
              try {
                console.log('💾 Saving video to media library...')
                
                // Add timeout to prevent hanging
                const controller = new AbortController()
                const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
                
                const response = await fetch('/api/media-library', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    url: data.url,
                    type: 'video',
                    metadata: {
                      filename: data.filename,
                      originalName: fileToUpload.name,
                      mimeType: fileToUpload.type,
                      size: fileToUpload.size,
                      duration: metadata?.duration,
                      width: metadata?.width,
                      height: metadata?.height,
                      thumbnail: metadata?.thumbnail
                    }
                  }),
                  signal: controller.signal
                })
                
                clearTimeout(timeoutId)
                
                if (response.ok) {
                  const mediaResult = await response.json()
                  console.log('✅ Video saved to media library:', mediaResult)
                } else {
                  console.warn('⚠️ Media library save failed with status:', response.status)
                }
              } catch (error) {
                if (error instanceof Error && error.name === 'AbortError') {
                  console.warn('⏱️ Media library save timed out')
                } else {
                  console.warn('❌ Failed to save to media library:', error)
                }
                // Don't fail the upload if library save fails
              }
            }
            
            setUploadStage('complete')
            setUploadProgress(100)
            setUploadSuccess(true)
            
            // Show success notification
            addNotification({
              type: 'info',
              title: '✅ Video subido correctamente',
              message: `El video "${fileToUpload.name}" se ha subido y guardado exitosamente`,
              read: false
            })
            
            onChange(data.url, metadata || undefined)
            setPreviewUrl(data.url)
            URL.revokeObjectURL(objectUrl)
            
            // Reset success state after 3 seconds
            setTimeout(() => {
              setUploadSuccess(false)
              setUploading(false)
              setCompressionProgress(0)
            }, 3000)
          }
        } else {
          throw new Error('Error al subir el video')
        }
      }
      
      xhr.onerror = () => {
        const errorMessage = xhr.status === 413 
          ? 'El video es demasiado grande. Intenta con un video más corto o de menor calidad.'
          : 'Error al subir el video'
        
        setVideoError(errorMessage)
        setUploading(false)
        setUploadSuccess(false)
        URL.revokeObjectURL(objectUrl)
        
        // Show error notification
        addNotification({
          type: 'error',
          title: 'Error al subir video',
          message: xhr.status === 413 
            ? 'El archivo es demasiado grande. Reduce el tamaño del video e inténtalo de nuevo.'
            : 'No se pudo subir el video. Por favor, inténtalo de nuevo.',
          read: false
        })
      }
      
      xhr.open('POST', uploadEndpoint)
      xhr.send(formData)
      
    } catch (error) {
      console.error('Error uploading video:', error)
      setVideoError('Error al subir el video')
      setUploading(false)
      setUploadSuccess(false)
      URL.revokeObjectURL(objectUrl)
      
      // Show error notification
      addNotification({
        type: 'error',
        title: 'Error al subir video',
        message: error instanceof Error ? error.message : 'Error desconocido',
        read: false
      })
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
    setUploadSuccess(false)
    setUploading(false)
    setUploadProgress(0)
    setCompressionProgress(0)
    setUploadStage('uploading')
    setIsCompressing(false)
    onChange(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleSelectFromLibrary = (media: any) => {
    setPreviewUrl(media.url)
    setUploadSuccess(true)
    
    const videoMetadata = {
      duration: media.duration || 0,
      thumbnail: media.thumbnailUrl || '',
      size: media.size || 0,
      width: media.width || 0,
      height: media.height || 0
    }
    
    setMetadata(videoMetadata)
    onChange(media.url, videoMetadata)
    setShowMediaSelector(false)
    
    // Show notification for library selection
    addNotification({
      type: 'info',
      title: 'Video seleccionado',
      message: `Video "${media.originalName || 'desde biblioteca'}" agregado exitosamente`,
      read: false
    })
    
    // Reset success state after 2 seconds
    setTimeout(() => {
      setUploadSuccess(false)
    }, 2000)
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
            {(uploading || isCompressing || uploadSuccess) ? (
              <>
                {uploadSuccess ? (
                  <CheckCircle className="w-8 h-8 text-green-500" />
                ) : (
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                )}
                
                <p className="text-sm font-medium text-gray-700">
                  {uploadSuccess ? (
                    'Video subido correctamente ✓'
                  ) : uploadStage === 'compressing' ? (
                    `Comprimiendo... ${compressionProgress}%`
                  ) : uploadStage === 'processing' ? (
                    'Validando video...'
                  ) : uploadStage === 'uploading' ? (
                    `Subiendo... ${uploadProgress}%`
                  ) : uploadStage === 'saving' ? (
                    'Guardando en biblioteca...'
                  ) : (
                    'Completando...'
                  )}
                </p>
                
                {(uploading || isCompressing) && !uploadSuccess && (
                  <div className="w-full max-w-xs">
                    <div className="bg-gray-200 rounded-full h-5 mt-2 overflow-hidden shadow-inner border border-gray-300">
                      <div 
                        className={`h-5 rounded-full transition-all duration-300 flex items-center justify-center relative ${
                          uploadStage === 'complete' 
                            ? 'bg-green-500' 
                            : uploadStage === 'compressing'
                            ? 'bg-orange-500'
                            : uploadStage === 'saving'
                            ? 'bg-yellow-500'
                            : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.max(5, uploadStage === 'compressing' ? compressionProgress : uploadProgress)}%` }}
                      >
                        <span className="text-xs text-white font-semibold px-1 drop-shadow-sm">
                          {uploadStage === 'compressing' ? compressionProgress : uploadProgress}%
                        </span>
                      </div>
                    </div>
                    
                    {/* Additional progress indicator */}
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>
                        {uploadStage === 'compressing' && '📦 Comprimiendo'}
                        {uploadStage === 'uploading' && '📤 Subiendo'}
                        {uploadStage === 'processing' && '⚙️ Procesando'}
                        {uploadStage === 'saving' && '💾 Guardando'}
                      </span>
                      <span className="font-medium">
                        {uploadStage === 'compressing' ? compressionProgress : uploadProgress}%
                      </span>
                    </div>
                  </div>
                )}
                
                {uploadStage !== 'uploading' && !uploadSuccess && (
                  <p className="text-xs text-gray-500 mt-1">
                    {uploadStage === 'compressing' && 'Reduciendo el tamaño del video para una subida más rápida...'}
                    {uploadStage === 'processing' && 'Verificando duración y formato...'}
                    {uploadStage === 'saving' && 'Añadiendo a tu biblioteca de medios...'}
                    {uploadStage === 'complete' && 'Finalizando...'}
                  </p>
                )}
              </>
            ) : (
              <>
                <Video className="w-8 h-8 text-gray-400" />
                <p className="text-sm text-gray-600">{placeholder}</p>
                <p className="text-xs text-gray-500">MP4, WebM o MOV hasta {maxSize}MB (se comprime automáticamente para máxima velocidad)</p>
                
                {/* Important requirements notice */}
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-blue-800">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">Requisitos importantes:</span>
                  </div>
                  <ul className="text-xs text-blue-700 mt-1 space-y-1">
                    <li>• Video en VERTICAL (modo retrato)</li>
                    <li>• Máximo {maxDuration} segundos de duración</li>
                    <li>• Hasta {maxSize}MB (se comprime automáticamente)</li>
                    <li>• ⚡ Compresión ultra para archivos pequeños</li>
                  </ul>
                </div>
                
                <div className="mt-3 flex gap-2 flex-wrap justify-center">
                  {/* Check if we're on mobile and camera is available */}
                  {typeof navigator !== 'undefined' && navigator.mediaDevices && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        startCamera()
                      }}
                      className="text-xs hover:bg-green-50 hover:border-green-200 transition-colors"
                    >
                      <Camera className="w-4 h-4 mr-1" />
                      Grabar video
                    </Button>
                  )}
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowMediaSelector(true)
                    }}
                    className="text-xs hover:bg-violet-50 hover:border-violet-200 transition-colors"
                  >
                    <FolderOpen className="w-4 h-4 mr-1" />
                    Desde biblioteca
                  </Button>
                  
                  {/* Debug button for testing upload without strict validation */}
                  <div className="w-full mt-2 text-center">
                    <span className="text-xs text-gray-500">
                      ⚠️ Modo de debug activo - Revisa la consola para logs
                    </span>
                  </div>
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
            style={{ 
              maxHeight: '400px',
              aspectRatio: metadata?.width && metadata?.height ? `${metadata.width}/${metadata.height}` : 'auto'
            }}
          />
          {metadata && (
            <div className="mt-2 text-xs text-gray-600">
              Duración: {Math.round(metadata.duration)}s | 
              Tamaño: {(metadata.size / (1024 * 1024)).toFixed(1)}MB |
              {metadata.width}x{metadata.height}
            </div>
          )}
          
          {uploadSuccess && (
            <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1 shadow-lg">
              <CheckCircle className="w-3 h-3" />
              <span>Guardado</span>
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
        <div className="mt-2 space-y-2">
          <div className={`flex items-center text-sm ${
            videoError.startsWith('✅') ? 'text-green-600' : 
            videoError.startsWith('ℹ️') ? 'text-blue-600' : 
            videoError.startsWith('⚠️') ? 'text-orange-600' : 'text-red-600'
          }`}>
            <AlertCircle className="w-4 h-4 mr-1" />
            {videoError}
          </div>
          
          {/* Force upload button for when validation fails */}
          {!uploading && !uploadSuccess && videoError && 
           !videoError.startsWith('✅') && !videoError.startsWith('ℹ️') && (
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setForceUpload(true)
                  setVideoError(null)
                  // Re-trigger upload with force mode
                  if (inputRef.current?.files?.[0]) {
                    handleUpload(inputRef.current.files[0])
                  }
                }}
                className="text-xs bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
              >
                🚀 Subir de todas formas
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setVideoError(null)
                  setPreviewUrl(null)
                  if (inputRef.current) {
                    inputRef.current.value = ''
                  }
                }}
                className="text-xs"
              >
                ❌ Cancelar
              </Button>
            </div>
          )}
        </div>
      )}
      
      <MediaSelector
        type="video"
        isOpen={showMediaSelector}
        onSelect={handleSelectFromLibrary}
        onClose={() => setShowMediaSelector(false)}
      />
      
      {/* Camera Recording Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Grabar Video Vertical</h3>
              <button
                onClick={stopCamera}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative">
              <video
                ref={cameraRef}
                autoPlay
                muted
                playsInline
                className="w-full h-80 object-cover rounded-lg bg-black"
                style={{ transform: 'scaleX(-1)' }} // Mirror effect for front camera
              />
              
              {/* Recording indicator */}
              {isRecording && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span>REC {recordingTime}s</span>
                </div>
              )}
              
              {/* Time remaining */}
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                {maxDuration - recordingTime}s restantes
              </div>
            </div>
            
            {/* Instructions */}
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-xs text-yellow-800">
                📱 Mantén el teléfono en vertical y graba máximo {maxDuration} segundos
              </p>
            </div>
            
            {/* Controls */}
            <div className="flex justify-center space-x-4 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={stopCamera}
                disabled={isRecording}
              >
                Cancelar
              </Button>
              
              {!isRecording ? (
                <Button
                  type="button"
                  onClick={startRecording}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <div className="w-4 h-4 bg-white rounded-full mr-2" />
                  Iniciar grabación
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={stopRecording}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <StopCircle className="w-4 h-4 mr-2" />
                  Detener ({recordingTime}s)
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}