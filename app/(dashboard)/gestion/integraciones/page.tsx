'use client'

import { formatCurrency } from '@/lib/format'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Button, Card, CardContent, Badge } from '@/components/ui'
import {
  Mail,
  Link2,
  Link2Off,
  RefreshCw,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Clock,
  Building2,
  ArrowRight,
  ArrowLeft,
  Inbox,
  Check,
  Sparkles,
  Plus,
  User,
  Building,
  Settings,
  ChevronDown
} from 'lucide-react'

// ============ TYPES ============

interface GmailIntegration {
  id: string
  email: string
  isActive: boolean
  lastSyncAt: string | null
  syncErrors: number
  connectedAt: string
}

interface GmailStats {
  total: number
  processed: number
  pending: number
  errors: number
}

interface EmailDetail {
  id: string
  confirmationCode: string | null
  guestName: string | null
  checkIn: string | null
  checkOut: string | null
  nights: number | null
  adults: number | null
  children: number | null
  babies: number | null
  cleaningFee: number | null
  roomTotal: number | null
  hostEarnings: number | null
  propertyName: string | null
  subject: string
  emailType: string
  receivedAt: string
}

interface DetectedProperty {
  name: string
  emailCount: number
  emailIds: string[]
  emails: EmailDetail[]
  autoMatch: {
    configId: string
    propertyId: string
    propertyName: string
    confidence: number
  } | null
  suggestions: Array<{
    configId: string
    propertyId: string
    propertyName: string
    confidence: number
    matchType: string
  }>
}

interface AvailableProperty {
  id: string
  name: string
  hasConfig: boolean
  configId: string | null
}

interface DetectionSummary {
  totalEmails: number
  autoMatchedEmails: number
  needsReviewEmails: number
  propertiesDetected: number
  propertiesConfigured: number
}

interface Owner {
  id: string
  type: 'PERSONA_FISICA' | 'EMPRESA'
  firstName: string | null
  lastName: string | null
  companyName: string | null
  nif: string | null
  cif: string | null
  email: string
}

// Property being created in wizard
interface NewPropertyConfig {
  emailPropertyName: string
  displayName: string
  propertyName: string
  city: string
  ownerId: string
  commissionPreset: '15' | '20' | 'custom'
  commissionValue: number
  showAdvanced: boolean
  // Advanced options
  incomeReceiver: 'OWNER' | 'MANAGER'
  commissionType: string
  commissionVat: number
  cleaningType: string
  cleaningValue: number
  cleaningFeeRecipient: 'OWNER' | 'MANAGER' | 'SPLIT'
  // Status
  configured: boolean
  configId?: string
}

type FlowStep = 'connect' | 'summary' | 'review' | 'wizard' | 'confirmation'

// ============ MAIN COMPONENT ============

export default function IntegracionesPage() {
  const searchParams = useSearchParams()
  const { t } = useTranslation('gestion')

  // Connection state
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [connected, setConnected] = useState(false)
  const [integration, setIntegration] = useState<GmailIntegration | null>(null)
  const [stats, setStats] = useState<GmailStats | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Detection state
  const [detectionSummary, setDetectionSummary] = useState<DetectionSummary | null>(null)
  const [detectedProperties, setDetectedProperties] = useState<DetectedProperty[]>([])
  const [availableProperties, setAvailableProperties] = useState<AvailableProperty[]>([])
  const [owners, setOwners] = useState<Owner[]>([])

  // Flow state
  const [flowStep, setFlowStep] = useState<FlowStep>('connect')
  const [newProperties, setNewProperties] = useState<NewPropertyConfig[]>([])
  const [currentWizardIndex, setCurrentWizardIndex] = useState(0)
  const [wizardStep, setWizardStep] = useState<'name' | 'owner' | 'commission'>('name')

  // Owner creation inline
  const [showOwnerForm, setShowOwnerForm] = useState(false)
  const [newOwner, setNewOwner] = useState({
    type: 'PERSONA_FISICA' as 'PERSONA_FISICA' | 'EMPRESA',
    firstName: '',
    lastName: '',
    companyName: '',
    nif: '',
    cif: '',
    email: ''
  })

  // Derived state
  const autoMatchedProperties = detectedProperties.filter(d => d.autoMatch)
  const needsReviewProperties = detectedProperties.filter(d => !d.autoMatch)
  const totalIncome = detectedProperties.reduce((sum, p) =>
    sum + p.emails.reduce((s, e) => s + (e.hostEarnings || 0), 0), 0
  )

  // ============ EFFECTS ============

  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')

    if (success === 'gmail_connected') {
      setMessage({ type: 'success', text: t('integrations.messages.gmailConnected') })
    } else if (error) {
      const errorMessages: Record<string, string> = {
        gmail_auth_denied: t('integrations.messages.authDenied'),
        gmail_no_code: t('integrations.messages.noCode'),
        gmail_missing_tokens: t('integrations.messages.missingTokens'),
        gmail_callback_failed: t('integrations.messages.callbackFailed'),
      }
      setMessage({ type: 'error', text: errorMessages[error] || t('integrations.messages.connectionError') })
    }

    fetchIntegration()
  }, [searchParams, t])

  // ============ API CALLS ============

  const fetchIntegration = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/integrations/gmail')
      if (res.ok) {
        const data = await res.json()
        setConnected(data.connected)
        setIntegration(data.integration)
        setStats(data.stats)

        if (data.connected) {
          setFlowStep('summary')
          if (data.stats?.pending > 0) {
            await detectProperties()
          }
        } else {
          setFlowStep('connect')
        }
      }
      await fetchOwners()
    } catch (error) {
      console.error('Error fetching integration:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOwners = async () => {
    try {
      const res = await fetch('/api/gestion/owners')
      if (res.ok) {
        const data = await res.json()
        setOwners(data.owners || [])
      }
    } catch (error) {
      console.error('Error fetching owners:', error)
    }
  }

  const detectProperties = async () => {
    try {
      const res = await fetch('/api/integrations/gmail/detect-properties')
      if (res.ok) {
        const data = await res.json()
        setDetectionSummary(data.summary)
        setDetectedProperties(data.detectedProperties || [])
        setAvailableProperties(data.availableProperties || [])

        // Initialize new properties for wizard
        const needsConfig = (data.detectedProperties || []).filter((d: DetectedProperty) => !d.autoMatch)
        setNewProperties(needsConfig.map((d: DetectedProperty) => {
          const cleanName = d.name.startsWith('__UNIDENTIFIED__') ? '' : d.name
          const firstEmail = d.emails?.[0]
          return {
            emailPropertyName: d.name,
            displayName: cleanName || firstEmail?.guestName || t('integrations.unnamedProperty'),
            propertyName: cleanName,
            city: '',
            ownerId: '',
            commissionPreset: '15' as const,
            commissionValue: 15,
            showAdvanced: false,
            incomeReceiver: 'OWNER' as const,
            commissionType: 'PERCENTAGE',
            commissionVat: 21,
            cleaningType: 'FIXED_PER_RESERVATION',
            cleaningValue: 0,
            cleaningFeeRecipient: 'MANAGER' as const,
            configured: false
          }
        }))
      }
    } catch (error) {
      console.error('Error detecting properties:', error)
    }
  }

  const handleConnect = async () => {
    try {
      const res = await fetch('/api/integrations/gmail/auth')
      if (res.ok) {
        const data = await res.json()
        window.location.href = data.authUrl
      } else {
        setMessage({ type: 'error', text: t('integrations.messages.connectionError') })
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('integrations.messages.connectionError') })
    }
  }

  const handleDisconnect = async () => {
    if (!confirm(t('integrations.disconnect'))) return

    try {
      const res = await fetch('/api/integrations/gmail', { method: 'DELETE' })
      if (res.ok) {
        setConnected(false)
        setIntegration(null)
        setStats(null)
        setDetectedProperties([])
        setFlowStep('connect')
        setMessage({ type: 'success', text: t('integrations.messages.gmailDisconnected') })
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('integrations.messages.disconnectError') })
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    setMessage(null)

    try {
      const res = await fetch('/api/integrations/gmail/sync', { method: 'POST' })
      const data = await res.json()

      if (res.ok) {
        setMessage({
          type: 'success',
          text: t('integrations.messages.syncSuccess', { count: data.results.newEmails })
        })
        await fetchIntegration()
      } else {
        setMessage({ type: 'error', text: data.error || t('integrations.messages.syncError') })
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('integrations.messages.connectionError') })
    } finally {
      setSyncing(false)
    }
  }

  const handleReparse = async () => {
    setMessage(null)
    try {
      const res = await fetch('/api/integrations/gmail/reparse', { method: 'POST' })
      if (res.ok) {
        await detectProperties()
        setMessage({ type: 'success', text: t('integrations.messages.reparseSuccess') })
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('integrations.messages.reparseError') })
    }
  }

  const createOwner = async (): Promise<string | null> => {
    try {
      const res = await fetch('/api/gestion/owners/quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: newOwner.type,
          firstName: newOwner.type === 'PERSONA_FISICA' ? newOwner.firstName : null,
          lastName: newOwner.type === 'PERSONA_FISICA' ? newOwner.lastName : null,
          companyName: newOwner.type === 'EMPRESA' ? newOwner.companyName : null,
          nif: newOwner.type === 'PERSONA_FISICA' ? newOwner.nif : null,
          cif: newOwner.type === 'EMPRESA' ? newOwner.cif : null,
          email: newOwner.email
        })
      })

      if (res.ok) {
        const data = await res.json()
        setOwners(prev => [data.owner, ...prev])
        setShowOwnerForm(false)
        setNewOwner({ type: 'PERSONA_FISICA', firstName: '', lastName: '', companyName: '', nif: '', cif: '', email: '' })
        return data.owner.id
      }
      return null
    } catch (error) {
      return null
    }
  }

  const createProperty = async (config: NewPropertyConfig): Promise<string | null> => {
    try {
      const res = await fetch('/api/gestion/properties/quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: config.propertyName.trim(),
          city: config.city.trim(),
          ownerId: config.ownerId || null,
          airbnbName: config.emailPropertyName && !config.emailPropertyName.startsWith('__')
            ? config.emailPropertyName
            : null,
          incomeReceiver: config.incomeReceiver,
          commissionType: config.commissionType,
          commissionValue: config.commissionValue,
          commissionVat: config.commissionVat,
          cleaningType: config.cleaningType,
          cleaningValue: config.cleaningValue,
          cleaningFeeRecipient: config.cleaningFeeRecipient,
        })
      })

      if (res.ok) {
        const data = await res.json()
        return data.billingConfig.id
      }
      return null
    } catch (error) {
      return null
    }
  }

  const handleImportAll = async () => {
    setProcessing(true)
    setMessage(null)

    try {
      // First, create any new properties that were configured
      for (const prop of newProperties) {
        if (prop.configured && !prop.configId && prop.propertyName) {
          const configId = await createProperty(prop)
          if (configId) {
            prop.configId = configId
            // Link emails to this property
            const detected = detectedProperties.find(d => d.name === prop.emailPropertyName)
            if (detected) {
              await fetch('/api/integrations/gmail/link-property', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  emailIds: detected.emailIds,
                  billingConfigId: configId,
                  propertyNameAlias: prop.emailPropertyName,
                  saveAlias: true
                })
              })
            }
          }
        }
      }

      // Build confirmMatches from configured new properties
      const confirmMatches = newProperties
        .filter(p => p.configId)
        .map(p => ({
          propertyName: p.emailPropertyName,
          billingConfigId: p.configId!
        }))

      // Process all emails
      const res = await fetch('/api/integrations/gmail/process-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          processAutoMatchedOnly: false,
          confirmMatches
        })
      })

      const data = await res.json()

      if (res.ok) {
        const { results } = data
        setMessage({
          type: 'success',
          text: t('integrations.messages.importSuccess', { created: results.created, updated: results.updated })
        })
        setFlowStep('summary')
        await fetchIntegration()
      } else {
        setMessage({ type: 'error', text: data.error || t('integrations.messages.importError') })
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('integrations.messages.connectionError') })
    } finally {
      setProcessing(false)
    }
  }

  // ============ WIZARD HANDLERS ============

  const startReview = () => {
    if (needsReviewProperties.length > 0) {
      setCurrentWizardIndex(0)
      setWizardStep('name')
      setFlowStep('wizard')
    } else {
      setFlowStep('confirmation')
    }
  }

  const handleWizardNext = () => {
    const current = newProperties[currentWizardIndex]

    if (wizardStep === 'name') {
      if (!current.propertyName.trim()) {
        setMessage({ type: 'error', text: t('integrations.messages.propertyNameRequired') })
        return
      }
      setWizardStep('owner')
    } else if (wizardStep === 'owner') {
      setWizardStep('commission')
    } else if (wizardStep === 'commission') {
      // Mark as configured
      setNewProperties(prev => prev.map((p, i) =>
        i === currentWizardIndex ? { ...p, configured: true } : p
      ))

      // Move to next property or confirmation
      if (currentWizardIndex < newProperties.length - 1) {
        setCurrentWizardIndex(prev => prev + 1)
        setWizardStep('name')
      } else {
        setFlowStep('confirmation')
      }
    }
    setMessage(null)
  }

  const handleWizardBack = () => {
    if (wizardStep === 'commission') {
      setWizardStep('owner')
    } else if (wizardStep === 'owner') {
      setWizardStep('name')
    } else if (wizardStep === 'name' && currentWizardIndex > 0) {
      setCurrentWizardIndex(prev => prev - 1)
      setWizardStep('commission')
    } else {
      setFlowStep('summary')
    }
  }

  const updateCurrentProperty = (updates: Partial<NewPropertyConfig>) => {
    setNewProperties(prev => prev.map((p, i) =>
      i === currentWizardIndex ? { ...p, ...updates } : p
    ))
  }

  const handleAssignExisting = (configId: string) => {
    const property = availableProperties.find(p => p.configId === configId)
    if (property) {
      setNewProperties(prev => prev.map((p, i) =>
        i === currentWizardIndex ? {
          ...p,
          configured: true,
          configId,
          propertyName: property.name
        } : p
      ))

      // Link emails immediately
      const current = newProperties[currentWizardIndex]
      const detected = detectedProperties.find(d => d.name === current.emailPropertyName)
      if (detected) {
        fetch('/api/integrations/gmail/link-property', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            emailIds: detected.emailIds,
            billingConfigId: configId,
            propertyNameAlias: current.emailPropertyName,
            saveAlias: true
          })
        })
      }

      // Move to next
      if (currentWizardIndex < newProperties.length - 1) {
        setCurrentWizardIndex(prev => prev + 1)
        setWizardStep('name')
      } else {
        setFlowStep('confirmation')
      }
    }
  }

  // ============ HELPERS ============

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    })
  }

  const getOwnerName = (ownerId: string) => {
    const owner = owners.find(o => o.id === ownerId)
    if (!owner) return ''
    return owner.type === 'EMPRESA'
      ? owner.companyName
      : `${owner.firstName} ${owner.lastName || ''}`
  }

  // ============ RENDER ============

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('integrations.title')}</h1>
        <p className="text-gray-600">{t('integrations.subtitle')}</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success'
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <span className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </span>
          <button onClick={() => setMessage(null)} className="ml-auto text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ============ STEP: CONNECT ============ */}
      {flowStep === 'connect' && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="p-4 bg-red-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Mail className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('integrations.connect.title')}</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {t('integrations.connect.description')}
            </p>
            <Button onClick={handleConnect} className="bg-red-600 hover:bg-red-700 text-white">
              <Link2 className="w-4 h-4 mr-2" />
              {t('integrations.connect.button')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ============ STEP: SUMMARY ============ */}
      {flowStep === 'summary' && connected && (
        <>
          {/* Gmail Status Card */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Mail className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{integration?.email}</p>
                    <p className="text-sm text-gray-500">
                      {integration?.lastSyncAt && t('integrations.status.lastSync', { date: formatDate(integration.lastSyncAt) })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
                    {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDisconnect} className="text-red-600">
                    <Link2Off className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Card */}
          {detectionSummary && detectionSummary.totalEmails > 0 ? (
            <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-violet-100 rounded-lg">
                    <Sparkles className="w-6 h-6 text-violet-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {t('integrations.summary.title', { count: detectionSummary.totalEmails })}
                    </h2>
                    <p className="text-gray-600">
                      {t('integrations.summary.from', {
                        count: detectedProperties.length,
                        property: detectedProperties.length === 1 ? t('integrations.summary.apartment') : t('integrations.summary.apartments')
                      })}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white rounded-lg p-4 border">
                    <div className="flex items-center gap-2 mb-1">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-600">{t('integrations.summary.autoDetected')}</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {t('integrations.summary.autoDetectedCount', { count: autoMatchedProperties.length })}
                    </p>
                    <p className="text-sm text-gray-500">{t('integrations.summary.autoDetectedReservations', { count: detectionSummary.autoMatchedEmails })}</p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-gray-600">{t('integrations.summary.needsConfig')}</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-600">
                      {t('integrations.summary.needsConfigCount', { count: needsReviewProperties.length })}
                    </p>
                    <p className="text-sm text-gray-500">{t('integrations.summary.needsConfigReservations', { count: detectionSummary.needsReviewEmails })}</p>
                  </div>
                </div>

                {/* Income preview */}
                {totalIncome > 0 && (
                  <div className="bg-green-50 rounded-lg p-3 mb-6 text-center">
                    <p className="text-sm text-green-700">{t('integrations.summary.totalIncome')}</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
                  </div>
                )}

                {/* CTA */}
                <Button
                  onClick={startReview}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 text-lg"
                >
                  {needsReviewProperties.length > 0 ? (
                    <>{t('integrations.summary.buttonReview')}</>
                  ) : (
                    <>{t('integrations.summary.buttonImport')}</>
                  )}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                {/* Re-parse option */}
                <button
                  onClick={handleReparse}
                  className="w-full mt-3 text-sm text-gray-500 hover:text-violet-600"
                >
                  {t('integrations.summary.reparse')}
                </button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">{t('integrations.empty.noPending')}</p>
                <Button variant="outline" onClick={handleSync} disabled={syncing}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                  {t('integrations.empty.syncEmails')}
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* ============ STEP: WIZARD ============ */}
      {flowStep === 'wizard' && newProperties.length > 0 && (
        <Card>
          <CardContent className="p-0">
            {/* Progress bar */}
            <div className="bg-gray-100 h-1">
              <div
                className="bg-violet-600 h-1 transition-all duration-300"
                style={{ width: `${((currentWizardIndex + 1) / newProperties.length) * 100}%` }}
              />
            </div>

            {/* Header */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    {t('integrations.wizard.configuring', { current: currentWizardIndex + 1, total: newProperties.length })}
                  </p>
                  <h2 className="font-semibold text-gray-900">
                    {newProperties[currentWizardIndex].displayName}
                  </h2>
                </div>
                <Badge className="bg-violet-100 text-violet-700">
                  {detectedProperties.find(d => d.name === newProperties[currentWizardIndex].emailPropertyName)?.emailCount || 0} {t('integrations.wizard.reservations')}
                </Badge>
              </div>
            </div>

            {/* Wizard Content */}
            <div className="p-6">
              {/* Step 1: Name */}
              {wizardStep === 'name' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">{t('integrations.wizard.stepName')}</h3>
                    <p className="text-sm text-gray-500 mb-4">{t('integrations.wizard.stepNameDescription')}</p>

                    <input
                      type="text"
                      value={newProperties[currentWizardIndex].propertyName}
                      onChange={(e) => updateCurrentProperty({ propertyName: e.target.value })}
                      placeholder={t('integrations.wizard.propertyNamePlaceholder')}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:border-violet-500 focus:ring-0"
                      autoFocus
                    />

                    <input
                      type="text"
                      value={newProperties[currentWizardIndex].city}
                      onChange={(e) => updateCurrentProperty({ city: e.target.value })}
                      placeholder={t('integrations.wizard.cityPlaceholder')}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2 mt-3 focus:border-violet-500 focus:ring-0"
                    />
                  </div>

                  {/* Quick assign to existing */}
                  {availableProperties.filter(p => p.configId).length > 0 && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">{t('integrations.wizard.existingProperty')}</p>
                      <div className="space-y-2">
                        {availableProperties.filter(p => p.configId).slice(0, 5).map(p => (
                          <button
                            key={p.id}
                            onClick={() => handleAssignExisting(p.configId!)}
                            className="w-full text-left px-4 py-3 border rounded-lg hover:bg-violet-50 hover:border-violet-300 transition-colors flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <Building2 className="w-5 h-5 text-gray-400" />
                              <span>{p.name}</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Owner */}
              {wizardStep === 'owner' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">{t('integrations.wizard.stepOwner')}</h3>
                    <p className="text-sm text-gray-500 mb-4">{t('integrations.wizard.stepOwnerDescription')}</p>
                  </div>

                  {/* Owner options */}
                  <div className="space-y-2">
                    <button
                      onClick={() => updateCurrentProperty({ ownerId: '' })}
                      className={`w-full text-left px-4 py-3 border-2 rounded-xl transition-colors flex items-center gap-3 ${
                        !newProperties[currentWizardIndex].ownerId
                          ? 'border-violet-500 bg-violet-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{t('integrations.wizard.ownProperty')}</p>
                        <p className="text-sm text-gray-500">{t('integrations.wizard.ownPropertyDescription')}</p>
                      </div>
                      {!newProperties[currentWizardIndex].ownerId && (
                        <Check className="w-5 h-5 text-violet-600 ml-auto" />
                      )}
                    </button>

                    {owners.map(owner => (
                      <button
                        key={owner.id}
                        onClick={() => updateCurrentProperty({ ownerId: owner.id })}
                        className={`w-full text-left px-4 py-3 border-2 rounded-xl transition-colors flex items-center gap-3 ${
                          newProperties[currentWizardIndex].ownerId === owner.id
                            ? 'border-violet-500 bg-violet-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="p-2 bg-violet-100 rounded-lg">
                          {owner.type === 'EMPRESA' ? (
                            <Building className="w-5 h-5 text-violet-600" />
                          ) : (
                            <User className="w-5 h-5 text-violet-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {owner.type === 'EMPRESA' ? owner.companyName : `${owner.firstName} ${owner.lastName || ''}`}
                          </p>
                          <p className="text-sm text-gray-500">{owner.nif || owner.cif || owner.email}</p>
                        </div>
                        {newProperties[currentWizardIndex].ownerId === owner.id && (
                          <Check className="w-5 h-5 text-violet-600 ml-auto" />
                        )}
                      </button>
                    ))}

                    {/* Create new owner */}
                    {!showOwnerForm ? (
                      <button
                        onClick={() => setShowOwnerForm(true)}
                        className="w-full text-left px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-violet-400 hover:bg-violet-50 transition-colors flex items-center gap-3"
                      >
                        <div className="p-2 bg-gray-50 rounded-lg">
                          <Plus className="w-5 h-5 text-gray-400" />
                        </div>
                        <span className="text-gray-600">{t('integrations.wizard.createOwner')}</span>
                      </button>
                    ) : (
                      <div className="border-2 border-violet-200 rounded-xl p-4 bg-violet-50 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-violet-700">{t('integrations.wizard.newOwner')}</span>
                          <button onClick={() => setShowOwnerForm(false)} className="text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setNewOwner(prev => ({ ...prev, type: 'PERSONA_FISICA' }))}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium ${
                              newOwner.type === 'PERSONA_FISICA' ? 'bg-violet-600 text-white' : 'bg-white border'
                            }`}
                          >
                            {t('integrations.wizard.ownerTypePerson')}
                          </button>
                          <button
                            onClick={() => setNewOwner(prev => ({ ...prev, type: 'EMPRESA' }))}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium ${
                              newOwner.type === 'EMPRESA' ? 'bg-violet-600 text-white' : 'bg-white border'
                            }`}
                          >
                            {t('integrations.wizard.ownerTypeCompany')}
                          </button>
                        </div>

                        {newOwner.type === 'PERSONA_FISICA' ? (
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={newOwner.firstName}
                              onChange={(e) => setNewOwner(prev => ({ ...prev, firstName: e.target.value }))}
                              placeholder={t('integrations.wizard.firstNamePlaceholder')}
                              className="border rounded-lg px-3 py-2 text-sm"
                            />
                            <input
                              type="text"
                              value={newOwner.lastName}
                              onChange={(e) => setNewOwner(prev => ({ ...prev, lastName: e.target.value }))}
                              placeholder={t('integrations.wizard.lastNamePlaceholder')}
                              className="border rounded-lg px-3 py-2 text-sm"
                            />
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={newOwner.companyName}
                            onChange={(e) => setNewOwner(prev => ({ ...prev, companyName: e.target.value }))}
                            placeholder={t('integrations.wizard.companyNamePlaceholder')}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                          />
                        )}

                        <Button
                          onClick={async () => {
                            const id = await createOwner()
                            if (id) updateCurrentProperty({ ownerId: id })
                          }}
                          className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                          size="sm"
                        >
                          {t('integrations.wizard.createOwnerButton')}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Commission */}
              {wizardStep === 'commission' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">{t('integrations.wizard.stepCommission')}</h3>
                    <p className="text-sm text-gray-500 mb-4">{t('integrations.wizard.stepCommissionDescription')}</p>
                  </div>

                  {/* Quick options */}
                  <div className="grid grid-cols-3 gap-3">
                    {['15', '20', 'custom'].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => {
                          if (preset === 'custom') {
                            updateCurrentProperty({ commissionPreset: 'custom' })
                          } else {
                            updateCurrentProperty({
                              commissionPreset: preset as '15' | '20',
                              commissionValue: parseInt(preset)
                            })
                          }
                        }}
                        className={`py-4 px-3 border-2 rounded-xl text-center transition-colors ${
                          newProperties[currentWizardIndex].commissionPreset === preset
                            ? 'border-violet-500 bg-violet-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {preset === 'custom' ? (
                          <>
                            <Settings className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                            <p className="text-sm text-gray-600">{t('integrations.wizard.commissionCustom')}</p>
                          </>
                        ) : (
                          <>
                            <p className="text-2xl font-bold text-gray-900">{preset}%</p>
                            <p className="text-xs text-gray-500">{t('integrations.wizard.commissionPercent')}</p>
                          </>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Custom value */}
                  {newProperties[currentWizardIndex].commissionPreset === 'custom' && (
                    <div className="flex items-center gap-3 mt-4">
                      <input
                        type="number"
                        value={newProperties[currentWizardIndex].commissionValue || ''}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => updateCurrentProperty({
                          commissionValue: e.target.value === '' ? 0 : Number(e.target.value)
                        })}
                        className="w-24 border-2 rounded-lg px-3 py-2 text-center text-lg font-medium"
                        placeholder="0"
                      />
                      <span className="text-lg text-gray-500">{t('integrations.wizard.commissionPercent')}</span>
                    </div>
                  )}

                  {/* Advanced options toggle */}
                  <button
                    onClick={() => updateCurrentProperty({ showAdvanced: !newProperties[currentWizardIndex].showAdvanced })}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-violet-600 mt-4"
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${newProperties[currentWizardIndex].showAdvanced ? 'rotate-180' : ''}`} />
                    {t('integrations.wizard.advancedOptions')}
                  </button>

                  {newProperties[currentWizardIndex].showAdvanced && (
                    <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
                      {/* Income receiver */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('integrations.wizard.whoReceives')}</label>
                        <div className="flex gap-3">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={newProperties[currentWizardIndex].incomeReceiver === 'OWNER'}
                              onChange={() => updateCurrentProperty({ incomeReceiver: 'OWNER' })}
                            />
                            <span className="text-sm">{t('integrations.wizard.receiverOwner')}</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={newProperties[currentWizardIndex].incomeReceiver === 'MANAGER'}
                              onChange={() => updateCurrentProperty({ incomeReceiver: 'MANAGER' })}
                            />
                            <span className="text-sm">{t('integrations.wizard.receiverManager')}</span>
                          </label>
                        </div>
                      </div>

                      {/* Cleaning */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t('integrations.wizard.cleaningAmount')}</label>
                          <input
                            type="number"
                            value={newProperties[currentWizardIndex].cleaningValue || ''}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => updateCurrentProperty({
                              cleaningValue: e.target.value === '' ? 0 : Number(e.target.value)
                            })}
                            placeholder="0"
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t('integrations.wizard.cleaningRecipient')}</label>
                          <select
                            value={newProperties[currentWizardIndex].cleaningFeeRecipient}
                            onChange={(e) => updateCurrentProperty({ cleaningFeeRecipient: e.target.value as 'OWNER' | 'MANAGER' })}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                          >
                            <option value="MANAGER">{t('integrations.wizard.cleaningRecipientManager')}</option>
                            <option value="OWNER">{t('integrations.wizard.cleaningRecipientOwner')}</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="p-4 border-t bg-gray-50 flex justify-between">
              <Button variant="outline" onClick={handleWizardBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('integrations.wizard.back')}
              </Button>
              <Button onClick={handleWizardNext} className="bg-violet-600 hover:bg-violet-700 text-white">
                {wizardStep === 'commission' && currentWizardIndex === newProperties.length - 1 ? (
                  t('integrations.wizard.finish')
                ) : (
                  <>{t('integrations.wizard.next')}</>
                )}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ============ STEP: CONFIRMATION ============ */}
      {flowStep === 'confirmation' && (
        <Card className="border-2 border-green-200">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{t('integrations.confirmation.title')}</h2>
              <p className="text-gray-600">{t('integrations.confirmation.description')}</p>
            </div>

            {/* Summary list */}
            <div className="space-y-3 mb-6">
              {autoMatchedProperties.map(prop => (
                <div key={prop.name} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">{prop.autoMatch?.propertyName}</p>
                      <p className="text-sm text-gray-500">{prop.emailCount} {t('integrations.confirmation.reservationsCount')} ({t('integrations.confirmation.autoDetected')})</p>
                    </div>
                  </div>
                  <span className="text-green-600 font-medium">
                    {prop.emails.reduce((s, e) => s + (e.hostEarnings || 0), 0).toFixed(0)}€
                  </span>
                </div>
              ))}

              {newProperties.filter(p => p.configured).map(prop => (
                <div key={prop.emailPropertyName} className="flex items-center justify-between p-3 bg-violet-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Plus className="w-5 h-5 text-violet-600" />
                    <div>
                      <p className="font-medium text-gray-900">{prop.propertyName || prop.displayName}</p>
                      <p className="text-sm text-gray-500">
                        {detectedProperties.find(d => d.name === prop.emailPropertyName)?.emailCount || 0} {t('integrations.confirmation.reservationsCount')}
                        {prop.ownerId && t('integrations.confirmation.owner', { owner: getOwnerName(prop.ownerId) })}
                        {t('integrations.confirmation.commission', { percent: prop.commissionValue })}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-violet-100 text-violet-700">{t('integrations.confirmation.new')}</Badge>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="bg-gray-100 rounded-lg p-4 mb-6 text-center">
              <p className="text-sm text-gray-600">{t('integrations.confirmation.totalTitle')}</p>
              <p className="text-3xl font-bold text-gray-900">{t('integrations.confirmation.totalReservations', { count: detectionSummary?.totalEmails })}</p>
              <p className="text-lg text-green-600 font-medium">{formatCurrency(totalIncome)}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setFlowStep('summary')}
                className="flex-1"
              >
                {t('integrations.confirmation.cancel')}
              </Button>
              <Button
                onClick={handleImportAll}
                disabled={processing}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                {processing ? t('integrations.confirmation.importing') : t('integrations.confirmation.import')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help */}
      {flowStep === 'connect' && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('integrations.help.title')}</h2>
            <ol className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center text-xs font-medium">1</span>
                <span>{t('integrations.help.step1')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center text-xs font-medium">2</span>
                <span>{t('integrations.help.step2')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center text-xs font-medium">3</span>
                <span>{t('integrations.help.step3')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center text-xs font-medium">4</span>
                <span>{t('integrations.help.step4')}</span>
              </li>
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
