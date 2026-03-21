import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { getAuthUser } from '../../../../src/lib/auth'
import { checkRateLimit, getRateLimitKey } from '../../../../src/lib/rate-limit'

const UPLOAD_RATE_LIMIT = {
  maxRequests: 10,
  windowMs: 60 * 1000
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const rateLimitKey = getRateLimitKey(request, null, 'support-upload')
    const rateLimitResult = checkRateLimit(rateLimitKey, UPLOAD_RATE_LIMIT)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const email = formData.get('email') as string | null

    // Check auth OR email
    const user = await getAuthUser(request)
    if (!user && !email) {
      return NextResponse.json(
        { error: 'Authentication or email is required' },
        { status: 401 }
      )
    }

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type (images only)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP and GIF are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Upload to Vercel Blob
    const blob = await put(`support/${Date.now()}-${file.name}`, file, {
      access: 'public',
    })

    return NextResponse.json({
      success: true,
      url: blob.url,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    )
  }
}
