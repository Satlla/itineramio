/**
 * VeriFactu Module — Barrel Export
 * Centralizes all VeriFactu-related functionality.
 */

export {
  computeRegistroAltaHash,
  computeRegistroAnulacionHash,
  validateHashChain,
  formatDateVF,
  formatAmountVF,
  generateTimestamp,
  type RegistroAltaHashInput,
  type RegistroAnulacionHashInput,
  type HashChainEntry,
} from './hash'

export {
  generateVerifactuQR,
  generateVerifactuQRSvg,
  getVerifactuQRUrl,
  type VerifactuQRInput,
} from './qr'

export {
  validateNIF,
  validateNIE,
  validateCIF,
  validateTaxId,
  normalizeTaxId,
} from './nif-validation'

export {
  AEAT_INVOICE_TYPES,
  TAX_REGIME_KEYS,
  resolveAEATInvoiceType,
  getDefaultTaxRegimeKey,
} from './invoice-types'

export {
  generateRegistroAltaXml,
  generateRegistroAnulacionXml,
  generateSOAPEnvelope,
  type RegistroAltaData,
  type RegistroAnulacionData,
} from './xml'

export {
  verifactiCreateInvoice,
  verifactiGetStatus,
  verifactiCancelInvoice,
  mapVerifactiStatus,
  buildVerifactiRequest,
  type VerifactiCreateRequest,
  type VerifactiCreateResponse,
  type VerifactiStatusResponse,
  type VerifactiLineItem,
} from './client'
