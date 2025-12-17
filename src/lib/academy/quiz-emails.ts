import { resend, FROM_EMAIL } from '../resend'
import { calculateLevel } from '../../data/quiz-questions'

interface QuizResultsEmailData {
  email: string
  fullName: string
  score: number
  totalQuestions: number
  correctAnswers: number
  timeElapsed: number // seconds
}

interface VerificationEmailData {
  email: string
  fullName: string
  verificationToken: string
}

/**
 * Envía un email de verificación para confirmar el email antes de mostrar resultados
 */
export async function sendVerificationEmail(data: VerificationEmailData) {
  const { email, fullName, verificationToken } = data

  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/academia/quiz/verificar?token=${verificationToken}`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verifica tu email - Academia Itineramio</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">

          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #6366f1 100%); padding: 40px 40px 60px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                📧 Verifica tu email
              </h1>
              <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                Academia Itineramio - ¿Cuánto sabes sobre Airbnb?
              </p>
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 600;">
                ¡Hola ${fullName}! 👋
              </h2>

              <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Gracias por completar nuestro quiz sobre Airbnb. Para ver tus resultados y recomendaciones personalizadas, necesitamos verificar tu dirección de email.
              </p>

              <p style="margin: 0 0 32px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Haz clic en el botón de abajo para verificar tu email y acceder a tus resultados:
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 32px 0;">
                    <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);">
                      Verificar mi email y ver resultados
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Info box -->
              <div style="background-color: #f3f4f6; border-left: 4px solid #8b5cf6; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                <p style="margin: 0 0 12px 0; color: #374151; font-size: 15px; line-height: 1.6; font-weight: 600;">
                  ⏰ Este enlace expira en 24 horas
                </p>
                <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                  Si no completaste este quiz, puedes ignorar este mensaje.
                </p>
              </div>

              <p style="margin: 0; color: #9ca3af; font-size: 14px; line-height: 1.6;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                <a href="${verificationUrl}" style="color: #8b5cf6; text-decoration: underline; word-break: break-all;">${verificationUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 32px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                <strong style="color: #374151;">Academia Itineramio</strong>
              </p>
              <p style="margin: 0 0 16px 0; color: #9ca3af; font-size: 13px;">
                Formación profesional para anfitriones de alquileres vacacionales
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} Itineramio. Todos los derechos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: '📧 Verifica tu email - Academia Itineramio',
      html
    })

    if (error) {
      console.error('Error sending verification email:', error)
      return { success: false, error }
    }

    return { success: true, data: emailData }
  } catch (error) {
    console.error('Failed to send verification email:', error)
    return { success: false, error }
  }
}

/**
 * Envía un email con los resultados del quiz a un usuario
 */
export async function sendQuizResultsEmail(data: QuizResultsEmailData) {
  const { email, fullName, score, totalQuestions, correctAnswers, timeElapsed } = data

  // Calculate level
  const levelData = calculateLevel(score)

  // Format time
  const minutes = Math.floor(timeElapsed / 60)
  const seconds = timeElapsed % 60
  const timeFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`

  // Map level to Spanish
  const levelLabels = {
    'BASIC': 'Principiante',
    'INTERMEDIATE': 'Intermedio',
    'ADVANCED': 'Avanzado'
  }
  const levelLabel = levelLabels[levelData.level]

  // Get level color
  const levelColors = {
    'BASIC': '#10b981', // green
    'INTERMEDIATE': '#f59e0b', // yellow/orange
    'ADVANCED': '#8b5cf6' // purple
  }
  const levelColor = levelColors[levelData.level]

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resultados del Quiz - Academia Itineramio</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">

          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #6366f1 100%); padding: 40px 40px 60px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                🏆 ¡Quiz Completado!
              </h1>
              <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                Academia Itineramio - ¿Cuánto sabes sobre Airbnb?
              </p>
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 600;">
                ¡Hola ${fullName}! 👋
              </h2>

              <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Gracias por completar nuestro quiz sobre Airbnb. Aquí están tus resultados:
              </p>

              <!-- Score Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td style="background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%); border-radius: 12px; padding: 32px; text-align: center;">
                    <div style="font-size: 64px; font-weight: 700; color: #ffffff; margin-bottom: 8px;">
                      ${score}
                    </div>
                    <div style="font-size: 18px; color: rgba(255, 255, 255, 0.9);">
                      de 100 puntos
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Level Badge -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background-color: ${levelColor}; color: #ffffff; padding: 12px 32px; border-radius: 24px; font-size: 18px; font-weight: 600;">
                      ${levelData.badge} Tu nivel: ${levelLabel}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Stats -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
                    <div style="color: #6b7280; font-size: 14px; margin-bottom: 4px;">Preguntas correctas</div>
                    <div style="color: #111827; font-size: 20px; font-weight: 600;">${correctAnswers} de ${totalQuestions}</div>
                  </td>
                  <td style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
                    <div style="color: #6b7280; font-size: 14px; margin-bottom: 4px;">Tiempo total</div>
                    <div style="color: #111827; font-size: 20px; font-weight: 600;">${timeFormatted}</div>
                  </td>
                </tr>
              </table>

              <!-- Message -->
              <div style="background-color: #f3f4f6; border-left: 4px solid #8b5cf6; padding: 20px; border-radius: 8px; margin-bottom: 32px;">
                <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">
                  ${levelData.message}
                </p>
              </div>

              <!-- Recommendations -->
              <h3 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 600;">
                📚 Recomendaciones para ti:
              </h3>

              <ul style="margin: 0 0 32px 0; padding-left: 20px; color: #4b5563; font-size: 15px; line-height: 1.8;">
                ${levelData.recommendations.map(rec => `<li>${rec}</li>`).join('')}
              </ul>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 24px 0;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/register" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);">
                      Crear mi cuenta gratis
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                Accede a contenido personalizado basado en tu nivel y comienza a maximizar tus ingresos en Airbnb.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 32px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                <strong style="color: #374151;">Academia Itineramio</strong>
              </p>
              <p style="margin: 0 0 16px 0; color: #9ca3af; font-size: 13px;">
                Formación profesional para anfitriones de alquileres vacacionales
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} Itineramio. Todos los derechos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: `🏆 Tus resultados del Quiz - ${score} puntos (Nivel ${levelLabel})`,
      html
    })

    if (error) {
      console.error('Error sending quiz results email:', error)
      return { success: false, error }
    }

    return { success: true, data: emailData }
  } catch (error) {
    console.error('Failed to send quiz results email:', error)
    return { success: false, error }
  }
}
