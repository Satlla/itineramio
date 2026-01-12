/**
 * Unified Lead Management
 *
 * One Lead per person (by email). All funnel steps update the same Lead.
 */

import { prisma } from '@/lib/prisma'

// Types for the unified lead structure
export interface LeadCompleted {
  calculator?: boolean
  plantillasForm?: boolean
  quiz?: boolean
  videoCall?: boolean
  // Add more steps as needed
}

export interface CalculatorData {
  properties: number
  hoursPerYear: number
  checkinsPerMonth?: number
  moneyLostPerYear?: number
  completedAt: string
}

export interface PlantillasFormData {
  propiedades: string
  automatizacion: string
  intereses: string[]
  comentario?: string
  resourceSlug: string
  completedAt: string
}

export interface QuizData {
  testResultId: string
  archetype: string
  topStrength: string
  criticalGap: string
  scores: Record<string, number>
  completedAt: string
}

export interface UnifiedLeadMetadata {
  // Journey completion tracking
  completed: LeadCompleted

  // Data from each step
  calculator?: CalculatorData
  plantillasForm?: PlantillasFormData
  quiz?: QuizData

  // Qualification
  score: number
  status: 'cold' | 'warm' | 'hot'

  // Tracking
  firstTouch: string
  lastActivity: string
  source: string  // Original source (first touch)
  emailsClicked?: string[]
}

/**
 * Calculate lead score based on completed steps and data
 */
function calculateLeadScore(metadata: Partial<UnifiedLeadMetadata>): number {
  let score = 0
  const completed = metadata.completed || {}

  // Points for completing steps
  if (completed.calculator) score += 10
  if (completed.plantillasForm) score += 25
  if (completed.quiz) score += 30
  if (completed.videoCall) score += 35

  // Bonus points from plantillas form data
  if (metadata.plantillasForm) {
    const { propiedades, automatizacion, intereses } = metadata.plantillasForm

    // Properties score
    const propScore: Record<string, number> = { '1': 2, '2-3': 5, '4-5': 10, '6-10': 15, '10+': 15 }
    score += propScore[propiedades] || 0

    // Automation level (less automation = more potential)
    const autoScore: Record<string, number> = { 'nada': 10, 'basico': 5, 'herramientas': 2 }
    score += autoScore[automatizacion] || 0

    // Interests
    score += Math.min((intereses?.length || 0) * 2, 10)
  }

  return Math.min(score, 100)
}

/**
 * Determine lead status based on score and activity
 */
function determineStatus(score: number, completed: LeadCompleted): 'cold' | 'warm' | 'hot' {
  if (completed.quiz || completed.videoCall || score >= 70) return 'hot'
  if (completed.plantillasForm || score >= 40) return 'warm'
  return 'cold'
}

/**
 * Find or create a unified lead by email
 */
export async function findOrCreateLead(email: string, source: string): Promise<{
  lead: { id: string; email: string; source: string; metadata: UnifiedLeadMetadata }
  isNew: boolean
}> {
  const normalizedEmail = email.toLowerCase().trim()

  // Find existing lead by email
  const existingLead = await prisma.lead.findFirst({
    where: { email: normalizedEmail },
    orderBy: { createdAt: 'desc' }
  })

  if (existingLead) {
    // Parse existing metadata
    const existingMetadata = (existingLead.metadata as Record<string, unknown>) || {}

    // Merge with unified structure
    const metadata: UnifiedLeadMetadata = {
      completed: (existingMetadata.completed as LeadCompleted) || {},
      calculator: existingMetadata.calculator as CalculatorData | undefined,
      plantillasForm: existingMetadata.plantillasForm as PlantillasFormData | undefined,
      quiz: existingMetadata.quiz as QuizData | undefined,
      score: (existingMetadata.score as number) || 0,
      status: (existingMetadata.status as 'cold' | 'warm' | 'hot') || 'cold',
      firstTouch: (existingMetadata.firstTouch as string) || existingLead.createdAt.toISOString(),
      lastActivity: new Date().toISOString(),
      source: (existingMetadata.source as string) || existingLead.source,
      emailsClicked: existingMetadata.emailsClicked as string[] | undefined
    }

    return {
      lead: {
        id: existingLead.id,
        email: existingLead.email,
        source: existingLead.source,
        metadata
      },
      isNew: false
    }
  }

  // Create new lead
  const now = new Date().toISOString()
  const metadata: UnifiedLeadMetadata = {
    completed: {},
    score: 0,
    status: 'cold',
    firstTouch: now,
    lastActivity: now,
    source
  }

  const newLead = await prisma.lead.create({
    data: {
      email: normalizedEmail,
      source,
      metadata
    }
  })

  return {
    lead: {
      id: newLead.id,
      email: newLead.email,
      source: newLead.source,
      metadata
    },
    isNew: true
  }
}

/**
 * Update lead with calculator data
 */
export async function updateLeadWithCalculator(
  email: string,
  data: {
    properties: number
    hoursPerYear: number
    checkinsPerMonth?: number
    moneyLostPerYear?: number
  }
): Promise<void> {
  const { lead } = await findOrCreateLead(email, 'calculator')

  const metadata: UnifiedLeadMetadata = {
    ...lead.metadata,
    completed: {
      ...lead.metadata.completed,
      calculator: true
    },
    calculator: {
      ...data,
      completedAt: new Date().toISOString()
    },
    lastActivity: new Date().toISOString()
  }

  metadata.score = calculateLeadScore(metadata)
  metadata.status = determineStatus(metadata.score, metadata.completed)

  await prisma.lead.update({
    where: { id: lead.id },
    data: { metadata }
  })
}

/**
 * Update lead with plantillas form data
 */
export async function updateLeadWithPlantillasForm(
  email: string,
  data: {
    propiedades: string
    automatizacion: string
    intereses: string[]
    comentario?: string
    resourceSlug: string
    sourceEmail?: string
  }
): Promise<{ leadId: string; score: number; status: string }> {
  const { lead } = await findOrCreateLead(email, 'funnel-plantillas')

  // Track email clicks
  const emailsClicked = lead.metadata.emailsClicked || []
  if (data.sourceEmail && !emailsClicked.includes(data.sourceEmail)) {
    emailsClicked.push(data.sourceEmail)
  }

  const metadata: UnifiedLeadMetadata = {
    ...lead.metadata,
    completed: {
      ...lead.metadata.completed,
      plantillasForm: true
    },
    plantillasForm: {
      propiedades: data.propiedades,
      automatizacion: data.automatizacion,
      intereses: data.intereses,
      comentario: data.comentario,
      resourceSlug: data.resourceSlug,
      completedAt: new Date().toISOString()
    },
    emailsClicked,
    lastActivity: new Date().toISOString()
  }

  metadata.score = calculateLeadScore(metadata)
  metadata.status = determineStatus(metadata.score, metadata.completed)

  await prisma.lead.update({
    where: { id: lead.id },
    data: { metadata }
  })

  return {
    leadId: lead.id,
    score: metadata.score,
    status: metadata.status
  }
}

/**
 * Update lead with quiz data
 */
export async function updateLeadWithQuiz(
  email: string,
  data: {
    testResultId: string
    archetype: string
    topStrength: string
    criticalGap: string
    scores: Record<string, number>
    sourceEmail?: string
  }
): Promise<{ leadId: string; score: number; status: string }> {
  const { lead } = await findOrCreateLead(email, 'quiz')

  // Track email clicks
  const emailsClicked = lead.metadata.emailsClicked || []
  if (data.sourceEmail && !emailsClicked.includes(data.sourceEmail)) {
    emailsClicked.push(data.sourceEmail)
  }

  const metadata: UnifiedLeadMetadata = {
    ...lead.metadata,
    completed: {
      ...lead.metadata.completed,
      quiz: true
    },
    quiz: {
      testResultId: data.testResultId,
      archetype: data.archetype,
      topStrength: data.topStrength,
      criticalGap: data.criticalGap,
      scores: data.scores,
      completedAt: new Date().toISOString()
    },
    emailsClicked,
    lastActivity: new Date().toISOString()
  }

  metadata.score = calculateLeadScore(metadata)
  metadata.status = determineStatus(metadata.score, metadata.completed)

  await prisma.lead.update({
    where: { id: lead.id },
    data: { metadata }
  })

  return {
    leadId: lead.id,
    score: metadata.score,
    status: metadata.status
  }
}

/**
 * Mark video call as completed
 */
export async function updateLeadWithVideoCall(email: string): Promise<void> {
  const { lead } = await findOrCreateLead(email, 'video-call')

  const metadata: UnifiedLeadMetadata = {
    ...lead.metadata,
    completed: {
      ...lead.metadata.completed,
      videoCall: true
    },
    lastActivity: new Date().toISOString()
  }

  metadata.score = calculateLeadScore(metadata)
  metadata.status = determineStatus(metadata.score, metadata.completed)

  await prisma.lead.update({
    where: { id: lead.id },
    data: { metadata }
  })
}

/**
 * Get unified lead by email
 */
export async function getUnifiedLead(email: string): Promise<{
  id: string
  email: string
  source: string
  metadata: UnifiedLeadMetadata
  createdAt: Date
} | null> {
  const normalizedEmail = email.toLowerCase().trim()

  const lead = await prisma.lead.findFirst({
    where: { email: normalizedEmail },
    orderBy: { createdAt: 'desc' }
  })

  if (!lead) return null

  const existingMetadata = (lead.metadata as Record<string, unknown>) || {}

  return {
    id: lead.id,
    email: lead.email,
    source: lead.source,
    metadata: {
      completed: (existingMetadata.completed as LeadCompleted) || {},
      calculator: existingMetadata.calculator as CalculatorData | undefined,
      plantillasForm: existingMetadata.plantillasForm as PlantillasFormData | undefined,
      quiz: existingMetadata.quiz as QuizData | undefined,
      score: (existingMetadata.score as number) || 0,
      status: (existingMetadata.status as 'cold' | 'warm' | 'hot') || 'cold',
      firstTouch: (existingMetadata.firstTouch as string) || lead.createdAt.toISOString(),
      lastActivity: (existingMetadata.lastActivity as string) || lead.createdAt.toISOString(),
      source: (existingMetadata.source as string) || lead.source,
      emailsClicked: existingMetadata.emailsClicked as string[] | undefined
    },
    createdAt: lead.createdAt
  }
}

/**
 * Get all unified leads (for admin)
 */
export async function getAllUnifiedLeads(options?: {
  status?: 'cold' | 'warm' | 'hot'
  hasQuiz?: boolean
  limit?: number
}): Promise<Array<{
  id: string
  email: string
  source: string
  metadata: UnifiedLeadMetadata
  createdAt: Date
}>> {
  // Get unique emails with their most recent lead
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' }
  })

  // Group by email, keep most recent
  const emailMap = new Map<string, typeof leads[0]>()
  for (const lead of leads) {
    if (!emailMap.has(lead.email)) {
      emailMap.set(lead.email, lead)
    }
  }

  let results = Array.from(emailMap.values()).map(lead => {
    const existingMetadata = (lead.metadata as Record<string, unknown>) || {}

    return {
      id: lead.id,
      email: lead.email,
      source: lead.source,
      metadata: {
        completed: (existingMetadata.completed as LeadCompleted) || {},
        calculator: existingMetadata.calculator as CalculatorData | undefined,
        plantillasForm: existingMetadata.plantillasForm as PlantillasFormData | undefined,
        quiz: existingMetadata.quiz as QuizData | undefined,
        score: (existingMetadata.score as number) || 0,
        status: (existingMetadata.status as 'cold' | 'warm' | 'hot') || 'cold',
        firstTouch: (existingMetadata.firstTouch as string) || lead.createdAt.toISOString(),
        lastActivity: (existingMetadata.lastActivity as string) || lead.createdAt.toISOString(),
        source: (existingMetadata.source as string) || lead.source,
        emailsClicked: existingMetadata.emailsClicked as string[] | undefined
      },
      createdAt: lead.createdAt
    }
  })

  // Apply filters
  if (options?.status) {
    results = results.filter(r => r.metadata.status === options.status)
  }

  if (options?.hasQuiz) {
    results = results.filter(r => r.metadata.completed.quiz)
  }

  if (options?.limit) {
    results = results.slice(0, options.limit)
  }

  return results
}
