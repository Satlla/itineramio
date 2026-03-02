import { Suspense } from 'react'
import { DashboardLayoutClient } from './DashboardLayoutClient'

// Dashboard pages require auth and use useSearchParams — force dynamic rendering
export const dynamic = 'force-dynamic'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayoutClient><Suspense>{children}</Suspense></DashboardLayoutClient>
}
