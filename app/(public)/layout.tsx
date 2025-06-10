import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ManualPhi - Guía Interactiva',
  description: 'Accede a tu guía interactiva personalizada',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#6366f1',
  manifest: '/manifest.json',
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
}