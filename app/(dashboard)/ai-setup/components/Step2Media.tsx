'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { compressVideoFFmpeg, isFFmpegSupported } from '../../../../src/utils/ffmpegCompression'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  Camera,
  Image as ImageIcon,
  Video,
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  FileWarning,
  ChevronDown,
  Loader2,
  Play,
  Pause,
  Key,
  Car,
  Snowflake,
  Shirt,
  Utensils,
  Coffee,
  Flame,
  Tv,
  Wind,
  Thermometer,
  Lock,
  Waves,
  TreePine,
  Umbrella,
  Bath,
  Plus,
  ShowerHead,
  Bed,
  Sofa,
  Wifi,
  MapPin,
  Home,
  Bike,
  Wrench,
  Info,
  Trash2,
  DoorOpen,
  type LucideIcon,
} from 'lucide-react'

// ── Template zones — auto-generated content from previous steps ──
// hasTemplate: true = content auto-filled from wizard data (check-in, parking, AC)
// hasTemplate: false = predefined zone with AI-generated or registry-based content

// Icon map for zone selector (Lucide icons)
const ZONE_ICON_MAP: Record<string, LucideIcon> = {
  'key': Key,
  'car': Car,
  'snowflake': Snowflake,
  'shirt': Shirt,
  'utensils': Utensils,
  'coffee': Coffee,
  'flame': Flame,
  'tv': Tv,
  'wind': Wind,
  'thermometer': Thermometer,
  'lock': Lock,
  'waves': Waves,
  'tree-pine': TreePine,
  'umbrella': Umbrella,
  'bath': Bath,
  'shower': ShowerHead,
  'shower-head': ShowerHead,
  'bed': Bed,
  'sofa': Sofa,
  'wifi': Wifi,
  'map-pin': MapPin,
  'home': Home,
  'bike': Bike,
  'wrench': Wrench,
  'info': Info,
  'trash-2': Trash2,
  'door-open': DoorOpen,
}

// Icons available for custom zones (vector SVG, shown in picker grid)
const CUSTOM_ZONE_ICONS: { id: string; Icon: LucideIcon; label: string }[] = [
  { id: 'shower', Icon: ShowerHead, label: 'Ducha' },
  { id: 'bath', Icon: Bath, label: 'Baño' },
  { id: 'bed', Icon: Bed, label: 'Dormitorio' },
  { id: 'sofa', Icon: Sofa, label: 'Salón' },
  { id: 'utensils', Icon: Utensils, label: 'Cocina' },
  { id: 'coffee', Icon: Coffee, label: 'Cafetera' },
  { id: 'tv', Icon: Tv, label: 'TV' },
  { id: 'wifi', Icon: Wifi, label: 'WiFi' },
  { id: 'key', Icon: Key, label: 'Acceso' },
  { id: 'car', Icon: Car, label: 'Parking' },
  { id: 'waves', Icon: Waves, label: 'Piscina' },
  { id: 'umbrella', Icon: Umbrella, label: 'Terraza' },
  { id: 'tree-pine', Icon: TreePine, label: 'Jardín' },
  { id: 'flame', Icon: Flame, label: 'Barbacoa' },
  { id: 'wind', Icon: Wind, label: 'Aire' },
  { id: 'thermometer', Icon: Thermometer, label: 'Calefacción' },
  { id: 'snowflake', Icon: Snowflake, label: 'Nevera' },
  { id: 'shirt', Icon: Shirt, label: 'Lavadora' },
  { id: 'bike', Icon: Bike, label: 'Bici' },
  { id: 'home', Icon: Home, label: 'Casa' },
  { id: 'map-pin', Icon: MapPin, label: 'Ubicación' },
  { id: 'info', Icon: Info, label: 'Info' },
  { id: 'wrench', Icon: Wrench, label: 'Herramientas' },
  { id: 'lock', Icon: Lock, label: 'Caja fuerte' },
]

export const PREDEFINED_ZONES = [
  { id: 'check-in', name: 'Check-in', lucideIcon: 'key', icon: 'key', hasTemplate: true },
  { id: 'check-out', name: 'Check-out', lucideIcon: 'door-open', icon: 'door-open', hasTemplate: true },
  { id: 'air-conditioning', name: 'Aire Acondicionado', lucideIcon: 'snowflake', icon: 'snowflake', hasTemplate: true },
  { id: 'wifi', name: 'WiFi', lucideIcon: 'wifi', icon: 'wifi', hasTemplate: true },
  { id: 'parking', name: 'Parking', lucideIcon: 'car', icon: 'car', hasTemplate: true },
  { id: 'recycling', name: 'Basura y reciclaje', lucideIcon: 'trash-2', icon: 'trash-2', hasTemplate: true },
  { id: 'washing_machine', name: 'Lavadora', lucideIcon: 'shirt', icon: 'washing-machine', hasTemplate: false },
  { id: 'dishwasher', name: 'Lavavajillas', lucideIcon: 'utensils', icon: 'dishwasher', hasTemplate: false },
  { id: 'coffee_machine', name: 'Cafetera', lucideIcon: 'coffee', icon: 'coffee', hasTemplate: false },
  { id: 'induction_hob', name: 'Vitrocerámica', lucideIcon: 'flame', icon: 'cooktop', hasTemplate: false },
  { id: 'oven', name: 'Horno', lucideIcon: 'flame', icon: 'oven', hasTemplate: false },
  { id: 'microwave', name: 'Microondas', lucideIcon: 'flame', icon: 'microwave', hasTemplate: false },
  { id: 'television', name: 'Smart TV', lucideIcon: 'tv', icon: 'tv', hasTemplate: false },
  { id: 'refrigerator', name: 'Frigorífico', lucideIcon: 'snowflake', icon: 'refrigerator', hasTemplate: false },
  { id: 'dryer', name: 'Secadora', lucideIcon: 'wind', icon: 'wind', hasTemplate: false },
  { id: 'iron_appliance', name: 'Plancha', lucideIcon: 'shirt', icon: 'iron', hasTemplate: false },
  { id: 'heater', name: 'Calefacción', lucideIcon: 'thermometer', icon: 'thermometer', hasTemplate: false },
  { id: 'safe', name: 'Caja Fuerte', lucideIcon: 'lock', icon: 'lock', hasTemplate: false },
  { id: 'pool', name: 'Piscina', lucideIcon: 'waves', icon: 'waves', hasTemplate: false },
  { id: 'terrace', name: 'Terraza', lucideIcon: 'umbrella', icon: 'umbrella', hasTemplate: false },
  { id: 'garden', name: 'Jardín', lucideIcon: 'tree-pine', icon: 'trees', hasTemplate: false },
  { id: 'bbq', name: 'Barbacoa', lucideIcon: 'flame', icon: 'flame', hasTemplate: false },
  { id: 'jacuzzi', name: 'Jacuzzi', lucideIcon: 'bath', icon: 'bath', hasTemplate: false },
] as const

function ZoneIcon({ iconName, className = 'w-4 h-4' }: { iconName: string; className?: string }) {
  const Icon = ZONE_ICON_MAP[iconName]
  if (!Icon) return null
  return <Icon className={className} />
}

// ── Types ──

export interface MediaItem {
  id: string
  url: string
  type: 'image' | 'video'
  fileSize?: number
  // User-assigned zone
  zoneId?: string           // predefined zone ID
  customZoneName?: string   // name if "Create new zone"
  customZoneIcon?: string   // icon ID for custom zone (e.g. 'shower', 'bath')
  description?: string      // user description (Spanish)
}

export interface PropertyContext {
  hasAC?: boolean
  hasPool?: boolean
  hasParking?: string
  items?: Record<string, { has: boolean; location: string }>
}

interface SuggestedZone {
  zoneId: string
  name: string
  icon: string
  hint: string
}

function buildSuggestedZones(ctx?: PropertyContext): SuggestedZone[] {
  const suggestions: SuggestedZone[] = [
    { zoneId: 'washing_machine', name: 'Lavadora', icon: 'shirt', hint: 'Foto de los mandos y cajón del detergente' },
    { zoneId: 'coffee_machine', name: 'Cafetera', icon: 'coffee', hint: 'Foto de los botones y cómo poner el café' },
    { zoneId: 'television', name: 'Smart TV', icon: 'tv', hint: 'Foto del mando y la pantalla' },
    { zoneId: 'induction_hob', name: 'Vitrocerámica', icon: 'flame', hint: 'Foto de los mandos de la cocina' },
    { zoneId: 'dishwasher', name: 'Lavavajillas', icon: 'utensils', hint: 'Foto del interior y los programas' },
  ]
  if (ctx?.hasAC) {
    suggestions.unshift({ zoneId: 'air-conditioning', name: 'Aire Acondicionado', icon: 'snowflake', hint: 'Foto del mando y la unidad interior' })
  }
  if (ctx?.hasPool) {
    suggestions.push({ zoneId: 'pool', name: 'Piscina', icon: 'waves', hint: 'Foto de la piscina y el horario de uso' })
  }
  if (ctx?.hasParking === 'yes') {
    suggestions.push({ zoneId: 'car', name: 'Parking', icon: 'car', hint: 'Foto de la plaza, barrera o entrada' })
  }
  return suggestions
}

interface Step2MediaProps {
  media: MediaItem[]
  onMediaChange: (media: MediaItem[]) => void
  onNext: () => void
  onBack: () => void
  uploadEndpoint?: string
  // When true, uploads go directly from browser to Vercel Blob (bypasses serverless body limit)
  clientUpload?: boolean
  propertyContext?: PropertyContext
}

const MAX_VIDEO_SIZE_MB = 50
const MAX_IMAGE_SIZE_MB = 20
const CUSTOM_ZONE_VALUE = '__custom__'

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function Step2Media({
  media,
  onMediaChange,
  onNext,
  onBack,
  uploadEndpoint = '/api/upload',
  clientUpload = false,
  propertyContext,
}: Step2MediaProps) {
  const { t } = useTranslation('ai-setup')
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [compressStatus, setCompressStatus] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [uploadErrors, setUploadErrors] = useState<string[]>([])
  const [suggestingFor, setSuggestingFor] = useState<string | null>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [portraitVideos, setPortraitVideos] = useState<Set<string>>(new Set())
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    if (!openDropdown) return
    const handler = () => setOpenDropdown(null)
    // Small delay so the button click that opened it doesn't immediately close it
    const timer = setTimeout(() => document.addEventListener('click', handler), 0)
    return () => { clearTimeout(timer); document.removeEventListener('click', handler) }
  }, [openDropdown])
  const mediaRef = useRef<MediaItem[]>(media)
  mediaRef.current = media

  const videoCount = media.filter(m => m.type === 'video').length
  const imageCount = media.filter(m => m.type === 'image').length

  // All media must have zone assigned. Description is optional (AI will generate if empty).
  const allMediaComplete = media.length === 0 || media.every(m => {
    return !!(m.zoneId || m.customZoneName?.trim())
  })

  const updateMedia = useCallback((updater: (current: MediaItem[]) => MediaItem[]) => {
    const updated = updater(mediaRef.current)
    mediaRef.current = updated
    onMediaChange(updated)
  }, [onMediaChange])

  const updateField = useCallback((id: string, fields: Partial<MediaItem>) => {
    updateMedia(current => current.map(m => m.id === id ? { ...m, ...fields } : m))
  }, [updateMedia])

  // AI suggestion for custom zone description
  const suggestDescription = useCallback(async (itemId: string, zoneName: string) => {
    if (!zoneName.trim()) return
    setSuggestingFor(itemId)
    try {
      const res = await fetch('/api/public/ai-suggest-zone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zoneName: zoneName.trim() }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.suggestion) {
          updateField(itemId, { description: data.suggestion })
        }
      }
    } catch {
      // Silently fail — user can write manually
    } finally {
      setSuggestingFor(null)
    }
  }, [updateField])

  const handleFiles = useCallback(async (files: FileList) => {
    setUploading(true)
    setUploadErrors([])
    const errors: string[] = []

    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
      const videoExts = ['mp4', 'mov', 'webm', 'avi', 'm4v', 'mkv', '3gp']
      const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif']
      const isVideo = file.type.startsWith('video/') || videoExts.includes(ext)
      const isImage = file.type.startsWith('image/') || imageExts.includes(ext)
      if (!isVideo && !isImage) continue

      const maxSizeMB = isVideo ? MAX_VIDEO_SIZE_MB : MAX_IMAGE_SIZE_MB
      const maxSize = maxSizeMB * 1024 * 1024
      if (file.size > maxSize) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
        errors.push(
          isVideo
            ? t('step3.errors.videoTooLarge', { name: file.name, size: sizeMB, max: MAX_VIDEO_SIZE_MB })
            : t('step3.errors.imageTooLarge', { name: file.name, size: sizeMB, max: MAX_IMAGE_SIZE_MB })
        )
        continue
      }

      const id = `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      try {
        // Compress video before upload if > 4MB and FFmpeg is available
        let fileToUpload: File = file
        if (isVideo && file.size > 4 * 1024 * 1024 && isFFmpegSupported()) {
          let compressionActive = true
          try {
            const quality: 'low' | 'medium' | 'high' =
              file.size > 30 * 1024 * 1024 ? 'low' :
              file.size > 15 * 1024 * 1024 ? 'medium' : 'high'
            setCompressStatus(t('step3.compressingVideo', { name: file.name }))
            fileToUpload = await compressVideoFFmpeg(file, {
              maxSizeMB: 4,
              quality,
              onProgress: (msg) => { if (compressionActive) setCompressStatus(msg) },
            })
            compressionActive = false
            setCompressStatus(null)
          } catch {
            compressionActive = false
            setCompressStatus(null)
            fileToUpload = file
          }
        }

        let mediaUrl: string

        if (clientUpload) {
          // Use @vercel/blob/client upload() — handles token + XHR (Safari) + fetch (Chrome)
          setUploadProgress(0)

          const ext2 = fileToUpload.name.split('.').pop()?.toLowerCase() ?? ''
          const mimeMap: Record<string, string> = {
            mp4: 'video/mp4', mov: 'video/quicktime', webm: 'video/webm',
            m4v: 'video/x-m4v', avi: 'video/x-msvideo', '3gp': 'video/3gpp',
            jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
            gif: 'image/gif', webp: 'image/webp',
          }
          const mimeType = mimeMap[ext2] || fileToUpload.type || 'application/octet-stream'

          const { upload: blobUpload } = await import('@vercel/blob/client')
          const blob = await blobUpload(fileToUpload.name, fileToUpload, {
            access: 'public',
            handleUploadUrl: uploadEndpoint,
            contentType: mimeType,
            multipart: isVideo,
            onUploadProgress: ({ loaded, total, percentage }) => {
              void loaded; void total
              setUploadProgress(Math.min(99, Math.round(percentage)))
            },
          })

          setUploadProgress(100)
          await new Promise(r => setTimeout(r, 350))
          setUploadProgress(null)
          mediaUrl = blob.url
        } else {
          const formData = new FormData()
          formData.append('file', fileToUpload)

          const uploadRes = await fetch(uploadEndpoint, {
            method: 'POST',
            body: formData,
          })

          if (!uploadRes.ok) {
            let serverMsg = ''
            try {
              const errData = await uploadRes.json()
              serverMsg = errData.error || ''
            } catch { /* ignore */ }
            errors.push(
              serverMsg
                ? `${file.name}: ${serverMsg}`
                : t('step3.errors.uploadError', { name: file.name })
            )
            continue
          }

          const uploadData = await uploadRes.json()
          if (uploadData.duplicate && uploadData.existingMedia?.url) {
            mediaUrl = uploadData.existingMedia.url
          } else if (uploadData.url) {
            mediaUrl = uploadData.url
          } else {
            continue
          }
        }

        updateMedia(current => [...current, {
          id,
          url: mediaUrl,
          type: isVideo ? 'video' : 'image',
          fileSize: fileToUpload.size,
        }])
      } catch (err) {
        const msg = err instanceof Error ? err.message : ''
        errors.push(msg ? `${file.name}: ${msg}` : t('step3.errors.uploadError', { name: file.name }))
        setCompressStatus(null)
        setUploadProgress(null)
      }
    }

    if (errors.length > 0) setUploadErrors(errors)
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [updateMedia, t, uploadEndpoint, clientUpload])

  const removeMedia = useCallback((id: string) => {
    updateMedia(current => current.filter(m => m.id !== id))
  }, [updateMedia])

  const handleZoneChange = useCallback((id: string, value: string) => {
    if (value === CUSTOM_ZONE_VALUE) {
      updateField(id, { zoneId: undefined, customZoneName: '', customZoneIcon: 'info' })
    } else if (value === '') {
      updateField(id, { zoneId: undefined, customZoneName: undefined, customZoneIcon: undefined })
    } else {
      updateField(id, { zoneId: value, customZoneName: undefined, customZoneIcon: undefined })
    }
  }, [updateField])

  const getZoneIcon = (item: MediaItem): React.ReactNode => {
    if (item.zoneId) {
      const zone = PREDEFINED_ZONES.find(z => z.id === item.zoneId)
      if (zone) return <ZoneIcon iconName={zone.lucideIcon} className="w-4 h-4" />
    }
    if (item.customZoneIcon) {
      const customEntry = CUSTOM_ZONE_ICONS.find(i => i.id === item.customZoneIcon)
      if (customEntry) return <customEntry.Icon className="w-4 h-4" />
    }
    return <ChevronDown className="w-4 h-4" />
  }

  const getZoneLabel = (item: MediaItem): string => {
    if (item.zoneId) {
      const zone = PREDEFINED_ZONES.find(z => z.id === item.zoneId)
      return zone?.name || ''
    }
    if (item.customZoneName) return item.customZoneName
    return t('step3.selectZoneOption')
  }

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-3">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl sm:text-3xl font-bold text-gray-900"
        >
          {t('step3.title')}
        </motion.h2>
        <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base">
          {t('step3.subtitleNew')}
        </p>
      </div>

      {/* Upload area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => { fileInputRef.current?.click() }}
        className={`relative border-2 border-dashed rounded-2xl p-5 sm:p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'border-violet-400 bg-violet-50'
            : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-3">
          {uploading ? (
            <Loader2 className="w-10 h-10 text-violet-400 animate-spin" />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-violet-600/20 flex items-center justify-center">
              <Upload className="w-7 h-7 text-violet-400" />
            </div>
          )}
          <div className="w-full">
            <p className="text-base font-medium text-gray-900">
              {compressStatus || (uploadProgress !== null ? `Subiendo... ${uploadProgress}%` : uploading ? t('step3.uploading') : t('step3.dragHere'))}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {compressStatus ? t('step3.compressing') : uploadProgress !== null ? 'Subida directa a la nube' : t('step3.uploadHint')}
            </p>
            {uploadProgress !== null && (
              <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-violet-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5" /> max {MAX_IMAGE_SIZE_MB}MB
            </span>
            <span className="flex items-center gap-1">
              <Video className="w-3.5 h-3.5" /> max {MAX_VIDEO_SIZE_MB}MB
            </span>
          </div>
        </div>
      </div>

      {/* Upload errors */}
      <AnimatePresence>
        {uploadErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            {uploadErrors.map((err, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-200"
              >
                <FileWarning className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{err}</p>
                <button
                  type="button"
                  onClick={() => setUploadErrors(prev => prev.filter((_, idx) => idx !== i))}
                  className="ml-auto text-red-400 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media items list */}
      <AnimatePresence>
        {media.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4"
          >
            {/* Stats */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {media.length} {media.length === 1 ? 'archivo' : 'archivos'}
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                {videoCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Video className="w-3.5 h-3.5" /> {videoCount}
                  </span>
                )}
                {imageCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5" /> {imageCount}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onMediaChange([])}
                  className="text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 ml-2"
                >
                  <X className="w-3.5 h-3.5" />
                  Eliminar todo
                </button>
              </div>
            </div>

            {/* Media cards */}
            <div className="space-y-4">
              {media.map((item, index) => {
                const isCustomZone = !item.zoneId && item.customZoneName !== undefined
                const hasZone = !!(item.zoneId || item.customZoneName?.trim())
                const selectedZone = PREDEFINED_ZONES.find(z => z.id === item.zoneId)
                const isTemplateZone = !!selectedZone?.hasTemplate
                const hasDescription = !!item.description?.trim()
                const needsDescription = hasZone && !isTemplateZone

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white border border-gray-200 rounded-xl backdrop-blur-xl"
                    style={{ position: 'relative', zIndex: openDropdown === item.id ? 999 : 1 }}
                  >
                    {(() => {
                      const isPortrait = item.type === 'video' && portraitVideos.has(item.id)
                      const isPlaying = playingVideo === item.id
                      return (
                    <div className={`flex flex-col ${isPortrait ? '' : 'sm:flex-row'}`}>
                      {/* Preview */}
                      <div className={`relative bg-black flex-shrink-0 overflow-hidden ${
                        isPortrait
                          ? 'w-full rounded-t-xl'
                          : 'w-full sm:w-48 rounded-t-xl sm:rounded-t-none sm:rounded-l-xl'
                      }`}>
                        {/* Aspect ratio container */}
                        <div className={
                          item.type === 'video'
                            ? isPortrait
                              ? 'aspect-[9/16] max-h-80 mx-auto'
                              : 'aspect-video'
                            : isPortrait ? 'h-36' : 'h-36 sm:h-auto sm:min-h-[9rem]'
                        }>
                          {item.type === 'image' ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <>
                              <video
                                ref={(el) => { videoRefs.current[item.id] = el }}
                                src={item.url}
                                className={`w-full h-full ${isPortrait ? 'object-contain' : 'object-cover'}`}
                                muted
                                playsInline
                                preload="metadata"
                                loop
                                onLoadedMetadata={(e) => {
                                  const v = e.currentTarget
                                  if (v.videoHeight > v.videoWidth) {
                                    setPortraitVideos(prev => new Set(prev).add(item.id))
                                  }
                                }}
                                onEnded={() => setPlayingVideo(null)}
                              />
                              {/* Play/Pause overlay */}
                              <button
                                type="button"
                                onClick={() => {
                                  const vid = videoRefs.current[item.id]
                                  if (!vid) return
                                  if (isPlaying) {
                                    vid.pause()
                                    setPlayingVideo(null)
                                  } else {
                                    // Pause any other playing video
                                    if (playingVideo && videoRefs.current[playingVideo]) {
                                      videoRefs.current[playingVideo]?.pause()
                                    }
                                    vid.play()
                                    setPlayingVideo(item.id)
                                  }
                                }}
                                className={`absolute inset-0 flex items-center justify-center transition-opacity ${
                                  isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'
                                }`}
                              >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm transition-transform hover:scale-110 ${
                                  isPlaying
                                    ? 'bg-black/40'
                                    : 'bg-black/50 border border-white/20'
                                }`}>
                                  {isPlaying ? (
                                    <Pause className="w-5 h-5 text-white" />
                                  ) : (
                                    <Play className="w-5 h-5 text-white ml-0.5" />
                                  )}
                                </div>
                              </button>
                            </>
                          )}
                        </div>
                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={() => {
                            removeMedia(item.id)
                            if (playingVideo === item.id) setPlayingVideo(null)
                            delete videoRefs.current[item.id]
                          }}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors z-10"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {/* Type + size badges */}
                        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 z-10">
                          <div className="px-2 py-1 rounded-md bg-black/60 text-xs text-white flex items-center gap-1">
                            {item.type === 'video' ? <Video className="w-3 h-3" /> : <Camera className="w-3 h-3" />}
                            {item.type === 'video' ? t('step3.video') : t('step3.photo')}
                          </div>
                          {item.fileSize && (
                            <div className="px-2 py-1 rounded-md bg-black/60 text-xs text-gray-300">
                              {formatFileSize(item.fileSize)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex-1 p-4 space-y-3">
                        {/* Zone selector (custom dropdown with Lucide icons) */}
                        <div className="space-y-1.5">
                          <label className="text-xs text-gray-500 uppercase tracking-wider">
                            {t('step3.zone')}
                          </label>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setOpenDropdown(openDropdown === item.id ? null : item.id)}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-sm bg-white border rounded-lg transition-colors cursor-pointer text-left ${
                                openDropdown === item.id
                                  ? 'border-violet-500/50 ring-1 ring-violet-500/20'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <span className="text-violet-400 flex-shrink-0">{getZoneIcon(item)}</span>
                              <span className={`flex-1 truncate ${item.zoneId || isCustomZone ? 'text-gray-900' : 'text-gray-500'}`}>
                                {getZoneLabel(item)}
                              </span>
                              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openDropdown === item.id ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown menu */}
                            {openDropdown === item.id && (
                              <div
                                className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {/* Create custom zone — always visible at top */}
                                <button
                                  type="button"
                                  onClick={() => { handleZoneChange(item.id, CUSTOM_ZONE_VALUE); setOpenDropdown(null) }}
                                  className="w-full flex items-center gap-2.5 px-3 py-3 text-sm font-medium text-violet-600 hover:bg-violet-50 transition-colors border-b border-gray-200"
                                >
                                  <Plus className="w-4 h-4 flex-shrink-0" />
                                  <span>{t('step3.createNewZone')}</span>
                                </button>

                                <div className="max-h-64 overflow-y-auto">
                                {/* Template zones — hide zones already assigned to other items */}
                                {(() => {
                                  const usedZoneIds = new Set(
                                    media
                                      .filter(m => m.id !== item.id && m.zoneId)
                                      .map(m => m.zoneId)
                                  )
                                  const availableZones = PREDEFINED_ZONES.filter(z => !usedZoneIds.has(z.id))

                                  return (<>
                                <div className="px-3 py-1.5 text-[10px] text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">Zonas predefinidas</div>
                                {availableZones.map(zone => (
                                  <button
                                    key={zone.id}
                                    type="button"
                                    onClick={() => { handleZoneChange(item.id, zone.id); setOpenDropdown(null) }}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                                      item.zoneId === zone.id ? 'bg-violet-50 border-violet-500 text-violet-700' : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                  >
                                    <ZoneIcon iconName={zone.lucideIcon} className="w-4 h-4 flex-shrink-0" />
                                    <span>{zone.name}</span>
                                    {zone.hasTemplate && <span className="text-[10px] bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full ml-auto">AUTO</span>}
                                  </button>
                                ))}

                                </>)
                                })()}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Custom zone inputs */}
                        {isCustomZone && (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              {/* SVG Icon picker */}
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setOpenDropdown(openDropdown === `icon-${item.id}` ? null : `icon-${item.id}`)
                                  }}
                                  className="w-11 h-10 flex items-center justify-center bg-violet-50 border border-violet-200 rounded-lg hover:bg-violet-100 transition-colors"
                                  title="Cambiar icono"
                                >
                                  {(() => {
                                    const iconId = item.customZoneIcon || 'info'
                                    const entry = CUSTOM_ZONE_ICONS.find(i => i.id === iconId)
                                    return entry ? <entry.Icon className="w-5 h-5 text-violet-500" /> : <Info className="w-5 h-5 text-violet-500" />
                                  })()}
                                </button>
                                {openDropdown === `icon-${item.id}` && (
                                  <div
                                    className="absolute left-0 top-12 z-50 bg-white border border-violet-200 rounded-xl shadow-2xl p-2 grid grid-cols-6 gap-1"
                                    style={{ width: 200 }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {CUSTOM_ZONE_ICONS.map(({ id, Icon, label }) => (
                                      <button
                                        key={id}
                                        type="button"
                                        onClick={() => {
                                          updateField(item.id, { customZoneIcon: id })
                                          setOpenDropdown(null)
                                        }}
                                        title={label}
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                                          (item.customZoneIcon || 'info') === id
                                            ? 'bg-violet-600 text-white'
                                            : 'hover:bg-violet-100 text-violet-500'
                                        }`}
                                      >
                                        <Icon className="w-4 h-4" />
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <input
                                type="text"
                                value={item.customZoneName || ''}
                                onChange={(e) => updateField(item.id, { customZoneName: e.target.value })}
                                placeholder={t('step3.customZonePlaceholder')}
                                maxLength={100}
                                className="flex-1 px-3 py-2 text-sm bg-white border border-violet-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-100 transition-colors"
                              />
                            </div>
                          </div>
                        )}

                        {/* Template zone preview OR description textarea for custom zones */}
                        {isTemplateZone ? (
                          <div className="rounded-lg bg-violet-50 border border-violet-200 overflow-hidden">
                            <div className="px-3 py-2 bg-violet-100 flex items-center gap-2">
                              <span className="text-violet-600">{selectedZone && <ZoneIcon iconName={selectedZone.lucideIcon} className="w-4 h-4" />}</span>
                              <span className="text-sm font-medium text-violet-700">{selectedZone?.name}</span>
                              <span className="text-[10px] bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full ml-auto">AUTO</span>
                            </div>
                            <div className="px-3 py-2.5">
                              <p className="text-xs text-gray-400 leading-relaxed">
                                {t(`step3.templateHints.${item.zoneId}`)}
                              </p>
                              <p className="text-[11px] text-violet-600 mt-1.5 flex items-center gap-1">
                                {item.type === 'video' ? <Video className="w-3 h-3" /> : <Camera className="w-3 h-3" />}
                                {t('step3.templateMediaNote')}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-xs text-gray-500 uppercase tracking-wider">
                                {t('step3.descriptionLabel')}
                                <span className="text-gray-400 normal-case ml-1">(opcional)</span>
                              </label>
                              {(() => {
                                const suggestName = isCustomZone ? item.customZoneName?.trim() : selectedZone?.name
                                return suggestName ? (
                                  <button
                                    type="button"
                                    onClick={() => suggestDescription(item.id, suggestName)}
                                    disabled={suggestingFor === item.id}
                                    className="flex items-center gap-1 text-xs text-violet-500 hover:text-violet-600 transition-colors disabled:opacity-50"
                                  >
                                    {suggestingFor === item.id ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Sparkles className="w-3 h-3" />
                                    )}
                                    {suggestingFor === item.id ? 'Generando...' : 'Sugerir con IA'}
                                  </button>
                                ) : null
                              })()}
                            </div>
                            <textarea
                              value={item.description || ''}
                              onChange={(e) => updateField(item.id, { description: e.target.value })}
                              placeholder={isCustomZone ? `Ej: instrucciones de uso, ubicación, cómo funciona...` : t('step3.descriptionPlaceholder')}
                              rows={3}
                              maxLength={1000}
                              className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-colors resize-none"
                            />
                            <p className="text-xs text-gray-500 flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3 text-violet-400 flex-shrink-0" />
                              {t('step3.aiDescriptionHint')}
                            </p>
                          </div>
                        )}

                        {/* Completeness indicator */}
                        {!hasZone ? (
                          <p className="text-xs text-amber-600 flex items-center gap-1">
                            <span>!</span> {t('step3.selectZoneHint')}
                          </p>
                        ) : needsDescription && !hasDescription ? (
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-violet-400" /> La IA generará el contenido automáticamente
                          </p>
                        ) : (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <span>&#10003;</span> {t('step3.fieldComplete')}
                          </p>
                        )}
                      </div>
                    </div>
                      )
                    })()}
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tip when no media */}
      {media.length === 0 && !uploading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-violet-50 border border-violet-100 rounded-xl p-5 space-y-2"
        >
          <div className="flex items-center gap-2 text-violet-700">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">{t('step3.tip')}</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            {t('step3.tipTextNew')}
          </p>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex items-center gap-3 sm:gap-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="h-12 sm:h-14 px-4 sm:px-6 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden sm:inline">{t('step3.back')}</span>
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={uploading || (media.length > 0 && !allMediaComplete)}
          className={`flex-1 h-12 sm:h-14 rounded-xl text-base sm:text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
            uploading || (media.length > 0 && !allMediaComplete)
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/25'
          }`}
        >
          {uploading
            ? t('step3.uploading')
            : media.length === 0
              ? t('step3.continueNoMedia')
              : !allMediaComplete
                ? 'Asigna una zona a cada archivo'
                : t('step3.continueWith', { count: media.length })
          }
          {!uploading && <ChevronRight className="w-5 h-5" />}
          {uploading && <Loader2 className="w-5 h-5 animate-spin" />}
        </button>
      </div>
    </motion.div>
  )
}
