// Video compression utilities for client-side compression
// Using canvas-based compression to avoid CORS issues

interface CompressionOptions {
  maxSizeMB?: number
  quality?: number // 0-1 for canvas quality
  scale?: number // Scale factor for dimensions (e.g., 0.5 for half size)
  fps?: number
  onProgress?: (progress: number) => void
}

// Calculate optimal bitrate based on duration and target size (AGGRESSIVE)
function calculateBitrate(durationSeconds: number, targetSizeMB: number): number {
  // Leave 20% buffer for container overhead and be more aggressive
  const targetSizeBits = targetSizeMB * 8 * 1024 * 1024 * 0.8
  const calculatedBitrate = Math.floor(targetSizeBits / durationSeconds)
  
  // Cap the bitrate to ensure ultra-small files
  const maxBitrate = 250000 // 250kbps max for tiny files
  const minBitrate = 50000  // 50kbps minimum for watchable quality
  
  return Math.max(minBitrate, Math.min(maxBitrate, calculatedBitrate))
}

// Browser-based video compression using canvas and MediaRecorder
export async function compressVideo(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const {
    maxSizeMB = 1.5,  // Much more aggressive default
    quality = 0.4,    // Lower quality default
    scale = 0.6,      // More aggressive scaling
    fps = 20,         // Lower frame rate
    onProgress
  } = options

  console.log('🎬 Starting video compression...')
  console.log('📁 Original file:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2), 'MB')

  // Check if file is already small enough
  const fileSizeMB = file.size / (1024 * 1024)
  if (fileSizeMB <= maxSizeMB) {
    console.log('✅ File is already under size limit, no compression needed')
    return file
  }

  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { 
      willReadFrequently: true,
      desynchronized: true 
    })
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'))
      return
    }

    video.onloadedmetadata = async () => {
      try {
        // Set canvas size with scaling
        const newWidth = Math.floor(video.videoWidth * scale)
        const newHeight = Math.floor(video.videoHeight * scale)
        
        // Ensure dimensions are even (required for some codecs)
        canvas.width = newWidth % 2 === 0 ? newWidth : newWidth - 1
        canvas.height = newHeight % 2 === 0 ? newHeight : newHeight - 1
        
        console.log('📐 Original dimensions:', video.videoWidth, 'x', video.videoHeight)
        console.log('📐 Compressed dimensions:', canvas.width, 'x', canvas.height)
        
        // Calculate target bitrate
        const targetBitrate = calculateBitrate(video.duration, maxSizeMB)
        console.log('🎯 Target bitrate:', targetBitrate, 'bps')
        
        // Create media stream from canvas
        const stream = canvas.captureStream(fps)
        
        // Try to add audio from original video
        try {
          const audioContext = new AudioContext()
          const source = audioContext.createMediaElementSource(video)
          const destination = audioContext.createMediaStreamDestination()
          source.connect(destination)
          source.connect(audioContext.destination)
          
          const audioTrack = destination.stream.getAudioTracks()[0]
          if (audioTrack) {
            stream.addTrack(audioTrack)
          }
        } catch (e) {
          console.warn('Could not capture audio, proceeding without audio:', e)
        }
        
        // Determine best supported codec
        let mimeType = 'video/webm;codecs=vp9'
        let fileExtension = 'webm'
        
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm;codecs=vp8'
        }
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm'
        }
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          // Try MP4 as last resort (Safari)
          mimeType = 'video/mp4'
          fileExtension = 'mp4'
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            reject(new Error('No supported video codec found'))
            return
          }
        }
        
        console.log('🎥 Using codec:', mimeType)
        
        // Set up MediaRecorder with quality options
        const recorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: targetBitrate
        })
        
        const chunks: Blob[] = []
        
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data)
          }
        }
        
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType })
          const compressedFile = new File(
            [blob],
            file.name.replace(/\.[^/.]+$/, `_compressed.${fileExtension}`),
            { type: mimeType }
          )
          
          const compressedSizeMB = compressedFile.size / (1024 * 1024)
          console.log('✅ Compression complete!')
          console.log('📊 Original size:', fileSizeMB.toFixed(2), 'MB')
          console.log('📊 Compressed size:', compressedSizeMB.toFixed(2), 'MB')
          console.log('📊 Compression ratio:', ((1 - compressedFile.size / file.size) * 100).toFixed(1), '%')
          
          // Clean up
          URL.revokeObjectURL(video.src)
          
          // If still too large, try more aggressive compression with multiple passes
          if (compressedSizeMB > maxSizeMB && scale > 0.3) {
            console.log('⚠️ File still too large, trying more aggressive compression...')
            console.log(`📉 Reducing scale from ${scale} to ${scale * 0.7}, quality from ${quality} to ${quality * 0.7}`)
            compressVideo(compressedFile, {  // Use already compressed file as input
              ...options,
              scale: scale * 0.7,       // More aggressive scaling reduction
              quality: quality * 0.7,   // More aggressive quality reduction
              fps: Math.max(12, fps - 6) // Lower frame rate faster
            }).then(resolve).catch(reject)
          } else {
            resolve(compressedFile)
          }
        }
        
        recorder.onerror = (event) => {
          console.error('MediaRecorder error:', event)
          reject(new Error('Recording failed'))
        }
        
        // Start recording
        recorder.start(100) // Collect data every 100ms
        
        // Play video and draw to canvas with progress tracking
        let frameCount = 0
        const totalFrames = Math.floor(video.duration * fps)
        const frameInterval = 1000 / fps
        let lastFrameTime = 0
        
        video.currentTime = 0
        video.muted = true // Mute to prevent echo
        
        const processFrame = (timestamp: number) => {
          if (video.paused || video.ended) {
            recorder.stop()
            return
          }
          
          // Control frame rate
          if (timestamp - lastFrameTime >= frameInterval) {
            // Apply quality settings through canvas
            ctx.filter = `contrast(${1 + (1 - quality) * 0.2})`
            ctx.imageSmoothingEnabled = true
            ctx.imageSmoothingQuality = quality > 0.8 ? 'high' : quality > 0.5 ? 'medium' : 'low'
            
            // Draw current frame
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            
            frameCount++
            lastFrameTime = timestamp
            
            // Update progress
            const progress = Math.min(99, Math.round((video.currentTime / video.duration) * 100))
            onProgress?.(progress)
          }
          
          requestAnimationFrame(processFrame)
        }
        
        // Start video playback
        video.play().then(() => {
          requestAnimationFrame(processFrame)
        }).catch((error) => {
          console.error('Video playback failed:', error)
          reject(error)
        })
        
      } catch (error) {
        console.error('Compression setup failed:', error)
        reject(error)
      }
    }
    
    video.onerror = () => {
      reject(new Error('Failed to load video'))
    }
    
    // Load video
    video.src = URL.createObjectURL(file)
    video.load()
  })
}

// Ultra-aggressive compression for maximum size reduction
export async function compressVideoUltra(
  file: File,
  options: { 
    maxSizeMB?: number
    onProgress?: (progress: number) => void
  } = {}
): Promise<File> {
  const { maxSizeMB = 1, onProgress } = options
  
  console.log('🔥 ULTRA compression mode activated!')
  
  // For ultra compression, use extreme settings
  const fileSizeMB = file.size / (1024 * 1024)
  const compressionRatio = maxSizeMB / fileSizeMB
  
  return compressVideo(file, {
    maxSizeMB,
    scale: Math.max(0.25, Math.min(0.5, Math.sqrt(compressionRatio))), // Very small
    quality: 0.25,  // Very low quality
    fps: 15,        // Very low frame rate
    onProgress
  })
}

// Even simpler compression using just bitrate reduction
export async function compressVideoSimple(
  file: File,
  options: { 
    maxSizeMB?: number
    onProgress?: (progress: number) => void
  } = {}
): Promise<File> {
  const { maxSizeMB = 1.5, onProgress } = options
  
  // For simple compression, we'll use scale factor based on file size
  const fileSizeMB = file.size / (1024 * 1024)
  const compressionRatio = maxSizeMB / fileSizeMB
  const scale = Math.sqrt(compressionRatio) // Square root to affect both dimensions
  
  return compressVideo(file, {
    maxSizeMB,
    scale: Math.max(0.3, Math.min(1, scale)),
    quality: 0.4,  // Lower quality
    fps: 18,       // Lower frame rate
    onProgress
  })
}