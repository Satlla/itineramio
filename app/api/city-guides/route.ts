import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'
import { getAuthUser } from '../../../src/lib/auth'

const ADMIN_EMAIL = 'alejandrosatlla@gmail.com'

// GET /api/city-guides?city=Alicante
// List published city guides, VERIFIED first. No auth required.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const all = searchParams.get('all') === 'true'

    // `all=true` only allowed for admin
    let isAdmin = false
    if (all) {
      const user = await getAuthUser(request)
      isAdmin = user?.email === ADMIN_EMAIL
    }

    const where: Record<string, unknown> = isAdmin
      ? {}
      : { status: { in: ['PUBLISHED', 'VERIFIED'] } }

    // Bidirectional city match: handles bilingual names (Alicante/Alacant, Valencia/València…)
    // Fetch without city filter first, then filter in JS using contains both ways
    const guides = await prisma.cityGuide.findMany({
      where,
      include: {
        author: {
          select: { id: true, name: true },
        },
        _count: {
          select: { places: true },
        },
      },
      orderBy: [
        // VERIFIED guides first
        { status: 'asc' }, // PUBLISHED < VERIFIED alphabetically — use raw sort below
        { subscriberCount: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    // Filter by city with bidirectional contains (handles bilingual names)
    const filtered = city
      ? guides.filter(g => {
          const gc = g.city.toLowerCase()
          const sc = city.toLowerCase()
          return gc.includes(sc) || sc.includes(gc)
        })
      : guides

    // Re-sort: VERIFIED first, then PUBLISHED
    const sorted = filtered.sort((a, b) => {
      if (a.status === 'VERIFIED' && b.status !== 'VERIFIED') return -1
      if (a.status !== 'VERIFIED' && b.status === 'VERIFIED') return 1
      return b.subscriberCount - a.subscriberCount
    })

    const result = (sorted as typeof guides).map((g) => ({
      id: g.id,
      title: g.title,
      description: g.description,
      city: g.city,
      country: g.country,
      coverImage: g.coverImage,
      status: g.status,
      version: g.version,
      subscriberCount: g.subscriberCount,
      author: g.author,
      _count: g._count,
      placesCount: g._count.places,
    }))

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error listing city guides:', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST /api/city-guides
// Create a new city guide. Auth required.
// Body: { title, description, city, country, coverImage? }
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }
    if (user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ success: false, error: 'Solo los administradores pueden crear guías' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, city, country, coverImage } = body

    if (!title || !city) {
      return NextResponse.json(
        { success: false, error: 'Los campos title y city son obligatorios' },
        { status: 400 }
      )
    }

    const guide = await prisma.cityGuide.create({
      data: {
        title,
        description: description || null,
        city,
        country: country || 'ES',
        coverImage: coverImage || null,
        authorId: user.userId,
        status: 'DRAFT',
        version: 1,
        subscriberCount: 0,
      },
      include: {
        author: { select: { id: true, name: true } },
        _count: { select: { places: true } },
      },
    })

    return NextResponse.json({ success: true, data: guide }, { status: 201 })
  } catch (error) {
    console.error('Error creating city guide:', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}
