import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Academia Itineramio...')

  // Create Course
  const course = await prisma.course.upsert({
    where: { slug: 'de-cero-a-superhost' },
    update: {},
    create: {
      title: 'De Cero a Superhost',
      slug: 'de-cero-a-superhost',
      description: 'El programa de formación más completo para convertirte en un Superhost profesional de Airbnb. Aprende estrategias probadas, domina las operaciones y maximiza tus ingresos.',
      difficulty: 'INTERMEDIATE',
      duration: 18, // 18 horas
      passingScore: 80,
      published: true,
      enrollmentCount: 127
    }
  })

  console.log('✅ Curso creado:', course.title)

  // Module 1: Hospitalidad y Primeras Impresiones
  const module1 = await prisma.module.upsert({
    where: {
      courseId_slug: {
        courseId: course.id,
        slug: 'hospitalidad-primeras-impresiones'
      }
    },
    update: {},
    create: {
      courseId: course.id,
      title: 'Hospitalidad y Primeras Impresiones',
      slug: 'hospitalidad-primeras-impresiones',
      description: 'Aprende a crear experiencias memorables desde el primer contacto. Domina el arte de la hospitalidad y las primeras impresiones que marcan la diferencia.',
      icon: 'Home',
      order: 1,
      estimatedTime: 180, // 3 horas
      published: true
    }
  })

  console.log('✅ Módulo 1 creado:', module1.title)

  // Lesson 1.1: El Arte de la Hospitalidad
  const lesson1_1 = await prisma.lesson.upsert({
    where: {
      moduleId_slug: {
        moduleId: module1.id,
        slug: 'arte-hospitalidad'
      }
    },
    update: {},
    create: {
      moduleId: module1.id,
      title: 'El Arte de la Hospitalidad',
      slug: 'arte-hospitalidad',
      description: 'Qué hace a un Superhost diferente y cómo aplicar los principios de hospitalidad excepcional',
      slides: [
        {
          type: 'title',
          title: 'El Arte de la Hospitalidad',
          content: 'Bienvenido a tu primera lección. Descubre qué hace a un Superhost verdaderamente excepcional.'
        },
        {
          type: 'text',
          title: '¿Qué es la Hospitalidad?',
          content: 'La hospitalidad no es solo abrir tu puerta. Es crear una experiencia que tus huéspedes recordarán y compartirán. Los Superhosts entienden que cada interacción cuenta.'
        },
        {
          type: 'reveal',
          title: 'Los 4 Pilares de un Superhost',
          content: 'Descubre los principios fundamentales',
          reveals: [
            {
              title: '1. Anticipación',
              content: 'Anticipa las necesidades antes de que surjan. Piensa como tu huésped.'
            },
            {
              title: '2. Atención al Detalle',
              content: 'Los pequeños detalles crean grandes experiencias. Una nota de bienven ida personalizada vale oro.'
            },
            {
              title: '3. Comunicación',
              content: 'Responde rápido, sé claro y siempre amable. La comunicación es tu superpoder.'
            },
            {
              title: '4. Consistencia',
              content: 'La excelencia no es un acto, es un hábito. Mantén el estándar en cada reserva.'
            }
          ]
        },
        {
          type: 'highlight',
          title: 'Dato Clave',
          content: 'Los Superhosts tienen un 94% más de probabilidades de recibir reviews de 5 estrellas que los hosts regulares.',
          highlightType: 'success'
        },
        {
          type: 'text',
          title: 'El Poder de las Primeras Impresiones',
          content: 'Tienes una sola oportunidad para causar una primera impresión. Los primeros 30 minutos desde que tu huésped cruza la puerta determinan el 80% de su experiencia.'
        },
        {
          type: 'image',
          title: 'Checklist de Bienvenida',
          content: 'Asegúrate de que estos elementos estén perfectos antes de cada check-in',
          imageUrl: '/images/academy/checklist-welcome.jpg'
        },
        {
          type: 'text',
          title: 'Tu Primera Tarea',
          content: 'Antes de continuar con la siguiente lección, piensa: ¿Qué detalle único podrías agregar a tu espacio que sorprenda a tus huéspedes? Anótalo.'
        }
      ],
      duration: 25,
      order: 1,
      points: 10,
      published: true
    }
  })

  // Lesson 1.2: Check-in Perfecto
  const lesson1_2 = await prisma.lesson.upsert({
    where: {
      moduleId_slug: {
        moduleId: module1.id,
        slug: 'checkin-perfecto'
      }
    },
    update: {},
    create: {
      moduleId: module1.id,
      title: 'El Check-in Perfecto',
      slug: 'checkin-perfecto',
      description: 'Cómo crear un proceso de check-in fluido que deleite a tus huéspedes desde el minuto uno',
      slides: [
        {
          type: 'title',
          title: 'El Check-in Perfecto',
          content: 'Aprende a diseñar un proceso de llegada sin fricciones'
        },
        {
          type: 'text',
          title: 'Antes de la Llegada',
          content: 'El check-in empieza 24 horas antes. Envía un mensaje cálido con los detalles clave: hora estimada, instrucciones de acceso, WiFi, y qué esperar.'
        },
        {
          type: 'reveal',
          title: 'Opciones de Check-in',
          content: 'Elige el método que mejor se adapte a tu propiedad',
          reveals: [
            {
              title: 'Autogestionado (Recomendado)',
              content: 'Lockbox o cerradura inteligente. Flexibilidad para el huésped, escalable para ti. Perfecto para profesionalizar.'
            },
            {
              title: 'Check-in en Persona',
              content: 'Personal y cálido. Ideal si vives cerca y puedes dedicar 15-20 minutos por llegada.'
            },
            {
              title: 'Híbrido',
              content: 'Autogestionado con opción de reunirse si el huésped lo prefiere. Lo mejor de ambos mundos.'
            }
          ]
        },
        {
          type: 'highlight',
          title: 'Pro Tip',
          content: 'El 78% de los huéspedes prefieren check-in autogestionado. Les da libertad y reduce ansiedad por horarios.',
          highlightType: 'info'
        },
        {
          type: 'text',
          title: 'El Manual Digital',
          content: 'Un manual digital bien diseñado responde el 90% de las preguntas antes de que surjan. Incluye: WiFi, electrodomésticos, recomendaciones locales, normas de la casa.'
        },
        {
          type: 'text',
          title: 'Bienvenida Física',
          content: 'Deja un detalle de bienvenida visible: botella de agua fría, frutas, snacks locales. El costo es mínimo, el impacto enorme.'
        },
        {
          type: 'highlight',
          title: 'Importante',
          content: 'Contacta a tu huésped 2-3 horas después del check-in para asegurarte de que todo está perfecto. Este mensaje previene el 80% de reviews negativas.',
          highlightType: 'warning'
        }
      ],
      duration: 30,
      order: 2,
      points: 10,
      published: true
    }
  })

  // Lesson 1.3: Comunicación Efectiva
  const lesson1_3 = await prisma.lesson.upsert({
    where: {
      moduleId_slug: {
        moduleId: module1.id,
        slug: 'comunicacion-efectiva'
      }
    },
    update: {},
    create: {
      moduleId: module1.id,
      title: 'Comunicación que Convierte',
      slug: 'comunicacion-efectiva',
      description: 'Mensajes que generan confianza, aumentan reservas y crean experiencias memorables',
      slides: [
        {
          type: 'title',
          title: 'Comunicación que Convierte',
          content: 'El tono y timing de tus mensajes puede duplicar tus reviews positivas'
        },
        {
          type: 'text',
          title: 'Las 3 R de la Comunicación',
          content: 'Rápido, Relevante, Respetuoso. Responde en menos de 1 hora, da información útil, y siempre con cortesía profesional.'
        },
        {
          type: 'reveal',
          title: 'Timeline de Comunicación',
          content: 'Cuándo y qué comunicar en cada etapa',
          reveals: [
            {
              title: 'Confirmación de Reserva',
              content: '✅ Inmediato: "¡Gracias por reservar! Estamos emocionados de recibirte. Te enviaré detalles 24h antes."'
            },
            {
              title: '24h Antes',
              content: '📋 Instrucciones completas: acceso, WiFi, parking, hora flexible de llegada'
            },
            {
              title: 'Día de Check-in',
              content: '👋 Mensaje de bienvenida: "¡Bienvenido! Todo listo para ti. Cualquier cosa, estoy a un mensaje."'
            },
            {
              title: '2-3h Después',
              content: '❓ Check-in: "¿Todo perfecto? ¿Necesitas algo?"'
            },
            {
              title: 'Durante la Estancia',
              content: '🎯 Proactivo pero no invasivo. Comparte recomendaciones si tiene sentido.'
            },
            {
              title: 'Antes del Check-out',
              content: '📝 Recordatorio amable de hora y simples instrucciones'
            },
            {
              title: 'Después de Salida',
              content: '⭐ Agradecimiento + petición gentil de review'
            }
          ]
        },
        {
          type: 'highlight',
          title: 'Estadística Clave',
          content: 'Hosts que responden en menos de 1 hora tienen 2.5x más probabilidades de conseguir la reserva.',
          highlightType: 'success'
        },
        {
          type: 'text',
          title: 'Templates que Funcionan',
          content: 'Crea templates personalizables para cada momento. Ahorra tiempo mientras mantienes el toque personal. Usa el nombre del huésped y detalles específicos de su reserva.'
        }
      ],
      duration: 25,
      order: 3,
      points: 10,
      published: true
    }
  })

  console.log('✅ Lecciones creadas')

  // Create Quiz for Module 1
  const quiz1 = await prisma.quiz.upsert({
    where: { moduleId: module1.id },
    update: {},
    create: {
      moduleId: module1.id,
      title: 'Examen: Hospitalidad y Primeras Impresiones',
      description: 'Demuestra que dominas los conceptos clave de hospitalidad',
      passingScore: 80,
      timeLimit: 10, // 10 minutos
      maxAttempts: 3,
      points: 50,
      published: true
    }
  })

  // Quiz Questions
  await prisma.question.createMany({
    data: [
      {
        quizId: quiz1.id,
        question: '¿Cuál es el tiempo máximo recomendado para responder a una consulta de reserva?',
        type: 'MULTIPLE_CHOICE',
        options: ['24 horas', '12 horas', '1 hora', '30 minutos'],
        correctAnswer: 2, // 1 hora
        explanation: 'Responder en menos de 1 hora aumenta 2.5x las probabilidades de conseguir la reserva.',
        order: 1,
        points: 1
      },
      {
        quizId: quiz1.id,
        question: '¿Qué porcentaje de la experiencia del huésped se determina en los primeros 30 minutos?',
        type: 'MULTIPLE_CHOICE',
        options: ['50%', '60%', '70%', '80%'],
        correctAnswer: 3, // 80%
        explanation: 'Los primeros 30 minutos son cruciales y determinan el 80% de la experiencia total.',
        order: 2,
        points: 1
      },
      {
        quizId: quiz1.id,
        question: '¿Cuál NO es uno de los 4 pilares de un Superhost?',
        type: 'MULTIPLE_CHOICE',
        options: ['Anticipación', 'Precio bajo', 'Atención al detalle', 'Comunicación'],
        correctAnswer: 1, // Precio bajo
        explanation: 'Los 4 pilares son: Anticipación, Atención al Detalle, Comunicación y Consistencia.',
        order: 3,
        points: 1
      },
      {
        quizId: quiz1.id,
        question: '¿Cuándo debes enviar las instrucciones de check-in al huésped?',
        type: 'MULTIPLE_CHOICE',
        options: ['1 semana antes', '24 horas antes', 'El mismo día', 'Cuando llegue'],
        correctAnswer: 1, // 24 horas antes
        explanation: '24 horas antes es el timing perfecto: no demasiado pronto para que lo olviden, no demasiado tarde para que se estresen.',
        order: 4,
        points: 1
      },
      {
        quizId: quiz1.id,
        question: '¿Qué tipo de check-in prefiere el 78% de los huéspedes?',
        type: 'MULTIPLE_CHOICE',
        options: ['En persona obligatorio', 'Autogestionado', 'Por videollamada', 'Sin preferencia'],
        correctAnswer: 1, // Autogestionado
        explanation: 'El 78% de los huéspedes prefieren check-in autogestionado porque les da flexibilidad y autonomía.',
        order: 5,
        points: 1
      }
    ]
  })

  console.log('✅ Quiz y preguntas creadas')

  console.log('🎉 ¡Seeding completado!')
}

main()
  .catch((e) => {
    console.error('❌ Error en seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
