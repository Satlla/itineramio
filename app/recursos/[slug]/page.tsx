import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLeadMagnetBySlug, getAllLeadMagnetSlugs } from '@/data/lead-magnets'
import LeadMagnetHero from '@/components/lead-magnets/LeadMagnetHero'
import LeadMagnetForm from '@/components/lead-magnets/LeadMagnetForm'
import ContentPreview from '@/components/lead-magnets/ContentPreview'
import TestimonialSection from '@/components/lead-magnets/TestimonialSection'
import BenefitsSection from '@/components/lead-magnets/BenefitsSection'

export async function generateStaticParams() {
  return getAllLeadMagnetSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const leadMagnet = getLeadMagnetBySlug(slug)

  if (!leadMagnet) {
    return {
      title: 'Recurso no encontrado',
    }
  }

  return {
    title: `${leadMagnet.title} - ${leadMagnet.subtitle} | Itineramio`,
    description: leadMagnet.description,
    openGraph: {
      title: leadMagnet.title,
      description: leadMagnet.description,
      type: 'website',
    },
  }
}

export default async function LeadMagnetPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const leadMagnet = getLeadMagnetBySlug(slug)

  if (!leadMagnet) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <LeadMagnetHero leadMagnet={leadMagnet} />

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Form Section - Full Width */}
        <div className="mb-8 lg:mb-10">
          <LeadMagnetForm leadMagnet={leadMagnet} />
        </div>

        {/* Content Preview - Full Width */}
        <div className="mb-8 lg:mb-10">
          <ContentPreview leadMagnet={leadMagnet} />
        </div>

        {/* Benefits Section - Full Width */}
        <BenefitsSection leadMagnet={leadMagnet} />

        {/* Testimonial Section */}
        {leadMagnet.testimonial && (
          <div className="mt-10 lg:mt-12">
            <TestimonialSection testimonial={leadMagnet.testimonial} />
          </div>
        )}

        {/* Trust Signals */}
        <div className="mt-10 lg:mt-12 border-t border-gray-200 pt-8 lg:pt-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600">
                {leadMagnet.pages}
              </div>
              <div className="mt-2 text-gray-600">páginas de contenido</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">100%</div>
              <div className="mt-2 text-gray-600">gratis y sin spam</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">
                {leadMagnet.downloadables.length}
              </div>
              <div className="mt-2 text-gray-600">recursos incluidos</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
