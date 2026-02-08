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
 * DESACTIVADO temporalmente para ahorrar cuota de Resend
 */
export async function notifyNewUserRegistration(user: {
  email: string
  name: string
  source?: string
}) {
  // DESACTIVADO - Ver usuarios en /admin/users
  console.log('📧 [DISABLED] New user registration:', user.email)
  return
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
  console.log('📧 [DISABLED] Quiz lead captured:', lead.email)
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
  console.log('📧 [DISABLED] Email subscriber:', subscriber.email)
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
    console.log('✅ Admin notification sent: Subscription request')
  } catch (error) {
    console.error('❌ Failed to send admin notification:', error)
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
  console.log('📧 [DISABLED] Quiz email verified:', lead.email)
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
  console.log('📧 [DISABLED] Host profile test:', test.email)
  return
}
