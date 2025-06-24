import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    console.log('🔥 Upload endpoint called')
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      console.log('❌ No file provided')
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log(`📁 File details: ${file.name}, size: ${file.size}, type: ${file.type}`)

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      console.log('❌ File too large:', file.size)
      return NextResponse.json({ error: "File too large. Maximum 50MB." }, { status: 400 })
    }

    // Generate unique filename
    const uniqueFilename = `${uuidv4()}-${file.name}`
    console.log('📝 Generated filename:', uniqueFilename)

    // For local development, use filesystem with better error handling
    if (process.env.NODE_ENV === 'development') {
      console.log('💻 Development mode: saving to filesystem')
      const { writeFile, mkdir } = await import('fs/promises')
      const { join } = await import('path')
      
      try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const uploadDir = join(process.cwd(), 'public', 'uploads')
        
        console.log('📂 Upload directory:', uploadDir)
        
        try {
          await mkdir(uploadDir, { recursive: true })
          console.log('✅ Directory created/verified')
        } catch (error) {
          console.log('⚠️ Directory creation error (might already exist):', error)
        }

        const path = join(uploadDir, uniqueFilename)
        console.log('💾 Writing file to:', path)
        
        await writeFile(path, buffer)
        console.log('✅ File written successfully')
        
        return NextResponse.json({ 
          success: true,
          url: `/uploads/${uniqueFilename}`,
          filename: uniqueFilename
        })
      } catch (devError) {
        console.error('❌ Development upload error:', devError)
        return NextResponse.json(
          { error: `Development upload failed: ${devError instanceof Error ? devError.message : 'Unknown error'}` },
          { status: 500 }
        )
      }
    }

    // For production, use Vercel Blob
    console.log('🔧 Checking Vercel Blob configuration...')
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN
    if (!blobToken) {
      console.error('❌ BLOB_READ_WRITE_TOKEN environment variable is not set')
      return NextResponse.json(
        { error: "Blob storage not configured" },
        { status: 500 }
      )
    }
    console.log('✅ Blob token found, proceeding with upload')

    const blob = await put(uniqueFilename, file, {
      access: 'public',
      token: blobToken,
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