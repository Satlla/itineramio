import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Definir artículos relacionados por categoría/tema
const RELATED_ARTICLES_MAP: Record<string, string[]> = {
  // Casos de éxito
  'caso-david-15-propiedades': [
    '/blog/automatizacion-airbnb-stack-completo',
    '/blog/modo-bombero-a-ceo-escalar-airbnb',
    '/blog/revenue-management-avanzado'
  ],
  'caso-laura-de-1800-a-3200-euros-mes-historia-completa': [
    '/blog/revpar-vs-ocupacion-metricas-correctas-airbnb',
    '/blog/como-optimizar-precio-apartamento-turistico-2025',
    '/blog/primer-mes-anfitrion-airbnb'
  ],

  // Automatización
  'automatizacion-airbnb-stack-completo': [
    '/blog/mensajes-automaticos-airbnb',
    '/blog/modo-bombero-a-ceo-escalar-airbnb',
    '/blog/operaciones-check-in-sin-estres'
  ],
  'automatizacion-airbnb-recupera-8-horas-semanales': [
    '/blog/automatizacion-airbnb-stack-completo',
    '/blog/mensajes-automaticos-airbnb',
    '/blog/kit-anti-caos-anfitriones-airbnb'
  ],
  'automatizacion-anfitriones-airbnb': [
    '/blog/automatizacion-airbnb-stack-completo',
    '/blog/mensajes-automaticos-airbnb',
    '/blog/operaciones-check-in-sin-estres'
  ],

  // Mensajes
  'mensajes-automaticos-airbnb': [
    '/blog/mensajes-automaticos-booking',
    '/blog/automatizacion-airbnb-stack-completo',
    '/blog/operaciones-check-in-sin-estres'
  ],
  'mensajes-automaticos-booking': [
    '/blog/mensajes-automaticos-airbnb',
    '/blog/automatizacion-airbnb-stack-completo',
    '/blog/storytelling-que-convierte-descripciones-airbnb'
  ],

  // Revenue/Pricing
  'revenue-management-avanzado': [
    '/blog/revpar-vs-ocupacion-metricas-correctas-airbnb',
    '/blog/como-optimizar-precio-apartamento-turistico-2025',
    '/blog/caso-laura-de-1800-a-3200-euros-mes-historia-completa'
  ],
  'revpar-vs-ocupacion-metricas-correctas-airbnb': [
    '/blog/revenue-management-avanzado',
    '/blog/como-optimizar-precio-apartamento-turistico-2025',
    '/blog/caso-david-15-propiedades'
  ],
  'revpar-vs-ocupacion-metrica-que-cambia-todo': [
    '/blog/revenue-management-avanzado',
    '/blog/como-optimizar-precio-apartamento-turistico-2025',
    '/blog/caso-laura-de-1800-a-3200-euros-mes-historia-completa'
  ],
  'como-optimizar-precio-apartamento-turistico-2025': [
    '/blog/revenue-management-avanzado',
    '/blog/revpar-vs-ocupacion-metricas-correctas-airbnb',
    '/blog/caso-david-15-propiedades'
  ],

  // Operaciones/Check-in
  'operaciones-check-in-sin-estres': [
    '/blog/plantilla-check-in-remoto-airbnb',
    '/blog/manual-digital-apartamentos-guia-definitiva',
    '/blog/automatizacion-airbnb-stack-completo'
  ],
  'plantilla-check-in-remoto-airbnb': [
    '/blog/operaciones-check-in-sin-estres',
    '/blog/manual-digital-apartamentos-guia-definitiva',
    '/blog/qr-code-apartamento-turistico-guia-generador'
  ],

  // Manual digital
  'manual-digital-apartamentos-guia-definitiva': [
    '/blog/qr-code-apartamento-turistico-guia-generador',
    '/blog/instrucciones-wifi-huespedes-apartamento-turistico',
    '/blog/operaciones-check-in-sin-estres'
  ],
  'manual-digital-apartamento-turistico-guia-completa': [
    '/blog/qr-code-apartamento-turistico-guia-generador',
    '/blog/instrucciones-wifi-huespedes-apartamento-turistico',
    '/blog/plantilla-check-in-remoto-airbnb'
  ],
  'manual-digital-apartamento-turistico-plantilla-completa-2025': [
    '/blog/manual-digital-apartamentos-guia-definitiva',
    '/blog/qr-code-apartamento-turistico-guia-generador',
    '/blog/operaciones-check-in-sin-estres'
  ],

  // QR/WiFi
  'qr-code-apartamento-turistico-guia-generador': [
    '/blog/manual-digital-apartamentos-guia-definitiva',
    '/blog/instrucciones-wifi-huespedes-apartamento-turistico',
    '/blog/plantilla-check-in-remoto-airbnb'
  ],
  'instrucciones-wifi-huespedes-apartamento-turistico': [
    '/blog/qr-code-apartamento-turistico-guia-generador',
    '/blog/manual-digital-apartamentos-guia-definitiva',
    '/blog/operaciones-check-in-sin-estres'
  ],

  // Principiantes
  'primer-mes-anfitrion-airbnb': [
    '/blog/errores-principiantes-airbnb',
    '/blog/fotografia-profesional-airbnb-guia-completa',
    '/blog/manual-digital-apartamentos-guia-definitiva'
  ],
  'errores-principiantes-airbnb': [
    '/blog/primer-mes-anfitrion-airbnb',
    '/blog/kit-anti-caos-anfitriones-airbnb',
    '/blog/fotografia-profesional-airbnb-guia-completa'
  ],

  // Fotografía
  'fotografia-profesional-airbnb-guia-completa': [
    '/blog/storytelling-que-convierte-descripciones-airbnb',
    '/blog/primer-mes-anfitrion-airbnb',
    '/blog/10-trucos-marketing-aumentar-reservas'
  ],

  // Storytelling/Marketing
  'storytelling-que-convierte-descripciones-airbnb': [
    '/blog/fotografia-profesional-airbnb-guia-completa',
    '/blog/10-trucos-marketing-aumentar-reservas',
    '/blog/primer-mes-anfitrion-airbnb'
  ],
  '10-trucos-marketing-aumentar-reservas': [
    '/blog/storytelling-que-convierte-descripciones-airbnb',
    '/blog/fotografia-profesional-airbnb-guia-completa',
    '/blog/como-optimizar-precio-apartamento-turistico-2025'
  ],

  // Modo bombero/CEO
  'modo-bombero-a-ceo-escalar-airbnb': [
    '/blog/automatizacion-airbnb-stack-completo',
    '/blog/caso-david-15-propiedades',
    '/blog/kit-anti-caos-anfitriones-airbnb'
  ],
  'del-modo-bombero-al-modo-ceo-framework': [
    '/blog/automatizacion-airbnb-stack-completo',
    '/blog/caso-david-15-propiedades',
    '/blog/revenue-management-avanzado'
  ],
  'kit-anti-caos-anfitriones-airbnb': [
    '/blog/modo-bombero-a-ceo-escalar-airbnb',
    '/blog/automatizacion-airbnb-stack-completo',
    '/blog/errores-principiantes-airbnb'
  ],

  // Normativa/Legal
  'normativa-vut-2025-cambios-legales': [
    '/blog/vut-madrid-2025-requisitos-normativa-checklist',
    '/blog/como-registrar-vivienda-uso-turistico-guia-paso-paso',
    '/blog/registro-ses-hospedajes-guia-completa-2025'
  ],
  'vut-madrid-2025-requisitos-normativa-checklist': [
    '/blog/normativa-vut-2025-cambios-legales',
    '/blog/como-registrar-vivienda-uso-turistico-guia-paso-paso',
    '/blog/manual-digital-apartamentos-guia-definitiva'
  ],
  'como-registrar-vivienda-uso-turistico-guia-paso-paso': [
    '/blog/normativa-vut-2025-cambios-legales',
    '/blog/vut-madrid-2025-requisitos-normativa-checklist',
    '/blog/registro-ses-hospedajes-guia-completa-2025'
  ],
  'registro-ses-hospedajes-guia-completa-2025': [
    '/blog/normativa-vut-2025-cambios-legales',
    '/blog/vut-madrid-2025-requisitos-normativa-checklist',
    '/blog/como-registrar-vivienda-uso-turistico-guia-paso-paso'
  ],

  // Metodología
  'metodologia-datos-itineramio': [
    '/blog/revenue-management-avanzado',
    '/blog/revpar-vs-ocupacion-metricas-correctas-airbnb',
    '/blog/caso-laura-de-1800-a-3200-euros-mes-historia-completa'
  ]
}

// Títulos de los artículos para mostrar en los links
const ARTICLE_TITLES: Record<string, string> = {
  '/blog/automatizacion-airbnb-stack-completo': 'Stack de Automatización Completo para Airbnb',
  '/blog/modo-bombero-a-ceo-escalar-airbnb': 'Del Modo Bombero al Modo CEO',
  '/blog/revenue-management-avanzado': 'Revenue Management Avanzado',
  '/blog/revpar-vs-ocupacion-metricas-correctas-airbnb': 'RevPAR vs Ocupación: Las Métricas que Importan',
  '/blog/como-optimizar-precio-apartamento-turistico-2025': 'Cómo Optimizar el Precio de tu Apartamento',
  '/blog/primer-mes-anfitrion-airbnb': 'Tu Primer Mes como Anfitrión',
  '/blog/mensajes-automaticos-airbnb': 'Mensajes Automáticos para Airbnb',
  '/blog/mensajes-automaticos-booking': 'Mensajes Automáticos para Booking',
  '/blog/operaciones-check-in-sin-estres': 'Check-in Sin Estrés',
  '/blog/plantilla-check-in-remoto-airbnb': 'Plantilla Check-in Remoto',
  '/blog/manual-digital-apartamentos-guia-definitiva': 'Manual Digital: Guía Definitiva',
  '/blog/qr-code-apartamento-turistico-guia-generador': 'Códigos QR para Apartamentos',
  '/blog/instrucciones-wifi-huespedes-apartamento-turistico': 'Instrucciones WiFi para Huéspedes',
  '/blog/errores-principiantes-airbnb': 'Errores de Principiantes en Airbnb',
  '/blog/fotografia-profesional-airbnb-guia-completa': 'Fotografía Profesional para Airbnb',
  '/blog/storytelling-que-convierte-descripciones-airbnb': 'Storytelling que Convierte',
  '/blog/10-trucos-marketing-aumentar-reservas': '10 Trucos de Marketing',
  '/blog/kit-anti-caos-anfitriones-airbnb': 'Kit Anti-Caos para Anfitriones',
  '/blog/caso-david-15-propiedades': 'Caso David: De 8 a 15 Propiedades',
  '/blog/caso-laura-de-1800-a-3200-euros-mes-historia-completa': 'Caso Laura: Aumento del 42% en Ingresos',
  '/blog/normativa-vut-2025-cambios-legales': 'Normativa VUT 2025',
  '/blog/vut-madrid-2025-requisitos-normativa-checklist': 'VUT Madrid 2025: Requisitos',
  '/blog/como-registrar-vivienda-uso-turistico-guia-paso-paso': 'Cómo Registrar tu VUT',
  '/blog/registro-ses-hospedajes-guia-completa-2025': 'Registro en SES Hospedajes',
  '/blog/del-modo-bombero-al-modo-ceo-framework': 'Framework: Del Bombero al CEO',
  '/blog/automatizacion-airbnb-recupera-8-horas-semanales': 'Recupera 8 Horas Semanales',
  '/blog/revpar-vs-ocupacion-metrica-que-cambia-todo': 'RevPAR: La Métrica que Cambia Todo',
  '/blog/manual-digital-apartamento-turistico-guia-completa': 'Manual Digital: Guía Completa',
  '/blog/manual-digital-apartamento-turistico-plantilla-completa-2025': 'Plantilla Manual Digital 2025',
  '/blog/automatizacion-anfitriones-airbnb': 'Automatización para Anfitriones',
  '/blog/metodologia-datos-itineramio': 'Metodología y Datos de Itineramio'
}

function generateRelatedSection(links: string[]): string {
  const listItems = links.map(link => {
    const title = ARTICLE_TITLES[link] || link.replace('/blog/', '').replace(/-/g, ' ')
    return `    <li style="margin-bottom: 1rem;"><a href="${link}" style="color: #6366f1; font-weight: 600;">→ ${title}</a></li>`
  }).join('\n')

  return `<div style="background-color: #f9fafb; border-radius: 16px; padding: 2.5rem; margin: 3rem 0; border: 2px solid #e5e7eb;">
  <h3 style="color: #1f2937; margin-top: 0; font-size: 1.5rem; font-weight: 700;">📚 Artículos Relacionados</h3>
  <ul style="list-style: none; padding: 0; margin: 1.5rem 0 0 0;">
${listItems}
  </ul>
</div>`
}

async function fixAllRelatedArticles() {
  const posts = await prisma.blogPost.findMany({
    select: { id: true, slug: true, content: true }
  })

  let fixed = 0

  for (const post of posts) {
    const relatedLinks = RELATED_ARTICLES_MAP[post.slug]
    if (!relatedLinks) continue

    let content = post.content || ''

    // Buscar y reemplazar sección de artículos relacionados existente
    const relatedRegex = /<div[^>]*>[\s\S]*?(?:Artículos Relacionados|📚 Artículos)[\s\S]*?<\/div>\s*(?:<\/div>)?/gi

    const newRelatedSection = generateRelatedSection(relatedLinks)

    if (relatedRegex.test(content)) {
      content = content.replace(relatedRegex, newRelatedSection)
    } else {
      // Si no existe, añadir al final antes del último </div> o al final
      content = content + '\n\n' + newRelatedSection
    }

    await prisma.blogPost.update({
      where: { id: post.id },
      data: { content }
    })

    console.log('✓ ' + post.slug)
    fixed++
  }

  console.log('\nTotal artículos actualizados:', fixed)
}

// Contenido completo del artículo de check-in con manual enviado AL RESERVAR
const CHECKIN_ARTICLE_CONTENT = `<article>
  <p style="color: #4b5563; line-height: 1.8; margin-bottom: 1.5rem; font-size: 1.125rem;">
    El proceso de <strong style="color: #1f2937;">check-in es el primer contacto físico</strong> que tus huéspedes tienen con tu propiedad vacacional. Pero la experiencia del huésped comienza mucho antes: <strong style="color: #1f2937;">desde el momento en que reservan</strong>. Un check-in mal ejecutado puede arruinar una estancia antes de que comience, mientras que un proceso fluido establece el tono perfecto para una experiencia memorable.
  </p>

  <h2 style="color: #1f2937; font-size: 2rem; font-weight: 700; margin-top: 3rem; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid #e5e7eb;">
    Por Qué el Check-in Es Crítico Para Tu Negocio
  </h2>

  <p style="color: #4b5563; line-height: 1.8; margin-bottom: 1.5rem; font-size: 1.125rem;">
    Los datos son contundentes: <strong style="color: #1f2937;">el 78% de las reseñas negativas en alojamientos vacacionales mencionan problemas durante el check-in</strong>. Esto incluye instrucciones confusas, llaves que no funcionan, tiempos de espera excesivos y falta de comunicación clara.
  </p>

  <p style="color: #4b5563; line-height: 1.8; margin-bottom: 1.5rem; font-size: 1.125rem;">
    Pero aquí está el secreto que muchos anfitriones desconocen: <strong style="color: #1f2937;">el éxito del check-in se decide en el momento de la reserva, no cuando el huésped llega</strong>.
  </p>

  <h2 style="color: #1f2937; font-size: 2rem; font-weight: 700; margin-top: 3rem; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid #e5e7eb;">
    El Momento Clave: Envía el Manual Digital al Reservar
  </h2>

  <p style="color: #4b5563; line-height: 1.8; margin-bottom: 1.5rem; font-size: 1.125rem;">
    <strong style="color: #1f2937;">El manual digital debe enviarse inmediatamente después de que el huésped confirme su reserva</strong>, no cuando llegue al alojamiento. ¿Por qué? Porque el huésped necesita esta información ANTES de llegar:
  </p>

  <ul style="color: #4b5563; line-height: 1.8; margin-bottom: 1.5rem; padding-left: 1.5rem;">
    <li style="margin-bottom: 0.75rem;"><strong style="color: #1f2937;">Cómo llegar:</strong> Dirección exacta, coordenadas GPS, referencias visuales, qué salida tomar en la autopista</li>
    <li style="margin-bottom: 0.75rem;"><strong style="color: #1f2937;">Aparcamiento:</strong> Dónde aparcar (parking público, plaza incluida, zona azul), precios, horarios, alternativas</li>
    <li style="margin-bottom: 0.75rem;"><strong style="color: #1f2937;">Dónde dejar maletas:</strong> Si llegan antes del check-in, ¿hay consigna? ¿Pueden dejarlas en recepción?</li>
    <li style="margin-bottom: 0.75rem;"><strong style="color: #1f2937;">Transporte:</strong> Cómo llegar desde el aeropuerto, estación de tren, opciones de taxi/Uber</li>
    <li style="margin-bottom: 0.75rem;"><strong style="color: #1f2937;">Hora de entrada:</strong> Check-in oficial, posibilidad de early check-in, qué hacer si llegan antes</li>
    <li style="margin-bottom: 0.75rem;"><strong style="color: #1f2937;">Contacto de emergencia:</strong> Número de teléfono disponible durante el viaje</li>
  </ul>

  <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 1.5rem; margin: 2rem 0; border-radius: 0 8px 8px 0;">
    <p style="color: #92400e; margin: 0; font-weight: 600;">
      💡 Piénsalo así: Tu huésped está en el aeropuerto de su ciudad, a punto de embarcar. Si tiene dudas sobre cómo llegar o dónde aparcar, necesita esa información AHORA, no cuando ya esté perdido buscando tu calle.
    </p>
  </div>

  <h2 style="color: #1f2937; font-size: 2rem; font-weight: 700; margin-top: 3rem; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid #e5e7eb;">
    Flujo de Comunicación Óptimo
  </h2>

  <h3 style="color: #1f2937; font-size: 1.5rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem;">
    1. Mensaje Inmediato Post-Reserva (Automático)
  </h3>

  <div style="background-color: #f3f4f6; border-radius: 8px; padding: 1.5rem; margin: 1.5rem 0; font-family: monospace;">
    <p style="color: #374151; margin: 0; white-space: pre-line;">
¡Hola [Nombre]! 🎉

Gracias por reservar [Nombre del Apartamento]. Estamos encantados de recibirte del [fecha entrada] al [fecha salida].

<strong>📖 Tu Manual Digital:</strong> [LINK]

Aquí encontrarás TODO lo que necesitas:
✅ Cómo llegar (con mapa y coordenadas)
✅ Opciones de aparcamiento
✅ Instrucciones de acceso
✅ WiFi y electrodomésticos
✅ Recomendaciones locales

<strong>💡 Consejo:</strong> Guarda este enlace en favoritos para consultarlo durante tu viaje.

¿Alguna duda? Escríbeme sin problema.

¡Nos vemos pronto!
    </p>
  </div>

  <h3 style="color: #1f2937; font-size: 1.5rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem;">
    2. Recordatorio 3 Días Antes
  </h3>

  <div style="background-color: #f3f4f6; border-radius: 8px; padding: 1.5rem; margin: 1.5rem 0; font-family: monospace;">
    <p style="color: #374151; margin: 0; white-space: pre-line;">
¡Hola [Nombre]!

Tu estancia en [Apartamento] se acerca. Aquí tienes un recordatorio rápido:

📅 Check-in: [Fecha] a partir de las [Hora]
📍 Dirección: [Dirección completa]
🔑 Código de acceso: Te lo enviaré el día de llegada

📖 Recuerda que tienes toda la info en tu manual: [LINK]

¿A qué hora aproximada llegaréis?
    </p>
  </div>

  <h3 style="color: #1f2937; font-size: 1.5rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem;">
    3. Día de Llegada (Mañana)
  </h3>

  <div style="background-color: #f3f4f6; border-radius: 8px; padding: 1.5rem; margin: 1.5rem 0; font-family: monospace;">
    <p style="color: #374151; margin: 0; white-space: pre-line;">
¡Buenos días [Nombre]! 🌅

¡Hoy es el día! Aquí tienes los datos de acceso:

🔑 Código de la puerta del edificio: [CÓDIGO]
🔑 Código/ubicación llaves apartamento: [DETALLES]

📖 Manual completo: [LINK]

El apartamento estará listo a partir de las [HORA]. Si necesitas dejar maletas antes, [opciones disponibles].

¡Buen viaje! Escríbeme cuando estéis cerca.
    </p>
  </div>

  <h2 style="color: #1f2937; font-size: 2rem; font-weight: 700; margin-top: 3rem; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid #e5e7eb;">
    Qué Incluir en el Manual Digital
  </h2>

  <p style="color: #4b5563; line-height: 1.8; margin-bottom: 1.5rem; font-size: 1.125rem;">
    Tu manual digital debe ser una guía completa que el huésped pueda consultar en cualquier momento de su viaje:
  </p>

  <h3 style="color: #1f2937; font-size: 1.25rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 1rem;">
    🚗 Sección de Llegada (Lo Primero que Verán)
  </h3>

  <ul style="color: #4b5563; line-height: 1.8; margin-bottom: 1.5rem; padding-left: 1.5rem;">
    <li style="margin-bottom: 0.5rem;">Dirección completa con enlace a Google Maps</li>
    <li style="margin-bottom: 0.5rem;">Coordenadas GPS para el navegador</li>
    <li style="margin-bottom: 0.5rem;">Fotos del edificio y la entrada</li>
    <li style="margin-bottom: 0.5rem;">Instrucciones desde aeropuerto/estación (transporte público y taxi)</li>
    <li style="margin-bottom: 0.5rem;">Mapa de aparcamientos cercanos con precios</li>
    <li style="margin-bottom: 0.5rem;">Si hay plaza de garaje: ubicación exacta con foto</li>
  </ul>

  <h3 style="color: #1f2937; font-size: 1.25rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 1rem;">
    🔑 Sección de Acceso
  </h3>

  <ul style="color: #4b5563; line-height: 1.8; margin-bottom: 1.5rem; padding-left: 1.5rem;">
    <li style="margin-bottom: 0.5rem;">Código del portal (si aplica)</li>
    <li style="margin-bottom: 0.5rem;">Ubicación del lockbox o instrucciones de cerradura inteligente</li>
    <li style="margin-bottom: 0.5rem;">Fotos paso a paso del proceso de entrada</li>
    <li style="margin-bottom: 0.5rem;">Qué hacer si hay problemas (contacto 24h)</li>
  </ul>

  <h3 style="color: #1f2937; font-size: 1.25rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 1rem;">
    📶 WiFi y Conectividad
  </h3>

  <ul style="color: #4b5563; line-height: 1.8; margin-bottom: 1.5rem; padding-left: 1.5rem;">
    <li style="margin-bottom: 0.5rem;">Nombre de red y contraseña (mejor con código QR para conexión directa)</li>
    <li style="margin-bottom: 0.5rem;">Velocidad de conexión</li>
    <li style="margin-bottom: 0.5rem;">Cómo conectar la Smart TV a Netflix/streaming</li>
  </ul>

  <h3 style="color: #1f2937; font-size: 1.25rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 1rem;">
    🏠 Guía del Apartamento
  </h3>

  <ul style="color: #4b5563; line-height: 1.8; margin-bottom: 1.5rem; padding-left: 1.5rem;">
    <li style="margin-bottom: 0.5rem;">Uso de electrodomésticos (lavadora, lavavajillas, horno)</li>
    <li style="margin-bottom: 0.5rem;">Aire acondicionado/calefacción</li>
    <li style="margin-bottom: 0.5rem;">Ubicación de toallas extra, secador, plancha</li>
    <li style="margin-bottom: 0.5rem;">Normas de la casa (ruidos, basura, fumadores)</li>
  </ul>

  <h3 style="color: #1f2937; font-size: 1.25rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 1rem;">
    🍽️ Recomendaciones Locales
  </h3>

  <ul style="color: #4b5563; line-height: 1.8; margin-bottom: 1.5rem; padding-left: 1.5rem;">
    <li style="margin-bottom: 0.5rem;">Supermercados más cercanos (con horarios)</li>
    <li style="margin-bottom: 0.5rem;">Restaurantes recomendados por zona de precio</li>
    <li style="margin-bottom: 0.5rem;">Atracciones turísticas y cómo llegar</li>
    <li style="margin-bottom: 0.5rem;">Farmacia y centro médico más cercano</li>
  </ul>

  <h2 style="color: #1f2937; font-size: 2rem; font-weight: 700; margin-top: 3rem; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid #e5e7eb;">
    Check-in Remoto vs Presencial
  </h2>

  <h3 style="color: #1f2937; font-size: 1.5rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem;">
    Check-in Remoto (Recomendado)
  </h3>

  <p style="color: #4b5563; line-height: 1.8; margin-bottom: 1.5rem; font-size: 1.125rem;">
    El <strong style="color: #1f2937;">check-in remoto con cerraduras inteligentes o lockbox</strong> es la opción preferida por la mayoría de huéspedes y anfitriones:
  </p>

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin: 2rem 0;">
    <div style="background-color: #ecfdf5; border-radius: 8px; padding: 1.5rem;">
      <h4 style="color: #065f46; margin-top: 0; font-size: 1.1rem;">✅ Ventajas</h4>
      <ul style="color: #047857; padding-left: 1.25rem; margin-bottom: 0;">
        <li>Flexibilidad horaria total</li>
        <li>Sin esperas para el huésped</li>
        <li>Escalable (no dependes de estar presente)</li>
        <li>Huéspedes valoran la independencia</li>
      </ul>
    </div>
    <div style="background-color: #fef2f2; border-radius: 8px; padding: 1.5rem;">
      <h4 style="color: #991b1b; margin-top: 0; font-size: 1.1rem;">⚠️ Requisitos</h4>
      <ul style="color: #dc2626; padding-left: 1.25rem; margin-bottom: 0;">
        <li>Manual digital impecable</li>
        <li>Fotos claras del acceso</li>
        <li>Teléfono disponible por si hay dudas</li>
        <li>Sistema de acceso fiable</li>
      </ul>
    </div>
  </div>

  <h3 style="color: #1f2937; font-size: 1.5rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem;">
    Check-in Presencial
  </h3>

  <p style="color: #4b5563; line-height: 1.8; margin-bottom: 1.5rem; font-size: 1.125rem;">
    El check-in presencial tiene sentido en casos específicos:
  </p>

  <ul style="color: #4b5563; line-height: 1.8; margin-bottom: 1.5rem; padding-left: 1.5rem;">
    <li style="margin-bottom: 0.5rem;"><strong>Propiedades de lujo:</strong> donde el servicio personalizado es parte del valor</li>
    <li style="margin-bottom: 0.5rem;"><strong>Apartamentos complejos:</strong> con domótica avanzada que requiere explicación</li>
    <li style="margin-bottom: 0.5rem;"><strong>Huéspedes mayores:</strong> que prefieren trato personal</li>
    <li style="margin-bottom: 0.5rem;"><strong>Estancias largas:</strong> donde la relación personal aporta valor</li>
  </ul>

  <h2 style="color: #1f2937; font-size: 2rem; font-weight: 700; margin-top: 3rem; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid #e5e7eb;">
    Solución de Problemas Comunes
  </h2>

  <div style="background-color: #f9fafb; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
    <h4 style="color: #1f2937; margin-top: 0;">❓ "No encuentro el edificio"</h4>
    <p style="color: #4b5563; margin-bottom: 1.5rem;">
      <strong>Prevención:</strong> Incluye foto de la fachada y referencias visuales en el manual. "Edificio blanco con balcones azules, entre la farmacia y el banco."
    </p>

    <h4 style="color: #1f2937;">❓ "El código no funciona"</h4>
    <p style="color: #4b5563; margin-bottom: 1.5rem;">
      <strong>Prevención:</strong> Incluye vídeo corto mostrando cómo introducir el código. Algunos teclados requieren pulsar # antes o después.
    </p>

    <h4 style="color: #1f2937;">❓ "Llegamos antes del check-in"</h4>
    <p style="color: #4b5563; margin-bottom: 1.5rem;">
      <strong>Prevención:</strong> Incluye en el manual opciones claras: consigna de la estación, cafetería cercana recomendada, o posibilidad de early check-in (con suplemento o gratis según disponibilidad).
    </p>

    <h4 style="color: #1f2937;">❓ "¿Dónde aparco?"</h4>
    <p style="color: #4b5563; margin-bottom: 0;">
      <strong>Prevención:</strong> Sección específica en el manual con mapa de parkings, precios, y foto de la plaza si está incluida.
    </p>
  </div>

  <h2 style="color: #1f2937; font-size: 2rem; font-weight: 700; margin-top: 3rem; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid #e5e7eb;">
    Tecnología para Check-in Sin Estrés
  </h2>

  <h3 style="color: #1f2937; font-size: 1.25rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 1rem;">
    Cerraduras Inteligentes
  </h3>

  <ul style="color: #4b5563; line-height: 1.8; margin-bottom: 1.5rem; padding-left: 1.5rem;">
    <li style="margin-bottom: 0.5rem;"><strong>Nuki:</strong> Se instala sobre cerradura existente, códigos temporales, historial de accesos</li>
    <li style="margin-bottom: 0.5rem;"><strong>Yale:</strong> Integración con Airbnb, códigos automáticos por reserva</li>
    <li style="margin-bottom: 0.5rem;"><strong>August:</strong> Popular en USA, buena app móvil</li>
  </ul>

  <h3 style="color: #1f2937; font-size: 1.25rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 1rem;">
    Lockbox (Caja de Llaves)
  </h3>

  <p style="color: #4b5563; line-height: 1.8; margin-bottom: 1.5rem; font-size: 1.125rem;">
    Solución económica y fiable. Recomendaciones:
  </p>

  <ul style="color: #4b5563; line-height: 1.8; margin-bottom: 1.5rem; padding-left: 1.5rem;">
    <li style="margin-bottom: 0.5rem;">Ubicar en lugar discreto pero accesible</li>
    <li style="margin-bottom: 0.5rem;">Cambiar código entre huéspedes (algunos modelos permiten códigos temporales)</li>
    <li style="margin-bottom: 0.5rem;">Incluir foto exacta de ubicación en el manual</li>
  </ul>

  <h2 style="color: #1f2937; font-size: 2rem; font-weight: 700; margin-top: 3rem; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid #e5e7eb;">
    Checklist Final: Check-in Perfecto
  </h2>

  <div style="background-color: #f0fdf4; border-radius: 12px; padding: 2rem; margin: 2rem 0;">
    <h4 style="color: #166534; margin-top: 0; font-size: 1.25rem;">✅ Al Momento de la Reserva</h4>
    <ul style="color: #15803d; padding-left: 1.25rem; margin-bottom: 1.5rem;">
      <li>Enviar mensaje de bienvenida con link al manual digital</li>
      <li>Confirmar fechas y hora aproximada de llegada</li>
      <li>Preguntar si vienen en coche (para info de parking)</li>
    </ul>

    <h4 style="color: #166534; font-size: 1.25rem;">✅ 3 Días Antes</h4>
    <ul style="color: #15803d; padding-left: 1.25rem; margin-bottom: 1.5rem;">
      <li>Recordatorio con resumen de info clave</li>
      <li>Confirmar hora de llegada</li>
      <li>Ofrecer early check-in si disponible</li>
    </ul>

    <h4 style="color: #166534; font-size: 1.25rem;">✅ Día de Llegada</h4>
    <ul style="color: #15803d; padding-left: 1.25rem; margin-bottom: 1.5rem;">
      <li>Enviar códigos de acceso por la mañana</li>
      <li>Estar disponible por teléfono</li>
      <li>Mensaje de "¿todo bien?" unas horas después de llegada</li>
    </ul>

    <h4 style="color: #166534; font-size: 1.25rem;">✅ Durante la Estancia</h4>
    <ul style="color: #15803d; padding-left: 1.25rem; margin-bottom: 0;">
      <li>Disponible para dudas (sin ser intrusivo)</li>
      <li>Recordatorio de check-out el día anterior</li>
    </ul>
  </div>

  <h2 style="color: #1f2937; font-size: 2rem; font-weight: 700; margin-top: 3rem; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid #e5e7eb;">
    El ROI de un Buen Check-in
  </h2>

  <p style="color: #4b5563; line-height: 1.8; margin-bottom: 1.5rem; font-size: 1.125rem;">
    Un proceso de check-in optimizado impacta directamente en tu negocio:
  </p>

  <ul style="color: #4b5563; line-height: 1.8; margin-bottom: 1.5rem; padding-left: 1.5rem;">
    <li style="margin-bottom: 0.75rem;"><strong style="color: #1f2937;">+0.3 puntos en valoración media:</strong> El check-in fluido predispone positivamente al huésped</li>
    <li style="margin-bottom: 0.75rem;"><strong style="color: #1f2937;">-80% de mensajes "¿dónde está...?":</strong> El manual responde antes de que pregunten</li>
    <li style="margin-bottom: 0.75rem;"><strong style="color: #1f2937;">+15% de reseñas mencionan "fácil llegada":</strong> Diferenciador competitivo</li>
    <li style="margin-bottom: 0.75rem;"><strong style="color: #1f2937;">Escalabilidad:</strong> Puedes gestionar más propiedades sin estar presente</li>
  </ul>

  <div style="background-color: #1f2937; border-radius: 16px; padding: 2.5rem; margin: 3rem 0; text-align: center;">
    <h3 style="color: white; margin-top: 0; font-size: 1.75rem; font-weight: 700;">🚀 Crea tu Manual Digital Profesional</h3>
    <p style="color: #9ca3af; margin-bottom: 1.5rem; font-size: 1.1rem;">
      Con Itineramio puedes crear un manual digital completo en minutos, con códigos QR, múltiples idiomas y actualización instantánea.
    </p>
    <a href="https://itineramio.com" style="display: inline-block; background-color: #6366f1; color: white; padding: 1rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 1.1rem;">
      Empieza Gratis →
    </a>
  </div>

  <div style="background-color: #f9fafb; border-radius: 16px; padding: 2.5rem; margin: 3rem 0; border: 2px solid #e5e7eb;">
    <h3 style="color: #1f2937; margin-top: 0; font-size: 1.5rem; font-weight: 700;">📚 Artículos Relacionados</h3>
    <ul style="list-style: none; padding: 0; margin: 1.5rem 0 0 0;">
      <li style="margin-bottom: 1rem;"><a href="/blog/plantilla-check-in-remoto-airbnb" style="color: #6366f1; font-weight: 600;">→ Plantilla Check-in Remoto</a></li>
      <li style="margin-bottom: 1rem;"><a href="/blog/manual-digital-apartamentos-guia-definitiva" style="color: #6366f1; font-weight: 600;">→ Manual Digital: Guía Definitiva</a></li>
      <li style="margin-bottom: 1rem;"><a href="/blog/automatizacion-airbnb-stack-completo" style="color: #6366f1; font-weight: 600;">→ Stack de Automatización Completo para Airbnb</a></li>
    </ul>
  </div>
</article>`;

async function updateCheckinArticle() {
  const result = await prisma.blogPost.update({
    where: { slug: 'operaciones-check-in-sin-estres' },
    data: { content: CHECKIN_ARTICLE_CONTENT }
  });
  console.log('✅ Artículo check-in actualizado:', result.title);
  console.log('   Nuevo contenido:', CHECKIN_ARTICLE_CONTENT.length, 'caracteres');
}

updateCheckinArticle()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
