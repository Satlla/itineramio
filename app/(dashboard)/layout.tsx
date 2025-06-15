'use client'

import { DashboardNavbar } from '@/components/layout/DashboardNavbar'
import { useAuth } from '@/providers/AuthProvider'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar user={user ? {
        name: user.name,
        email: user.email,
        avatar: user.avatar
      } : undefined} />
      <main className="pt-16">
        {children}
      </main>
    </div>
  )
}