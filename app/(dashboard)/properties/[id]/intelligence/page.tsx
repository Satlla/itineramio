'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function IntelligencePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  useEffect(() => {
    router.replace(`/properties/${id}/chatbot?tab=datos`)
  }, [router, id])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-gray-600 border-t-transparent rounded-full" />
    </div>
  )
}
