export interface ChunkedUploadOptions {
  file: File
  chunkSize?: number // Default 1MB chunks
  onProgress?: (progress: number) => void
  onChunkComplete?: (chunkIndex: number, totalChunks: number) => void
}

export async function uploadFileInChunks({
  file,
  chunkSize = 1024 * 1024, // 1MB chunks
  onProgress,
  onChunkComplete
}: ChunkedUploadOptions): Promise<{ url: string; filename: string }> {
  const totalChunks = Math.ceil(file.size / chunkSize)
  const uploadId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  console.log(`📤 Starting chunked upload: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) in ${totalChunks} chunks`)

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize
    const end = Math.min(start + chunkSize, file.size)
    const chunk = file.slice(start, end)
    
    const formData = new FormData()
    formData.append('chunk', chunk)
    formData.append('chunkIndex', i.toString())
    formData.append('totalChunks', totalChunks.toString())
    formData.append('fileName', file.name)
    formData.append('uploadId', uploadId)
    
    try {
      const response = await fetch('/api/upload-chunked', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error(`Chunk ${i + 1} upload failed`)
      }
      
      const result = await response.json()
      
      // Update progress
      const progress = ((i + 1) / totalChunks) * 100
      onProgress?.(progress)
      onChunkComplete?.(i + 1, totalChunks)
      
      console.log(`📦 Chunk ${i + 1}/${totalChunks} uploaded (${progress.toFixed(0)}%)`)
      
      // If this was the last chunk, return the complete file URL
      if (result.complete) {
        return {
          url: result.url,
          filename: result.filename
        }
      }
    } catch (error) {
      console.error(`Failed to upload chunk ${i + 1}:`, error)
      throw error
    }
  }
  
  throw new Error('Upload completed but no URL received')
}