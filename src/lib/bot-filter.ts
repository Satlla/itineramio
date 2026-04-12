/**
 * Bot & Crawler Detection
 *
 * Filtra visitas de bots, crawlers y el propio host
 * para que las métricas de visitas reflejen huéspedes reales.
 */

// Patrones de User-Agent de bots conocidos
const BOT_PATTERNS = [
  // Search engines
  /googlebot/i,
  /bingbot/i,
  /yandexbot/i,
  /baiduspider/i,
  /duckduckbot/i,
  /slurp/i,

  // Social media crawlers
  /facebookexternalhit/i,
  /twitterbot/i,
  /linkedinbot/i,
  /whatsapp/i,
  /telegrambot/i,
  /pinterestbot/i,
  /discordbot/i,

  // SEO & monitoring tools
  /semrushbot/i,
  /ahrefsbot/i,
  /mj12bot/i,
  /dotbot/i,
  /petalbot/i,
  /bytespider/i,

  // Generic bot patterns
  /bot\b/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /headless/i,
  /phantomjs/i,
  /puppeteer/i,
  /playwright/i,
  /selenium/i,

  // Monitoring & uptime
  /uptimerobot/i,
  /pingdom/i,
  /statuscake/i,
  /newrelicpinger/i,

  // Libraries & CLIs
  /curl\//i,
  /wget\//i,
  /python-requests/i,
  /go-http-client/i,
  /java\//i,
  /libwww/i,
  /httpx/i,
  /axios/i,
  /node-fetch/i,
]

/**
 * Detecta si un User-Agent pertenece a un bot o crawler
 */
export function isBot(userAgent: string): boolean {
  if (!userAgent || userAgent.trim() === '') return true
  return BOT_PATTERNS.some((pattern) => pattern.test(userAgent))
}

/**
 * Detecta si la visita es del propio host basándose en el referrer
 * (referrer viene del dashboard o panel de administración)
 */
export function isHostReferrer(referrer: string | null): boolean {
  if (!referrer) return false
  const hostPatterns = [
    '/properties/',
    '/dashboard',
    '/zones/',
    '/admin',
    '/gestion/',
    '/settings',
  ]
  return hostPatterns.some((p) => referrer.includes(p))
}

/**
 * Filtro completo: devuelve true si la visita debe ser DESCARTADA
 * (es un bot, es el host, o no tiene user-agent válido)
 */
export function shouldDiscardVisit(
  userAgent: string,
  referrer: string | null
): boolean {
  return isBot(userAgent) || isHostReferrer(referrer)
}
