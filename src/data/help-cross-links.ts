/**
 * Cross-links entre FAQ (help-content) y Tutoriales (onboarding-articles)
 * Permite mostrar contenido relacionado entre ambas secciones
 */

// Mapeo de categorías de FAQ a categorías de Onboarding
export const CATEGORY_MAPPING: Record<string, string[]> = {
  'Primeros Pasos': ['empezar', 'cuenta'],
  'Gestión de Propiedades': ['propiedades', 'conjuntos'],
  'Zonas del Manual': ['zonas', 'contenido'],
  'Pasos e Instrucciones': ['contenido', 'zonas'],
  'Códigos QR': ['compartir'],
  'Compartir el Manual': ['compartir'],
  'Personalización': ['contenido', 'propiedades'],
  'Idiomas y Traducciones': ['contenido'],
  'Huéspedes': ['compartir', 'avisos'],
  'Avisos y Alertas': ['avisos'],
  'Analíticas y Estadísticas': ['estadisticas'],
  'Cuenta y Suscripción': ['cuenta', 'facturacion'],
  'WhatsApp y Contacto': ['compartir'],
  'Solución de Problemas': ['empezar']
}

// Mapeo específico de FAQs a artículos de Onboarding
export const FAQ_TO_ONBOARDING: Record<string, string[]> = {
  // Primeros pasos
  'pp-1': ['crear-cuenta'], // Cómo me registro
  'pp-6': ['dashboard-principal'], // Qué es el dashboard
  'pp-8': ['crear-primera-propiedad', 'crear-zona'], // Crear primer manual

  // Propiedades
  'gp-1': ['crear-primera-propiedad'], // Crear propiedad
  'gp-2': ['editar-propiedad'], // Editar propiedad
  'gp-3': ['duplicar-propiedad'], // Duplicar propiedad

  // Zonas
  'zm-1': ['crear-zona'], // Qué es una zona
  'zm-2': ['crear-zona'], // Crear zona
  'zm-3': ['tipos-zonas'], // Zonas recomendadas

  // Conjuntos
  'gp-10': ['que-es-un-conjunto', 'crear-conjunto'], // Conjunto de propiedades

  // Avisos
  'aa-1': ['que-son-avisos'], // Qué son avisos
  'aa-2': ['crear-aviso'], // Crear aviso

  // QR
  'qr-1': ['descargar-qr'], // Códigos QR
  'qr-2': ['imprimir-codigos'], // Imprimir QR

  // Compartir
  'cm-1': ['compartir-manual'], // Compartir manual
  'cm-2': ['enlace-manual'], // Enviar enlace

  // Cuenta
  'cs-1': ['cambiar-plan'], // Planes y precios
  'cs-5': ['cancelar-suscripcion'], // Cancelar

  // Facturación
  'cs-10': ['ver-facturas'], // Facturas
}

// Mapeo inverso: Onboarding a FAQs relacionadas
export const ONBOARDING_TO_FAQ: Record<string, string[]> = {
  // Empezar
  'crear-cuenta': ['pp-1', 'pp-2', 'pp-3'],
  'dashboard-principal': ['pp-6', 'pp-7'],
  'crear-primera-propiedad': ['pp-8', 'gp-1', 'gp-2'],

  // Propiedades
  'editar-propiedad': ['gp-2', 'gp-4'],
  'duplicar-propiedad': ['gp-3'],
  'archivar-propiedad': ['gp-5'],

  // Conjuntos
  'que-es-un-conjunto': ['gp-10', 'gp-11'],
  'crear-conjunto': ['gp-10', 'gp-12'],

  // Zonas
  'crear-zona': ['zm-1', 'zm-2', 'zm-3'],
  'tipos-zonas': ['zm-3', 'zm-4'],
  'ordenar-zonas': ['zm-5'],

  // Contenido
  'anadir-texto': ['pi-1', 'pi-2'],
  'anadir-fotos': ['pi-5', 'pi-6'],
  'anadir-videos': ['pi-7', 'pi-8'],

  // Compartir
  'compartir-manual': ['cm-1', 'cm-2', 'cm-3'],
  'descargar-qr': ['qr-1', 'qr-2', 'qr-3'],
  'imprimir-codigos': ['qr-4', 'qr-5'],

  // Avisos
  'que-son-avisos': ['aa-1'],
  'crear-aviso': ['aa-2', 'aa-3'],
  'usar-plantillas-avisos': ['aa-4'],

  // Estadísticas
  'ver-estadisticas': ['ae-1', 'ae-2'],

  // Cuenta
  'editar-perfil': ['cs-2', 'cs-3'],
  'cambiar-plan': ['cs-1', 'cs-4'],

  // Facturación
  'ver-facturas': ['cs-10', 'cs-11'],
  'metodos-pago': ['cs-12'],
}

// Función helper para obtener onboarding relacionado desde un FAQ
export function getRelatedOnboarding(faqId: string): string[] {
  return FAQ_TO_ONBOARDING[faqId] || []
}

// Función helper para obtener FAQs relacionadas desde un onboarding
export function getRelatedFAQs(onboardingSlug: string): string[] {
  return ONBOARDING_TO_FAQ[onboardingSlug] || []
}

// Función helper para obtener categorías de onboarding desde categoría FAQ
export function getRelatedOnboardingCategories(faqCategory: string): string[] {
  return CATEGORY_MAPPING[faqCategory] || []
}
