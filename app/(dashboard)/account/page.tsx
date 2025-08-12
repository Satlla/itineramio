'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Camera, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Trash2, 
  Save,
  AlertTriangle,
  Eye,
  EyeOff,
  Bell,
  CreditCard
} from 'lucide-react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '../../../src/components/ui'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../src/providers/AuthProvider'

export default function AccountPage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Password for confirmation
  const [confirmationPassword, setConfirmationPassword] = useState('')

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // Load user data
    if (user) {
      const nameParts = user.name?.trim().split(' ') || []
      setFormData(prev => ({
        ...prev,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || ''
      }))
      setProfileImage(user.avatar || null)
    }
  }, [user])

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      setErrors({ image: 'Por favor selecciona una imagen válida' })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors({ image: 'La imagen debe ser menor a 5MB' })
      return
    }

    // Preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setProfileImage(reader.result as string)
    }
    reader.readAsDataURL(file)

    // TODO: Upload to server
  }

  const validateBasicForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email?.trim()) {
      newErrors.email = 'Email es requerido'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Email inválido'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {}

    if (!confirmationPassword) {
      newErrors.currentPassword = 'Debes ingresar tu contraseña actual'
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'Debes ingresar una nueva contraseña'
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'La contraseña debe tener al menos 8 caracteres'
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveBasicInfo = async () => {
    if (!validateBasicForm()) return

    // Check if email is changing
    const isEmailChanging = user && formData.email !== user.email

    // If email is changing and no password modal is showing, show it
    if (isEmailChanging && !showPasswordModal) {
      setShowPasswordModal(true)
      return
    }

    setLoading(true)
    try {
      const requestBody = {
        firstName: formData.firstName?.trim() || '',
        lastName: formData.lastName?.trim() || '',
        email: formData.email?.trim() || '',
        phone: formData.phone?.trim() || '',
        profileImage: profileImage || null
      }

      // Add password if changing email
      if (isEmailChanging && confirmationPassword) {
        requestBody.password = confirmationPassword
      }

      // Debug logging
      console.log('Sending update request:', requestBody)
      console.log('Form data state:', formData)
      console.log('Profile image state:', profileImage)

      const response = await fetch('/api/account/simple-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        const data = await response.json()
        console.log('Success response:', data)
        setShowSuccessToast(true)
        setTimeout(() => setShowSuccessToast(false), 3000)
        await refreshUser()
      } else {
        const data = await response.json().catch(() => ({ error: 'Error desconocido' }))
        console.log('Error response:', data)
        setErrors({ general: data.error || `Error ${response.status}: ${response.statusText}` })
      }
    } catch (error) {
      console.error('Request error:', error)
      setErrors({ general: 'Error de conexión: ' + (error instanceof Error ? error.message : 'Error desconocido') })
    } finally {
      setLoading(false)
    }
  }


  const handleEmailChangeRequest = async () => {
    if (!confirmationPassword) {
      setErrors({ general: 'Por favor, ingresa tu contraseña' })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/account/request-email-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newEmail: formData.email,
          password: confirmationPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Success - email sent
        setShowPasswordModal(false)
        setConfirmationPassword('')
        setShowSuccessToast(true)
        setTimeout(() => setShowSuccessToast(false), 5000)
        
        // Reset email to original value since change is pending
        if (user) {
          setFormData(prev => ({ ...prev, email: user.email }))
        }
        
        // Show info message
        setErrors({ 
          general: '✅ Se ha enviado un email de confirmación a tu dirección actual. Por favor, revisa tu bandeja de entrada para completar el cambio.' 
        })
      } else {
        setErrors({ general: data.error || 'Error al solicitar cambio de email' })
      }
    } catch (error) {
      console.error('Error requesting email change:', error)
      setErrors({ general: 'Error de conexión' })
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = () => {
    if (formData.newPassword) {
      setShowPasswordModal(true)
    }
  }

  const confirmPasswordChange = async () => {
    if (!validatePasswordForm()) return

    setLoading(true)
    try {
      const response = await fetch('/api/account/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: confirmationPassword,
          newPassword: formData.newPassword
        })
      })

      if (response.ok) {
        const data = await response.json()
        setShowSuccessToast(true)
        setTimeout(() => setShowSuccessToast(false), 3000)
        setShowPasswordModal(false)
        setConfirmationPassword('')
        setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }))
      } else {
        const data = await response.json()
        setErrors({ general: data.error || 'Error al cambiar contraseña' })
      }
    } catch (error) {
      setErrors({ general: 'Error de conexión' })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirmationPassword) {
      setErrors({ delete: 'Debes ingresar tu contraseña para eliminar la cuenta' })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: confirmationPassword })
      })

      if (response.ok) {
        // Logout and redirect
        await fetch('/api/auth/logout', { method: 'POST' })
        router.push('/')
      } else {
        const data = await response.json()
        setErrors({ delete: data.error || 'Error al eliminar cuenta' })
      }
    } catch (error) {
      setErrors({ delete: 'Error de conexión' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Configuración de Cuenta</h1>

          {/* Profile Picture */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Foto de Perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center overflow-hidden">
                    {profileImage ? (
                      <img 
                        src={profileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-white" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-50">
                    <Camera className="w-4 h-4 text-gray-600" />
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Sube una foto de perfil. Máximo 5MB.
                  </p>
                  {errors.image && (
                    <p className="text-sm text-red-500 mt-1">{errors.image}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre
                  </label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido
                  </label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Tu apellido"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                    placeholder="tu@email.com"
                    error={!!errors.email}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="pl-10"
                    placeholder="+34 600 000 000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Cambiar Contraseña</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="pl-10 pr-10"
                    placeholder="Mínimo 8 caracteres"
                    error={!!errors.newPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-sm text-red-500 mt-1">{errors.newPassword}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="pl-10"
                    placeholder="Repite la contraseña"
                    error={!!errors.confirmPassword}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
                )}
              </div>
              
              <div className="flex justify-end">
                <Button
                  onClick={handleChangePassword}
                  disabled={loading || !formData.newPassword}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Cambiar Contraseña
                </Button>
              </div>
            </CardContent>
          </Card>


          {/* Save Button */}
          <div className="flex justify-end mb-8">
            <Button
              onClick={handleSaveBasicInfo}
              disabled={loading}
              className="bg-violet-600 hover:bg-violet-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>

          {/* Notifications Settings */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Configuración de Notificaciones</h3>
                  <p className="text-sm text-gray-600">
                    Gestiona cómo y cuándo quieres recibir notificaciones por email
                  </p>
                </div>
                <Button
                  onClick={() => router.push('/account/notifications')}
                  variant="outline"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Configurar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Billing Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Facturación y Suscripción
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Datos de Facturación</h3>
                  <p className="text-sm text-gray-600">
                    Gestiona tu plan, datos fiscales y programa de afiliados
                  </p>
                </div>
                <Button
                  onClick={() => router.push('/account/billing')}
                  variant="outline"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Gestionar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Delete Account */}
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Eliminar Cuenta</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Una vez que elimines tu cuenta, no hay vuelta atrás. Esta acción es permanente e irreversible.
                  </p>
                  <div className="p-4 bg-red-100 border border-red-200 rounded-lg mb-4">
                    <p className="text-sm text-red-800 font-medium mb-2">
                      ⚠️ ADVERTENCIA: Al eliminar tu cuenta:
                    </p>
                    <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                      <li>Se eliminarán TODAS tus propiedades</li>
                      <li>Se eliminarán TODOS los manuales y zonas creadas</li>
                      <li>Se perderán TODAS las imágenes y archivos subidos</li>
                      <li>NO podrás recuperar ningún dato</li>
                      <li>Esta acción es IRREVERSIBLE</li>
                    </ul>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteModal(true)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar Cuenta
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {user && formData.email !== user.email ? '🔐 Verificación de Seguridad' : 'Cambiar Contraseña'}
              </h2>
              {user && formData.email !== user.email ? (
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-amber-700">
                        <strong>Cambio de email detectado</strong>
                      </p>
                      <p className="text-sm text-amber-600 mt-1">
                        Para tu seguridad, necesitamos verificar tu identidad antes de cambiar tu email.
                      </p>
                      <div className="mt-2 text-xs text-amber-600">
                        <p>• Se enviará un email de confirmación a tu dirección actual</p>
                        <p>• Deberás confirmar el cambio desde ese email</p>
                        <p>• Tu cuenta estará protegida durante todo el proceso</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 mb-6">
                  Introduce tu contraseña actual para confirmar el cambio.
                </p>
              )}
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña Actual
                </label>
                <Input
                  type="password"
                  value={confirmationPassword}
                  onChange={(e) => setConfirmationPassword(e.target.value)}
                  placeholder="Tu contraseña actual"
                />
                {errors.currentPassword && (
                  <p className="text-sm text-red-500 mt-1">{errors.currentPassword}</p>
                )}
                {errors.general && (
                  <p className="text-sm text-red-500 mt-1">{errors.general}</p>
                )}
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPasswordModal(false)
                    setConfirmationPassword('')
                    setErrors({})
                    // Reset email if it was being changed
                    if (user && formData.email !== user.email) {
                      setFormData(prev => ({ ...prev, email: user.email }))
                    }
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={user && formData.email !== user.email ? handleSaveBasicInfo : confirmPasswordChange}
                  disabled={loading || !confirmationPassword}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? 'Procesando...' : (user && formData.email !== user.email ? 'Confirmar Cambio' : 'Cambiar Contraseña')}
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                ¿Estás absolutamente seguro?
              </h2>
              <p className="text-gray-600 mb-6">
                Esta acción eliminará permanentemente tu cuenta y todos tus datos. 
                No podrás recuperar nada después de esto.
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Escribe tu contraseña para confirmar
                </label>
                <Input
                  type="password"
                  value={confirmationPassword}
                  onChange={(e) => setConfirmationPassword(e.target.value)}
                  placeholder="Tu contraseña"
                />
                {errors.delete && (
                  <p className="text-sm text-red-500 mt-1">{errors.delete}</p>
                )}
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setConfirmationPassword('')
                    setErrors({})
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={loading || !confirmationPassword}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {loading ? 'Eliminando...' : 'Sí, eliminar mi cuenta'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Success Toast */}
        {showSuccessToast && (
          <div className="fixed top-4 right-4 z-50">
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2"
            >
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <span>Perfil actualizado correctamente</span>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}