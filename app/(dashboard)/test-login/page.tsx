'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function TestLoginPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Set a test auth cookie directly
    document.cookie = `auth-token=test-token-${Date.now()}; path=/; max-age=86400`
    
    // Redirect to dashboard
    setTimeout(() => {
      router.push('/main')
    }, 1000)
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Setting up test login...</h1>
        <p className="text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  )
}