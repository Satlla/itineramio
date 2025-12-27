/**
 * Email Validation Utility
 * Validates emails and blocks disposable/temporary email domains
 */

// Lista de dominios de email temporal más comunes (Top 100)
const DISPOSABLE_EMAIL_DOMAINS = [
  '10minutemail.com',
  '10minutemail.net',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'mailinator.com',
  'mailtothis.com',
  'tempmail.com',
  'temp-mail.org',
  'temp-mail.io',
  'throwaway.email',
  'trashmail.com',
  'getnada.com',
  'mohmal.com',
  'emailondeck.com',
  'fakeinbox.com',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'cool.fr.nf',
  'jetable.fr.nf',
  'nospam.ze.tc',
  'nomail.xl.cx',
  'mega.zik.dj',
  'speed.1s.fr',
  'courriel.fr.nf',
  'moncourrier.fr.nf',
  'monemail.fr.nf',
  'monmail.fr.nf',
  'hide.biz.st',
  'mymail.infos.st',
  'discard.email',
  'discardmail.com',
  'discardmail.de',
  'spambox.us',
  'spam4.me',
  'grr.la',
  'sharklasers.com',
  'guerrillamailblock.com',
  'pokemail.net',
  'spam.la',
  'tmailinator.com',
  'spamgourmet.com',
  'jetable.org',
  'incognitomail.org',
  'mailcatch.com',
  'mailnesia.com',
  'maildrop.cc',
  'mintemail.com',
  'mytemp.email',
  'mytrashmail.com',
  'tempemail.net',
  'temp-mail.de',
  'tempinbox.com',
  'tempmailaddress.com',
  'tempmailo.com',
  'tempsky.com',
  'thankyou2010.com',
  'trash-mail.com',
  'trash2009.com',
  'trashymail.com',
  'tyldd.com',
  'uggsrock.com',
  'wegwerfemail.de',
  'wetrainbayarea.com',
  'anonymbox.com',
  'cuvox.de',
  'dacoolest.com',
  'dayrep.com',
  'dispostable.com',
  'einrot.com',
  'fleckens.hu',
  'gustr.com',
  'jourrapide.com',
  'rhyta.com',
  'superrito.com',
  'teleworm.us',
  'armyspy.com',
  'mailforspam.com',
  'mailfreeonline.com',
  'mailzi.ru',
  'nwldx.com',
  'rootfest.net',
  'tradermail.info',
  'rtrtr.com',
  'sharklasers.com',
  'spam4.me',
  '20minutemail.com',
  '2prong.com',
  '30minutemail.com',
  '33mail.com',
  '3d-painting.com',
  'bccto.me',
  'beefmilk.com',
  'binkmail.com',
  'bobmail.info',
  'bugmenot.com',
  'casualdx.com',
  'centermail.com',
  'chammy.info',
  'chogmail.com',
  'deadaddress.com',
  'disposeamail.com',
  'dodgeit.com',
  'dodgit.com',
  'e4ward.com',
  'email60.com',
  'emaildienst.de',
  'emailias.com',
  'emailmiser.com',
  'emailsensei.com',
  'emailtemporanea.com',
  'emailtemporanea.net',
  'emailtemporar.ro',
  'emailtemporario.com.br',
  'emailthe.net',
  'emailtmp.com',
  'emailwarden.com',
  'emailx.at.hm',
  'emailxfer.com',
  'emeil.in',
  'emeil.ir',
  'emz.net',
  'enterto.com',
  'ephemail.net',
  'explodemail.com',
  'filzmail.com',
  'fizmail.com',
  'frapmail.com',
  'get1mail.com',
  'getairmail.com',
  'getmails.eu'
]

interface EmailValidationResult {
  isValid: boolean
  error?: string
  domain?: string
}

/**
 * Valida formato básico del email usando regex
 */
export function isValidEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Extrae el dominio del email
 */
export function extractDomain(email: string): string {
  return email.split('@')[1]?.toLowerCase() || ''
}

/**
 * Verifica si el dominio es temporal/desechable
 */
export function isDisposableEmail(email: string): boolean {
  const domain = extractDomain(email)
  return DISPOSABLE_EMAIL_DOMAINS.includes(domain)
}

/**
 * Verifica si el dominio parece sospechoso
 * (dominio muy corto, caracteres extraños, etc.)
 */
export function isSuspiciousDomain(domain: string): boolean {
  // Dominios muy cortos (menos de 3 caracteres antes del TLD)
  const parts = domain.split('.')
  if (parts.length < 2) return true

  const domainName = parts[parts.length - 2]
  if (domainName.length < 3) return true

  // Contiene muchos números (más del 50%)
  const numberCount = (domainName.match(/\d/g) || []).length
  if (numberCount > domainName.length / 2) return true

  // Patrones comunes de temp mail
  const suspiciousPatterns = [
    /temp/i,
    /trash/i,
    /spam/i,
    /fake/i,
    /throw/i,
    /dispos/i,
    /guerrilla/i,
    /burner/i
  ]

  return suspiciousPatterns.some(pattern => pattern.test(domain))
}

/**
 * Lista de dominios confiables (whitelist)
 */
const TRUSTED_DOMAINS = [
  'gmail.com',
  'outlook.com',
  'hotmail.com',
  'yahoo.com',
  'icloud.com',
  'protonmail.com',
  'live.com',
  'msn.com',
  'aol.com',
  'zoho.com',
  'mail.com',
  'gmx.com',
  'yandex.com',
  'me.com',
  'mac.com'
]

/**
 * Verifica si el dominio es de confianza
 */
export function isTrustedDomain(email: string): boolean {
  const domain = extractDomain(email)
  return TRUSTED_DOMAINS.includes(domain)
}

/**
 * Validación completa del email
 * Retorna resultado con detalles del error si falla
 */
export function validateEmail(email: string): EmailValidationResult {
  // 1. Validar formato básico
  if (!isValidEmailFormat(email)) {
    return {
      isValid: false,
      error: 'Formato de email inválido'
    }
  }

  const domain = extractDomain(email)

  // 2. Si es dominio confiable, aprobar inmediatamente
  if (isTrustedDomain(email)) {
    return {
      isValid: true,
      domain
    }
  }

  // 3. Verificar si es email temporal
  if (isDisposableEmail(email)) {
    return {
      isValid: false,
      error: 'No se permiten emails temporales o desechables',
      domain
    }
  }

  // 4. Verificar patrones sospechosos
  if (isSuspiciousDomain(domain)) {
    return {
      isValid: false,
      error: 'El dominio del email parece sospechoso',
      domain
    }
  }

  // 5. Si pasa todas las validaciones, aprobar
  return {
    isValid: true,
    domain
  }
}

/**
 * Versión async para futuras integraciones con APIs de validación
 * (ej: AbstractAPI, EmailListVerify, etc.)
 */
export async function validateEmailAsync(email: string): Promise<EmailValidationResult> {
  // Por ahora solo ejecuta la validación síncrona
  // En el futuro aquí se puede llamar a una API externa para validación avanzada
  return validateEmail(email)
}
