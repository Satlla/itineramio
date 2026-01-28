'use client'

import { useState, useEffect, useCallback } from 'react'
import { type ModuleCode, type ModuleAccess, type ManualesAccess, type GestionAccess } from '@/config/modules'

interface UseModuleAccessResult {
  hasAccess: boolean
  isLoading: boolean
  error: string | null
  access: ModuleAccess | null
  refetch: () => void
}

interface UseAllModulesAccessResult {
  manuales: ManualesAccess | null
  gestion: GestionAccess | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Hook para verificar el acceso a un módulo específico
 *
 * @example
 * ```tsx
 * const { hasAccess, isLoading, access } = useModuleAccess('GESTION')
 *
 * if (isLoading) return <Loading />
 * if (!hasAccess) return <ModuleLockedOverlay moduleCode="GESTION" />
 * return <GestionDashboard />
 * ```
 */
export function useModuleAccess(moduleCode: ModuleCode): UseModuleAccessResult {
  const [access, setAccess] = useState<ModuleAccess | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAccess = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/modules/access?module=${moduleCode}`, {
        credentials: 'include',
        cache: 'no-store'
      })

      const result = await response.json()

      if (result.success) {
        setAccess(result.access)
      } else {
        setError(result.error || 'Error al verificar acceso')
      }
    } catch (err) {
      console.error('Error fetching module access:', err)
      setError('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }, [moduleCode])

  useEffect(() => {
    fetchAccess()
  }, [fetchAccess])

  return {
    hasAccess: access?.hasAccess ?? false,
    isLoading,
    error,
    access,
    refetch: fetchAccess
  }
}

/**
 * Hook para obtener el acceso a todos los módulos
 *
 * @example
 * ```tsx
 * const { manuales, gestion, isLoading } = useAllModulesAccess()
 *
 * return (
 *   <nav>
 *     <NavItem disabled={!manuales?.hasAccess}>Manuales</NavItem>
 *     <NavItem disabled={!gestion?.hasAccess}>Gestión</NavItem>
 *   </nav>
 * )
 * ```
 */
export function useAllModulesAccess(): UseAllModulesAccessResult {
  const [manuales, setManuales] = useState<ManualesAccess | null>(null)
  const [gestion, setGestion] = useState<GestionAccess | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAccess = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/modules/access', {
        credentials: 'include',
        cache: 'no-store'
      })

      const result = await response.json()

      if (result.success) {
        setManuales(result.modules.manuales.access)
        setGestion(result.modules.gestion.access)
      } else {
        setError(result.error || 'Error al verificar acceso')
      }
    } catch (err) {
      console.error('Error fetching modules access:', err)
      setError('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAccess()
  }, [fetchAccess])

  return {
    manuales,
    gestion,
    isLoading,
    error,
    refetch: fetchAccess
  }
}

/**
 * Hook para verificar acceso al módulo MANUALES con información del plan
 */
export function useManualesAccess() {
  const [access, setAccess] = useState<ManualesAccess | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAccess = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/modules/access?module=MANUALES', {
        credentials: 'include',
        cache: 'no-store'
      })

      const result = await response.json()

      if (result.success) {
        setAccess(result.access as ManualesAccess)
      } else {
        setError(result.error || 'Error al verificar acceso')
      }
    } catch (err) {
      console.error('Error fetching MANUALES access:', err)
      setError('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAccess()
  }, [fetchAccess])

  return {
    hasAccess: access?.hasAccess ?? false,
    isLoading,
    error,
    access,
    planCode: access?.planCode,
    planName: access?.planName,
    maxProperties: access?.maxProperties ?? 0,
    currentProperties: access?.currentProperties ?? 0,
    canAddProperty: access?.canAddProperty ?? false,
    isTrialActive: access?.isTrialActive ?? false,
    refetch: fetchAccess
  }
}

/**
 * Hook para verificar acceso al módulo GESTION
 */
/**
 * Hook para verificar acceso al módulo FACTURAMIO (antes GESTION)
 */
export function useFacturamioAccess() {
  const [access, setAccess] = useState<GestionAccess | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAccess = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/modules/access?module=FACTURAMIO', {
        credentials: 'include',
        cache: 'no-store'
      })

      const result = await response.json()

      if (result.success) {
        setAccess(result.access as GestionAccess)
      } else {
        setError(result.error || 'Error al verificar acceso')
      }
    } catch (err) {
      console.error('Error fetching FACTURAMIO access:', err)
      setError('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAccess()
  }, [fetchAccess])

  return {
    hasAccess: access?.hasAccess ?? false,
    isLoading,
    error,
    access,
    isTrialActive: access?.isTrialActive ?? false,
    trialEndsAt: access?.trialEndsAt ?? null,
    refetch: fetchAccess
  }
}

/**
 * @deprecated Use useFacturamioAccess instead
 */
export function useGestionAccess() {
  return useFacturamioAccess()
}
