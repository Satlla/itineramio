import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'
import { enrollSubscriberInSequences } from '@/lib/email-sequences'

const resend = new Resend(process.env.RESEND_API_KEY)

interface ChecklistSection {
  title: string
  items: string[]
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, propertyName, propertyAddress, sections, style } = body

    if (!name || !email || !sections) {
      return NextResponse.json(
        { error: 'Nombre, email y secciones son obligatorios' },
        { status: 400 }
      )
    }

    // URL de descarga con parámetros
    const downloadParams = new URLSearchParams({
      nombre: propertyName || 'Mi Propiedad',
      direccion: propertyAddress || '',
      secciones: JSON.stringify(sections)
    })
    const downloadUrl = `https://www.itineramio.com/recursos/checklist-limpieza/descargar?${downloadParams.toString()}`

    // Save lead to database
    try {
      await prisma.lead.create({
        data: {
          name,
          email,
          source: 'checklist-limpieza',
          metadata: { propertyName, propertyAddress, style, sectionsCount: sections.length }
        }
      })
      console.log(`[Lead] Created for ${email} from checklist-limpieza`)
    } catch (dbError) {
      console.error('Error saving lead:', dbError)
    }

    // Create or update EmailSubscriber for tool-specific nurturing sequence
    let subscriber = null
    try {
      const normalizedEmail = email.toLowerCase().trim()
      const toolTags = ['tool_checklist-limpieza', 'herramienta', 'operaciones']

      subscriber = await prisma.emailSubscriber.upsert({
        where: { email: normalizedEmail },
        create: {
          email: normalizedEmail,
          name,
          source: 'tool_checklist-limpieza',
          status: 'active',
          tags: toolTags,
          // NO asignamos archetype - lo descubriremos cuando haga el test
          currentJourneyStage: 'lead',
          engagementScore: 'warm'
        },
        update: {
          // Solo añadir tag si no existe
          tags: {
            push: 'tool_checklist-limpieza'
          },
          updatedAt: new Date()
        }
      })

      console.log(`[EmailSubscriber] Created/updated for ${normalizedEmail} from tool_checklist-limpieza`)

      // Enroll in TOOL-SPECIFIC sequences (not archetype-based)
      await enrollSubscriberInSequences(subscriber.id, 'SUBSCRIBER_CREATED', {
        source: 'tool_checklist-limpieza',
        tags: toolTags
      })

      console.log(`[EmailSubscriber] Enrolled ${normalizedEmail} in sequences`)
    } catch (subscriberError) {
      console.error('Error creating subscriber:', subscriberError)
    }

    // Generate sections HTML for email (estilo limpio como reviews)
    const sectionsHtml = (sections as ChecklistSection[]).map((section, index) => `
      <tr>
        <td style="padding: 12px 24px;${index > 0 ? ' border-top: 1px solid #f3f4f6;' : ''}">
          <p style="margin: 0 0 8px 0; font-size: 10px; font-weight: 600; color: #111827; text-transform: uppercase; letter-spacing: 0.5px;">${section.title}</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${section.items.map(item => `
              <tr>
                <td style="padding: 4px 0; vertical-align: top;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width: 20px; vertical-align: top;">
                        <div style="width: 14px; height: 14px; border: 1px solid #d1d5db; border-radius: 2px; margin-top: 1px;"></div>
                      </td>
                      <td style="padding-left: 8px; vertical-align: top;">
                        <span style="font-size: 12px; color: #4b5563; line-height: 1.4;">${item}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            `).join('')}
          </table>
        </td>
      </tr>
    `).join('')

    // Count total tasks
    const totalTasks = (sections as ChecklistSection[]).reduce((acc, s) => acc + s.items.length, 0)

    // Send email
    const emailResult = await resend.emails.send({
      from: 'Itineramio <recursos@itineramio.com>',
      to: email,
      subject: `Tu Checklist de Limpieza - ${propertyName || 'Profesional'}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px;">

          <!-- Email Header -->
          <tr>
            <td style="padding: 0 0 24px 0; text-align: center;">
              <p style="margin: 0 0 6px 0; color: #9ca3af; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">Itineramio</p>
              <h1 style="margin: 0 0 8px 0; color: #111827; font-size: 22px; font-weight: 600;">Tu Checklist de Limpieza</h1>
              <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.5;">Hola ${name}, aquí tienes tu checklist personalizado listo para imprimir.</p>
            </td>
          </tr>

          <!-- ========== CHECKLIST IMPRIMIBLE ========== -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border: 1px solid #e5e7eb;">

                <!-- Header con nombre del alojamiento -->
                <tr>
                  <td style="padding: 20px 24px; border-bottom: 1px solid #f3f4f6;">
                    <p style="margin: 0; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af;">Alojamiento</p>
                    <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 600; color: #111827;">${propertyName || 'Mi Propiedad'}</p>
                    ${propertyAddress ? `<p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">📍 ${propertyAddress}</p>` : ''}
                    <div style="margin-top: 12px;">
                      <p style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">Checklist de Limpieza</p>
                      <p style="margin: 4px 0 0 0; font-size: 11px; color: #9ca3af;">${totalTasks} tareas · Marcar cada tarea completada</p>
                    </div>
                  </td>
                </tr>

                <!-- Instrucciones -->
                <tr>
                  <td style="padding: 12px 24px; background: #f9fafb;">
                    <p style="margin: 0; font-size: 12px; color: #6b7280; line-height: 1.5;">
                      Completa cada tarea en orden. <strong style="color: #111827;">Marca con ✓</strong> cuando termines cada una.
                    </p>
                  </td>
                </tr>

                <!-- Secciones del Checklist -->
                ${sectionsHtml}

                <!-- Espacio para notas -->
                <tr>
                  <td style="padding: 12px 24px; border-top: 1px solid #f3f4f6;">
                    <p style="margin: 0 0 8px 0; font-size: 10px; font-weight: 600; color: #111827; text-transform: uppercase; letter-spacing: 0.5px;">Notas</p>
                    <div style="border: 1px dashed #d1d5db; border-radius: 4px; padding: 12px; min-height: 40px;">
                      <p style="margin: 0; font-size: 10px; color: #d1d5db;">Espacio para anotaciones...</p>
                    </div>
                  </td>
                </tr>

                <!-- Footer de la plantilla -->
                <tr>
                  <td style="padding: 12px 24px; background: #f9fafb; border-top: 1px solid #f3f4f6;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 10px; color: #9ca3af;">Fecha: ________________</p>
                        </td>
                        <td style="text-align: right;">
                          <p style="margin: 0; font-size: 10px; color: #9ca3af;">Firma: ________________</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Nota final -->
                <tr>
                  <td style="padding: 8px 24px; border-top: 1px solid #f3f4f6;">
                    <p style="margin: 0; font-size: 10px; color: #9ca3af; font-style: italic;">
                      Verificar todas las tareas antes de la llegada del huésped.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
          <!-- ========== FIN CHECKLIST ========== -->

          <!-- Botón de descarga -->
          <tr>
            <td align="center" style="padding: 24px 0 0 0;">
              <a href="${downloadUrl}" style="display: inline-block; background: #111827; color: #ffffff; padding: 12px 28px; text-decoration: none; font-weight: 500; font-size: 13px; border-radius: 6px;">
                Descargar PDF
              </a>
              <p style="margin: 10px 0 0 0; font-size: 11px; color: #9ca3af;">Haz clic para abrir y guardar como PDF</p>
            </td>
          </tr>

          <!-- Instrucciones de impresión -->
          <tr>
            <td style="padding: 24px 0 20px 0;">
              <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 600; color: #111827;">Cómo imprimir tu checklist</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 4px 0; font-size: 12px; color: #6b7280;">1. Abre el enlace de descarga</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 12px; color: #6b7280;">2. Guarda como PDF (Cmd/Ctrl + P → Guardar como PDF)</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 12px; color: #6b7280;">3. Imprime en A4 y plastifica para mayor durabilidad</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 12px; color: #6b7280;">4. Deja una copia visible para tu equipo de limpieza</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Blog -->
          <tr>
            <td align="center" style="padding: 0 0 24px 0;">
              <a href="https://www.itineramio.com/blog" style="display: inline-block; border: 1px solid #e5e7eb; color: #374151; padding: 10px 20px; text-decoration: none; font-weight: 500; font-size: 12px; border-radius: 6px;">
                Más recursos gratuitos
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="text-align: center; padding: 16px 0; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                Creado con <a href="https://www.itineramio.com" style="color: #6b7280; text-decoration: none;">Itineramio</a>
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
    })

    console.log('Resend result:', JSON.stringify(emailResult, null, 2))

    if (emailResult.error) {
      console.error('Resend error:', emailResult.error)
      return NextResponse.json({
        success: false,
        error: emailResult.error.message || 'Error enviando email'
      }, { status: 500 })
    }

    return NextResponse.json({ success: true, emailId: emailResult.data?.id })
  } catch (error) {
    console.error('Error generating checklist:', error)
    return NextResponse.json(
      { error: 'Error al generar el checklist' },
      { status: 500 }
    )
  }
}
