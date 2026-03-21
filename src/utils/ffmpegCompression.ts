// Video compression using FFmpeg.wasm - works on all browsers including Safari mobile
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

let ffmpeg: FFmpeg | null = null
let ffmpegLoaded = false
let ffmpegLoadPromise: Promise<FFmpeg> | null = null

// Initialize FFmpeg (lazy loading, singleton)
async function initFFmpeg(onProgress?: (message: string) => void): Promise<FFmpeg> {
  if (ffmpeg && ffmpegLoaded) {
    return ffmpeg
  }

  // Prevent multiple concurrent loads
  if (ffmpegLoadPromise) return ffmpegLoadPromise

  ffmpegLoadPromise = _doLoadFFmpeg(onProgress)
  try {
    return await ffmpegLoadPromise
  } catch (e) {
    // Reset on failure so next attempt starts fresh
    ffmpeg = null
    ffmpegLoaded = false
    ffmpegLoadPromise = null
    throw e
  }
}

async function _doLoadFFmpeg(onProgress?: (message: string) => void): Promise<FFmpeg> {
  ffmpeg = new FFmpeg()

  ffmpeg.on('progress', ({ progress }) => {
    const percent = Math.round(progress * 100)
    onProgress?.(`Comprimiendo... ${percent}%`)
  })

  onProgress?.('Cargando compresor de video...')

  // Load FFmpeg UMD core from own domain (served via /public/ffmpeg, works on all envs)
  const baseURL = `${window.location.origin}/ffmpeg`

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  })

  ffmpegLoaded = true
  onProgress?.('Compresor listo')

  return ffmpeg
}

interface CompressionOptions {
  maxSizeMB?: number
  quality?: 'low' | 'medium' | 'high'
  onProgress?: (message: string) => void
}

// Wrapper that races compression against a timeout
async function compressWithTimeout(
  file: File,
  options: CompressionOptions,
  timeoutMs: number
): Promise<File> {
  return Promise.race([
    _doCompress(file, options),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`FFmpeg timeout after ${timeoutMs / 1000}s`)), timeoutMs)
    ),
  ])
}

export async function compressVideoFFmpeg(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const fileSizeMB = file.size / (1024 * 1024)

  // If already small enough, return original
  if (fileSizeMB <= (options.maxSizeMB ?? 5)) {
    return file
  }

  // Race against 90-second timeout — WASM loads from own CDN (<2s), encode is the bottleneck
  return compressWithTimeout(file, options, 90_000)
}

async function _doCompress(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const {
    maxSizeMB = 5,
    quality = 'medium',
    onProgress
  } = options

  const fileSizeMB = file.size / (1024 * 1024)

  try {
    const ffmpegInstance = await initFFmpeg(onProgress)

    // Write input file to FFmpeg virtual filesystem
    const inputFileName = 'input' + getExtension(file.name)
    const outputFileName = 'output.mp4'

    onProgress?.('Preparando video...')
    await ffmpegInstance.writeFile(inputFileName, await fetchFile(file))

    // Calculate target bitrate based on quality
    const qualitySettings = {
      low: { crf: 32, preset: 'veryfast', scale: 480 },
      medium: { crf: 28, preset: 'faster', scale: 720 },
      high: { crf: 24, preset: 'faster', scale: 1080 }
    }

    const settings = qualitySettings[quality]

    onProgress?.('Comprimiendo video...')

    // Run FFmpeg compression
    // -i input: input file
    // -vf scale: scale to max height while maintaining aspect ratio
    // -c:v libx264: use H.264 codec (universal compatibility)
    // -crf: quality (lower = better, 18-28 is good range)
    // -preset: speed/quality tradeoff
    // -c:a aac: audio codec
    // -b:a 128k: audio bitrate
    // -movflags +faststart: optimize for web streaming
    await ffmpegInstance.exec([
      '-i', inputFileName,
      '-vf', `scale=-2:'min(${settings.scale},ih)'`,
      '-c:v', 'libx264',
      '-crf', settings.crf.toString(),
      '-preset', settings.preset,
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
      '-y',
      outputFileName
    ])

    onProgress?.('Finalizando...')

    // Read the compressed file
    const data = await ffmpegInstance.readFile(outputFileName)

    // Clean up
    await ffmpegInstance.deleteFile(inputFileName)
    await ffmpegInstance.deleteFile(outputFileName)

    // Create new file
    const compressedBlob = new Blob([data], { type: 'video/mp4' })
    const compressedFile = new File(
      [compressedBlob],
      file.name.replace(/\.[^/.]+$/, '_compressed.mp4'),
      { type: 'video/mp4' }
    )

    const compressedSizeMB = compressedFile.size / (1024 * 1024)

    onProgress?.(`Comprimido: ${compressedSizeMB.toFixed(1)}MB`)

    // If still too large and not at lowest quality, try again with lower quality
    if (compressedSizeMB > maxSizeMB && quality !== 'low') {
      const lowerQuality = quality === 'high' ? 'medium' : 'low'
      return compressVideoFFmpeg(compressedFile, { ...options, quality: lowerQuality })
    }

    return compressedFile

  } catch (error) {
    throw new Error('Error comprimiendo video. Intenta con un video más corto.')
  }
}

function getExtension(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (ext && ['mp4', 'mov', 'webm', 'avi', 'mkv', 'm4v'].includes(ext)) {
    return '.' + ext
  }
  return '.mp4'
}

// Check if FFmpeg is supported.
// Requires WebAssembly + SharedArrayBuffer (disabled on iOS/Safari without COOP/COEP headers).
// On iOS where SharedArrayBuffer is blocked, we skip FFmpeg entirely and upload the raw file.
export function isFFmpegSupported(): boolean {
  return typeof WebAssembly !== 'undefined' && typeof SharedArrayBuffer !== 'undefined'
}

// Pre-load FFmpeg WASM in the background so it's ready when the user selects a file
export async function preloadFFmpeg(): Promise<void> {
  if (!isFFmpegSupported()) return
  try {
    await initFFmpeg()
  } catch {
    // Silent — if it fails here it will fail again during compression and be handled there
  }
}
