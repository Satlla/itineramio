import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // For development, we'll store images in the public directory
    // In production, you should use a cloud storage service
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const uniqueFilename = `${uuidv4()}-${file.name}`
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    
    // Create uploads directory if it doesn't exist
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    const path = join(uploadDir, uniqueFilename)
    await writeFile(path, buffer)

    // Return the public URL
    const url = `/uploads/${uniqueFilename}`

    return NextResponse.json({ 
      success: true,
      url,
      filename: uniqueFilename
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: "Error uploading file" },
      { status: 500 }
    )
  }
}