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
  // Template zones (auto-generated from wizard steps)
  { id: 'checkin', name: 'Check-in', lucideIcon: 'key', icon: 'key', hasTemplate: true, group: 'template' },
  { id: 'ac', name: 'Aire Acondicionado', lucideIcon: 'snowflake', icon: 'snowflake', hasTemplate: true, group: 'template' },
  // Electrodomésticos comunes
  { id: 'washing_machine', name: 'Lavadora', lucideIcon: 'shirt', icon: 'washing-machine', hasTemplate: false, group: 'appliance' },
  { id: 'dishwasher', name: 'Lavavajillas', lucideIcon: 'utensils', icon: 'dishwasher', hasTemplate: false, group: 'appliance' },
  { id: 'coffee_machine', name: 'Cafetera', lucideIcon: 'coffee', icon: 'coffee', hasTemplate: false, group: 'appliance' },
  { id: 'induction_hob', name: 'Vitrocerámica', lucideIcon: 'flame', icon: 'cooktop', hasTemplate: false, group: 'appliance' },
  { id: 'oven', name: 'Horno', lucideIcon: 'flame', icon: 'oven', hasTemplate: false, group: 'appliance' },
  { id: 'microwave', name: 'Microondas', lucideIcon: 'flame', icon: 'microwave', hasTemplate: false, group: 'appliance' },
  { id: 'television', name: 'Smart TV', lucideIcon: 'tv', icon: 'tv', hasTemplate: false, group: 'appliance' },
  { id: 'dryer', name: 'Secadora', lucideIcon: 'wind', icon: 'wind', hasTemplate: false, group: 'appliance' },
  { id: 'heater', name: 'Calefacción', lucideIcon: 'thermometer', icon: 'thermometer', hasTemplate: false, group: 'appliance' },
  { id: 'safe', name: 'Caja Fuerte', lucideIcon: 'lock', icon: 'lock', hasTemplate: false, group: 'appliance' },
  // Espacios
  { id: 'pool', name: 'Piscina', lucideIcon: 'waves', icon: 'waves', hasTemplate: false, group: 'space' },
  { id: 'terrace', name: 'Terraza', lucideIcon: 'umbrella', icon: 'umbrella', hasTemplate: false, group: 'space' },
  { id: 'garden', name: 'Jardín', lucideIcon: 'tree-pine', icon: 'trees', hasTemplate: false, group: 'space' },
  { id: 'bbq', name: 'Barbacoa', lucideIcon: 'flame', icon: 'flame', hasTemplate: false, group: 'space' },
  { id: 'jacuzzi', name: 'Jacuzzi', lucideIcon: 'bath', icon: 'bath', hasTemplate: false, group: 'space' },
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

interface Step2MediaProps {
  media: MediaItem[]
  onMediaChange: (media: MediaItem[]) => void
  onNext: () => void
  onBack: () => void
  uploadEndpoint?: string
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
}: Step2MediaProps) {
  const { t } = useTranslation('ai-setup')
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [compressStatus, setCompressStatus] = useState<string | null>(null)
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
      const isVideo = file.type.startsWith('video/')
      const isImage = file.type.startsWith('image/')
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
        let mediaUrl: string
        if (uploadData.duplicate && uploadData.existingMedia?.url) {
          mediaUrl = uploadData.existingMedia.url
        } else if (uploadData.url) {
          mediaUrl = uploadData.url
        } else {
          continue
        }

        updateMedia(current => [...current, {
          id,
          url: mediaUrl,
          type: isVideo ? 'video' : 'image',
          fileSize: fileToUpload.size,
        }])
      } catch {
        errors.push(t('step3.errors.uploadError', { name: file.name }))
        setCompressStatus(null)
      }
    }

    if (errors.length > 0) setUploadErrors(errors)
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [updateMedia, t, uploadEndpoint])

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
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-5 sm:p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'border-violet-400 bg-violet-500/10'
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
          <div>
            <p className="text-base font-medium text-gray-900">
              {compressStatus || (uploading ? t('step3.uploading') : t('step3.dragHere'))}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {compressStatus ? t('step3.compressing') : t('step3.uploadHint')}
            </p>
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
                className="flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20"
              >
                <FileWarning className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{err}</p>
                <button
                  type="button"
                  onClick={() => setUploadErrors(prev => prev.filter((_, idx) => idx !== i))}
                  className="ml-auto text-red-400 hover:text-red-300"
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
                  className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 ml-2"
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
                                  className="w-full flex items-center gap-2.5 px-3 py-3 text-sm font-medium text-violet-400 hover:bg-violet-500/10 transition-colors border-b border-gray-200"
                                >
                                  <Plus className="w-4 h-4 flex-shrink-0" />
                                  <span>{t('step3.createNewZone')}</span>
                                </button>

                                <div className="max-h-64 overflow-y-auto">
                                {/* Template zones */}
                                <div className="px-3 py-1.5 text-[10px] text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">Zonas del wizard</div>
                                {PREDEFINED_ZONES.filter(z => z.group === 'template').map(zone => (
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
                                    {zone.hasTemplate && <span className="text-[10px] bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded-full ml-auto">AUTO</span>}
                                  </button>
                                ))}

                                {/* Appliance zones */}
                                <div className="px-3 py-1.5 text-[10px] text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0 border-t border-gray-200">Electrodomésticos</div>
                                {PREDEFINED_ZONES.filter(z => z.group === 'appliance').map(zone => (
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
                                  </button>
                                ))}

                                {/* Space zones */}
                                <div className="px-3 py-1.5 text-[10px] text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0 border-t border-gray-200">Espacios</div>
                                {PREDEFINED_ZONES.filter(z => z.group === 'space').map(zone => (
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
                                  </button>
                                ))}

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
                                  className="w-11 h-10 flex items-center justify-center bg-violet-500/10 border border-violet-500/30 rounded-lg hover:bg-violet-500/20 transition-colors"
                                  title="Cambiar icono"
                                >
                                  {(() => {
                                    const iconId = item.customZoneIcon || 'info'
                                    const entry = CUSTOM_ZONE_ICONS.find(i => i.id === iconId)
                                    return entry ? <entry.Icon className="w-5 h-5 text-violet-300" /> : <Info className="w-5 h-5 text-violet-300" />
                                  })()}
                                </button>
                                {openDropdown === `icon-${item.id}` && (
                                  <div
                                    className="absolute left-0 top-12 z-50 bg-white border border-violet-500/30 rounded-xl shadow-2xl p-2 grid grid-cols-6 gap-1"
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
                                            : 'hover:bg-violet-500/20 text-violet-300'
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
                                className="flex-1 px-3 py-2 text-sm bg-violet-500/10 border border-violet-500/30 rounded-lg text-violet-200 placeholder-violet-400/50 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-colors"
                              />
                            </div>
                          </div>
                        )}

                        {/* Template zone preview OR description textarea for custom zones */}
                        {isTemplateZone ? (
                          <div className="rounded-lg bg-violet-500/5 border border-violet-500/30 overflow-hidden">
                            <div className="px-3 py-2 bg-violet-500/10 flex items-center gap-2">
                              <span className="text-violet-400">{selectedZone && <ZoneIcon iconName={selectedZone.lucideIcon} className="w-4 h-4" />}</span>
                              <span className="text-sm font-medium text-violet-300">{selectedZone?.name}</span>
                              <span className="text-[10px] bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded-full ml-auto">AUTO</span>
                            </div>
                            <div className="px-3 py-2.5">
                              <p className="text-xs text-gray-400 leading-relaxed">
                                {t(`step3.templateHints.${item.zoneId}`)}
                              </p>
                              <p className="text-[11px] text-violet-400 mt-1.5 flex items-center gap-1">
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
                                    className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors disabled:opacity-50"
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
                          <p className="text-xs text-amber-400/70 flex items-center gap-1">
                            <span>!</span> {t('step3.selectZoneHint')}
                          </p>
                        ) : needsDescription && !hasDescription ? (
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-violet-400" /> La IA generará el contenido automáticamente
                          </p>
                        ) : (
                          <p className="text-xs text-green-400/70 flex items-center gap-1">
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
          className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-5 space-y-2"
        >
          <div className="flex items-center gap-2 text-violet-300">
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
