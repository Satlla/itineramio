import { Suspense } from 'react'
import { AuthLayoutClient } from './AuthLayoutClient'

// Auth pages use useSearchParams — force dynamic rendering
export const dynamic = 'force-dynamic'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthLayoutClient><Suspense>{children}</Suspense></AuthLayoutClient>
}
