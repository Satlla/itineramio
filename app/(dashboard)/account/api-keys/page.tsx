'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Eye,
  EyeOff,
  Link2,
  Activity,
  Code,
  ExternalLink,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

interface ApiKeyData {
  id: string
  name: string
  prefix: string
  lastUsedAt: string | null
  createdAt: string
}

interface WebhookLog {
  id: string
  eventType: string
  status: string
  error: string | null
  processedAt: string | null
  createdAt: string
  apiKey: { name: string; prefix: string }
}

type TabType = 'keys' | 'logs' | 'docs'

export default function ApiKeysPage() {
  const router = useRouter()
  const { t } = useTranslation()

  const [activeTab, setActiveTab] = useState<TabType>('keys')
  const [keys, setKeys] = useState<ApiKeyData[]>([])
  const [logs, setLogs] = useState<WebhookLog[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newRawKey, setNewRawKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch('/api/keys')
      const data = await res.json()
      if (data.success) setKeys(data.data)
    } catch {
      setError('Error loading API keys')
    }
  }, [])

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/keys/webhook-logs?limit=50')
      const data = await res.json()
      if (data.success) setLogs(data.data.events)
    } catch {
      setError('Error loading webhook logs')
    }
  }, [])

  useEffect(() => {
    Promise.all([fetchKeys(), fetchLogs()]).finally(() => setLoading(false))
  }, [fetchKeys, fetchLogs])

  const createKey = async () => {
    if (!newKeyName.trim()) {
      setError('Please enter a name for the API key')
      return
    }
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim() }),
      })
      const data = await res.json()
      if (data.success) {
        setNewRawKey(data.data.key)
        setNewKeyName('')
        fetchKeys()
      } else {
        setError(data.error)
      }
    } catch {
      setError('Error creating API key')
    } finally {
      setCreating(false)
    }
  }

  const revokeKey = async (id: string) => {
    if (!confirm('Are you sure? This key will be permanently revoked.')) return
    try {
      const res = await fetch(`/api/keys/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) fetchKeys()
      else setError(data.error)
    } catch {
      setError('Error revoking key')
    }
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PROCESSED': return 'bg-green-100 text-green-800'
      case 'PROCESSING': return 'bg-blue-100 text-blue-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'FAILED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.itineramio.com'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-6 h-6 animate-spin text-violet-600" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/account')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API & Integraciones PMS</h1>
          <p className="text-gray-500 text-sm">Conecta Cloudbeds, Amenitiz, SiteMinder y otros PMS</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {[
          { id: 'keys' as const, label: 'API Keys', icon: Key },
          { id: 'logs' as const, label: 'Webhook Logs', icon: Activity },
          { id: 'docs' as const, label: 'Quick Start', icon: Code },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? 'border-violet-600 text-violet-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span className="text-sm text-red-700">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">&times;</button>
        </div>
      )}

      {/* New Key Created Banner */}
      {newRawKey && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <Check className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-800">API Key created successfully</span>
          </div>
          <p className="text-sm text-green-700 mb-3">
            Copy this key now. It will not be shown again.
          </p>
          <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-green-200">
            <code className="flex-1 text-sm font-mono break-all">{newRawKey}</code>
            <button
              onClick={() => copyToClipboard(newRawKey)}
              className="p-2 hover:bg-green-100 rounded-lg"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
            </button>
          </div>
          <button
            onClick={() => setNewRawKey(null)}
            className="mt-3 text-sm text-green-600 hover:underline"
          >
            I&apos;ve saved it, dismiss
          </button>
        </motion.div>
      )}

      {/* Tab: API Keys */}
      {activeTab === 'keys' && (
        <div className="space-y-6">
          {/* Create Key */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Create new API Key</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Key name (e.g. Cloudbeds Production)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                maxLength={50}
              />
              <button
                onClick={createKey}
                disabled={creating}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50"
              >
                {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Create
              </button>
            </div>
          </div>

          {/* Keys List */}
          <div className="bg-white border border-gray-200 rounded-xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Active API Keys ({keys.length}/5)</h3>
            </div>
            {keys.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Key className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No API keys yet. Create one to get started.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {keys.map((key) => (
                  <div key={key.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{key.name}</div>
                      <div className="text-sm text-gray-500 font-mono">{key.prefix}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Created {new Date(key.createdAt).toLocaleDateString()}
                        {key.lastUsedAt && (
                          <> &middot; Last used {new Date(key.lastUsedAt).toLocaleDateString()}</>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => revokeKey(key.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      title="Revoke key"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Webhook Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Recent Webhook Events</h3>
            <button
              onClick={fetchLogs}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          {logs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No webhook events yet.</p>
              <p className="text-sm mt-1">Events will appear here when your PMS sends reservations.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="px-6 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{log.eventType}</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {log.error && (
                    <p className="text-xs text-red-600 mt-1">{log.error}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Key: {log.apiKey.name} ({log.apiKey.prefix})
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Quick Start Docs */}
      {activeTab === 'docs' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Start Guide</h3>
            <p className="text-gray-600 text-sm mb-6">
              Use our API to integrate your PMS (Cloudbeds, Amenitiz, SiteMinder) with Itineramio.
              When a reservation is created, we automatically send the digital guidebook to your guest.
            </p>

            {/* Step 1 */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-800 mb-2">1. List your properties</h4>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`curl -H "X-API-Key: itm_your_key_here" \\
  ${baseUrl}/api/v1/properties`}
              </pre>
            </div>

            {/* Step 2 */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-800 mb-2">2. Map your PMS property</h4>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`curl -X POST \\
  -H "X-API-Key: itm_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"platform":"cloudbeds","externalId":"your-pms-id"}' \\
  ${baseUrl}/api/v1/properties/PROPERTY_ID/mappings`}
              </pre>
            </div>

            {/* Step 3 */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-800 mb-2">3. Configure your PMS webhook</h4>
              <p className="text-sm text-gray-600 mb-2">
                Set this URL as the webhook endpoint in your PMS:
              </p>
              <div className="flex items-center gap-2 bg-violet-50 p-3 rounded-lg border border-violet-200">
                <code className="flex-1 text-sm font-mono text-violet-800 break-all">
                  {baseUrl}/api/v1/webhooks/reservation
                </code>
                <button
                  onClick={() => copyToClipboard(`${baseUrl}/api/v1/webhooks/reservation`)}
                  className="p-1.5 hover:bg-violet-100 rounded"
                >
                  <Copy className="w-4 h-4 text-violet-600" />
                </button>
              </div>
            </div>

            {/* Step 4 */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-800 mb-2">4. Webhook payload format</h4>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`POST /api/v1/webhooks/reservation
X-API-Key: itm_your_key_here
Content-Type: application/json

{
  "event": "reservation.created",
  "reservation": {
    "externalId": "CB-12345",
    "propertyExternalId": "prop-789",
    "propertyName": "Beach House",
    "guestName": "John Doe",
    "guestEmail": "john@example.com",
    "checkIn": "2026-03-15",
    "checkOut": "2026-03-20",
    "platform": "cloudbeds",
    "confirmationCode": "HM123ABC",
    "hostEarnings": 450
  }
}`}
              </pre>
            </div>

            {/* Step 5 */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-800 mb-2">5. Check guidebook delivery status</h4>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`curl -H "X-API-Key: itm_your_key_here" \\
  ${baseUrl}/api/v1/guidebook/status/DELIVERY_ID`}
              </pre>
              <p className="text-sm text-gray-500 mt-2">
                Returns status: <code className="bg-gray-100 px-1 rounded">pending</code>,{' '}
                <code className="bg-gray-100 px-1 rounded">sent</code>,{' '}
                <code className="bg-gray-100 px-1 rounded">opened</code>,{' '}
                <code className="bg-gray-100 px-1 rounded">clicked</code>
              </p>
            </div>

            {/* Manual send */}
            <div>
              <h4 className="font-medium text-gray-800 mb-2">6. Send guidebook manually</h4>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`curl -X POST \\
  -H "X-API-Key: itm_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"propertyId":"...","guestEmail":"guest@example.com","guestName":"Jane","language":"en"}' \\
  ${baseUrl}/api/v1/guidebook/send`}
              </pre>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-medium text-blue-800 mb-2">Rate Limits</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>&bull; API endpoints: 60 requests/minute per API key</li>
              <li>&bull; Webhooks: 30 requests/minute per API key</li>
              <li>&bull; Anti-duplicate: 1 guidebook per email+property per 7 days</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
