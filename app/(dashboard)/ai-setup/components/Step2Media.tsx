'use client'

import React, { useState, useRef, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { compressVideoFFmpeg, isFFmpegSupported } from '../../../../src/utils/ffmpegCompression'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  Camera,
  Image as ImageIcon,
  Video,
  CheckCircle,
  Loader2,
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  AlertCircle,
  FileWarning,
  Pencil,
  Plus,
  ChevronDown,
} from 'lucide-react'

export interface MediaItem {
  id: string
  url: string
  type: 'image' | 'video'
  analyzing: boolean
  category?: string // user-selected or AI-detected category
  caption?: string
  customZoneName?: string // Nombre libre para zonas personalizadas
  fileSize?: number // bytes
  analysis?: {
    room_type: string
    appliances: Array<{
      detected_label: string
      canonical_type: string
      confidence: number
    }>
    description: string
    confidence: number
    primary_item?: string | null
    zone?: string
    items?: string[]
  }
  error?: string
}

interface Step2MediaProps {
  media: MediaItem[]
  onMediaChange: (media: MediaItem[]) => void
  onNext: () => void
  onBack: () => void
  uploadEndpoint?: string   // default: '/api/upload'
  analyzeEndpoint?: string  // default: '/api/ai-setup/analyze-media'
}

// Category definitions (emojis only — labels come from i18n)
const CATEGORY_DEFS = [
  { id: 'entrance', emoji: '🔑', key: 'entrance' },
  { id: 'check_out', emoji: '🚪', key: 'checkOut' },
  { id: 'wifi', emoji: '📶', key: 'wifi' },
  { id: 'kitchen', emoji: '🍳', key: 'kitchen' },
  { id: 'tv', emoji: '📺', key: 'tv' },
  { id: 'ac', emoji: '🌡️', key: 'ac' },
  { id: 'washing_machine', emoji: '🧺', key: 'washingMachine' },
  { id: 'dishwasher', emoji: '🍽️', key: 'dishwasher' },
  { id: 'microwave', emoji: '📡', key: 'microwave' },
  { id: 'bathroom', emoji: '🚿', key: 'bathroom' },
  { id: 'parking', emoji: '🚗', key: 'parking' },
  { id: 'pool', emoji: '🏊', key: 'pool' },
  { id: 'coffee', emoji: '☕', key: 'coffee' },
  { id: 'bedroom', emoji: '🛏️', key: 'bedrooms' },
  { id: 'living_room', emoji: '🛋️', key: 'livingRoom' },
  { id: 'terrace', emoji: '🌳', key: 'terrace' },
  { id: 'other', emoji: '📋', key: 'other' },
  { id: 'custom', emoji: '✏️', key: 'custom' },
] as const

// Map AI room_type/appliance to our category IDs
const ROOM_TYPE_TO_CATEGORY: Record<string, string> = {
  kitchen: 'kitchen',
  bathroom: 'bathroom',
  bedroom: 'bedroom',
  living_room: 'living_room',
  dining_room: 'living_room',
  laundry: 'washing_machine',
  entrance: 'entrance',
  terrace: 'terrace',
  garden: 'terrace',
  balcony: 'terrace',
  pool: 'pool',
  garage: 'parking',
  parking: 'parking',
  office: 'living_room',
  gym: 'other',
  exterior: 'terrace',
}

const APPLIANCE_TO_CATEGORY: Record<string, string> = {
  // Canonical types from zone-registry (what vision returns)
  washing_machine: 'washing_machine',
  dryer: 'washing_machine',
  dishwasher: 'dishwasher',
  microwave: 'microwave',
  oven: 'kitchen',
  induction_hob: 'kitchen',
  coffee_machine: 'coffee',
  television: 'tv',
  air_conditioning: 'ac',
  heater: 'ac',
  refrigerator: 'kitchen',
  toaster: 'kitchen',
  kettle: 'kitchen',
  iron: 'other',
  safe: 'other',
  // Aliases (in case vision returns non-canonical names)
  smart_tv: 'tv',
  tv: 'tv',
  stove: 'kitchen',
  induction: 'kitchen',
  espresso_machine: 'coffee',
  heating: 'ac',
  thermostat: 'ac',
  hair_dryer: 'bathroom',
}

const MAX_VIDEO_SIZE_MB = 50
const MAX_IMAGE_SIZE_MB = 20

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// getCategoryLabel is now defined inside the component (needs t())

/** Derive a category from AI analysis result */
function detectCategory(analysis: MediaItem['analysis']): string | undefined {
  if (!analysis) return undefined

  // Priority 0: primary_item (most specific — the main focus of the media)
  // Skip if it maps to 'other' — that's too generic, let room_type decide
  if (analysis.primary_item) {
    const cat = APPLIANCE_TO_CATEGORY[analysis.primary_item]
    if (cat && cat !== 'other') return cat
  }

  // Try appliances first (more specific)
  if (analysis.appliances?.length) {
    for (const app of analysis.appliances) {
      const cat = APPLIANCE_TO_CATEGORY[app.canonical_type]
      if (cat) return cat
    }
  }

  // Try room type
  if (analysis.room_type) {
    const cat = ROOM_TYPE_TO_CATEGORY[analysis.room_type]
    if (cat) return cat
  }

  return 'other'
}

export default function Step2Media({ media, onMediaChange, onNext, onBack, uploadEndpoint = '/api/upload', analyzeEndpoint = '/api/ai-setup/analyze-media' }: Step2MediaProps) {
  const { t } = useTranslation('ai-setup')

  const CATEGORIES = useMemo(() =>
    CATEGORY_DEFS.map(def => ({
      id: def.id,
      emoji: def.emoji,
      label: t(`step3.categories.${def.key}`),
    })),
  [t])

  const getCategoryLabel = useCallback((catId: string): { emoji: string; label: string } => {
    const cat = CATEGORIES.find(c => c.id === catId)
    return cat || { emoji: '📋', label: catId }
  }, [CATEGORIES])

  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [compressStatus, setCompressStatus] = useState<string | null>(null)
  const [uploadErrors, setUploadErrors] = useState<string[]>([])
  const [pendingCategory, setPendingCategory] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const categoryInputRef = useRef<HTMLInputElement>(null)
  const mediaRef = useRef<MediaItem[]>(media)
  mediaRef.current = media

  const analyzedCount = media.filter(m => m.analysis && !m.analyzing).length
  const analyzingCount = media.filter(m => m.analyzing).length
  const videoCount = media.filter(m => m.type === 'video').length
  const imageCount = media.filter(m => m.type === 'image').length

  // Count media per category
  const categoryCounts = media.reduce<Record<string, number>>((acc, m) => {
    const cat = m.category || 'uncategorized'
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {})

  const updateMedia = useCallback((updater: (current: MediaItem[]) => MediaItem[]) => {
    const updated = updater(mediaRef.current)
    mediaRef.current = updated
    onMediaChange(updated)
  }, [onMediaChange])

  const updateCaption = useCallback((id: string, caption: string) => {
    updateMedia(current =>
      current.map(m => m.id === id ? { ...m, caption } : m)
    )
  }, [updateMedia])

  const updateCategory = useCallback((id: string, category: string) => {
    updateMedia(current =>
      current.map(m => m.id === id ? { ...m, category, ...(category !== 'custom' ? { customZoneName: undefined } : {}) } : m)
    )
  }, [updateMedia])

  const updateCustomZoneName = useCallback((id: string, customZoneName: string) => {
    updateMedia(current =>
      current.map(m => m.id === id ? { ...m, customZoneName } : m)
    )
  }, [updateMedia])

  const analyzeMedia = useCallback(async (item: MediaItem, videoFrames?: string[]) => {
    try {
      // Build request body: frames[] for videos, mediaUrl+type for images
      const body = videoFrames && videoFrames.length > 0
        ? { frames: videoFrames }
        : { mediaUrl: item.url, type: item.type }

      const res = await fetch(analyzeEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const errorText = await res.text().catch(() => '')
        updateMedia(current =>
          current.map(m =>
            m.id === item.id
              ? { ...m, analyzing: false, error: t('step3.errors.serverError', { status: res.status, text: errorText.slice(0, 100) }) }
              : m
          )
        )
        return
      }

      const data = await res.json()

      if (data.success) {
        const analysis = data.data
        const detectedCat = detectCategory(analysis)
        updateMedia(current =>
          current.map(m => {
            if (m.id !== item.id) return m
            return {
              ...m,
              analyzing: false,
              analysis,
              // Only auto-assign category if user didn't pre-select one
              category: m.category || detectedCat || 'other',
            }
          })
        )
      } else {
        updateMedia(current =>
          current.map(m =>
            m.id === item.id
              ? { ...m, analyzing: false, error: data.error || t('step3.errors.analysisFailed') }
              : m
          )
        )
      }
    } catch (err) {
      console.error('[Step2] Analysis error:', err)
      updateMedia(current =>
        current.map(m =>
          m.id === item.id
            ? { ...m, analyzing: false, error: t('step3.errors.connectionError') }
            : m
        )
      )
    }
  }, [updateMedia, t, analyzeEndpoint])

  const handleFiles = useCallback(async (files: FileList, forCategory?: string | null) => {
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
          try {
            const quality: 'low' | 'medium' | 'high' = file.size > 30 * 1024 * 1024 ? 'low' : file.size > 15 * 1024 * 1024 ? 'medium' : 'high'
            setCompressStatus(t('step3.compressingVideo', { name: file.name }))
            fileToUpload = await compressVideoFFmpeg(file, {
              maxSizeMB: 4,
              quality,
              onProgress: (msg) => setCompressStatus(msg),
            })
            setCompressStatus(null)
          } catch (compressErr) {
            console.warn('[Step2] Video compression failed, uploading original:', compressErr)
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
          console.error('Upload failed:', uploadRes.status)
          errors.push(t('step3.errors.uploadError', { name: file.name }))
          continue
        }

        const uploadData = await uploadRes.json()

        let mediaUrl: string
        if (uploadData.duplicate && uploadData.existingMedia?.url) {
          mediaUrl = uploadData.existingMedia.url
        } else if (uploadData.url) {
          mediaUrl = uploadData.url
        } else {
          console.error('Upload returned no URL:', uploadData)
          continue
        }

        const item: MediaItem = {
          id,
          url: mediaUrl,
          type: isVideo ? 'video' : 'image',
          analyzing: true,
          fileSize: fileToUpload.size,
          // Pre-assign category if user clicked a specific category chip
          category: forCategory || undefined,
        }

        updateMedia(current => [...current, item])

        // For videos, extract 3 frames client-side (25%, 50%, 75%) and send as base64 to the API
        // This works everywhere (including Vercel) — no FFmpeg needed
        if (isVideo) {
          extractVideoFrames(file).then(frames => {
            if (frames.length > 0) {
              console.log(`[Step2] Extracted ${frames.length} frames from video, sending to API`)
              analyzeMedia(item, frames)
            } else {
              // Frame extraction failed — fall back to server-side analysis
              console.warn('[Step2] Client frame extraction failed, falling back to server')
              analyzeMedia(item)
            }
          })
        } else {
          analyzeMedia(item)
        }
      } catch (err) {
        console.error('Upload error:', err)
        errors.push(t('step3.errors.uploadError', { name: file.name }))
      }
    }

    if (errors.length > 0) setUploadErrors(errors)
    setUploading(false)
    setPendingCategory(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (categoryInputRef.current) categoryInputRef.current.value = ''
  }, [analyzeMedia, updateMedia, t, uploadEndpoint])

  const removeMedia = useCallback((id: string) => {
    updateMedia(current => current.filter(m => m.id !== id))
  }, [updateMedia])

  // Click a category chip → open file picker with that category pre-set
  const handleCategoryClick = (catId: string) => {
    setPendingCategory(catId)
    // Small delay to ensure state is set before file input triggers
    setTimeout(() => {
      categoryInputRef.current?.click()
    }, 0)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files, null) // No pre-assigned category
    }
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
          className="text-2xl sm:text-3xl font-bold text-white"
        >
          {t('step3.title')}
        </motion.h2>
        <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base">
          {t('step3.subtitleBefore')}
          <span className="text-violet-400 font-medium">{t('step3.subtitleHighlight')}</span>
          {t('step3.subtitleAfter')}
        </p>
      </div>

      {/* Category chips — clickable to upload directly into a category */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <p className="text-xs text-gray-500 uppercase tracking-wider text-center">
          {t('step3.selectZone')}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {CATEGORIES.filter(c => c.id !== 'other' && c.id !== 'custom').map((cat) => {
            const count = categoryCounts[cat.id] || 0
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all duration-200 ${
                  count > 0
                    ? 'bg-violet-600/20 border border-violet-500/40 text-violet-300 hover:bg-violet-600/30'
                    : 'bg-gray-800/80 border border-gray-700/50 text-gray-400 hover:bg-gray-700/80 hover:text-gray-200 hover:border-gray-600'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
                {count > 0 && (
                  <span className="ml-1 w-5 h-5 rounded-full bg-violet-500/30 text-violet-300 text-xs flex items-center justify-center font-medium">
                    {count}
                  </span>
                )}
                {count === 0 && (
                  <Plus className="w-3.5 h-3.5 ml-0.5 opacity-50" />
                )}
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Hidden file input for category-specific uploads */}
      <input
        ref={categoryInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files, pendingCategory)
        }}
        className="hidden"
      />

      {/* General upload area (drag & drop / click — auto-detect category) */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-5 sm:p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'border-violet-400 bg-violet-500/10'
            : 'border-gray-700 bg-gray-900/40 hover:border-gray-600 hover:bg-gray-900/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={(e) => e.target.files && handleFiles(e.target.files, null)}
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
            <p className="text-base font-medium text-white">
              {compressStatus ? compressStatus : uploading ? t('step3.uploading') : t('step3.dragHere')}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {compressStatus ? t('step3.compressing') : t('step3.autoDetect')}
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

      {/* Media items grid */}
      <AnimatePresence>
        {media.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">
                {analyzedCount} {t('step3.analyzedOf')} {media.length} {t('step3.analyzed')}
                {analyzingCount > 0 && (
                  <span className="ml-2 text-violet-400">
                    ({analyzingCount} {t('step3.analyzing')})
                  </span>
                )}
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
                <Sparkles className="w-4 h-4 text-violet-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {media.map((item, index) => {
                const catInfo = getCategoryLabel(item.category || 'other')
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative bg-gray-900/80 border border-gray-800 rounded-xl overflow-hidden backdrop-blur-xl"
                  >
                    {/* Media preview */}
                    <div className="relative h-40 bg-gray-800">
                      {item.type === 'image' ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.url}
                          alt={item.caption || ''}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={item.url}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                          preload="metadata"
                        />
                      )}

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeMedia(item.id) }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* Type badge + file size */}
                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
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

                    {/* Analysis result + category + caption */}
                    <div className="p-4 space-y-3">
                      {item.analyzing ? (
                        <div className="flex items-center gap-3">
                          <Loader2 className="w-5 h-5 text-violet-400 animate-spin flex-shrink-0" />
                          <div>
                            <p className="text-sm text-gray-300">{t('step3.analyzingAI')}</p>
                            <p className="text-xs text-gray-500">{t('step3.detectingZone')}</p>
                          </div>
                        </div>
                      ) : item.error ? (
                        <div className="flex items-center gap-3">
                          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                          <p className="text-sm text-red-400">{item.error}</p>
                        </div>
                      ) : item.analysis ? (
                        <div className="space-y-2">
                          {/* Detected items */}
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                            <span className="text-xs text-gray-400">
                              {t('step3.detected')} <span className="text-gray-200">{item.analysis.description || (item.analysis.room_type || '').replace(/_/g, ' ')}</span>
                            </span>
                          </div>
                          {/* Detected appliances as chips */}
                          {(() => {
                            const items = item.analysis.appliances
                              ? item.analysis.appliances.map(a => a.detected_label)
                              : item.analysis.items || []
                            return items.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {items.slice(0, 4).map((it, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-300 text-xs"
                                  >
                                    {it}
                                  </span>
                                ))}
                                {items.length > 4 && (
                                  <span className="px-2 py-0.5 rounded-full bg-gray-700 text-gray-400 text-xs">
                                    +{items.length - 4}
                                  </span>
                                )}
                              </div>
                            ) : null
                          })()}
                        </div>
                      ) : null}

                      {/* Category selector — always visible once analysis is done */}
                      {!item.analyzing && (
                        <div className="relative">
                          <span className="absolute left-2.5 top-2 text-sm pointer-events-none">{catInfo.emoji}</span>
                          <select
                            value={item.category || 'other'}
                            onChange={(e) => updateCategory(item.id, e.target.value)}
                            className="w-full pl-8 pr-8 py-2 text-sm bg-gray-800/80 border border-gray-700/50 rounded-lg text-gray-200 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-colors appearance-none cursor-pointer"
                          >
                            {CATEGORIES.map(cat => (
                              <option key={cat.id} value={cat.id}>
                                {cat.emoji} {cat.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>
                      )}

                      {/* Custom zone name input — shown when "Personalizado" is selected */}
                      {!item.analyzing && item.category === 'custom' && (
                        <input
                          type="text"
                          value={item.customZoneName || ''}
                          onChange={(e) => updateCustomZoneName(item.id, e.target.value)}
                          placeholder={t('step3.customZonePlaceholder')}
                          maxLength={100}
                          className="w-full px-3 py-2 text-sm bg-violet-500/10 border border-violet-500/30 rounded-lg text-violet-200 placeholder-violet-400/50 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-colors"
                        />
                      )}

                      {/* Caption field */}
                      {!item.analyzing && (
                        <div className="relative">
                          <Pencil className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                          <input
                            type="text"
                            value={item.caption || ''}
                            onChange={(e) => updateCaption(item.id, e.target.value)}
                            placeholder={
                              item.type === 'image'
                                ? t('step3.describeImage')
                                : t('step3.describeVideo')
                            }
                            maxLength={200}
                            className="w-full pl-8 pr-3 py-2 text-sm bg-gray-800/80 border border-gray-700/50 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-colors"
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Helpful tip when no media uploaded */}
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
            {t('step3.tipText')}
          </p>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex items-center gap-3 sm:gap-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="h-12 sm:h-14 px-4 sm:px-6 rounded-xl border border-gray-700 text-gray-300 font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden sm:inline">{t('step3.back')}</span>
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={analyzingCount > 0}
          className={`flex-1 h-12 sm:h-14 rounded-xl text-base sm:text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
            analyzingCount > 0
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/25'
          }`}
        >
          {analyzingCount > 0
            ? t('step3.analyzingFiles', { count: analyzingCount })
            : media.length === 0
              ? t('step3.continueNoMedia')
              : t('step3.continueWith', { count: media.length })
          }
          {analyzingCount === 0 && <ChevronRight className="w-5 h-5" />}
          {analyzingCount > 0 && <Loader2 className="w-5 h-5 animate-spin" />}
        </button>
      </div>
    </motion.div>
  )
}

/**
 * Extract multiple frames from a video at different positions (25%, 50%, 75%).
 * Returns an array of base64 data URLs (JPEG). Works client-side in all browsers, no FFmpeg.
 * Frames are scaled down to max 1280px wide to keep request size reasonable.
 */
function extractVideoFrames(file: File, positions = [0.25, 0.50, 0.75]): Promise<string[]> {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.preload = 'auto'
    video.muted = true
    video.playsInline = true

    const url = URL.createObjectURL(file)
    video.src = url

    const frames: string[] = []
    let currentIdx = 0
    let resolved = false

    const finish = () => {
      if (resolved) return
      resolved = true
      URL.revokeObjectURL(url)
      resolve(frames)
    }

    const captureFrame = () => {
      if (resolved) return
      try {
        const maxW = 1280
        const scale = Math.min(1, maxW / video.videoWidth)
        const w = Math.round(video.videoWidth * scale)
        const h = Math.round(video.videoHeight * scale)

        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(video, 0, 0, w, h)
          frames.push(canvas.toDataURL('image/jpeg', 0.8))
        }
      } catch (err) {
        console.warn('[extractFrames] Error capturing frame:', err)
      }

      currentIdx++
      if (currentIdx < positions.length) {
        video.currentTime = video.duration * positions[currentIdx]
      } else {
        finish()
      }
    }

    video.onseeked = captureFrame

    video.onloadeddata = () => {
      if (video.duration && video.duration > 0) {
        video.currentTime = video.duration * positions[0]
      } else {
        finish()
      }
    }

    video.onerror = () => finish()

    // Safety timeout — 20 seconds max
    setTimeout(finish, 20000)
  })
}
