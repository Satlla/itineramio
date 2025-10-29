const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function test() {
  // Find the original property
  const original = await prisma.property.findFirst({
    where: {
      name: { path: ['es'], string_contains: 'mi casita de papel' }
    },
    orderBy: { createdAt: 'asc' }
  })

  if (!original) {
    console.log('Original property not found')
    await prisma.$disconnect()
    return
  }

  console.log('Original property:', original.name)
  console.log('  status:', original.status)
  console.log('  isPublished:', original.isPublished)

  // Find all duplicates
  const duplicates = await prisma.property.findMany({
    where: {
      name: { path: ['es'], string_contains: 'mi casita de papel' },
      id: { not: original.id }
    },
    orderBy: { createdAt: 'desc' }
  })

  console.log('\nDuplicates found:', duplicates.length)
  duplicates.forEach((dup, i) => {
    console.log(`  ${i+1}. ${dup.name}`)
    console.log('     status:', dup.status)
    console.log('     isPublished:', dup.isPublished)
    console.log('     created:', dup.createdAt)
  })

  await prisma.$disconnect()
}

test()
