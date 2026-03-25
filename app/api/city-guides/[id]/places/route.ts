import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '../../../../../src/lib/prisma'
import { getAuthUser } from '../../../../../src/lib/auth'
import { getAdminUser } from '../../../../../src/lib/admin-auth'

const ADMIN_EMAIL = 'alejandrosatlla@gmail.com'

const CATEGORY_NAMES: Record<string, { es: string; en: string; fr: string; icon: string }> = {
  restaurant: { es: 'Restaurantes', en: 'Restaurants', fr: 'Restaurants', icon: 'Utensils' },
  cafe: { es: 'Cafeterías', en: 'Cafes', fr: 'Cafés', icon: 'Coffee' },
  tourist_attraction: { es: 'Lugares de interés', en: 'Tourist Attractions', fr: 'Attractions touristiques', icon: 'Camera' },
  park: { es: 'Parques y naturaleza', en: 'Parks & Nature', fr: 'Parcs & Nature', icon: 'Trees' },
  beach: { es: 'Playas', en: 'Beaches', fr: 'Plages', icon: 'Waves' },
  shopping_mall: { es: 'Compras', en: 'Shopping', fr: 'Shopping', icon: 'ShoppingBag' },
  museum: { es: 'Museos', en: 'Museums', fr: 'Musées', icon: 'Landmark' },
  bar: { es: 'Bares', en: 'Bars', fr: 'Bars', icon: 'Wine' },
  pharmacy: { es: 'Farmacias', en: 'Pharmacies', fr: 'Pharmacies', icon: 'Pill' },
  hospital: { es: 'Hospitales', en: 'Hospitals', fr: 'Hôpitaux', icon: 'Hospital' },
  supermarket: { es: 'Supermercados', en: 'Supermarkets', fr: 'Supermarchés', icon: 'ShoppingCart' },
  gym: { es: 'Gimnasios', en: 'Gyms', fr: 'Salles de sport', icon: 'Dumbbell' },
  // Categorías adicionales de Google Places
  pub: { es: 'Pubs', en: 'Pubs', fr: 'Pubs', icon: 'Beer' },
  night_club: { es: 'Discotecas', en: 'Nightclubs', fr: 'Discothèques', icon: 'Music' },
  disco: { es: 'Discotecas', en: 'Nightclubs', fr: 'Discothèques', icon: 'Music' },
  nightclub: { es: 'Discotecas', en: 'Nightclubs', fr: 'Discothèques', icon: 'Music' },
  grill: { es: 'Parrillas', en: 'Grills', fr: 'Grillades', icon: 'Flame' },
  cathedral: { es: 'Catedrales e iglesias', en: 'Cathedrals & Churches', fr: 'Cathédrales & Églises', icon: 'Landmark' },
  church: { es: 'Iglesias', en: 'Churches', fr: 'Églises', icon: 'Landmark' },
  place_of_worship: { es: 'Lugares de culto', en: 'Places of Worship', fr: 'Lieux de culte', icon: 'Landmark' },
  ice_cream: { es: 'Heladerías', en: 'Ice Cream', fr: 'Glaces', icon: 'IceCream' },
  bakery: { es: 'Panaderías', en: 'Bakeries', fr: 'Boulangeries', icon: 'ChefHat' },
  food: { es: 'Restaurantes', en: 'Restaurants', fr: 'Restaurants', icon: 'Utensils' },
  meal_takeaway: { es: 'Para llevar', en: 'Takeaway', fr: 'À emporter', icon: 'Package' },
  meal_delivery: { es: 'Delivery', en: 'Delivery', fr: 'Livraison', icon: 'Package' },
  parking: { es: 'Aparcamientos', en: 'Parking', fr: 'Parkings', icon: 'Car' },
  lodging: { es: 'Alojamiento', en: 'Lodging', fr: 'Hébergement', icon: 'Bed' },
  spa: { es: 'Spas & bienestar', en: 'Spas & Wellness', fr: 'Spas & Bien-être', icon: 'Sparkles' },
  beauty_salon: { es: 'Salones de belleza', en: 'Beauty Salons', fr: 'Salons de beauté', icon: 'Scissors' },
  hair_care: { es: 'Peluquerías', en: 'Hair Salons', fr: 'Coiffeurs', icon: 'Scissors' },
  clothing_store: { es: 'Tiendas de ropa', en: 'Clothing Stores', fr: 'Boutiques', icon: 'ShoppingBag' },
  store: { es: 'Tiendas', en: 'Stores', fr: 'Magasins', icon: 'ShoppingBag' },
  convenience_store: { es: 'Tiendas de conveniencia', en: 'Convenience Stores', fr: 'Épiceries', icon: 'ShoppingCart' },
  atm: { es: 'Cajeros automáticos', en: 'ATMs', fr: 'Distributeurs', icon: 'Landmark' },
  bank: { es: 'Bancos', en: 'Banks', fr: 'Banques', icon: 'Landmark' },
  gas_station: { es: 'Gasolineras', en: 'Gas Stations', fr: 'Stations-service', icon: 'Car' },
  transit_station: { es: 'Transporte público', en: 'Public Transport', fr: 'Transports en commun', icon: 'Train' },
  bus_station: { es: 'Estación de autobús', en: 'Bus Station', fr: 'Gare routière', icon: 'Bus' },
  train_station: { es: 'Estación de tren', en: 'Train Station', fr: 'Gare', icon: 'Train' },
  airport: { es: 'Aeropuerto', en: 'Airport', fr: 'Aéroport', icon: 'Plane' },
  taxi_stand: { es: 'Parada de taxi', en: 'Taxi Stand', fr: 'Arrêt de taxi', icon: 'Car' },
  market: { es: 'Mercados', en: 'Markets', fr: 'Marchés', icon: 'ShoppingBag' },
  traditional_market: { es: 'Mercado tradicional', en: 'Traditional Market', fr: 'Marché traditionnel', icon: 'ShoppingBag' },
}

async function autoImportPlaceToProperty(
  propertyId: string,
  placeId: string,
  category: string,
  description: string | null,
  place: { latitude: number; longitude: number }
): Promise<void> {
  const catInfo = CATEGORY_NAMES[category] || { es: category, en: category, fr: category, icon: 'MapPin' }

  // Find or create RECOMMENDATIONS zone for this category
  let zone = await prisma.zone.findFirst({
    where: { propertyId, type: 'RECOMMENDATIONS', recommendationCategory: category },
  })

  if (!zone) {
    const maxZoneOrder = await prisma.zone.aggregate({
      where: { propertyId },
      _max: { order: true },
    })
    zone = await prisma.zone.create({
      data: {
        propertyId,
        name: { es: catInfo.es, en: catInfo.en, fr: catInfo.fr },
        icon: catInfo.icon,
        type: 'RECOMMENDATIONS',
        recommendationCategory: category,
        qrCode: `qr_${crypto.randomUUID()}`,
        accessCode: crypto.randomUUID().slice(0, 8).toUpperCase(),
        order: (maxZoneOrder._max.order ?? -1) + 1,
        status: 'ACTIVE',
        isPublished: true,
      },
    })
  }

  const maxOrder = await prisma.recommendation.aggregate({
    where: { zoneId: zone.id },
    _max: { order: true },
  })

  await prisma.recommendation.create({
    data: {
      zoneId: zone.id,
      placeId,
      source: 'CITY_GUIDE',
      distanceMeters: null,
      walkMinutes: null,
      order: (maxOrder._max.order ?? -1) + 1,
      description: description || null,
    },
  }).catch((err: unknown) => {
    // Skip duplicate (place already in this zone)
    if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'P2002') return
    throw err
  })
}

// POST /api/city-guides/[id]/places
// Add a place to the guide. Auth required, only author or admin.
// Body: { placeId, category, description?, order? }
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const user = await getAuthUser(request)
    const adminUser = await getAdminUser(request)
    if (!user && !adminUser) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const guide = await prisma.cityGuide.findUnique({
      where: { id },
      select: { id: true, authorId: true, version: true, city: true },
    })

    if (!guide) {
      return NextResponse.json({ success: false, error: 'Guía no encontrada' }, { status: 404 })
    }

    const isAdmin = !!adminUser || user?.email === ADMIN_EMAIL
    if (!isAdmin && guide.authorId !== user?.userId) {
      return NextResponse.json({ success: false, error: 'Acceso denegado' }, { status: 403 })
    }

    const body = await request.json()
    const { placeId, category, description, highlight, externalUrl, tags, order } = body

    if (!placeId || !category) {
      return NextResponse.json(
        { success: false, error: 'Los campos placeId y category son obligatorios' },
        { status: 400 }
      )
    }

    // Verify place exists
    const place = await prisma.place.findUnique({ where: { id: placeId } })
    if (!place) {
      return NextResponse.json({ success: false, error: 'Place no encontrado' }, { status: 404 })
    }

    // Determine order within category if not provided
    let nextOrder = order
    if (nextOrder == null) {
      const maxOrder = await prisma.cityGuidePlace.aggregate({
        where: { guideId: id, category },
        _max: { order: true },
      })
      nextOrder = (maxOrder._max.order ?? -1) + 1
    }

    const newVersion = guide.version + 1

    // Create place entry and bump version atomically
    const [guidePlace] = await (prisma.$transaction as any)([
      prisma.cityGuidePlace.create({
        data: {
          guideId: id,
          placeId,
          category,
          description: description || null,
          highlight: highlight || null,
          externalUrl: externalUrl || null,
          tags: tags || [],
          order: nextOrder,
          addedInVersion: newVersion,
        },
        include: {
          place: {
            select: {
              id: true,
              name: true,
              address: true,
              photoUrl: true,
              photoUrls: true,
              rating: true,
              priceLevel: true,
              latitude: true,
              longitude: true,
              types: true,
            },
          },
        },
      }),
      prisma.cityGuide.update({
        where: { id },
        data: { version: newVersion },
      }),
    ], { timeout: 10000 })

    // Auto-subscribe + import to all properties in the same city.
    // Fire-and-forget: response is returned immediately, propagation runs in background.
    const propagate = async () => {
      try {
        const propertiesInCity = await prisma.property.findMany({
          where: {
            city: { equals: guide.city, mode: 'insensitive' },
            deletedAt: null,
          },
          select: { id: true, hostId: true },
        })

        await Promise.allSettled(propertiesInCity.map(async (property) => {
          const existingSub = await prisma.propertyGuideSubscription.findUnique({
            where: { guideId_propertyId: { guideId: id, propertyId: property.id } },
            select: { status: true },
          })

          if (existingSub?.status === 'UNSUBSCRIBED') return

          if (!existingSub) {
            await prisma.propertyGuideSubscription.create({
              data: {
                guideId: id,
                propertyId: property.id,
                userId: property.hostId,
                status: 'ACTIVE',
                lastSeenVersion: guide.version,
              },
            }).catch(() => {/* ignore race condition duplicates */})
          }

          await autoImportPlaceToProperty(
            property.id,
            placeId,
            category,
            description || null,
            { latitude: place.latitude, longitude: place.longitude }
          )
        }))
      } catch (err) {
        // background propagation error - ignore
      }
    }

    propagate()

    return NextResponse.json({ success: true, data: guidePlace }, { status: 201 })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'Este lugar ya está en esa categoría' }, { status: 409 })
    }
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE /api/city-guides/[id]/places
// Remove a place. Auth required, only author or admin.
// Body: { placeId }
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const user = await getAuthUser(request)
    const adminUser = await getAdminUser(request)
    if (!user && !adminUser) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const guide = await prisma.cityGuide.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    })

    if (!guide) {
      return NextResponse.json({ success: false, error: 'Guía no encontrada' }, { status: 404 })
    }

    const isAdmin = !!adminUser || user?.email === ADMIN_EMAIL
    if (!isAdmin && guide.authorId !== user?.userId) {
      return NextResponse.json({ success: false, error: 'Acceso denegado' }, { status: 403 })
    }

    const body = await request.json()
    const { guidePlaceId } = body

    if (!guidePlaceId) {
      return NextResponse.json({ success: false, error: 'El campo guidePlaceId es obligatorio' }, { status: 400 })
    }

    const guidePlace = await prisma.cityGuidePlace.findUnique({
      where: { id: guidePlaceId },
    })

    if (!guidePlace || guidePlace.guideId !== id) {
      return NextResponse.json({ success: false, error: 'El lugar no está en esta guía' }, { status: 404 })
    }

    // Delete recommendations in all subscribed properties that came from this city guide place
    const deleted = await prisma.recommendation.deleteMany({
      where: {
        placeId: guidePlace.placeId,
        source: 'CITY_GUIDE',
        zone: {
          property: {
            guideSubscriptions: {
              some: { guideId: id, status: 'ACTIVE' },
            },
          },
        },
      },
    })

    await prisma.cityGuidePlace.delete({
      where: { id: guidePlaceId },
    })

    return NextResponse.json({
      success: true,
      message: `Lugar eliminado de la guía y de ${deleted.count} propiedad(es)`,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}
