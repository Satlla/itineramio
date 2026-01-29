'use client'

import React from 'react'
import { type ModuleCode } from '@/config/modules'
import { useModuleAccess } from '@/hooks/useModuleAccess'
import { ModuleLockedOverlay } from './ModuleLockedOverlay'

interface ModuleGateProps {
  module: ModuleCode
  children: React.ReactNode
  /**
   * Si es true, muestra un loading skeleton mientras carga
   * Si es false, muestra children con opacity reducida
   */
  showLoadingState?: boolean
  /**
   * Clase CSS para el contenedor del overlay
   */
  overlayClassName?: string
  /**
   * Si es true, el contenido bloqueado se difumina de fondo
   * Si es false, no se muestra el contenido de fondo
   */
  blurBackground?: boolean
  /**
   * Callback cuando cambia el estado de acceso
   */
  onAccessChange?: (hasAccess: boolean) => void
}

/**
 * Componente que bloquea el acceso a contenido si el usuario
 * no tiene el módulo activo.
 *
 * Uso:
 * ```tsx
 * <ModuleGate module="GESTION">
 *   <GestionDashboard />
 * </ModuleGate>
 * ```
 */
export function ModuleGate({
  module,
  children,
  showLoadingState = true,
  overlayClassName = 'min-h-[60vh]',
  blurBackground = false,
  onAccessChange
}: ModuleGateProps) {
  const { hasAccess, isLoading, access } = useModuleAccess(module)

  // Notificar cambios de acceso
  React.useEffect(() => {
    if (!isLoading && onAccessChange) {
      onAccessChange(hasAccess)
    }
  }, [hasAccess, isLoading, onAccessChange])

  // Estado de carga
  if (isLoading) {
    if (showLoadingState) {
      return <ModuleGateLoading className={overlayClassName} />
    }
    // Mostrar children con opacity mientras carga
    return (
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
    )
  }

  // Acceso permitido
  if (hasAccess) {
    return <>{children}</>
  }

  // Acceso denegado - mostrar overlay
  return (
    <div className={`relative ${overlayClassName}`}>
      {blurBackground && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="blur-md opacity-30">
            {children}
          </div>
        </div>
      )}
      <ModuleLockedOverlay
        moduleCode={module}
        activationCTA={access?.activationCTA}
        activationUrl={access?.activationUrl}
        className={overlayClassName}
      />
    </div>
  )
}

/**
 * Loading skeleton para ModuleGate
 */
function ModuleGateLoading({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full" />
        <div className="w-48 h-4 bg-gray-200 rounded" />
        <div className="w-32 h-4 bg-gray-200 rounded" />
      </div>
    </div>
  )
}

/**
 * HOC para envolver componentes con ModuleGate
 */
export function withModuleGate<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  module: ModuleCode,
  options?: Omit<ModuleGateProps, 'module' | 'children'>
) {
  return function ModuleGatedComponent(props: P) {
    return (
      <ModuleGate module={module} {...options}>
        <WrappedComponent {...props} />
      </ModuleGate>
    )
  }
}
