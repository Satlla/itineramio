/**
 * FAQs de Conjuntos de Propiedades
 * Para importar en help-content.ts
 */

export const CONJUNTOS_FAQ = [
  // ============================================
  // SECCIÓN: CONJUNTOS DE PROPIEDADES (50 preguntas)
  // ============================================

  // Conceptos básicos de conjuntos
  {
    id: 'conj-1',
    type: 'faq',
    title: '¿Qué es un conjunto de propiedades?',
    description: 'Explicación de conjuntos',
    content: 'Un conjunto de propiedades es una forma de agrupar múltiples propiedades bajo una misma gestión. Ideal para hoteles, edificios de apartamentos, complejos turísticos o hosts con varias propiedades en la misma zona. Te permite gestionar todo desde un solo lugar.',
    tags: ['conjunto', 'propiedades', 'qué es', 'agrupar', 'hotel', 'edificio', 'gestión'],
    url: '/help#que-es-conjunto',
    category: 'Conjuntos de Propiedades'
  },
  {
    id: 'conj-2',
    type: 'faq',
    title: '¿Cómo creo un conjunto de propiedades?',
    description: 'Crear un conjunto',
    content: 'Ve a tu dashboard > Conjuntos (o Grupos) > "Nuevo Conjunto". Completa los 4 pasos: 1) Información básica (nombre, descripción, tipo), 2) Ubicación (dirección común), 3) Contacto (datos del responsable), 4) Seleccionar propiedades para añadir.',
    tags: ['crear', 'conjunto', 'nuevo', 'cómo', 'pasos', 'grupo'],
    url: '/help#crear-conjunto',
    category: 'Conjuntos de Propiedades'
  },
  {
    id: 'conj-3',
    type: 'faq',
    title: '¿Qué tipos de conjuntos puedo crear?',
    description: 'Tipos de conjuntos disponibles',
    content: 'Puedes elegir entre: Hotel, Edificio, Complejo, Resort, Hostel y Aparthotel. El tipo es solo para clasificación y personalización visual - funcionalidades son iguales.',
    tags: ['tipos', 'conjunto', 'hotel', 'edificio', 'complejo', 'resort', 'hostel', 'aparthotel'],
    url: '/help#tipos-conjunto',
    category: 'Conjuntos de Propiedades'
  },
  {
    id: 'conj-4',
    type: 'faq',
    title: '¿Puedo añadir propiedades a un conjunto después de crearlo?',
    description: 'Añadir propiedades después',
    content: 'Sí, puedes añadir propiedades en cualquier momento. Ve al conjunto > "Añadir Propiedad" > selecciona propiedades existentes o crea una nueva. Las propiedades se pueden mover entre conjuntos.',
    tags: ['añadir', 'propiedades', 'después', 'conjunto', 'existente'],
    url: '/help#anadir-propiedades-conjunto',
    category: 'Conjuntos de Propiedades'
  },
  {
    id: 'conj-5',
    type: 'faq',
    title: '¿Cómo añado propiedades existentes a un conjunto?',
    description: 'Añadir propiedades existentes',
    content: 'Desde el conjunto, haz clic en "Añadir Propiedad" > "Añadir propiedades existentes". Verás todas tus propiedades disponibles. Marca las que quieras añadir y confirma. También puedes buscar por nombre o ciudad.',
    tags: ['añadir', 'existentes', 'propiedades', 'conjunto', 'seleccionar'],
    url: '/help#anadir-existentes-conjunto',
    category: 'Conjuntos de Propiedades'
  },
  {
    id: 'conj-6',
    type: 'faq',
    title: '¿Una propiedad puede estar en varios conjuntos a la vez?',
    description: 'Propiedad en múltiples conjuntos',
    content: 'No, cada propiedad solo puede pertenecer a un conjunto a la vez. Si mueves una propiedad a otro conjunto, se quitará del anterior automáticamente. Las propiedades también pueden estar sin ningún conjunto.',
    tags: ['varios', 'conjuntos', 'propiedad', 'múltiple', 'uno'],
    url: '/help#propiedad-multiples-conjuntos',
    category: 'Conjuntos de Propiedades'
  },
  {
    id: 'conj-7',
    type: 'faq',
    title: '¿Cómo quito una propiedad de un conjunto?',
    description: 'Quitar propiedad de conjunto',
    content: 'Desde el conjunto, busca la propiedad y haz clic en el menú (···) > "Quitar del conjunto". La propiedad no se elimina, solo se desvincula y vuelve a aparecer en "Mis propiedades" individuales.',
    tags: ['quitar', 'propiedad', 'conjunto', 'desvincular', 'eliminar'],
    url: '/help#quitar-propiedad-conjunto',
    category: 'Conjuntos de Propiedades'
  },
  {
    id: 'conj-8',
    type: 'faq',
    title: '¿Cómo elimino un conjunto completo?',
    description: 'Eliminar conjunto',
    content: 'Ve a Configuración del conjunto > "Eliminar conjunto". Las propiedades NO se eliminan, solo se desvinculan y vuelven a "Mis propiedades". Si quieres eliminar también las propiedades, debes hacerlo una por una.',
    tags: ['eliminar', 'conjunto', 'borrar', 'completo', 'propiedades'],
    url: '/help#eliminar-conjunto',
    category: 'Conjuntos de Propiedades'
  },
  {
    id: 'conj-9',
    type: 'faq',
    title: '¿Cómo edito la información de un conjunto?',
    description: 'Editar conjunto',
    content: 'Desde el conjunto, haz clic en "Configurar" o el icono de engranaje. Puedes cambiar nombre, descripción, tipo, ubicación, imagen y datos de contacto. Los cambios se guardan automáticamente.',
    tags: ['editar', 'conjunto', 'modificar', 'configurar', 'cambiar'],
    url: '/help#editar-conjunto',
    category: 'Conjuntos de Propiedades'
  },
  {
    id: 'conj-10',
    type: 'faq',
    title: '¿Puedo cambiar el orden de las propiedades en un conjunto?',
    description: 'Ordenar propiedades en conjunto',
    content: 'Sí, arrastra las propiedades usando el icono de arrastre (⋮⋮) para reordenarlas. El nuevo orden se guarda automáticamente y se refleja en todas las vistas del conjunto.',
    tags: ['orden', 'propiedades', 'conjunto', 'arrastrar', 'organizar'],
    url: '/help#ordenar-propiedades-conjunto',
    category: 'Conjuntos de Propiedades'
  },
  {
    id: 'conj-11',
    type: 'faq',
    title: '¿Cómo duplico una propiedad?',
    description: 'Duplicar una propiedad',
    content: 'Haz clic en el menú de la propiedad (···) > "Duplicar". Elige cuántas copias crear, si compartir medios (fotos/videos), y si añadirlas al mismo conjunto. Las copias se nombran automáticamente: "Nombre 2", "Nombre 3", etc.',
    tags: ['duplicar', 'propiedad', 'copia', 'copiar', 'clonar'],
    url: '/help#duplicar-propiedad',
    category: 'Conjuntos de Propiedades'
  },
  {
    id: 'conj-12',
    type: 'faq',
    title: '¿Cuántas propiedades puedo duplicar a la vez?',
    description: 'Límite de duplicación',
    content: 'Puedes crear hasta 50 copias de una propiedad en una sola operación. Ideal para hoteles con muchas habitaciones similares. Si necesitas más, simplemente repite el proceso.',
    tags: ['cuántas', 'duplicar', 'límite', 'máximo', 'copias'],
    url: '/help#limite-duplicar',
    category: 'Conjuntos de Propiedades'
  },
  {
    id: 'conj-13',
    type: 'faq',
    title: '¿Qué se copia al duplicar una propiedad?',
    description: 'Contenido duplicado',
    content: 'Se copia: nombre (con número), todas las zonas, todos los pasos, traducciones, y opcionalmente los medios (fotos/videos). NO se copian: estadísticas, evaluaciones ni el historial de visitantes.',
    tags: ['qué', 'copia', 'duplicar', 'contenido', 'zonas', 'pasos'],
    url: '/help#que-se-duplica',
    category: 'Conjuntos de Propiedades'
  },
  {
    id: 'conj-14',
    type: 'faq',
    title: '¿Qué significa "Compartir medios" al duplicar?',
    description: 'Compartir medios en duplicación',
    content: 'Si activas "Compartir medios", todas las copias usarán las mismas fotos y videos (ahorra espacio). Si lo desactivas, se crearán copias independientes de cada archivo. Recomendado activar para habitaciones idénticas.',
    tags: ['compartir', 'medios', 'duplicar', 'fotos', 'videos', 'espacio'],
    url: '/help#compartir-medios-duplicar',
    category: 'Conjuntos de Propiedades'
  },
  {
    id: 'conj-15',
    type: 'faq',
    title: '¿Puedo duplicar solo algunas zonas de una propiedad?',
    description: 'Duplicar zonas específicas',
    content: 'Sí, al duplicar puedes elegir "Solo zonas específicas" en vez de "Toda la propiedad". Selecciona las zonas que quieres copiar. Útil si solo necesitas ciertas partes del manual.',
    tags: ['duplicar', 'zonas', 'específicas', 'seleccionar', 'partes'],
    url: '/help#duplicar-zonas-especificas',
    category: 'Conjuntos de Propiedades'
  },
  {
    id: 'conj-16',
    type: 'faq',
    title: '¿Las propiedades duplicadas se publican automáticamente?',
    description: 'Publicar propiedades duplicadas',
    content: 'Por defecto no. Puedes marcar "Publicar automáticamente" al duplicar para que las copias estén activas inmediatamente. Si no, quedarán como borradores para que las revises antes de publicar.',
    tags: ['publicar', 'duplicar', 'automático', 'borrador', 'activo'],
    url: '/help#publicar-duplicadas',
    category: 'Conjuntos de Propiedades'
  },
  {
    id: 'conj-17',
    type: 'faq',
    title: '¿Cómo personalizo cada propiedad después de duplicar?',
    description: 'Personalizar propiedades duplicadas',
    content: 'Después de duplicar, edita cada propiedad individualmente: cambia el nombre (ej: "Habitación 101"), modifica zonas específicas, actualiza fotos si es necesario. Los cambios no afectan a las otras copias.',
    tags: ['personalizar', 'duplicar', 'después', 'editar', 'individual'],
    url: '/help#personalizar-duplicadas',
    category: 'Conjuntos de Propiedades'
  },
  {
    id: 'conj-18',
    type: 'faq',
    title: '¿Cómo veo las estadísticas de todo el conjunto?',
    description: 'Estadísticas del conjunto',
    content: 'Desde la vista del conjunto, verás estadísticas agregadas: total de visitas, visitantes únicos, tiempo en manual, y desglose por propiedad. También se muestran las zonas más visitadas de todo el conjunto.',
    tags: ['estadísticas', 'conjunto', 'visitas', 'analíticas', 'agregadas'],
    url: '/help#estadisticas-conjunto',
    category: 'Conjuntos de Propiedades'
  },
  {
    id: 'conj-19',
    type: 'faq',
    title: '¿Puedo tener contactos diferentes para cada propiedad del conjunto?',
    description: 'Contactos diferentes en conjunto',
    content: 'Sí, el conjunto tiene un contacto principal, pero cada propiedad puede tener su propio contacto. El contacto de la propiedad tiene prioridad sobre el del conjunto cuando el huésped accede.',
    tags: ['contactos', 'diferentes', 'conjunto', 'propiedad', 'whatsapp'],
    url: '/help#contactos-conjunto',
    category: 'Conjuntos de Propiedades'
  },
  {
    id: 'conj-20',
    type: 'faq',
    title: '¿Cómo comparto el enlace de todo el conjunto?',
    description: 'Compartir enlace del conjunto',
    content: 'Cada conjunto tiene su propio enlace que muestra un listado de todas las propiedades. Ve al conjunto > "Compartir" para obtener el enlace. Útil para recepciones de hoteles o portales de edificios.',
    tags: ['compartir', 'enlace', 'conjunto', 'link', 'listado'],
    url: '/help#compartir-conjunto',
    category: 'Conjuntos de Propiedades'
  },
  {
    id: 'conj-21',
    type: 'faq',
    title: '¿Qué es la imagen de perfil del conjunto?',
    description: 'Imagen del conjunto',
    content: 'Es la foto principal que representa a todo el conjunto (ej: fachada del hotel, logo). Aparece en el listado de conjuntos y cuando compartes el enlace del conjunto. Se configura al crear o editar el conjunto.',
    tags: ['imagen', 'perfil', 'conjunto', 'foto', 'logo', 'fachada'],
    url: '/help#imagen-conjunto',
    category: 'Conjuntos de Propiedades'
  },
  {
    id: 'conj-22',
    type: 'faq',
    title: '¿Cómo busco propiedades dentro de un conjunto?',
    description: 'Buscar en conjunto',
    content: 'Desde la vista del conjunto, usa la barra de búsqueda para filtrar por nombre, ciudad o tipo de propiedad. Útil cuando tienes muchas propiedades en el conjunto.',
    tags: ['buscar', 'conjunto', 'filtrar', 'propiedades', 'encontrar'],
    url: '/help#buscar-en-conjunto',
    category: 'Conjuntos de Propiedades'
  },
  {
    id: 'conj-23',
    type: 'faq',
    title: '¿Cómo uso conjuntos para un hotel con habitaciones?',
    description: 'Conjuntos para hoteles',
    content: 'Crea un conjunto tipo "Hotel" con la info general. Crea una propiedad modelo con zonas comunes (recepción, restaurante, piscina). Duplícala para cada habitación, personalizando solo lo específico de cada una.',
    tags: ['hotel', 'habitaciones', 'conjunto', 'ejemplo', 'caso uso'],
    url: '/help#conjunto-hotel',
    category: 'Conjuntos de Propiedades'
  },
  {
    id: 'conj-24',
    type: 'faq',
    title: '¿Cómo gestiono un edificio de apartamentos turísticos?',
    description: 'Conjuntos para edificios',
    content: 'Crea un conjunto tipo "Edificio". Añade zonas comunes (portería, ascensor, parking) en cada propiedad o crea una propiedad "Áreas comunes" separada. Cada apartamento es una propiedad con su manual específico.',
    tags: ['edificio', 'apartamentos', 'conjunto', 'gestionar', 'turísticos'],
    url: '/help#conjunto-edificio',
    category: 'Conjuntos de Propiedades'
  },
  {
    id: 'conj-25',
    type: 'faq',
    title: '¿Cómo organizo propiedades en diferentes ciudades?',
    description: 'Propiedades en varias ciudades',
    content: 'Puedes crear un conjunto por ciudad, o tener propiedades individuales sin conjunto. Para gestión, recomendamos conjuntos por ciudad si tienes 3+ propiedades en cada una. Usa nombres descriptivos: "Apartamentos Barcelona".',
    tags: ['ciudades', 'diferentes', 'organizar', 'conjunto', 'ubicación'],
    url: '/help#propiedades-varias-ciudades',
    category: 'Conjuntos de Propiedades'
  },
  {
    id: 'conj-26',
    type: 'faq',
    title: '¿Necesito un conjunto si solo tengo 2-3 propiedades?',
    description: 'Cuándo usar conjuntos',
    content: 'Los conjuntos son opcionales. Si tus propiedades son muy diferentes o están en distintas zonas, puede ser más fácil gestionarlas individualmente. Los conjuntos brillan cuando tienes 4+ propiedades similares o en la misma ubicación.',
    tags: ['necesito', 'conjunto', 'pocas', 'propiedades', 'vale pena'],
    url: '/help#cuando-usar-conjunto',
    category: 'Conjuntos de Propiedades'
  },
  {
    id: 'conj-27',
    type: 'faq',
    title: '¿Puedo mover propiedades entre conjuntos?',
    description: 'Mover propiedades entre conjuntos',
    content: 'Sí. Quita la propiedad del conjunto actual y añádela al nuevo. O desde la propiedad, edita y cambia el conjunto asignado. El historial y estadísticas de la propiedad se mantienen.',
    tags: ['mover', 'propiedades', 'conjuntos', 'cambiar', 'entre'],
    url: '/help#mover-entre-conjuntos',
    category: 'Conjuntos de Propiedades'
  },
  {
    id: 'conj-28',
    type: 'faq',
    title: '¿Cómo veo qué propiedades no están en ningún conjunto?',
    description: 'Propiedades sin conjunto',
    content: 'Ve a "Mis propiedades" y filtra por "Sin conjunto" o "Individuales". Verás todas las propiedades que no pertenecen a ningún grupo. Desde ahí puedes añadirlas a un conjunto existente.',
    tags: ['sin conjunto', 'propiedades', 'individuales', 'filtrar', 'ver'],
    url: '/help#propiedades-sin-conjunto',
    category: 'Conjuntos de Propiedades'
  },
  {
    id: 'conj-29',
    type: 'faq',
    title: '¿Hay límite de propiedades por conjunto?',
    description: 'Límite de propiedades en conjunto',
    content: 'No hay límite técnico. Hemos visto conjuntos con 200+ propiedades funcionando bien. Pero para facilitar la gestión, considera dividir en conjuntos más pequeños si tienes más de 50 propiedades similares.',
    tags: ['límite', 'propiedades', 'conjunto', 'máximo', 'cuántas'],
    url: '/help#limite-propiedades-conjunto',
    category: 'Conjuntos de Propiedades'
  },
  {
    id: 'conj-30',
    type: 'faq',
    title: '¿Hay límite de conjuntos que puedo crear?',
    description: 'Límite de conjuntos',
    content: 'El límite depende de tu plan de suscripción. El plan básico permite 1 conjunto, mientras que planes superiores permiten conjuntos ilimitados. Revisa tu plan en Cuenta > Suscripción.',
    tags: ['límite', 'conjuntos', 'crear', 'plan', 'suscripción'],
    url: '/help#limite-conjuntos',
    category: 'Conjuntos de Propiedades'
  },
]
