const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Nombres españoles
const nombresEspanoles = [
  'María García', 'Carlos Ruiz', 'Ana Martínez', 'Pedro Sánchez', 'Laura Fernández',
  'Miguel Ángel López', 'Carmen Rodríguez', 'Javier Hernández', 'Isabel Moreno', 'Francisco Gil',
  'Lucía Díaz', 'Alberto Jiménez', 'Rosa Muñoz', 'David Álvarez', 'Elena Romero',
  'Pablo Navarro', 'Cristina Torres', 'Sergio Domínguez', 'Marta Vázquez', 'Raúl Castro',
  'Beatriz Ramos', 'Andrés Blanco', 'Patricia Molina', 'Óscar Ortega', 'Sandra Delgado'
]

// Nombres sudamericanos
const nombresSudamericanos = [
  'Valentina Rodríguez', 'Sebastián Pérez', 'Camila González', 'Matías Silva', 'Florencia López',
  'Nicolás Martínez', 'Agustina Fernández', 'Tomás García', 'Martina Díaz', 'Lucas Hernández',
  'Sofía Romero', 'Benjamín Torres', 'Catalina Vargas', 'Joaquín Muñoz', 'Isidora Soto',
  'Maximiliano Contreras', 'Antonia Reyes', 'Felipe Morales', 'Emilia Ortiz', 'Vicente Núñez',
  'Renata Espinoza', 'Alonso Fuentes', 'Amanda Rojas', 'Ignacio Vera', 'Daniela Figueroa',
  'Juan Pablo Mendoza', 'Ximena Carrasco', 'Diego Alejandro Ríos', 'Macarena Pizarro', 'Rodrigo Tapia',
  'Luciana Acosta', 'Facundo Medina', 'Milagros Aguirre', 'Thiago Cabrera', 'Julieta Pereyra',
  'Gonzalo Bustamante', 'Paloma Valenzuela', 'Mauricio Sepúlveda', 'Constanza Araya', 'Bruno Leiva'
]

// Nombres alemanes
const nombresAlemanes = [
  'Hans Müller', 'Sabine Schmidt', 'Klaus Weber', 'Petra Fischer', 'Wolfgang Schneider',
  'Ursula Meyer', 'Helmut Wagner', 'Ingrid Becker', 'Dieter Hoffmann', 'Monika Schulz',
  'Thomas Braun', 'Claudia Richter', 'Jürgen Klein', 'Andrea Wolf', 'Rainer Neumann'
]

// Nombres ingleses
const nombresIngleses = [
  'John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'James Wilson',
  'Jessica Taylor', 'Robert Anderson', 'Amanda Thomas', 'William Jackson', 'Jennifer White',
  'David Miller', 'Ashley Moore', 'Christopher Lee', 'Stephanie Harris', 'Matthew Clark'
]

// Comentarios en español sobre cursos y academia
const comentariosCursosAcademia = [
  "Muy buen artículo! Tenéis algún curso donde expliquéis todo esto más en detalle? Me vendría genial",
  "Hola! He visto que mencionáis una academia, cuando estará disponible? Estoy muy interesada en formarme",
  "Este contenido es oro puro. Hacéis formaciones online? Estaría dispuesto a pagar por un curso completo",
  "Me encanta vuestro blog! Tenéis pensado sacar algún curso o programa de formación? Lo necesito!",
  "Brutal el artículo. Hay alguna manera de aprender más con vosotros? Cursos, mentorías...",
  "Cuando sale la academia?? Llevo meses esperando, necesito ayuda profesional con mi alquiler vacacional",
  "Tenéis algún curso para principiantes? Acabo de empezar y estoy perdidísima",
  "Me gustaría formarme más en este tema. Ofrecéis algún tipo de consultoría o formación?",
  "Excelente contenido! Estaría genial que sacarais un curso completo, yo me apunto seguro",
  "Hay alguna manera de contratar vuestros servicios? Necesito ayuda personalizada",
  "Ojalá tengáis pronto la academia online, este sector necesita formación de calidad como la vuestra",
  "Super util! Teneis algo mas avanzado? algun master o curso intensivo?",
  "Me apunto a lo que saquéis, vuestro contenido es de los mejores que he encontrado en español",
  "Esto debería ser un curso de pago, menuda calidad. Avisadme cuando lancéis algo!",
  "Tenéis newsletter? No quiero perderme cuando saquéis la academia"
]

// Comentarios pidiendo ayuda
const comentariosAyuda = [
  "Necesito ayuda urgente, mi ocupación ha bajado muchísimo y no sé qué hacer. Algún consejo?",
  "Alguien me puede ayudar? Tengo 3 propiedades y no consigo llenarlas ni en temporada alta",
  "Estoy desesperado, llevo 2 meses sin reservas. Qué estoy haciendo mal?",
  "Ayuda porfavor!! acabo de empezar y no tengo ni idea de como conseguir mis primeras reseñas",
  "Me podéis echar una mano? Tengo muchas dudas sobre la fiscalidad de esto",
  "Hola necesito orientación, estoy pensando en comprar un piso para alquilar pero no sé por donde empezar",
  "Algien sabe como solucionar el tema de las licencias? en mi comunidad es un lio",
  "Help! Mi anuncio no aparece en las búsquedas de Airbnb, qué puedo hacer?",
  "Tengo un problema con un huésped que no quiere irse, alguien ha pasado por esto?",
  "No consigo subir mis precios sin perder reservas, necesito consejos por favor",
  "Alguien sabe de un buen gestor que entienda de alquiler vacacional? Estoy perdido con los impuestos",
  "Mi piso tiene malas reseñas heredadas del anterior dueño, cómo lo soluciono?",
  "Acabo de recibir una queja de la comunidad, qué hago ahora??",
  "Estoy pensando en dejar Airbnb por Booking, alguien lo ha hecho? Merece la pena?"
]

// Comentarios en inglés
const comentariosIngles = [
  "Great article! I'm managing properties in Spain and this is exactly what I needed. Thanks!",
  "Very helpful content. Do you offer any courses in English?",
  "I've been looking for information like this for months. Finally found it! Bookmarking this blog.",
  "Interesting approach. We do things differently in the UK but I can see how this would work in Spain.",
  "This is gold! Shared with my property management team. Keep up the great work!",
  "As an expat managing rentals in Costa del Sol, this blog is invaluable. Thank you!",
  "Would love to see more content about dealing with international guests. Any plans for that?",
  "Excellent tips! Just implemented some of these and already seeing results.",
  "Do you have a newsletter? I don't want to miss any of your posts.",
  "Finally someone who understands the vacation rental business! Subscribed!",
  "Managing 5 apartments in Barcelona, this content is super relevant. More please!",
  "The Spanish rental market is so different from the US. Great insights here.",
  "Just moved to Spain and starting my Airbnb journey. This blog is my bible now!",
  "Brilliant article. Any chance you'll translate more content to English?",
  "Love the practical approach. No fluff, just actionable advice. Respect!"
]

// Comentarios en alemán
const comentariosAleman = [
  "Sehr guter Artikel! Ich vermiete auf Mallorca und diese Tipps sind sehr hilfreich.",
  "Danke für die tollen Informationen. Gibt es auch Inhalte auf Deutsch?",
  "Als deutscher Vermieter in Spanien finde ich diesen Blog sehr wertvoll. Weiter so!",
  "Interessante Perspektive. Werde einige dieser Ideen ausprobieren.",
  "Endlich ein Blog der die Realität des Ferienvermietung versteht. Sehr empfehlenswert!",
  "Wir haben drei Wohnungen an der Costa Brava. Diese Tipps sind Gold wert!",
  "Vielen Dank für die praktischen Ratschläge. Sehr hilfreich für uns Deutsche in Spanien.",
  "Super Artikel! Habe ihn mit meinen Kollegen geteilt die auch in Spanien vermieten."
]

// Comentarios generales variados
const comentariosGenerales = [
  "Muy buen artículo, lo comparto con mis amigos que también alquilan",
  "Esto es justo lo que necesitaba leer hoy. Gracias!",
  "Llevaba tiempo buscando información así de clara. Genial!",
  "Me ha encantado, muy práctico y fácil de entender",
  "Excelente contenido como siempre. Sois los mejores!",
  "Wow, no sabía esto. Me ha abierto los ojos completamente",
  "Super útil! Ya lo estoy aplicando en mis propiedades",
  "Gracias por compartir vuestra experiencia, se nota que sabéis de lo que habláis",
  "Artículo muy completo, lo guardo en favoritos",
  "Esto es oro para cualquier anfitrión. Muchas gracias!",
  "Muy buena info, la verdad es que aprendo mucho con vuestro blog",
  "Increíble artículo, ya lo he compartido en mi grupo de WhatsApp de propietarios",
  "Me flipa vuestro contenido, siempre tan práctico y al grano",
  "Justo lo que necesitaba! Muchas gracias por el curro que os pegáis",
  "Enhorabuena por el blog, es de lo mejorcito que hay en español sobre el tema",
  "Brutal como siempre, no dejéis de publicar!",
  "Lo mejor que he leído en mucho tiempo sobre este tema",
  "Gracias por democratizar este conocimiento, otros cobrarían por esto",
  "Cada artículo vuestro me aporta algo nuevo, gracias!",
  "Me encanta la forma en que explicáis las cosas, muy didáctico"
]

// Comentarios con errores ortográficos
const comentariosConErrores = [
  "Mui buen articulo, me a servido mucho grasias",
  "ola q tal, esto es mui util para los q estamos empesando",
  "no tenia ni idea de esto, grasias x compartir",
  "joder k bueno, lo boi a aplicar ya mismo en mi piso",
  "ostia pues no sabia esto, buen aporte tio",
  "muxas grasias por la info, sta genial el blog",
  "k pasada de articulo, aver si sacais mas asi",
  "me a molado muxo, llo tengo 2 pisos en benidorm i esto me biene genial",
  "sta muy bn explicao todo, enhorabuena",
  "wenas! alguien save si esto aplica tmb para booking?",
  "illo k util, llevaba tiempo buscando algo asi",
  "pos yo no sabia nada desto, me viene al pelo",
  "jajaja q crack, buen articulo enserio",
  "ola buenas, yo soy de argentina y esto me sirbe igual?",
  "waoo no tenia ni idea, grasias x la info",
  "k wen post, lo boy a guardar pa leerlo despues con calma",
  "brutal tio, me as ayudao un monton"
]

// Comentarios específicos por tema
const comentariosPorTema = {
  automatizacion: [
    "La automatización me ha cambiado la vida, antes me pasaba horas respondiendo mensajes",
    "Qué herramientas de automatización recomendáis? Estoy evaluando varias opciones",
    "Desde que automaticé los check-ins duermo mucho más tranquilo",
    "Muy interesante lo de los mensajes automáticos. Algún template que funcione bien?",
    "La automatización es el futuro, los que no se adapten se quedarán atrás",
    "Yo uso Hospitable y me va genial, muy recomendable",
    "El ROI de automatizar es brutal, no sé cómo aguanté tanto tiempo sin hacerlo"
  ],
  precios: [
    "El tema de los precios dinámicos me tiene loco, nunca sé si estoy cobrando lo justo",
    "Muy buen análisis! Yo uso Pricelabs y me va genial",
    "Los precios son clave, con esto he aumentado mis ingresos un 30%",
    "Alguien más tiene problemas para fijar precios en temporada media?",
    "Interesante enfoque, voy a revisar mi estrategia de precios",
    "Desde que uso precios dinámicos he ganado un 25% más sin hacer nada",
    "El yield management es fundamental, buen artículo sobre el tema"
  ],
  resenas: [
    "Las reseñas son todo en este negocio, un 4.8 no es lo mismo que un 4.9",
    "Mi truco: siempre dejo una notita de bienvenida personalizada, funciona!",
    "Cómo gestionáis las reseñas negativas? Me acaban de poner una injusta",
    "Desde que aplico estos consejos no bajo del 4.9, gracias!",
    "Las 5 estrellas se consiguen con los pequeños detalles, totalmente de acuerdo",
    "Me obsesionan las reseñas, creo que es lo más importante de todo",
    "Un truco que me funciona: pedir la reseña el último día, cuando están contentos"
  ],
  legal: [
    "El tema legal es un quebradero de cabeza, cada comunidad tiene sus normas",
    "Alguien sabe cómo está el tema de las licencias en Andalucía?",
    "Muy importante estar al día con la normativa, no queréis una multa",
    "Gracias por aclarar esto, el tema fiscal me tenía muy perdido",
    "La regulación es cada vez más estricta, hay que adaptarse",
    "En Barcelona está imposible conseguir licencia nueva, qué locura",
    "Buen resumen de la normativa, muy necesario este tipo de contenido"
  ],
  fotos: [
    "Las fotos son el 80% del éxito del anuncio, totalmente de acuerdo",
    "Merece la pena invertir en un fotógrafo profesional, el ROI es brutal",
    "Algún consejo para hacer buenas fotos con el móvil?",
    "Desde que cambié las fotos mis reservas se duplicaron, no exagero",
    "La luz natural es clave, nunca hagáis fotos de noche",
    "El home staging antes de las fotos marca la diferencia",
    "Yo hago las fotos con iPhone y quedan geniales siguiendo estos consejos"
  ],
  limpieza: [
    "La limpieza es sagrada, prefiero perder dinero que entregar sucio",
    "Tengo un equipo de limpieza de confianza y es lo mejor que he hecho",
    "Cuánto pagáis a vuestros equipos de limpieza? Creo que estoy pagando mucho",
    "El checklist de limpieza es fundamental, evita muchos problemas",
    "Una mala limpieza = reseña negativa garantizada",
    "Mi equipo de limpieza cobra 40€ por piso, es justo?",
    "La limpieza entre huéspedes me estresaba mucho hasta que encontré buen equipo"
  ],
  mensajes: [
    "La comunicación con los huéspedes es clave para evitar problemas",
    "Yo respondo en menos de 1 hora y eso me ha dado muchos puntos",
    "Alguna plantilla de mensaje de bienvenida que funcione bien?",
    "Los mensajes automáticos me salvan la vida cuando estoy ocupado",
    "Siempre confirmo llegada el día antes, reduce los no-shows",
    "El tono de los mensajes es importante, ni muy formal ni muy informal",
    "Responder rápido es crucial para el ranking de Airbnb"
  ],
  checkin: [
    "El check-in autónomo es lo mejor que he implementado, libertad total",
    "Yo sigo haciendo check-in presencial, me gusta conocer a mis huéspedes",
    "Las cerraduras inteligentes son una inversión que se paga sola",
    "Qué sistema de llaves usáis? Estoy pensando en cambiar",
    "El check-in es el primer contacto, hay que cuidarlo mucho",
    "Desde que puse cerradura con código no he vuelto a preocuparme por llaves",
    "El lockbox me cambió la vida, ya no dependo de horarios"
  ]
}

function getRandomItems(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

function getRandomDate() {
  const now = new Date()
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
  return new Date(sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime()))
}

function generateEmail(name) {
  const cleanName = name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '.')
    .replace(/[^a-z.]/g, '')
  const domains = ['gmail.com', 'hotmail.com', 'yahoo.es', 'outlook.com', 'icloud.com', 'live.com', 'gmx.de', 'web.de', 'yahoo.com', 'protonmail.com']
  const randomNum = Math.floor(Math.random() * 999)
  const domain = domains[Math.floor(Math.random() * domains.length)]
  return cleanName + randomNum + '@' + domain
}

function detectTopic(title, content) {
  const text = (title + ' ' + (content || '')).toLowerCase()
  if (text.includes('automa') || text.includes('automati')) return 'automatizacion'
  if (text.includes('precio') || text.includes('tarifa') || text.includes('revenue')) return 'precios'
  if (text.includes('reseña') || text.includes('review') || text.includes('estrella') || text.includes('valoracion')) return 'resenas'
  if (text.includes('legal') || text.includes('licencia') || text.includes('fiscal') || text.includes('impuesto') || text.includes('normativa')) return 'legal'
  if (text.includes('foto') || text.includes('imagen') || text.includes('visual')) return 'fotos'
  if (text.includes('limpieza') || text.includes('limpiar') || text.includes('cleaning')) return 'limpieza'
  if (text.includes('mensaje') || text.includes('comunicacion') || text.includes('respuesta')) return 'mensajes'
  if (text.includes('check-in') || text.includes('checkin') || text.includes('llegada') || text.includes('llave')) return 'checkin'
  return null
}

async function addMoreComments() {
  const articles = await prisma.blogPost.findMany({
    where: { status: 'PUBLISHED' },
    select: { id: true, title: true, slug: true, content: true }
  })

  console.log('📝 Encontrados ' + articles.length + ' artículos publicados')

  let totalCreated = 0

  for (const article of articles) {
    console.log('\n📰 ' + article.slug)

    const topic = detectTopic(article.title, article.content || '')
    const commentsToCreate = []

    // 2-3 comentarios sobre cursos/academia
    const cursosCount = 2 + Math.floor(Math.random() * 2)
    commentsToCreate.push(...getRandomItems(comentariosCursosAcademia, cursosCount))

    // 2-3 comentarios pidiendo ayuda
    const ayudaCount = 2 + Math.floor(Math.random() * 2)
    commentsToCreate.push(...getRandomItems(comentariosAyuda, ayudaCount))

    // 2-3 comentarios en inglés
    const inglesCount = 2 + Math.floor(Math.random() * 2)
    commentsToCreate.push(...getRandomItems(comentariosIngles, inglesCount))

    // 1-2 comentarios en alemán
    const alemanCount = 1 + Math.floor(Math.random() * 2)
    commentsToCreate.push(...getRandomItems(comentariosAleman, alemanCount))

    // 2-3 comentarios con errores
    const erroresCount = 2 + Math.floor(Math.random() * 2)
    commentsToCreate.push(...getRandomItems(comentariosConErrores, erroresCount))

    // 2-3 comentarios específicos del tema si aplica
    if (topic && comentariosPorTema[topic]) {
      commentsToCreate.push(...getRandomItems(comentariosPorTema[topic], 2 + Math.floor(Math.random() * 2)))
    }

    // Rellenar con comentarios generales hasta llegar a 12-15
    const targetTotal = 12 + Math.floor(Math.random() * 4) // 12-15
    const remaining = targetTotal - commentsToCreate.length
    if (remaining > 0) {
      commentsToCreate.push(...getRandomItems(comentariosGenerales, remaining))
    }

    // Crear comentarios
    for (const content of commentsToCreate) {
      // Elegir nombre según idioma del comentario
      let authorName
      if (/[äöüß]/i.test(content) || content.startsWith('Sehr') || content.startsWith('Danke') || content.startsWith('Als deutscher') || content.startsWith('Wir haben') || content.startsWith('Vielen') || content.startsWith('Super Artikel')) {
        authorName = nombresAlemanes[Math.floor(Math.random() * nombresAlemanes.length)]
      } else if (/^[A-Z][a-z]+ [a-z]+/i.test(content) && !/[áéíóúñ¿¡]/i.test(content) && !content.includes('Airbnb')) {
        authorName = nombresIngleses[Math.floor(Math.random() * nombresIngleses.length)]
      } else {
        // 40% sudamericanos, 60% españoles
        if (Math.random() < 0.4) {
          authorName = nombresSudamericanos[Math.floor(Math.random() * nombresSudamericanos.length)]
        } else {
          authorName = nombresEspanoles[Math.floor(Math.random() * nombresEspanoles.length)]
        }
      }

      await prisma.blogComment.create({
        data: {
          postId: article.id,
          authorName,
          authorEmail: generateEmail(authorName),
          content,
          status: 'APPROVED',
          emailVerified: true,
          createdAt: getRandomDate()
        }
      })
      totalCreated++
    }

    console.log('  ✅ Añadidos ' + commentsToCreate.length + ' comentarios nuevos')
  }

  console.log('\n🎉 Total: ' + totalCreated + ' nuevos comentarios creados (además de los existentes)')
}

addMoreComments()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
