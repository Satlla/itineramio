import { NextRequest, NextResponse } from 'next/server'
import { processScheduledEmails } from '../../../../src/lib/email-sequences'

/**
 * Cron job para procesar y enviar emails programados
 * Se ejecuta cada 15 minutos en Vercel Cron
 */
export async function GET(req: NextRequest) {
  try {
    // Verificar autorización (Vercel Cron incluye header especial)
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      return NextResponse.json({ success: false, error: 'Server misconfigured' }, { status: 500 })
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Procesar emails programados
    const result = await processScheduledEmails(100) // Procesar hasta 100 emails por ejecución

    return NextResponse.json({
      ...result,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {

    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// También permitir POST para testing manual
export async function POST(req: NextRequest) {
  return GET(req)
}
