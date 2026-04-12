/**
 * Onboarding Email System — Triggers por estado
 *
 * A diferencia del sistema de email-sequences.ts (basado en EmailSubscriber),
 * este sistema trabaja directamente con User + Property + PropertyScore.
 *
 * Los emails se envían según el ESTADO del usuario, no por días transcurridos.
 * El cron job /api/cron/onboarding evalúa cada usuario activo y decide
 * qué email le toca.
 *
 * Flujo:
 * 1. Cron corre cada hora
 * 2. Para cada usuario en trial/activo, calcula su estado
 * 3. Compara con los emails ya enviados (tabla Notification)
 * 4. Si hay un email pendiente que no se ha mandado, lo envía
 */

import { prisma } from './prisma'
import { calculatePropertyScore, type QualificationLevel } from './property-scoring'

// Tipos de notificación de onboarding (se guardan en tabla Notification)
export const ONBOARDING_EMAIL_TYPES = {
  WELCOME: 'ONBOARDING_WELCOME',                   // Día 0: registro
  NO_PROPERTY_REMINDER_1: 'ONBOARDING_NO_PROP_1',  // 24h sin propiedad
  NO_PROPERTY_REMINDER_2: 'ONBOARDING_NO_PROP_2',  // 72h sin propiedad
  PROPERTY_CREATED: 'ONBOARDING_PROP_CREATED',      // Creó propiedad, añadir zonas
  NO_ASSISTANT: 'ONBOARDING_NO_ASSISTANT',           // Tiene zonas, sin asistente
  NO_PUBLISH: 'ONBOARDING_NO_PUBLISH',               // Tiene asistente, sin publicar
  FIRST_VISIT: 'ONBOARDING_FIRST_VISIT',             // Primera visita real
  TRIAL_WARNING: 'ONBOARDING_TRIAL_WARNING',         // Trial a X días de expirar
  TRIAL_LAST_DAY: 'ONBOARDING_TRIAL_LAST_DAY',       // Último día trial
} as const

type OnboardingEmailType = typeof ONBOARDING_EMAIL_TYPES[keyof typeof ONBOARDING_EMAIL_TYPES]

interface OnboardingState {
  userId: string
  email: string
  name: string | null
  registeredAt: Date
  hoursSinceRegistration: number
  hasProperty: boolean
  propertyId: string | null
  propertyName: string | null
  score: number | null
  level: QualificationLevel | null
  hasZones: boolean
  hasAssistant: boolean
  isPublished: boolean
  hasRealVisits: boolean
  totalVisits: number
  questionsAnswered: number
  trialEndsAt: Date | null
  daysUntilTrialEnds: number | null
  emailsSent: OnboardingEmailType[]
}

/**
 * Evalúa el estado de onboarding de un usuario y devuelve
 * qué email debería recibir (si alguno)
 */
export async function evaluateOnboardingState(userId: string): Promise<{
  state: OnboardingState
  nextEmail: OnboardingEmailType | null
}> {
  // Obtener usuario con propiedades y notificaciones
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      properties: {
        where: { deletedAt: null },
        select: {
          id: true,
          name: true,
          isPublished: true,
          trialEndsAt: true,
          zones: {
            where: { deletedAt: null },
            select: { id: true },
          },
          chatbotConversations: {
            select: { id: true },
          },
          analytics: {
            select: { uniqueVisitors: true, totalViews: true },
          },
        },
        take: 1,
        orderBy: { createdAt: 'asc' },
      },
      notifications: {
        where: {
          type: { startsWith: 'ONBOARDING_' },
        },
        select: { type: true },
      },
    },
  })

  if (!user) {
    return { state: {} as OnboardingState, nextEmail: null }
  }

  const now = new Date()
  const registeredAt = user.createdAt
  const hoursSinceRegistration = (now.getTime() - registeredAt.getTime()) / (1000 * 60 * 60)

  const property = user.properties[0] || null
  const hasProperty = property !== null
  const hasZones = property ? property.zones.length >= 3 : false
  const hasAssistant = property ? property.chatbotConversations.length > 0 : false
  const isPublished = property?.isPublished ?? false
  const hasRealVisits = (property?.analytics?.uniqueVisitors ?? 0) > 0
  const totalVisits = property?.analytics?.totalViews ?? 0

  // Calcular score si tiene propiedad
  let score: number | null = null
  let level: QualificationLevel | null = null
  if (property) {
    const propertyScore = await calculatePropertyScore(property.id)
    if (propertyScore) {
      score = propertyScore.total
      level = propertyScore.level
    }
  }

  // Trial
  const trialEndsAt = property?.trialEndsAt ?? user.trialEndsAt ?? null
  const daysUntilTrialEnds = trialEndsAt
    ? Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null

  // Emails ya enviados
  const emailsSent = user.notifications.map((n) => n.type as OnboardingEmailType)

  const state: OnboardingState = {
    userId: user.id,
    email: user.email,
    name: user.name,
    registeredAt,
    hoursSinceRegistration,
    hasProperty,
    propertyId: property?.id ?? null,
    propertyName: property?.name ?? null,
    score,
    level,
    hasZones,
    hasAssistant,
    isPublished,
    hasRealVisits,
    totalVisits,
    questionsAnswered: 0, // Se calcula en el scoring
    trialEndsAt,
    daysUntilTrialEnds,
    emailsSent,
  }

  const nextEmail = determineNextEmail(state)

  return { state, nextEmail }
}

/**
 * Determina qué email de onboarding toca enviar basado en el estado
 */
function determineNextEmail(state: OnboardingState): OnboardingEmailType | null {
  const { emailsSent } = state

  const alreadySent = (type: OnboardingEmailType) => emailsSent.includes(type)

  // 1. Email de bienvenida — inmediato al registrarse
  // (se envía desde el endpoint de registro, no desde el cron)

  // 2. Trial — último día (prioridad máxima)
  if (state.daysUntilTrialEnds !== null && state.daysUntilTrialEnds <= 1) {
    if (!alreadySent(ONBOARDING_EMAIL_TYPES.TRIAL_LAST_DAY)) {
      return ONBOARDING_EMAIL_TYPES.TRIAL_LAST_DAY
    }
  }

  // 3. Trial — warning (4 días antes)
  if (state.daysUntilTrialEnds !== null && state.daysUntilTrialEnds <= 4) {
    if (!alreadySent(ONBOARDING_EMAIL_TYPES.TRIAL_WARNING)) {
      return ONBOARDING_EMAIL_TYPES.TRIAL_WARNING
    }
  }

  // 4. Primera visita real — cuando un huésped abre el alojamiento
  if (state.hasRealVisits && !alreadySent(ONBOARDING_EMAIL_TYPES.FIRST_VISIT)) {
    return ONBOARDING_EMAIL_TYPES.FIRST_VISIT
  }

  // 5. No ha publicado — tiene asistente pero no ha publicado
  if (state.hasAssistant && !state.isPublished) {
    if (!alreadySent(ONBOARDING_EMAIL_TYPES.NO_PUBLISH) && state.hoursSinceRegistration >= 120) {
      return ONBOARDING_EMAIL_TYPES.NO_PUBLISH
    }
  }

  // 6. No tiene asistente — tiene zonas pero no activó asistente
  if (state.hasZones && !state.hasAssistant) {
    if (!alreadySent(ONBOARDING_EMAIL_TYPES.NO_ASSISTANT) && state.hoursSinceRegistration >= 72) {
      return ONBOARDING_EMAIL_TYPES.NO_ASSISTANT
    }
  }

  // 7. Creó propiedad — necesita añadir zonas
  if (state.hasProperty && !state.hasZones) {
    if (!alreadySent(ONBOARDING_EMAIL_TYPES.PROPERTY_CREATED)) {
      return ONBOARDING_EMAIL_TYPES.PROPERTY_CREATED
    }
  }

  // 8. No tiene propiedad — segundo recordatorio (72h)
  if (!state.hasProperty && state.hoursSinceRegistration >= 72) {
    if (!alreadySent(ONBOARDING_EMAIL_TYPES.NO_PROPERTY_REMINDER_2)) {
      return ONBOARDING_EMAIL_TYPES.NO_PROPERTY_REMINDER_2
    }
  }

  // 9. No tiene propiedad — primer recordatorio (24h)
  if (!state.hasProperty && state.hoursSinceRegistration >= 24) {
    if (!alreadySent(ONBOARDING_EMAIL_TYPES.NO_PROPERTY_REMINDER_1)) {
      return ONBOARDING_EMAIL_TYPES.NO_PROPERTY_REMINDER_1
    }
  }

  return null
}

/**
 * Procesa todos los usuarios activos y envía los emails de onboarding que correspondan
 * Se llama desde el cron job /api/cron/onboarding
 */
export async function processOnboardingEmails(): Promise<{
  processed: number
  sent: number
  errors: number
  details: Array<{ userId: string; email: string; emailType: string; success: boolean }>
}> {
  // Buscar usuarios que:
  // - Están activos
  // - Se registraron en los últimos 30 días
  // - Tienen email verificado
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - 30)

  const users = await prisma.user.findMany({
    where: {
      isActive: true,
      emailVerified: { not: null },
      createdAt: { gte: cutoffDate },
    },
    select: { id: true },
    take: 200, // Procesar en batches
  })

  const results = {
    processed: 0,
    sent: 0,
    errors: 0,
    details: [] as Array<{ userId: string; email: string; emailType: string; success: boolean }>,
  }

  for (const user of users) {
    results.processed++

    try {
      const { state, nextEmail } = await evaluateOnboardingState(user.id)

      if (!nextEmail) continue

      // Enviar email y registrar notificación
      const success = await sendOnboardingEmail(state, nextEmail)

      if (success) {
        // Registrar que este email ya se envió
        await prisma.notification.create({
          data: {
            userId: state.userId,
            type: nextEmail,
            title: getEmailSubject(nextEmail, state),
            message: `Onboarding email sent: ${nextEmail}`,
            read: false,
          },
        })

        results.sent++
      }

      results.details.push({
        userId: state.userId,
        email: state.email,
        emailType: nextEmail,
        success,
      })
    } catch {
      results.errors++
    }
  }

  return results
}

/**
 * Envía un email de onboarding específico
 */
async function sendOnboardingEmail(
  state: OnboardingState,
  emailType: OnboardingEmailType
): Promise<boolean> {
  try {
    // Por ahora usamos la API de Resend directamente
    // TODO: Crear templates React para cada email de onboarding
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    const subject = getEmailSubject(emailType, state)
    const html = getEmailHtml(emailType, state)

    const { error } = await resend.emails.send({
      from: 'Alejandro <alejandro@itineramio.com>',
      to: state.email,
      subject,
      html,
      replyTo: 'hola@itineramio.com',
      tags: [
        { name: 'type', value: 'onboarding' },
        { name: 'email_type', value: emailType },
        { name: 'level', value: state.level || 'unknown' },
      ],
    })

    return !error
  } catch {
    return false
  }
}

/**
 * Devuelve el asunto del email según el tipo
 */
function getEmailSubject(emailType: OnboardingEmailType, state: OnboardingState): string {
  const subjects: Record<OnboardingEmailType, string> = {
    [ONBOARDING_EMAIL_TYPES.WELCOME]: 'Tu móvil no va a parar. Hasta que hagas esto.',
    [ONBOARDING_EMAIL_TYPES.NO_PROPERTY_REMINDER_1]: 'Mañana llega otro huésped. Mismo mensaje.',
    [ONBOARDING_EMAIL_TYPES.NO_PROPERTY_REMINDER_2]: 'Con 6 apartamentos se rompe. Con 1 también.',
    [ONBOARDING_EMAIL_TYPES.PROPERTY_CREATED]: 'Paso 2: añade lo que el huésped busca primero',
    [ONBOARDING_EMAIL_TYPES.NO_ASSISTANT]: 'Tu huésped pregunta en alemán. Tú no hablas alemán.',
    [ONBOARDING_EMAIL_TYPES.NO_PUBLISH]: 'Un huésped busca tu alojamiento',
    [ONBOARDING_EMAIL_TYPES.FIRST_VISIT]: 'Tu primer huésped no te ha escrito.',
    [ONBOARDING_EMAIL_TYPES.TRIAL_WARNING]: `Tu prueba termina en ${state.daysUntilTrialEnds} días.`,
    [ONBOARDING_EMAIL_TYPES.TRIAL_LAST_DAY]: 'Último día — mañana se para todo.',
  }

  return subjects[emailType] || 'Itineramio'
}

/**
 * Genera el HTML del email según el tipo
 * TODO: Migrar a templates React para consistencia visual
 */
function getEmailHtml(emailType: OnboardingEmailType, state: OnboardingState): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.itineramio.com'
  const name = state.name || 'ahí'
  const propertyName = state.propertyName || 'tu alojamiento'

  const wrapper = (body: string) => `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px 20px; color: #1a1a1a; line-height: 1.6;">
      ${body}
      <p style="color: #666; margin-top: 32px; font-size: 14px;">Si tienes cualquier pregunta, responde a este email.</p>
      <p style="color: #1a1a1a;">Alejandro — Itineramio</p>
    </div>
  `

  const cta = (text: string, url: string) => `
    <a href="${url}" style="display: inline-block; background: #1a1a1a; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 500; margin: 20px 0;">${text}</a>
  `

  switch (emailType) {
    case ONBOARDING_EMAIL_TYPES.WELCOME:
      return wrapper(`
        <p>Lleva tiempo pasando.</p>
        <p>El check-in a las 15:00. El mensaje a las 14:58: "¿Cómo se entra?". Tú respondes. Al día siguiente, otro huésped. Mismo mensaje. Misma respuesta.</p>
        <p>WiFi. Normas. Parking. Checkout.</p>
        <p><strong>Copiar. Pegar. Repetir.</strong></p>
        <p>No agota tener apartamentos. Agota que cada reserva empiece igual.</p>
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;">
        <p>Itineramio no es una guía más. Es el sistema que manda esa información antes de que el huésped te pregunte. Cuando confirma la reserva, ya tiene todo. Tú no haces nada.</p>
        <p>La primera vez que un huésped llega sin preguntarte nada, lo entiendes.</p>
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;">
        <p><strong>Cuatro pasos. Una vez. Para siempre.</strong></p>
        <p>01 — Configura tu alojamiento ← estás aquí<br>El sistema lo construye contigo en 10 minutos.</p>
        <p>02 — Añade las zonas<br>Cada sección en su sitio.</p>
        <p>03 — Activa el asistente<br>Responde en el idioma del huésped.</p>
        <p>04 — Comparte el enlace<br>Un QR o un link. Funciona siempre.</p>
        ${cta('Configurar mi alojamiento con el sistema →', `${appUrl}/properties/new`)}
        <p style="font-size: 14px; color: #666;">Sin tarjeta. Sin instalación.</p>
      `)

    case ONBOARDING_EMAIL_TYPES.NO_PROPERTY_REMINDER_1:
      return wrapper(`
        <p>Ayer te registraste. Hoy sigues contestando lo mismo de siempre.</p>
        <p>No es culpa tuya. Es que todavía no has puesto la información donde el huésped la encuentre solo.</p>
        <p>Necesitas tres cosas para empezar: el nombre de tu alojamiento, la dirección y cómo se entra. Nada más. En 5 minutos tienes el primer paso hecho.</p>
        ${cta('Configurar mi alojamiento →', `${appUrl}/properties/new`)}
      `)

    case ONBOARDING_EMAIL_TYPES.NO_PROPERTY_REMINDER_2:
      return wrapper(`
        <p>Da igual si tienes uno o seis. Si cada huésped te escribe las mismas preguntas, el problema es el mismo.</p>
        <p>Llevas 3 días registrado. El sistema está esperando. Tú solo tienes que escribir el nombre de tu alojamiento y darle a guardar.</p>
        <p>Un paso. Menos de un minuto.</p>
        ${cta('Crear mi alojamiento →', `${appUrl}/properties/new`)}
        <p>Si hay algo que no funciona, responde a este email. Lo leo yo.</p>
      `)

    case ONBOARDING_EMAIL_TYPES.PROPERTY_CREATED:
      return wrapper(`
        <p>Ya tienes tu alojamiento creado. Bien.</p>
        <p>Ahora lo importante: añadir las zonas. Sin ellas, el alojamiento existe pero no tiene contenido — el huésped lo abre y no encuentra nada.</p>
        <p>Estos son los tres bloques que el 80% de los huéspedes buscan antes de llegar:</p>
        <p>— Acceso: cómo se entra, código, llaves<br>— WiFi: nombre de la red y contraseña<br>— Normas: horarios, ruido, mascotas</p>
        <p>Empieza por estos tres. Con eso ya tienes el 80% del trabajo hecho.</p>
        ${cta('Añadir zonas →', state.propertyId ? `${appUrl}/properties/${state.propertyId}/zones` : `${appUrl}/dashboard`)}
      `)

    case ONBOARDING_EMAIL_TYPES.NO_ASSISTANT:
      return wrapper(`
        <p>Tienes el alojamiento configurado y las zonas añadidas. Bien.</p>
        <p>Pero si un huésped tiene una duda que no está en las zonas, te escribe a ti. En su idioma. A las 23:00.</p>
        <p>El asistente de Itineramio responde por ti. Usa la información que tú ya configuraste y contesta en el idioma del huésped. Tú no haces nada.</p>
        <p>Solo falta activarlo.</p>
        ${cta('Activar el asistente →', state.propertyId ? `${appUrl}/properties/${state.propertyId}/intelligence` : `${appUrl}/dashboard`)}
      `)

    case ONBOARDING_EMAIL_TYPES.NO_PUBLISH:
      return wrapper(`
        <p>Todo está listo. El alojamiento, las zonas, el asistente.</p>
        <p>El problema: nadie puede verlo todavía porque no has publicado el enlace.</p>
        <p>Publica y comparte el QR con tu próximo huésped. Un mensaje en Airbnb o Booking con el enlace. Eso es todo.</p>
        <p>A partir de ahí, el sistema trabaja solo.</p>
        ${cta('Publicar mi alojamiento →', state.propertyId ? `${appUrl}/properties/${state.propertyId}` : `${appUrl}/dashboard`)}
      `)

    case ONBOARDING_EMAIL_TYPES.FIRST_VISIT:
      return wrapper(`
        <p>${propertyName} ha recibido su primera visita.</p>
        <p>Ha encontrado la información sin preguntarte. Eso es exactamente lo que querías.</p>
        <p>A partir de ahora, cada reserva funciona igual: llegan, abren el enlace, no te molestan.</p>
        ${cta('Ver estadísticas de mi alojamiento →', state.propertyId ? `${appUrl}/properties/${state.propertyId}/analytics` : `${appUrl}/dashboard`)}
      `)

    case ONBOARDING_EMAIL_TYPES.TRIAL_WARNING:
      const hasData = state.totalVisits > 0
      return wrapper(`
        <p>Llevas ${Math.floor(state.hoursSinceRegistration / 24)} días con Itineramio.</p>
        ${hasData ? `
          <p>En este tiempo, ${state.totalVisits} huéspedes han abierto tu alojamiento${state.questionsAnswered > 0 ? ` y el asistente ha respondido ${state.questionsAnswered} preguntas sin que tú intervinieras` : ''}. ${state.totalVisits > 0 ? `Esos son ${state.totalVisits} mensajes que no tuviste que escribir.` : ''}</p>
        ` : `
          <p>Todavía no has compartido el enlace con ningún huésped. El sistema está listo — solo falta que lo uses con tu próxima reserva.</p>
        `}
        <p>En ${state.daysUntilTrialEnds} días termina tu prueba. Si quieres que siga funcionando, elige tu plan.</p>
        ${cta('Ver planes →', `${appUrl}/pricing`)}
      `)

    case ONBOARDING_EMAIL_TYPES.TRIAL_LAST_DAY:
      const hasTrialData = state.totalVisits > 0
      return wrapper(`
        <p>Mañana expira tu prueba de Itineramio.</p>
        <p>A partir de ese momento: el asistente deja de responder, el enlace de tu alojamiento deja de funcionar, y tus huéspedes vuelven a escribirte.</p>
        ${hasTrialData ? `
          <p>En estos 14 días, el sistema respondió ${state.questionsAnswered} preguntas y tu alojamiento recibió ${state.totalVisits} visitas. Mañana eso se apaga.</p>
        ` : ''}
        <p>Activa tu plan hoy y todo sigue funcionando. Sin cambios, sin migrar nada.</p>
        ${cta('Activar mi plan →', `${appUrl}/pricing`)}
        <p>¿No te convenció? Responde a este email y dime qué faltó. Lo leo yo.</p>
      `)

    default:
      return wrapper('<p>Tienes novedades en Itineramio.</p>')
  }
}
