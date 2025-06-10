'use client'

import { DashboardNavbar } from '@/components/layout/DashboardNavbar'

// Mock user data - replace with real auth
const mockUser = {
  id: '1',
  name: 'Alex Rodriguez',
  email: 'alex@example.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar user={mockUser} />
      <main className="pt-16">
        {children}
      </main>
    </div>
  )
}