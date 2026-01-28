import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { generateSlug } from '@/lib/slug-utils'

/**
 * POST /api/gestion/properties-quick
 * Create a property for onboarding purposes
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const body = await request.json()
    const {
      name,
      street,
      city,
      postalCode,
      type = 'APARTMENT',
      bedrooms = 1,
      bathrooms = 1,
      maxGuests = 4
    } = body

    // Validation
    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'El nombre de la propiedad es obligatorio (mínimo 2 caracteres)' },
        { status: 400 }
      )
    }
    if (!street || street.trim().length < 3) {
      return NextResponse.json(
        { error: 'La dirección es obligatoria' },
        { status: 400 }
      )
    }
    if (!city || city.trim().length < 2) {
      return NextResponse.json(
        { error: 'La ciudad es obligatoria' },
        { status: 400 }
      )
    }
    if (!postalCode || postalCode.trim().length < 4) {
      return NextResponse.json(
        { error: 'El código postal es obligatorio' },
        { status: 400 }
      )
    }

    // Generate unique slug
    const baseSlug = generateSlug(name)
    let uniqueSlug = baseSlug
    let slugSuffix = 0

    while (true) {
      const testSlug = slugSuffix === 0 ? baseSlug : `${baseSlug}-${slugSuffix}`
      const existing = await prisma.property.findUnique({
        where: { slug: testSlug },
        select: { id: true }
      })

      if (!existing) {
        uniqueSlug = testSlug
        break
      }

      slugSuffix++
      if (slugSuffix > 100) {
        uniqueSlug = `${baseSlug}-${Date.now()}`
        break
      }
    }

    // Get user info for contact fields
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, phone: true }
    })

    // Create property with all required fields
    const property = await prisma.property.create({
      data: {
        hostId: userId,
        name: name.trim(),
        slug: uniqueSlug,
        description: `Propiedad gestionada: ${name.trim()}`,
        type: type,
        street: street.trim(),
        city: city.trim(),
        state: city.trim(), // Use city as state for Spain
        postalCode: postalCode.trim(),
        country: 'España',
        bedrooms: Math.max(0, Math.min(20, bedrooms)),
        bathrooms: Math.max(0, Math.min(10, bathrooms)),
        maxGuests: Math.max(1, Math.min(50, maxGuests)),
        hostContactName: user?.name || 'Gestor',
        hostContactPhone: user?.phone || '000000000',
        hostContactEmail: user?.email || 'gestor@example.com',
        status: 'DRAFT',
        isPublished: false
      }
    })

    return NextResponse.json({
      success: true,
      property: {
        id: property.id,
        name: property.name,
        address: property.street
      }
    })
  } catch (error) {
    console.error('Error creating property:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
