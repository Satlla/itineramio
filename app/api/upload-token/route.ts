import { NextRequest, NextResponse } from 'next/server'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'itineramio-secret-key-2024'

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Check authentication
  const token = request.cookies.get('auth-token')?.value
  if (!token) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let userId: string
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    userId = decoded.userId
  } catch (error) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
  }

  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Validate file type
        const extension = pathname.split('.').pop()?.toLowerCase()
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'webm']

        if (!extension || !allowedExtensions.includes(extension)) {
          throw new Error(`Tipo de archivo no permitido: .${extension}`)
        }

        return {
          allowedContentTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'video/mp4',
            'video/quicktime',
            'video/webm'
          ],
          maximumSizeInBytes: 100 * 1024 * 1024, // 100MB
          tokenPayload: JSON.stringify({
            userId,
          }),
        }
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('✅ Client upload completed:', blob.url)

        // Optionally save to media library
        try {
          const { userId } = JSON.parse(tokenPayload || '{}')
          if (userId) {
            const { prisma } = await import('../../../src/lib/prisma')
            const { createHash } = await import('crypto')

            const mediaType = blob.contentType?.startsWith('image/') ? 'image' : 'video'

            // Generate hash from URL + size (can't access file content in callback)
            const hashSource = `${blob.url}-${blob.size}-${Date.now()}`
            const hash = createHash('sha256').update(hashSource).digest('hex')

            await prisma.mediaLibrary.create({
              data: {
                userId: userId,
                type: mediaType,
                url: blob.url,
                filename: blob.pathname,
                originalName: blob.pathname.split('/').pop() || blob.pathname,
                mimeType: blob.contentType || 'application/octet-stream',
                size: blob.size,
                hash: hash,
                usageCount: 1,
                isPublic: false,
                lastUsedAt: new Date()
              }
            })
            console.log('✅ Media saved to library with hash:', hash.substring(0, 16))
          }
        } catch (error) {
          console.error('⚠️ Error saving to media library:', error)
          // Don't fail the upload if media library save fails
        }
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    console.error('❌ Upload token error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error generando token de upload' },
      { status: 400 }
    )
  }
}
