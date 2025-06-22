import React from 'react'

interface LegalLayoutProps {
  children: React.ReactNode
}

export default function LegalLayout({ children }: LegalLayoutProps) {
  return (
    <>
      {children}
    </>
  )
}