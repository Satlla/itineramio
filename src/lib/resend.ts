import { Resend } from 'resend'
import { render } from '@react-email/render'
import type { ReactElement } from 'react'

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is not set')
}

export const resend = new Resend(process.env.RESEND_API_KEY)

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
    tags: ['lead_magnet', 'download', archetype.toLowerCase()],
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
