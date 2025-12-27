import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// Store chunks temporarily
const chunks: { [key: string]: Buffer[] } = {}

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const chunk = data.get('chunk') as File
    const chunkIndex = parseInt(data.get('chunkIndex') as string)
    const totalChunks = parseInt(data.get('totalChunks') as string)
    const fileName = data.get('fileName') as string
    const uploadId = data.get('uploadId') as string

    if (!chunk || chunkIndex === undefined || !totalChunks || !fileName || !uploadId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Initialize chunks array for this upload if not exists
    if (!chunks[uploadId]) {
      chunks[uploadId] = new Array(totalChunks)
    }

    // Store chunk
    const bytes = await chunk.arrayBuffer()
    chunks[uploadId][chunkIndex] = Buffer.from(bytes)

    console.log(`📦 Received chunk ${chunkIndex + 1}/${totalChunks} for ${fileName}`)

    // Check if all chunks received
    const receivedChunks = chunks[uploadId].filter(c => c !== undefined).length
    
    if (receivedChunks === totalChunks) {
      // Combine all chunks
      const completeFile = Buffer.concat(chunks[uploadId])
      
      // Upload to Vercel Blob or save locally
      if (process.env.NODE_ENV === 'development') {
        const uploadDir = join(process.cwd(), 'public', 'uploads')
        if (!existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true })
        }
        
        const filePath = join(uploadDir, `${uploadId}-${fileName}`)
        await writeFile(filePath, completeFile)
        
        // Clean up chunks
        delete chunks[uploadId]
        
        return NextResponse.json({
          url: `/uploads/${uploadId}-${fileName}`,
          filename: fileName,
          complete: true
        })
      } else {
        // Production: Upload to Vercel Blob
        const blob = await put(`${uploadId}-${fileName}`, completeFile, {
          access: 'public',
        })
        
        // Clean up chunks
        delete chunks[uploadId]
        
        return NextResponse.json({
          url: blob.url,
          filename: fileName,
          complete: true
        })
      }
    }

    // Not all chunks received yet
    return NextResponse.json({
      success: true,
      message: `Chunk ${chunkIndex + 1}/${totalChunks} received`,
      progress: (receivedChunks / totalChunks) * 100
    })

  } catch (error) {
    console.error('Chunked upload error:', error)
    return NextResponse.json({
      error: 'Chunked upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Cleanup old chunks periodically
export async function GET() {
  const now = Date.now()
  const timeout = 5 * 60 * 1000 // 5 minutes
  
  Object.keys(chunks).forEach(uploadId => {
    // Simple cleanup - in production use timestamps
    delete chunks[uploadId]
  })
  
  return NextResponse.json({ message: 'Cleanup complete' })
}