import { NextRequest, NextResponse } from 'next/server'
import { verifyPanelToken, getPanelTokenFromCookies } from '../../../../../src/lib/satllabot-auth'
import * as XLSX from 'xlsx'

export async function GET(request: NextRequest) {
  const token = await getPanelTokenFromCookies()
  if (!token || !(await verifyPanelToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const month = searchParams.get('month') || ''
  const year = searchParams.get('year') || ''
  const apartamento = searchParams.get('apartamento') || ''

  const url = new URL(`${process.env.SATLLABOT_API_URL}/api/panel/reservations`)
  if (month) url.searchParams.set('month', month)
  if (year) url.searchParams.set('year', year)

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${process.env.SATLLABOT_PANEL_SECRET}` },
    cache: 'no-store',
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Error fetching reservations' }, { status: res.status })
  }

  const data = await res.json()
  let reservations: Array<Record<string, unknown>> = data.reservations || data || []

  // Optional filter by apartamento
  if (apartamento) {
    reservations = reservations.filter((r: Record<string, unknown>) =>
      (r.apartamento as string || '').toLowerCase() === apartamento.toLowerCase()
    )
  }

  // Build Excel rows
  const rows = reservations.map((r: Record<string, unknown>) => ({
    'Apartamento': r.apartamento || '',
    'Huésped': r.huesped || '',
    'Check-in': r.checkIn || '',
    'Check-out': r.checkOut || '',
    'Noches': r.noches || 0,
    'Pax': r.pax || 0,
    'Plataforma': r.plataforma || '',
    'Total (€)': r.total || 0,
    'Limpieza (€)': r.limpieza || 0,
    'Comisión %': r.comisionPct || 0,
    'Código': r.codigo || '',
    'Estado': r.estado || '',
  }))

  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reservas')

  // Auto-width columns
  const colWidths = [
    { wch: 20 }, { wch: 22 }, { wch: 12 }, { wch: 12 },
    { wch: 8 }, { wch: 6 }, { wch: 12 }, { wch: 10 },
    { wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 12 },
  ]
  worksheet['!cols'] = colWidths

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

  const now = new Date()
  const monthIdx = month ? parseInt(month) : now.getMonth()
  const yearNum = year ? parseInt(year) : now.getFullYear()
  const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  const fileName = apartamento
    ? `Reservas_${apartamento.replace(/\s+/g, '_')}_${MONTH_NAMES[monthIdx]}_${yearNum}.xlsx`
    : `Reservas_${MONTH_NAMES[monthIdx]}_${yearNum}.xlsx`

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  })
}
