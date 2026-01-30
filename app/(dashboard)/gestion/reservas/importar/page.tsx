'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button, Card, CardContent, Badge } from '@/components/ui'
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Trash2,
  Download,
  RefreshCw,
  Building2,
  ChevronDown,
  Calendar,
  Settings2
} from 'lucide-react'
import { SimpleColumnMapper, type SimpleMapping } from '@/components/gestion/reservas'

interface Property {
  id: string
  name: string
  address: string | null
  hasBillingConfig: boolean
}

interface ParsedRow {
  index: number
  confirmationCode: string
  guestName: string
  checkIn: string
  checkOut: string
  nights: number
  roomTotal: number
  cleaningFee: number
  hostServiceFee: number
  hostEarnings: number
  status: string
  unit?: string
  isDuplicate?: boolean
  hasError?: boolean
  errorMessage?: string
}

type Platform = 'AIRBNB' | 'BOOKING' | 'UNKNOWN'

interface ImportResult {
  totalRows: number
  importedCount: number
  skippedCount: number
  errorCount: number
  errors: Array<{ row: number; error: string; data?: unknown }>
  importBatchId?: string
  listingsFound?: string[]
}

interface PreviewAnalysis {
  totalRows: number
  validRows: number
  newReservations: number
  duplicates: number
  invalidRows: number
  listingsFound: Array<{ name: string; count: number }>
  dateRange: { min: string | null; max: string | null }
  duplicateDetails: Array<{ code: string; guestName: string; existsIn: string }>
  newDetails: Array<{ code: string; guestName: string; checkIn: string; amount: number; listing: string }>
}

interface ImportHistory {
  id: string
  fileName: string
  source: string
  importDate: string
  totalRows: number
  importedCount: number
  skippedCount: number
  errorCount: number
}

export default function ImportarReservasPage() {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedRow[]>([])
  const [detectedPlatform, setDetectedPlatform] = useState<Platform>('UNKNOWN')
  const [isParsing, setIsParsing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [skipDuplicates, setSkipDuplicates] = useState(true)
  const [properties, setProperties] = useState<Property[]>([])
  const [importHistory, setImportHistory] = useState<ImportHistory[]>([])
  const [loadingProperties, setLoadingProperties] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Bulk delete state
  const [showBulkDelete, setShowBulkDelete] = useState(false)
  const [deleteYear, setDeleteYear] = useState(new Date().getFullYear())
  const [deleteMonth, setDeleteMonth] = useState(new Date().getMonth() + 1)
  const [isDeleting, setIsDeleting] = useState(false)

  // Column mapper state
  const [showColumnMapper, setShowColumnMapper] = useState(false)
  const [rawHeaders, setRawHeaders] = useState<string[]>([])
  const [rawRows, setRawRows] = useState<string[][]>([])
  const [simpleMapping, setSimpleMapping] = useState<SimpleMapping | null>(null)

  // Preview analysis state
  const [previewAnalysis, setPreviewAnalysis] = useState<PreviewAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Fetch properties and billing units
  useEffect(() => {
    async function fetchProperties() {
      try {
        const res = await fetch('/api/gestion/properties-simple')
        if (res.ok) {
          const data = await res.json()
          // Combinar Properties (legacy) y BillingUnits (nuevos apartamentos)
          const legacyProps = (data.properties || []).map((p: any) => ({
            ...p,
            type: 'property'
          }))
          const billingUnits = (data.billingUnits || []).map((u: any) => ({
            id: u.id,
            name: u.name,
            address: u.city || '',
            hasBillingConfig: true, // BillingUnits siempre tienen config
            type: 'billingUnit'
          }))
          setProperties([...legacyProps, ...billingUnits])
        }
      } catch (error) {
        console.error('Error fetching properties:', error)
      } finally {
        setLoadingProperties(false)
      }
    }
    fetchProperties()
  }, [])

  // Fetch import history
  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch('/api/gestion/reservations/import')
        if (res.ok) {
          const data = await res.json()
          setImportHistory(data.imports || [])
        }
      } catch (error) {
        console.error('Error fetching history:', error)
      }
    }
    fetchHistory()
  }, [importResult])

  // Analyze file when both file and property are selected
  useEffect(() => {
    if (!file || !selectedPropertyId) {
      setPreviewAnalysis(null)
      return
    }

    async function analyzeFile() {
      setIsAnalyzing(true)
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('propertyId', selectedPropertyId)

        const res = await fetch('/api/gestion/reservations/import-preview', {
          method: 'POST',
          body: formData
        })

        if (res.ok) {
          const data = await res.json()
          setPreviewAnalysis(data.analysis)
          if (data.platform && data.platform !== 'UNKNOWN') {
            setDetectedPlatform(data.platform)
          }
        }
      } catch (error) {
        console.error('Error analyzing file:', error)
      } finally {
        setIsAnalyzing(false)
      }
    }

    analyzeFile()
  }, [file, selectedPropertyId])


  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0]
    if (!uploadedFile) return

    setFile(uploadedFile)
    setParsedData([])
    setImportResult(null)
    setIsParsing(true)
    setMessage(null)
    setDetectedPlatform('UNKNOWN')
    setShowColumnMapper(false)
    setSimpleMapping(null)

    try {
      const fileName = uploadedFile.name.toLowerCase()
      let text: string

      // Handle XLS/XLSX files - dynamic import to avoid SSR issues
      if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
        const XLSX = await import('xlsx')
        const buffer = await uploadedFile.arrayBuffer()
        const workbook = XLSX.read(buffer, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        // Convert to CSV for parsing
        text = XLSX.utils.sheet_to_csv(sheet, { FS: ',' })
      } else {
        text = await uploadedFile.text()
      }

      // Parse and extract raw data for column mapper
      const { rows, platform, headers, rawData } = parseFilePreviewWithRaw(text)
      setParsedData(rows)
      setDetectedPlatform(platform)
      setRawHeaders(headers)
      setRawRows(rawData)

      // If platform is unknown, show column mapper automatically
      if (platform === 'UNKNOWN') {
        setShowColumnMapper(true)
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Error al leer el archivo'
      })
    } finally {
      setIsParsing(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    // Don't restrict by MIME type - some browsers don't recognize XLS files correctly
    // Instead, we validate the extension in onDrop
    maxFiles: 1,
    noClick: false,
    noKeyboard: false,
    validator: (file) => {
      const ext = file.name.toLowerCase().split('.').pop()
      if (!ext || !['csv', 'xls', 'xlsx'].includes(ext)) {
        return {
          code: 'file-invalid-type',
          message: 'Solo se permiten archivos CSV, XLS o XLSX'
        }
      }
      return null
    }
  })

  // Handle simple mapping confirm
  const handleSimpleMappingConfirm = (mapping: SimpleMapping) => {
    setSimpleMapping(mapping)
    setShowColumnMapper(false)

    // Re-parse data with the new mapping for preview
    const previewRows = rawRows.slice(0, 20).map((row, i) => {
      const guestName = row[mapping.guestName] || ''
      const checkIn = row[mapping.checkIn] || ''
      const checkOut = row[mapping.checkOut] || ''
      const amountStr = row[mapping.amount] || ''
      const amount = parseAmount(amountStr)

      return {
        index: i + 2,
        confirmationCode: '',
        guestName,
        checkIn,
        checkOut,
        nights: 0,
        roomTotal: amount,
        cleaningFee: 0,
        hostServiceFee: 0,
        hostEarnings: amount,
        status: 'CONFIRMED',
        hasError: !guestName || !checkIn || !checkOut || amount <= 0
      } as ParsedRow
    })

    setParsedData(previewRows)
  }

  const handleImport = async () => {
    if (!file || !selectedPropertyId) {
      setMessage({
        type: 'error',
        text: 'Selecciona una propiedad y sube un archivo CSV'
      })
      return
    }

    const selectedProperty = properties.find(p => p.id === selectedPropertyId)
    if (selectedProperty && !selectedProperty.hasBillingConfig) {
      setMessage({
        type: 'error',
        text: 'La propiedad seleccionada no tiene configuración de facturación'
      })
      return
    }

    setIsImporting(true)
    setImportProgress(0)
    setImportResult(null)
    setMessage(null)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setImportProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      let response: Response

      // If we have simple mapping, use universal import
      if (simpleMapping) {
        response = await fetch('/api/gestion/reservations/import-universal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rows: rawRows,
            mapping: {
              guestName: simpleMapping.guestName,
              checkIn: simpleMapping.checkIn,
              checkOut: simpleMapping.checkOut,
              amount: simpleMapping.amount,
            },
            config: {
              dateFormat: 'DD/MM/YYYY',
              numberFormat: 'EU',
              amountType: 'NET',
              platform: 'OTHER'
            },
            propertyId: selectedPropertyId,
            skipDuplicates
          })
        })
      } else {
        // Use standard import based on detected platform
        const formData = new FormData()
        formData.append('file', file)
        formData.append('propertyId', selectedPropertyId)
        formData.append('skipDuplicates', skipDuplicates.toString())

        const apiUrl = detectedPlatform === 'BOOKING'
          ? '/api/gestion/reservations/import-booking'
          : '/api/gestion/reservations/import'

        response = await fetch(apiUrl, {
          method: 'POST',
          body: formData,
        })
      }

      clearInterval(progressInterval)
      setImportProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al importar')
      }

      const data = await response.json()
      setImportResult(data.results)

      setMessage({
        type: 'success',
        text: `${data.results.importedCount} reservas importadas correctamente`
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Error al importar'
      })
    } finally {
      setIsImporting(false)
    }
  }

  const resetImport = () => {
    setFile(null)
    setParsedData([])
    setImportResult(null)
    setImportProgress(0)
    setMessage(null)
    setDetectedPlatform('UNKNOWN')
    setShowColumnMapper(false)
    setRawHeaders([])
    setRawRows([])
    setSimpleMapping(null)
    setPreviewAnalysis(null)
  }

  const handleBulkDelete = async () => {
    if (!selectedPropertyId) {
      setMessage({
        type: 'error',
        text: 'Selecciona una propiedad primero'
      })
      return
    }

    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

    if (!confirm(`¿Seguro que quieres eliminar todas las reservas de ${monthNames[deleteMonth - 1]} ${deleteYear}?`)) {
      return
    }

    setIsDeleting(true)
    setMessage(null)

    try {
      const response = await fetch('/api/gestion/reservations/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: selectedPropertyId,
          year: deleteYear,
          month: deleteMonth
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar')
      }

      let msg = `${data.deleted} reservas eliminadas`
      if (data.skipped > 0) {
        msg += ` (${data.skipped} omitidas: ${data.details.invoiced} facturadas, ${data.details.inLiquidation} en liquidación)`
      }

      setMessage({
        type: 'success',
        text: msg
      })
      setShowBulkDelete(false)
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Error al eliminar'
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const downloadTemplate = () => {
    const headers = [
      'Código de confirmación',
      'Estado',
      'Nombre del huésped',
      'Nº de adultos',
      'Nº de niños',
      'Nº de bebés',
      'Fecha de inicio',
      'Fecha de finalización',
      'Nº de noches',
      'Alojamiento',
      'Limpieza',
      'Ganancias brutas',
      'Comisión servicio anfitrión',
      'Ganancias netas'
    ]
    const csvContent = headers.join(',') + '\n'
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'plantilla_reservas_airbnb.csv'
    link.click()
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Importar Reservas</h1>
        <p className="text-gray-600 mt-1">
          Importa reservas desde Airbnb (CSV) o Booking (XLS)
        </p>
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
            <AlertTriangle className="w-5 h-5 text-red-600" />
          )}
          <span className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main import area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property selector */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-5 w-5 text-violet-600" />
                <h2 className="text-lg font-semibold">Seleccionar Propiedad</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Las reservas se asociarán a esta propiedad
              </p>

              <div className="relative">
                <select
                  value={selectedPropertyId}
                  onChange={(e) => setSelectedPropertyId(e.target.value)}
                  disabled={loadingProperties}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  <option value="">Selecciona una propiedad</option>
                  {properties.map((property) => (
                    <option
                      key={property.id}
                      value={property.id}
                      disabled={!property.hasBillingConfig}
                    >
                      {property.name} {!property.hasBillingConfig ? '(Sin config. facturación)' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>

              {properties.length === 0 && !loadingProperties && (
                <p className="text-sm text-gray-500 mt-2">
                  No hay propiedades disponibles
                </p>
              )}

              {/* Bulk delete toggle */}
              {selectedPropertyId && (
                <div className="mt-4 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowBulkDelete(!showBulkDelete)}
                    className="text-sm text-red-600 hover:text-red-700 flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Borrar reservas de un mes
                  </button>

                  {showBulkDelete && (
                    <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800 mb-3">
                        Eliminar todas las reservas de esta propiedad en:
                      </p>
                      <div className="flex items-center gap-3">
                        <select
                          value={deleteMonth}
                          onChange={(e) => setDeleteMonth(parseInt(e.target.value))}
                          className="border border-gray-300 rounded px-3 py-1.5 text-sm"
                        >
                          <option value={1}>Enero</option>
                          <option value={2}>Febrero</option>
                          <option value={3}>Marzo</option>
                          <option value={4}>Abril</option>
                          <option value={5}>Mayo</option>
                          <option value={6}>Junio</option>
                          <option value={7}>Julio</option>
                          <option value={8}>Agosto</option>
                          <option value={9}>Septiembre</option>
                          <option value={10}>Octubre</option>
                          <option value={11}>Noviembre</option>
                          <option value={12}>Diciembre</option>
                        </select>
                        <select
                          value={deleteYear}
                          onChange={(e) => setDeleteYear(parseInt(e.target.value))}
                          className="border border-gray-300 rounded px-3 py-1.5 text-sm"
                        >
                          {[2024, 2025, 2026, 2027].map(y => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                        <Button
                          variant="outline"
                          onClick={handleBulkDelete}
                          disabled={isDeleting}
                          className="text-red-600 border-red-300 hover:bg-red-100"
                        >
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-1" />
                              Eliminar
                            </>
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-red-600 mt-2">
                        Las reservas facturadas o en liquidación no se eliminarán
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* File dropzone */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileSpreadsheet className="h-5 w-5 text-violet-600" />
                <h2 className="text-lg font-semibold">Archivo de Reservas</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Arrastra un archivo XLS (Booking) o CSV (Airbnb) o haz clic para seleccionar
              </p>

              {!file ? (
                <div
                  {...getRootProps()}
                  className={`
                    border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                    transition-colors
                    ${isDragActive
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-gray-300 hover:border-violet-400'
                    }
                  `}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-10 w-10 mx-auto mb-4 text-gray-400" />
                  {isDragActive ? (
                    <p className="text-violet-600 font-medium">Suelta el archivo aquí...</p>
                  ) : (
                    <>
                      <p className="font-medium text-gray-700">
                        Arrastra tu archivo aquí
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        XLS/XLSX (Booking) o CSV (Airbnb)
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={resetImport}
                      disabled={isImporting}
                      className="p-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {detectedPlatform !== 'UNKNOWN' && (
                    <div className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                      detectedPlatform === 'BOOKING'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-pink-50 text-pink-700'
                    }`}>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Detectado: <strong>{detectedPlatform === 'BOOKING' ? 'Booking.com' : 'Airbnb'}</strong>
                      </div>
                      <button
                        onClick={() => setShowColumnMapper(true)}
                        className="text-xs underline hover:no-underline"
                      >
                        Mapear manualmente
                      </button>
                    </div>
                  )}
                  {detectedPlatform === 'UNKNOWN' && !showColumnMapper && !simpleMapping && (
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg text-sm bg-amber-50 text-amber-700">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Formato no reconocido
                      </div>
                      <button
                        onClick={() => setShowColumnMapper(true)}
                        className="flex items-center gap-1 text-xs font-medium bg-amber-600 text-white px-2 py-1 rounded hover:bg-amber-700"
                      >
                        <Settings2 className="h-3 w-3" />
                        Configurar mapeo
                      </button>
                    </div>
                  )}
                  {simpleMapping && (
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg text-sm bg-green-50 text-green-700">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Columnas configuradas
                      </div>
                      <button
                        onClick={() => setShowColumnMapper(true)}
                        className="text-xs underline hover:no-underline"
                      >
                        Modificar
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={downloadTemplate}
                  className="text-sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar plantilla
                </Button>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={skipDuplicates}
                    onChange={(e) => setSkipDuplicates(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-sm text-gray-700">Omitir duplicados</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Simple Column Mapper */}
          {showColumnMapper && rawHeaders.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <SimpleColumnMapper
                  headers={rawHeaders}
                  sampleRows={rawRows.slice(0, 5)}
                  onConfirm={handleSimpleMappingConfirm}
                  onCancel={() => setShowColumnMapper(false)}
                />
              </CardContent>
            </Card>
          )}

          {/* Analyzing */}
          {(isParsing || isAnalyzing) && (
            <Card>
              <CardContent className="py-8">
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
                  <span className="text-gray-600">Analizando archivo...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview Analysis - shows BEFORE import */}
          {previewAnalysis && !importResult && !showColumnMapper && !isAnalyzing && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">
                  Análisis del archivo
                </h2>

                {/* Summary cards */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-3xl font-bold text-green-600">
                      {previewAnalysis.newReservations}
                    </div>
                    <div className="text-sm text-green-800 font-medium">Nuevas</div>
                    <div className="text-xs text-green-600 mt-1">Se importarán</div>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="text-3xl font-bold text-amber-600">
                      {previewAnalysis.duplicates}
                    </div>
                    <div className="text-sm text-amber-800 font-medium">Duplicadas</div>
                    <div className="text-xs text-amber-600 mt-1">Ya existen</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-3xl font-bold text-gray-600">
                      {previewAnalysis.validRows}
                    </div>
                    <div className="text-sm text-gray-800 font-medium">Total válidas</div>
                    <div className="text-xs text-gray-500 mt-1">de {previewAnalysis.totalRows} filas</div>
                  </div>
                </div>

                {/* Date range */}
                {previewAnalysis.dateRange.min && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Periodo: <strong>{previewAnalysis.dateRange.min}</strong> al <strong>{previewAnalysis.dateRange.max}</strong>
                    </span>
                  </div>
                )}

                {/* Listings found */}
                {previewAnalysis.listingsFound.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Alojamientos en el CSV ({previewAnalysis.listingsFound.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {previewAnalysis.listingsFound.map((listing, i) => (
                        <Badge key={i} className="bg-violet-100 text-violet-800 text-xs">
                          {listing.name} ({listing.count})
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Todas se importarán a la propiedad seleccionada
                    </p>
                  </div>
                )}

                {/* Duplicates warning */}
                {previewAnalysis.duplicates > 0 && (
                  <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-800 font-medium mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      {previewAnalysis.duplicates} reservas ya existen
                    </div>
                    <p className="text-sm text-amber-700 mb-3">
                      Estas reservas ya fueron importadas anteriormente y se omitirán:
                    </p>
                    <div className="space-y-1 text-sm">
                      {previewAnalysis.duplicateDetails.slice(0, 5).map((dup, i) => (
                        <div key={i} className="flex items-center justify-between text-amber-700 bg-amber-100/50 px-2 py-1 rounded">
                          <span className="font-mono text-xs">{dup.code}</span>
                          <span>{dup.guestName}</span>
                          <span className="text-xs">en {dup.existsIn}</span>
                        </div>
                      ))}
                      {previewAnalysis.duplicateDetails.length > 5 && (
                        <p className="text-xs text-amber-600">
                          ... y {previewAnalysis.duplicateDetails.length - 5} más
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* New reservations preview */}
                {previewAnalysis.newReservations > 0 && previewAnalysis.newDetails.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Reservas nuevas a importar
                    </h3>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="overflow-x-auto max-h-[250px]">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              <th className="px-3 py-2 text-left font-medium text-gray-600">Código</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-600">Huésped</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-600">Check-in</th>
                              <th className="px-3 py-2 text-right font-medium text-gray-600">Importe</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-600">Alojamiento</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {previewAnalysis.newDetails.map((row, i) => (
                              <tr key={i} className="hover:bg-gray-50">
                                <td className="px-3 py-2 font-mono text-xs">{row.code}</td>
                                <td className="px-3 py-2">{row.guestName}</td>
                                <td className="px-3 py-2">{row.checkIn}</td>
                                <td className="px-3 py-2 text-right">{row.amount.toFixed(2)} €</td>
                                <td className="px-3 py-2 text-xs text-gray-500 max-w-[150px] truncate">{row.listing}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {previewAnalysis.newReservations > 20 && (
                        <div className="p-2 text-center text-xs text-gray-500 bg-gray-50">
                          Mostrando 20 de {previewAnalysis.newReservations} nuevas
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* No new reservations warning */}
                {previewAnalysis.newReservations === 0 && (
                  <div className="mb-6 p-4 bg-gray-100 border border-gray-300 rounded-lg text-center">
                    <XCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-700 font-medium">No hay reservas nuevas para importar</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Todas las reservas del archivo ya existen en la base de datos
                    </p>
                  </div>
                )}

                {/* Import button */}
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {previewAnalysis.invalidRows > 0 && (
                      <span className="text-red-600">
                        {previewAnalysis.invalidRows} filas inválidas (ignoradas)
                      </span>
                    )}
                  </div>
                  <Button
                    onClick={handleImport}
                    disabled={isImporting || !selectedPropertyId || previewAnalysis.newReservations === 0}
                    className="bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Importando...
                      </>
                    ) : previewAnalysis.newReservations === 0 ? (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Nada que importar
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Importar {previewAnalysis.newReservations} reservas
                      </>
                    )}
                  </Button>
                </div>

                {/* Progress */}
                {isImporting && (
                  <div className="mt-4">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-600 transition-all duration-300"
                        style={{ width: `${importProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-center text-gray-500 mt-2">
                      {importProgress}% completado
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Needs property selection */}
          {file && !selectedPropertyId && !isParsing && !showColumnMapper && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-600 font-medium">Selecciona una propiedad</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Para analizar el archivo, primero selecciona la propiedad destino
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Import result */}
          {importResult && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <h2 className="text-lg font-semibold">Importación Completada</h2>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600">
                      {importResult.importedCount}
                    </div>
                    <div className="text-sm text-green-800">Importadas</div>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="text-2xl font-bold text-amber-600">
                      {importResult.skippedCount}
                    </div>
                    <div className="text-sm text-amber-800">Omitidas</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-2xl font-bold text-red-600">
                      {importResult.errorCount}
                    </div>
                    <div className="text-sm text-red-800">Errores</div>
                  </div>
                </div>

                {/* Batch ID for rollback */}
                {importResult.importBatchId && importResult.importedCount > 0 && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
                    <span className="text-gray-600">ID de importación: </span>
                    <code className="text-gray-800 bg-gray-200 px-2 py-0.5 rounded text-xs">
                      {importResult.importBatchId}
                    </code>
                    <p className="text-xs text-gray-500 mt-1">
                      Guarda este ID si necesitas deshacer la importación más adelante
                    </p>
                  </div>
                )}

                {/* Listings imported */}
                {importResult.listingsFound && importResult.listingsFound.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Alojamientos importados:</p>
                    <div className="flex flex-wrap gap-1">
                      {importResult.listingsFound.map((listing, i) => (
                        <Badge key={i} className="bg-violet-100 text-violet-800 text-xs">
                          {listing}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {importResult.errors.length > 0 && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      Errores durante la importación
                    </div>
                    <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                      {importResult.errors.slice(0, 5).map((error, i) => (
                        <li key={i}>
                          Fila {error.row}: {error.error}
                        </li>
                      ))}
                      {importResult.errors.length > 5 && (
                        <li>... y {importResult.errors.length - 5} errores más</li>
                      )}
                    </ul>
                  </div>
                )}

                <Button onClick={resetImport} variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Importar otro archivo
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Import history */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Historial de Importaciones</h2>

              {importHistory.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No hay importaciones previas
                </p>
              ) : (
                <div className="space-y-3">
                  {importHistory.slice(0, 10).map((imp) => (
                    <div
                      key={imp.id}
                      className="p-3 border border-gray-200 rounded-lg text-sm"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium truncate max-w-[150px]">
                          {imp.fileName}
                        </span>
                        {imp.errorCount > 0 ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {new Date(imp.importDate).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Badge className="text-xs bg-green-100 text-green-800">
                          {imp.importedCount} importadas
                        </Badge>
                        {imp.skippedCount > 0 && (
                          <Badge className="text-xs bg-gray-100 text-gray-800">
                            {imp.skippedCount} omitidas
                          </Badge>
                        )}
                        {imp.errorCount > 0 && (
                          <Badge className="text-xs bg-red-100 text-red-800">
                            {imp.errorCount} errores
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Help */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Cómo exportar</h2>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-blue-700 mb-2">Booking.com (XLS)</h3>
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Ve a Extranet de Booking</li>
                  <li>Reservas → Exportar</li>
                  <li>Selecciona el periodo</li>
                  <li>Descarga el XLS</li>
                </ol>
              </div>

              <div>
                <h3 className="text-sm font-medium text-pink-700 mb-2">Airbnb (CSV)</h3>
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Ve a tu panel de Airbnb</li>
                  <li>Historial de transacciones</li>
                  <li>Filtra y exporta CSV</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

/**
 * Parse file text for preview and detect platform, also return raw data for column mapper
 */
function parseFilePreviewWithRaw(text: string): {
  rows: ParsedRow[]
  platform: Platform
  headers: string[]
  rawData: string[][]
} {
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0)

  if (lines.length < 2) {
    return { rows: [], platform: 'UNKNOWN', headers: [], rawData: [] }
  }

  // Parse header
  const headers = parseCSVLine(lines[0])

  // Parse all data rows (raw)
  const rawData: string[][] = []
  for (let i = 1; i < lines.length; i++) {
    rawData.push(parseCSVLine(lines[i]))
  }

  // Detect platform by header columns
  const platform = detectPlatform(headers)

  // If platform is unknown, return early with raw data
  if (platform === 'UNKNOWN') {
    return {
      rows: [],
      platform,
      headers,
      rawData
    }
  }

  // Parse rows using standard logic
  const { rows } = parseFilePreview(text)

  return { rows, platform, headers, rawData }
}

/**
 * Parse file text for preview and detect platform
 */
function parseFilePreview(text: string): { rows: ParsedRow[]; platform: Platform } {
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0)

  if (lines.length < 2) {
    return { rows: [], platform: 'UNKNOWN' }
  }

  // Parse header
  const headers = parseCSVLine(lines[0])

  // Detect platform by header columns
  const platform = detectPlatform(headers)

  // Column indices based on platform
  const colIndices = platform === 'BOOKING'
    ? {
        confirmationCode: findColumnIndex(headers, ['Número de reserva', 'Reservation number']),
        guestName: findColumnIndex(headers, ['Nombre del cliente (o clientes)', 'Nombre del cliente', 'Reservado por']),
        checkIn: findColumnIndex(headers, ['Entrada', 'Check-in', 'Arrival']),
        checkOut: findColumnIndex(headers, ['Salida', 'Check-out', 'Departure']),
        nights: findColumnIndex(headers, ['Duración (noches)', 'Nights', 'Noches']),
        roomTotal: findColumnIndex(headers, ['Precio', 'Price', 'Total']),
        cleaningFee: -1,
        hostServiceFee: findColumnIndex(headers, ['Importe de la comisión', 'Commission amount']),
        hostEarnings: -1, // Calculate from price - commission
        status: findColumnIndex(headers, ['Estado', 'Status']),
        unit: findColumnIndex(headers, ['Tipo de unidad', 'Unit type', 'Room type']),
      }
    : {
        confirmationCode: findColumnIndex(headers, ['Código de confirmación', 'Confirmation code']),
        guestName: findColumnIndex(headers, ['Nombre del huésped', 'Guest name', 'Huésped', 'Viajero', 'Nombre del viajero']),
        checkIn: findColumnIndex(headers, ['Fecha de inicio', 'Start date', 'Check-in', 'Entrada']),
        checkOut: findColumnIndex(headers, ['Fecha de finalización', 'End date', 'Check-out', 'Salida']),
        nights: findColumnIndex(headers, ['Nº de noches', 'Nights', 'Noches']),
        roomTotal: findColumnIndex(headers, ['Alojamiento', 'Accommodation', 'Bruto']),
        cleaningFee: findColumnIndex(headers, ['Limpieza', 'Cleaning fee', 'Gastos de limpieza', 'Tarifa de limpieza']),
        hostServiceFee: findColumnIndex(headers, ['Comisión servicio anfitrión', 'Host service fee']),
        hostEarnings: findColumnIndex(headers, ['Ganancias netas', 'Net earnings', 'Ganancias', 'Importe', 'Tus ganancias']),
        status: findColumnIndex(headers, ['Estado', 'Status']),
        unit: -1,
      }

  // Parse data rows
  const rows: ParsedRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])

    const confirmationCode = colIndices.confirmationCode !== -1 ? values[colIndices.confirmationCode] : ''

    const roomTotal = colIndices.roomTotal !== -1 ? parseAmount(values[colIndices.roomTotal]) : 0
    const hostServiceFee = colIndices.hostServiceFee !== -1 ? parseAmount(values[colIndices.hostServiceFee]) : 0

    // For Booking, calculate hostEarnings from price - commission
    let hostEarnings = colIndices.hostEarnings !== -1 ? parseAmount(values[colIndices.hostEarnings]) : 0
    if (platform === 'BOOKING' && hostEarnings === 0) {
      hostEarnings = roomTotal - hostServiceFee
    }

    const row: ParsedRow = {
      index: i + 1,
      confirmationCode,
      guestName: colIndices.guestName !== -1 ? values[colIndices.guestName] : '',
      checkIn: colIndices.checkIn !== -1 ? values[colIndices.checkIn] : '',
      checkOut: colIndices.checkOut !== -1 ? values[colIndices.checkOut] : '',
      nights: colIndices.nights !== -1 ? parseInt(values[colIndices.nights] || '0', 10) : 0,
      roomTotal,
      cleaningFee: colIndices.cleaningFee !== -1 ? parseAmount(values[colIndices.cleaningFee]) : 0,
      hostServiceFee,
      hostEarnings,
      status: colIndices.status !== -1 ? values[colIndices.status] : '',
      unit: 'unit' in colIndices && colIndices.unit !== -1 ? values[colIndices.unit] : undefined,
    }

    // Validate row - confirmation code is optional (backend generates if missing)
    if (!row.checkIn || !row.checkOut) {
      row.hasError = true
      row.errorMessage = 'Fechas incompletas'
    } else if (!row.guestName) {
      row.hasError = true
      row.errorMessage = 'Sin nombre de huésped'
    }

    rows.push(row)
  }

  return { rows, platform }
}

/**
 * Detect platform from CSV headers
 */
function detectPlatform(headers: string[]): Platform {
  const headersLower = headers.map(h => h.toLowerCase())
  const headersStr = headersLower.join(' ')

  // Booking-specific columns
  const bookingColumns = ['número de reserva', 'tipo de unidad', 'importe de la comisión', 'booker country']
  const hasBookingColumns = bookingColumns.some(col => headersLower.includes(col))

  // Airbnb indicators - check for multiple
  const airbnbIndicators = [
    'código de confirmación',
    'ganancias netas',
    'comisión servicio anfitrión',
    'viajero',
    'fecha de inicio',
    'fecha de finalización',
    'gastos de limpieza',
    'fecha de llegada estimada',
    'fecha de la reserva'
  ]
  const airbnbScore = airbnbIndicators.filter(ind => headersStr.includes(ind)).length

  if (hasBookingColumns && airbnbScore < 2) {
    return 'BOOKING'
  } else if (airbnbScore >= 2) {
    return 'AIRBNB'
  }

  // Check file extension hints in headers (sometimes included)
  if (headersLower.some(h => h.includes('booking'))) {
    return 'BOOKING'
  }
  if (headersLower.some(h => h.includes('airbnb'))) {
    return 'AIRBNB'
  }

  return 'UNKNOWN'
}

function parseCSVLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if ((char === ',' || char === ';') && !inQuotes) {
      values.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  values.push(current.trim())
  return values
}

function findColumnIndex(headers: string[], possibleNames: string[]): number {
  for (const name of possibleNames) {
    const index = headers.findIndex(
      (h) => h.toLowerCase() === name.toLowerCase()
    )
    if (index !== -1) return index
  }
  return -1
}

function parseAmount(str: string): number {
  if (!str) return 0

  let cleaned = str.replace(/[€$£\s]/g, '')

  if (cleaned.includes(',') && cleaned.includes('.')) {
    const lastComma = cleaned.lastIndexOf(',')
    const lastDot = cleaned.lastIndexOf('.')
    if (lastComma > lastDot) {
      cleaned = cleaned.replace(/\./g, '').replace(',', '.')
    } else {
      cleaned = cleaned.replace(/,/g, '')
    }
  } else if (cleaned.includes(',')) {
    cleaned = cleaned.replace(',', '.')
  }

  return parseFloat(cleaned) || 0
}

