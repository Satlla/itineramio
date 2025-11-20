import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { trackEmailEvent, EmailEventType } from '@/lib/email-sequences'

/**
 * Webhook de Resend para trackear eventos de email
 *
 * Eventos soportados:
 * - email.sent: Email enviado correctamente
 * - email.delivered: Email entregado al inbox
 * - email.delivery_delayed: Retraso en la entrega
 * - email.bounced: Email rebotado (hard/soft bounce)
 * - email.opened: Email abierto por el destinatario
 * - email.clicked: Click en un link del email
 * - email.complained: Marcado como spam
 *
 * Configurar en Resend Dashboard:
 * https://resend.com/webhooks
 * URL: https://tudominio.com/api/webhooks/resend
 */

// Tipos de eventos de Resend
type ResendEventType =
  | 'email.sent'
  | 'email.delivered'
  | 'email.delivery_delayed'
  | 'email.bounced'
  | 'email.opened'
  | 'email.clicked'
  | 'email.complained'

interface ResendWebhookPayload {
  type: ResendEventType
  created_at: string
  data: {
    email_id: string
    from: string
    to: string[]
    subject: string
    created_at?: string
    // Específico para bounces
    bounce_type?: 'hard' | 'soft'
    // Específico para clicks
    click?: {
      link: string
      timestamp: string
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parsear el payload
    const payload: ResendWebhookPayload = await request.json()

    console.log('📨 Resend Webhook recibido:', {
      type: payload.type,
      emailId: payload.data.email_id,
      to: payload.data.to,
      timestamp: payload.created_at
    })

    const emailId = payload.data.email_id

    // PRIORIDAD 1: Trackear en el sistema de secuencias automatizadas
    if (emailId) {
      const eventType = payload.type.replace('email.', '') as EmailEventType
      const metadata: any = {}

      if (eventType === 'clicked' && payload.data.click?.link) {
        metadata.url = payload.data.click.link
      }

      if (eventType === 'bounced' && payload.data.bounce_type) {
        metadata.reason = payload.data.bounce_type
      }

      // Intentar trackear en secuencias
      const sequenceResult = await trackEmailEvent(emailId, eventType, metadata)

      if (sequenceResult.success) {
        console.log('✅ Evento trackeado en sistema de secuencias')
        return NextResponse.json({
          received: true,
          tracked: 'sequence',
          event: payload.type
        })
      }
    }

    // PRIORIDAD 2: Si no está en secuencias, trackear en EmailSubscriber legacy
    const recipientEmail = payload.data.to[0] // Resend envía array de emails

    if (!recipientEmail) {
      console.warn('⚠️ No se encontró email de destinatario en webhook')
      return NextResponse.json({ received: true })
    }

    // Buscar subscriber en la base de datos
    const subscriber = await prisma.emailSubscriber.findFirst({
      where: { email: recipientEmail }
    })

    if (!subscriber) {
      console.warn(`⚠️ Subscriber no encontrado: ${recipientEmail}`)
      // No es error - puede ser un email manual no de la lista
      return NextResponse.json({ received: true, warning: 'subscriber_not_found' })
    }

    // Actualizar subscriber según el tipo de evento
    let updateData: any = {
      lastEngagement: new Date()
    }

    switch (payload.type) {
      case 'email.sent':
        updateData.emailsSent = (subscriber.emailsSent || 0) + 1
        break

      case 'email.delivered':
        updateData.emailsDelivered = (subscriber.emailsDelivered || 0) + 1
        break

      case 'email.opened':
        updateData.emailsOpened = (subscriber.emailsOpened || 0) + 1
        updateData.lastOpenedAt = new Date()

        // Si es el primer open, registrarlo
        if (!subscriber.firstOpenedAt) {
          updateData.firstOpenedAt = new Date()
        }

        // Mejorar engagement score si abre emails
        if (subscriber.engagementScore === 'cold') {
          updateData.engagementScore = 'warm'
        } else if (subscriber.engagementScore === 'warm' && subscriber.emailsOpened >= 3) {
          updateData.engagementScore = 'hot'
          updateData.becameHotAt = new Date()
        }
        break

      case 'email.clicked':
        updateData.emailsClicked = (subscriber.emailsClicked || 0) + 1
        updateData.lastClickedAt = new Date()

        // Click es el máximo engagement - marcar como HOT
        if (subscriber.engagementScore !== 'hot') {
          updateData.engagementScore = 'hot'
          updateData.becameHotAt = new Date()
        }

        // Añadir tag de "engaged"
        const currentTags = subscriber.tags || []
        if (!currentTags.includes('engaged')) {
          updateData.tags = [...currentTags, 'engaged']
        }

        // Registrar el link clickeado (opcional: para analytics)
        if (payload.data.click?.link) {
          console.log(`🔗 Click detectado: ${payload.data.click.link}`)
        }
        break

      case 'email.bounced':
        updateData.emailsBounced = (subscriber.emailsBounced || 0) + 1

        // Hard bounce → marcar como bounced permanentemente
        if (payload.data.bounce_type === 'hard') {
          updateData.status = 'bounced'
          updateData.bouncedAt = new Date()
          console.warn(`❌ Hard bounce detectado: ${recipientEmail}`)
        }
        // Soft bounce → no hacer nada por ahora (puede ser temporal)
        else {
          console.warn(`⚠️ Soft bounce detectado: ${recipientEmail}`)
        }
        break

      case 'email.complained':
        // Marcado como spam → unsubscribe automático
        updateData.status = 'unsubscribed'
        updateData.unsubscribedAt = new Date()
        updateData.unsubscribeReason = 'spam_complaint'

        // Añadir tag de "complained"
        const tags = subscriber.tags || []
        updateData.tags = [...tags, 'complained']

        console.warn(`🚨 Spam complaint: ${recipientEmail}`)
        break

      case 'email.delivery_delayed':
        // Solo log, no actualizar DB
        console.warn(`⏰ Delivery delayed: ${recipientEmail}`)
        break

      default:
        console.log(`ℹ️ Evento no manejado: ${payload.type}`)
    }

    // Actualizar subscriber en DB
    if (Object.keys(updateData).length > 1) { // Más de solo lastEngagement
      await prisma.emailSubscriber.update({
        where: { id: subscriber.id },
        data: updateData
      })

      console.log(`✅ Subscriber actualizado: ${recipientEmail}`, {
        event: payload.type,
        changes: Object.keys(updateData)
      })
    }

    return NextResponse.json({
      received: true,
      subscriber: recipientEmail,
      event: payload.type,
      processed: true
    })

  } catch (error) {
    console.error('❌ Error procesando webhook de Resend:', error)

    // Retornar 200 para que Resend no reintente
    // (el error es nuestro, no de Resend)
    return NextResponse.json(
      {
        received: true,
        error: 'processing_failed'
      },
      { status: 200 } // Important: return 200 to prevent retries
    )
  }
}

/**
 * INSTRUCCIONES DE CONFIGURACIÓN:
 *
 * 1. Ir a https://resend.com/webhooks
 * 2. Crear un nuevo webhook
 * 3. URL del webhook: https://itineramio.com/api/webhooks/resend
 * 4. Seleccionar eventos a escuchar:
 *    - email.delivered ✅
 *    - email.opened ✅
 *    - email.clicked ✅
 *    - email.bounced ✅
 *    - email.complained ✅
 * 5. Guardar y copiar el "Webhook Secret"
 * 6. (Opcional) Añadir validación con el secret en producción
 *
 * Para desarrollo local, usar ngrok:
 * ngrok http 3000
 * → URL temporal: https://abc123.ngrok.io/api/webhooks/resend
 */
