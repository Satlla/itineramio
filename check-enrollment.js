const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function check() {
  const seq = await prisma.emailSequence.findFirst({
    where: { targetSource: 'tool_house-rules-generator' }
  })

  if (seq === null) {
    console.log('No sequence for tool_house-rules-generator')
    await prisma.$disconnect()
    return
  }

  console.log('Sequence:', seq.name, '| ID:', seq.id)

  const enrollments = await prisma.sequenceEnrollment.findMany({
    where: { sequenceId: seq.id }
  })

  console.log('\nEnrollments:', enrollments.length)
  enrollments.forEach(e => console.log('- subscriberId: ' + e.subscriberId + ' | status: ' + e.status))

  const me = await prisma.emailSubscriber.findUnique({
    where: { email: 'alejandrosatlla@gmail.com' }
  })

  if (me) {
    console.log('\n=== TU SUBSCRIBER ID ===', me.id)
    const myEnrollment = await prisma.sequenceEnrollment.findFirst({
      where: { subscriberId: me.id, sequenceId: seq.id }
    })
    console.log('=== TU ENROLLMENT ===')
    if (myEnrollment) {
      console.log('Status:', myEnrollment.status)
      console.log('Current Step:', myEnrollment.currentStep)
    } else {
      console.log('NO enrollment for your email in this sequence')
    }

    // Check all your enrollments
    const allMyEnrollments = await prisma.sequenceEnrollment.findMany({
      where: { subscriberId: me.id }
    })
    console.log('\n=== TODAS TUS ENROLLMENTS ===')
    console.log('Total:', allMyEnrollments.length)
    allMyEnrollments.forEach(e => console.log('- sequenceId: ' + e.sequenceId + ' | status: ' + e.status))
  }

  await prisma.$disconnect()
}
check()
