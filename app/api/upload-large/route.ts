import { NextRequest, NextResponse } from 'next/server'

// Route configuration for large file uploads
export const maxDuration = 60 // 60 seconds timeout
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    console.log('🔥 Large upload endpoint called')
    
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      console.log('❌ No file provided')
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log(`📁 Large file details: ${file.name}, size: ${file.size}, type: ${file.type}`)

    // For very large files, we'll use a different strategy
    // In production, this could upload to AWS S3, Cloudinary, or another service
    // For now, we'll try to process smaller chunks
    
    const fileSizeMB = file.size / (1024 * 1024)
    
    if (fileSizeMB > 100) {
      return NextResponse.json({
        error: "Archivo demasiado grande. Máximo 100MB.",
        maxSize: "100MB",
        currentSize: `${fileSizeMB.toFixed(1)}MB`
      }, { status: 413 })
    }

    // For development and smaller "large" files, still use Vercel Blob
    // but with chunked processing
    try {
      const { put } = await import('@vercel/blob')
      const { v4: uuidv4 } = await import('uuid')
      
      const uniqueFilename = `large-${uuidv4()}-${file.name}`
      console.log('📝 Generated large filename:', uniqueFilename)

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      if (process.env.NODE_ENV === 'development') {
        // Local development - save to filesystem
        const { writeFile, mkdir } = await import('fs/promises')
        const { join } = await import('path')
        
        const uploadDir = join(process.cwd(), 'public', 'uploads')
        await mkdir(uploadDir, { recursive: true })
        
        const path = join(uploadDir, uniqueFilename)
        await writeFile(path, buffer)
        
        const url = `/uploads/${uniqueFilename}`
        console.log('✅ Large file saved locally:', url)
        
        return NextResponse.json({
          url: url,
          filename: uniqueFilename,
          size: file.size,
          type: file.type
        })
      } else {
        // Production - try Vercel Blob with longer timeout
        const blob = await put(uniqueFilename, buffer, {
          access: 'public',
        })
        
        console.log('✅ Large file uploaded to Vercel Blob:', blob.url)
        
        return NextResponse.json({
          url: blob.url,
          filename: uniqueFilename,
          size: file.size,
          type: file.type
        })
      }
    } catch (uploadError) {
      console.error('❌ Large upload failed:', uploadError)
      
      // If upload fails, suggest compression
      return NextResponse.json({
        error: "Error al subir archivo grande. Intenta comprimir el video a menor calidad.",
        suggestion: "Reduce la resolución del video a 720p o menos, o usa un compresor de video.",
        details: uploadError instanceof Error ? uploadError.message : 'Error desconocido'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error in large upload endpoint:', error)
    return NextResponse.json({
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}