import { Metadata } from 'next'
import { prisma } from '../../../../src/lib/prisma'

interface Props {
  params: Promise<{ propertyId: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { propertyId } = await params
  
  try {
    // Fetch property data for meta tags
    const property = await prisma.property.findUnique({
      where: {
        id: propertyId,
        isPublished: true
      },
      select: {
        id: true,
        name: true,
        description: true,
        profileImage: true,
        city: true,
        state: true,
        type: true
      }
    })
    
    if (!property) {
      return {
        title: 'Propiedad no encontrada',
        description: 'La propiedad que buscas no está disponible'
      }
    }
    
    const propertyName = typeof property.name === 'string' 
      ? property.name 
      : (property.name as any)?.es || 'Propiedad'
      
    const propertyDescription = typeof property.description === 'string'
      ? property.description
      : (property.description as any)?.es || 'Manual digital del alojamiento'
    
    const city = typeof property.city === 'string'
      ? property.city
      : (property.city as any)?.es || ''
      
    const state = typeof property.state === 'string'
      ? property.state
      : (property.state as any)?.es || ''
    
    const location = city && state ? `${city}, ${state}` : (city || state || '')
    const fullTitle = `${propertyName}${location ? ` - ${location}` : ''}`
    const fullDescription = `${propertyDescription}. Manual digital completo con todas las instrucciones para tu estancia.`
    
    // Get the property image URL - handle both relative and absolute URLs
    let imageUrl = property.profileImage
    if (imageUrl && !imageUrl.startsWith('http')) {
      // If it's a relative URL, make it absolute
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.itineramio.com'
      imageUrl = imageUrl.startsWith('/') ? `${baseUrl}${imageUrl}` : `${baseUrl}/${imageUrl}`
    }
    
    // Fallback image if no property image
    if (!imageUrl) {
      imageUrl = 'https://www.itineramio.com/og-default-property.jpg'
    }
    
    return {
      title: fullTitle,
      description: fullDescription,
      openGraph: {
        title: fullTitle,
        description: fullDescription,
        type: 'website',
        url: `https://www.itineramio.com/guide/${propertyId}`,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: `Foto de ${propertyName}`,
          }
        ],
        locale: 'es_ES',
        siteName: 'Itineramio'
      },
      twitter: {
        card: 'summary_large_image',
        title: fullTitle,
        description: fullDescription,
        images: [imageUrl]
      },
      other: {
        'property:type': property.type?.toLowerCase() || 'apartment',
        'property:location': location
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Manual Digital - Itineramio',
      description: 'Manual digital del alojamiento con todas las instrucciones necesarias'
    }
  }
}

export default function PropertyGuideLayout({ children }: Props) {
  return children
}