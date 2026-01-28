'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Redirect from old /account/modules/facturamio to new /account/modules/gestion
 */
export default function FacturamioModuleRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/account/modules/gestion')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Redirigiendo...</p>
    </div>
  )
}
