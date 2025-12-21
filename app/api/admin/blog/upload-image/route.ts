import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { requireAdminAuth } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminOrResponse = await requireAdminAuth(request)
    if (adminOrResponse instanceof Response) {
      return adminOrResponse
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP and GIF are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Upload to Vercel Blob
    const blob = await put(`blog/${Date.now()}-${file.name}`, file, {
      access: 'public',
    })

    return NextResponse.json({
      success: true,
      url: blob.url
    })

  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { error: 'Error uploading image' },
      { status: 500 }
    )
  }
}
