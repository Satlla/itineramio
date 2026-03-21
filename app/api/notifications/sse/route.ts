import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/notifications/sse
 * Server-Sent Events endpoint for real-time notifications.
 * Streams new notifications as they arrive in the database.
 */
export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req)
  if (authResult instanceof Response) {
    return authResult
  }

  const userId = authResult.userId
  let lastChecked = new Date()
  let intervalId: ReturnType<typeof setInterval> | null = null
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let closed = false

  const MAX_DURATION_MS = 5 * 60 * 1000 // 5 minutes

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: object) => {
        if (closed) return
        try {
          controller.enqueue(`data: ${JSON.stringify(data)}\n\n`)
        } catch {
          closed = true
        }
      }

      // Send initial ping and current unread count
      const sendInitial = async () => {
        try {
          const unreadCount = await prisma.notification.count({
            where: { userId, read: false }
          })
          send({ type: 'connected', unreadCount })
        } catch {
          send({ type: 'connected', unreadCount: 0 })
        }
      }

      sendInitial()

      // Poll for new notifications every 15 seconds
      intervalId = setInterval(async () => {
        if (closed) {
          if (intervalId) clearInterval(intervalId)
          return
        }

        try {
          const newNotifications = await prisma.notification.findMany({
            where: {
              userId,
              createdAt: { gt: lastChecked }
            },
            orderBy: { createdAt: 'desc' },
            take: 20
          })

          lastChecked = new Date()

          if (newNotifications.length > 0) {
            send({ type: 'new_notifications', notifications: newNotifications })
          } else {
            // Heartbeat to keep connection alive
            send({ type: 'ping', timestamp: lastChecked.toISOString() })
          }
        } catch {
          if (intervalId) clearInterval(intervalId)
          closed = true
        }
      }, 15_000)

      // Close the stream after MAX_DURATION_MS so the client reconnects,
      // preventing interval leaks from clients that disconnect without a close event.
      timeoutId = setTimeout(() => {
        if (!closed) {
          send({ type: 'reconnect' })
          closed = true
          if (intervalId) {
            clearInterval(intervalId)
            intervalId = null
          }
          timeoutId = null
          try {
            controller.close()
          } catch {
            // controller may already be closed
          }
        }
      }, MAX_DURATION_MS)
    },
    cancel() {
      closed = true
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    }
  })
}
