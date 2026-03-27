import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'

const ALLOWED_EMAILS = ['alejandrosatlla@gmail.com']

export default async function CalendarioLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value

  if (!token) redirect('/login')

  try {
    const payload = verifyToken(token)
    if (!ALLOWED_EMAILS.includes(payload.email)) {
      redirect('/main')
    }
  } catch {
    redirect('/login')
  }

  return <>{children}</>
}
