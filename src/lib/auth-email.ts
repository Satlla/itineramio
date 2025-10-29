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
      console.error('Error creating verification token:', error)
      // If table doesn't exist, return a dummy token for now
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2021') {
        console.warn('Email verification table does not exist - returning dummy token')
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
        console.log(`🎁 Initializing 15-day trial for user ${user.id}`)
        await trialService.initializeTrial(user.id)
      }

      // Delete used token
      await prisma.emailVerificationToken.delete({
        where: { token }
      })

      return { success: true, email: verificationToken.email }
    } catch (error) {
      console.error('Error verifying email token:', error)
      return { success: false, error: 'Error al verificar el token' }
    }
  }

  // Send welcome email
  static async sendWelcomeEmail(email: string, userName: string): Promise<void> {
    await sendEmail({
      to: email,
      subject: '¡Bienvenido a Itineramio!',
      html: emailTemplates.welcomeEmail(userName)
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