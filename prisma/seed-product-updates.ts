import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const updates = [
    {
      title: {
        es: 'Crea tu manual completo con Inteligencia Artificial',
        en: 'Create your complete guide with Artificial Intelligence',
        fr: 'Créez votre guide complet avec l\'Intelligence Artificielle',
      },
      description: {
        es: 'Nuestro asistente de IA genera un manual digital completo a partir de la dirección de tu propiedad. En solo 15 minutos tendrás zonas, instrucciones, pasos detallados y contenido profesional listo para compartir con tus huéspedes. Solo tienes que introducir la dirección, añadir los detalles de tu propiedad, subir fotos y la IA hace el resto.',
        en: 'Our AI assistant generates a complete digital guide from your property address. In just 15 minutes you\'ll have zones, instructions, detailed steps and professional content ready to share with your guests. Just enter the address, add your property details, upload photos and the AI does the rest.',
        fr: 'Notre assistant IA génère un guide numérique complet à partir de l\'adresse de votre propriété. En seulement 15 minutes, vous aurez des zones, des instructions, des étapes détaillées et du contenu professionnel prêt à partager avec vos hôtes.',
      },
      tag: 'NEW' as const,
      ctaText: {
        es: 'Crear mi manual con IA',
        en: 'Create my guide with AI',
        fr: 'Créer mon guide avec l\'IA',
      },
      ctaUrl: '/ai-setup',
    },
    {
      title: {
        es: 'Códigos QR por zona: WiFi en el router, Check-in en la puerta',
        en: 'Zone-specific QR codes: WiFi on the router, Check-in at the door',
        fr: 'Codes QR par zone : WiFi sur le routeur, Check-in à la porte',
      },
      description: {
        es: 'Ahora puedes generar códigos QR individuales para cada zona de tu propiedad. Coloca el QR del WiFi junto al router, el del Check-in en la puerta de entrada, el de la cocina en la nevera... Cada huésped escanea y accede directamente a la información que necesita en ese momento. Sin buscar, sin perderse.',
        en: 'Now you can generate individual QR codes for each zone of your property. Place the WiFi QR next to the router, the Check-in one at the front door, the kitchen one on the fridge... Each guest scans and goes directly to the information they need at that moment.',
        fr: 'Vous pouvez maintenant générer des codes QR individuels pour chaque zone de votre propriété. Placez le QR WiFi à côté du routeur, celui du Check-in à la porte d\'entrée... Chaque hôte scanne et accède directement à l\'information dont il a besoin.',
      },
      tag: 'NEW' as const,
      ctaText: {
        es: 'Ver mis propiedades',
        en: 'View my properties',
        fr: 'Voir mes propriétés',
      },
      ctaUrl: '/main',
    },
    {
      title: {
        es: 'Avisos en tiempo real para tus huéspedes',
        en: 'Real-time announcements for your guests',
        fr: 'Annonces en temps réel pour vos hôtes',
      },
      description: {
        es: 'Comunícate con tus huéspedes sin modificar tu manual. Crea avisos temporales que se muestran de forma destacada: obras cercanas, piscina en mantenimiento, evento local, cambio de contraseña WiFi... Puedes elegir entre avisos informativos, de advertencia o urgentes, y configurar una fecha de expiración para que desaparezcan automáticamente.',
        en: 'Communicate with your guests without modifying your guide. Create temporary announcements displayed prominently: nearby construction, pool maintenance, local events, WiFi password change... Choose between info, warning or urgent announcements, and set an expiration date so they disappear automatically.',
        fr: 'Communiquez avec vos hôtes sans modifier votre guide. Créez des annonces temporaires affichées en évidence : travaux à proximité, piscine en maintenance, événement local... Choisissez entre annonces informatives, d\'avertissement ou urgentes, avec date d\'expiration automatique.',
      },
      tag: 'NEW' as const,
      ctaText: {
        es: 'Crear un aviso',
        en: 'Create an announcement',
        fr: 'Créer une annonce',
      },
      ctaUrl: '/main',
    },
    {
      title: {
        es: 'Traducciones automáticas a 3 idiomas: Español, Inglés y Francés',
        en: 'Automatic translations in 3 languages: Spanish, English and French',
        fr: 'Traductions automatiques en 3 langues : Espagnol, Anglais et Français',
      },
      description: {
        es: 'Tu manual se traduce automáticamente a inglés y francés. El idioma se detecta según el navegador del huésped, así que cada persona ve el contenido en su idioma sin que tengas que hacer nada. Escribe en español y el sistema se encarga del resto. Si necesitas ajustar alguna traducción, puedes editarla manualmente desde el editor de zonas.',
        en: 'Your guide is automatically translated into English and French. The language is detected based on the guest\'s browser, so each person sees the content in their language without you having to do anything. Write in Spanish and the system takes care of the rest. If you need to adjust any translation, you can manually edit it from the zone editor.',
        fr: 'Votre guide est automatiquement traduit en anglais et français. La langue est détectée selon le navigateur de l\'hôte, chaque personne voit le contenu dans sa langue sans que vous ayez à faire quoi que ce soit. Écrivez en espagnol et le système s\'occupe du reste.',
      },
      tag: 'NEW' as const,
    },
    {
      title: {
        es: 'Analytics: sabe exactamente qué leen tus huéspedes',
        en: 'Analytics: know exactly what your guests read',
        fr: 'Analytics : sachez exactement ce que lisent vos hôtes',
      },
      description: {
        es: 'Panel de analytics completo para cada propiedad: visitas totales, visitantes únicos, duración media de sesión, zonas más vistas y valoraciones de huéspedes. Identifica qué información es más útil y mejora tu manual basándote en datos reales, no en suposiciones.',
        en: 'Complete analytics dashboard for each property: total visits, unique visitors, average session duration, most viewed zones and guest ratings. Identify which information is most useful and improve your guide based on real data, not assumptions.',
        fr: 'Tableau de bord analytics complet pour chaque propriété : visites totales, visiteurs uniques, durée moyenne de session, zones les plus consultées et évaluations des hôtes.',
      },
      tag: 'IMPROVEMENT' as const,
      ctaText: {
        es: 'Ver analytics',
        en: 'View analytics',
        fr: 'Voir les analytics',
      },
      ctaUrl: '/analytics',
    },
    {
      title: {
        es: 'Valoraciones de huéspedes por zona',
        en: 'Guest ratings per zone',
        fr: 'Évaluations des hôtes par zone',
      },
      description: {
        es: 'Tus huéspedes pueden valorar cada zona de tu manual con estrellas (1-5) y dejar comentarios. Recibe feedback directo sobre qué funciona bien y qué necesita mejora. Las valoraciones bajas te avisan de que algo necesita atención. Todo visible desde tu panel de analytics.',
        en: 'Your guests can rate each zone of your guide with stars (1-5) and leave comments. Get direct feedback on what works well and what needs improvement. Low ratings alert you that something needs attention. All visible from your analytics dashboard.',
        fr: 'Vos hôtes peuvent évaluer chaque zone de votre guide avec des étoiles (1-5) et laisser des commentaires. Recevez des retours directs sur ce qui fonctionne bien et ce qui doit être amélioré.',
      },
      tag: 'NEW' as const,
    },
    {
      title: {
        es: 'Chatbot IA para huéspedes integrado en el manual',
        en: 'AI Chatbot for guests integrated in the guide',
        fr: 'Chatbot IA pour les hôtes intégré dans le guide',
      },
      description: {
        es: 'Cada manual incluye un chatbot con IA que responde preguntas de los huéspedes 24/7 basándose en el contenido de tu propiedad. El huésped pregunta "¿cuál es la contraseña del WiFi?" o "¿a qué hora es el checkout?" y recibe respuesta inmediata sin necesidad de contactarte.',
        en: 'Each guide includes an AI chatbot that answers guest questions 24/7 based on your property content. The guest asks "what\'s the WiFi password?" or "what time is checkout?" and gets an immediate answer without needing to contact you.',
        fr: 'Chaque guide inclut un chatbot IA qui répond aux questions des hôtes 24/7 basé sur le contenu de votre propriété. L\'hôte demande et reçoit une réponse immédiate sans avoir besoin de vous contacter.',
      },
      tag: 'NEW' as const,
    },
    {
      title: {
        es: 'Comparte tu manual por WhatsApp, Email o Airbnb',
        en: 'Share your guide via WhatsApp, Email or Airbnb',
        fr: 'Partagez votre guide par WhatsApp, Email ou Airbnb',
      },
      description: {
        es: 'Múltiples formas de compartir tu manual: link directo, código QR, WhatsApp, email o directamente en la mensajería de Airbnb y Booking. Cada propiedad tiene su URL única personalizable. También puedes activar el envío automático antes del check-in con integración PMS.',
        en: 'Multiple ways to share your guide: direct link, QR code, WhatsApp, email or directly in Airbnb and Booking messaging. Each property has its own customizable unique URL. You can also enable automatic sending before check-in with PMS integration.',
        fr: 'Plusieurs façons de partager votre guide : lien direct, code QR, WhatsApp, email ou directement dans la messagerie Airbnb et Booking. Chaque propriété a son URL unique personnalisable.',
      },
      tag: 'NEW' as const,
    },
    {
      title: {
        es: 'Academia: cursos gratuitos sobre gestión de alquiler vacacional',
        en: 'Academy: free courses on vacation rental management',
        fr: 'Académie : cours gratuits sur la gestion de locations de vacances',
      },
      description: {
        es: 'Accede a cursos gratuitos sobre gestión de alojamientos turísticos: desde cómo ser Superhost hasta optimización de precios, comunicación con huéspedes y marketing. Videos, cuestionarios, puntos de experiencia y certificados al completar cada curso.',
        en: 'Access free courses on vacation rental management: from how to become a Superhost to price optimization, guest communication and marketing. Videos, quizzes, experience points and certificates upon completing each course.',
        fr: 'Accédez à des cours gratuits sur la gestion de locations de vacances : de comment devenir Superhôte à l\'optimisation des prix, la communication avec les hôtes et le marketing.',
      },
      tag: 'NEW' as const,
      ctaText: {
        es: 'Ir a la Academia',
        en: 'Go to Academy',
        fr: 'Aller à l\'Académie',
      },
      ctaUrl: '/academia',
    },
    {
      title: {
        es: 'Herramientas gratuitas: Generador de descripciones, Calculadora de precios y más',
        en: 'Free tools: Description Generator, Price Calculator and more',
        fr: 'Outils gratuits : Générateur de descriptions, Calculateur de prix et plus',
      },
      description: {
        es: 'Suite de herramientas gratuitas para hosts: Generador de Descripciones con IA, Calculadora de Precios, Calculadora de Ocupación, ROI Calculator, Checklist de Limpieza, Generador de Tarjeta WiFi, Generador de Normas de la Casa y Generador de QR. Todo accesible desde /hub/tools.',
        en: 'Suite of free tools for hosts: AI Description Generator, Price Calculator, Occupancy Calculator, ROI Calculator, Cleaning Checklist, WiFi Card Generator, House Rules Generator and QR Generator. All accessible from /hub/tools.',
        fr: 'Suite d\'outils gratuits pour les hôtes : Générateur de Descriptions IA, Calculateur de Prix, Calculateur d\'Occupation, et plus. Tout accessible depuis /hub/tools.',
      },
      tag: 'NEW' as const,
      ctaText: {
        es: 'Ver herramientas',
        en: 'View tools',
        fr: 'Voir les outils',
      },
      ctaUrl: '/hub/tools',
    },
    {
      title: {
        es: 'SofIA: tu asistente de soporte con IA disponible 24/7',
        en: 'SofIA: your AI support assistant available 24/7',
        fr: 'SofIA : votre assistante support IA disponible 24/7',
      },
      description: {
        es: 'Hemos lanzado SofIA, el asistente con inteligencia artificial integrado en la plataforma. Disponible desde el widget en la esquina inferior derecha, SofIA conoce todo sobre Itineramio y te puede ayudar con cualquier duda: cómo crear propiedades, configurar zonas, imprimir QR, gestionar traducciones y mucho más.',
        en: 'We\'ve launched SofIA, the AI assistant integrated into the platform. Available from the widget in the bottom right corner, SofIA knows everything about Itineramio and can help you with any question: how to create properties, configure zones, print QR codes, manage translations and much more.',
        fr: 'Nous avons lancé SofIA, l\'assistante IA intégrée à la plateforme. Disponible depuis le widget en bas à droite, SofIA connaît tout sur Itineramio et peut vous aider pour toute question.',
      },
      tag: 'NEW' as const,
    },
  ]

  console.log(`Inserting ${updates.length} product updates...`)

  for (let i = 0; i < updates.length; i++) {
    const update = updates[i]
    // Stagger publishedAt so they appear in order (newest first)
    const publishedAt = new Date()
    publishedAt.setHours(publishedAt.getHours() - i * 2)

    await prisma.productUpdate.create({
      data: {
        title: update.title as any,
        description: update.description as any,
        tag: update.tag,
        ctaText: (update.ctaText || null) as any,
        ctaUrl: update.ctaUrl || null,
        isPublished: true,
        publishedAt,
      },
    })

    console.log(`  ✓ ${update.title.es.substring(0, 60)}...`)
  }

  console.log(`\nDone! ${updates.length} product updates created.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
