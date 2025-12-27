export interface ChunkedUploadOptions {
  file: File
  chunkSize?: number // Default 1MB chunks
  onProgress?: (progress: number) => void
  onChunkComplete?: (chunkIndex: number, totalChunks: number) => void
  maxRetries?: number
}

// Helper function for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Upload with retry logic
async function uploadChunkWithRetry(
  formData: FormData,
  chunkIndex: number,
  maxRetries: number
): Promise<Response> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Clone formData for each attempt since it can only be consumed once
      const clonedFormData = new FormData()
      formData.forEach((value, key) => {
        clonedFormData.append(key, value)
      })

      const response = await fetch('/api/upload-chunked', {
        method: 'POST',
        body: clonedFormData
      })

      if (response.ok) {
        return response
      }

      // If we get a 5xx error, retry
      if (response.status >= 500 && attempt < maxRetries) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000) // Exponential backoff, max 10s
        console.log(`⚠️ Chunk ${chunkIndex + 1} failed (${response.status}), retrying in ${waitTime}ms... (attempt ${attempt + 1}/${maxRetries + 1})`)
        await delay(waitTime)
        continue
      }

      throw new Error(`HTTP ${response.status}`)
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt < maxRetries) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000)
        console.log(`⚠️ Chunk ${chunkIndex + 1} error: ${lastError.message}, retrying in ${waitTime}ms... (attempt ${attempt + 1}/${maxRetries + 1})`)
        await delay(waitTime)
      }
    }
  }

  throw lastError || new Error('Upload failed after retries')
}

export async function uploadFileInChunks({
  file,
  chunkSize = 1024 * 1024, // 1MB chunks
  onProgress,
  onChunkComplete,
  maxRetries = 3
}: ChunkedUploadOptions): Promise<{ url: string; filename: string }> {
  const totalChunks = Math.ceil(file.size / chunkSize)
  const uploadId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  console.log(`📤 Starting chunked upload: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) in ${totalChunks} chunks`)

  // For single chunk files, use direct upload to avoid serverless issues
  if (totalChunks === 1) {
    console.log('📦 Single chunk file, using direct upload')
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'video')

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Direct upload failed')
    }

    const result = await response.json()
    onProgress?.(100)
    onChunkComplete?.(1, 1)

    return {
      url: result.url,
      filename: file.name
    }
  }

  // For multi-chunk files, we'll upload all chunks and combine on the server
  // Using a larger chunk size to reduce number of requests
  const effectiveChunkSize = Math.max(chunkSize, Math.ceil(file.size / 5)) // Max 5 chunks
  const effectiveTotalChunks = Math.ceil(file.size / effectiveChunkSize)

  console.log(`📦 Adjusted to ${effectiveTotalChunks} chunks of ${(effectiveChunkSize / 1024 / 1024).toFixed(2)}MB each`)

  for (let i = 0; i < effectiveTotalChunks; i++) {
    const start = i * effectiveChunkSize
    const end = Math.min(start + effectiveChunkSize, file.size)
    const chunk = file.slice(start, end)

    const formData = new FormData()
    formData.append('chunk', chunk)
    formData.append('chunkIndex', i.toString())
    formData.append('totalChunks', effectiveTotalChunks.toString())
    formData.append('fileName', file.name)
    formData.append('uploadId', uploadId)

    try {
      const response = await uploadChunkWithRetry(formData, i, maxRetries)
      const result = await response.json()

      // Update progress
      const progress = ((i + 1) / effectiveTotalChunks) * 100
      onProgress?.(progress)
      onChunkComplete?.(i + 1, effectiveTotalChunks)

      console.log(`📦 Chunk ${i + 1}/${effectiveTotalChunks} uploaded (${progress.toFixed(0)}%)`)

      // If this was the last chunk, return the complete file URL
      if (result.complete) {
        return {
          url: result.url,
          filename: result.filename
        }
      }
    } catch (error) {
      console.error(`Failed to upload chunk ${i + 1} after ${maxRetries + 1} attempts:`, error)
      throw new Error(`Chunk ${i + 1} upload failed after multiple retries`)
    }
  }

  throw new Error('Upload completed but no URL received')
}