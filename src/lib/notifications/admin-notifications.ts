import { Resend } from 'resend'

// Lazy initialization to avoid build errors when RESEND_API_KEY is not set
let _resend: Resend | null = null

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')
  }
  return _resend
}

const ADMIN_EMAILS = ['hola@itineramio.com', 'alejandrosatlla@gmail.com']

/**
 * Envía notificación a los admins cuando hay un nuevo usuario registrado
 */
export async function notifyNewUserRegistration(user: {
  email: string
  name: string
  source?: string
}) {
  try {
    await getResend().emails.send({
      from: 'Itineramio Notifications <hola@itineramio.com>',
      to: ADMIN_EMAILS,
      subject: `🎉 Nuevo usuario registrado: ${user.name}`,
      html: `
        <h2>Nuevo Usuario Registrado</h2>
        <p><strong>Nombre:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Origen:</strong> ${user.source || 'Registro directo'}</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
        <hr/>
        <p><a href="https://www.itineramio.com/admin/users">Ver en panel de admin</a></p>
      `
    })
    console.log('✅ Admin notification sent: New user registration')
  } catch (error) {
    console.error('❌ Failed to send admin notification:', error)
  }
}

/**
 * Envía notificación cuando alguien completa el quiz de la academia
 */
export async function notifyQuizLeadCaptured(lead: {
  email: string
  fullName: string | null
  score: number
  level: string
  emailVerified: boolean
}) {
  try {
    await getResend().emails.send({
      from: 'Itineramio Notifications <hola@itineramio.com>',
      to: ADMIN_EMAILS,
      subject: `📝 Nuevo quiz completado: ${lead.fullName || lead.email}`,
      html: `
        <h2>Nuevo Quiz de Academia Completado</h2>
        <p><strong>Nombre:</strong> ${lead.fullName || 'No proporcionado'}</p>
        <p><strong>Email:</strong> ${lead.email}</p>
        <p><strong>Puntuación:</strong> ${lead.score}/100</p>
        <p><strong>Nivel:</strong> ${lead.level}</p>
        <p><strong>Email verificado:</strong> ${lead.emailVerified ? 'Sí' : 'No'}</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
        <hr/>
        <p><a href="https://www.itineramio.com/admin/academia/quiz-leads">Ver todos los leads del quiz</a></p>
      `
    })
    console.log('✅ Admin notification sent: Quiz lead captured')
  } catch (error) {
    console.error('❌ Failed to send admin notification:', error)
  }
}

/**
 * Envía notificación cuando hay una nueva suscripción a newsletter/email
 */
export async function notifyEmailSubscriber(subscriber: {
  email: string
  source?: string
  downloadedGuide?: boolean
  leadMagnetSlug?: string
}) {
  try {
    await getResend().emails.send({
      from: 'Itineramio Notifications <hola@itineramio.com>',
      to: ADMIN_EMAILS,
      subject: `📧 Nueva suscripción: ${subscriber.email}`,
      html: `
        <h2>Nueva Suscripción a Newsletter</h2>
        <p><strong>Email:</strong> ${subscriber.email}</p>
        <p><strong>Origen:</strong> ${subscriber.source || 'No especificado'}</p>
        ${subscriber.downloadedGuide ? `<p><strong>Lead Magnet:</strong> ${subscriber.leadMagnetSlug}</p>` : ''}
        <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
        <hr/>
        <p><a href="https://www.itineramio.com/admin/marketing/leads">Ver todos los leads</a></p>
      `
    })
    console.log('✅ Admin notification sent: Email subscriber')
  } catch (error) {
    console.error('❌ Failed to send admin notification:', error)
  }
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
 */
export async function notifyQuizEmailVerified(lead: {
  email: string
  fullName: string | null
}) {
  try {
    await getResend().emails.send({
      from: 'Itineramio Notifications <hola@itineramio.com>',
      to: ADMIN_EMAILS,
      subject: `✅ Email verificado: ${lead.fullName || lead.email}`,
      html: `
        <h2>Email Verificado - Quiz Lead</h2>
        <p><strong>Usuario:</strong> ${lead.fullName || 'No proporcionado'}</p>
        <p><strong>Email:</strong> ${lead.email}</p>
        <p><strong>Fecha verificación:</strong> ${new Date().toLocaleString('es-ES')}</p>
        <hr/>
        <p>Este lead ha confirmado su email y está listo para recibir comunicaciones.</p>
        <p><a href="https://www.itineramio.com/admin/academia/quiz-leads">Ver leads del quiz</a></p>
      `
    })
    console.log('✅ Admin notification sent: Quiz email verified')
  } catch (error) {
    console.error('❌ Failed to send admin notification:', error)
  }
}

/**
 * Envía notificación cuando alguien completa el test de perfil de anfitrión
 */
export async function notifyHostProfileTestCompleted(test: {
  email: string
  name?: string
  archetype: string
  score: number
}) {
  try {
    await getResend().emails.send({
      from: 'Itineramio Notifications <hola@itineramio.com>',
      to: ADMIN_EMAILS,
      subject: `🎯 Test de perfil completado: ${test.archetype}`,
      html: `
        <h2>Test de Perfil de Anfitrión Completado</h2>
        <p><strong>Email:</strong> ${test.email}</p>
        <p><strong>Nombre:</strong> ${test.name || 'No proporcionado'}</p>
        <p><strong>Arquetipo:</strong> ${test.archetype}</p>
        <p><strong>Puntuación total:</strong> ${test.score}</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
        <hr/>
        <p><a href="https://www.itineramio.com/admin/host-profiles">Ver todos los perfiles</a></p>
      `
    })
    console.log('✅ Admin notification sent: Host profile test')
  } catch (error) {
    console.error('❌ Failed to send admin notification:', error)
  }
}
