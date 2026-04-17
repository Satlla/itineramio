'use client'

import { useParams } from 'next/navigation'
import { IntelligencePanel } from '@/components/intelligence/IntelligencePanel'

export default function IntelligencePage() {
  const params = useParams()
  const id = params.id as string
  return <IntelligencePanel propertyId={id} embedded={false} />
}
