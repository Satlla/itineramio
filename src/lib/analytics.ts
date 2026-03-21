/**
 * Sistema de Analytics para Itineramio
 *
 * Trackea eventos críticos del customer journey:
 * - Test de personalidad completado
 * - Emails capturados
 * - Cursos iniciados/completados
 * - Compras realizadas
 * - Engagement con contenido
 */

// Tipos de eventos
export type AnalyticsEvent =
  | 'test_completed'
  | 'test_started'
  | 'email_captured'
  | 'course_started'
  | 'course_completed'
  | 'purchase_completed'
  | 'trial_started'
  | 'property_created'
  | 'qr_generated'
  | 'manual_viewed'
  | 'zone_viewed'
  | 'lead_magnet_downloaded'
  | 'newsletter_subscribed'
  | 'blog_article_read'
  // GA4 Standard Events (for conversions)
  | 'sign_up'
  | 'login'
  | 'begin_checkout'
  | 'purchase'
  | 'generate_lead'
  | 'add_to_cart'
  | 'view_item'
  // Calculator & CTA events
  | 'calculator_used'
  | 'cta_clicked'
  // Demo funnel events
  | 'demo_wow_screen_viewed'
  | 'demo_wow_explore_clicked'
  | 'demo_guide_tour_step'
  | 'demo_chatbot_promoted'
  | 'demo_chatbot_opened'
  | 'demo_chatbot_message_sent'
  | 'demo_share_modal_opened'
  | 'demo_share_completed'
  | 'demo_feedback_submitted'
  | 'demo_exit_intent_shown'
  | 'demo_exit_intent_register_clicked'
  | 'demo_register_clicked'
  | 'demo_register_completed'

// Helper para trackear eventos en Google Analytics y GTM
export function trackEvent(
  eventName: AnalyticsEvent,
  eventParams?: Record<string, any>
) {
  if (typeof window === 'undefined') return

  // Google Tag Manager dataLayer (PRINCIPAL)
  if ((window as any).dataLayer) {
    (window as any).dataLayer.push({
      event: eventName,
      ...eventParams,
    })
  }

  // Google Analytics 4 (si está directo sin GTM)
  if ((window as any).gtag) {
    (window as any).gtag('event', eventName, eventParams)
  }

  // Vercel Analytics (si está disponible)
  if ((window as any).va) {
    (window as any).va('track', eventName, eventParams)
  }

}

// ========================================
// EVENTOS ESPECÍFICOS DEL CUSTOMER JOURNEY
// ========================================

/**
 * Trackea cuando un usuario completa el test de personalidad
 */
export function trackTestCompleted({
  archetype,
  email,
  source = 'organic'
}: {
  archetype: string
  email?: string
  source?: string
}) {
  trackEvent('test_completed', {
    archetype,
    has_email: !!email,
    source,
    value: 1 // Valor del evento (para calcular conversión)
  })
}

/**
 * Trackea cuando un usuario inicia el test
 */
export function trackTestStarted({
  source = 'organic'
}: {
  source?: string
} = {}) {
  trackEvent('test_started', {
    source
  })
}

/**
 * Trackea cuando capturamos un email (lead generation)
 */
export function trackEmailCaptured({
  source,
  archetype,
  leadMagnet
}: {
  source: 'test' | 'qr' | 'blog' | 'landing' | 'manual'
  archetype?: string
  leadMagnet?: string
}) {
  trackEvent('email_captured', {
    source,
    archetype,
    lead_magnet: leadMagnet,
    value: 2 // Valor más alto que test_started
  })
}

/**
 * Trackea cuando un usuario inicia un curso
 */
export function trackCourseStarted({
  courseId,
  courseName,
  isFree
}: {
  courseId: string
  courseName: string
  isFree: boolean
}) {
  trackEvent('course_started', {
    course_id: courseId,
    course_name: courseName,
    is_free: isFree,
    value: isFree ? 3 : 10
  })
}

/**
 * Trackea cuando un usuario completa un curso
 */
export function trackCourseCompleted({
  courseId,
  courseName,
  completionTime,
  isFree
}: {
  courseId: string
  courseName: string
  completionTime?: number // En minutos
  isFree: boolean
}) {
  trackEvent('course_completed', {
    course_id: courseId,
    course_name: courseName,
    completion_time_minutes: completionTime,
    is_free: isFree,
    value: isFree ? 5 : 20
  })
}

/**
 * Trackea compras (MUY IMPORTANTE para ROI)
 */
export function trackPurchaseCompleted({
  transactionId,
  value,
  currency = 'EUR',
  items,
  coupon
}: {
  transactionId: string
  value: number
  currency?: string
  items: Array<{
    item_id: string
    item_name: string
    item_category?: string
    price: number
    quantity: number
  }>
  coupon?: string
}) {
  trackEvent('purchase_completed', {
    transaction_id: transactionId,
    value,
    currency,
    items,
    coupon,
    // Enhanced ecommerce
    affiliation: 'Itineramio',
    tax: 0, // Añadir si aplica IVA
    shipping: 0
  })
}

/**
 * Trackea cuando un usuario inicia el trial
 */
export function trackTrialStarted({
  plan,
  trialDays = 15
}: {
  plan: 'BASIC' | 'HOST' | 'SUPERHOST' | 'BUSINESS'
  trialDays?: number
}) {
  trackEvent('trial_started', {
    plan,
    trial_days: trialDays,
    value: 5
  })
}

/**
 * Trackea cuando un usuario crea su primera propiedad
 */
export function trackPropertyCreated({
  propertyId,
  isFirstProperty,
  source
}: {
  propertyId: string
  isFirstProperty: boolean
  source?: 'onboarding' | 'dashboard' | 'duplicate'
}) {
  trackEvent('property_created', {
    property_id: propertyId,
    is_first_property: isFirstProperty,
    source,
    value: isFirstProperty ? 7 : 3
  })
}

/**
 * Trackea cuando se genera un código QR
 */
export function trackQRGenerated({
  propertyId,
  zoneId,
  qrType
}: {
  propertyId: string
  zoneId?: string
  qrType: 'property' | 'zone'
}) {
  trackEvent('qr_generated', {
    property_id: propertyId,
    zone_id: zoneId,
    qr_type: qrType,
    value: 1
  })
}

/**
 * Trackea cuando un huésped visualiza un manual (engagement)
 */
export function trackManualViewed({
  propertyId,
  guestId,
  source
}: {
  propertyId: string
  guestId?: string
  source?: 'qr' | 'link' | 'email'
}) {
  trackEvent('manual_viewed', {
    property_id: propertyId,
    guest_id: guestId,
    source,
    value: 0.5 // Indica engagement
  })
}

/**
 * Trackea cuando un huésped ve una zona específica
 */
export function trackZoneViewed({
  propertyId,
  zoneId,
  zoneName,
  guestId
}: {
  propertyId: string
  zoneId: string
  zoneName: string
  guestId?: string
}) {
  trackEvent('zone_viewed', {
    property_id: propertyId,
    zone_id: zoneId,
    zone_name: zoneName,
    guest_id: guestId,
    value: 0.3
  })
}

/**
 * Trackea cuando se descarga un lead magnet del blog
 */
export function trackLeadMagnetDownloaded({
  resourceName,
  resourceType,
  articleSlug
}: {
  resourceName: string
  resourceType: 'pdf' | 'template' | 'checklist' | 'guide'
  articleSlug: string
}) {
  trackEvent('lead_magnet_downloaded', {
    resource_name: resourceName,
    resource_type: resourceType,
    article_slug: articleSlug,
    value: 2
  })
}

/**
 * Trackea suscripción a newsletter
 */
export function trackNewsletterSubscribed({
  source,
  listName
}: {
  source: 'blog' | 'homepage' | 'modal' | 'footer'
  listName?: string
}) {
  trackEvent('newsletter_subscribed', {
    source,
    list_name: listName,
    value: 2
  })
}

/**
 * Trackea lectura completa de artículo de blog
 */
export function trackBlogArticleRead({
  articleSlug,
  articleTitle,
  category,
  readTime,
  scrollDepth
}: {
  articleSlug: string
  articleTitle: string
  category?: string
  readTime?: number // Segundos
  scrollDepth?: number // Porcentaje 0-100
}) {
  trackEvent('blog_article_read', {
    article_slug: articleSlug,
    article_title: articleTitle,
    category,
    read_time_seconds: readTime,
    scroll_depth: scrollDepth,
    value: scrollDepth && scrollDepth > 80 ? 1 : 0.5
  })
}

// ========================================
// TRACKING DE PAGEVIEWS
// ========================================

/**
 * Trackea pageviews en Next.js App Router
 */
export function trackPageView(url: string) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
      page_path: url,
    })
  }
}

// ========================================
// TRACKING DE FUNNELS
// ========================================

/**
 * Trackea progreso en un funnel multi-step
 */
export function trackFunnelStep({
  funnelName,
  stepNumber,
  stepName,
  isComplete
}: {
  funnelName: string
  stepNumber: number
  stepName: string
  isComplete: boolean
}) {
  trackEvent(`funnel_${funnelName}_step_${stepNumber}` as any, {
    funnel_name: funnelName,
    step_number: stepNumber,
    step_name: stepName,
    is_complete: isComplete
  })
}

/**
 * Funnels predefinidos para Itineramio
 */
export const FUNNELS = {
  TEST_TO_TRIAL: {
    name: 'test_to_trial',
    steps: [
      { number: 1, name: 'test_started' },
      { number: 2, name: 'test_completed' },
      { number: 3, name: 'email_captured' },
      { number: 4, name: 'trial_started' },
      { number: 5, name: 'property_created' },
    ]
  },
  TRIAL_TO_PAID: {
    name: 'trial_to_paid',
    steps: [
      { number: 1, name: 'trial_started' },
      { number: 2, name: 'property_created' },
      { number: 3, name: 'qr_generated' },
      { number: 4, name: 'manual_viewed' }, // Huésped usó el manual
      { number: 5, name: 'purchase_completed' },
    ]
  },
  BLOG_TO_LEAD: {
    name: 'blog_to_lead',
    steps: [
      { number: 1, name: 'blog_article_read' },
      { number: 2, name: 'lead_magnet_downloaded' },
      { number: 3, name: 'email_captured' },
      { number: 4, name: 'trial_started' },
    ]
  }
} as const

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Calcula y trackea tiempo en página (para engagement)
 */
export function setupTimeOnPageTracking() {
  if (typeof window === 'undefined') return

  const startTime = Date.now()

  // Trackear cuando el usuario cierra/sale de la página
  window.addEventListener('beforeunload', () => {
    const timeOnPage = Math.round((Date.now() - startTime) / 1000) // Segundos

    if ((window as any).gtag) {
      (window as any).gtag('event', 'page_engagement', {
        time_on_page: timeOnPage,
        page_path: window.location.pathname
      })
    }
  })
}

/**
 * Trackea scroll depth (útil para artículos de blog)
 */
export function setupScrollDepthTracking() {
  if (typeof window === 'undefined') return

  let maxScrollDepth = 0
  const depths = [25, 50, 75, 90, 100]
  const triggered = new Set<number>()

  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
    const scrollPercent = Math.round((scrollTop / scrollHeight) * 100)

    maxScrollDepth = Math.max(maxScrollDepth, scrollPercent)

    depths.forEach(depth => {
      if (scrollPercent >= depth && !triggered.has(depth)) {
        triggered.add(depth)

        if ((window as any).gtag) {
          (window as any).gtag('event', 'scroll_depth', {
            depth_percentage: depth,
            page_path: window.location.pathname
          })
        }
      }
    })
  }

  window.addEventListener('scroll', handleScroll, { passive: true })

  return () => window.removeEventListener('scroll', handleScroll)
}

// ========================================
// GA4 CONVERSION EVENTS
// ========================================

/**
 * Trackea registro de usuario (GA4 sign_up event - CONVERSION)
 */
export function trackSignUp({
  method = 'email',
  userId
}: {
  method?: 'email' | 'google' | 'apple'
  userId?: string
}) {
  trackEvent('sign_up', {
    method,
    user_id: userId
  })
}

/**
 * Trackea inicio de checkout (GA4 begin_checkout - CONVERSION)
 */
export function trackBeginCheckout({
  value,
  currency = 'EUR',
  items,
  coupon
}: {
  value: number
  currency?: string
  items: Array<{
    item_id: string
    item_name: string
    price: number
    quantity?: number
  }>
  coupon?: string
}) {
  trackEvent('begin_checkout', {
    currency,
    value,
    items: items.map(item => ({
      ...item,
      quantity: item.quantity || 1
    })),
    coupon
  })
}

/**
 * Trackea compra completada (GA4 purchase event - CONVERSION)
 */
export function trackPurchase({
  transactionId,
  value,
  currency = 'EUR',
  items,
  coupon,
  tax = 0
}: {
  transactionId: string
  value: number
  currency?: string
  items: Array<{
    item_id: string
    item_name: string
    price: number
    quantity?: number
    item_category?: string
  }>
  coupon?: string
  tax?: number
}) {
  trackEvent('purchase', {
    transaction_id: transactionId,
    value,
    currency,
    tax,
    items: items.map(item => ({
      ...item,
      quantity: item.quantity || 1
    })),
    coupon
  })
}

/**
 * Trackea generación de lead (GA4 generate_lead - CONVERSION)
 */
export function trackGenerateLead({
  value = 10,
  currency = 'EUR',
  source,
  leadMagnet
}: {
  value?: number
  currency?: string
  source: 'quiz' | 'blog' | 'landing' | 'popup' | 'recursos'
  leadMagnet?: string
}) {
  trackEvent('generate_lead', {
    currency,
    value,
    source,
    lead_magnet: leadMagnet
  })
}

/**
 * Trackea visualización de plan/producto (GA4 view_item)
 */
export function trackViewPlan({
  planId,
  planName,
  price,
  currency = 'EUR'
}: {
  planId: string
  planName: string
  price: number
  currency?: string
}) {
  trackEvent('view_item', {
    currency,
    value: price,
    items: [{
      item_id: planId,
      item_name: planName,
      price,
      quantity: 1,
      item_category: 'subscription'
    }]
  })
}

/**
 * Trackea añadir plan al carrito (GA4 add_to_cart)
 */
export function trackAddPlanToCart({
  planId,
  planName,
  price,
  currency = 'EUR',
  coupon
}: {
  planId: string
  planName: string
  price: number
  currency?: string
  coupon?: string
}) {
  trackEvent('add_to_cart', {
    currency,
    value: price,
    items: [{
      item_id: planId,
      item_name: planName,
      price,
      quantity: 1,
      item_category: 'subscription'
    }],
    coupon
  })
}

// ========================================
// CTA & CALCULATOR TRACKING
// ========================================

/**
 * Trackea clicks en CTAs principales (botones de conversión)
 */
export function trackCTAClicked({
  ctaId,
  ctaText,
  location,
  destination
}: {
  ctaId: string
  ctaText: string
  location: 'hero' | 'pricing' | 'footer' | 'navbar' | 'sidebar' | 'modal' | 'inline'
  destination: string
}) {
  trackEvent('cta_clicked', {
    cta_id: ctaId,
    cta_text: ctaText,
    cta_location: location,
    destination,
    value: location === 'hero' ? 2 : 1
  })
}

/**
 * Trackea uso de la calculadora de rentabilidad
 */
export function trackCalculatorUsed({
  zone,
  model,
  properties,
  result,
  margin,
  isChangingMoney
}: {
  zone: string
  model: string
  properties: number
  result: string
  margin: number
  isChangingMoney?: boolean
}) {
  trackEvent('calculator_used', {
    calc_zone: zone,
    calc_model: model,
    calc_properties: properties,
    calc_result: result,
    calc_margin: margin,
    calc_is_changing_money: isChangingMoney,
    value: 3
  })
}
