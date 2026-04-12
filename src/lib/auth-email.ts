import { prisma } from './prisma'
import { sendEmail, emailTemplates } from './email-improved'
import { randomBytes } from 'crypto'
import { trialService } from './trial-service'

export class EmailVerificationService {
  // Generate verification token
  static async createVerificationToken(email: string): Promise<string> {
    const token = randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    try {
      // Delete any existing tokens for this email
      await prisma.emailVerificationToken.deleteMany({
        where: { email }
      })

      // Create new token
      await prisma.emailVerificationToken.create({
        data: {
          email,
          token,
          expires
        }
      })
    } catch (error) {
      // If table doesn't exist, return a dummy token for now
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2021') {
        return `dummy-token-${Date.now()}`
      }
      throw error
    }

    return token
  }

  // Send verification email
  static async sendVerificationEmail(email: string, userName: string): Promise<void> {
    const token = await this.createVerificationToken(email)
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}`

    await sendEmail({
      to: email,
      subject: 'Confirma tu cuenta - Itineramio',
      html: emailTemplates.emailVerification(verificationUrl, userName)
    })
  }

  // Verify email token
  static async verifyEmailToken(token: string): Promise<{ success: boolean; email?: string; error?: string }> {
    try {
      const verificationToken = await prisma.emailVerificationToken.findUnique({
        where: { token }
      })

      if (!verificationToken) {
        return { success: false, error: 'Token inválido' }
      }

      if (verificationToken.expires < new Date()) {
        // Delete expired token
        await prisma.emailVerificationToken.delete({
          where: { token }
        })
        return { success: false, error: 'Token expirado' }
      }

      // Get user to initialize trial
      const user = await prisma.user.findUnique({
        where: { email: verificationToken.email },
        select: { id: true, trialStartedAt: true }
      })

      if (!user) {
        return { success: false, error: 'Usuario no encontrado' }
      }

      // Mark user as verified
      await prisma.user.update({
        where: { email: verificationToken.email },
        data: {
          emailVerified: new Date(),
          status: 'ACTIVE' // Update status from PENDING to ACTIVE
        }
      })

      // Initialize trial if not already started (15 days from verification)
      if (!user.trialStartedAt) {
        await trialService.initializeTrial(user.id)
      }

      // Delete used token
      await prisma.emailVerificationToken.delete({
        where: { token }
      })

      return { success: true, email: verificationToken.email }
    } catch (error) {
      return { success: false, error: 'Error al verificar el token' }
    }
  }

  // Send welcome email
  static async sendWelcomeEmail(email: string, userName: string): Promise<void> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.itineramio.com'
    const name = userName || 'ahí'

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px 20px; color: #1a1a1a; line-height: 1.6;">
        <p>Lleva tiempo pasando.</p>
        <p>El check-in a las 15:00. El mensaje a las 14:58: "¿Cómo se entra?". Tú respondes. Al día siguiente, otro huésped. Mismo mensaje. Misma respuesta.</p>
        <p>WiFi. Normas. Parking. Checkout.</p>
        <p><strong>Copiar. Pegar. Repetir.</strong></p>
        <p>No agota tener apartamentos. Agota que cada reserva empiece igual.</p>
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;">
        <p>Itineramio no es una guía más. Es el sistema que manda esa información antes de que el huésped te pregunte. Cuando confirma la reserva, ya tiene todo. Tú no haces nada.</p>
        <p>La primera vez que un huésped llega sin preguntarte nada, lo entiendes.</p>
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;">
        <p><strong>Un paso. Una vez. Para siempre.</strong></p>
        <p>Cuéntale a la IA cómo es tu alojamiento y en 8 minutos tienes un manual completo: instrucciones por zona, traducido a 3 idiomas y con QR únicos para cada zona.</p>
        <a href="${appUrl}/ai-setup" style="display: inline-block; background: #1a1a1a; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 500; margin: 20px 0;">Crear mi manual con IA →</a>
        <p style="font-size: 14px; color: #666;">Sin tarjeta. Sin instalación.</p>
        <p style="color: #666; margin-top: 32px; font-size: 14px;">Si tienes cualquier pregunta, responde a este email.</p>
        <p style="color: #1a1a1a;">Alejandro — Itineramio</p>
      </div>
    `

    await sendEmail({
      to: email,
      subject: 'Tu móvil no va a parar. Hasta que hagas esto.',
      html,
    })
  }

  // Cleanup expired tokens (can be called periodically)
  static async cleanupExpiredTokens(): Promise<number> {
    const result = await prisma.emailVerificationToken.deleteMany({
      where: {
        expires: {
          lt: new Date()
        }
      }
    })
    return result.count
  }
}

// Helper function to check if email is verified
export async function isEmailVerified(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { emailVerified: true }
  })
  return !!user?.emailVerified
}