'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Redirect from old /account/modules/gestion to new /account/modules/facturamio
 */
export default function GestionModuleRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/account/modules/facturamio')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Redirigiendo...</p>
    </div>
  )
}
