/**
 * Script para manipular usuarios del test de perfil de anfitrión
 *
 * Uso:
 *   node scripts/manage-users.js list              - Listar todos los usuarios
 *   node scripts/manage-users.js stats             - Ver estadísticas
 *   node scripts/manage-users.js delete [email]    - Borrar un usuario por email
 *   node scripts/manage-users.js update [email] [archetype] - Cambiar arquetipo
 *   node scripts/manage-users.js clear-all         - PELIGRO: Borrar todos los test
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function listUsers() {
  const tests = await prisma.hostProfileTest.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20
  })

  console.log('\n📋 ÚLTIMOS 20 USUARIOS DEL TEST:\n')
  console.log('='.repeat(100))

  tests.forEach((test, i) => {
    console.log(`${i + 1}. ${test.name || 'Sin nombre'} (${test.email || 'Sin email'})`)
    console.log(`   Arquetipo: ${test.archetype}`)
    console.log(`   Género: ${test.gender || 'No especificado'}`)
    console.log(`   Fecha: ${test.createdAt.toLocaleString('es-ES')}`)
    console.log(`   ID: ${test.id}`)
    console.log('-'.repeat(100))
  })

  // También listar EmailSubscribers
  const subscribers = await prisma.emailSubscriber.findMany({
    where: { source: 'host_profile_test' },
    orderBy: { createdAt: 'desc' },
    take: 20
  })

  console.log('\n\n📧 ÚLTIMOS 20 SUSCRIPTORES:\n')
  console.log('='.repeat(100))

  subscribers.forEach((sub, i) => {
    console.log(`${i + 1}. ${sub.name || 'Sin nombre'} (${sub.email})`)
    console.log(`   Arquetipo: ${sub.archetype}`)
    console.log(`   Engagement: ${sub.engagementScore} | Journey: ${sub.currentJourneyStage}`)
    console.log(`   Emails enviados: ${sub.emailsSent} | Abiertos: ${sub.emailsOpened}`)
    console.log(`   Descargó guía: ${sub.downloadedGuide ? 'Sí' : 'No'}`)
    console.log(`   Fecha: ${sub.subscribedAt.toLocaleString('es-ES')}`)
    console.log('-'.repeat(100))
  })
}

async function getStats() {
  const totalTests = await prisma.hostProfileTest.count()
  const totalSubscribers = await prisma.emailSubscriber.count({
    where: { source: 'host_profile_test' }
  })

  // Stats por arquetipo
  const byArchetype = await prisma.hostProfileTest.groupBy({
    by: ['archetype'],
    _count: { archetype: true }
  })

  // Stats por género
  const byGender = await prisma.hostProfileTest.groupBy({
    by: ['gender'],
    _count: { gender: true }
  })

  console.log('\n📊 ESTADÍSTICAS:\n')
  console.log('='.repeat(60))
  console.log(`Total de tests completados: ${totalTests}`)
  console.log(`Total de suscriptores: ${totalSubscribers}`)
  console.log()
  console.log('Por arquetipo:')
  byArchetype.forEach(item => {
    console.log(`  ${item.archetype}: ${item._count.archetype} (${Math.round(item._count.archetype / totalTests * 100)}%)`)
  })
  console.log()
  console.log('Por género:')
  byGender.forEach(item => {
    const genderLabel = item.gender === 'M' ? 'Masculino' : item.gender === 'F' ? 'Femenino' : item.gender === 'O' ? 'Otro' : 'No especificado'
    console.log(`  ${genderLabel}: ${item._count.gender} (${Math.round(item._count.gender / totalTests * 100)}%)`)
  })
  console.log('='.repeat(60))
}

async function deleteUser(email) {
  if (!email) {
    console.error('❌ Debes proporcionar un email')
    process.exit(1)
  }

  console.log(`\n🗑️  Borrando usuario: ${email}\n`)

  // Borrar de HostProfileTest
  const deletedTest = await prisma.hostProfileTest.deleteMany({
    where: { email }
  })

  // Borrar de EmailSubscriber
  const deletedSubscriber = await prisma.emailSubscriber.deleteMany({
    where: { email }
  })

  console.log(`✅ Borrados:`)
  console.log(`   - ${deletedTest.count} test(s)`)
  console.log(`   - ${deletedSubscriber.count} suscriptor(es)`)
}

async function updateArchetype(email, newArchetype) {
  if (!email || !newArchetype) {
    console.error('❌ Uso: node scripts/manage-users.js update [email] [archetype]')
    console.error('   Arquetipos válidos: ESTRATEGA, SISTEMATICO, DIFERENCIADOR, EJECUTOR, RESOLUTOR, EXPERIENCIAL, EQUILIBRADO, IMPROVISADOR')
    process.exit(1)
  }

  const validArchetypes = ['ESTRATEGA', 'SISTEMATICO', 'DIFERENCIADOR', 'EJECUTOR', 'RESOLUTOR', 'EXPERIENCIAL', 'EQUILIBRADO', 'IMPROVISADOR']
  if (!validArchetypes.includes(newArchetype.toUpperCase())) {
    console.error('❌ Arquetipo inválido')
    console.error('   Arquetipos válidos:', validArchetypes.join(', '))
    process.exit(1)
  }

  console.log(`\n✏️  Actualizando ${email} → ${newArchetype}\n`)

  // Actualizar en HostProfileTest
  await prisma.hostProfileTest.updateMany({
    where: { email },
    data: { archetype: newArchetype.toUpperCase() }
  })

  // Actualizar en EmailSubscriber
  await prisma.emailSubscriber.updateMany({
    where: { email },
    data: { archetype: newArchetype.toUpperCase() }
  })

  console.log('✅ Usuario actualizado')
}

async function clearAll() {
  console.log('\n⚠️  PELIGRO: Esto borrará TODOS los tests y suscriptores del perfil de anfitrión\n')
  console.log('Esta acción NO se puede deshacer.\n')

  // En un script real, aquí pediríamos confirmación
  // Por seguridad, vamos a evitar la ejecución automática
  console.log('❌ Operación cancelada por seguridad.')
  console.log('Si realmente quieres borrar todo, edita este script y descomenta las líneas de borrado.')

  // await prisma.hostProfileTest.deleteMany({})
  // await prisma.emailSubscriber.deleteMany({ where: { source: 'host_profile_test' } })
  // console.log('✅ Todos los datos borrados')
}

// Main
async function main() {
  const command = process.argv[2]
  const arg1 = process.argv[3]
  const arg2 = process.argv[4]

  try {
    switch (command) {
      case 'list':
        await listUsers()
        break
      case 'stats':
        await getStats()
        break
      case 'delete':
        await deleteUser(arg1)
        break
      case 'update':
        await updateArchetype(arg1, arg2)
        break
      case 'clear-all':
        await clearAll()
        break
      default:
        console.log('\n📚 USO:\n')
        console.log('  node scripts/manage-users.js list              - Listar usuarios')
        console.log('  node scripts/manage-users.js stats             - Ver estadísticas')
        console.log('  node scripts/manage-users.js delete [email]    - Borrar usuario')
        console.log('  node scripts/manage-users.js update [email] [archetype] - Cambiar arquetipo')
        console.log('  node scripts/manage-users.js clear-all         - Borrar todos los test')
        console.log()
    }
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(console.error)
