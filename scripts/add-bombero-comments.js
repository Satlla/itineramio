const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Comentarios realistas
const comments = [
  {
    authorName: 'María García',
    authorEmail: 'maria.garcia.apt@gmail.com',
    content: 'Madre mia esto me describe perfectamente 😅 llevo 2 años con mi apartamento en Malaga y sigo contestando las mismas preguntas. Voy a probar lo del manual digital a ver que tal',
    createdAt: new Date('2025-01-25T14:32:00Z')
  },
  {
    authorName: 'Carlos',
    authorEmail: 'carlos.bcn.host@outlook.com',
    content: 'El test me salio "bombero total" jajaja no me sorprende. Tengo 3 pisos y paso el dia pegado al movil. Alguna recomendacion para empezar? es que no se por donde',
    createdAt: new Date('2025-01-25T18:15:00Z')
  },
  {
    authorName: 'John Mitchell',
    authorEmail: 'johnm.vacation@gmail.com',
    content: 'Great article! I manage 2 properties in Barcelona and this is exactly what I needed to read. The quiz was eye-opening, got "transition mode" which makes sense. Will try implementing the automated messages first.',
    createdAt: new Date('2025-01-26T09:45:00Z')
  },
  {
    authorName: 'Ana Ruiz',
    authorEmail: 'anaruiz.sevilla@yahoo.es',
    content: 'Lo de los QRs por zonas lo llevo queriendo hacer desde hace meses pero nunca encuentro el momento... alguien sabe si es muy complicado de montar?',
    createdAt: new Date('2025-01-26T11:20:00Z')
  },
  {
    authorName: 'Pedro Jimenez',
    authorEmail: 'pedrojimenez1985@gmail.com',
    content: 'Yo implemente los mensajes automaticos hace 6 meses y la diferencia es brutal. Antes recibia 15-20 mensajes al dia ahora como mucho 3 o 4. Lo unico malo es que al principio cuesta configurarlo todo bien',
    createdAt: new Date('2025-01-26T16:08:00Z')
  },
  {
    authorName: 'Laura',
    authorEmail: 'laurahostbcn@gmail.com',
    content: 'El caso de David me ha motivado mucho! Yo tengo 5 apartamentos y estoy agotadisima, pensaba que para crecer necesitaba contratar pero veo que no necesariamente. Gracias por el articulo',
    createdAt: new Date('2025-01-27T08:30:00Z')
  },
  {
    authorName: 'Mike',
    authorEmail: 'mike.uk.host@hotmail.com',
    content: 'Been doing Airbnb for 5 years and still in firefighter mode lol. The part about 80% of issues coming from poor information hit home hard',
    createdAt: new Date('2025-01-27T12:55:00Z')
  },
  {
    authorName: 'Sandra Lopez',
    authorEmail: 'sandralopez_apt@gmail.com',
    content: 'Una pregunta, el checklist de limpieza que mencionais donde lo puedo descargar?? He buscado pero no lo encuentro',
    createdAt: new Date('2025-01-27T15:40:00Z')
  },
  {
    authorName: 'Javier M.',
    authorEmail: 'javier.madrid.host@gmail.com',
    content: 'Muy buen contenido. Yo uso itineramio desde hace unos meses y la verdad es que me ha cambiado bastante la forma de trabajar. Los huespedes tienen toda la info y ya casi no me escriben',
    createdAt: new Date('2025-01-28T10:12:00Z')
  },
  {
    authorName: 'Elena',
    authorEmail: 'elena.costa.brava@outlook.es',
    content: 'jajaja el test ese da mucha risa pero es verdad eh, somos bomberos 🔥🔥 mi marido siempre me dice que deje de mirar el movil pero es que siempre hay algo',
    createdAt: new Date('2025-01-28T14:25:00Z')
  },
  {
    authorName: 'Roberto Fernandez',
    authorEmail: 'rfernandez.alicante@gmail.com',
    content: 'Al fin un articulo que habla claro. Estoy harto de leer consejos genericos tipo "responde rapido a tus huespedes". Esto si que es practico',
    createdAt: new Date('2025-01-28T19:50:00Z')
  },
  {
    authorName: 'Sarah',
    authorEmail: 'sarahwilson.travel@gmail.com',
    content: 'Question - do you think this approach works for just 1 property? I only have one apartment but still spend way too much time on it',
    createdAt: new Date('2025-01-29T07:15:00Z')
  }
]

async function main() {
  // Obtener el ID del post
  const post = await prisma.blogPost.findUnique({
    where: { slug: 'del-modo-bombero-al-modo-ceo-framework' },
    select: { id: true }
  })

  if (!post) {
    console.log('❌ Artículo no encontrado')
    return
  }

  console.log('Post ID:', post.id)

  // Eliminar comentarios existentes del artículo
  const deleted = await prisma.blogComment.deleteMany({
    where: { postId: post.id }
  })
  console.log('🗑️ Comentarios eliminados:', deleted.count)

  // Añadir nuevos comentarios
  for (const comment of comments) {
    await prisma.blogComment.create({
      data: {
        postId: post.id,
        authorName: comment.authorName,
        authorEmail: comment.authorEmail,
        content: comment.content,
        status: 'APPROVED',
        emailVerified: true,
        createdAt: comment.createdAt,
        updatedAt: comment.createdAt
      }
    })
  }

  console.log('💬 ' + comments.length + ' comentarios añadidos')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
