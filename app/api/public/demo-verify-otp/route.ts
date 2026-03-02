import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { checkRateLimit, getRateLimitKey } from '../../../../src/lib/rate-limit'
import { generateDemoVerificationToken } from '../../../../src/lib/demo-otp'

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limit by IP: 20 verifications per hour
    const ipKey = getRateLimitKey(request, null, 'demo-verify-ip')
    const ipCheck = checkRateLimit(ipKey, {
      maxRequests: 20,
      windowMs: 60 * 60 * 1000,
    })
    if (!ipCheck.allowed) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Espera un momento.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { email, code } = body

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email y código requeridos.' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()
    const normalizedCode = code.trim()

    // 2. Find valid (non-expired) OTP for this email
    const otp = await prisma.demoOtp.findFirst({
      where: {
        email: normalizedEmail,
        expiresAt: { gt: new Date() },
        verified: false,
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!otp) {
      return NextResponse.json(
        { error: 'Código expirado o no encontrado. Solicita uno nuevo.' },
        { status: 400 }
      )
    }

    // 3. Check max attempts (5)
    if (otp.attempts >= 5) {
      // Delete the OTP — force re-send
      await prisma.demoOtp.delete({ where: { id: otp.id } })
      return NextResponse.json(
        { error: 'Demasiados intentos fallidos. Solicita un nuevo código.', forceResend: true },
        { status: 429 }
      )
    }

    // 4. Increment attempts
    await prisma.demoOtp.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    })

    // 5. Check code
    if (otp.code !== normalizedCode) {
      const remaining = 4 - otp.attempts // already incremented above
      return NextResponse.json(
        {
          error: remaining > 0
            ? `Código incorrecto. Te quedan ${remaining} intento${remaining !== 1 ? 's' : ''}.`
            : 'Código incorrecto. Solicita un nuevo código.',
          forceResend: remaining <= 0,
        },
        { status: 400 }
      )
    }

    // 6. Mark as verified
    await prisma.demoOtp.update({
      where: { id: otp.id },
      data: { verified: true },
    })

    // 7. Generate signed verification token
    const verificationToken = generateDemoVerificationToken(normalizedEmail)

    return NextResponse.json({
      success: true,
      verificationToken,
    })
  } catch (error) {
    console.error('[demo-verify-otp] Error:', error)
    return NextResponse.json(
      { error: 'Error interno. Inténtalo de nuevo.' },
      { status: 500 }
    )
  }
}
