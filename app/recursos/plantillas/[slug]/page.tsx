import { redirect } from 'next/navigation'

interface PlantillaPageProps {
  params: Promise<{
    slug: string
  }>
}

// Mapeo de plantillas antiguas a nuevas rutas o descargas
const PLANTILLA_REDIRECTS: Record<string, string> = {
  'instrucciones-wifi': '/recursos/instrucciones-wifi',
  // Añadir más redirects según sea necesario
}

export default async function PlantillaPage({ params }: PlantillaPageProps) {
  const { slug } = await params

  // Si existe un redirect, aplicarlo
  const redirectUrl = PLANTILLA_REDIRECTS[slug]

  if (redirectUrl) {
    redirect(redirectUrl)
  }

  // Si no existe, redirigir a la página de recursos principal
  redirect('/recursos')
}

// Generate static params para las plantillas conocidas
export async function generateStaticParams() {
  return Object.keys(PLANTILLA_REDIRECTS).map((slug) => ({ slug }))
}
