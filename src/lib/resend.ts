import { Resend } from 'resend'
import { render } from '@react-email/render'
import type { ReactElement } from 'react'

// Lazy initialization to avoid build errors when RESEND_API_KEY is not set
let _resend: Resend | null = null

function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY environment variable is not set. Email sending will fail.')
    }
    _resend = new Resend(process.env.RESEND_API_KEY || '')
  }
  return _resend
}

export const resend = {
  emails: {
    send: async (...args: Parameters<Resend['emails']['send']>) => {
      return getResend().emails.send(...args)
    }
  }
}

export const FROM_EMAIL = 'Itineramio <hola@itineramio.com>'
export const REPLY_TO_EMAIL = 'hola@itineramio.com'

// ========================================
// TIPOS Y CONSTANTES
// ========================================

export type EmailArchetype =
  | 'ESTRATEGA'
  | 'SISTEMATICO'
  | 'DIFERENCIADOR'
  | 'EJECUTOR'
  | 'RESOLUTOR'
  | 'EXPERIENCIAL'
  | 'EQUILIBRADO'
  | 'IMPROVISADOR'

export type EmailSource = 'test' | 'qr' | 'blog' | 'landing' | 'manual' | 'lead_magnet'

export type EngagementLevel = 'hot' | 'warm' | 'cold'

export interface EmailSubscriber {
  email: string
  name?: string
  archetype?: EmailArchetype
  source: EmailSource
  tags?: string[]
  engagement?: EngagementLevel
}

// ========================================
// FUNCIONES DE ENVÍO
// ========================================

/**
 * Envía un email usando un componente de React Email
 */
export async function sendEmail({
  to,
  subject,
  react,
  tags = [],
}: {
  to: string | string[]
  subject: string
  react: ReactElement
  tags?: string[]
}) {
  try {
    const html = await render(react)

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      reply_to: REPLY_TO_EMAIL,
      tags: tags.map((tag, index) => ({ name: `tag_${index}`, value: tag })),
    })

    if (error) {
      console.error('Error sending email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error rendering or sending email:', error)
    return { success: false, error }
  }
}

/**
 * Envía email de bienvenida tras completar test de personalidad
 */
export async function sendWelcomeTestEmail({
  email,
  name,
  gender,
  archetype,
  subscriberId,
  interests,
}: {
  email: string
  name: string
  gender?: 'M' | 'F' | 'O'
  archetype: EmailArchetype
  subscriberId?: string
  interests?: string[]
}) {
  const { WelcomeTestEmail } = await import('@/emails/templates/welcome-test')

  return sendEmail({
    to: email,
    subject: `🎯 Tu perfil completo: ${archetype}`,
    react: WelcomeTestEmail({ name, gender, archetype, subscriberId, interests }),
    tags: ['welcome', 'test', archetype.toLowerCase()],
  })
}

/**
 * Envía email de bienvenida tras generar QR
 */
export async function sendWelcomeQREmail({
  email,
  name,
}: {
  email: string
  name: string
}) {
  const { WelcomeQREmail } = await import('@/emails/templates/welcome-qr')

  return sendEmail({
    to: email,
    subject: '✅ Tu código QR está listo',
    react: WelcomeQREmail({ name }),
    tags: ['welcome', 'qr'],
  })
}

/**
 * Envía email con descarga de lead magnet
 * downloadUrl ya debe incluir el token si es necesario
 */
export async function sendLeadMagnetEmail({
  email,
  leadMagnetTitle,
  leadMagnetSubtitle,
  archetype,
  downloadUrl,
  pages,
  downloadables,
}: {
  email: string
  leadMagnetTitle: string
  leadMagnetSubtitle: string
  archetype: string
  downloadUrl: string // Debe incluir token si aplica
  pages: number
  downloadables: string[]
}) {
  const { LeadMagnetDownloadEmail } = await import(
    '@/emails/templates/lead-magnet-download'
  )

  return sendEmail({
    to: email,
    subject: `📥 Tu guía está lista: ${leadMagnetTitle}`,
    react: LeadMagnetDownloadEmail({
      leadMagnetTitle,
      leadMagnetSubtitle,
      archetype,
      downloadUrl,
      pages,
      downloadables,
    }),
    tags: ['lead_magnet', 'download', archetype.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9_-]/g, '_')],
  })
}

/**
 * Envía email día 3 - "Los 3 errores del arquetipo"
 */
export async function sendDay3MistakesEmail({
  email,
  name,
  archetype,
}: {
  email: string
  name: string
  archetype: EmailArchetype
}) {
  // Contenido específico por arquetipo
  const archetypeContent: Record<EmailArchetype, { subject: string; hook: string; mistakes: Array<{title: string; desc: string}>; blogSlug: string }> = {
    ESTRATEGA: {
      subject: '¿Por qué el 90% de ocupación puede ser un ERROR?',
      hook: 'Hace unos días completaste el test de perfil de anfitrión y descubrimos que tiendes a tomar decisiones basadas en datos y análisis (lo cual es genial). Pero hay algo que el 73% de anfitriones analíticos como tú pasan por alto...',
      mistakes: [
        { title: 'Optimizar para ocupación en vez de ingresos', desc: '85% ocupación a 50€/noche = 1.275€/mes. 65% ocupación a 75€/noche = 1.462€/mes. Menos trabajo, más dinero.' },
        { title: 'Ignorar el coste de oportunidad del tiempo', desc: 'Si pasas 10h/semana gestionando para ganar 200€ extra... estás cobrándote 5€/hora. ¿Lo harías para otra persona?' },
        { title: 'No trackear el Guest Acquisition Cost', desc: 'Si pagas 15% de comisión en cada reserva de 80€, estás regalando 12€. Con 50 reservas/año = 600€ que podrías reinvertir.' }
      ],
      blogSlug: 'revpar-vs-ocupacion'
    },
    SISTEMATICO: {
      subject: 'El sistema que me ahorra 8 horas cada semana',
      hook: 'Cuando hiciste el test, vimos que te gusta tener las cosas organizadas y con procesos claros. Perfecto. Pero déjame preguntarte: ¿cuántas horas pasas cada semana en tareas repetitivas que podrías automatizar?',
      mistakes: [
        { title: 'Sobre-documentar procesos simples', desc: 'No necesitas un manual de 15 páginas para el check-in. 5 puntos claros funcionan mejor (y los lees de verdad).' },
        { title: 'No automatizar comunicaciones básicas', desc: 'Mensaje de bienvenida, instrucciones de check-in, solicitud de review... todo automatizable en 30 minutos.' },
        { title: 'Buscar el sistema perfecto antes de empezar', desc: 'Lanza al 70%. Mejora basándote en uso real. "Perfecto" es enemigo de "hecho".' }
      ],
      blogSlug: 'automatizacion-airbnb'
    },
    DIFERENCIADOR: {
      subject: 'Por qué copiar a tu competencia es un ERROR',
      hook: 'Tu test mostró que te gusta crear experiencias únicas. Eso te diferencia del 80% de anfitriones genéricos. Pero hay una trampa en la que caen muchos...',
      mistakes: [
        { title: 'Añadir "detalles únicos" que nadie valora', desc: 'Ese jarrón artesanal de 80€ no suma reservas. WiFi rápido y café de calidad sí.' },
        { title: 'No comunicar tu diferenciación en el listing', desc: 'Tienes algo especial pero está enterrado en el párrafo 4. Los primeros 3 renglones son oro.' },
        { title: 'Diferenciarte en precio... hacia arriba sin justificar', desc: 'Cobrar 20% más está bien. Pero tienes que MOSTRAR por qué vales ese 20%.' }
      ],
      blogSlug: 'diferenciacion-airbnb'
    },
    EJECUTOR: {
      subject: '⚠️ Del modo "bombero" al modo CEO',
      hook: 'El test reveló que eres muy ejecutivo y resuelves rápido. Genial para emergencias. Peligroso a largo plazo. Aquí está por qué...',
      mistakes: [
        { title: 'Resolver TODO personalmente', desc: 'Cambiaste 3 bombillas en 2 meses. ¿No sería más fácil dejar repuestos + video tutorial para el huésped?' },
        { title: 'No delegar porque "lo hago más rápido yo"', desc: 'Cierto HOY. Pero enseñar a alguien te libera 100 horas futuras.' },
        { title: 'No tener sistemas de prevención', desc: 'Reaccionas genial ante problemas. ¿Y si previenes que ocurran? Check-list pre-llegada evita el 70% de incidencias.' }
      ],
      blogSlug: 'delegacion-airbnb'
    },
    RESOLUTOR: {
      subject: 'La crisis que NO deberías haber tenido',
      hook: 'Eres genial resolviendo problemas (el test lo confirmó). Pero déjame preguntarte algo incómodo: ¿cuántos de esos problemas eran prevenibles?',
      mistakes: [
        { title: 'Resolver en vez de prevenir', desc: 'Reparaste la cerradura 2 veces. ¿No sería mejor instalar una smart lock y olvidarte?' },
        { title: 'No documentar soluciones', desc: 'Resolviste ese problema 3 veces. Si lo hubieras documentado la primera vez, las otras dos habrían sido copy-paste.' },
        { title: 'Gastar energía en crisis evitables', desc: 'El 80% de "emergencias" vienen de: check-in confuso, instrucciones poco claras, o falta de mantenimiento preventivo.' }
      ],
      blogSlug: 'prevencion-problemas'
    },
    EXPERIENCIAL: {
      subject: 'Cuando "más hospitalidad" NO es la solución',
      hook: 'El test mostró que te importa mucho la experiencia del huésped (hermoso). Pero hay un límite donde más esfuerzo ≠ mejores reviews...',
      mistakes: [
        { title: 'Over-deliver en cosas que no se valoran', desc: 'Dejas cesta de bienvenida de 25€. Tu review dice "great location, very clean". Nadie mencionó la cesta.' },
        { title: 'Intentar ser amigo de cada huésped', desc: 'El 70% solo quiere: limpio, funcional, comunicación clara. No una relación personal.' },
        { title: 'No medir qué detalles importan', desc: 'Pregunta en el mensaje de checkout: "¿Qué fue lo mejor de tu estancia?" Las respuestas te sorprenderán.' }
      ],
      blogSlug: 'experiencia-huesped'
    },
    EQUILIBRADO: {
      subject: 'Por qué "equilibrado" puede ser tu mayor ventaja',
      hook: 'Tu test mostró que no tienes un estilo dominante. Muchos lo verían como debilidad. Yo lo veo como flexibilidad...',
      mistakes: [
        { title: 'Intentar ser experto en todo', desc: 'Mejor ser bueno en lo que importa. Céntrate en: limpieza excelente, comunicación rápida, precio justo.' },
        { title: 'No especializarte para un nicho', desc: 'Tu flexibilidad es perfecta para nómadas digitales (necesitan un poco de todo). Market para ellos.' },
        { title: 'No automatizar porque "depende del caso"', desc: '80% de casos son iguales. Automatiza esos. El otro 20% lo personalizas.' }
      ],
      blogSlug: 'gestion-eficiente'
    },
    IMPROVISADOR: {
      subject: 'Tu flexibilidad vale ORO (si haces esto)',
      hook: 'El test reveló que te adaptas rápido y eres flexible. Eso es una VENTAJA en hospitalidad. Pero solo si...',
      mistakes: [
        { title: 'Improvisar lo que debería estar sistematizado', desc: 'Check-in NO debe improvisarse. Limpieza NO debe improvisarse. Todo lo demás: sí.' },
        { title: 'No capturar "lo que funcionó"', desc: 'Improvisaste una solución genial para un huésped. ¿La documentaste? Si no, la reinventarás 10 veces.' },
        { title: 'Confiar en "ya me acordaré"', desc: 'Tienes 3 propiedades. 15 tareas/semana. Tu cerebro NO es un sistema de gestión de tareas.' }
      ],
      blogSlug: 'sistemas-flexibles'
    }
  }

  const content = archetypeContent[archetype]
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: content.subject,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937;">
        <div style="margin-bottom: 30px;">
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Hola ${name},
          </p>
          <p style="font-size: 16px; line-height: 1.6;">
            ${content.hook}
          </p>
        </div>

        <h2 style="color: #7c3aed; font-size: 22px; margin: 30px 0 20px 0;">
          3 errores que probablemente estás cometiendo:
        </h2>

        ${content.mistakes.map((mistake, i) => `
          <div style="margin-bottom: 25px; padding: 20px; background: #f9fafb; border-left: 4px solid #7c3aed; border-radius: 4px;">
            <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 18px;">
              ${i + 1}. ${mistake.title}
            </h3>
            <p style="margin: 0; font-size: 15px; line-height: 1.5; color: #4b5563;">
              ${mistake.desc}
            </p>
          </div>
        `).join('')}

        <div style="margin: 35px 0; padding: 25px; background: #ede9fe; border-radius: 8px;">
          <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #5b21b6;">
            📚 Lectura recomendada:
          </p>
          <p style="margin: 0 0 15px 0; font-size: 15px; line-height: 1.5;">
            Escribí una guía completa sobre esto en el blog. Incluye ejemplos reales, números y acciones concretas.
          </p>
          <a href="${appUrl}/blog"
             style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
            Leer la guía completa →
          </a>
        </div>

        <div style="margin: 30px 0; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 15px; line-height: 1.6; color: #6b7280;">
            PD: ¿Te identificaste con alguno de estos errores? Es normal. Yo los cometí todos (y me costaron €€€).
            Responde a este email y cuéntame cuál te resonó más.
          </p>
        </div>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">
            © ${new Date().getFullYear()} Itineramio ·
            <a href="${appUrl}" style="color: #7c3aed; text-decoration: none;">Visitar web</a>
          </p>
        </div>
      </div>
    `,
    reply_to: REPLY_TO_EMAIL,
    tags: [{ name: 'sequence', value: 'day3' }, { name: 'archetype', value: archetype.toLowerCase() }],
  })

  if (error) {
    console.error('Error sending Day 3 email:', error)
    return { success: false, error }
  }

  return { success: true, data }
}

/**
 * Envía email día 7 - Case study
 */
export async function sendDay7CaseStudyEmail({
  email,
  name,
  archetype,
}: {
  email: string
  name: string
  archetype: EmailArchetype
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'De 1.800€/mes a 3.200€/mes (misma propiedad)',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937;">
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Hola ${name},
        </p>

        <p style="font-size: 16px; line-height: 1.6;">
          Hoy quiero contarte la historia de Laura. Porque probablemente te identifiques.
        </p>

        <div style="margin: 30px 0; padding: 25px; background: #f9fafb; border-radius: 8px;">
          <h2 style="color: #7c3aed; margin: 0 0 15px 0; font-size: 20px;">
            El problema
          </h2>
          <p style="font-size: 15px; line-height: 1.6; margin: 0;">
            Laura tenía un apartamento en Valencia. Buena zona, bien decorado, reviews de 4.7 estrellas.
            <br><br>
            <strong>Facturaba 1.800€/mes de media.</strong>
            <br><br>
            Su ocupación era del 82%. "Nada mal", pensaba. Hasta que vio el apartamento de su vecino...
          </p>
        </div>

        <p style="font-size: 16px; line-height: 1.6;">
          Su vecino, con un apartamento prácticamente idéntico, facturaba <strong>2.900€/mes</strong>.
          Con <em>menos</em> ocupación (65%).
        </p>

        <p style="font-size: 16px; line-height: 1.6;">
          Laura se obsesionó: "¿Qué estoy haciendo mal?"
        </p>

        <div style="margin: 30px 0; padding: 25px; background: #ede9fe; border-radius: 8px;">
          <h2 style="color: #7c3aed; margin: 0 0 15px 0; font-size: 20px;">
            Lo que descubrió (y cambió)
          </h2>

          <div style="margin-bottom: 20px;">
            <h3 style="color: #1f2937; font-size: 17px; margin: 0 0 8px 0;">
              1. Estaba cobrando muy poco
            </h3>
            <p style="font-size: 15px; line-height: 1.6; margin: 0; color: #4b5563;">
              Tenía miedo de subir precio y perder ocupación. Pero cuando calculó su <strong>precio por m²</strong>
              vs la competencia, se dio cuenta: estaba un 25% por debajo.
            </p>
          </div>

          <div style="margin-bottom: 20px;">
            <h3 style="color: #1f2937; font-size: 17px; margin: 0 0 8px 0;">
              2. Su foto principal era mala
            </h3>
            <p style="font-size: 15px; line-height: 1.6; margin: 0; color: #4b5563;">
              Lo reconoce ella misma: "La hice yo con el móvil". Invirtió 150€ en un fotógrafo profesional.
              Su tasa de conversión (vistas → reservas) subió del 2.1% al 4.8%.
            </p>
          </div>

          <div>
            <h3 style="color: #1f2937; font-size: 17px; margin: 0 0 8px 0;">
              3. Perdía tiempo en tareas repetitivas
            </h3>
            <p style="font-size: 15px; line-height: 1.6; margin: 0; color: #4b5563;">
              Mensajes de check-in, solicitar reviews, responder preguntas básicas...
              Todo manual. <strong>8 horas semanales</strong> en copy-paste.
            </p>
          </div>
        </div>

        <div style="margin: 30px 0; padding: 25px; background: #f0fdf4; border-left: 4px solid #10b981; border-radius: 4px;">
          <h2 style="color: #065f46; margin: 0 0 15px 0; font-size: 20px;">
            Los resultados (6 meses después)
          </h2>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
            <div>
              <p style="margin: 0; font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                Antes
              </p>
              <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: 700; color: #dc2626;">
                1.800€/mes
              </p>
            </div>
            <div>
              <p style="margin: 0; font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                Después
              </p>
              <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: 700; color: #10b981;">
                3.200€/mes
              </p>
            </div>
          </div>

          <p style="font-size: 15px; line-height: 1.6; margin: 15px 0 0 0; color: #065f46;">
            + <strong>1.400€/mes</strong> de incremento<br>
            + <strong>16.800€/año</strong> extra<br>
            - <strong>6 horas/semana</strong> de trabajo
          </p>
        </div>

        <div style="margin: 30px 0;">
          <h2 style="color: #1f2937; font-size: 20px; margin: 0 0 15px 0;">
            Lo más importante
          </h2>
          <p style="font-size: 16px; line-height: 1.6;">
            Laura no hizo magia. No tiene conocimientos técnicos especiales.
          </p>
          <p style="font-size: 16px; line-height: 1.6;">
            Solo aplicó <strong>3 cambios concretos</strong> que cualquiera puede copiar.
          </p>
          <p style="font-size: 16px; line-height: 1.6;">
            (Y sí, documenté todo el proceso paso a paso en el blog, con números reales y screenshots)
          </p>

          <a href="${appUrl}/blog"
             style="display: inline-block; background: #7c3aed; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 500; margin-top: 10px;">
            Ver el caso completo →
          </a>
        </div>

        <div style="margin: 30px 0; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 15px; line-height: 1.6; color: #6b7280;">
            PD: ¿Quieres saber cuál de los 3 cambios tuvo más impacto?
            (Spoiler: no fue el que ella esperaba). Todo está en el blog.
          </p>
        </div>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">
            © ${new Date().getFullYear()} Itineramio ·
            <a href="${appUrl}" style="color: #7c3aed; text-decoration: none;">Visitar web</a>
          </p>
        </div>
      </div>
    `,
    reply_to: REPLY_TO_EMAIL,
    tags: [{ name: 'sequence', value: 'day7' }, { name: 'archetype', value: archetype.toLowerCase() }],
  })

  if (error) {
    console.error('Error sending Day 7 email:', error)
    return { success: false, error }
  }

  return { success: true, data }
}

/**
 * Envía email día 10 - Invitación a prueba
 */
export async function sendDay10TrialEmail({
  email,
  name,
  archetype,
}: {
  email: string
  name: string
  archetype: EmailArchetype
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: '¿15 días para probarlo sin riesgo?',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937;">
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Hola ${name},
        </p>

        <p style="font-size: 16px; line-height: 1.6;">
          Durante la última semana te he enviado contenido que espero que te haya sido útil.
        </p>

        <p style="font-size: 16px; line-height: 1.6;">
          Hoy quiero presentarte <strong>Itineramio</strong>, la herramienta que he construido para ayudarte
          a gestionar tus alojamientos de forma más eficiente.
        </p>

        <div style="margin: 30px 0; padding: 25px; background: #f9fafb; border-radius: 8px;">
          <h2 style="color: #7c3aed; margin: 0 0 15px 0; font-size: 20px;">
            ¿Qué es Itineramio?
          </h2>
          <p style="font-size: 15px; line-height: 1.6; margin: 0 0 15px 0;">
            Una plataforma que centraliza todo lo que necesitas para gestionar tus propiedades:
          </p>

          <ul style="margin: 0; padding-left: 20px;">
            <li style="margin: 10px 0; font-size: 15px; line-height: 1.6;">
              <strong>Manual digital inteligente</strong> – Crea el manual de tu propiedad en minutos con IA
            </li>
            <li style="margin: 10px 0; font-size: 15px; line-height: 1.6;">
              <strong>QR con toda la info</strong> – Check-in, Wi-Fi, normas, todo en un código
            </li>
            <li style="margin: 10px 0; font-size: 15px; line-height: 1.6;">
              <strong>Recursos y guías</strong> – Contenido específico para tu perfil de anfitrión
            </li>
            <li style="margin: 10px 0; font-size: 15px; line-height: 1.6;">
              <strong>Soporte normativo</strong> – Mantente al día con la regulación local
            </li>
          </ul>
        </div>

        <div style="margin: 30px 0; padding: 25px; background: #ede9fe; border-radius: 8px; text-align: center;">
          <h2 style="color: #7c3aed; margin: 0 0 10px 0; font-size: 22px;">
            Pruébalo 15 días gratis
          </h2>
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Sin tarjeta de crédito. Sin compromiso.
          </p>

          <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: left;">
            <p style="margin: 0 0 10px 0; font-size: 15px;">
              ✓ Acceso completo a todas las funcionalidades
            </p>
            <p style="margin: 0 0 10px 0; font-size: 15px;">
              ✓ Crea manuales para hasta 3 propiedades
            </p>
            <p style="margin: 0 0 10px 0; font-size: 15px;">
              ✓ Genera tus códigos QR personalizados
            </p>
            <p style="margin: 0; font-size: 15px;">
              ✓ Cancela cuando quieras (en serio)
            </p>
          </div>

          <a href="${appUrl}/register"
             style="display: inline-block; background: #7c3aed; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; margin-top: 10px;">
            Comenzar prueba gratuita →
          </a>
        </div>

        <div style="margin: 30px 0;">
          <h3 style="color: #1f2937; font-size: 18px; margin: 0 0 15px 0;">
            ¿Por qué ahora?
          </h3>
          <p style="font-size: 15px; line-height: 1.6;">
            Porque cuanto antes empieces, antes verás resultados. Si los casos que te compartí
            (Laura, los 3 errores, etc.) te resonaron, la prueba no tiene riesgo.
          </p>
          <p style="font-size: 15px; line-height: 1.6;">
            Si en 15 días ves que no es para ti, cancelas. Sin preguntas, sin líos.
          </p>
        </div>

        <div style="margin: 30px 0; padding: 20px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
          <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #92400e;">
            <strong>Nota importante:</strong> Durante el trial tendrás acceso a mí por email.
            Si tienes dudas, pregúntame. Respondo en menos de 24h.
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${appUrl}/register"
             style="display: inline-block; background: #7c3aed; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
            Sí, quiero probar 15 días gratis →
          </a>
        </div>

        <div style="margin: 30px 0; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 15px; line-height: 1.6; color: #6b7280;">
            PD: Si tienes preguntas antes de probar, responde a este email.
            Prefiero que empieces con claridad total que con dudas.
          </p>
        </div>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">
            © ${new Date().getFullYear()} Itineramio ·
            <a href="${appUrl}" style="color: #7c3aed; text-decoration: none;">Visitar web</a>
          </p>
        </div>
      </div>
    `,
    reply_to: REPLY_TO_EMAIL,
    tags: [{ name: 'sequence', value: 'day10' }, { name: 'type', value: 'trial' }, { name: 'archetype', value: archetype.toLowerCase() }],
  })

  if (error) {
    console.error('Error sending Day 10 email:', error)
    return { success: false, error }
  }

  return { success: true, data }
}

/**
 * Envía email día 14 - Última oportunidad
 */
export async function sendDay14UrgencyEmail({
  email,
  name,
  archetype,
}: {
  email: string
  name: string
  archetype: EmailArchetype
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Última vez que te escribo sobre esto',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937;">
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Hola ${name},
        </p>

        <p style="font-size: 16px; line-height: 1.6;">
          Este es mi último email sobre Itineramio. Promesa.
        </p>

        <p style="font-size: 16px; line-height: 1.6;">
          Hace 2 semanas te envié el análisis de tu perfil de anfitrión. Luego compartí contigo
          errores comunes, el caso de Laura, y finalmente te invité a probar la herramienta.
        </p>

        <div style="margin: 30px 0; padding: 25px; background: #f9fafb; border-radius: 8px;">
          <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 20px;">
            Ahora tienes 3 opciones:
          </h2>

          <div style="margin-bottom: 20px;">
            <h3 style="color: #7c3aed; font-size: 17px; margin: 0 0 8px 0;">
              Opción 1: Probar los 15 días gratis
            </h3>
            <p style="font-size: 15px; line-height: 1.6; margin: 0; color: #4b5563;">
              Cero riesgo. Cero compromiso. Si no te convence, cancelas y seguimos siendo amigos.
            </p>
            <a href="${appUrl}/register"
               style="display: inline-block; margin-top: 10px; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 15px;">
              Comenzar prueba →
            </a>
          </div>

          <div style="margin-bottom: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <h3 style="color: #1f2937; font-size: 17px; margin: 0 0 8px 0;">
              Opción 2: No te interesa ahora
            </h3>
            <p style="font-size: 15px; line-height: 1.6; margin: 0; color: #4b5563;">
              Perfecto. Simplemente archiva estos emails y cuando necesites algo, sabes dónde encontrarme.
            </p>
          </div>

          <div style="padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <h3 style="color: #1f2937; font-size: 17px; margin: 0 0 8px 0;">
              Opción 3: Necesitas más información
            </h3>
            <p style="font-size: 15px; line-height: 1.6; margin: 0 0 10px 0; color: #4b5563;">
              Responde a este email con tus preguntas. Te respondo en menos de 24h.
            </p>
            <p style="font-size: 14px; line-height: 1.6; margin: 0; color: #6b7280; font-style: italic;">
              (Preguntas reales que me han hecho: "¿funciona con X propiedades?", "¿qué pasa si cancelo?",
              "¿puedo migrar mi contenido actual?")
            </p>
          </div>
        </div>

        <div style="margin: 30px 0; padding: 25px; background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 4px;">
          <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600; color: #92400e;">
            ¿Por qué insisto tanto?
          </p>
          <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #78350f;">
            Porque he visto a demasiados anfitriones perder tiempo y dinero por no tener
            las herramientas correctas. Si Itineramio puede ahorrarte 5 horas/mes (o ganar 300€/mes más),
            sería injusto no decírtelo.
          </p>
        </div>

        <p style="font-size: 16px; line-height: 1.6;">
          Dicho esto, respeto completamente tu decisión.
        </p>

        <p style="font-size: 16px; line-height: 1.6;">
          Si decides probar, genial. Si no, también genial. No voy a seguir insistiendo.
        </p>

        <div style="text-align: center; margin: 40px 0;">
          <a href="${appUrl}/register"
             style="display: inline-block; background: #7c3aed; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
            Sí, quiero probar 15 días gratis →
          </a>
        </div>

        <div style="margin: 30px 0; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 15px; line-height: 1.6;">
            Gracias por tu tiempo estas últimas semanas, ${name}.
          </p>
          <p style="font-size: 15px; line-height: 1.6;">
            Sea cual sea tu decisión, te deseo mucho éxito con tus propiedades.
          </p>
          <p style="font-size: 15px; line-height: 1.6; margin-bottom: 0;">
            Un abrazo,<br>
            El equipo de Itineramio
          </p>
        </div>

        <div style="margin: 30px 0; padding: 20px; background: #f9fafb; border-radius: 6px;">
          <p style="margin: 0 0 10px 0; font-size: 13px; color: #6b7280; font-weight: 600;">
            PD: Si decides no probar
          </p>
          <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #6b7280;">
            ¿Me harías un favor? Responde con una línea diciéndome por qué.
            No para convencerte, sino para entender cómo mejorar. Gracias.
          </p>
        </div>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">
            © ${new Date().getFullYear()} Itineramio ·
            <a href="${appUrl}" style="color: #7c3aed; text-decoration: none;">Visitar web</a>
          </p>
        </div>
      </div>
    `,
    reply_to: REPLY_TO_EMAIL,
    tags: [{ name: 'sequence', value: 'day14' }, { name: 'type', value: 'urgency' }, { name: 'archetype', value: archetype.toLowerCase() }],
  })

  if (error) {
    console.error('Error sending Day 14 email:', error)
    return { success: false, error }
  }

  return { success: true, data }
}

/**
 * Programa una secuencia de emails de onboarding
 */
export async function scheduleOnboardingSequence({
  email,
  name,
  archetype,
  source,
}: EmailSubscriber & { archetype: EmailArchetype }) {
  // Esta función se implementará cuando tengamos las secuencias
  // Por ahora, solo enviamos el email inicial

  if (source === 'test') {
    return sendWelcomeTestEmail({ email, name: name || '', archetype })
  } else if (source === 'qr') {
    return sendWelcomeQREmail({ email, name: name || '' })
  }

  return { success: true }
}

// ========================================
// FUNCIONES DE AUDIENCIA (Resend Audiences API)
// ========================================

/**
 * Añade un contacto a la audiencia de Resend
 * Nota: Requiere tener configurada una audiencia en Resend
 */
export async function addToAudience({
  email,
  firstName,
  lastName,
}: {
  email: string
  firstName?: string
  lastName?: string
}) {
  try {
    // Resend Audiences API (si tienes una audiencia creada)
    // Por ahora guardamos en nuestra DB y usamos tags en emails
    return { success: true }
  } catch (error) {
    console.error('Error adding to audience:', error)
    return { success: false, error }
  }
}

/**
 * Elimina un contacto de la audiencia
 */
export async function removeFromAudience(email: string) {
  try {
    // Implementar unsubscribe
    return { success: true }
  } catch (error) {
    console.error('Error removing from audience:', error)
    return { success: false, error }
  }
}

// ========================================
// EMAILS DE TRIAL EXPIRATION
// ========================================

/**
 * Envía email 3 días antes de expirar el trial
 */
export async function sendTrialWarning3DaysEmail({
  email,
  name,
  propertyName,
  daysRemaining,
}: {
  email: string
  name: string
  propertyName: string
  daysRemaining: number
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://itineramio.com'

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `⏰ Tu período de prueba termina en ${daysRemaining} días`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">⏰ Quedan ${daysRemaining} días de prueba</h1>
        </div>

        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Hola ${name},
          </p>

          <p style="font-size: 16px; line-height: 1.6;">
            Tu período de prueba para <strong>"${propertyName}"</strong> termina en <strong>${daysRemaining} días</strong>.
          </p>

          <div style="margin: 25px 0; padding: 20px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
            <p style="margin: 0; font-size: 15px; color: #92400e;">
              <strong>⚠️ Importante:</strong> Cuando el período de prueba termine, tu propiedad será suspendida y los huéspedes no podrán acceder al manual digital.
            </p>
          </div>

          <h3 style="color: #7c3aed; margin: 25px 0 15px 0;">¿Qué obtienes activando tu plan?</h3>

          <ul style="margin: 0; padding-left: 20px;">
            <li style="margin: 10px 0; font-size: 15px; line-height: 1.6;">
              ✅ Tu propiedad activa permanentemente
            </li>
            <li style="margin: 10px 0; font-size: 15px; line-height: 1.6;">
              ✅ QR funcional para tus huéspedes
            </li>
            <li style="margin: 10px 0; font-size: 15px; line-height: 1.6;">
              ✅ Actualizaciones ilimitadas del manual
            </li>
            <li style="margin: 10px 0; font-size: 15px; line-height: 1.6;">
              ✅ Soporte prioritario
            </li>
          </ul>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${appUrl}/account/plans"
               style="display: inline-block; background: #7c3aed; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
              Ver planes y activar →
            </a>
          </div>

          <p style="font-size: 14px; color: #6b7280; text-align: center;">
            ¿Tienes preguntas? Responde a este email, te ayudamos.
          </p>
        </div>

        <div style="margin-top: 30px; text-align: center;">
          <p style="font-size: 12px; color: #9ca3af;">
            © ${new Date().getFullYear()} Itineramio ·
            <a href="${appUrl}" style="color: #7c3aed; text-decoration: none;">itineramio.com</a>
          </p>
        </div>
      </div>
    `,
    reply_to: REPLY_TO_EMAIL,
    tags: [{ name: 'type', value: 'trial_warning' }, { name: 'days', value: '3' }],
  })

  if (error) {
    console.error('Error sending trial warning 3 days email:', error)
    return { success: false, error }
  }

  return { success: true, data }
}

/**
 * Envía email 1 día antes de expirar el trial
 */
export async function sendTrialWarning1DayEmail({
  email,
  name,
  propertyName,
}: {
  email: string
  name: string
  propertyName: string
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://itineramio.com'

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `🚨 ÚLTIMO DÍA: Tu propiedad "${propertyName}" se suspende mañana`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937;">
        <div style="background: #dc2626; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🚨 ÚLTIMO DÍA DE PRUEBA</h1>
        </div>

        <div style="background: #fef2f2; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Hola ${name},
          </p>

          <p style="font-size: 16px; line-height: 1.6;">
            <strong>Hoy es el último día</strong> de tu período de prueba para <strong>"${propertyName}"</strong>.
          </p>

          <div style="margin: 25px 0; padding: 20px; background: #fee2e2; border: 2px solid #dc2626; border-radius: 8px;">
            <p style="margin: 0; font-size: 16px; color: #991b1b; font-weight: 600;">
              ⚠️ Mañana tu propiedad será suspendida
            </p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #991b1b;">
              Los huéspedes no podrán acceder al manual digital ni escanear los códigos QR.
            </p>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0;">Activa tu plan en 2 minutos:</h3>
            <ol style="margin: 0; padding-left: 20px;">
              <li style="margin: 8px 0; font-size: 15px;">Ve a "Mi cuenta" → "Planes"</li>
              <li style="margin: 8px 0; font-size: 15px;">Elige el plan que mejor se adapte</li>
              <li style="margin: 8px 0; font-size: 15px;">Completa el pago</li>
              <li style="margin: 8px 0; font-size: 15px;">¡Listo! Tu propiedad seguirá activa</li>
            </ol>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${appUrl}/account/plans"
               style="display: inline-block; background: #dc2626; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 18px;">
              🔒 Activar ahora y no perder acceso
            </a>
          </div>

          <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 20px;">
            ¿Necesitas ayuda urgente? Responde a este email.
          </p>
        </div>

        <div style="margin-top: 30px; text-align: center;">
          <p style="font-size: 12px; color: #9ca3af;">
            © ${new Date().getFullYear()} Itineramio ·
            <a href="${appUrl}" style="color: #7c3aed; text-decoration: none;">itineramio.com</a>
          </p>
        </div>
      </div>
    `,
    reply_to: REPLY_TO_EMAIL,
    tags: [{ name: 'type', value: 'trial_warning' }, { name: 'days', value: '1' }, { name: 'urgent', value: 'true' }],
  })

  if (error) {
    console.error('Error sending trial warning 1 day email:', error)
    return { success: false, error }
  }

  return { success: true, data }
}

/**
 * Envía email cuando el trial ha expirado
 */
export async function sendTrialExpiredEmail({
  email,
  name,
  propertyName,
}: {
  email: string
  name: string
  propertyName: string
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://itineramio.com'

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `😔 Tu propiedad "${propertyName}" ha sido suspendida`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937;">
        <div style="background: #374151; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Período de prueba finalizado</h1>
        </div>

        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Hola ${name},
          </p>

          <p style="font-size: 16px; line-height: 1.6;">
            Tu período de prueba ha terminado y tu propiedad <strong>"${propertyName}"</strong> ha sido suspendida.
          </p>

          <div style="margin: 25px 0; padding: 20px; background: #f3f4f6; border-radius: 8px;">
            <h3 style="color: #1f2937; margin: 0 0 10px 0;">¿Qué significa esto?</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li style="margin: 8px 0; font-size: 15px; color: #4b5563;">Los huéspedes no pueden acceder al manual</li>
              <li style="margin: 8px 0; font-size: 15px; color: #4b5563;">Los códigos QR no funcionan</li>
              <li style="margin: 8px 0; font-size: 15px; color: #4b5563;">Tu contenido está guardado (no se ha borrado nada)</li>
            </ul>
          </div>

          <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #10b981;">
            <h3 style="color: #065f46; margin: 0 0 10px 0;">✨ Buenas noticias</h3>
            <p style="margin: 0; font-size: 15px; color: #047857;">
              Todo tu contenido está guardado. Activa un plan y tu propiedad volverá a funcionar <strong>inmediatamente</strong> con todo intacto.
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${appUrl}/account/plans"
               style="display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
              Reactivar mi propiedad →
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

          <p style="font-size: 14px; color: #6b7280;">
            Si decidiste no continuar, gracias por haber probado Itineramio. Si cambias de opinión, tu contenido estará esperándote.
          </p>

          <p style="font-size: 14px; color: #6b7280;">
            ¿Tienes feedback? Nos encantaría saber cómo podemos mejorar. Simplemente responde a este email.
          </p>
        </div>

        <div style="margin-top: 30px; text-align: center;">
          <p style="font-size: 12px; color: #9ca3af;">
            © ${new Date().getFullYear()} Itineramio ·
            <a href="${appUrl}" style="color: #7c3aed; text-decoration: none;">itineramio.com</a>
          </p>
        </div>
      </div>
    `,
    reply_to: REPLY_TO_EMAIL,
    tags: [{ name: 'type', value: 'trial_expired' }],
  })

  if (error) {
    console.error('Error sending trial expired email:', error)
    return { success: false, error }
  }

  return { success: true, data }
}

// ========================================
// EMAILS DE SECUENCIA POR NIVEL
// ========================================

export type NivelType = 'principiante' | 'intermedio' | 'avanzado' | 'profesional'

/**
 * Envía email día 1 de la secuencia por nivel
 */
export async function sendNivelDay1Email({
  email,
  name,
  nivel,
}: {
  email: string
  name: string
  nivel: NivelType
}) {
  const { default: NivelDay1Email, getNivelDay1Subject } = await import(
    '../emails/templates/nivel-day1-bienvenida'
  )

  return sendEmail({
    to: email,
    subject: getNivelDay1Subject(nivel),
    react: NivelDay1Email({ name, nivel }),
    tags: ['nivel_sequence', 'day1', nivel],
  })
}

/**
 * Envía email día 2 de la secuencia por nivel
 */
export async function sendNivelDay2Email({
  email,
  name,
  nivel,
}: {
  email: string
  name: string
  nivel: NivelType
}) {
  const { default: NivelDay2Email, getNivelDay2Subject } = await import(
    '../emails/templates/nivel-day2-mejores-practicas'
  )

  return sendEmail({
    to: email,
    subject: getNivelDay2Subject(nivel),
    react: NivelDay2Email({ name, nivel }),
    tags: ['nivel_sequence', 'day2', nivel],
  })
}

/**
 * Envía email día 3 de la secuencia por nivel (Test CTA)
 */
export async function sendNivelDay3Email({
  email,
  name,
  nivel,
}: {
  email: string
  name: string
  nivel: NivelType
}) {
  const { default: NivelDay3Email, getNivelDay3Subject } = await import(
    '../emails/templates/nivel-day3-test-cta'
  )

  return sendEmail({
    to: email,
    subject: getNivelDay3Subject(nivel),
    react: NivelDay3Email({ name, nivel }),
    tags: ['nivel_sequence', 'day3', nivel],
  })
}

/**
 * Envía email día 5 de la secuencia por nivel (Caso estudio)
 */
export async function sendNivelDay5Email({
  email,
  name,
  nivel,
}: {
  email: string
  name: string
  nivel: NivelType
}) {
  const { default: NivelDay5Email, getNivelDay5Subject } = await import(
    '../emails/templates/nivel-day5-caso-estudio'
  )

  return sendEmail({
    to: email,
    subject: getNivelDay5Subject(nivel),
    react: NivelDay5Email({ name, nivel }),
    tags: ['nivel_sequence', 'day5', nivel],
  })
}

/**
 * Envía email día 7 de la secuencia por nivel (Recurso avanzado)
 */
export async function sendNivelDay7Email({
  email,
  name,
  nivel,
}: {
  email: string
  name: string
  nivel: NivelType
}) {
  const { default: NivelDay7Email, getNivelDay7Subject } = await import(
    '../emails/templates/nivel-day7-recurso-avanzado'
  )

  return sendEmail({
    to: email,
    subject: getNivelDay7Subject(nivel),
    react: NivelDay7Email({ name, nivel }),
    tags: ['nivel_sequence', 'day7', nivel],
  })
}

// ========================================
// SOAP OPERA SEQUENCE (15 dias, 8 emails)
// Secuencia principal de conversion basada en storytelling
// ========================================

export type SoapOperaNivel = 'principiante' | 'intermedio' | 'avanzado' | 'profesional'

interface SoapOperaEmailParams {
  email: string
  name: string
  nivel: SoapOperaNivel
}

/**
 * EMAIL 1 - DIA 1: "Tu Historia Comienza Aqui"
 * Bienvenida + Conexion emocional + Cliffhanger
 */
export async function sendSoapOperaEmail1({
  email,
  name,
  nivel,
}: SoapOperaEmailParams) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://itineramio.com'

  const nivelContent: Record<SoapOperaNivel, { subject: string; intro: string; story: string; cliffhanger: string }> = {
    principiante: {
      subject: `${name}, tu resultado revela algo importante...`,
      intro: 'Acabas de dar el primer paso que el 90% de anfitriones nunca da: evaluar donde estas realmente.',
      story: 'Cuando empece como anfitrion, cometia exactamente los mismos errores que veo en principiantes hoy. Pensaba que saberlo todo era cuestion de tiempo. Spoiler: no lo era. Habia algo fundamental que me faltaba entender...',
      cliffhanger: 'Manana te cuento el error #1 que me costo 3 meses de frustracion (y como evitarlo).'
    },
    intermedio: {
      subject: `${name}, estas mas cerca de lo que crees...`,
      intro: 'Tu nivel intermedio significa que ya superaste la curva inicial. Pero hay un punto de inflexion que separa a quienes se estancan de quienes escalan.',
      story: 'Conoci a Laura hace 2 anos. Tenia 2 propiedades, 4.6 estrellas, ocupacion del 75%. "Voy bien", decia. Un ano despues: mismos numeros. Habia algo que no veia...',
      cliffhanger: 'Manana te cuento que descubrio Laura (y como paso de 1.800€ a 3.200€/mes).'
    },
    avanzado: {
      subject: `${name}, el proximo nivel requiere algo diferente...`,
      intro: 'Con tu nivel avanzado, ya dominas las bases. El problema? Las tacticas que te trajeron aqui no te llevaran al siguiente nivel.',
      story: 'Los mejores anfitriones que conozco tienen algo en comun: en algun momento dejaron de optimizar tareas y empezaron a optimizar sistemas. La diferencia parece sutil, pero cambia todo...',
      cliffhanger: 'Manana te revelo el framework que usan los top 1% de anfitriones.'
    },
    profesional: {
      subject: `${name}, hablemos de escalar sin morir en el intento...`,
      intro: 'Tu nivel profesional te pone en el top 5% de anfitriones. El siguiente paso no es hacer mas, es hacer diferente.',
      story: 'Gestionar 1 propiedad requiere esfuerzo. Gestionar 5 requiere sistemas. Gestionar 10+ requiere algo que la mayoria nunca desarrolla: la capacidad de NO hacer...',
      cliffhanger: 'Manana te cuento como un gestor paso de 15 a 40 propiedades trabajando MENOS horas.'
    }
  }

  const content = nivelContent[nivel]

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: content.subject,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937;">
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Hola ${name},
        </p>

        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          ${content.intro}
        </p>

        <div style="margin: 25px 0; padding: 20px; background: #f3f4f6; border-left: 4px solid #7c3aed; border-radius: 4px;">
          <p style="font-size: 15px; line-height: 1.6; margin: 0; font-style: italic;">
            ${content.story}
          </p>
        </div>

        <div style="margin: 25px 0; padding: 20px; background: #ede9fe; border-radius: 8px;">
          <p style="font-size: 16px; line-height: 1.6; margin: 0; color: #5b21b6; font-weight: 500;">
            ⏳ ${content.cliffhanger}
          </p>
        </div>

        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Mientras tanto, responde a este email con una sola palabra que describa tu mayor desafio como anfitrion ahora mismo.
        </p>

        <p style="font-size: 16px; line-height: 1.6;">
          Te leo,<br>
          El equipo de Itineramio
        </p>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">
            © ${new Date().getFullYear()} Itineramio ·
            <a href="${appUrl}" style="color: #7c3aed; text-decoration: none;">itineramio.com</a>
          </p>
          <p style="font-size: 11px; color: #9ca3af; margin: 10px 0 0 0;">
            <a href="${appUrl}/unsubscribe?email=${encodeURIComponent(email)}" style="color: #9ca3af; text-decoration: underline;">Darme de baja</a> ·
            Recibes este email porque completaste el quiz de Itineramio
          </p>
        </div>
      </div>
    `,
    reply_to: REPLY_TO_EMAIL,
    tags: [{ name: 'sequence', value: 'soap_opera' }, { name: 'email', value: '1' }, { name: 'nivel', value: nivel }],
  })

  if (error) {
    console.error('Error sending Soap Opera Email 1:', error)
    return { success: false, error }
  }

  return { success: true, data }
}

/**
 * EMAIL 2 - DIA 3: "El Error que Todos Cometemos"
 * Identificar dolor + Datos + Cliffhanger
 */
export async function sendSoapOperaEmail2({
  email,
  name,
  nivel,
}: SoapOperaEmailParams) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://itineramio.com'

  const nivelContent: Record<SoapOperaNivel, { subject: string; error: string; data: string; cliffhanger: string; articleSlug: string; articleTitle: string }> = {
    principiante: {
      subject: 'El error #1 que te esta costando horas cada semana',
      error: 'No tener un sistema desde el dia 1. Piensas: "Cuando tenga mas reservas, me organizo". Pero ese momento nunca llega. Terminas apagando fuegos constantemente.',
      data: 'El 78% de anfitriones que abandonan en el primer ano lo hacen por agotamiento, no por falta de reservas. Trabajaban MAS, no mejor.',
      cliffhanger: 'Pero hay una forma de empezar con el pie derecho desde hoy. Te la cuento en mi proximo email.',
      articleSlug: 'errores-principiantes-airbnb',
      articleTitle: 'Los 10 Errores Fatales del Principiante'
    },
    intermedio: {
      subject: 'Por que el 75% de ocupacion puede ser una trampa',
      error: 'Medir exito por ocupacion en vez de por ingresos netos. 85% ocupacion a 50€/noche = 1.275€. 65% ocupacion a 75€/noche = 1.462€. Menos trabajo, mas dinero.',
      data: 'Los anfitriones que optimizan por RevPAR (ingreso por noche disponible) ganan un 23% mas que los que optimizan por ocupacion.',
      cliffhanger: 'En mi proximo email te cuento exactamente como Laura hizo el cambio (con numeros reales).',
      articleSlug: 'revpar-vs-ocupacion-metrica-que-cambia-todo',
      articleTitle: 'RevPAR vs Ocupacion: La Metrica que Cambia Todo'
    },
    avanzado: {
      subject: 'El error invisible que limita tu crecimiento',
      error: 'Hacer TODO personalmente porque "lo hago mas rapido yo". Verdad hoy, trampa manana. Cada tarea que no delegas es una cadena que te ata.',
      data: 'Los anfitriones que delegan 3+ tareas clave crecen 2.4x mas rapido que los que hacen todo solos.',
      cliffhanger: 'Hay un metodo para identificar QUE delegar primero. Te lo revelo en el proximo email.',
      articleSlug: 'del-modo-bombero-al-modo-ceo-framework',
      articleTitle: 'Del Modo Bombero al Modo CEO'
    },
    profesional: {
      subject: 'El techo de cristal que nadie menciona',
      error: 'Intentar escalar con los mismos procesos que funcionaban con 5 propiedades. Lo que te trajo aqui te impedira llegar alli.',
      data: 'Solo el 3% de gestores supera las 20 propiedades. No por falta de demanda, sino por cuellos de botella operativos no resueltos.',
      cliffhanger: 'Conozco un gestor que paso de 15 a 40 propiedades en 18 meses. Te cuento su secreto.',
      articleSlug: 'caso-david-15-propiedades',
      articleTitle: 'Caso David: De 8 a 15 Propiedades'
    }
  }

  const content = nivelContent[nivel]

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: content.subject,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937;">
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Hola ${name},
        </p>

        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Te prometi contarte el error que mas veo en anfitriones de tu nivel. Aqui va:
        </p>

        <div style="margin: 25px 0; padding: 25px; background: #fef2f2; border-left: 4px solid #dc2626; border-radius: 4px;">
          <h3 style="color: #dc2626; margin: 0 0 10px 0; font-size: 18px;">
            ⚠️ El Error:
          </h3>
          <p style="font-size: 15px; line-height: 1.6; margin: 0;">
            ${content.error}
          </p>
        </div>

        <div style="margin: 25px 0; padding: 20px; background: #f9fafb; border-radius: 8px;">
          <p style="font-size: 14px; line-height: 1.6; margin: 0; color: #4b5563;">
            📊 <strong>Dato:</strong> ${content.data}
          </p>
        </div>

        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          ¿Te suena familiar? No estas sol@. Es el patron mas comun que veo.
        </p>

        <div style="margin: 25px 0; padding: 20px; background: #f0fdf4; border-radius: 8px;">
          <p style="font-size: 15px; line-height: 1.6; margin: 0 0 15px 0; color: #065f46;">
            📚 <strong>Lectura recomendada:</strong> Profundizo mas sobre este tema en el blog.
          </p>
          <a href="${appUrl}/blog/${content.articleSlug}"
             style="display: inline-block; background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px;">
            Leer: ${content.articleTitle} →
          </a>
        </div>

        <div style="margin: 25px 0; padding: 20px; background: #ede9fe; border-radius: 8px;">
          <p style="font-size: 16px; line-height: 1.6; margin: 0; color: #5b21b6; font-weight: 500;">
            ⏳ ${content.cliffhanger}
          </p>
        </div>

        <p style="font-size: 16px; line-height: 1.6;">
          Un saludo,<br>
          El equipo de Itineramio
        </p>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">
            © ${new Date().getFullYear()} Itineramio ·
            <a href="${appUrl}" style="color: #7c3aed; text-decoration: none;">itineramio.com</a>
          </p>
          <p style="font-size: 11px; color: #9ca3af; margin: 10px 0 0 0;">
            <a href="${appUrl}/unsubscribe?email=${encodeURIComponent(email)}" style="color: #9ca3af; text-decoration: underline;">Darme de baja</a>
          </p>
        </div>
      </div>
    `,
    reply_to: REPLY_TO_EMAIL,
    tags: [{ name: 'sequence', value: 'soap_opera' }, { name: 'email', value: '2' }, { name: 'nivel', value: nivel }],
  })

  if (error) {
    console.error('Error sending Soap Opera Email 2:', error)
    return { success: false, error }
  }

  return { success: true, data }
}

/**
 * EMAIL 3 - DIA 5: "La Revelacion"
 * Momento aha + Solucion + Primer CTA sutil
 */
export async function sendSoapOperaEmail3({
  email,
  name,
  nivel,
}: SoapOperaEmailParams) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://itineramio.com'

  const nivelContent: Record<SoapOperaNivel, { subject: string; revelation: string; solution: string; tip: string; articleSlug: string; articleTitle: string }> = {
    principiante: {
      subject: 'Esto es lo que separa a los que triunfan de los que abandonan',
      revelation: 'Los anfitriones exitosos no tienen mas tiempo ni mas suerte. Tienen SISTEMAS desde el dia 1. Un sistema simple que trabaja por ellos 24/7.',
      solution: 'Un manual digital para huespedes que responde el 80% de preguntas antes de que las hagan. WiFi, check-in, normas, recomendaciones... todo en un QR.',
      tip: 'Tip accionable HOY: Escribe las 5 preguntas que mas te hacen los huespedes. Esas son el 80% de tu trabajo repetitivo.',
      articleSlug: 'automatizacion-airbnb-recupera-8-horas-semanales',
      articleTitle: 'Automatizacion: Recupera 8 Horas Semanales'
    },
    intermedio: {
      subject: 'El cambio que hizo Laura para ganar 1.400€/mes mas',
      revelation: 'Laura dejo de competir por ocupacion y empezo a competir por VALOR. Mejores fotos, mejor precio, mejor experiencia. Menos reservas, mas ingresos.',
      solution: 'Lo que marco la diferencia: dejar de responder las mismas preguntas 50 veces al mes. Automatizo con un manual digital y recupero 8 horas/semana.',
      tip: 'Tip accionable HOY: Calcula tu precio por m2 y comparalo con 5 competidores. Si estas mas de 15% por debajo, tienes margen.',
      articleSlug: 'caso-laura-de-1800-a-3200-euros-mes-historia-completa',
      articleTitle: 'Caso Laura: De 2,540€ a 3,600€/mes'
    },
    avanzado: {
      subject: 'El framework de los anfitriones top 1%',
      revelation: 'No optimizan tareas, optimizan SISTEMAS. La diferencia: una tarea la haces tu, un sistema trabaja sin ti.',
      solution: 'El primer sistema que debes crear: comunicacion automatizada. Mensajes de bienvenida, instrucciones, seguimiento... todo en piloto automatico.',
      tip: 'Tip accionable HOY: Cronometra cuanto tiempo pasas respondiendo mensajes esta semana. Ese numero x52 = horas/ano que puedes recuperar.',
      articleSlug: 'automatizacion-airbnb-stack-completo',
      articleTitle: 'Stack de Automatizacion Completo'
    },
    profesional: {
      subject: 'Como pasar de 15 a 40 propiedades trabajando MENOS',
      revelation: 'El secreto no es trabajar mas horas. Es construir una operacion que escala sin ti. Estandarizar, delegar, automatizar. En ese orden.',
      solution: 'El primer paso: documentar TODO. Si esta en tu cabeza, no escala. Si esta documentado + automatizado, multiplica.',
      tip: 'Tip accionable HOY: Identifica la tarea que mas tiempo te consume. Esa es tu primer candidata a sistematizar.',
      articleSlug: 'modo-bombero-a-ceo-escalar-airbnb',
      articleTitle: 'Del Modo Bombero al Modo CEO: Como Escalar'
    }
  }

  const content = nivelContent[nivel]

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: content.subject,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937;">
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Hola ${name},
        </p>

        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Hoy te revelo lo que cambia todo:
        </p>

        <div style="margin: 25px 0; padding: 25px; background: #ecfdf5; border-left: 4px solid #10b981; border-radius: 4px;">
          <h3 style="color: #065f46; margin: 0 0 10px 0; font-size: 18px;">
            💡 La Revelacion:
          </h3>
          <p style="font-size: 15px; line-height: 1.6; margin: 0;">
            ${content.revelation}
          </p>
        </div>

        <div style="margin: 25px 0; padding: 20px; background: #f9fafb; border-radius: 8px;">
          <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 17px;">
            ¿Como se traduce en la practica?
          </h3>
          <p style="font-size: 15px; line-height: 1.6; margin: 0;">
            ${content.solution}
          </p>
        </div>

        <div style="margin: 25px 0; padding: 20px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
          <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 17px;">
            🎯 ${content.tip}
          </h3>
        </div>

        <div style="margin: 25px 0; padding: 20px; background: #f0fdf4; border-radius: 8px;">
          <p style="font-size: 15px; line-height: 1.6; margin: 0 0 15px 0; color: #065f46;">
            📚 <strong>Lectura recomendada:</strong> Guia completa sobre este tema.
          </p>
          <a href="${appUrl}/blog/${content.articleSlug}"
             style="display: inline-block; background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px;">
            Leer: ${content.articleTitle} →
          </a>
        </div>

        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Si quieres ver como funciona en la practica, hemos creado una herramienta que automatiza exactamente esto.
        </p>

        <div style="text-align: center; margin: 25px 0;">
          <a href="${appUrl}/register"
             style="display: inline-block; background: #7c3aed; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 500;">
            Ver como funciona →
          </a>
        </div>

        <p style="font-size: 16px; line-height: 1.6;">
          Un saludo,<br>
          El equipo de Itineramio
        </p>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">
            © ${new Date().getFullYear()} Itineramio ·
            <a href="${appUrl}" style="color: #7c3aed; text-decoration: none;">itineramio.com</a>
          </p>
          <p style="font-size: 11px; color: #9ca3af; margin: 10px 0 0 0;">
            <a href="${appUrl}/unsubscribe?email=${encodeURIComponent(email)}" style="color: #9ca3af; text-decoration: underline;">Darme de baja</a> ·
            Recibes este email porque completaste el quiz de Itineramio
          </p>
        </div>
      </div>
    `,
    reply_to: REPLY_TO_EMAIL,
    tags: [{ name: 'sequence', value: 'soap_opera' }, { name: 'email', value: '3' }, { name: 'nivel', value: nivel }],
  })

  if (error) {
    console.error('Error sending Soap Opera Email 3:', error)
    return { success: false, error }
  }

  return { success: true, data }
}

/**
 * EMAIL 4 - DIA 7: "Caso de Exito"
 * Prueba social + Numeros reales + CTA
 */
export async function sendSoapOperaEmail4({
  email,
  name,
  nivel,
}: SoapOperaEmailParams) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://itineramio.com'

  const nivelContent: Record<SoapOperaNivel, { subject: string; caseName: string; before: string; after: string; change: string; result: string; articleSlug: string; articleTitle: string }> = {
    principiante: {
      subject: 'Como Maria paso de estresada a 4.9 estrellas en 2 meses',
      caseName: 'Maria',
      before: 'Empezaba con su primer apartamento. Recibia 15+ mensajes diarios con preguntas basicas. Dormia con el movil en la mano.',
      after: 'Creo un manual digital simple. Las preguntas bajaron un 80%. Ahora dedica 30 min/dia maximo.',
      change: 'Un solo cambio: dar la informacion ANTES de que la pidan.',
      result: 'De 4.2 a 4.9 estrellas. Y lo mas importante: duerme tranquila.',
      articleSlug: 'primer-mes-anfitrion-airbnb',
      articleTitle: 'Tu Primer Mes como Anfitrion: Guia Completa'
    },
    intermedio: {
      subject: 'De 1.800€ a 3.200€/mes (misma propiedad)',
      caseName: 'Laura',
      before: 'Valencia, 2 anos como anfitriona. 82% ocupacion, 4.7 estrellas, 1.800€/mes. "Voy bien", pensaba.',
      after: 'Optimizo precio (+25%), mejoro fotos, automatizo comunicaciones. 65% ocupacion, 3.200€/mes.',
      change: 'Dejo de competir por ocupacion. Empezo a competir por valor.',
      result: '+1.400€/mes. -6 horas/semana de trabajo. Mejor rating.',
      articleSlug: 'caso-laura-de-1800-a-3200-euros-mes-historia-completa',
      articleTitle: 'Caso Laura: Historia Completa'
    },
    avanzado: {
      subject: 'El anfitrion que se fue 3 meses de viaje sin tocar nada',
      caseName: 'Carlos',
      before: '4 propiedades en Barcelona. 12+ horas/semana gestionando. No podia desconectar ni en vacaciones.',
      after: 'Sistematizo todo: comunicaciones, limpieza, incidencias. Contrato una persona a tiempo parcial.',
      change: 'Paso de hacer tareas a disenar sistemas.',
      result: 'Se fue 3 meses a Asia. Ingresos subieron un 8%. Trabaja 3 horas/semana.',
      articleSlug: 'del-modo-bombero-al-modo-ceo-framework',
      articleTitle: 'Del Modo Bombero al Modo CEO'
    },
    profesional: {
      subject: 'De 15 a 40 propiedades en 18 meses',
      caseName: 'Roberto',
      before: 'Gestionaba 15 propiedades. Trabajaba 60+ horas/semana. No podia crecer mas sin "morir".',
      after: 'Estandarizo TODA la operacion. Contrato equipo. Automatizo el 70% de procesos.',
      change: 'Dejo de ser "el que hace" para ser "el que diseña".',
      result: '40 propiedades. 35 horas/semana. Margenes 15% mejores que antes.',
      articleSlug: 'caso-david-15-propiedades',
      articleTitle: 'Caso David: De 8 a 15 Propiedades'
    }
  }

  const content = nivelContent[nivel]

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: content.subject,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937;">
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Hola ${name},
        </p>

        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Hoy quiero contarte la historia de ${content.caseName}. Probablemente te identifiques.
        </p>

        <div style="margin: 25px 0; padding: 25px; background: #fef2f2; border-radius: 8px;">
          <h3 style="color: #dc2626; margin: 0 0 10px 0; font-size: 17px;">
            📍 ANTES:
          </h3>
          <p style="font-size: 15px; line-height: 1.6; margin: 0;">
            ${content.before}
          </p>
        </div>

        <div style="margin: 25px 0; padding: 25px; background: #ecfdf5; border-radius: 8px;">
          <h3 style="color: #065f46; margin: 0 0 10px 0; font-size: 17px;">
            📍 DESPUES:
          </h3>
          <p style="font-size: 15px; line-height: 1.6; margin: 0;">
            ${content.after}
          </p>
        </div>

        <div style="margin: 25px 0; padding: 20px; background: #ede9fe; border-left: 4px solid #7c3aed; border-radius: 4px;">
          <h3 style="color: #5b21b6; margin: 0 0 10px 0; font-size: 17px;">
            🔑 El cambio clave:
          </h3>
          <p style="font-size: 15px; line-height: 1.6; margin: 0;">
            ${content.change}
          </p>
        </div>

        <div style="margin: 25px 0; padding: 20px; background: #f9fafb; border-radius: 8px; text-align: center;">
          <p style="font-size: 18px; font-weight: 600; color: #10b981; margin: 0;">
            ✅ Resultado: ${content.result}
          </p>
        </div>

        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          ${content.caseName} no tiene superpoderes. Solo aplico lo que te estoy contando en estos emails.
        </p>

        <div style="margin: 25px 0; padding: 20px; background: #f0fdf4; border-radius: 8px;">
          <p style="font-size: 15px; line-height: 1.6; margin: 0 0 15px 0; color: #065f46;">
            📚 <strong>Lectura recomendada:</strong> Profundiza en este caso de estudio.
          </p>
          <a href="${appUrl}/blog/${content.articleSlug}"
             style="display: inline-block; background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px;">
            Leer: ${content.articleTitle} →
          </a>
        </div>

        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Si quieres empezar a aplicar esto hoy, puedes probar Itineramio gratis durante 15 dias.
        </p>

        <div style="text-align: center; margin: 25px 0;">
          <a href="${appUrl}/register"
             style="display: inline-block; background: #7c3aed; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 500;">
            Probar 15 dias gratis →
          </a>
        </div>

        <p style="font-size: 16px; line-height: 1.6;">
          Un saludo,<br>
          El equipo de Itineramio
        </p>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">
            © ${new Date().getFullYear()} Itineramio ·
            <a href="${appUrl}" style="color: #7c3aed; text-decoration: none;">itineramio.com</a>
          </p>
          <p style="font-size: 11px; color: #9ca3af; margin: 10px 0 0 0;">
            <a href="${appUrl}/unsubscribe?email=${encodeURIComponent(email)}" style="color: #9ca3af; text-decoration: underline;">Darme de baja</a> ·
            Recibes este email porque completaste el quiz de Itineramio
          </p>
        </div>
      </div>
    `,
    reply_to: REPLY_TO_EMAIL,
    tags: [{ name: 'sequence', value: 'soap_opera' }, { name: 'email', value: '4' }, { name: 'nivel', value: nivel }],
  })

  if (error) {
    console.error('Error sending Soap Opera Email 4:', error)
    return { success: false, error }
  }

  return { success: true, data }
}

/**
 * EMAIL 5 - DIA 9: "El Metodo Paso a Paso"
 * Framework accionable + Valor educativo
 */
export async function sendSoapOperaEmail5({
  email,
  name,
  nivel,
}: SoapOperaEmailParams) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://itineramio.com'

  const nivelContent: Record<SoapOperaNivel, { subject: string; intro: string; steps: Array<{title: string; desc: string}>; articleSlug: string; articleTitle: string }> = {
    principiante: {
      subject: 'Los 3 pasos para empezar con buen pie',
      intro: 'Aqui tienes el framework que habria pagado por conocer cuando empece:',
      steps: [
        { title: 'Paso 1: Documenta TODO', desc: 'WiFi, check-in, normas, electrodomesticos. Si un huesped puede preguntarlo, documentalo. Hazlo una vez, usalo 100.' },
        { title: 'Paso 2: Centraliza la info', desc: 'Un solo lugar donde el huesped encuentre todo. Nada de PDFs, mensajes largos o "esta en el email". Un QR → todo.' },
        { title: 'Paso 3: Anticipa problemas', desc: 'Lista los 5 problemas mas comunes. Crea instrucciones claras para cada uno. El 80% de "emergencias" son preguntas sin respuesta.' }
      ],
      articleSlug: 'kit-anti-caos-anfitriones-airbnb',
      articleTitle: 'Kit Anti-Caos para Anfitriones'
    },
    intermedio: {
      subject: 'El metodo para pasar de ocupacion a rentabilidad',
      intro: 'Esto es lo que separa a los anfitriones intermedios de los avanzados:',
      steps: [
        { title: 'Paso 1: Analiza (no adivines)', desc: 'Calcula tu RevPAR real. Compara con 5 competidores directos. Identifica tu posicion en el mercado con datos, no sensaciones.' },
        { title: 'Paso 2: Optimiza valor', desc: 'Fotos profesionales (ROI de 10x), descripcion que vende beneficios, precio basado en valor no en miedo.' },
        { title: 'Paso 3: Automatiza lo repetitivo', desc: 'Comunicaciones, instrucciones, solicitud de reviews. Si lo haces mas de 3 veces, automatizalo.' }
      ],
      articleSlug: 'revenue-management-avanzado',
      articleTitle: 'Revenue Management Avanzado'
    },
    avanzado: {
      subject: 'Framework: de anfitrion a gestor',
      intro: 'El salto de hacer a delegar requiere estos 3 pasos:',
      steps: [
        { title: 'Paso 1: Documenta procesos', desc: 'Si esta en tu cabeza, no escala. Crea SOPs (procedimientos) para todo. Limpieza, check-in, incidencias, mantenimiento.' },
        { title: 'Paso 2: Construye equipo', desc: 'Empieza pequeno: limpieza + una persona de soporte. Delega UNA cosa, perfeccionala, repite.' },
        { title: 'Paso 3: Mide y mejora', desc: 'KPIs claros: tiempo de respuesta, reviews, incidencias. Lo que no mides, no mejoras. Revisa semanal.' }
      ],
      articleSlug: 'del-modo-bombero-al-modo-ceo-framework',
      articleTitle: 'Del Modo Bombero al Modo CEO: Framework'
    },
    profesional: {
      subject: 'El playbook para escalar sin morir',
      intro: 'Esto es lo que hacen los que gestionan 20+ propiedades sin quemarse:',
      steps: [
        { title: 'Paso 1: Estandariza la operacion', desc: 'Plantillas, checklists, procesos documentados. Cada propiedad nueva debe poder incorporarse en 48h, no en 2 semanas.' },
        { title: 'Paso 2: Invierte en tecnologia', desc: 'PMS, channel manager, automatizacion de comunicaciones. El coste es irrisorio comparado con tu tiempo.' },
        { title: 'Paso 3: Foco en lo que escala', desc: 'Tu trabajo es adquirir propiedades y optimizar sistemas. Todo lo demas: delega o automatiza.' }
      ],
      articleSlug: 'automatizacion-airbnb-stack-completo',
      articleTitle: 'Stack de Automatizacion Completo'
    }
  }

  const content = nivelContent[nivel]

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: content.subject,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937;">
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Hola ${name},
        </p>

        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          ${content.intro}
        </p>

        ${content.steps.map((step, i) => `
          <div style="margin: 20px 0; padding: 20px; background: ${i === 0 ? '#ede9fe' : i === 1 ? '#ecfdf5' : '#fef3c7'}; border-radius: 8px;">
            <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 17px;">
              ${step.title}
            </h3>
            <p style="font-size: 15px; line-height: 1.6; margin: 0; color: #4b5563;">
              ${step.desc}
            </p>
          </div>
        `).join('')}

        <div style="margin: 30px 0; padding: 25px; background: #f9fafb; border-radius: 8px;">
          <h3 style="color: #7c3aed; margin: 0 0 10px 0; font-size: 17px;">
            💡 Consejo extra:
          </h3>
          <p style="font-size: 15px; line-height: 1.6; margin: 0;">
            No intentes hacer los 3 pasos a la vez. Empieza por el Paso 1. Cuando lo tengas dominado (2-3 semanas), pasa al siguiente.
          </p>
        </div>

        <div style="margin: 25px 0; padding: 20px; background: #f0fdf4; border-radius: 8px;">
          <p style="font-size: 15px; line-height: 1.6; margin: 0 0 15px 0; color: #065f46;">
            📚 <strong>Lectura recomendada:</strong> Guia completa de este metodo.
          </p>
          <a href="${appUrl}/blog/${content.articleSlug}"
             style="display: inline-block; background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px;">
            Leer: ${content.articleTitle} →
          </a>
        </div>

        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Si quieres acelerar el proceso, Itineramio te ayuda a implementar esto en horas, no semanas.
        </p>

        <div style="text-align: center; margin: 25px 0;">
          <a href="${appUrl}/register"
             style="display: inline-block; background: #7c3aed; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 500;">
            Empezar gratis →
          </a>
        </div>

        <p style="font-size: 16px; line-height: 1.6;">
          Un saludo,<br>
          El equipo de Itineramio
        </p>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">
            © ${new Date().getFullYear()} Itineramio ·
            <a href="${appUrl}" style="color: #7c3aed; text-decoration: none;">itineramio.com</a>
          </p>
          <p style="font-size: 11px; color: #9ca3af; margin: 10px 0 0 0;">
            <a href="${appUrl}/unsubscribe?email=${encodeURIComponent(email)}" style="color: #9ca3af; text-decoration: underline;">Darme de baja</a> ·
            Recibes este email porque completaste el quiz de Itineramio
          </p>
        </div>
      </div>
    `,
    reply_to: REPLY_TO_EMAIL,
    tags: [{ name: 'sequence', value: 'soap_opera' }, { name: 'email', value: '5' }, { name: 'nivel', value: nivel }],
  })

  if (error) {
    console.error('Error sending Soap Opera Email 5:', error)
    return { success: false, error }
  }

  return { success: true, data }
}

/**
 * EMAIL 6 - DIA 11: "Pero... ¿Y si...?"
 * Resolver objeciones + Testimonios
 */
export async function sendSoapOperaEmail6({
  email,
  name,
  nivel,
}: SoapOperaEmailParams) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://itineramio.com'

  const nivelContent: Record<SoapOperaNivel, { subject: string; objections: Array<{q: string; a: string}> }> = {
    principiante: {
      subject: 'Las 3 dudas que todos tienen (y sus respuestas)',
      objections: [
        { q: '"No tengo tiempo para configurar nada"', a: 'Crear un manual basico lleva 30 minutos. Ahorra 3+ horas/semana. El ROI es brutal.' },
        { q: '"Ya lo hago bien con WhatsApp"', a: 'Funciona... hasta que tienes 3+ reservas al mes. Entonces te conviertes en esclavo del movil.' },
        { q: '"Mis huespedes nunca preguntan mucho"', a: 'Probablemente porque no reservan repetidamente. Los mejores anfitriones anticipan necesidades, no las reaccionan.' }
      ]
    },
    intermedio: {
      subject: 'Las excusas que te mantienen estancado',
      objections: [
        { q: '"Ya uso la app de Airbnb, ¿para que mas?"', a: 'La app es para reservas. No para operaciones. Es como usar Excel para todo: funciona, pero no escala.' },
        { q: '"Subir precios me hara perder reservas"', a: 'Dato: el 70% de anfitriones cobran menos de lo que deberian. Los que suben precios inteligentemente ganan MAS.' },
        { q: '"No tengo perfil tecnico"', a: 'No necesitas serlo. Las herramientas modernas estan hechas para no-tecnicos. Si usas WhatsApp, puedes usar Itineramio.' }
      ]
    },
    avanzado: {
      subject: 'Lo que nadie te dice sobre delegar',
      objections: [
        { q: '"Nadie lo hara tan bien como yo"', a: 'Cierto HOY. Pero un proceso documentado + persona capacitada = 80% de tu calidad con 0% de tu tiempo.' },
        { q: '"Es caro contratar ayuda"', a: 'Calcula tu hora. Si ganas 30€/hora y pagas 12€/hora por delegar, cada hora delegada te genera 18€.' },
        { q: '"Perderé el control"', a: 'Al reves. Con sistemas documentados tienes MAS control, porque no dependes de tu memoria.' }
      ]
    },
    profesional: {
      subject: 'Las barreras mentales que frenan el crecimiento',
      objections: [
        { q: '"El mercado esta saturado"', a: 'Para los genericos, si. Para los sistematizados que ofrecen valor diferencial, hay demanda infinita.' },
        { q: '"Necesito mas capital para crecer"', a: 'Necesitas mejores sistemas, no mas dinero. He visto gestores crecer 3x con margenes negativos porque no escalan eficientemente.' },
        { q: '"Las regulaciones me frenan"', a: 'Frenan a los improvisados. Los profesionales se adaptan y encuentran oportunidades donde otros ven problemas.' }
      ]
    }
  }

  const content = nivelContent[nivel]

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: content.subject,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937;">
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Hola ${name},
        </p>

        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Despues de hablar con cientos de anfitriones, estas son las dudas que siempre surgen:
        </p>

        ${content.objections.map((obj, i) => `
          <div style="margin: 20px 0; padding: 20px; background: #f9fafb; border-radius: 8px;">
            <p style="font-size: 16px; font-weight: 600; color: #dc2626; margin: 0 0 10px 0;">
              ❌ ${obj.q}
            </p>
            <p style="font-size: 15px; line-height: 1.6; margin: 0; color: #4b5563;">
              ✅ ${obj.a}
            </p>
          </div>
        `).join('')}

        <div style="margin: 30px 0; padding: 25px; background: #ede9fe; border-radius: 8px;">
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 15px 0; font-style: italic;">
            "Pensaba que era diferente a los demas. Que mi situacion era especial. Resulta que mis excusas eran las mismas que todos usan. Cuando las supere, todo cambio."
          </p>
          <p style="font-size: 14px; margin: 0; color: #5b21b6; font-weight: 500;">
            — Anfitrion de Itineramio
          </p>
        </div>

        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          ¿Tienes alguna duda que no cubri? Respondeme directamente. Te contesto personalmente.
        </p>

        <div style="text-align: center; margin: 25px 0;">
          <a href="${appUrl}/register"
             style="display: inline-block; background: #7c3aed; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 500;">
            Probar sin riesgo →
          </a>
        </div>

        <p style="font-size: 16px; line-height: 1.6;">
          Un saludo,<br>
          El equipo de Itineramio
        </p>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">
            © ${new Date().getFullYear()} Itineramio ·
            <a href="${appUrl}" style="color: #7c3aed; text-decoration: none;">itineramio.com</a>
          </p>
          <p style="font-size: 11px; color: #9ca3af; margin: 10px 0 0 0;">
            <a href="${appUrl}/unsubscribe?email=${encodeURIComponent(email)}" style="color: #9ca3af; text-decoration: underline;">Darme de baja</a> ·
            Recibes este email porque completaste el quiz de Itineramio
          </p>
        </div>
      </div>
    `,
    reply_to: REPLY_TO_EMAIL,
    tags: [{ name: 'sequence', value: 'soap_opera' }, { name: 'email', value: '6' }, { name: 'nivel', value: nivel }],
  })

  if (error) {
    console.error('Error sending Soap Opera Email 6:', error)
    return { success: false, error }
  }

  return { success: true, data }
}

/**
 * EMAIL 7 - DIA 13: "Solo Quedan 48 Horas"
 * Urgencia + Oferta especial
 */
export async function sendSoapOperaEmail7({
  email,
  name,
  nivel,
}: SoapOperaEmailParams) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://itineramio.com'

  const nivelContent: Record<SoapOperaNivel, { subject: string; offer: string; bonus: string }> = {
    principiante: {
      subject: `${name}, esto expira en 48 horas`,
      offer: 'Trial extendido de 21 dias (en vez de 15) + Plantillas de manual pre-configuradas',
      bonus: 'Si te registras en las proximas 48h, te envio mi checklist personal de "primeros 30 dias como anfitrion".'
    },
    intermedio: {
      subject: 'Ultima oportunidad: oferta para anfitriones intermedios',
      offer: 'Trial de 21 dias + Guia de optimizacion de precios + Sesion de Q&A grupal',
      bonus: 'Bonus: acceso anticipado a las nuevas funciones de analytics cuando las lancemos.'
    },
    avanzado: {
      subject: 'Oferta exclusiva para anfitriones avanzados (48h)',
      offer: 'Trial de 21 dias + Revision 1:1 de tu operacion actual (30 min) + Templates de SOPs',
      bonus: 'Bonus: te incluyo en nuestro grupo privado de anfitriones avanzados.'
    },
    profesional: {
      subject: 'Propuesta especial para gestores profesionales',
      offer: 'Trial extendido + Onboarding personalizado + Soporte prioritario 30 dias',
      bonus: 'Bonus: llamada de estrategia 1:1 para discutir tu caso especifico.'
    }
  }

  const content = nivelContent[nivel]

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: content.subject,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937;">
        <div style="background: #fef3c7; padding: 15px; text-align: center; border-radius: 8px; margin-bottom: 25px;">
          <p style="margin: 0; font-size: 16px; font-weight: 600; color: #92400e;">
            ⏰ Esta oferta expira en 48 horas
          </p>
        </div>

        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Hola ${name},
        </p>

        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Durante las ultimas 2 semanas te he compartido estrategias, casos de exito, y metodos para mejorar tu gestion.
        </p>

        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Ahora quiero darte un empujon extra para que pases a la accion:
        </p>

        <div style="margin: 25px 0; padding: 25px; background: #ede9fe; border-radius: 8px;">
          <h3 style="color: #5b21b6; margin: 0 0 15px 0; font-size: 18px;">
            🎁 Tu oferta especial:
          </h3>
          <p style="font-size: 16px; line-height: 1.6; margin: 0;">
            ${content.offer}
          </p>
        </div>

        <div style="margin: 25px 0; padding: 20px; background: #ecfdf5; border-left: 4px solid #10b981; border-radius: 4px;">
          <p style="font-size: 15px; line-height: 1.6; margin: 0; color: #065f46;">
            <strong>Bonus extra:</strong> ${content.bonus}
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${appUrl}/register"
             style="display: inline-block; background: #7c3aed; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
            Activar mi oferta →
          </a>
        </div>

        <div style="margin: 25px 0; padding: 20px; background: #f9fafb; border-radius: 8px;">
          <p style="font-size: 14px; line-height: 1.6; margin: 0; color: #6b7280;">
            <strong>Sin riesgo:</strong> Puedes cancelar en cualquier momento durante el trial. Si no te convence, no pagas nada. Cero compromisos.
          </p>
        </div>

        <p style="font-size: 16px; line-height: 1.6;">
          Un saludo,<br>
          El equipo de Itineramio
        </p>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">
            © ${new Date().getFullYear()} Itineramio ·
            <a href="${appUrl}" style="color: #7c3aed; text-decoration: none;">itineramio.com</a>
          </p>
          <p style="font-size: 11px; color: #9ca3af; margin: 10px 0 0 0;">
            <a href="${appUrl}/unsubscribe?email=${encodeURIComponent(email)}" style="color: #9ca3af; text-decoration: underline;">Darme de baja</a> ·
            Recibes este email porque completaste el quiz de Itineramio
          </p>
        </div>
      </div>
    `,
    reply_to: REPLY_TO_EMAIL,
    tags: [{ name: 'sequence', value: 'soap_opera' }, { name: 'email', value: '7' }, { name: 'nivel', value: nivel }],
  })

  if (error) {
    console.error('Error sending Soap Opera Email 7:', error)
    return { success: false, error }
  }

  return { success: true, data }
}

/**
 * EMAIL 8 - DIA 15: "Tu Decision"
 * Ultimo email + Cierre elegante
 */
export async function sendSoapOperaEmail8({
  email,
  name,
  nivel,
}: SoapOperaEmailParams) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://itineramio.com'

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `${name}, ¿que decides?`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937;">
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Hola ${name},
        </p>

        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Este es mi ultimo email de esta serie. Promesa.
        </p>

        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Durante 2 semanas te he compartido todo lo que se sobre gestion de alojamientos: errores comunes, metodos probados, casos reales.
        </p>

        <div style="margin: 25px 0; padding: 25px; background: #f9fafb; border-radius: 8px;">
          <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">
            Ahora tienes 2 opciones:
          </h3>

          <div style="margin-bottom: 20px; padding: 15px; background: white; border-left: 4px solid #10b981; border-radius: 4px;">
            <p style="margin: 0; font-size: 15px; line-height: 1.6;">
              <strong style="color: #10b981;">Opcion A:</strong> Probar Itineramio gratis y ver si te ayuda a mejorar tu gestion. Sin riesgo, sin compromiso.
            </p>
          </div>

          <div style="padding: 15px; background: white; border-left: 4px solid #6b7280; border-radius: 4px;">
            <p style="margin: 0; font-size: 15px; line-height: 1.6;">
              <strong style="color: #6b7280;">Opcion B:</strong> No te interesa ahora, y esta bien. Guarda estos emails por si cambias de opinion.
            </p>
          </div>
        </div>

        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Sea cual sea tu decision, gracias por leerme estas semanas. Espero haberte aportado algo de valor.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${appUrl}/register"
             style="display: inline-block; background: #7c3aed; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
            Si, quiero probar gratis →
          </a>
        </div>

        <div style="margin: 25px 0; padding: 20px; background: #fef3c7; border-radius: 8px;">
          <p style="font-size: 14px; line-height: 1.6; margin: 0; color: #92400e;">
            <strong>PD:</strong> Si no es el momento, no pasa nada. Si en algun momento tienes dudas sobre gestion de alojamientos, puedes escribirme directamente respondiendo a cualquier email. Te respondo siempre.
          </p>
        </div>

        <p style="font-size: 16px; line-height: 1.6;">
          Te deseo mucho exito con tus propiedades, ${name}.<br><br>
          Un abrazo,<br>
          El equipo de Itineramio
        </p>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">
            © ${new Date().getFullYear()} Itineramio ·
            <a href="${appUrl}" style="color: #7c3aed; text-decoration: none;">itineramio.com</a>
          </p>
          <p style="font-size: 11px; color: #9ca3af; margin: 10px 0 0 0;">
            <a href="${appUrl}/unsubscribe?email=${encodeURIComponent(email)}" style="color: #9ca3af; text-decoration: underline;">Darme de baja</a> ·
            Recibes este email porque completaste el quiz de Itineramio
          </p>
        </div>
      </div>
    `,
    reply_to: REPLY_TO_EMAIL,
    tags: [{ name: 'sequence', value: 'soap_opera' }, { name: 'email', value: '8' }, { name: 'nivel', value: nivel }],
  })

  if (error) {
    console.error('Error sending Soap Opera Email 8:', error)
    return { success: false, error }
  }

  return { success: true, data }
}

/**
 * Envia email con analisis de precios y PDF adjunto
 */
export async function sendPricingAnalysisEmail({
  email,
  userName,
  propertyType,
  location,
  recommendedPrice,
  minPrice,
  maxPrice,
  monthlyProjection,
  pdfBuffer,
}: {
  email: string
  userName: string
  propertyType: string
  location: string
  recommendedPrice: number
  minPrice: number
  maxPrice: number
  monthlyProjection: number
  pdfBuffer: Buffer
}) {
  const { PricingAnalysisEmail } = await import(
    '@/emails/templates/pricing-analysis'
  )
  const { render } = await import('@react-email/render')

  try {
    const html = await render(
      PricingAnalysisEmail({
        userName,
        propertyType,
        location,
        recommendedPrice,
        minPrice,
        maxPrice,
        monthlyProjection,
      })
    )

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Tu analisis de precios - ${recommendedPrice} EUR/noche recomendado`,
      html,
      reply_to: REPLY_TO_EMAIL,
      attachments: [
        {
          filename: `analisis-precios-itineramio.pdf`,
          content: pdfBuffer,
        },
      ],
      tags: [
        { name: 'type', value: 'pricing_analysis' },
        { name: 'tool', value: 'pricing-calculator' },
      ],
    })

    if (error) {
      console.error('Error sending pricing analysis email:', error)
      return { success: false, error }
    }

    console.log(`[Email Sent] Pricing analysis to ${email}`)
    return { success: true, data }
  } catch (error) {
    console.error('Error rendering or sending pricing analysis email:', error)
    return { success: false, error }
  }
}
