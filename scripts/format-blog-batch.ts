import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Article IDs to format
const articleIds = [
  'cmiq5kw7k00017co5t5ynrc30', // mensajes-automaticos-booking
  'cmiq5kvi900007co5soytmb7p', // mensajes-automaticos-airbnb
  'cmi4dw5yi00007cfx4hlferv3', // metodologia-datos-itineramio
  'cmi3galw200027c2wcah8qrhw', // caso-laura
  'cmi3galjk00017c2wh9s25tvo', // del-modo-bombero-al-modo-ceo
  'cmi3g0f0u00007cwd9dxmw4tw', // revpar-vs-ocupacion
  'cmhi1q60500007cgbn21jv7re', // manual-digital
  'cmhe1ga4s00017cqean8wlpjy', // vut-madrid-2025
  'cmhe1g9s200007cqejf99s962', // plantilla-check-in-remoto
  'cmhe19f5600017che6hy2p6yd', // instrucciones-wifi
  'cmhe19erk00007chedbhrdb33', // qr-code
  'cmhe0v7fg00007c6j56v6gyzy', // manual-digital-guia-completa
  'cmhdywg9500057cm2ik2mftj9', // operaciones-check-in
  'cmhdywfym00047cm2l8j6nizb', // 10-trucos-marketing
  'cmhdywfny00037cm2tx0suxd6', // automatizacion-anfitriones
  'cmhdywfd500027cm2gfahej8p', // normativa-vut-2025
  'cmhdywf2500017cm25c5cwhps', // manual-digital-apartamentos
  'cmhdyweq700007cm243p73ujg'  // como-optimizar-precio
]

async function main() {
  const batch = process.argv[2] ? parseInt(process.argv[2]) : 0
  const batchSize = 3

  const start = batch * batchSize
  const end = start + batchSize
  const ids = articleIds.slice(start, end)

  console.log(`Processing batch ${batch}: articles ${start} to ${end - 1}`)

  for (const id of ids) {
    const article = await prisma.blogPost.findUnique({
      where: { id },
      select: { id: true, slug: true, title: true }
    })

    if (article) {
      console.log(`- ${article.slug}: ${article.title}`)
    }
  }

  await prisma.$disconnect()
}

main()
