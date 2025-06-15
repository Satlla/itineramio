import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Generate unique filename
    const uniqueFilename = `${uuidv4()}-${file.name}`

    // For local development, use filesystem
    if (process.env.NODE_ENV === 'development') {
      const { writeFile, mkdir } = await import('fs/promises')
      const { join } = await import('path')
      
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const uploadDir = join(process.cwd(), 'public', 'uploads')
      
      try {
        await mkdir(uploadDir, { recursive: true })
      } catch (error) {
        // Directory might already exist
      }

      const path = join(uploadDir, uniqueFilename)
      await writeFile(path, buffer)
      
      return NextResponse.json({ 
        success: true,
        url: `/uploads/${uniqueFilename}`,
        filename: uniqueFilename
      })
    }

    // For production, use Vercel Blob
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN environment variable is not set')
      return NextResponse.json(
        { error: "Blob storage not configured" },
        { status: 500 }
      )
    }

    const blob = await put(uniqueFilename, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    return NextResponse.json({ 
      success: true,
      url: blob.url,
      filename: uniqueFilename
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Upload failed: ${error.message}` },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: "Error uploading file" },
      { status: 500 }
    )
  }
}