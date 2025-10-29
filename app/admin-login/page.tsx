'use client'

// Redirect to the actual admin login page
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/admin/login')
  }, [router])
  
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
    </div>
  )
}