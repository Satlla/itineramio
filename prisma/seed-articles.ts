export {}

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding help articles...')

  // ─── Article 1: Crea tu manual con IA en 15 minutos ────────────────────────
  await prisma.helpArticle.upsert({
    where: { slug: 'crear-manual-ia' },
    update: {},
    create: {
      slug: 'crear-manual-ia',
      title: {
        es: 'Crea tu manual con IA en 15 minutos',
        en: 'Create your manual with AI in 15 minutes',
        fr: 'Créez votre manuel avec l\'IA en 15 minutes'
      },
      excerpt: {
        es: 'Descubre cómo el asistente de IA de Itineramio genera un manual completo para tu alojamiento en tan solo 15 minutos, incluyendo zonas, instrucciones y FAQ.',
        en: 'Discover how Itineramio\'s AI assistant generates a complete manual for your property in just 15 minutes, including zones, instructions, and FAQ.',
        fr: 'Découvrez comment l\'assistant IA d\'Itineramio génère un manuel complet pour votre logement en seulement 15 minutes.'
      },
      content: {
        es: `<h3>¿Qué es el Asistente de Configuración con IA?</h3>
<p>El <strong>AI Setup Wizard</strong> es la herramienta estrella de Itineramio. Te permite crear un manual digital completo para tu alojamiento vacacional en aproximadamente <strong>15 minutos</strong>, sin necesidad de escribir cada instrucción manualmente. La IA analiza la información que proporcionas y genera contenido profesional y personalizado.</p>

<h3>Los 5 pasos del asistente</h3>
<p>El proceso de creación se divide en cinco pasos sencillos:</p>
<ul>
  <li><strong>Paso 1 — Dirección:</strong> Introduce la dirección completa de tu propiedad. El sistema la geocodifica automáticamente y la sitúa en el mapa para verificar que es correcta.</li>
  <li><strong>Paso 2 — Detalles de la propiedad:</strong> Indica el tipo de alojamiento (apartamento, casa, villa...), número de habitaciones, baños, capacidad máxima de huéspedes y cualquier característica especial como piscina, parking o terraza.</li>
  <li><strong>Paso 3 — Subida de fotos:</strong> Sube fotografías de tu alojamiento. La IA las analiza para entender mejor los espacios y generar instrucciones más precisas. Cuantas más fotos subas, mejor será el resultado.</li>
  <li><strong>Paso 4 — Generación con IA:</strong> Aquí ocurre la magia. La IA procesa toda la información y genera automáticamente las zonas del manual, cada una con sus pasos, instrucciones detalladas, checklists y preguntas frecuentes.</li>
  <li><strong>Paso 5 — Revisión:</strong> Revisa el contenido generado. Puedes editar, añadir o eliminar cualquier sección antes de publicar tu manual.</li>
</ul>

<h3>¿Qué genera la IA exactamente?</h3>
<p>El asistente crea automáticamente:</p>
<ul>
  <li><strong>Zonas:</strong> Secciones organizadas por área o temática (Check-in, WiFi, Cocina, Normas, etc.)</li>
  <li><strong>Pasos:</strong> Instrucciones detalladas dentro de cada zona, escritas de forma clara y amigable para el huésped.</li>
  <li><strong>Contenido enriquecido:</strong> Descripciones, consejos prácticos y notas importantes.</li>
  <li><strong>FAQ:</strong> Preguntas frecuentes relevantes para cada zona, anticipando las dudas más comunes de los huéspedes.</li>
</ul>

<h3>¿Cuánto tiempo lleva?</h3>
<p>El proceso completo toma aproximadamente <strong>15 minutos</strong>. La mayor parte del tiempo la dedicas a los primeros pasos (dirección, detalles y fotos). La generación con IA tarda entre 1 y 3 minutos dependiendo de la complejidad de tu propiedad.</p>

<h3>Consejo antes de empezar</h3>
<p>Ten preparadas las <strong>fotografías de tu alojamiento</strong> antes de iniciar el asistente. Fotos de buena calidad de cada habitación, la entrada, la cocina, el baño y los electrodomésticos principales ayudarán a la IA a generar instrucciones mucho más precisas y útiles para tus huéspedes.</p>

<p>Para comenzar, accede a tu Dashboard y haz clic en <strong>"Crear propiedad"</strong> o ve directamente a la ruta <strong>/ai-setup</strong>.</p>`,

        en: `<h3>What is the AI Setup Wizard?</h3>
<p>The <strong>AI Setup Wizard</strong> is Itineramio's flagship tool. It lets you create a complete digital manual for your vacation rental in about <strong>15 minutes</strong>, without writing each instruction manually. The AI analyzes the information you provide and generates professional, personalized content.</p>

<h3>The 5 steps</h3>
<ul>
  <li><strong>Step 1 — Address:</strong> Enter your property's full address. The system geocodes it automatically.</li>
  <li><strong>Step 2 — Property details:</strong> Type, rooms, bathrooms, guest capacity, and special features.</li>
  <li><strong>Step 3 — Photo upload:</strong> Upload photos of your property. The AI analyzes them to generate more accurate instructions.</li>
  <li><strong>Step 4 — AI generation:</strong> The AI processes everything and generates zones, steps, checklists, and FAQ.</li>
  <li><strong>Step 5 — Review:</strong> Review and edit the generated content before publishing.</li>
</ul>

<h3>What does the AI generate?</h3>
<ul>
  <li><strong>Zones:</strong> Organized sections (Check-in, WiFi, Kitchen, Rules, etc.)</li>
  <li><strong>Steps:</strong> Detailed instructions within each zone.</li>
  <li><strong>Rich content:</strong> Descriptions, tips, and important notes.</li>
  <li><strong>FAQ:</strong> Frequently asked questions for each zone.</li>
</ul>

<h3>Tip</h3>
<p>Have your <strong>property photos ready</strong> before starting. Quality photos of each room help the AI generate much better instructions.</p>`,

        fr: `<h3>Qu'est-ce que l'assistant de configuration IA ?</h3>
<p>L'<strong>assistant IA</strong> est l'outil phare d'Itineramio. Il vous permet de créer un manuel numérique complet pour votre location en environ <strong>15 minutes</strong>.</p>

<h3>Les 5 étapes</h3>
<ul>
  <li><strong>Étape 1 — Adresse :</strong> Saisissez l'adresse complète de votre propriété.</li>
  <li><strong>Étape 2 — Détails :</strong> Type de logement, chambres, salles de bain, capacité.</li>
  <li><strong>Étape 3 — Photos :</strong> Téléchargez des photos. L'IA les analyse pour générer des instructions plus précises.</li>
  <li><strong>Étape 4 — Génération IA :</strong> L'IA génère automatiquement les zones, étapes et FAQ.</li>
  <li><strong>Étape 5 — Révision :</strong> Vérifiez et modifiez le contenu avant de publier.</li>
</ul>

<h3>Conseil</h3>
<p>Préparez vos <strong>photos</strong> avant de commencer pour de meilleurs résultats.</p>`
      },
      category: 'GETTING_STARTED',
      icon: 'Sparkles',
      order: 1,
      status: 'PUBLISHED',
      featured: true,
      searchTerms: ['ia', 'inteligencia artificial', 'wizard', 'asistente', 'crear', 'manual', 'setup', 'configurar', 'generar', 'ai', '15 minutos', 'fotos', 'pasos']
    }
  })
  console.log('  ✓ Article 1: crear-manual-ia')

  // ─── Article 2: Zonas que crea la IA y cómo personalizarlas ─────────────────
  await prisma.helpArticle.upsert({
    where: { slug: 'zonas-ia-personalizar' },
    update: {},
    create: {
      slug: 'zonas-ia-personalizar',
      title: {
        es: 'Zonas que crea la IA y cómo personalizarlas',
        en: 'Zones created by AI and how to customize them',
        fr: 'Zones créées par l\'IA et comment les personnaliser'
      },
      excerpt: {
        es: 'Aprende qué zonas genera automáticamente la IA, qué contiene cada una y cómo editarlas, reordenarlas y añadir tus propias fotos.',
        en: 'Learn what zones the AI generates automatically, what each one contains, and how to edit, reorder, and add your own photos.',
        fr: 'Découvrez les zones générées par l\'IA, leur contenu, et comment les modifier et les personnaliser.'
      },
      content: {
        es: `<h3>Zonas típicas que genera la IA</h3>
<p>Cuando completas el asistente de configuración, la IA crea automáticamente un conjunto de <strong>zonas</strong> adaptadas a tu propiedad. Las zonas más habituales son:</p>
<ul>
  <li><strong>Check-in:</strong> Instrucciones de llegada, cómo acceder al edificio, código de la cerradura, dónde recoger las llaves y ubicación del parking si lo hay.</li>
  <li><strong>WiFi:</strong> Nombre de la red, contraseña, ubicación del router y qué hacer si la conexión falla.</li>
  <li><strong>Cocina:</strong> Cómo usar los electrodomésticos principales (vitrocerámica, horno, lavavajillas, cafetera), dónde encontrar utensilios y normas básicas de uso.</li>
  <li><strong>Normas de la casa:</strong> Horarios de silencio, política de mascotas, normas de basuras y reciclaje, uso de espacios comunes y límite de huéspedes.</li>
  <li><strong>Recomendaciones locales:</strong> Restaurantes cercanos, supermercados, farmacias, transporte público y lugares de interés turístico en la zona.</li>
  <li><strong>Checkout:</strong> Hora de salida, instrucciones de limpieza básica, dónde dejar las llaves y cómo cerrar correctamente.</li>
</ul>

<h3>¿Qué contiene cada zona?</h3>
<p>Cada zona se compone de varios elementos:</p>
<ul>
  <li><strong>Pasos:</strong> Instrucciones numeradas y detalladas que guían al huésped paso a paso.</li>
  <li><strong>Checklists:</strong> Listas de verificación para tareas como el checkout (apagar luces, cerrar ventanas, etc.).</li>
  <li><strong>FAQ:</strong> Preguntas frecuentes específicas de esa zona, con respuestas claras y concisas.</li>
</ul>

<h3>Qué revisar después de la generación</h3>
<p>Aunque la IA hace un excelente trabajo, hay ciertos datos que <strong>debes verificar manualmente</strong>:</p>
<ul>
  <li><strong>Direcciones específicas:</strong> Comprueba que la dirección de llegada y las indicaciones son correctas y completas.</li>
  <li><strong>Contraseñas WiFi:</strong> La IA no conoce tu contraseña real. Edita la zona WiFi y añade el nombre de red y la contraseña correctos.</li>
  <li><strong>Normas específicas:</strong> Cada alojamiento tiene reglas particulares. Revisa que las normas generadas se ajusten a las tuyas.</li>
  <li><strong>Horarios:</strong> Verifica las horas de check-in, checkout y horarios de silencio.</li>
</ul>

<h3>Añadir y eliminar zonas</h3>
<p>Puedes <strong>crear nuevas zonas</strong> desde el editor de tu propiedad haciendo clic en el botón "Añadir zona". También puedes <strong>eliminar</strong> cualquier zona que no sea relevante para tu alojamiento. Por ejemplo, si no tienes piscina, puedes eliminar esa zona si la IA la creó.</p>

<h3>Fotos en las zonas</h3>
<p>Es importante saber que la <strong>IA no añade fotografías</strong> a las zonas automáticamente. Las fotos que subes durante el setup se usan para que la IA entienda los espacios, pero debes subir imágenes específicas a cada zona manualmente. Esto mejora enormemente la experiencia del huésped: una foto del router junto a las instrucciones WiFi, o una foto del panel de la vitrocerámica en la zona de cocina.</p>

<h3>Reordenar zonas</h3>
<p>Puedes <strong>arrastrar y soltar</strong> las zonas para cambiar su orden. Recomendamos poner primero las zonas más importantes: Check-in, WiFi y Normas de la casa suelen funcionar bien al principio del manual.</p>`,

        en: `<h3>Typical zones generated by AI</h3>
<p>When you complete the setup wizard, the AI creates a set of <strong>zones</strong> tailored to your property:</p>
<ul>
  <li><strong>Check-in:</strong> Arrival instructions, building access, lock code, key pickup location.</li>
  <li><strong>WiFi:</strong> Network name, password, router location, troubleshooting.</li>
  <li><strong>Kitchen:</strong> How to use main appliances, where to find utensils, basic rules.</li>
  <li><strong>House Rules:</strong> Quiet hours, pet policy, waste management, guest limits.</li>
  <li><strong>Local Recommendations:</strong> Nearby restaurants, supermarkets, public transport, attractions.</li>
  <li><strong>Checkout:</strong> Departure time, basic cleaning, key return, how to lock up.</li>
</ul>

<h3>What each zone contains</h3>
<ul>
  <li><strong>Steps:</strong> Numbered, detailed instructions guiding the guest.</li>
  <li><strong>Checklists:</strong> Verification lists for tasks like checkout.</li>
  <li><strong>FAQ:</strong> Zone-specific frequently asked questions.</li>
</ul>

<h3>What to review after generation</h3>
<p>Check these items manually:</p>
<ul>
  <li><strong>Specific addresses:</strong> Verify arrival directions are correct.</li>
  <li><strong>WiFi passwords:</strong> The AI doesn't know your real password — edit it.</li>
  <li><strong>House rules:</strong> Ensure generated rules match your actual policies.</li>
  <li><strong>Schedules:</strong> Verify check-in/out times and quiet hours.</li>
</ul>

<h3>Photos and reordering</h3>
<p>The AI <strong>does not add photos</strong> to zones automatically. Upload images to each zone for a better guest experience. You can <strong>drag and drop</strong> zones to reorder them.</p>`,

        fr: `<h3>Zones typiques générées par l'IA</h3>
<p>L'IA crée automatiquement des <strong>zones</strong> adaptées à votre propriété :</p>
<ul>
  <li><strong>Check-in :</strong> Instructions d'arrivée, accès, code de serrure.</li>
  <li><strong>WiFi :</strong> Nom du réseau, mot de passe, emplacement du routeur.</li>
  <li><strong>Cuisine :</strong> Utilisation des appareils, ustensiles, règles de base.</li>
  <li><strong>Règles :</strong> Heures de silence, animaux, gestion des déchets.</li>
  <li><strong>Recommandations :</strong> Restaurants, supermarchés, transport, attractions.</li>
  <li><strong>Checkout :</strong> Heure de départ, nettoyage de base, remise des clés.</li>
</ul>

<h3>Contenu de chaque zone</h3>
<ul>
  <li><strong>Étapes :</strong> Instructions détaillées et numérotées.</li>
  <li><strong>Checklists :</strong> Listes de vérification.</li>
  <li><strong>FAQ :</strong> Questions fréquentes spécifiques à la zone.</li>
</ul>

<h3>Ce qu'il faut vérifier</h3>
<p>Vérifiez les adresses, mots de passe WiFi, règles et horaires après la génération. Ajoutez vos propres photos à chaque zone.</p>`
      },
      category: 'GUIDES',
      icon: 'LayoutGrid',
      order: 2,
      status: 'PUBLISHED',
      featured: true,
      searchTerms: ['zonas', 'zones', 'personalizar', 'editar', 'check-in', 'wifi', 'cocina', 'normas', 'checkout', 'recomendaciones', 'arrastrar', 'reordenar', 'fotos', 'customize']
    }
  })
  console.log('  ✓ Article 2: zonas-ia-personalizar')

  // ─── Article 3: Traducciones automáticas ────────────────────────────────────
  await prisma.helpArticle.upsert({
    where: { slug: 'traducciones-automaticas' },
    update: {},
    create: {
      slug: 'traducciones-automaticas',
      title: {
        es: 'Traducciones automáticas: cómo funcionan',
        en: 'Automatic translations: how they work',
        fr: 'Traductions automatiques : comment elles fonctionnent'
      },
      excerpt: {
        es: 'Entiende cómo Itineramio traduce automáticamente tu manual a español, inglés y francés, y cómo puedes editar las traducciones manualmente.',
        en: 'Understand how Itineramio automatically translates your manual into Spanish, English, and French, and how to manually edit translations.',
        fr: 'Comprenez comment Itineramio traduit automatiquement votre manuel en espagnol, anglais et français.'
      },
      content: {
        es: `<h3>Idiomas disponibles</h3>
<p>Itineramio soporta actualmente <strong>tres idiomas</strong> para los manuales de huéspedes:</p>
<ul>
  <li><strong>Español</strong> (es)</li>
  <li><strong>Inglés</strong> (en)</li>
  <li><strong>Francés</strong> (fr)</li>
</ul>
<p>Esto significa que tu manual estará disponible en los tres idiomas para que cada huésped pueda leerlo en el que prefiera.</p>

<h3>¿Cómo se detecta el idioma del huésped?</h3>
<p>La detección es <strong>automática</strong>. Cuando un huésped accede a tu manual (escaneando un código QR o haciendo clic en el enlace), el sistema detecta el idioma configurado en su navegador y muestra el manual en ese idioma. Si el idioma del navegador no está soportado, se muestra en español por defecto.</p>
<p>El huésped también puede cambiar manualmente el idioma desde el selector que aparece en la parte superior del manual.</p>

<h3>Contenido original vs. traducciones</h3>
<p>El <strong>contenido original</strong> es el que tú escribes o el que genera la IA durante el setup. Por defecto, se genera en el idioma que tengas configurado en tu cuenta. Las <strong>traducciones a los otros dos idiomas</strong> se generan automáticamente utilizando inteligencia artificial.</p>
<p>El sistema traduce:</p>
<ul>
  <li>Títulos de zonas y pasos</li>
  <li>Descripciones e instrucciones</li>
  <li>Preguntas frecuentes y sus respuestas</li>
  <li>Avisos y anuncios temporales</li>
</ul>

<h3>¿Puedo editar las traducciones?</h3>
<p>Sí. Puedes <strong>editar manualmente cualquier traducción</strong> desde el editor de tu propiedad. Simplemente cambia el idioma en el selector del editor y modifica el texto que desees. Los cambios manuales tienen prioridad sobre las traducciones automáticas.</p>
<p>Esto es especialmente útil para:</p>
<ul>
  <li>Corregir nombres propios de lugares que la IA no haya traducido correctamente.</li>
  <li>Ajustar expresiones locales o coloquiales.</li>
  <li>Añadir información específica que solo aplica a huéspedes de un idioma concreto.</li>
</ul>

<h3>Consejo para mejores traducciones</h3>
<p>Escribe tu contenido original en <strong>español claro y sencillo</strong>. Evita frases muy largas, dobles negaciones o expresiones muy coloquiales. Cuanto más simple y directo sea el texto original, mejores serán las traducciones automáticas a inglés y francés.</p>
<p>Por ejemplo, en lugar de <em>"No es que no se pueda hacer ruido después de las 22h"</em>, escribe <em>"Por favor, no hagas ruido después de las 22:00"</em>. La traducción será mucho más precisa y clara.</p>`,

        en: `<h3>Available languages</h3>
<p>Itineramio currently supports <strong>three languages</strong> for guest manuals:</p>
<ul>
  <li><strong>Spanish</strong> (es)</li>
  <li><strong>English</strong> (en)</li>
  <li><strong>French</strong> (fr)</li>
</ul>

<h3>How is the guest's language detected?</h3>
<p>Detection is <strong>automatic</strong>. When a guest accesses your manual, the system detects their browser language and displays the manual accordingly. If unsupported, it defaults to Spanish. Guests can also manually switch languages from the selector at the top.</p>

<h3>Original content vs. translations</h3>
<p>The <strong>original content</strong> is what you write or what the AI generates. <strong>Translations</strong> to the other two languages are generated automatically. The system translates zone titles, steps, descriptions, FAQ, and announcements.</p>

<h3>Can I edit translations?</h3>
<p>Yes. You can <strong>manually edit any translation</strong> from the property editor. Switch the language in the editor selector and modify the text. Manual changes take priority over automatic translations.</p>

<h3>Tip for better translations</h3>
<p>Write your original content in <strong>clear, simple language</strong>. Avoid very long sentences or colloquial expressions. The simpler your original text, the better the automatic translations will be.</p>`,

        fr: `<h3>Langues disponibles</h3>
<p>Itineramio prend en charge <strong>trois langues</strong> : espagnol, anglais et français.</p>

<h3>Détection de la langue</h3>
<p>La détection est <strong>automatique</strong>. Le système détecte la langue du navigateur du voyageur. Si elle n'est pas prise en charge, l'espagnol est affiché par défaut. Le voyageur peut aussi changer manuellement la langue.</p>

<h3>Contenu original et traductions</h3>
<p>Le contenu original est ce que vous écrivez ou ce que l'IA génère. Les traductions vers les deux autres langues sont générées automatiquement. Vous pouvez modifier manuellement toute traduction depuis l'éditeur.</p>

<h3>Conseil</h3>
<p>Écrivez votre contenu original dans un <strong>langage clair et simple</strong> pour obtenir de meilleures traductions automatiques.</p>`
      },
      category: 'FEATURES',
      icon: 'Languages',
      order: 3,
      status: 'PUBLISHED',
      featured: false,
      searchTerms: ['traduccion', 'traducciones', 'idioma', 'idiomas', 'ingles', 'frances', 'español', 'language', 'translation', 'automatico', 'browser', 'navegador']
    }
  })
  console.log('  ✓ Article 3: traducciones-automaticas')

  // ─── Article 4: Avisos: comunícate con tus huéspedes ───────────────────────
  await prisma.helpArticle.upsert({
    where: { slug: 'avisos-huespedes' },
    update: {},
    create: {
      slug: 'avisos-huespedes',
      title: {
        es: 'Avisos: comunícate con tus huéspedes en tiempo real',
        en: 'Announcements: communicate with your guests in real time',
        fr: 'Annonces : communiquez avec vos voyageurs en temps réel'
      },
      excerpt: {
        es: 'Aprende a usar los avisos para comunicar información importante y temporal a tus huéspedes directamente en su manual digital.',
        en: 'Learn how to use announcements to communicate important, temporary information to your guests directly in their digital manual.',
        fr: 'Apprenez à utiliser les annonces pour communiquer des informations importantes à vos voyageurs.'
      },
      content: {
        es: `<h3>¿Qué son los avisos?</h3>
<p>Los avisos son <strong>mensajes temporales</strong> que puedes publicar en el manual de tu propiedad para comunicar información importante a tus huéspedes. A diferencia del contenido permanente de las zonas, los avisos están pensados para situaciones puntuales que necesitan atención inmediata.</p>

<h3>¿Cuándo usar avisos?</h3>
<p>Los avisos son perfectos para situaciones como:</p>
<ul>
  <li><strong>Obras cercanas:</strong> "Hay obras en el edificio de al lado de 8:00 a 14:00. Disculpa las molestias."</li>
  <li><strong>Mantenimiento de piscina:</strong> "La piscina estará cerrada el martes 15 por mantenimiento."</li>
  <li><strong>Eventos especiales:</strong> "Este fin de semana hay fiestas del pueblo. Puede haber ruido hasta las 2:00."</li>
  <li><strong>Cambios en servicios:</strong> "El WiFi será más lento hoy por una actualización del proveedor."</li>
  <li><strong>Información estacional:</strong> "Atención: nivel de polen alto esta semana. Si eres alérgico, mantén las ventanas cerradas."</li>
</ul>

<h3>Cómo crear un aviso</h3>
<p>Para crear un aviso, sigue estos pasos:</p>
<ul>
  <li>Ve a tu <strong>Dashboard</strong>.</li>
  <li>Selecciona la <strong>propiedad</strong> donde quieres publicar el aviso.</li>
  <li>Haz clic en la sección <strong>"Avisos"</strong> o <strong>"Announcements"</strong>.</li>
  <li>Escribe el título y el contenido del aviso.</li>
  <li>Selecciona el <strong>tipo de aviso</strong> y, opcionalmente, una <strong>fecha de expiración</strong>.</li>
  <li>Publica el aviso.</li>
</ul>

<h3>Tipos de avisos</h3>
<p>Existen tres tipos de avisos con diferentes niveles de visibilidad:</p>
<ul>
  <li><strong>Informativo (info):</strong> Para información general que el huésped debería conocer. Se muestra con un estilo sutil en azul.</li>
  <li><strong>Advertencia (warning):</strong> Para situaciones que requieren precaución. Se muestra en amarillo/naranja y es más visible.</li>
  <li><strong>Urgente (urgent):</strong> Para situaciones críticas que necesitan atención inmediata. Se muestra en rojo y de forma muy prominente.</li>
</ul>

<h3>Visibilidad para el huésped</h3>
<p>Los avisos aparecen de forma <strong>destacada en la parte superior</strong> del manual digital. El huésped los ve nada más abrir la guía, antes de cualquier zona. Esto garantiza que la información importante llega al huésped de inmediato.</p>

<h3>Fecha de expiración</h3>
<p>Puedes establecer una <strong>fecha de expiración</strong> para cada aviso. Una vez pasada esa fecha, el aviso desaparece automáticamente del manual sin que tengas que hacer nada. Esto es ideal para situaciones temporales con fecha conocida de finalización, como obras o eventos.</p>
<p>Si no estableces fecha de expiración, el aviso permanecerá visible hasta que lo elimines manualmente.</p>`,

        en: `<h3>What are announcements?</h3>
<p>Announcements are <strong>temporary messages</strong> you can publish in your property's manual to communicate important information to guests. Unlike permanent zone content, announcements are designed for specific situations needing immediate attention.</p>

<h3>When to use announcements</h3>
<ul>
  <li><strong>Nearby construction:</strong> Warn about noise during specific hours.</li>
  <li><strong>Pool maintenance:</strong> Notify about closures.</li>
  <li><strong>Special events:</strong> Alert about local festivities or noise.</li>
  <li><strong>Service changes:</strong> WiFi outages, water cuts, etc.</li>
</ul>

<h3>How to create an announcement</h3>
<p>Go to your <strong>Dashboard</strong>, select the property, click on <strong>"Announcements"</strong>, write your message, select the type, set an optional expiration date, and publish.</p>

<h3>Announcement types</h3>
<ul>
  <li><strong>Info:</strong> General information. Blue, subtle style.</li>
  <li><strong>Warning:</strong> Situations requiring caution. Yellow/orange, more visible.</li>
  <li><strong>Urgent:</strong> Critical situations. Red, very prominent.</li>
</ul>

<h3>Visibility and expiration</h3>
<p>Announcements appear <strong>prominently at the top</strong> of the manual. You can set an <strong>expiration date</strong> — the announcement disappears automatically after that date.</p>`,

        fr: `<h3>Que sont les annonces ?</h3>
<p>Les annonces sont des <strong>messages temporaires</strong> publiés dans le manuel de votre propriété pour communiquer des informations importantes aux voyageurs.</p>

<h3>Quand les utiliser ?</h3>
<ul>
  <li><strong>Travaux à proximité</strong></li>
  <li><strong>Entretien de la piscine</strong></li>
  <li><strong>Événements spéciaux</strong></li>
  <li><strong>Changements de services</strong> (WiFi, eau, etc.)</li>
</ul>

<h3>Types d'annonces</h3>
<ul>
  <li><strong>Info :</strong> Information générale (bleu).</li>
  <li><strong>Avertissement :</strong> Situations nécessitant de la prudence (orange).</li>
  <li><strong>Urgent :</strong> Situations critiques (rouge).</li>
</ul>

<h3>Visibilité</h3>
<p>Les annonces apparaissent en haut du manuel. Vous pouvez définir une <strong>date d'expiration</strong> pour qu'elles disparaissent automatiquement.</p>`
      },
      category: 'FEATURES',
      icon: 'Megaphone',
      order: 4,
      status: 'PUBLISHED',
      featured: false,
      searchTerms: ['avisos', 'anuncios', 'announcements', 'comunicar', 'huespedes', 'temporal', 'urgente', 'warning', 'info', 'expiracion', 'mensaje', 'notificacion']
    }
  })
  console.log('  ✓ Article 4: avisos-huespedes')

  // ─── Article 5: Códigos QR ─────────────────────────────────────────────────
  await prisma.helpArticle.upsert({
    where: { slug: 'codigos-qr' },
    update: {},
    create: {
      slug: 'codigos-qr',
      title: {
        es: 'Códigos QR: imprime y coloca en tu alojamiento',
        en: 'QR Codes: print and place in your property',
        fr: 'Codes QR : imprimez et placez dans votre logement'
      },
      excerpt: {
        es: 'Descubre los dos tipos de códigos QR disponibles, cómo generarlos, imprimirlos y dónde colocarlos para que tus huéspedes accedan al manual al instante.',
        en: 'Discover the two types of QR codes available, how to generate and print them, and where to place them for instant guest access.',
        fr: 'Découvrez les deux types de codes QR, comment les générer et où les placer pour un accès instantané.'
      },
      content: {
        es: `<h3>Dos tipos de códigos QR</h3>
<p>Itineramio ofrece <strong>dos tipos de códigos QR</strong> para que tus huéspedes accedan al manual de la forma más cómoda posible:</p>
<ul>
  <li><strong>QR general de la propiedad:</strong> Al escanearlo, el huésped accede al manual completo desde la página principal. Ideal para la entrada del alojamiento.</li>
  <li><strong>QR específico de zona:</strong> Al escanearlo, el huésped accede directamente a una zona concreta del manual. Por ejemplo, un QR en el router que lleva directamente a las instrucciones WiFi, o un QR en la cocina que abre las instrucciones de los electrodomésticos.</li>
</ul>

<h3>¿Cómo funciona para el huésped?</h3>
<p>La experiencia es extremadamente sencilla:</p>
<ul>
  <li>El huésped abre la <strong>cámara de su teléfono</strong> (no necesita ninguna app especial).</li>
  <li>Apunta al código QR.</li>
  <li>Toca la notificación que aparece.</li>
  <li>Se abre el manual directamente en el navegador, en el <strong>idioma de su teléfono</strong>.</li>
</ul>
<p><strong>No necesita descargar ninguna aplicación</strong>, no necesita crear cuenta, no necesita contraseña. Acceso instantáneo.</p>

<h3>Cómo generar tus códigos QR</h3>
<p>Para generar un código QR, sigue estos pasos:</p>
<ul>
  <li>Ve a tu <strong>Dashboard</strong>.</li>
  <li>Selecciona la <strong>propiedad</strong>.</li>
  <li>Haz clic en el botón <strong>"Código QR"</strong> que encontrarás en la barra superior de la propiedad.</li>
  <li>Se generará automáticamente el QR general. Para QR de zonas específicas, navega a la zona deseada y busca la opción de QR.</li>
  <li>Descarga el código en formato imagen o PDF listo para imprimir.</li>
</ul>

<h3>Consejos de impresión</h3>
<p>Para que tus códigos QR duren y se vean bien:</p>
<ul>
  <li><strong>Lamina los códigos:</strong> Usa fundas de plástico o papel laminado para protegerlos de la humedad y el desgaste.</li>
  <li><strong>Tamaño mínimo:</strong> Imprime los códigos QR a un tamaño mínimo de 5x5 cm para que se escaneen fácilmente.</li>
  <li><strong>Colócalos a la altura de los ojos:</strong> No los pongas muy arriba ni muy abajo. La altura de los ojos facilita el escaneo.</li>
  <li><strong>Buen contraste:</strong> Asegúrate de que el fondo donde los colocas no interfiere con el contraste del código.</li>
</ul>

<h3>Dónde colocar cada QR</h3>
<p>Estos son los lugares más efectivos para colocar tus códigos QR:</p>
<ul>
  <li><strong>Puerta de entrada:</strong> QR general. Es lo primero que ve el huésped al llegar. Puede acceder a todas las instrucciones de check-in de un vistazo.</li>
  <li><strong>Router WiFi:</strong> QR de zona WiFi. El huésped escanea y ve directamente el nombre de red y la contraseña.</li>
  <li><strong>Cocina:</strong> QR de zona Cocina. Junto a la vitrocerámica o el horno, con instrucciones de uso de los electrodomésticos.</li>
  <li><strong>Salón / Zona común:</strong> QR general o QR de Normas. En un lugar visible para que el huésped pueda consultar las normas fácilmente.</li>
  <li><strong>Interior de un armario:</strong> QR general como respaldo, por si el huésped pierde el enlace.</li>
  <li><strong>Junto al termostato o aire acondicionado:</strong> QR de zona con instrucciones específicas de climatización.</li>
</ul>

<h3>Ventaja competitiva</h3>
<p>Los códigos QR eliminan la necesidad de manuales impresos en papel, guías plastificadas obsoletas o largas explicaciones por WhatsApp. Tu huésped tiene toda la información <strong>siempre actualizada</strong> en su bolsillo, y tú puedes modificar el manual en cualquier momento sin reimprimir nada.</p>`,

        en: `<h3>Two types of QR codes</h3>
<p>Itineramio offers <strong>two types of QR codes</strong>:</p>
<ul>
  <li><strong>General property QR:</strong> Scanning it opens the full manual. Ideal for the front door.</li>
  <li><strong>Zone-specific QR:</strong> Scanning it goes directly to a specific zone. For example, a QR on the router opens WiFi instructions directly.</li>
</ul>

<h3>Guest experience</h3>
<p>The guest simply opens their <strong>phone camera</strong>, points at the QR code, and the manual opens in their browser in their phone's language. <strong>No app download needed</strong>, no account, no password. Instant access.</p>

<h3>How to generate QR codes</h3>
<p>Go to your <strong>Dashboard</strong>, select the property, click the <strong>"QR Code"</strong> button in the top bar. Download the code as an image or print-ready PDF. For zone-specific QR codes, navigate to the zone and look for the QR option.</p>

<h3>Printing tips</h3>
<ul>
  <li><strong>Laminate</strong> your codes for durability.</li>
  <li>Print at a minimum size of <strong>5x5 cm</strong>.</li>
  <li>Place at <strong>eye level</strong> for easy scanning.</li>
  <li>Ensure good <strong>contrast</strong> with the background.</li>
</ul>

<h3>Where to place them</h3>
<ul>
  <li><strong>Front door:</strong> General QR for check-in instructions.</li>
  <li><strong>WiFi router:</strong> WiFi zone QR with network name and password.</li>
  <li><strong>Kitchen:</strong> Kitchen zone QR near appliances.</li>
  <li><strong>Living room:</strong> General QR or House Rules zone QR.</li>
  <li><strong>Near thermostat/AC:</strong> Climate control zone QR.</li>
</ul>`,

        fr: `<h3>Deux types de codes QR</h3>
<ul>
  <li><strong>QR général :</strong> Ouvre le manuel complet. Idéal pour la porte d'entrée.</li>
  <li><strong>QR par zone :</strong> Ouvre directement une zone spécifique (WiFi, cuisine, etc.).</li>
</ul>

<h3>Expérience du voyageur</h3>
<p>Le voyageur ouvre l'appareil photo de son téléphone, scanne le QR, et le manuel s'ouvre dans son navigateur. <strong>Aucune application requise</strong>, accès instantané.</p>

<h3>Comment générer les codes QR</h3>
<p>Allez dans votre <strong>Dashboard</strong>, sélectionnez la propriété, cliquez sur <strong>"Code QR"</strong>. Téléchargez en image ou PDF.</p>

<h3>Conseils</h3>
<ul>
  <li><strong>Plastifiez</strong> vos codes pour la durabilité.</li>
  <li>Taille minimum : <strong>5x5 cm</strong>.</li>
  <li>Placez-les à <strong>hauteur des yeux</strong>.</li>
</ul>

<h3>Où les placer</h3>
<ul>
  <li><strong>Porte d'entrée :</strong> QR général.</li>
  <li><strong>Routeur WiFi :</strong> QR zone WiFi.</li>
  <li><strong>Cuisine :</strong> QR zone cuisine.</li>
  <li><strong>Salon :</strong> QR général ou règles.</li>
</ul>`
      },
      category: 'GUIDES',
      icon: 'QrCode',
      order: 5,
      status: 'PUBLISHED',
      featured: false,
      searchTerms: ['qr', 'codigo', 'codigos', 'imprimir', 'escanear', 'scan', 'print', 'colocar', 'puerta', 'router', 'cocina', 'zona', 'acceso', 'enlace', 'link']
    }
  })
  console.log('  ✓ Article 5: codigos-qr')

  console.log('\nAll 5 help articles seeded successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding articles:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
