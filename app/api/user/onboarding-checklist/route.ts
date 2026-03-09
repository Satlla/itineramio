import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/user/onboarding-checklist
 * Returns the completion status of each onboarding step for the current user.
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (authResult instanceof Response) return authResult
  const { userId } = authResult

  const [
    propertyCount,
    zoneCount,
    reservationCount,
    liquidationCount,
    gestionProfile,
    user,
  ] = await Promise.all([
    prisma.property.count({ where: { hostId: userId } }),
    prisma.zone.count({ where: { property: { hostId: userId } } }),
    prisma.reservation.count({ where: { userId } }),
    prisma.liquidation.count({ where: { userId } }),
    prisma.userInvoiceConfig.findUnique({
      where: { userId },
      select: { businessName: true, nif: true }
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { onboardingCompletedAt: true }
    })
  ])

  const steps = [
    {
      id: 'create_property',
      label: 'Crear primera propiedad',
      description: 'Registra tu primer alojamiento en Itineramio',
      href: '/properties/new',
      completed: propertyCount > 0,
    },
    {
      id: 'configure_zone',
      label: 'Configurar una zona',
      description: 'Añade una habitación, zona o área a tu propiedad',
      href: '/properties',
      completed: zoneCount > 0,
    },
    {
      id: 'import_reservations',
      label: 'Importar reservas',
      description: 'Importa tus reservas desde Airbnb o Booking',
      href: '/gestion/reservas/importar',
      completed: reservationCount > 0,
    },
    {
      id: 'setup_manager_profile',
      label: 'Configurar perfil de gestor',
      description: 'Añade los datos de tu empresa para las facturas',
      href: '/gestion/perfil-gestor',
      completed: !!(gestionProfile?.businessName && gestionProfile?.nif),
    },
    {
      id: 'generate_liquidation',
      label: 'Generar primera liquidación',
      description: 'Genera y envía la primera liquidación a un propietario',
      href: '/gestion/liquidaciones',
      completed: liquidationCount > 0,
    },
  ]

  const completedCount = steps.filter(s => s.completed).length
  const allCompleted = completedCount === steps.length

  // Auto-mark onboarding as complete if all steps done
  if (allCompleted && !user?.onboardingCompletedAt) {
    await prisma.user.update({
      where: { id: userId },
      data: { onboardingCompletedAt: new Date() }
    }).catch(() => {})
  }

  return NextResponse.json({
    steps,
    completedCount,
    totalCount: steps.length,
    allCompleted,
    onboardingCompletedAt: user?.onboardingCompletedAt ?? null,
  })
}
