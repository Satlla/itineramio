// Sistema de permisos para administradores

export const ADMIN_PERMISSIONS = {
  // Dashboard
  'dashboard.view': 'Ver dashboard',

  // Usuarios
  'users.view': 'Ver usuarios',
  'users.create': 'Crear usuarios',
  'users.edit': 'Editar usuarios',
  'users.delete': 'Eliminar usuarios',

  // Propiedades
  'properties.view': 'Ver propiedades',
  'properties.edit': 'Editar propiedades',
  'properties.activate': 'Activar/desactivar propiedades',

  // Suscripciones
  'subscriptions.view': 'Ver suscripciones',
  'subscriptions.manage': 'Gestionar suscripciones',

  // Facturas y pagos
  'billing.view': 'Ver facturación',
  'billing.manage': 'Gestionar facturas',
  'payments.view': 'Ver pagos',
  'payments.manage': 'Gestionar pagos',

  // Planes y precios
  'plans.view': 'Ver planes',
  'plans.manage': 'Gestionar planes',
  'pricing.view': 'Ver precios',
  'pricing.manage': 'Gestionar precios',
  'coupons.view': 'Ver cupones',
  'coupons.manage': 'Gestionar cupones',

  // Marketing
  'marketing.view': 'Ver marketing',
  'marketing.manage': 'Gestionar marketing',

  // Academia
  'academia.view': 'Ver academia',
  'academia.manage': 'Gestionar academia',

  // Analytics
  'analytics.view': 'Ver analytics',

  // Configuración
  'settings.view': 'Ver configuración',
  'settings.manage': 'Gestionar configuración',

  // Logs
  'logs.view': 'Ver logs de actividad',

  // Calendario
  'calendar.view': 'Ver calendario',
  'calendar.manage': 'Gestionar calendario',

  // Administradores (solo SUPER_ADMIN)
  'admins.view': 'Ver administradores',
  'admins.manage': 'Gestionar administradores',
} as const

export type Permission = keyof typeof ADMIN_PERMISSIONS

// Permisos agrupados por categoría para la UI
export const PERMISSION_GROUPS = {
  'Dashboard': ['dashboard.view'],
  'Usuarios': ['users.view', 'users.create', 'users.edit', 'users.delete'],
  'Propiedades': ['properties.view', 'properties.edit', 'properties.activate'],
  'Suscripciones': ['subscriptions.view', 'subscriptions.manage'],
  'Facturación': ['billing.view', 'billing.manage'],
  'Pagos': ['payments.view', 'payments.manage'],
  'Planes': ['plans.view', 'plans.manage'],
  'Precios': ['pricing.view', 'pricing.manage'],
  'Cupones': ['coupons.view', 'coupons.manage'],
  'Marketing': ['marketing.view', 'marketing.manage'],
  'Academia': ['academia.view', 'academia.manage'],
  'Analytics': ['analytics.view'],
  'Configuración': ['settings.view', 'settings.manage'],
  'Calendario': ['calendar.view', 'calendar.manage'],
  'Logs': ['logs.view'],
  'Administradores': ['admins.view', 'admins.manage'],
} as const

// Todos los permisos (para SUPER_ADMIN)
export const ALL_PERMISSIONS = Object.keys(ADMIN_PERMISSIONS) as Permission[]

// Permisos por defecto para un admin nuevo
export const DEFAULT_ADMIN_PERMISSIONS: Permission[] = [
  'dashboard.view',
  'users.view',
  'properties.view',
  'subscriptions.view',
  'billing.view',
  'payments.view',
  'plans.view',
  'pricing.view',
  'logs.view',
]

// Mapeo de rutas del menú a permisos requeridos
export const MENU_PERMISSIONS: Record<string, Permission[]> = {
  '/admin': ['dashboard.view'],
  '/admin/users': ['users.view'],
  '/admin/properties': ['properties.view'],
  '/admin/subscription-requests': ['subscriptions.view'],
  '/admin/subscriptions': ['subscriptions.view'],
  '/admin/payments': ['payments.view'],
  '/admin/billing': ['billing.view'],
  '/admin/invoices': ['billing.view'],
  '/admin/plans': ['plans.view'],
  '/admin/pricing': ['pricing.view'],
  '/admin/custom-plans': ['plans.view'],
  '/admin/coupons': ['coupons.view'],
  '/admin/marketing': ['marketing.view'],
  '/admin/academia': ['academia.view'],
  '/admin/analytics': ['analytics.view'],
  '/admin/settings': ['settings.view'],
  '/admin/calendar': ['calendar.view'],
  '/admin/logs': ['logs.view'],
  '/admin/audit-logs': ['logs.view'],
  '/admin/administrators': ['admins.view'],
}

// Verifica si un admin tiene un permiso específico
export function hasPermission(adminPermissions: string[], permission: Permission): boolean {
  return adminPermissions.includes(permission)
}

// Verifica si un admin tiene alguno de los permisos
export function hasAnyPermission(adminPermissions: string[], permissions: Permission[]): boolean {
  return permissions.some(p => adminPermissions.includes(p))
}

// Verifica si un admin tiene todos los permisos
export function hasAllPermissions(adminPermissions: string[], permissions: Permission[]): boolean {
  return permissions.every(p => adminPermissions.includes(p))
}

// Filtra las rutas del menú según los permisos del admin
export function filterMenuByPermissions(
  menuItems: { href: string; label: string }[],
  adminPermissions: string[],
  isSuperAdmin: boolean
): { href: string; label: string }[] {
  if (isSuperAdmin) return menuItems

  return menuItems.filter(item => {
    const requiredPermissions = MENU_PERMISSIONS[item.href]
    if (!requiredPermissions) return true // Si no tiene permisos definidos, mostrar
    return hasAnyPermission(adminPermissions, requiredPermissions)
  })
}

// Obtiene la descripción de un permiso
export function getPermissionLabel(permission: Permission): string {
  return ADMIN_PERMISSIONS[permission] || permission
}
