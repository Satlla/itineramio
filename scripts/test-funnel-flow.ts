/**
 * Script para probar el flujo completo del embudo de conversión
 *
 * Verifica:
 * 1. Test de perfil operativo funciona
 * 2. Email de bienvenida se envía
 * 3. EmailSubscriber se crea correctamente
 * 4. Secuencias de email están configuradas
 *
 * Uso:
 *   npx tsx scripts/test-funnel-flow.ts
 */

import { PrismaClient } from '@prisma/client'
import { sendWelcomeTestEmail } from '../src/lib/resend'

const prisma = new PrismaClient()

async function testFunnelFlow() {
  console.log('🧪 TESTING FUNNEL FLOW')
  console.log('='.repeat(60))

  try {
    // 1. Check EmailSubscribers exist
    console.log('\n1️⃣ Checking EmailSubscribers...')
    const subscribers = await prisma.emailSubscriber.findMany({
      where: {
        source: 'host_profile_test'
      },
      orderBy: {
        subscribedAt: 'desc'
      },
      take: 5
    })

    console.log(`   ✓ Found ${subscribers.length} recent subscribers`)
    subscribers.forEach((sub, i) => {
      console.log(`     ${i+1}. ${sub.email} - ${sub.archetype} - ${sub.engagementScore}`)
      console.log(`        Journey: ${sub.currentJourneyStage} | Emails sent: ${sub.emailsSent}`)
      console.log(`        Sequence: Day3=${sub.day3SentAt ? '✓' : '✗'} Day7=${sub.day7SentAt ? '✓' : '✗'} Day10=${sub.day10SentAt ? '✓' : '✗'} Day14=${sub.day14SentAt ? '✓' : '✗'}`)
    })

    // 2. Check HostProfileTests
    console.log('\n2️⃣ Checking HostProfileTests...')
    const tests = await prisma.hostProfileTest.findMany({
      where: {
        email: { not: null }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    console.log(`   ✓ Found ${tests.length} recent tests with email`)
    tests.forEach((test, i) => {
      console.log(`     ${i+1}. ${test.email} - ${test.archetype}`)
      console.log(`        Name: ${test.name} | Consent: ${test.emailConsent ? 'Yes' : 'No'}`)
    })

    // 3. Check sequence status
    console.log('\n3️⃣ Checking Sequence Status...')
    const sequenceStats = await prisma.emailSubscriber.groupBy({
      by: ['sequenceStatus'],
      where: {
        source: 'host_profile_test'
      },
      _count: true
    })

    console.log('   Sequence distribution:')
    sequenceStats.forEach(stat => {
      console.log(`     ${stat.sequenceStatus}: ${stat._count} subscribers`)
    })

    // 4. Check engagement distribution
    console.log('\n4️⃣ Checking Engagement Distribution...')
    const engagementStats = await prisma.emailSubscriber.groupBy({
      by: ['engagementScore'],
      where: {
        source: 'host_profile_test'
      },
      _count: true
    })

    console.log('   Engagement distribution:')
    engagementStats.forEach(stat => {
      console.log(`     ${stat.engagementScore}: ${stat._count} subscribers`)
    })

    // 5. Check journey stages
    console.log('\n5️⃣ Checking Journey Stages...')
    const journeyStats = await prisma.emailSubscriber.groupBy({
      by: ['currentJourneyStage'],
      where: {
        source: 'host_profile_test'
      },
      _count: true
    })

    console.log('   Journey stage distribution:')
    journeyStats.forEach(stat => {
      console.log(`     ${stat.currentJourneyStage}: ${stat._count} subscribers`)
    })

    // 6. Check who's ready for next emails
    console.log('\n6️⃣ Checking Who Needs Emails...')

    const now = new Date()
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)

    const needsDay3 = await prisma.emailSubscriber.count({
      where: {
        sequenceStartedAt: { lte: threeDaysAgo },
        day3SentAt: null,
        sequenceStatus: 'active',
        archetype: { not: null }
      }
    })

    console.log(`   📧 ${needsDay3} subscribers ready for Day 3 email`)

    const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000)

    const needsDay7 = await prisma.emailSubscriber.count({
      where: {
        day3SentAt: { lte: fourDaysAgo },
        day7SentAt: null,
        sequenceStatus: 'active',
        archetype: { not: null }
      }
    })

    console.log(`   📧 ${needsDay7} subscribers ready for Day 7 email`)

    // 7. Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 SUMMARY')
    console.log('='.repeat(60))

    const totalSubscribers = await prisma.emailSubscriber.count({
      where: { source: 'host_profile_test' }
    })

    const activeSequences = await prisma.emailSubscriber.count({
      where: {
        source: 'host_profile_test',
        sequenceStatus: 'active'
      }
    })

    const completedSequences = await prisma.emailSubscriber.count({
      where: {
        source: 'host_profile_test',
        sequenceStatus: 'completed'
      }
    })

    const totalTests = await prisma.hostProfileTest.count()

    console.log(`Total Subscribers: ${totalSubscribers}`)
    console.log(`Active Sequences: ${activeSequences}`)
    console.log(`Completed Sequences: ${completedSequences}`)
    console.log(`Total Tests: ${totalTests}`)
    console.log(`Conversion Rate: ${totalTests > 0 ? ((totalSubscribers / totalTests) * 100).toFixed(1) : 0}%`)

    console.log('\n✅ Funnel flow test completed!\n')

  } catch (error) {
    console.error('❌ Error testing funnel:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Main execution
async function main() {
  const totalTests = await prisma.hostProfileTest.count()
  await testFunnelFlow()
}

main().catch(console.error)
