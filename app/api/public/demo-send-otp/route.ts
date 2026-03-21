import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { checkRateLimit, getRateLimitKey } from '../../../../src/lib/rate-limit'
import { validateEmail } from '../../../../src/utils/email-validation'
import { generateOtpCode } from '../../../../src/lib/demo-otp'
import { sendEmail, emailTemplates } from '../../../../src/lib/email'

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limit by IP: 10 OTP sends per hour
    const ipKey = getRateLimitKey(request, null, 'demo-otp-ip')
    const ipCheck = checkRateLimit(ipKey, {
      maxRequests: 10,
      windowMs: 60 * 60 * 1000,
    })
    if (!ipCheck.allowed) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Espera un momento antes de volver a intentarlo.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { email, name } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email requerido.' },
        { status: 400 }
      )
    }

    // 2. Validate email format + disposable
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { error: emailValidation.error || 'Email no válido.' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // 3. Rate limit by email: 3 OTP sends per hour
    const emailKey = `demo-otp-email:${normalizedEmail}`
    const emailCheck = checkRateLimit(emailKey, {
      maxRequests: 3,
      windowMs: 60 * 60 * 1000,
    })
    if (!emailCheck.allowed) {
      return NextResponse.json(
        { error: 'Has solicitado demasiados códigos. Espera unos minutos.' },
        { status: 429 }
      )
    }

    // 4. Check demo generation limit: max 2 demos per email in 24h
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentDemos = await prisma.lead.count({
      where: {
        email: normalizedEmail,
        source: 'demo',
        createdAt: { gte: twentyFourHoursAgo },
      },
    })
    if (recentDemos >= 2) {
      return NextResponse.json(
        { error: 'Ya has generado el máximo de demos permitidos hoy. Vuelve mañana.' },
        { status: 429 }
      )
    }

    // 5. Delete previous OTPs for this email
    await prisma.demoOtp.deleteMany({
      where: { email: normalizedEmail },
    })

    // 6. Generate and store OTP
    const code = generateOtpCode()
    await prisma.demoOtp.create({
      data: {
        email: normalizedEmail,
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    })

    // 7. Send email with OTP code (in dev without Resend, log to console)
    const isDev = process.env.NODE_ENV === 'development'
    const hasResend = !!process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'test_key'

    if (isDev && !hasResend) {
      // OTP code generated (dev mode, no email sent)
    } else {
      try {
        await sendEmail({
          to: normalizedEmail,
          subject: `${code} es tu código de verificación - Itineramio`,
          html: emailTemplates.demoOtpVerification({
            otpCode: code,
            leadName: name || undefined,
          }),
        })
      } catch {
        return NextResponse.json(
          { error: 'Error al enviar el email. Inténtalo de nuevo.' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ success: true, ...(isDev && !hasResend ? { devCode: code } : {}) })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno. Inténtalo de nuevo.' },
      { status: 500 }
    )
  }
}
