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
  CreditCard,
  Gift
} from 'lucide-react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '../../../src/components/ui'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../src/providers/AuthProvider'
import { useTranslation } from 'react-i18next'

export default function AccountPage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const { t } = useTranslation('account')
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

    // Clear previous errors
    setErrors(prev => ({ ...prev, image: '' }))

    // Validate file
    if (!file.type.startsWith('image/')) {
      setErrors({ image: t('errors.invalidImage') })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors({ image: t('errors.imageTooLarge') })
      return
    }

    setLoading(true)

    try {
      // Upload to server
      const formData = new FormData()
      formData.append('file', file)

      console.log('Making upload request to /api/upload')
      console.log('Current cookies:', document.cookie)
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      console.log('Upload response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Upload response not ok:', errorText)
        throw new Error(`Upload failed: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log('Upload response data:', result)

      if (result.success) {
        // Set the uploaded image URL
        setProfileImage(result.url)
        console.log('Profile image uploaded successfully:', result.url)
      } else if (result.duplicate && result.existingMedia?.url) {
        // Handle duplicate image - use existing media
        setProfileImage(result.existingMedia.url)
        console.log('Using existing image from media library:', result.existingMedia.url)
      } else {
        console.error('Upload result not successful:', result)
        throw new Error(result.error || result.message || 'Upload failed')
      }
    } catch (error) {
      console.error('Error uploading profile image:', error)
      setErrors({ image: t('errors.uploadError') })
    } finally {
      setLoading(false)
    }
  }

  const validateBasicForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email?.trim()) {
      newErrors.email = t('errors.emailRequired')
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = t('errors.emailInvalid')
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {}

    if (!confirmationPassword) {
      newErrors.currentPassword = t('errors.currentPasswordRequired')
    }

    if (!formData.newPassword) {
      newErrors.newPassword = t('errors.newPasswordRequired')
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = t('errors.passwordMinLength')
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = t('errors.passwordMismatch')
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
      // Prepare request body for old endpoint (not used anymore)
      const requestBodyOld = {
        firstName: formData.firstName?.trim() || '',
        lastName: formData.lastName?.trim() || '',
        email: formData.email?.trim() || '',
        phone: formData.phone?.trim() || '',
        profileImage: profileImage || null,
        ...(isEmailChanging && confirmationPassword && { password: confirmationPassword })
      }

      // Debug logging (old endpoint not used)
      // console.log('Sending update request:', requestBodyOld)
      console.log('Form data state:', formData)
      console.log('Profile image state:', profileImage)

      const directBody = {
        email: user?.email || '', // Current email for auth
        password: isEmailChanging ? confirmationPassword : undefined,
        firstName: formData.firstName?.trim() || '',
        lastName: formData.lastName?.trim() || '',
        phone: formData.phone?.trim() || '',
        profileImage: profileImage || null,
        newEmail: isEmailChanging ? formData.email?.trim() : undefined
      }

      const response = await fetch('/api/update-user-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(directBody)
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        const data = await response.json()
        console.log('Success response:', data)
        setShowSuccessToast(true)
        setTimeout(() => setShowSuccessToast(false), 3000)
        // Don't refresh user, just update form data and profile image
        if (data.user) {
          const nameParts = data.user.name?.trim().split(' ') || []
          setFormData(prev => ({
            ...prev,
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            email: data.user.email || '',
            phone: data.user.phone || ''
          }))
          // Update profile image from response
          if (data.user.avatar !== undefined) {
            setProfileImage(data.user.avatar)
          }
        }
        // Also refresh the user context
        await refreshUser()
      } else {
        const data = await response.json().catch(() => ({ error: t('errors.unknownError') }))
        console.log('Error response:', data)

        // If unauthorized, redirect to login
        if (response.status === 401) {
          window.location.href = '/login'
          return
        }

        setErrors({ general: data.error || `Error ${response.status}: ${response.statusText}` })
      }
    } catch (error) {
      console.error('Request error:', error)
      setErrors({ general: t('errors.connectionError') + ': ' + (error instanceof Error ? error.message : t('errors.unknownError')) })
    } finally {
      setLoading(false)
    }
  }


  const handleEmailChangeRequest = async () => {
    if (!confirmationPassword) {
      setErrors({ general: t('errors.enterPassword') })
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
          general: t('errors.emailChangeSent')
        })
      } else {
        setErrors({ general: data.error || t('errors.emailChangeRequestError') })
      }
    } catch (error) {
      console.error('Error requesting email change:', error)
      setErrors({ general: t('errors.connectionError') })
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
          email: user?.email || formData.email,
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
        setErrors({ general: data.error || t('errors.changePasswordError') })
      }
    } catch (error) {
      setErrors({ general: t('errors.connectionError') })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirmationPassword) {
      setErrors({ delete: t('errors.deletePasswordRequired') })
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
        setErrors({ delete: data.error || t('errors.deleteError') })
      }
    } catch (error) {
      setErrors({ delete: t('errors.connectionError') })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" style={{ paddingTop: 'calc(4rem + env(safe-area-inset-top, 0px))' }}>
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('title')}</h1>

          {/* Profile Picture */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t('profile.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center overflow-hidden">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt={t('profile.altText')}
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
                    {t('profile.uploadHint')}
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
              <CardTitle>{t('personalInfo.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('personalInfo.firstName')}
                  </label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder={t('personalInfo.firstNamePlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('personalInfo.lastName')}
                  </label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder={t('personalInfo.lastNamePlaceholder')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('personalInfo.email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                    placeholder={t('personalInfo.emailPlaceholder')}
                    error={!!errors.email}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('personalInfo.phone')}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="pl-10"
                    placeholder={t('personalInfo.phonePlaceholder')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t('password.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('password.newPassword')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="pl-10 pr-10"
                    placeholder={t('password.newPasswordPlaceholder')}
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
                  {t('password.confirmPassword')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="pl-10"
                    placeholder={t('password.confirmPasswordPlaceholder')}
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
                  {t('password.changeButton')}
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
              {loading ? t('save.saving') : t('save.button')}
            </Button>
          </div>

          {/* Notifications Settings */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t('notifications.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">{t('notifications.settingsTitle')}</h3>
                  <p className="text-sm text-gray-600">
                    {t('notifications.settingsDescription')}
                  </p>
                </div>
                <Button
                  onClick={() => router.push('/account/notifications')}
                  variant="outline"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  {t('notifications.configureButton')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Billing Settings */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                {t('billing.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">{t('billing.cardTitle')}</h3>
                  <p className="text-sm text-gray-600">
                    {t('billing.cardDescription')}
                  </p>
                </div>
                <Button
                  onClick={() => router.push('/account/billing')}
                  variant="outline"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {t('billing.manageButton')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Referrals Program */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gift className="w-5 h-5 mr-2 text-violet-600" />
                {t('referrals.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">{t('referrals.cardTitle')}</h3>
                  <p className="text-sm text-gray-600">
                    {t('referrals.cardDescription')}
                  </p>
                </div>
                <Button
                  onClick={() => router.push('/account/referrals')}
                  variant="outline"
                  className="border-violet-200 text-violet-600 hover:bg-violet-50"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  {t('referrals.viewButton')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Delete Account */}
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">{t('deleteAccount.title')}</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {t('deleteAccount.description')}
                  </p>
                  <div className="p-4 bg-red-100 border border-red-200 rounded-lg mb-4">
                    <p className="text-sm text-red-800 font-medium mb-2">
                      {t('deleteAccount.warning')}
                    </p>
                    <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                      <li>{t('deleteAccount.warningItems.properties')}</li>
                      <li>{t('deleteAccount.warningItems.manuals')}</li>
                      <li>{t('deleteAccount.warningItems.files')}</li>
                      <li>{t('deleteAccount.warningItems.noRecovery')}</li>
                      <li>{t('deleteAccount.warningItems.irreversible')}</li>
                    </ul>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteModal(true)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t('deleteAccount.button')}
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
                {user && formData.email !== user.email ? t('passwordModal.securityVerification') : t('passwordModal.changePassword')}
              </h2>
              {user && formData.email !== user.email ? (
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-amber-700">
                        <strong>{t('passwordModal.emailChangeDetected')}</strong>
                      </p>
                      <p className="text-sm text-amber-600 mt-1">
                        {t('passwordModal.emailChangeDescription')}
                      </p>
                      <div className="mt-2 text-xs text-amber-600">
                        <p>* {t('passwordModal.emailChangeSteps.step1')}</p>
                        <p>* {t('passwordModal.emailChangeSteps.step2')}</p>
                        <p>* {t('passwordModal.emailChangeSteps.step3')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 mb-6">
                  {t('passwordModal.enterCurrentPassword')}
                </p>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('password.currentPassword')}
                </label>
                <Input
                  type="password"
                  value={confirmationPassword}
                  onChange={(e) => setConfirmationPassword(e.target.value)}
                  placeholder={t('password.currentPasswordPlaceholder')}
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
                  {t('passwordModal.cancelButton')}
                </Button>
                <Button
                  onClick={user && formData.email !== user.email ? handleSaveBasicInfo : confirmPasswordChange}
                  disabled={loading || !confirmationPassword}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? t('passwordModal.processing') : (user && formData.email !== user.email ? t('passwordModal.confirmButton') : t('password.changeButton'))}
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
                {t('deleteAccount.modal.title')}
              </h2>
              <p className="text-gray-600 mb-6">
                {t('deleteAccount.modal.description')}
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('deleteAccount.modal.passwordLabel')}
                </label>
                <Input
                  type="password"
                  value={confirmationPassword}
                  onChange={(e) => setConfirmationPassword(e.target.value)}
                  placeholder={t('deleteAccount.modal.passwordPlaceholder')}
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
                  {t('deleteAccount.modal.cancelButton')}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={loading || !confirmationPassword}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {loading ? t('deleteAccount.modal.deleting') : t('deleteAccount.modal.confirmButton')}
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
              <span>{t('successToast')}</span>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
