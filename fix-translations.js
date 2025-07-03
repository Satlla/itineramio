const fs = require('fs')

const filePath = '/Users/alejandrosatlla/Documents/itineramio/app/(dashboard)/properties/page.tsx'
let content = fs.readFileSync(filePath, 'utf8')

// Define replacements
const replacements = {
  "{t('properties.queriesAvoided')}": "Consultas evitadas",
  "{t('properties.queriesMonth')}": "consultas/mes",
  "{t('properties.individualProperties')}": "Propiedades individuales",
  "{t('properties.propertySets')}": "Conjuntos de propiedades",
  "{t('properties.dailyRecommendations')}": "Recomendaciones diarias",
  "{t('properties.optimizationTips')}": "Consejos de optimización",
  "{t('properties.viewTips')}": "Ver consejos",
  "{t('properties.loadingProperties')}": "Cargando propiedades...",
  "{t('properties.loadingSets')}": "Cargando conjuntos...",
  "{t('properties.errorLoading')}": "Error al cargar",
  "{t('properties.properties')}": "propiedades",
  "{t('properties.sets')}": "conjuntos",
  "{t('properties.retry')}": "Reintentar",
  "{t('properties.noIndividualProperties')}": "No tienes propiedades individuales",
  "{t('properties.createIndividualOrSets')}": "Crea tu primera propiedad individual o considera crear un conjunto",
  "{t('properties.createFirstProperty')}": "Crear primera propiedad",
  "{t('properties.firstSteps')}": "Primeros pasos",
  "{t('properties.createFirstDescription')}": "Comienza creando tu primera propiedad para gestionar sus zonas y contenido",
  "{t('properties.createProperty')}": "Crear propiedad",
  "{t('properties.multipleProperties')}": "¿Múltiples propiedades?",
  "{t('properties.multiplePropertiesDescription')}": "Si tienes varias propiedades en el mismo lugar, considera crear un conjunto",
  "{t('properties.edit')}": "Editar",
  "{t('properties.belongsTo')}": "Pertenece a",
  "{t('properties.bedroomsShort')}": "hab",
  "{t('properties.bathroomsShort')}": "baños",
  "{t('properties.guestsShort')}": "huéspedes",
  "{t('properties.zones')}": "zonas",
  "{t('properties.published')}": "Publicada",
  "{t('properties.notPublished')}": "No publicada",
  "{t('properties.active')}": "Activa",
  "{t('properties.inactive')}": "Inactiva",
  "{t('properties.share')}": "Compartir",
  "{t('properties.publicView')}": "Vista pública",
  "{t('properties.delete')}": "Eliminar",
  "{t('properties.manage')}": "Gestionar",
  "{t('properties.recommendations')}": "Recomendaciones",
  "{t('properties.noPropertySets')}": "No tienes conjuntos de propiedades",
  "{t('properties.createSetDescription')}": "Crea un conjunto para agrupar múltiples propiedades bajo la misma gestión",
  "{t('properties.createFirstSet')}": "Crear primer conjunto",
  "{t('properties.hotel')}": "Hotel",
  "{t('properties.building')}": "Edificio",
  "{t('properties.complex')}": "Complejo",
  "{t('properties.resort')}": "Resort",
  "{t('properties.hostel')}": "Hostel",
  "{t('properties.aparthotel')}": "Aparthotel",
  "{t('properties.views')}": "vistas",
  "{t('properties.draft')}": "Borrador",
  "{t('properties.viewProperties')}": "Ver propiedades",
  "{t('properties.manageSet')}": "Gestionar conjunto",
  "{t('properties.shareLink')}": "Compartir enlace",
  "{t('properties.manualLink')}": "Enlace del manual",
  "{t('properties.copied')}": "Copiado",
  "{t('properties.copy')}": "Copiar",
  "{t('properties.tip')}": "Consejo",
  "{t('properties.shareDescription')}": "Comparte este enlace con tus huéspedes para que accedan al manual interactivo de tu propiedad desde cualquier dispositivo.",
  "{t('properties.close')}": "Cerrar",
  "{t('properties.viewManual')}": "Ver manual"
}

// Apply all replacements
for (const [search, replace] of Object.entries(replacements)) {
  content = content.replaceAll(search, replace)
}

fs.writeFileSync(filePath, content)
console.log('✅ Traducciones arregladas en properties page')