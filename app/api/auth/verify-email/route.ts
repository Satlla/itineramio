import { NextRequest, NextResponse } from 'next/server'
import { EmailVerificationService } from '../../../../src/lib/auth-email'
import { prisma } from '../../../../src/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set')
}

/**
 * Transfer a demo property to the newly verified user.
 * Returns the propertyId if transfer was successful, null otherwise.
 */
async function claimDemoProperty(userId: string, userEmail: string): Promise<string | null> {
  try {
    // 1. Check notificationPreferences for demoPropertyId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { notificationPreferences: true }
    })

    const prefs = (user?.notificationPreferences as Record<string, unknown>) || {}
    let propertyId = prefs.demoPropertyId as string | undefined

    // 2. Fallback: find Lead with same email and source='demo', get propertyId from metadata
    if (!propertyId) {
      const lead = await prisma.lead.findFirst({
        where: { email: userEmail, source: 'demo' },
        orderBy: { createdAt: 'desc' },
        select: { metadata: true }
      })
      const leadMeta = (lead?.metadata as Record<string, unknown>) || {}
      propertyId = leadMeta.propertyId as string | undefined
    }

    if (!propertyId) return null

    // 3. Find the demo property (must still be isDemoPreview=true)
    const property = await prisma.property.findFirst({
      where: { id: propertyId, isDemoPreview: true }
    })

    if (!property) return null

    // 4. Transfer ownership
    await prisma.property.update({
      where: { id: propertyId },
      data: {
        hostId: userId,
        isDemoPreview: false,
        demoExpiresAt: null,
        status: 'DRAFT',
      }
    })

    // 5. Clean demoPropertyId from notificationPreferences
    if (prefs.demoPropertyId) {
      const { demoPropertyId: _, ...cleanPrefs } = prefs
      await prisma.user.update({
        where: { id: userId },
        data: { notificationPreferences: cleanPrefs as Record<string, unknown> as any }
      })
    }

    return propertyId
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(
        new URL('/login?error=Token faltante', request.url)
      )
    }

    const result = await EmailVerificationService.verifyEmailToken(token)

    if (!result.success) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(result.error || 'Error de verificación')}`, request.url)
      )
    }

    // Get user info and create session
    if (result.email) {
      const user = await prisma.user.findUnique({
        where: { email: result.email },
        select: { id: true, name: true, email: true }
      })

      if (user) {
        // Send welcome email (don't await to avoid blocking the response)
        EmailVerificationService.sendWelcomeEmail(user.email, user.name).catch(() => {})

        // Attempt to transfer demo property to the new user
        const claimedPropertyId = await claimDemoProperty(user.id, user.email)

        // Create JWT token for automatic login
        const token = jwt.sign(
          { userId: user.id },
          JWT_SECRET as string,
          { expiresIn: '24h' }
        )

        // Redirect to dashboard with login cookie and welcome flag
        const redirectUrl = claimedPropertyId
          ? `/main?welcome=true&demoClaimed=${claimedPropertyId}`
          : '/main?welcome=true'
        const response = NextResponse.redirect(
          new URL(redirectUrl, request.url)
        )
        
        response.cookies.set('auth-token', token, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          maxAge: 30 * 24 * 60 * 60,
          path: '/'
        })
        
        return response
      }
    }

    // Fallback redirect to login
    return NextResponse.redirect(
      new URL('/login?verified=true', request.url)
    )
  } catch (error) {
    return NextResponse.redirect(
      new URL('/login?error=Error de verificación', request.url)
    )
  }
}

// Optional: Add endpoint to resend verification email
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      )
    }

    // Check if user exists and is not verified
    const user = await prisma.user.findUnique({
      where: { email },
      select: { name: true, emailVerified: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email ya verificado' },
        { status: 400 }
      )
    }

    // Resend verification email
    await EmailVerificationService.sendVerificationEmail(email, user.name)

    return NextResponse.json({
      message: 'Email de verificación enviado'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}