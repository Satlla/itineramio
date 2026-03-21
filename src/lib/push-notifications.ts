import { prisma } from './prisma'

interface PushMessage {
  to: string
  title: string
  body: string
  data?: Record<string, unknown>
  sound?: 'default' | null
  badge?: number
}

export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  const devices = await (prisma as any).userDevice.findMany({
    where: { userId },
    select: { pushToken: true },
  })

  if (!devices.length) return

  const messages: PushMessage[] = devices.map((d: { pushToken: string }) => ({
    to: d.pushToken,
    title,
    body,
    data,
    sound: 'default',
  }))

  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
      },
      body: JSON.stringify(messages),
    })
  } catch {
    // Push notifications are best-effort; do not throw
  }
}

export async function sendPushNotificationToMany(
  userIds: string[],
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  await Promise.all(userIds.map(uid => sendPushNotification(uid, title, body, data)))
}
