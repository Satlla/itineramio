'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  User,
  Building2,
  MapPin,
  FileText,
  Save,
  AlertCircle,
  Briefcase,
  Mail,
  Phone as PhoneIcon
} from 'lucide-react'
import { toast } from 'react-hot-toast'

type EntityType = 'particular' | 'autonomo' | 'empresa'

interface BillingInfo {
  entityType: EntityType
  email: string
  phone?: string
  // Company fields
  companyName?: string
  cif?: string
  // Self-employed fields
  tradeName?: string
  nif?: string
  // Individual fields
  firstName?: string
  lastName?: string
  dni?: string
  // Common address fields
  address?: string
  city?: string
  postalCode?: string
  province?: string
  country?: string
}

interface ValidationErrors {
  [key: string]: string
}

interface BillingDataModalProps {
  isOpen: boolean
  onClose: () => void
  onSaveSuccess: () => void
}

// Validación de DNI español
const validateDNI = (dni: string): { valid: boolean; error?: string } => {
  const dniRegex = /^[0-9]{8}[A-Z]$/i
  if (!dniRegex.test(dni)) {
    return { valid: false, error: 'Formato incorrecto. Debe ser 8 números + letra (ej: 12345678Z)' }
  }

  const letters = 'TRWAGMYFPDXBNJZSQVHLCKE'
  const number = parseInt(dni.substring(0, 8), 10)
  const letter = dni.charAt(8).toUpperCase()
  const expectedLetter = letters[number % 23]

  if (letter !== expectedLetter) {
    return { valid: false, error: `La letra correcta debería ser ${expectedLetter}` }
  }

  return { valid: true }
}

// Validación de NIE español
const validateNIE = (nie: string): { valid: boolean; error?: string } => {
  const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/i
  if (!nieRegex.test(nie)) {
    return { valid: false, error: 'Formato incorrecto. Debe ser X/Y/Z + 7 números + letra' }
  }

  const letters = 'TRWAGMYFPDXBNJZSQVHLCKE'
  let nieNumber = nie.substring(0, 8)
  nieNumber = nieNumber.replace(/^X/, '0').replace(/^Y/, '1').replace(/^Z/, '2')

  const number = parseInt(nieNumber, 10)
  const letter = nie.charAt(8).toUpperCase()
  const expectedLetter = letters[number % 23]

  if (letter !== expectedLetter) {
    return { valid: false, error: `La letra correcta debería ser ${expectedLetter}` }
  }

  return { valid: true }
}

// Validación de CIF español
const validateCIF = (cif: string): { valid: boolean; error?: string } => {
  const cifRegex = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/i
  if (!cifRegex.test(cif)) {
    return { valid: false, error: 'Formato incorrecto. Debe comenzar con letra (A-W) + 7 números + dígito/letra' }
  }
  return { valid: true }
}

export default function BillingDataModal({ isOpen, onClose, onSaveSuccess }: BillingDataModalProps) {
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    entityType: 'particular',
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    dni: '',
    address: '',
    city: '',
    postalCode: '',
    province: '',
    country: 'España'
  })
  const [saving, setSaving] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

  // Fetch existing billing data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchBillingData()
    }
  }, [isOpen])

  const fetchBillingData = async () => {
    try {
      const response = await fetch('/api/user/billing-info', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        if (data.billingInfo) {
          // Map old structure to new
          const info = data.billingInfo
          setBillingInfo({
            entityType: info.entityType === 'empresa' ? 'empresa'
                      : info.entityType === 'autonomo' ? 'autonomo'
                      : 'particular',
            email: info.email || '',
            phone: info.phone || '',
            // Company
            companyName: info.companyName || '',
            cif: info.companyTaxId || info.cif || '',
            // Self-employed
            tradeName: info.tradeName || '',
            nif: info.taxId || info.nif || '',
            // Individual
            firstName: info.firstName || '',
            lastName: info.lastName || '',
            dni: info.nationalId || info.dni || '',
            // Address
            address: info.billingAddress || info.address || '',
            city: info.billingCity || info.city || '',
            postalCode: info.billingPostalCode || info.postalCode || '',
            province: info.province || '',
            country: info.billingCountry || info.country || 'España'
          })
        }
      }
    } catch (error) {
      console.error('Error fetching billing data:', error)
    }
  }

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}

    // Email validation
    if (!billingInfo.email || !billingInfo.email.includes('@')) {
      errors.email = 'Email válido es obligatorio'
    }

    // Entity-specific validation
    if (billingInfo.entityType === 'empresa') {
      if (!billingInfo.companyName || billingInfo.companyName.trim().length === 0) {
        errors.companyName = 'Razón social es obligatoria'
      }
      if (!billingInfo.cif) {
        errors.cif = 'CIF es obligatorio'
      } else {
        const cifValidation = validateCIF(billingInfo.cif)
        if (!cifValidation.valid) {
          errors.cif = cifValidation.error || 'CIF inválido'
        }
      }
    } else if (billingInfo.entityType === 'autonomo') {
      if (!billingInfo.tradeName || billingInfo.tradeName.trim().length === 0) {
        errors.tradeName = 'Nombre comercial es obligatorio'
      }
      if (!billingInfo.nif) {
        errors.nif = 'NIF es obligatorio'
      } else {
        const validation = billingInfo.nif.match(/^[XYZ]/) ? validateNIE(billingInfo.nif) : validateDNI(billingInfo.nif)
        if (!validation.valid) {
          errors.nif = validation.error || 'NIF/NIE inválido'
        }
      }
    } else { // particular
      if (!billingInfo.firstName || billingInfo.firstName.trim().length === 0) {
        errors.firstName = 'Nombre es obligatorio'
      }
      if (!billingInfo.lastName || billingInfo.lastName.trim().length === 0) {
        errors.lastName = 'Apellidos son obligatorios'
      }
      if (!billingInfo.dni) {
        errors.dni = 'DNI/NIE es obligatorio'
      } else {
        const validation = billingInfo.dni.match(/^[XYZ]/) ? validateNIE(billingInfo.dni) : validateDNI(billingInfo.dni)
        if (!validation.valid) {
          errors.dni = validation.error || 'DNI/NIE inválido'
        }
      }
    }

    // Common fields
    if (!billingInfo.address || billingInfo.address.trim().length === 0) {
      errors.address = 'Dirección es obligatoria'
    }
    if (!billingInfo.city || billingInfo.city.trim().length === 0) {
      errors.city = 'Ciudad es obligatoria'
    }
    if (!billingInfo.postalCode || billingInfo.postalCode.trim().length === 0) {
      errors.postalCode = 'Código postal es obligatorio'
    }
    if (!billingInfo.country || billingInfo.country.trim().length === 0) {
      errors.country = 'País es obligatorio'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Por favor corrige los errores señalados')
      return
    }

    try {
      setSaving(true)
      setValidationErrors({})

      // Prepare payload matching API expectations
      const payload: any = {
        entityType: billingInfo.entityType,
        email: billingInfo.email,
        phone: billingInfo.phone,
        address: billingInfo.address,
        city: billingInfo.city,
        postalCode: billingInfo.postalCode,
        province: billingInfo.province,
        country: billingInfo.country
      }

      if (billingInfo.entityType === 'empresa') {
        payload.companyName = billingInfo.companyName
        payload.companyTaxId = billingInfo.cif
      } else if (billingInfo.entityType === 'autonomo') {
        payload.tradeName = billingInfo.tradeName
        payload.taxId = billingInfo.nif
      } else {
        payload.firstName = billingInfo.firstName
        payload.lastName = billingInfo.lastName
        payload.nationalId = billingInfo.dni
      }

      const response = await fetch('/api/user/billing-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        toast.success('✅ Datos guardados correctamente')
        onSaveSuccess()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al guardar los datos')
      }
    } catch (error) {
      console.error('Error saving billing info:', error)
      toast.error('Error al guardar los datos')
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: keyof BillingInfo, value: string) => {
    setBillingInfo({ ...billingInfo, [field]: value })
    // Clear error for this field when user types
    if (validationErrors[field]) {
      const { [field]: _, ...rest } = validationErrors
      setValidationErrors(rest as ValidationErrors)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-[95vw] sm:max-w-[90vw] sm:max-w-[90vw] sm:max-w-sm md:max-w-md md:max-w-lg md:max-w-xl md:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-3 sm:px-4 md:px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <div>
                  <h2 className="text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl font-bold text-gray-900">Datos de Facturación</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Necesitamos estos datos para emitir facturas válidas
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Form */}
              <div className="p-3 sm:p-4 md:p-6 space-y-6">
                {/* Tipo de entidad */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    ¿Quién eres? *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setBillingInfo({ ...billingInfo, entityType: 'particular' })
                        setValidationErrors({})
                      }}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        billingInfo.entityType === 'particular'
                          ? 'border-violet-600 bg-violet-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <User className="w-6 h-6 mx-auto mb-2 text-violet-600" />
                      <div className="text-sm font-medium">Particular</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBillingInfo({ ...billingInfo, entityType: 'autonomo' })
                        setValidationErrors({})
                      }}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        billingInfo.entityType === 'autonomo'
                          ? 'border-violet-600 bg-violet-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Briefcase className="w-6 h-6 mx-auto mb-2 text-violet-600" />
                      <div className="text-sm font-medium">Autónomo</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBillingInfo({ ...billingInfo, entityType: 'empresa' })
                        setValidationErrors({})
                      }}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        billingInfo.entityType === 'empresa'
                          ? 'border-violet-600 bg-violet-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Building2 className="w-6 h-6 mx-auto mb-2 text-violet-600" />
                      <div className="text-sm font-medium">Empresa</div>
                    </button>
                  </div>
                </div>

                {/* Campos específicos por tipo de entidad */}
                {billingInfo.entityType === 'particular' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nombre *
                        </label>
                        <input
                          type="text"
                          value={billingInfo.firstName || ''}
                          onChange={(e) => updateField('firstName', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
                            validationErrors.firstName ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Juan"
                        />
                        {validationErrors.firstName && (
                          <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {validationErrors.firstName}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Apellidos *
                        </label>
                        <input
                          type="text"
                          value={billingInfo.lastName || ''}
                          onChange={(e) => updateField('lastName', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
                            validationErrors.lastName ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Pérez García"
                        />
                        {validationErrors.lastName && (
                          <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {validationErrors.lastName}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        DNI/NIE *
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={billingInfo.dni || ''}
                          onChange={(e) => updateField('dni', e.target.value.toUpperCase())}
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
                            validationErrors.dni ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="12345678Z o X1234567Z"
                        />
                      </div>
                      {validationErrors.dni && (
                        <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {validationErrors.dni}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {billingInfo.entityType === 'autonomo' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nombre Comercial *
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={billingInfo.tradeName || ''}
                          onChange={(e) => updateField('tradeName', e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
                            validationErrors.tradeName ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Mi Negocio"
                        />
                      </div>
                      {validationErrors.tradeName && (
                        <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {validationErrors.tradeName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        NIF *
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={billingInfo.nif || ''}
                          onChange={(e) => updateField('nif', e.target.value.toUpperCase())}
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
                            validationErrors.nif ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="12345678Z"
                        />
                      </div>
                      {validationErrors.nif && (
                        <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {validationErrors.nif}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {billingInfo.entityType === 'empresa' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Razón Social *
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={billingInfo.companyName || ''}
                          onChange={(e) => updateField('companyName', e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
                            validationErrors.companyName ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Mi Empresa S.L."
                        />
                      </div>
                      {validationErrors.companyName && (
                        <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {validationErrors.companyName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        CIF *
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={billingInfo.cif || ''}
                          onChange={(e) => updateField('cif', e.target.value.toUpperCase())}
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
                            validationErrors.cif ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="B12345678"
                        />
                      </div>
                      {validationErrors.cif && (
                        <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {validationErrors.cif}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Campos comunes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={billingInfo.email || ''}
                      onChange={(e) => updateField('email', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
                        validationErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                  {validationErrors.email && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={billingInfo.phone || ''}
                      onChange={(e) => updateField('phone', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      placeholder="+34 600 000 000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Dirección *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={billingInfo.address || ''}
                      onChange={(e) => updateField('address', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
                        validationErrors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Calle Principal 123, 2º A"
                    />
                  </div>
                  {validationErrors.address && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.address}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      value={billingInfo.city || ''}
                      onChange={(e) => updateField('city', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
                        validationErrors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Madrid"
                    />
                    {validationErrors.city && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {validationErrors.city}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Código Postal *
                    </label>
                    <input
                      type="text"
                      value={billingInfo.postalCode || ''}
                      onChange={(e) => updateField('postalCode', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
                        validationErrors.postalCode ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="28001"
                    />
                    {validationErrors.postalCode && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {validationErrors.postalCode}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    País *
                  </label>
                  <input
                    type="text"
                    value={billingInfo.country || ''}
                    onChange={(e) => updateField('country', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
                      validationErrors.country ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="España"
                  />
                  {validationErrors.country && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.country}
                    </p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-3 sm:px-4 md:px-6 py-4 flex gap-3 rounded-b-2xl">
                <button
                  onClick={onClose}
                  className="flex-1 px-3 sm:px-4 md:px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-3 sm:px-4 md:px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Guardar y Continuar
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
