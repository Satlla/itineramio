import { Resend } from 'resend'

// Lazy initialization to avoid build errors when RESEND_API_KEY is not set
let _resend: Resend | null = null

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')
  }
  return _resend
}

// Reducido a 1 email para ahorrar cuota de Resend
const ADMIN_EMAILS = ['alejandrosatlla@gmail.com']

/**
 * Envía notificación a los admins cuando hay un nuevo usuario registrado
 */
export async function notifyNewUserRegistration(user: {
  email: string
  name: string
  source?: string
}) {
  try {
    const now = new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })
    await getResend().emails.send({
      from: 'Itineramio <hola@itineramio.com>',
      to: ADMIN_EMAILS,
      subject: `🟢 Nuevo usuario: ${user.name}`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 480px; padding: 24px; color: #1a1a1a;">
          <p style="font-size: 20px; font-weight: 700; margin: 0 0 16px;">🟢 Nuevo usuario registrado</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #666; width: 80px;">Nombre</td><td style="padding: 8px 0; font-weight: 600;">${user.name}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0;">${user.email}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Origen</td><td style="padding: 8px 0;">${user.source || 'Registro directo'}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Hora</td><td style="padding: 8px 0;">${now}</td></tr>
          </table>
          <a href="https://www.itineramio.com/admin/users" style="display: inline-block; margin-top: 16px; background: #1a1a1a; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px;">Ver en admin →</a>
        </div>
      `
    })
  } catch {
    // notification send failed silently
  }
}

/**
 * Envía notificación cuando alguien completa el quiz de la academia
 * DESACTIVADO temporalmente para ahorrar cuota de Resend
 */
export async function notifyQuizLeadCaptured(lead: {
  email: string
  fullName: string | null
  score: number
  level: string
  emailVerified: boolean
}) {
  // DESACTIVADO - Ver en /admin/academia/quiz-leads
  return
}

/**
 * Envía notificación cuando hay una nueva suscripción a newsletter/email
 * DESACTIVADO temporalmente para ahorrar cuota de Resend
 */
export async function notifyEmailSubscriber(subscriber: {
  email: string
  source?: string
  downloadedGuide?: boolean
  leadMagnetSlug?: string
}) {
  // DESACTIVADO - Ver en /admin/marketing/leads
  return
}

/**
 * Envía notificación cuando hay una nueva solicitud de suscripción pendiente de aprobación
 */
export async function notifySubscriptionRequest(request: {
  userId: string
  userName: string
  userEmail: string
  requestedPlan: string
  status: string
}) {
  try {
    await getResend().emails.send({
      from: 'Itineramio Notifications <hola@itineramio.com>',
      to: ADMIN_EMAILS,
      subject: `⭐ Nueva solicitud de suscripción: ${request.userName} - Plan ${request.requestedPlan}`,
      html: `
        <h2>Nueva Solicitud de Suscripción</h2>
        <p><strong>Usuario:</strong> ${request.userName}</p>
        <p><strong>Email:</strong> ${request.userEmail}</p>
        <p><strong>Plan solicitado:</strong> ${request.requestedPlan}</p>
        <p><strong>Estado:</strong> ${request.status}</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
        <hr/>
        <p><strong>Acción requerida:</strong> Debes aprobar o rechazar esta solicitud en el panel de admin.</p>
        <p><a href="https://www.itineramio.com/admin/subscription-requests">Ir al panel de solicitudes</a></p>
      `
    })
  } catch (error) {
    // notification send failed silently
  }
}

/**
 * Envía notificación cuando un usuario verifica su email del quiz
 * DESACTIVADO temporalmente para ahorrar cuota de Resend
 */
export async function notifyQuizEmailVerified(lead: {
  email: string
  fullName: string | null
}) {
  // DESACTIVADO - Ver en /admin/academia/quiz-leads
  return
}

/**
 * Envía notificación cuando alguien completa el test de perfil de anfitrión
 * DESACTIVADO temporalmente para ahorrar cuota de Resend
 */
export async function notifyHostProfileTestCompleted(test: {
  email: string
  name?: string
  archetype: string
  score: number
}) {
  // DESACTIVADO - Ver en /admin/host-profiles
  return
}
