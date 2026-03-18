import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/user/onboarding-checklist
 * Returns onboarding steps focused on key product features.
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (authResult instanceof Response) return authResult
  const { userId } = authResult

  const [
    propertyCount,
    zoneCount,
    announcementCount,
    chatbotConvCount,
    firstProperty,
    user,
  ] = await Promise.all([
    prisma.property.count({ where: { hostId: userId } }),
    prisma.zone.count({ where: { property: { hostId: userId } } }),
    prisma.announcement.count({ where: { property: { hostId: userId } } }),
    prisma.chatbotConversation.count({ where: { property: { hostId: userId } } }),
    prisma.property.findFirst({
      where: { hostId: userId },
      select: { id: true, intelligence: true, isPublished: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { onboardingCompletedAt: true },
    }),
  ])

  const hasIntelligence = !!firstProperty?.intelligence &&
    Object.keys(firstProperty.intelligence as object).length > 2

  const propertyId = firstProperty?.id

  const steps = [
    {
      id: 'create_property',
      label: '✨ Crea tu primera propiedad con IA',
      description: 'Genera tu guía completa en minutos — sube fotos y la IA hace el resto',
      href: '/ai-setup',
      completed: propertyCount > 0,
      badge: 'Nuevo',
    },
    {
      id: 'configure_zones',
      label: '🏠 Añade zonas y contenido',
      description: 'Wi-Fi, check-in, normas, electrodomésticos... cada zona en su sitio',
      href: propertyId ? `/properties/${propertyId}/zones` : '/properties',
      completed: zoneCount > 0,
      badge: null,
    },
    {
      id: 'setup_intelligence',
      label: '🧠 Actualiza la Inteligencia de tu guía',
      description: 'Cuanto más completa esté, mejor responderá el chatbot a tus huéspedes',
      href: propertyId ? `/properties/${propertyId}/intelligence` : '/properties',
      completed: hasIntelligence,
      badge: 'Clave',
    },
    {
      id: 'check_chatbot',
      label: '💬 Revisa los chats de tus huéspedes',
      description: 'Ve exactamente qué responde la IA y ajústala si es necesario',
      href: propertyId ? `/properties/${propertyId}/chatbot` : '/properties',
      completed: chatbotConvCount > 0,
      badge: null,
    },
    {
      id: 'create_announcement',
      label: '📢 Crea un aviso para tus huéspedes',
      description: 'Informa de obras, cambios o cualquier novedad importante',
      href: propertyId ? `/properties/${propertyId}/announcements` : '/properties',
      completed: announcementCount > 0,
      badge: null,
    },
    {
      id: 'publish_guide',
      label: '🌍 Publica tu guía',
      description: 'Tu guía estará disponible en el idioma de cada huésped automáticamente',
      href: propertyId ? `/properties/${propertyId}/zones` : '/properties',
      completed: !!firstProperty?.isPublished,
      badge: null,
    },
  ]

  const completedCount = steps.filter(s => s.completed).length
  const allCompleted = completedCount === steps.length

  if (allCompleted && !user?.onboardingCompletedAt) {
    await prisma.user.update({
      where: { id: userId },
      data: { onboardingCompletedAt: new Date() },
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
