import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function enrollInReviewsSequence() {
  const email = 'alejandrosatlla@gmail.com'

  // Find or create subscriber
  let subscriber = await prisma.emailSubscriber.findUnique({
    where: { email }
  })

  if (!subscriber) {
    subscriber = await prisma.emailSubscriber.create({
      data: {
        email,
        name: 'Alejandro',
        source: 'tool_plantilla-reviews',
        status: 'active',
        tags: ['tool_plantilla-reviews', 'test-manual']
      }
    })
    console.log('Created subscriber:', subscriber.id)
  } else {
    // Update tags
    await prisma.emailSubscriber.update({
      where: { id: subscriber.id },
      data: {
        tags: { push: ['tool_plantilla-reviews', 'test-manual'] }
      }
    })
    console.log('Updated subscriber:', subscriber.id)
  }

  // Find the reviews sequence
  const sequence = await prisma.emailSequence.findFirst({
    where: {
      name: 'Tool: Plantilla de Reviews',
      isActive: true
    },
    include: {
      steps: {
        where: { isActive: true },
        orderBy: { order: 'asc' }
      }
    }
  })

  if (!sequence) {
    console.log('ERROR: Sequence not found')
    return
  }

  console.log('Found sequence:', sequence.name, 'with', sequence.steps.length, 'steps')

  // Check if already enrolled
  const existing = await prisma.sequenceEnrollment.findUnique({
    where: {
      subscriberId_sequenceId: {
        subscriberId: subscriber.id,
        sequenceId: sequence.id
      }
    }
  })

  if (existing) {
    console.log('Already enrolled, deleting old enrollment...')
    await prisma.scheduledEmail.deleteMany({
      where: { enrollmentId: existing.id }
    })
    await prisma.sequenceEnrollment.delete({
      where: { id: existing.id }
    })
  }

  // Create enrollment
  const enrollment = await prisma.sequenceEnrollment.create({
    data: {
      subscriberId: subscriber.id,
      sequenceId: sequence.id,
      status: 'active',
      currentStepOrder: 0
    }
  })

  console.log('Created enrollment:', enrollment.id)

  // Schedule emails
  const now = new Date()
  let previousTime = now

  for (const step of sequence.steps) {
    const delayMs = (step.delayDays * 24 * 60 * 60 * 1000) + ((step.delayHours || 0) * 60 * 60 * 1000)
    let scheduledFor = new Date(previousTime.getTime() + delayMs)

    // For day 0, send immediately (in next cron run)
    if (step.delayDays === 0) {
      scheduledFor = new Date(now.getTime() + 60000) // 1 minute from now
    }

    await prisma.scheduledEmail.create({
      data: {
        enrollmentId: enrollment.id,
        stepId: step.id,
        subscriberId: subscriber.id,
        recipientEmail: email,
        recipientName: 'Alejandro',
        subject: step.subject,
        templateName: step.templateName,
        templateData: {},
        scheduledFor,
        status: 'pending'
      }
    })

    console.log('Scheduled:', step.name, 'for', scheduledFor.toISOString())
    previousTime = scheduledFor
  }

  console.log('\n✅ Enrolled successfully! Emails will be sent by the cron job.')
}

enrollInReviewsSequence()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
