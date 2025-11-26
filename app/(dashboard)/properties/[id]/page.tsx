'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function PropertyPage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string

  useEffect(() => {
    // Automatically redirect to zones view
    router.replace(`/properties/${propertyId}/zones`)
  }, [router, propertyId])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" style={{ paddingTop: 'calc(4rem + env(safe-area-inset-top, 0px))' }}>
      <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full"></div>
    </div>
  )
}