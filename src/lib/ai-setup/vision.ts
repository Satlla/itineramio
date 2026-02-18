/**
 * Claude Vision helpers for AI Setup wizard.
 * Analyzes property photos/videos to identify rooms and appliances
 * using structured canonical types.
 *
 * Optimizations:
 * - Uses Haiku (10x cheaper than Sonnet) — this is a simple classification task
 * - Videos: extracts 3 frames instead of 1, sends all in a single multi-image request
 * - Images: single frame, one API call
 */

import path from 'path'
import fs from 'fs'
import { CANONICAL_APPLIANCE_TYPES, CANONICAL_ROOM_TYPES, normalizeAppliance, type CanonicalApplianceType } from './zone-registry'

// ============================================
// TYPES
// ============================================

export interface DetectedAppliance {
  detected_label: string
  canonical_type: CanonicalApplianceType
  confidence: number
}

export interface MediaAnalysisResult {
  room_type: string
  appliances: DetectedAppliance[]
  description: string
  confidence: number
  primary_item?: string | null
  /** User-assigned category from Step2Media (e.g. 'entrance', 'kitchen'). Set by normalizeMediaInput. */
  userCategory?: string
}

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''

// Use Haiku for vision — 10x cheaper than Sonnet, plenty capable for classification
const VISION_MODEL = 'claude-haiku-4-5-20251001'

// ============================================
// IMAGE READING
// ============================================

async function readImageAsBase64(imageUrl: string): Promise<{ base64: string; mediaType: string }> {
  // Local development: /uploads/filename.jpg → read from public/uploads/
  if (imageUrl.startsWith('/uploads/')) {
    const filePath = path.join(process.cwd(), 'public', imageUrl)
    if (!fs.existsSync(filePath)) {
      throw new Error(`Local file not found: ${filePath}`)
    }
    const buffer = fs.readFileSync(filePath)
    const ext = path.extname(filePath).toLowerCase()
    const mimeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    }
    return {
      base64: buffer.toString('base64'),
      mediaType: mimeMap[ext] || 'image/jpeg',
    }
  }

  // Remote URL (Vercel Blob or other)
  console.log('[vision] Fetching remote image:', imageUrl)
  const response = await fetch(imageUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch image (${response.status}): ${imageUrl}`)
  }
  const buffer = Buffer.from(await response.arrayBuffer())
  const rawContentType = response.headers.get('content-type') || 'image/jpeg'
  const contentType = rawContentType.split(';')[0].trim()
  const mediaType = contentType.startsWith('image/') ? contentType : 'image/jpeg'

  return {
    base64: buffer.toString('base64'),
    mediaType,
  }
}

// ============================================
// VISION PROMPT (structured canonical output)
// ============================================

const VISION_PROMPT = `Analyze this image of a vacation rental property. You MUST respond with ONLY valid JSON (no markdown fences, no explanation).

Identify:
1. What room/area this is
2. What specific appliances are visible (map each to a canonical type)
3. The PRIMARY ITEM — the main subject/appliance the photo is focused on (if any)

ROOM TYPES (use exactly one):
${CANONICAL_ROOM_TYPES.join(', ')}

APPLIANCE TYPES (use these canonical types):
${CANONICAL_APPLIANCE_TYPES.join(', ')}

Response format:
{
  "room_type": "kitchen",
  "primary_item": "induction_hob",
  "appliances": [
    {"detected_label": "Bosch induction cooktop", "canonical_type": "induction_hob", "confidence": 0.92},
    {"detected_label": "Nespresso Vertuo", "canonical_type": "coffee_machine", "confidence": 0.95}
  ],
  "description": "Modern kitchen with white countertops and full equipment",
  "confidence": 0.95
}

Rules:
- primary_item: the canonical_type of the appliance that is the MAIN FOCUS of the image. If the photo is a close-up or tutorial of a specific appliance, set primary_item to its canonical_type. If it's a general room photo with no specific focus, set primary_item to null.
- Only include appliances you can actually SEE in the image
- If an appliance doesn't match any canonical type, use the closest one
- Set confidence based on how clearly you can identify the item
- description should be 1 sentence describing the room/area
- For rooms without visible appliances, return an empty appliances array`

const VISION_PROMPT_MULTI_FRAME = `Analyze these frames from a video of a vacation rental property. They show different moments of the same room/area. You MUST respond with ONLY valid JSON (no markdown fences, no explanation).

Look at ALL frames together to identify:
1. What room/area this is
2. What specific appliances are visible across all frames (map each to a canonical type)
3. The PRIMARY ITEM — the main subject/appliance the video is demonstrating (if any)

ROOM TYPES (use exactly one):
${CANONICAL_ROOM_TYPES.join(', ')}

APPLIANCE TYPES (use these canonical types):
${CANONICAL_APPLIANCE_TYPES.join(', ')}

Response format:
{
  "room_type": "kitchen",
  "primary_item": "microwave",
  "appliances": [
    {"detected_label": "Bosch induction cooktop", "canonical_type": "induction_hob", "confidence": 0.92},
    {"detected_label": "Nespresso Vertuo", "canonical_type": "coffee_machine", "confidence": 0.95}
  ],
  "description": "Modern kitchen with white countertops and full equipment",
  "confidence": 0.95
}

Rules:
- primary_item: the canonical_type of the appliance that is the MAIN FOCUS of the video. If the video demonstrates or focuses on a specific appliance, set primary_item to its canonical_type. If it's a general room tour with no specific focus, set primary_item to null.
- Combine information from ALL frames to get a complete picture
- Only include appliances you can actually SEE in at least one frame
- If an appliance doesn't match any canonical type, use the closest one
- Set confidence based on how clearly you can identify the item
- description should be 1 sentence describing the room/area
- For rooms without visible appliances, return an empty appliances array`

// ============================================
// CALL CLAUDE VISION API
// ============================================

async function callVision(
  imageContents: Array<{ base64: string; mediaType: string }>,
  prompt: string,
): Promise<MediaAnalysisResult> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured')
  }

  // Build message content: images + text prompt
  const content: any[] = []
  for (const img of imageContents) {
    content.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: img.mediaType,
        data: img.base64,
      },
    })
  }
  content.push({ type: 'text', text: prompt })

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: VISION_MODEL,
      max_tokens: 1024,
      temperature: 0.2,
      messages: [{ role: 'user', content }],
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'unknown')
    console.error('[vision] Claude API error:', response.status, errorBody.slice(0, 200))
    throw new Error(`Claude Vision API error ${response.status}: ${errorBody.slice(0, 200)}`)
  }

  const data = await response.json()
  const text = data.content?.[0]?.text

  if (!text) {
    throw new Error('Empty response from Claude Vision API')
  }

  console.log('[vision] Raw response:', text.slice(0, 300))

  const jsonStr = text.replace(/```json\s*\n?/g, '').replace(/```\s*$/g, '').trim()
  const parsed = JSON.parse(jsonStr)

  return normalizeVisionResponse(parsed)
}

// ============================================
// ANALYZE IMAGE (single frame)
// ============================================

export async function analyzeImage(imageUrl: string): Promise<MediaAnalysisResult> {
  console.log('[vision] Analyzing image:', imageUrl)

  const img = await readImageAsBase64(imageUrl)
  console.log('[vision] Image loaded, size:', Math.round(img.base64.length / 1024), 'KB, type:', img.mediaType)

  const result = await callVision([img], VISION_PROMPT)
  console.log('[vision] Result:', result.room_type, '| appliances:', result.appliances.length)

  return result
}

// ============================================
// ANALYZE VIDEO (multi-frame)
// ============================================

export async function analyzeVideo(videoUrl: string): Promise<MediaAnalysisResult> {
  // If the client already sent a thumbnail (image URL), analyze as single image
  if (videoUrl.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i) || videoUrl.includes('thumb-')) {
    console.log('[vision] Video thumbnail detected, analyzing as image:', videoUrl)
    return analyzeImage(videoUrl)
  }

  console.log('[vision] Extracting multiple frames from video:', videoUrl)

  try {
    const frames = await extractVideoFrames(videoUrl, 3)

    if (frames.length === 0) {
      throw new Error('No frames extracted from video')
    }

    console.log('[vision] Extracted', frames.length, 'frames, sending to Claude')

    const images = frames.map(f => ({ base64: f, mediaType: 'image/jpeg' }))
    const prompt = frames.length > 1 ? VISION_PROMPT_MULTI_FRAME : VISION_PROMPT
    const result = await callVision(images, prompt)

    console.log('[vision] Video result:', result.room_type, '| appliances:', result.appliances.length)
    return result
  } catch (err) {
    console.error('[vision] Multi-frame extraction failed:', (err as Error).message)
    // FFmpeg not available (Vercel) or other error — return a low-confidence placeholder
    // The user can manually assign the category in the UI
    console.warn('[vision] Returning placeholder result for video — user should assign category manually')
    return {
      room_type: 'other',
      appliances: [],
      description: 'Video could not be analyzed automatically. Please assign category manually.',
      confidence: 0.1,
    }
  }
}

// ============================================
// ANALYZE FRAMES (client-extracted base64 data URLs)
// ============================================

/**
 * Analyze frames extracted client-side from a video.
 * Accepts base64 data URLs (e.g. "data:image/jpeg;base64,...") directly.
 * No FFmpeg needed — works on Vercel.
 */
export async function analyzeFrames(dataUrls: string[]): Promise<MediaAnalysisResult> {
  if (!dataUrls || dataUrls.length === 0) {
    throw new Error('No frames provided')
  }

  console.log('[vision] Analyzing', dataUrls.length, 'client-extracted frames')

  const images = dataUrls.map(dataUrl => {
    // Parse "data:image/jpeg;base64,/9j/4AAQ..." format
    const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/)
    if (!match) {
      throw new Error('Invalid data URL format — expected data:image/...;base64,...')
    }
    return {
      base64: match[2],
      mediaType: match[1],
    }
  })

  const prompt = images.length > 1 ? VISION_PROMPT_MULTI_FRAME : VISION_PROMPT
  const result = await callVision(images, prompt)

  console.log('[vision] Frames result:', result.room_type, '| appliances:', result.appliances.length)
  return result
}

// ============================================
// EXTRACT VIDEO FRAMES (using FFmpeg)
// ============================================

async function extractVideoFrames(videoUrl: string, count: number): Promise<string[]> {
  const ffmpeg = require('fluent-ffmpeg') as any
  const ffmpegPath = (require('@ffmpeg-installer/ffmpeg') as any).path
  const os = require('os')

  ffmpeg.setFfmpegPath(ffmpegPath as string)

  // Download video to tmp
  let videoBuffer: Buffer
  if (videoUrl.startsWith('/uploads/')) {
    const filePath = path.join(process.cwd(), 'public', videoUrl)
    videoBuffer = fs.readFileSync(filePath)
  } else {
    const response = await fetch(videoUrl)
    if (!response.ok) throw new Error(`Failed to fetch video: ${response.status}`)
    videoBuffer = Buffer.from(await response.arrayBuffer())
  }

  const tmpDir = os.tmpdir()
  const videoTmpPath = path.join(tmpDir, `ai-setup-video-${Date.now()}.mp4`)
  fs.writeFileSync(videoTmpPath, videoBuffer)

  // Get video duration
  const duration = await new Promise<number>((resolve, reject) => {
    ffmpeg.ffprobe(videoTmpPath, (err: any, data: any) => {
      if (err) {
        resolve(10) // Default to 10 seconds if probe fails
      } else {
        resolve(data.format?.duration || 10)
      }
    })
  })

  // Extract frames at 15%, 50%, 85% of the video
  const timestamps = count === 1
    ? [Math.max(1, duration * 0.25)]
    : [
        Math.max(0.5, duration * 0.15),
        Math.max(1, duration * 0.50),
        Math.max(1.5, duration * 0.85),
      ].slice(0, count)

  const frames: string[] = []

  for (let i = 0; i < timestamps.length; i++) {
    const framePath = path.join(tmpDir, `ai-setup-frame-${Date.now()}-${i}.jpg`)

    try {
      await new Promise<void>((resolve, reject) => {
        ffmpeg(videoTmpPath)
          .seekInput(timestamps[i])
          .frames(1)
          .outputOptions(['-q:v', '2']) // High quality JPEG
          .output(framePath)
          .on('end', () => resolve())
          .on('error', (err: any) => reject(new Error(`FFmpeg error: ${err.message}`)))
          .run()
      })

      if (fs.existsSync(framePath)) {
        const frameBuffer = fs.readFileSync(framePath)
        frames.push(frameBuffer.toString('base64'))
        try { fs.unlinkSync(framePath) } catch (_) {}
      }
    } catch (err) {
      console.warn(`[vision] Frame extraction at ${timestamps[i]}s failed:`, err)
    }
  }

  // Clean up video tmp file
  try { fs.unlinkSync(videoTmpPath) } catch (_) {}

  return frames
}

// ============================================
// NORMALIZE VISION RESPONSE
// ============================================

function normalizeVisionResponse(raw: any): MediaAnalysisResult {
  // Handle old format (zone + items) for backward compatibility
  if (raw.zone && !raw.room_type) {
    return convertLegacyFormat(raw)
  }

  const roomType = CANONICAL_ROOM_TYPES.includes(raw.room_type)
    ? raw.room_type
    : guessRoomType(raw.room_type || 'other')

  const appliances: DetectedAppliance[] = []

  if (Array.isArray(raw.appliances)) {
    for (const app of raw.appliances) {
      // Validate canonical type, fallback to synonym normalization
      let canonicalType = CANONICAL_APPLIANCE_TYPES.includes(app.canonical_type)
        ? app.canonical_type
        : normalizeAppliance(app.detected_label || app.canonical_type || '')

      if (canonicalType) {
        appliances.push({
          detected_label: app.detected_label || canonicalType,
          canonical_type: canonicalType,
          confidence: typeof app.confidence === 'number' ? app.confidence : 0.7,
        })
      }
    }
  }

  // Extract primary_item: validate it's a known canonical type, fallback to first appliance
  let primaryItem: string | null = null
  if (raw.primary_item && CANONICAL_APPLIANCE_TYPES.includes(raw.primary_item)) {
    primaryItem = raw.primary_item
  } else if (raw.primary_item) {
    // Try normalizing the value
    const normalized = normalizeAppliance(raw.primary_item)
    if (normalized) primaryItem = normalized
  }
  // Fallback: if no primary_item but there's exactly one appliance, use it
  if (!primaryItem && appliances.length === 1) {
    primaryItem = appliances[0].canonical_type
  }

  return {
    room_type: roomType,
    appliances,
    description: raw.description || '',
    confidence: typeof raw.confidence === 'number' ? raw.confidence : 0.8,
    primary_item: primaryItem,
  }
}

function guessRoomType(raw: string): string {
  const lower = raw.toLowerCase()
  const map: Record<string, string> = {
    kitchen: 'kitchen',
    cocina: 'kitchen',
    bathroom: 'bathroom',
    baño: 'bathroom',
    bedroom: 'bedroom',
    dormitorio: 'bedroom',
    living: 'living_room',
    lounge: 'living_room',
    salon: 'living_room',
    salón: 'living_room',
    entrance: 'entrance',
    entrada: 'entrance',
    hallway: 'entrance',
    hall: 'entrance',
    terrace: 'terrace',
    terraza: 'terrace',
    patio: 'terrace',
    balcony: 'balcony',
    garden: 'garden',
    yard: 'garden',
    pool: 'pool',
    piscina: 'pool',
    parking: 'parking',
    garage: 'parking',
    laundry: 'laundry',
    utility: 'laundry',
    dining: 'dining_room',
    comedor: 'dining_room',
    office: 'office',
    study: 'office',
    gym: 'gym',
    exterior: 'exterior',
    outside: 'exterior',
    facade: 'exterior',
    flooring: 'living_room',
  }

  for (const [key, value] of Object.entries(map)) {
    if (lower.includes(key)) return value
  }

  return 'living_room'
}

/**
 * Convert old Vision format {zone, items[]} to new format {room_type, appliances[]}
 */
function convertLegacyFormat(raw: any): MediaAnalysisResult {
  const roomType = guessRoomType(raw.zone || 'other')
  const appliances: DetectedAppliance[] = []

  if (Array.isArray(raw.items)) {
    for (const item of raw.items) {
      const canonical = normalizeAppliance(item)
      if (canonical) {
        appliances.push({
          detected_label: item,
          canonical_type: canonical,
          confidence: raw.confidence || 0.8,
        })
      }
    }
  }

  return {
    room_type: roomType,
    appliances,
    description: raw.description || '',
    confidence: raw.confidence || 0.8,
  }
}
